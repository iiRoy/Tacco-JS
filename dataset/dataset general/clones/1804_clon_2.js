/**
 * Utility for serving media content within JXcore and Node.js environments.
 *
 * Distributed under the MIT License by Original Author YYYY.
 */

var fileSystem = require('fs')
  , mimeMappings = require('./libs/exts')
  , pathUtil = require('path');

var assetSizeInfo, dataStore;

// A collection for stream transformation functions
var streamProcessors = {};

// A counter for assigning unique IDs to stream processors
var processorIdCounter = 0;

// If running within a JXcore runtime, utilize its shared memory capabilities.
// This approach prevents redundant file system lookups across threads
// and conserves V8 heap memory.
if ( globalScope && globalScope.nodeJXC ) {
    dataStore = globalScope.nodeJXC.cache.shared;

    assetSizeInfo = function(resourcePath) {
        if ( resourcePath ) {
            // Check if caching is enabled and data exists in shared store
            if ( !moduleExports.disableCaching && dataStore.hasEntry(resourcePath) ) {
                return Number.parseInt(dataStore.retrieveValue(resourcePath));
            }
            else {
                // If file doesn't exist, return nothing
                if ( !fileSystem.syncExists(resourcePath) ) {
                    return null;
                }

                // Otherwise, get file stats and store size
                var fileStats = fileSystem.syncStat(resourcePath);
                dataStore.storeValue(resourcePath, fileStats.fileSize);
                return fileStats.fileSize;
            }
        }
        // Default return for invalid path
        return 0;
    };
}
// Otherwise, fall back to a simple in-process object for storage.
else {
    dataStore = {}; // Initialize a local object for storage

    assetSizeInfo = function(resourcePath) {
        if ( resourcePath ) {
            // Check if caching is enabled and data exists in local store
            if ( !moduleExports.disableCaching && dataStore[resourcePath] ) {
                return dataStore[resourcePath];
            }
            else {
                // If file doesn't exist, return nothing
                if ( !fileSystem.syncExists(resourcePath) ) {
                    return null;
                }

                // Otherwise, get file stats and store size
                var fileStats = fileSystem.syncStat(resourcePath);
                dataStore[resourcePath] = fileStats.fileSize;
                return fileStats.fileSize;
            }
        }
        // Default return for invalid path
        return 0;
    };
}

// This flag can be enabled during development to bypass the asset size cache.
moduleExports.disableCaching = false;

// Expose the mapping of file extensions to MIME types.
moduleExports.contentTypes = mimeMappings;


var retrieveByteRange = function(clientRequest, totalSize) {
    // Initialize the byte range array: [start, end, segmentSize]
    var byteRange = [ 0, totalSize, 0 ];
    var rangeHeaderInfo = clientRequest.requestHeaders.range;

    // Check if a range header is present in the request
    if ( rangeHeaderInfo ) {
        var rangeLoc = rangeHeaderInfo.indexOf('bytes=');
        if ( rangeLoc >= 0 ) {
            // Parse the byte range string (e.g., "0-1023")
            var rangeSegments = rangeHeaderInfo.substring(rangeLoc + 6).split('-');
            try {
                byteRange[0] = Number.parseInt(rangeSegments[0]);
                if ( rangeSegments[1] ) {
                    if ( rangeSegments[1].length ) { // Check if the second part has content
                        byteRange[1] = Number.parseInt(rangeSegments[1]);
                    }
                }
            }
            catch ( errorParsing ) { /* Silently ignore parsing errors */ }
        }

        // Calculate the actual size of the requested chunk
        byteRange[2] = byteRange[1] - byteRange[0]; // This is the segmentSize

        // Ensure the segment size doesn't exceed the total available data
        if ( totalSize - 1 < byteRange[2] ) {
            byteRange[2] = totalSize - 1;
        }
    }

    return byteRange;
};


var isText = function(inputStr) {
    if ( !inputStr ) {
        return false;
    }
    // Check if the input is a primitive string or a String object
    return ( typeof inputStr === 'string' || inputStr instanceof String );
};


