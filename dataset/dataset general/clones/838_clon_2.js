var fileAccessMod = require('fs'),
    legacyUtilMod = require('sys'),
    eventEmitterMod = require('events'),
    dataBufferMod = require('buffer'),
    httpClientMod = require('http'),
    webAddressMod = require('url'),
    filePathMod = require('path');

// Application version information
this.appVer = [0, 5, 7];

var contentTypeMapper = require('./node-static/mime');
var helperFunctions = require('./node-static/util');

var componentSignature = 'node-static/' + this.appVer.join('.');

/*
 *  In-memory data store for file content.
 *  Stores buffered files for quick retrieval.
 */
this.fileCache = {};

// Stores parsed directory index files (e.g., index.json).
this.directoryIndexCache = {};

this.ContentProvider = function (baseDirectory, configuration) {
    // If the first argument is an object, assume it's the configuration.
    if (baseDirectory && (typeof(baseDirectory) === 'object')) {
        configuration = baseDirectory;
        baseDirectory = null;
    }

    this.baseDirectory    = filePathMod.normalize(baseDirectory || '.');
    this.configuration = configuration || {};
    this.cacheDuration   = 3600;

    this.standardHeaders  = {};
    this.configuration.customHeaders = this.configuration.customHeaders || {};

    // Evaluate caching options.
    if ('cache' in this.configuration) {
        if (typeof(this.configuration.cache) === 'number') {
            this.cacheDuration = this.configuration.cache;
        } else if (! this.configuration.cache) {
            this.cacheDuration = false;
        }
    }

    // Set Cache-Control header if caching is enabled.
    if (this.cacheDuration !== false) {
        this.standardHeaders['Cache-Control'] = 'max-age=' + this.cacheDuration;
    }
    this.standardHeaders['Server'] = componentSignature;

    // Merge custom headers with standard headers, giving precedence to custom ones.
    for (var headerKey in this.standardHeaders) {
        this.configuration.customHeaders[headerKey] = this.configuration.customHeaders[headerKey] ||
                                                      this.standardHeaders[headerKey];
    }
};

this.ContentProvider.prototype.processDirectory = function (resourcePath, requestObject, responseObject, completionCallback) {
    var defaultPageIndex = filePathMod.join(resourcePath, 'index.html'),
        selfInstance = this;

    fileAccessMod.stat(defaultPageIndex, function (errorOccurred, fileStats) {
        if (!errorOccurred) {
            selfInstance.sendResponse(null, 200, {}, [defaultPageIndex], fileStats, requestObject, responseObject, completionCallback);
        } else {
            // Check if directory content is already indexed in cache.
            if (resourcePath in module.exports.fileCache) {
                initiateFileStreaming(module.exports.directoryIndexCache[resourcePath].files);
            } else {
                // Read the directory's index.json file.
                fileAccessMod.readFile(filePathMod.join(resourcePath, 'index.json'), function (readError, fileContents) {
                    if (readError) {
                        return completionCallback(404, {});
                    }
                    var parsedIndex = JSON.parse(fileContents);
                    module.exports.directoryIndexCache[resourcePath] = parsedIndex;
                    initiateFileStreaming(parsedIndex.files);
                });
            }
        }
    });

    // Helper function to stream a list of files from the directory.
    function initiateFileStreaming(fileList) {
        helperFunctions.getMultipleStats(resourcePath, fileList, function (statError, aggregateStats) {
            selfInstance.sendResponse(resourcePath, 200, {}, fileList, aggregateStats, requestObject, responseObject, completionCallback);
        });
    }
};

this.ContentProvider.prototype.deliverFile = function (assetPath, statusCode, responseHeaders, requestObject, responseObject) {
    var selfRef = this;
    var operationPromise = new eventEmitterMod.EventEmitter(); // Renamed EventEmitter.

    assetPath = this.resolvePath(assetPath);

    fileAccessMod.stat(assetPath, function (errDetails, fileProperties) {
        if (errDetails) {
            return operationPromise.emit('error', errDetails);
        }
        selfRef.sendResponse(null, statusCode, responseHeaders, [assetPath], fileProperties, requestObject, responseObject, function (finalStatus, finalHeaders) {
            selfRef.finalizeRequest(finalStatus, finalHeaders, requestObject, responseObject, operationPromise);
        });
    });
    return operationPromise;
};

