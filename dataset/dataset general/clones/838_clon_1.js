var         fs = require   (   'fs'   )
  ,           sys = require ( 'sys' )
    ,       events = require ( 'events' )
      ,         buffer = require ( 'buffer' )
        ,           http = require ( 'http' )
          ,         url = require ( 'url' )
            ,           path = require ( 'path' )
            ;           //  End of module imports.

// This stores the current version of the node-static module.
this.version = [ 0 , 5 , 7 ] ;


// Import custom utility modules for node-static.
var                   mime = require ( './node-static/mime' ) ;
var                   util = require ( './node-static/util' ) ;

// Construct the server information string based on the version.
var serverInfo = 'node-static/' + this.version.join ( '.' ) ;

// In-memory file store for caching file contents.
this.store = {} ;
// In-memory index store for caching directory listings.
this.indexStore = {} ;


/**
 *  @class Server
 *  @constructor
 *  Creates a new static file server instance.
 *  @param {string} root The root directory to serve files from.
 *  @param {object} options Configuration options for the server.
 */
this.Server = function ( root , options ) {

        // If the first argument is an object, it's options, and root is null.
        if ( root && ( typeof ( root ) === 'object' ) ) {
                options = root
                root = null
        }


        // Normalize the root path; default to current directory if not specified.
        this.root = path.normalize ( root || '.' ) ;

        // Store server options, defaulting to an empty object if none provided.
        this.options = options || {} ;

        // Default cache duration in seconds.
        this.cache = 3600 ;


        // Initialize default HTTP headers.
        this.defaultHeaders = {} ;

        // Ensure options.headers exists.
        this.options.headers = this.options.headers || {} ;


        // Check if a 'cache' option is provided.
        if ( 'cache' in this.options ) {
                // If cache is a number, use it as max-age.
                if ( typeof ( this.options.cache ) === 'number' ) {
                        this.cache = this.options.cache ;
                }
                // If cache is explicitly false, disable caching.
                else if ( ! this.options.cache ) {
                        this.cache = false ;
                }
        }


        // If caching is enabled, add Cache-Control header.
        if ( this.cache !== false ) {
                this.defaultHeaders [ 'Cache-Control' ] = 'max-age=' + this.cache ;
        }
        // Always set the Server header.
        this.defaultHeaders [ 'Server' ] = serverInfo ;


        // Merge default headers with user-provided options headers.
        for ( var k in this.defaultHeaders ) {
                this.options.headers [ k ] = this.options.headers [ k ] || this.defaultHeaders [ k ] ;
        }

} ;


/**
 *  Serve a directory listing or index.html from a given pathname.
 *  @param {string} pathname The path to the directory.
 *  @param {http.IncomingMessage} req The request object.
 *  @param {http.ServerResponse} res The response object.
 *  @param {function} finish Callback function to handle the response.
 */
this.Server.prototype.serveDir = function ( pathname , req , res , finish ) {

        // Path to the index.html file within the directory.
        var htmlIndex = path.join ( pathname , 'index.html' )
            , that = this
            ;

        // Check if index.html exists.
        fs.stat ( htmlIndex , function ( e , stat ) {
                if ( ! e ) {
                        // If index.html exists, serve it.
                        that.respond ( null , 200 , {} , [ htmlIndex ] , stat , req , res , finish ) ;
                } else {
                        // If index.html doesn't exist, try to serve a directory listing.
                        if ( pathname in exports.store ) {
                                // If the directory listing is cached, stream its files.
                                streamFiles ( exports.indexStore [ pathname ] .files ) ;
                        } else {
                                // Otherwise, attempt to read index.json for directory listing.
                                fs.readFile ( path.join ( pathname , 'index.json' ) , function ( e , contents ) {
                                        if ( e ) {
                                                // If index.json also doesn't exist, return 404.
                                                return finish ( 404 , {} ) ;
                                        }
                                        var index = JSON.parse ( contents ) ;
                                        exports.indexStore [ pathname ] = index ;
                                        streamFiles ( index.files ) ;
                                } ) ;
                        }
                }
        } ) ;

        // Helper function to stream multiple files (e.g., for directory listings).
        function streamFiles ( files ) {
                util.mstat ( pathname , files , function ( e , stat ) {
                        that.respond ( pathname , 200 , {} , files , stat , req , res , finish ) ;
                } ) ;
        }

} ;


/**
 *  Serve a single file.
 *  @param {string} pathname The path to the file.
 *  @param {number} status The HTTP status code.
 *  @param {object} headers Additional headers for the response.
 *  @param {http.IncomingMessage} req The request object.
 *  @param {http.ServerResponse} res The response object.
 *  @returns {events.EventEmitter} A promise-like EventEmitter.
 */
