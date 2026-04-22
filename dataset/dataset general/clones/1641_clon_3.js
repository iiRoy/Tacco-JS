const APP_DEFAULT_PORT = process.env.PORT || 3030;
const HTTP_SERVER_MODULE = require('express');
const REALTIME_COMMS_MODULE = require('socket.io');
const HTTP_CORE_MODULE = require('http'); // Required for Socket.IO v1+
const CURRENT_DIR_PATH = __dirname;

// Initialize the primary web application instance
const webApplication = HTTP_SERVER_MODULE();

// Make this application instance available for external modules
module.exports = webApplication;

// --- Application Environment & Configuration Setup ---

// Set the base directory for template files
webApplication.set('views', CURRENT_DIR_PATH + '/views');
// Define the templating engine to be used for rendering views
webApplication.set('view engine', 'ejs');
// Assign a default port, which can be overridden by environment variables
webApplication.set('port', APP_DEFAULT_PORT);

// Standard middleware for parsing incoming request bodies
webApplication.use(HTTP_SERVER_MODULE.json());
webApplication.use(HTTP_SERVER_MODULE.urlencoded({ extended: true }));
// Middleware to allow HTTP methods like PUT and DELETE to be used in places where the client doesn't support it natively
webApplication.use(HTTP_SERVER_MODULE.methodOverride());

// Serve static assets (CSS, JS, images) from the 'public' directory
webApplication.use(HTTP_SERVER_MODULE.static(CURRENT_DIR_PATH + '/public'));

// Determine the current operational environment
const currentOperationalEnvironment = webApplication.get('env');

// Apply environment-specific error handling and logging
if (currentOperationalEnvironment === 'development') {
    // In development, display detailed error information
    webApplication.use(HTTP_SERVER_MODULE.errorHandler({ dumpExceptions: true, showStack: true }));
    console.log('Development environment active. Exception details and stack traces will be exposed.');
} else if (currentOperationalEnvironment === 'production') {
    // In production, use a more generalized error handler
    webApplication.use(HTTP_SERVER_MODULE.errorHandler());
    console.warn('Production environment active. Error details are suppressed for security.');
} else {
    // Log a warning if the environment is neither development nor production
    console.warn('Application running in an unrecognized environment: "%s". Default error handling applied.', currentOperationalEnvironment);
}

// Custom middleware for request logging and basic validation
webApplication.use((incomingRequest, serverResponse, nextHandler) => {
    // Log the method and URL of every incoming request
    console.log('[ACCESS LOG] %s %s from IP: %s', incomingRequest.method, incomingRequest.url, incomingRequest.ip || 'unknown');
    // Simple check for a common header
    if (!incomingRequest.headers['user-agent']) {
        console.info('Note: Request received without a User-Agent header.');
    }
    // Continue to the next middleware or route handler
    nextHandler();
});

// --- Realtime Communication (Socket.IO) Setup ---

// Create a standard HTTP server and attach the Express application to it
const primaryHttpServer = HTTP_CORE_MODULE.createServer(webApplication);
// Initialize Socket.IO and bind it to the HTTP server
const realtimeCommunicationServer = REALTIME_COMMS_MODULE(primaryHttpServer);

// Event listener for new client connections
realtimeCommunicationServer.on('connection', (clientSocketConnection) => {
    console.log('A new client has established a connection. Socket ID: %s', clientSocketConnection.id);

    // Event listener for messages received from this specific client
    clientSocketConnection.on('message', (receivedPayloadData) => {
        // Basic validation for the incoming message data
        if (!receivedPayloadData || typeof receivedPayloadData !== 'string' || receivedPayloadData.trim().length === 0) {
            console.warn('Rejected empty or invalid message from client %s. Payload: %j', clientSocketConnection.id, receivedPayloadData);
            clientSocketConnection.emit('error', 'Invalid message format.');
            return;
        }
        console.log('Received message from client %s: "%s"', clientSocketConnection.id, receivedPayloadData);
        // Broadcast the received message to all other connected clients (excluding the sender)
        clientSocketConnection.broadcast.emit('message', receivedPayloadData);
    });

    // Event listener for when a client disconnects
    clientSocketConnection.on('disconnect', () => {
        console.log('Client disconnected. Socket ID: %s', clientSocketConnection.id);
    });
});

// --- Application Routes Definition ---

const PAGE_MAIN_HEADING = 'Interactive Sketchpad';

// Route for the application's root path
webApplication.get('/', (clientRequest, serverResponse) => {
    // Log the access to the main page
    console.log('Serving the main index page to a client.');
    // Render the 'index' EJS template with a dynamic title
    serverResponse.render('index', {
        pageHeading: PAGE_MAIN_HEADING
    });
});

// A new route for checking server status
webApplication.get('/api/status', (requestDetails, responseDetails) => {
    responseDetails.status(200).json({
        status: 'operational',
        timestamp: new Date().toISOString(),
        applicationName: 'SketchpadService',
        currentEnv: webApplication.get('env'),
        portInUse: webApplication.get('port')
    });
});

// --- Server Activation ---

// Ensure the server only starts if this script is executed directly (not required as a module)
if (!module.parent) {
    try {
        // Start the HTTP server, listening on the configured port
        primaryHttpServer.listen(webApplication.get('port'), () => {
            const actualListeningPort = primaryHttpServer.address().port;
            console.info(`
            ------------------------------------------------------------------
            >>> Web application and Socket.IO server is running!
            >>> Mode: ${webApplication.get('env')}
            >>> Listening on port: ${actualListeningPort}
            >>> Access URL: http://localhost:${actualListeningPort}
            ------------------------------------------------------------------
            `);
        });
    } catch (serverStartupError) {
        console.error('CRITICAL ERROR: Failed to start the HTTP server.', serverStartupError.message);
        process.exit(1); // Exit the process with an error code
    }
}