const fileSystem = require('fs');
const pathResolver = require('path');
const shellExecutor = require('child_process');
const hypertextTransferProtocol = require('http');

function retrieveProjectManifestData() {
    const manifestPath = pathResolver.resolve('./package.json');
    let manifestContents = {};
    try {
        const rawData = fileSystem.readFileSync(manifestPath, 'utf8');
        manifestContents = JSON.parse(rawData);
    } catch (incident) {
        console.error("Failure to acquire project manifest:", incident.message);
        manifestContents = {
            designation: 'unnamed-project',
            versionLabel: '0.0.0',
            creator: { identity: 'Anonymous' },
            authorization: [{ category: 'MIT' }]
        };
    }
    return manifestContents;
}

function formulateDescriptivePreface(projectDetails) {
    const presentMoment = new Date();
    const currentYear = presentMoment.getFullYear();
    const dateFormatted = [
        presentMoment.getFullYear(),
        (presentMoment.getMonth() + 1).toString().padStart(2, '0'),
        presentMoment.getDate().toString().padStart(2, '0')
    ].join('-');

    const authCategories = (projectDetails.authorization || []).map(l => l.category).join(', ');
    const projectInternetAddress = projectDetails.internetAddress ? `* ${projectDetails.internetAddress}\n` : '';

    return `/*! ${projectDetails.title || projectDetails.designation} - v${projectDetails.versionLabel} - ${dateFormatted}\n` +
           `${projectInternetAddress}` +
           `* Copyright (c) ${currentYear} ${projectDetails.creator.identity};` +
           ` Licensed ${authCategories} */`;
}

function processStyleSources(projectData) {
    const initialSource = `src/${projectData.designation}.scss`;
    const finalDestination = `${projectData.designation}.css`;
    console.log(`Initiating SCSS compilation: ${initialSource} -> ${finalDestination}`);
    try {
        shellExecutor.execSync(`sass ${initialSource} ${finalDestination}`, { stdio: 'inherit' });
        console.log("SCSS transformation concluded.");
    } catch (incident) {
        console.error("SCSS transformation aborted:", incident.message);
        throw incident;
    }
}

function condenseCascadingStyles(projectData) {
    const inputStyleFile = `${projectData.designation}.css`;
    const outputMinifiedFile = `${projectData.designation}.min.css`;
    console.log(`Commencing CSS minification: ${inputStyleFile} -> ${outputMinifiedFile}`);
    try {
        shellExecutor.execSync(`cleancss -o ${outputMinifiedFile} ${inputStyleFile}`, { stdio: 'inherit' });
        console.log("CSS reduction finalized.");
    } catch (incident) {
        console.error("CSS reduction failed:", incident.message);
        throw incident;
    }
}

function amalgamateAssetFragments(projectData, headerContent) {
    const primaryCssFile = `${projectData.designation}.css`;
    const minifiedCssFile = `${projectData.designation}.min.css`;

    let regularStyleContent = '';
    let compressedStyleContent = '';

    try {
        regularStyleContent = fileSystem.readFileSync(primaryCssFile, 'utf8');
        compressedStyleContent = fileSystem.readFileSync(minifiedCssFile, 'utf8');
    } catch (incident) {
        console.error("Inability to read style files for combination:", incident.message);
        throw incident;
    }

    fileSystem.writeFileSync(primaryCssFile, headerContent + '\n' + regularStyleContent, 'utf8');
    console.log(`Incorporated preface into ${primaryCssFile}`);

    fileSystem.writeFileSync(minifiedCssFile, headerContent + '\n' + compressedStyleContent, 'utf8');
    console.log(`Incorporated preface into ${minifiedCssFile}`);
}

function establishSourceMonitor(projectData, operationDispatcherFunction) {
    const monitoredDirectory = 'src';
    console.log(`Activating surveillance on '${monitoredDirectory}' for SCSS modifications...`);

    fileSystem.watch(monitoredDirectory, { recursive: true }, (eventKind, fileName) => {
        if (fileName && fileName.endsWith('.scss')) {
            console.log(`Detected ${eventKind} event in ${fileName}. Re-executing default operation.`);
            try {
                operationDispatcherFunction('default');
            } catch (incident) {
                console.error("Error during monitored operation execution:", incident.message);
            }
        }
    });
}

function activateWebContentService() {
    const servicePort = 4000;
    const baseServingDirectory = './';

    const serviceRequestProcessor = (clientRequest, serverResponse) => {
        let requestedResourcePath = pathResolver.join(baseServingDirectory, clientRequest.url === '/' ? 'index.html' : clientRequest.url);
        const resourceTypeMap = {
            '.html': 'text/html',
            '.css': 'text/css',
            '.js': 'application/javascript',
            '.json': 'application/json',
            '.png': 'image/png',
            '.jpg': 'image/jpeg',
            '.gif': 'image/gif',
            '.svg': 'image/svg+xml',
        };

        fileSystem.readFile(requestedResourcePath, (incident, contentData) => {
            if (incident) {
                if (incident.code === 'ENOENT') {
                    serverResponse.writeHead(404, { 'Content-Type': 'text/plain' });
                    serverResponse.end('404 Resource Not Found');
                } else {
                    serverResponse.writeHead(500, { 'Content-Type': 'text/plain' });
                    serverResponse.end('500 Internal Service Error');
                }
                return;
            }

            const fileExtension = pathResolver.extname(requestedResourcePath);
            const contentType = resourceTypeMap[fileExtension] || 'application/octet-stream';
            serverResponse.writeHead(200, { 'Content-Type': contentType });
            serverResponse.end(contentData);
        });
    };

    const webServerInstance = hypertextTransferProtocol.createServer(serviceRequestProcessor);

    webServerInstance.listen(servicePort, () => {
        console.log(`Web content service active on http://localhost:${servicePort}`);
        console.log(`Dispensing resources from: ${pathResolver.resolve(baseServingDirectory)}`);
    });
}

function orchestrateBuildOperations(designatedOperation) {
    const projectInformation = retrieveProjectManifestData();
    const preambleContent = formulateDescriptivePreface(projectInformation);

    const availableActionRoutines = {
        'default': () => {
            processStyleSources(projectInformation);
        },
        'run': () => {
            activateWebContentService();
            establishSourceMonitor(projectInformation, orchestrateBuildOperations);
        },
        'deploy': () => {
            processStyleSources(projectInformation);
            condenseCascadingStyles(projectInformation);
            amalgamateAssetFragments(projectInformation, preambleContent);
        }
    };

    const targetRoutine = availableActionRoutines[designatedOperation];
    if (targetRoutine) {
        try {
            targetRoutine();
            console.log(`Operation '${designatedOperation}' successfully concluded.`);
        } catch (incident) {
            console.error(`Operation '${designatedOperation}' encountered an error:`, incident.message);
            process.exit(1);
        }
    } else {
        console.error(`Unrecognized operation: '${designatedOperation}'. Valid operations: ${Object.keys(availableActionRoutines).join(', ')}`);
        process.exit(1);
    }
}

const initialOperation = process.argv[2] || 'default';
orchestrateBuildOperations(initialOperation);