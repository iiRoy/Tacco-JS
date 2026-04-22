const fileSystemOps = require('fs');
const eventEmitterClass = require('events');
const httpClient = require('http');
const urlParser = require('url');
const pathUtils = require('path');

// External utility modules specific to this static server.
const contentTypeMapper = require('./node-static/mime');
const utilityHelpers = require('./node-static/util');

// Define the service signature for response headers.
const serviceSignature = 'modern-static-provider/1.0.0';

// In-memory caches for file content and directory structures.
// Using Map for better performance and explicit key-value storage.
const globalFileCache = new Map(); // Stores file buffers and metadata
const directoryIndexCache = new Map(); // Stores parsed directory index files (e.g., index.json)

/**
 * @class StaticContentServer
 * @description A robust server for static file delivery with caching and directory indexing.
 * @param {string|object} basePathOrConfig - The base directory to serve from, or configuration object.
 * @param {object} [configSettings] - Additional configuration options.
 */
function StaticContentServer(basePathOrConfig, configSettings) {
    // Handle overloaded constructor: if basePathOrConfig is an object, it's configSettings.
    if (basePathOrConfig && (typeof basePathOrConfig === 'object')) {
        configSettings = basePathOrConfig;
        basePathOrConfig = null;
    }

    // Resolve the base directory for serving files. Defaults to current directory.
    this.basePath = pathUtils.normalize(basePathOrConfig || '.');
    // Store configuration settings, ensuring it's an object.
    this.configSettings = configSettings || {};
    // Default cache duration for client-side caching (in seconds).
    let cacheDurationSeconds = 3600; // Default to 1 hour (3600 seconds)

    // Initialize standard response headers, merging with provided options.
    this.standardResponseHeaders = {};
    this.configSettings.headers = this.configSettings.headers || {};

    // Process cache settings from options.
    if ('cache' in this.configSettings) {
        if (typeof this.configSettings.cache === 'number') {
            cacheDurationSeconds = this.configSettings.cache;
        } else if (!this.configSettings.cache) {
            cacheDurationSeconds = 0; // Explicitly disable caching
        }
    }

    // Apply cache control header if caching is enabled.
    if (cacheDurationSeconds > 0) {
        this.standardResponseHeaders['Cache-Control'] = `max-age=${cacheDurationSeconds}`;
    } else {
        // If caching is disabled, ensure no-cache headers are set to prevent browser caching.
        this.standardResponseHeaders['Cache-Control'] = 'no-cache, no-store, must-revalidate';
        this.standardResponseHeaders['Pragma'] = 'no-cache';
        this.standardResponseHeaders['Expires'] = '0';
    }

    // Set the server signature header for identification.
    this.standardResponseHeaders['Server'] = serviceSignature;

    // Merge default headers with user-provided headers, prioritizing user headers.
    for (const headerName in this.standardResponseHeaders) {
        if (Object.prototype.hasOwnProperty.call(this.standardResponseHeaders, headerName)) {
            this.configSettings.headers[headerName] = this.configSettings.headers[headerName] ||
                                                      this.standardResponseHeaders[headerName];
        }
    }
}

/**
 * Processes a request for a directory, attempting to serve an index file (index.html or index.json).
 * @param {string} directoryPath - The absolute path to the directory.
 * @param {object} clientRequest - The incoming HTTP request object.
 * @param {object} serverResponse - The outgoing HTTP response object.
 * @param {function} completionCallback - Callback to finalize the response.
 */
