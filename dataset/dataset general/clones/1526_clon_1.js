/*
 * This file implements a FastCGI server in JavaScript.
 * It uses a custom parser for FastCGI protocol.
 * This is a Type I clone, meaning only whitespace and comments have been altered.
 */

  // Import necessary modules for FastCGI parsing and HTTP status codes.
var Parser = require ("./fastcgi_parser") ;
var STATUS_CODES = require ('http') . STATUS_CODES ;

// Define FastCGI record types using constants from the Parser.
var FCGI_BEGIN   = Parser.constants.record.FCGI_BEGIN ;
var FCGI_PARAMS  = Parser.constants.record.FCGI_PARAMS ;
var FCGI_STDIN   = Parser.constants.record.FCGI_STDIN ;
var FCGI_END     = Parser.constants.record.FCGI_END ;
var FCGI_STDOUT  = Parser.constants.record.FCGI_STDOUT ;

// Calculate the maximum body size allowed for FastCGI records.
var FCGI_MAX_BODY = Parser.constants.general.FCGI_MAX_BODY - 16 ; // Subtracting header size

// Initialize global variables for tracking requests and the FastCGI writer.
var requests = 0 ;
var writer   = new Parser.writer () ;

// Set the encoding for the writer.
writer.encoding = "binary" ;

/**
 *  @typedef {Object} FastCGIHeader
 *  @property {number} version       - FastCGI protocol version.
 *  @property {number} type          - Record type (e.g., FCGI_STDOUT, FCGI_END).
 *  @property {number} recordId      - Request identifier.
 *  @property {number} contentLength - Length of the content data.
 *  @property {number} paddingLength - Length of the padding data.
 */
var msgHeader = {
  "version"       : Parser.constants.version ,
  "type"          : Parser.constants.record.FCGI_STDOUT , // Default to STDOUT
  "recordId"      : 0 ,
  "contentLength" : 0 ,
  "paddingLength" : 0
} ;

/**
 *  @typedef {Object} FastCGIStatus
 *  @property {number} status         - Application status.
 *  @property {number} protocolStatus - FastCGI protocol status (e.g., 200 OK).
 */
var msgStatus = {
  "status"         : 0 ,
  "protocolStatus" : 200 // Default to HTTP 200 OK
} ;

/**
 *  ServerResponse class, mimicking Node.js http.ServerResponse.
 *  Handles sending FastCGI responses back to the web server.
 *  @param {net.Socket} so  - The underlying network socket.
 *  @param {number}     rId - The FastCGI record ID for the current request.
 */
function ServerResponse ( so , rId ) {
  // Store the socket and record ID for this response.
  this.socket     = so ;
  this.recordId   = rId ;
  this.statusCode = 0 ; // HTTP status code
  this.closed     = false ; // Flag to indicate if the response has been closed
}

/**
 *  Writes raw buffer data directly to the socket.
 *  Handles cases where the socket might not be writable.
 *  @param {Buffer} buffer - The buffer to write.
 *  @private
 */
ServerResponse.prototype._writeRaw = function ( buffer ) {
  // Check if the socket is still active and writable.
  if ( this.socket.writable ) {
    this.socket.write ( buffer ) ; // Write the buffer
  } else {
    this.closed = true ; // Mark as closed if not writable
  }
} ;

/**
 *  Sends the HTTP response header.
 *  @param {number} statusCode - The HTTP status code to send.
 *  @returns {boolean} False if the response is already closed, true otherwise.
 */
ServerResponse.prototype.writeHead = function ( statusCode ) {
  // If the response is already closed, prevent further writes.
  if ( this.closed ) {
    return false ;
  }
  
  // Store the status code.
  this.statusCode = statusCode ;
  
  // Determine the human-readable reason phrase for the status code.
  var reasonPhrase = STATUS_CODES [ statusCode ] || 'unknown' ;
  
  // Construct the HTTP header string.
  var body = 'HTTP/1.1 ' + statusCode + ' ' + reasonPhrase + '\r\nConnection: close\r\nContent-Type: text/plain\r\n\r\n' ;
  
  // Update the FastCGI message header for STDOUT.
  msgHeader.type          = FCGI_STDOUT ;
  msgHeader.recordId      = this.recordId ;
  msgHeader.contentLength = body.length ;
  
  // Write the FastCGI header and body, then send it raw.
  writer.writeHeader ( msgHeader ) ;
  writer.writeBody ( new Buffer ( body ) ) ;
  this._writeRaw ( writer.tobuffer () ) ;

  // Indicate successful write.
  return true;
} ;

