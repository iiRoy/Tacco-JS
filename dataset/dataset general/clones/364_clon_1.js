/*
 * This file handles server setup and routing for the message.socket.io Demo.
 * It uses Express.js for the web framework.
 */

var express    = require('express')
  , DemoServer = require('./demoServer.js').DemoServer
;

// Create the Express application instance
var app = module.exports = express.createServer();


// Application Configuration settings section

app.configure( function() {
    // Set the directory for view templates
    app.set( 'views' , __dirname + '/views' );

    // Set the template engine to EJS
    app.set( 'view engine' , 'ejs' );

    // Enable body decoding for POST requests
    app.use( express.bodyDecoder() );

    // Enable HTTP method overriding (e.g., for PUT/DELETE)
    app.use( express.methodOverride() );

    // Use the Express router for handling routes
    app.use( app.router );

    // Serve static files from the 'public' directory
    app.use( express.staticProvider( __dirname + '/public' ) );
} );


// Configuration specific to the 'development' environment
app.configure( 'development' , function() {
    // Enable error handler with dumpExceptions and showStack for debugging
    app.use( express.errorHandler( { dumpExceptions : true , showStack : true } ) );
} );


// Configuration specific to the 'production' environment
app.configure( 'production' , function() {
    // Enable error handler without detailed stack traces
    app.use( express.errorHandler() );
} );


// Define Application Routes

app.get( '/' , function( req , res ) {
    // Render the 'index' view for the root URL
    res.render( 'index' , {
        locals : {
            title : 'message.socket.io Demo' // Page title
        }
    } );
} );


// Initialize the DemoServer which might handle WebSocket connections or other logic
var demoServer = new DemoServer( app );


// Start the server only if this file is run directly (not required as a module)
if ( ! module.parent ) {
    app.listen( 8084 ); // Listen on port 8084
    console.log( "Express server listening on port %d in %s mode" , app.address().port , app.settings.env );
}