StaticContentServer.prototype.processDirectoryRequest = function (directoryPath, clientRequest, serverResponse, completionCallback) {
    const defaultIndexHtmlPath = pathUtils.join(directoryPath, 'index.html');
    const instanceRef = this; // Capture 'this' for nested callbacks.

    fileSystemOps.stat(defaultIndexHtmlPath, (operationError, fileStats) => {
        if (!operationError && fileStats.isFile()) {
            // If index.html exists and is a file, respond with it.
            instanceRef.composeAndSendResponse(null, 200, {}, [defaultIndexHtmlPath], fileStats, clientRequest, serverResponse, completionCallback);
        } else {
            // If index.html not found or not a file, check for a JSON directory index.
            if (directoryIndexCache.has(directoryPath)) {
                // If directory index is cached, stream its files.
                streamIndexedFiles(directoryIndexCache.get(directoryPath).files);
            } else {
                // Otherwise, read index.json from disk.
                const jsonIndexPath = pathUtils.join(directoryPath, 'index.json');
                fileSystemOps.readFile(jsonIndexPath, (readError, contentsBuffer) => {
                    if (readError) {
                        console.warn(`Failed to read index.json for ${directoryPath}: ${readError.message}`);
                        return completionCallback(404, { 'Content-Type': 'text/plain' }, `Cannot find index.html or index.json in directory: ${directoryPath}`);
                    }
                    try {
                        const indexData = JSON.parse(contentsBuffer.toString());
                        if (!Array.isArray(indexData.files)) {
                             console.error(`Invalid index.json format for ${directoryPath}: 'files' property is not an array.`);
                             return completionCallback(500, { 'Content-Type': 'text/plain' }, `Invalid index.json format.`);
                        }
                        directoryIndexCache.set(directoryPath, indexData);
                        streamIndexedFiles(indexData.files);
                    } catch (parseError) {
                        console.error(`Error parsing index.json for ${directoryPath}: ${parseError.message}`);
                        return completionCallback(500, { 'Content-Type': 'text/plain' }, `Error parsing index.json.`);
                    }
                });
            }
        }
    });

    /**
     * Helper function to stream multiple files listed in an index.json file.
     * @param {string[]} filePaths - Array of file paths relative to the directory.
     */
    function streamIndexedFiles(filePaths) {
        // Use utility to get combined stats for all files in the directory.
        utilityHelpers.mstat(directoryPath, filePaths, (mstatError, combinedStats) => {
            if (mstatError) {
                console.error(`Error gathering stats for indexed files in ${directoryPath}: ${mstatError.message}`);
                return completionCallback(500, { 'Content-Type': 'text/plain' }, `Error processing directory contents.`);
            }
            instanceRef.composeAndSendResponse(directoryPath, 200, {}, filePaths, combinedStats, clientRequest, serverResponse, completionCallback);
        });
    }
};

/**
 * Handles serving a single file.
 * @param {string} resourcePath - The full path to the file.
 * @param {number} statusCode - HTTP status code to send (e.g., 200).
 * @param {object} responseHeaders - Additional headers to send.
 * @param {object} clientRequest - The incoming HTTP request object.
 * @param {object} serverResponse - The outgoing HTTP response object.
 * @returns {eventEmitterClass.EventEmitter} A promise-like EventEmitter for success/error events.
 */
StaticContentServer.prototype.handleSingleFileRequest = function (resourcePath, statusCode, responseHeaders, clientRequest, serverResponse) {
    const instanceRef = this;
    const operationPromise = new eventEmitterClass.EventEmitter();

    // Ensure path is normalized and safe relative to the base path.
    const absoluteResourcePath = this.resolveAbsolutePath(resourcePath);

    fileSystemOps.stat(absoluteResourcePath, (operationError, fileStats) => {
        if (operationError) {
            console.error(`File stat error for ${absoluteResourcePath}: ${operationError.message}`);
            // Emit error and immediately finalize response.
            instanceRef.finalizeResponse(404, { 'Content-Type': 'text/plain' }, clientRequest, serverResponse, operationPromise, (errResult) => {
                 operationPromise.emit('error', errResult); // Emit after finalizing response
            });
            return; // Exit early
        }
        
        // Respond with the file content.
        instanceRef.composeAndSendResponse(null, statusCode, responseHeaders, [absoluteResourcePath], fileStats, clientRequest, serverResponse, (finalStatus, finalHeaders) => {
            instanceRef.finalizeResponse(finalStatus, finalHeaders, clientRequest, serverResponse, operationPromise);
        });
    });
    return operationPromise;
};

