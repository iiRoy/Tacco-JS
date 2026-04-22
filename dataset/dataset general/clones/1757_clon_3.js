// This module provides advanced network communication capabilities for creating TCP servers and clients.
const networkModule = require('net');
// This module offers utility functions, including 'inspect' for deep object representation during debugging.
const utilModule = require('util');
// Our custom implementation for handling WebSocket-like stream framing over a raw TCP socket.
const WebSockTransport = require('./wsstream'); // Ensure 'wsstream.js' is accessible in the same directory.

// --- Global Constants and Configuration ---
// A specific string used for message integrity verification.
const MESSAGE_INTEGRITY_MARKER = ' badgirl!  ';
// The default TCP port number on which the server will listen and clients will connect.
const APPLICATION_LISTEN_PORT = 8009;
// The local loopback address for client-server communication on the same machine.
const LOCALHOST_ADDRESS = '127.0.0.1';

// Determine the operational role of this process (client or server) based on command-line arguments.
// If more than two arguments are provided (e.g., 'node script.js client'), it operates as a client.
const processRole = process.argv.length > 2 ? 'client' : 'server';

// Execute the primary function corresponding to the determined role.
if (processRole === 'client') {
  initializeClientOperation();
} else {
  startServerProcess();
}

/**
 * Performs comprehensive validation on an incoming WebSocket-like frame and its associated data payload.
 * This includes checks for frame type, finalization status, size consistency, and a specific magic suffix.
 *
 * @param {object} receivedFrameObject - The structured object representing the WebSocket-like frame header.
 * @param {Buffer} dataPayloadBuffer - The binary buffer containing the actual message content.
 * @param {number} messageSequenceNumber - A monotonically increasing counter for processed messages.
 * @throws {Error} If any validation rule fails, indicating a corrupted or invalid message.
 */
function validateIncomingPacket(receivedFrameObject, dataPayloadBuffer, messageSequenceNumber) {
  // Pre-check: Ensure the payload buffer is valid and not empty.
  if (!dataPayloadBuffer || !Buffer.isBuffer(dataPayloadBuffer) || dataPayloadBuffer.length === 0) {
    throw new Error('Received an invalid, null, or empty data payload.');
  }

  // Core frame validation:
  // 1. Must be a binary opcode.
  // 2. Must be the final fragment of a message.
  // 3. The reported size in the frame header must exactly match the actual payload buffer length.
  if (receivedFrameObject.opcode !== 'binary' || !receivedFrameObject.isFinal || receivedFrameObject.size !== dataPayloadBuffer.length) {
    throw new Error(`Frame structure mismatch or corruption detected: ${utilModule.inspect(receivedFrameObject)}`);
  }

  // Suffix integrity check:
  // The payload must be long enough to contain our predefined integrity marker.
  const markerLength = MESSAGE_INTEGRITY_MARKER.length;
  if (dataPayloadBuffer.length < markerLength) {
    throw new Error(`Data payload is too short (${dataPayloadBuffer.length} bytes) to contain the integrity marker.`);
  }

  // Extract the trailing part of the payload and convert it to ASCII for comparison.
  const extractedSuffix = dataPayloadBuffer.toString('ascii', dataPayloadBuffer.length - markerLength);

  // Compare the extracted suffix with the expected integrity marker.
  if (extractedSuffix !== MESSAGE_INTEGRITY_MARKER) {
    throw new Error(`Message integrity check failed: Expected "${MESSAGE_INTEGRITY_MARKER}", but found "${extractedSuffix}".`);
  }

  // Periodic logging for operational visibility.
  const logFrequency = 600; // Log every 600 messages.
  if (messageSequenceNumber % logFrequency === 0) {
    console.log(`[${processRole.toUpperCase()}] Validated ${messageSequenceNumber} packets (Payload size: ${dataPayloadBuffer.length} bytes).`);
  }
}

/**
 * Provides centralized error handling for various network-related issues.
 * Logs common connection problems and re-throws critical or unexpected errors.
 *
 * @param {Error} encounteredError - The error object originating from a network operation.
 */
