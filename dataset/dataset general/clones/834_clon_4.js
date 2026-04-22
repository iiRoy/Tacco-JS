const resourceLocator = require('url');
const filesystem = require('fs');
const filepath = require("path");
const webProtocol = require("http");
const networkSocket = require("net");

const CgiGatewayProtocol = {
    VERSION: 1,
    RECORD_TYPES: {
        BEGIN_REQUEST: 1,
        ABORT_REQUEST: 2,
        END_REQUEST: 3,
        PARAMS: 4,
        STDIN: 5,
        STDOUT: 6,
        STDERR: 7,
        DATA: 8,
        GET_VALUES: 9,
        GET_VALUES_RESULT: 10,
        UNKNOWN_TYPE: 11
    },
    ROLES: {
        RESPONDER: 1,
        AUTHORIZER: 2,
        FILTER: 3
    },
    FLAGS: {
        KEEP_CONN: 1
    },
    PROTOCOL_STATUS: {
        REQUEST_COMPLETE: 0,
        CANT_MPX_CONN: 1,
        OVERLOADED: 2,
        UNKNOWN_ROLE: 3
    }
};

class FcgiEncoder {
    constructor() {
        this.bufferChunks = [];
    }

    writeRecordHeader(typeIdentifier, requestId, contentOctetLength, paddingOctetLength = 0) {
        const headerOctets = Buffer.alloc(8);
        headerOctets.writeUInt8(CgiGatewayProtocol.VERSION, 0);
        headerOctets.writeUInt8(typeIdentifier, 1);
        headerOctets.writeUInt16BE(requestId, 2);
        headerOctets.writeUInt16BE(contentOctetLength, 4);
        headerOctets.writeUInt8(paddingOctetLength, 6);
        headerOctets.writeUInt8(0, 7);
        this.bufferChunks.push(headerOctets);
    }

    writeBeginRequestBody(assignedRole, requestFlags) {
        const beginBodyOctets = Buffer.alloc(8);
        beginBodyOctets.writeUInt16BE(assignedRole, 0);
        beginBodyOctets.writeUInt8(requestFlags, 2);
        beginBodyOctets.writeUInt8(0, 3);
        beginBodyOctets.writeUInt8(0, 4);
        beginBodyOctets.writeUInt8(0, 5);
        beginBodyOctets.writeUInt8(0, 6);
        beginBodyOctets.writeUInt8(0, 7);
        this.bufferChunks.push(beginBodyOctets);
    }

    writeNameValuePairs(parameterEntries) {
        let parameterOctets = Buffer.alloc(0);
        for (const [keyName, keyValue] of parameterEntries) {
            const nameOctets = Buffer.from(keyName);
            const valueOctets = Buffer.from(keyValue);

            let nameLen = nameOctets.length;
            let valueLen = valueOctets.length;

            let lengthOctets = [];
            if (nameLen < 0x80) {
                lengthOctets.push(Buffer.from([nameLen]));
            } else {
                lengthOctets.push(Buffer.from([
                    (nameLen >> 24) | 0x80,
                    (nameLen >> 16) & 0xFF,
                    (nameLen >> 8) & 0xFF,
                    nameLen & 0xFF
                ]));
            }

            if (valueLen < 0x80) {
                lengthOctets.push(Buffer.from([valueLen]));
            } else {
                lengthOctets.push(Buffer.from([
                    (valueLen >> 24) | 0x80,
                    (valueLen >> 16) & 0xFF,
                    (valueLen >> 8) & 0xFF,
                    valueLen & 0xFF
                ]));
            }
            parameterOctets = Buffer.concat([parameterOctets, ...lengthOctets, nameOctets, valueOctets]);
        }
        this.bufferChunks.push(parameterOctets);
    }
    
    retrieveEncodedData() {
        const assembledData = Buffer.concat(this.bufferChunks);
        this.bufferChunks = [];
        return assembledData;
    }
}

class FcgiDecoder {
    constructor() {
        this.incomingBuffer = Buffer.alloc(0);
        this.parsingState = 'RECORD_HEADER';
        this.currentFcgiRecord = null;
        this.recordCompletionHandler = () => {};
        this.headerDetectionHandler = () => {};
        this.errorHandler = () => {};
    }

