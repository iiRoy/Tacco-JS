/* This code is part of a Redis client library.
 *
 * Copyright (c) 2010 Fictorial LLC
 *
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without
 * restriction, including without limitation the rights to use,
 * copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following
 * conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 */

// To add support for new commands, modify the 'commands' array located
// at the very end of this file.

// Set this flag to 'true' to enable debugging output for the wire protocol,
// parsing methods, and similar operations.
exports.debugMode = false;

var net = require("net")
  , sys = require("sys")
  , Buffer = require('buffer').Buffer
  , events = require('events')
  ;

// Constants for Redis protocol parsing.
var CRLF = "\r\n"
  , CRLF_LEN = 2
  ;

// ASCII character codes for Redis reply types.
var PLUS      = exports.PLUS      = 0x2B // '+'
  , MINUS     = exports.MINUS     = 0x2D // '-'
  , DOLLAR    = exports.DOLLAR    = 0x24 // '$'
  , STAR      = exports.STAR      = 0x2A // '*'
  , COLON     = exports.COLON     = 0x3A // ':'
  , CR        = exports.CR        = 0x0D // carriage return
  , LF        = exports.LF        = 0x0A // line feed
  ;

// String representations of Redis reply types.
var NONE      = exports.NONE      = "NONE"
  , BULK      = exports.BULK      = "BULK"
  , MULTIBULK = exports.MULTIBULK = "MULTIBULK"
  , INLINE    = exports.INLINE    = "INLINE"
  , INTEGER   = exports.INTEGER   = "INTEGER"
  , ERROR     = exports.ERROR     = "ERROR"
  ;

exports.DEFAULT_HOST = '127.0.0.1'; // Default Redis server IP address.
exports.DEFAULT_PORT = 6379;       // Default Redis server port.

// Error messages for connection issues.
exports.COMMAND_ORPHANED_ERROR = "connection lost before reply received";
exports.NO_CONNECTION_ERROR = "failed to establish a connection to Redis";

// Helper function for debugging binary data.
function debugFilter(buffer, len) {
  // Redis is binary-safe, but for display purposes, we assume
  // textual data is UTF-8 encoded.
  var filtered = buffer.utf8Slice(0, len || buffer.length);

  filtered = filtered.replace(/\r\n/g, '<CRLF>'); // Replace CRLF with a readable token.
  filtered = filtered.replace(/\r/g, '<CR>');     // Replace CR with a readable token.
  filtered = filtered.replace(/\n/g, '<LF>');     // Replace LF with a readable token.

  return filtered;
}

// A fully interruptible and binary-safe parser for Redis replies.
// The `callback` function is invoked for each complete reply parsed from `feed`.
// `thisArg` specifies the 'this' context for the callback invocation.
function ReplyParser(callback, thisArg) {
  this.onReply = callback;
  this.thisArg = thisArg;
  this.clearState();
  this.clearMultiBulkState();
}

exports.ReplyParser = ReplyParser;

// Resets the parser's state for a new reply.
ReplyParser.prototype.clearState = function () {
  this.type = NONE;                   // Current reply type being parsed.
  this.bulkLengthExpected = null;     // Expected length for a bulk reply.
  this.valueBufferLen = 0;            // Current length of the value buffer.
  this.skip = 0;                      // Number of bytes to skip (e.g., LF after CR).
  this.valueBuffer = new Buffer(4096); // Buffer to accumulate reply value bytes.
};

// Resets the parser's state specifically for multi-bulk replies.
ReplyParser.prototype.clearMultiBulkState = function () {
  this.multibulkReplies = null;        // Array to store individual replies within a multi-bulk.
  this.multibulkRepliesExpected = null; // Number of replies expected in the current multi-bulk.
};

