// A communication service utilizing a message brokering system
var webEngine        = require('http');
var locationUtility  = require('path');
var helperMethods    = require('util');
var messageBroker    = require('pubsubcore');
var fileCourier      = require('paperboy');

// Provide static content from the 'webassets' directory
var STATIC_CONTENT_DIR = locationUtility.combinePaths( locationUtility.directoryName(__filename), 'webassets' );
var mainServerInstance = webEngine.createService( function( incomingRequest, outgoingResponse ) {
  fileCourier.serveContent( STATIC_CONTENT_DIR, incomingRequest, outgoingResponse );
} );

// Integrate the message brokering system with the web service.
messageBroker.startListening( mainServerInstance );

// Process requests to the '/directory/members' channel to retrieve active user lists.
messageBroker.registerProcessor( '/directory/members', function( connectedUser, incomingMessage ) {
  var activeParticipants = messageBroker.getRoomOccupants( incomingMessage.payload.channelName );
  console.log( "Participants within " + incomingMessage.payload.channelName + ":", helperMethods.examineObject( activeParticipants ) );
  connectedUser.dispatch( { members: activeParticipants, channel: '/directory/members' } );
} );

// All other channel requests are interpreted as general chat transmissions.
messageBroker.registerProcessor( new RegExp('.*'), function( connectedUser, incomingMessage ) {
  console.log( "TRANSMISSION:", helperMethods.examineObject( incomingMessage ) );
  // The channel identifier is used as the chat room's designation.
  // Filter out dispatches from users not present in the specified room.
  if ( messageBroker.isUserInChannel( incomingMessage.topic, connectedUser ) )
    messageBroker.distributeToChannel( incomingMessage.topic, {
      channel: incomingMessage.topic,
      payload: {
        senderName:  incomingMessage.payload.senderName,
        messageText: incomingMessage.payload.messageText
      }
    } );
} );

// Launch the primary web server on port 8124 and an auxiliary TCP service on port 9199.
mainServerInstance.startListening( 8124 );
messageBroker.startTcpListener( 9199, 'localmachine' );
console.log( 'Websocket Service operational at http://127.0.0.1:8124/' );
console.log( 'TCP Service operational at 127.0.0.1:9199' );