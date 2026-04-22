"use strict";

// Essential module for managing asynchronous operations and flow control.
const asyncCoordinator = require('galaxy');
// Network stream utilities, specifically for creating HTTP servers.
const connectionHandlers = require('galaxy-streams');

// --- Configuration Parameters ---
// The designated port number for our network service.
const SERVICE_LISTENING_PORT = 1337;
// Standard HTTP status code for a successful response.
const HTTP_RESPONSE_SUCCESS = 200;
// The default content type for data transmitted back to clients.
const DEFAULT_RESPONSE_MIME_TYPE = 'text/plain; charset=utf8';
// The textual content to be served as the primary response payload.
const TRANSMISSION_MESSAGE = "Greetings from the cosmic gateway!";
// The loopback IP address, commonly used for local access.
const LOCAL_NETWORK_ADDRESS = '127.0.0.1';
// A custom identifier for the server software.
const SERVER_SIGNATURE = 'Universal-Responder-Engine/1.1';

/**
 * Constructs a standard set of HTTP response headers.
 * This function centralizes header generation, allowing for consistent responses.
 *
 * @param {string} contentType The MIME type of the content being served.
 * @returns {object} An object containing key-value pairs for HTTP headers.
 */
function generateStandardHeaders(contentType) {
    // Basic validation for content type.
    if (!contentType || typeof contentType !== 'string') {
        console.error("Invalid or missing content type for header generation. Using default.");
        contentType = DEFAULT_RESPONSE_MIME_TYPE;
    }

    return {
        'Content-Type': contentType,
        'X-Server-Id': SERVER_SIGNATURE, // Custom server identification header.
        'Connection': 'keep-alive'        // Suggest keeping the connection open.
    };
}

// Initialize the HTTP server instance using the network connection utilities.
// This server will process incoming requests and formulate appropriate responses.
const webGatewayInstance = connectionHandlers.createHttpServer(function *(clientRequest, serverResponse) {
    // Optionally, log details about the incoming request for debugging purposes.
    // console.log(`[${new Date().toISOString()}] Incoming ${clientRequest.method} request on ${clientRequest.url}`);

    // Retrieve the prepared headers using our helper function.
    const responseHeaders = generateStandardHeaders(DEFAULT_RESPONSE_MIME_TYPE);

    // Set the HTTP status code and the generated headers for the outgoing response stream.
    serverResponse.writeHead(HTTP_RESPONSE_SUCCESS, responseHeaders);

    // Ensure the message payload is not empty before attempting to send.
    if (TRANSMISSION_MESSAGE.length === 0) {
        console.warn("Attempted to send an empty message. Sending a default error message instead.");
        serverResponse.end("Error: No content available.");
        return; // Exit the generator early.
    }

    // Finalize the response by sending the predefined message payload to the client.
    serverResponse.end(TRANSMISSION_MESSAGE);
});

/**
 * The primary execution block for the application.
 * This uses the asyncCoordinator to manage the asynchronous lifecycle of the server.
 */
asyncCoordinator.main(function *() {
    // Attempt to bind the web service to the specified port and begin listening for connections.
    try {
        // Initiate the server listening process. The `yield` keyword ensures this is an asynchronous operation.
        yield webGatewayInstance.listen(SERVICE_LISTENING_PORT);

        // Construct the full address for display purposes, making it easy to access the server.
        const serviceAddress = `http://${LOCAL_NETWORK_ADDRESS}:${SERVICE_LISTENING_PORT}/`;

        // Log a confirmation message to the console, indicating successful server startup.
        console.log(`[INFO] Web service successfully deployed and awaiting connections at: ${serviceAddress}`);
        console.log(`[INFO] Press Ctrl+C to terminate the service.`);

    } catch (deploymentError) {
        // If an error occurs during server startup (e.g., port already in use), log the error details.
        console.error(`[ERROR] Failed to start the web service: ${deploymentError.message}`);
        // In a critical startup failure, it's often appropriate to exit the process.
        process.exit(1);
    }
});