/**
 * Finalizes the HTTP response, writing headers and ending the stream.
 * @param {number} statusCode - HTTP status code.
 * @param {object} responseHeaders - Headers to send.
 * @param {object} clientRequest - The HTTP request.
 * @param {object} serverResponse - The HTTP response.
 * @param {eventEmitterClass.EventEmitter} operationPromise - Promise-like EventEmitter for success/error events.
 * @param {function} [completionHandler] - Optional callback for specific post-response logic.
 */
StaticContentServer.prototype.finalizeResponse = function (statusCode, responseHeaders, clientRequest, serverResponse, operationPromise, completionHandler) {
    const responseResult = {
        status:  statusCode,
        headers: responseHeaders,
        message: httpClient.STATUS_CODES[statusCode] || 'Unknown Status'
    };

    // Ensure server signature is present in the final headers.
    responseHeaders['Server'] = serviceSignature;

    // Handle error or non-successful status codes (4xx, 5xx).
    if (!statusCode || statusCode >= 400) {
        console.error(`Finalizing response with error status: ${statusCode} for ${clientRequest.url}`);
        if (completionHandler) {
            completionHandler(responseResult);
        } else {
            // Only emit error if there are listeners to prevent unhandled rejection warnings.
            if (operationPromise && operationPromise.listenerCount('error') > 0) {
                operationPromise.emit('error', responseResult);
            }
            if (!serverResponse.headersSent) { // Prevent writing headers twice.
                serverResponse.writeHead(statusCode, responseHeaders);
            }
            serverResponse.end(responseResult.message); // Send error message body.
        }
    } else {
        // For successful responses, if not streaming or if method is not GET, end here.
        // Streaming for GET requests is typically handled within `streamFileContent`.
        if (statusCode !== 200 || clientRequest.method !== 'GET') {
            if (!serverResponse.headersSent) {
                serverResponse.writeHead(statusCode, responseHeaders);
            }
            serverResponse.end();
        }
        // Call optional completion handler.
        completionHandler && completionHandler(null, responseResult);
        // Emit success for promise-like event emitter.
        if (operationPromise) {
            operationPromise.emit('success', responseResult);
        }
    }
};

/**
 * Routes an incoming content path, determining if it's a file or directory and handling accordingly.
 * @param {string} resourcePath - The requested URL path (e.g., '/index.html').
 * @param {number} statusCode - Initial HTTP status code (e.g., 200).
 * @param {object} responseHeaders - Initial response headers.
 * @param {object} clientRequest - The incoming HTTP request.
 * @param {object} serverResponse - The HTTP response.
 * @param {function} completionCallback - Callback to finalize the response.
 * @returns {eventEmitterClass.EventEmitter} A promise-like EventEmitter for success/error.
 */
