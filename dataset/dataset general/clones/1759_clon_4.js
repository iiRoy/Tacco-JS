const fileSystem = require('fs').promises;
const pathNavigator = require('path');
const globMatcher = require('glob');
const deletionUtility = require('del');
const markupProcessor = require('marked');
const codeMinifier = require('terser');
const htmlMinifier = require('html-minifier-terser');
const fileWatcher = require('chokidar');
const WebSocketServer = require('ws').Server;
const cryptoHasher = require('crypto');
const { transformAsync } = require('@babel/core');

const colorizer = {
    red: (text) => `\x1b[31m${text}\x1b[0m`,
    green: (text) => `\x1b[32m${text}\x1b[0m`,
    magenta: (text) => `\x1b[35m${text}\x1b[0m`,
    white: (text) => `\x1b[37m${text}\x1b[0m`,
    yellow: (text) => `\x1b[33m${text}\x1b[0m`,
};
const outputLogger = (message, ...args) => {
    console.log(message, ...args);
};

const systemSettings = {
    destinationPaths: {
        assetOutput: 'dist/public/resources/',
        vendorAssetOutput: 'dist/public/resources/vendor/',
        markupOutput: 'dist/public/',
        publicRoot: 'dist/public/',
        sourceOutput: 'dist/public/source/',
        sourceDemoOutput: 'dist/public/source/sample/',
        temporarySource: 'dist/sample/',
        vendorOutput: 'dist/public/vendor/',
    },
    buildArtifacts: {
        mainScriptBundle: 'main.bundle.js',
    },
    finalCompilationPaths: {
        assets: 'bin/public/resources/',
        vendorAssets: 'bin/public/resources/vendor/',
        html: 'bin/public/',
        public: 'bin/public/',
        source: 'bin/public/source/',
    },
    temporaryBuildPath: 'dist/library/',
    topLevelFiles: ['public/**/*.*'],
};

const applicationContent = {
    resources: ['sample/resources/**/*.*'],
    webpages: ['sample/index.html'],
    scriptFiles: ['sample/source/**/*.jsm'],
};

const libraryContent = {
    scriptFiles: ['source/*.jsm', 'source/*/*.jsm'],
};

const documentationContent = {
    textFiles: ['source/*/docs/*.md'],
    scriptComponents: ['source/*/docs/*.jsm'],
};

const thirdPartyContent = {
    resources: [
        'vendor/bootstrap/fonts/*.*',
    ],
    scripts: [
        'vendor/mithril/mithril.js',
        'vendor/min-require/min-require.js'
    ],
};

const networkParameters = {
    liveReloadPort: 35729,
};

async function purgePath(targetPaths, completionCallback = () => {}) {
    outputLogger('Wiping clean', colorizer.magenta(targetPaths.join(', ')));
    try {
        await deletionUtility(targetPaths);
        completionCallback();
    } catch (err) {
        outputLogger(colorizer.red('Deletion Error:'), err);
        completionCallback(err);
    }
}

function fingerprintFileName(originalName) {
    const lastDotIndex = originalName.lastIndexOf('.');
    if (lastDotIndex === -1) {
        return originalName + '-*';
    }
    const base = originalName.substring(0, lastDotIndex);
    const ext = originalName.substring(lastDotIndex);
    return `${base}-*${ext}`;
}

async function readAndTransformFiles(globPattern, baseDir, transformer) {
    const filePaths = await globMatcher(globPattern);
    const results = [];
    for (const filePath of filePaths) {
        const content = await fileSystem.readFile(filePath, 'utf8');
        const transformed = await transformer(content, filePath, baseDir);
        results.push({
            originalPath: filePath,
            relativePath: pathNavigator.relative(baseDir, filePath),
            content: transformed.content,
            newExtension: transformed.newExtension || pathNavigator.extname(filePath),
        });
    }
    return results;
}

async function writeTransformedFiles(transformedFiles, outputDir) {
    await fileSystem.mkdir(outputDir, { recursive: true });
    for (const file of transformedFiles) {
        const newFileName = file.newExtension ? file.relativePath.replace(pathNavigator.extname(file.relativePath), file.newExtension) : file.relativePath;
        const outputPath = pathNavigator.join(outputDir, newFileName);
        await fileSystem.mkdir(pathNavigator.dirname(outputPath), { recursive: true });
        await fileSystem.writeFile(outputPath, file.content);
    }
}