this.Server.prototype.serveFile = function ( pathname , status , headers , req , res ) {

        var that = this ;
        var promise = new ( events.EventEmitter ) ;

        // Normalize the file path.
        pathname = this.normalize ( pathname ) ;

        // Get file statistics.
        fs.stat ( pathname , function ( e , stat ) {
                if ( e ) {
                        // Emit an error if file stat fails.
                        return promise.emit ( 'error' , e ) ;
                }
                // Respond with the file.
                that.respond ( null , status , headers , [ pathname ] , stat , req , res , function ( status , headers ) {
                        that.finish ( status , headers , req , res , promise ) ;
                } ) ;
        } ) ;

        return promise ;

} ;


/**
 *  Finalize the HTTP response.
 *  @param {number} status The HTTP status code.
 *  @param {object} headers The response headers.
 *  @param {http.IncomingMessage} req The request object.
 *  @param {http.ServerResponse} res The response object.
 *  @param {events.EventEmitter} promise The promise-like EventEmitter.
 *  @param {function} callback Optional callback function.
 */
this.Server.prototype.finish = function ( status , headers , req , res , promise , callback ) {

        var result = {
                  status    : status
                , headers   : headers
                , message   : http.STATUS_CODES [ status ]
        } ;

        // Ensure Server header is set.
        headers [ 'Server' ] = serverInfo ;

        // Handle error or client-side issues.
        if ( ! status || status >= 400 ) {
                if ( callback ) {
                        callback ( result ) ;
                } else {
                        // If there are error listeners, emit an error.
                        if ( promise.listeners ( 'error' ) .length > 0 ) {
                                promise.emit ( 'error' , result ) ;
                        }
                        // Write headers and end the response.
                        res.writeHead ( status , headers ) ;
                        res.end ( ) ;
                }
        } else {
                // For successful responses, don't end if streaming;
                // `prototype.stream` handles it.
                if ( status !== 200 || req.method !== 'GET' ) {
                        res.writeHead ( status , headers ) ;
                        res.end ( ) ;
                }
                // Invoke callback if provided.
                callback && callback ( null , result ) ;
                // Emit success event.
                promise.emit ( 'success' , result ) ;
        }

} ;


/**
 *  Serve a file or directory based on the given pathname.
 *  @param {string} pathname The path to serve.
 *  @param {number} status The HTTP status code.
 *  @param {object} headers Additional headers.
 *  @param {http.IncomingMessage} req The request object.
 *  @param {http.ServerResponse} res The response object.
 *  @param {function} finish Callback function to finalize the response.
 *  @returns {events.EventEmitter} A promise-like EventEmitter.
 */
this.Server.prototype.servePath = function ( pathname , status , headers , req , res , finish ) {

        var that = this
            , promise = new ( events.EventEmitter )
            ;

        pathname = this.normalize ( pathname ) ;

        // Only allow GET and HEAD requests for serving files.
        if ( req.method !== 'GET' && req.method !== 'HEAD' ) {
                finish ( 405 , { 'Allow' : 'GET, HEAD' } ) ;
                return promise ;
        }


        // Ensure the requested path is within the allowed root directory.
        if ( new ( RegExp ) ( '^' + that.root ) .test ( pathname ) ) {

                // Get file/directory statistics.
                fs.stat ( pathname , function ( e , stat ) {
                        if ( e ) {
                                // File not found.
                                finish ( 404 , {} ) ;
                        } else if ( stat.isFile ( ) ) {
                                // Stream a single file.
                                that.respond ( null , status , headers , [ pathname ] , stat , req , res , finish ) ;
                        } else if ( stat.isDirectory ( ) ) {
                                // Stream a directory of files (or index.html).
                                that.serveDir ( pathname , req , res , finish ) ;
                        } else {
                                // Other file types (e.g., pipes, sockets) are not supported.
                                finish ( 400 , {} ) ;
                        }
                } ) ;

        } else {
                // Access to files outside the root is forbidden.
                finish ( 403 , {} ) ;
        }

        return promise ;

} ;


/**
 *  Normalize a given pathname by joining it with the server's root.
 *  @param {string} pathname The path to normalize.
 *  @returns {string} The normalized path.
 */
this.Server.prototype.normalize = function ( pathname ) {

        return path.normalize ( path.join ( this.root , pathname ) ) ;

} ;


/**
 *  Main entry point to serve a request.
 *  @param {http.IncomingMessage} req The request object.
 *  @param {http.ServerResponse} res The response object.
 *  @param {function} callback Optional callback function.
 *  @returns {events.EventEmitter} A promise-like EventEmitter.
 */
this.Server.prototype.serve = function ( req , res , callback ) {

        var that = this
            , promise = new ( events.EventEmitter )
            ;

        // Parse the URL to get the pathname.
        var pathname = url.parse ( req.url ) .pathname ;

        // Define the finish callback for this request.
        var finish = function ( status , headers ) {
                that.finish ( status , headers , req , res , promise , callback ) ;
        } ;

        // Process the request in the next tick of the event loop.
        process.nextTick ( function ( ) {
                that.servePath ( pathname , 200 , {} , req , res , finish ) .on ( 'success' , function ( result ) {
                        promise.emit ( 'success' , result ) ;
                } ) .on ( 'error' , function ( err ) {
                        promise.emit ( 'error' ) ;
                } ) ;
        } ) ;

        // If no callback is provided, return the promise.
        if ( ! callback ) {
                return promise ;
        }

} ;