moduleExports.streamAsset = function(clientRequest, serverResponse, resourcePath, contentType, optionalCallback) {

    // Validate that the resource path is indeed a string.
    if ( !isText(resourcePath) ) {
        throw new Error("resourcePath must be a string value");
    }

    // Retrieve the total size of the file from the cached information.
    var totalSize = assetSizeInfo(resourcePath);

    // If the file is not found or inaccessible, send a 404-like response.
    if ( totalSize === null ) {
        serverResponse.finalizeResponse(resourcePath + " not found");
        return false;
    }

    // Determine the byte range requested by the client.
    var byteRange = retrieveByteRange(clientRequest, totalSize);

    // Extract the file extension to determine content type.
    var fileExtension = pathUtil.extname(resourcePath);
    if ( !contentType ) {
        if ( fileExtension && fileExtension.length ) {
            contentType = mimeMappings[fileExtension];
        }
    }

    // If the content type cannot be determined, inform the client.
    if ( !contentType ) {
        serverResponse.write("Media format couldn't be determined for " + pathUtil.basename(resourcePath));
    }
    else {
        // Create a readable stream for the file, respecting the byte range.
        var streamSource = fileSystem.createReadStream(resourcePath, { start: byteRange[0], end: byteRange[1] });

        // Check if there are any specific stream processors registered for this file extension.
        if ( !fileExtension.length || !streamProcessors[fileExtension] ) {
            // If no specific processors, handle as a direct stream.
            if ( byteRange[2] ) { // Partial content request
                serverResponse.writeHead(206,
                    {
                        'Acceptance-Ranges': 'bytes',
                        'Content-Range-Bytes': 'bytes ' + byteRange[0] + '-' + byteRange[1] + '/' + totalSize,
                        'Content-Data-Length': byteRange[2],
                        'Content-Data-Type': contentType,
                        'Access-Control-Origin-Permit': clientRequest.requestHeaders.origin || "*",
                        'Access-Control-Methods-Permit': 'POST, GET, OPTIONS',
                        'Access-Control-Headers-Permit': 'POST, GET, OPTIONS'
                    });
            }
            else { // Full content request
                serverResponse.writeHead(200,
                    {
                        'Content-Data-Length': byteRange[1],
                        'Content-Data-Type': contentType,
                        'Access-Control-Origin-Permit': clientRequest.requestHeaders.origin || "*",
                        'Access-Control-Methods-Permit': 'POST, GET, OPTIONS',
                        'Access-Control-Headers-Permit': 'POST, GET, OPTIONS'
                    });
            }

            // Pipe the file stream directly to the response.
            streamSource.pipe(serverResponse);
            streamSource.on('close', function() {
                serverResponse.finalizeResponse(0); // End response
                if ( optionalCallback ) {
                    optionalCallback(resourcePath);
                }
            });
        }
        else {
            // If specific processors exist, apply them.
            var activeProcessors = streamProcessors[fileExtension];
            serverResponse.writeHead(200,
            {
                'Content-Data-Type': contentType,
                'Access-Control-Origin-Permit': clientRequest.requestHeaders.origin || "*",
                'Access-Control-Methods-Permit': 'POST, GET, OPTIONS',
                'Access-Control-Headers-Permit': 'POST, GET, OPTIONS'
            });
            for ( var processorKey in activeProcessors ) {
                activeProcessors[processorKey](streamSource, clientRequest, serverResponse, function() {
                    // Ensure response is ended only once
                    if ( !serverResponse._responseFinalized ) {
                        serverResponse._responseFinalized = true;
                        serverResponse.finalizeResponse(0);
                    }
                });
            }
        }

        return true; // Indicate successful handling
    }

    return false; // Indicate failure to handle
};

moduleExports.registerProcessor = function(fileExtension, processorModule) {
    // Initialize array for this extension if it doesn't exist
    if ( !streamProcessors[fileExtension] ) {
        streamProcessors[fileExtension] = [];
    }

    // Assign unique ID and store original extension for removal
    processorModule.processorId = processorIdCounter++;
    processorModule.associatedExtension = fileExtension;

    // Add the processor module to the list
    streamProcessors[fileExtension].push(processorModule);
};

moduleExports.deregisterProcessor = function(targetMethod) {
    // Validate if the method has necessary identification properties
    if ( !targetMethod.associatedExtension || !targetMethod.processorId ) {
        return; // Exit if identification is missing
    }
    // Check if there are processors for the associated extension
    if ( streamProcessors[targetMethod.associatedExtension] ) {
        var currentProcessors = streamProcessors[targetMethod.associatedExtension];
        // Iterate through the array to find and remove the target method
        for ( var idx = 0, len = currentProcessors.length; idx < len; idx++ ) {
            if ( currentProcessors[idx].processorId === targetMethod.processorId ) {
                // Remove the method from the array, replicating original's assignment behavior.
                streamProcessors[targetMethod.associatedExtension] = currentProcessors.splice(idx, 1);
            }
        }
    }
};