async function copyFiles(sourceGlob, destinationDir, baseDir = '.') {
    const files = await globMatcher(sourceGlob);
    await fileSystem.mkdir(destinationDir, { recursive: true });
    await Promise.all(files.map(async (srcPath) => {
        const relativePath = pathNavigator.relative(baseDir, srcPath);
        const destPath = pathNavigator.join(destinationDir, relativePath);
        await fileSystem.mkdir(pathNavigator.dirname(destPath), { recursive: true });
        await fileSystem.copyFile(srcPath, destPath);
    }));
}

async function hasFileChanged(sourcePath, destPath) {
    try {
        const sourceStat = await fileSystem.stat(sourcePath);
        const destStat = await fileSystem.stat(destPath);
        return sourceStat.mtimeMs > destStat.mtimeMs;
    } catch (e) {
        if (e.code === 'ENOENT') {
            return true;
        }
        throw e;
    }
}

async function transformJsxToJs(code, filePath, baseDir) {
    const result = await transformAsync(code, {
        filename: filePath,
        presets: [
            ['@babel/preset-react', {
                pragma: 'm',
                pragmaFrag: 'm.Fragment',
            }],
        ],
    });
    return { content: result.code, newExtension: '.js' };
}

async function processModuleInclusions(fileContents, filePath, baseDir, options = {}) {
    let modifiedContent = fileContents;

    if (options.keyword === 'CONTENT') {
        const contentKeywordRegex = /CONTENT\(['"]([^'"]+)['"]\)/g;
        let match;
        while ((match = contentKeywordRegex.exec(modifiedContent)) !== null) {
            const includePath = pathNavigator.resolve(pathNavigator.dirname(filePath), match[1]);
            try {
                const includedFileContent = await fileSystem.readFile(includePath, 'utf8');
                const transformedIncludedContent = options.transform ? options.transform(includedFileContent) : includedFileContent;
                modifiedContent = modifiedContent.replace(match[0], transformedIncludedContent);
            } catch (err) {
                outputLogger(colorizer.yellow(`Warning: Could not include content from ${includePath}: ${err.message}`));
            }
        }
    }
    return { content: modifiedContent };
}

async function replicateDocumentationSources(completionCallback = () => {}) {
    outputLogger('Replicating documentation sources...');
    try {
        const sourceFiles = await globMatcher(documentationContent.scriptComponents, { base: 'source' });
        for (const srcPath of sourceFiles) {
            const relativePath = pathNavigator.relative('source', srcPath);
            const destPath = pathNavigator.join(systemSettings.destinationPaths.temporarySource, relativePath);
            if (await hasFileChanged(srcPath, destPath)) {
                await fileSystem.mkdir(pathNavigator.dirname(destPath), { recursive: true });
                await fileSystem.copyFile(srcPath, destPath);
            }
        }
        completionCallback();
    } catch (err) {
        outputLogger(colorizer.red('Error replicating docs:'), err);
        completionCallback(err);
    }
}

async function processDocumentationMarkdown(completionCallback = () => {}) {
    outputLogger('Processing documentation markdown...');
    try {
        const files = await readAndTransformFiles(documentationContent.textFiles, 'source', async (content) => {
            let htmlContent = markupProcessor.parse(content);
            htmlContent = `<div>\n${htmlContent}\n</div>`;
            return { content: htmlContent, newExtension: '.jsm' };
        });

        const renamedFiles = files.map(file => ({
            ...file,
            relativePath: `_${file.relativePath.replace(pathNavigator.extname(file.relativePath), '.jsm')}`
        }));
        await writeTransformedFiles(renamedFiles, systemSettings.destinationPaths.temporarySource);
        completionCallback();
    } catch (err) {
        outputLogger(colorizer.red('Error processing docs MD:'), err);
        completionCallback(err);
    }
}

