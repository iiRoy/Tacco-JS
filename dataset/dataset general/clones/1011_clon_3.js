const webFramework = require('express');
const utilityHelpers = require('util');
const fileSystem = require('fs');
const secureHttp = require("https");
const queryEncoder = require('querystring');

// --- Configuration Constants & Utilities ---

// Define external API host
const EXTERNAL_API_HOST = 'api.instagram.com';
// Template for constructing the media API path
const MEDIA_API_PATH_FORMAT = '/v1/geographies/%s/media/recent';

// Custom logger utility for consistent output
const applicationLogger = {
    info: (message, ...args) => console.log(`[INFO] ${utilityHelpers.format(message, ...args)}`),
    warn: (message, ...args) => console.warn(`[WARN] ${utilityHelpers.format(message, ...args)}`),
    error: (message, ...args) => console.error(`[ERROR] ${utilityHelpers.format(message, ...args)}`),
    debug: (message, ...args) => process.env.NODE_ENV === 'development' ? console.debug(`[DEBUG] ${utilityHelpers.format(message, ...args)}`) : null
};

// Helper function to safely read static file content
const retrieveStaticFile = (relativePath) => {
    try {
        const fullPath = `${__dirname}/${relativePath}`;
        // Verify file existence before attempting to read
        if (!fileSystem.existsSync(fullPath)) {
            applicationLogger.warn("Static file not found at path: %s", fullPath);
            return null;
        }
        return fileSystem.readFileSync(fullPath, 'utf8');
    } catch (readError) {
        applicationLogger.error("Failed to read static file '%s': %s", relativePath, readError.message);
        return null;
    }
};

// --- Application Initialization ---

// Create the main Express application instance
const serverApplication = webFramework();
// Determine the server's listening port from environment or default to 3000
const listeningPort = parseInt(process.env.APP_SERVER_PORT || '3000', 10);

// Initialize Socket.IO with the Express server
const webSocketServer = require('socket.io')(serverApplication);

// Configure Socket.IO logging behavior
// For newer Socket.IO versions, 'log level' is deprecated.
// We'll rely on our custom logger for specific events or default quietness.
webSocketServer.engine.on('connection_error', (err) => {
    applicationLogger.warn("Socket.IO client connection issue: %s", err.message);
});
webSocketServer.on('connect', (clientSocket) => {
    applicationLogger.debug("A new client connected via WebSocket with ID: %s", clientSocket.id);
});

// --- Middleware Configuration ---

// Enable parsing of JSON request bodies
serverApplication.use(webFramework.json());
// Enable parsing of URL-encoded request bodies
serverApplication.use(webFramework.urlencoded({ extended: true }));

// --- Route Definitions ---

// GET endpoint for the application's main stylesheet
// Serves the CSS file located in public/stylesheets/style.css
serverApplication.get('/style.css', (requestContext, responseHandler) => {
    const cssContent = retrieveStaticFile('public/stylesheets/style.css');
    if (cssContent) {
        responseHandler.status(200).type('text/css').send(cssContent);
    } else {
        responseHandler.status(500).send('/* Server Error: Stylesheet unavailable */');
    }
});

// GET endpoint for the main application page
// Delivers the primary HTML file, index.html
serverApplication.get('/', (requestContext, responseHandler) => {
    const mainHtmlContent = retrieveStaticFile('./index.html');
    if (mainHtmlContent) {
        responseHandler.status(200).type('text/html').send(mainHtmlContent);
    } else {
        responseHandler.status(500).send('<!DOCTYPE html><html><body><h1>Application Unavailable</h1><p>Main content could not be loaded.</p></body></html>');
    }
});

// GET endpoint for webhook subscription challenge validation
// Used by external services (e.g., Instagram) to verify callback URL ownership
serverApplication.get('/callback', (requestContext, responseHandler) => {
    // Check for 'hub.challenge' parameter from the query string
    const challengeValue = requestContext.query['hub.challenge'];

    if (challengeValue) {
        applicationLogger.info("Received subscription challenge: %s", challengeValue);
        responseHandler.status(200).send(challengeValue); // Respond with the challenge value
    } else {
        // Log an error if the required parameter is missing
        applicationLogger.error("Error: 'hub.challenge' parameter was not found in GET /callback. Request query: %j", requestContext.query);
        responseHandler.status(400).send("Bad Request: Missing 'hub.challenge' for verification.");
    }
});

