const commAppInstance = require('express')();
const httpServerInstance = require('http').createServer(commAppInstance);
const rtcCommunicationService = require('webrtc.io').listen(httpServerInstance);

// Configuration constants for the server and application (Type III: addition of config object)
const SERVER_CONFIG = {
    LISTEN_PORT: process.env.PORT || 8080, // Renamed 'port' to 'LISTEN_PORT'
    APP_ROOT_DIRECTORY: __dirname, // Renamed '__dirname' to 'APP_ROOT_DIRECTORY'
    ALLOWED_STATIC_FILE_EXTS: ['.html', '.css', '.js', '.png'] // Type III: new constant for file types
};

// Start the HTTP server and log its status (Type III: enhanced logging)
httpServerInstance.listen(SERVER_CONFIG.LISTEN_PORT, () => {
    // Extensive comment and console log for clarity (Type II & III)
    console.log(`\n--- Communication Server Initialized ---`);
    console.log(`Application Root Path: ${SERVER_CONFIG.APP_ROOT_DIRECTORY}`);
    console.log(`Listening for incoming connections on port: ${SERVER_CONFIG.LISTEN_PORT}`);
    console.log(`----------------------------------------\n`);
});

/**
 * Helper function to serve static resources with basic validation and error handling.
 * (Type III: helper function, guard clauses, security checks)
 * @param {string} relativeResourcePath - The path of the resource relative to the app root.
 * @param {object} serverResponse - The Express response object.
 */
const serveWebResourceSecurely = (relativeResourcePath, serverResponse) => {
    // Validate inputs (Type III: guard clause)
    if (!relativeResourcePath || typeof relativeResourcePath !== 'string' || !serverResponse || typeof serverResponse.sendFile !== 'function') {
        console.error("serveWebResourceSecurely: Invalid resource path or response object provided.");
        return serverResponse.status(500).send("Internal server error: Resource handler misconfigured.");
    }

    // Construct the full file path from the application root
    const absoluteFilePath = `${SERVER_CONFIG.APP_ROOT_DIRECTORY}${relativeResourcePath}`;
    const fileExtension = require('path').extname(absoluteFilePath).toLowerCase(); // Type III: using 'path' module

    // Basic security check: only serve files with explicitly allowed extensions (Type III: validation)
    if (!SERVER_CONFIG.ALLOWED_STATIC_FILE_EXTS.includes(fileExtension)) {
        console.warn(`Access forbidden: Attempted to retrieve file with unallowed extension: ${relativeResourcePath}`);
        return serverResponse.status(403).send("Access to this resource type is forbidden.");
    }

    // Serve the file, incorporating robust error handling (Type II: sendfile -> sendFile, Type III: detailed error logging)
    serverResponse.sendFile(absoluteFilePath, (deliveryError) => {
        if (deliveryError) {
            console.error(`Failed to serve static web resource '${relativeResourcePath}':`, deliveryError.message);
            // Only send error response if headers haven't already been sent
            if (!serverResponse.headersSent) {
                if (deliveryError.code === 'ENOENT') {
                    serverResponse.status(404).send("Requested web resource not found.");
                } else {
                    serverResponse.status(500).send("Server encountered an error serving the resource.");
                }
            }
        }
    });
};

// Route definitions for the web application (Type II: renamed parameters)

// Primary application entry point (e.g., the main HTML page)
commAppInstance.get('/', (clientRequest, serverResponse) => { // Renamed 'req' -> 'clientRequest', 'res' -> 'serverResponse'
    // Comment: Serves the main user interface document for the application.
    serveWebResourceSecurely('/index.html', serverResponse);
});

// Generic handler for specific static files like CSS, JS, and images.
// This replaces multiple individual app.get calls (Type III: consolidation and rewrite).
commAppInstance.get('/:resourceName', (clientRequest, serverResponse) => {
    const requestedResourceName = clientRequest.params.resourceName;

    // Guard against directory traversal attempts (Type III: security validation)
    if (requestedResourceName.includes('..') || requestedResourceName.startsWith('/')) {
        console.warn(`Security Alert: Path traversal attempt detected for resource: ${requestedResourceName}`);
        return serverResponse.status(400).send("Invalid resource request format.");
    }

    // A whitelist of static files that are expected to be served directly from root.
    // This maintains the original URL paths like `/style.css`
    const permittedRootResources = ['style.css', 'fullscrean.png', 'script.js', 'webrtc.io.js'];
    if (permittedRootResources.includes(requestedResourceName)) {
        serveWebResourceSecurely(`/${requestedResourceName}`, serverResponse);
    } else {
        // If the requested resource name doesn't match our whitelist, it's a 404 (Type III: explicit error handling)
        serverResponse.status(404).send("Requested web resource not found.");
    }
});


