// Enforce strict mode for cleaner, safer JavaScript code execution.
'use strict' ;


// Import necessary modules for the application.
var express = require( 'express' ) ; // The core Express framework.
var app     = express( ) ; // Instantiate the Express application.
var port    = 3000 ;       // Default server port number.


// Set up the Handlebars templating engine.
var exphbs = require( 'express3-handlebars' ) ;
var hbs ; // Declared but not initialized/used here.


// Enable GZIP compression for all outgoing responses.
app.use( express.compress( ) ) ;


// Conditional configuration based on the environment.
// This distinguishes between production and development setups.
if ( process.env.NODE_ENV === 'production' )
{
  // Production environment configuration.
  app.engine( 'handlebars', exphbs( {
    defaultLayout : 'main',                       // Main layout file.
    layoutsDir    : 'dist/views/layouts/',        // Path to layouts.
    partialsDir   : 'dist/views/partials/'        // Path to partials.
  } ) ) ;

  // Set the views directory for production builds.
  app.set( 'views', __dirname + '/dist/views' ) ;
  
  // Serve static assets from the 'dist/assets' folder.
  app.use( express.static( __dirname + '/dist/assets' ) ) ;
}
else
{
  // Development environment configuration.
  app.engine( 'handlebars', exphbs( {
    defaultLayout : 'main',                   // Default layout for dev.
    layoutsDir    : 'views/layouts/',         // Dev layouts path.
    partialsDir   : 'views/partials/'         // Dev partials path.
  } ) ) ;

  // Configure views directory for development.
  app.set( 'views', __dirname + '/views' ) ;
  
  // Serve static assets from the 'assets' folder during development.
  app.use( express.static( __dirname + '/assets' ) ) ;
}


// Finalize Handlebars as the primary view engine.
app.set( 'view engine', 'handlebars' ) ;


// Define application routes.
// ---

// Handles requests to the root URL ("/").
app.get( '/', function ( request, response, next )
{
  // Render the 'index' template.
  response.render( 'index' ) ;
} ) ;


// Start the Express server.
// ---

// Listen on the specified port or the environment-defined PORT.
app.listen( process.env.PORT || port ) ;

// Console output confirming server startup.
console.log( 'Express started on port ' + port ) ;