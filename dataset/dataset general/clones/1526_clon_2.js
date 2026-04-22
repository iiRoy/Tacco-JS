var ProtocolProcessor = require("./fastcgi_parser");

var HTTP_STATUS_MESSAGES = require('http').STATUS_CODES;

// Define various FastCGI record types for clarity
var RECORD_TYPE_START_REQUEST = ProtocolProcessor.constants.record.FCGI_BEGIN;
var RECORD_TYPE_PARAMETERS = ProtocolProcessor.constants.record.FCGI_PARAMS;
var RECORD_TYPE_STANDARD_INPUT = ProtocolProcessor.constants.record.FCGI_STDIN;
var RECORD_TYPE_END_REQUEST = ProtocolProcessor.constants.record.FCGI_END;
var RECORD_TYPE_STANDARD_OUTPUT = ProtocolProcessor.constants.record.FCGI_STDOUT;

// Calculate maximum allowed content size for a single FastCGI record
var MAX_CONTENT_SEGMENT_SIZE = ProtocolProcessor.constants.general.FCGI_MAX_BODY - 16;

// Global counters and utility objects
var activeConnectionsCount = 0;

var protocolFrameBuilder = new ProtocolProcessor.writer();
protocolFrameBuilder.encoding = "binary"; // Ensure binary output for frames

// Default header structure for outgoing FastCGI frames
var currentFrameHeader = {
    "version": ProtocolProcessor.constants.version,
    "type": ProtocolProcessor.constants.record.FCGI_STDOUT,
    "recordId": 0,
    "contentLength": 0,
    "paddingLength": 0
};

// Default status structure for FastCGI response completion
var responseCompletionStatus = {
    "status": 0,
    "protocolStatus": 200
};

/**
 * Manages responses sent back to the FastCGI client.
 * @param {object} commSocket - The underlying network socket.
 * @param {number} requestId - The FastCGI request identifier.
 */
function FastCGIResponder(commSocket, requestId) {
    this.connectionHandle = commSocket;
    this.frameIdentifier = requestId;
    this.httpOutcomeCode = 0;
    this.isFinished = false; // Flag to indicate if the response has been finalized
}

/**
 * Writes a raw byte buffer to the underlying socket.
 * @param {Buffer} dataBuffer - The buffer containing raw bytes.
 */
FastCGIResponder.prototype._transmitRawBuffer = function(dataBuffer) {
    if (this.connectionHandle.writable) {
        this.connectionHandle.write(dataBuffer);
    } else {
        // If socket is not writable, mark response as finished.
        this.isFinished = true;
    }
};

/**
 * Sends the HTTP response headers.
 * @param {number} httpCode - The HTTP status code (e.g., 200, 404).
 */
FastCGIResponder.prototype.sendHeaders = function(httpCode) {
    if (this.isFinished) return false; // Do nothing if response is already finished

    this.httpOutcomeCode = httpCode;
    var statusText = HTTP_STATUS_MESSAGES[httpCode] || 'unknown';
    // Construct a basic HTTP response header string
    var headerPayload = 'HTTP/1.1 ' + httpCode + ' ' + statusText + '\r\nConnection: close\r\nContent-Type: text/plain\r\n\r\n';

    // Update the global frame header for this output
    currentFrameHeader.type = RECORD_TYPE_STANDARD_OUTPUT;
    currentFrameHeader.recordId = this.frameIdentifier;
    currentFrameHeader.contentLength = headerPayload.length;

    protocolFrameBuilder.composeFrameHeader(currentFrameHeader);
    protocolFrameBuilder.composeFrameBody(new Buffer(headerPayload));
    this._transmitRawBuffer(protocolFrameBuilder.toByteStream());
};

/**
 * Sends a chunk of response body data.
 * @param {Buffer|string} dataSegment - The data to send.
 */
