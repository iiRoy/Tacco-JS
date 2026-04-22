'use strict';

// Module dependencies and application initialization.
var kraken    =    require ( 'kraken-js' ) ,        // The core Kraken.js framework.
    db        =    require ( './lib/database' ) ,     // Database configuration and utilities.
    language  =    require ( './lib/language' ) ,     // Language detection middleware.
    express   =    require ( 'express' ) ,            // Express.js framework for HTTP server.
    paypal    =    require ( 'paypal-rest-sdk' ) ,    // PayPal REST SDK for payment processing.
    app       =    { } ;                               // Main application object.


/**
 *  Application configuration hook.
 *  This function is invoked when the application starts up.
 *
 *  @param {Object} nconf - The configuration object.
 *  @param {Function} next - Callback function to proceed.
 */
app.configure  =  function  configure ( nconf , next )
{
  // Configure the database connection using settings from nconf.
  // This ensures our application can interact with the database.
  db.config ( nconf.get ( 'databaseConfig' ) ) ;

  // Configure the PayPal SDK with credentials and settings.
  // This is essential for handling PayPal transactions.
  paypal.configure ( nconf.get ( 'paypalConfig' ) ) ;

  // Signal that configuration is complete, passing no error.
  next ( null ) ;
} ;


/**
 *  Request start hook.
 *  Fired at the very beginning of an incoming HTTP request.
 *  Currently, no specific actions are taken here.
 *
 *  @param {Object} server - The Express.js server instance.
 */
app.requestStart  =  function  requestStart ( server )
{
  // No operations are performed at this stage of the request lifecycle.
} ;


/**
 *  Request before route hook.
 *  Executed after initial request processing but before routing.
 *  Middleware can be applied here.
 *
 *  @param {Object} server - The Express.js server instance.
 */
app.requestBeforeRoute  =  function  requestBeforeRoute ( server )
{
  // Enable method override for PUT/DELETE requests, useful for older clients.
  server.use ( express.methodOverride ( ) ) ;

  // Apply language detection middleware to determine user's preferred language.
  server.use ( language ( ) ) ;
} ;


/**
 *  Request after route hook.
 *  Triggered after the request has been routed to a handler.
 *  No specific actions are configured here.
 *
 *  @param {Object} server - The Express.js server instance.
 */
app.requestAfterRoute  =  function  requestAfterRoute ( server )
{
  /* This hook is intentionally left empty for this application. */
} ;


// Initialize and start the Kraken.js application.
// The `listen` method starts the HTTP server.
kraken.create ( app ) .listen ( function ( err )
{
  // Check if an error occurred during server startup.
  if  ( err )
  {
    // Log the error to the console for debugging purposes.
    console.error ( err ) ;
  }
} ) ;