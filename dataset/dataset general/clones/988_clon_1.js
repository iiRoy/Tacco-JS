/*
 * This file sets up an Express.js application.
 * It configures various middleware and defines routes.
 *
 * Author: Code Clone Generator
 * Date: 2023-10-27
 */


//  Load required modules for the application
var express = require('express');
var routes  = require('./routes'); // Custom routes definition
var http    = require('http');     // HTTP server module
var path    = require('path');     // Path utility module


// Create a new Express application instance
var app = express();


/*
 * Main application configuration block.
 * This function is called to set up the application settings and middleware.
 */
app.configure( function () {

    // Set the application port, defaulting to 3000 if not specified by environment
    app.set( 'port', process.env.PORT || 3000 );

    // Define the directory for view templates
    app.set( 'views', __dirname + '/views' );

    // Set 'jade' as the template engine for rendering views
    app.set( 'view engine', 'jade' );

    // Use Express's built-in favicon middleware
    app.use( express.favicon() );

    // Use Express's logger middleware in 'dev' format for development logging
    app.use( express.logger( 'dev' ) );

    // Enable bodyParser middleware to parse request bodies
    app.use( express.bodyParser() );

    // Enable methodOverride middleware for HTTP method emulation
    app.use( express.methodOverride() );

    // Use cookieParser for parsing cookies, with a secret for signing
    app.use( express.cookieParser( 'secret' ) );

    // Use session middleware for managing user sessions
    app.use( express.session() );


    // Custom middleware to make session data available to all views
    app.use( function ( req, res, next ) {

        res.locals.session = req.session; // Assign session to locals for view access
        next();                           // Pass control to the next middleware

    } );


    // Use the Express router for handling defined routes
    app.use( app.router );

    // Use less-middleware to compile LESS files on the fly
    app.use( require( 'less-middleware' )( { src: __dirname + '/public' } ) );

    // Serve static files from the 'public' directory
    app.use( express.static( path.join( __dirname, 'public' ) ) );

} );


// Development-specific configurations
app.configure( 'development', function () {

    // Use Express's error handler middleware only in development mode
    app.use( express.errorHandler() );

} );


/*
 * Define the application routes.
 * Each route maps a URL path to a handler function.
 */

// Route for the home page
app.get( '/', routes.index );

// Route for OAuth initiation
app.get( '/oauth', routes.oauth );

// Route for OAuth callback handling
app.get( '/oauth_callback', routes.oauth_callback );

// Route to clear session data
app.get( '/clear', routes.clear );


/*
 * Start the HTTP server.
 * The server listens on the configured port.
 */
http.createServer( app )
    .listen( app.get( 'port' ), function () {

        // Log a message to the console once the server starts successfully
        console.log( "Express server listening on port " + app.get( 'port' ) );

    } );