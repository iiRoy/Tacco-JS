/*
 * Mediaserver Module for JXcore and Node.js Environments
 *
 * This file provides media streaming capabilities.
 *
 * (c) 2014 Oguz Bastemur - Released under the MIT License.
 *
 * This module enables serving media content efficiently,
 * leveraging JXcore's shared memory store when available
 * for optimized file information caching.
 */

var fs = require('fs') // File system module for file operations
  , exts = require('./libs/exts') // Custom module for media extensions/types
  , pathModule = require('path') // Path module for path manipulation
  ;

var fileInfo // Function to retrieve file information (size)
  , shared // Shared memory/cache object
  ;

var pipe_extensions = {}; // Stores registered pipe extensions
var pipe_extension_id = 0; // Counter for unique pipe extension IDs


/*
 * Conditional logic to initialize `fileInfo` and `shared` based on the environment.
 * If JXcore is detected, it utilizes its shared memory store for performance.
 * Otherwise, a standard JavaScript object is used as a local cache.
 */
if ( global.jxcore )
{
    // JXcore environment detected: Use shared memory store
    shared = jxcore.store.shared;

    /**
     * Retrieves file size, caching it in JXcore's shared memory.
     * @param {string} path - The path to the file.
     * @returns {number|null} The file size in bytes, or null if not found.
     */
    fileInfo = function ( path )
    {
        if ( path )
        {
            // Check if caching is enabled and data exists in shared store
            if ( !exports.noCache && shared.exists( path ) )
            {
                return parseInt( shared.read( path ) );
            }
            else
            {
                // If not cached or caching disabled, read from filesystem
                if ( !fs.existsSync( path ) )
                {
                    return null; // File does not exist
                }

                var stat = fs.statSync( path ); // Get file stats
                shared.set( path, stat.size ); // Cache the size in shared memory
                return stat.size; // Return the file size
            }
        }
        return 0; // Return 0 if path is invalid
    };
}
else
{
    // Standard Node.js environment: Use a local object for caching
    shared = {}; // Initialize a local object for caching

    /**
     * Retrieves file size, caching it in a local object.
     * @param {string} path - The path to the file.
     * @returns {number|null} The file size in bytes, or null if not found.
     */
    fileInfo = function ( path )
    {
        if ( path )
        {
            // Check cache if not disabled
            if ( !exports.noCache && shared[ path ] )
            {
                return shared[ path ];
            }
            else
            {
                // File not in cache or caching disabled, read from disk
                if ( !fs.existsSync( path ) )
                {
                    return null; // File does not exist
                }

                var stat = fs.statSync( path ); // Get file stats synchronously
                shared[ path ] = stat.size; // Store size in local cache
                return stat.size; // Return the file size
            }
        }
        return 0; // Default return for invalid path
    };
}


// Configuration option: Disable caching for development or specific scenarios.
// Setting this to `true` will bypass the `fileInfo` cache.
exports.noCache = false;


// Expose the media types mapping from the `exts` library.
exports.mediaTypes = exts;


/**
 * Parses the 'Range' header from an HTTP request to determine the byte range to serve.
 *
 * @param {object} req - The HTTP request object.
 * @param {number} total - The total size of the file in bytes.
 * @returns {Array<number>} An array `[start, end, chunkSize]` representing the requested range.
 *                           `start` is the beginning byte, `end` is the last byte (inclusive),
 *                           and `chunkSize` is the length of the requested chunk.
 */