// Feeds incoming data to the parser.
ReplyParser.prototype.feed = function (inbound) {
  // Iterate through each byte of the inbound buffer.
  for (var i=0; i < inbound.length; ++i) {
    // If we need to skip bytes (e.g., the LF after a CR), do so.
    if (this.skip > 0) {
      this.skip--;
      continue;
    }

    var typeBefore = this.type; // Store current type before potential change.

    // If no reply type is currently determined, check the first byte.
    if (this.type === NONE) {
      switch (inbound[i]) {
        case DOLLAR:    this.type = BULK;      break;
        case STAR:      this.type = MULTIBULK; break;
        case COLON:     this.type = INTEGER;   break;
        case PLUS:      this.type = INLINE;    break;
        case MINUS:     this.type = ERROR;     break;
      }
    }

    // If the type just changed (meaning we just processed the type indicator byte),
    // then continue to the next byte without processing the current one as part of the value.
    if (typeBefore != this.type) {
      continue;
    }

    // This helper function handles dispatching the parsed reply.
    // It manages multi-bulk aggregation or immediate callback for single replies.
    var self = this;
    var maybeCallbackWithReply = function (reply) {
      if (self.multibulkReplies != null) {
        // If we are currently parsing a multi-bulk reply, add the sub-reply.
        self.multibulkReplies.push(reply);
        // If all sub-replies have been received for the multi-bulk...
        if (--self.multibulkRepliesExpected == 0) {
          // ...then call the main callback with the aggregated multi-bulk.
          self.onReply.call(self.thisArg, {
            type:  MULTIBULK,
            value: self.multibulkReplies
          });
          self.clearMultiBulkState(); // Reset multi-bulk specific state.
        }
      } else {
        // Otherwise, it's a single reply, call the main callback immediately.
        self.onReply.call(self.thisArg, reply);
      }
      self.clearState(); // Reset parser state for the next reply.
      self.skip = 1;     // Skip the subsequent LF character.
    };

    // Process the current byte based on the determined reply type.
    switch (inbound[i]) {
      case CR: // Carriage Return signifies end of line/value.
        switch (this.type) {
          case INLINE:
          case ERROR:
            // CR marks the end of an inline string or error message.
            // Example: +OK\r\n -> CR is at '^'
            var inlineBuf = new Buffer(this.valueBufferLen);
            this.valueBuffer.copy(inlineBuf, 0, 0, this.valueBufferLen);
            maybeCallbackWithReply({ type: this.type, value: inlineBuf });
            break;

          case INTEGER:
            // CR marks the end of an integer value.
            // Example: :42\r\n -> CR is at '^'
            var n = parseInt(this.valueBuffer.asciiSlice(0, this.valueBufferLen), 10);
            maybeCallbackWithReply({ type: INTEGER, value: n });
            break;

          case BULK:
            if (this.bulkLengthExpected == null) {
              // This CR ends the length specifier for a bulk reply.
              // Example: $5\r\nhello\r\n -> CR is at '^'
              var bulkLengthExpected =
                parseInt(this.valueBuffer.asciiSlice(0, this.valueBufferLen), 10);

              if (bulkLengthExpected <= 0) {
                // Null bulk reply ($0\r\n\r\n or $-1\r\n)
                maybeCallbackWithReply({ type: BULK, value: null });
              } else {
                this.clearState(); // Reset for the actual bulk value.
                this.bulkLengthExpected = bulkLengthExpected;
                this.type = BULK; // Maintain BULK type for the value.
                this.skip = 1;    // Skip the LF following this CR.
              }
            } else if (this.valueBufferLen == this.bulkLengthExpected) {
              // This CR ends the actual bulk data.
              // Example: $5\r\nhello\r\n -> CR is at '^'
              var bulkBuf = new Buffer(this.valueBufferLen);
              this.valueBuffer.copy(bulkBuf, 0, 0, this.valueBufferLen);
              maybeCallbackWithReply({ type: BULK, value: bulkBuf });
            } else {
              // An embedded CR within the bulk data, not a protocol delimiter.
              // Example: $11\r\nhello\rworld\r\n -> CR is at '^'
              this.valueBuffer[this.valueBufferLen++] = inbound[i];
            }
            break;

          case MULTIBULK:
            // This CR ends the count of expected replies in a multi-bulk.
            // Example: *2\r\n$5\r\nhello\r\n$5\r\nworld\r\n -> CR is at '^'
            var multibulkRepliesExpected =
              parseInt(this.valueBuffer.asciiSlice(0, this.valueBufferLen), 10);

            if (multibulkRepliesExpected <= 0) {
              // Empty multi-bulk array.
              maybeCallbackWithReply({ type: MULTIBULK, value: null });
            } else {
              this.clearState(); // Reset for parsing sub-replies.
              this.skip = 1;     // Skip the LF.
              this.multibulkReplies = []; // Initialize array for sub-replies.
              this.multibulkRepliesExpected = multibulkRepliesExpected;
            }
            break;
        }
        break;

      default:
        // For any other byte, append it to the current value buffer.
        this.valueBuffer[this.valueBufferLen++] = inbound[i];
        break;
    }

    // If the current value buffer is full, double its size and copy contents.
    if (this.valueBufferLen === this.valueBuffer.length) {
      var newBuffer = new Buffer(this.valueBuffer.length * 2);
      this.valueBuffer.copy(newBuffer, 0, 0);
      this.valueBuffer = newBuffer;
    }
  }
};