    absorbData(newData) {
        this.incomingBuffer = Buffer.concat([this.incomingBuffer, newData]);
        this._processBufferContent();
    }

    _processBufferContent() {
        while (true) {
            if (this.parsingState === 'RECORD_HEADER') {
                if (this.incomingBuffer.length < 8) return;

                const headerInfo = {
                    version: this.incomingBuffer.readUInt8(0),
                    type: this.incomingBuffer.readUInt8(1),
                    requestId: this.incomingBuffer.readUInt16BE(2),
                    contentLength: this.incomingBuffer.readUInt16BE(4),
                    paddingLength: this.incomingBuffer.readUInt8(6),
                };
                this.currentFcgiRecord = { header: headerInfo };
                this.incomingBuffer = this.incomingBuffer.slice(8);
                this.parsingState = 'RECORD_BODY';
                this.headerDetectionHandler(headerInfo);
            }

            if (this.parsingState === 'RECORD_BODY') {
                const totalRecordLength = this.currentFcgiRecord.header.contentLength + this.currentFcgiRecord.header.paddingLength;
                if (this.incomingBuffer.length < totalRecordLength) return;

                this.currentFcgiRecord.body = this.incomingBuffer.slice(0, this.currentFcgiRecord.header.contentLength);
                this.incomingBuffer = this.incomingBuffer.slice(totalRecordLength);
                this.recordCompletionHandler(this.currentFcgiRecord);
                this.currentFcgiRecord = null;
                this.parsingState = 'RECORD_HEADER';
            }
        }
    }

    onRecordComplete(callback) { this.recordCompletionHandler = callback; }
    onHeaderDetected(callback) { this.headerDetectionHandler = callback; }
    onErrorOccurred(callback) { this.errorHandler = callback; }
}

const STATIC_SERVE_MODE = 'staticContent';
const FPM_PROXY_MODE = 'fpmGateway';

const transformIncomingHeaders = (inputRequestHeaders, baseGatewayParameters) => {
    if (Object.keys(inputRequestHeaders).length === 0) {
        return baseGatewayParameters;
    }

    const modifiedParameters = new Map(baseGatewayParameters);
    const headersWithoutHttpPrefix = new Set(['content-type', 'content-length']);

    for (const headerKey in inputRequestHeaders) {
        let processedKey = headerKey.replace(/-/g, '_').toUpperCase();
        
        if (!headersWithoutHttpPrefix.has(headerKey.toLowerCase())) {
            processedKey = 'HTTP_' + processedKey;
        }

        modifiedParameters.set(processedKey, inputRequestHeaders[headerKey]);
    }

    return Array.from(modifiedParameters.entries());
};

