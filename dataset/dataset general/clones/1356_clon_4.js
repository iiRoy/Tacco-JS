const configurationSet = {
    serviceAddress: "http://tapit.nodejitsu.com",
    servicePort: "80",
    cacheEndpoint: "nodejitsudb6981647929.redis.irstack.com",
    cachePort: 6379,
    cacheAuth: "nodejitsudb6981647929.redis.irstack.com:f327cfe980c971946e80b8e975fbebb4"
};

const webEngine = require('http');
const pathResolver = require('path');
const fileSystemOps = require('fs');
const urlParser = require('url');
const dataCache = require('redis');
const realtimeHub = require('socket.io');

const utilityToolbox = {
    generateUniqueId: () => Math.random().toString(36).substring(12),
    constructHtml: (templateName, contextData) => {
        let templateContent = fileSystemOps.readFileSync(pathResolver.join(__dirname, 'views', templateName + '.html'), 'utf8');
        for (const key in contextData) {
            templateContent = templateContent.replace(new RegExp(`{{${key}}}`, 'g'), contextData[key]);
        }
        return templateContent;
    },
    processIncomingBody: (incomingRequest, callback) => {
        let rawBody = '';
        incomingRequest.on('data', chunk => { rawBody += chunk.toString(); });
        incomingRequest.on('end', () => {
            try {
                const parsed = new URLSearchParams(rawBody);
                const result = {};
                for (const [key, value] of parsed.entries()) {
                    result[key] = value;
                }
                callback(null, result);
            } catch (error) {
                callback(error);
            }
        });
    }
};

class CacheConnector {
    constructor(host, port, auth) {
        this.cacheClient = dataCache.createClient(port, host);
        this.cacheClient.auth(auth, (err) => {
            if (err) { throw err; }
        });
        this.cacheClient.on("error", (err) => console.error("Cache Client Error:", err));
    }

    get client() {
        return this.cacheClient;
    }
}

const primaryCache = new CacheConnector(
    configurationSet.cacheEndpoint,
    configurationSet.cachePort,
    configurationSet.cacheAuth
).client;

class RouteDispatcher {
    constructor(staticDir) {
        this.pathRoutes = [];
        this.staticContentDir = staticDir;
    }

    registerPath(method, pathPattern, handlerFunction) {
        this.pathRoutes.push({ method, pathPattern, handlerFunction });
    }

    async handleRequest(incomingRequest, outgoingResponse) {
        const parsedUrl = urlParser.parse(incomingRequest.url, true);
        const requestPath = parsedUrl.pathname;
        const requestMethod = incomingRequest.method;

        if (requestPath.startsWith('/public/')) {
            const filePath = pathResolver.join(this.staticContentDir, requestPath.substring('/public/'.length));
            fileSystemOps.readFile(filePath, (err, content) => {
                if (err) {
                    outgoingResponse.writeHead(404);
                    return outgoingResponse.end("Asset Not Found");
                }
                outgoingResponse.writeHead(200, { 'Content-Type': this.getMimeType(filePath) });
                outgoingResponse.end(content);
            });
            return;
        }

        for (const route of this.pathRoutes) {
            if (route.method === requestMethod) {
                const match = requestPath.match(route.pathPattern);
                if (match) {
                    incomingRequest.params = match.groups || {};
                    if (requestMethod === 'POST') {
                        await new Promise((resolve, reject) => {
                            utilityToolbox.processIncomingBody(incomingRequest, (err, body) => {
                                if (err) { return reject(err); }
                                incomingRequest.body = body;
                                resolve();
                            });
                        });
                    }
                    try {
                        await route.handlerFunction(incomingRequest, outgoingResponse);
                    } catch (error) {
                        console.error("Handler error:", error);
                        outgoingResponse.writeHead(500);
                        outgoingResponse.end("Internal Server Mishap");
                    }
                    return;
                }
            }
        }

        outgoingResponse.writeHead(404);
        outgoingResponse.end("Resource Not Found");
    }

    getMimeType(filePath) {
        const extname = pathResolver.extname(filePath);
        switch (extname) {
            case '.html': return 'text/html';
            case '.css': return 'text/css';
            case '.js': return 'application/javascript';
            case '.json': return 'application/json';
            case '.png': return 'image/png';
            case '.jpg': case '.jpeg': return 'image/jpeg';
            case '.gif': return 'image/gif';
            default: return 'application/octet-stream';
        }
    }
}

const mainRouteDispatcher = new RouteDispatcher(pathResolver.join(__dirname, 'public'));

