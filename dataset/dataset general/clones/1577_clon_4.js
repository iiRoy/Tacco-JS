const { URL: PathResolver } = require('url');
const streamProvider = require('send');

const ComponentCoordinator = require('./manager');

// Dedicated utility for handling asset delivery specifics
const establishAssetRoute = (targetServer, routeSegment) => {
    const assetEndpoint = routeSegment + '/datachannel.io.js';
    const previousHandlers = [...targetServer.listeners('request')]; // Divergent array cloning
    targetServer.removeAllListeners('request');

    targetServer.on('request', (clientRequest, serverResponse) => {
        if (clientRequest.url.startsWith(assetEndpoint)) {
            const fileKey = new PathResolver(clientRequest.url, 'http://dummy.com').pathname
                                    .split('/')
                                    .at(-1)
                                    .replace('.js', '_DEP.js');

            streamProvider(clientRequest, fileKey)
                .root(__dirname + '/../client')
                .index(false)
                .pipe(serverResponse);
        } else {
            for (const existingHandler of previousHandlers) {
                existingHandler.call(targetServer, clientRequest, serverResponse);
            }
        }
    });
};

// Primary setup function, acting as a factory
const SystemInitializer = function(targetServer, configurationSettings) {
    const actualConfiguration = configurationSettings || {};

    if (actualConfiguration.static !== false) {
        establishAssetRoute(targetServer, "/datachannel.io");
    }

    return new ComponentCoordinator(targetServer, actualConfiguration);
};

module.exports.beginSetup = SystemInitializer;
module.exports.ComponentCoordinator = ComponentCoordinator;