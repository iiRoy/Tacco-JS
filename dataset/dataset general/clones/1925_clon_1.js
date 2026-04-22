/*
 * Pult Static File Server Clone
 *
 * This is a Type I clone of the original Pult static file server.
 * It serves static assets over HTTP.
 *
 * All identifiers, variable names, function names, operators, and expressions
 * are identical to the original.
 *
 * Only whitespace (indentation, spacing, blank lines) and comments have been
 * altered to create a visually distinct, yet logically and structurally
 * identical, code fragment.
 *
 */

// Core Node.js modules for HTTP server, path manipulation, and file system operations.
var http = require('http') ;
var path = require('path') ;
var mime = require('mime') ;
var fs   = require('fs')   ;


// === Log Function ===
//
// Provides a simple logging mechanism to stdout, prepending messages
// with '[static]' for easy identification.
//
function log( )
{
    // Use Array.prototype.join.call to convert arguments object to a space-separated string.
    console.log( '[static]',    Array.prototype.join.call( arguments,    ' ' )    ) ;
} // End of log function


/*
 *
 * === writeStatus Function ===
 *
 * This function extends the HTTP response object to write a status code
 * and its corresponding text to the response body.
 *
 * @param {number} status - The HTTP status code to write (e.g., 200, 404).
 * @param {object} [headers] - Optional object containing additional HTTP headers.
 *
 */
function writeStatus( status, headers )
{
    // Initialize headers if not provided.
    if ( ! headers )
    {
        headers = { } ;
    }

    // Set Content-Type to plain text and store it for logging.
    this.logType = ( headers[ 'Content-Type' ] = 'text/plain' ) ;

    // Set Content-Length based on the status code's text length and store for logging.
    this.logLength = ( headers[ 'Content-Length' ] = http.STATUS_CODES[ status ].length ) ;

    // Write the HTTP head with the given status and headers.
    this.writeHead( status, headers ) ;

    // If the request method is not HEAD, write the status message to the response body.
    if ( ( this.req.method != 'HEAD' ) )
    {
        this.write( http.STATUS_CODES[ status ] ) ;
    }
} /* Closing writeStatus function */


// === end Function ===
//
// This function overrides the default `res.end()` to also log the request
// details before actually ending the response.
//
function end( )
{
    // Call the original `res.end()` method, which was aliased as `_end`.
    this._end( ) ;

    // Log comprehensive details about the completed request.
    log(
        new Date( ).toISOString( ) , // Timestamp of the request completion
        this.req.method            , // HTTP method (e.g., GET, HEAD)
        this.req.url               , // Requested URL path
        this.statusCode            , // Final HTTP status code
        http.STATUS_CODES[ this.statusCode ] , // Status message for the code
        this.logType               , // Content type of the response
        this.logLength               // Content length of the response
    ) ;
} // end function definition concludes


/**
 *
 * === Main HTTP Server Setup ===
 *
 * This section initializes the HTTP server, defining the request handling logic.
 *
 */
var server = http.createServer( function( req, res )
{
    // Attach the request object to the response for easier access within response methods.
    res.req = req ;

    // Extend the response object with custom methods for status writing and logging.
    res.writeStatus = writeStatus ;
    res._end = res.end ; // Store original end method.
    res.end = end ;      // Override end method with our custom logger.

    // Enforce allowed HTTP methods. Only GET and HEAD are supported for static files.
    if ( ( req.method != 'GET' ) && ( req.method != 'HEAD' ) )
    {
        res.writeStatus( 405, { 'Allow': 'GET, HEAD' } ) ; // Method Not Allowed
        return res.end( ) ;
    }


    // Determine the absolute file path based on the current working directory and request URL.
    var filePath = path.resolve( path.join( process.cwd( ), req.url ) ) ;


    // Security check: Prevent directory traversal attacks by ensuring the
    // resolved path remains within the current working directory.
    if ( filePath.indexOf( process.cwd( ) ) != 0 )
    {
        res.writeStatus( 403 ) ; // Forbidden
        return res.end( ) ;
    }


    // Create a readable stream for the requested file.
    var readStream = fs.createReadStream( filePath ) ;


    // Handle errors that occur during the file reading process.
    readStream.on( 'error', function( err )
    {
        // If the path points to a directory, redirect to 'index.html' within that directory.
        if ( ( err.code == 'EISDIR' ) )
        {
            res.writeStatus( 302, { 'Location': path.join( req.url, 'index.html' ) } ) ; // Found (redirect)
            return res.end( ) ;
        }

        // Handle 'File Not Found' errors.
        if ( ( err.code == 'ENOENT' ) )
        {
            res.writeStatus( 404 ) ; // Not Found
            return res.end( ) ;
        }

        // Handle 'Permission Denied' errors.
        if ( ( err.code == 'EACCES' ) )
        {
            res.writeStatus( 403 ) ; // Forbidden
            return res.end( ) ;
        }

        // Catch-all for any other unhandled file system errors.
        res.writeStatus( 500 ) ; // Internal Server Error
        log( err.stack ) ;       // Log the full error stack for debugging.
        return res.end( ) ;
    } ) ;


    // Once the file stream is successfully opened, proceed with serving the file.
    readStream.on( 'open', function( fd )
    {
        // Retrieve file statistics (size, modification date, etc.) using its file descriptor.
        fs.fstat( fd, function( err, stats )
        {
            if ( err )
            {
                res.writeStatus( 500 ) ; // Internal Server Error
                log( err.stack ) ;       // Log the error.
                return res.end( ) ;
            }

            // Determine the MIME type of the file based on its extension.
            var mimeType = mime.lookup( filePath ) ;

            // Prepare HTTP response headers.
            var headers = {
                'Content-Type'   : mimeType              ,
                'Content-Length' : stats.size            ,
                'Last-Modified'  : stats.mtime.toUTCString( )
            } ;

            // Store content type and length in the response object for logging.
            res.logType = mimeType ;
            res.logLength = stats.size ;

            // Implement conditional GET (If-Modified-Since).
            // If the client has a cached version that's still fresh, send 304 Not Modified.
            if ( req.headers[ 'if-modified-since' ] )
            {
                var since = new Date( req.headers[ 'if-modified-since' ] ) ;
                if ( ( stats.mtime <= since ) )
                {
                    // Ensure the read stream is consumed to prevent memory leaks,
                    // even if we're not sending the file content.
                    readStream.resume( ) ;
                    res.writeHead( 304, headers ) ; // Not Modified
                    return res.end( ) ;
                }
            }

            // If not a 304, send the 200 OK header with the file's metadata.
            res.writeHead( 200, headers ) ;

            // For GET requests, pipe the file content to the response.
            if ( ( req.method != 'HEAD' ) )
            {
                readStream.pipe( res ) ;
            }
            // For HEAD requests, only send headers; do not send the body.
            else
            {
                readStream.resume( ) ; // Consume the stream without sending data.
                res.end( ) ;
            }
        } ) ; // End of fs.fstat callback
    } ) ; // End of readStream.on('open')
} ) ; // End of http.createServer callback


// Export the configured HTTP server instance.
module.exports = server ;