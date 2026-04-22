/**
 * This module orchestrates client-side real-time communication
 * using a WebSocket connection. It initializes the connection,
 * registers handlers for incoming data, and provides structured logging.
 */

// Configuration constants for the WebSocket client.
// These parameters can be adjusted to modify connection behavior or logging verbosity.
const WEB_SOCKET_SERVER_URL = undefined; // Optional: specify server URL if not default 'io.connect()'
const ENABLE_DETAILED_LOGGING = true;    // Set to 'false' to reduce console output for incoming data
const INCOMING_DATA_EVENT_NAME = 'serverNotification'; // The specific event channel to listen on

/**
 * A utility function for consistent logging of communication status and events.
 * It prepends a timestamp and categorizes the log entry.
 * @param {string} message - The primary message to log.
 * @param {any} [supplementaryData=null] - Optional additional data to include in the log.
 */
const outputConnectionLog = (message, supplementaryData = null) => {
  const currentTimestamp = new Date().toISOString();
  let logEntry = `[${currentTimestamp}] WS_CLIENT_STATUS: ${message}`;
  if (supplementaryData !== null) {
    try {
      logEntry += ` | DATA: ${JSON.stringify(supplementaryData)}`;
    } catch (e) {
      logEntry += ` | DATA (unserializable): ${supplementaryData}`;
    }
  }
  console.info(logEntry);
};

let totalMessagesProcessed = 0; // Counter for all data packets received through the primary channel.
let connectionEstablishmentTime = null; // Stores the timestamp when the connection was successfully made.

// Initialize the primary communication conduit using the Socket.IO client library.
// The global 'io' object is assumed to be available.
const webSocketClient = io.connect(WEB_SOCKET_SERVER_URL);

outputConnectionLog('Initiating real-time communication link with backend service...');

// Register a callback function to handle successful connection establishment.
webSocketClient.on('connect', () => {
  connectionEstablishmentTime = new Date();
  outputConnectionLog('Successfully connected to WebSocket server.', {
    connectedAt: connectionEstablishmentTime.toISOString()
  });
});

// Register a handler for the designated incoming data event from the server.
// This function will execute every time the server emits an 'serverNotification'.
webSocketClient.on(INCOMING_DATA_EVENT_NAME, (rawIncomingPayload) => {
  totalMessagesProcessed++; // Increment the counter for each received message.

  // Log the initial reception if detailed logging is enabled.
  if (ENABLE_DETAILED_LOGGING) {
    outputConnectionLog(`New data packet received (#${totalMessagesProcessed}).`, {
      eventType: INCOMING_DATA_EVENT_NAME,
      rawType: typeof rawIncomingPayload
    });
  }

  let finalProcessedContent = null;
  let detectedContentType = typeof rawIncomingPayload;

  // Attempt to parse the payload if it's a string, assuming it might be JSON.
  if (detectedContentType === 'string') {
    try {
      finalProcessedContent = JSON.parse(rawIncomingPayload);
      detectedContentType = 'JSON Object (parsed)';
    } catch (parsingError) {
      // If parsing fails, treat it as a plain string.
      finalProcessedContent = rawIncomingPayload;
      detectedContentType = 'Plain String';
    }
  } else {
    // If not a string, use the payload directly.
    finalProcessedContent = rawIncomingPayload;
  }

  // Implement a guard clause: ensure the processed content is meaningful.
  if (finalProcessedContent === null || typeof finalProcessedContent === 'undefined') {
    outputConnectionLog('Received an empty or unprocessable data unit. Skipping further actions.', {
      originalInput: rawIncomingPayload
    });
    return; // Exit handler if data is not valid for processing.
  }

  // Output the processed message details based on logging preferences.
  if (ENABLE_DETAILED_LOGGING) {
    outputConnectionLog(`Payload processed and ready for action.`, {
      messageSequence: totalMessagesProcessed,
      payloadType: detectedContentType,
      content: finalProcessedContent
    });
  } else {
    // A concise log entry for non-verbose mode.
    console.log(`[${new Date().toLocaleTimeString()}] WS Data #${totalMessagesProcessed}:`, finalProcessedContent);
  }

  // Placeholder for business logic that would consume the processed data.
  // For instance, updating the UI, triggering another service, etc.
  // processApplicationData(finalProcessedContent);
});

// Register a handler for connection disconnection events.
webSocketClient.on('disconnect', (disconnectReason) => {
  outputConnectionLog(`WebSocket connection terminated. Reason: ${disconnectReason}.`, {
    disconnectedAt: new Date().toISOString()
  });
  // Potentially implement reconnection logic here based on 'disconnectReason'.
  // e.g., if (disconnectReason === 'io server disconnect') { initiateReconnectStrategy(); }
});

// Register a handler for any errors encountered during the WebSocket session.
webSocketClient.on('error', (err) => {
  console.error('CRITICAL: WebSocket communication error detected:', err);
  outputConnectionLog('WebSocket error encountered. Connection stability might be compromised.', {
    errorDetails: err.message || err
  });
  // Error handling, alerts, or automatic recovery attempts.
});

// --- End of WebSocket Client Module ---