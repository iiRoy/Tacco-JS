/*
 * Application Configuration Settings
 */

/*
 * Web Service Host Parameters
 */
var _routePath = '/distribute'; // The URI endpoint for receiving data
var _serverPort = 9000;       /* The network port for the HTTP server to listen on */
var _serverAddress = '0.0.0.0'; // Specifies the network interface to bind to ('0.0.0.0' for all)

/*
 * Message Receiver (Redis Subscriber) Database Configuration
 */
var _topicFilter = '*'; /* Wildcard pattern for message topic subscriptions */
var _receiveDbHost = '127.0.0.1'; // The IP address of the Redis instance used for subscribing
var _receiveDbAuthEnabled = true; // Boolean flag: true if a password is required for subscriber access
var _receiveDbSecret = 'secureStreamKey'; // The authentication password for the subscriber Redis client
var _receiveDbPort = 6379; // The TCP port number for the subscriber Redis connection

/*
 * Message Sender (Redis Publisher) Database Configuration
 */
var _publishDbHost = '127.0.0.1'; // The IP address of the Redis instance used for publishing
var _publishDbAuthEnabled = true; // Boolean flag: true if a password is required for publisher access
var _publishDbSecret = 'secureStreamKey'; // The authentication password for the publisher Redis client
var _publishDbPort = 6379; // The TCP port number for the publisher Redis connection

/*
 * WebSocket (Socket.IO) Setup Parameters
 */
var _outputLevel = 2; // Verbosity level for Socket.IO logging (e.g., 0=error, 1=warn, 2=info, 3=debug)

/*
 * Internal Security Key for Data Submission
 */
var _accessKey = "superSecretAccess"; // Secret key required to authorize incoming POST requests


/*
 * CORE SERVER FUNCTIONALITY -- DO NOT ALTER BELOW THIS LINE
 * Unless you are fully aware of the implications.
 */

dbClient = require('redis');
webFramework = require('express');
socketServer = require('socket.io');
fileSystemUtil = require("fs"); // Filesystem module, currently not actively utilized

// Establish a connection to the Redis publishing client
publisher = dbClient.createClient(_publishDbPort, _publishDbHost);
if ( _publishDbAuthEnabled ) {
  publisher.auth(_publishDbSecret);
}

// Establish a connection to the Redis subscribing client
subscriber = dbClient.createClient(_receiveDbPort, _receiveDbHost);
if ( _receiveDbAuthEnabled ) {
  subscriber.auth(_receiveDbSecret);
}

// Configure the subscriber to listen for pattern-matched messages
subscriber.on("pmessage", function(topicPattern, msgTopic, messageJson) {
  socketHandler.sockets.volatile.emit(msgTopic, JSON.parse(messageJson));
});

// Subscribe to all available topics using the defined filter
subscriber.psubscribe(_topicFilter);

// Initialize the Express web application, serving static files and parsing request bodies
webApp = webFramework.createServer(
  webFramework.static(__dirname + '/public'),
  webFramework.bodyParser()
);

// Start the web application, listening on the specified port and address
webApp.listen(_serverPort, _serverAddress);

// Define the POST route for processing incoming data submissions
webApp.post(_routePath, function(clientRequest, serverResponse) {
  if (clientRequest.payload.accessKey === _accessKey) {
    delete clientRequest.payload.accessKey; // Remove the sensitive key before broadcasting
    publisher.publish(clientRequest.payload.msgTopic, JSON.stringify(clientRequest.payload));
  }
});

// Integrate Socket.IO with the Express web application
socketHandler = socketServer.listen(webApp);

// Apply configuration settings to the Socket.IO instance
socketHandler.configure(function() {
  socketHandler.set('log level', _outputLevel);
});