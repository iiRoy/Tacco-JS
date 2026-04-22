const uriUtilities = require('url');
const fileSystemOps = require('fs');
const pathResolver = require('path');
const httpProtocol = require('http');
const tcpSockets = require('net');
const nodeUtils = require('util');
const fcgiParserLib = require('fastcgi-parser');

const appLogger = process.env.NODE_ENV === 'development' ? console : {
    info: () => {},
    warn: () => {},
    error: () => {},
    debug: () => {}
};

const FCGI_ROLE_RESPONDER = fcgiParserLib.constants.role.FCGI_RESPONDER;
const FCGI_TYPE_BEGIN_REQUEST = fcgiParserLib.constants.record.FCGI_BEGIN;
const FCGI_TYPE_STDIN = fcgiParserLib.constants.record.FCGI_STDIN;
const FCGI_TYPE_STDOUT = fcgiParserLib.constants.record.FCGI_STDOUT;
const FCGI_TYPE_PARAMS = fcgiParserLib.constants.record.FCGI_PARAMS;
const FCGI_TYPE_END_REQUEST = fcgiParserLib.constants.record.FCGI_END;

/**
 * Converts standard HTTP request headers into a format suitable for FastCGI parameters.
 * Header names are normalized to uppercase with underscores, and 'HTTP_' prefix is added
 * where appropriate for PHP-FPM compatibility.
 *
 * @param {object} httpRequestHeaders - Object containing HTTP headers from the incoming request.
 * @param {Array<Array<string>>} initialFcgiParams - Base FastCGI parameters already constructed.
 * @returns {Array<Array<string>>} An augmented array of FastCGI parameters.
 */
function prepareFcgiParameters(httpRequestHeaders, initialFcgiParams) {
    if (!httpRequestHeaders || Object.keys(httpRequestHeaders).length === 0) {
        return initialFcgiParams;
    }

    const processedFcgiParams = [...initialFcgiParams];

    for (const headerName in httpRequestHeaders) {
        if (Object.prototype.hasOwnProperty.call(httpRequestHeaders, headerName)) {
            const originalHeaderValue = httpRequestHeaders[headerName];

            let transformedHeaderName = headerName.replace(/-/g, '_').toUpperCase();

            if (!transformedHeaderName.startsWith('CONTENT_')) {
                transformedHeaderName = 'HTTP_' + transformedHeaderName;
            }

            processedFcgiParams.push([transformedHeaderName, originalHeaderValue]);
        }
    }

    return processedFcgiParams;
}

/**
 * Establishes a connection to a FastCGI Process Manager (FPM) and orchestrates
 * the sending of HTTP request data and the reception of the FPM response.
 *
 * @param {http.IncomingMessage} incomingHttpReq - The Node.js HTTP request object.
 * @param {http.ServerResponse} outgoingHttpRes - The Node.js HTTP response object for the client.
 * @param {Array<Array<string>>} fcgiParamsList - The compiled list of FastCGI parameters.
 * @param {object} fcgiConnectionConfig - Configuration for the FPM connection (host, port).
 * @param {Function} nextMiddlewareHandler - The 'next' function in the middleware chain.
 * @returns {void}
 */
