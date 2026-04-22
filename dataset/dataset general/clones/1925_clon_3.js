const webProtocol = require('node:http');
const uriUtils = require('node:path');
const mediaClassifier = require('mime');
const diskAccess = require('node:fs');

// --- Configuration and Core Constants for the Asset Delivery Service ---
const serviceConfiguration = Object.freeze({
    // Prefix for all debug and activity logging messages.
    loggerTag: '[AssetDeliveryService]',
    // Default document name for directory requests.
    directoryIndexFile: 'index.html',
    // Permitted HTTP verbs for resource retrieval.
    allowedHttpMethods: new Set(['GET', 'HEAD']),
    // Standard HTTP header field names.
    headerContentType: 'Content-Type',
    headerContentLength: 'Content-Length',
    headerLastModified: 'Last-Modified',
    headerIfModifiedSince: 'If-Modified-Since',
    headerAllowMethods: 'Allow',
    // MIME type for plain text content.
    plainTextMimeType: 'text/plain',
    // File system error codes for specific scenarios.
    fsErrorIsDir: 'EISDIR',
    fsErrorNoEntry: 'ENOENT',
    fsErrorAccessDenied: 'EACCES',
    // HTTP status codes used by the service.
    httpStatusOk: 200,
    httpStatusMovedPermanently: 301,
    httpStatusNotModified: 304,
    httpStatusForbidden: 403,
    httpStatusNotFound: 404,
    httpStatusMethodNotAllowed: 405,
    httpStatusInternalServerError: 500,
});

// --- Service Utility Functions ---

/**
 * Provides structured logging output to the console.
 * @param {...any} logSegments - Parts of the message to concatenate and log.
 */
function activityLogger(...logSegments) {
    console.log(serviceConfiguration.loggerTag, logSegments.join(' '));
}

/**
 * Formats a JavaScript Date object into its ISO 8601 string representation.
 * @param {Date} inputDate - The date object to convert.
 * @returns {string} An ISO-formatted date string.
 */
function toIsoDateTime(inputDate) {
    return inputDate.toISOString();
}

/**
 * Extends an HTTP response object with custom methods for simplified operation.
 * @param {object} resObject - The Node.js HTTP response stream.
 * @param {object} reqObject - The Node.js HTTP request stream.
 */
function enhanceResponse(resObject, reqObject) {
    // Link the request to the response for contextual access.
    resObject.linkedRequest = reqObject;

    // Cache the original 'end' method to allow internal finalization.
    resObject.cachedEndMethod = resObject.end;

    // Override the 'end' method to include comprehensive logging.
    resObject.end = function() {
        this.cachedEndMethod(); // Execute the actual HTTP response termination.
        activityLogger(
            toIsoDateTime(new Date()),
            this.linkedRequest.method,
            this.linkedRequest.url,
            this.statusCode,
            webProtocol.STATUS_CODES[this.statusCode],
            this.loggedContentType || serviceConfiguration.plainTextMimeType,
            this.loggedContentLength || 0
        );
    };

    /**
     * Dispatches an HTTP status code along with relevant headers and the status message.
     * @param {number} codeValue - The HTTP status code to transmit.
     * @param {object} [additionalHeaders] - Optional supplementary headers for the response.
     */
    resObject.dispatchStatusCode = function(codeValue, additionalHeaders) {
        const activeHeaders = additionalHeaders || {};
        const statusText = webProtocol.STATUS_CODES[codeValue];

        // Ensure content type and length are appropriately set for status responses.
        if (!activeHeaders[serviceConfiguration.headerContentType]) {
            activeHeaders[serviceConfiguration.headerContentType] = serviceConfiguration.plainTextMimeType;
        }
        if (!activeHeaders[serviceConfiguration.headerContentLength]) {
            activeHeaders[serviceConfiguration.headerContentLength] = statusText ? Buffer.byteLength(statusText, 'utf8') : 0;
        }

        // Store these details for the final log entry.
        this.loggedContentType = activeHeaders[serviceConfiguration.headerContentType];
        this.loggedContentLength = activeHeaders[serviceConfiguration.headerContentLength];

        this.writeHead(codeValue, activeHeaders);

        // For non-HEAD requests, include the standard status phrase in the body.
        if (this.linkedRequest.method !== 'HEAD' && statusText) {
            this.write(statusText);
        }
    };
}


// --- Primary Asset Serving Engine ---

