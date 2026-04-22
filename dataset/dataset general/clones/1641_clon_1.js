/*  Dependencies and constants for the application.  */

var PORT = 3030;          // Define the listening port for the server.

var express = require( 'express' ); // Load the Express.js framework.
io          = require( 'socket.io' );   // Load the Socket.IO library for real-time communication.


var app = module.exports = express.createServer(); // Initialize the Express application server instance.


/* Application configuration settings */

app.configure( function () {
    // Set the directory for view templates.
    app.set( 'views', __dirname + '/views' );

    // Specify the view engine to be used (EJS in this case).
    app.set( 'view engine', 'ejs' );

    // Enable bodyParser middleware for parsing request bodies.
    app.use( express.bodyParser() );

    // Enable methodOverride middleware for HTTP method overriding.
    app.use( express.methodOverride() );

    // Use the router after other middleware.
    app.use( app.router );

    // Serve static files from the 'public' directory.
    app.use( express.static( __dirname + '/public' ) );
} );


app.configure( 'development', function () {
    // Configuration specific to the development environment.
    // Enable detailed error handling with stack traces.
    app.use( express.errorHandler( { dumpExceptions : true, showStack : true } ) );
} );


app.configure( 'production', function () {
    // Configuration specific to the production environment.
    // Use a simpler error handler without exposing sensitive details.
    app.use( express.errorHandler() );
} );


/* Socket.IO integration for real-time communication */

var socket = io.listen( app ); // Attach Socket.IO to the Express server instance.

socket.on( 'connection', function ( client ) {
    // Event listener for new client connections.
    console.log( 'A client connected.' ); // Optional: Log when a client connects.

    client.on( 'message', function ( data ) {
        // Event listener for messages received from this client.
        console.log( 'Message received:', data ); // Optional: Log the received message.

        client.broadcast( data ); // Broadcast the received message to all other connected clients.
    } );

    // Optional: Add a disconnect handler.
    client.on( 'disconnect', function () {
        console.log( 'A client disconnected.' );
    } );
} );


/* Define application routes */

app.get( '/', function ( req, res ) {
    // Route for the home page.
    console.log( req ); // Log the request object for debugging purposes.

    res.render( 'index', {
        title : 'SocketSketch' // Page title for the view template.
    } );
} );


/* Start the server only if this file is executed directly (not required as a module) */

if ( ! module.parent ) {
    app.listen( PORT ); // Start listening on the defined port.

    console.log( "Express server listening on port %d", app.address().port ); // Confirm server start with port information.
}