/**
 * The Client class emits several events:
 *
 * - 'connected': Fired upon successful initial connection (or reconnection).
 * - 'reconnecting': Fired just before attempting to reconnect to Redis.
 * - 'reconnected': Fired when a connection is re-established after a previous disconnection.
 * - 'noconnection': Fired when a connection (initial or reconnection) fails.
 * - 'drained': Fired when all submitted commands have received their replies from Redis.
 *
 * Options for the Client constructor:
 *
 * - maxReconnectionAttempts: (default: 10) The maximum number of reconnection attempts.
 */
function Client(stream, options) {
  events.EventEmitter.call(this); // Inherit from EventEmitter.

  this.stream = stream;                     // The network stream for communication.
  this.originalCommands = [];               // List of commands awaiting replies.
  this.queuedOriginalCommands = [];         // Commands queued for execution after connection.
  this.queuedRequestBuffers = [];           // Request buffers queued for sending.
  this.channelCallbacks = {};               // Callbacks for PUB/SUB channels.
  this.requestBuffer = new Buffer(512);     // Buffer for outgoing requests.
  this.replyParser = new ReplyParser(this.onReply_, this); // Parser for incoming replies.
  this.reconnectionTimer = null;            // Timer for scheduled reconnection attempts.
  this.maxReconnectionAttempts = 10;        // Max attempts before giving up.
  this.reconnectionAttempts = 0;            // Current number of reconnection attempts.
  this.reconnectionDelay = 500;             // Initial delay for reconnection (doubles each attempt).
  this.connectionsMade = 0;                 // Counter for successful connections.

  if (options !== undefined) {
    this.maxReconnectionAttempts = Math.abs(options.maxReconnectionAttempts || 10);
  }

  var client = this; // Capture 'this' for use in event handlers.

  // Event handler for successful connection.
  stream.addListener("connect", function () {
    if (exports.debugMode) {
      sys.debug("[CONNECT] Client connected to Redis.");
    }

    stream.setNoDelay();    // Disable Nagle's algorithm.
    stream.setTimeout(0);   // Disable idle timeout.

    client.reconnectionAttempts = 0; // Reset reconnection state.
    client.reconnectionDelay = 500;
    if (client.reconnectionTimer) {
      clearTimeout(client.reconnectionTimer);
      client.reconnectionTimer = null;
    }

    var eventName = client.connectionsMade == 0
                  ? 'connected' // First connection.
                  : 'reconnected'; // Subsequent reconnection.

    client.connectionsMade++;
    client.expectingClose = false; // Not expecting a graceful close.

    // If this is a reconnection and there are outstanding commands,
    // they are considered "orphaned" as their replies will never arrive.
    // We notify the user via callbacks with an I/O error.
    if (client.connectionsMade > 1 && client.originalCommands.length > 0) {
      if (exports.debug) {
        sys.debug("[RECONNECTION] " + client.originalCommands.length +
                  " commands were orphaned. Notifying callbacks.");
      }
      client.callbackOrphanedCommandsWithError();
    }

    client.originalCommands = []; // Clear outstanding commands.
    client.flushQueuedCommands(); // Process any commands queued during disconnection.

    client.emit(eventName, client); // Emit the connection event.
  });

  // Event handler for stream errors (e.g., network issues).
  stream.addListener('error', function (e) {
    if (exports.debugMode) {
      sys.debug("[ERROR] Connection to Redis encountered an error: " + e);
    }
  });

  // Event handler for incoming data from Redis.
  stream.addListener("data", function (buffer) {
    if (exports.debugMode) {
      sys.debug("[RECV] " + debugFilter(buffer));
    }
    client.replyParser.feed(buffer); // Feed data to the reply parser.
  });

  // Event handler for stream errors (duplicate listener, but often used for different error handling).
  stream.addListener("error", function (e) {
    if (exports.debugMode) {
      sys.debug('[ERROR] ' + e);
    }
    client.replyParser.clearState(); // Clear parser state on error.
    client.maybeReconnect();         // Attempt to reconnect.
    throw e;                         // Re-throw the error to ensure it's propagated.
  });

  // Event handler when the Redis server ends the connection.
  stream.addListener("end", function () {
    if (exports.debugMode && client.originalCommands.length > 0) {
      sys.debug("Connection to Redis closed with " +
                client.originalCommands.length +
                " commands pending replies that will never arrive!");
    }
    stream.end(); // Ensure the client's side of the stream is also ended.
  });

  // Event handler when the connection is fully closed.
  stream.addListener("close", function (hadError) {
    if (exports.debugMode) {
      sys.debug("[NO CONNECTION] Connection closed. Had error: " + hadError);
    }
    client.maybeReconnect(); // Attempt to reconnect if appropriate.
  });
}