// POST endpoint for receiving webhook notifications
// Processes incoming data updates from subscribed services (e.g., Instagram photo updates)
serverApplication.post('/callback', (requestContext, responseHandler) => {
    const notificationPayload = requestContext.body;

    // Basic validation: ensure the payload is an array of notifications
    if (!Array.isArray(notificationPayload) || notificationPayload.length === 0) {
        applicationLogger.warn("Received an invalid or empty POST payload on /callback: %j", notificationPayload);
        return responseHandler.status(400).send("Invalid Request: Expected an array of notification objects.");
    }

    // Iterate through each notification object in the payload
    notificationPayload.forEach(async (updateEntry) => {
        // Validate each individual notification for required fields
        if (!updateEntry || !updateEntry.object_id) {
            applicationLogger.warn("Skipping malformed notification entry (missing 'object_id'): %j", updateEntry);
            return; // Move to the next entry
        }

        const geographyId = updateEntry.object_id;
        const instagramAppClientKey = process.env.INSTAGRAM_CLIENT_SECRET; // Renamed env var

        // Ensure the client key is configured before making API calls
        if (!instagramAppClientKey) {
            applicationLogger.error("Environment variable 'INSTAGRAM_CLIENT_SECRET' is not set. Cannot fetch media for geography ID: %s", geographyId);
            return;
        }

        // Construct the query string for the Instagram API request
        const apiQueryParams = queryEncoder.stringify({
            client_id: instagramAppClientKey,
            count: 1 // Request only the most recent item
        });

        // Assemble the full API path using the geography ID and query parameters
        const fullApiPath = utilityHelpers.format(MEDIA_API_PATH_FORMAT, geographyId) + '?' + apiQueryParams;

        // Execute an HTTPS GET request to the Instagram API
        secureHttp.get({
            host: EXTERNAL_API_HOST,
            path: fullApiPath,
            headers: {
                'User-Agent': 'NodeJS-Webhook-Processor/1.1', // Custom User-Agent
                'Accept': 'application/json' // Request JSON response
            }
        }, (apiResponseStream) => {
            let receivedDataBuffer = '';

            // Accumulate data chunks as they arrive from the API
            apiResponseStream.on('data', (dataChunk) => {
                receivedDataBuffer += dataChunk;
            });

            // Process the complete API response when streaming ends
            apiResponseStream.on('end', () => {
                let parsedApiData;
                try {
                    parsedApiData = JSON.parse(receivedDataBuffer);
                } catch (jsonParseError) {
                    applicationLogger.error("Failed to parse JSON from Instagram API for geography %s: %s. Raw data (first 100 chars): %s", geographyId, jsonParseError.message, receivedDataBuffer.substring(0, 100));
                    return; // Stop processing if JSON is invalid
                }

                const mediaItemsArray = parsedApiData.data;
                // Validate if there's data, at least one item, and if it has location info
                const hasValidMediaWithLocation = Array.isArray(mediaItemsArray) &&
                                                  mediaItemsArray.length > 0 &&
                                                  mediaItemsArray[0].location !== null;

                if (hasValidMediaWithLocation) {
                    applicationLogger.debug("New media detected with location for geography %s. Emitting to clients.", geographyId);
                    // Emit the raw JSON data to all connected WebSocket clients under a new event name
                    webSocketServer.sockets.emit('mediaUpdateEvent', receivedDataBuffer);
                } else {
                    const errorMeta = parsedApiData.meta || { type: 'Unknown Error', message: 'No specific meta information.' };
                    applicationLogger.warn("No valid media or location information found for geography %s. API Meta details: %j", geographyId, errorMeta);
                }
            });

            // Handle errors during the API response stream
            apiResponseStream.on('error', (streamError) => {
                applicationLogger.error("Error receiving API response for geography %s: %s", geographyId, streamError.message);
            });
        }).on('error', (requestError) => {
            // Handle errors occurring during the HTTPS request setup or connection
            applicationLogger.error("HTTPS request failure to %s for geography %s: %s", EXTERNAL_API_HOST, geographyId, requestError.message);
        });
    });

    // Acknowledge receipt of the POST notification to the sender immediately
    responseHandler.status(200).end();
});

// --- Error Handling / Catch-all Route ---

// Middleware for handling requests to undefined routes (404 Not Found)
serverApplication.use((requestContext, responseHandler) => {
    applicationLogger.warn("Unhandled request received: %s %s", requestContext.method, requestContext.originalUrl);
    responseHandler.status(404).send("Error 404: The requested resource could not be found.");
});

// --- Server Startup ---

// Start the Express server and begin listening for connections
try {
    serverApplication.listen(listeningPort, () => {
        applicationLogger.info("Application server successfully launched and is listening on TCP port %d.", listeningPort);
        applicationLogger.info("Access the service locally via: http://localhost:%d", listeningPort);
        // Additional startup checks or environment variable logging could be added here
    });
} catch (startupFailure) {
    applicationLogger.error("Critical error: Failed to start the application server: %s", startupFailure.message);
    process.exit(1); // Exit the process with an error code if the server cannot start
}