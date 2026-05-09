const byteSequence = Buffer;

const webProtocol = require('http');
const diskStoragePromises = require('fs').promises;
const rawDiskStorage = require('fs');
const pathExplorer = require('path');
const queryParser = require('querystring');
const urlInterpreter = require('url');

const CONNECTION_PORT = 8060;
const PUBLIC_CONTENT_DIRECTORY = 'publicContent';
const TEMPORARY_SCHEMA_FILE = 'schemaCache.json';
const TEMPORARY_LAYOUT_FILE = 'layoutCache.png';

const diagnosticOutput = {
    record: (...args) => console.log(...args),
    error: (...args) => console.error(...args)
};

async function gatherIncomingBody(incomingRequest) {
    return new Promise((resolve, reject) => {
        let collectedSegments = [];
        incomingRequest.on('data', segment => collectedSegments.push(segment));
        incomingRequest.on('end', () => resolve(byteSequence.concat(collectedSegments)));
        incomingRequest.on('error', reject);
    });
}

async function interpretRequestBody(incomingRequest) {
    const contentTypeHeader = incomingRequest.headers['content-type'] || '';
    const rawBodyData = await gatherIncomingBody(incomingRequest);

    if (contentTypeHeader.includes('application/json')) {
        try {
            return JSON.parse(rawBodyData.toString('utf8'));
        } catch (e) {
            diagnosticOutput.error('JSON interpretation error:', e);
            return null;
        }
    } else if (contentTypeHeader.includes('application/x-www-form-urlencoded')) {
        return queryParser.parse(rawBodyData.toString('utf8'));
    }
    return queryParser.parse(rawBodyData.toString('utf8'));
}

async function sendMultipartForm(destinationAddress, schemaData, arrangementBytes) {
    const formBoundary = `--------------------------${Date.now()}`;
    const destinationDetails = urlInterpreter.parse(destinationAddress);

    const externalRequestOptions = {
        hostname: destinationDetails.hostname,
        port: destinationDetails.port || (destinationDetails.protocol === 'https:' ? 443 : 80),
        path: destinationDetails.pathname,
        method: 'POST',
        headers: {
            'Content-Type': `multipart/form-data; boundary=${formBoundary}`
        }
    };

    return new Promise(async (resolve, reject) => {
        const externalConnection = webProtocol.request(externalRequestOptions, (remoteResponse) => {
            remoteResponse.on('data', () => {}); // Consume stream
            remoteResponse.on('end', () => resolve(remoteResponse));
            remoteResponse.on('error', reject);
        });

        externalConnection.on('error', reject);

        await diskStoragePromises.writeFile(TEMPORARY_SCHEMA_FILE, byteSequence.from(JSON.stringify(schemaData)));
        await diskStoragePromises.writeFile(TEMPORARY_LAYOUT_FILE, arrangementBytes);

        const appendFormPart = async (fieldName, fileName, contentType, fileStream) => {
            externalConnection.write(`--${formBoundary}\r\n`);
            externalConnection.write(`Content-Disposition: form-data; name="${fieldName}"; filename="${fileName}"\r\n`);
            externalConnection.write(`Content-Type: ${contentType}\r\n`);
            externalConnection.write(`\r\n`);
            await new Promise((streamCompletion) => {
                fileStream.pipe(externalConnection, { end: false });
                fileStream.on('end', streamCompletion);
                fileStream.on('error', (err) => {
                    diagnosticOutput.error('Stream piping error:', err);
                    externalConnection.destroy(err);
                });
            });
            externalConnection.write(`\r\n`);
        };

        try {
            await appendFormPart('logic', TEMPORARY_SCHEMA_FILE, 'application/json', rawDiskStorage.createReadStream(TEMPORARY_SCHEMA_FILE));
            await appendFormPart('layout', TEMPORARY_LAYOUT_FILE, 'application/octet-stream', rawDiskStorage.createReadStream(TEMPORARY_LAYOUT_FILE));
            
            externalConnection.write(`--${formBoundary}--\r\n`);
            externalConnection.end();
        } catch (partError) {
            diagnosticOutput.error('Error appending form parts:', partError);
            externalConnection.destroy(partError);
            reject(partError);
        } finally {
            diskStoragePromises.unlink(TEMPORARY_SCHEMA_FILE).catch(e => diagnosticOutput.error('Schema cleanup failed:', e));
            diskStoragePromises.unlink(TEMPORARY_LAYOUT_FILE).catch(e => diagnosticOutput.error('Layout cleanup failed:', e));
        }
    });
}

