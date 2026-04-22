/*
 * Buffered Binary Ajax 0.2.1 - Enhanced and reformatted version
 * Copyright (c) 2010 António Afonso, antonio.afonso gmail, http://www.aadsm.net/
 * MIT License [http://www.opensource.org/licenses/mit-license.php]
 *
 * This version includes extensive whitespace modifications and additional comments
 * while maintaining exact logical and structural equivalence to the original.
 *
 * Originally adapted from Binary Ajax 0.1.5 - preserving its core functionality.
 */

/*
 * This primary function initializes a BufferedBinaryFile object, facilitating
 * read operations on a remote file specified by a URL.
 *
 * @param {String} strUrl The URL pointing to the file resource.
 * @param {function(BufferedBinaryFile)} fncCallback Callback invoked upon successful
 *        preparation of the BufferedBinaryFile object.
 * @param {function()} fncError Error callback, triggered if file access fails
 *        (e.g., file not found, network issues).
 */
var BufferedBinaryAjax = function( strUrl, fncCallback, fncError ) {


    // sendRequest: A core utility function for making AJAX requests.
    // Handles range requests and different XHR event models.
    function sendRequest( strURL, fncCallback, fncError, aRange, bAcceptRanges, iFileSize, bAsync ) {

        var oHTTP = createRequest( );

        if ( oHTTP ) {

            var iDataOffset = 0;
            // If a range is specified but server doesn't accept ranges,
            // we assume the entire file is returned, starting from offset 0.
            if ( aRange && !bAcceptRanges ) {
                iDataOffset = aRange[0];
            }

            var iDataLen = 0;
            // Calculate expected data length if a range is used.
            if ( aRange ) {
                iDataLen = aRange[1] - aRange[0] + 1;
            }

            // Default 'bAsync' to true if not explicitly defined.
            if ( typeof bAsync === "undefined" ) bAsync = true;

            // Set up the callback mechanism for XHR.
            if ( fncCallback ) {

                // Modern browsers with 'onload' event.
                if ( typeof ( oHTTP.onload ) != "undefined" ) {

                    oHTTP.onload = function( ) {

                        // Check for successful HTTP status codes.
                        if ( oHTTP.status == "200" || oHTTP.status == "206" ) {
                            // Determine file size, either from passed parameter or Content-Length header.
                            oHTTP.fileSize = iFileSize || oHTTP.getResponseHeader("Content-Length");
                            fncCallback( oHTTP );
                        }
                        else {
                            // Invoke error callback if status indicates a problem.
                            if ( fncError ) {
                                fncError( { error: "xhr", "xhr": oHTTP } );
                            }
                        }
                        oHTTP = null; // Clean up the XHR object reference.
                    };

                    // Set up onerror for modern browsers.
                    if ( fncError ) {
                        oHTTP.onerror = function( ) {
                            fncError( { error: "xhr", "xhr": oHTTP } );
                            oHTTP = null;
                        };
                    }
                }
                // Older browsers using 'onreadystatechange'.
                else {
                    oHTTP.onreadystatechange = function( ) {
                        // Ready state 4 indicates request completion.
                        if ( oHTTP.readyState == 4 ) {
                            if ( oHTTP.status == "200" || oHTTP.status == "206" ) {
                                oHTTP.fileSize = iFileSize || oHTTP.getResponseHeader("Content-Length");
                                fncCallback( oHTTP );
                            }
                            else {
                                if ( fncError ) {
                                    fncError( { error: "xhr", "xhr": oHTTP } );
                                }
                            }
                            oHTTP = null;
                        }
                    };
                }
            }

            // Open the HTTP request.
            oHTTP.open( "GET", strURL, bAsync );

            // Override MIME type for binary data handling in some browsers.
            if ( oHTTP.overrideMimeType ) oHTTP.overrideMimeType( 'text/plain; charset=x-user-defined' );

            // Set Range header if supported and requested.
            if ( aRange && bAcceptRanges ) {
                oHTTP.setRequestHeader( "Range", "bytes=" + aRange[0] + "-" + aRange[1] );
            }

            // Prevent caching by setting an old If-Modified-Since header.
            oHTTP.setRequestHeader( "If-Modified-Since", "Sat, 01 Jan 1970 00:00:00 GMT" );

            // Send the request.
            oHTTP.send( null );
        }
        else {
            // If XHR object creation failed, call error handler.
            if ( fncError ) {
                fncError( { error: "Unable to create XHR object" } );
            }
        }
    }


    // createRequest: Factory function for XMLHttpRequest or ActiveXObject.
    function createRequest( ) {
        var oHTTP = null;
        if ( window.XMLHttpRequest ) {
            oHTTP = new XMLHttpRequest( );
        }
        else if ( window.ActiveXObject ) {
            oHTTP = new ActiveXObject( "Microsoft.XMLHTTP" );
        }
        return oHTTP;
    }


    // getHead: Performs a HEAD request to retrieve file metadata, primarily size.
    function getHead( strURL, fncCallback, fncError ) {
        var oHTTP = createRequest( );
        if ( oHTTP ) {
            if ( fncCallback ) {
                // Modern XHR 'onload' handling.
                if ( typeof ( oHTTP.onload ) != "undefined" ) {
                    oHTTP.onload = function( ) {
                        if ( oHTTP.status == "200" || oHTTP.status == "206" ) {
                            fncCallback( this ); // 'this' refers to oHTTP here.
                        }
                        else {
                            if ( fncError ) {
                                fncError( { error: "xhr", "xhr": oHTTP } );
                            }
                        }
                        oHTTP = null;
                    };
                    // Error handler for modern browsers.
                    if ( fncError ) {
                        oHTTP.onerror = function( ) {
                            fncError( { error: "xhr", "xhr": oHTTP } );
                            oHTTP = null;
                        };
                    }
                }
                // Older XHR 'onreadystatechange' handling.
                else {
                    oHTTP.onreadystatechange = function( ) {
                        if ( oHTTP.readyState == 4 ) {
                            if ( oHTTP.status == "200" || oHTTP.status == "206" ) {
                                fncCallback( this );
                            }
                            else {
                                if ( fncError ) {
                                    fncError( { error: "xhr", "xhr": oHTTP } );
                                }
                            }
                            oHTTP = null;
                        }
                    };
                }
            }
            // Open and send the HEAD request.
            oHTTP.open( "HEAD", strURL, true );
            oHTTP.send( null );
        }
        else {
            if ( fncError ) {
                fncError( { error: "Unable to create XHR object" } );
            }
        }
    }


    /*
     * @class BufferedBinaryFile
     * @description Provides an interface for reading a remote file by downloading
     *              chunks on demand, optimizing for network efficiency.
     *
     * Creates a new BufferedBinaryFile instance that intelligently fetches
     * portions of the file.
     *
     * @param {string} strUrl The URL of the file to be read.
     * @param {number} iLength The total size of the file in bytes.
     * @param {number} [blockSize=2048] The size of each data chunk (block) to download.
     * @param {number} [blockRadius=0] Number of adjacent blocks to prefetch/postfetch
     *        around the requested block.
     *
     * @constructor
     * @augments BinaryFile
     */
    function BufferedBinaryFile( strUrl, iLength, blockSize, blockRadius ) {

        var undefined; // Explicitly define undefined for scope safety.
        var downloadedBytesCount = 0; // Tracks total bytes downloaded by this instance.
        // Initialize a dummy BinaryFile object to inherit its methods.
        var binaryFile = new BinaryFile( "", 0, iLength );
        var blocks = [ ]; // Array to store downloaded data blocks.

        // Set default values for blockSize and blockRadius.
        blockSize = blockSize || 1024 * 2; // Default to 2KB blocks.
        blockRadius = ( typeof blockRadius === "undefined" ) ? 0 : blockRadius; // Default to no radius.
        // Calculate total number of blocks based on file size and block size.
        var blockTotal = ~~( ( iLength - 1 ) / blockSize ) + 1;


        // Helper function to determine the range of blocks corresponding to a byte range.
        function getBlockRangeForByteRange( range ) {

            // Calculate starting and ending block indices, adjusted by blockRadius.
            var blockStart = ~~( range[0] / blockSize ) - blockRadius;
            var blockEnd = ~~( range[1] / blockSize ) + 1 + blockRadius;

            // Ensure block indices stay within valid bounds.
            if ( blockStart < 0 ) blockStart = 0;
            if ( blockEnd >= blockTotal ) blockEnd = blockTotal - 1;

            return [ blockStart, blockEnd ];
        }


        // getBlockAtOffset: Retrieves the data block containing a specific byte offset.
        // Triggers download if the block is not yet available.
        function getBlockAtOffset( offset ) {
            var blockRange = getBlockRangeForByteRange( [ offset, offset ] );
            waitForBlocks( blockRange ); // Ensure the required blocks are downloaded.
            return blocks[ ~~( offset / blockSize ) ]; // Return the block.
        }


        /*
         * waitForBlocks: Ensures a specified range of blocks is downloaded.
         *
         * @param {Array} blockRange A two-element array [startBlockIndex, endBlockIndex].
         * @param {?function()} callback An optional callback function. If provided,
         *        the operation becomes asynchronous, and the callback is invoked
         *        once blocks are loaded. Otherwise, it blocks execution.
         */
        function waitForBlocks( blockRange, callback ) {

            // Optimization: Filter out blocks that are already downloaded.
            while ( blocks[ blockRange[0] ] ) {
                blockRange[0]++;
                if ( blockRange[0] > blockRange[1] ) return callback ? callback( ) : undefined;
            }
            while ( blocks[ blockRange[1] ] ) {
                blockRange[1]--;
                if ( blockRange[0] > blockRange[1] ) return callback ? callback( ) : undefined;
            }

            // Determine the byte range for the actual HTTP request.
            var range = [ blockRange[0] * blockSize, ( blockRange[1] + 1 ) * blockSize - 1 ];

            //console.log("Requesting byte range: " + range[0] + " to " +  range[1]);

            sendRequest(
                strUrl,
                function( http ) {

                    var size = parseInt( http.getResponseHeader( "Content-Length" ), 10 );
                    // If the server didn't support Range headers and sent the whole file,
                    // update our internal state to reflect that all blocks are now available.
                    if ( size == iLength ) {
                        blockRange[0] = 0;
                        blockRange[1] = blockTotal - 1;
                        range[0] = 0;
                        range[1] = iLength - 1;
                    }

                    // Create a block object to store the downloaded data and its offset.
                    var block = {
                        data: http.responseBody || http.responseText, // Handle IE's responseBody.
                        offset: range[0]
                    };

                    // Populate the 'blocks' array with the newly downloaded block.
                    // All blocks within the requested blockRange will reference this same data.
                    for ( var i = blockRange[0]; i <= blockRange[1]; i++ ) {
                        blocks[i] = block;
                    }

                    downloadedBytesCount += range[1] - range[0] + 1; // Update download counter.

                    if ( callback ) callback( ); // Invoke callback if provided.
                },
                fncError, // Pass through the global error handler.
                range, // The byte range to request.
                "bytes", // Indicate that byte ranges are accepted.
                undefined, // File size is not explicitly passed here, let XHR determine it.
                !!callback // Asynchronous if a callback is provided.
            );
        }


        // Mixin all methods from the base BinaryFile object.
        // This avoids direct inheritance issues when the constructor needs specific parameters.
        for ( var key in binaryFile ) {
            if ( binaryFile.hasOwnProperty( key ) &&
                typeof binaryFile[key] === "function" ) {
                this[key] = binaryFile[key];
            }
        }


        /*
         * @override
         * Gets a single byte at the specified offset.
         * This method will ensure the necessary block is downloaded.
         *
         * @param {number} iOffset The byte offset to retrieve.
         * @returns {number|string} The byte value (0-255) or an empty string if data is unavailable.
         */
        this.getByteAt = function( iOffset ) {
            var block = getBlockAtOffset( iOffset ); // Get the block containing the offset.
            if ( block && typeof block.data == "string" ) {
                // For string data, use charCodeAt.
                return block.data.charCodeAt( iOffset - block.offset ) & 0xFF;
            }
            else if ( block && typeof block.data == "unknown" ) {
                // Special handling for IE's binary data type.
                return IEBinary_getByteAt( block.data, iOffset - block.offset );
            }
            else {
                return ""; // Return empty string if block data is not available.
            }
        };


        /*
         * getDownloadedBytesCount: Returns the cumulative count of bytes downloaded
         *                          by this BufferedBinaryFile instance.
         *
         * @returns {number} The total number of bytes fetched from the server.
         */
        this.getDownloadedBytesCount = function( ) {
            return downloadedBytesCount;
        };


        /*
         * loadRange: Initiates the download of a specific byte range.
         *            Useful for preloading data or ensuring a section is available.
         *
         * @param {Array} range A two-element array: [startByte, endByte].
         *        Example: [2, 5] downloads bytes 2, 3, 4, and 5.
         * @param {?function()} callback An optional function to invoke once
         *        the specified range of blocks has been downloaded.
         */
        this.loadRange = function( range, callback ) {
            var blockRange = getBlockRangeForByteRange( range ); // Convert byte range to block range.
            waitForBlocks( blockRange, callback ); // Ensure these blocks are downloaded.
        };
    }


    // init: The initialization sequence for BufferedBinaryAjax.
    function init( ) {
        // First, perform a HEAD request to get the file's total size.
        getHead(
            strUrl,
            function( oHTTP ) {
                // Parse Content-Length header to get file size. Default to -1 if not found.
                var iLength = parseInt( oHTTP.getResponseHeader( "Content-Length" ), 10 ) || -1;
                // Once size is known, create and return the BufferedBinaryFile instance.
                fncCallback( new BufferedBinaryFile( strUrl, iLength ) );
            },
            fncError // Pass the error callback.
        );
    }


    // Begin the initialization process immediately.
    init( );
};