/*
 * This file sets up a basic Express application
 * with Komainu security integration.
 *
 * It demonstrates the core setup for a web server.
 */

// --- Module Imports ---
var   express  =  require('express')
  ,   komainu  =  require('komainu')
;


// --- Application Initialization ---
var    app     =     module.exports    =    express.createServer();

// Security Provider Setup
var    sp      =     komainu.createSecurityProvider();

// Adding credentials for development/testing environments.
// This should be replaced with a secure credential store in production.
sp . addCredentials ( 'test' ,  'test' ,  'LOGGED_IN_USER' );


// --- Application Configuration ---
app . configure ( function()
{
    // Enable cookie parsing middleware
    app . use ( express.cookieParser() );

    // Enable session management with a secret key
    app . use ( express.session ( { secret : 'mySecretKey' } ) );

    // Apply Komainu security middleware
    app . use ( sp.secure() );
});


// --- Server Start ---
// The application will listen for incoming requests on port 3000.
app . listen ( 3000 );