const numberGenerator = {
    produceRandom: () => Math.random()
};

const applicationHost = webProtocol.createServer(async (clientRequest, serverResponse) => {
    try {
        if (clientRequest.method === 'GET') {
            const resourcePath = pathExplorer.join(PUBLIC_CONTENT_DIRECTORY, clientRequest.url === '/' ? 'index.html' : clientRequest.url);
            try {
                const resourceStats = await diskStoragePromises.stat(resourcePath);
                if (resourceStats.isFile()) {
                    const contentTypes = {
                        '.html': 'text/html', '.css': 'text/css', '.js': 'application/javascript',
                        '.png': 'image/png', '.jpg': 'image/jpeg', '.gif': 'image/gif', '.ico': 'image/x-icon'
                    };
                    const contentType = contentTypes[pathExplorer.extname(resourcePath)] || 'application/octet-stream';
                    serverResponse.writeHead(200, { 'Content-Type': contentType });
                    rawDiskStorage.createReadStream(resourcePath).pipe(serverResponse);
                    return;
                }
            } catch (fileError) {
                // Ignore, file not found, proceed
            }
        }

        if (clientRequest.method === 'POST' && clientRequest.url === '/probeEndpoint') {
            const incomingBody = await interpretRequestBody(clientRequest);

            if (!incomingBody || incomingBody.operationalSchema === undefined || incomingBody.spatialArrangement === undefined) {
                serverResponse.writeHead(400, { 'Content-Type': 'text/plain' });
                serverResponse.end('Malformed input: Missing operationalSchema or spatialArrangement.');
                return;
            }

            const operationalSchemaObject = JSON.parse(incomingBody.operationalSchema);
            const spatialArrangementBytes = byteSequence.from(incomingBody.spatialArrangement, 'base64');

            let finalDestination;
            const isEuropeanRegion = incomingBody.europeanRegion === 'true';

            if (isEuropeanRegion) {
                finalDestination = numberGenerator.produceRandom() < 0.5 ?
                    'http://maptest.newcompte.fr/testmap' :
                    'http://justletme.be:8080/testmap';
            } else {
                finalDestination = 'http://tagpro-maptest.koalabeast.com/testmap';
            }

            const remoteServerResponse = await sendMultipartForm(finalDestination, operationalSchemaObject, spatialArrangementBytes);

            if (remoteServerResponse) {
                serverResponse.writeHead(200, { 'Content-Type': 'application/json' });
                serverResponse.end(JSON.stringify(remoteServerResponse.headers));
            } else {
                serverResponse.writeHead(500, { 'Content-Type': 'text/plain' });
                serverResponse.end('Upstream service did not provide a valid response.');
            }
            return;
        }

        serverResponse.writeHead(404, { 'Content-Type': 'text/plain' });
        serverResponse.end('Endpoint not found.');

    } catch (handlerError) {
        diagnosticOutput.error('Unhandled server error:', handlerError);
        serverResponse.writeHead(500, { 'Content-Type': 'text/plain' });
        serverResponse.end(`Operation failed: ${handlerError.toString()}`);
    }
});

applicationHost.listen(CONNECTION_PORT, () => {
    diagnosticOutput.record(`Application host awaiting connections on port ${CONNECTION_PORT}`);
});