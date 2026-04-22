const nodeNet = require("net");
const nodeBuffer = require('buffer').Buffer;

const exportables = {};

exportables.traceActivity = false;

const ASCII_PLUS      = 0x2B;
const ASCII_MINUS     = 0x2D;
const ASCII_DOLLAR    = 0x24;
const ASCII_STAR      = 0x2A;
const ASCII_COLON     = 0x3A;
const ASCII_CR        = 0x0D;
const ASCII_LF        = 0x0A;
const CRLF_SEQUENCE   = nodeBuffer.from('\r\n');
const CRLF_LENGTH     = 2;

const STATE_IDLE      = "IDLE_STATE";
const STATE_BLOB      = "BLOB_STATE";
const STATE_COLLECTION= "COLLECTION_STATE";
const STATE_SIMPLE    = "SIMPLE_STRING_STATE";
const STATE_INTEGER   = "INTEGER_STATE";
const STATE_ERROR     = "ERROR_STATE";

exportables.DEFAULT_SERVER_HOST = '127.0.0.1';
exportables.DEFAULT_SERVER_PORT = 6379;

exportables.LOST_COMMAND_MESSAGE = "connection terminated before response received";
exportables.NO_SERVER_CONNECTION_MESSAGE = "unable to establish link to Redis";

function utilityTrace(message) {
    if (exportables.traceActivity) {
        console.log(message);
    }
}

function formatBinaryForDisplay(dataBuffer, lengthLimit) {
    const displayLength = lengthLimit || dataBuffer.length;
    let formatted = dataBuffer.toString('utf8', 0, displayLength);
    formatted = formatted.replace(/\r\n/g, '<CRLF>');
    formatted = formatted.replace(/\r/g, '<CR>');
    formatted = formatted.replace(/\n/g, '<LF>');
    return formatted;
}

function attemptNumericConversion(textValue) {
    let numeric = parseInt(textValue, 10);
    if (isNaN(numeric)) {
        numeric = parseFloat(textValue);
    }
    return isNaN(numeric) ? textValue : numeric;
}

// Replaces ReplyParser
class ProtocolDecoder {
    constructor(resultHandlerFn, contextObj) {
        this.resultHandlerFn = resultHandlerFn;
        this.contextObj = contextObj;
        this.accumulatedBuffer = nodeBuffer.alloc(0);
        this.resetParsingState();
        this.resetAggregateState();
    }

    resetParsingState() {
        this.currentParsingState = STATE_IDLE;
        this.expectedDataLength = null; // For bulk data
        this.bytesToSkip = 0;
    }

    resetAggregateState() {
        this.collectedSubResults = null;
        this.expectedSubResultsCount = null;
    }

    ingestPayload(incomingBlock) {
        this.accumulatedBuffer = nodeBuffer.concat([this.accumulatedBuffer, incomingBlock]);
        this.processBufferContents();
    }

