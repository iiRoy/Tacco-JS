var networkMod = require('net');
var utilityMod = require('sys');
var WebSockFlow = require('./wsstream'); // Custom WebSocket streaming component

// Determine the operational role based on command-line arguments.
var operationMode = process.argv.length > 2 ? 'client' : 'server';

// Execute the appropriate function for the determined role.
if (operationMode === 'client')
  launchAgent();
else
  launchHost();

/**
 * Validates an incoming WebSocket frame and its associated message.
 * @param {object} inputFrame - The WebSocket frame object.
 * @param {Buffer} inputData - The raw message data buffer.
 * @param {number} iterationCounter - Current message count.
 */
function verifyPayload(inputFrame, inputData, iterationCounter) {
  // Ensure the frame is binary, final, and its size matches the message length.
  if (inputFrame.opcode !== 'binary' || !inputFrame.isFinal || inputFrame.size !== inputData.length) {
    throw new Error('Malformed frame encountered: ' + utilityMod.inspect(inputFrame));
  }
  // Check for a specific trailing string in the message to detect corruption.
  var dataSuffix = inputData.toString('ascii', inputData.length - 11);
  if (dataSuffix !== ' badgirl!  ') {
    throw new Error('Message integrity compromised: ' + dataSuffix);
  }
  // Log progress periodically for monitoring.
  if (iterationCounter % 1000 === 0) {
    console.log(operationMode + ' ' + iterationCounter + ' m ' + inputData.length);
  }
}

/**
 * Handles various network-related errors gracefully.
 * @param {Error} incomingError - The error object to process.
 */
function manageError(incomingError) {
  // Differentiate between expected network errors and critical system failures.
  switch (incomingError.errno) {
    case process.ENOTCONN:
    case process.ECONNRESET:
    case process.EPIPE:
    case process.EAGAIN:
    case process.ECONNREFUSED:
      console.log('Network issue: ' + incomingError.message + ' (' + operationMode + ')');
      break;
    default:
      // Re-throw unhandled errors to halt execution.
      throw incomingError;
  }
}

/**
 * Initializes and runs the server-side logic.
 */
function launchHost() {
  var isShuttingDown = false; // Flag to indicate if the server is in the process of shutting down.
  var hostInstance = networkMod.createServer(function(connectionHandle) {
    connectionHandle.setNoDelay(true); // Disable Nagle's algorithm for immediate data transmission.

    connectionHandle.on('timeout', function() {
      // Placeholder for timeout events, currently does nothing.
    });

    connectionHandle.on('close', function(errorObject) {
      console.log('Host connection closed'); // Log when a client connection closes.
    });

    connectionHandle.on('error', manageError); // Delegate error handling to a common function.

    var hostWebSock = new WebSockFlow(connectionHandle); // Wrap the raw socket with the WebSocket stream functionality.

    var messageCounter = 0; // Counter for messages received from this client.
    hostWebSock.on('data', function(currentFrame, receivedMessage) {
      verifyPayload(currentFrame, receivedMessage, ++messageCounter); // Validate the received message and increment counter.
      if (isShuttingDown && connectionHandle.writable) {
        hostWebSock.end(); // If shutting down and socket is still writable, close the WebSocket stream.
        return;
      }
      var outputBuffer = new Buffer(receivedMessage.length + 11); // Create a new buffer to append a specific string.
      receivedMessage.copy(outputBuffer, 0, 0, receivedMessage.length); // Copy the original message into the new buffer.
      outputBuffer.write(' badgirl!  ', receivedMessage.length); // Append the 'badgirl!' suffix.
      hostWebSock.write(1, 'binary', outputBuffer); // Send the modified message back to the client as a binary WebSocket frame.
    });

    hostWebSock.on('end', function(statusFlag) {
      console.log('Host stream ended: ' + statusFlag); // Log when the WebSocket stream ends for this client.
    });
  });

  process.on('SIGINT', function() {
    isShuttingDown = true; // Set shutdown flag.
    hostInstance.close(); // Close the main server.
  });

  hostInstance.listen(8009, function() {
    // Start listening for incoming connections on port 8009.
    // Spawn a child process to run as a client, ensuring stdout/stderr are inherited.
    var childProcessRef = require('child_process').spawn(process.argv[0], [process.argv[1], 'client'], {customFds:[-1, process.stdout.fd, process.stdout.fd]});
  });
}

/**
 * Initializes and runs the client-side logic.
 */
function launchAgent() {
  var sampleString = 'here is the test string for starters. badgirl!  '; // A predefined string for testing purposes.
  // var sBuf = new Buffer(16383);
  // for (var a=0; a < sBuf.length; a+=aStr.length)
  //   sBuf.write(aStr, a);
  // var sStr = sBuf.toString('ascii');

  var agentInstance = new networkMod.Stream; // Create a new TCP client stream.
  agentInstance.on('connect', function() {
    console.log('Agent connected to host'); // Event handler for successful connection.
    agentInstance.setNoDelay(true); // Disable Nagle's algorithm for the client connection.
    agentWebSock.write(1, 'binary', sampleString); // Send the initial test string as a binary WebSocket message.
  });

  agentInstance.on('timeout', function() {
    // Placeholder for timeout events, currently does nothing.
  });

  agentInstance.on('close', function(errorObject) {
    console.log('Agent connection closed'); // Log when the client connection closes.
  });

  agentInstance.on('error', manageError); // Delegate error handling to the common function.

  var agentWebSock = new WebSockFlow(agentInstance); // Wrap the raw client socket with WebSocket stream functionality.

  var messageCounter = 0; // Counter for messages received by the client.
  agentWebSock.on('data', function(currentFrame, receivedMessage) {
    verifyPayload(currentFrame, receivedMessage, ++messageCounter); // Validate the received message and increment counter.
    agentWebSock.write(1, 'binary', receivedMessage); // Echo the received message back to the server.
    if (messageCounter % 1727 === 0) {
      agentWebSock.write(1, 'binary', receivedMessage, function(statusFlag) {
        console.log('Write callback received: ' + statusFlag); // Occasionally send a message with a callback for confirmation.
      });
    }
  });

  agentWebSock.on('end', function(statusFlag) {
    console.log('Agent stream ended: ' + statusFlag); // Log when the client's WebSocket stream ends.
  });

  process.on('SIGINT', function(){/* Ignoring SIGINT in client */}); // Suppress SIGINT for the client process.

  agentInstance.connect(8009); // Initiate connection to the server on port 8009.
}