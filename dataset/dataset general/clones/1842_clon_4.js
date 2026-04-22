const webUtil = require('url');
const fileSys = require('fs');
const pathUtil = require('path');
const httpUtil = require('http');
const socketUtil = require('net');
const fcgiLib = require('fastcgi-parser');

const logOutput = 0 ? console : {
    log: () => {},
    dir: () => {}
};

const fcgiResponderRole = fcgiLib.constants.role.FCGI_RESPONDER;
const fcgiBeginRecord = fcgiLib.constants.record.FCGI_BEGIN;
const fcgiStdinRecord = fcgiLib.constants.record.FCGI_STDIN;
const fcgiStdoutRecord = fcgiLib.constants.record.FCGI_STDOUT;
const fcgiParamsRecord = fcgiLib.constants.record.FCGI_PARAMS;
const fcgiEndRecord = fcgiLib.constants.record.FCGI_END;

function prepareFcgiParameters(httpRequestHeaders, initialParameters) {
    if (!httpRequestHeaders || Object.keys(httpRequestHeaders).length === 0) {
        return initialParameters;
    }

    return Object.entries(httpRequestHeaders).reduce((accumulator, [key, value]) => {
        let transformedKey = key.replace(/-/g, '_').toUpperCase();
        if (!transformedKey.startsWith('CONTENT_')) {
            transformedKey = 'HTTP_' + transformedKey;
        }
        accumulator.push([transformedKey, value]);
        return accumulator;
    }, [...initialParameters]);
}

function collectStreamData(stream) {
    return new Promise((resolve, reject) => {
        const chunks = [];
        stream.on('data', (chunk) => chunks.push(chunk));
        stream.on('end', () => resolve(Buffer.concat(chunks)));
        stream.on('error', reject);
    });
}