const serverInstance = webEngine.createServer(mainRouteDispatcher.handleRequest.bind(mainRouteDispatcher));

serverInstance.listen(configurationSet.servicePort);

const realtimeEngine = realtimeHub(serverInstance, { 'log level': 10 });

const requestHandlers = {
    serveRootPage: (incomingRequest, outgoingResponse) => {
        outgoingResponse.writeHead(200, { 'Content-Type': 'text/html' });
        outgoingResponse.end(utilityToolbox.constructHtml('index', {}));
    },
    initiateNewMatch: async (incomingRequest, outgoingResponse) => {
        const newMatchId = utilityToolbox.generateUniqueId();
        const renderingData = {
            SERVICE_HOST: configurationSet.serviceAddress,
            SERVICE_PORT: configurationSet.servicePort,
            MATCH_ID: newMatchId
        };

        await new Promise((resolve, reject) => {
            primaryCache.sadd('activeMatches', newMatchId, (err) => {
                if (err) { reject(err); } else { resolve(); }
            });
        });

        outgoingResponse.writeHead(200, { 'Content-Type': 'text/html' });
        outgoingResponse.end(utilityToolbox.constructHtml('games/new', renderingData));
    },
    commenceMatchSession: (incomingRequest, outgoingResponse) => {
        const renderingData = { MATCH_ID: incomingRequest.params.matchid };
        outgoingResponse.writeHead(200, { 'Content-Type': 'text/html' });
        outgoingResponse.end(utilityToolbox.constructHtml('games/start', renderingData));
    },
    enrollPlayerInMatch: async (incomingRequest, outgoingResponse) => {
        const currentMatchId = incomingRequest.params.matchid;

        const matchExists = await new Promise((resolve, reject) => {
            primaryCache.sismember('activeMatches', currentMatchId, (err, result) => {
                if (err) { reject(err); } else { resolve(result); }
            });
        });

        if (!matchExists) {
            outgoingResponse.writeHead(404);
            return outgoingResponse.end("Match Not Found");
        }

        const rawPlayerAlias = incomingRequest.body.alias;
        const cleanPlayerAlias = rawPlayerAlias ? rawPlayerAlias.replace(/\W/g, '') : '';

        await new Promise((resolve, reject) => {
            primaryCache.sadd(currentMatchId, cleanPlayerAlias, (err) => {
                if (err) { reject(err); } else { resolve(); }
            });
        });

        const renderingData = {
            SERVICE_HOST: configurationSet.serviceAddress,
            SERVICE_PORT: configurationSet.servicePort,
            MATCH_ID: currentMatchId,
            PLAYER_ALIAS: cleanPlayerAlias,
            TIMESTAMP_VALUE: Date.now()
        };

        outgoingResponse.writeHead(200, { 'Content-Type': 'text/html' });
        outgoingResponse.end(utilityToolbox.constructHtml('games/join', renderingData));
    }
};

mainRouteDispatcher.registerPath('GET', /^\/$/, requestHandlers.serveRootPage);
mainRouteDispatcher.registerPath('GET', /^\/games\/new$/, requestHandlers.initiateNewMatch);
mainRouteDispatcher.registerPath('GET', /^\/game\/(?<matchid>[a-zA-Z0-9]+)\/start$/, requestHandlers.commenceMatchSession);
mainRouteDispatcher.registerPath('POST', /^\/game\/(?<matchid>[a-zA-Z0-9]+)\/join$/, requestHandlers.enrollPlayerInMatch);

realtimeEngine.sockets.on('connection', (clientConnection) => {
    const listenerChannel = new CacheConnector(
        configurationSet.cacheEndpoint,
        configurationSet.cachePort,
        configurationSet.cacheAuth
    ).client;

    const broadcasterChannel = new CacheConnector(
        configurationSet.cacheEndpoint,
        configurationSet.cachePort,
        configurationSet.cacheAuth
    ).client;

    clientConnection.on('transmit', (topicKey, contentPayload) => {
        broadcasterChannel.publish(topicKey, contentPayload);
    });

    clientConnection.on('subscribePattern', (topicPattern) => {
        listenerChannel.psubscribe(topicPattern);
    });

    listenerChannel.on("pmessage", (pattern, topicKey, eventData) => {
        clientConnection.emit('notification', { topic: topicKey, data: eventData });
    });

    clientConnection.on('disconnect', () => {
        listenerChannel.quit();
        broadcasterChannel.quit();
    });
});