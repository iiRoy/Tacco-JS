/*
 * Copyright (C) 2024 Re-engineered by AI Code Clone Generator
 * Original work by Jeff Mesnil (http://jmesnil.net/) and FuseSource, Inc. (http://fusesource.com)
 * This is a Type III clone, featuring extensive structural and semantic modifications
 * while preserving the core functionality.
 */

(function() {
  // Alias for Object.prototype.hasOwnProperty, used for robust property checks.
  // Changed to use modern Object.hasOwn where available, or fallback.
  const hasOwnProp = Object.hasOwn || ((obj, prop) => Object.prototype.hasOwnProperty.call(obj, prop));

  /**
   * Defines the core messaging protocol utilities for creating, parsing, and serializing frames.
   * This object serves as the central hub for protocol-level operations.
   */
  const MessageProtocol = {
    /**
     * Constructs a protocol frame object from command, headers, and body.
     * @param {string} cmdType - The command type (e.g., 'CONNECT', 'SEND').
     * @param {Object} [metadata={}] - Key-value pairs for frame headers.
     * @param {string} [payloadContent=''] - The body of the frame.
     * @returns {Object} A frame object with structured properties and a toString method.
     */
    createFrame: function(cmdType, metadata = {}, payloadContent = '') {
      // Ensure metadata is an object and payloadContent is a string.
      // Using nullish coalescing for cleaner defaults.
      metadata = metadata ?? {};
      payloadContent = payloadContent ?? '';

      // Create a new frame object with standard properties.
      // Property names have been changed for clarity.
      const protocolFrame = {
        commandType: cmdType,
        metadata: metadata,
        payload: payloadContent,
        // Extract common header values for direct access, if they exist.
        frameIdentifier: metadata.id,
        receiptIdentifier: metadata.receipt,
        transactionRef: metadata.transaction,
        targetDestination: metadata.destination,
        subscriptionRef: metadata.subscription,
        // Error property is initialized to null, might be set later by other logic.
        errorStatus: null,

        /**
         * Serializes the frame object into a string suitable for network transmission.
         * This method now uses template literals and Object.entries for a more modern approach.
         * @returns {string} The serialized frame string.
         */
        toString: function() {
          // Start with the command type.
          const serializedParts = [this.commandType];

          // Iterate over metadata properties to build header lines.
          // Using Object.entries avoids the need for hasOwnProperty check directly.
          for (const [headerKey, headerValue] of Object.entries(this.metadata)) {
            // Ensure header values are stringified if they are not already.
            serializedParts.push(`${headerKey}:${String(headerValue)}`);
          }

          // Add a blank line to separate headers from the body.
          // Then append the payload.
          serializedParts.push('', this.payload);

          // Join all parts with newline characters.
          return serializedParts.join('\n');
        }
      };
      return protocolFrame;
    },

    /**
     * Parses a raw message string received from the server into a structured frame object.
     * This function has been refactored to use more modern string manipulation methods
     * and to include basic validation.
     * @param {string} rawInputMessage - The raw message string.
     * @returns {Object} A parsed frame object.
     * @throws {Error} If the message format is invalid.
     */
    parseMessage: function(rawInputMessage) {
      if (!rawInputMessage || typeof rawInputMessage !== 'string' || rawInputMessage.length < 3) {
        throw new Error("Invalid or empty message received for parsing.");
      }

      // Split the message into header and body parts using the double newline separator.
      // Using indexOf to find the separator and then substring for more control.
      const headerBodySeparatorIndex = rawInputMessage.indexOf('\n\n');
      if (headerBodySeparatorIndex === -1) {
        // If no double newline, it's either just a command or malformed.
        // Assume it's a simple command without headers or body.
        const commandOnly = rawInputMessage.split('\0')[0].trim();
        return MessageProtocol.createFrame(commandOnly);
      }

      // Extract header section and body section.
      const headerSection = rawInputMessage.substring(0, headerBodySeparatorIndex);
      // The body starts after the separator, and we need to remove any trailing null byte.
      const bodySectionRaw = rawInputMessage.substring(headerBodySeparatorIndex + 2);
      const bodyContent = bodySectionRaw.split('\0')[0]; // Remove null terminator if present.

      // Split header section into individual lines.
      const headerLines = headerSection.split('\n');
      // The first line is always the command.
      const frameCommand = headerLines.shift().trim();

      // Parse remaining header lines into a key-value object.
      const parsedHeaders = {};
      for (const line of headerLines) {
        if (!line.trim()) continue; // Skip empty lines.
        const colonIndex = line.indexOf(':');
        if (colonIndex > 0) {
          const headerKey = line.substring(0, colonIndex).trim();
          const headerValue = line.substring(colonIndex + 1).trim();
          parsedHeaders[headerKey] = headerValue;
        }
      }
      return MessageProtocol.createFrame(frameCommand, parsedHeaders, bodyContent);
    },

    /**
     * Serializes a command, headers, and body into a complete protocol message string,
     * including the null terminator.
     * @param {string} commandAction - The command type.
     * @param {Object} metadata - Frame headers.
     * @param {string} payload - The frame body.
     * @returns {string} The fully serialized message string with null terminator.
     */
    serializeMessage: function(commandAction, metadata, payload) {
      // Build the frame and then append the null terminator.
      const serialized = MessageProtocol.createFrame(commandAction, metadata, payload).toString();
      return serialized + '\0';
    },

    /**
     * Factory method to create a new ConnectionAgent instance.
     * @param {string} connectionEndpoint - The WebSocket URL for the STOMP connection.
     * @returns {ConnectionAgent} A new instance of the ConnectionAgent.
     */
    createConnection: function(connectionEndpoint) {
      return new ConnectionAgent(connectionEndpoint);
    }
  };

  /**
   * Manages a STOMP over WebSocket connection.
   * This class encapsulates the WebSocket communication and STOMP protocol handling.
   * Renamed from Client to ConnectionAgent for broader semantic meaning.
   */
  const ConnectionAgent = (function() {

    /**
     * Constructor for ConnectionAgent.
     * Initializes connection state and internal data structures.
     * @param {string} socketEndpoint - The WebSocket URL.
     */
    function ConnectionAgent(socketEndpoint) {
      this.socketEndpoint = socketEndpoint;
      this.idGenerator = 0; // Used for generating unique subscription IDs.
      this.isConnected = false; // Tracks the current connection status.
      this.activeSubscriptions = {}; // Stores callback functions for active subscriptions.
      this.socketInstance = null; // The underlying WebSocket object.
      this.connectionAttemptCount = 0; // Tracks number of connection attempts.
      this.debugLogger = null; // Optional debug function.
      this.connectionTimeout = null; // Timer for connection timeout.
    }

    /**
     * Internal method to send a STOMP frame over the WebSocket.
     * Includes debugging output and basic error handling.
     * @param {string} actionType - The STOMP command.
     * @param {Object} frameMetadata - Headers for the frame.
     * @param {string} frameContent - Body of the frame.
     * @returns {void}
     */
    ConnectionAgent.prototype._sendProtocolFrame = function(actionType, frameMetadata, frameContent) {
      // Validate socket instance availability.
      if (!this.socketInstance || this.socketInstance.readyState !== WebSocket.OPEN) {
        if (typeof this.debugLogger === "function") {
          this.debugLogger(`WARNING: Attempted to send frame '${actionType}' but WebSocket is not open.`);
        }
        return; // Early exit if socket isn't ready.
      }

      const serializedFrame = MessageProtocol.serializeMessage(actionType, frameMetadata, frameContent);
      if (typeof this.debugLogger === "function") {
        this.debugLogger(`>>> Sending frame: ${actionType}\n${serializedFrame.trim()}`);
      }
      this.socketInstance.send(serializedFrame);
    };

    /**
     * Initiates the WebSocket connection and performs the STOMP CONNECT handshake.
     * Refactored to handle connection parameters and callbacks more explicitly.
     * @param {string} userLogin - User login for STOMP CONNECT.
     * @param {string} userPasscode - User passcode for STOMP CONNECT.
     * @param {function} onConnectSuccess - Callback upon successful connection.
     * @param {function} [onConnectFailure] - Optional callback for connection errors.
     * @returns {void}
     */
    ConnectionAgent.prototype.initiateConnection = function(userLogin, userPasscode, onConnectSuccess, onConnectFailure) {
      // Guard clause for already connected state.
      if (this.isConnected) {
        if (typeof this.debugLogger === "function") {
          this.debugLogger("Already connected. Skipping new connection attempt.");
        }
        return;
      }

      this.connectionAttemptCount++;
      if (typeof this.debugLogger === "function") {
        this.debugLogger(`Attempting Web Socket connection (${this.connectionAttemptCount})...`);
      }

      // Determine the WebSocket provider. Allows for mocking in test environments.
      // Using globalThis for broader compatibility.
      const socketProvider = globalThis.MockSocket || WebSocket;

      // Initialize the WebSocket. The third parameter is custom and might not be supported by all WebSocket implementations.
      // It's kept for backward compatibility with the original library's mock.
      this.socketInstance = new socketProvider(this.socketEndpoint, undefined, {
        debug: true,
        devel: true
      });

      // Set binary type for handling ArrayBuffer messages.
      this.socketInstance.binaryType = "arraybuffer";

      const selfInstance = this; // Capture 'this' for use in event handlers.

      /**
       * Handles incoming messages from the WebSocket.
       * Decodes ArrayBuffer messages and parses STOMP frames.
       * @param {MessageEvent} eventData - The WebSocket message event.
       */
      this.socketInstance.onmessage = function(eventData) {
        let rawMessageData;

        // Convert received data to string. Handles both string and ArrayBuffer types.
        if (typeof ArrayBuffer !== 'undefined' && eventData.data instanceof ArrayBuffer) {
          const byteView = new Uint8Array(eventData.data);
          if (typeof selfInstance.debugLogger === "function") {
            selfInstance.debugLogger(`--- Received binary data length: ${byteView.length}`);
          }
          // Use TextDecoder for more efficient and robust ArrayBuffer to string conversion.
          if (typeof TextDecoder !== 'undefined') {
            rawMessageData = new TextDecoder().decode(byteView);
          } else {
            // Fallback for environments without TextDecoder.
            rawMessageData = String.fromCharCode.apply(null, byteView);
          }
        } else {
          rawMessageData = eventData.data;
        }

        if (typeof selfInstance.debugLogger === "function") {
          selfInstance.debugLogger(`<<< Received raw message:\n${rawMessageData.trim()}`);
        }

        // Parse the raw message into a STOMP frame.
        let parsedFrame;
        try {
          parsedFrame = MessageProtocol.parseMessage(rawMessageData);
        } catch (e) {
          if (typeof selfInstance.debugLogger === "function") {
            selfInstance.debugLogger(`Error parsing message: ${e.message}. Raw data: ${rawMessageData}`);
          }
          return; // Skip processing malformed frames.
        }

        // Handle different frame command types.
        switch (parsedFrame.commandType) {
          case "CONNECTED":
            selfInstance.isConnected = true;
            if (selfInstance.connectionTimeout) {
              clearTimeout(selfInstance.connectionTimeout);
              selfInstance.connectionTimeout = null;
            }
            if (typeof onConnectSuccess === "function") {
              onConnectSuccess(parsedFrame);
            }
            break;
          case "MESSAGE":
            const subscriptionId = parsedFrame.metadata.subscription;
            const subscriptionHandler = selfInstance.activeSubscriptions[subscriptionId];
            if (typeof subscriptionHandler === "function") {
              subscriptionHandler(parsedFrame);
            } else {
              if (typeof selfInstance.debugLogger === "function") {
                selfInstance.debugLogger(`No handler found for subscription ID: ${subscriptionId}`);
              }
            }
            break;
            // Add more cases for other frame types like ERROR, RECEIPT if needed.
          default:
            if (typeof selfInstance.debugLogger === "function") {
              selfInstance.debugLogger(`Unhandled frame command: ${parsedFrame.commandType}`);
            }
        }
      };

      /**
       * Handles WebSocket closure events.
       */
      this.socketInstance.onclose = function() {
        selfInstance.isConnected = false;
        const disconnectReason = `Connection to ${selfInstance.socketEndpoint} was lost.`;
        if (typeof selfInstance.debugLogger === "function") {
          selfInstance.debugLogger(`WebSocket Closed: ${disconnectReason}`);
        }
        // Invoke the error callback if provided, or a default one.
        if (typeof onConnectFailure === "function") {
          onConnectFailure(disconnectReason);
        } else if (typeof selfInstance.debugLogger === "function") {
          selfInstance.debugLogger("No specific error callback provided for connection loss.");
        }
      };

      /**
       * Handles WebSocket open event. Sends the STOMP CONNECT frame.
       */
      this.socketInstance.onopen = function() {
        if (typeof selfInstance.debugLogger === "function") {
          selfInstance.debugLogger('Web Socket connection established.');
        }
        // Send the STOMP CONNECT frame with provided credentials.
        selfInstance._sendProtocolFrame("CONNECT", {
          login: userLogin,
          passcode: userPasscode,
          "accept-version": "1.1,1.2", // Request supported STOMP versions.
          "heart-beat": "10000,10000" // Suggest heart-beat.
        });

        // Set a timeout for the CONNECT frame response.
        selfInstance.connectionTimeout = setTimeout(() => {
          if (!selfInstance.isConnected) {
            const timeoutMsg = "STOMP CONNECT frame response timed out.";
            if (typeof selfInstance.debugLogger === "function") {
              selfInstance.debugLogger(timeoutMsg);
            }
            selfInstance.socketInstance.close(); // Close the socket if no CONNECTED frame received.
            if (typeof onConnectFailure === "function") {
              onConnectFailure(timeoutMsg);
            }
          }
        }, 5000); // 5 seconds timeout for CONNECTED frame.
      };

      // Store the success callback for potential re-use or reference.
      this.successCallback = onConnectSuccess;
    };

    /**
     * Terminates the STOMP connection.
     * @param {function} [onDisconnectComplete] - Optional callback after disconnection.
     * @returns {void}
     */
    ConnectionAgent.prototype.terminateConnection = function(onDisconnectComplete) {
      if (!this.isConnected) {
        if (typeof this.debugLogger === "function") {
          this.debugLogger("Not connected, skipping disconnect.");
        }
        if (typeof onDisconnectComplete === "function") onDisconnectComplete();
        return;
      }

      this._sendProtocolFrame("DISCONNECT", {
        receipt: `disconnect-${this.idGenerator++}`
      }); // Send DISCONNECT frame with a receipt.

      // Close the underlying WebSocket.
      this.socketInstance.close();
      this.isConnected = false;
      if (typeof this.debugLogger === "function") {
        this.debugLogger("Connection terminated.");
      }
      if (typeof onDisconnectComplete === "function") {
        onDisconnectComplete();
      }
    };

    /**
     * Sends a message to a specific destination.
     * @param {string} targetDestination - The topic or queue to send to.
     * @param {Object} [headerOptions={}] - Additional headers for the SEND frame.
     * @param {string} [payloadContent=''] - The message body.
     * @returns {void}
     */
    ConnectionAgent.prototype.sendMessage = function(targetDestination, headerOptions = {}, payloadContent = '') {
      if (!this.isConnected) {
        if (typeof this.debugLogger === "function") this.debugLogger("Cannot send message: Not connected.");
        return;
      }
      headerOptions.destination = targetDestination;
      this._sendProtocolFrame("SEND", headerOptions, payloadContent);
    };

    /**
     * Subscribes to a destination to receive messages.
     * @param {string} topicPath - The destination path to subscribe to.
     * @param {function} messageProcessor - Callback function to handle incoming messages for this subscription.
     * @param {Object} [subHeaders={}] - Additional headers for the SUBSCRIBE frame.
     * @returns {string} The unique subscription ID.
     */
    ConnectionAgent.prototype.subscribeToDestination = function(topicPath, messageProcessor, subHeaders = {}) {
      if (!this.isConnected) {
        if (typeof this.debugLogger === "function") this.debugLogger("Cannot subscribe: Not connected.");
        return null;
      }
      if (!topicPath || typeof messageProcessor !== 'function') {
        throw new Error("Invalid topic path or message processor for subscription.");
      }

      const subscriptionIdentifier = `sub-${this.idGenerator++}`;
      subHeaders.destination = topicPath;
      subHeaders.id = subscriptionIdentifier; // STOMP 1.1+ uses 'id' for subscriptions.

      this.activeSubscriptions[subscriptionIdentifier] = messageProcessor;
      this._sendProtocolFrame("SUBSCRIBE", subHeaders);
      return subscriptionIdentifier;
    };

    /**
     * Unsubscribes from a previously established subscription.
     * @param {string} subId - The ID of the subscription to unsubscribe from.
     * @param {Object} [unsubHeaders={}] - Additional headers for the UNSUBSCRIBE frame.
     * @returns {void}
     */
    ConnectionAgent.prototype.unsubscribeFromDestination = function(subId, unsubHeaders = {}) {
      if (!this.isConnected) {
        if (typeof this.debugLogger === "function") this.debugLogger("Cannot unsubscribe: Not connected.");
        return;
      }
      if (!subId) {
        if (typeof this.debugLogger === "function") this.debugLogger("Cannot unsubscribe: No subscription ID provided.");
        return;
      }

      unsubHeaders.id = subId;
      delete this.activeSubscriptions[subId]; // Remove the handler from active subscriptions.
      this._sendProtocolFrame("UNSUBSCRIBE", unsubHeaders);
    };

    /**
     * Begins a new transaction.
     * @param {string} transactionId - The unique ID for this transaction.
     * @param {Object} [txHeaders={}] - Additional headers for the BEGIN frame.
     * @returns {void}
     */
    ConnectionAgent.prototype.beginTransaction = function(transactionId, txHeaders = {}) {
      if (!this.isConnected) {
        if (typeof this.debugLogger === "function") this.debugLogger("Cannot begin transaction: Not connected.");
        return;
      }
      txHeaders.transaction = transactionId;
      this._sendProtocolFrame("BEGIN", txHeaders);
    };

    /**
     * Commits an active transaction.
     * @param {string} transactionId - The ID of the transaction to commit.
     * @param {Object} [txHeaders={}] - Additional headers for the COMMIT frame.
     * @returns {void}
     */
    ConnectionAgent.prototype.commitTransaction = function(transactionId, txHeaders = {}) {
      if (!this.isConnected) {
        if (typeof this.debugLogger === "function") this.debugLogger("Cannot commit transaction: Not connected.");
        return;
      }
      txHeaders.transaction = transactionId;
      this._sendProtocolFrame("COMMIT", txHeaders);
    };

    /**
     * Aborts an active transaction.
     * @param {string} transactionId - The ID of the transaction to abort.
     * @param {Object} [txHeaders={}] - Additional headers for the ABORT frame.
     * @returns {void}
     */
    ConnectionAgent.prototype.abortTransaction = function(transactionId, txHeaders = {}) {
      if (!this.isConnected) {
        if (typeof this.debugLogger === "function") this.debugLogger("Cannot abort transaction: Not connected.");
        return;
      }
      txHeaders.transaction = transactionId;
      this._sendProtocolFrame("ABORT", txHeaders);
    };

    /**
     * Acknowledges a received message.
     * @param {string} messageReferenceId - The message-id of the message being acknowledged.
     * @param {Object} [ackHeaders={}] - Additional headers for the ACK frame.
     * @returns {void}
     */
    ConnectionAgent.prototype.acknowledgeMessage = function(messageReferenceId, ackHeaders = {}) {
      if (!this.isConnected) {
        if (typeof this.debugLogger === "function") this.debugLogger("Cannot acknowledge message: Not connected.");
        return;
      }
      ackHeaders["ack-id"] = messageReferenceId; // Using 'ack-id' as an alternative to 'message-id' for ACK.
      this._sendProtocolFrame("ACK", ackHeaders);
    };

    /**
     * Sets a custom debug logger function.
     * @param {function} loggerFn - A function that takes a string argument for logging.
     * @returns {void}
     */
    ConnectionAgent.prototype.setDebugLogger = function(loggerFn) {
      if (typeof loggerFn === 'function') {
        this.debugLogger = loggerFn;
      } else {
        this.debugLogger = null; // Clear logger if not a function.
        console.warn("Provided debug logger is not a function. Debug logging disabled.");
      }
    };

    return ConnectionAgent;

  })();

  // Expose the MessageProtocol object globally, adapting to browser or Node.js environments.
  if (typeof window !== "undefined" && window !== null) {
    window.MessageProtocol = MessageProtocol;
  } else if (typeof exports !== "undefined" && exports !== null) {
    // For Node.js (CommonJS) environments.
    exports.MessageProtocol = MessageProtocol;
  } else {
    // Fallback for other environments if needed.
    globalThis.MessageProtocol = MessageProtocol;
  }

}).call(this);