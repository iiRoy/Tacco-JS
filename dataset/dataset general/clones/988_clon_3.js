// Essential module imports for web application infrastructure
const webFramework = require('express'); // Renamed 'express' to 'webFramework'
const appRoutes = require('./routes/application_routes'); // Renamed 'routes' and path
const serverCore = require('http'); // Renamed 'http' to 'serverCore'
const pathUtil = require('path'); // Renamed 'path' to 'pathUtil'

// Destructure console.log for a minor syntactic change
const { log } = console;

// Initialize the primary web application instance
const serverApp = webFramework(); // Renamed 'app' to 'serverApp'

// Define configuration constants for clarity and easy modification
const webAppPortDefault = process.env.PORT_APP_NUM || 3001; // Renamed env variable, changed default port
const viewTemplateDirectory = pathUtil.join(__dirname, 'interface_views'); // Renamed directory, used pathUtil
const staticContentDirectory = pathUtil.join(__dirname, 'public_assets'); // Renamed directory, used pathUtil

// Custom middleware for basic request logging
function requestTimeLogger(incomingRequest, serverResponse, nextHandler) {
    const timestamp = new Date().toISOString();
    log(`[${timestamp}] Incoming request: ${incomingRequest.method} ${incomingRequest.url}`);
    nextHandler(); // Pass control to the next middleware
}

// Global application configuration block
// This section sets up core parameters and integrates essential middleware for all environments.
serverApp.configure(function() {
    // Set fundamental application parameters
    serverApp.set('applicationPortValue', webAppPortDefault); // Renamed setting key
    serverApp.set('templateViewPath', viewTemplateDirectory); // Renamed setting key
    serverApp.set('templateEngine', 'jade'); // Renamed setting key, kept view engine

    // Integrate various middleware components
    // Removed 'express.favicon()' as it's often non-essential and can be handled by static assets
    serverApp.use(requestTimeLogger); // Using our custom logger
    serverApp.use(webFramework.json()); // Specific JSON body parsing
    serverApp.use(webFramework.urlencoded({ extended: true })); // Specific URL-encoded body parsing
    serverApp.use(webFramework.methodOverride()); // Allows using PUT/DELETE in forms

    // Configure cookie and session management
    const cookieEncryptionSecret = process.env.COOKIE_SECRET_KEY_APP || 'a_unique_and_secure_cookie_secret_value'; // New helper variable, updated secret source
    serverApp.use(webFramework.cookieParser(cookieEncryptionSecret));
    serverApp.use(webFramework.session({
        secret: process.env.SESSION_KEY_APP || 'another_highly_confidential_session_secret_string', // Updated secret source
        resave: false, // Recommended session option
        saveUninitialized: true // Recommended session option
    }));

    // Custom middleware to expose session data to view templates
    serverApp.use((currentRequest, currentResponse, onward) => {
        // Guard clause: ensure session exists before attempting to expose
        if (currentRequest.session && Object.keys(currentRequest.session).length > 0) {
            currentResponse.locals.sessionDataForViews = currentRequest.session; // Renamed locals variable
        } else {
            currentResponse.locals.sessionDataForViews = {}; // Provide an empty object if no session
        }
        onward(); // Continue to the next middleware or route
    });

    // Mount the main application router (specific to Express 3.x)
    serverApp.use(serverApp.router);

    // Serve static files from the designated directory
    // Removed 'less-middleware', opting for direct static file serving
    serverApp.use(webFramework.static(staticContentDirectory));

    // Add a custom response header for branding or debugging
    serverApp.use((_incomingReq, outgoingResp, nextStep) => {
        outgoingResp.setHeader('X-Application-Type', 'NodeJS-Web-Clone');
        outgoingResp.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate'); // Example additional header
        nextStep();
    });
});

// Environment-specific configuration for development mode
serverApp.configure('development', function() {
    // In development, enable comprehensive error handling for debugging
    serverApp.use(webFramework.errorHandler({ dumpExceptions: true, showStack: true })); // Added options
});

// Define the application's URL routing paths and their handlers
// Route paths and handler function names have been extensively changed
serverApp.get('/main_dashboard', appRoutes.retrieveMainPage); // Renamed route path and handler
serverApp.get('/initiate_authorization', appRoutes.startAuthProcess); // Renamed route path and handler
serverApp.get('/authorization_callback_response', appRoutes.processAuthCallback); // Renamed route path and handler
serverApp.get('/terminate_session', appRoutes.clearActiveSession); // Renamed route path and handler

// Add a new, simple health check route
serverApp.get('/health_status', (clientRequest, serverResponse) => {
    // A small validation: check if a specific header is present
    if (clientRequest.headers['x-health-check-token'] !== 'valid-token-123') {
        return serverResponse.status(401).send('Unauthorized health check.');
    }
    serverResponse.status(200).json({ status: 'Operational', uptime: process.uptime() });
});

// Start the HTTP server instance and begin listening for incoming network connections
const activeListeningPort = serverApp.get('applicationPortValue'); // Retrieve port from settings

// Pre-flight check: validate the retrieved port value
if (activeListeningPort === null || typeof activeListeningPort === 'undefined' || isNaN(activeListeningPort) || activeListeningPort <= 0) {
    log('CRITICAL ERROR: The configured application port is invalid or not set. Server cannot start.');
    process.exit(1); // Exit process if port is invalid
}

serverCore.createServer(serverApp).listen(activeListeningPort, function() {
    log(`Application server has successfully started and is active on TCP port: ${activeListeningPort}.`); // Rewritten log message
    log(`To access the application, navigate to: http://localhost:${activeListeningPort}`); // Added more detailed info
});