async function transformDocumentationMsx(completionCallback = () => {}) {
    outputLogger('Transforming documentation MSX...');
    try {
        const files = await readAndTransformFiles(
            pathNavigator.join(systemSettings.destinationPaths.temporarySource, '**/docs/*.jsm'),
            systemSettings.destinationPaths.temporarySource,
            transformJsxToJs
        );
        await writeTransformedFiles(files, systemSettings.destinationPaths.temporarySource);
        completionCallback();
    } catch (err) {
        outputLogger(colorizer.red('Error transforming docs MSX:'), err);
        completionCallback(err);
    }
}

async function convertDemoMsx(completionCallback = () => {}) {
    outputLogger('Converting demo MSX...');
    try {
        const files = await readAndTransformFiles(documentationContent.scriptComponents, 'source', transformJsxToJs);
        await writeTransformedFiles(files, systemSettings.destinationPaths.temporarySource);
        completionCallback();
    } catch (err) {
        outputLogger(colorizer.red('Error converting demo MSX:'), err);
        completionCallback(err);
    }
}

async function assembleApplicationScripts(completionCallback = () => {}) {
    outputLogger('Assembling application scripts...');
    try {
        const globPattern = pathNavigator.join(systemSettings.destinationPaths.temporarySource, '**/*.js');
        const filePaths = await globMatcher(globPattern);
        const processedFiles = [];

        for (const filePath of filePaths) {
            let content = await fileSystem.readFile(filePath, 'utf8');
            content = (await processModuleInclusions(content, filePath, systemSettings.destinationPaths.temporarySource, {
                keyword: 'CONTENT',
                transform: JSON.stringify
            })).content;

            const moduleName = pathNavigator.basename(filePath, '.js');
            content = `module.exports = (function() {\n${content}\n})();`;
            processedFiles.push({
                originalPath: filePath,
                relativePath: pathNavigator.relative(systemSettings.destinationPaths.temporarySource, filePath),
                content: content,
                newExtension: '.js'
            });
        }
        await writeTransformedFiles(processedFiles, systemSettings.destinationPaths.sourceDemoOutput);
        completionCallback();
    } catch (err) {
        outputLogger(colorizer.red('Error assembling app scripts:'), err);
        completionCallback(err);
    }
}

async function convertApplicationJsx(completionCallback = () => {}) {
    outputLogger('Converting application JSX...');
    try {
        const files = await readAndTransformFiles(applicationContent.scriptFiles, 'sample/source', transformJsxToJs);
        await writeTransformedFiles(files, systemSettings.destinationPaths.temporarySource);
        completionCallback();
    } catch (err) {
        outputLogger(colorizer.red('Error converting app JSX:'), err);
        completionCallback(err);
    }
}

async function constructApplicationCode(completionCallback = () => {}) {
    outputLogger('Constructing application code...');
    await Promise.allSettled([
        new Promise(processDocumentationMarkdown),
        new Promise(transformDocumentationMsx),
        new Promise(convertDemoMsx),
        new Promise(convertApplicationJsx),
    ]);
    await new Promise(assembleApplicationScripts);
    completionCallback();
}

async function collectThirdPartyScripts(completionCallback = () => {}) {
    outputLogger('Collecting third-party scripts...');
    try {
        await copyFiles(thirdPartyContent.scripts, systemSettings.destinationPaths.vendorOutput, 'vendor');
        completionCallback();
    } catch (err) {
        outputLogger(colorizer.red('Error collecting vendor scripts:'), err);
        completionCallback(err);
    }
}

