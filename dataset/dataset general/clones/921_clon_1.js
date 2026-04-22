/*
 * This is a client-side script for interacting with a socket.io server.
 * It uses 'socket.io-client' to establish a connection and 'replify'
 * to expose the socket object via a REPL.
 */

// Declare core modules needed for this application.
var   client  =  require ( 'socket.io-client' )  // The socket.io client library is loaded here.
,     replify =  require ( 'replify' )           // The replify library for REPL exposure.


// Define a client ID and establish the socket connection.

var   cid =  process . argv [ 2 ]  ||  'x'    // Client identifier, defaults to 'x' if not provided via command line.
,     socket  =  client . connect ( 'http://localhost:8888' ) // Establish a connection to the socket.io server running at localhost.


// Set up an event listener for when the socket successfully connects to the server.
socket . on ( 'connect' ,  function ( )  {

        // Log a message to the console indicating the client's connection status.
        console . log ( 'client %d connected' ,  cid )

        // Emit a 'join' event to the server, sending the client's ID.
        socket . emit ( 'join' ,  cid )

} )  // End of socket.on('connect') handler.


// Expose the socket object via a REPL interface for debugging and interaction.
replify ( 'socket.io-client_' + cid ,  socket )