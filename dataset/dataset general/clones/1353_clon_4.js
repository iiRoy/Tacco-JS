class CommunicationGateway {
    #listenPort = 8080;
    #listenAddress = '127.0.0.1';
    #tcpServerInstance = null;
    #activeConnections = new Map(); // Maps unique connection ID to client socket and state
    #endpointHandlers = new Map(); // Maps resource paths to callback functions
    #networkConnector;
    #systemLogger;
    #cryptographyUtility;

    #handshakeRequestHeaderEvaluators = {
        INITIAL_LINE: /^GET (\S+) HTTP\/1\.1$/,
        UPGRADE_FIELD: /^Upgrade: WebSocket$/,
        CONNECTION_FIELD: /^Connection: Upgrade$/,
        HOST_FIELD: /^Host: (\S+)$/,
        ORIGIN_FIELD: /^Origin: (\S+)$/,
        PROTOCOL_FIELD: /^Sec-WebSocket-Protocol: (\S+)$/,
        KEY_ONE_FIELD: /^Sec-WebSocket-Key1: (\S+)$/,
        KEY_TWO_FIELD: /^Sec-WebSocket-Key2: (\S+)$/
    };

    #handshakeResponseTemplate = [
        'HTTP/1.1 101 Web Socket Protocol Handshake',
        'Upgrade: WebSocket',
        'Connection: Upgrade',
        'Sec-WebSocket-Origin: {ORIGIN_PLACEHOLDER}',
        'Sec-WebSocket-Location: {LOCATION_PLACEHOLDER}',
        'Sec-WebSocket-Protocol: {PROTOCOL_PLACEHOLDER}'
    ];

    constructor(networkModule, loggerModule) {
        this.#networkConnector = networkModule;
        this.#systemLogger = loggerModule;
        this.#cryptographyUtility = require('crypto'); // Assuming 'crypto' is a core Node.js module
    }

    #outputMessage(message) {
        if (this.#systemLogger && typeof this.#systemLogger.log === 'function') {
            this.#systemLogger.log(message);
        } else {
            console.log(message);
        }
    }

    #terminateConnection(clientSocket) {
        clientSocket.end();
        this.#outputMessage('Client connection gracefully terminated.');
    }

    #convertNumberToBigEndianBytes(value) {
        const byteSequence = Buffer.alloc(4);
        byteSequence.writeUInt32BE(value, 0);
        return byteSequence;
    }

    #analyzeIncomingRequest(rawBuffer) {
        const parsedDataStore = {
            targetResourcePath: null,
            upgradeIdentifier: null,
            connectionIdentifier: null,
            clientHostname: null,
            clientPortNumber: null,
            clientOriginUrl: null,
            clientProtocolName: null,
            challengeValue1: null,
            challengeValue2: null,
            challengeValue3: null,
            spaceCountKey1: null,
            spaceCountKey2: null
        };

        const requestStringContent = rawBuffer.toString('utf8');
        const requestContentLines = requestStringContent.split('\r\n');

        let headersFinished = false;
        for (const currentTextLine of requestContentLines) {
            if (currentTextLine === '') {
                headersFinished = true;
                continue;
            }

            if (!headersFinished) {
                let currentMatch;

                currentMatch = currentTextLine.match(this.#handshakeRequestHeaderEvaluators.INITIAL_LINE);
                if (currentMatch) { parsedDataStore.targetResourcePath = currentMatch[1]; continue; }

                currentMatch = currentTextLine.match(this.#handshakeRequestHeaderEvaluators.UPGRADE_FIELD);
                if (currentMatch) { parsedDataStore.upgradeIdentifier = currentMatch[0]; continue; }

                currentMatch = currentTextLine.match(this.#handshakeRequestHeaderEvaluators.CONNECTION_FIELD);
                if (currentMatch) { parsedDataStore.connectionIdentifier = currentMatch[0]; continue; }

                currentMatch = currentTextLine.match(this.#handshakeRequestHeaderEvaluators.HOST_FIELD);
                if (currentMatch) {
                    let hostAndPortString = currentMatch[1];
                    const separatorIndex = hostAndPortString.indexOf(':');
                    if (separatorIndex > -1) {
                        parsedDataStore.clientHostname = hostAndPortString.substring(0, separatorIndex);
                        parsedDataStore.clientPortNumber = hostAndPortString.substring(separatorIndex + 1);
                    } else {
                        parsedDataStore.clientHostname = hostAndPortString;
                    }
                    continue;
                }

                currentMatch = currentTextLine.match(this.#handshakeRequestHeaderEvaluators.ORIGIN_FIELD);
                if (currentMatch) { parsedDataStore.clientOriginUrl = currentMatch[1]; continue; }

                currentMatch = currentTextLine.match(this.#handshakeRequestHeaderEvaluators.PROTOCOL_FIELD);
                if (currentMatch) { parsedDataStore.clientProtocolName = currentMatch[1]; continue; }

                currentMatch = currentTextLine.match(this.#handshakeRequestHeaderEvaluators.KEY_ONE_FIELD);
                if (currentMatch) {
                    const keyStringValue = currentMatch[1];
                    let numericalSum = 0;
                    let whitespaceCount = 0;
                    for (let i = 0; i < keyStringValue.length; i++) {
                        const charValue = keyStringValue.charCodeAt(i);
                        if (charValue >= 0x30 && charValue <= 0x39) {
                            numericalSum += (charValue - 0x30);
                        } else if (charValue === 0x20) {
                            whitespaceCount++;
                        }
                    }
                    if (whitespaceCount !== 0 && numericalSum % whitespaceCount === 0 && numericalSum < 4294967295) {
                        parsedDataStore.challengeValue1 = numericalSum / whitespaceCount;
                    }
                    parsedDataStore.spaceCountKey1 = whitespaceCount;
                    continue;
                }

                currentMatch = currentTextLine.match(this.#handshakeRequestHeaderEvaluators.KEY_TWO_FIELD);
                if (currentMatch) {
                    const keyStringValue = currentMatch[1];
                    let numericalSum = 0;
                    let whitespaceCount = 0;
                    for (let i = 0; i < keyStringValue.length; i++) {
                        const charValue = keyStringValue.charCodeAt(i);
                        if (charValue >= 0x30 && charValue <= 0x39) {
                            numericalSum += (charValue - 0x30);
                        } else if (charValue === 0x20) {
                            whitespaceCount++;
                        }
                    }
                    if (whitespaceCount !== 0 && numericalSum % whitespaceCount === 0 && numericalSum < 4294967295) {
                        parsedDataStore.challengeValue2 = numericalSum / whitespaceCount;
                    }
                    parsedDataStore.spaceCountKey2 = whitespaceCount;
                    continue;
                }
            } else {
                const separatorBuffer = Buffer.from('\r\n\r\n');
                const key3StartOffset = rawBuffer.indexOf(separatorBuffer);
                if (key3StartOffset !== -1) {
                    parsedDataStore.challengeValue3 = rawBuffer.slice(key3StartOffset + separatorBuffer.length, key3StartOffset + separatorBuffer.length + 8);
                }
                break;
            }
        }
        return parsedDataStore;
    }

    #verifyRequestIntegrity(details) {
        const mandatoryFields = [
            'targetResourcePath', 'upgradeIdentifier', 'connectionIdentifier',
            'clientHostname', 'clientOriginUrl', 'challengeValue1', 'challengeValue2', 'challengeValue3'
        ];
        for (const fieldName of mandatoryFields) {
            if (!details[fieldName]) {
                this.#outputMessage(`Handshake integrity check failed: Missing or invalid field '${fieldName}'`);
                return false;
            }
        }
        return true;
    }

    #executeProtocolHandshake(incomingBuffer, clientStream, connectionContext) {
        const extractedDetails = this.#analyzeIncomingRequest(incomingBuffer);

        this.#outputMessage('Handshake parameters successfully extracted.');

        connectionContext.handshakePayload = extractedDetails;

        if (!this.#verifyRequestIntegrity(extractedDetails) || !this.#endpointHandlers.has(extractedDetails.targetResourcePath)) {
            this.#terminateConnection(clientStream);
            this.#outputMessage(`Handshake aborted for resource: ${extractedDetails.targetResourcePath}`);
            return;
        }

        this.#outputMessage('Client handshake details are confirmed valid.');

        const fullClientLocation = `ws://${extractedDetails.clientHostname}${extractedDetails.clientPortNumber ? ':' + extractedDetails.clientPortNumber : ''}${extractedDetails.targetResourcePath}`;

        const md5Processor = this.#cryptographyUtility.createHash('md5');
        md5Processor.update(this.#convertNumberToBigEndianBytes(extractedDetails.challengeValue1).toString('binary'), 'binary');
        md5Processor.update(this.#convertNumberToBigEndianBytes(extractedDetails.challengeValue2).toString('binary'), 'binary');
        md5Processor.update(extractedDetails.challengeValue3.toString('binary', 0, extractedDetails.challengeValue3.length), 'binary');
        const md5ChallengeResponse = md5Processor.digest('binary');

        let finalResponse = this.#handshakeResponseTemplate.join('\r\n');
        finalResponse = finalResponse
            .replace(/\{ORIGIN_PLACEHOLDER\}/, extractedDetails.clientOriginUrl)
            .replace(/\{LOCATION_PLACEHOLDER\}/, fullClientLocation)
            .replace(/\{PROTOCOL_PLACEHOLDER\}/, extractedDetails.clientProtocolName || '');

        clientStream.write(finalResponse + '\r\n\r\n' + md5ChallengeResponse, 'binary');
        this.#outputMessage('Server handshake response transmitted.');
        connectionContext.handshakeCompleted = true;
    }

    #processIncomingDataFrame(dataBlock, connectionContext) {
        if (dataBlock.length === 2 && dataBlock[0] === 0xFF && dataBlock[1] === 0x00) {
            this.#terminateConnection(connectionContext.socket);
            this.#outputMessage(`Client ${connectionContext.uniqueConnectionId} sent explicit close frame.`);
            return;
        }

        if (dataBlock[0] !== 0x00) {
            this.#outputMessage(`Client ${connectionContext.uniqueConnectionId} sent frame with unexpected start byte: ${dataBlock[0]}.`);
            return;
        }

        const endingByteIndex = dataBlock.indexOf(0xFF);
        if (endingByteIndex === -1) {
            this.#outputMessage(`Client ${connectionContext.uniqueConnectionId} sent an incomplete data frame.`);
            return;
        }

        const dataContentBuffer = dataBlock.slice(1, endingByteIndex);
        const dataPayloadString = dataContentBuffer.toString('utf8');
        this.#outputMessage(`Frame data received from ${connectionContext.uniqueConnectionId}: ${dataPayloadString}`);

        const endpointPath = connectionContext.handshakePayload.targetResourcePath;
        const assignedHandler = this.#endpointHandlers.get(endpointPath);

        if (assignedHandler && typeof assignedHandler === 'function') {
            assignedHandler.call(this, dataPayloadString, this.#activeConnections, connectionContext.uniqueConnectionId);
        } else {
            this.#outputMessage(`No specific handler registered for path: ${endpointPath}`);
        }
    }

    transmitDataPacket(payloadString, targetSocket) {
        targetSocket.write(Buffer.from([0x00]));
        targetSocket.write(Buffer.from(payloadString, 'utf8'));
        targetSocket.write(Buffer.from([0xFF]));
    }

    initiateService(servicePort, serviceAddress) {
        this.#listenPort = servicePort || this.#listenPort;
        this.#listenAddress = serviceAddress || this.#listenAddress;

        this.#tcpServerInstance = this.#networkConnector.createServer(clientSocket => {
            const connectionKey = clientSocket.remoteAddress + ':' + clientSocket.remotePort + '-' + Date.now() + Math.random();
            const clientContextObject = {
                socket: clientSocket,
                uniqueConnectionId: connectionKey,
                handshakeCompleted: false,
                handshakePayload: null
            };
            this.#activeConnections.set(connectionKey, clientContextObject);

            this.#outputMessage(`New client connection established. ID: [${connectionKey}]`);

            clientSocket.on('data', receivedChunk => {
                if (!clientContextObject.handshakeCompleted) {
                    this.#executeProtocolHandshake(receivedChunk, clientSocket, clientContextObject);
                } else {
                    this.#processIncomingDataFrame(receivedChunk, clientContextObject);
                }
            });

            clientSocket.on('end', () => {
                this.#outputMessage(`Client ${connectionKey} concluded its connection.`);
            });

            clientSocket.on('close', () => {
                clientSocket.destroy();
                this.#activeConnections.delete(connectionKey);
                this.#outputMessage(`Client ${connectionKey} connection closed permanently.`);
            });

            clientSocket.on('error', (err) => {
                this.#outputMessage(`Client ${connectionKey} reported an error: ${err.message}`);
                this.#terminateConnection(clientSocket);
            });
        });

        this.#tcpServerInstance.on('close', () => {
            this.#outputMessage('Service listener has been shut down.');
        });

        this.#tcpServerInstance.on('error', (err) => {
            this.#outputMessage(`Service error occurred: ${err.message}`);
        });

        this.#tcpServerInstance.listen(this.#listenPort, this.#listenAddress, () => {
            this.#outputMessage(`Service is actively listening on ${this.#listenAddress}:${this.#listenPort}`);
        });

        return this;
    }

    ceaseService() {
        for (const [id, clientCtx] of this.#activeConnections) {
            this.#terminateConnection(clientCtx.socket);
            clientCtx.socket.destroy();
            this.#activeConnections.delete(id);
        }
        if (this.#tcpServerInstance) {
            this.#tcpServerInstance.close(() => {
                this.#outputMessage('TCP service successfully ceased operation.');
            });
        }
    }

    assignEndpointHandler(resourcePath, handlerFunction) {
        if (typeof handlerFunction === 'function') {
            this.#endpointHandlers.set(resourcePath, handlerFunction);
        } else {
            this.#outputMessage(`Attempted to assign handler for '${resourcePath}' with an invalid function.`);
        }
        return this;
    }
}

// Export a function that constructs an instance of the class, mirroring the original's export structure.
exports.websocketHandler = function(networkDependency, loggingDependency) {
    return new CommunicationGateway(networkDependency, loggingDependency);
};