const webFramework = require('express');
const httpUtility = require('http');
const realtimeComms = require('socket.io');
const cookieProcessor = require('cookie-parser');
const sessionManager = require('express-session');

// Centralized application settings
const serviceSettings = {
    listeningPort: process.env.PORT || 3000,
    baseDirectoryPath: __dirname,
    staticAssetPath: __dirname + '/public',
    sessionSecretKey: 'a-unique-and-cryptic-phrase-for-security',
    sessionIdentifier: 'app.session.id.token',
    defaultWebpageTitle: 'Interactive Canvas'
};

// Initialize the core web application
const applicationHost = webFramework();

// Create the underlying HTTP server instance
const webServiceHandle = httpUtility.createServer(applicationHost);

// Attach the real-time communication layer to the HTTP server
const commsGateway = realtimeComms(webServiceHandle);

// Setup middleware for request processing

// Cookie parsing for session management
applicationHost.use(cookieProcessor(serviceSettings.sessionSecretKey));

// Session handling configuration
applicationHost.use(sessionManager({
    secret: serviceSettings.sessionSecretKey,
    key: serviceSettings.sessionIdentifier,
    resave: false,
    saveUninitialized: false
}));

// Serve static content from the application's root directory
applicationHost.use(webFramework.static(serviceSettings.baseDirectoryPath));

// Serve additional static content from a dedicated 'public' folder
applicationHost.use(webFramework.static(serviceSettings.staticAssetPath));

// Define the routing middleware (explicitly, as in older Express versions)
applicationHost.use(applicationHost.router);

// Conditional error handling based on deployment environment
const deploymentEnvironment = process.env.NODE_ENV || 'development';
if (deploymentEnvironment === 'development') {
    applicationHost.use(webFramework.errorHandler({ dumpExceptions: true, showStack: true }));
} else {
    applicationHost.use(webFramework.errorHandler());
}

// Define the primary web route
applicationHost.get('/', (requestPayload, responseGenerator) => {
    // Directly send a basic HTML structure instead of using a templating engine
    responseGenerator.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${serviceSettings.defaultWebpageTitle}</title>
            <link rel="stylesheet" href="/style.css">
        </head>
        <body>
            <h1>Welcome to the ${serviceSettings.defaultWebpageTitle}</h1>
            <p>This is the main application interface.</p>
            <script src="/socket.io/socket.io.js"></script>
            <script>
                const clientSocket = io();
                clientSocket.on('connect', () => console.log('Client connected to real-time service.'));
                clientSocket.on('user:connect', (count) => console.log('Current active users:', count));
                clientSocket.on('user:disconnect', (count) => console.log('Current active users:', count));
                clientSocket.on('draw:progress', (id, coords) => console.log('Drawing progress from', id, coords));
                clientSocket.on('draw:end', (id, coords) => console.log('Drawing finished by', id, coords));
            </script>
        </body>
        </html>
    `);
});

// Start the HTTP server to listen for incoming requests
webServiceHandle.listen(serviceSettings.listeningPort, () => {
    console.log(`Application server running on port ${serviceSettings.listeningPort}`);
});

// Real-time communication management class
class LiveConnectionOverseer {
    constructor(gatewayInstance) {
        this.gateway = gatewayInstance;
        this.activePeerIdentifiers = new Set(); // Tracks unique client IDs
        this.initiateEventBinding();
    }

    initiateEventBinding() {
        this.gateway.of('/').on('connection', (clientSession) => this.handleClientArrival(clientSession));
    }

    handleClientArrival(clientSession) {
        this.activePeerIdentifiers.add(clientSession.id); // Add new client's unique ID
        this.notifyConnectionStatus('user:connect'); // Broadcast new connection count

        clientSession.on('disconnect', () => this.handleClientDeparture(clientSession));
        clientSession.on('draw:progress', (drawingIdentifier, strokeData) => this.forwardDrawingUpdate('draw:progress', drawingIdentifier, strokeData));
        clientSession.on('draw:end', (drawingIdentifier, strokeData) => this.forwardDrawingUpdate('draw:end', drawingIdentifier, strokeData));
    }

    handleClientDeparture(clientSession) {
        this.activePeerIdentifiers.delete(clientSession.id); // Remove client's unique ID
        this.notifyConnectionStatus('user:disconnect'); // Broadcast updated disconnection count
    }

    notifyConnectionStatus(statusEventName) {
        // Emit the current number of active connections to all clients
        this.gateway.of('/').emit(statusEventName, this.activePeerIdentifiers.size);
    }

    forwardDrawingUpdate(updateEventName, drawingIdentifier, strokeData) {
        // Re-emit drawing events to all connected clients
        this.gateway.of('/').emit(updateEventName, drawingIdentifier, strokeData);
    }
}

// Instantiate the real-time connection manager
new LiveConnectionOverseer(commsGateway);