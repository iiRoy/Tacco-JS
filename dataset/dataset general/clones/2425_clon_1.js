/*
 * This is a Type I code clone generated to demonstrate variations
 * solely through whitespace and comments, while maintaining
 * exact logical and structural equivalence to the original source.
 *
 * All identifiers, operators, expressions, and the overall program flow
 * remain perfectly unchanged.
 */

// Core server dependencies initialization
var app = require('express') (); // Initialize the Express application instance.

var server = require('http') .createServer(app) ; // Create an HTTP server and bind it to the Express app.

var webRTC = require('webrtc.io') .listen(server) ; // Set up the WebRTC signaling server, listening on the HTTP server.



// Configuration for the server port.
var port = process.env.PORT || 8080 ; // Use environment variable PORT if available, otherwise default to 8080.

server.listen(port) ; // Start the HTTP server, making it listen for incoming requests on the specified port.

// --- HTTP Route Definitions ---
// These routes handle requests for static files and the main application page.


app.get( '/' ,  function ( req ,  res )  {
  // Serve the main HTML file for the root URL.
  res.sendfile(__dirname + '/index.html') ;
} ) ;


app.get( '/style.css' ,  function ( req ,  res )  {
  // Serve the application's stylesheet.
  res.sendfile(__dirname + '/style.css') ;
} ) ;


app.get( '/fullscrean.png' ,  function ( req ,  res )  {
  // Serve an image file used in the application.
  res.sendfile(__dirname + '/fullscrean.png') ;
} ) ;


app.get( '/script.js' ,  function ( req ,  res )  {
  // Serve the client-side JavaScript logic.
  res.sendfile(__dirname + '/script.js') ;
} ) ;


app.get( '/webrtc.io.js' ,  function ( req ,  res )  {
  // Serve the client-side WebRTC library.
  res.sendfile(__dirname + '/webrtc.io.js') ;
} ) ;


// --- WebRTC Signaling Event Handlers ---
// This section defines how the server processes real-time communication events.

webRTC.rtc.on( 'chat_msg' ,  function ( data ,  socket )  {
  // This event handler is triggered whenever a client sends a 'chat_msg'.
  // Its purpose is to relay the message to all other participants in the same room.


  var roomList = webRTC.rtc.rooms[data.room] || [] ; // Retrieve the list of active socket IDs for the specified chat room.
                                                      // If the room doesn't exist or is empty, an empty array is used.

  // Loop through each connected client (socket) in the identified room.
  for ( var i = 0 ; i < roomList.length ; i++ ) {
      var socketId = roomList[i] ; // Get the unique identifier for the current socket.

      // We must ensure that the message is not sent back to the client that originated it.
      if ( socketId !== socket.id ) {
          var soc = webRTC.rtc.getSocket(socketId) ; // Fetch the actual socket object corresponding to the ID.

          // Verify that the target socket is still active and connected before attempting to send data.
          if ( soc ) {
              // Prepare the message payload as a JSON string for transmission.
              // This structure is understood by the client-side `webrtc.io` library.
              soc.send(JSON.stringify({
                  "eventName": "receive_chat_msg", // The name of the event the client-side will listen for.
                  "data": {
                    "messages": data.messages, // The actual chat message content.
                    "color": data.color // The color associated with the sender of the message.
                  }
                }),  function ( error )  {
                    // This callback function handles any potential errors that might occur during message transmission.
                    if ( error ) {
                      console.log(error) ; // Log the error to the console if something goes wrong.
                    }
                }
              ) ; // End of the 'soc.send' method call.
          } // End of the 'if (soc)' condition.
      } // End of the 'if (socketId !== socket.id)' condition.
  } // End of the 'for' loop iterating through room participants.

} ) ; // End of the 'webRTC.rtc.on('chat_msg')' event handler definition.