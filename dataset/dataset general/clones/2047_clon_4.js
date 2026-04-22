const socialPlatformClient = require('twitter');
const webApplicationFramework = require('express');
const networkServerModule = require('http');
const realTimeCommunicationModule = require('socket.io');

const webAppInstance = webApplicationFramework();
const networkServer = networkServerModule.createServer(webAppInstance);
const communicationHub = realTimeCommunicationModule.listen(networkServer);

let activeDataFlow = null;

const microblogCredentials = {
  consumer_key: '<ENTER>',
  consumer_secret: '<ENTER>',
  access_token_key: '<ENTER>',
  access_token_secret: '<ENTER>'
};
const microblogConnector = new socialPlatformClient(microblogCredentials);

networkServer.listen(process.env.APPLICATION_PORT || 8081);

webAppInstance.use(webApplicationFramework.static(__dirname + '/public_content'));

const computeCentroid = (points) => {
    let sumLat = 0;
    let sumLng = 0;
    points.forEach(p => {
        sumLng += p[0];
        sumLat += p[1];
    });
    return {
        latitude: sumLat / points.length,
        longitude: sumLng / points.length
    };
};

const processIncomingMessage = (messagePayload, clientEndpoint) => {
    let locationData = null;

    if (messagePayload.coordinates && messagePayload.coordinates.coordinates) {
        const [msgLng, msgLat] = messagePayload.coordinates.coordinates;
        locationData = { geo_latitude: msgLat, geo_longitude: msgLng };
    }
    else if (messagePayload.place && messagePayload.place.bounding_box && messagePayload.place.bounding_box.type === 'Polygon') {
        const polygonPoints = messagePayload.place.bounding_box.coordinates[0];
        const { latitude, longitude } = computeCentroid(polygonPoints);
        locationData = { geo_latitude: latitude, geo_longitude: longitude };
    }

    if (locationData) {
        clientEndpoint.broadcast.emit('geographic_feed_update', locationData);
        clientEndpoint.emit('geographic_feed_update', locationData);
    }
};

const initiateMicroblogStream = (clientEndpoint) => {
    if (activeDataFlow === null) {
        microblogConnector.stream('statuses/filter', { 'locations': '-180,-90,180,90' }, (newFlow) => {
            activeDataFlow = newFlow;
            newFlow.on('data', (payload) => processIncomingMessage(payload, clientEndpoint));
            newFlow.on('limit', (limitationNotice) => console.log('Rate limit reached:', limitationNotice));
            newFlow.on('warning', (advisoryMessage) => console.log('Stream warning:', advisoryMessage));
            newFlow.on('disconnect', (terminationMessage) => {
                console.log('Stream disconnected:', terminationMessage);
            });
            console.log('Microblog data flow established.');
        }).on('error', (err) => {
            console.error('Microblog stream error:', err);
        });
    } else {
        console.log('Microblog data flow already active.');
    }
};

communicationHub.on('connection', (clientEndpoint) => {
    clientEndpoint.emit('connection_established');

    clientEndpoint.on('request_feed_start', () => {
        initiateMicroblogStream(clientEndpoint);
    });

    clientEndpoint.on('disconnect', () => {
        console.log('Client disconnected.');
    });
});