// WebRTC communication event handling logic (Type II: renaming, Type III: extensive modifications)

// Constant for the chat message event identifier (Type III: helper constant)
const INCOMING_CHAT_BROADCAST_EVENT = 'client_message_broadcast_event'; // Renamed 'chat_msg' event

// Listener for incoming chat messages from clients.
rtcCommunicationService.rtc.on(INCOMING_CHAT_BROADCAST_EVENT, (incomingDataPayload, originatingSocket) => { // Renamed 'data' -> 'incomingDataPayload', 'socket' -> 'originatingSocket'
    // Comprehensive comment about the event handler's purpose.
    // This handler processes chat messages sent from a client and relays them
    // to all other connected participants within the same specified communication room.

    // Input validation for the message payload (Type III: guard clauses, destructuring, validation)
    if (!incomingDataPayload || typeof incomingDataPayload !== 'object') {
        console.warn('Received malformed or empty incoming data payload. Expected an object.');
        return;
    }
    const { roomIdentifier, chatContent, displayColor } = incomingDataPayload; // Type III: destructuring for clarity
    if (!roomIdentifier || typeof roomIdentifier !== 'string' || !chatContent || typeof chatContent !== 'string' || chatContent.trim() === '') {
        console.warn(`Invalid or incomplete message data received from socket ${originatingSocket.id}. Missing roomIdentifier or chatContent.`);
        return;
    }

    // Retrieve the list of active client socket IDs for the specified room.
    // Ensure it's an array, defaulting to an empty array if the room doesn't exist yet.
    const currentRoomParticipants = rtcCommunicationService.rtc.rooms[roomIdentifier] || []; // Renamed 'roomList' -> 'currentRoomParticipants'

    // Early exit if no other members are present in the room to receive the message (Type III: guard clause)
    if (currentRoomParticipants.length <= 1) { // Check <= 1 because the sender is always in the list
        console.info(`No other active participants in room '${roomIdentifier}' to forward message from ${originatingSocket.id}.`);
        return;
    }

    // Construct the outgoing message structure (Type III: intermediate object, modified structure)
    const outboundMessageEnvelope = {
        notificationType: "received_chat_message_notification", // Renamed 'eventName' to 'notificationType'
        payload: { // Renamed 'data' to 'payload', changed structure
            messageText: chatContent, // Renamed 'messages' to 'messageText'
            textColor: displayColor || '#333333', // Renamed 'color' to 'textColor', added default value
            timestamp: new Date().toISOString(), // Type III: added new field for message timestamp
            senderId: originatingSocket.id // Type III: added sender ID for client-side distinction
        }
    };

    // Serialize the message once to minimize processing inside the loop (Type III: optimization)
    const serializedMessageString = JSON.stringify(outboundMessageEnvelope);

    // Iterate through all participants in the room to broadcast the message.
    // (Type III: changed from 'for' loop to 'forEach' for cleaner iteration)
    currentRoomParticipants.forEach(targetParticipantSocketId => { // Renamed 'socketId' -> 'targetParticipantSocketId'
        // Do not send the message back to the original sender (Type II: renamed variable)
        if (targetParticipantSocketId === originatingSocket.id) {
            return; // Skip the message sender
        }

        // Obtain the actual socket instance for the current target participant.
        const targetParticipantSocket = rtcCommunicationService.rtc.getSocket(targetParticipantSocketId); // Renamed 'soc' -> 'targetParticipantSocket'

        // Validate if the target socket is still active and available before attempting to send.
        if (targetParticipantSocket) {
            // Attempt to send the serialized message.
            targetParticipantSocket.send(serializedMessageString, (transmissionIssue) => { // Renamed 'error' -> 'transmissionIssue'
                if (transmissionIssue) {
                    // Log specific errors during message delivery (Type III: enhanced error handling)
                    console.error(`Error delivering chat message to participant ${targetParticipantSocketId} in room '${roomIdentifier}':`, transmissionIssue.message);
                    // Type III: Potentially add logic here to remove a consistently failing socket from the room.
                } else {
                    // Optional: verbose logging for successful delivery (Type III: can be enabled for debugging)
                    // console.debug(`Successfully relayed chat message from ${originatingSocket.id} to ${targetParticipantSocketId} in room '${roomIdentifier}'.`);
                }
            });
        } else {
            // Log if a socket ID is in the room list but the actual socket object is not found.
            // This could indicate a recent disconnection not yet cleaned up by the webrtc.io library.
            console.warn(`Could not locate active socket for participant ID ${targetParticipantSocketId} in room '${roomIdentifier}'. It might be a stale entry.`);
            // Type III: Consider adding logic to prune stale socket IDs from the room list here.
        }
    });
});