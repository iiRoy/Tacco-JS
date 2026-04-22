const webEngine        = require('http'); // Core module for handling web requests
const fileSystem       = require('path'); // Path manipulation utilities
const utilityTools     = require('util'); // General utility functions, e.g., object inspection
const messageBroker    = require('pubsubcore'); // External library for publish-subscribe messaging
const staticFileServer = require('paperboy'); // Library for serving static files efficiently

// --- Configuration Constants ---
// Define the directory from which static web assets will be served.
// This path is relative to the current working directory, for demonstration purposes.
const STATIC_CONTENT_DIR = fileSystem.resolve(process.cwd(), 'webroot');

// Network ports for various services.
const MAIN_HTTP_PORT = 8124; // Port for the primary web server
const RAW_TCP_PORT   = 9199; // Port for the raw TCP message broker connection

// Identifier for the special channel dedicated to listing active participants.
const PARTICIPANT_LIST_CHANNEL = '/command/list';

// A simple logging utility to centralize output.
const appLogger = {
    info: (...args) => console.log('[INFO]', ...args),
    warn: (...args) => console.warn('[WARN]', ...args),
    error: (...args) => console.error('[ERROR]', ...args),
    debug: (...args) => console.log('[DEBUG]', ...args)
};

/**
 * Handles incoming HTTP requests, primarily for serving static content.
 * @param {webEngine.IncomingMessage} incomingRequest - The client's request object.
 * @param {webEngine.ServerResponse} outgoingResponse - The server's response object.
 */
const handleIncomingWebRequest = (incomingRequest, outgoingResponse) => {
    // Basic validation: ensure request and response objects are present.
    if (!incomingRequest || !outgoingResponse) {
        appLogger.error('Received an invalid web request or response object.');
        return; // Abort if objects are missing
    }

    // Utilize the static file server to deliver content from the specified directory.
    staticFileServer.deliver(STATIC_CONTENT_DIR, incomingRequest, outgoingResponse)
        .on('error', (err) => {
            // Log any errors encountered during static file delivery.
            appLogger.error(`Static file delivery error for ${incomingRequest.url}:`, err.message);
            // Send a generic 500 Internal Server Error response.
            outgoingResponse.writeHead(500, { 'Content-Type': 'text/plain' });
            outgoingResponse.end('Internal Server Problem: Could not serve content.');
        });
};

// Initialize the primary HTTP application server.
const mainHttpApp = webEngine.createServer(handleIncomingWebRequest);

// Bind the message broker functionality to the HTTP server.
// This allows the message broker to use WebSocket upgrades on the HTTP port.
messageBroker.listen(mainHttpApp);

/**
 * Constructs the payload for a broadcasted chat message.
 * @param {string} currentChannel - The channel where the message originated.
 * @param {string} senderName - The name of the user sending the message.
 * @param {string} messageContent - The actual text of the chat message.
 * @returns {object} - The structured message payload.
 */
const prepareChatMessagePayload = (currentChannel, senderName, messageContent) => {
    return {
        roomIdentifier: currentChannel,
        messageDetails: {
            sender: senderName,
            text: messageContent,
            timestamp: Date.now() // Add a timestamp for extra detail
        }
    };
};

// --- Message Broker Event Handlers ---

// Register a handler for the specific command to list users in a room.
messageBroker.add_handler(PARTICIPANT_LIST_CHANNEL, (connectionHandle, incomingPayload) => {
    try {
        // Validate that the incoming payload contains necessary data.
        if (!incomingPayload || !incomingPayload.payloadData || !incomingPayload.payloadData.roomIdentifier) {
            appLogger.warn('Received malformed participant list request:', utilityTools.inspect(incomingPayload));
            connectionHandle.send({ status: 'error', message: 'Missing room identifier in request.' });
            return;
        }

        const requestedRoom = incomingPayload.payloadData.roomIdentifier;
        const activeParticipants = messageBroker.users_in_room(requestedRoom);

        appLogger.debug(`Participants requested for room '${requestedRoom}':`, activeParticipants.length, 'users');

        // Respond to the client with the list of users.
        connectionHandle.send({
            roomIdentifier: PARTICIPANT_LIST_CHANNEL, // Echo the command channel
            participants: activeParticipants,
            targetRoom: requestedRoom,
            responseType: 'userList'
        });
    } catch (err) {
        appLogger.error(`Error processing participant list request: ${err.message}`, utilityTools.inspect(incomingPayload));
        connectionHandle.send({ status: 'error', message: 'Failed to retrieve participant list.' });
    }
});

// Register a catch-all handler for all other channels, treating them as chat rooms.
// This handler uses a regular expression to match any incoming channel.
messageBroker.add_handler(/.*/, (connectionHandle, incomingPayload) => {
    appLogger.debug('Received general message:', utilityTools.inspect(incomingPayload));

    // Guard clause: Ensure essential data for broadcasting is present.
    if (!incomingPayload || !incomingPayload.channelName || !incomingPayload.payloadData ||
        !incomingPayload.payloadData.senderName || !incomingPayload.payloadData.messageText) {
        appLogger.warn('Skipping malformed chat message:', utilityTools.inspect(incomingPayload));
        connectionHandle.send({ status: 'error', message: 'Invalid chat message format.' });
        return;
    }

    const currentChannel = incomingPayload.channelName;
    const sender = incomingPayload.payloadData.senderName;
    const messageContent = incomingPayload.payloadData.messageText;

    // Only broadcast the message if the sending client is actually a member of the specified room/channel.
    if (messageBroker.client_in_room(currentChannel, connectionHandle)) {
        const broadcastData = prepareChatMessagePayload(currentChannel, sender, messageContent);
        messageBroker.broadcast_room(currentChannel, broadcastData);
        appLogger.info(`Broadcasted message in '${currentChannel}' from '${sender}'.`);
    } else {
        appLogger.warn(`Client '${connectionHandle.id}' attempted to send message to '${currentChannel}' without being in room.`);
        connectionHandle.send({ status: 'error', message: 'You are not a member of this chat room.' });
    }
});

// --- Server Initialization ---

// Start the primary HTTP server and listen for incoming connections.
mainHttpApp.listen(MAIN_HTTP_PORT, () => {
    appLogger.info(`Web Application Server is operational on http://127.0.0.1:${MAIN_HTTP_PORT}/`);
});

// Add an error listener for the HTTP server to catch network issues.
mainHttpApp.on('error', (err) => {
    appLogger.error(`HTTP Server encountered an error: ${err.message}`);
    // Attempt to gracefully shut down or log critical errors.
    if (err.code === 'EADDRINUSE') {
        appLogger.error(`Port ${MAIN_HTTP_PORT} is already in use. Please free up the port or choose another.`);
        process.exit(1); // Exit with an error code
    }
});


// Start a raw TCP server for the message broker on a separate port.
messageBroker.listen_tcp(RAW_TCP_PORT, 'localhost', () => {
    appLogger.info(`Raw TCP Message Broker is accessible at 127.0.0.1:${RAW_TCP_PORT}`);
});

appLogger.info('All server components are initialized and awaiting connections.');
appLogger.info('Serving static content from:', STATIC_CONTENT_DIR);
// A small delay to ensure all logs are flushed before indicating readiness.
setTimeout(() => appLogger.debug('System ready.'), 100);