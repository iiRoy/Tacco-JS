/**
 * This module provides a factory function for creating Server-Sent Events (SSE) broadcasters.
 * It encapsulates the logic for managing an SSE connection, including sending events,
 * handling client disconnections, and maintaining the connection with keep-alive pings.
 *
 * Resources for Server-Sent Events:
 *   - W3C Specification: https://www.w3.org/TR/eventsource/
 *   - MDN Web Docs: https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events
 *
 * @param {object} clientRequest - The incoming Node.js HTTP request object.
 * @param {object} serverResponse - The outgoing Node.js HTTP response object.
 * @param {object} [streamConfig] - Optional configuration parameters for the SSE stream.
 *   @property {Function} [onStreamClosed] - An optional callback function to execute when the stream is terminated.
 *   @property {boolean} [enableKeepAlive=false] - If true, periodic comment messages will be sent to prevent connection timeouts.
 * @returns {StreamBroadcaster} An instance of the SSE stream broadcaster.
 */
module.exports = function(clientRequest, serverResponse, streamConfig) {
  // Ensure that the configuration object is always available, even if not provided.
  const effectiveConfig = streamConfig || {};
  return new StreamBroadcaster(clientRequest, serverResponse, effectiveConfig);
};

// Constant defining the interval for sending keep-alive comments, in milliseconds.
const KEEPALIVE_PING_INTERVAL_MS = 15000;

/**
 * Manages a Server-Sent Events (SSE) connection.
 * This class provides methods to dispatch event data, send comments, and control the stream's lifecycle.
 */
function StreamBroadcaster(clientRequest, serverResponse, streamConfig) {
  // Store the response object for writing data to the client.
  this.outgoingResponse = serverResponse;
  // Store the optional external callback to be invoked upon stream closure.
  this._externalClosureHandler = streamConfig.onStreamClosed || emptyFunction;

  // Internal flag to track the active state of the stream, preventing operations on a closed stream.
  this._isStreamActive = true;

  // Basic validation for the 'enableKeepAlive' configuration parameter.
  if (typeof streamConfig.enableKeepAlive !== 'boolean' && streamConfig.enableKeepAlive !== undefined) {
    console.warn('StreamBroadcaster: The `enableKeepAlive` option should be a boolean. Defaulting to `false`.');
    streamConfig.enableKeepAlive = false;
  }

  // Bind the cleanup routine to the current instance's context.
  const boundCleanupProcedure = this._performStreamCleanup.bind(this);

  // Attach event listeners to both the request and response objects to detect client disconnections
  // or errors that would necessitate stream termination.
  this._setupConnectionMonitoring(clientRequest, boundCleanupProcedure);
  this._setupConnectionMonitoring(serverResponse, boundCleanupProcedure);

  // Initialize the HTTP headers required for an SSE stream.
  this._configureStreamHeaders();

  // If keep-alive functionality is enabled, start the periodic comment sending mechanism.
  if (streamConfig.enableKeepAlive) {
    this._startHeartbeatMechanism();
  }
}

/**
 * Attaches event listeners to an EventEmitter-like object (like req or res)
 * to monitor for disconnection signals.
 * @param {object} streamObject - The Node.js request or response object.
 * @param {Function} handlerCallback - The function to be called when a disconnection event occurs.
 * @private
 */
StreamBroadcaster.prototype._setupConnectionMonitoring = function(streamObject, handlerCallback) {
  // Guard against invalid objects that do not support event listening.
  if (!streamObject || typeof streamObject.on !== 'function') {
    console.error('StreamBroadcaster: Invalid object provided for connection monitoring setup.');
    return;
  }
  // Listen for client-initiated aborts or general stream errors.
  streamObject.on("aborted", handlerCallback);
  streamObject.on("error", handlerCallback);

  // For the response object, also monitor 'close' and 'end' events which signify stream termination.
  if (streamObject === this.outgoingResponse) {
    streamObject.on("close", handlerCallback);
    streamObject.on("end", handlerCallback);
  }
};

/**
 * Sets the mandatory HTTP headers for Server-Sent Events.
 * This method ensures the client correctly interprets the stream.
 * @private
 */
StreamBroadcaster.prototype._configureStreamHeaders = function() {
  // Prevent setting headers if the response object is unavailable or headers have already been sent.
  if (!this.outgoingResponse || this.outgoingResponse.headersSent) {
    console.warn('StreamBroadcaster: Cannot configure SSE headers; response is unavailable or headers already sent.');
    return;
  }
  // Write the status code and SSE-specific headers.
  this.outgoingResponse.writeHead(200, {
    "Content-Type": "text/event-stream; charset=utf-8", // Specify content type and character encoding.
    "Cache-Control": "no-cache, no-store, must-revalidate", // Strictly prevent caching of the event stream.
    "Connection": "keep-alive" // Inform proxies that this is a persistent connection.
  });
  // Send an initial newline character to flush headers to the client immediately.
  // This helps ensure the connection is established promptly.
  this.outgoingResponse.write("\n");
};