// Inherit from EventEmitter for event emission capabilities.
sys.inherits(Client, events.EventEmitter);

exports.Client = Client;

// Factory function to create a new Redis client.
exports.createClient = function (port, host, options) {
  var port = port || exports.DEFAULT_PORT; // Use default port if not specified.
  var host = host || exports.DEFAULT_HOST; // Use default host if not specified.

  // Create the network connection and then wrap it in a Client object.
  var client = new Client(net.createConnection(port, host), options);

  client.port = port; // Store port and host on the client instance.
  client.host = host;

  return client;
};

// Gracefully close the client connection.
Client.prototype.close = function () {
  this.expectingClose = true; // Flag that we initiated the close.
  this.stream.end();         // End the underlying network stream.
};

// Internal callback for the ReplyParser, invoked when a reply is parsed.
Client.prototype.onReply_ = function (reply) {
  this.flushQueuedCommands(); // Attempt to send any queued commands.

  // Check if the reply is a published message and handle it.
  if (this.handlePublishedMessage_(reply)) {
    return; // If it was a pub/sub message, we're done.
  }

  // Retrieve the original command that this reply corresponds to.
  var originalCommand = this.originalCommands.shift();
  // The last element of the original command array is typically the callback.
  var callback = originalCommand[originalCommand.length - 1];

  // Callbacks expect arguments in the format (err, reply).
  if (typeof callback == "function") {
    if (reply.type == ERROR) {
      // If it's an ERROR reply, pass the error message.
      callback(reply.value.utf8Slice(0, reply.value.length), null);
    } else {
      // Otherwise, pass the parsed reply value.
      callback(null, maybeConvertReplyValue(originalCommand[0], reply));
    }
  }

  // If there are no more commands awaiting replies, emit the 'drained' event.
  if (this.originalCommands.length == 0) {
    this.emit('drained', this);
  }
};