function handleNetworkError(encounteredError) {
  const systemErrorNumber = encounteredError.errno;

  // A list of common network error codes that are typically transient or connection-specific.
  const commonNetworkProblemCodes = [
    'ENOTCONN',       // Socket is not connected to a remote host.
    'ECONNRESET',     // Connection reset by the peer (e.g., remote process terminated).
    'EPIPE',          // Broken pipe: writing to a socket that has been closed by the peer.
    'EAGAIN',         // Resource temporarily unavailable (often related to non-blocking I/O).
    'ECONNREFUSED',   // Connection actively refused by the target machine (e.g., server not running).
    'ETIMEDOUT'       // Connection attempt timed out.
  ];

  // Attempt to map the numeric system error code to its symbolic string representation.
  const symbolicErrorName = Object.keys(process).find(key => process[key] === systemErrorNumber);

  if (commonNetworkProblemCodes.includes(symbolicErrorName)) {
    console.warn(`[${processRole.toUpperCase()}] Detected a common network issue: ${encounteredError.message} (Code: ${symbolicErrorName || systemErrorNumber}).`);
  } else {
    // For any other error type, it's considered more severe and should be re-thrown after logging.
    console.error(`[${processRole.toUpperCase()}] Unhandled critical error encountered: ${encounteredError.message} (Code: ${symbolicErrorName || systemErrorNumber}).`);
    throw encounteredError;
  }
}

/**
 * Sets up and starts the server application process.
 * It creates a TCP server, manages client connections, and handles WebSocket-like message exchanges.
 */