async function interactWithFpm(clientRequest, clientResponse, gatewayParameters, serviceOptions) {
    const fpmSocket = new networkSocket.Socket();
    fpmSocket.setNoDelay(true);

    const encoderInstance = new FcgiEncoder();
    const decoderInstance = new FcgiDecoder();

    let accumulatedFpmOutput = Buffer.alloc(0);
    let httpOutputResponseHeaders = [];
    let httpOutputResponseStatus = 200;

    return new Promise((resolve, reject) => {
        fpmSocket.once("error", (communicationFault) => {
            console.error("FPM Communication Error:", communicationFault.stack);
            clientResponse.writeHead(500, { 'Content-Type': 'text/plain' });
            clientResponse.end('FPM Gateway Error: ' + communicationFault.message);
            fpmSocket.destroy();
            reject(communicationFault);
        });

        fpmSocket.once("close", () => {
            resolve();
        });

        fpmSocket.on("data", (receivedBuffer) => {
            decoderInstance.absorbData(receivedBuffer);
        });

        decoderInstance.onRecordComplete((processedRecord) => {
            if (processedRecord.header.type === CgiGatewayProtocol.RECORD_TYPES.STDOUT) {
                accumulatedFpmOutput = Buffer.concat([accumulatedFpmOutput, processedRecord.body]);
            } else if (processedRecord.header.type === CgiGatewayProtocol.RECORD_TYPES.STDERR) {
                console.error("FPM STDERR:", processedRecord.body.toString());
            } else if (processedRecord.header.type === CgiGatewayProtocol.RECORD_TYPES.END_REQUEST) {
                const outputString = accumulatedFpmOutput.toString();
                const separatorPosition = outputString.indexOf("\r\n\r\n");

                if (separatorPosition !== -1) {
                    const headerSection = outputString.substring(0, separatorPosition);
                    const bodySection = outputString.substring(separatorPosition + 4);

                    const headerLines = headerSection.split("\r\n");
                    
                    try {
                        for (const line of headerLines) {
                            const parts = line.split(': ');
                            if (parts.length >= 2) {
                                const headerName = parts[0];
                                const headerValue = parts.slice(1).join(': ');
                                if (headerName.toLowerCase() === 'status') {
                                    httpOutputResponseStatus = parseInt(headerValue.substring(0, 3), 10);
                                } else {
                                    httpOutputResponseHeaders.push([headerName, headerValue]);
                                }
                            }
                        }
                    } catch (parsingError) {
                        console.error("FPM Header Parsing Error:", parsingError);
                    }

                    httpOutputResponseHeaders.push(['X-NodeProxy', 'Node.js-FPM-Bridge']);
                    clientResponse.writeHead(httpOutputResponseStatus, Object.fromEntries(httpOutputResponseHeaders));
                    clientResponse.end(bodySection);
                } else {
                    clientResponse.writeHead(httpOutputResponseStatus, { 'Content-Type': 'text/html' });
                    clientResponse.end(outputString);
                }
                console.log(`  --> FPM Request Handled, Status: "${httpOutputResponseStatus}"`);
                fpmSocket.end();
            }
        });

        fpmSocket.connect(serviceOptions.fcgi.port, serviceOptions.fcgi.host, () => {
            const requestIdentifier = 1;

            encoderInstance.writeRecordHeader(CgiGatewayProtocol.RECORD_TYPES.BEGIN_REQUEST, requestIdentifier, 8);
            encoderInstance.writeBeginRequestBody(CgiGatewayProtocol.ROLES.RESPONDER, CgiGatewayProtocol.FLAGS.KEEP_CONN);
            fpmSocket.write(encoderInstance.retrieveEncodedData());

            encoderInstance.writeNameValuePairs(gatewayParameters);
            const paramContentData = encoderInstance.retrieveEncodedData();
            
            encoderInstance.writeRecordHeader(CgiGatewayProtocol.RECORD_TYPES.PARAMS, requestIdentifier, paramContentData.length);
            encoderInstance.bufferChunks.push(paramContentData);
            fpmSocket.write(encoderInstance.retrieveEncodedData());

            encoderInstance.writeRecordHeader(CgiGatewayProtocol.RECORD_TYPES.STDOUT, requestIdentifier, 0);
            fpmSocket.write(encoderInstance.retrieveEncodedData());

            fpmSocket.end();
        });
    });
}

const deliverAsset = async (fileKey, directoryPath, clientResponse, clientRequest) => {
    const assetTypeMap = new Map([
        [".html", "text/html"],
        [".css", "text/css"],
        [".js", "application/javascript"],
        [".json", "application/json"],
        [".jpg", "image/jpeg"],
        [".jpeg", "image/jpeg"],
        [".png", "image/png"],
        [".gif", "image/gif"],
        [".svg", "image/svg+xml"],
        [".txt", "text/plain"],
        [".xml", "application/xml"],
        [".pdf", "application/pdf"],
        [".mp4", "video/mp4"],
        [".webm", "video/webm"],
        [".ogg", "application/ogg"],
        [".ico", "image/x-icon"]
    ]);

    const fileExtension = filepath.extname(fileKey).toLowerCase();
    const contentType = assetTypeMap.get(fileExtension) || 'application/octet-stream';
    const fullAssetPath = filepath.join(directoryPath, fileKey);

    console.log(`Incoming Web Request: ${clientRequest.method} ${clientRequest.url}`);

    try {
        const assetContent = await filesystem.promises.readFile(fullAssetPath);
        clientResponse.writeHead(200, { 'Content-Type': contentType });
        clientResponse.end(assetContent);
    } catch (fault) {
        console.error(`  ---> Asset loading failure: ${fileKey}, Error: ${fault.message}`);
        clientResponse.writeHead(404, { 'Content-Type': 'text/html' });
        clientResponse.end('<h2>404 - Resource Not Found</h2>');
    }
};

