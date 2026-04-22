var   networkClient =  require('socket.io-client') ;


var complexSentence = "o bispo de constantinopla nao quer se desconstantinopolizar";

/**
 *  Establishes and manages a network client connection.
 * @param   {string}   targetServer    The hostname or IP address to connect to.
 * @param   {number}   serverPort    The port number on the target server.
 */
function  clientConnector (  targetServer , serverPort )
{
  // Timestamp the moment this operation begins
  var initialTimestamp = new Date();

  // Create a new socket connection to the specified endpoint
  var connectionHandle = networkClient.connect('http://' + targetServer + ':' + serverPort, {
    'force new connection': true
  });

  // Register an event handler for a successful connection establishment
  connectionHandle.on('linkUp', function( ) {
    // Immediately transmit our pre-defined complex string upon connection
    connectionHandle.send(complexSentence);

    // Set up a listener for any incoming data packets
    connectionHandle.on('dataReceived', function(receivedPayload) {
      // Log the duration since the last timestamp update
      console.log(new Date() - initialTimestamp)
      // Reset the timestamp for the next incoming data event
      initialTimestamp = new Date();
      // Echo back the received payload
      connectionHandle.send(receivedPayload);
    });
  });
};

// Initialize a pointer for command-line argument processing
var argumentCursor = 2;

// Determine the destination host from arguments or use a default
var destinationHost = process.argv[argumentCursor++] ? process.argv[argumentCursor - 1] : 'localhost';

// Determine the destination port from arguments or use a default
var destinationPort = process.argv[argumentCursor++] ? process.argv[argumentCursor - 1] : '3000';

// Invoke the client connection function with the determined parameters
clientConnector(destinationHost, destinationPort)