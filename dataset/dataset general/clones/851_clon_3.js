// This module serves as a robust client for establishing and managing multiple WebSocket connections.
// It leverages the 'ws' library for WebSocket protocol handling and 'npmlog' for structured logging.

// Importing essential external modules for operation.
const ClientSocket = require('ws'); // The WebSocket client library, aliased for clarity.
const appLogger = require('npmlog'); // A custom logging utility, aliased for application-wide use.

// --- Global Configuration ---
// Setting the logging level to 'silly' for maximum detail in output.
appLogger.level = 'silly';

// --- State Variables ---
// An array to maintain references to all currently active or pending WebSocket instances.
const activeConnections = [];

// Defines the maximum permissible number of concurrent connection attempts.
const CONNECTION_CAP = 400; // Adjusted from original, made constant for better maintainability.

// A counter to keep track of the total number of connection initiation attempts.
let attemptCounter = 0;

// The uniform resource locator (URL) for the target WebSocket service endpoint.
const SERVICE_ENDPOINT_URL = 'ws://localhost:5000/matchesfeed/1/matchcentre'; // Explicitly using 'ws://' protocol.

// The delay period in milliseconds before initiating the next connection attempt.
const RECONNECTION_DELAY_MS = 600; // Modified from the original 500ms.

/**
 * Orchestrates the process of establishing a new WebSocket connection.
 * This function includes logic for incremental connection attempts, event listener setup,
 * and recursive scheduling until the predefined connection limit is met.
 */
function initiateSocketConnection() {
    // --- Pre-connection Guard Clause ---
    // Abort if the total number of attempts has met or surpassed the defined cap.
    if (attemptCounter >= CONNECTION_CAP) {
        appLogger.warn('ConnectionManager', `Connection limit of ${CONNECTION_CAP} reached. No further attempts will be made.`);
        return; // Halt execution for this branch.
    }

    // Increment the global counter for connection attempts.
    attemptCounter++;
    appLogger.info('ConnectionManager', `Attempting connection ${attemptCounter} of ${CONNECTION_CAP}...`);

    let currentSocketInstance; // Local variable to hold the new WebSocket object.

    try {
        // Instantiate a new WebSocket client pointing to the service endpoint.
        currentSocketInstance = new ClientSocket(SERVICE_ENDPOINT_URL);

        // --- WebSocket Event Handlers ---
        // Register a callback for when the connection is successfully opened.
        currentSocketInstance.on('open', () => {
            appLogger.info('SocketEvent', `Connection #${attemptCounter} successfully established.`);
            // A placeholder for potential immediate actions upon connection, e.g., authentication or initial data request.
            // currentSocketInstance.send(JSON.stringify({ command: 'subscribe', topic: 'match_updates' }));
        });

        // Register a callback for any errors encountered during the connection's lifecycle.
        currentSocketInstance.on('error', (issue) => { // Using 'issue' for the error object.
            appLogger.error('SocketEvent', `An error occurred on connection #${attemptCounter}: ${issue.message}`);
            // Depending on the error, one might implement specific recovery or logging strategies here.
        });

        // Register a callback for when the WebSocket connection is terminated.
        currentSocketInstance.on('close', (closureCode, reasonBuffer) => { // Providing more detail with closure code and reason.
            const closureReason = reasonBuffer ? reasonBuffer.toString() : 'No specific reason provided.';
            appLogger.warn('SocketEvent', `Connection #${attemptCounter} has been closed. Code: ${closureCode}, Reason: ${closureReason}`);
            // Advanced logic might involve conditional re-connection based on closureCode.
        });

        // Add the newly created socket instance to our active connections list for monitoring.
        activeConnections.push(currentSocketInstance);

        // --- Recursive Scheduling for Next Attempt ---
        // If there are still attempts remaining within the cap, schedule the next connection.
        if (attemptCounter < CONNECTION_CAP) {
            setTimeout(initiateSocketConnection, RECONNECTION_DELAY_MS);
        } else {
            appLogger.verbose('ConnectionManager', `All ${CONNECTION_CAP} scheduled connection attempts have been initiated.`);
        }

    } catch (creationError) {
        // Catch synchronous errors that might occur during WebSocket instance creation (e.g., invalid URL).
        appLogger.error('ConnectionManager', `Failed to construct WebSocket instance for attempt ${attemptCounter}: ${creationError.message}`);
        // Even if instantiation fails, we still attempt to schedule the next connection if within limits.
        if (attemptCounter < CONNECTION_CAP) {
            setTimeout(initiateSocketConnection, RECONNECTION_DELAY_MS);
        }
    }
}

// --- Module Initialization ---
// Begin the sequence of establishing WebSocket connections.
appLogger.verbose('BootStrap', 'Starting the WebSocket connection management routine...');
initiateSocketConnection();