const handleGatewayRequest = async (scriptAsset, assetDirectory, clientRequest, clientResponse, serviceOptions) => {
    const fullScriptPath = filepath.join(assetDirectory, scriptAsset);

    try {
        await filesystem.promises.access(fullScriptPath, filesystem.constants.F_OK);
    } catch (fault) {
        console.error(`  ---> PHP Script Not Found: ${scriptAsset}, Error: ${fault.message}`);
        clientResponse.writeHead(404, { 'Content-Type': 'text/html' });
        clientResponse.end('<h2>404 - PHP Script Not Found</h2>');
        return;
    }

    const currentUrlObject = new URL(clientRequest.url, `http://${clientRequest.headers.host}`);
    const queryStringData = currentUrlObject.search.substring(1);

    const coreGatewayParameters = [
        ["SCRIPT_FILENAME", fullScriptPath],
        ["QUERY_STRING", queryStringData],
        ["REQUEST_METHOD", clientRequest.method],
        ["SCRIPT_NAME", scriptAsset],
        ["DOCUMENT_URI", scriptAsset],
        ["REQUEST_URI", clientRequest.url],
        ["DOCUMENT_ROOT", assetDirectory],
        ["PHP_SELF", scriptAsset],
        ["GATEWAY_PROTOCOL", "CGI/1.1"],
        ["SERVER_SOFTWARE", "Node.js-FPM-Proxy/" + process.version]
    ];

    const finalGatewayParameters = transformIncomingHeaders(clientRequest.headers, coreGatewayParameters);

    console.log(`Incoming Web Request (FPM): ${clientRequest.method} ${clientRequest.url}`);
    await interactWithFpm(clientRequest, clientResponse, finalGatewayParameters, serviceOptions);
};

const establishService = (configOptions, routingRules) => {
    const serviceConfiguration = {
        fcgi: {
            port: 9000,
            host: 'localhost',
        },
        webServer: {
            port: 9001,
        },
        ...configOptions
    };

    const processedRoutingRules = Object.entries(routingRules)
        .filter(([key]) => key !== 'index')
        .map(([pattern, mode]) => ({
            matchingRegex: new RegExp(pattern),
            processingMode: mode
        }));

    const webServerInstance = webProtocol.createServer(async (incomingRequest, outgoingResponse) => {
        const requestedPath = new URL(incomingRequest.url, `http://${incomingRequest.headers.host}`).pathname;
        const currentExecutionDirectory = process.cwd();

        let matchedRoutingEntry = null;
        for (const ruleEntry of processedRoutingRules) {
            if (ruleEntry.matchingRegex.test(requestedPath)) {
                matchedRoutingEntry = ruleEntry;
                break;
            }
        }

        if (matchedRoutingEntry) {
            if (matchedRoutingEntry.processingMode === STATIC_SERVE_MODE) {
                await deliverAsset(requestedPath, currentExecutionDirectory, outgoingResponse, incomingRequest);
            } else if (matchedRoutingEntry.processingMode === FPM_PROXY_MODE) {
                await handleGatewayRequest(requestedPath, currentExecutionDirectory, incomingRequest, outgoingResponse, serviceConfiguration);
            } else {
                outgoingResponse.writeHead(500, { 'Content-Type': 'text/plain' });
                outgoingResponse.end('Server configuration error: Unknown routing mode.');
            }
        } else {
            const defaultIndexFile = routingRules['index'] || '/index.php';
            await handleGatewayRequest(defaultIndexFile, currentExecutionDirectory, incomingRequest, outgoingResponse, serviceConfiguration);
        }
    });

    webServerInstance.listen(serviceConfiguration.webServer.port, () => {
        console.log(`Web server running on port ${serviceConfiguration.webServer.port}`);
        console.log(`FPM gateway proxying to ${serviceConfiguration.fcgi.host}:${serviceConfiguration.fcgi.port}`);
    });
};