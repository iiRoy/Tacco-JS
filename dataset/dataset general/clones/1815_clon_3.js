// ******************************************************************************************************************
// ******************************************************************************************************************
// This variable controls which communication protocol example will be executed.
// Possible values: 'raw_ws', 'socket_io_client', 'now_js_client'

var protocolSelector = 'raw_ws'; // Default to raw WebSocket for demonstration purposes

// ******************************************************************************************************************
// ******************************************************************************************************************
// IMPORTANT: Ensure this URL is updated to your desired server endpoint for testing.

const CONNECTION_ADDRESS = 'ws://ws.websocketstest.com:80/service'; // Centralized endpoint configuration

// ******************************************************************************************************************
// ******************************************************************************************************************
// Section demonstrating a basic, raw WebSocket client implementation.

if ('raw_ws' === protocolSelector) {
    // Validate the connection address before proceeding
    if (!CONNECTION_ADDRESS || !CONNECTION_ADDRESS.startsWith('ws://')) {
        Ti.API.error("Invalid or missing WebSocket connection address. Please check CONNECTION_ADDRESS.");
        // Exit or handle error gracefully
        // For this example, we'll just log and continue, but in a real app, you might `return;`
    }

    // Attempt to initialize the WebSocket communication channel
    // Using a slightly different naming convention for the module and creator function.
    const socketModule = require('com.appcelerator.network.ws');
    let communicationChannel;

    try {
        communicationChannel = socketModule.createWebSocketClient();
        Ti.API.info('WebSocket client instance successfully created.');
    } catch (creationError) {
        Ti.API.fatal(`Failed to create WebSocket client: ${creationError.message}`);
        // Cannot proceed without a client
        return;
    }

    // Helper function for logging events
    const logChannelEvent = (logLevel, messageContext, eventPayload = {}) => {
        const fullMessage = `[WS_CHANNEL] ${messageContext} - Payload: ${JSON.stringify(eventPayload)}`;
        switch (logLevel) {
            case 'debug': Ti.API.debug(fullMessage); break;
            case 'info': Ti.API.info(fullMessage); break;
            case 'warn': Ti.API.warn(fullMessage); break;
            case 'error': Ti.API.error(fullMessage); break;
            default: Ti.API.log(fullMessage); // Fallback to generic log
        }
    };

    // Attach event handlers for various connection states and messages
    communicationChannel.on('open', (connectionEvt) => {
        logChannelEvent('info', 'Connection established', { timestamp: new Date().toISOString() });
        // Optional: Send an initial handshake message here if required by protocol
    });

    communicationChannel.on('close', (closureEvt) => {
        const closeCode = closureEvt.code || 'N/A';
        const closeReason = closureEvt.reason || 'No specific reason provided';
        logChannelEvent('warn', `Connection terminated`, { code: closeCode, reason: closeReason, clean: closureEvt.wasClean });

        // Display a user-friendly message about the closure
        const dialog = Ti.UI.createAlertDialog({
            title: 'Connection Status',
            message: `WebSocket connection closed. Code: ${closeCode}, Reason: ${closeReason}`,
            ok: 'Understood'
        });
        dialog.show();
    });

    communicationChannel.on('error', (faultEvt) => {
        const errorMessage = faultEvt.error || 'An unknown error occurred';
        logChannelEvent('error', `Channel error detected`, { details: errorMessage });
        // Consider attempting to reconnect or notifying the user more prominently
    });

    // Variables to manage session state and message flow
    let negotiatedProtocolVersion = null;
    let receivedMessageCount = 0;
    const MESSAGE_PROCESSING_THRESHOLD = 4; // Process 4 time messages before closing

    // Main message processing handler
    communicationChannel.on('message', (incomingEvt) => {
        const receivedData = incomingEvt.data;
        if (!receivedData || typeof receivedData !== 'string') {
            logChannelEvent('warn', 'Received empty or invalid message data', { data: receivedData });
            return; // Skip processing invalid messages
        }

        logChannelEvent('debug', `Raw message received: ${receivedData}`);

        const messageParts = receivedData.split(',', 2); // Split only into two parts
        const primaryCommand = messageParts[0] ? messageParts[0].trim() : '';
        const commandPayload = messageParts[1] ? messageParts[1].trim() : '';

        // Use a switch statement for command processing for better readability
        switch (primaryCommand) {
            case 'connected':
                logChannelEvent('info', `Server acknowledged connection: ${commandPayload}`);
                // Introduce a slight delay before sending the next command to simulate network latency or server processing
                setTimeout(() => {
                    communicationChannel.send("version,");
                    logChannelEvent('debug', 'Sent "version" command.');
                }, 100);
                break;

            case 'version':
                logChannelEvent('info', `Server protocol version: ${commandPayload}`);
                negotiatedProtocolVersion = commandPayload; // Store the version for later checks
                // Send an echo command with a specific test payload
                communicationChannel.send("echo,test_message_123");
                logChannelEvent('debug', 'Sent "echo" command with a custom test message.');
                break;

            case 'echo':
                // Validate the echo response against our sent payload
                const expectedEcho = 'test_message_123';
                if (commandPayload === expectedEcho) {
                    logChannelEvent('info', `Echo successful: ${commandPayload}`);
                    // Decide next action based on the negotiated protocol version
                    const isHybiDraft = negotiatedProtocolVersion && negotiatedProtocolVersion.includes('hybi-draft-07');
                    if (isHybiDraft) {
                        communicationChannel.send("ping,"); // Send ping for specific protocol
                        logChannelEvent('debug', 'Sent "ping" command based on protocol version.');
                    } else {
                        communicationChannel.send("timer,"); // Send timer for others
                        logChannelEvent('debug', 'Sent "timer" command for other protocols.');
                    }
                } else {
                    logChannelEvent('warn', `Echo response mismatch. Expected: ${expectedEcho}, Got: ${commandPayload}`);
                }
                break;

            case 'time':
                receivedMessageCount++; // Increment message counter
                logChannelEvent('info', `Time update received (${receivedMessageCount}/${MESSAGE_PROCESSING_THRESHOLD}): ${commandPayload}`);

                // Check if we've received enough 'time' messages to conclude the test
                if (receivedMessageCount >= MESSAGE_PROCESSING_THRESHOLD) {
                    logChannelEvent('info', 'Reached message processing threshold. Closing connection.');
                    communicationChannel.close(); // Gracefully close the connection
                    
                    // Show a completion message to the user
                    const successDialog = Ti.UI.createAlertDialog({
                        title: 'Test Complete',
                        message: 'WebSocket communication test appears successful!',
                        ok: 'OK'
                    });
                    successDialog.show();
                }
                break;

            default:
                logChannelEvent('warn', `Unknown command received: ${primaryCommand}`, { fullMessage: receivedData });
                // Optionally send an error response or close the connection for unknown commands
                break;
        }
    });

    // Define custom subprotocols for the connection
    const customProtocols = ["echo-protocol-v2", "another-service-proto"];
    // Open the WebSocket connection with the specified URI and protocols
    communicationChannel.open(CONNECTION_ADDRESS, customProtocols);
    logChannelEvent('info', `Attempting to open WebSocket connection to ${CONNECTION_ADDRESS} with protocols: ${customProtocols.join(', ')}`);

}