StaticContentServer.prototype.routeContentPath = function (resourcePath, statusCode, responseHeaders, clientRequest, serverResponse, completionCallback) {
    const instanceRef = this;
    const operationPromise = new eventEmitterClass.EventEmitter();

    // Normalize and resolve the absolute path to prevent directory traversal attacks.
    const absoluteResourcePath = this.resolveAbsolutePath(resourcePath);

    // Guard: Only allow GET and HEAD requests for serving static content.
    if (clientRequest.method !== 'GET' && clientRequest.method !== 'HEAD') {
        console.warn(`Method Not Allowed: ${clientRequest.method} for ${resourcePath}`);
        completionCallback(405, { 'Allow': 'GET, HEAD', 'Content-Type': 'text/plain' }, `Method ${clientRequest.method} not allowed.`);
        return operationPromise;
    }

    // Ensure the resolved path is within the server's base directory.
    // This is a critical security check against directory traversal.
    const escapedBasePath = this.basePath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // Escape special regex characters
    const basePathRegex = new RegExp(`^${escapedBasePath}`);
    if (!basePathRegex.test(absoluteResourcePath)) {
        console.error(`Forbidden access attempt: ${absoluteResourcePath} is outside base path ${this.basePath}`);
        completionCallback(403, { 'Content-Type': 'text/plain' }, `Forbidden: Access denied.`);
        return operationPromise;
    }

    fileSystemOps.stat(absoluteResourcePath, (operationError, fileStats) => {
        if (operationError) {
            console.warn(`Resource not found or accessible: ${absoluteResourcePath} - ${operationError.message}`);
            completionCallback(404, { 'Content-Type': 'text/plain' }, `Resource not found.`);
        } else if (fileStats.isFile()) {
            // If it's a file, respond with its content.
            instanceRef.composeAndSendResponse(null, statusCode, responseHeaders, [absoluteResourcePath], fileStats, clientRequest, serverResponse, completionCallback);
        } else if (fileStats.isDirectory()) {
            // If it's a directory, try to serve an index file.
            instanceRef.processDirectoryRequest(absoluteResourcePath, clientRequest, serverResponse, completionCallback);
        } else {
            // Handle other unsupported file types (e.g., symlinks, sockets).
            console.warn(`Unsupported file system entry type for path: ${absoluteResourcePath}`);
            completionCallback(400, { 'Content-Type': 'text/plain' }, `Bad Request: Unsupported resource type.`);
        }
    });
    return operationPromise;
};

/**
 * Normalizes a given path relative to the server's base path, resolving to an absolute path.
 * @param {string} incomingPath - The path segment to normalize.
 * @returns {string} The normalized absolute path.
 */
StaticContentServer.prototype.resolveAbsolutePath = function (incomingPath) {
    // pathUtils.join correctly handles relative paths, and pathUtils.normalize cleans up '..' and '.' segments.
    return pathUtils.normalize(pathUtils.join(this.basePath, incomingPath));
};

/**
 * Main entry point for handling an incoming HTTP request for static content.
 * @param {object} clientRequest - The incoming HTTP request object.
 * @param {object} serverResponse - The outgoing HTTP response object.
 * @param {function} [optionalCallback] - Optional callback to invoke after handling the request.
 * @returns {eventEmitterClass.EventEmitter|void} A promise-like EventEmitter if no callback is provided.
 */
StaticContentServer.prototype.handleIncomingRequest = function (clientRequest, serverResponse, optionalCallback) {
    const instanceRef = this;
    const operationPromise = new eventEmitterClass.EventEmitter();

    // Parse the URL to extract the pathname, ignoring query parameters.
    const parsedUrl = urlParser.parse(clientRequest.url);
    const requestedPath = parsedUrl.pathname;

    // Define the completion callback for this specific request.
    const requestCompletionHandler = (statusCode, responseHeaders, errorMessage = '') => {
        instanceRef.finalizeResponse(statusCode, responseHeaders, clientRequest, serverResponse, operationPromise, (result) => {
            if (result && result.status >= 400) {
                // If an error occurred, pass it to the optionalCallback.
                if (optionalCallback) {
                    optionalCallback(result);
                } else {
                    operationPromise.emit('error', result);
                }
            } else {
                // On success, pass null for error and the result.
                optionalCallback && optionalCallback(null, result);
                operationPromise.emit('success', result);
            }
        });
    };

    // Schedule the path routing in the next tick to allow event listeners to be attached.
    process.nextTick(() => {
        instanceRef.routeContentPath(requestedPath, 200, {}, clientRequest, serverResponse, requestCompletionHandler)
            .on('success', (result) => {
                // This success is typically handled by requestCompletionHandler's `optionalCallback` or `operationPromise.emit`.
                // Log for visibility if needed.
                // console.log(`Successfully served: ${requestedPath} with status ${result.status}`);
            })
            .on('error', (err) => {
                // This error is typically handled by requestCompletionHandler's `optionalCallback` or `operationPromise.emit`.
                console.error(`Error during content routing for ${requestedPath}:`, err);
            });
    });

    // If no callback is provided, return the promise-like EventEmitter for chaining.
    if (!optionalCallback) {
        return operationPromise;
    }
};

