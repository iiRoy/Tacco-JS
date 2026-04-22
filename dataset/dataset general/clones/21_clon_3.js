const assetManager = require('node-static'); // Import the dependency for serving static files
const applicationSettings = require('./configuration/server_config'); // Load application-specific settings

// Define the root directory from which static assets will be served
const contentRootDirectory = applicationSettings.publicPath || '.'; // Default to current directory if not specified

// Instantiate the static file server
// This instance will handle requests for static resources
const staticAssetServer = new assetManager.Server(contentRootDirectory, {
    cache: applicationSettings.cacheControlDuration || 3600 // Cache for 1 hour by default
});

const webServiceModule = require('http'); // Access the built-in HTTP module

// Determine the port on which the server will listen
const networkPort = applicationSettings.listenPort || 8080; // Use configured port or fallback to 8080

/**
 * Handles incoming client requests and serves static content.
 * @param {import('http').IncomingMessage} clientRequest - The incoming request object.
 * @param {import('http').ServerResponse} serverResponse - The outgoing response object.
 */
const handleClientConnection = (clientRequest, serverResponse) => {
    // Log the incoming request method and URL for debugging purposes
    console.log(`[${new Date().toISOString()}] Received request: ${clientRequest.method} ${clientRequest.url}`);

    // Basic validation: Only process GET requests for static content
    if (clientRequest.method !== 'GET' && clientRequest.method !== 'HEAD') {
        serverResponse.writeHead(405, { 'Content-Type': 'text/plain' });
        serverResponse.end('Method Not Allowed');
        console.warn(`[${new Date().toISOString()}] Blocked unsupported method: ${clientRequest.method}`);
        return; // Terminate early for unsupported methods
    }

    // Attempt to serve the requested file using the static asset server
    // The 'serve' method handles file existence, MIME types, and error conditions internally
    staticAssetServer.serve(clientRequest, serverResponse, (err) => {
        if (err) {
            // An error occurred during file serving (e.g., file not found, permission denied)
            console.error(`[${new Date().toISOString()}] Error serving ${clientRequest.url}: ${err.message}`);

            // Respond with an appropriate HTTP status code
            if (err.status === 404) {
                serverResponse.writeHead(404, { 'Content-Type': 'text/plain' });
                serverResponse.end('Resource Not Found');
            } else {
                // For other server-side errors
                serverResponse.writeHead(err.status || 500, { 'Content-Type': 'text/plain' });
                serverResponse.end('Internal Server Error');
            }
        }
    });
};

// Create the main HTTP server instance
// The callback function will be executed for every incoming request
const httpServerInstance = webServiceModule.createServer((clientRequest, serverResponse) => {
    // Ensure the request stream is fully consumed before processing
    // This prevents potential issues with pending data on the request stream
    clientRequest.on('end', () => {
        handleClientConnection(clientRequest, serverResponse);
    });
    clientRequest.resume(); // Explicitly call resume to start data flow if it was paused
});

// Start the server and bind it to the specified network port
httpServerInstance.listen(networkPort, () => {
    console.info(`[${new Date().toISOString()}] Static content server operational on port ${networkPort}`);
    console.info(`[${new Date().toISOString()}] Serving files from: ${contentRootDirectory}`);
});

// Optional: Handle server close events for graceful shutdown
httpServerInstance.on('close', () => {
    console.log(`[${new Date().toISOString()}] Server has been shut down.`);
});

// Add a simple error handler for the server itself
httpServerInstance.on('error', (err) => {
    console.error(`[${new Date().toISOString()}] Server encountered a critical error:`, err);
    process.exit(1); // Exit the process if a critical server error occurs
});