function startServerProcess() {
  let isGracefulShutdownInitiated = false; // Flag to control server behavior during shutdown.

  // Create a new TCP server. The callback function is executed for each new client connection.
  const applicationTcpServer = networkModule.createServer((clientNetworkSocket) => {
    console.log(`[SERVER] New client connected from ${clientNetworkSocket.remoteAddress}:${clientNetworkSocket.remotePort}.`);

    // Disable the Nagle algorithm on the client socket to ensure immediate packet transmission.
    clientNetworkSocket.setNoDelay(true);

    // Event handler for when the client connection is fully closed.
    clientNetworkSocket.on('close', (hadError) => {
      if (hadError) {
        console.error(`[SERVER] Client connection from ${clientNetworkSocket.remoteAddress} terminated due to an error.`);
      } else {
        console.log(`[SERVER] Client connection from ${clientNetworkSocket.remoteAddress} gracefully closed.`);
      }
    });

    // Event handler for any errors occurring on this specific client socket.
    clientNetworkSocket.on('error', handleNetworkError);

    // Instantiate our custom WebSocket-like transport layer for this client.
    const clientWebSockHandler = new WebSockTransport(clientNetworkSocket);
    let receivedMessageCount = 0; // Counter for messages processed from this particular client.

    // Event handler for incoming data frames parsed by the WebSockTransport.
    clientWebSockHandler.on('data', (currentFrame, receivedDataPayload) => {
      receivedMessageCount++; // Increment the counter for this client's messages.

      // Validate the incoming message for integrity and correctness.
      try {
        validateIncomingPacket(currentFrame, receivedDataPayload, receivedMessageCount);
      } catch (validationFailure) {
        console.error(`[SERVER] Data validation failed for client ${clientNetworkSocket.remoteAddress}: ${validationFailure.message}. Terminating connection.`);
        clientNetworkSocket.end(); // End the connection immediately upon validation failure.
        return; // Stop further processing for this message.
      }

      // If the server is in shutdown mode and the socket is still active,
      // gracefully end the WebSocket stream for this client.
      if (isGracefulShutdownInitiated && clientNetworkSocket.writable && !clientNetworkSocket.destroyed) {
        console.log(`[SERVER] Server is shutting down; ending WebSockTransport for client ${clientNetworkSocket.remoteAddress}.`);
        clientWebSockHandler.end();
        return;
      }

      // Construct the response payload by appending the integrity marker to the received data.
      const outgoingResponseBuffer = Buffer.alloc(receivedDataPayload.length + MESSAGE_INTEGRITY_MARKER.length);
      receivedDataPayload.copy(outgoingResponseBuffer, 0, 0, receivedDataPayload.length);
      outgoingResponseBuffer.write(MESSAGE_INTEGRITY_MARKER, receivedDataPayload.length);

      // Send the modified payload back to the client using the WebSockTransport.
      clientWebSockHandler.write(1, 'binary', outgoingResponseBuffer);
    });

    // Event handler for when the WebSockTransport stream ends for a client.
    clientWebSockHandler.on('end', (operationCompletedSuccessfully) => {
      console.log(`[SERVER] WebSockTransport stream concluded for client ${clientNetworkSocket.remoteAddress}. Success: ${operationCompletedSuccessfully}.`);
    });
  });

  // Register a signal handler for graceful server shutdown (e.g., Ctrl+C on Linux/macOS).
  process.on('SIGINT', () => {
    console.log('[SERVER] SIGINT signal received. Initiating graceful server shutdown...');
    isGracefulShutdownInitiated = true; // Set the flag to true.

    // Attempt to close the TCP server. This stops accepting new connections.
    applicationTcpServer.close(() => {
      console.log('[SERVER] All client connections closed, TCP server has stopped listening. Exiting process.');
      process.exit(0); // Exit cleanly after the server fully closes.
    });

    // Implement a timeout to force exit if connections don't close gracefully within a timeframe.
    const shutdownTimeoutMs = 7000; // 7 seconds.
    setTimeout(() => {
      console.error(`[SERVER] Forced shutdown: Not all client connections closed within ${shutdownTimeoutMs}ms. Exiting.`);
      process.exit(1); // Exit with an error code.
    }, shutdownTimeoutMs);
  });

  // Start the TCP server listening on the specified port and address.
  applicationTcpServer.listen(APPLICATION_LISTEN_PORT, LOCALHOST_ADDRESS, () => {
    console.log(`[SERVER] Server is actively listening for incoming connections on ${LOCALHOST_ADDRESS}:${APPLICATION_LISTEN_PORT}.`);

    // Automatically spawn a client process for self-testing and demonstration purposes.
    const childProcessModule = require('child_process');
    const spawnedClientProcess = childProcessModule.spawn(
      process.argv[0], // Path to the Node.js executable.
      [process.argv[1], 'client'], // Arguments: current script path and 'client' role.
      {
        stdio: ['ignore', process.stdout, process.stderr] // Redirect child process's stdout/stderr to parent's.
      }
    );

    // Handle errors during the client child process creation.
    spawnedClientProcess.on('error', (spawnError) => {
      console.error(`[SERVER] Failed to start client child process: ${spawnError.message}.`);
    });

    // Log when the client child process exits.
    spawnedClientProcess.on('exit', (exitCode, signalName) => {
      console.log(`[SERVER] Client child process exited with code ${exitCode || 'N/A'} (Signal: ${signalName || 'N/A'}).`);
    });
  });
}

/**
 * Sets up and runs the client application process.
 * It connects to the server, sends an initial message, and continuously echoes received messages.
 */
