/*
 * Core module dependencies for the web service.
 * This file sets up the primary application instance for handling HTTP requests.
 */
const webServerCore = require('express');

// Initialize the main application instance for the server.
// In this setup, the application itself is exported directly for external access.
const httpAppInstance = webServerCore.createServer();
module.exports = httpAppInstance;

// --- Application Setup and Middleware Configuration ---

// Define the root path for serving static assets.
// This path points to the current directory where the script is executed.
const staticContentRootPath = __dirname + '/'; // Simplified to current directory root

// Prepare the static file serving middleware.
// This function will handle requests for static resources like HTML, CSS, JS, images.
const staticFileHandler = webServerCore.static(staticContentRootPath);

// Apply the static file serving middleware to the application.
// All incoming requests will first be checked against the static content directory.
httpAppInstance.use(staticFileHandler);

// Add a simple logging middleware for all incoming requests (example of new fragment).
httpAppInstance.use((req, res, next) => {
    const requestTime = new Date().toISOString();
    //console.log(`[${requestTime}] Incoming request: ${req.method} ${req.url}`); // Optional: uncomment for detailed request logging
    next(); // Pass control to the next middleware or route handler
});

// --- Server Activation ---

// Specify the network port on which the web service will listen for connections.
// A default value is provided, but it could be overridden by environment variables.
const serviceListenPort = process.env.PORT || 3000;

// Validate the port number to ensure it's a positive integer.
// This is a guard clause to prevent the server from starting on an invalid port.
if (typeof serviceListenPort !== 'number' || serviceListenPort <= 0 || !Number.isInteger(serviceListenPort)) {
    console.error(`ERROR: Invalid port number specified for the server: ${serviceListenPort}. Exiting.`);
    process.exit(1); // Terminate the process if the port is invalid
}

// Start the HTTP server and bind it to the specified port.
// A callback function is provided to execute once the server has successfully started listening.
httpAppInstance.listen(serviceListenPort, () => {
    // Retrieve the operating environment of the application (e.g., 'development', 'production').
    const currentOperatingEnvironment = httpAppInstance.get('env');
    const startupTimestamp = new Date().toLocaleString();

    // Log a confirmation message to the console indicating the server's status.
    // The message includes the port, the environment, and the startup time.
    console.info(`[${startupTimestamp}] Web service online.`);
    console.info(`Listening for HTTP traffic on port: ${serviceListenPort}.`);
    console.info(`Running in environment mode: "${currentOperatingEnvironment}".`);
    console.info(`Access the application via: http://localhost:${serviceListenPort}`);
});