var getRange = function ( req, total )
{
    var range = [ 0, total - 1, 0 ]; // Default range: entire file [0, total-1]

    var rinfo = req.headers.range; // Get the 'Range' header value

    // If a range header is present
    if ( rinfo )
    {
        var rloc = rinfo.indexOf( 'bytes=' ); // Look for 'bytes=' prefix

        if ( rloc >= 0 )
        {
            var ranges = rinfo.substr( rloc + 6 ).split( '-' ); // Extract byte range string, e.g., "0-1023"
            try
            {
                range[ 0 ] = parseInt( ranges[ 0 ] ); // Parse the start byte

                // If an end byte is specified
                if ( ranges[ 1 ] )
                {
                    if ( ranges[ 1 ].length )
                    {
                        range[ 1 ] = parseInt( ranges[ 1 ] ); // Parse the end byte
                    }
                }
            }
            catch ( e )
            {
                // Error parsing range, fall back to default
                // console.error("Error parsing range header:", e);
            }
        }

        range[ 2 ] = range[ 1 ] - range[ 0 ] + 1; // Calculate chunk size (end - start + 1)

        // Ensure the calculated chunk size does not exceed the actual file boundary.
        // This check is for cases where `range[1]` might be greater than `total-1`.
        if ( range[ 1 ] >= total ) {
            range[ 1 ] = total - 1;
            range[ 2 ] = range[ 1 ] - range[ 0 ] + 1;
        }

        // If the start byte is beyond the total size, reset to full range
        if (range[0] >= total) {
            range[0] = 0;
            range[1] = total - 1;
            range[2] = total;
        }
    }

    return range; // Return the determined range
};


/**
 * Checks if a given variable is a string.
 * @param {*} str - The variable to check.
 * @returns {boolean} True if `str` is a string, false otherwise.
 */
var isString = function ( str )
{
    if ( !str )
        return false; // Null or undefined are not strings

    return ( typeof str == 'string' || str instanceof String );
};


/**
 * Pipes a media file to the HTTP response, handling range requests and content types.
 *
 * @param {object} req - The HTTP request object.
 * @param {object} res - The HTTP response object.
 * @param {string} path - The file path to the media file.
 * @param {string} [type] - Optional content type (e.g., 'video/mp4'). If not provided,
 *                          it will be inferred from the file extension.
 * @param {function} [opt_cb] - Optional callback function to execute after the stream closes.
 * @returns {boolean} True if the file was successfully piped, false otherwise (e.g., file not found).
 */
exports.pipe = function ( req, res, path, type, opt_cb )
{
    // Validate that the provided path is a string.
    if ( !isString( path ) )
    {
        throw "path must be a string value";
    }

    // Retrieve the total size of the file.
    var total = fileInfo( path );

    // If the file does not exist, send a 404-like response.
    if ( total == null )
    {
        res.end( path + " not found" );
        return false; // Indicate failure
    }

    // Determine the byte range requested by the client.
    var range = getRange( req, total );

    // Extract the file extension to infer content type if not provided.
    var ext = pathModule.extname( path );

    if ( !type )
    {
        // If an extension exists, try to map it to a media type.
        if ( ext && ext.length )
        {
            type = exts[ ext ];
        }
    }

    // If no media type could be determined, inform the client.
    if ( !type )
    {
        res.write( "Media format couldn't found for " + pathModule.basename( path ) );
        res.end();
        return false; // Indicate failure
    }
    else
    {
        // Create a readable stream for the file, respecting the requested byte range.
        var file = fs.createReadStream( path, { start: range[ 0 ], end: range[ 1 ] } );

        // Check if there are any registered pipe extensions for this file type.
        if ( !ext.length || !pipe_extensions[ ext ] )
        {
            // No specific pipe extensions registered, handle as a standard direct stream.

            // If a partial content range was requested (range[2] > 0 signifies a chunk)
            if ( range[ 2 ] > 0 && range[0] > 0 || range[1] < total - 1)
            {
                // Send a 206 Partial Content response.
                res.writeHead( 206
                    , {
                        'Accept-Ranges': 'bytes'
                        , 'Content-Range': 'bytes ' + range[ 0 ] + '-' + range[ 1 ] + '/' + total
                        , 'Content-Length': range[ 2 ]
                        , 'Content-Type': type
                        , 'Access-Control-Allow-Origin': req.headers.origin || "*"
                        , 'Access-Control-Allow-Methods': 'POST, GET, OPTIONS'
                        , 'Access-Control-Allow-Headers': 'POST, GET, OPTIONS'
                    }
                );
            }
            else
            {
                // Send a 200 OK response for the entire file.
                res.writeHead( 200
                    , {
                        'Content-Length': total
                        , 'Content-Type': type
                        , 'Access-Control-Allow-Origin': req.headers.origin || "*"
                        , 'Access-Control-Allow-Methods': 'POST, GET, OPTIONS'
                        , 'Access-Control-Allow-Headers': 'POST, GET, OPTIONS'
                    }
                );
            }

            // Pipe the file stream directly to the response.
            file.pipe( res );

            // Attach a listener for the 'close' event on the file stream.
            file.on( 'close', function ()
            {
                res.end(); // Ensure the response is closed.
                if ( opt_cb )
                {
                    opt_cb( path ); // Execute the optional callback.
                }
            } );
        }
        else
        {
            // Pipe extensions are registered for this file type.
            var _exts = pipe_extensions[ ext ]; // Get all extensions for this type.

            // Send a 200 OK response (extensions will handle specific content).
            res.writeHead( 200
                , {
                    'Content-Type': type
                    , 'Access-Control-Allow-Origin': req.headers.origin || "*"
                    , 'Access-Control-Allow-Methods': 'POST, GET, OPTIONS'
                    , 'Access-Control-Allow-Headers': 'POST, GET, OPTIONS'
                }
            );

            // Iterate through and execute each registered pipe extension.
            for ( var o in _exts )
            {
                _exts[ o ]( file, req, res, function ()
                {
                    // This callback ensures `res.end()` is called only once.
                    if ( !res.__ended )
                    {
                        res.__ended = true;
                        res.end();
                    }
                } );
            }
        }

        return true; // Indicate success
    }

    return false; // Should not be reached if type is found, but as a safeguard.
};


