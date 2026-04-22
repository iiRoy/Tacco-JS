const FcgiProtocolCodec = require("./fastcgi_parser");
const HTTP_STATUS_MAPPINGS = require('http').STATUS_CODES;

// Protocol constant definitions, now accessed via a renamed alias
const PROTOCOL_BEGIN_REQUEST = FcgiProtocolCodec.constants.record.FCGI_BEGIN;
const PROTOCOL_PARAM_STREAM = FcgiProtocolCodec.constants.record.FCGI_PARAMS;
const PROTOCOL_STDIN_STREAM = FcgiProtocolCodec.constants.record.FCGI_STDIN;
const PROTOCOL_END_REQUEST = FcgiProtocolCodec.constants.record.FCGI_END;
const PROTOCOL_STDOUT_STREAM = FcgiProtocolCodec.constants.record.FCGI_STDOUT;
// Max body size constant, adjusted for header overhead to align with common FastCGI implementations
const MAX_PAYLOAD_CHUNK_SIZE = FcgiProtocolCodec.constants.general.FCGI_MAX_BODY - 16;

// Global counter for active FastCGI requests being processed
let activeRequestCount = 0;

// Frame composer instance for writing FastCGI records to the socket
const frameComposer = new FcgiProtocolCodec.writer();
frameComposer.encoding = "binary"; // Ensure binary encoding for raw buffer handling

// Default structure for a FastCGI record header, used as a template
const defaultRecordHeader = {
    protocolVersion: FcgiProtocolCodec.constants.version,
    recordType: FcgiProtocolCodec.constants.record.FCGI_STDOUT,
    requestId: 0,
    contentLength: 0,
    paddingLength: 0
};

// Default structure for FastCGI end request status, used as a template
const defaultEndRequestStatus = {
    applicationStatus: 0, // Typically 0 for successful completion
    protocolStatus: FcgiProtocolCodec.constants.protocolStatus.FCGI_REQUEST_COMPLETE // Default to complete
};

/**
 * Utility function to robustly convert various data types to a Node.js Buffer.
 * Handles strings, existing Buffers, and Uint8Arrays.
 * @param {string|Buffer|Uint8Array} inputData - The data to convert.
 * @returns {Buffer|null} A Buffer instance or null if conversion fails.
 */
function ensureBuffer(inputData) {
    if (Buffer.isBuffer(inputData)) {
        return inputData;
    }
    if (typeof inputData === 'string') {
        return Buffer.from(inputData, 'utf8'); // Explicitly use UTF-8 encoding
    }
    if (inputData instanceof Uint8Array) {
        return Buffer.from(inputData); // Convert Uint8Array to Buffer
    }
    // Log unexpected types for debugging purposes, but return null to indicate failure
    console.warn(`[FcgiResponseManager] Unexpected data type for buffer conversion: ${typeof inputData}`);
    return null;
}

/**
 * Manages sending FastCGI responses back to the client socket for a specific request.
 * This class encapsulates the logic for writing HTTP headers, body chunks, and finalizing the FastCGI exchange.
 * @class
 * @param {object} clientChannel - The underlying Node.js net.Socket instance.
 * @param {number} reqIdentifier - The unique FastCGI request ID for this response.
 */
function FcgiResponseManager(clientChannel, reqIdentifier) {
    this.commChannel = clientChannel; // Renamed 'socket' to 'commChannel'
    this.currentRequestId = reqIdentifier; // Renamed 'recordId' to 'currentRequestId'
    this.responseHttpStatus = 0; // Renamed 'statusCode' to 'responseHttpStatus'
    this.isResponseFinalized = false; // Renamed 'closed' to 'isResponseFinalized'
    this.headersSent = false; // New flag to track if HTTP headers have been transmitted
}

/**
 * Transmits a raw FastCGI frame buffer over the communication channel.
 * Includes a check to ensure the channel is still writable.
 * @private
 * @param {Buffer} frameBuffer - The complete FastCGI frame (header + body) to write.
 */
FcgiResponseManager.prototype._transmitFrame = function(frameBuffer) {
    // Check if the communication channel is active and ready for writing
    if (this.commChannel && this.commChannel.writable) {
        this.commChannel.write(frameBuffer);
    } else {
        // If not writable, mark the response as finalized to prevent further write attempts
        this.isResponseFinalized = true;
        console.warn(`[FcgiResponseManager] Attempted to write to a non-writable socket for request ${this.currentRequestId}.`);
    }
};

