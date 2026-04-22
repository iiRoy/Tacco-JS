// This file contains a revised implementation for managing FreeSWITCH ESL connections via WebSockets.
// Initial contributions by Fraser Redmond, extensively refactored and updated.
// NOTE: This version aims for improved clarity and modularity, using modern JS features.

// --- Configuration Parameters for FreeSWITCH ESL Endpoint ---
const eslHostAddress = '127.0.0.1'; // IP address of the FreeSWITCH server
const eslAuthSecret = 'clueCon';    // Authentication password for ESL
const eslPortNumber = 8021;         // Port number for ESL connection

// --- External Module Imports ---
const eslModuleRef = require('esl'); // FreeSWITCH ESL module reference
const socketIoRef = require('socket.io'); // Socket.IO module reference
const queryUtil = require('querystring'); // Utility for query string operations (e.g., unescaping)

// --- WebSocket Server Initialization ---
const webSocketServer = socketIoRef.listen(8080); // Create a Socket.IO server listening on port 8080

// --- WebSocket Server Configuration ---
// Helper function to apply common server settings
const configureWebSocketServer = (serverInstance) => {
    // Enable various optimizations for browser clients
    serverInstance.enable('browser client minification');
    serverInstance.enable('browser client etag');
    serverInstance.enable('browser client gzip');

    // Reduce logging verbosity for production environments
    serverInstance.set('log level', 1);

    // Explicitly list allowed transport mechanisms, ensuring broad client compatibility
    serverInstance.set('transports', [
        'websocket', 'flashsocket', 'htmlfile', 'xhr-polling', 'jsonp-polling'
    ]);

    // Add a custom setting for demonstration purposes or future use
    serverInstance.set('heartbeat interval', 5000);
};

// Apply the configuration to our webSocketServer instance
configureWebSocketServer(webSocketServer);


// --- ESL Connection Management Functions ---

/**
 * Initiates or re-establishes an ESL connection for a given client socket.
 * @param {object} clientSocket The client's WebSocket socket object.
 * @param {string} commandString The FreeSWITCH command to execute after connection.
 * @param {Function} completionHandler The callback function for the command's result.
 * @param {any} additionalData Any supplementary data to pass to the completion handler.
 * @returns {object} The ESL client instance attempting connection.
 */
function establishEslConnection(clientSocket, commandString, completionHandler, additionalData) {
    if (!clientSocket) {
        console.error("Attempted to establish ESL connection without a valid client socket.");
        return null;
    }

    // Ensure any existing ESL connection is properly closed before creating a new one.
    terminateEslConnection(clientSocket);

    // Create a new ESL client instance and attach it to the client socket.
    const currentEslClient = eslModuleRef.createClient();
    clientSocket.eslConnector = currentEslClient;

    // Register an event listener for when the ESL connection closes unexpectedly.
    currentEslClient.on('close', () => {
        console.warn(`ESL connection for client ${clientSocket.id} closed unexpectedly.`);
        terminateEslConnection(clientSocket);
    });

    // Handle authentication request from the ESL server.
    currentEslClient.on('esl_auth_request', (authCallbackObject) => {
        // Authenticate with the configured secret.
        const authResult = authCallbackObject.auth(eslAuthSecret, (sessionObject) => {
            if (!sessionObject) {
                console.error(`ESL authentication failed for client ${clientSocket.id}.`);
                terminateEslConnection(clientSocket);
                return;
            }
            // Store the authenticated session object on the client socket.
            clientSocket.eslSession = sessionObject;
            console.log(`ESL session established for client ${clientSocket.id}.`);

            // Execute the initial command now that authentication is complete.
            executeEslCommand(clientSocket, commandString, completionHandler, additionalData);
        });
        return authResult; // Return the result of the auth call (might be a promise or void)
    });

    // Attempt to connect to the FreeSWITCH ESL server.
    currentEslClient.connect(eslPortNumber, eslHostAddress);
    console.info(`Attempting ESL connection for client ${clientSocket.id} to ${eslHostAddress}:${eslPortNumber}.`);
    return currentEslClient;
}

/**
 * Terminates the ESL connection associated with a client socket, if one exists.
 * @param {object} clientSocket The client's WebSocket socket object.
 */
