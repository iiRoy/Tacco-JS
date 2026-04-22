// This entire file demonstrates various WebSocket client implementations.
// It's designed to test different connection types.

// The 'test' variable dictates which WebSocket implementation will be used.
// Possible values are: 'raw', 'socket.io', or 'nowjs'.
var test = 'raw',

    // The 'uri' variable specifies the WebSocket server address.
    // Make sure to update this URI to your actual WebSocket endpoint.
    uri = 'ws://ws.websocketstest.com:80/service'; // Default testing service URI.

// --- Section: Plain WebSockets Example ---
// This block handles the 'raw' WebSocket implementation using 'net.iamyellow.tiws'.

if ( 'raw' === test ) {
  // Initialize a new WebSocket instance.
  var WS = require( 'net.iamyellow.tiws' ).createWS();

  // Attach an event listener for when the WebSocket connection is successfully opened.
  WS.addEventListener( 'open', function() {
    Ti.API.debug( 'WebSocket connection established.' );
  } );

  // Attach an event listener for when the WebSocket connection is closed.
  // It logs the closure code and reason.
  WS.addEventListener( 'close', function( e ) {
    Ti.API.info( "WebSocket closed - Code: " + e.code + " Reason: " + e.reason );
  } );

  // Attach an event listener for any errors occurring on the WebSocket.
  WS.addEventListener( 'error', function( e ) {
    Ti.API.error( "WebSocket encountered an error: " + e.error );
  } );

  // Declare variables to store protocol version and stream count.
  var proto_version;
  var stream_cnt = 0;

  // Attach an event listener for incoming messages from the WebSocket server.
  WS.addEventListener( 'message', function( e ) {
    // Log the received message data.
    Ti.API.log( "Received message: " + e.data );

    // Parse the message data, assuming it's comma-separated.
    arr = e.data.split( ',', 2 );
    cmd = arr[ 0 ];      // The command part of the message.
    response = arr[ 1 ]; // The response part of the message.

    // Handle different commands received from the server.
    if ( cmd == 'connected' ) {
      Ti.API.log( "Server responded with 'connected': " + response );
      // If connected, request the server's version.
      WS.send( "version," );
    }
    else if ( cmd == 'version' ) {
      Ti.API.log( "Server responded with 'version': " + response );
      // Store the received protocol version.
      proto_version = response;
      // After getting version, send an echo message.
      WS.send( "echo,test message" );
    }
    else if ( cmd == 'echo' && response == 'test message' ) {
      Ti.API.log( "Server responded with 'echo': " + response );
      // If echo is successful, decide next action based on protocol version.
      if ( proto_version == 'hybi-draft-07' ) {
        WS.send( "ping," ); // Send ping for this protocol version.
      }
      else {
        WS.send( "timer," ); // Send timer for other versions.
      }
    }
    else if ( cmd == 'time' ) {
      // Increment stream count for 'time' messages.
      stream_cnt = stream_cnt + 1;
      Ti.API.log( "Server responded with 'time': " + response );
      // If enough 'time' messages received, close connection and alert success.
      if ( stream_cnt > 3 ) {
        WS.close();
        alert( 'Looks like the raw WebSocket communication is functioning correctly.' );
      }
    }
  } );

  // Open the WebSocket connection to the specified URI with optional subprotocols.
  WS.open( uri, [ "echo-protocol", "other-proto" ] );
}

// --- Section: Socket.IO Example ---
// This block demonstrates using Socket.IO, which leverages WebSockets.

else if ( 'socket.io' === test ) {
  // Require the Socket.IO client library and connect to the URI.
  var io = require( 'socket.io' ),
      socket = io.connect( uri );

  // Set up an event listener for Socket.IO's 'connect' event.
  socket.on( 'connect', function() {
    Ti.API.log( 'Socket.IO connection established!' );
  } );
}

// --- Section: Now.js Example ---
// This block illustrates using Now.js, which builds on Socket.IO and WebSockets.

else if ( 'nowjs' === test ) {
  // Initialize Now.js with the URI and specific Socket.IO options.
  var now = require( 'now' ).nowInitialize( uri, {
    // Socket.IO configuration options.
    socketio: {
      transports: [ 'websocket' ] // Force WebSocket transport.
    }
  } );

  // Attach an event listener for Now.js core errors.
  now.core.on( 'error', function() {
    Ti.API.error( 'Now.js core error occurred!' );
  } );

  // Attach an event listener for when Now.js is ready.
  now.core.on( 'ready', function() {
    Ti.API.log( 'Now.js is now ready for interaction.' );
  } );

  // Attach an event listener for when Now.js disconnects.
  now.core.on( 'disconnect', function() {
    Ti.API.log( 'Now.js connection disconnected.' );
  } );

  // Example of Now.js data bindings: setting a user ID.
  now.userID = '4815162342';

  // Example of Now.js data bindings: defining a remote function.
  now.whatLiesInTheShadowOfTheStatue = function() {
    return 'ille qui nos omnes servabit';
  };
}