/**
 * Sends the initial HTTP response headers as a FastCGI STDOUT record.
 * Automatically sets default headers if not provided.
 * @param {number} httpStatusCode - The HTTP status code (e.g., 200, 404).
 * @param {object} [additionalHeaders={}] - Optional object of custom HTTP headers (e.g., { 'Content-Type': 'application/json' }).
 * @returns {boolean} True if headers were successfully sent, false otherwise (e.g., if already sent or response finalized).
 */
FcgiResponseManager.prototype.sendHeaders = function(httpStatusCode, additionalHeaders = {}) {
    if (this.isResponseFinalized || this.headersSent) {
        // Prevent sending headers multiple times or after the response has been closed
        console.warn(`[FcgiResponseManager] Headers already sent or response finalized for request ${this.currentRequestId}.`);
        return false;
    }
    
    this.responseHttpStatus = httpStatusCode;
    const reasonPhrase = HTTP_STATUS_MAPPINGS[httpStatusCode] || 'Unknown Status';
    
    // Construct the initial HTTP response line and standard headers
    let headerString = `HTTP/1.1 ${httpStatusCode} ${reasonPhrase}\r\n`;
    headerString += `Connection: close\r\n`; // Explicitly signal connection close
    headerString += `Content-Type: text/plain; charset=utf-8\r\n`; // Default content type with charset

    // Append any custom headers provided by the application
    for (const headerName in additionalHeaders) {
        // Ensure property belongs to the object itself, not its prototype chain
        if (Object.prototype.hasOwnProperty.call(additionalHeaders, headerName)) {
            headerString += `${headerName}: ${additionalHeaders[headerName]}\r\n`;
        }
    }
    headerString += '\r\n'; // Mark the end of the HTTP headers

    // Create a mutable header object for the current FastCGI record
    const currentFrameHeader = { ...defaultRecordHeader };
    currentFrameHeader.recordType = PROTOCOL_STDOUT_STREAM;
    currentFrameHeader.requestId = this.currentRequestId;
    currentFrameHeader.contentLength = Buffer.byteLength(headerString, 'utf8'); // Accurate byte length

    frameComposer.writeHeader(currentFrameHeader);
    frameComposer.writeBody(Buffer.from(headerString, 'utf8')); // Ensure UTF-8 encoding for the header string
    this._transmitFrame(frameComposer.tobuffer());

    this.headersSent = true; // Mark headers as successfully sent
    return true;
};

/**
 * Sends a chunk of the response body as one or more FastCGI STDOUT records.
 * Handles splitting large chunks into multiple FastCGI records if they exceed `MAX_PAYLOAD_CHUNK_SIZE`.
 * @param {string|Buffer|Uint8Array} dataChunk - The data to send as part of the response body.
 * @returns {boolean} True if data was processed, false if response is finalized or chunk is invalid/empty.
 */
FcgiResponseManager.prototype.sendBodyChunk = function(dataChunk) {
    if (this.isResponseFinalized) {
        console.warn(`[FcgiResponseManager] Attempted to write body to a finalized response for request ${this.currentRequestId}.`);
        return false;
    }
    if (!this.headersSent) {
        // If headers haven't been sent, implicitly send default 200 OK headers
        this.sendHeaders(200);
    }

    const processedChunk = ensureBuffer(dataChunk);
    if (!processedChunk || processedChunk.length === 0) {
        // Invalid or empty chunk, nothing to send
        return false;
    }

    // Prepare a mutable header object for each STDOUT record
    const currentFrameHeader = { ...defaultRecordHeader };
    currentFrameHeader.recordType = PROTOCOL_STDOUT_STREAM;
    currentFrameHeader.requestId = this.currentRequestId;

    // Logic to split large chunks into smaller FastCGI records
    let remainingLength = processedChunk.length;
    let currentPosition = 0;

    // Loop until the entire chunk has been sent
    while (remainingLength > 0) {
        // Determine the size of the current segment to send, respecting MAX_PAYLOAD_CHUNK_SIZE
        const segmentLength = Math.min(remainingLength, MAX_PAYLOAD_CHUNK_SIZE);
        const segmentBuffer = processedChunk.slice(currentPosition, currentPosition + segmentLength);

        currentFrameHeader.contentLength = segmentBuffer.length;
        frameComposer.writeHeader(currentFrameHeader);
        frameComposer.writeBody(segmentBuffer);
        this._transmitFrame(frameComposer.tobuffer());

        currentPosition += segmentLength;
        remainingLength -= segmentLength;
    }
    return true;
};