function terminateEslConnection(clientSocket) {
    if (!clientSocket) {
        console.warn("Attempted to terminate ESL connection for a null client socket.");
        return;
    }

    // Check if an ESL client is active and attempt to end its connection.
    if (clientSocket.eslConnector) {
        try {
            clientSocket.eslConnector.end(); // Gracefully close the ESL connection.
            console.log(`ESL client connection for ${clientSocket.id} terminated.`);
        } catch (error) {
            console.error(`Error terminating ESL connector for ${clientSocket.id}:`, error.message);
        }
    }

    // Clear references to ESL client and session to prevent memory leaks.
    clientSocket.eslSession = null;
    clientSocket.eslConnector = null;
    console.debug(`ESL references cleared for client ${clientSocket.id}.`);
}

/**
 * Executes a FreeSWITCH ESL command using the client's established session.
 * If no session exists, it attempts to establish one first.
 * @param {object} clientSocket The client's WebSocket socket object.
 * @param {string} commandString The FreeSWITCH command to execute.
 * @param {Function} completionHandler The callback function for the command's result.
 * @param {any} additionalData Any supplementary data to pass to the completion handler.
 */
function executeEslCommand(clientSocket, commandString, completionHandler, additionalData) {
    // Guard clause: ensure clientSocket and commandString are valid.
    if (!clientSocket || !commandString) {
        console.error("Cannot execute ESL command: missing client socket or command string.");
        return;
    }

    // Check if an ESL session is already active.
    if (!clientSocket.eslSession || !clientSocket.eslConnector) {
        console.log(`ESL session not active for client ${clientSocket.id}. Attempting to re-establish.`);
        // Re-establish connection, which will then re-call this function upon successful authentication.
        establishEslConnection(clientSocket, commandString, completionHandler, additionalData);
    } else {
        console.log(`Executing ESL command "${commandString}" for client ${clientSocket.id}.`);
        // Execute the API command via the active ESL session.
        clientSocket.eslSession.api(commandString, (apiResponse) => {
            // Log the raw response body for debugging.
            // console.log('Raw ESL API response body:', apiResponse.body);

            // If a completion handler is provided, invoke it with the response and additional data.
            if (typeof completionHandler === 'function') {
                const responseBody = apiResponse ? apiResponse.body : '';
                completionHandler(responseBody, clientSocket, additionalData);
            } else {
                console.warn(`No completion handler provided for ESL command "${commandString}".`);
            }
        });
    }
}

// --- Text Parsing Utilities ---

/**
 * Parses a delimited string into an array of arrays or a key-value object.
 * @param {string} inputString The string content to be parsed.
 * @param {string} separatorChar The character used to delimit columns within lines.
 * @param {boolean} asKeyValuePairs If true, returns an object where the first column is the key.
 * @returns {Array|object} The parsed data structure.
 */
function parseDelimitedText(inputString, separatorChar, asKeyValuePairs) {
    if (typeof inputString !== 'string' || !inputString.trim()) {
        console.warn("Input string for parsing is empty or invalid.");
        return asKeyValuePairs ? {} : [];
    }
    if (typeof separatorChar !== 'string' || separatorChar.length === 0) {
        console.error("Separator character is invalid or empty.");
        return asKeyValuePairs ? {} : [];
    }

    const lineArray = inputString.split("\n").filter(line => line.trim() !== ''); // Filter out empty lines
    const parsedData = asKeyValuePairs ? {} : [];

    for (let i = 0; i < lineArray.length; i++) {
        const currentLine = lineArray[i];
        const parts = currentLine.split(separatorChar, 2); // Split into at most 2 parts for key-value

        if (asKeyValuePairs) {
            // Ensure we have at least a key part
            if (parts.length > 0 && parts[0].trim() !== '') {
                const key = parts[0].trim();
                const value = parts.length > 1 ? parts[1].trim() : '';
                parsedData[key] = value;
            }
        } else {
            // For array of arrays, split all columns
            parsedData.push(currentLine.split(separatorChar));
        }
    }

    // Special handling for 'Reply-Text' if it indicates a URL-encoded string.
    // This assumes specific FreeSWITCH reply formats.
    if (asKeyValuePairs && parsedData['Reply-Text'] && parsedData['Reply-Text'].startsWith('%')) {
        console.debug("Detected URL-encoded Reply-Text, attempting to unescape other values.");
        for (const key in parsedData) {
            // Only unescape string values.
            if (typeof parsedData[key] === 'string') {
                parsedData[key] = queryUtil.unescape(parsedData[key]);
            }
        }
    }

    return parsedData;
}

