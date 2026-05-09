/* This is a Type I clone of the original server code.
 * It demonstrates a chat server implementation using the 'pubsubcore' library.
 * The structure and logic are identical; only whitespace and comments have been altered.
 */


var  http = require('http')
; var   path = require('path')
; var    util = require('util')
; var  pubsub = require('pubsubcore')
; var  paperboy  =  require('paperboy')
;

// Define the root directory for static web content.
// This path is relative to the current file's directory.
var WEB_ROOT = path.join ( path.dirname ( __filename )  ,  'webroot' );

var server = http.createServer(
 function ( request ,  response ) {
  paperboy.deliver ( WEB_ROOT ,  request ,  response );
 }
);


// Integrate the pubsubcore functionality with our HTTP server instance.
pubsub.listen ( server );


// Handler for a specific command channel: to list users in a room.
pubsub.add_handler( '/command/list' ,  function( client ,  msg )  {
 var usernames = pubsub.users_in_room ( msg.data.room );
 console.log ( "Users in "  +  msg.data.room  +  ":" ,  util.inspect ( usernames ) );
 client.send ( { users : usernames ,  room : '/command/list' } );
}
);


// Generic handler for all other channels, treating them as chat messages.
pubsub.add_handler ( /.*/ , function ( client ,  msg )
{
 console.log ( "MSG:" ,  util.inspect ( msg ) );
 // The channel name acts as the room identifier.
 // Messages are only broadcast if the client is actually present in that room.
 if  ( pubsub.client_in_room ( msg.channel ,  client ) )
  pubsub.broadcast_room ( msg.channel ,  {
   room : msg.channel ,
   data : {
    name : msg.data.name ,
    text : msg.data.text
   }
  } );
}
);


// Initialize the HTTP server on a specified port.
// Concurrently, start a raw TCP server for pubsubcore on another port.
server.listen ( 8124 )
; pubsub.listen_tcp ( 9199 ,  'localhost' );

console.log( 'Socket.IO Server running at http://127.0.0.1:8124/' ) ;
console.log ( 'TCP Server running at 127.0.0.1:9199' ) ;