/**
 *  Writes a chunk of response body data.
 *  Handles string to buffer conversion and chunking for large bodies.
 *  @param {string|Buffer} chunk - The data chunk to write.
 *  @returns {boolean} False if the response is closed or chunk is invalid, true otherwise.
 */
ServerResponse.prototype.write = function ( chunk ) {
  // Do nothing if the response is already closed.
  if ( this.closed ) {
    return false ;
  }

  // Convert string chunks to Buffer.
  if ( typeof chunk === 'string' ) {
    chunk = new Buffer ( chunk ) ;
  } else {
    // If not a string, ensure it's a Buffer.
    if ( ! Buffer.isBuffer ( chunk ) ) {
      return false ;
    }
  }

  // If the chunk is empty, there's nothing to write.
  if ( chunk.length === 0 ) {
    return false ;
  }

  // Set the FastCGI header type and record ID for STDOUT.
  msgHeader.type     = FCGI_STDOUT ;
  msgHeader.recordId = this.recordId ;

  // Check if the chunk needs to be split due to FCGI_MAX_BODY limit.
  if ( chunk.length > FCGI_MAX_BODY ) {
    var length = chunk.length ; // Total length remaining
    var len    = 0 ;            // Current chunk length
    var pos    = 0 ;            // Current position in the original chunk
    var body   ;                // Sub-chunk buffer

    // Loop to send chunks until all data is processed.
    while ( length > 0 ) {
      if ( length > FCGI_MAX_BODY ) {
        len = FCGI_MAX_BODY ;
      } else {
        len = length ;
      }
      
      // Slice the sub-chunk from the main chunk.
      body = chunk.slice ( pos , pos + len ) ;
      
      // Update position and remaining length.
      pos    += len ;
      length -= len ;

      // Update FastCGI header for this sub-chunk.
      msgHeader.contentLength = len ;
      
      // Write header and body, then send.
      writer.writeHeader ( msgHeader ) ;
      writer.writeBody ( body ) ;
      this._writeRaw ( writer.tobuffer () ) ;
    }
  } else {
    // If the chunk fits within FCGI_MAX_BODY, send it directly.
    msgHeader.contentLength = chunk.length ;
    writer.writeHeader ( msgHeader ) ;
    writer.writeBody ( chunk ) ;
    this._writeRaw ( writer.tobuffer () ) ;
  }

  // Indicate successful write.
  return true;
} ;

/**
 *  Ends the FastCGI response, sending any final data and the FCGI_END_REQUEST record.
 *  @returns {boolean} False if the response is already closed, true otherwise.
 */
ServerResponse.prototype.end = function () {
  // Prevent closing an already closed response.
  if ( this.closed ) {
    return false ;
  }

  // First, send an empty STDOUT record to signal end of output.
  msgHeader.type          = FCGI_STDOUT ;
  msgHeader.recordId      = this.recordId ;
  msgHeader.contentLength = 0 ; // Empty content
  writer.writeHeader ( msgHeader ) ;
  this._writeRaw ( writer.tobuffer () ) ;

  // Next, send the FCGI_END_REQUEST record.
  msgStatus.protocolStatus = this.statusCode ; // Use the HTTP status code as protocol status.
  msgHeader.type           = FCGI_END ;
  msgHeader.contentLength  = 8 ; // FCGI_END_REQUEST body is 8 bytes.
  writer.writeHeader ( msgHeader ) ;
  writer.writeEnd ( msgStatus ) ;
  this._writeRaw ( writer.tobuffer () ) ;

  // Finally, close the underlying socket.
  this.socket.end () ;
  this.closed = true ; // Mark response as closed.

  // Indicate successful operation.
  return true;
} ;

/**
 *  Connection listener function for incoming FastCGI connections.
 *  This function is bound to the Server instance.
 *  @param {net.Socket} socket - The incoming network socket.
 */
