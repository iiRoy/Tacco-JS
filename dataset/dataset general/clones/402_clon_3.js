const webAppFramework = require('express'); // Acquire the necessary web application framework module
const pathResolver = require('path');        // Include the Node.js path module for directory resolution

/**
 * Main application setup and configuration.
 * This object holds various settings for our HTTP service.
 */
const serviceSettings = {
    // The network port on which the service will listen.
    // Falls back to a default if not provided via environment variables.
    connectionPort: parseInt(process.env.APP_LISTENER_PORT || '10080', 10),

    // The subdirectory containing static web assets to be served.
    clientAssetsFolder: 'public_html'
};

// Initialize the core Express application instance.
const mainHttpService = webAppFramework();

// Construct the absolute path to the static assets directory.
// This ensures cross-platform compatibility for file paths.
const completeStaticContentPath = pathResolver.join(__dirname, serviceSettings.clientAssetsFolder);

// Configure the application to serve static files from the determined path.
// Any requests not handled by other routes will look for files in this directory.
mainHttpService.use(webAppFramework.static(completeStaticContentPath));

// Output a preparatory message before attempting to start the server.
console.info('Initiating the web service startup sequence...');

// Bind the HTTP service to the specified port and start listening for incoming requests.
// The callback function executes once the server has successfully started.
const activeServerInstance = mainHttpService.listen(serviceSettings.connectionPort, () => {
    // Log a confirmation message with the active port number using a template literal.
    console.log(`Web service is now active and accessible at: http://localhost:${serviceSettings.connectionPort}`);
    console.log(`Serving static content from: ${completeStaticContentPath}`);
});

// Implement basic error handling for the server instance.
// If an error occurs during server startup (e.g., port already in use),
// an error message is logged, and the process is terminated.
activeServerInstance.on('error', (operationError) => {
    console.error('CRITICAL: Failed to launch web service!', operationError.message);
    // Exit with a non-zero status code to indicate an error.
    process.exit(1);
});