this.ContentProvider.prototype.finalizeRequest = function (completionStatus, responseMetadata, incomingRequest, outgoingResponse, asyncOperation, optionalCallback) {
    var operationOutcome = {
        outcomeStatus:  completionStatus,
        outcomeHeaders: responseMetadata,
        statusMessage: httpClientMod.STATUS_CODES[completionStatus]
    };

    responseMetadata['Server'] = componentSignature;

    if (!completionStatus || completionStatus >= 400) {
        if (optionalCallback) {
            optionalCallback(operationOutcome);
        } else {
            if (asyncOperation.listeners('error').length > 0) {
                asyncOperation.emit('error', operationOutcome);
            }
            outgoingResponse.writeHead(completionStatus, responseMetadata);
            outgoingResponse.end();
        }
    } else {
        // If streaming, the response ending is handled by the stream method.
        if (completionStatus !== 200 || incomingRequest.method !== 'GET') {
            outgoingResponse.writeHead(completionStatus, responseMetadata);
            outgoingResponse.end();
        }
        optionalCallback && optionalCallback(null, operationOutcome);
        asyncOperation.emit('success', operationOutcome);
    }
};

this.ContentProvider.prototype.processResourcePath = function (requestedResource, httpStatus, responseHeaders, clientRequest, serverResponse, completionHandler) {
    var instanceRef = this,
        actionPromise = new eventEmitterMod.EventEmitter();

    requestedResource = this.resolvePath(requestedResource);

    // Only allow GET and HEAD methods for resource access.
    if (clientRequest.method !== 'GET' && clientRequest.method !== 'HEAD') {
        completionHandler(405, { 'Allow': 'GET, HEAD' });
        return actionPromise;
    }

    // Verify resource path is within the allowed base directory.
    if (new RegExp('^' + instanceRef.baseDirectory).test(requestedResource)) {
        fileAccessMod.stat(requestedResource, function (errorStatus, resourceStat) {
            if (errorStatus) {
                completionHandler(404, {}); // Resource not found.
            } else if (resourceStat.isFile()) {
                // Serve the individual file.
                instanceRef.sendResponse(null, httpStatus, responseHeaders, [requestedResource], resourceStat, clientRequest, serverResponse, completionHandler);
            } else if (resourceStat.isDirectory()) {
                // Serve the directory's content.
                instanceRef.processDirectory(requestedResource, clientRequest, serverResponse, completionHandler);
            } else {
                completionHandler(400, {}); // Unknown resource type.
            }
        });
    } else {
        // Accessing outside the base directory is forbidden.
        completionHandler(403, {});
    }
    return actionPromise;
};

this.ContentProvider.prototype.resolvePath = function (inputPath) {
    return filePathMod.normalize(filePathMod.join(this.baseDirectory, inputPath));
};

this.ContentProvider.prototype.handleIncomingRequest = function (clientReq, serverRes, completionCb) {
    var currentInstance = this,
        requestPromise = new eventEmitterMod.EventEmitter();

    var resourceIdentifier = webAddressMod.parse(clientReq.url).pathname;

    var finalProcessing = function (statusCode, headersToUse) {
        currentInstance.finalizeRequest(statusCode, headersToUse, clientReq, serverRes, requestPromise, completionCb);
    };

    process.nextTick(function () {
        currentInstance.processResourcePath(resourceIdentifier, 200, {}, clientReq, serverRes, finalProcessing)
            .on('success', function (opResult) {
                requestPromise.emit('success', opResult);
            })
            .on('error', function (errorObject) {
                requestPromise.emit('error', errorObject);
            });
    });
    if (! completionCb) {
        return requestPromise;
    }
};