/**
 * Composes and sends the HTTP response, including conditional GET handling and caching logic.
 * @param {string|null} directoryContextPath - The directory context if serving multiple files, null for single file.
 * @param {number} statusCode - HTTP status code.
 * @param {object} additionalHeaders - Headers specific to this response.
 * @param {string[]} filePathsToStream - Array of file paths to stream.
 * @param {object} fileStats - File system stats for the primary file or combined stats for multiple files.
 * @param {object} clientRequest - The incoming HTTP request.
 * @param {object} serverResponse - The HTTP response.
 * @param {function} completionCallback - Callback to finalize the response.
 */
StaticContentServer.prototype.composeAndSendResponse = function (directoryContextPath, statusCode, additionalHeaders, filePathsToStream, fileStats, clientRequest, serverResponse, completionCallback) {
    const lastModifiedTime = Date.parse(fileStats.mtime);
    const cacheKey = directoryContextPath || filePathsToStream[0];
    const finalResponseHeaders = {};

    // Copy configured default headers.
    for (const headerName in this.configSettings.headers) {
        if (Object.prototype.hasOwnProperty.call(this.configSettings.headers, headerName)) {
            finalResponseHeaders[headerName] = this.configSettings.headers[headerName];
        }
    }

    // Generate Etag, Date, and Last-Modified headers for cache validation.
    finalResponseHeaders['Etag'] = JSON.stringify([fileStats.ino, fileStats.size, lastModifiedTime].join('-'));
    finalResponseHeaders['Date'] = new Date().toUTCString();
    finalResponseHeaders['Last-Modified'] = new Date(fileStats.mtime).toUTCString();

    // Implement Conditional GET logic based on If-None-Match and If-Modified-Since headers.
    const ifNoneMatch = clientRequest.headers['if-none-match'];
    const ifModifiedSince = clientRequest.headers['if-modified-since'];

    if (ifNoneMatch === finalResponseHeaders['Etag'] ||
        (ifModifiedSince && Date.parse(ifModifiedSince) >= lastModifiedTime)) {
        // Resource not modified, send 304 Not Modified.
        console.log(`Conditional GET: 304 Not Modified for ${clientRequest.url}`);
        completionCallback(304, finalResponseHeaders);
    } else if (clientRequest.method === 'HEAD') {
        // For HEAD requests, send 200 with headers but no body.
        completionCallback(200, finalResponseHeaders);
    } else {
        // Determine Content-Type and Content-Length for actual content.
        finalResponseHeaders['Content-Length'] = fileStats.size;
        finalResponseHeaders['Content-Type'] = contentTypeMapper.contentTypes[pathUtils.extname(filePathsToStream[0]).slice(1)] ||
                                               'application/octet-stream';

        // Merge any additional headers provided for this specific response.
        for (const headerName in additionalHeaders) {
            if (Object.prototype.hasOwnProperty.call(additionalHeaders, headerName)) {
                finalResponseHeaders[headerName] = additionalHeaders[headerName];
            }
        }

        // Write headers to the response.
        if (!serverResponse.headersSent) {
            serverResponse.writeHead(statusCode, finalResponseHeaders);
        }

        // Check if file is in global cache and is still fresh (not older than disk version).
        const cachedEntry = globalFileCache.get(cacheKey);
        if (this.configSettings.cache && cachedEntry && cachedEntry.fileStats.mtime >= fileStats.mtime) {
            console.log(`Serving from in-memory cache: ${cacheKey}`);
            serverResponse.end(cachedEntry.buffer);
            completionCallback(statusCode, finalResponseHeaders);
        } else {
            // Stream the file content from disk.
            this.streamFileContent(directoryContextPath, filePathsToStream, Buffer.alloc(fileStats.size), serverResponse, (operationError, streamedBuffer) => {
                if (operationError) {
                    console.error(`Error streaming content for ${cacheKey}: ${operationError.message}`);
                    return completionCallback(500, { 'Content-Type': 'text/plain' }, `Internal Server Error: Could not stream file.`);
                }
                // Cache the streamed content if caching is enabled and a buffer was returned.
                if (this.configSettings.cache && streamedBuffer) {
                    globalFileCache.set(cacheKey, {
                        fileStats: fileStats,
                        buffer: streamedBuffer,
                        timestamp: Date.now()
                    });
                }
                completionCallback(statusCode, finalResponseHeaders);
            });
        }
    }
};