function initializeClientOperation() {
  // Define the initial message content, ensuring it includes the integrity marker.
  const initialClientMessage = `This is the client's inaugural message to the server. ${MESSAGE_INTEGRITY_MARKER}`;
  // Convert the initial message string into a Buffer using UTF-8 encoding.
  const initialMessageBuffer = Buffer.from(initialClientMessage, 'utf8');

  // Create a new TCP client socket instance.
  const clientNetworkSocket = new networkModule.Socket();

  // Event handler for successful connection establishment with the server.
  clientNetworkSocket.on('connect', () => {
    console.log(`[CLIENT] Successfully connected to the server at ${LOCALHOST_ADDRESS}:${APPLICATION_LISTEN_PORT}.`);
    // Disable Nagle's algorithm for this client socket to reduce latency.
    clientNetworkSocket.setNoDelay(true);

    // Initialize the WebSocket-like transport handler for this client connection.
    const clientWebSockHandler = new WebSockTransport(clientNetworkSocket);
    let clientMessagesReceived = 0; // Counter for messages received by the client.

    // Introduce a small delay before sending the first message to ensure server-side readiness.
    setTimeout(() => {
      // Only send if the socket is still active and writable.
      if (clientNetworkSocket.writable && !clientNetworkSocket.destroyed) {
        console.log(`[CLIENT] Sending initial message (Size: ${initialMessageBuffer.length} bytes).`);
        clientWebSockHandler.write(1, 'binary', initialMessageBuffer);
      } else {
        console.warn('[CLIENT] Socket is not writable or destroyed; skipping initial message transmission.');
      }
    }, 150); // 150ms delay.

    // Event handler for incoming data frames from the server.
    clientWebSockHandler.on('data', (currentFrame, incomingServerPayload) => {
      clientMessagesReceived++; // Increment the client's message counter.

      // Validate the received message from the server.
      try {
        validateIncomingPacket(currentFrame, incomingServerPayload, clientMessagesReceived);
      } catch (validationError) {
        console.error(`[CLIENT] Incoming packet validation failed: ${validationError.message}. Closing connection.`);
        clientNetworkSocket.end(); // Close the connection on validation failure.
        return;
      }

      // If the socket is still active, echo the received message back to the server.
      if (clientNetworkSocket.writable && !clientNetworkSocket.destroyed) {
        clientWebSockHandler.write(1, 'binary', incomingServerPayload);

        // Periodically send a message with a callback function to test asynchronous write completion.
        const callbackTestFrequency = 2100; // Perform callback test every 2100 messages.
        if (clientMessagesReceived % callbackTestFrequency === 0) {
          clientWebSockHandler.write(1, 'binary', incomingServerPayload, (writeOperationSuccessful) => {
            console.log(`[CLIENT] Write callback invoked for message ${clientMessagesReceived}. Operation success: ${writeOperationSuccessful}.`);
          });
        }
      } else {
        console.warn('[CLIENT] Socket not in a writable state; skipping response to server.');
      }
    });

    // Event handler for when the WebSockTransport stream ends.
    clientWebSockHandler.on('end', (streamEndedSuccessfully) => {
      console.log(`[CLIENT] WebSockTransport stream ended. Success: ${streamEndedSuccessfully}.`);
      clientNetworkSocket.end(); // Ensure the underlying TCP socket is also closed.
    });
  });

  // Event handler for socket timeout due to inactivity.
  clientNetworkSocket.on('timeout', () => {
    console.warn('[CLIENT] Socket connection timed out due to prolonged inactivity. Disconnecting.');
    clientNetworkSocket.end(); // Close the connection.
  });

  // Event handler for when the client socket connection is fully closed.
  clientNetworkSocket.on('close', (hadError) => {
    if (hadError) {
      console.error(`[CLIENT] Client connection closed unexpectedly due to an error.`);
    } else {
      console.log(`[CLIENT] Client connection gracefully closed.`);
    }
  });

  // Event handler for any errors occurring on the client socket.
  clientNetworkSocket.on('error', handleNetworkError);

  // Register a signal handler for graceful client shutdown.
  process.on('SIGINT', () => {
    console.log('[CLIENT] SIGINT signal received. Initiating client disconnection...');
    clientNetworkSocket.end(); // Gracefully close the client connection.
    // Allow a small moment for the socket to close before exiting.
    setTimeout(() => {
      process.exit(0);
    }, 200);
  });

  // Initiate the connection attempt to the server.
  clientNetworkSocket.connect(APPLICATION_LISTEN_PORT, LOCALHOST_ADDRESS, () => {
    // This callback is invoked once the TCP handshake is complete.
    // The 'connect' event listener (defined above) also fires at this point.
    console.log(`[CLIENT] Attempting to establish TCP connection to ${LOCALHOST_ADDRESS}:${APPLICATION_LISTEN_PORT}...`);
  });
}