const fileSystemInterface = require('fs');
const mimeTypeMappings = require('./libs/exts');
const pathUtilities = require('path');

class ResourceSizeCache {
    constructor(activateSharedCache = false) {
        this.cacheStorage = activateSharedCache && global.jxcore ? global.jxcore.store.shared : new Map();
        this.bypassCache = false;
        this.isSharedMemoryActive = activateSharedCache && global.jxcore;
    }

    obtainResourceSize(resourcePath) {
        if (!resourcePath) {
            return 0;
        }

        if (!this.bypassCache) {
            if (this.isSharedMemoryActive) {
                if (this.cacheStorage.exists(resourcePath)) {
                    return parseInt(this.cacheStorage.read(resourcePath));
                }
            } else {
                const cachedSize = this.cacheStorage.get(resourcePath);
                if (cachedSize !== undefined) {
                    return cachedSize;
                }
            }
        }

        if (!fileSystemInterface.existsSync(resourcePath)) {
            return null;
        }

        const stats = fileSystemInterface.statSync(resourcePath);
        if (this.isSharedMemoryActive) {
            this.cacheStorage.set(resourcePath, stats.size.toString());
        } else {
            this.cacheStorage.set(resourcePath, stats.size);
        }
        return stats.size;
    }
}

const parseTransferBounds = (requestHeaders, totalResourceSize) => {
    let initialByteOffset = 0;
    let finalByteOffset = totalResourceSize - 1;
    let isPartialTransferRequest = false;

    const rangeHeaderValue = requestHeaders.range;
    if (rangeHeaderValue && typeof rangeHeaderValue === 'string') {
        const byteRangeMatch = rangeHeaderValue.match(/bytes=(\d+)-(\d*)/);
        if (byteRangeMatch) {
            isPartialTransferRequest = true;
            initialByteOffset = parseInt(byteRangeMatch[1], 10);
            if (byteRangeMatch[2]) {
                finalByteOffset = parseInt(byteRangeMatch[2], 10);
            }
        }
    }

    initialByteOffset = Math.max(0, initialByteOffset);
    finalByteOffset = Math.min(totalResourceSize - 1, finalByteOffset);

    if (initialByteOffset >= totalResourceSize) {
        initialByteOffset = 0;
        finalByteOffset = totalResourceSize - 1;
        isPartialTransferRequest = false;
    }
    
    const calculatedLength = (finalByteOffset - initialByteOffset) + 1;

    return {
        startPosition: initialByteOffset,
        endPosition: finalByteOffset,
        transferSegmentLength: calculatedLength,
        isPartialRequest: isPartialTransferRequest && (calculatedLength < totalResourceSize)
    };
};

const isInputTextual = (input) => typeof input === 'string' || input instanceof String;

let nextHandlerUniqueId = 0;

class ContentDeliveryAgent {
    constructor(activateSharedCache = false) {
        this.resourceDataStore = new ResourceSizeCache(activateSharedCache);
        this.extensionProcessors = new Map();
        this.resourceMimeMappings = mimeTypeMappings;
    }

    set bypassCaching(shouldBypass) {
        this.resourceDataStore.bypassCache = shouldBypass;
    }
    get bypassCaching() {
        return this.resourceDataStore.bypassCache;
    }

    attachProcessor(fileExtension, processorFunction) {
        if (!this.extensionProcessors.has(fileExtension)) {
            this.extensionProcessors.set(fileExtension, []);
        }
        const processorWrapper = {
            processor: processorFunction,
            identifier: nextHandlerUniqueId++
        };
        this.extensionProcessors.get(fileExtension).push(processorWrapper);
        processorFunction._processorIdentifier = processorWrapper.identifier;
        processorFunction._processorExtension = fileExtension;
    }

    detachProcessor(processorFunction) {
        const ext = processorFunction._processorExtension;
        const id = processorFunction._processorIdentifier;

        if (ext && id !== undefined && this.extensionProcessors.has(ext)) {
            let processorsForExt = this.extensionProcessors.get(ext);
            const initialCount = processorsForExt.length;
            processorsForExt = processorsForExt.filter(p => p.identifier !== id);
            this.extensionProcessors.set(ext, processorsForExt);
            return processorsForExt.length < initialCount;
        }
        return false;
    }

