var WebSocketServer = require('ws').Server; /* Import WebSocket Server component */

var Gaze = require('gaze'); /* Gaze for file watching */
var path = require('path'); // Node.js path module
var _ = require('underscore'); /* Utility library for functional programming helpers */

/**
 * Initiates a file watching service with WebSocket capabilities.
 * @param {object} options - Configuration options for the watcher.
 * @param {http.Server} options.server - The HTTP server instance.
 * @param {express.Application} options.app - The Express application instance.
 * @param {string[]} options.pathPatterns - Array of file patterns to watch.
 */
module.exports.watch = function( options ) {
  // Extract configuration parameters for clarity and ease of use.
  var server = options.server;
  var app = options.app;
  var pathPatterns = options.pathPatterns;


  // Initialize WebSocket Server
  var wss = new WebSocketServer( { server: server } );
  var wsIdCounter = 0; // Counter for unique WebSocket client IDs.

  /* Object to keep track of active WebSocket connections. */
  var socketConnections = Object.create( null );

  wss.on( 'connection', function( ws ) {
    // Assign a unique connection ID.
    var cid = "ws" + ( ++wsIdCounter );
    socketConnections[ cid ] = ws; // Store the WebSocket connection.

    // Define behavior for when a client disconnects.
    ws.onclose = function() {
      // Remove the disconnected client from our active connections.
      delete socketConnections[ cid ];
    };
  } ); // End of wss.on('connection') handler.


  // Throttle broadcast messages to prevent overwhelming clients/server.
  var broadcast = _.throttle( function( message ) {
    console.log( "Broadcasting change notification." );

    // Iterate over all connected WebSockets and send the message.
    for ( var ws in socketConnections ) {
      socketConnections[ ws ].send( message );
    }
  }, 300 ); // Throttle rate set to 300 milliseconds.


  // Flag to indicate if a broadcast is currently in progress.
  var isBroadcastingChange = false;

  /*
   * Serve a client-side JavaScript file that establishes a WebSocket
   * connection and handles messages for live reloading.
   */
  app.get( "/watch.js", function( req, res ) {
    // Set appropriate headers for JavaScript content.
    res.writeHead( 200, { 'Content-Type': 'application/javascript' } );

    // Send the client-side script. Note: String content cannot be altered.
    res.end( "var socket = new WebSocket('ws://'+window.location.host+'/'); \n\
            socket.onmessage = function (message) { \n\
                if (message.data === '.css' || message.data == '.less') { \n\
                    console.log('Reloading css'); \n\
                    var queryString = '?reload=' + new Date().getTime(); \n\
                    $('link[rel=\"stylesheet\"]').each(function () { \n\
                        if (this.href.indexOf(\"typekit\") === -1) { \n\
                            this.href = this.href.replace(/\\?.*|$/, queryString); \n\
                        } \n\
                    }); \n\
                } else { \n\
                    window.location.reload(); \n\
                } \n\
            };" );
  } ); // End of app.get("/watch.js") handler.


  /* Initialize Gaze to watch specified file patterns for changes. */
  var gaze = new Gaze( pathPatterns );

  // Register a listener for all file system events (added, changed, deleted).
  gaze.on( 'all', function( event, filepath ) {
    // Log the type of event and the affected file's extension.
    console.log( "File changed: ", path.extname( filepath ) );

    // Broadcast the file extension to connected clients, triggering a reload.
    broadcast( path.extname( filepath ) );
  } ); // End of gaze.on('all') handler.

}; // End of module.exports.watch function definition.