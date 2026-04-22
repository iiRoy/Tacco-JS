const socialApiWrapper = require('twitter');
const webFramework = require('express');
const networkProtocol = require('http');
const socketManager = require('socket.io');

// Application configuration settings
const appConfig = Object.freeze({
  apiKeys: {
    consumerKey: '<INSERT_CONSUMER_KEY>',
    consumerSecret: '<INSERT_CONSUMER_SECRET>',
    accessToken: '<INSERT_ACCESS_TOKEN_KEY>',
    accessTokenSecret: '<INSERT_ACCESS_TOKEN_SECRET>'
  },
  serverPort: process.env.PORT || 8081,
  staticContentPath: `${__dirname}/public`,
  geoFilterBounds: '-180,-90,180,90' // Represents the entire globe
});

// Initialize the web application and HTTP server
const webAppInstance = webFramework();
const httpServer = networkProtocol.createServer(webAppInstance);
const ioHandler = socketManager(httpServer); // Use a new instance of socket.io

// Set up the connection to the external social media API
let apiClient = null;
let activeDataFlow = null; // Renamed 'stream' to 'activeDataFlow'

// Function to initialize the social API client
const initializeApiClient = () => {
  if (!apiClient) {
    apiClient = new socialApiWrapper({
      consumer_key: appConfig.apiKeys.consumerKey,
      consumer_secret: appConfig.apiKeys.consumerSecret,
      access_token_key: appConfig.apiKeys.accessToken,
      access_token_secret: appConfig.apiKeys.accessTokenSecret
    });
    console.log('Social API client initialized.');
  }
  return apiClient;
};

// Start the HTTP server on the configured port
httpServer.listen(appConfig.serverPort, () => {
  console.log(`Server is now operational on port: ${appConfig.serverPort}`);
});

// Configure static file serving for client-side assets
webAppInstance.use(webFramework.static(appConfig.staticContentPath));
console.log(`Serving static files from: ${appConfig.staticContentPath}`);

// Establish a new client connection via WebSockets
ioHandler.on('connection', (clientConnection) => {
  console.log(`New client connected: ${clientConnection.id}`);

  // Inform the client that the connection is ready
  clientConnection.emit('connectionEstablished', { status: 'ready', message: 'You are now connected to the real-time feed service.' });

  // Handle the client's request to begin receiving data
  clientConnection.on('initiateFeedSubscription', () => {
    console.log(`Client ${clientConnection.id} requested feed subscription.`);

    // Prevent multiple stream initiations
    if (activeDataFlow !== null) {
      console.warn('Data flow already active. Not starting a new one.');
      return; // Exit early if stream is already running
    }

    // Connect to the social media stream API
    const currentApiClient = initializeApiClient();
    currentApiClient.stream('statuses/filter', { 'locations': appConfig.geoFilterBounds }, (newStream) => {
      activeDataFlow = newStream;
      console.log('Successfully connected to the social media data stream.');

      // Utility function to broadcast geographical data
      const distributeGeoData = (geoPoint) => {
        // Send to all other connected clients
        clientConnection.broadcast.emit('realtimeGeoFeed', geoPoint);
        // Send back to the originating client
        clientConnection.emit('realtimeGeoFeed', geoPoint);
      };

      // Process incoming data from the stream
      activeDataFlow.on('data', (tweetPayload) => {
        if (!tweetPayload || typeof tweetPayload !== 'object') {
          console.warn('Received invalid tweet payload.');
          return;
        }

        try {
          if (tweetPayload.coordinates && tweetPayload.coordinates.coordinates) {
            const [longitude, latitude] = tweetPayload.coordinates.coordinates;

            // Basic validation for coordinate values
            if (typeof latitude === 'number' && typeof longitude === 'number' &&
                latitude >= -90 && latitude <= 90 &&
                longitude >= -180 && longitude <= 180) {

              const geoPositionData = { latitude, longitude };
              distributeGeoData(geoPositionData);
            } else {
              console.warn('Invalid coordinate values received:', tweetPayload.coordinates.coordinates);
            }
          }
          // Removed the problematic 'data.place' bounding box logic from the original.
          // This section would require significant re-engineering to be functional
          // and robust, and was not essential for the core functionality of
          // streaming direct coordinates.
        } catch (error) {
          console.error('Error processing tweet data:', error.message);
        }
      });

      // Handle rate limit notices from the API
      activeDataFlow.on('limit', (limitInfo) => {
        console.warn('API rate limit notice:', limitInfo);
      });

      // Handle warning messages from the API
      activeDataFlow.on('warning', (apiWarning) => {
        console.warn('API warning received:', apiWarning);
      });

      // Handle stream disconnection events
      activeDataFlow.on('disconnect', (disconnectMessage) => {
        console.error('Data stream disconnected:', disconnectMessage);
        activeDataFlow = null; // Reset the stream state
        // Optionally, attempt to reconnect here
      });

      // Handle stream errors
      activeDataFlow.on('error', (streamError) => {
        console.error('An error occurred in the data stream:', streamError);
        // Depending on the error, activeDataFlow might need to be set to null
        // and a reconnection attempt initiated.
      });

    }); // End of currentApiClient.stream() callback
  }); // End of clientConnection.on('initiateFeedSubscription')
}); // End of ioHandler.on('connection')

// Add a graceful shutdown handler for the server
process.on('SIGINT', () => {
  console.log('Shutting down server gracefully...');
  if (activeDataFlow) {
    activeDataFlow.destroy(); // Terminate the Twitter stream
    console.log('Twitter data stream destroyed.');
  }
  httpServer.close(() => {
    console.log('HTTP server closed.');
    process.exit(0);
  });
});