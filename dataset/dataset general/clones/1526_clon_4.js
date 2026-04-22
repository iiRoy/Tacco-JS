const ProtocolEngine = require("./comm_protocol_engine");
const HttpStatusPhrases = require('http').STATUS_CODES;
const NetService = require('net');

const FcgiProtocolConstants = {
    PROTOCOL_VERSION: ProtocolEngine.protocol.VERSION,
    TYPE_BEGIN_REQUEST: ProtocolEngine.protocol.FRAME_TYPE_BEGIN_REQUEST,
    TYPE_PARAMS: ProtocolEngine.protocol.FRAME_TYPE_PARAMS,
    TYPE_STDIN: ProtocolEngine.protocol.FRAME_TYPE_STDIN,
    TYPE_END_REQUEST: ProtocolEngine.protocol.FRAME_TYPE_END_REQUEST,
    TYPE_STDOUT: ProtocolEngine.protocol.FRAME_TYPE_STDOUT,
    MAX_PAYLOAD_SIZE: ProtocolEngine.config.MAX_RECORD_CONTENT_SIZE - 16
};

class TransmitChannel {
    constructor(clientEndpoint, transactionId) {
        this.clientEndpoint = clientEndpoint;
        this.transactionId = transactionId;
        this.httpResponseStatus = 0;
        this.transmissionTerminated = false;
        this.packetAssembler = new ProtocolEngine.Transmitter();
        this.packetAssembler.setEncoding("binary");

        this.currentFrameHeader = {
            "version": FcgiProtocolConstants.PROTOCOL_VERSION,
            "type": FcgiProtocolConstants.TYPE_STDOUT,
            "recordId": 0,
            "contentLength": 0,
            "paddingLength": 0
        };

        this.currentStatusDetails = {
            "appStatus": 0,
            "protocolStatus": 0
        };
    }

    _deliverRawData(dataBuffer) {
        if (this.clientEndpoint.writable) {
            this.clientEndpoint.write(dataBuffer);
        } else {
            this.transmissionTerminated = true;
        }
    }

    signalHeadersReady(httpStatusCode) {
        if (this.transmissionTerminated) return false;

        this.httpResponseStatus = httpStatusCode;
        const statusText = HttpStatusPhrases[httpStatusCode] || 'unknown';
        const headerContent = `HTTP/1.1 ${httpStatusCode} ${statusText}\r\nConnection: close\r\nContent-Type: text/plain\r\n\r\n`;

        this.currentFrameHeader.type = FcgiProtocolConstants.TYPE_STDOUT;
        this.currentFrameHeader.recordId = this.transactionId;
        this.currentFrameHeader.contentLength = headerContent.length;
        this.packetAssembler.packHeader(this.currentFrameHeader);
        this.packetAssembler.packBody(Buffer.from(headerContent, 'binary'));
        this._deliverRawData(this.packetAssembler.retrievePackedData());
        return true;
    }

    dispatchPayload(contentSegment) {
        if (this.transmissionTerminated) return false;

        let processedSegment;
        if (typeof contentSegment === 'string') {
            processedSegment = Buffer.from(contentSegment, 'binary');
        } else {
            if (!Buffer.isBuffer(contentSegment)) {
                return false;
            }
            processedSegment = contentSegment;
        }
        if (processedSegment.length === 0) return false;

        this.currentFrameHeader.type = FcgiProtocolConstants.TYPE_STDOUT;
        this.currentFrameHeader.recordId = this.transactionId;

        const sendSegmentRecursive = (remainingData) => {
            if (remainingData.length === 0) return;

            const segmentSize = Math.min(remainingData.length, FcgiProtocolConstants.MAX_PAYLOAD_SIZE);
            const currentSubSegment = remainingData.slice(0, segmentSize);

            this.currentFrameHeader.contentLength = currentSubSegment.length;
            this.packetAssembler.packHeader(this.currentFrameHeader);
            this.packetAssembler.packBody(currentSubSegment);
            this._deliverRawData(this.packetAssembler.retrievePackedData());

            if (remainingData.length > segmentSize) {
                sendSegmentRecursive(remainingData.slice(segmentSize));
            }
        };

        sendSegmentRecursive(processedSegment);
        return true;
    }

