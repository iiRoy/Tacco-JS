const utility = {
    // Helper to safely retrieve environment variables with fallbacks.
    retrieveEnvVar: (key, defaultValue) => {
        return process.env[key] || defaultValue;
    },
    // Simple logger for server events.
    log: (message, level = 'info') => {
        const timestamp = new Date().toISOString();
        console.log(`[${timestamp}] [${level.toUpperCase()}] ${message}`);
    },
    // Basic username validation.
    isValidUsername: (name) => {
        if (!name || name.trim() === '') {
            return false;
        }
        // Allow alphanumeric and underscores.
        const usernameRegex = /^[a-zA-Z0-9_]+$/;
        return usernameRegex.test(name);
    }
};

// Core application configuration settings.
const appConfig = {
    // Port for the HTTP server. Prioritize OpenShift environment variables.
    CHAT_SERVER_PORT: utility.retrieveEnvVar('OPENSHIFT_INTERNAL_PORT', utility.retrieveEnvVar('OPENSHIFT_NODEJS_PORT', 8080)),
    // IP address to bind the HTTP server to.
    HOST_BIND_ADDR: utility.retrieveEnvVar('OPENSHIFT_INTERNAL_IP', utility.retrieveEnvVar('OPENSHIFT_NODEJS_IP', '127.0.0.1')),
    // Default logging level for WebSocket server (e.g., 1 for warn, 3 for debug).
    WS_LOG_LEVEL: parseInt(utility.retrieveEnvVar('CHAT_WS_LOG_LEVEL', 1), 10)
};

// Import necessary external modules.
const expressModule = require('express');
const http = require('http');
const socketio = require('socket.io');
const optimist = require('optimist');

// Import internal common components.
const templateEngine = require('./common/handlebars').Handlebars;
const { Message: ChatPayload, User: ChatUser } = require('./common/models'); // Destructuring assignment.

// Parse command-line arguments.
const commandLineArgs = optimist.argv;

// Initialize the main web application instance.
const webApplication = expressModule();
let httpListener; // HTTP server instance.
let websocketManager; // WebSocket server instance.

// A map to store currently connected WebSocket client IDs to their associated ChatUser objects.
// This ensures that we can quickly retrieve the user linked to a specific socket connection.
const connectedSocketMap = new Map();

// Middleware for handling Cross-Origin Resource Sharing (CORS).
webApplication.use((requestObj, responseObj, nextMiddleware) => {
    let allowedOrigin = '*'; // Default to wildcard for simplicity, could be more restrictive.

    // Attempt to determine origin from referrer header for more specific CORS.
    const refererHeader = requestObj.headers.referer;
    if (refererHeader) {
        try {
            const url = new URL(refererHeader);
            allowedOrigin = `${url.protocol}//${url.hostname}`;
            if (url.port) {
                allowedOrigin += `:${url.port}`;
            }
        } catch (e) {
            utility.log(`CORS: Failed to parse referrer URL '${refererHeader}'. Error: ${e.message}`, 'warn');
        }
    }

    // Set CORS headers for allowing cross-origin requests.
    responseObj.setHeader('Access-Control-Allow-Origin', allowedOrigin);
    responseObj.setHeader('Access-Control-Allow-Credentials', 'true');
    responseObj.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS'); // Explicitly allow methods.
    responseObj.setHeader('Access-Control-Allow-Headers', 'Content-Type'); // Allow specific headers.

    // Handle preflight requests for CORS.
    if (requestObj.method === 'OPTIONS') {
        return responseObj.sendStatus(204); // No content for preflight success.
    }

    nextMiddleware(); // Proceed to the next middleware or route handler.
});

// Endpoint to provide WebSocket connection details to the client-side.
webApplication.use('/websocket-config.js', (requestObj, responseObj) => {
    // Check for an explicitly provided WebSocket port from command-line arguments.
    const wsPort = commandLineArgs['ws-port'];
    let websocketEndpoint = '/'; // Default relative path.

    // If a specific WebSocket port is provided, prepend it to the URI.
    if (wsPort && typeof wsPort === 'number') {
        websocketEndpoint = `:${wsPort}/`;
    }

    // Set content type and send the JavaScript snippet.
    responseObj.set('Content-Type', 'application/javascript');
    responseObj.send(`const wsConnectionURI = window.location.hostname + "${websocketEndpoint}";`);
});

// Serve static assets from the 'client' directory under the '/app' path.
webApplication.use('/app', expressModule.static(__dirname + '/client'));

// Serve shared code from the 'common' directory under the '/shared' path.
webApplication.use('/shared', expressModule.static(__dirname + '/common'));

// Route for the root path, serving the main client HTML file.
webApplication.get('/', (requestObj, responseObj) => {
    // Ensure the client application's main HTML is served.
    responseObj.sendFile(__dirname + '/client/index.html');
});

// Create the HTTP server and attach the Express application.
httpListener = http.createServer(webApplication);

