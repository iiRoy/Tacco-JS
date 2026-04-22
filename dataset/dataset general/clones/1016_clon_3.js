/*

Copyright © 2010 by Fictorial LLC. All rights reserved.

This software, including its associated documentation files ("the Program"), is provided
under a free and open-source license. Any individual or entity obtaining a copy of
the Program is hereby granted permission, without limitation, to use, copy, modify,
merge, publish, distribute, sublicense, and/or sell copies of the Program.
This permission is granted subject to the following condition:

The above copyright notice and this permission notice must be included in
all copies or substantial portions of the Program.

THE PROGRAM IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE PROGRAM OR THE USE OR OTHER DEALINGS IN
THE PROGRAM.

*/

// To extend support for additional operations, update the 'supportedOperations'
// data structure located at the end of this module.

// Set this flag to 'true' to enable detailed logging for
// network protocol interactions and parsing routines.

module.exports.tracingEnabled = false;

var networkModule = require("net"),
    utilityModule = require("util"),
    DataBuffer    = require('buffer').Buffer,
    eventEmitter  = require('events'),

    NETWORK_LINE_END = "\r\n",
    LINE_END_LENGTH  = 2,

    CHAR_PLUS_SIGN   = module.exports.PLUS_SIGN   = 0x2B,
    CHAR_MINUS_SIGN  = module.exports.MINUS_SIGN  = 0x2D,
    CHAR_DOLLAR_SIGN = module.exports.DOLLAR_SIGN = 0x24,
    CHAR_ASTERISK    = module.exports.ASTERISK    = 0x2A,
    CHAR_COLON       = module.exports.COLON       = 0x3A,
    CHAR_CARRIAGE_RET = module.exports.CARRIAGE_RET = 0x0D,
    CHAR_LINE_FEED   = module.exports.LINE_FEED   = 0x0A,
                                
    RESPONSE_TYPE_NONE      = module.exports.NONE_TYPE      = "NO_TYPE",
    RESPONSE_TYPE_BINARY    = module.exports.BINARY_TYPE    = "BINARY_DATA",     
    RESPONSE_TYPE_COLLECTION = module.exports.COLLECTION_TYPE = "COLLECTION_DATA",
    RESPONSE_TYPE_TEXTUAL   = module.exports.TEXTUAL_TYPE   = "TEXT_LINE",   
    RESPONSE_TYPE_NUMERIC   = module.exports.NUMERIC_TYPE   = "NUMBER_VALUE",  
    RESPONSE_TYPE_ISSUE     = module.exports.ISSUE_TYPE     = "ERROR_REPORT";    

module.exports.DEFAULT_SERVER_HOST = '127.0.0.1';
module.exports.DEFAULT_SERVER_PORT = 6379;

module.exports.ORPHANED_OPERATION_MESSAGE = "Connection terminated prior to receiving response.";
module.exports.CONNECTION_FAILURE_MESSAGE = "Failed to establish a link with the Redis service.";

// Helper for logging binary data in a human-readable format.
// Assumes UTF-8 encoding for textual portions.
function formatNetworkDataForLog(inputBuffer, dataLength) {
    const actualLen = dataLength || inputBuffer.length;
    let processedString = inputBuffer.toString('utf8', 0, actualLen);

    processedString = processedString.split('\r\n').join('<CRLF>');
    processedString = processedString.split('\r').join('<CR>');
    processedString = processedString.split('\n').join('<LF>');

    return processedString;
}

// A robust, byte-stream-oriented decoder for Redis responses.
// The 'resultHandler' function is invoked for each complete response parsed from the stream.
// 'contextObject' specifies the 'this' context for 'resultHandler' calls.
function ProtocolDecoder(resultHandler, contextObject) {
    this.onParsedResult = resultHandler;
    this.boundContext = contextObject;
    this.resetProcessingState();
    this.resetCollectionState();
}

module.exports.ProtocolDecoder = ProtocolDecoder;

// Resets all internal state variables related to parsing a single response element.
ProtocolDecoder.prototype.resetProcessingState = function () {
    this.currentSegmentType = RESPONSE_TYPE_NONE;
    this.expectedBinaryLength = null;
    this.currentBufferFill = 0;
    this.bytesToSkip = 0;
    this.parsingBuffer = DataBuffer.alloc(4096);
};