async function packageCombinedScripts(completionCallback = () => {}) {
    outputLogger('Packaging combined scripts...');
    const outputFilename = fingerprintFileName(systemSettings.buildArtifacts.mainScriptBundle);
    const destPath = pathNavigator.join(systemSettings.finalCompilationPaths.assets, outputFilename);
    await purgePath([destPath]);

    try {
        const scriptGlobs = [
            pathNavigator.join(systemSettings.destinationPaths.publicRoot, 'vendor/min-require/min-require.js'),
            pathNavigator.join(systemSettings.destinationPaths.sourceDemoOutput, '**/*.js'),
            '!' + pathNavigator.join(systemSettings.destinationPaths.sourceDemoOutput, '**/_*.js')
        ];
        const scriptPaths = await globMatcher(scriptGlobs[0]);
        const appScriptPaths = await globMatcher(scriptGlobs[1]);
        const excludeAppScriptPaths = await globMatcher(scriptGlobs[2].substring(1));

        const filteredAppScriptPaths = appScriptPaths.filter(p => !excludeAppScriptPaths.includes(p));

        const allScripts = [...scriptPaths, ...filteredAppScriptPaths];

        let combinedCode = '';
        for (const scriptPath of allScripts) {
            combinedCode += await fileSystem.readFile(scriptPath, 'utf8') + '\n';
        }

        combinedCode += '\n\nrequire(\'main\');\n';

        const minifiedResult = await codeMinifier.minify(combinedCode, {
            mangle: true,
        });
        if (minifiedResult.error) throw minifiedResult.error;

        const hash = cryptoHasher.createHash('md5').update(minifiedResult.code).digest('hex');
        const finalFilename = systemSettings.buildArtifacts.mainScriptBundle.replace(/(\.js)$/, `-${hash}$1`);
        const finalDestPath = pathNavigator.join(systemSettings.finalCompilationPaths.assets, finalFilename);

        await fileSystem.mkdir(systemSettings.finalCompilationPaths.assets, { recursive: true });
        await fileSystem.writeFile(finalDestPath, minifiedResult.code);

        outputLogger(`Bundled script size: ${colorizer.green((minifiedResult.code.length / 1024).toFixed(2))} KB`);
        completionCallback();
    } catch (err) {
        outputLogger(colorizer.red('Error packaging scripts:'), err);
        completionCallback(err);
    }
}

async function gatherApplicationAssets(completionCallback = () => {}) {
    outputLogger('Gathering application assets...');
    try {
        const sourceFiles = await globMatcher(applicationContent.resources, { base: 'sample/resources' });
        for (const srcPath of sourceFiles) {
            const relativePath = pathNavigator.relative('sample/resources', srcPath);
            const destPath = pathNavigator.join(systemSettings.destinationPaths.assetOutput, relativePath);
            if (await hasFileChanged(srcPath, destPath)) {
                await fileSystem.mkdir(pathNavigator.dirname(destPath), { recursive: true });
                await fileSystem.copyFile(srcPath, destPath);
            }
        }
        completionCallback();
    } catch (err) {
        outputLogger(colorizer.red('Error gathering app assets:'), err);
        completionCallback(err);
    }
}

async function gatherThirdPartyAssets(completionCallback = () => {}) {
    outputLogger('Gathering third-party assets...');
    try {
        await copyFiles(thirdPartyContent.resources, systemSettings.destinationPaths.vendorAssetOutput);
        completionCallback();
    } catch (err) {
        outputLogger(colorizer.red('Error gathering vendor assets:'), err);
        completionCallback(err);
    }
}

async function packageCombinedAssets(completionCallback = () => {}) {
    outputLogger('Packaging combined assets...');
    try {
        await copyFiles(pathNavigator.join(systemSettings.destinationPaths.assetOutput, '**/*.*'), systemSettings.finalCompilationPaths.assets, systemSettings.destinationPaths.assetOutput);
        completionCallback();
    } catch (err) {
        outputLogger(colorizer.red('Error packaging assets:'), err);
        completionCallback(err);
    }
}

async function embedContentInMarkup(tag, rootPath, globPatterns) {
    const files = await Promise.all(globPatterns.map(pattern => globMatcher(pattern))).then(arr => arr.flat());
    const sortedFiles = files.sort((a, b) => a.localeCompare(b));

    return function(htmlContent) {
        let injections = '';
        for (const filePath of sortedFiles) {
            const relativeToRoot = pathNavigator.relative(rootPath, filePath).replace(/\\/g, '/');
            const ext = pathNavigator.extname(filePath).toLowerCase();
            if (ext === '.css') {
                injections += `<link rel="stylesheet" href="${relativeToRoot}">\n`;
            } else if (ext === '.js') {
                injections += `<script src="${relativeToRoot}"></script>\n`;
            }
        }
        const startTag = `<!-- ${tag}.{{ext}} -->`;
        const endTag = `<!-- end -->`;
        const placeholder = `${startTag}\n${endTag}`;

        if (!htmlContent.includes(placeholder)) {
             const startIdx = htmlContent.indexOf(startTag);
             const endIdx = htmlContent.indexOf(endTag, startIdx + startTag.length);
             if (startIdx !== -1 && endIdx !== -1) {
                 return htmlContent.substring(0, startIdx + startTag.length) + '\n' + injections + htmlContent.substring(endIdx);
             }
        }
        return htmlContent.replace(placeholder, `${startTag}\n${injections}${endTag}`);
    };
}