// Start the HTTP server, listening on the configured port and IP address.
httpListener.listen(appConfig.CHAT_SERVER_PORT, appConfig.HOST_BIND_ADDR, () => {
    utility.log(`HTTP Listener active on: http://${appConfig.HOST_BIND_ADDR}:${appConfig.CHAT_SERVER_PORT}`, 'info');
});

// Error handling for the HTTP server.
httpListener.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        utility.log(`Port ${appConfig.CHAT_SERVER_PORT} is already in use. Please choose another port.`, 'error');
    } else {
        utility.log(`HTTP server error: ${err.message}`, 'error');
    }
    process.exit(1);
});

// Central registry for active chat participants.
const participantRegistry = {
    // Stores ChatUser objects, mapped by their unique ID.
    registeredUsers: new Map(),

    // Registers a new participant. Checks for duplicates by ID or name.
    enrollUser: function(newParticipant) {
        if (!newParticipant || !newParticipant.id) {
            utility.log('Attempted to enroll a participant without an ID.', 'warn');
            return false;
        }

        // Prevent enrolling the same user ID twice.
        if (this.registeredUsers.has(newParticipant.id)) {
            utility.log(`Participant with ID ${newParticipant.id} already enrolled.`, 'warn');
            return false;
        }

        // Prevent enrolling a user with a name already taken (if name is set).
        if (newParticipant.name) {
            for (const existingUser of this.registeredUsers.values()) {
                if (existingUser.name === newParticipant.name) {
                    utility.log(`Participant name '${newParticipant.name}' is already in use.`, 'warn');
                    return false;
                }
            }
        }

        this.registeredUsers.set(newParticipant.id, newParticipant);
        utility.log(`Participant '${newParticipant.name || newParticipant.id}' enrolled. Total: ${this.registeredUsers.size}`);
        // Broadcast the updated list of active users to all clients.
        websocketManager.emit('user-list', {
            'users': Array.from(this.registeredUsers.values()).map(u => ({ id: u.id, name: u.name }))
        });
        return true;
    },

    // Deregisters a participant by their unique ID.
    unenrollUser: function(participantId) {
        if (!participantId) {
            utility.log('Attempted to unenroll a participant without an ID.', 'warn');
            return false;
        }

        const removed = this.registeredUsers.delete(participantId);
        if (removed) {
            utility.log(`Participant with ID ${participantId} unenrolled. Remaining: ${this.registeredUsers.size}`);
            // Broadcast the updated user list.
            websocketManager.emit('user-list', {
                'users': Array.from(this.registeredUsers.values()).map(u => ({ id: u.id, name: u.name }))
            });
        } else {
            utility.log(`Participant with ID ${participantId} not found for unenrollment.`, 'info');
        }
        return removed;
    }
};

// Collection of pre-compiled chat prompts and server messages.
const chatPrompts = new Map();

// Helper to compile and store a template.
const compileAndStoreTemplate = (key, text) => {
    chatPrompts.set(key, templateEngine.compile(text));
};

// Compile and store all server messages.
compileAndStoreTemplate("greeting", 'The chat server welcomes you. Please provide a unique username to join the conversation. Usernames should only contain letters, numbers, and underscores.');
compileAndStoreTemplate("nameMissing", 'Error: You must set your username before sending messages.');
compileAndStoreTemplate("nameTampering", 'Warning: Changing your username mid-chat is not allowed. Connection terminated.');
compileAndStoreTemplate("participantDisconnected", '{{name}} has gracefully exited the chatroom.');
compileAndStoreTemplate("enjoyYourStay", 'Welcome, {{name}}! Enjoy your time in the chat.');
compileAndStoreTemplate("participantConnected", '{{name}} has just entered the chatroom.');
compileAndStoreTemplate("invalidUsernameFormat", 'Error: "{{name}}" is an invalid username. Please use only letters, numbers, and underscores. Disconnecting.');
compileAndStoreTemplate("usernameTaken", 'Error: The username "{{name}}" is already in use. Please choose another. Disconnecting.');

// Retrieve a compiled template and render it with context.
const getRenderedPrompt = (key, context = {}) => {
    const templateFn = chatPrompts.get(key);
    return templateFn ? templateFn(context) : `[Template missing for key: ${key}]`;
};

// Define a system user for server-generated messages.
const systemUser = ChatUser('server-bot', 'ServerBot');

// Initialize Socket.IO and attach it to the HTTP server.
websocketManager = socketio(httpListener);

// Set Socket.IO logging level based on configuration.
// Note: Direct log level setting might vary across Socket.IO versions.
// For newer versions, it's often configured via `serveClient` or `adapter` options,
// or by providing a custom logger. This simplified line targets a common configuration.
websocketManager.engine.ws.logLevel = appConfig.WS_LOG_LEVEL;
utility.log(`WebSocket Server logging level set to: ${appConfig.WS_LOG_LEVEL}`, 'info');

