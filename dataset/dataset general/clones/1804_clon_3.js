/**
 * asset-delivery-engine for Node.js environments.
 *
 * This module facilitates efficient streaming of media assets,
 * supporting byte-range requests and extensible processing pipelines.
 *
 * Developed under a permissive open-source license.
 * Original author: O. Bastemur (2014) - Reimagined by a diligent engineer.
 */

const diskAccess = require('fs');
const formatDefinitions = require('./libs/exts'); // Assumes 'exts' exports an object or Map
const pathHandler = require('path');

let assetSizeResolver, cacheMechanism;
const contentHandlers = new Map(); // Using Map for clearer handler association
let handlerIdGenerator = 1000; // Starting ID generator from a different base

// Determine the appropriate caching strategy based on runtime environment.
// JXcore's shared memory store offers performance benefits across worker threads.
if (global.isJXC) { // Renamed from jxcore
    cacheMechanism = global.isJXC.store.shared; // Renamed from jxcore.store.shared
    assetSizeResolver = (resourcePath) => { // Renamed from fileInfo, path
        if (!resourcePath || typeof resourcePath !== 'string') {
            return null; // Added explicit check for path validity
        }

        if (!module.exports.disableResourceCaching && cacheMechanism.hasEntry(resourcePath)) { // Renamed exports.noCache to disableResourceCaching, shared.exists to hasEntry
            return Number(cacheMechanism.retrieve(resourcePath)); // Renamed shared.read to retrieve, added Number() for explicit conversion
        } else {
            if (!diskAccess.syncCheckExists(resourcePath)) { // Renamed fs.existsSync to syncCheckExists
                return null;
            }
            const fileStats = diskAccess.syncGetStats(resourcePath); // Renamed stat to fileStats, fs.statSync to syncGetStats
            cacheMechanism.store(resourcePath, fileStats.size); // Renamed shared.set to store, stat.size to fileStats.size
            return fileStats.size;
        }
    };
} else { // Standard Node.js environment
    cacheMechanism = new Map(); // Using a Map for local cache instead of plain object
    assetSizeResolver = (resourcePath) => {
        if (!resourcePath || typeof resourcePath !== 'string') {
            return null;
        }

        if (!module.exports.disableResourceCaching && cacheMechanism.has(resourcePath)) { // Renamed exports.noCache to disableResourceCaching, shared[path] to cacheMechanism.has
            return cacheMechanism.get(resourcePath); // Renamed shared[path] to cacheMechanism.get
        } else {
            if (!diskAccess.syncCheckExists(resourcePath)) {
                return null;
            }
            const fileStats = diskAccess.syncGetStats(resourcePath);
            cacheMechanism.set(resourcePath, fileStats.size); // Renamed shared[path] to cacheMechanism.set
            return fileStats.size;
        }
    };
}

// Configuration options for the module
module.exports.disableResourceCaching = false; // Renamed exports.noCache
module.exports.knownMediaFormats = formatDefinitions; // Renamed exports.mediaTypes

/**
 * Parses the HTTP 'Range' header from a client request.
 *
 * @param {object} clientRequest The incoming HTTP request object.
 * @param {number} totalAssetSize The total size of the asset in bytes.
 * @returns {object} An object containing startByte, endByte, and chunkSize, or a default full-range object.
 */
const parseByteRangeHeader = (clientRequest, totalAssetSize) => { // Renamed getRange, req, total
    const defaultRange = { startByte: 0, endByte: totalAssetSize - 1, chunkSize: totalAssetSize }; // Changed to object
    const rangeHeaderValue = clientRequest.headers.range; // Renamed rinfo

    if (!rangeHeaderValue) {
        return defaultRange; // Return full range if no range header
    }

    const bytesPrefixIndex = rangeHeaderValue.indexOf('bytes='); // Renamed rloc
    if (bytesPrefixIndex === -1) {
        return defaultRange;
    }

    const rangeParts = rangeHeaderValue.substring(bytesPrefixIndex + 6).split('-'); // Renamed ranges
    let start = Number.parseInt(rangeParts[0], 10); // Using Number.parseInt, radix specified
    let end = totalAssetSize - 1; // Default end to total size - 1

    if (Number.isNaN(start)) { // Added explicit NaN check instead of try-catch
        start = 0;
    }

    if (rangeParts[1] && rangeParts[1].length > 0) {
        const parsedEnd = Number.parseInt(rangeParts[1], 10);
        if (!Number.isNaN(parsedEnd)) {
            end = parsedEnd;
        }
    }

    // Ensure range boundaries are valid
    if (start >= totalAssetSize) {
        return defaultRange; // Invalid start, serve full content
    }
    if (end >= totalAssetSize) {
        end = totalAssetSize - 1; // Cap end at max size
    }
    if (start > end) { // If start somehow becomes greater than end, correct it
        start = 0;
        end = totalAssetSize - 1;
    }

    const chunkSize = (end - start) + 1; // Calculate chunk size

    return {
        startByte: start,
        endByte: end,
        chunkSize: chunkSize
    };
};