/**
 * Initiates the periodic sending of comments to keep the SSE connection alive.
 * This helps prevent proxies from prematurely terminating the connection.
 * @private
 */
StreamBroadcaster.prototype._startHeartbeatMechanism = function() {
  // Send the first keep-alive comment immediately.
  this._transmitKeepAliveComment();
  // Schedule subsequent comments to be sent at regular intervals.
  this.heartbeatTimer = setInterval(this._transmitKeepAliveComment.bind(this), KEEPALIVE_PING_INTERVAL_MS);
};

/**
 * Dispatches an event message to the connected client.
 * The message will be formatted according to the SSE specification.
 * @param {string} eventTypeName - The name or type of the event (e.g., "userUpdate", "notification").
 * @param {any} eventPayload - The data payload for the event. This will be JSON-stringified.
 */
StreamBroadcaster.prototype.dispatchMessage = function(eventTypeName, eventPayload) {
  // Guard: Do not attempt to write to an inactive or already ended stream.
  if (!this._isStreamActive || !this.outgoingResponse || this.outgoingResponse.writableEnded) {
    console.warn(`StreamBroadcaster: Attempted to dispatch message '${eventTypeName}' on an inactive or closed stream.`);
    return;
  }

  let serializedPayload = '';
  try {
    // Attempt to stringify the payload.
    serializedPayload = JSON.stringify(eventPayload);
  } catch (serializationError) {
    console.error(`StreamBroadcaster: Failed to serialize event payload for type '${eventTypeName}':`, serializationError);
    // Fallback: send a structured error message if serialization fails.
    serializedPayload = JSON.stringify({ error: 'Payload serialization error', originalError: serializationError.message });
  }

  // Construct the SSE event string using template literals for clarity.
  const sseEventString = `event: ${eventTypeName}\ndata: ${serializedPayload}\n\n`;
  this.outgoingResponse.write(sseEventString);
};

/**
 * Sends a comment line to the client. Comments are ignored by the client's EventSource API
 * and are primarily used for keep-alive purposes or debugging.
 * @param {string} [commentText="heartbeat_ping"] - The textual content of the comment.
 * @private
 */
StreamBroadcaster.prototype._transmitKeepAliveComment = function(commentText = "heartbeat_ping") {
  // Guard: Prevent writing to a response stream that is no longer active or has ended.
  if (!this._isStreamActive || !this.outgoingResponse || this.outgoingResponse.writableEnded) {
    return;
  }
  // Write the comment line formatted as per SSE specification.
  this.outgoingResponse.write(`:${commentText}\n\n`);
};

/**
 * Public method to explicitly send a keep-alive comment to the client.
 * This can be used for manual pings outside of the automated heartbeat.
 */
StreamBroadcaster.prototype.sendExplicitPing = function() {
  this._transmitKeepAliveComment("manual_ping");
};

/**
 * Gracefully terminates the SSE stream, closing the underlying HTTP connection.
 * This method ensures that all cleanup procedures are initiated.
 */
StreamBroadcaster.prototype.closeStream = function() {
  // If the stream is still active and the response is writable, end it.
  if (this._isStreamActive && this.outgoingResponse && !this.outgoingResponse.writableEnded) {
    this.outgoingResponse.end();
  }
  // Always call the internal cleanup routine to ensure resources are released,
  // regardless of how the stream was terminated.
  this._performStreamCleanup();
};

/**
 * Internal cleanup method to release resources and reset the stream's state.
 * This method is designed to be idempotent; it can be called multiple times without issues.
 * @private
 */
StreamBroadcaster.prototype._performStreamCleanup = function() {
  // If the stream is already marked as inactive, no further cleanup is needed.
  if (!this._isStreamActive) {
    return;
  }

  // Clear any active heartbeat timer to prevent further scheduled writes.
  if (this.heartbeatTimer) {
    clearInterval(this.heartbeatTimer);
    this.heartbeatTimer = null; // Dereference the timer ID.
  }

  // Execute the external callback provided by the user, if it exists.
  if (typeof this._externalClosureHandler === 'function') {
    try {
      this._externalClosureHandler();
    } catch (handlerError) {
      console.error('StreamBroadcaster: Error executing external stream closure handler:', handlerError);
    }
    this._externalClosureHandler = null; // Dereference the callback.
  }

  // Mark the stream as inactive and nullify sensitive references to aid garbage collection.
  this._isStreamActive = false;
  this.outgoingResponse = null; // Dereference the response object to prevent memory leaks.
  // Additional internal state variables can be reset or nullified here as needed.
};

/**
 * A no-operation function used as a default placeholder for optional callbacks.
 * @private
 */
function emptyFunction() {
  // This function intentionally does nothing.
}