// Event handler for new client connections.
websocketManager.on('connection', (clientConnection) => {
    utility.log(`New client connected: ${clientConnection.id}`);

    // Create a new participant object linked to this client's socket ID.
    const connectedParticipant = ChatUser(clientConnection.id);
    connectedParticipant.socketId = clientConnection.id; // Store socket ID on the user object.
    connectedSocketMap.set(clientConnection.id, connectedParticipant); // Track active socket-user mapping.

    // Function to handle client disconnection and cleanup.
    const terminateConnection = (reason = 'unknown') => {
        const participantId = connectedParticipant.id;
        const participantName = connectedParticipant.name;

        // Remove the participant from the global registry.
        const wasRemoved = participantRegistry.unenrollUser(participantId);

        // If the participant had a name and was successfully removed, broadcast their departure.
        if (participantName && wasRemoved) {
            websocketManager.emit('chat', ChatPayload(getRenderedPrompt("participantDisconnected", { name: participantName }), systemUser));
        }

        // Clean up the socket-user mapping.
        connectedSocketMap.delete(clientConnection.id);

        // Explicitly disconnect the client socket if it's still connected.
        if (clientConnection.connected) {
            clientConnection.disconnect(true); // Close the underlying connection.
            utility.log(`Client ${clientConnection.id} disconnected. Reason: ${reason}`);
        }
    };

    // Send an initial greeting message to the newly connected client.
    clientConnection.emit('chat', ChatPayload(getRenderedPrompt("greeting"), systemUser));

    // Listen for the client's disconnection event.
    clientConnection.once('disconnect', () => {
        terminateConnection('client-initiated');
    });

    // Handler for when a client attempts to set their username.
    clientConnection.on('set-name', (receivedData) => {
        const potentialName = receivedData.username;

        // Basic validation for the new username.
        if (!utility.isValidUsername(potentialName)) {
            clientConnection.emit('chat', ChatPayload(getRenderedPrompt("invalidUsernameFormat", { name: potentialName }), systemUser, 'error'));
            terminateConnection('invalid-username-format');
            return;
        }

        // Check if the username is already taken by another active participant.
        for (const existingUser of participantRegistry.registeredUsers.values()) {
            if (existingUser.name === potentialName) {
                clientConnection.emit('chat', ChatPayload(getRenderedPrompt("usernameTaken", { name: potentialName }), systemUser, 'error'));
                terminateConnection('username-already-taken');
                return;
            }
        }

        // If the participant already has a name, prevent them from changing it.
        if (connectedParticipant.name) {
            clientConnection.emit('chat', ChatPayload(getRenderedPrompt("nameTampering"), systemUser, 'error'));
            terminateConnection('name-change-attempt');
            return;
        }

        // Assign the validated name and enroll the participant.
        connectedParticipant.name = potentialName;
        const enrolled = participantRegistry.enrollUser(connectedParticipant);

        if (enrolled) {
            // Confirm to the client that their name is set.
            clientConnection.emit('chat', ChatPayload(getRenderedPrompt("enjoyYourStay", connectedParticipant), systemUser));
            // Announce to all other clients that a new participant has joined.
            websocketManager.emit('chat', ChatPayload(getRenderedPrompt("participantConnected", connectedParticipant), systemUser));
            utility.log(`Participant ${connectedParticipant.id} successfully set name to '${connectedParticipant.name}'.`);
        } else {
            // This case should ideally be caught by prior checks, but as a fallback.
            clientConnection.emit('chat', ChatPayload(getRenderedPrompt("invalidUsernameFormat", { name: potentialName }), systemUser, 'error'));
            terminateConnection('enrollment-failure');
        }
    });

    // Handler for incoming chat messages from clients.
    clientConnection.on('chat', (receivedData) => {
        // Ensure the sender has a valid username set.
        if (!connectedParticipant.name) {
            clientConnection.emit('chat', ChatPayload(getRenderedPrompt("nameMissing"), systemUser, 'error'));
            terminateConnection('message-without-name');
            return;
        }

        // Simple check to ensure the client isn't trying to impersonate another user or change their name in message data.
        // This relies on the connectedParticipant object's name being the source of truth.
        if (receivedData.user && receivedData.user.name !== connectedParticipant.name) {
            clientConnection.emit('chat', ChatPayload(getRenderedPrompt("nameTampering"), systemUser, 'error'));
            terminateConnection('impersonation-attempt');
            return;
        }

        // Add a timestamp to the message for richer context.
        const chatMessage = ChatPayload(receivedData.message, connectedParticipant, "chat");
        chatMessage.timestamp = new Date().toISOString();

        // Broadcast the message to all connected clients.
        websocketManager.emit('chat', chatMessage);
        utility.log(`Chat message from '${connectedParticipant.name}': ${receivedData.message}`);
    });

    // Implement a basic heartbeat mechanism (optional, for Type III extensibility).
    // clientConnection.on('ping', () => {
    //     clientConnection.emit('pong');
    // });
});