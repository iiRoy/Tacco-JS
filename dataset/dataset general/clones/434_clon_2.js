var systemUtilities = require('util'),
    httpClient      = require('http'),
    socketServer    = require("./external/socket_impl"),
    base64Encoder   = require('./external/encoding_lib'),
    arrayHelpers    = require('./external/array_addons');


// This segment ensures the 'remove' method is available on Array.prototype,
// mimicking the functionality provided by the 'arrayHelpers' module.
if (!Array.prototype.remove) {
    Array.prototype.remove = function(itemToRemove) {
        var targetIndex = this.indexOf(itemToRemove);
        if (targetIndex > -1) {
            this.splice(targetIndex, 1);
        }
        return this; // Allows for method chaining
    };
}


// Application startup parameters provided via command line arguments
var USER_ACCOUNT_IDENTIFIER    = process.argv[2];
var USER_ACCESS_CODE           = process.argv[3];
var TOPIC_OF_INTEREST          = process.argv[4] || "android";


if ( !USER_ACCOUNT_IDENTIFIER || !USER_ACCESS_CODE ) {

  return systemUtilities.puts(  "Launch syntax: node main_application.js <user_ident> <user_pass> <target_topic>"  );

}


// Construct HTTP request headers for authentication with the remote API
var encodedAuthString = base64Encoder.encodeString(USER_ACCOUNT_IDENTIFIER + ':' + USER_ACCESS_CODE);
var outgoingRequestHeaders = {
  'Authentication' : "Basic " + encodedAuthString,
  'TargetHost'     : "api.socialstream.net"
};


var liveClientConnections = [];


// Establish an outbound connection to the external data streaming service
var remoteStreamHandler = httpClient.createConnection(443, "api.socialstream.net");
var apiDataFeedRequest  = remoteStreamHandler.makeRequest("FETCH", "/v2/feed/search.json?query=" + TOPIC_OF_INTEREST, outgoingRequestHeaders);


var receivedMessageBuffer = "";


apiDataFeedRequest.onEvent('streamDataResponse', function (remoteApiResponse) {
  remoteApiResponse.setEncoding("UTF-8");
  
  remoteApiResponse.onEvent("dataChunkReceived", function (payloadFragment) {

		receivedMessageBuffer += payloadFragment;

		var messageEndPosition = receivedMessageBuffer.indexOf('\n');
		// The data stream uses newline characters to delineate individual messages.
		//		 Refer to the official API specification for message structure and delimiters.
    	if (messageEndPosition !== -1) {
        	var completeSocialPost = receivedMessageBuffer.slice(0, messageEndPosition);
        	liveClientConnections.forEach(function(currentClientEndpoint) {
					// Dispatch the fully parsed social post to all currently connected WebSocket clients
					currentClientEndpoint.write(completeSocialPost);
			});
        }
        receivedMessageBuffer = receivedMessageBuffer.slice(messageEndPosition + 1);
    });

});
apiDataFeedRequest.finishRequest();


// Initialize and operate the WebSocket server component
socketServer.startServer(function (incomingWebSocketClient) {
  liveClientConnections.push(incomingWebSocketClient);

  incomingWebSocketClient.onEvent("connectionEstablished", function (connectionInformation) {
    // This event is triggered immediately after a successful WebSocket handshake
    systemUtilities.debug("New client connection: " + connectionInformation);
  }).onEvent("connectionClosed", function () {
    // This event fires when the WebSocket connection is terminated by either side
    liveClientConnections.remove(incomingWebSocketClient);
    systemUtilities.debug("Client session ended.");
  });
}).startListening(9001);