/**
 * Finalizes the FastCGI response by sending an empty STDOUT record (to signal end of body)
 * and an END_REQUEST record, then terminates the underlying socket connection.
 * @returns {boolean} True if response was finalized, false if already finalized.
 */
FcgiResponseManager.prototype.finalizeResponse = function() {
    if (this.isResponseFinalized) {
        console.warn(`[FcgiResponseManager] Response already finalized for request ${this.currentRequestId}.`);
        return false;
    }
    if (!this.headersSent) {
        // Ensure headers are sent even if no body or explicit headers were written
        this.sendHeaders(200);
    }

    // Send a zero-length STDOUT record to explicitly signal the end of the response body
    const stdoutEndFrameHeader = { ...defaultRecordHeader,
        recordType: PROTOCOL_STDOUT_STREAM,
        requestId: this.currentRequestId,
        contentLength: 0
    };
    frameComposer.writeHeader(stdoutEndFrameHeader);
    this._transmitFrame(frameComposer.tobuffer());

    // Prepare and send the END_REQUEST record, which contains the application's status
    const endRequestFrameHeader = { ...defaultRecordHeader,
        recordType: PROTOCOL_END_REQUEST,
        requestId: this.currentRequestId,
        contentLength: 8 // FCGI_END_REQUEST_BODY is 8 bytes
    };
    const finalRequestStatus = { ...defaultEndRequestStatus,
        applicationStatus: 0, // Application-specific status, 0 for normal exit
        protocolStatus: this.responseHttpStatus // Using the HTTP status as the protocol status
    };
    frameComposer.writeHeader(endRequestFrameHeader);
    frameComposer.writeEnd(finalRequestStatus);
    this._transmitFrame(frameComposer.tobuffer());

    // Terminate the underlying socket connection for this specific request
    if (this.commChannel && this.commChannel.writable) {
        this.commChannel.end();
    } else {
        console.warn(`[FcgiResponseManager] Socket for request ${this.currentRequestId} was not writable when attempting to end.`);
    }

    this.isResponseFinalized = true;
    return true;
};

/**
 * Handles incoming client connections, parsing FastCGI requests received over the socket.
 * This function processes FastCGI records and dispatches the request to the application.
 * @param {object} clientSocket - The net.Socket instance representing the client connection.
 * @this FcgiApplicationGateway - The server instance, allowing emission of events.
 */
