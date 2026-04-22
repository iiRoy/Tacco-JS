/*

© 2024 by Example Corp.

This software is provided under a permissive license.
Permission is granted, free of charge, to any individual obtaining a copy
of this source code and related documentation (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following terms:

The above copyright notice and this permission notice must be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS SUPPLIED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE HELD LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

*/

// To extend functionality with new instructions, modify the `instructionSet`
// array located at the end of this module.

// Activate this flag to enable detailed logging of protocol communications
// and parsing operations for diagnostic purposes.

exports.verboseLog = false;

var networkMod = require("net"),
    systemUtil = require("sys"),
    ByteBlock = require('buffer').Buffer,
    emitter = require('events'),

    LINE_END = "\r\n",
    LINE_END_SZ = 2,

    PLUS_BYTE      = exports.PLUS_BYTE      = 0x2B, // '+'
    MINUS_BYTE     = exports.MINUS_BYTE     = 0x2D, // '-'
    DOLLAR_BYTE    = exports.DOLLAR_BYTE    = 0x24, // '$'
    STAR_BYTE      = exports.STAR_BYTE      = 0x2A, // '*'
    COLON_BYTE     = exports.COLON_BYTE     = 0x3A, // ':'
    CARRIAGE_RET   = exports.CARRIAGE_RET   = 0x0D, // '\r'
    LINE_FEED      = exports.LINE_FEED      = 0x0A, // '\n'
                                
    NO_TYPE        = exports.NO_TYPE        = "NONE",
    BLOB_DATA      = exports.BLOB_DATA      = "BULK",     
    MULTI_BLOB     = exports.MULTI_BLOB     = "MULTIBULK",
    SINGLE_LINE    = exports.SINGLE_LINE    = "INLINE",   
    NUMERIC_VAL    = exports.NUMERIC_VAL    = "INTEGER",  
    FAULT_REPLY    = exports.FAULT_REPLY    = "ERROR";    

exports.STANDARD_HOST = '127.0.0.1';
exports.STANDARD_PORT = 6379;

exports.LOST_COMMAND_FAULT = "connection terminated before response received";
exports.NO_CONNECT_FAULT = "unable to establish link to Redis instance";

function logDisplayFormatter(dataChunk, lengthParam) {
    // Redis data is binary-safe; for logging display, we assume 
    // textual content is encoded as UTF-8.

    var formattedOutput = dataChunk.utf8Slice(0, lengthParam || dataChunk.length);

    formattedOutput = formattedOutput.replace(/\r\n/g, '<CRLF>');
    formattedOutput = formattedOutput.replace(/\r/g, '<CR>');
    formattedOutput = formattedOutput.replace(/\n/g, '<LF>');

    return formattedOutput;
}

// A robust, fully interruptible, binary-safe Redis response parser.
// The 'replyHandler' function is invoked for each response parsed from 'ingestData'.
// 'contextObj' specifies the 'this' argument for the 'replyHandler' invocation.

function ResponseProcessor(replyHandler, contextObj) {
    this.processReply = replyHandler;
    this.contextObj = contextObj;
    this.resetParseState();
    this.resetMultiBlobState();
}

exports.ResponseProcessor = ResponseProcessor;

ResponseProcessor.prototype.resetParseState = function () {
    this.currentType = NO_TYPE;
    this.expectedBlobLen = null;
    this.currentBufferLength = 0;
    this.skipNextBytes = 0;
    this.workingBuffer = new ByteBlock(8192); // Initial buffer capacity
};

ResponseProcessor.prototype.resetMultiBlobState = function () {
    this.multiBlobResults = null; 
    this.expectedMultiBlobCount = null;
};