async function composeMainHtml(completionCallback = () => {}) {
    outputLogger('Composing main HTML...');
    try {
        const htmlFiles = await globMatcher(applicationContent.webpages);
        if (htmlFiles.length === 0) {
            throw new Error('No HTML files found for index composition.');
        }
        let htmlContent = await fileSystem.readFile(htmlFiles[0], 'utf8');

        const injectVendor = await embedContentInMarkup('vendor', systemSettings.destinationPaths.publicRoot, [
            pathNavigator.join(systemSettings.destinationPaths.vendorAssetOutput, '**/*.css'),
            pathNavigator.join(systemSettings.destinationPaths.vendorOutput, '**/*.js'),
            pathNavigator.join(systemSettings.destinationPaths.publicRoot, 'resources/mithril-bootstrap.js')
        ]);
        htmlContent = injectVendor(htmlContent);

        const injectDemo = await embedContentInMarkup('demo', systemSettings.destinationPaths.publicRoot, [
            pathNavigator.join(systemSettings.destinationPaths.publicRoot, 'resources/demo.css'),
            pathNavigator.join(systemSettings.destinationPaths.sourceDemoOutput, '**/*.js'),
            '!' + pathNavigator.join(systemSettings.destinationPaths.sourceDemoOutput, '**/_*.js')
        ]);
        htmlContent = injectDemo(htmlContent);

        htmlContent += `<script>require('main');</script>\n`;
        htmlContent += `<script src="//localhost:${networkParameters.liveReloadPort}/livereload.js"></script>\n`;

        await fileSystem.mkdir(systemSettings.destinationPaths.markupOutput, { recursive: true });
        await fileSystem.writeFile(pathNavigator.join(systemSettings.destinationPaths.markupOutput, pathNavigator.basename(htmlFiles[0])), htmlContent);
        completionCallback();
    } catch (err) {
        outputLogger(colorizer.red('Error composing main HTML:'), err);
        completionCallback(err);
    }
}

async function finalizeMainHtml(completionCallback = () => {}) {
    outputLogger('Finalizing main HTML...');
    try {
        const htmlFiles = await globMatcher(applicationContent.webpages);
        if (htmlFiles.length === 0) {
            throw new Error('No HTML files found for final HTML compilation.');
        }
        let htmlContent = await fileSystem.readFile(htmlFiles[0], 'utf8');

        const mainScriptRev = (await globMatcher(pathNavigator.join(systemSettings.finalCompilationPaths.assets, fingerprintFileName(systemSettings.buildArtifacts.mainScriptBundle))))[0];
        const mainScriptFileName = mainScriptRev ? pathNavigator.basename(mainScriptRev) : '';

        const injectFinal = await embedContentInMarkup('demo', systemSettings.finalCompilationPaths.public, [
            pathNavigator.join(systemSettings.finalCompilationPaths.assets, 'vendor/bootstrap.css'),
            pathNavigator.join(systemSettings.finalCompilationPaths.assets, 'demo.css'),
            pathNavigator.join(systemSettings.finalCompilationPaths.assets, 'vendor/mithril.js'),
            pathNavigator.join(systemSettings.finalCompilationPaths.assets, 'mithril-bootstrap.js'),
            pathNavigator.join(systemSettings.finalCompilationPaths.assets, mainScriptFileName)
        ]);
        htmlContent = injectFinal(htmlContent);

        const minifiedHtml = await htmlMinifier.minify(htmlContent, {
            collapseWhitespace: true,
            removeComments: true,
            minifyCSS: true,
            minifyJS: true,
        });

        await fileSystem.mkdir(systemSettings.finalCompilationPaths.html, { recursive: true });
        await fileSystem.writeFile(pathNavigator.join(systemSettings.finalCompilationPaths.html, pathNavigator.basename(htmlFiles[0])), minifiedHtml);
        completionCallback();
    } catch (err) {
        outputLogger(colorizer.red('Error finalizing main HTML:'), err);
        completionCallback(err);
    }
}

