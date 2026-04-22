const httpEngine = require('http');
const secureHttpFetcher = require('https');
const fileSystemUtil = require('fs').promises;
const queryParamHandler = require('querystring');
const webSocketController = require('socket.io');
const urlProcessor = require('url');
const pathResolver = require('path');

const currentListenPort = parseInt(process.env.APPLICATION_PORT || process.env.PORT || '3000', 10);
const instagramClientId = process.env.INSTAGRAM_CLIENT_IDENTIFIER;

const logUtility = {
    inform: console.log,
    alert: (...args) => console.error('ALERT:', ...args),
    examine: (obj) => JSON.stringify(obj, null, 2)
};

const applicationHost = httpEngine.createServer();
const webSocketManager = webSocketController(applicationHost);

// The original `io.set('log level', 1)` is for older socket.io.
// For a Type IV clone, we avoid the `set` method and express-specific integration.
// If verbose logging is an issue, a modern approach is to configure a custom logger
// or rely on environment variables for the 'debug' module.
// For this clone, we'll assume default socket.io logging behavior is acceptable,
// or that it's silenced by other means, adhering to "divergent syntax".

applicationHost.on('request', async (clientRequest, serverResponse) => {
    const parsedRequestUrl = urlProcessor.parse(clientRequest.url, true);
    const requestPath = parsedRequestUrl.pathname;
    const requestQuery = parsedRequestUrl.query;
    const requestMethod = clientRequest.method;

    const acquireRequestBody = () => new Promise((resolve, reject) => {
        let amassedData = '';
        clientRequest.on('data', (dataSegment) => {
            amassedData += dataSegment;
        });
        clientRequest.on('end', () => {
            try {
                if (amassedData) {
                    resolve(JSON.parse(amassedData));
                } else {
                    resolve(null); // No body
                }
            } catch (error) {
                reject(new Error('Payload parsing failed: ' + error.message));
            }
        });
        clientRequest.on('error', reject);
    });

    try {
        switch (requestPath) {
            case '/style.css':
                if (requestMethod === 'GET') {
                    serverResponse.writeHead(200, { 'Content-Type': 'text/css' });
                    const cssContent = await fileSystemUtil.readFile(pathResolver.join(__dirname, 'public', 'stylesheets', 'style.css'), 'utf8');
                    serverResponse.end(cssContent);
                } else {
                    serverResponse.writeHead(405, { 'Allow': 'GET' });
                    serverResponse.end('Method Not Permitted');
                }
                break;

            case '/':
                if (requestMethod === 'GET') {
                    serverResponse.writeHead(200, { 'Content-Type': 'text/html' });
                    const htmlContent = await fileSystemUtil.readFile(pathResolver.join(__dirname, 'index.html'), 'utf8');
                    serverResponse.end(htmlContent);
                } else {
                    serverResponse.writeHead(405, { 'Allow': 'GET' });
                    serverResponse.end('Method Not Permitted');
                }
                break;

            case '/callback':
                if (requestMethod === 'GET') {
                    const challengeParameter = requestQuery['hub.challenge'];
                    if (challengeParameter !== undefined && challengeParameter !== null) {
                        serverResponse.writeHead(200, { 'Content-Type': 'text/plain' });
                        serverResponse.end(challengeParameter);
                    } else {
                        logUtility.alert('Missing "hub.challenge" query parameter for subscription validation:', logUtility.examine(requestQuery));
                        serverResponse.writeHead(400, { 'Content-Type': 'text/plain' });
                        serverResponse.end('Bad Request: Verification parameter missing.');
                    }
                } else if (requestMethod === 'POST') {
                    const notificationPayloads = await acquireRequestBody();

                    if (!Array.isArray(notificationPayloads)) {
                        logUtility.alert('Invalid POST /callback payload: Expected an array of notifications, received:', logUtility.examine(notificationPayloads));
                        serverResponse.writeHead(400, { 'Content-Type': 'text/plain' });
                        serverResponse.end('Bad Request: Payload must be an array of notification objects.');
                        return;
                    }

                    await Promise.all(notificationPayloads.map(async (updateNotice) => {
                        if (!updateNotice || !updateNotice.object_id) {
                            logUtility.alert('Skipping malformed notification object:', logUtility.examine(updateNotice));
                            return;
                        }

                        const instagramApiResource = '/v1/geographies/' + updateNotice.object_id + '/media/recent' +
                            '?' + queryParamHandler.stringify({ client_id: instagramClientId, count: 1 });

                        try {
                            const apiResponseData = await new Promise((resolve, reject) => {
                                secureHttpFetcher.get({
                                    host: 'api.instagram.com',
                                    path: instagramApiResource,
                                }, (apiResponse) => {
                                    let responseDataAccumulator = '';
                                    apiResponse.on('data', (dataSegment) => {
                                        responseDataAccumulator += dataSegment;
                                    });
                                    apiResponse.on('end', () => {
                                        resolve(responseDataAccumulator);
                                    });
                                    apiResponse.on('error', reject);
                                }).on('error', reject);
                            });

                            const apiResult = JSON.parse(apiResponseData);

                            if (apiResult && apiResult.data && apiResult.data.length > 0 && apiResult.data[0].location !== null) {
                                webSocketManager.sockets.emit('photo', apiResponseData);
                            } else {
                                logUtility.alert('Instagram API response lacked required photo data or location:', logUtility.examine(apiResult.meta || apiResult));
                            }
                        } catch (apiFetchError) {
                            logUtility.alert('Failed to retrieve data from Instagram API for object_id', updateNotice.object_id, ':', apiFetchError.message);
                        }
                    }));

                    serverResponse.writeHead(200, { 'Content-Type': 'text/plain' });
                    serverResponse.end('All notifications processed.');
                } else {
                    serverResponse.writeHead(405, { 'Allow': 'GET, POST' });
                    serverResponse.end('Method Not Permitted');
                }
                break;

            default:
                serverResponse.writeHead(404, { 'Content-Type': 'text/plain' });
                serverResponse.end('Resource Not Found');
                break;
        }
    } catch (operationIssue) {
        logUtility.alert('Server processing error:', operationIssue.message, operationIssue.stack);
        serverResponse.writeHead(500, { 'Content-Type': 'text/plain' });
        serverResponse.end('Internal Server Malfunction');
    }
});

applicationHost.listen(currentListenPort, () => {
    logUtility.inform('Application is now active on port %d', currentListenPort);
});