async function handleFcgiCommunication(httpRequest, httpResponse, fcgiParameters, connSettings, passControl) {
    const tcpSocket = new socketUtil.Socket();
    tcpSocket.setNoDelay(true);

    const fcgiWriter = new fcgiLib.writer();
    const fcgiParser = new fcgiLib.parser();
    fcgiWriter.encoding = 'binary';

    let headersProcessed = false;
    let httpStatusCode = 200;
    const responseHeadersList = [];

    let fcgiResponseResolve;
    let fcgiResponseReject;
    const fcgiResponsePromise = new Promise((resolve, reject) => {
        fcgiResponseResolve = resolve;
        fcgiResponseReject = reject;
    });

    fcgiParser.onRecord = (rec) => {
        if (rec.header.type === fcgiStdoutRecord) {
            if (!headersProcessed) {
                const fullContent = rec.body.toString('utf8');
                const contentParts = fullContent.split('\r\n\r\n');
                const headerLines = contentParts[0].split('\r\n');

                const initialBodyPart = contentParts.length > 1 ? Buffer.from(contentParts.slice(1).join('\r\n\r\n'), 'utf8') : Buffer.alloc(0);

                headerLines.forEach((line) => {
                    const separatorIndex = line.indexOf(': ');
                    if (separatorIndex > -1) {
                        const key = line.substring(0, separatorIndex);
                        const value = line.substring(separatorIndex + 2);
                        if (key.toLowerCase() === 'status') {
                            httpStatusCode = parseInt(value.substring(0, 3), 10);
                        } else {
                            responseHeadersList.push([key, value]);
                        }
                    }
                });

                logOutput.log(`  --> Request Response Status Code: "${httpStatusCode}"`);

                if (httpStatusCode === 404) {
                    passControl();
                    tcpSocket.end();
                    fcgiParser.onRecord = () => {};
                    fcgiResponseReject(new Error('FCGI 404 handled by middleware.'));
                    return;
                }

                httpResponse.writeHead(httpStatusCode, Object.fromEntries(responseHeadersList));
                headersProcessed = true;
                if (initialBodyPart.length > 0) {
                    httpResponse.write(initialBodyPart);
                }
            } else {
                httpResponse.write(rec.body);
            }
        } else if (rec.header.type === fcgiEndRecord) {
            httpResponse.end();
            fcgiResponseResolve();
        }
    };

    fcgiParser.onError = (err) => {
        logOutput.log('FCGI Parser Error:', err);
        if (!httpResponse.headersSent) {
            httpResponse.statusCode = 500;
            httpResponse.end('FastCGI parser error.');
        }
        fcgiResponseReject(err);
    };

    try {
        await new Promise((resolve, reject) => {
            tcpSocket.once('connect', resolve);
            tcpSocket.once('error', (err) => {
                if (!httpResponse.headersSent) {
                    httpResponse.statusCode = 502;
                    httpResponse.end('Could not connect to FastCGI backend.');
                }
                reject(err);
            });
            tcpSocket.connect(connSettings.fcgiPort, connSettings.fcgiHost);
        });

        logOutput.log(`Connected to FCGI server at ${connSettings.fcgiHost}:${connSettings.fcgiPort}`);

        tcpSocket.on('data', (dataBuffer) => {
            fcgiParser.execute(dataBuffer, 0, dataBuffer.length);
        });

        tcpSocket.on('close', () => {
            logOutput.log('FCGI socket closed.');
        });

        fcgiWriter.writeHeader({
            version: fcgiLib.constants.version,
            type: fcgiBeginRecord,
            recordId: 1,
            contentLength: 8,
            paddingLength: 0
        });
        fcgiWriter.writeBegin({
            role: fcgiResponderRole,
            flags: fcgiLib.constants.keepalive.OFF
        });
        tcpSocket.write(fcgiWriter.tobuffer());

        fcgiWriter.writeHeader({
            version: fcgiLib.constants.version,
            type: fcgiParamsRecord,
            recordId: 1,
            contentLength: fcgiLib.getParamLength(fcgiParameters),
            paddingLength: 0
        });
        fcgiWriter.writeParams(fcgiParameters);
        tcpSocket.write(fcgiWriter.tobuffer());

        fcgiWriter.writeHeader({
            version: fcgiLib.constants.version,
            type: fcgiParamsRecord,
            recordId: 1,
            contentLength: 0,
            paddingLength: 0
        });
        tcpSocket.write(fcgiWriter.tobuffer());

        const requestMethod = httpRequest.method.toUpperCase();
        if (requestMethod === 'POST' || requestMethod === 'PUT' || requestMethod === 'PATCH') {
            const fullRequestBody = await collectStreamData(httpRequest);
            const chunkSize = 65535;
            for (let offset = 0; offset < fullRequestBody.length; offset += chunkSize) {
                const chunk = fullRequestBody.slice(offset, offset + chunkSize);
                fcgiWriter.writeHeader({
                    version: fcgiLib.constants.version,
                    type: fcgiStdinRecord,
                    recordId: 1,
                    contentLength: chunk.length,
                    paddingLength: 0
                });
                fcgiWriter.writeBody(chunk);
                tcpSocket.write(fcgiWriter.tobuffer());
            }
        }

        fcgiWriter.writeHeader({
            version: fcgiLib.constants.version,
            type: fcgiStdinRecord,
            recordId: 1,
            contentLength: 0,
            paddingLength: 0
        });
        tcpSocket.write(fcgiWriter.tobuffer());

        await fcgiResponsePromise;

    } catch (err) {
        if (err.message !== 'FCGI 404 handled by middleware.') {
            console.error('FastCGI communication error:', err.stack);
            if (!httpResponse.headersSent) {
                httpResponse.statusCode = 500;
                httpResponse.end('Internal Server Error during FastCGI communication.');
            } else {
                httpResponse.end();
            }
        }
    } finally {
        tcpSocket.end();
    }
}

module.exports = function fcgiProxyInitializer(initialSettings) {
    const defaultSettings = {
        fcgiPort: 9000,
        fcgiHost: 'localhost',
        baseDirectory: ''
    };

    const effectiveSettings = Object.assign({}, defaultSettings, initialSettings);

    return async (httpRequest, httpResponse, passControl) => {
        const resourcePath = webUtil.parse(httpRequest.url).pathname;
        const originalUri = httpRequest.headers['x-request-uri'] || httpRequest.url;
        const queryData = webUtil.parse(originalUri).query || '';

        const baseFcgiParams = [
            ["SCRIPT_FILENAME", effectiveSettings.baseDirectory + resourcePath],
            ["REMOTE_ADDR", httpRequest.socket.remoteAddress],
            ["QUERY_STRING", queryData],
            ["REQUEST_METHOD", httpRequest.method],
            ["SCRIPT_NAME", resourcePath],
            ["PATH_INFO", resourcePath],
            ["DOCUMENT_URI", resourcePath],
            ["REQUEST_URI", originalUri],
            ["DOCUMENT_ROOT", effectiveSettings.baseDirectory],
            ["PHP_SELF", resourcePath],
            ["GATEWAY_PROTOCOL", "CGI/1.1"],
            ["SERVER_SOFTWARE", "node.js/" + process.version]
        ];

        const finalFcgiParams = prepareFcgiParameters(httpRequest.headers, baseFcgiParams);

        logOutput.log('Incoming HTTP Request:', httpRequest.method, httpRequest.url);
        logOutput.dir(finalFcgiParams);

        await handleFcgiCommunication(httpRequest, httpResponse, finalFcgiParams, effectiveSettings, passControl);
    };
};