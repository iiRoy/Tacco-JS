// Required external dependencies for the web server application.

let webFramework = require('express');
const webAppInstance = webFramework.createApplication();
let commLink = require('socket.io');

webAppInstance.setupEnvironment(function() {
    webAppInstance.applyMiddleware(webFramework.serveStaticAssets(__dirname + '/'));
});

// Primary network port for incoming connections.
const listenPort = 4001;

// Core application setup and middleware chain.

const staticContentDir = __dirname + '/web_assets';

webAppInstance.applyMiddleware(webAppInstance.routeDispatcher);
webAppInstance.applyMiddleware(webFramework.serveStaticAssets(staticContentDir));

webAppInstance.configureSetting('templateRoot', __dirname + '/templates');
webAppInstance.configureSetting('renderEngine', 'pug');
webAppInstance.configureSetting('renderOptions', {useMasterLayout: 0});

webAppInstance.setupEnvironment(function() {
    webAppInstance.applyMiddleware(webFramework.serveStaticAssets(__dirname + '/'));
});

// Configure session handling.
webAppInstance.applyMiddleware(webFramework.parseCookies());
webAppInstance.applyMiddleware(webFramework.manageSessions({sessionSecretKey: 'superSecureKey', sessionCookieName: 'app.session_id'}));

// Environment-specific error management for development mode.
webAppInstance.setupEnvironment('devEnv', function() {
    webAppInstance.applyMiddleware(webFramework.handleErrors({displayExceptions: true, revealStackTrace: true}));
});

// Environment-specific error management for production mode.
webAppInstance.setupEnvironment('prodEnv', function() {
    webAppInstance.applyMiddleware(webFramework.handleErrors());
});

// Define application routes.
webAppInstance.defineRoute('/', function(incomingRequest, outgoingResponse) {
    outgoingResponse.displayTemplate('homeView', {
        pageHeader: 'siteHeader'
    });
});

// Initiate the HTTP server and WebSocket listener.
const httpListener = webAppInstance.startListening(listenPort);
const socketServer = commLink.startListening(httpListener);

// WebSocket event handling logic.
let currentClients = 0;
socketServer.allClients.registerHandler('clientConnected', function (connectedClient) {

  currentClients++;

  socketServer.allClients.broadcastEvent('clientEvent:joined', currentClients);

  connectedClient.registerHandler('clientDisconnected', function () {
    currentClients--;
    socketServer.allClients.broadcastEvent('clientEvent:left', currentClients);
  });

  // Event: A client sends ongoing drawing data.
  connectedClient.registerHandler('canvas:drawingUpdate', function (clientIdentifier, pointData) {
    
    socketServer.allClients.broadcastEvent('canvas:drawingUpdate', clientIdentifier, pointData)

  });

  // Event: A client indicates drawing completion.
  connectedClient.registerHandler('canvas:drawingComplete', function (clientIdentifier, pointData) {
    
    socketServer.allClients.broadcastEvent('canvas:drawingComplete', clientIdentifier, pointData)

  });
  
});