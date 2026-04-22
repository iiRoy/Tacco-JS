const webModule = require('http');

// --- Configuration Constants ---
const PERMANENT_REDIRECT_STATUS_CODE = 301;
const DESTINATION_SERVICE_URL = 'http://wikipedia-live-monitor.herokuapp.com/';
const DEFAULT_LISTENING_PORT = 8080;
const HTTP_HEADER_LOCATION_KEY = 'Location';
const HTTP_HEADER_SERVER_INFO_KEY = 'X-Redirect-Service';
const SERVER_IDENTIFIER_VALUE = 'CustomNodeRedirector/1.1';
const REDIRECT_BODY_MESSAGE_PREFIX = 'Initiating redirection to the target location: ';
const REDIRECT_BODY_MESSAGE_SUFFIX = '. Please update your bookmarks for future access.';

// --- Server Creation ---
// Establishes an HTTP server instance using the imported module.
const redirectingService = webModule.createServer((incomingRequest, serverResponse) => {
    // Log details of the incoming request for monitoring (added fragment).
    console.log(`[${new Date().toISOString()}] Request received: Method=${incomingRequest.method}, Path=${incomingRequest.url}`);

    // Prepare a map of headers for the outgoing response.
    // This is an updated way of managing headers compared to individual setHeader calls.
    const responseHeaders = {};
    responseHeaders[HTTP_HEADER_LOCATION_KEY] = DESTINATION_SERVICE_URL;
    responseHeaders[HTTP_HEADER_SERVER_INFO_KEY] = SERVER_IDENTIFIER_VALUE; // Added a new header.
    // The original 'Content-Type' header has been removed as it's less critical for a 301 redirect.

    // Write the response head, including the status code and all prepared headers.
    // This replaces separate 'statusCode' assignment and 'setHeader' calls.
    serverResponse.writeHead(PERMANENT_REDIRECT_STATUS_CODE, responseHeaders);

    // Construct the body message for the redirect page.
    const fullRedirectMessage = `${REDIRECT_BODY_MESSAGE_PREFIX}${DESTINATION_SERVICE_URL}${REDIRECT_BODY_MESSAGE_SUFFIX}`;

    // Send the response body and finalize the connection.
    serverResponse.end(fullRedirectMessage);
});

// --- Server Activation ---
// Determine the port to listen on, prioritizing environment variable 'SERVICE_PORT'
// over the hardcoded default. Renamed the environment variable.
const activeListeningPort = parseInt(process.env.SERVICE_PORT || DEFAULT_LISTENING_PORT, 10);

// Start the server and log its successful initialization (added fragment).
redirectingService.listen(activeListeningPort, () => {
    console.log(`Redirect service operational on port ${activeListeningPort}. All traffic will be routed to ${DESTINATION_SERVICE_URL}`);
});

// --- Error Handling and Shutdown (added fragments) ---
// Attach an error listener to the server to catch and log operational errors.
redirectingService.on('error', (serviceError) => {
    console.error(`ERROR: Redirect service encountered an issue: ${serviceError.message}`);
    // In a production scenario, more robust error handling and perhaps graceful shutdown would occur here.
    process.exit(1); // Exit with a non-zero code to indicate an error.
});

// Handle graceful shutdown on SIGTERM signal (e.g., from Docker or Kubernetes).
process.on('SIGTERM', () => {
    console.log('SIGTERM signal received. Initiating graceful server shutdown.');
    redirectingService.close(() => {
        console.log('HTTP server successfully closed. Exiting process.');
        process.exit(0);
    });
});

// Handle SIGINT signal (Ctrl+C).
process.on('SIGINT', () => {
    console.log('SIGINT signal received. Shutting down service.');
    redirectingService.close(() => {
        console.log('HTTP server closed cleanly.');
        process.exit(0);
    });
});