// ******************************************************************************************************************
// ******************************************************************************************************************
// Section demonstrating usage of the socket.io client library, which leverages WebSockets.

else if ('socket_io_client' === protocolSelector) {
    Ti.API.info("Initializing Socket.IO client...");

    // Validate the connection address
    if (!CONNECTION_ADDRESS) {
        Ti.API.error("Socket.IO: Connection address is undefined. Aborting.");
        return;
    }

    // Retrieve the socket.io module
    const socketIOClient = require('socket.io');

    // Establish a connection to the server endpoint
    const activeClientSocket = socketIOClient.connect(CONNECTION_ADDRESS);

    // Register a handler for the 'connect' event
    activeClientSocket.on('connect', () => {
        Ti.API.log('Socket.IO Client: Successfully connected to the server!');
        // Emit a custom event to the server as a handshake or initial data exchange
        activeClientSocket.emit('client_ready', { clientID: 'TitaniumApp001', status: 'online' });
    });

    // Register a handler for the 'disconnect' event
    activeClientSocket.on('disconnect', (reason) => {
        Ti.API.warn(`Socket.IO Client: Disconnected from server. Reason: ${reason}`);
        // Implement reconnection logic or notify the user
    });

    // Register a handler for general errors
    activeClientSocket.on('error', (err) => {
        Ti.API.error(`Socket.IO Client: An error occurred: ${err.message}`);
    });

    // Example of receiving a custom message
    activeClientSocket.on('server_message', (data) => {
        Ti.API.info(`Socket.IO Client: Received server message: ${JSON.stringify(data)}`);
    });

    // Set a timeout to disconnect after a period for demonstration
    setTimeout(() => {
        if (activeClientSocket.connected) {
            activeClientSocket.disconnect();
            Ti.API.log("Socket.IO Client: Initiated graceful disconnection after timeout.");
        }
    }, 15000); // Disconnect after 15 seconds

}

