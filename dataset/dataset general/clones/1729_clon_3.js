(function() {
    /**
     * Configuration settings for the XMPP client.
     * @typedef {object} ClientConfiguration
     * @property {string} accountIdentifier - The full JID (Jabber ID) for authentication.
     * @property {string} authSecret - The password for the JID.
     * @property {string} libraryModulePath - Relative path to the XMPP library.
     */
    const clientConfiguration = {
        accountIdentifier: "echo.localdomain", // Renamed 'jid'
        authSecret: "securePass123",           // Renamed 'password'
        libraryModulePath: "../xmpp"
    };

    // Import the necessary XMPP client library.
    // This module provides functionalities for XMPP communication.
    const jabberProtocolHandler = require(clientConfiguration.libraryModulePath); // Renamed 'xmpp'

    // Initialize the XMPP connection management object.
    // This instance will handle all network communication and stanza processing.
    const activeConnection = new jabberProtocolHandler.Connection(); // Renamed 'conn'

    // Define constants for various XMPP message attributes and elements
    // to improve readability and maintainability.
    const JABBER_MESSAGE_TYPE = "message";
    const JABBER_CHAT_TYPE = "chat";
    const JABBER_BODY_ELEMENT = "body";
    const JABBER_FROM_ATTRIBUTE = "from";
    const JABBER_TO_ATTRIBUTE = "to";

    /**
     * A custom logging utility for the XMPP connection events.
     * This function formats and outputs messages to the console, differentiating
     * between standard logs and errors/warnings based on severity.
     * @param {jabberProtocolHandler.LogLevel} severity - The log level (e.g., DEBUG, INFO, ERROR).
     * @param {string} logMessage - The message content to be logged.
     */
    activeConnection.customLogger = function(severity, logMessage) { // Renamed 'conn.log'
        const currentTimestamp = new Date().toISOString();
        const formattedOutput = `[${currentTimestamp}] [${severity.toUpperCase()}] ${logMessage}`;

        if (severity === jabberProtocolHandler.LogLevel.ERROR || severity === jabberProtocolHandler.LogLevel.WARN || severity === jabberProtocolHandler.LogLevel.CRITICAL) {
            console.error(formattedOutput); // Use console.error for critical messages
        } else {
            console.log(formattedOutput); // Use console.log for general debug/info
        }
    };

    /**
     * Constructs and returns an XMPP reply stanza based on an incoming message.
     * This function extracts relevant information from the original stanza
     * and formats a response.
     * @param {object} incomingStanza - The original XMPP message object.
     * @returns {object|null} The constructed reply stanza or null if critical data is missing.
     */
    function formulateReplyStanza(incomingStanza) {
        // Ensure the incoming stanza has the necessary attributes for a reply.
        if (!incomingStanza || typeof incomingStanza.getAttribute !== 'function') {
            activeConnection.customLogger(jabberProtocolHandler.LogLevel.ERROR, "Attempted to formulate reply for an invalid or incomplete stanza.");
            return null;
        }

        const originalSender = incomingStanza.getAttribute(JABBER_FROM_ATTRIBUTE);
        const originalRecipient = incomingStanza.getAttribute(JABBER_TO_ATTRIBUTE); // The original recipient becomes the new sender

        // Extract the body content from the incoming message.
        // Provide a default response if the body is empty or missing.
        const bodyElement = incomingStanza.getChild(JABBER_BODY_ELEMENT);
        let responseContent = "Acknowledged your message."; // Default reply content

        if (bodyElement && typeof bodyElement.getText === 'function') {
            const extractedText = bodyElement.getText();
            if (typeof extractedText === 'string' && extractedText.trim().length > 0) {
                responseContent = extractedText; // Use the original message body as the reply
            }
        } else {
            activeConnection.customLogger(jabberProtocolHandler.LogLevel.DEBUG, `No discernible body found in message from ${originalSender}. Sending default acknowledgment.`);
        }

        // Build the outgoing message stanza using the fluent API provided by the XMPP library.
        const replyMessage = jabberProtocolHandler.message({
            to: originalSender,       // Reply to the original sender
            from: originalRecipient,  // Set the 'from' attribute to the original recipient's JID
            type: JABBER_CHAT_TYPE    // Specify the message type as 'chat'
        }).c(JABBER_BODY_ELEMENT)     // Add a 'body' child element
          .t(responseContent);        // Set the text content of the 'body' element

        return replyMessage;
    }

    /**
     * Primary handler for incoming XMPP message stanzas.
     * This function is registered with the connection to process all received messages,
     * formulate a reply, and send it back to the sender.
     * @param {object} receivedStanza - The XMPP message object received from the server.
     */
    function processReceivedStanza(receivedStanza) { // Renamed 'onMessage'
        activeConnection.customLogger(jabberProtocolHandler.LogLevel.INFO, `Incoming stanza from ${receivedStanza.getAttribute(JABBER_FROM_ATTRIBUTE)}: ${receivedStanza.getChild(JABBER_BODY_ELEMENT)?.getText() || '[Body Empty]'}`);

        try {
            const outboundStanza = formulateReplyStanza(receivedStanza);

            if (outboundStanza) {
                activeConnection.send(outboundStanza);
                activeConnection.customLogger(jabberProtocolHandler.LogLevel.DEBUG, `Reply successfully dispatched to ${receivedStanza.getAttribute(JABBER_FROM_ATTRIBUTE)}.`);
            } else {
                activeConnection.customLogger(jabberProtocolHandler.LogLevel.WARN, `Failed to prepare a reply for stanza from ${receivedStanza.getAttribute(JABBER_FROM_ATTRIBUTE)}.`);
            }
        } catch (transmissionError) {
            activeConnection.customLogger(jabberProtocolHandler.LogLevel.ERROR, `An error occurred during reply transmission: ${transmissionError.message}`);
            // Optionally, add more robust error handling or retry logic here.
        }
    }

    /**
     * Registers the primary message handler with the XMPP connection.
     * This ensures that all incoming XMPP message stanzas are routed to `processReceivedStanza`.
     */
    function activateStanzaProcessors() {
        // Register a handler for 'message' stanzas.
        // The null values indicate that the handler should apply to all namespaces,
        // types, IDs, and senders for 'message' elements.
        activeConnection.addHandler(
            processReceivedStanza,  // The function to call when a matching stanza is received
            null,                   // Namespace (e.g., 'jabber:client') - null for any
            JABBER_MESSAGE_TYPE,    // Element name ('message')
            null,                   // Type (e.g., 'chat', 'groupchat') - null for any
            null,                   // ID (specific message ID) - null for any
            null                    // From (sender JID) - null for any
        );
        activeConnection.customLogger(jabberProtocolHandler.LogLevel.INFO, "XMPP message handler successfully activated.");
    }

    /**
     * Initiates the connection to the XMPP server using the provided credentials
     * and sets up a callback to manage connection status updates.
     */
    function commenceClientOperation() {
        activeConnection.connect(
            clientConfiguration.accountIdentifier,
            clientConfiguration.authSecret,
            function(connectionStatus, failureReason) { // Renamed 'status', 'condition'
                activeConnection.customLogger(jabberProtocolHandler.LogLevel.DEBUG, `Connection state update: ${connectionStatus}, Details: ${failureReason || 'No specific reason provided'}`);

                // Use a switch statement for more explicit handling of different connection states.
                switch (connectionStatus) {
                    case jabberProtocolHandler.Status.CONNECTED:
                        activeConnection.customLogger(jabberProtocolHandler.LogLevel.INFO, "XMPP client successfully established connection!");
                        activateStanzaProcessors(); // Register handlers only after connection is established
                        break;
                    case jabberProtocolHandler.Status.DISCONNECTED:
                        activeConnection.customLogger(jabberProtocolHandler.LogLevel.ERROR, `Client disconnected from server: ${failureReason || 'Unknown cause'}.`);
                        // A real-world application might implement a reconnection strategy here.
                        break;
                    case jabberProtocolHandler.Status.CONNECTING:
                        activeConnection.customLogger(jabberProtocolHandler.LogLevel.INFO, "Attempting to establish connection with XMPP server...");
                        break;
                    case jabberProtocolHandler.Status.AUTHFAIL:
                        activeConnection.customLogger(jabberProtocolHandler.LogLevel.CRITICAL, `Authentication failed for account: ${clientConfiguration.accountIdentifier}. Reason: ${failureReason || 'Invalid credentials'}`);
                        // Critical error, exit the process as connection cannot be established.
                        process.exit(1);
                        break;
                    case jabberProtocolHandler.Status.CONNFAIL:
                        activeConnection.customLogger(jabberProtocolHandler.LogLevel.CRITICAL, `Connection attempt failed: ${failureReason || 'Network or server issue'}.`);
                        process.exit(1);
                        break;
                    default:
                        activeConnection.customLogger(jabberProtocolHandler.LogLevel.WARN, `Received unhandled connection state: ${connectionStatus}` + (failureReason ? ` (Reason: ${failureReason})` : ''));
                        break;
                }
            }
        );
    }

    // Initiate the client's operation by starting the connection process.
    commenceClientOperation();

})();