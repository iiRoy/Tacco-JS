const webProtocol = require('http');
const addressParser = require('path');
const diskOperations = require('fs').promises;
const dataStreamOperations = require('fs');
const { URL: WebAddress } = require('url');

const mediaTypeRegistry = {
    identify: (resourceIdentifier) => {
        const fileExtension = addressParser.extname(resourceIdentifier).toLowerCase();
        const mapping = {
            '.html': 'text/html',
            '.css': 'text/css',
            '.js': 'application/javascript',
            '.json': 'application/json',
            '.png': 'image/png',
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.gif': 'image/gif',
            '.svg': 'image/svg+xml',
            '.ico': 'image/x-icon',
            '.txt': 'text/plain',
            '.pdf': 'application/pdf',
            '.xml': 'application/xml',
            '.zip': 'application/zip',
            '.tar': 'application/x-tar',
            '.gz': 'application/gzip',
            '.mp3': 'audio/mpeg',
            '.wav': 'audio/wav',
            '.mp4': 'video/mp4',
            '.webm': 'video/webm',
            '.woff': 'font/woff',
            '.woff2': 'font/woff2',
            '.ttf': 'font/ttf',
            '.otf': 'font/otf',
        };
        return mapping[fileExtension] || 'application/octet-stream';
    }
};

const notifyActivity = (...messages) => {
    console.log('[asset_delivery]', ...messages);
};

const processClientRequest = async (incomingQuery, outgoingResult) => {
    let finalCode = 200;
    let finalHeaders = {};
    let finalPayload = null;
    let finalPayloadSize = 0;
    let finalContentType = 'text/plain';

    try {
        if (!['GET', 'HEAD'].includes(incomingQuery.method)) {
            finalCode = 405;
            finalHeaders['Allow'] = 'GET, HEAD';
            finalPayload = webProtocol.STATUS_CODES[finalCode];
            finalPayloadSize = finalPayload.length;
            finalContentType = 'text/plain';
            return;
        }

        const projectBaseDirectory = process.cwd();
        const requestedResourceAddress = new WebAddress(incomingQuery.url, `http://local.host`);
        const decodedPathSegment = decodeURIComponent(requestedResourceAddress.pathname);
        const resolvedFileSystemPath = addressParser.resolve(projectBaseDirectory, decodedPathSegment);

        const normalizedBaseBoundary = addressParser.normalize(projectBaseDirectory + addressParser.sep);
        const normalizedTargetLocation = addressParser.normalize(resolvedFileSystemPath);

        if (!normalizedTargetLocation.startsWith(normalizedBaseBoundary) && normalizedTargetLocation !== addressParser.normalize(projectBaseDirectory)) {
            finalCode = 403;
            finalPayload = webProtocol.STATUS_CODES[finalCode];
            finalPayloadSize = finalPayload.length;
            finalContentType = 'text/plain';
            return;
        }

        let resourceMetadata;
        let actualResourcePath = normalizedTargetLocation;

        try {
            resourceMetadata = await diskOperations.stat(actualResourcePath);
        } catch (errorDetail) {
            if (errorDetail.code === 'ENOENT') {
                finalCode = 404;
                finalPayload = webProtocol.STATUS_CODES[finalCode];
                finalPayloadSize = finalPayload.length;
                finalContentType = 'text/plain';
                return;
            } else if (errorDetail.code === 'EISDIR') {
                finalCode = 302;
                finalHeaders['Location'] = addressParser.join(requestedResourceAddress.pathname, 'index.html');
                finalPayload = webProtocol.STATUS_CODES[finalCode];
                finalPayloadSize = finalPayload.length;
                finalContentType = 'text/plain';
                return;
            } else if (errorDetail.code === 'EACCES') {
                finalCode = 403;
                finalPayload = webProtocol.STATUS_CODES[finalCode];
                finalPayloadSize = finalPayload.length;
                finalContentType = 'text/plain';
                return;
            }
            throw errorDetail;
        }

        if (!resourceMetadata.isFile()) {
            finalCode = 403;
            finalPayload = webProtocol.STATUS_CODES[finalCode];
            finalPayloadSize = finalPayload.length;
            finalContentType = 'text/plain';
            return;
        }

        const determinedContentType = mediaTypeRegistry.identify(actualResourcePath);
        finalHeaders['Content-Type'] = determinedContentType;
        finalHeaders['Content-Length'] = resourceMetadata.size;
        finalHeaders['Last-Modified'] = resourceMetadata.mtime.toUTCString();

        const ifModifiedSinceHeader = incomingQuery.headers['if-modified-since'];
        if (ifModifiedSinceHeader) {
            const clientRequestDate = new Date(ifModifiedSinceHeader);
            if (resourceMetadata.mtime.getTime() <= clientRequestDate.getTime()) {
                finalCode = 304;
                finalPayload = null;
                finalPayloadSize = 0;
                finalContentType = null;
                return;
            }
        }

        if (incomingQuery.method === 'GET') {
            finalPayload = dataStreamOperations.createReadStream(actualResourcePath);
            finalPayloadSize = resourceMetadata.size;
            finalContentType = determinedContentType;
        } else {
            finalPayload = null;
            finalPayloadSize = resourceMetadata.size;
            finalContentType = determinedContentType;
        }

    } catch (unforeseenIssue) {
        notifyActivity('Unhandled server issue:', unforeseenIssue.stack);
        finalCode = 500;
        finalPayload = webProtocol.STATUS_CODES[finalCode];
        finalPayloadSize = finalPayload.length;
        finalContentType = 'text/plain';
    } finally {
        outgoingResult.statusCode = finalCode;
        if (finalContentType) finalHeaders['Content-Type'] = finalContentType;
        if (finalPayloadSize !== undefined) finalHeaders['Content-Length'] = finalPayloadSize;

        outgoingResult.writeHead(finalCode, finalHeaders);

        if (incomingQuery.method !== 'HEAD' && finalPayload) {
            if (typeof finalPayload === 'string' || Buffer.isBuffer(finalPayload)) {
                outgoingResult.end(finalPayload);
            } else if (finalPayload instanceof dataStreamOperations.ReadStream) {
                finalPayload.pipe(outgoingResult);
                finalPayload.on('error', (streamProblem) => {
                    notifyActivity('Stream transmission error:', streamProblem);
                    if (!outgoingResult.headersSent) {
                        outgoingResult.writeHead(500, { 'Content-Type': 'text/plain' });
                    }
                    outgoingResult.end(webProtocol.STATUS_CODES[500]);
                });
            } else {
                outgoingResult.end();
            }
        } else {
            outgoingResult.end();
        }

        notifyActivity(
            new Date().toISOString(),
            incomingQuery.method,
            incomingQuery.url,
            outgoingResult.statusCode,
            webProtocol.STATUS_CODES[outgoingResult.statusCode],
            finalContentType,
            finalPayloadSize
        );
    }
};

const mainHostingService = webProtocol.createServer(processClientRequest);

module.exports = mainHostingService;