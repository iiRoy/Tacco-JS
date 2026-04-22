module.exports.webSocketHandler = function (networkModule, systemLogger) {
  // Configuration settings for the server instance
  this.connectionPort = 8080;
  this.hostAddress = '127.0.0.1';
  this.socketServer = null;

  // Internal data structures for managing connections and routes
  const connectedPeers = {};
  const endpointHandlers = {};
  const selfReference = this;

  // Patterns for parsing incoming HTTP request headers
  const incomingRequestPatterns = [
    /^GET (.*) HTTP\/1\.1$/,
    /^Upgrade: WebSocket$/,
    /^Connection: Upgrade$/,
    /^Host: (.*)$/,
    /^Origin: (.*)$/,
    /^Sec-WebSocket-Protocol: (.*)$/,
    /^Sec-WebSocket-Key1: (.*)$/,
    /^Sec-WebSocket-Key2: (.*)$/
  ];

  // Templates for constructing the outgoing HTTP response headers
  const outgoingResponseTemplates = [
    'HTTP/1.1 101 WebSocket Protocol Handshake',
    'Upgrade: WebSocket',
    'Connection: Upgrade',
    'Sec-WebSocket-Origin: {CLIENT_ORIGIN}',
    'Sec-WebSocket-Location: {SERVER_LOCATION}',
    'Sec-WebSocket-Protocol: {NEGOTIATED_PROTOCOL}'
  ];

  // Object to store parsed parameters from the client's request
  let handshakeParameters = {};

  /**
   * Immediately terminates a given network connection.
   * @param {object} connectionStream The stream object representing the client connection.
   */
  function terminateConnection(connectionStream) {
    connectionStream.end();
  }

  /**
   * Converts a 32-bit integer into a 4-byte Buffer in big-endian format.
   * @param {number} inputNumber The integer to convert.
   * @returns {Buffer} A Buffer containing the 4-byte representation of the number.
   */
  function convertNumberToByteArray(inputNumber) {
    return Buffer.from([
      (inputNumber >> 24) & 0xFF,
      (inputNumber >> 16) & 0xFF,
      (inputNumber >> 8) & 0xFF,
      inputNumber & 0xFF
    ]);
  }

  /**
   * Parses the raw incoming data to extract WebSocket handshake parameters.
   * @param {Buffer} receivedDataBlock The raw data buffer from the client.
   * @param {Array<RegExp>} expectedRequestPatterns Regular expressions to match headers.
   * @returns {object} An object containing the extracted handshake details.
   */
  function extractRequestDetails(receivedDataBlock, expectedRequestPatterns) {
    const extractedDetailsObject = {
      requestedResourcePath: null,
      protocolUpgrade: null,
      connectionType: null,
      serverHostName: null,
      serverPortNumber: null,
      clientOrigin: null,
      negotiatedProtocol: null,
      securityChallenge: null, // This field is not directly populated by headers in the original
      securityKeyOne: null,
      securityKeyTwo: null,
      securityKeyThree: null,
      fullLocationURL: null,
      keyOneSpaces: null,
      keyTwoSpaces: null
    };

    const dataString = receivedDataBlock.toString('utf8', 0, receivedDataBlock.length);
    const lineFragments = dataString.split('\r\n');

    lineFragments.forEach(function (currentLine) {
      expectedRequestPatterns.forEach(function (patternRule, ruleIndex) {
        let matchedItems = [];
        let tempValue;

        matchedItems = currentLine.match(patternRule);

        if (matchedItems && matchedItems.length > 0) {
          switch (ruleIndex) {
            case 0: // GET resource HTTP/1.1
              if (matchedItems.length === 2)
                extractedDetailsObject.requestedResourcePath = matchedItems[1];
              break;
            case 1: // Upgrade: WebSocket
              if (matchedItems.length === 1)
                extractedDetailsObject.protocolUpgrade = matchedItems[0];
              break;
            case 2: // Connection: Upgrade
              if (matchedItems.length === 1)
                extractedDetailsObject.connectionType = matchedItems[0];
              break;
            case 3: // Host: hostname:port
              if (matchedItems.length === 2)
                tempValue = matchedItems[1];
              if (tempValue.includes(':')) {
                const hostParts = tempValue.split(':');
                extractedDetailsObject.serverHostName = hostParts[0];
                extractedDetailsObject.serverPortNumber = hostParts[1];
              } else {
                extractedDetailsObject.serverHostName = tempValue;
              }
              break;
            case 4: // Origin: client_origin
              if (matchedItems.length === 2)
                extractedDetailsObject.clientOrigin = matchedItems[1];
              break;
            case 5: // Sec-WebSocket-Protocol: protocol_name
              if (matchedItems.length === 2)
                extractedDetailsObject.negotiatedProtocol = matchedItems[1];
              break;
            case 6: // Sec-WebSocket-Key1: key_value
              if (matchedItems.length === 2) {
                tempValue = Number.parseInt(matchedItems[1].replace(/[^\d]/g, ''), 10);
                extractedDetailsObject.keyOneSpaces = matchedItems[1].replace(/[^ ]/g, '').length;
                if (0 === (tempValue % extractedDetailsObject.keyOneSpaces) && extractedDetailsObject.keyOneSpaces !== 0 && tempValue < 4294967295) {
                  extractedDetailsObject.securityKeyOne = tempValue / extractedDetailsObject.keyOneSpaces;
                }
              }
              break;
            case 7: // Sec-WebSocket-Key2: key_value
              if (matchedItems.length === 2) {
                tempValue = Number.parseInt(matchedItems[1].replace(/[^\d]/g, ''));
                extractedDetailsObject.keyTwoSpaces = matchedItems[1].replace(/[^ ]/g, '').length;
                if (0 === (tempValue % extractedDetailsObject.keyTwoSpaces) && extractedDetailsObject.keyTwoSpaces !== 0 && tempValue < 4294967295) {
                  extractedDetailsObject.securityKeyTwo = tempValue / extractedDetailsObject.keyTwoSpaces;
                }
              }
              break;
          }
        }
      });
    });

    // Find the third key in the raw data (8 bytes after the double CRLF)
    for (let byteIndex = 0; byteIndex < receivedDataBlock.length; byteIndex++) {
      if (receivedDataBlock[byteIndex] === 0x0D &&
          receivedDataBlock[byteIndex + 1] === 0x0A &&
          receivedDataBlock[byteIndex + 2] === 0x0D &&
          receivedDataBlock[byteIndex + 3] === 0x0A) {
        extractedDetailsObject.securityKeyThree = receivedDataBlock.subarray(byteIndex + 4, byteIndex + 12);
        break;
      }
    }
    return extractedDetailsObject;
  }

  /**
   * Validates if all mandatory fields for a WebSocket handshake are present.
   * @param {object} detailsToValidate The object containing extracted handshake parameters.
   * @returns {boolean} True if all required fields are valid, false otherwise.
   */
  function validateIncomingRequest(detailsToValidate) {
    const mandatoryFields = [
      'requestedResourcePath',
      'protocolUpgrade',
      'connectionType',
      'serverHostName',
      'clientOrigin',
      'securityKeyOne',
      'securityKeyTwo',
      'securityKeyThree'
    ];
    let isValid = true;

    mandatoryFields.forEach(function (fieldName) {
      if (!detailsToValidate[fieldName]) {
        systemLogger.error('Client handshake invalid: missing ' + fieldName);
        isValid = false;
      }
    });
    return isValid;
  }

  /**
   * Performs the WebSocket handshake sequence with the client.
   * @param {Buffer} inputBuffer The initial data buffer from the client.
   * @param {Array<RegExp>} headerPatterns Regular expressions for parsing headers.
   * @param {object} clientStream The network stream for the client.
   * @param {object} connectionState Object holding the current state of the connection.
   */
  function performHandshake(inputBuffer, headerPatterns, clientStream, connectionState) {
    handshakeParameters = extractRequestDetails(inputBuffer, headerPatterns);

    systemLogger.debug('Handshake parameters obtained.');
    if (!validateIncomingRequest(handshakeParameters) || !verifyEndpointExistence(handshakeParameters.requestedResourcePath)) {
      terminateConnection(clientStream);
      systemLogger.info('Resource: ' + handshakeParameters.requestedResourcePath);
      systemLogger.warn('Invalid handshake parameters or unknown resource path.');
      return;
    }

    systemLogger.info('Client handshake appears valid.');
    // Construct the full WebSocket location URL
    handshakeParameters.fullLocationURL = 'ws://' + handshakeParameters.serverHostName + (handshakeParameters.serverPortNumber ? ':' + handshakeParameters.serverPortNumber : '') + handshakeParameters.requestedResourcePath;

    let finalResponseHeader = outgoingResponseTemplates.concat('', '').join('\r\n');
    const hashGenerator = require('node:crypto').createHash('sha256'); // Changed to sha256 for Type II

    // Update the hash with key data
    hashGenerator.update(convertNumberToByteArray(Number.parseInt(handshakeParameters.securityKeyOne)).toString('binary'));
    hashGenerator.update(convertNumberToByteArray(Number.parseInt(handshakeParameters.securityKeyTwo)).toString('binary'));
    hashGenerator.update(handshakeParameters.securityKeyThree.toString('binary', 0, handshakeParameters.securityKeyThree.length));

    // Replace placeholders in the response header template
    finalResponseHeader = finalResponseHeader.replace(/\{CLIENT_ORIGIN\}/, handshakeParameters.clientOrigin)
                                             .replace(/\{SERVER_LOCATION\}/, handshakeParameters.fullLocationURL)
                                             .replace(/\{NEGOTIATED_PROTOCOL\}/, handshakeParameters.negotiatedProtocol);

    // Send the handshake response including the generated hash
    clientStream.write(finalResponseHeader + hashGenerator.digest('binary'), 'binary');
    systemLogger.info('Server handshake response sent successfully.');
    connectionState.isHandshaked = true;
    return;
  }

  /**
   * Checks if a given resource path has a registered handler.
   * @param {string} currentPath The resource path to check.
   * @returns {boolean} True if a handler exists for the path, false otherwise.
   */
  function verifyEndpointExistence(currentPath) {
    for (const handlerKey in endpointHandlers) {
      if (Object.prototype.hasOwnProperty.call(endpointHandlers, handlerKey)) {
        if (handlerKey === currentPath)
          return true;
      }
    }
    return false;
  }

  /**
   * Processes an incoming WebSocket data frame from a client.
   * @param {Buffer} framePayload The data buffer received from the client.
   * @param {object} activePeers Object mapping session IDs to client streams.
   * @param {string} sessionIdentifier The unique ID of the current client session.
   */
  function processIncomingFrame(framePayload, activePeers, sessionIdentifier) {
    // Check for a close frame (0xFF 0x00)
    if (framePayload.length === 2) {
      if (framePayload[0] === 0xFF && framePayload[1] === 0x00) {
        terminateConnection(activePeers[sessionIdentifier]);
        return;
      }
    }

    // Check for valid frame start marker (0x00)
    if (framePayload[0] !== 0x00) {
      return; // Ignore invalid frames
    }

    // Extract the content from the frame (excluding start and end markers)
    const frameContent = framePayload.toString('utf8', 1, framePayload.length - 1);
    systemLogger.log('Received frame data: ' + frameContent);

    // If a route exists for the resource, call its handler
    if (verifyEndpointExistence(handshakeParameters.requestedResourcePath)) {
      if (!(endpointHandlers[handshakeParameters.requestedResourcePath] === undefined) && (typeof endpointHandlers[handshakeParameters.requestedResourcePath]).toLowerCase() === 'function') {
        endpointHandlers[handshakeParameters.requestedResourcePath].apply(selfReference, [frameContent, activePeers, sessionIdentifier]);
      }
    }
  }

  /**
   * Constructs and sends a WebSocket data packet to a client stream.
   * @param {string} messageString The string message to send.
   * @param {object} outputStream The network stream of the recipient client.
   */
  this.sendDataPacket = function (messageString, outputStream) {
    outputStream.write(Buffer.from([0]));   // Frame start byte
    outputStream.write(messageString, 'utf8'); // Message payload
    outputStream.write(Buffer.from([255]));  // Frame end byte
  };

  /**
   * Initializes and starts the WebSocket server.
   * @param {number} [listeningPort=8080] The port number to listen on.
   * @param {string} [listeningIP='127.0.0.1'] The IP address to bind to.
   * @returns {object} The current instance of the WebSocket handler.
   */
  this.beginListening = function (listeningPort, listeningIP) {
    this.connectionPort = listeningPort || 8080;
    this.hostAddress = listeningIP || '127.0.0.1';
    const localSelf = this;

    // Create a new TCP server instance
    this.socketServer = networkModule.createServer(function (incomingConnection) {
      const connectionStatus = {
        isHandshaked: false
      };

      // Event listener for when a client connection is established
      incomingConnection.on('connectionEstablished', function () {
        this.sessionID = this.remoteAddress + ((new Date().getTime()) + Math.random() * 100);
        connectedPeers[this.sessionID] = incomingConnection;
        systemLogger.info('Client connected. Session ID: [' + this.sessionID + ']');
        systemLogger.info('Number of active clients: ' + Object.keys(connectedPeers).length);
      });

      // Event listener for incoming data from the client
      incomingConnection.on('dataReceived', function (dataBuffer) {
        if (!connectionStatus.isHandshaked) {
          performHandshake(dataBuffer, incomingRequestPatterns, incomingConnection, connectionStatus);
        } else {
          processIncomingFrame.apply(localSelf, [dataBuffer, connectedPeers, this.sessionID]);
        }
      });

      // Event listener for when the client signals end of transmission
      incomingConnection.on('connectionEnded', function () {
        incomingConnection.end(); // Ensure stream is fully closed
        systemLogger.info('Client connection ended.');
      });

      // Event listener for when the client connection is fully closed
      incomingConnection.on('connectionClosed', function () {
        incomingConnection.destroy(); // Destroy the underlying socket
        delete connectedPeers[this.sessionID];
        systemLogger.warn('Client [' + this.sessionID + '] connection closed and removed.');
      });
    });

    // Event listener for when the server itself closes
    this.socketServer.on('serverClosed', function () {
      systemLogger.warn('WebSocket server has shut down.');
    });

    // Start the server listening on the specified port and IP
    this.socketServer.listen(this.connectionPort, this.hostAddress);
    return this;
  };

  /**
   * Shuts down the WebSocket server and terminates all active client connections.
   */
  this.shutdownServer = function () {
    // Iterate through all connected clients and close their connections
    for (const peerKey in connectedPeers) {
      if (Object.prototype.hasOwnProperty.call(connectedPeers, peerKey)) {
        connectedPeers[peerKey].end();
        connectedPeers[peerKey].destroy();
        delete connectedPeers[peerKey];
      }
    }
    // Close the main server listener
    this.socketServer.close();
    systemLogger.info('All client connections terminated, server listener closed.');
  };

  /**
   * Registers a callback function to handle incoming messages for a specific resource path.
   * @param {string} resourcePath The URL path to associate with the handler.
   * @param {Function} callbackFunction The function to execute when a message arrives for this path.
   * @returns {object} The current instance of the WebSocket handler.
   */
  this.registerEndpoint = function (resourcePath, callbackFunction) {
    if ((typeof callbackFunction).toLowerCase() === 'function') {
      endpointHandlers[resourcePath] = callbackFunction;
      systemLogger.debug(`Endpoint '${resourcePath}' registered.`);
    } else {
      systemLogger.error(`Attempted to register endpoint '${resourcePath}' with a non-function handler.`);
    }
    return this;
  };
};