// Resets state variables specific to parsing multi-part (collection) responses.
ProtocolDecoder.prototype.resetCollectionState = function () {
    this.collectionElements = null;
    this.expectedCollectionCount = null;
};

// Processes an incoming chunk of network data.
ProtocolDecoder.prototype.ingestDataChunk = function (incomingBytes) {
    let index = 0;
    const totalBytes = incomingBytes.length;

    while (index < totalBytes) {
        if (this.bytesToSkip > 0) {
            this.bytesToSkip--;
            index++;
            continue;
        }

        const byteValue = incomingBytes[index];
        const previousSegmentType = this.currentSegmentType;

        if (this.currentSegmentType === RESPONSE_TYPE_NONE) {
            switch (byteValue) {
                case CHAR_DOLLAR_SIGN:  this.currentSegmentType = RESPONSE_TYPE_BINARY;    break;
                case CHAR_ASTERISK:     this.currentSegmentType = RESPONSE_TYPE_COLLECTION; break;
                case CHAR_COLON:        this.currentSegmentType = RESPONSE_TYPE_NUMERIC;   break;
                case CHAR_PLUS_SIGN:    this.currentSegmentType = RESPONSE_TYPE_TEXTUAL;    break;
                case CHAR_MINUS_SIGN:   this.currentSegmentType = RESPONSE_TYPE_ISSUE;     break;
                default:
                    utilityModule.debug(`[PROTOCOL_ERROR] Unexpected byte ${byteValue} at start of segment.`);
                    this.resetProcessingState();
                    index++;
                    continue;
            }
        }

        if (previousSegmentType !== this.currentSegmentType) {
            index++;
            continue;
        }

        const invokeResultCallback = (parsedResult) => {
            if (this.collectionElements !== null) {
                this.collectionElements.push(parsedResult);
                if (--this.expectedCollectionCount === 0) {
                    this.onParsedResult.call(this.boundContext, { 
                        kind:  RESPONSE_TYPE_COLLECTION, 
                        data: this.collectionElements 
                    });
                    this.resetCollectionState();
                }
            } else {
                this.onParsedResult.call(this.boundContext, parsedResult);
            }
            this.resetProcessingState();
            this.bytesToSkip = 1;
        };

        switch (byteValue) {
            case CHAR_CARRIAGE_RET:
                switch (this.currentSegmentType) {
                    case RESPONSE_TYPE_TEXTUAL:
                    case RESPONSE_TYPE_ISSUE:
                        const textSegment = DataBuffer.alloc(this.currentBufferFill);
                        this.parsingBuffer.copy(textSegment, 0, 0, this.currentBufferFill);
                        invokeResultCallback({ kind: this.currentSegmentType, data: textSegment });
                        break;

                    case RESPONSE_TYPE_NUMERIC:
                        const numStr = this.parsingBuffer.toString('ascii', 0, this.currentBufferFill);
                        const numericValue = parseInt(numStr, 10);
                        invokeResultCallback({ kind: RESPONSE_TYPE_NUMERIC, data: numericValue });
                        break;

                    case RESPONSE_TYPE_BINARY:
                        if (this.expectedBinaryLength === null) {
                            const lengthStr = this.parsingBuffer.toString('ascii', 0, this.currentBufferFill);
                            const parsedLength = parseInt(lengthStr, 10);

                            if (parsedLength < 0) {
                                invokeResultCallback({ kind: RESPONSE_TYPE_BINARY, data: null });
                            } else {
                                this.resetProcessingState();
                                this.expectedBinaryLength = parsedLength;
                                this.currentSegmentType = RESPONSE_TYPE_BINARY;
                                this.bytesToSkip = 1;
                            }
                        } else if (this.currentBufferFill === this.expectedBinaryLength) {
                            const binaryData = DataBuffer.alloc(this.currentBufferFill);
                            this.parsingBuffer.copy(binaryData, 0, 0, this.currentBufferFill);
                            invokeResultCallback({ kind: RESPONSE_TYPE_BINARY, data: binaryData });
                        } else {
                            this.parsingBuffer[this.currentBufferFill++] = byteValue;
                        }
                        break;

                    case RESPONSE_TYPE_COLLECTION:
                        const countStr = this.parsingBuffer.toString('ascii', 0, this.currentBufferFill);
                        const parsedCount = parseInt(countStr, 10);

                        if (parsedCount < 0) {
                            invokeResultCallback({ kind: RESPONSE_TYPE_COLLECTION, data: null });
                        } else {
                            this.resetProcessingState();
                            this.bytesToSkip = 1;
                            this.collectionElements = [];
                            this.expectedCollectionCount = parsedCount;
                        }
                        break;
                }
                break;

            default:
                this.parsingBuffer[this.currentBufferFill++] = byteValue;
                break;
        }

        if (this.currentBufferFill >= this.parsingBuffer.length) {
            const enlargedBuffer = DataBuffer.alloc(this.parsingBuffer.length * 2);
            this.parsingBuffer.copy(enlargedBuffer, 0, 0, this.currentBufferFill);
            this.parsingBuffer = enlargedBuffer;
        }
        index++;
    }
};