/**
 * Validates if a given value is a string.
 *
 * @param {*} value The value to check.
 * @returns {boolean} True if the value is a string, false otherwise.
 */
const checkIsString = (value) => { // Renamed isString, str
    // Simplified check: removed 'instanceof String' as it's rarely needed for primitives
    return typeof value === 'string';
};

/**
 * Streams an asset to the client, handling byte-range requests and custom processing.
 *
 * @param {object} incomingRequest The HTTP request object.
 * @param {object} serverResponse The HTTP response object.
 * @param {string} resourcePath The file path to the asset.
 * @param {string} contentType The MIME type of the asset (optional, will be inferred if not provided).
 * @param {function} completionCallback Optional callback to execute after streaming completes.
 * @returns {boolean} True if streaming initiated, false if an error occurred.
 */
module.exports.streamAssetToClient = (incomingRequest, serverResponse, resourcePath, contentType, completionCallback) => { // Renamed exports.pipe, req, res, path, type, opt_cb

    // Input validation: resourcePath must be a string.
    if (!checkIsString(resourcePath)) {
        console.error('Asset streaming error: resourcePath must be a string.');
        serverResponse.writeHead(400, { 'Content-Type': 'text/plain' });
        serverResponse.end('Bad Request: Resource path must be a string.');
        return false;
    }

    const assetSize = assetSizeResolver(resourcePath); // Renamed total, fileInfo(path)

    if (assetSize === null) { // Changed total == null
        serverResponse.writeHead(404, { 'Content-Type': 'text/plain' });
        serverResponse.end(`Error 404: Resource '${resourcePath}' not found on server.`); // More descriptive message
        return false;
    }

    const byteSegmentDetails = parseByteRangeHeader(incomingRequest, assetSize); // Renamed range, getRange
    const fileExtension = pathHandler.extname(resourcePath); // Renamed ext, pathModule.extname(path)

    let finalContentType = contentType; // Renamed type
    if (!finalContentType) {
        // Attempt to infer content type from file extension
        if (fileExtension && fileExtension.length > 1) { // Check for actual extension presence
            finalContentType = formatDefinitions[fileExtension]; // Renamed exts[ext]
        }
    }

    // Fallback content type if none found or inferred
    if (!finalContentType) {
        console.warn(`Warning: Could not determine media format for '${resourcePath}'. Defaulting to application/octet-stream.`);
        finalContentType = 'application/octet-stream';
        // Decide if we want to send a warning to the client or just log it.
        // For now, just log and proceed with default.
    }

    const headers = {
        'Accept-Ranges': 'bytes',
        'Access-Control-Allow-Origin': incomingRequest.headers.origin || '*',
        'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS', // Added HEAD
        'Access-Control-Allow-Headers': 'Range, Content-Type, Accept', // More specific headers
        'Cache-Control': 'no-cache, no-store, must-revalidate' // Added caching headers
    };

    const extensionHandlers = contentHandlers.get(fileExtension); // Renamed _exts, pipe_extensions[ext]

    if (!extensionHandlers || extensionHandlers.length === 0) { // Check if no custom handlers registered
        const isPartialContent = byteSegmentDetails.chunkSize < assetSize; // New helper variable

        if (isPartialContent) {
            Object.assign(headers, {
                'Content-Range': `bytes ${byteSegmentDetails.startByte}-${byteSegmentDetails.endByte}/${assetSize}`,
                'Content-Length': byteSegmentDetails.chunkSize,
                'Content-Type': finalContentType
            });
            serverResponse.writeHead(206, headers); // Partial Content
        } else {
            Object.assign(headers, {
                'Content-Length': assetSize, // Use total asset size for full content
                'Content-Type': finalContentType
            });
            serverResponse.writeHead(200, headers); // OK
        }

        const contentStream = diskAccess.createReadStream(resourcePath, {
            start: byteSegmentDetails.startByte,
            end: byteSegmentDetails.endByte
        }); // Renamed file, fs.createReadStream

        contentStream.pipe(serverResponse);
        contentStream.once('end', () => { // Changed from 'close' to 'end' for stream completion
            if (!serverResponse.headersSent) { // Ensure headers haven't been sent by another process
                 serverResponse.end(); // Simplified res.end(0)
            }
            if (typeof completionCallback === 'function') { // Guard for optional callback
                completionCallback(resourcePath);
            }
        });
        contentStream.once('error', (err) => { // Added error handling for the stream
            console.error(`Error streaming asset '${resourcePath}':`, err);
            if (!serverResponse.headersSent) {
                serverResponse.writeHead(500, { 'Content-Type': 'text/plain' });
                serverResponse.end('Internal Server Error while streaming.');
            }
            if (typeof completionCallback === 'function') {
                completionCallback(resourcePath, err); // Pass error to callback
            }
        });

    } else {
        // Custom handlers exist for this file extension
        Object.assign(headers, {
            'Content-Type': finalContentType,
            'Content-Length': assetSize // Assuming handlers might not support byte-range out-of-the-box
        });
        serverResponse.writeHead(200, headers); // Always 200 for custom handlers, as range might be handled internally

        const initialStream = diskAccess.createReadStream(resourcePath, {
            start: byteSegmentDetails.startByte,
            end: byteSegmentDetails.endByte
        });

        // Pipeline the stream through custom handlers
        let currentStream = initialStream;
        extensionHandlers.forEach(processor => { // Iterating over Map values
            // Each processor should return a new stream or modify the existing one
            // This is a simplification; actual processors might pipe to writable streams, etc.
            // For this clone, we'll assume the processor takes the stream and modifies the response directly.
            // Original code just passes file, req, res, cb to each processor.
            // This implies the processors themselves are responsible for piping.
            processor(currentStream, incomingRequest, serverResponse, () => {
                // This callback indicates the processor has finished its part.
                // The final processor in the chain should call res.end()
                if (!serverResponse.finished) { // Check if response is not yet finished
                    serverResponse.end();
                }
            });
        });
    }

    return true;
};