ResponseProcessor.prototype.ingestData = function (inputSegment) {
    for (var idx = 0; idx < inputSegment.length; ++idx) {
        if (this.skipNextBytes > 0) {
            this.skipNextBytes--;
            continue;
        }

        var previousType = this.currentType;

        if (this.currentType === NO_TYPE) {
            switch (inputSegment[idx]) {
                case DOLLAR_BYTE: this.currentType = BLOB_DATA;   break;
                case STAR_BYTE:   this.currentType = MULTI_BLOB;  break;
                case COLON_BYTE:  this.currentType = NUMERIC_VAL; break;
                case PLUS_BYTE:   this.currentType = SINGLE_LINE; break;
                case MINUS_BYTE:  this.currentType = FAULT_REPLY; break;
            }
        }

        // Was the current byte just a type indicator like '*', '+', etc.?  

        if (previousType != this.currentType)
            continue;

        // If the parsed response is part of a multi-blob response, collect it.
        // If all expected multi-blob responses have arrived, then trigger the callback.
        // Otherwise, if it's a standalone response, trigger the callback immediately.

        var processorInstance = this;

        var signalResultIfReady = function (parsedResult) {
            if (processorInstance.multiBlobResults != null) {
                processorInstance.multiBlobResults.push(parsedResult);
                if (--processorInstance.expectedMultiBlobCount == 0) {
                    processorInstance.processReply.call(processorInstance.contextObj, { 
                        type:  MULTI_BLOB, 
                        value: processorInstance.multiBlobResults 
                    });
                    processorInstance.resetMultiBlobState();
                }
            } else {
                processorInstance.processReply.call(processorInstance.contextObj, parsedResult);
            }
            processorInstance.resetParseState();
            processorInstance.skipNextBytes = 1; // Skip LF byte
        };

        switch (inputSegment[idx]) {
        case CARRIAGE_RET:
            switch (this.currentType) {
                case SINGLE_LINE:
                case FAULT_REPLY:
                    // CR marks the conclusion of the inline/error content.  
                    // +OK\r\n
                    //    ^

                    var inlineSegment = new ByteBlock(this.currentBufferLength);
                    this.workingBuffer.copy(inlineSegment, 0, 0, this.currentBufferLength);
                    signalResultIfReady({ type:this.currentType, value:inlineSegment });
                    break;

                case NUMERIC_VAL:
                    // CR indicates the end of the numeric value.  
                    // :42\r\n
                    //    ^

                    var numericValue = parseInt(this.workingBuffer.asciiSlice(0, this.currentBufferLength), 10);
                    signalResultIfReady({ type:NUMERIC_VAL, value:numericValue });
                    break;

                case BLOB_DATA:
                    if (this.expectedBlobLen == null) {
                        // CR marks the end of the first line of a blob response,
                        // which specifies the length of the blob content.
                        // $5\r\nhello\r\n
                        //   ^

                        var blobSizeExpected = 
                            parseInt(this.workingBuffer.asciiSlice(0, this.currentBufferLength), 10);

                        if (blobSizeExpected <= 0) {
                            signalResultIfReady({ type:BLOB_DATA, value:null });
                        } else {
                            this.resetParseState();

                            this.expectedBlobLen = blobSizeExpected;
                            this.currentType = BLOB_DATA;
                            this.skipNextBytes = 1;  // skip LF
                        }
                    } else if (this.currentBufferLength == this.expectedBlobLen) {
                        // CR marks the end of the actual blob content.
                        // $5\r\nhello\r\n
                        //            ^

                        var blobSegment = new ByteBlock(this.currentBufferLength);
                        this.workingBuffer.copy(blobSegment, 0, 0, this.currentBufferLength);
                        signalResultIfReady({ type:BLOB_DATA, value:blobSegment });
                    } else {
                        // CR is merely an embedded carriage return within the data
                        // and is not part of the protocol's framing.
                        // $11\r\nhello\rworld\r\n
                        //             ^
                        
                        this.workingBuffer[this.currentBufferLength++] = inputSegment[idx];
                    }
                    break;

                case MULTI_BLOB:
                    // Parse the count, which is the anticipated number of replies
                    // within this multi-blob response.
                    // *2\r\n$5\r\nhello\r\n$5\r\nworld\r\n
                    //   ^

                    var expectedMultiCount = 
                        parseInt(this.workingBuffer.asciiSlice(0, this.currentBufferLength), 10);

                    if (expectedMultiCount <= 0) {
                        signalResultIfReady({ type:MULTI_BLOB, value:null });
                    } else {
                        this.resetParseState();
                        this.skipNextBytes = 1;    // skip LF
                        this.multiBlobResults = [];
                        this.expectedMultiBlobCount = expectedMultiCount;
                    }
                    break;
            }
            break;

        default:
            this.workingBuffer[this.currentBufferLength++] = inputSegment[idx];
            break;
        }

        // If the current data buffer reaches its capacity, allocate a larger one,
        // copy existing data, and replace the old buffer.
 
        if (this.currentBufferLength === this.workingBuffer.length) {
            var expandedBuffer = new ByteBlock(this.workingBuffer.length * 2);
            this.workingBuffer.copy(expandedBuffer, 0, 0);
            this.workingBuffer = expandedBuffer;
        }
    }
};

