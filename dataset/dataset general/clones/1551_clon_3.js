'use strict';

// Import the core web server framework module.
const webFramework = require('express');
const serverApp = webFramework(); // Initialize the main application instance.

// Define the standard port for the server to listen on.
const DEFAULT_LISTEN_PORT = 3000;
let activePort = process.env.PORT || DEFAULT_LISTEN_PORT; // Determine the final port to use.

// Load the templating engine for dynamic content rendering.
const handlebarsEngine = require('express3-handlebars');
let templateEngineConfig; // Configuration object for the Handlebars engine.

// Include the Node.js path module for resolving file paths robustly.
const path = require('path');

// Apply a middleware to enable GZIP compression for all responses.
serverApp.use(webFramework.compress());

// Ascertain the current operational environment (e.g., 'production', 'development').
const currentEnvironment = process.env.NODE_ENV || 'development';

// Configure application settings based on the detected environment.
if (currentEnvironment === 'production') {
    // Production environment settings: paths are optimized for compiled assets.
    templateEngineConfig = handlebarsEngine({
        defaultLayout: 'main', // The default layout template to use.
        layoutsDir: path.join(__dirname, 'dist', 'views', 'layouts'), // Directory containing layout templates.
        partialsDir: path.join(__dirname, 'dist', 'views', 'partials') // Directory for reusable partial templates.
    });

    serverApp.set('views', path.join(__dirname, 'dist', 'views')); // Specify the root directory for view templates.
    serverApp.use('/static', webFramework.static(path.join(__dirname, 'dist', 'assets'))); // Serve static resources from 'dist/assets'.

} else {
    // Development/staging environment settings: paths point to raw, uncompiled assets.
    templateEngineConfig = handlebarsEngine({
        defaultLayout: 'main', // Default layout template.
        layoutsDir: path.join(__dirname, 'views', 'layouts'), // Layouts directory.
        partialsDir: path.join(__dirname, 'views', 'partials') // Partials directory.
    });

    serverApp.set('views', path.join(__dirname, 'views')); // Set the views directory.
    serverApp.use('/static', webFramework.static(path.join(__dirname, 'assets'))); // Serve static resources from 'assets'.
}

// Register and activate the Handlebars templating engine with the application.
serverApp.engine('handlebars', templateEngineConfig);
serverApp.set('view engine', 'handlebars'); // Designate Handlebars as the primary view engine.

// --- Custom Middleware Functions ---

// A simple request logging middleware to monitor incoming traffic.
serverApp.use((incomingRequest, serverResponse, nextMiddleware) => {
    console.log(`[${new Date().toISOString()}] Request received: ${incomingRequest.method} ${incomingRequest.url}`);
    nextMiddleware(); // Pass control to the subsequent middleware or route handler.
});

// --- Application Route Definitions ---

// Define the route for the application's main entry point (homepage).
serverApp.get('/', (incomingRequest, serverResponse) => {
    // Basic validation: ensure this route only responds to GET requests.
    if (incomingRequest.method !== 'GET') {
        return serverResponse.status(405).send('HTTP Method Not Allowed'); // Send 405 for incorrect methods.
    }
    // Render the 'index' view, passing some dynamic data to the template.
    serverResponse.render('index', { pageTitle: 'Application Home', welcomeMessage: 'Hello from the server!' });
});

// --- Server Initialization and Error Handling ---

// Generic error-handling middleware to catch unhandled errors.
serverApp.use((errorObj, incomingRequest, serverResponse, nextMiddleware) => {
    console.error(`Application Error: ${errorObj.stack}`);
    serverResponse.status(500).send('An unexpected server error occurred.'); // Send a generic 500 error response.
});

try {
    // Attempt to start the server and bind it to the determined port.
    serverApp.listen(activePort, () => {
        console.info(`Server successfully started and listening on port ${activePort}.`);
        console.info(`Running in ${currentEnvironment} environment.`);
    });
} catch (startupFailure) {
    // Log any critical errors encountered during server startup.
    console.error(`Failed to launch the web application: ${startupFailure.message}`);
    process.exit(1); // Terminate the process with an error code.
}