function initiateFpmCommunication(incomingHttpReq, outgoingHttpRes, fcgiParamsList, fcgiConnectionConfig, nextMiddlewareHandler) {
    const fpmSocketClient = new tcpSockets.Socket();
    fpmSocketClient.setNoDelay(true);

    let fcgiFrameEncoder = null;
    let fcgiFrameDecoder = null;

    const currentFcgiRecordHeader = {
        version: fcgiParserLib.constants.version,
        type: FCGI_TYPE_BEGIN_REQUEST,
        recordId: 1,
        contentLength: 0,
        paddingLength: 0
    };

    const beginRequestPayload = {
        role: FCGI_ROLE_RESPONDER,
        flags: fcgiParserLib.constants.keepalive.OFF
    };

    let bufferedRequestBodyChunks = [];
    let requestBodyStreamEnded = false;

    const HTTP_HEADER_BODY_DELIMITER = '\r\n\r\n';

    /**
     * Sends a zero-length FCGI_STDIN record to signal the end of request input to FPM.
     */
    const finalizeInputToFpm = () => {
        if (fcgiFrameEncoder) {
            currentFcgiRecordHeader.type = FCGI_TYPE_STDIN;
            currentFcgiRecordHeader.contentLength = 0;
            currentFcgiRecordHeader.paddingLength = 0;
            fcgiFrameEncoder.writeHeader(currentFcgiRecordHeader);
            fpmSocketClient.write(fcgiFrameEncoder.tobuffer());
        } else {
            requestBodyStreamEnded = true;
        }
    };

    /**
     * Transmits the initial FastCGI records (BEGIN_REQUEST, PARAMS) and any buffered STDIN data.
     * @param {net.Socket} activeSocket - The connected TCP socket.
     */
    const transmitFcgiInitialRecords = (activeSocket) => {
        currentFcgiRecordHeader.type = FCGI_TYPE_BEGIN_REQUEST;
        currentFcgiRecordHeader.contentLength = 8;
        fcgiFrameEncoder.writeHeader(currentFcgiRecordHeader);
        fcgiFrameEncoder.writeBegin(beginRequestPayload);
        activeSocket.write(fcgiFrameEncoder.tobuffer());

        if (fcgiParamsList && fcgiParamsList.length > 0) {
            currentFcgiRecordHeader.type = FCGI_TYPE_PARAMS;
            currentFcgiRecordHeader.contentLength = fcgiParserLib.getParamLength(fcgiParamsList);
            fcgiFrameEncoder.writeHeader(currentFcgiRecordHeader);
            fcgiFrameEncoder.writeParams(fcgiParamsList);
            activeSocket.write(fcgiFrameEncoder.tobuffer());
        }

        currentFcgiRecordHeader.type = FCGI_TYPE_PARAMS;
        currentFcgiRecordHeader.contentLength = 0;
        fcgiFrameEncoder.writeHeader(currentFcgiRecordHeader);
        activeSocket.write(fcgiFrameEncoder.tobuffer());

        const isMethodWithBody = (method) => ['POST', 'PUT', 'PATCH'].includes(method.toUpperCase());
        const hasRequestBody = isMethodWithBody(incomingHttpReq.method);

        if (!hasRequestBody) {
            finalizeInputToFpm();
        } else {
            for (const inputChunk of bufferedRequestBodyChunks) {
                currentFcgiRecordHeader.type = FCGI_TYPE_STDIN;
                currentFcgiRecordHeader.contentLength = inputChunk.length;
                currentFcgiRecordHeader.paddingLength = 0;
                fcgiFrameEncoder.writeHeader(currentFcgiRecordHeader);
                fcgiFrameEncoder.writeBody(inputChunk);
                activeSocket.write(fcgiFrameEncoder.tobuffer());
            }
            bufferedRequestBodyChunks = [];

            if (requestBodyStreamEnded) {
                finalizeInputToFpm();
            }
        }
    };

    incomingHttpReq.on('data', (dataChunk) => {
        if (fcgiFrameEncoder) {
            currentFcgiRecordHeader.type = FCGI_TYPE_STDIN;
            currentFcgiRecordHeader.contentLength = dataChunk.length;
            currentFcgiRecordHeader.paddingLength = 0;
            fcgiFrameEncoder.writeHeader(currentFcgiRecordHeader);
            fcgiFrameEncoder.writeBody(dataChunk);
            fpmSocketClient.write(fcgiFrameEncoder.tobuffer());
        } else {
            bufferedRequestBodyChunks.push(dataChunk);
        }
    });

    incomingHttpReq.on('end', () => {
        appLogger.debug('Incoming HTTP request body stream has concluded.');
        finalizeInputToFpm();
    });

    fpmSocketClient.on('data', (receivedBuffer) => {
        if (fcgiFrameDecoder) {
            fcgiFrameDecoder.execute(receivedBuffer);
        } else {
            appLogger.error('FCGI parser not initialized upon data reception from FPM.');
            if (!outgoingHttpRes.headersSent) {
                outgoingHttpRes.writeHead(500, { 'Content-Type': 'text/plain' });
                outgoingHttpRes.end('Internal Server Error: FCGI parser not ready.');
            }
            fpmSocketClient.end();
        }
    });

    fpmSocketClient.on('connect', () => {
        appLogger.info(`Connected to FPM: ${fcgiConnectionConfig.fastcgiHost}:${fcgiConnectionConfig.fastcgiPort}`);

        fcgiFrameEncoder = new fcgiParserLib.writer();
        fcgiFrameDecoder = new fcgiParserLib.parser();

        fcgiFrameEncoder.encoding = 'binary';

        let accumulatedResponseBody = Buffer.from('');
        let responseHeadersSent = false;
        let httpResponseStatusCode = 200;

        fcgiFrameDecoder.onRecord = (fcgiResponseRecord) => {
            appLogger.debug(`Processing FCGI record type: ${fcgiResponseRecord.header.type}`);

            if (fcgiResponseRecord.header.type === FCGI_TYPE_STDOUT) {
                if (!responseHeadersSent) {
                    const contentString = fcgiResponseRecord.body.toString('utf8');
                    const parts = contentString.split(HTTP_HEADER_BODY_DELIMITER, 2);

                    const rawHeaders = parts[0];
                    const responseBodyRemainder = parts.length > 1 ? parts[1] : '';

                    const headerLines = rawHeaders.split('\r\n');
                    const outputHttpHeaders = [];

                    try {
                        for (const line of headerLines) {
                            if (!line.trim()) continue;
                            const colonIndex = line.indexOf(': ');
                            if (colonIndex > 0) {
                                const headerKey = line.substring(0, colonIndex);
                                const headerValue = line.substring(colonIndex + 2);

                                if (headerKey.toLowerCase() === 'status') {
                                    httpResponseStatusCode = parseInt(headerValue.substring(0, 3), 10);
                                    continue;
                                }
                                outputHttpHeaders.push([headerKey, headerValue]);
                            } else {
                                appLogger.warn(`Malformed header line from FPM: "${line}"`);
                            }
                        }
                    } catch (parsingErr) {
                        appLogger.error('Failed to parse FPM response headers:', parsingErr);
                        httpResponseStatusCode = 500;
                        outputHttpHeaders.push(['Content-Type', 'text/plain'], ['X-FPM-Error', 'Header Parsing Error']);
                    }

                    appLogger.info(`FPM response HTTP status: ${httpResponseStatusCode}`);

                    if (httpResponseStatusCode === 404) {
                        nextMiddlewareHandler();
                        fcgiFrameDecoder.onRecord = () => {};
                        fpmSocketClient.end();
                        return;
                    }

                    outgoingHttpRes.writeHead(httpResponseStatusCode, Object.fromEntries(outputHttpHeaders));
                    responseHeadersSent = true;

                    if (responseBodyRemainder) {
                        accumulatedResponseBody = Buffer.concat([accumulatedResponseBody, Buffer.from(responseBodyRemainder, 'utf8')]);
                    }
                } else {
                    accumulatedResponseBody = Buffer.concat([accumulatedResponseBody, fcgiResponseRecord.body]);
                }
            } else if (fcgiResponseRecord.header.type === FCGI_TYPE_END_REQUEST) {
                if (!responseHeadersSent) {
                    appLogger.error('FPM ended request without sending HTTP headers.');
                    outgoingHttpRes.writeHead(500, { 'Content-Type': 'text/plain' });
                    outgoingHttpRes.end('Internal Server Error: FPM response missing headers.');
                } else {
                    outgoingHttpRes.end(accumulatedResponseBody);
                }
                fpmSocketClient.end();
            } else {
                appLogger.warn(`Received an unexpected FCGI record type: ${fcgiResponseRecord.header.type}`);
            }
        };

        fcgiFrameDecoder.onError = (parserError) => {
            appLogger.error('FastCGI parser error:', parserError);
            if (!outgoingHttpRes.headersSent) {
                outgoingHttpRes.writeHead(500, { 'Content-Type': 'text/plain' });
                outgoingHttpRes.end('Internal Server Error: FastCGI data parsing failed.');
            } else {
                outgoingHttpRes.end();
            }
            fpmSocketClient.end();
        };

        transmitFcgiInitialRecords(fpmSocketClient);
    });

    fpmSocketClient.on('close', (hadError) => {
        appLogger.info(`FPM socket connection closed. Error occurred: ${hadError}`);
        if (hadError && !outgoingHttpRes.headersSent) {
            appLogger.error('FPM connection terminated with error before response completion.');
            outgoingHttpRes.writeHead(503, { 'Content-Type': 'text/plain' });
            outgoingHttpRes.end('Service Unavailable: FPM connection lost.');
        }
    });

    fpmSocketClient.on('error', (connectionError) => {
        appLogger.error('FPM socket connection error:', nodeUtils.inspect(connectionError.stack || connectionError));
        if (!outgoingHttpRes.headersSent) {
            outgoingHttpRes.writeHead(502, { 'Content-Type': 'text/plain' });
            outgoingHttpRes.end('Bad Gateway: Failed to establish FPM connection.');
        } else {
            outgoingHttpRes.end();
        }
        fpmSocketClient.end();
    });

    fpmSocketClient.connect(fcgiConnectionConfig.fastcgiPort, fcgiConnectionConfig.fastcgiHost);
}