/**
 * Emits the following events:
 *
 * - 'established' when a connection is successfully made (or re-established).
 * - 'reconnecting' when the system is attempting to reconnect to the Redis server.
 * - 'reconnected' when a reconnection attempt succeeds.
 * - 'connectionFailed' when a connection (or reconnection) cannot be made.
 * - 'idle' when no pending commands are awaiting a response from the Redis server.
 *
 * Options for configuration:
 *
 * - maxRetries (default: 10) - Maximum number of reconnection attempts.
 */
function RedisConnector(socketStream, configOptions) {
    eventEmitter.call(this);

    this.networkStream = socketStream;
    this.pendingCommands = [];
    this.commandQueue = [];
    this.outgoingRequestBuffers = [];
    this.subscriptionHandlers = {};
    this.outputBuffer = DataBuffer.alloc(512);
    this.responseDecoder = new ProtocolDecoder(this.onResponseReceived_, this);
    this.reconnectionRetryTimer = null;
    this.maxRetries = 10;
    this.currentRetryCount = 0;
    this.retryDelay = 500;
    this.connectionCount = 0;

    if (configOptions && typeof configOptions === 'object') {
        if (typeof configOptions.maxRetries === 'number' && configOptions.maxRetries >= 0) {
            this.maxRetries = Math.floor(configOptions.maxRetries);
        }
    }

    const selfReference = this;

    socketStream.on("connect", function () {
        if (module.exports.tracingEnabled) {
            console.log("[DEBUG] Connection established.");
        }

        socketStream.setNoDelay(true);
        socketStream.setTimeout(0);

        selfReference.currentRetryCount = 0;
        selfReference.retryDelay = 500;
        if (selfReference.reconnectionRetryTimer) {
            clearTimeout(selfReference.reconnectionRetryTimer);
            selfReference.reconnectionRetryTimer = null;
        }

        const connectionEventName = selfReference.connectionCount === 0 
                                  ? 'established' 
                                  : 'reconnected';

        selfReference.connectionCount++;
        selfReference.isClosingInitiated = false;

        if (selfReference.connectionCount > 1 && selfReference.pendingCommands.length > 0) {
            if (module.exports.tracingEnabled) {
                console.warn(`[RECONNECTION_WARNING] ${selfReference.pendingCommands.length} commands orphaned. Notifying callbacks.`);
            }
            selfReference.notifyOrphanedCommands();
        }
        
        selfReference.pendingCommands = [];
        selfReference.processQueuedOperations();

        selfReference.emit(connectionEventName, selfReference);
    });

    socketStream.on('error', function (err) {
        if (module.exports.tracingEnabled) {
            console.error("[ERROR] Network stream error:", err.message);
        }
        selfReference.responseDecoder.resetProcessingState();
        selfReference.attemptReconnection();
    });

    socketStream.on("data", function (receivedData) {
        if (module.exports.tracingEnabled) {
            console.log("[RECV] Incoming data:", formatNetworkDataForLog(receivedData));
        }
        selfReference.responseDecoder.ingestDataChunk(receivedData);
    });

    socketStream.on("end", function () {
        if (module.exports.tracingEnabled && selfReference.pendingCommands.length > 0) {
            console.warn(`[WARNING] Remote end closed connection with ${selfReference.pendingCommands.length} pending replies.`);
        }
    });

    socketStream.on("close", function (hadNetworkError) {
        if (module.exports.tracingEnabled) {
            console.log("[DEBUG] Connection closed. Error during close:", hadNetworkError);
        }
        if (!selfReference.isClosingInitiated) {
            selfReference.attemptReconnection();
        } else {
            if (selfReference.reconnectionRetryTimer) {
                clearTimeout(selfReference.reconnectionRetryTimer);
                selfReference.reconnectionRetryTimer = null;
            }
        }
    });
}