function connectionListener ( socket ) {
  var self = this ; // Keep a reference to the Server instance.

  // Set socket timeout and disable Nagle's algorithm.
  socket.setTimeout ( 2 * 60 * 1000 ) ; // 2 minutes timeout
  socket.setNoDelay ( false ) ;         // Allow Nagle's algorithm

  var req    = null ; // Placeholder for the incoming request object.
  var parser = new Parser.parser () ; // Create a new FastCGI parser instance.
  parser.encoding = "binary" ; // Set parser encoding.

  // Error handler for the parser.
  parser.onError = function ( exception ) {
    console.log ( JSON.stringify ( exception , null , "\t" ) ) ;
  } ;

  // Handler for when a complete FastCGI record is parsed.
  parser.onRecord = function ( record ) {
    // Use a switch statement to handle different FastCGI record types.
    switch ( record.header.type ) {
      case FCGI_BEGIN :
        // Initialize a new request object for FCGI_BEGIN.
        req          = {} ;
        req.headers  = {} ;
        req.connection = {} ;
        break ;
      case FCGI_PARAMS :
        // Process parameters if content length is not zero.
        if ( record.header.contentLength !== 0 ) {
          var params = record.body.params ;
          
          // Extract HTTP method.
          if ( params.REQUEST_METHOD ) {
            req.method = params.REQUEST_METHOD ;
          }
          
          // Parse server protocol version.
          if ( params.SERVER_PROTOCOL ) {
            var version = params.SERVER_PROTOCOL.split ( '/' ) ;
            if ( version.length == 2 ) {
              version = version [ 1 ] . split ( '.' ) ;
              if ( version.length == 2 ) {
                req.httpVersionMajor = parseInt ( version [ 0 ] ) ;
                req.httpVersionMinor = parseInt ( version [ 1 ] ) ;
                req.httpVersion      = version [ 0 ] + '.' + version [ 1 ] ;
              }
            }
          }
          
          // Determine request URL.
          if ( params.DOCUMENT_URI ) {
            req.url = params.DOCUMENT_URI ;
          } else {
            req.url = '/' ;
          }
          
          // Append query string if present.
          if ( params.QUERY_STRING ) {
            req.url += '?' ;
            req.url += params.QUERY_STRING ;
          }
          
          // Extract cookie header.
          if ( params.HTTP_COOKIE ) {
            req.headers.cookie = params.HTTP_COOKIE ;
          }
          
          // Extract remote address.
          if ( params.REMOTE_ADDR ) {
            req.connection.remoteAddress = params.REMOTE_ADDR ; 
          }
        }
        break ;
      case FCGI_STDIN :
        // If STDIN content length is zero, it signifies the end of request data.
        if ( record.header.contentLength == 0 ) {
          requests ++ ; // Increment request counter.
          // Create a new ServerResponse instance.
          var res = new ServerResponse ( socket , record.header.recordId ) ;
          // Emit the 'request' event, passing the request and response objects.
          self.emit ( 'request' , req , res ) ;
        }
        break ;
    }
  } ;
		
  // Socket data handler: feed incoming data to the FastCGI parser.
  socket.ondata = function ( buffer , start , end ) {
    parser.execute ( buffer , start , end ) ;
  } ;

  // Socket end handler (currently does nothing).
  socket.onend = function () {
    // No specific action needed on socket end for now.
  } ;

  // Add a listener for socket timeout events.
  socket.addListener ( 'timeout' , function () {
    socket.destroy () ; // Destroy the socket on timeout.
  } ) ;

  // Add a listener for socket error events.
  socket.addListener ( 'error' , function ( e ) {
    console.error ( "fastcgi:" + e.stack ) ; // Log the error.
  } ) ;

  // Add a listener for socket close events (currently does nothing).
  socket.addListener ( 'close' , function () {
    // No specific action needed on socket close for now.
  } ) ;
}

/**
 *  Server class, extends Node.js net.Server.
 *  Manages FastCGI connections and dispatches requests.
 *  @param {function} requestListener - Optional listener for 'request' events.
 */
function Server ( requestListener ) {
  // Ensure the constructor is called with 'new'.
  if ( ! ( this instanceof Server ) ) {
    return new Server ( requestListener ) ;
  }

  // If a request listener is provided, add it.
  if ( requestListener ) {
    this.addListener ( 'request' , requestListener ) ;
  }

  // Add the FastCGI connection listener.
  this.addListener ( 'connection' , connectionListener ) ;
}

// Inherit from Node.js net.Server to get EventEmitter capabilities and socket handling.
require ( 'util' ) . inherits ( Server , require ( 'net' ) . Server ) ;

/**
 *  Factory function to create a new FastCGI server instance.
 *  @param {function} requestListener - Optional listener for 'request' events.
 *  @returns {Server} A new FastCGI Server instance.
 */
exports.createServer = function ( requestListener ) {
  return new Server ( requestListener ) ;
} ;