    concludeTransmission() {
        if (this.transmissionTerminated) return false;

        this.currentFrameHeader.type = FcgiProtocolConstants.TYPE_STDOUT;
        this.currentFrameHeader.recordId = this.transactionId;
        this.currentFrameHeader.contentLength = 0;
        this.packetAssembler.packHeader(this.currentFrameHeader);
        this._deliverRawData(this.packetAssembler.retrievePackedData());

        this.currentStatusDetails.protocolStatus = this.httpResponseStatus;
        this.currentFrameHeader.type = FcgiProtocolConstants.TYPE_END_REQUEST;
        this.currentFrameHeader.contentLength = 8;
        this.packetAssembler.packHeader(this.currentFrameHeader);
        this.packetAssembler.packEnd(this.currentStatusDetails);
        this._deliverRawData(this.packetAssembler.retrievePackedData());

        this.clientEndpoint.end();
        this.transmissionTerminated = true;
        return true;
    }
}

const extractProtocolVersion = (protocolString) => {
    const parts = (protocolString || '').split('/');
    if (parts.length === 2) {
        const versionNumbers = parts[1].split('.');
        if (versionNumbers.length === 2) {
            const major = parseInt(versionNumbers[0]);
            const minor = parseInt(versionNumbers[1]);
            return {
                major: isNaN(major) ? 0 : major,
                minor: isNaN(minor) ? 0 : minor,
                full: `${isNaN(major) ? 0 : major}.${isNaN(minor) ? 0 : minor}`
            };
        }
    }
    return {
        major: 0,
        minor: 0,
        full: '0.0'
    };
};

const processClientConnection = (connectedSocket, serviceHostInstance) => {
    connectedSocket.setTimeout(2 * 60 * 1000);
    connectedSocket.setNoDelay(false);

    let currentIncomingRequest = null;
    const streamInterpreter = new ProtocolEngine.Processor();
    streamInterpreter.setEncoding("binary");

    streamInterpreter.onError = (errorDetails) => {
        console.error(JSON.stringify(errorDetails, null, "\t"));
    };

    const recordDispatchTable = {
        [FcgiProtocolConstants.TYPE_BEGIN_REQUEST]: (record) => {
            currentIncomingRequest = {};
            currentIncomingRequest.headerAttributes = {};
            currentIncomingRequest.networkContext = {};
        },
        [FcgiProtocolConstants.TYPE_PARAMS]: (record) => {
            if (record.header.contentLength !== 0) {
                const requestParameters = record.body;
                if (requestParameters.REQUEST_METHOD) {
                    currentIncomingRequest.processingMethod = requestParameters.REQUEST_METHOD;
                }
                if (requestParameters.SERVER_PROTOCOL) {
                    const versionInfo = extractProtocolVersion(requestParameters.SERVER_PROTOCOL);
                    currentIncomingRequest.protocolMajor = versionInfo.major;
                    currentIncomingRequest.protocolMinor = versionInfo.minor;
                    currentIncomingRequest.protocolVersion = versionInfo.full;
                }
                if (requestParameters.DOCUMENT_URI) {
                    currentIncomingRequest.resourcePath = requestParameters.DOCUMENT_URI;
                } else {
                    currentIncomingRequest.resourcePath = '/';
                }
                if (requestParameters.QUERY_STRING) {
                    currentIncomingRequest.resourcePath += '?';
                    currentIncomingRequest.resourcePath += requestParameters.QUERY_STRING;
                }
                if (requestParameters.HTTP_COOKIE) {
                    currentIncomingRequest.headerAttributes.cookie = requestParameters.HTTP_COOKIE;
                }
                if (requestParameters.REMOTE_ADDR) {
                    currentIncomingRequest.networkContext.sourceAddress = requestParameters.REMOTE_ADDR;
                }
            }
        },
        [FcgiProtocolConstants.TYPE_STDIN]: (record) => {
            if (record.header.contentLength === 0) {
                const responseHandler = new TransmitChannel(connectedSocket, record.header.recordId);
                serviceHostInstance.emit('serviceRequest', currentIncomingRequest, responseHandler);
            }
        }
    };

    streamInterpreter.onFrame = (protocolRecord) => {
        const handler = recordDispatchTable[protocolRecord.header.type];
        if (handler) {
            handler(protocolRecord);
        }
    };

    connectedSocket.on('data', (inputBuffer) => {
        streamInterpreter.execute(inputBuffer);
    });

    connectedSocket.on('end', () => {});

    connectedSocket.on('timeout', () => {
        connectedSocket.destroy();
    });

    connectedSocket.on('error', (err) => {
        console.error(`protocol_service_error:${err.stack}`);
    });

    connectedSocket.on('close', () => {});
};

class FcgiServiceHost extends NetService.Server {
    constructor(requestProcessorCallback) {
        super();

        if (requestProcessorCallback) {
            this.on('serviceRequest', requestProcessorCallback);
        }

        this.on('connection', (socket) => processClientConnection(socket, this));
    }
}

const establishFcgiService = (processorFunction) => {
    return new FcgiServiceHost(processorFunction);
};

module.exports = {
    establishFcgiService
};