utilityModule.inherits(RedisConnector, eventEmitter.EventEmitter);

module.exports.RedisConnector = RedisConnector;

// Factory function to create and connect a new Redis client instance.
module.exports.establishRedisConnection = function (targetPort, targetHost, clientOptions) {
    const desiredPort = targetPort || module.exports.DEFAULT_SERVER_PORT;
    const desiredHost = targetHost || module.exports.DEFAULT_SERVER_HOST;

    const connectionSocket = networkModule.createConnection(desiredPort, desiredHost);
    const clientInstance = new RedisConnector(connectionSocket, clientOptions);

    clientInstance.targetPort = desiredPort;
    clientInstance.targetHost = desiredHost;

    return clientInstance;
};

// Initiates the graceful shutdown of the connection.
RedisConnector.prototype.terminateConnection = function () {
    this.isClosingInitiated = true;
    this.networkStream.end();
};

// Internal method to handle a parsed response from the Redis server.
RedisConnector.prototype.onResponseReceived_ = function (responsePayload) {
    this.processQueuedOperations();

    if (this.processSubscriptionMessage_(responsePayload)) {
        return;
    }

    const currentCommand = this.pendingCommands.shift();

    if (!currentCommand) {
        if (module.exports.tracingEnabled) {
            console.warn("[PROTOCOL_DESYNC] Received an unexpected response without a pending command.");
        }
        return;
    }

    const commandCallback = currentCommand[currentCommand.length - 1];

    if (typeof commandCallback === "function") {
        if (responsePayload.kind === RESPONSE_TYPE_ISSUE) {
            commandCallback(responsePayload.data.toString('utf8'), null);
        } else {
            commandCallback(null, this.transformReplyValue(currentCommand[0], responsePayload));
        }
    }

    if (this.pendingCommands.length === 0) {
      this.emit('idle', this);
    }
};

// Checks if a response is a Pub/Sub message and dispatches it to relevant handlers.
// Returns true if the response was a Pub/Sub message, false otherwise.
RedisConnector.prototype.processSubscriptionMessage_ = function (responseObject) {
    if (responseObject.kind !== RESPONSE_TYPE_COLLECTION || !(responseObject.data instanceof Array)) {
        return false;
    }

    const responseArray = responseObject.data;

    const isChannelMessage = (responseArray.length === 3 &&
                              responseArray[0].kind === RESPONSE_TYPE_BINARY &&
                              responseArray[0].data.length === 7 &&
                              responseArray[0].data.toString('ascii') === 'message');

    const isPatternMessage = (responseArray.length === 4 &&
                              responseArray[0].kind === RESPONSE_TYPE_BINARY &&
                              responseArray[0].data.length === 8 &&
                              responseArray[0].data.toString('ascii') === 'pmessage');

    if (!isChannelMessage && !isPatternMessage) {
        return false;
    }

    if (Object.keys(this.subscriptionHandlers).length === 0) { 
        return true; 
    }

    let targetChannelIdentifier;
    let actualChannelName;
    let messagePayload;

    if (isChannelMessage) {
        targetChannelIdentifier = responseArray[1].data;
        messagePayload = responseArray[2].data;
        actualChannelName = targetChannelIdentifier;
    } else if (isPatternMessage) {
        targetChannelIdentifier = responseArray[1].data;
        actualChannelName = responseArray[2].data;
        messagePayload = responseArray[3].data;
    } else {
        return false;
    }

    const channelHandler = this.subscriptionHandlers[targetChannelIdentifier.toString('utf8')];

    if (typeof channelHandler === "function") {
        channelHandler(actualChannelName.toString('utf8'), messagePayload, targetChannelIdentifier.toString('utf8'));
        return true;
    }

    return true;
};