/**
 * Registers a custom stream processor for a specific file extension.
 *
 * @param {string} fileExt The file extension (e.g., '.mp4').
 * @param {function} processorModule The function to be called for processing streams of this extension.
 */
module.exports.registerStreamProcessor = (fileExt, processorModule) => { // Renamed exports.on, ext, m
    if (!checkIsString(fileExt) || !fileExt.startsWith('.')) {
        console.warn('Invalid file extension provided for stream processor registration.');
        return;
    }
    if (typeof processorModule !== 'function') {
        console.warn('Invalid processor module provided; must be a function.');
        return;
    }

    let handlersForExt = contentHandlers.get(fileExt);
    if (!handlersForExt) {
        handlersForExt = [];
        contentHandlers.set(fileExt, handlersForExt);
    }

    processorModule.uniqueId = handlerIdGenerator++; // Renamed m.pipe_extension_id
    processorModule.targetExtension = fileExt; // Renamed m.pipe_extension

    handlersForExt.push(processorModule);
};

/**
 * De-registers a previously registered stream processor.
 *
 * @param {object} processorInstance The processor module object to remove,
 *                                  which must contain uniqueId and targetExtension properties.
 */
module.exports.deregisterStreamProcessor = (processorInstance) => { // Renamed exports.removeEvent, method
    if (!processorInstance || !processorInstance.targetExtension || !processorInstance.uniqueId) { // Renamed properties
        console.warn('Cannot deregister stream processor: missing required identification properties (targetExtension, uniqueId).');
        return;
    }

    const currentHandlersForExt = contentHandlers.get(processorInstance.targetExtension); // Renamed exts
    if (currentHandlersForExt && currentHandlersForExt.length > 0) {
        // Filter out the specific processor instance
        const updatedHandlers = currentHandlersForExt.filter(
            handler => handler.uniqueId !== processorInstance.uniqueId
        );
        contentHandlers.set(processorInstance.targetExtension, updatedHandlers);
        console.log(`Stream processor for ${processorInstance.targetExtension} (ID: ${processorInstance.uniqueId}) deregistered.`);
    } else {
        console.log(`No stream processors found for extension '${processorInstance.targetExtension}' to deregister.`);
    }
};