// Initialize the HTTP server instance.
const assetDeliveryEngine = webProtocol.createServer(function(clientRequest, serverResponse) {
    // Augment the response object with our custom helper methods.
    enhanceResponse(serverResponse, clientRequest);

    // Enforce allowed HTTP request methods.
    if (!serviceConfiguration.allowedHttpMethods.has(clientRequest.method)) {
        serverResponse.dispatchStatusCode(serviceConfiguration.httpStatusMethodNotAllowed, {
            [serviceConfiguration.headerAllowMethods]: Array.from(serviceConfiguration.allowedHttpMethods).join(', ')
        });
        return serverResponse.end();
    }

    // Resolve the absolute file path for the requested resource.
    const baseExecutionDirectory = process.cwd();
    // Safely decode the URI to handle encoded characters.
    const decodedRequestUri = decodeURIComponent(clientRequest.url);
    const resolvedResourcePath = uriUtils.resolve(baseExecutionDirectory, decodedRequestUri);

    // Crucial security check: Prevent directory traversal.
    // Ensure the resolved path strictly remains within the current working directory hierarchy.
    const isPathSecure = resolvedResourcePath.startsWith(baseExecutionDirectory + uriUtils.sep);
    const isRootRequest = (resolvedResourcePath === baseExecutionDirectory);

    if (!isPathSecure && !isRootRequest) {
        activityLogger(`Security alert: Attempted path traversal for "${clientRequest.url}" resulting in "${resolvedResourcePath}"`);
        serverResponse.dispatchStatusCode(serviceConfiguration.httpStatusForbidden);
        return serverResponse.end();
    }
    
    // Attempt to open the requested file for reading.
    const resourceFileStream = diskAccess.createReadStream(resolvedResourcePath);

    // Register an error handler for the file stream.
    resourceFileStream.on('error', function(errorDetail) {
        switch (errorDetail.code) {
            case serviceConfiguration.fsErrorIsDir:
                // If the request points to a directory, redirect to its default index file.
                activityLogger(`Directory access for "${resolvedResourcePath}", redirecting to index.`);
                serverResponse.dispatchStatusCode(serviceConfiguration.httpStatusMovedPermanently, {
                    'Location': uriUtils.join(clientRequest.url, serviceConfiguration.directoryIndexFile)
                });
                break;
            case serviceConfiguration.fsErrorNoEntry:
                // Resource not found on the file system.
                activityLogger(`Resource not found: "${resolvedResourcePath}"`);
                serverResponse.dispatchStatusCode(serviceConfiguration.httpStatusNotFound);
                break;
            case serviceConfiguration.fsErrorAccessDenied:
                // File access permissions are insufficient.
                activityLogger(`Access denied to: "${resolvedResourcePath}"`);
                serverResponse.dispatchStatusCode(serviceConfiguration.httpStatusForbidden);
                break;
            default:
                // Handle any other unexpected file system errors.
                activityLogger(`Critical FS error for "${resolvedResourcePath}": ${errorDetail.stack}`);
                serverResponse.dispatchStatusCode(serviceConfiguration.httpStatusInternalServerError);
        }
        return serverResponse.end();
    });

    // Once the file stream is successfully opened, retrieve its statistics and send the response.
    resourceFileStream.on('open', function(fileHandle) {
        // Obtain detailed file system statistics.
        diskAccess.fstat(fileHandle, function(statError, fileStats) {
            if (statError) {
                activityLogger(`Failed to stat file "${resolvedResourcePath}": ${statError.stack}`);
                serverResponse.dispatchStatusCode(serviceConfiguration.httpStatusInternalServerError);
                return serverResponse.end();
            }

            // Determine the appropriate MIME type based on the file extension.
            const identifiedContentType = mediaClassifier.getType(resolvedResourcePath);

            // Assemble the standard response headers.
            const responseHeaders = {
                [serviceConfiguration.headerContentType]: identifiedContentType,
                [serviceConfiguration.headerContentLength]: fileStats.size,
                [serviceConfiguration.headerLastModified]: fileStats.mtime.toUTCString()
            };

            // Store content details for the eventual log entry.
            serverResponse.loggedContentType = identifiedContentType;
            serverResponse.loggedContentLength = fileStats.size;

            // Implement conditional GET (If-Modified-Since) for client-side caching.
            const clientCacheTimestampHeader = clientRequest.headers[serviceConfiguration.headerIfModifiedSince.toLowerCase()];
            if (clientCacheTimestampHeader) {
                const clientLastModified = new Date(clientCacheTimestampHeader);
                // Validate if the 'If-Modified-Since' header value was a valid date.
                if (!isNaN(clientLastModified.getTime())) {
                    // Compare file's last modified time with the client's cached timestamp.
                    if (fileStats.mtime.getTime() <= clientLastModified.getTime()) {
                        activityLogger(`Resource "${resolvedResourcePath}" not modified since client's cache. Sending 304.`);
                        serverResponse.writeHead(serviceConfiguration.httpStatusNotModified, responseHeaders);
                        resourceFileStream.resume(); // Prevent resource leaks by consuming the stream.
                        return serverResponse.end();
                    }
                } else {
                    activityLogger(`Malformed "${serviceConfiguration.headerIfModifiedSince}" header: "${clientCacheTimestampHeader}". Ignoring for now.`);
                    // A more robust server might send a 400 Bad Request here.
                }
            }

            // If the resource is not cached or has been modified, send the full content.
            serverResponse.writeHead(serviceConfiguration.httpStatusOk, responseHeaders);

            // For GET requests, pipe the file's data to the response stream.
            if (clientRequest.method === 'GET') {
                resourceFileStream.pipe(serverResponse);
            } else {
                // For HEAD requests, only headers are sent; consume the stream without piping.
                resourceFileStream.resume();
                serverResponse.end();
            }
        });
    });
});

// Expose the configured HTTP server instance for external use.
module.exports = assetDeliveryEngine;