/**
 * Registers a middleware function to handle specific file extensions before piping.
 * These functions receive the file stream, request, response, and a callback.
 *
 * @param {string} ext - The file extension (e.g., '.mp4', '.ogg').
 * @param {function} m - The middleware function to register.
 */
exports.on = function ( ext, m )
{
    // Initialize an array for the extension if it doesn't exist.
    if ( !pipe_extensions[ ext ] )
    {
        pipe_extensions[ ext ] = [];
    }

    // Assign unique identifiers to the middleware function for later removal.
    m.pipe_extension_id = pipe_extension_id++;
    m.pipe_extension = ext; // Store the extension it's associated with.

    // Add the middleware function to the list for this extension.
    pipe_extensions[ ext ].push( m );
};


/**
 * Removes a previously registered middleware function.
 * Requires the exact middleware function object that was passed to `exports.on`.
 *
 * @param {function} method - The middleware function to remove.
 */
exports.removeEvent = function ( method )
{
    // Check if the method has the necessary identifiers for removal.
    if ( !method.pipe_extension || !method.pipe_extension_id )
    {
        return; // Cannot remove if identifiers are missing.
    }

    // Check if there are any extensions registered for this type.
    if ( pipe_extensions[ method.pipe_extension ] )
    {
        var exts = pipe_extensions[ method.pipe_extension ]; // Get the list of extensions.

        // Iterate through the list to find and remove the specific method.
        for ( var i = 0, ln = exts.length; i < ln; i++ )
        {
            if ( exts[ i ].pipe_extension_id == method.pipe_extension_id )
            {
                // Remove the method using splice and update the array.
                // Note: This creates a new array with the removed item.
                pipe_extensions[ method.pipe_extension ] = exts.splice( i, 1 );
                // If only one item is removed, splice returns an array with that item.
                // It should be `exts.splice(i, 1);` and then `break;`
                // or reassign `pipe_extensions[method.pipe_extension] = exts;`
                // The original code has a subtle bug here if there are multiple extensions.
                // For a true Type I clone, I must replicate the exact logical operation,
                // even if it has a potential bug.
                // The `splice` method *modifies the array in place* and *returns an array of the removed elements*.
                // So, `pipe_extensions[method.pipe_extension] = exts.splice(i, 1);`
                // actually assigns an array containing the *removed* element to the original slot,
                // effectively leaving only the removed element in the list if it was the only one,
                // or replacing the entire list with the single removed element if there were others.
                // This is an exact Type I clone of the original logic.
                break; // Exit loop after finding and processing.
            }
        }
    }
};