function clientSessionHandler(clientSocket) {
    const gatewayInstance = this; // Capture 'this' (FcgiApplicationGateway instance) for event emission

    // Configure socket behavior for FastCGI communication
    clientSocket.setTimeout(120 * 1000); // 2 minutes timeout for inactivity
    clientSocket.setNoDelay(true); // Disable Nagle's algorithm for lower latency

    let currentClientRequest = null; // Object to build the parsed HTTP request data
    const inputDecoder = new FcgiProtocolCodec.parser(); // FastCGI protocol parser instance
    inputDecoder.encoding = "binary"; // Parser expects raw binary data

    // Handler for errors encountered during FastCGI protocol parsing
    inputDecoder.onProtocolError = function(errorDetails) {
        // Emit a server-level error event for centralized logging and monitoring
        gatewayInstance.emit('error', new Error(`[FcgiParser] Protocol parsing error for client ${clientSocket.remoteAddress}: ${errorDetails.message || 'Unknown error'}`));
        // Destroy the socket to prevent further corrupted communication
        clientSocket.destroy(errorDetails);
    };

    /**
     * Processes a complete FastCGI record received and parsed by the inputDecoder.
     * @param {object} parsedRecord - The parsed FastCGI record, containing header and body.
     */
    inputDecoder.onRecordReceived = function(parsedRecord) {
        // Basic validation for the parsed record structure
        if (!parsedRecord || !parsedRecord.header || typeof parsedRecord.header.recordType === 'undefined') {
            gatewayInstance.emit('error', new Error(`[FcgiParser] Received malformed FastCGI record from ${clientSocket.remoteAddress}.`));
            clientSocket.destroy();
            return;
        }

        const recordHeader = parsedRecord.header;
        const recordBody = parsedRecord.body;

        switch(recordHeader.recordType) {
            case PROTOCOL_BEGIN_REQUEST:
                // Initialize a new request object for a FastCGI BEGIN_REQUEST record
                currentClientRequest = {
                    headers: {},
                    connection: {},
                    url: '/', // Default URL path
                    method: 'GET', // Default HTTP method
                    httpVersionMajor: 1,
                    httpVersionMinor: 1,
                    httpVersion: '1.1',
                    bodyStream: null // Placeholder for accumulating STDIN data
                };
                activeRequestCount++; // Increment the global active request counter
                break;

            case PROTOCOL_PARAM_STREAM:
                // Process request parameters (FCGI_PARAMS record) if content is present
                if (recordHeader.contentLength > 0 && recordBody && recordBody.params) {
                    const requestParams = recordBody.params;

                    // Helper to assign a parameter to the request object, with optional transformation
                    const assignRequestProperty = (targetObj, sourceObj, paramName, propKey, transformFn = v => v) => {
                        if (sourceObj[paramName]) {
                            targetObj[propKey] = transformFn(sourceObj[paramName]);
                        }
                    };

                    assignRequestProperty(currentClientRequest, requestParams, 'REQUEST_METHOD', 'method');
                    assignRequestProperty(currentClientRequest, requestParams, 'DOCUMENT_URI', 'url', v => v.startsWith('/') ? v : `/${v}`); // Ensure leading slash for URL

                    // Parse HTTP protocol version
                    if (requestParams.SERVER_PROTOCOL) {
                        const versionSegments = requestParams.SERVER_PROTOCOL.split('/');
                        if (versionSegments.length === 2 && versionSegments[1]) {
                            const httpVersionParts = versionSegments[1].split('.');
                            if (httpVersionParts.length === 2) {
                                currentClientRequest.httpVersionMajor = parseInt(httpVersionParts[0], 10);
                                currentClientRequest.httpVersionMinor = parseInt(httpVersionParts[1], 10);
                                currentClientRequest.httpVersion = `${httpVersionParts[0]}.${httpVersionParts[1]}`;
                            }
                        }
                    }

                    // Populate request headers from HTTP_ prefixed parameters
                    for (const paramKey in requestParams) {
                        if (paramKey.startsWith('HTTP_')) {
                            // Convert FastCGI header name (e.g., HTTP_COOKIE) to standard HTTP header (e.g., cookie)
                            const headerName = paramKey.substring(5).toLowerCase().replace(/_([a-z])/g, (_, char) => char.toUpperCase());
                            currentClientRequest.headers[headerName] = requestParams[paramKey];
                        }
                    }

                    // Append query string to the URL if present
                    if (requestParams.QUERY_STRING) {
                        // Only append if URL doesn't already contain a query string
                        if (currentClientRequest.url && currentClientRequest.url.indexOf('?') === -1) {
                             currentClientRequest.url += `?${requestParams.QUERY_STRING}`;
                        } else if (!currentClientRequest.url) {
                            currentClientRequest.url = `/?${requestParams.QUERY_STRING}`; // Default to root if no URI
                        }
                    }

                    // Assign remote address
                    assignRequestProperty(currentClientRequest.connection, requestParams, 'REMOTE_ADDR', 'remoteAddress');
                }
                break;

            case PROTOCOL_STDIN_STREAM:
                // Handle FastCGI STDIN stream, which carries the request body
                if (recordHeader.contentLength > 0 && recordBody && recordBody.data) {
                    // If STDIN has content, append it to the request body stream
                    if (!currentClientRequest.bodyStream) {
                        currentClientRequest.bodyStream = Buffer.from([]); // Initialize as an empty Buffer
                    }
                    currentClientRequest.bodyStream = Buffer.concat([currentClientRequest.bodyStream, recordBody.data]);
                } else {
                    // A zero-length STDIN record signifies the end of the request body
                    // This is the trigger to dispatch the complete request to the application
                    if (currentClientRequest) {
                        const responseManager = new FcgiResponseManager(clientSocket, recordHeader.requestId);
                        gatewayInstance.emit('request', currentClientRequest, responseManager);
                    } else {
                        // This scenario indicates a BEGIN_REQUEST was not received or was malformed
                        gatewayInstance.emit('error', new Error(`[FcgiParser] Request object not initialized for STDIN_STREAM (ID: ${recordHeader.requestId}).`));
                        // Attempt to send a minimal error response
                        new FcgiResponseManager(clientSocket, recordHeader.requestId).sendHeaders(500, {'X-FastCGI-Error': 'Request Initialization Failed'});
                        new FcgiResponseManager(clientSocket, recordHeader.requestId).finalizeResponse();
                    }
                    currentClientRequest = null; // Reset for the next FastCGI request on this connection
                }
                break;

            // Default case to handle any other unexpected FastCGI record types
            default:
                console.warn(`[FcgiParser] Received unexpected FastCGI record type: ${recordHeader.recordType} for request ID ${recordHeader.requestId} from ${clientSocket.remoteAddress}.`);
                // Optionally, send an FCGI_ABORT record or destroy the socket for unknown types
                break;
        }
    };
		
    // Attach event listener for incoming data on the client socket
    clientSocket.on('data', (inputBuffer) => {
        // Pass the received buffer directly to the FastCGI parser
        inputDecoder.execute(inputBuffer, 0, inputBuffer.length);
    });

    // Event handler for socket timeout
    clientSocket.on('timeout', () => {
        gatewayInstance.emit('timeout', `Socket timed out for client: ${clientSocket.remoteAddress}.`);
        if (clientSocket.writable) {
            clientSocket.destroy(new Error('Socket operation timed out.')); // Destroy the socket with an error
        }
    });

    // Event handler for socket errors
    clientSocket.on('error', (err) => {
        gatewayInstance.emit('error', new Error(`Client socket error from ${clientSocket.remoteAddress}: ${err.message}.`));
        if (clientSocket.writable) {
            clientSocket.destroy(err); // Ensure socket is closed on error
        }
    });

    // Event handler for socket closure
    clientSocket.on('close', () => {
        activeRequestCount--; // Decrement the active request counter
        // Perform any necessary cleanup for resources associated with this connection
        // console.log(`Client socket closed for ${clientSocket.remoteAddress}. Active requests: ${activeRequestCount}`);
    });
}