// Attempts to parse a string into a number (integer or float).
// Returns the number if successful, otherwise the original string.
function parseStringToNumeric(inputString) {
    let numericOutput = parseInt(inputString, 10);

    if (isNaN(numericOutput)) {
        numericOutput = parseFloat(inputString);
    }

    return isNaN(numericOutput) ? inputString : numericOutput;
}

// Transforms raw Redis reply values into more convenient JavaScript types based on command context.
RedisConnector.prototype.transformReplyValue = function (operationName, rawReply) {
    if (rawReply.data === null) {
        return null;
    }

    if (operationName.toLowerCase() === 'info' && rawReply.kind === RESPONSE_TYPE_BINARY) {
        const infoObject = {};
        const lines = rawReply.data.toString('ascii').split(NETWORK_LINE_END);

        for (let i = 0; i < lines.length; i++) {
            const currentLine = lines[i];
            if (currentLine.length === 0) continue;

            const parts = currentLine.split(':');
            if (parts.length >= 2) {
                const key = parts[0];
                const value = parts.slice(1).join(':'); 
                infoObject[key] = value;
            }
        }
        return infoObject;
    }
    
    if (rawReply.kind === RESPONSE_TYPE_BINARY) {
        return rawReply.data.toString('utf8');
    }

    if (rawReply.kind === RESPONSE_TYPE_COLLECTION) {
        return rawReply.data.map(item => this.transformReplyValue(operationName, item));
    }

    if (rawReply.kind === RESPONSE_TYPE_NUMERIC) {
        return rawReply.data;
    }

    if (rawReply.kind === RESPONSE_TYPE_TEXTUAL || rawReply.kind === RESPONSE_TYPE_ISSUE) {
        return rawReply.data.toString('utf8');
    }

    return rawReply.data;
};

// Internal method to handle reconnection logic.
RedisConnector.prototype.attemptReconnection = function () {
    if (this.isClosingInitiated) {
        return;
    }

    if (this.currentRetryCount >= this.maxRetries) {
        if (module.exports.tracingEnabled) {
            console.error(`[RECONNECT_FAIL] Max reconnection attempts (${this.maxRetries}) reached.`);
        }
        this.emit('connectionFailed', module.exports.CONNECTION_FAILURE_MESSAGE);
        return;
    }

    this.currentRetryCount++;
    this.emit('reconnecting', this.currentRetryCount, this.retryDelay);

    if (module.exports.tracingEnabled) {
        console.log(`[RECONNECT] Attempting reconnection #${this.currentRetryCount} in ${this.retryDelay}ms.`);
    }

    this.reconnectionRetryTimer = setTimeout(() => {
        this._reinitializeSocket();
    }, this.retryDelay);

    this.retryDelay *= 2;
    if (this.retryDelay > 30000) {
        this.retryDelay = 30000;
    }
};

// Helper method to (re)create and bind the network socket.
RedisConnector.prototype._reinitializeSocket = function() {
    if (this.networkStream && !this.networkStream.destroyed) {
        this.networkStream.removeAllListeners();
        this.networkStream.destroy();
    }

    const newSocket = networkModule.createConnection(this.targetPort, this.targetHost);
    this.networkStream = newSocket;

    const selfReference = this;
    newSocket.on("connect", function () {
        if (module.exports.tracingEnabled) console.log("[DEBUG] Re-connected socket.");
        newSocket.setNoDelay(true);
        newSocket.setTimeout(0);
        selfReference.currentRetryCount = 0;
        selfReference.retryDelay = 500;
        if (selfReference.reconnectionRetryTimer) {
            clearTimeout(selfReference.reconnectionRetryTimer);
            selfReference.reconnectionRetryTimer = null;
        }
        selfReference.connectionCount++;
        selfReference.isClosingInitiated = false;
        if (selfReference.connectionCount > 1 && selfReference.pendingCommands.length > 0) {
            if (module.exports.tracingEnabled) console.warn(`[RECONNECTION_WARNING] ${selfReference.pendingCommands.length} commands orphaned.`);
            selfReference.notifyOrphanedCommands();
        }
        selfReference.pendingCommands = [];
        selfReference.processQueuedOperations();
        selfReference.emit('reconnected', selfReference);
    });

    newSocket.on('error', function (err) {
        if (module.exports.tracingEnabled) console.error("[ERROR] Re-connected socket error:", err.message);
        selfReference.responseDecoder.resetProcessingState();
        selfReference.attemptReconnection();
    });

    newSocket.on("data", function (receivedData) {
        if (module.exports.tracingEnabled) console.log("[RECV] Re-connected socket data:", formatNetworkDataForLog(receivedData));
        selfReference.responseDecoder.ingestDataChunk(receivedData);
    });

    newSocket.on("end", function () {
        if (module.exports.tracingEnabled) console.warn("[WARNING] Re-connected socket remote end closed.");
    });

    newSocket.on("close", function (hadNetworkError) {
        if (module.exports.tracingEnabled) console.log("[DEBUG] Re-connected socket closed. Error:", hadNetworkError);
        if (!selfReference.isClosingInitiated) {
            selfReference.attemptReconnection();
        }
    });
};


