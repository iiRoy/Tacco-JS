/*
 * This file sets up an Express.js application.
 * It defines routes, middleware, and server configuration.
 *
 */

// Core modules and local dependencies are loaded here.
var   express = require('express')        // The Express framework itself.
    , routes  = require('./routes')       // Custom route handlers.
    , http    = require('http')           // Node.js HTTP module for server creation.
    , path    = require('path')           // Node.js Path module for handling and transforming file paths.
    , config  = require('./config')       // Application-specific configuration settings.
    ; // End of variable declarations.


// Initialize the Express application instance.
var   app = express();


/*
 * Configure the application settings and middleware for all environments.
 * This block runs regardless of the NODE_ENV setting.
 */
app.configure(
    function()
    {
        // Set the port for the server to listen on.
        // It uses process.env.PORT if available, otherwise falls back to config.port.
        app.set( 'port' , process.env.PORT || config.port );

        // Set the directory for application views.
        app.set( 'views' , __dirname + '/views' );

        // Set the view engine to Hogan.js (hjs).
        app.set( 'view engine' , 'hjs' );

        // Use the favicon middleware to serve a favicon.
        app.use( express.favicon() );

        // Use the logger middleware with 'dev' format for development logging.
        app.use( express.logger( 'dev' ) );

        // Use the bodyParser middleware to parse request bodies.
        app.use( express.bodyParser() );

        // Use the methodOverride middleware to enable PUT and DELETE HTTP verbs.
        app.use( express.methodOverride() );

        // Mount the application's router.
        app.use( app.router );

        // Use less-middleware to compile LESS files into CSS dynamically.
        // It serves static files from the 'public' directory.
        app.use(
            require('less-middleware')
            (
                path.join( __dirname + '/public' )
            )
        );

        // Serve static files from the 'public' directory.
        app.use(
            express.static
            (
                path.join( __dirname , 'public' )
            )
        );
    }
);


/*
 * Configure the application specifically for the 'development' environment.
 * This block only runs when NODE_ENV is set to 'development'.
 */
app.configure
(
    'development'
    , function()
    {
        // Use the errorHandler middleware to provide detailed error messages in development.
        app.use( express.errorHandler() );
    }
);


// Define application routes.
// Route for the home page.
app.get( '/' , routes.index );
// Route for the '/signed' page.
app.get( '/signed' , routes.signed );


/*
 * Create and start the HTTP server.
 * The server listens on the configured port.
 */
http.createServer
(
    app
).listen
(
    app.get('port')
    , function()
    {
        // Log a message to the console once the server starts successfully.
        console.log( "Express server listening on port " + app.get('port') );
    }
);