FastCGIResponder.prototype.sendBodyChunk = function(dataSegment) {
    if (this.isFinished) return false;

    // Convert string chunks to Buffer if necessary
    if (typeof dataSegment === 'string') {
        dataSegment = new Buffer(dataSegment);
    } else {
        if (!Buffer.isBuffer(dataSegment)) {
            return false; // Only accept strings or Buffers
        }
    }
    if (dataSegment.length === 0) return false; // Ignore empty chunks

    currentFrameHeader.type = RECORD_TYPE_STANDARD_OUTPUT;
    currentFrameHeader.recordId = this.frameIdentifier;

    // Handle large chunks by splitting them into multiple FastCGI records
    if (dataSegment.length > MAX_CONTENT_SEGMENT_SIZE) {
        var totalByteLength = dataSegment.length;
        var currentLength = 0;
        var currentPosition = 0;
        var subBodySegment;

        while (totalByteLength > 0) {
            if (totalByteLength > MAX_CONTENT_SEGMENT_SIZE) {
                currentLength = MAX_CONTENT_SEGMENT_SIZE;
            } else {
                currentLength = totalByteLength;
            }
            subBodySegment = dataSegment.slice(currentPosition, currentPosition + currentLength);
            currentPosition += currentLength;
            totalByteLength -= currentLength;

            currentFrameHeader.contentLength = currentLength;
            protocolFrameBuilder.composeFrameHeader(currentFrameHeader);
            protocolFrameBuilder.composeFrameBody(subBodySegment);
            this._transmitRawBuffer(protocolFrameBuilder.toByteStream());
        }
    } else {
        // Send small chunks directly
        currentFrameHeader.contentLength = dataSegment.length;
        protocolFrameBuilder.composeFrameHeader(currentFrameHeader);
        protocolFrameBuilder.composeFrameBody(dataSegment);
        this._transmitRawBuffer(protocolFrameBuilder.toByteStream());
    }
};

/**
 * Finalizes the FastCGI response, signaling the end of output.
 */
FastCGIResponder.prototype.finalizeResponse = function() {
    if (this.isFinished) return false;

    // Send an empty STDOUT record to signal end of standard output
    currentFrameHeader.type = RECORD_TYPE_STANDARD_OUTPUT;
    currentFrameHeader.recordId = this.frameIdentifier;
    currentFrameHeader.contentLength = 0;
    protocolFrameBuilder.composeFrameHeader(currentFrameHeader);
    this._transmitRawBuffer(protocolFrameBuilder.toByteStream());

    // Send an END_REQUEST record with the final status
    responseCompletionStatus.protocolStatus = this.httpOutcomeCode;
    currentFrameHeader.type = RECORD_TYPE_END_REQUEST;
    currentFrameHeader.contentLength = 8; // Size of the FCGI_END_REQUEST_BODY
    protocolFrameBuilder.composeFrameHeader(currentFrameHeader);
    protocolFrameBuilder.composeEndFrame(responseCompletionStatus);
    this._transmitRawBuffer(protocolFrameBuilder.toByteStream());

    // Mark response as finished
    this.isFinished = true;
    this.connectionHandle.end(); // Close the underlying socket for this request
};

/**
 * Handles incoming client connections for the FastCGI server.
 * @param {object} connectionHandle - The incoming network socket.
 */
