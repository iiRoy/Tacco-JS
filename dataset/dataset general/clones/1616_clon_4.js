const networkUtility = require('os');
const fileOperations = require('fs');
const httpConnections = require('http');
const udpDatagram = require('dgram');
const uuidGenerator = require('node:crypto');
const wsModule = require('ws');
const pathResolver = require('path');
const queryParser = require('querystring');

function parseArguments(argsList) {
    const parsed = {};
    for (let i = 0; i < argsList.length; i++) {
        if (argsList[i].startsWith('--')) {
            const key = argsList[i].substring(2);
            if (i + 1 < argsList.length && !argsList[i + 1].startsWith('--')) {
                parsed[key] = argsList[i + 1];
                i++;
            } else {
                parsed[key] = true;
            }
        }
    }
    if (!parsed.hasOwnProperty('designation')) {
        throw new Error('Required argument --designation is missing.');
    }
    return parsed;
}

const processArgs = parseArguments(process.argv.slice(2));
const serviceDesignation = processArgs.designation;

const servicePort = 8008;
const serviceIdentifier = uuidGenerator.randomUUID();

let ProgramRegistry;

function obtainLocalAddress() {
    const networkInterfaces = networkUtility.networkInterfaces();
    for (const interfaceName in networkInterfaces) {
        for (const interfaceDetails of networkInterfaces[interfaceName]) {
            if (interfaceDetails.family === 'IPv4' && !interfaceDetails.internal) {
                return interfaceDetails.address;
            }
        }
    }
    return '127.0.0.1';
}

const localNetworkAddress = obtainLocalAddress();
console.log(localNetworkAddress);

const httpRouteMap = new Map();

function sendHttpResponse(response, statusCode, headers, body) {
    response.writeHead(statusCode, headers);
    if (body) {
        response.end(body);
    } else {
        response.end();
    }
}

async function parseRequestBody(request) {
    return new Promise((resolve) => {
        let incomingData = '';
        request.on('data', (chunk) => {
            incomingData += chunk.toString('utf8');
        });
        request.on('end', () => {
            resolve(incomingData);
        });
    });
}

function applyCommonHeaders(response) {
    response.removeHeader('X-Powered-By');
    response.removeHeader('Connection');
}