    processBufferContents() {
        while (true) {
            if (this.bytesToSkip > 0) {
                if (this.accumulatedBuffer.length >= this.bytesToSkip) {
                    this.accumulatedBuffer = this.accumulatedBuffer.slice(this.bytesToSkip);
                    this.bytesToSkip = 0;
                } else {
                    this.bytesToSkip -= this.accumulatedBuffer.length;
                    this.accumulatedBuffer = nodeBuffer.alloc(0);
                    break;
                }
            }

            if (this.currentParsingState === STATE_IDLE) {
                if (this.accumulatedBuffer.length === 0) break;

                const typeByte = this.accumulatedBuffer[0];
                this.accumulatedBuffer = this.accumulatedBuffer.slice(1);

                switch (typeByte) {
                    case ASCII_DOLLAR: this.currentParsingState = STATE_BLOB; break;
                    case ASCII_STAR: this.currentParsingState = STATE_COLLECTION; break;
                    case ASCII_COLON: this.currentParsingState = STATE_INTEGER; break;
                    case ASCII_PLUS: this.currentParsingState = STATE_SIMPLE; break;
                    case ASCII_MINUS: this.currentParsingState = STATE_ERROR; break;
                    default:
                        // Unknown type byte, reset and break to prevent infinite loop on malformed data
                        console.error("ProtocolDecoder: Unexpected initial byte:", typeByte);
                        this.resetParsingState();
                        this.resetAggregateState();
                        return; // Or throw an error
                }
                continue;
            }

            // If we are in BULK_STATE and have the length, we read fixed bytes
            if (this.currentParsingState === STATE_BLOB && this.expectedDataLength !== null) {
                const requiredLengthIncludingCRLF = this.expectedDataLength + CRLF_LENGTH;
                if (this.accumulatedBuffer.length >= requiredLengthIncludingCRLF) {
                    const blobContent = this.accumulatedBuffer.slice(0, this.expectedDataLength);
                    this.accumulatedBuffer = this.accumulatedBuffer.slice(requiredLengthIncludingCRLF);
                    this.dispatchDecodedResult({ kind: STATE_BLOB, content: blobContent });
                    continue;
                } else {
                    break; // Not enough data for the bulk content
                }
            }

            // For other states or for bulk length lines, we look for CRLF
            const crlfPosition = this.accumulatedBuffer.indexOf(CRLF_SEQUENCE);

            if (crlfPosition !== -1) {
                const lineData = this.accumulatedBuffer.slice(0, crlfPosition);
                this.accumulatedBuffer = this.accumulatedBuffer.slice(crlfPosition + CRLF_LENGTH);

                switch (this.currentParsingState) {
                    case STATE_SIMPLE:
                    case STATE_ERROR:
                        this.dispatchDecodedResult({ kind: this.currentParsingState, content: lineData });
                        break;
                    case STATE_INTEGER:
                        const numValue = parseInt(lineData.toString('ascii'), 10);
                        this.dispatchDecodedResult({ kind: STATE_INTEGER, content: numValue });
                        break;
                    case STATE_BLOB: // This line is the length of the bulk data
                        const bulkLen = parseInt(lineData.toString('ascii'), 10);
                        if (bulkLen === -1) { // Null bulk reply
                            this.dispatchDecodedResult({ kind: STATE_BLOB, content: null });
                        } else {
                            this.expectedDataLength = bulkLen;
                            // Stay in BLOB_STATE to read actual content
                        }
                        break;
                    case STATE_COLLECTION: // This line is the count of sub-replies
                        const aggregateCount = parseInt(lineData.toString('ascii'), 10);
                        if (aggregateCount === -1) { // Null multi-bulk reply
                            this.dispatchDecodedResult({ kind: STATE_COLLECTION, content: null });
                        } else {
                            this.collectedSubResults = [];
                            this.expectedSubResultsCount = aggregateCount;
                            // Stay in COLLECTION_STATE to collect sub-replies
                        }
                        break;
                }
                continue;
            } else {
                break; // No full line found yet
            }
        }
    }

    dispatchDecodedResult(parsedItem) {
        if (this.collectedSubResults !== null) {
            this.collectedSubResults.push(parsedItem);
            if (--this.expectedSubResultsCount === 0) {
                this.resultHandlerFn.call(this.contextObj, {
                    kind: STATE_COLLECTION,
                    content: this.collectedSubResults
                });
                this.resetAggregateState();
            }
        } else {
            this.resultHandlerFn.call(this.contextObj, parsedItem);
        }
        this.resetParsingState();
    }
}