/**
 * Streams file content to the HTTP response. Can handle concatenating multiple files into a single buffer.
 * @param {string|null} directoryContextPath - Base path for resolving relative files in `filePathsToStream`.
 * @param {string[]} filePathsToStream - Array of file paths to stream.
 * @param {Buffer} outputBuffer - A pre-allocated buffer to hold file contents before sending.
 * @param {object} serverResponse - The HTTP response object.
 * @param {function} streamCompletionCallback - Callback when streaming is complete or errors occur.
 */
StaticContentServer.prototype.streamFileContent = function (directoryContextPath, filePathsToStream, outputBuffer, serverResponse, streamCompletionCallback) {
    // Create a copy of the file paths array to avoid modifying the original during recursion.
    const remainingFiles = filePathsToStream.slice(0);
    let currentOffset = 0; // Tracks the current write position in the outputBuffer.

    // Inner recursive function to process files one by one.
    const processNextFile = () => {
        const currentFileName = remainingFiles.shift(); // Get the next file to process.

        if (currentFileName) {
            // Resolve the absolute path for the current file.
            const absoluteCurrentFilePath = currentFileName[0] === '/' ? currentFileName : pathUtils.join(directoryContextPath || '.', currentFileName);

            const fileStream = fileSystemOps.createReadStream(absoluteCurrentFilePath, {
                flags: 'r',
                mode: 0o666 // Octal literal for file permissions
            });

            fileStream.on('data', (dataChunk) => {
                // Copy each chunk into the pre-allocated outputBuffer.
                // This approach concatenates file contents into a single buffer in memory.
                dataChunk.copy(outputBuffer, currentOffset);
                currentOffset += dataChunk.length;
            });

            fileStream.on('end', () => {
                // When a file finishes reading, move to the next file.
                processNextFile();
            });

            fileStream.on('error', (streamError) => {
                console.error(`Error reading file ${absoluteCurrentFilePath}: ${streamError.message}`);
                // If an error occurs during streaming, respond with 500 and end the response.
                if (!serverResponse.headersSent) {
                    serverResponse.writeHead(500, { 'Content-Type': 'text/plain' });
                }
                serverResponse.end(`Error streaming file: ${streamError.message}`);
                streamCompletionCallback(streamError); // Signal completion with error.
            });
            // Note: The original code had `pipe(res, { end: false })` here.
            // When combining into a single `outputBuffer` and calling `res.end(outputBuffer)` at the end,
            // direct piping during `data` events would lead to sending partial data.
            // We prioritize building the complete buffer then sending it.
        } else {
            // All files have been processed and copied into the outputBuffer.
            // Now, send the combined buffer. Use slice to send only the used portion.
            serverResponse.end(outputBuffer.slice(0, currentOffset));
            streamCompletionCallback(null, outputBuffer.slice(0, currentOffset)); // Signal successful completion.
        }
    };

    processNextFile(); // Start processing the first file.
};

// Export the main class for module consumption.
exports.StaticContentServer = StaticContentServer;
module.exports = exports.StaticContentServer;