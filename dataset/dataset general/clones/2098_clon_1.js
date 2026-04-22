/*
 * This file provides a server-side implementation for the EventSource API.
 * It allows sending server-sent events (SSE) to connected clients.
 *
 * For more details on EventSource and Server-Sent Events, refer to:
 * - W3C Specification: http://www.w3.org/TR/eventsource/
 * - MDN Web Docs: https://developer.mozilla.org/en-US/docs/Server-sent_events/Using_server-sent_events
 */

/**
 * Exports the main function to create a new EventSource instance.
 *
 * @param {ServerRequest}  req     - The Node.js HTTP request object.
 * @param {ServerResponse} res     - The Node.js HTTP response object.
 * @param {object}         options - Optional configuration for the EventSource.
 * @param {Function}       [options.onClose]   - Callback function to execute when the connection closes.
 * @param {boolean}        [options.keepAlive] - If true, sends a comment every 15s to prevent timeouts.
 *                                               Defaults to false.
 * @returns {EventSource} A new EventSource instance.
 */
module.exports = function ( req , res , options )
{
  // Ensure options is an object, even if not provided.
  return new EventSource( req , res , options || { } ) ;
} ;

/**
 * Constructor for the EventSource class.
 * Initializes a new server-sent event stream.
 *
 * @param {ServerRequest}  req     - The incoming HTTP request.
 * @param {ServerResponse} res     - The outgoing HTTP response.
 * @param {object}         options - Configuration options.
 */
function EventSource ( req , res , options )
{
  // Store the response object for writing data.
  this . res = res ;

  // Initialize the private onClose handler, defaulting to a no-op function.
  this . _onClose = options . onClose || noop ;

  // Bind the instance's onClose method to 'this' for event listeners.
  var onClose = this . onClose . bind ( this ) ;

  // Attach event listeners to the request and response objects
  // to detect when the connection is terminated or encounters an error.
  req
    . on ( "aborted" , onClose ) // Client aborted the request.
    . on ( "error"   , onClose ) ; // An error occurred on the request stream.

  res
    . on ( "aborted" , onClose ) // Client aborted the response.
    . on ( "error"   , onClose ) // An error occurred on the response stream.
    . on ( "close"   , onClose ) // The underlying connection was closed.
    . on ( "end"     , onClose ) ; // The response stream has ended.

  // Set the necessary HTTP headers for Server-Sent Events.
  res . writeHead ( 200 ,
    {
        "Content-Type"  : "text/event-stream" // Specifies the MIME type for SSE.
      , "Cache-Control" : "no-cache"          // Prevents caching of the event stream.
      , "Connection"    : "keep-alive"        // Keeps the connection open.
    }
  ) ;

  // If the keepAlive option is enabled, start sending periodic comments.
  // This helps prevent proxies from timing out the connection.
  if ( options . keepAlive )
  {
    this . alive ( ) ; // Send an initial keep-alive comment immediately.
    // Set an interval to send keep-alive comments every 15 seconds (15000 ms).
    this . interval = setInterval ( this . alive . bind ( this ) , 15000 ) ;
  }
}

/**
 * Sends an event down the event stream to the client.
 *
 * @param {string} type - The type of the event (e.g., "message", "update").
 * @param {*}      data - The data payload for the event. This will be JSON.stringify-ed.
 */
EventSource . prototype . emit = function ( type , data )
{
  // Write the event data in the SSE format: "event: [type]\ndata: [data]\n\n"
  this . res . write (
      "event: " + type                 + "\n" // Event type line.
    + "data: "  + JSON . stringify ( data ) + "\n" // Data line, JSON stringified.
    + "\n" // Double newline indicates end of an event.
  ) ;
} ;

/**
 * Sends a comment line down the event stream.
 * Comments are ignored by EventSource clients but can be used for keep-alive
 * messages or debugging.
 *
 * @param {string} text - The text content of the comment.
 */
EventSource . prototype . comment = function ( text )
{
  // Write the comment in SSE format: ":[text]\n\n"
  this . res . write ( ":" + text + "\n\n" ) ;
} ;

/*
 * Rationale for keep-alive comments (from W3C EventSource spec):
 *
 * "Legacy proxy servers are known to, in certain cases, drop HTTP connections
 * after a short timeout. To protect against such proxy servers, authors can
 * include a comment line (one starting with a ':' character) every 15
 * seconds or so."
 *
 * The specific content of the comment is not important to the client.
 */
/**
 * Sends a 'keepalive' comment to maintain the connection.
 * This is primarily used to prevent proxy servers from timing out the connection.
 */
EventSource . prototype . alive = function ( )
{
  // Simply delegates to the comment method with a standard keep-alive message.
  this . comment ( "keepalive" ) ;
} ;

/**
 * Gracefully closes the EventSource connection.
 * This signals to the client that no more events will be sent.
 */
EventSource . prototype . end = function ( )
{
  this . res . end ( ) ;      // End the HTTP response, closing the stream.
  this . onClose ( ) ;        // Execute the internal cleanup handler.
} ;

/**
 * Cleans up resources associated with the EventSource connection.
 * This includes clearing the keep-alive interval and nullifying references.
 */
EventSource . prototype . onClose = function ( )
{
  // If a keep-alive interval was set, clear it to stop future comments.
  if ( this . interval ) { clearInterval ( this . interval ) ; }

  // If a custom onClose callback was provided, execute it.
  if ( this . _onClose ) { this . _onClose ( ) ; }

  // Nullify references to aid garbage collection and prevent memory leaks.
  this . interval = this . _onClose = null ;
} ;

/**
 * A simple no-operation function.
 * Used as a default callback when no custom handler is provided.
 */
function noop ( ) { /* This function does nothing. */ }