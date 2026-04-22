var WebSocketConnectionManager = function(networkModule, debugLogger) {
    // Configuration properties for the server instance
    const DEFAULT_PORT_NUMBER = 8080;
    const DEFAULT_IP_ADDRESS = '127.0.0.1';
    const MAX_KEY_VALUE = 4294967295; // 2^32 - 1, maximum value for WebSocket keys
    const FRAME_DELIMITER_START = 0x00;
    const FRAME_DELIMITER_END = 0xFF;

    this.serverPort = DEFAULT_PORT_NUMBER;
    this.serverIpAddress = DEFAULT_IP_ADDRESS;
    this.activeServerInstance = null; // Holds the reference to the active Node.js TCP server

    // Data structures for managing connections and routing
    let connectedClientSockets = {}; // Map of session IDs to client socket streams
    let registeredRequestHandlers = {}; // Map of resource paths to handler functions
    const selfInstanceReference = this; // Capture 'this' for use in nested scopes

    // Regular expressions for parsing client handshake requests
    const clientHandshakePatterns = Object.freeze([
        /^GET (\S+) HTTP\/1\.1$/, // Resource path
        /^Upgrade: WebSocket$/,    // Upgrade header
        /^Connection: Upgrade$/,   // Connection header
        /^Host: (\S+)$/,          // Host header
        /^Origin: (\S+)$/,        // Origin header
        /^Sec-WebSocket-Protocol: (\S+)$/, // Protocol header
        /^Sec-WebSocket-Key1: (\S+)$/,     // Key1
        /^Sec-WebSocket-Key2: (\S+)$/      // Key2
    ]);

    // Template for server's handshake response headers
    const serverHandshakeResponseTemplates = Object.freeze([
        'HTTP/1.1 101 WebSocket Protocol Handshake',
        'Upgrade: WebSocket',
        'Connection: Upgrade',
        'Sec-WebSocket-Origin: {CLIENT_ORIGIN}',
        'Sec-WebSocket-Location: {SERVER_LOCATION}',
        'Sec-WebSocket-Protocol: {NEGOTIATED_PROTOCOL}'
    ]);

    // Object to store parsed handshake parameters (reused for each handshake)
    let currentHandshakeParameters = {};

    /**
     * Terminates a given network connection socket.
     * @param {net.Socket} targetSocket - The socket to be terminated.
     */
    function severConnection(targetSocket) {
        if (targetSocket && typeof targetSocket.end === 'function') {
            targetSocket.end();
            debugLogger.debug('Connection socket ended.');
        } else {
            debugLogger.warn('Attempted to end an invalid or missing socket.');
        }
    }

    /**
     * Converts an integer into a 4-byte Buffer in big-endian format.
     * @param {number} inputInt - The integer to convert.
     * @returns {Buffer} A 4-byte Buffer representation of the integer.
     */
    function convertIntToFourByteBuffer(inputInt) {
        // Ensure the input is treated as a 32-bit unsigned integer
        const unsignedInt = inputInt >>> 0;
        return Buffer.from([
            (unsignedInt >> 24) & 0xFF,
            (unsignedInt >> 16) & 0xFF,
            (unsignedInt >> 8) & 0xFF,
            unsignedInt & 0xFF
        ]);
    }

    /**
     * Parses the incoming client handshake data buffer to extract relevant WebSocket parameters.
     * @param {Buffer} incomingRequestBuffer - The raw buffer containing the client's handshake request.
     * @param {Array<RegExp>} headerParsingRules - An array of regular expressions to match headers.
     * @returns {Object} An object containing parsed WebSocket handshake details.
     */
    function extractHandshakeDetails(incomingRequestBuffer, headerParsingRules) {
        const parsedDetails = {
            resourcePath: null, upgradeHeader: null, connectionHeader: null,
            hostName: null, hostPort: null, clientOrigin: null,
            requestedProtocol: null, challengeKey1: null, challengeKey2: null,
            challengeKey3: null, derivedLocation: null, key1SpaceCount: 0, key2SpaceCount: 0
        };

        const requestContentString = incomingRequestBuffer.toString('utf8');
        const requestLines = requestContentString.split('\r\n');

        // Iterate over each line and apply regex patterns
        requestLines.forEach(line => {
            headerParsingRules.forEach((rule, index) => {
                const matches = line.match(rule);
                if (matches && matches.length > 0) {
                    let tempValue;
                    switch (index) {
                        case 0: // GET /resource HTTP/1.1
                            if (matches.length > 1) parsedDetails.resourcePath = matches[1];
                            break;
                        case 1: // Upgrade: WebSocket
                            parsedDetails.upgradeHeader = matches[0];
                            break;
                        case 2: // Connection: Upgrade
                            parsedDetails.connectionHeader = matches[0];
                            break;
                        case 3: // Host: example.com:8080
                            if (matches.length > 1) {
                                tempValue = matches[1];
                                if (tempValue.includes(':')) {
                                    const hostParts = tempValue.split(':');
                                    parsedDetails.hostName = hostParts[0];
                                    parsedDetails.hostPort = parseInt(hostParts[1], 10);
                                } else {
                                    parsedDetails.hostName = tempValue;
                                }
                            }
                            break;
                        case 4: // Origin: http://example.com
                            if (matches.length > 1) parsedDetails.clientOrigin = matches[1];
                            break;
                        case 5: // Sec-WebSocket-Protocol: sample
                            if (matches.length > 1) parsedDetails.requestedProtocol = matches[1];
                            break;
                        case 6: // Sec-WebSocket-Key1: 18x 6]8v4!P F`5
                            if (matches.length > 1) {
                                const key1String = matches[1];
                                const numericPart = parseInt(key1String.replace(/[^\d]/g, ''), 10);
                                parsedDetails.key1SpaceCount = key1String.replace(/[^ ]/g, '').length;
                                if (parsedDetails.key1SpaceCount !== 0 && numericPart % parsedDetails.key1SpaceCount === 0 && numericPart < MAX_KEY_VALUE) {
                                    parsedDetails.challengeKey1 = numericPart / parsedDetails.key1SpaceCount;
                                }
                            }
                            break;
                        case 7: // Sec-WebSocket-Key2: 1_ R 88]w 18x
                            if (matches.length > 1) {
                                const key2String = matches[1];
                                const numericPart = parseInt(key2String.replace(/[^\d]/g, ''), 10);
                                parsedDetails.key2SpaceCount = key2String.replace(/[^ ]/g, '').length;
                                if (parsedDetails.key2SpaceCount !== 0 && numericPart % parsedDetails.key2SpaceCount === 0 && numericPart < MAX_KEY_VALUE) {
                                    parsedDetails.challengeKey2 = numericPart / parsedDetails.key2SpaceCount;
                                }
                            }
                            break;
                    }
                }
            });
        });

        // Extract Key3, which is the 8-byte sequence after the double CRLF
        const headerEndIndex = incomingRequestBuffer.indexOf('\r\n\r\n');
        if (headerEndIndex !== -1 && incomingRequestBuffer.length >= headerEndIndex + 4 + 8) {
            parsedDetails.challengeKey3 = incomingRequestBuffer.slice(headerEndIndex + 4, headerEndIndex + 4 + 8);
        } else {
            debugLogger.warn('Could not find Key3 or buffer too short after headers.');
        }

        return parsedDetails;
    }

    /**
     * Validates that all essential parameters for a WebSocket handshake are present.
     * @param {Object} handshakeDetails - The object containing parsed handshake details.
     * @returns {boolean} True if all required fields are present, false otherwise.
     */
    function validateHandshakeIntegrity(handshakeDetails) {
        const mandatoryFields = [
            'resourcePath', 'upgradeHeader', 'connectionHeader', 'hostName',
            'clientOrigin', 'challengeKey1', 'challengeKey2', 'challengeKey3'
        ];

        let validationPassed = true;
        for (const field of mandatoryFields) {
            if (!handshakeDetails[field]) {
                debugLogger.error(`Handshake invalid: Missing required field "${field}"`);
                validationPassed = false;
                // For Type III, we can add a specific log for the missing field and potentially return early
                return false; // Fail fast
            }
        }
        return validationPassed;
    }

    /**
     * Processes the initial WebSocket handshake from a client.
     * @param {Buffer} requestDataBuffer - The raw data buffer from the client.
     * @param {Array<RegExp>} headerMatchers - Regex patterns for parsing headers.
     * @param {net.Socket} clientStream - The client's network socket.
     * @param {Object} connectionStatusObject - Object holding the connection's state (e.g., handshaked).
     * @returns {void}
     */
    function processInitialHandshake(requestDataBuffer, headerMatchers, clientStream, connectionStatusObject) {
        if (connectionStatusObject.isHandshaken) {
            debugLogger.warn('Attempted to handshake an already handshaken connection. Aborting.');
            severConnection(clientStream);
            return;
        }

        currentHandshakeParameters = extractHandshakeDetails(requestDataBuffer, headerMatchers);
        debugLogger.info('Client handshake parameters extracted.');

        // Additional validation: check if the resource path is registered
        if (!validateHandshakeIntegrity(currentHandshakeParameters) || !isRouteRegistered(currentHandshakeParameters.resourcePath)) {
            debugLogger.error(`Handshake failed for resource: ${currentHandshakeParameters.resourcePath || 'N/A'}. Details invalid or route not found.`);
            severConnection(clientStream);
            return;
        }

        debugLogger.info('Client handshake details are valid.');

        // Construct the server's location URI
        const serverLocationUri = `ws://${currentHandshakeParameters.hostName}` +
                                  (currentHandshakeParameters.hostPort ? `:${currentHandshakeParameters.hostPort}` : '') +
                                  currentHandshakeParameters.resourcePath;
        currentHandshakeParameters.derivedLocation = serverLocationUri;

        // Use crypto module for MD5 hashing the challenge
        const cryptoModule = require('crypto');
        const md5Hasher = cryptoModule.createHash('md5');

        // Update MD5 hash with Key1, Key2, and Key3
        md5Hasher.update(convertIntToFourByteBuffer(Number(currentHandshakeParameters.challengeKey1)));
        md5Hasher.update(convertIntToFourByteBuffer(Number(currentHandshakeParameters.challengeKey2)));
        md5Hasher.update(currentHandshakeParameters.challengeKey3); // Key3 is already a buffer

        // Assemble the response header using template literals and replacement
        let finalResponseHeader = serverHandshakeResponseTemplates.join('\r\n');
        finalResponseHeader = finalResponseHeader
            .replace(/\{CLIENT_ORIGIN\}/g, currentHandshakeParameters.clientOrigin)
            .replace(/\{SERVER_LOCATION\}/g, currentHandshakeParameters.derivedLocation)
            .replace(/\{NEGOTIATED_PROTOCOL\}/g, currentHandshakeParameters.requestedProtocol || ''); // Provide default if no protocol requested

        // Append the MD5 digest (challenge response) and send
        clientStream.write(finalResponseHeader + '\r\n\r\n' + md5Hasher.digest('binary'), 'binary');
        debugLogger.info('Server handshake response sent successfully.');
        connectionStatusObject.isHandshaken = true;
    }

    /**
     * Checks if a given resource path has a registered handler.
     * @param {string} pathToCheck - The resource path to verify.
     * @returns {boolean} True if a handler is registered for the path, false otherwise.
     */
    function isRouteRegistered(pathToCheck) {
        if (!pathToCheck || typeof pathToCheck !== 'string') {
            debugLogger.warn('Attempted to check an invalid route path.');
            return false;
        }
        return Object.prototype.hasOwnProperty.call(registeredRequestHandlers, pathToCheck);
    }

    /**
     * Handles incoming data frames after the handshake is complete.
     * @param {Buffer} framePayloadBuffer - The buffer containing the WebSocket frame data.
     * @param {Object} activeConnectionsMap - Map of currently active client connections.
     * @param {string} currentSessionId - The unique identifier for the current session.
     * @returns {void}
     */
    function handleIncomingFrame(framePayloadBuffer, activeConnectionsMap, currentSessionId) {
        if (!Buffer.isBuffer(framePayloadBuffer) || framePayloadBuffer.length < 2) {
            debugLogger.warn(`Received invalid or empty frame payload from session ${currentSessionId}.`);
            return;
        }

        // Check for closing frame (0xFF 0x00)
        if (framePayloadBuffer[0] === FRAME_DELIMITER_END && framePayloadBuffer[1] === FRAME_DELIMITER_START) {
            debugLogger.info(`Client ${currentSessionId} sent a closing frame.`);
            severConnection(activeConnectionsMap[currentSessionId]);
            return;
        }

        // Validate frame start delimiter (0x00)
        if (framePayloadBuffer[0] !== FRAME_DELIMITER_START) {
            debugLogger.warn(`Invalid WebSocket frame start byte (expected 0x00) from session ${currentSessionId}.`);
            return;
        }

        // Extract content, excluding start (0x00) and end (0xFF) delimiters
        const messageContent = framePayloadBuffer.toString('utf8', 1, framePayloadBuffer.length - 1);
        debugLogger.info(`Received frame data from ${currentSessionId}: "${messageContent}"`);

        // If a handler is registered for the resource path, invoke it
        const currentResource = currentHandshakeParameters.resourcePath;
        if (isRouteRegistered(currentResource)) {
            const handler = registeredRequestHandlers[currentResource];
            if (typeof handler === 'function') {
                try {
                    handler.call(selfInstanceReference, messageContent, activeConnectionsMap, currentSessionId);
                } catch (error) {
                    debugLogger.error(`Error executing handler for resource "${currentResource}": ${error.message}`);
                }
            } else {
                debugLogger.warn(`Handler for resource "${currentResource}" is not a function.`);
            }
        } else {
            debugLogger.warn(`No handler registered for resource "${currentResource}".`);
        }
    }

    /**
     * Sends a WebSocket data frame to a client.
     * @param {string} messageToSend - The string message to encapsulate in a frame.
     * @param {net.Socket} targetOutputStream - The client's socket stream to write to.
     */
    this.sendWebSocketFrame = function(messageToSend, targetOutputStream) {
        if (!targetOutputStream || typeof targetOutputStream.write !== 'function') {
            debugLogger.error('Cannot send frame: Invalid output stream provided.');
            return;
        }
        if (typeof messageToSend !== 'string') {
            messageToSend = String(messageToSend); // Ensure it's a string
        }

        // Create a buffer for the frame, including delimiters
        const frameBuffer = Buffer.concat([
            Buffer.from([FRAME_DELIMITER_START]),
            Buffer.from(messageToSend, 'utf8'),
            Buffer.from([FRAME_DELIMITER_END])
        ]);
        targetOutputStream.write(frameBuffer);
    };

    /**
     * Initializes and starts the WebSocket server.
     * @param {number} [listenPort] - The port number to listen on. Defaults to 8080.
     * @param {string} [listenAddress] - The IP address to listen on. Defaults to '127.0.0.1'.
     * @returns {WebSocketConnectionManager} The current instance for chaining.
     */
    this.initiateServer = function(listenPort, listenAddress) {
        this.serverPort = listenPort || DEFAULT_PORT_NUMBER;
        this.serverIpAddress = listenAddress || DEFAULT_IP_ADDRESS;

        this.activeServerInstance = networkModule.createServer(clientConnection => {
            // State object for each individual client connection
            const connectionStatus = {
                isHandshaken: false
            };

            clientConnection.on('connect', () => {
                // Generate a unique session ID for the client
                clientConnection.uniqueSessionId = `${clientConnection.remoteAddress}:${clientConnection.remotePort}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
                connectedClientSockets[clientConnection.uniqueSessionId] = clientConnection;
                debugLogger.info(`New client connected. Session ID: [${clientConnection.uniqueSessionId}]`);
                debugLogger.info(`Total active clients: ${Object.keys(connectedClientSockets).length}`);
            });

            clientConnection.on('data', incomingBuffer => {
                if (!Buffer.isBuffer(incomingBuffer) || incomingBuffer.length === 0) {
                    debugLogger.warn(`Received empty or invalid data from ${clientConnection.uniqueSessionId}.`);
                    return;
                }

                if (!connectionStatus.isHandshaken) {
                    // Process initial WebSocket handshake
                    processInitialHandshake(incomingBuffer, clientHandshakePatterns, clientConnection, connectionStatus);
                } else {
                    // Handle subsequent data frames
                    handleIncomingFrame(incomingBuffer, connectedClientSockets, clientConnection.uniqueSessionId);
                }
            });

            clientConnection.on('end', () => {
                debugLogger.info(`Client connection ended for [${clientConnection.uniqueSessionId}].`);
            });

            clientConnection.on('close', () => {
                // Clean up resources for the closed connection
                if (clientConnection.uniqueSessionId && connectedClientSockets[clientConnection.uniqueSessionId]) {
                    delete connectedClientSockets[clientConnection.uniqueSessionId];
                    debugLogger.info(`Client [${clientConnection.uniqueSessionId}] disconnected and cleaned up.`);
                    debugLogger.info(`Remaining active clients: ${Object.keys(connectedClientSockets).length}`);
                } else {
                    debugLogger.debug('Closed a connection without a registered session ID or already cleaned up.');
                }
                clientConnection.destroy(); // Ensure socket is fully destroyed
            });

            clientConnection.on('error', (err) => {
                debugLogger.error(`Socket error for [${clientConnection.uniqueSessionId}]: ${err.message}`);
                severConnection(clientConnection);
            });
        });

        this.activeServerInstance.on('close', () => {
            debugLogger.info('WebSocket server instance has been gracefully closed.');
        });

        this.activeServerInstance.on('error', (err) => {
            debugLogger.error(`Server encountered an error: ${err.message}`);
            // Attempt to close all client connections if server itself errors out
            selfInstanceReference.shutdownServer();
        });


        this.activeServerInstance.listen(this.serverPort, this.serverIpAddress, () => {
            debugLogger.info(`WebSocket server listening on ${this.serverIpAddress}:${this.serverPort}`);
        });

        return this; // Allow method chaining
    };

    /**
     * Shuts down the WebSocket server and terminates all active client connections.
     */
    this.shutdownServer = function() {
        debugLogger.info('Initiating server shutdown process...');
        // Iterate over a copy of keys to avoid issues with map modification during iteration
        for (const sessionId of Object.keys(connectedClientSockets)) {
            const clientSocket = connectedClientSockets[sessionId];
            if (clientSocket) {
                debugLogger.debug(`Terminating client connection: ${sessionId}`);
                severConnection(clientSocket);
                if (clientSocket.destroyed === false) { // If not already destroyed by .end()
                    clientSocket.destroy();
                }
            }
            delete connectedClientSockets[sessionId]; // Explicitly remove from map
        }
        debugLogger.info('All client connections terminated.');

        if (this.activeServerInstance && typeof this.activeServerInstance.close === 'function') {
            this.activeServerInstance.close(() => {
                debugLogger.info('Server listener has been closed.');
                this.activeServerInstance = null;
            });
        } else {
            debugLogger.warn('No active server instance to close or it was already closed.');
        }
    };

    /**
     * Registers a callback function to handle requests for a specific resource path.
     * @param {string} resourcePath - The path (e.g., '/chat') for which to register the handler.
     * @param {Function} callbackFunction - The function to execute when a request for the path is received.
     * @returns {WebSocketConnectionManager} The current instance for chaining.
     */
    this.registerRouteHandler = function(resourcePath, callbackFunction) {
        if (typeof resourcePath !== 'string' || resourcePath.trim() === '') {
            debugLogger.error('Cannot register route: Invalid resource path provided.');
            return this;
        }
        if (typeof callbackFunction === 'function') {
            registeredRequestHandlers[resourcePath] = callbackFunction;
            debugLogger.info(`Route handler registered for path: "${resourcePath}"`);
        } else {
            debugLogger.error(`Cannot register route for "${resourcePath}": Provided handler is not a function.`);
        }
        return this; // Allow method chaining
    };
};

// Export the main constructor function
module.exports = WebSocketConnectionManager;