// Replaces Client
class ConnectionHandler {
    constructor(transportStream, opts) {
        this.networkStream = transportStream;
        this.pendingCommandPromises = []; // Stores { commandName, resolve, reject }
        this.outgoingRequestQueue = []; // Buffers to be sent
        this.responseProcessor = new ProtocolDecoder(this.onDecodedResult.bind(this), this);
        
        this.reconnectionScheduler = null;
        this.maximumRetries = 10;
        this.currentRetryCount = 0;
        this.currentRetryDelay = 500;
        this.totalConnectionsMade = 0;
        this.explicitlyClosing = false;
        
        this.pubSubNotificationListeners = {}; // For Pub/Sub callbacks

        if (opts && typeof opts.maximumRetries === 'number') {
            this.maximumRetries = Math.abs(opts.maximumRetries);
        }

        // Custom event dispatcher (replaces EventEmitter)
        this.eventObservers = {};
        this.emitEvent = (eventName, ...args) => {
            if (this.eventObservers[eventName]) {
                this.eventObservers[eventName].forEach(observer => observer(...args));
            }
        };
        this.registerEvent = (eventName, observerFn) => {
            if (!this.eventObservers[eventName]) {
                this.eventObservers[eventName] = [];
            }
            this.eventObservers[eventName].push(observerFn);
        };
        this.deregisterEvent = (eventName, observerFn) => {
            if (this.eventObservers[eventName]) {
                this.eventObservers[eventName] = this.eventObservers[eventName].filter(o => o !== observerFn);
            }
        };

        this.networkStream.on("connect", () => {
            utilityTrace("[CONNECTED]");
            this.networkStream.setNoDelay(true);
            this.networkStream.setTimeout(0);

            this.currentRetryCount = 0;
            this.currentRetryDelay = 500;
            if (this.reconnectionScheduler) {
                clearTimeout(this.reconnectionScheduler);
                this.reconnectionScheduler = null;
            }

            const connectEvent = this.totalConnectionsMade === 0 ? 'link_established' : 'link_reestablished';
            this.totalConnectionsMade++;
            this.explicitlyClosing = false;

            if (this.totalConnectionsMade > 1 && this.pendingCommandPromises.length > 0) {
                utilityTrace(`[RECONNECTION] ${this.pendingCommandPromises.length} commands orphaned. Rejecting promises.`);
                this.rejectAllPending(exportables.LOST_COMMAND_MESSAGE);
            }
            
            this.pendingCommandPromises = []; // Clear on (re)connection
            this.dispatchQueuedRequests();

            this.emitEvent(connectEvent, this);
        });

        this.networkStream.on('error', (err) => {
            utilityTrace(`[ERROR] Network stream encountered error: ${err.message}`);
            // The 'close' event will handle reconnection attempts.
        });

        this.networkStream.on("data", (dataBlock) => {
            if (exportables.traceActivity) {
                utilityTrace("[RECEIVED] " + formatBinaryForDisplay(dataBlock));
            }
            this.responseProcessor.ingestPayload(dataBlock);
        });

        this.networkStream.on("close", (hadError) => {
            utilityTrace(`[DISCONNECTED] Had error: ${hadError}`);
            this.initiateReconnectionAttempt();
        });

        this.networkStream.on("end", () => {
            if (exportables.traceActivity && this.pendingCommandPromises.length > 0) {
                utilityTrace(`Connection ended with ${this.pendingCommandPromises.length} pending replies.`);
            }
            // 'close' event will follow.
        });
    }

    terminateConnection() {
        this.explicitlyClosing = true;
        this.networkStream.end();
        if (this.reconnectionScheduler) {
            clearTimeout(this.reconnectionScheduler);
            this.reconnectionScheduler = null;
        }
        this.rejectAllPending("Connection explicitly terminated by client.");
    }

    onDecodedResult(decodedReply) {
        this.dispatchQueuedRequests();

        if (this.handlePubSubMessage(decodedReply)) {
            return;
        }

        const nextPromise = this.pendingCommandPromises.shift();

        if (nextPromise) {
            const { commandName, resolve, reject } = nextPromise;
            if (decodedReply.kind === STATE_ERROR) {
                reject(new Error(decodedReply.content.toString('utf8')));
            } else {
                resolve(this.transformReplyContent(commandName, decodedReply));
            }
        } else {
            utilityTrace("[WARNING] Received a reply but no corresponding pending command.");
        }

        if (this.pendingCommandPromises.length === 0) {
            this.emitEvent('idle_state', this);
        }
    }

    handlePubSubMessage(decodedReply) {
        if (decodedReply.kind !== STATE_COLLECTION || !(decodedReply.content instanceof Array)) {
            return false;
        }

        const items = decodedReply.content;
        if (items.length === 0 || !nodeBuffer.isBuffer(items[0].content)) return false;

        const firstItemString = items[0].content.toString('ascii');

        const isRegularMessage = (items.length === 3 && firstItemString === 'message');
        const isPatternMessage = (items.length === 4 && firstItemString === 'pmessage');

        if (!isRegularMessage && !isPatternMessage) {
            return false;
        }
        
        if (Object.keys(this.pubSubNotificationListeners).length === 0) {
            return true;
        }

        let channelId, patternId, messagePayload, listenerKey;

        if (isRegularMessage) {
            channelId = items[1].content;
            messagePayload = items[2].content;
            listenerKey = channelId.toString('utf8');
        } else if (isPatternMessage) {
            patternId = items[1].content;
            channelId = items[2].content;
            messagePayload = items[3].content;
            listenerKey = patternId.toString('utf8');
        }

        const activeListener = this.pubSubNotificationListeners[listenerKey];

        if (typeof activeListener === "function") {
            activeListener(channelId, messagePayload, patternId);
            return true;
        }

        return false;
    }