/**
 * Processes a raw FreeSWITCH response string to extract and log identifiers (e.g., UUIDs).
 * This function currently just parses and logs but can be extended for further processing.
 * @param {string} rawResponse The raw string response from a FreeSWITCH command.
 * @param {object} clientSocket The client's WebSocket socket object.
 * @param {object} incomingMessage The original message object from the client.
 */
function processIdentifiers(rawResponse, clientSocket, incomingMessage) {
    if (!rawResponse || rawResponse.trim() === '') {
        console.warn(`No response data to process for client ${clientSocket.id}.`);
        return;
    }

    // Parse the response string, assuming comma-separated values, not key-value pairs.
    const identifierList = parseDelimitedText(rawResponse, ',', false);

    if (Array.isArray(identifierList) && identifierList.length > 0) {
        console.log(`Client ${clientSocket.id} requested for extension ${incomingMessage.extnNum}. Found ${identifierList.length} identifiers.`);
        // Example of further processing:
        identifierList.forEach((idEntry, index) => {
            // Assuming idEntry is an array, and the first element is the ID
            const mainId = Array.isArray(idEntry) ? idEntry[0] : idEntry;
            console.log(`  Identifier ${index + 1}: ${mainId}`);
            // Potentially emit this back to the client or store it.
            // clientSocket.emit('identifier_found', { id: mainId, originalRequest: incomingMessage });
        });
    } else {
        console.log(`No specific identifiers found in response for client ${clientSocket.id}. Raw: ${rawResponse.substring(0, 50)}...`);
    }

    // Optionally, send a confirmation back to the client
    clientSocket.emit('esl_command_processed', {
        command: incomingMessage.command,
        status: 'completed',
        details: `Processed response for ${incomingMessage.extnNum}`,
        parsedCount: identifierList.length
    });
}

// --- WebSocket Event Handlers ---

// Listen for new client connections to the WebSocket server.
webSocketServer.sockets.on('connection', (clientSocket) => {
    console.log(`New WebSocket client connected: ${clientSocket.id}`);

    // Initialize custom properties on the client socket for ESL management.
    clientSocket.eslConnector = null; // Holds the ESL client instance.
    clientSocket.eslSession = null;   // Holds the authenticated ESL session.

    // Handle incoming messages from the client.
    clientSocket.on('message', (incomingMessage) => {
        console.log(`Message from ${clientSocket.id}:`, incomingMessage);

        // Basic validation for incoming message structure.
        if (typeof incomingMessage !== 'object' || !incomingMessage.extnNum) {
            console.warn(`Invalid message format from ${clientSocket.id}. Expected 'extnNum'.`);
            clientSocket.emit('error_message', { type: 'validation', message: 'Missing "extnNum" in request.' });
            return;
        }

        const targetExtension = incomingMessage.extnNum;
        const desiredCommand = `show channels like ${targetExtension}`;

        // Execute the ESL command based on the client's request.
        executeEslCommand(clientSocket, desiredCommand, processIdentifiers, incomingMessage);

        // Acknowledge receipt of the message
        clientSocket.emit('message_received', { status: 'acknowledged', originalMessage: incomingMessage });
    });

    // Handle client disconnections.
    clientSocket.on('disconnect', () => {
        console.log(`WebSocket client disconnected: ${clientSocket.id}`);
        // Ensure any active ESL connection for this client is properly closed.
        terminateEslConnection(clientSocket);
    });

    // Add a periodic ping to keep the connection alive or detect dead clients earlier.
    const pingInterval = setInterval(() => {
        if (clientSocket.connected) {
            clientSocket.emit('server_ping', { timestamp: Date.now() });
        } else {
            clearInterval(pingInterval);
        }
    }, 10000); // Every 10 seconds

    clientSocket.on('pong', () => {
        // Client responded to ping, connection is active.
        // console.log(`Client ${clientSocket.id} responded to ping.`);
    });
});

// --- Process Lifecycle Hooks ---

// Global cleanup when the Node.js process is about to exit.
process.on('exit', () => {
    console.log("Node process is exiting. Performing final cleanup.");

    // In a real-world scenario, you might want to iterate through all active
    // webSocketServer.sockets and call terminateEslConnection for each.
    // For simplicity, we'll just log here.
    // This is a placeholder for more robust global resource management.
    console.log("All open ESL connections should ideally be closed here.");
});

// Catch unhandled promise rejections to prevent process termination.
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    // Application specific logging, throwing an error, or other logic here
});

// Catch uncaught exceptions to prevent process termination.
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    // Log the error, perform necessary cleanup, and then potentially exit gracefully.
    process.exit(1); // Exit with a failure code
});