module.exports = (runtimeConfiguration) => {
    const defaultFcgiSettings = {
        fastcgiPort: 9000,
        fastcgiHost: '127.0.0.1',
        documentRoot: process.cwd()
    };

    const effectiveFcgiSettings = { ...defaultFcgiSettings, ...runtimeConfiguration };

    if (!effectiveFcgiSettings.fastcgiPort || !effectiveFcgiSettings.fastcgiHost) {
        const errorMsg = 'FastCGI configuration requires valid fastcgiPort and fastcgiHost values.';
        appLogger.error(errorMsg);
        throw new Error(errorMsg);
    }

    return (reqObj, resObj, nextHandler) => {
        const docRoot = effectiveFcgiSettings.documentRoot;
        const parsedUrlDetails = uriUtilities.parse(reqObj.url, true);
        const scriptFileCandidate = parsedUrlDetails.pathname || '/index.php';

        const fullRequestUri = reqObj.headers['x-request-uri'] || reqObj.url;
        const requestQueryString = parsedUrlDetails.query ? uriUtilities.format(parsedUrlDetails.query) : '';

        appLogger.info(`Incoming Request: ${reqObj.method} ${reqObj.url}`);

        const baseFcgiParameters = [
            ["SCRIPT_FILENAME", pathResolver.join(docRoot, scriptFileCandidate)],
            ["REMOTE_ADDR", reqObj.socket.remoteAddress || 'UNKNOWN_IP'],
            ["QUERY_STRING", requestQueryString],
            ["REQUEST_METHOD", reqObj.method],
            ["SCRIPT_NAME", scriptFileCandidate],
            ["PATH_INFO", scriptFileCandidate],
            ["DOCUMENT_URI", scriptFileCandidate],
            ["REQUEST_URI", fullRequestUri],
            ["DOCUMENT_ROOT", docRoot],
            ["PHP_SELF", scriptFileCandidate],
            ["GATEWAY_PROTOCOL", "CGI/1.1"],
            ["SERVER_SOFTWARE", `Node.js/${process.version}`],
            ["SERVER_PROTOCOL", reqObj.httpVersion || 'HTTP/1.1'],
            ["SERVER_NAME", reqObj.headers.host ? reqObj.headers.host.split(':')[0] : 'localhost'],
            ["SERVER_PORT", reqObj.headers.host ? reqObj.headers.host.split(':')[1] || '80' : '80']
        ];
        
        if (reqObj.headers['content-type']) {
            baseFcgiParameters.push(['CONTENT_TYPE', reqObj.headers['content-type']]);
        }
        if (reqObj.headers['content-length']) {
            baseFcgiParameters.push(['CONTENT_LENGTH', reqObj.headers['content-length']]);
        }
        
        const finalFcgiParameters = prepareFcgiParameters(reqObj.headers, baseFcgiParameters);

        appLogger.debug('Generated FCGI Parameters:', finalFcgiParameters);

        initiateFpmCommunication(reqObj, resObj, finalFcgiParameters, effectiveFcgiSettings, nextHandler);
    };
};