this.ContentProvider.prototype.sendResponse = function (targetPath, httpStatus, additionalHeaders, filePaths, fileStatistics, requestIn, responseOut, finalCallback) {
    var modificationTime   = Date.parse(fileStatistics.mtime),
        cacheKey           = targetPath || filePaths[0],
        generatedHeaders   = {};

    // Copy configured headers.
    for (var headerProp in this.configuration.customHeaders) {
        generatedHeaders[headerProp] = this.configuration.customHeaders[headerProp];
    }

    generatedHeaders['Etag']          = JSON.stringify([fileStatistics.ino, fileStatistics.size, modificationTime].join('-'));
    generatedHeaders['Date']          = new Date().toUTCString();
    generatedHeaders['Last-Modified'] = new Date(fileStatistics.mtime).toUTCString();

    // Implement Conditional GET logic.
    if (requestIn.headers['if-none-match'] === generatedHeaders['Etag'] ||
        Date.parse(requestIn.headers['if-modified-since']) >= modificationTime) {
        finalCallback(304, generatedHeaders);
    } else if (requestIn.method === 'HEAD') {
        finalCallback(200, generatedHeaders);
    } else {
        generatedHeaders['Content-Length'] = fileStatistics.size;
        generatedHeaders['Content-Type']   = contentTypeMapper.mimeTypeMap[filePathMod.extensionName(filePaths[0]).slice(1)] ||
                                           'application/octet-stream';

        // Integrate any additional headers provided for this response.
        for (var extraHeader in additionalHeaders) {
            generatedHeaders[extraHeader] = additionalHeaders[extraHeader];
        }

        responseOut.writeHead(httpStatus, generatedHeaders);

        // Check if the file is in cache and still valid.
        if (this.cacheDuration && (cacheKey in module.exports.fileCache) &&
            module.exports.fileCache[cacheKey].properties.mtime >= fileStatistics.mtime) {
            responseOut.end(module.exports.fileCache[cacheKey].dataBuffer);
            finalCallback(httpStatus, generatedHeaders);
        } else {
            // Stream the file content and update the cache.
            this.streamFileContent(targetPath, filePaths, new dataBufferMod.Buffer(fileStatistics.size), responseOut, function (streamError, bufferedContent) {
                if (streamError) {
                    return finalCallback(500, {});
                }
                module.exports.fileCache[cacheKey] = {
                    properties:    fileStatistics,
                    dataBuffer:    bufferedContent,
                    cacheTimestamp: Date.now()
                };
                finalCallback(httpStatus, generatedHeaders);
            });
        }
    }
};

this.ContentProvider.prototype.streamFileContent = function (basePath, sourceFiles, outputBuffer, streamResponse, streamCompletion) {
    // Recursive function to handle streaming multiple files sequentially.
    (function processNextFile(remainingFiles, bufferOffset) {
        var currentFile = remainingFiles.shift();

        if (currentFile) {
            // Adjust file path for absolute or relative references.
            currentFile = currentFile[0] === '/' ? currentFile : filePathMod.join(basePath || '.', currentFile);

            // Create a read stream for the file.
            fileAccessMod.createReadStream(currentFile, {
                flags: 'r',
                mode: 0o666 // Standard read/write permissions for owner/group/others.
            })
            .on('data', function (dataChunk) {
                dataChunk.copy(outputBuffer, bufferOffset);
                bufferOffset += dataChunk.length;
            })
            .on('close', function () {
                processNextFile(remainingFiles, bufferOffset);
            })
            .on('error', function (streamError) {
                streamCompletion(streamError);
                console.error(streamError);
            })
            .pipe(streamResponse, { end: false }); // Pipe data to the response, but don't close it yet.
        } else {
            streamResponse.end(); // All files have been streamed, end the HTTP response.
            streamCompletion(null, outputBuffer, bufferOffset);
        }
    })(sourceFiles.slice(0), 0); // Start the process with a copy of the file array and zero offset.
};