const webFramework = require('express');
const resourceLocator = require('path');
const reqLogger = require('morgan');
const cookieHandler = require('cookie-parser');
const payloadParser = require('body-parser');

// Module for database interaction, utilizing a wrapper for MongoDB operations.
const dbWrapper = require('monk');

// --- Configuration Settings ---
// Establish core application configuration, potentially sourcing from environment variables.
const appConfiguration = {
    database: {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || '27017',
        name: process.env.DB_NAME || 'nodetest1_dev'
    },
    viewEngine: 'jade',
    viewsDirectoryName: 'views',
    appPort: process.env.PORT || 3000 // Added a port configuration
};

// Construct the database connection string using the configuration.
const databaseConnectionUri = `${appConfiguration.database.host}:${appConfiguration.database.port}/${appConfiguration.database.name}`;
const databaseConnection = dbWrapper(databaseConnectionUri);

// Define application route modules.
const mainEntryRoutes = require('./routes/index');
const userManagementRoutes = require('./routes/users');

// Initialize the primary web application instance.
const serverApplicationInstance = webFramework();

// --- Application Setup and Middleware Configuration ---

// Set the directory for template files.
const templatePath = resourceLocator.join(__dirname, appConfiguration.viewsDirectoryName);
serverApplicationInstance.set('views', templatePath);

// Configure the templating engine to be used for rendering responses.
serverApplicationInstance.set('view engine', appConfiguration.viewEngine);

// --- Core Middleware Stack ---

// Custom general request logger for initial processing.
serverApplicationInstance.use((clientRequest, serverResponse, nextMiddleware) => {
    console.log(`[APP_ACTIVITY] Incoming request: ${clientRequest.method} ${clientRequest.url}`);
    nextMiddleware(); // Pass control to the next middleware.
});

// HTTP request logging utility, configured for a detailed output format.
serverApplicationInstance.use(reqLogger('dev'));

// Middleware to parse incoming JSON request bodies.
serverApplicationInstance.use(payloadParser.json());

// Middleware to parse URL-encoded request bodies, allowing for rich objects and arrays.
serverApplicationInstance.use(payloadParser.urlencoded({ extended: true }));

// Middleware to parse and attach cookies to the request object.
serverApplicationInstance.use(cookieHandler());

// Serve static assets (like CSS, JavaScript, images) from the 'public' directory.
const staticAssetsPath = resourceLocator.join(__dirname, 'public');
serverApplicationInstance.use(webFramework.static(staticAssetsPath));

// --- Custom Middleware for Database Access ---
// This middleware makes the database connection object available to subsequent route handlers.
serverApplicationInstance.use((clientRequest, serverResponse, nextMiddleware) => {
    // Check if the database connection is established before attaching it.
    if (databaseConnection) {
        clientRequest.db = databaseConnection;
        console.log(`[DB_ACCESS] Database connection attached for request to ${clientRequest.path}`);
    } else {
        console.error('[DB_ERROR] Database connection is not available!');
        // Optionally, handle this more gracefully, e.g., send a 500 error.
    }
    nextMiddleware(); // Proceed to the next middleware or route handler.
});

// --- Route Definitions ---
// Mount the main application routes.
serverApplicationInstance.use('/', mainEntryRoutes);

// Mount the user-specific routes under the '/users' path.
serverApplicationInstance.use('/users', userManagementRoutes);

// --- Error Handling Middleware ---

// Catch 404 Not Found errors and forward them to the error handler.
serverApplicationInstance.use((clientRequest, serverResponse, nextMiddleware) => {
    const notFoundMessage = 'Resource Not Found on Server';
    const clientError = new Error(notFoundMessage);
    clientError.status = 404;
    console.warn(`[HTTP_404] ${clientRequest.method} ${clientRequest.url} - ${notFoundMessage}`);
    nextMiddleware(clientError);
});

// Determine the current operating environment (e.g., 'development', 'production').
const currentEnvironment = serverApplicationInstance.get('env');

// --- Development Error Handler ---
// This handler will print detailed stacktraces during development.
if (currentEnvironment === 'development') {
    serverApplicationInstance.use((errorObject, clientRequest, serverResponse, nextMiddleware) => {
        // Ensure errorObject exists before accessing properties.
        if (!errorObject) {
            errorObject = new Error('An unknown error occurred.');
            errorObject.status = 500;
        }

        console.error(`[DEV_ERROR] ${errorObject.status || 500} - ${errorObject.message}`);
        console.error(errorObject.stack); // Log the full stack trace in development.

        serverResponse.status(errorObject.status || 500);
        serverResponse.render('error', {
            message: errorObject.message,
            error: errorObject // Pass the full error object for debugging.
        });
    });
}

// --- Production Error Handler ---
// This handler provides a more generic error response in production,
// preventing sensitive stacktrace information from being leaked to users.
serverApplicationInstance.use((errorObject, clientRequest, serverResponse, nextMiddleware) => {
    // Ensure errorObject exists.
    if (!errorObject) {
        errorObject = new Error('An unexpected server issue occurred.');
        errorObject.status = 500;
    }

    console.error(`[PROD_ERROR] ${errorObject.status || 500} - ${errorObject.message}`);
    // In production, you might log the stack trace to a file or an error tracking service.

    serverResponse.status(errorObject.status || 500);
    serverResponse.render('error', {
        message: errorObject.message,
        error: {} // Empty error object for security in production.
    });
});

// Export the configured Express application instance for external use (e.g., by bin/www).
module.exports = serverApplicationInstance;