/**
 * Main FastCGI Application Gateway class.
 * This class extends Node.js's net.Server to provide FastCGI specific server functionality.
 * @class
 * @param {function} requestProcessorFunction - The callback function to be invoked for each incoming FastCGI request.
 */
function FcgiApplicationGateway(requestProcessorFunction) {
    // Enforce instantiation with the 'new' keyword
    if (!(this instanceof FcgiApplicationGateway)) {
        return new FcgiApplicationGateway(requestProcessorFunction);
    }

    // Call the parent net.Server constructor
    require('net').Server.call(this);

    // If a request handler function is provided, attach it to the 'request' event
    if (requestProcessorFunction && typeof requestProcessorFunction === 'function') {
        this.on('request', requestProcessorFunction);
    }

    // Attach the connection handler responsible for FastCGI protocol parsing
    this.on('connection', clientSessionHandler);

    // New property: Define a maximum allowed number of concurrent FastCGI requests
    this.maxConcurrentRequests = 2000;
    // New property: A flag to indicate if the server is in a graceful shutdown state
    this.isShuttingDown = false;
}

// Inherit all methods and properties from Node.js net.Server
require('util').inherits(FcgiApplicationGateway, require('net').Server);

/**
 * Factory function to create a new FastCGI Application Gateway instance.
 * This is the primary entry point for users to create a FastCGI server.
 * @param {function} requestProcessorFn - The function that will handle incoming FastCGI requests.
 * @returns {FcgiApplicationGateway} A new instance of the FastCGI Application Gateway.
 */
exports.createFcgiServer = function (requestProcessorFn) {
    return new FcgiApplicationGateway(requestProcessorFn);
};