// Handles incoming published messages (PUB/SUB).
Client.prototype.handlePublishedMessage_ = function (reply) {
  // We are looking for a multi-bulk reply structured like:
  // ["message", "channelName", messageBuffer]
  // or
  // ["pmessage", "matchingPattern", "channelName", messageBuffer]
  // The latter is for pattern subscriptions; the former for direct channel subscriptions.
  // Clients subscribed by both name and pattern for the same channel may receive
  // multiple notifications.

  if (reply.type != MULTIBULK || !(reply.value instanceof Array)) {
    return false; // Not a multi-bulk or not an array, so not a message.
  }

  // Check if it's a 'message' type.
  var isMessage = (reply.value.length == 3 &&
                   reply.value[0].value.length == 7 &&
                   reply.value[0].value.asciiSlice(0, 7) == 'message');

  // Check if it's a 'pmessage' type.
  var isPMessage = (reply.value.length == 4 &&
                    reply.value[0].value.length == 8 &&
                    reply.value[0].value.asciiSlice(0, 8) == 'pmessage');

  if (!isMessage && !isPMessage) {
    return false; // Neither a 'message' nor a 'pmessage'.
  }

  // This part is a bit subtle: we return 'true' even if no callback is found.
  // This is because the reply *was* a published message, and thus "handled"
  // from the protocol parsing perspective, even if no application code consumes it.
  // This might occur if a client subscribes, then unsubscribes, but a message
  // is already in transit.

  if (Object.getOwnPropertyNames(this.channelCallbacks).length == 0) {
    return true; // No channel callbacks registered, but it was a message.
  }

  var channelName, channelPattern, channelCallback, payload;

  if (isMessage) {
    channelName = reply.value[1].value;
    channelCallback = this.channelCallbacks[channelName];
    payload = reply.value[2].value;
  } else if (isPMessage) {
    channelPattern = reply.value[1].value;
    channelName = reply.value[2].value;
    channelCallback = this.channelCallbacks[channelPattern];
    payload = reply.value[3].value;
  } else {
    return false; // Should not happen due to prior checks, but for safety.
  }

  if (typeof channelCallback == "function") {
    // Invoke the appropriate callback for the channel/pattern.
    channelCallback(channelName, payload, channelPattern);
    return true; // Message was consumed by a registered callback.
  }

  return false; // Message was identified but no callback was found for it.
};

// Attempts to convert a string to a number if possible.
function maybeAsNumber(str) {
  var value = parseInt(str, 10); // Try parsing as an integer.

  if (isNaN(value)) {
    value = parseFloat(str); // If not an int, try as a float.
  }

  if (isNaN(value)) {
    return str; // If still not a number, return the original string.
  }

  return value; // Return the numeric value.
}

// Converts reply values based on the command that generated them.
function maybeConvertReplyValue(commandName, reply) {
  if (reply.value === null) {
    return null; // Null replies remain null.
  }

  // Special handling for the 'INFO' command:
  // Redis' INFO command returns a BULK reply formatted as:
  // "redis_version:1.3.8\r\narch_bits:64\r\nmux_api:kqueue\r\n..."
  // This function converts it into a JavaScript object:
  // { redis_version: '1.3.8', arch_bits: '64', ... }

  if (commandName === 'info' && reply.type === BULK) {
    var info = {}; // Initialize an empty object for the info properties.
    reply.value.asciiSlice(0, reply.value.length).split(/\r\n/g)
      .forEach(function (line) {
        // ... (rest of the `info` parsing logic would go here)
        // Note: The original code snippet was truncated here.
        // For a Type I clone, this part of the logic must remain identical.
        // Assuming the original code continued:
        // var parts = line.split(':');
        // if (parts.length === 2) {
        //   info[parts[0]] = parts[1];
        // }
      });
  }
}
// ... (The rest of the file would continue here if the original was longer)