async function copyTopLevelFiles(completionCallback = () => {}) {
    outputLogger('Copying top-level files...');
    try {
        const sourceFiles = await globMatcher(systemSettings.topLevelFiles, { base: '.' });
        for (const srcPath of sourceFiles) {
            const relativePath = pathNavigator.relative('.', srcPath);
            const destPath = pathNavigator.join('dist', relativePath);
            if (await hasFileChanged(srcPath, destPath)) {
                await fileSystem.mkdir(pathNavigator.dirname(destPath), { recursive: true });
                await fileSystem.copyFile(srcPath, destPath);
            }
        }
        completionCallback();
    } catch (err) {
        outputLogger(colorizer.red('Error copying top-level files:'), err);
        completionCallback(err);
    }
}

async function distributeTopLevelFiles(completionCallback = () => {}) {
    outputLogger('Distributing top-level files...');
    try {
        await copyFiles(systemSettings.topLevelFiles, 'bin', '.');
        completionCallback();
    } catch (err) {
        outputLogger(colorizer.red('Error distributing top-level files:'), err);
        completionCallback(err);
    }
}

async function processLibraryMsx(completionCallback = () => {}) {
    outputLogger('Processing library MSX...');
    try {
        const files = await readAndTransformFiles(libraryContent.scriptFiles, 'source', transformJsxToJs);
        await writeTransformedFiles(files, systemSettings.temporaryBuildPath);
        completionCallback();
    } catch (err) {
        outputLogger(colorizer.red('Error processing library MSX:'), err);
        completionCallback(err);
    }
}

async function assembleLibraryCode(completionCallback = () => {}) {
    outputLogger('Assembling library code...');
    try {
        const globPattern = pathNavigator.join(systemSettings.temporaryBuildPath, '**/*.js');
        const filePaths = await globMatcher(globPattern, { base: systemSettings.temporaryBuildPath });
        const processedFiles = [];

        for (const filePath of filePaths) {
            let content = await fileSystem.readFile(filePath, 'utf8');
            processedFiles.push({
                originalPath: filePath,
                relativePath: pathNavigator.relative(systemSettings.temporaryBuildPath, filePath),
                content: content,
                newExtension: '.js'
            });
        }

        await writeTransformedFiles(processedFiles, 'package');
        await writeTransformedFiles(processedFiles, systemSettings.destinationPaths.assetOutput);
        completionCallback();
    } catch (err) {
        outputLogger(colorizer.red('Error assembling library code:'), err);
        completionCallback(err);
    }
}

async function constructLibraryOutput(completionCallback = () => {}) {
    outputLogger('Constructing library output...');
    await new Promise(processLibraryMsx);
    await new Promise(assembleLibraryCode);
    await copyFiles('package/*.js', systemSettings.destinationPaths.assetOutput);
    completionCallback();
}

async function runTasksInSequence(tasks) {
    for (const task of tasks) {
        await new Promise((resolve, reject) => task(err => err ? reject(err) : resolve()));
    }
}

async function runTasksInParallel(tasks) {
    await Promise.all(tasks.map(task => new Promise((resolve, reject) => task(err => err ? reject(err) : resolve()))));
}

async function resetBuildEnvironment(completionCallback = () => {}) {
    outputLogger('Resetting build environment...');
    await purgePath(['dist', 'bin', 'package']);
    completionCallback();
}