// ******************************************************************************************************************
// ******************************************************************************************************************
// Section demonstrating usage of the now.js client library, built on top of socket.io and WebSockets.

else if ('now_js_client' === protocolSelector) {
    Ti.API.info("Initializing Now.js client...");

    // Ensure the connection endpoint is defined
    if (!CONNECTION_ADDRESS) {
        Ti.API.error("Now.js: Server endpoint is missing. Cannot initialize.");
        return;
    }

    // Initialize the Now.js client with specific configurations
    const nowJSModule = require('now');
    const nowClientInstance = nowJSModule.initializeNowClient(CONNECTION_ADDRESS, {
        // Socket.IO specific options can be passed through here
        socketIOConfiguration: {
            connectionTransports: ['websocket', 'polling'], // Prefer WebSocket, fallback to polling
            autoConnect: true, // Automatically attempt connection
            reconnectionAttempts: 5 // Try to reconnect 5 times
        },
        logLevel: 'info' // Set logging level for Now.js internals
    });

    // Access the core API for event handling
    const nowClientCoreAPI = nowClientInstance.core;

    // Register event handlers for Now.js lifecycle events
    nowClientCoreAPI.on('error', (errDetails) => {
        Ti.API.error(`Now.js Core: Encountered an error: ${errDetails.message || 'Unknown error'}`);
    });

    nowClientCoreAPI.on('ready', () => {
        Ti.API.log('Now.js Core: Client is fully initialized and ready for communication.');
        // Once ready, we can interact with server-side `now` functions
        if (nowClientInstance.server && typeof nowClientInstance.server.helloWorld === 'function') {
            nowClientInstance.server.helloWorld('Titanium User', (response) => {
                Ti.API.info(`Now.js Server: helloWorld response: ${response}`);
            });
        } else {
            Ti.API.warn('Now.js Server: "helloWorld" function not found on server object.');
        }
    });

    nowClientCoreAPI.on('disconnect', () => {
        Ti.API.log('Now.js Core: Client has disconnected from the server.');
        // Optionally trigger a reconnection attempt or update UI
    });

    // Define client-side properties and functions that can be called by the server
    nowClientInstance.userIdentification = 'titanium-user-alpha-7'; // Unique ID for this client
    nowClientInstance.secretPhraseProvider = () => {
        const secretFragment = "servabit";
        return `ille qui nos omnes ${secretFragment}`; // A slightly altered phrase
    };

    // Log the user ID after a short delay to ensure Now.js has processed it
    setTimeout(() => {
        Ti.API.debug(`Now.js Client User ID set to: ${nowClientInstance.userIdentification}`);
    }, 1000);

} else {
    // Default fallback if no protocol is selected or an unknown one is provided
    Ti.API.warn(`Unknown protocol selector: '${protocolSelector}'. No communication client initialized.`);
    const infoDialog = Ti.UI.createAlertDialog({
        title: 'Initialization Warning',
        message: `The selected protocol '${protocolSelector}' is not recognized. Please check 'protocolSelector' variable.`,
        ok: 'Dismiss'
    });
    infoDialog.show();
}