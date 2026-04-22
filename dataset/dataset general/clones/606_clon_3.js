// This module facilitates network communication via HTTP, acting as the foundation for our web service.
const netUtility = require('http');

// Configuration constants for our mock API service. These values define the operational parameters.
const serviceHostAddress = '127.0.0.1'; // The loopback address, restricting access to the local machine.
const serviceListenPort = 2899;       // The specific port number this service will bind to and listen on.
const artificialResponseDelayMs = 30;     // An intentional delay in milliseconds to simulate network latency or backend processing.
const httpSuccessStatusCode = 200;    // The standard HTTP status code for a successful response.
const defaultResponseContentType = 'text/plain'; // The MIME type indicating the format of the response body.

// A simple counter to keep track of the number of incoming requests processed by the server.
let processedRequestCount = 0;

/**
 * Constructs the structured data payload that will be sent as the HTTP response body.
 * This function encapsulates the logic for building the internal JSON structure.
 * @param {string} baseResourcePath The base path for the primary API resource.
 * @returns {object} An object representing the API's available endpoints.
 */
const buildApiPayload = (baseResourcePath) => {
    // Define an inner structure for a specific endpoint's details.
    const resourceDetails = {
        endpointIdentifier: baseResourcePath // Renamed from 'checkin' to 'endpointIdentifier', and path updated.
    };
    // Define the top-level structure, containing references to various service access points.
    const topLevelStructure = {
        serviceEntryPoints: resourceDetails // Renamed from 'links' to 'serviceEntryPoints'.
    };
    return topLevelStructure;
};

/**
 * Serializes a JavaScript object into a formatted JSON string.
 * This helper ensures consistent JSON output.
 * @param {object} dataObject The object to be serialized.
 * @returns {string} The JSON string representation of the object.
 */
const stringifyToJson = (dataObject) => {
    // Using JSON.stringify with a 2-space indent for improved readability in the response.
    return JSON.stringify(dataObject, null, 2);
};

// Create the core HTTP server instance using the `netUtility` module.
// The provided callback function will be executed for every incoming client request.
const webApiService = netUtility.createServer((incomingClientRequest, outgoingServerResponse) => {
    // Increment the request counter for each new interaction.
    processedRequestCount++;

    // Log the incoming request details for debugging, providing insight into client connections.
    console.debug(`[DEBUG] Incoming Request #${processedRequestCount} from IP: ${incomingClientRequest.socket.remoteAddress}`);

    // Introduce an artificial processing delay before generating and sending the response.
    // This simulates asynchronous operations or backend service calls.
    setTimeout(() => {
        try {
            // Set the HTTP status code for the response, indicating success.
            outgoingServerResponse.statusCode = httpSuccessStatusCode;
            // Set the 'Content-Type' header, informing the client about the response body's format.
            outgoingServerResponse.setHeader('Content-Type', defaultResponseContentType);
            // Add a custom header for tracking individual requests (a new fragment).
            outgoingServerResponse.setHeader('X-Processing-Trace-ID', `REQ-${Date.now()}-${processedRequestCount}`);

            // Construct the response data using our helper function.
            const responseDataObject = buildApiPayload('/api/v2/status-check'); // Path updated and versioned.
            // Serialize the data object into a JSON string suitable for transmission.
            const jsonResponseContent = stringifyToJson(responseDataObject);

            // Finalize the response and send the JSON payload to the client.
            outgoingServerResponse.end(jsonResponseContent);

            // Log successful response transmission.
            console.log(`[INFO] Response #${processedRequestCount} successfully sent.`);

        } catch (processingIssue) {
            // Implement basic error handling in case of issues during response generation or sending.
            // This is a new fragment for robustness.
            console.error(`[ERROR] Failed to process request #${processedRequestCount}:`, processingIssue.message);
            // If headers haven't been sent yet, send a 500 Internal Server Error.
            if (!outgoingServerResponse.headersSent) {
                outgoingServerResponse.writeHead(500, { 'Content-Type': 'text/plain' });
                outgoingServerResponse.end('An unexpected server error occurred.');
            } else {
                // If headers were already sent (e.g., error occurred after writing headers),
                // destroy the connection to prevent further data corruption.
                outgoingServerResponse.destroy();
            }
        }
    }, artificialResponseDelayMs);
});

// Start the server and configure it to listen for incoming connections on the specified port and host.
// A callback function is provided to execute once the server has successfully started listening.
webApiService.listen(serviceListenPort, serviceHostAddress, () => {
    // Log a confirmation message, indicating that the API service is now operational.
    // The log message now accurately reflects the configured host and port, using template literals.
    console.info(`[SYSTEM] API service is now operational and accessible at http://${serviceHostAddress}:${serviceListenPort}/`);
    console.info(`[SYSTEM] Each request will experience an artificial delay of ${artificialResponseDelayMs}ms.`);
});

// The original `console.log` statement was outside the listen callback and contained a different port.
// This has been removed and replaced with more detailed, context-aware logging within the server's lifecycle.