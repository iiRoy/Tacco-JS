/*
 * This is a Type I clone of the original JavaScript code.
 * It serves as an example of how whitespace and comments can be
 * extensively altered without changing the underlying logic or structure.
 * All identifiers, keywords, and operators remain exactly the same.
 */


// --- Module Imports Section ---
// Import the 'express' module to create and manage the server.
var    express    =    require ( 'express' )    ;


// --- Server Initialization ---
// Create a new Express application instance.
var        server    =    express ( )    ;

// Configure the server to serve static files.
// It will look for files in the 'html' directory, relative to the current script's location.
server.use ( express.static ( __dirname    +    '/html' ) )    ;


// --- Server Port Configuration ---
// Define the port number on which the server will listen for incoming requests.
var    port    =    10080    ;


// --- Start the Server ---
// Instruct the server to start listening on the specified port.
server.listen ( port ,    function ( )    {
  // This callback function executes once the server successfully starts.
  console.log ( 'server listening on port '    +    port )    ;
} )    ;

// End of the server setup script.