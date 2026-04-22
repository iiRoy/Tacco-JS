const webEngine = require('http');
const secureWebEngine = require('https');
const resourceLocator = require('url');
const addressManipulator = require('path');
const processInitiator = require('child_process').spawn;
const objectStreamProcessor = require('json-line-protocol').JsonLineProtocol;
const configurationSettings = require('./config');
const storageManager = require('fs');

async function processIncomingRequest(clientRequest, serverResponse) {
    const requestUrlDetails = new resourceLocator.URL(clientRequest.url, `http://${clientRequest.headers.host}`);
    const clientAccessPath = requestUrlDetails.pathname;

    console.log("Received access request for: " + clientAccessPath);

    try {
        if (clientAccessPath === '/stream') {
            await initiateTwitterStream(clientRequest, serverResponse, configurationSettings);
        } else {
            await deliverLocalAsset(clientRequest, serverResponse, clientAccessPath);
        }
    } catch (operationIssue) {
        console.error("Server operation failure: ", operationIssue);
        if (!serverResponse.headersSent) {
            serverResponse.writeHead(500, { "Content-Type": "text/plain" });
            serverResponse.end("Internal Server Anomaly\n");
        }
    }
}

async function initiateTwitterStream(clientRequest, serverResponse, globalConfig) {
    serverResponse.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
    });

    const accountIdentity = globalConfig.twitter_username;
    const secretCredential = globalConfig.twitter_password;

    const base64Auth = Buffer.from(`${accountIdentity}:${secretCredential}`).toString('base64');

    const externalRequestOptions = {
        hostname: 'stream.twitter.com',
        port: 443,
        path: '/1/statuses/filter.json?locations=-180,-90,180,90',
        method: 'GET',
        headers: {
            'Authorization': `Basic ${base64Auth}`
        }
    };

    const twitterDataProcessor = new objectStreamProcessor();

    twitterDataProcessor.on('value', (parsedItem) => {
        serverResponse.write("event: twitter\n");
        serverResponse.write(`data: ${JSON.stringify(parsedItem)}\n\n`);
    });

    const externalStreamRequest = secureWebEngine.request(externalRequestOptions, (remoteResponse) => {
        remoteResponse.on('data', (dataFragment) => {
            twitterDataProcessor.feed(dataFragment);
        });

        remoteResponse.on('end', () => {
            console.log("Twitter stream concluded.");
            serverResponse.end();
        });
    });

    externalStreamRequest.on('error', (connectionFault) => {
        console.error("Twitter connection error: " + connectionFault.message);
        if (!serverResponse.headersSent) {
            serverResponse.writeHead(500, { "Content-Type": "text/plain" });
            serverResponse.end("Twitter stream unavailable.\n");
        } else {
            serverResponse.end();
        }
    });

    externalStreamRequest.end();
}

async function deliverLocalAsset(clientRequest, serverResponse, clientAccessPath) {
    let requestedAsset = clientAccessPath;
    if (requestedAsset === '/') {
        requestedAsset = '/index.html';
    }

    const currentProcessDirectory = process.cwd();
    const resolvedAssetPath = addressManipulator.resolve(currentProcessDirectory, requestedAsset.substring(1));

    const applicationRoot = addressManipulator.resolve(__dirname);
    if (!resolvedAssetPath.startsWith(applicationRoot)) {
        console.warn("Attempted access outside application root: " + resolvedAssetPath);
        serverResponse.writeHead(403, { "Content-Type": "text/plain" });
        serverResponse.end("403 Access Denied\n");
        return;
    }

    try {
        const assetStatistics = await storageManager.promises.stat(resolvedAssetPath);
        if (!assetStatistics.isFile()) {
            throw new Error("Not a file or directory access denied.");
        }

        serverResponse.writeHead(200, { 'Content-Type': determineMimeType(resolvedAssetPath) });
        const assetSourceStream = storageManager.createReadStream(resolvedAssetPath);

        assetSourceStream.pipe(serverResponse);

        assetSourceStream.on('error', (streamFailure) => {
            console.error("File stream error: ", streamFailure);
            if (!serverResponse.headersSent) {
                serverResponse.writeHead(500, { "Content-Type": "text/plain" });
                serverResponse.end("File reading error.\n");
            } else {
                serverResponse.end();
            }
        });

    } catch (pathCheckIssue) {
        if (pathCheckIssue.code === 'ENOENT') {
            serverResponse.writeHead(404, { "Content-Type": "text/plain" });
            serverResponse.end("404 Asset Not Found\n");
        } else {
            console.error("Error serving asset: ", pathCheckIssue);
            serverResponse.writeHead(500, { "Content-Type": "text/plain" });
            serverResponse.end("Server asset delivery issue.\n");
        }
    }
}

function determineMimeType(filePath) {
    const fileExtension = addressManipulator.extname(filePath).toLowerCase();
    const mimeTypes = {
        '.html': 'text/html',
        '.css': 'text/css',
        '.js': 'application/javascript',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.gif': 'image/gif',
        '.svg': 'image/svg+xml',
        '.txt': 'text/plain',
        '.ico': 'image/x-icon'
    };
    return mimeTypes[fileExtension] || 'application/octet-stream';
}

webEngine.createServer(processIncomingRequest).listen(configurationSettings.port, configurationSettings.address, () => {
    console.log(`System operational at http://${configurationSettings.address}:${configurationSettings.port}/`);
});