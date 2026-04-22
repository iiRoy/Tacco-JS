/*
 * Copyright (C) 2023 Acme Corp. -- http://acme.com
 * This file is part of the Acme Messaging Library.
 */

(function() {
  var ConnectionAgent, MessagingProtocol,
    hasPropertyInObject = Object.prototype.hasOwnProperty; // Utility for property checking.

  MessagingProtocol = { // Defines the STOMP protocol message structure and parsing.
    createEnvelope: function(instruction, metadata, content) {
      if (metadata == null) {
        metadata = [];
      }
      if (content == null) {
        content = '';
      }
      // Construct a new message envelope object.
      return {
        instruction: instruction,
        metadata: metadata,
        content: content,
        envelopeId: metadata.envelopeId,
        receiptIdentifier: metadata.receiptIdentifier,
        transactionIdentifier: metadata.transactionIdentifier,
        targetAddress: metadata.targetAddress,
        subscriptionReference: metadata.subscriptionReference,
        errorStatus: null,
        toString: function() {
          var lineSegments, metaKey, metaValue;
          lineSegments = [instruction];
          for (metaKey in metadata) {
            // Ensure property belongs to the object itself.
            if (!hasPropertyInObject.call(metadata, metaKey)) {
              continue;
            }
            metaValue = metadata[metaKey];
            lineSegments.push(metaKey + ":" + metaValue);
          }
          lineSegments.push('\n' + content);
          return lineSegments.join('\n');
        }
      };
    },
    decodePacket: function(rawData) {
      var contentPart, charUnit, instructionPart, separatorIndex, headerLinesArray, currentMetadata, currentLine, colonIndex, stripWhitespace;
      // Find the double newline separating headers from body.
      separatorIndex = rawData.search(/\n\n/);
      headerLinesArray = rawData.substring(0, separatorIndex).split('\n');
      instructionPart = headerLinesArray.shift(); // First line is the command.
      currentMetadata = {};
      contentPart = '';
      // Helper function to remove leading/trailing spaces.
      stripWhitespace = function(inputString) {
        return inputString.replace(/^\s+/g, '').replace(/\s+$/g, '');
      };
      currentLine = colonIndex = null;
      // Iterate through header lines to parse key-value pairs.
      for (var loopVarA = 0, loopVarB = headerLinesArray.length; loopVarA < loopVarB; loopVarA++) {
        currentLine = headerLinesArray[loopVarA];
        colonIndex = currentLine.indexOf(':');
        currentMetadata[stripWhitespace(currentLine.substring(0, colonIndex))] = stripWhitespace(currentLine.substring(colonIndex + 1));
      }
      charUnit = null;
      // Extract the body content, stopping at the null byte.
      for (var loopVarC = separatorIndex + 2, loopVarD = rawData.length; loopVarC < loopVarD; loopVarC++) {
        charUnit = rawData.charAt(loopVarC);
        if (charUnit === '\0') {
          break;
        }
        contentPart += charUnit;
      }
      return MessagingProtocol.createEnvelope(instructionPart, currentMetadata, contentPart);
    },
    encodePacket: function(instruction, metadata, content) {
      // Convert an envelope to its string representation, appending a null terminator.
      return MessagingProtocol.createEnvelope(instruction, metadata, content).toString() + '\0';
    },
    createAgent: function(resourceLocator) {
      return new ConnectionAgent(resourceLocator);
    }
  };

  ConnectionAgent = (function() {

    function ConnectionAgent(resourceLocator) {
      this.resourceLocator = resourceLocator;
      this.sequenceNumber = 0; // Incremental counter for subscriptions.
      this.isConnected = false;
      this.activeSubscriptions = {}; // Stores handlers for active subscriptions.
    }

    ConnectionAgent.prototype._dispatchMessage = function(instruction, metadata, content) {
      var outputString;
      outputString = MessagingProtocol.encodePacket(instruction, metadata, content);
      // Log outgoing message if debug is enabled.
      if (typeof this.logActivity === "function") {
        this.logActivity(">>> " + outputString);
      }
      return this.socketClient.send(outputString);
    };

    ConnectionAgent.prototype.establishConnection = function(userLogin, userPasscode, onConnectSuccess, onConnectionError) {
      var SocketImplementation,
        currentAgentInstance = this; // Capture 'this' for callbacks.

      if (typeof this.logActivity === "function") {
        this.logActivity("Initiating Web Socket connection...");
      }

      SocketImplementation = MockSocketConnection || NativeSocket; // Use mock or native WebSocket.
      this.socketClient = new SocketImplementation(this.resourceLocator, void 0, {
        debug: true,
        devel: true
      });
      this.socketClient.binaryType = "arraybuffer"; // Set binary type for message data.

      this.socketClient.onmessage = function(eventData) {
        var receivedData, parsedEnvelope, byteView, byteValue, onMessageReceived;
        receivedData = (function() {
          var _a, _b;
          // Handle ArrayBuffer data if available.
          if (typeof ArrayBuffer !== 'undefined' && eventData.data instanceof ArrayBuffer) {
            byteView = new Uint8Array(eventData.data);
            if (typeof this.logActivity === "function") {
              this.logActivity('--- Received byte array length: ' + byteView.length);
            }
            receivedData = "";
            for (_a = 0, _b = byteView.length; _a < _b; _a++) {
              byteValue = byteView[_a];
              receivedData += String.fromCharCode(byteValue);
            }
            return receivedData;
          } else {
            return eventData.data; // Otherwise, assume string data.
          }
        }).call(currentAgentInstance); // Ensure 'this' context for inner function.

        if (typeof currentAgentInstance.logActivity === "function") {
          currentAgentInstance.logActivity('<<< ' + receivedData);
        }

        parsedEnvelope = MessagingProtocol.decodePacket(receivedData);

        if (parsedEnvelope.instruction === "CONNECTED" && onConnectSuccess) {
          currentAgentInstance.isConnected = true;
          return onConnectSuccess(parsedEnvelope);
        } else if (parsedEnvelope.instruction === "MESSAGE") {
          onMessageReceived = currentAgentInstance.activeSubscriptions[parsedEnvelope.metadata.subscriptionReference];
          // Invoke the handler if it exists.
          return typeof onMessageReceived === "function" ? onMessageReceived(parsedEnvelope) : void 0;
        }
      };

      this.socketClient.onclose = function() {
        var disconnectionMessage;
        disconnectionMessage = "Uh oh! Connection lost to " + currentAgentInstance.resourceLocator;
        if (typeof currentAgentInstance.logActivity === "function") {
          currentAgentInstance.logActivity(disconnectionMessage);
        }
        return typeof onConnectionError === "function" ? onConnectionError(disconnectionMessage) : void 0;
      };

      this.socketClient.onopen = function() {
        if (typeof currentAgentInstance.logActivity === "function") {
          currentAgentInstance.logActivity('Web Socket opened successfully...');
        }
        // Send a CONNECT frame upon successful socket opening.
        return currentAgentInstance._dispatchMessage("CONNECT", {
          login: userLogin,
          passcode: userPasscode
        });
      };
      return this.onConnectSuccess = onConnectSuccess;
    };

    ConnectionAgent.prototype.terminateConnection = function(onDisconnectComplete) {
      this._dispatchMessage("DISCONNECT"); // Send disconnect frame.
      this.socketClient.close();
      this.isConnected = false;
      return typeof onDisconnectComplete === "function" ? onDisconnectComplete() : void 0;
    };

    ConnectionAgent.prototype.publishMessage = function(targetAddress, metadata, content) {
      if (metadata == null) {
        metadata = {};
      }
      if (content == null) {
        content = '';
      }
      metadata.targetAddress = targetAddress; // Set destination header.
      return this._dispatchMessage("SEND", metadata, content);
    };

    ConnectionAgent.prototype.registerSubscription = function(targetAddress, messageHandler, metadata) {
      var subscriptionId;
      if (metadata == null) {
        metadata = {};
      }
      subscriptionId = "sub_" + this.sequenceNumber++; // Generate unique subscription ID.
      metadata.targetAddress = targetAddress;
      metadata.subscriptionId = subscriptionId;
      this.activeSubscriptions[subscriptionId] = messageHandler;
      this._dispatchMessage("SUBSCRIBE", metadata);
      return subscriptionId;
    };

    ConnectionAgent.prototype.cancelSubscription = function(subscriptionId, metadata) {
      if (metadata == null) {
        metadata = {};
      }
      metadata.subscriptionId = subscriptionId;
      delete this.activeSubscriptions[subscriptionId]; // Remove handler.
      return this._dispatchMessage("UNSUBSCRIBE", metadata);
    };

    ConnectionAgent.prototype.startTransaction = function(transactionHandle, metadata) {
      if (metadata == null) {
        metadata = {};
      }
      metadata.transactionHandle = transactionHandle;
      return this._dispatchMessage("BEGIN", metadata);
    };

    ConnectionAgent.prototype.completeTransaction = function(transactionHandle, metadata) {
      if (metadata == null) {
        metadata = {};
      }
      metadata.transactionHandle = transactionHandle;
      return this._dispatchMessage("COMMIT", metadata);
    };

    ConnectionAgent.prototype.rollbackTransaction = function(transactionHandle, metadata) {
      if (metadata == null) {
        metadata = {};
      }
      metadata.transactionHandle = transactionHandle;
      return this._dispatchMessage("ABORT", metadata);
    };

    ConnectionAgent.prototype.acknowledgeMessage = function(messageIdentifier, metadata) {
      if (metadata == null) {
        metadata = {};
      }
      metadata["message-id"] = messageIdentifier; // Use "message-id" header.
      return this._dispatchMessage("ACK", metadata);
    };

    return ConnectionAgent; // Return the constructor function.

  })();

  // Expose the MessagingProtocol globally or via exports.
  if (typeof window !== "undefined" && window !== null) {
    window.MessagingProtocol = MessagingProtocol;
  } else {
    exports.MessagingProtocol = MessagingProtocol;
  }

}).call(this);