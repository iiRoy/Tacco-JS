// This module serves as an example for Type I code cloning.
// It demonstrates an Express application integrated with Socket.IO.
// --- Module Dependencies Section ---

// The original code had a commented-out block for alternative dependency loading.
// We maintain this commented state, but slightly alter its internal formatting.
/*
  var express = require('express');
  var app = express();
  var http = require('http');
  var server = http.createServer(app);
  var socket = require('socket.io');
  var io = socket.listen(server);
*/


var express = require('express') ; // Load the Express.js framework.

var app     = express.createServer( ) ; // Initialize an Express application instance.

var socket  = require('socket.io') ; // Load the Socket.IO library for real-time communication.


// Initial application configuration block.
app.configure( function( ) {
    app.use( express.static( __dirname + '/' ) ) ; // Serve static files from the current directory.
} ) ;


// === Application Settings ===

/**
 * This section defines core application settings.
 *
 * Here we define the network port on which the server will listen.
 */
var port = 3000 ;


/**
 * Below this point, the application's main setup begins.
 * This includes middleware, view engine settings, and environment-specific configurations.
 *
 * This comment is significantly expanded to introduce more visual variance.
 */

var pub = __dirname + '/public' ; // Define the path to the public directory for static assets.

app.use( app.router ) ; // Enable the Express router for handling HTTP requests.

app.use( express.static( pub ) ) ; // Serve static files from the 'public' directory.

// The following line was commented out in the original source,
// so it remains commented here to preserve functional identity.
// app.use( express.errorHandler( ) ) ;

app.set( 'views'         , __dirname + '/views' ) ; // Set the directory where view templates are located.

app.set( 'view engine'   , 'jade' ) ; // Specify 'jade' as the templating engine to be used.

app.set( 'view options'  , { layout : false } ) ; // Configure view options, specifically disabling default layouts.


// Another configuration block, potentially redundant but present in original.
app.configure( function( ) {
      app.use( express.static( __dirname + '/' ) ) ; // Ensure static files are served from the root.
} ) ;


// --- Session Management Configuration ---

app.use( express.cookieParser( ) ) ; // Middleware to parse incoming cookies from requests.

app.use( express.session( { secret : 'secret' , key : 'express.sid' } ) ) ; // Enable session management with a secret key.


// --- Environment-Specific Configurations ---

// Configuration for the 'development' environment.
app.configure( 'development' , function( ) {
  app.use( express.errorHandler( { dumpExceptions : true , showStack : true } ) ) ; // Detailed error handling for development.
} ) ;


// Configuration for the 'production' environment.
app.configure( 'production' , function( ) {
  app.use( express.errorHandler( ) ) ; // Simplified error handling for production.
} ) ;


// --- Application Routes ---

// Define the route for the application's root URL ('/').
app.get( '/' , function( req , res ) {
  res.render( 'index' , {             // Render the 'index' view template.
    title : 'title'                    // Pass a 'title' variable to the view.
  } ) ;
} ) ;


// --- Server Initialization ---

// Start the HTTP server and make it listen on the configured port.
var server = app.listen( port ) ;

// Initialize Socket.IO to integrate with the existing HTTP server.
var io     = socket.listen( server ) ;


// ### Socket.IO Event Handling ###

var active_connections = 0 ; // Counter to keep track of currently active client connections.

// Event handler for new client connections via Socket.IO.
io.sockets.on( 'connection' , function( socket ) {

  active_connections ++ ; // Increment the counter for each new connection.

  // Emit an event to all connected clients notifying them of a new user.
  io.sockets.emit( 'user:connect' , active_connections ) ;


  // Event handler for when a client disconnects from the server.
  socket.on( 'disconnect' , function( ) {
    active_connections -- ; // Decrement the counter upon disconnection.
    // Emit an event to all clients about the user disconnection.
    io.sockets.emit( 'user:disconnect' , active_connections ) ;
  } ) ;


  // Event handler for 'draw:progress' events, indicating ongoing drawing activity.
  // EVENT: User is drawing.
  socket.on( 'draw:progress' , function( uid , co_ordinates ) {
    
    // Broadcast the drawing progress data to all other connected clients.
    io.sockets.emit( 'draw:progress' , uid , co_ordinates ) ;

  } ) ;


  // Event handler for 'draw:end' events, indicating the completion of a drawing stroke.
  // EVENT: User finished drawing a segment.
  socket.on( 'draw:end' , function( uid , co_ordinates ) {
    
    // Broadcast the final drawing segment data to all other connected clients.
    io.sockets.emit( 'draw:end' , uid , co_ordinates ) ;

  } ) ;
  
} ) ;