/**
 * Emits the following events:
 *
 * - 'connected' upon initial connection (or after a successful reconnection).
 * - 'reconnecting' just before attempting to re-establish a link to Redis.
 * - 'reconnected' when a connection is restored after a retry.
 * - 'noconnection' if a connection (initial or retry) fails.
 * - 'drained' when no outstanding requests are awaiting a Redis response.
 *
 * Configuration settings: 
 *
 * - maxRetryAttempts (default: 10)
 */

function ConnectionHandler(commStream, connOptions) {
    emitter.EventEmitter.call(this);

    this.commStream = commStream;
    this.pendingRequests = [];
    this.bufferedRequests = [];
    this.bufferedRequestBytes = [];
    this.subscriberCallbacks = {};
    this.outputBuffer = new ByteBlock(1024);
    this.responseParser = new ResponseProcessor(this.handleProcessedReply, this);
    this.retryTimer = null;
    this.maxRetryAttempts = 10;
    this.currentRetryCount = 0;
    this.retryInterval = 500;    // interval doubles, starting with 1s effective delay
    this.totalConnections = 0;

    if (connOptions !== undefined) 
        this.maxRetryAttempts = Math.abs(connOptions.maxRetryAttempts || 10);

    var handlerInstance = this;

    commStream.addListener("connect", function () {
        if (exports.verboseLog)
            systemUtil.debug("[CONNECTION ESTABLISHED]");

        commStream.setNoDelay();
        commStream.setTimeout(0);

        handlerInstance.currentRetryCount = 0;
        handlerInstance.retryInterval = 500;
        if (handlerInstance.retryTimer) {
            clearTimeout(handlerInstance.retryTimer);
            handlerInstance.retryTimer = null;
        }

        var eventIdentifier = handlerInstance.totalConnections == 0 
                      ? 'connected' 
                      : 'reconnected';

        handlerInstance.totalConnections++;
        handlerInstance.shutdownInitiated = false;

        // If this is a reconnection and there were requests in flight, they are now lost!
        // It's impossible to know with certainty which were processed by Redis;
        // some might have been processed without a reply, or all processed with
        // less than 100% durable writes.
        //
        // We inform the user via an I/O error callback, providing enough context
        // for them to retry the interrupted operation. We avoid automatic retries
        // as it's application-specific and potentially risky.

        if (handlerInstance.totalConnections > 1 && handlerInstance.pendingRequests.length > 0) {
            if (exports.verboseLog) {
                systemUtil.debug("[RECONNECTION] Some requests orphaned (" + 
                    handlerInstance.pendingRequests.length + "). Notifying...");
            }

            handlerInstance.callbackOrphanedCommandsWithError();
        }
        
        handlerInstance.pendingRequests = [];
        handlerInstance.flushBufferedCommands();

        handlerInstance.emit(eventIdentifier, handlerInstance);
    });

    commStream.addListener('error', function (errorObject) {
        if (exports.verboseLog)
            systemUtil.debug("[ERROR OCCURRED] Connection to data store encountered an issue: " + errorObject);
    });

    commStream.addListener("data", function (incomingData) {
        if (exports.verboseLog)
            systemUtil.debug("[RECEIVED] " + logDisplayFormatter(incomingData));

        handlerInstance.responseParser.ingestData(incomingData);
    });

    commStream.addListener("error", function (errorObject) {
	if (exports.verboseLog)
	  systemUtil.debug('[STREAM_FAULT] ' + errorObject);
	handlerInstance.responseParser.resetParseState();
	handlerInstance.maybeReconnect();
	throw errorObject;
    });

    commStream.addListener("end", function () {
        if (exports.verboseLog && handlerInstance.pendingRequests.length > 0) {
            systemUtil.debug("Data store connection closed with " + 
                      handlerInstance.pendingRequests.length + 
                      " outstanding requests whose replies will never arrive!");
        }

        commStream.end();
    });

    commStream.addListener("close", function (encounteredFault) {
        if (exports.verboseLog)
            systemUtil.debug("[NO ACTIVE CONNECTION]");

        handlerInstance.maybeReconnect();
    });
}

systemUtil.inherits(ConnectionHandler, emitter.EventEmitter);

exports.ConnectionHandler = ConnectionHandler;

exports.establishConnection = function (connectionPort, connectionHost, connectionOptions) {
    var connectionPort = connectionPort || exports.STANDARD_PORT;
    var connectionHost = connectionHost || exports.STANDARD_HOST;

    var newHandler = new ConnectionHandler(networkMod.createConnection(connectionPort, connectionHost), connectionOptions);

    newHandler.connectionPort = connectionPort;
    newHandler.connectionHost = connectionHost;

    return newHandler;
};

