var webApp = require('express')();
var httpServer = require('http').createServer(webApp);
var realtimeComm = require('webrtc.io').listen(httpServer);

var systemPort = process.env.PORT || 8080;

httpServer.listen(systemPort);

// Define routes for serving static files
webApp.get('/', function(incomingReq, outgoingRes) {
  outgoingRes.sendfile(__dirname + '/index.html');
});

webApp.get('/style.css', function(incomingReq, outgoingRes) {
  outgoingRes.sendfile(__dirname + '/style.css');
});

webApp.get('/fullscrean.png', function(incomingReq, outgoingRes) {
  outgoingRes.sendfile(__dirname + '/fullscrean.png');
});

webApp.get('/script.js', function(incomingReq, outgoingRes) {
  outgoingRes.sendfile(__dirname + '/script.js');
});

webApp.get('/webrtc.io.js', function(incomingReq, outgoingRes) {
  outgoingRes.sendfile(__dirname + '/webrtc.io.js');
});

// Event handler for real-time chat messages
realtimeComm.rtc.on('chat_msg', function(messagePayload, senderSocket) {
  // Retrieve all members within the specified chat room
  var roomMembers = realtimeComm.rtc.rooms[messagePayload.room] || [];

  // Iterate over each member in the room
  for (var clientIndex = 0; clientIndex < roomMembers.length; clientIndex++) {
    var targetClientId = roomMembers[clientIndex];

    // Do not send the message back to the original sender
    if (targetClientId !== senderSocket.id) {
      // Get the actual socket connection for the recipient
      var recipientConnection = realtimeComm.rtc.getSocket(targetClientId);

      // If the recipient connection is valid, send the message
      if (recipientConnection) {
        recipientConnection.send(JSON.stringify({
          "eventName": "receive_chat_msg",
          "data": {
            "messages": messagePayload.messages,
            "color": messagePayload.color
          }
        }), function(transmissionError) {
          // Handle any errors that occur during message transmission
          if (transmissionError) {
            console.log(transmissionError);
          }
        });
      }
    }
  }
});