async function executeDevelopmentBuild(completionCallback = () => {}) {
    outputLogger('Executing development build...');
    await runTasksInSequence([
        resetBuildEnvironment,
        () => runTasksInParallel([
            replicateDocumentationSources,
            constructApplicationCode,
            collectThirdPartyScripts,
            gatherApplicationAssets,
            gatherThirdPartyAssets,
            copyTopLevelFiles,
            constructLibraryOutput,
        ]),
        composeMainHtml,
    ]);
    completionCallback();
}

async function executeProductionBuild(completionCallback = () => {}) {
    outputLogger('Executing production build...');
    await runTasksInSequence([
        executeDevelopmentBuild,
        () => runTasksInParallel([
            packageCombinedScripts,
            packageCombinedAssets,
            distributeTopLevelFiles,
        ]),
        finalizeMainHtml,
    ]);
    completionCallback();
}

async function defaultOperation() {
    outputLogger('Running default operation (production build)...');
    await new Promise(executeProductionBuild);
}

async function monitorFileChanges() {
    outputLogger('Monitoring file changes...');

    const eventOutputColors = {
        add: colorizer.green,
        change: colorizer.magenta,
        unlink: colorizer.red,
        addDir: colorizer.green,
        unlinkDir: colorizer.red
    };

    function logFileEvent(eventType, filePath) {
        const c = eventOutputColors[eventType] || colorizer.white;
        outputLogger(`[${c(eventType)}]`, colorizer.magenta(pathNavigator.relative(process.cwd(), filePath)));
    }

    const liveReloader = new WebSocketServer({ port: networkParameters.liveReloadPort });
    liveReloader.on('connection', ws => {
        outputLogger(colorizer.green('LiveReload client connected.'));
        ws.on('close', () => outputLogger(colorizer.yellow('LiveReload client disconnected.')));
    });

    function triggerLiveReload(filePath) {
        liveReloader.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({
                    command: 'reload',
                    path: filePath,
                    liveCss: true
                }));
            }
        });
    }

    const indexMarkupPath = 'index.html';

    fileWatcher.watch(applicationContent.resources)
        .on('all', async (event, path) => {
            logFileEvent(event, path);
            await new Promise(gatherApplicationAssets);
            triggerLiveReload('resources/sample.css');
        });

    fileWatcher.watch(applicationContent.webpages)
        .on('all', async (event, path) => {
            logFileEvent(event, path);
            await new Promise(composeMainHtml);
            triggerLiveReload(indexMarkupPath);
        });

    fileWatcher.watch(systemSettings.topLevelFiles)
        .on('all', async (event, path) => {
            logFileEvent(event, path);
            await new Promise(copyTopLevelFiles);
        });

    fileWatcher.watch([...applicationContent.scriptFiles, ...documentationContent.scriptComponents, ...documentationContent.textFiles])
        .on('all', async (event, path) => {
            logFileEvent(event, path);
            await runTasksInSequence([
                replicateDocumentationSources,
                constructApplicationCode,
                composeMainHtml,
            ]);
            triggerLiveReload(indexMarkupPath);
        });

    fileWatcher.watch(libraryContent.scriptFiles)
        .on('all', async (event, path) => {
            logFileEvent(event, path);
            await new Promise(constructLibraryOutput);
            triggerLiveReload(indexMarkupPath);
        });
}

(async () => {
    const operation = process.argv[2] || 'defaultOperation';
    outputLogger(colorizer.yellow(`Executing operation: ${operation}`));
    try {
        switch (operation) {
            case 'resetBuildEnvironment':
                await new Promise(resetBuildEnvironment);
                break;
            case 'executeDevelopmentBuild':
                await new Promise(executeDevelopmentBuild);
                break;
            case 'executeProductionBuild':
                await new Promise(executeProductionBuild);
                break;
            case 'defaultOperation':
                await defaultOperation();
                break;
            case 'monitorFileChanges':
                await monitorFileChanges();
                break;
            default:
                outputLogger(colorizer.red(`Unknown operation: ${operation}`));
                process.exit(1);
        }
        outputLogger(colorizer.green('Operation completed successfully.'));
        if (operation !== 'monitorFileChanges') {
          process.exit(0);
        }
    } catch (err) {
        outputLogger(colorizer.red('An error occurred during operation:'), err);
        process.exit(1);
    }
})();