httpRouteMap.set('GET /device-descriptor.xml', async (req, res) => {
    try {
        const xmlTemplate = await fileOperations.promises.readFile(pathResolver.join(__dirname, 'device-desc.xml'), 'utf8');
        const hostHeader = req.headers.host || `${localNetworkAddress}:${servicePort}`;
        const processedXml = xmlTemplate
            .replace(/#identifier#/g, serviceIdentifier)
            .replace(/#base_uri#/g, `http://${hostHeader}`)
            .replace(/#device_name#/g, serviceDesignation);

        applyCommonHeaders(res);
        sendHttpResponse(res, 200, {
            'Content-Type': 'application/xml',
            'Access-Control-Allow-Method': 'GET, POST, DELETE, OPTIONS',
            'Access-Control-Expose-Headers': 'Location',
            'Application-Url': `http://${hostHeader}/program-listing`
        }, processedXml);
    } catch (error) {
        console.error('Error serving device descriptor:', error);
        sendHttpResponse(res, 500, { 'Content-Type': 'text/plain' }, 'Internal Server Error');
    }
});

httpRouteMap.set('POST /session-link/:programId', async (req, res) => {
    const programId = req.url.split('/')[2].split('?')[0];
    console.log(`Establishing link for Program: ${programId}`);

    applyCommonHeaders(res);
    sendHttpResponse(res, 200, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Method': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
    }, JSON.stringify({
        channelURI: `ws://${localNetworkAddress}:${servicePort}/session-channel/${programId}?1`,
        heartbeatInterval: 3
    }));
});

httpRouteMap.set('GET /program-listing', async (req, res) => {
    let redirected = false;
    for (const key in ProgramRegistry.availablePrograms) {
        if (ProgramRegistry.availablePrograms[key].configuration.status === 'active') {
            console.log(`Redirecting to ${key}`);
            applyCommonHeaders(res);
            sendHttpResponse(res, 302, { 'Location': `/program-listing/${key}` });
            redirected = true;
            break;
        }
    }

    if (!redirected) {
        applyCommonHeaders(res);
        sendHttpResponse(res, 204, {
            'Content-Length': '0',
            'Content-Type': 'text/html; charset=UTF-8',
            'Access-Control-Allow-Method': 'GET, POST, DELETE, OPTIONS',
            'Access-Control-Expose-Headers': 'Location'
        });
    }
});

const mainHttpServer = httpConnections.createServer(async (req, res) => {
    applyCommonHeaders(res);

    if (req.url.startsWith('/public/') || req.url === '/') {
        const filePath = req.url === '/' ? pathResolver.join(__dirname, 'public', 'index.html') : pathResolver.join(__dirname, req.url);
        fileOperations.promises.readFile(filePath)
            .then(data => {
                const contentType = {
                    '.html': 'text/html', '.css': 'text/css', '.js': 'application/javascript',
                    '.png': 'image/png', '.jpg': 'image/jpeg', '.gif': 'image/gif'
                }[pathResolver.extname(filePath)] || 'application/octet-stream';
                sendHttpResponse(res, 200, { 'Content-Type': contentType }, data);
            })
            .catch(err => {
                console.error(`Error serving static file ${filePath}:`, err);
                sendHttpResponse(res, 404, { 'Content-Type': 'text/plain' }, 'Not Found');
            });
        return;
    }

    req.bodyContent = await parseRequestBody(req);

    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);

    const requestPathNoQuery = req.url.split('?')[0];
    const requestKey = `${req.method} ${requestPathNoQuery}`;
    let handler = httpRouteMap.get(requestKey);

    if (!handler) {
        for (const [key, val] of httpRouteMap.entries()) {
            if (key.startsWith(req.method) && key.includes('/:')) {
                const routeRegex = new RegExp(`^${key.replace(/\/:[^/]+/g, '/([^/]+)')}$`);
                if (routeRegex.test(requestPathNoQuery)) {
                    handler = val;
                    break;
                }
            }
        }
    }

    if (handler) {
        handler(req, res);
    } else {
        sendHttpResponse(res, 404, { 'Content-Type': 'text/plain' }, 'Resource Not Found');
    }
});

mainHttpServer.listen(servicePort, () => {
    console.log(`Gateway operational on port ${servicePort}`);
});

const socketConnectionHub = new wsModule.Server({
    server: mainHttpServer,
    autoAcceptConnections: false
});

const socketPathRegistry = new Map();

let primaryStageLink = null;

socketConnectionHub.on('connection', (socket, request) => {
    const requestPath = request.url.split('?')[0];
    const origin = request.headers.origin;

    let handler = null;

    if (socketPathRegistry.has(requestPath)) {
        handler = socketPathRegistry.get(requestPath);
    } else {
        for (const [pathRegex, routeHandler] of socketPathRegistry.entries()) {
            if (pathRegex instanceof RegExp && pathRegex.test(requestPath)) {
                handler = routeHandler;
                break;
            }
        }
    }

    if (handler) {
        const mockRequest = {
            accept: (orig) => {
                if (orig && orig !== origin) {
                    console.warn(`Origin mismatch: ${origin} vs ${orig}`);
                }
                return {
                    send: (data) => socket.send(data),
                    on: (event, cb) => socket.on(event, (message) => {
                        // Adapt 'ws' message object to original library's expected structure
                        cb({ utf8Data: message.toString('utf8') });
                    }),
                    close: () => socket.close(),
                };
            },
            origin: origin,
            resourceURL: {
                pathname: requestPath,
                search: request.url.includes('?') ? '?' + request.url.split('?')[1] : ''
            },
        };
        handler(mockRequest);
    } else {
        console.warn(`No WebSocket handler found for path: ${requestPath}`);
        socket.close(1008, 'Policy Violation');
    }
});

socketPathRegistry.set('/staging', (requestContext) => {
    primaryStageLink = requestContext.accept(requestContext.origin);
    primaryStageLink.send(JSON.stringify({
        command: "dormant"
    }));
});

socketPathRegistry.set('/control-unit/system', (requestContext) => {
    const connection = requestContext.accept(requestContext.origin);
    console.log("control-unit/system channel established");
});

socketPathRegistry.set('/comm-channel', (requestContext) => {
    const channelEndpoint = requestContext.accept(requestContext.origin);
    let participantName;

    channelEndpoint.on('message', (message) => {
        try {
            const receivedCommand = JSON.parse(message.utf8Data);
            if (receivedCommand.commandType === "ENROLL") {
                participantName = receivedCommand.entityName;
                channelEndpoint.send(JSON.stringify({
                    commandType: "CHANNEL_QUERY",
                    "initiatorId": 1,
                    "queryId": 1
                }));

                const receiverPath = `/receiver-channel/${participantName}`;
                socketPathRegistry.set(receiverPath, (receiverRequestContext) => {
                    const receiverConnection = receiverRequestContext.accept(receiverRequestContext.origin);
                    const programKey = receiverRequestContext.resourceURL.pathname
                        .replace('/receiver-channel/', '')
                        .replace('Dev', '');
                    ProgramRegistry.availablePrograms[programKey].linkReceiver(receiverConnection);
                });

            } else if (receivedCommand.commandType === "CHANNEL_RESPONSE") {
                channelEndpoint.send(JSON.stringify({
                    commandType: "NEW_CHANNEL_READY",
                    "initiatorId": 1,
                    "queryId": 1,
                    "destinationURI": `ws://${localNetworkAddress}:${servicePort}/receiver-channel/${participantName}`
                }));
            }
        } catch (e) {
            console.error('Error parsing WebSocket message:', e);
        }
    });
});

socketPathRegistry.set(/^\/session-channel\/.+$/, (requestContext) => {
    const sessionLink = requestContext.accept(requestContext.origin);
    console.log("Session link established");

    const pathSegments = requestContext.resourceURL.pathname.split('/');
    const programAlias = pathSegments[pathSegments.length - 1];
    const sessionTag = requestContext.resourceURL.search.replace('?', '');

    const targetProgram = ProgramRegistry.availablePrograms[programAlias];

    if (targetProgram) {
        targetProgram.linkSession(sessionLink);
    }
});

const ssdpSocket = udpDatagram.createSocket({ type: 'udp4', reuseAddr: true });
const SSDP_MULTICAST_ADDRESS = '239.255.255.250';
const SSDP_PORT = 1900;

function initializeDiscoveryService(hostAddress) {
    ssdpSocket.bind(SSDP_PORT, () => {
        ssdpSocket.addMembership(SSDP_MULTICAST_ADDRESS);
        console.log(`Discovery service listening on ${hostAddress}:${SSDP_PORT}`);
    });

    ssdpSocket.on('message', (message, remote) => {
        const messageString = message.toString();
        const headers = parseSsdpHeaders(messageString);

        if (headers.ST && headers.ST.includes("dial-multiscreen-org:service:dial:1")) {
            const response = [
                'HTTP/1.1 200 OK',
                `CACHE-CONTROL: max-age=1800`,
                `DATE: ${new Date().toUTCString()}`,
                `EXT:`,
                `LOCATION: http://${hostAddress}:${servicePort}/device-descriptor.xml`,
                `SERVER: Node.js/16 UPnP/1.0 CustomApp/1.0`,
                `ST: urn:dial-multiscreen-org:service:dial:1`,
                `USN: uuid:${serviceIdentifier}`,
                `CONFIGID.UPNP.ORG: 7337`,
                `BOOTID.UPNP.ORG: 7337`,
                '', ''
            ].join('\r\n');

            ssdpSocket.send(response, SSDP_PORT, remote.address);
        }
    });

    ssdpSocket.on('error', (err) => {
        console.error('SSDP socket error:', err);
        ssdpSocket.close();
    });
}

function parseSsdpHeaders(rawMessage) {
    const lines = rawMessage.split('\r\n');
    const headers = {};
    for (const line of lines) {
        const separatorIndex = line.indexOf(':');
        if (separatorIndex > 0) {
            const key = line.substring(0, separatorIndex).trim().toUpperCase();
            const value = line.substring(separatorIndex + 1).trim();
            headers[key] = value;
        }
    }
    return headers;
}

function configurePrograms(address) {
    ProgramRegistry = require('./apps/apps.js');
    ProgramRegistry.init(fileOperations, mainHttpServer);
    ProgramRegistry.enrollProgram(mainHttpServer, address, "ScreenEcho", "https://www.gstatic.com/cv/receiver.html?$query", "");
    ProgramRegistry.enrollProgram(mainHttpServer, address, "TubeViewer", "https://www.youtube.com/tv?$query", "");
    ProgramRegistry.enrollProgram(mainHttpServer, address, "FilmStream", "https://play.google.com/video/avi/eureka?$query", "");
    ProgramRegistry.enrollProgram(mainHttpServer, address, "MelodyFlow", "https://jmt17.google.com/sjdev/cast/player", "");
    ProgramRegistry.enrollProgram(mainHttpServer, address, "CastDemoApp", "http://anzymrcvr.appspot.com/receiver/anzymrcvr.html", "");
    ProgramRegistry.enrollProgram(mainHttpServer, address, "CastPlayer", "https://www.gstatic.com/eureka/html/gcp.html", "");
    ProgramRegistry.enrollProgram(mainHttpServer, address, "Projector", "$query", "");
    ProgramRegistry.enrollProgram(mainHttpServer, address, "XOXOGame", "http://www.gstatic.com/eureka/sample/tictactoe/tictactoe.html", "");
}

configurePrograms(localNetworkAddress);
initializeDiscoveryService(localNetworkAddress);