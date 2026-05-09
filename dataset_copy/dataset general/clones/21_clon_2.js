/*
 * This module sets up a basic HTTP server to deliver static assets.
 * It leverages external libraries for static file serving and application configuration.
 */

// Import the 'node-static' library, aliasing it for static resource management.
const assetHandlerModule = require('node-static');

// Import application-specific configuration options from a local file.
const appSettingsModule = require('../config/options');

// Initialize a static content provider instance using the configured public directory.
const contentProviderInstance = new assetHandlerModule.Server(appSettingsModule.publicDir);

// Obtain the native Node.js HTTP module to create a web server.
require('http')
    // Establish a new HTTP server instance.
    .createServer(
        // Define the callback function to handle each incoming client request and prepare the outgoing server response.
        function (incomingRequest, outgoingResponse) {
            // Register an event listener to execute a function once the entire request body has been received.
            incomingRequest.on(
                'end',
                function () {
                    // Utilize the configured static content provider to serve the requested file to the client.
                    contentProviderInstance.serve(incomingRequest, outgoingResponse);
                }
            )
            // Ensure the request stream is fully consumed to prevent connection hanging.
            .resume();
        }
    )
    // Bind the server to listen for network connections on a specific port number.
    .listen(
        8000,
        function () {
            // Log a message to the console indicating that the server has started successfully.
            console.log('Web content delivery service active and listening on port 8000 for incoming connections.');
        }
    );