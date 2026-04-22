const nodeHttp = require('node:http'); // Core module for HTTP server operations
const staticFileHandler = require('send'); // Third-party module for robust static file serving
const path = require('node:path'); // Core module for path manipulation utilities

// Define application configuration parameters
const processEnvironmentVariables = process.env;
const applicationServicePort = parseInt(processEnvironmentVariables.APP_SERVER_PORT || '8080', 10);
const rootPathRedirectTarget = '/demo/index.html';
const permanentRedirectHttpStatus = 301; // HTTP Status Code for Moved Permanently
const tusdServerHintEndpoint = 'http://localhost:1080/'; // External service dependency

// Initialize the HTTP server instance
const webApplicationServer = nodeHttp.createServer((incomingClientRequest, outgoingServerResponse) => {
    const requestedResourcePath = incomingClientRequest.url;
    const clientRequestMethod = incomingClientRequest.method;

    // --- Start of request processing logic ---

    // Guard clause: Filter out unsupported HTTP methods early
    if (clientRequestMethod !== 'GET' && clientRequestMethod !== 'HEAD') {
        outgoingServerResponse.writeHead(405, { 'Allow': 'GET, HEAD' });
        outgoingServerResponse.end('405 Method Not Allowed');
        console.warn(`[WARN] Received unsupported HTTP method '${clientRequestMethod}' for path: '${requestedResourcePath}'`);
        return; // Terminate request processing for unsupported methods
    }

    // Handle root URL redirection
    if (requestedResourcePath === '/') {
        outgoingServerResponse.writeHead(permanentRedirectHttpStatus, { 'Location': rootPathRedirectTarget });
        outgoingServerResponse.end(); // Complete the response for redirection
        console.info(`[INFO] Redirecting root path '/' to '${rootPathRedirectTarget}' (HTTP ${permanentRedirectHttpStatus})`);
        return; // Terminate request processing after redirection
    }

    // Determine the base directory for serving static content
    // path.resolve is used for robust resolution of absolute paths
    const contentStorageBaseDirectory = path.resolve(__dirname, '..');

    // Configure and initiate the static file delivery process
    const fileServingPipeline = staticFileHandler(incomingClientRequest, requestedResourcePath, {
        root: contentStorageBaseDirectory,
        cache: false,       // Disable caching for development/demonstration purposes
        maxAge: 0,          // Explicitly set max-age to 0
        immutable: false,   // Files are not considered immutable
        dotfiles: 'deny'    // Prevent serving files starting with a dot (e.g., .env, .git)
    });

    // Attach event listeners for the file serving pipeline
    fileServingPipeline.on('error', (processingError) => {
        console.error(`[ERROR] Static file serving failure for '${requestedResourcePath}': ${processingError.message}`);
        // Handle specific error types and send appropriate HTTP responses
        if (processingError.code === 'ENOENT') { // File or directory not found
            outgoingServerResponse.writeHead(404, { 'Content-Type': 'text/plain' });
            outgoingServerResponse.end('404 Resource Not Found');
        } else { // Other server-side errors
            outgoingServerResponse.writeHead(500, { 'Content-Type': 'text/plain' });
            outgoingServerResponse.end('500 Internal Server Error');
        }
    });

    fileServingPipeline.on('directory', () => {
        console.warn(`[WARN] Attempted to access a directory '${requestedResourcePath}'. Directory listing is forbidden.`);
        outgoingServerResponse.writeHead(403, { 'Content-Type': 'text/plain' });
        outgoingServerResponse.end('403 Forbidden: Directory Listing Not Allowed');
    });

    fileServingPipeline.on('file', (filePath, stat) => {
        // Log details about the file being served (optional, useful for debugging)
        console.debug(`[DEBUG] Serving file: '${filePath}', size: ${stat.size} bytes`);
        // The 'send' module automatically sets appropriate headers and status for success
    });

    fileServingPipeline.on('end', () => {
        // Log successful file serving completion
        console.log(`[ACCESS] Successfully served '${requestedResourcePath}'. HTTP Status: ${outgoingServerResponse.statusCode || 200}`);
    });

    // Pipe the file stream to the outgoing HTTP response
    fileServingPipeline.pipe(outgoingServerResponse);

    // --- End of request processing logic ---

});

// Start the HTTP server and listen on the configured port
webApplicationServer.listen(applicationServicePort, () => {
    console.log(`[SERVER] Demonstration web application now active on: http://localhost:${applicationServicePort}/`);
    console.log(`[HINT] To ensure full functionality, please verify that your TUSD server is running at: ${tusdServerHintEndpoint}`);
    console.info(`[INFO] Server initialization complete and listening for incoming connections.`);
});