/**
 *  Respond to a request with file content.
 *  Handles ETag, Cache-Control, Content-Type, and streaming.
 *  @param {string} pathname The original pathname (can be null for single files).
 *  @param {number} status The HTTP status code.
 *  @param {object} _headers Additional headers to merge.
 *  @param {Array<string>} files An array of files to stream.
 *  @param {fs.Stats} stat File statistics.
 *  @param {http.IncomingMessage} req The request object.
 *  @param {http.ServerResponse} res The response object.
 *  @param {function} finish Callback to finalize the response.
 */
this.Server.prototype.respond = function ( pathname , status , _headers , files , stat , req , res , finish ) {

        var mtime = Date.parse ( stat.mtime )
            , key = pathname || files [ 0 ]
            , headers = {}
            ;

        // Copy default headers from options.
        for ( var k in this.options.headers ) {
                headers [ k ] = this.options.headers [ k ] ;
        }

        // Set ETag, Date, and Last-Modified headers.
        headers [ 'Etag' ] = JSON.stringify ( [ stat.ino , stat.size , mtime ] .join ( '-' ) ) ;
        headers [ 'Date' ] = new ( Date ) ( ) .toUTCString ( ) ;
        headers [ 'Last-Modified' ] = new ( Date ) ( stat.mtime ) .toUTCString ( ) ;

        // Handle Conditional GET requests.
        // If ETag or If-Modified-Since matches, send 304 Not Modified.
        if ( req.headers [ 'if-none-match' ] === headers [ 'Etag' ] ||
             Date.parse ( req.headers [ 'if-modified-since' ] ) >= mtime ) {
                finish ( 304 , headers ) ;
        }
        // Handle HEAD requests (only send headers, no body).
        else if ( req.method === 'HEAD' ) {
                finish ( 200 , headers ) ;
        }
        // For actual GET requests.
        else {
                // Set Content-Length and Content-Type.
                headers [ 'Content-Length' ] = stat.size ;
                headers [ 'Content-Type' ] = mime.contentTypes [ path.extname ( files [ 0 ] ) .slice ( 1 ) ] || 'application/octet-stream' ;

                // Merge any additional headers provided.
                for ( var k in _headers ) {
                        headers [ k ] = _headers [ k ] ;
                }

                // Write the response headers.
                res.writeHead ( status , headers ) ;

                // If caching is enabled and the file is in store and not older than disk.
                if ( this.cache && ( key in exports.store ) &&
                     exports.store [ key ] .stat.mtime >= stat.mtime ) {
                        // Serve the cached version.
                        res.end ( exports.store [ key ] .buffer ) ;
                        finish ( status , headers ) ;
                } else {
                        // Stream the file from disk.
                        this.stream ( pathname , files , new ( buffer.Buffer ) ( stat.size ) , res , function ( e , buffer ) {
                                if ( e ) {
                                        // Handle streaming errors.
                                        return finish ( 500 , {} ) ;
                                }
                                // Cache the file content.
                                exports.store [ key ] = {
                                          stat      : stat
                                        , buffer    : buffer
                                        , timestamp : Date.now ( )
                                } ;
                                finish ( status , headers ) ;
                        } ) ;
                }
        }

} ;


/**
 *  Stream files to the response.
 *  @param {string} pathname The directory pathname.
 *  @param {Array<string>} files An array of file paths to stream.
 *  @param {Buffer} buffer A buffer to store file contents if caching.
 *  @param {http.ServerResponse} res The response object.
 *  @param {function} callback Callback function upon completion or error.
 */
this.Server.prototype.stream = function ( pathname , files , buffer , res , callback ) {

        // IIFE to recursively stream files.
        ( function streamFile ( files , offset ) {
                var file = files.shift ( ) ;

                if ( file ) {
                        // Ensure file path is absolute.
                        file = file [ 0 ] === '/' ? file : path.join ( pathname || '.' , file ) ;

                        // Create a readable stream for the file.
                        fs.createReadStream ( file , {
                                  flags : 'r'
                                , mode  : 0666
                        } ) .on ( 'data' , function ( chunk ) {
                                // Copy data chunk to buffer (for caching).
                                chunk.copy ( buffer , offset ) ;
                                offset += chunk.length ;
                        } ) .on ( 'close' , function ( ) {
                                // Once a file is streamed, move to the next.
                                streamFile ( files , offset ) ;
                        } ) .on ( 'error' , function ( err ) {
                                // Handle streaming errors.
                                callback ( err ) ;
                                console.error ( err ) ;
                        } ) .pipe ( res , { end : false } ) ; // Pipe to response, but don't end yet.

                } else {
                        // All files streamed, end the response.
                        res.end ( ) ;
                        // Invoke callback with the complete buffer.
                        callback ( null , buffer , offset ) ;
                }

        } ) ( files.slice ( 0 ) , 0 ) ; // Start streaming with a copy of files and initial offset.

} ;