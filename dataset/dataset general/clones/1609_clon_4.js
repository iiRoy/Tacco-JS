const fileSystem = require('fs');
const pathResolver = require('path');
const versioningTool = require('semver');
const fileWatcher = require('chokidar');
const webBundler = require('browserify');
const webServer = require('http');
const browserOpener = require('opn');

const projectAutomationEngine = (() => {
    const outputLog = {
        inform: (...args) => console.log('[AUTOMATION INFO]', ...args),
        caution: (...args) => console.warn('[AUTOMATION CAUTION]', ...args),
        fault: (...args) => console.error('[AUTOMATION FAULT]', ...args)
    };

    const reviseProjectManifests = (revisionType) => {
        const configurationFiles = [
            pathResolver.join(__dirname, 'bower.json'),
            pathResolver.join(__dirname, 'package.json')
        ];

        configurationFiles.forEach(fileLocation => {
            if (fileSystem.existsSync(fileLocation)) {
                try {
                    const documentContent = fileSystem.readFileSync(fileLocation, 'utf8');
                    const configData = JSON.parse(documentContent);
                    const updatedVersion = versioningTool.inc(configData.version, revisionType);
                    if (updatedVersion) {
                        configData.version = updatedVersion;
                        fileSystem.writeFileSync(fileLocation, JSON.stringify(configData, null, 2));
                        outputLog.inform(`Revised ${pathResolver.basename(fileLocation)} to v${updatedVersion}`);
                    } else {
                        outputLog.caution(`Could not revise version for ${pathResolver.basename(fileLocation)} with type ${revisionType}`);
                    }
                } catch (e) {
                    outputLog.fault(`Problem processing ${fileLocation}:`, e.message);
                }
            } else {
                outputLog.caution(`Configuration file not found: ${fileLocation}`);
            }
        });
    };

    const createWebCompilation = () => {
        return new Promise((completionCallback, errorCallback) => {
            const inputSource = pathResolver.join(__dirname, 'lib', 'index.js');
            const finalDestination = pathResolver.join(__dirname, 'standalone', 'react-frozenhead.js');
            const destinationDirectory = pathResolver.dirname(finalDestination);

            if (!fileSystem.existsSync(destinationDirectory)) {
                fileSystem.mkdirSync(destinationDirectory, { recursive: true });
            }

            const compilationProcess = webBundler(inputSource, {
                standalone: 'ReactFrozenHead'
            });
            compilationProcess.transform('browserify-shim');

            compilationProcess.bundle((compilationError, outputBuffer) => {
                if (compilationError) {
                    outputLog.fault('Web compilation failed:', compilationError);
                    return errorCallback(compilationError);
                }
                fileSystem.writeFileSync(finalDestination, outputBuffer.toString());
                outputLog.inform('Web compilation completed successfully.');
                completionCallback();
            });
        });
    };

    const activateVerificationHost = () => {
        const servingRoot = __dirname;
        const listenPort = 1337;
        const defaultPage = 'test/index.html';
        const targetBrowser = 'Google Chrome';

        const verificationServerInstance = webServer.createServer((requestHandler, responseHandler) => {
            const requestedResource = pathResolver.join(servingRoot, requestHandler.url);

            fileSystem.readFile(requestedResource, (readError, resourceContent) => {
                if (readError) {
                    if (readError.code === 'ENOENT') {
                        responseHandler.writeHead(404);
                        responseHandler.end('404 Resource Not Found');
                    } else {
                        responseHandler.writeHead(500);
                        responseHandler.end('500 Internal Server Error');
                    }
                } else {
                    const mimeTypeMap = {
                        '.html': 'text/html',
                        '.js': 'application/javascript',
                        '.css': 'text/css'
                    };
                    const resourceMimeType = mimeTypeMap[pathResolver.extname(requestedResource)] || 'application/octet-stream';

                    responseHandler.writeHead(200, { 'Content-Type': resourceMimeType });
                    responseHandler.end(resourceContent, 'utf-8');
                }
            });
        });

        verificationServerInstance.listen(listenPort, () => {
            outputLog.inform(`Verification host active at http://localhost:${listenPort}`);
            browserOpener(`http://localhost:${listenPort}/${defaultPage}`, { app: targetBrowser }).catch(err => {
                outputLog.fault('Failed to launch browser for verification:', err);
            });
        });
    };

    const taskMap = {
        'observeSources': () => {
            outputLog.inform('Initiating source observation for changes...');
            fileWatcher.watch(pathResolver.join(__dirname, 'lib', '**', '*'))
                .on('change', (itemPath) => {
                    outputLog.inform(`Detected modification in ${itemPath}. Re-compiling web bundle.`);
                    createWebCompilation().catch(err => outputLog.fault('Observation build failed:', err));
                })
                .on('add', (itemPath) => {
                    outputLog.inform(`Detected new item ${itemPath}. Re-compiling web bundle.`);
                    createWebCompilation().catch(err => outputLog.fault('Observation build failed:', err));
                });
        },
        'incrementMajorVersion': () => reviseProjectManifests('major'),
        'incrementMinorVersion': () => reviseProjectManifests('minor'),
        'incrementPatchVersion': () => reviseProjectManifests('patch'),
        'performWebCompilation': () => createWebCompilation().catch(err => outputLog.fault('Compilation task failed:', err)),
        'startVerificationServer': () => activateVerificationHost(),
        'runVerificationProcess': async () => {
            outputLog.inform('Commencing verification process...');
            try {
                await createWebCompilation();
                activateVerificationHost();
            } catch (e) {
                outputLog.fault('Verification process aborted due to compilation error:', e);
            }
        },
        'generateReleaseArtifacts': () => taskMap.performWebCompilation()
    };

    return {
        dispatch: (operationName) => {
            if (taskMap[operationName]) {
                taskMap[operationName]();
            } else if (operationName) {
                outputLog.fault(`Unknown operation: ${operationName}`);
                outputLog.inform('Available operations:', Object.keys(taskMap).join(', '));
            } else {
                outputLog.inform('No operation specified. Available operations:', Object.keys(taskMap).join(', '));
            }
        }
    };
})();

const requestedOperation = process.argv[2];
projectAutomationEngine.dispatch(requestedOperation);