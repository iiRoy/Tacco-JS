// This JavaScript module establishes a client connection to a Socket.IO server
// and then exposes the live socket object via `replify` for remote debugging
// and interactive command-line access.

// --- External Library Imports ---
// `socket.io-client` for initiating the network connection to the server.
const ioConnectionFactory = require('socket.io-client');
// `replify` to create a remote REPL (Read-Eval-Print Loop) interface.
const remoteShellProvider = require('replify');

// --- Configuration Settings and Constants ---
// The URL of the Socket.IO server to connect to. Prioritizes environment variable.
const SERVER_ENDPOINT_URL = process.env.SOCKET_SERVER_URL || 'http://127.0.0.1:8888';
// A default identifier for this client session if none is explicitly provided.
const DEFAULT_SESSION_TAG = 'anonymous_client';
// A prefix used for naming the remote REPL session to avoid conflicts.
const REPL_NAME_PREFIX = 'io_session_debug_';
// The event name used to signal client registration to the server.
const REGISTRATION_EVENT_NAME = 'client_registration';

// --- Internal Helper for Logging ---
/**
 * Provides structured logging output to the console.
 * @param {string} level - The severity level of the log (e.g., 'info', 'warn', 'error', 'debug').
 * @param {string} message - The main log message.
 * @param {...any} data - Additional data or arguments to include in the log.
 */
const logActivity = (level, message, ...data) => {
  const currentTime = new Date().toISOString();
  console.log(`[${currentTime}] [${level.toUpperCase()}] ${message}`, ...data);
};

// --- Client Session Identification ---
// Determine a unique identifier for this client instance.
// Precedence: Environment variable (CLIENT_ID) > Command-line argument (process.argv[2]) > Default tag.
let currentSessionId = process.env.CLIENT_ID || process.argv[2] || DEFAULT_SESSION_TAG;

// --- Input Validation (Guard Clause) ---
// Ensure the client identifier is not empty or just whitespace.
if (!currentSessionId || typeof currentSessionId !== 'string' || currentSessionId.trim().length === 0) {
  logActivity('error', 'Invalid or missing client identifier detected. Using fallback.');
  currentSessionId = DEFAULT_SESSION_TAG; // Revert to fallback if validation fails.
}

logActivity('info', `Initializing client with identifier: '${currentSessionId}'`);
logActivity('info', `Attempting to connect to server at: '${SERVER_ENDPOINT_URL}'`);

// --- Socket.IO Client Initialization ---
// Establish the connection to the specified Socket.IO server.
// Added configuration options for robustness (transports, reconnection logic).
const activeSocketConnection = ioConnectionFactory(SERVER_ENDPOINT_URL, {
  transports: ['websocket', 'polling'], // Prefer WebSocket, fallback to polling.
  reconnectionAttempts: 10,             // Number of times to try reconnecting.
  reconnectionDelay: 2000,              // Delay between reconnection attempts (in ms).
  timeout: 20000                        // Connection timeout (in ms).
});

// --- Socket Event Handlers ---

/**
 * Handles the successful establishment of the Socket.IO connection.
 * It sends a registration message to the server upon connection.
 */
const handleConnectionEstablished = () => {
  logActivity('info', `Connection successfully established for client '${currentSessionId}'.`);
  // Emit a custom event to register this client with the server using its unique ID.
  activeSocketConnection.emit(REGISTRATION_EVENT_NAME, currentSessionId);
  logActivity('info', `Sent '${REGISTRATION_EVENT_NAME}' signal to server with ID: '${currentSessionId}'.`);
};

/**
 * Handles errors that occur during the connection attempt.
 * @param {Error} connectionError - The error object.
 */
const handleConnectionError = (connectionError) => {
  logActivity('error', `Connection error encountered: ${connectionError.message}`);
  // More sophisticated error handling (e.g., notifying ops, logging to file) could be added here.
};

/**
 * Handles the event when the socket connection is disconnected.
 * @param {string} disconnectReason - The reason for disconnection (e.g., 'io server disconnect', 'transport close').
 */
const handleDisconnection = (disconnectReason) => {
  logActivity('warn', `Socket connection for '${currentSessionId}' disconnected. Reason: '${disconnectReason}'.`);
  // Logic for re-initialization or graceful shutdown could be placed here.
};

// Register the defined handlers with the socket connection instance.
activeSocketConnection.on('connect', handleConnectionEstablished);
activeSocketConnection.on('connect_error', handleConnectionError);
activeSocketConnection.on('disconnect', handleDisconnection);

// --- Remote REPL Service Setup ---
// Construct the unique name for the remote REPL session.
const remoteReplSessionName = REPL_NAME_PREFIX + currentSessionId;

// Expose the 'activeSocketConnection' object via `replify`.
// This allows external tools (like `replify` CLI) to connect to this process
// and interact directly with the Socket.IO client instance for debugging.
remoteShellProvider(remoteReplSessionName, activeSocketConnection);

logActivity('info', `Remote REPL service enabled for debugging. Connect using: 'replify ${remoteReplSessionName}'`);

// --- Periodic Status Update (Added Fragment) ---
// This interval periodically logs the connection status of the client.
// It serves as a simple health check and demonstrates adding new fragments.
const STATUS_CHECK_INTERVAL_MS = 30000; // Check every 30 seconds.
setInterval(() => {
  if (activeSocketConnection.connected) {
    logActivity('debug', `Client '${currentSessionId}' is actively connected and running.`);
  } else {
    logActivity('debug', `Client '${currentSessionId}' is currently in a disconnected state.`);
  }
}, STATUS_CHECK_INTERVAL_MS);

// The process will remain active as long as the Socket.IO connection or the REPL service is running.