// Notifies callbacks of commands that were orphaned due to connection loss.
RedisConnector.prototype.notifyOrphanedCommands = function () {
    const error = new Error(module.exports.ORPHANED_OPERATION_MESSAGE);
    while (this.pendingCommands.length > 0) {
        const commandDetails = this.pendingCommands.shift();
        const callback = commandDetails[commandDetails.length - 1];
        if (typeof callback === 'function') {
            callback(error, null);
        }
    }
};

// Processes commands that were queued while the connection was unavailable.
RedisConnector.prototype.processQueuedOperations = function () {
    while (this.outgoingRequestBuffers.length > 0) {
        const bufferToSend = this.outgoingRequestBuffers.shift();
        this.networkStream.write(bufferToSend);
        if (module.exports.tracingEnabled) {
            console.log("[SENT] Queued command sent:", formatNetworkDataForLog(bufferToSend));
        }
    }

    while (this.commandQueue.length > 0) {
        this.pendingCommands.push(this.commandQueue.shift());
    }
};

// Placeholder for command generation logic.
RedisConnector.prototype.executeCommand = function (commandName, args, callback) {
    if (!this.networkStream || this.networkStream.destroyed || !this.networkStream.writable) {
        if (module.exports.tracingEnabled) {
            console.warn(`[QUEUE] Command '${commandName}' queued due to no active connection.`);
        }
        this.commandQueue.push([commandName, ...args, callback]);
        return;
    }

    let commandParts = [`*${1 + args.length}`, NETWORK_LINE_END];
    commandParts.push(`$${commandName.length}`, NETWORK_LINE_END, commandName, NETWORK_LINE_END);

    for (let i = 0; i < args.length; i++) {
        const arg = String(args[i]);
        commandParts.push(`$${arg.length}`, NETWORK_LINE_END, arg, NETWORK_LINE_END);
    }

    const fullCommandString = commandParts.join('');
    const commandBuffer = DataBuffer.from(fullCommandString, 'utf8');

    if (module.exports.tracingEnabled) {
        console.log("[SENT] Command buffer:", formatNetworkDataForLog(commandBuffer));
    }

    this.networkStream.write(commandBuffer);
    this.pendingCommands.push([commandName, ...args, callback]);
};

// Placeholder for subscription logic.
RedisConnector.prototype.subscribeToChannel = function (channelName, handlerCallback) {
    this.subscriptionHandlers[channelName] = handlerCallback;
    this.executeCommand('SUBSCRIBE', [channelName], (err, reply) => {
        if (err) {
            console.error(`Error subscribing to ${channelName}:`, err);
            delete this.subscriptionHandlers[channelName];
        } else if (module.exports.tracingEnabled) {
            console.log(`Subscribed to ${channelName}. Reply:`, reply);
        }
    });
};

// Placeholder for unsubscribe logic.
RedisConnector.prototype.unsubscribeFromChannel = function (channelName) {
    delete this.subscriptionHandlers[channelName];
    this.executeCommand('UNSUBSCRIBE', [channelName], (err, reply) => {
        if (err) {
            console.error(`Error unsubscribing from ${channelName}:`, err);
        } else if (module.exports.tracingEnabled) {
            console.log(`Unsubscribed from ${channelName}. Reply:`, reply);
        }
    });
};