    transmitResource(clientRequest, serverResponse, resourcePath, explicitContentType, completionCallback) {
        if (!isInputTextual(resourcePath)) {
            throw new Error("Resource path parameter must be a string value.");
        }

        const totalResourceSize = this.resourceDataStore.obtainResourceSize(resourcePath);

        if (totalResourceSize === null) {
            serverResponse.end(`Resource '${resourcePath}' could not be located.`);
            return false;
        }

        const transferDetails = parseTransferBounds(clientRequest.headers, totalResourceSize);

        const resourceExtension = pathUtilities.extname(resourcePath);
        let effectiveContentType = explicitContentType;

        if (!effectiveContentType && resourceExtension) {
            effectiveContentType = this.resourceMimeMappings[resourceExtension];
        }

        if (!effectiveContentType) {
            serverResponse.write(`Content type mapping unavailable for '${pathUtilities.basename(resourcePath)}'.`);
            serverResponse.end();
            return false;
        }

        const standardHeaders = {
            'Access-Control-Allow-Origin': clientRequest.headers.origin || "*",
            'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
            'Access-Control-Allow-Headers': 'POST, GET, OPTIONS',
            'Content-Type': effectiveContentType
        };

        const activeExtensionProcessors = this.extensionProcessors.get(resourceExtension) || [];

        if (activeExtensionProcessors.length === 0 || !resourceExtension) {
            const streamConfiguration = {
                start: transferDetails.startPosition,
                end: transferDetails.endPosition
            };
            const dataStream = fileSystemInterface.createReadStream(resourcePath, streamConfiguration);

            if (transferDetails.isPartialRequest) {
                serverResponse.writeHead(206, {
                    ...standardHeaders,
                    'Accept-Ranges': 'bytes',
                    'Content-Range': `bytes ${transferDetails.startPosition}-${transferDetails.endPosition}/${totalResourceSize}`,
                    'Content-Length': transferDetails.transferSegmentLength
                });
            } else {
                serverResponse.writeHead(200, {
                    ...standardHeaders,
                    'Content-Length': totalResourceSize
                });
            }

            dataStream.pipe(serverResponse);
            dataStream.on('close', () => {
                serverResponse.end(0);
                if (completionCallback) {
                    completionCallback(resourcePath);
                }
            });
            dataStream.on('error', (err) => {
                if (!serverResponse.headersSent) {
                    serverResponse.writeHead(500, standardHeaders);
                }
                serverResponse.end("Internal Server Error");
                if (completionCallback) {
                    completionCallback(resourcePath, err);
                }
            });

        } else {
            serverResponse.writeHead(200, standardHeaders);
            
            const dataStream = fileSystemInterface.createReadStream(resourcePath, {
                start: transferDetails.startPosition,
                end: transferDetails.endPosition
            });

            let responseClosed = false;
            const completeResponseOnce = () => {
                if (!responseClosed) {
                    responseClosed = true;
                    serverResponse.end(0);
                    if (completionCallback) {
                        completionCallback(resourcePath);
                    }
                }
            };

            for (const processorEntry of activeExtensionProcessors) {
                processorEntry.processor(dataStream, clientRequest, serverResponse, completeResponseOnce);
            }
            dataStream.on('end', completeResponseOnce);
            dataStream.on('error', (err) => {
                if (!serverResponse.headersSent) {
                    serverResponse.writeHead(500, standardHeaders);
                }
                completeResponseOnce();
                if (completionCallback) {
                    completionCallback(resourcePath, err);
                }
            });
        }

        return true;
    }
}

const resourceDeliveryManager = new ContentDeliveryAgent(!!global.jxcore);

module.exports = {
    set disableResourceCaching(value) {
        resourceDeliveryManager.bypassCaching = value;
    },
    get disableResourceCaching() {
        return resourceDeliveryManager.bypassCaching;
    },

    resourceMimeTypes: resourceDeliveryManager.resourceMimeMappings,

    transmitResource: (...args) => resourceDeliveryManager.transmitResource(...args),

    attachProcessor: (...args) => resourceDeliveryManager.attachProcessor(...args),

    detachProcessor: (...args) => resourceDeliveryManager.detachProcessor(...args)
};