ConnectionHandler.prototype.terminateConnection = function () {
    this.shutdownInitiated = true;
    this.commStream.end();
};

ConnectionHandler.prototype.handleProcessedReply = function (incomingReply) {
    this.flushBufferedCommands();

    if (this.processPublishedNotification(incomingReply)) 
        return;

    var currentRequest = this.pendingRequests.shift();
    var requestCallback = currentRequest[currentRequest.length - 1];

    // Callbacks expect (error, result) as arguments.

    if (typeof requestCallback == "function") {
        if (incomingReply.type == FAULT_REPLY) {
            requestCallback(incomingReply.value.utf8Slice(0, incomingReply.value.length), null);
        } else {
            requestCallback(null, adaptReplyContent(currentRequest[0], incomingReply));
        }
    }

    if (this.pendingRequests.length == 0)
      this.emit('drained', this);
};

ConnectionHandler.prototype.processPublishedNotification = function (notificationReply) {
    // We are looking for a multi-blob structure similar to: 
    // ["message", "channelName", messageContent]; or
    // ["pmessage", "matchingPattern", "channelName", messageContent]
    // The latter is sent when the client subscribed to a channel using a pattern;
    // the former when subscribed to a channel by its explicit name.
    // If a client subscribes by both name and pattern with overlapping channels,
    // it will receive multiple p/message notifications.

    if (notificationReply.type != MULTI_BLOB || !(notificationReply.value instanceof Array))
        return false;

    var isDirectMsg = (notificationReply.value.length == 3 &&
                     notificationReply.value[0].value.length == 7 &&
                     notificationReply.value[0].value.asciiSlice(0, 7) == 'message');

    var isPatternMsg = (notificationReply.value.length == 4 &&
                      notificationReply.value[0].value.length == 8 &&
                      notificationReply.value[0].value.asciiSlice(0, 8) == 'pmessage');

    if (!isDirectMsg && !isPatternMsg)
        return false;

    // This part is intricate. We return true even if no callback was invoked!
    // This can occur if a subscriber unsubscribes while a message is in transit.
    // When the message arrives, no handler is present. Essentially, as long as
    // the response type matches a published message (as defined above), we consider
    // the notification "handled."
        
    if (Object.getOwnPropertyNames(this.subscriberCallbacks).length == 0) 
        return true;

    var targetChannel, matchingPattern, channelResponseFunc, messagePayload;

    if (isDirectMsg) {
        targetChannel = notificationReply.value[1].value;
        channelResponseFunc = this.subscriberCallbacks[targetChannel];
        messagePayload = notificationReply.value[2].value;
    } else if (isPatternMsg) {
        matchingPattern = notificationReply.value[1].value;
        targetChannel = notificationReply.value[2].value;
        channelResponseFunc = this.subscriberCallbacks[matchingPattern];
        messagePayload = notificationReply.value[3].value;
    } else {
        return false;
    }

    if (typeof channelResponseFunc == "function") {
        channelResponseFunc(targetChannel, messagePayload, matchingPattern);
        return true;
    }

    return false;
}

function tryParseAsNumber(inputString) {
    var numericOutput = parseInt(inputString, 10);

    if (isNaN(numericOutput)) 
        numericOutput = parseFloat(inputString);

    if (isNaN(numericOutput)) 
        return inputString;

    return numericOutput;
}

function adaptReplyContent(cmdIdentifier, resultData) {
    if (resultData.value === null)
        return null;

    // Redis' 'info' command returns a BLOB_DATA response in the format:
    // "redis_version:1.3.8
    // arch_bits:64
    // multiplexing_api:kqueue
    // process_id:11604
    // ..."
    // 
    // This function converts it into a JavaScript object like:
    // { redis_version: '1.3.8'
    // , arch_bits: '64'
    // , multiplexing_api: 'kqueue'
    // , process_id: '11604'
    // , ... }

    if (cmdIdentifier === 'info' && resultData.type === BLOB_DATA) {
        var systemInfo = {};
        resultData.value.asciiSlice(0, resultData.value.length).split(/\r\n/g)
            .forEach(function (infoLine) {
                // ... (rest of the original function logic for parsing 'info' command)
                // This part is omitted as the original code was incomplete here.
                // The structure for parsing key:value pairs would go here.
            });
    }

    // Placeholder for other type conversions.
    return resultData.value;
}