function clientConnectionHandler(connectionHandle) {
    var instanceRef = this; // Reference to the FcgiServer instance

    connectionHandle.setTimeout(2 * 60 * 1000); // Set a 2-minute timeout
    connectionHandle.setNoDelay(false); // Enable Nagle's algorithm

    var incomingRequestData = null; // Stores parsed request details
    var inputFrameParser = new ProtocolProcessor.parser();
    inputFrameParser.encoding = "binary"; // Expect binary input

    // Callback for parsing errors
    inputFrameParser.onParsingError = function(parseError) {
        console.log(JSON.stringify(parseError, null, "\t"));
    };

    // Callback for complete FastCGI records
    inputFrameParser.onFrameReceived = function(receivedFrame) {
        switch (receivedFrame.frameMetadata.frameType) {
            case RECORD_TYPE_START_REQUEST:
                // Initialize request object for a new incoming request
                incomingRequestData = {};
                incomingRequestData.requestHeaders = {};
                incomingRequestData.connectionInfo = {};
                break;
            case RECORD_TYPE_PARAMETERS:
                if (receivedFrame.frameMetadata.payloadLength !== 0) {
                    var requestParameters = receivedFrame.body.params;
                    if (requestParameters.REQUEST_METHOD) {
                        incomingRequestData.verb = requestParameters.REQUEST_METHOD;
                    }
                    if (requestParameters.SERVER_PROTOCOL) {
                        var versionParts = requestParameters.SERVER_PROTOCOL.split('/');
                        if (versionParts.length == 2) {
                            versionParts = versionParts[1].split('.');
                            if (versionParts.length == 2) {
                                incomingRequestData.majorVersion = parseInt(versionParts[0]);
                                incomingRequestData.minorVersion = parseInt(versionParts[1]);
                                incomingRequestData.versionString = versionParts[0] + '.' + versionParts[1];
                            }
                        }
                    }
                    if (requestParameters.DOCUMENT_URI) {
                        incomingRequestData.resourceURL = requestParameters.DOCUMENT_URI;
                    } else {
                        incomingRequestData.resourceURL = '/';
                    }
                    if (requestParameters.URL_QUERY_STRING) {
                        incomingRequestData.resourceURL += '?';
                        incomingRequestData.resourceURL += requestParameters.URL_QUERY_STRING;
                    }
                    if (requestParameters.HTTP_COOKIE) {
                        incomingRequestData.requestHeaders.cookie = requestParameters.HTTP_COOKIE;
                    }
                    if (requestParameters.REMOTE_ADDR) {
                        incomingRequestData.connectionInfo.clientAddress = requestParameters.REMOTE_ADDR;
                    }
                }
                break;
            case RECORD_TYPE_STANDARD_INPUT:
                // When STDIN has a zero content length, it means end of request data
                if (receivedFrame.frameMetadata.payloadLength == 0) {
                    activeConnectionsCount++;
                    var responseSender = new FastCGIResponder(connectionHandle, receivedFrame.frameMetadata.recordId);
                    instanceRef.emit('request', incomingRequestData, responseSender); // Emit the 'request' event
                }
                break;
        }
    };

    // Forward incoming socket data to the FastCGI parser
    connectionHandle.onDataArrived = function(dataBuffer, startOffset, endOffset) {
        inputFrameParser.processData(dataBuffer, startOffset, endOffset);
    };

    // Handle end of socket stream
    connectionHandle.onStreamEnded = function() {
        // No specific action needed here for now
    };

    // Socket event listeners
    connectionHandle.on('connectionTimeout', function() {
        connectionHandle.destroy(); // Destroy socket on timeout
    });

    connectionHandle.on('connectionError', function(err) {
        console.error("fastcgi_service_error:" + err.stack);
    });

    connectionHandle.on('connectionClosed', function() {
        // Clean up resources if necessary
    });
}

/**
 * Represents a FastCGI server instance.
 * @param {function} incomingRequestHandler - Callback for new incoming requests.
 */
function FcgiServer(incomingRequestHandler) {
    if (!(this instanceof FcgiServer)) {
        return new FcgiServer(incomingRequestHandler);
    }

    if (incomingRequestHandler) {
        this.on('request', incomingRequestHandler);
    }

    this.on('connection', clientConnectionHandler);
}

// Inherit from Node.js's net.Server to leverage its eventing and socket handling
require('util').inherits(FcgiServer, require('net').Server);

/**
 * Factory function to create a new FastCGI server.
 * @param {function} requestListener - The function to handle incoming requests.
 * @returns {FcgiServer} A new FastCGI server instance.
 */
module.exports.createFcgiService = function(requestListener) {
    return new FcgiServer(requestListener);
}