    initiateReconnectionAttempt() {
        if (this.explicitlyClosing || this.currentRetryCount >= this.maximumRetries) {
            utilityTrace("[RECONNECTION] Max retry attempts reached or connection closed. Emitting 'no_link'.");
            this.emitEvent('no_link', this);
            this.rejectAllPending(exportables.NO_SERVER_CONNECTION_MESSAGE);
            return;
        }

        this.currentRetryCount++;
        this.currentRetryDelay *= 2;
        utilityTrace(`[RECONNECTION] Attempt ${this.currentRetryCount}/${this.maximumRetries} in ${this.currentRetryDelay}ms`);
        this.emitEvent('retrying_link', this, this.currentRetryCount, this.maximumRetries);

        this.reconnectionScheduler = setTimeout(() => {
            this.networkStream.connect(this.networkStream.remotePort, this.networkStream.remoteAddress);
        }, this.currentRetryDelay);
    }

    rejectAllPending(errorMessage) {
        while (this.pendingCommandPromises.length > 0) {
            const request = this.pendingCommandPromises.shift();
            request.reject(new Error(errorMessage));
        }
    }

    transformReplyContent(commandIdentifier, decodedPayload) {
        if (decodedPayload.content === null) return null;

        if (commandIdentifier === 'info' && decodedPayload.kind === STATE_BLOB) {
            const infoMap = {};
            decodedPayload.content.toString('ascii').split(/\r\n/g)
                .forEach(line => {
                    const parts = line.split(':');
                    if (parts.length === 2) {
                        infoMap[parts[0]] = attemptNumericConversion(parts[1]);
                    }
                });
            return infoMap;
        }
        return decodedPayload.content;
    }

    // Sends a command and returns a Promise for its result
    sendOperation(operationName, ...args) {
        return new Promise((resolve, reject) => {
            this.pendingCommandPromises.push({ commandName: operationName.toLowerCase(), resolve, reject });
            
            let commandParts = [operationName].concat(args);
            let requestBuffer = this.constructProtocolRequest(commandParts);
            this.outgoingRequestQueue.push(requestBuffer);
            this.dispatchQueuedRequests();
        });
    }

    constructProtocolRequest(parts) {
        let requestString = `*${parts.length}\r\n`;
        parts.forEach(part => {
            const partStr = String(part);
            requestString += `$${nodeBuffer.byteLength(partStr)}\r\n${partStr}\r\n`;
        });
        return nodeBuffer.from(requestString);
    }

    dispatchQueuedRequests() {
        if (this.networkStream.writable && this.outgoingRequestQueue.length > 0) {
            while (this.outgoingRequestQueue.length > 0) {
                const requestPacket = this.outgoingRequestQueue.shift();
                if (exportables.traceActivity) {
                    utilityTrace("[SENT] " + formatBinaryForDisplay(requestPacket));
                }
                this.networkStream.write(requestPacket);
            }
        }
    }

    // PubSub specific methods
    registerPubSubListener(channelKey, listenerFunction) {
        this.pubSubNotificationListeners[channelKey.toString('utf8')] = listenerFunction;
        return this.sendOperation('SUBSCRIBE', channelKey);
    }

    deregisterPubSubListener(channelKey) {
        delete this.pubSubNotificationListeners[channelKey.toString('utf8')];
        return this.sendOperation('UNSUBSCRIBE', channelKey);
    }
}

exportables.createConnectionHandler = function (portValue, hostValue, optionsObject) {
    const p = portValue || exportables.DEFAULT_SERVER_PORT;
    const h = hostValue || exportables.DEFAULT_SERVER_HOST;

    const handler = new ConnectionHandler(nodeNet.createConnection(p, h), optionsObject);
    handler.serverPort = p;
    handler.serverHost = h;

    return handler;
};

// Export the main creation function
module.exports = exportables;