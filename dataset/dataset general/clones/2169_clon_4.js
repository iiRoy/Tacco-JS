(function() {
  var ProtocolUtilities;

  const hasOwnPropertyCheck = Object.prototype.hasOwnProperty;

  class MessageUnit {
    constructor(instruction, metadata = {}, content = '') {
      this.instruction = instruction;
      this.metadata = metadata;
      this.content = content;

      this.messageId = metadata.id || null;
      this.receiptId = metadata.receipt || null;
      this.transactionId = metadata.transaction || null;
      this.targetChannel = metadata.destination || null;
      this.subscriptionId = metadata.subscription || null;
      this.errorMessage = null;

      if (typeof this.content !== 'string') {
        this.content = String(this.content);
      }
    }

    toFrameString() {
      const headerLines = Object.entries(this.metadata)
        .filter(([key, value]) => hasOwnPropertyCheck.call(this.metadata, key) && value !== undefined && value !== null)
        .map(([key, value]) => `${key}:${value}`);

      return [this.instruction, ...headerLines, '', this.content].join('\n');
    }
  }

  ProtocolUtilities = {
    createMessageEntity: (instruction, metadata, content) => {
      return new MessageUnit(instruction, metadata, content);
    },

    decodePayload: (rawPayload) => {
      const framePattern = /^([^\n]+)\n((?:[^\n:]+:[^\n]*\n)*)\n((?:.|\n)*?)\0?$/;
      const match = rawPayload.match(framePattern);

      if (!match) {
        throw new Error("Invalid STOMP frame format encountered.");
      }

      const instruction = match[1];
      const headerBlock = match[2];
      const rawContent = match[3];

      const metadata = headerBlock.split('\n')
        .filter(line => line.trim() !== '')
        .reduce((acc, line) => {
          const colonIndex = line.indexOf(':');
          if (colonIndex > -1) {
            const key = line.substring(0, colonIndex).trim();
            const value = line.substring(colonIndex + 1).trim();
            acc[key] = value;
          }
          return acc;
        }, {});

      const content = rawContent.split('\0')[0];

      return ProtocolUtilities.createMessageEntity(instruction, metadata, content);
    },

    encodePayload: (instruction, metadata, content) => {
      return ProtocolUtilities.createMessageEntity(instruction, metadata, content).toFrameString() + '\0';
    }
  };

  class ConnectionManager {
    constructor(endpoint) {
      this.endpoint = endpoint;
      this.idGenerator = 0;
      this.isConnected = false;
      this.activeSubscriptions = {};
      this.socketInstance = null;
      this.activityLogger = null;
      this.onConnectSuccess = null;
      this.onConnectionError = null;
    }

    transmitFrame(instruction, metadata, content) {
      const serializedFrame = ProtocolUtilities.encodePayload(instruction, metadata, content);
      if (typeof this.activityLogger === "function") {
        this.activityLogger(">>> " + serializedFrame);
      }
      if (this.socketInstance && this.socketInstance.readyState === WebSocket.OPEN) {
        return this.socketInstance.send(serializedFrame);
      } else {
        if (typeof this.activityLogger === "function") {
          this.activityLogger("WebSocket not open, cannot transmit frame: " + instruction);
        }
        return false;
      }
    }

    initiateConnection(userIdentifier, accessCode, successCallback, errorCallback) {
      this.onConnectSuccess = successCallback;
      this.onConnectionError = errorCallback;

      if (typeof this.activityLogger === "function") {
        this.activityLogger("Initiating Web Socket...");
      }

      const WebSocketImpl = typeof WebSocketStompMock !== 'undefined' ? WebSocketStompMock : WebSocket;
      this.socketInstance = new WebSocketImpl(this.endpoint);

      this.socketInstance.binaryType = "arraybuffer";

      this.socketInstance.onmessage = (eventData) => {
        const rawPayload = (() => {
          if (typeof ArrayBuffer !== 'undefined' && eventData.data instanceof ArrayBuffer) {
            const decoder = new TextDecoder('utf-8');
            const uint8Array = new Uint8Array(eventData.data);
            const decodedString = decoder.decode(uint8Array);
            if (typeof this.activityLogger === "function") {
              this.activityLogger('--- Received binary data length: ' + uint8Array.length);
            }
            return decodedString;
          } else {
            return eventData.data;
          }
        })();

        if (typeof this.activityLogger === "function") {
          this.activityLogger('<<< ' + rawPayload);
        }

        const parsedEntity = ProtocolUtilities.decodePayload(rawPayload);

        if (parsedEntity.instruction === "CONNECTED") {
          this.isConnected = true;
          if (typeof this.onConnectSuccess === "function") {
            this.onConnectSuccess(parsedEntity);
          }
        } else if (parsedEntity.instruction === "MESSAGE") {
          const subscriptionHandler = this.activeSubscriptions[parsedEntity.metadata.subscription];
          if (typeof subscriptionHandler === "function") {
            subscriptionHandler(parsedEntity);
          }
        }
      };

      this.socketInstance.onclose = () => {
        const message = "Connection lost to " + this.endpoint;
        if (typeof this.activityLogger === "function") {
          this.activityLogger(message);
        }
        this.isConnected = false;
        if (typeof this.onConnectionError === "function") {
          this.onConnectionError(message);
        }
      };

      this.socketInstance.onopen = () => {
        if (typeof this.activityLogger === "function") {
          this.activityLogger('Web Socket Established...');
        }
        this.transmitFrame("CONNECT", {
          login: userIdentifier,
          passcode: accessCode
        });
      };
    }

    terminateConnection(terminationCallback) {
      this.transmitFrame("DISCONNECT");
      if (this.socketInstance) {
        this.socketInstance.close();
      }
      this.isConnected = false;
      if (typeof terminationCallback === "function") {
        terminationCallback();
      }
    }

    dispatchMessage(targetChannel, metadata = {}, content = '') {
      metadata.destination = targetChannel;
      return this.transmitFrame("SEND", metadata, content);
    }

    registerSubscription(targetChannel, callback, metadata = {}) {
      const subscriptionIdentifier = "sub-id-" + this.idGenerator++;
      metadata.destination = targetChannel;
      metadata.id = subscriptionIdentifier;
      this.activeSubscriptions[subscriptionIdentifier] = callback;
      this.transmitFrame("SUBSCRIBE", metadata);
      return subscriptionIdentifier;
    }

    deregisterSubscription(subscriptionIdentifier, metadata = {}) {
      metadata.id = subscriptionIdentifier;
      delete this.activeSubscriptions[subscriptionIdentifier];
      return this.transmitFrame("UNSUBSCRIBE", metadata);
    }

    startTransaction(transactionId, metadata = {}) {
      metadata.transaction = transactionId;
      return this.transmitFrame("BEGIN", metadata);
    }

    completeTransaction(transactionId, metadata = {}) {
      metadata.transaction = transactionId;
      return this.transmitFrame("COMMIT", metadata);
    }

    cancelTransaction(transactionId, metadata = {}) {
      metadata.transaction = transactionId;
      return this.transmitFrame("ABORT", metadata);
    }

    acknowledgeMessage(messageIdentifier, metadata = {}) {
      metadata["message-id"] = messageIdentifier;
      return this.transmitFrame("ACK", metadata);
    }

    setActivityLogger(loggerFn) {
        this.activityLogger = loggerFn;
    }
  }

  const exportedModule = {
    getProtocolHandler: () => ProtocolUtilities,
    createProtocolClient: (endpoint) => {
        const client = new ConnectionManager(endpoint);
        return {
            connect: client.initiateConnection.bind(client),
            disconnect: client.terminateConnection.bind(client),
            send: client.dispatchMessage.bind(client),
            subscribe: client.registerSubscription.bind(client),
            unsubscribe: client.deregisterSubscription.bind(client),
            begin: client.startTransaction.bind(client),
            commit: client.completeTransaction.bind(client),
            abort: client.cancelTransaction.bind(client),
            ack: client.acknowledgeMessage.bind(client),
            set debug(fn) { client.setActivityLogger(fn); },
            get debug() { return client.activityLogger; },
            get connected() { return client.isConnected; },
        };
    }
  };

  if (typeof window !== "undefined" && window !== null) {
    window.StompProtocol = exportedModule;
  } else {
    exports.StompProtocol = exportedModule;
  }

}).call(this);