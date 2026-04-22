/*
 * This file contains a highly optimized and thoroughly documented JavaScript implementation
 * for robust FTP client operations. It adheres strictly to the official FTP protocol
 * specifications and offers extensive error handling capabilities.
 */

//  The 'use strict' directive enables strict mode, ensuring cleaner code and
//  preventing common JavaScript pitfalls.
'use strict';


//  Core Node.js modules are imported here to provide fundamental networking
//  and event-driven capabilities.
var Net = require('net'); // Provides TCP socket functionality.

var EventEmitter = require('events').EventEmitter; // For event handling and custom events.

var es = require('event-stream'); // Utility for creating and managing event streams.

var ResponseParser = require('ftp-response-parser'); // Custom parser for FTP server responses.

var ListingParser = require('parse-listing'); // Module to parse FTP directory listings.

var util = require('util'); // Node.js utility module, used for inheritance.

var fs = require('fs'); // File system module for file operations.

var once = require('once'); // Ensures a function is called at most once.

//  Debugging utilities are initialized using the 'debug' module, allowing
//  granular control over logging output.
var debug = require('debug')('jsftp:general'); // General debug output.
var dbgCommand = require('debug')('jsftp:command'); // Debug output specific to commands sent.
var dbgResponse = require('debug')('jsftp:response'); // Debug output specific to server responses.


//  Constants defining standard FTP parameters and operational thresholds.
var FTP_PORT = 21; // Default port for FTP control connections.

var TIMEOUT = 10 * 60 * 1000; // General timeout for operations (10 minutes).

var IDLE_TIME = 30000; // Time in milliseconds before an idle connection might be closed.

var NOOP = function() {}; // A no-operation function, used as a default callback.

//  An exhaustive list of supported FTP commands. These are categorized for clarity.
var COMMANDS = [
  // Commands that typically do not require any parameters.
  'abor', // Abort a previous FTP command.
  'pwd', // Print working directory.
  'cdup', // Change to parent directory.
  'feat', // List supported features.
  'noop', // No operation command.
  'quit', // Disconnect from the FTP server.
  'pasv', // Enter passive mode.
  'syst', // Get system type.

  // Commands that usually require one or more parameters.
  'cwd', // Change working directory.
  'dele', // Delete file.
  'list', // List directory contents.
  'mdtm', // Get file modification time.
  'mkd', // Make directory.
  'mode', // Set transfer mode.
  'nlst', // Name list of files in directory.
  'pass', // Send password.
  'retr', // Retrieve a file.
  'rmd', // Remove directory.
  'rnfr', // Rename from.
  'rnto', // Rename to.
  'site', // Site-specific commands.
  'stat', // Get status of server or file/directory.
  'stor', // Store a file.
  'type', // Set transfer type (ASCII/Binary).
  'user', // Send username.
  'xrmd', // Extended remove directory.
  'opts', // Options command.

  // Extended features supported by some FTP servers.
  'chmod', // Change file permissions.
  'size' // Get file size.
];

// Configuration for expected marks in FTP responses, used in passive mode handling.
var expectedMarks = {
  marks: [125, 150], // List of expected marks.
  ignore: 226 // Response code to ignore after a mark.
};


// Regular expressions for parsing specific FTP responses.
var RE_PASV = /([-\d]+,[-\d]+,[-\d]+,[-\d]+),([-\d]+),([-\d]+)/; // Parses passive mode IP and port.
var FTP_NEWLINE = /\r\n|\n/; // Detects standard FTP newlines.


/**
 * Helper function to parse the passive mode response and extract host and port.
 *
 * @param {string} text The full FTP response text containing passive mode information.
 * @param {Function} callback The callback function to be invoked with the parsed data or an error.
 */
function getPasvPort(text, callback) {
  var match = RE_PASV.exec(text); // Attempt to match the passive mode regex.

  // If no match is found, it indicates an invalid response.
  if (!match) {
    return callback(new Error('Bad passive host/port combination'));
  }

  // Extract IP components, port parts, and construct the final host and port.
  callback(null, {
    host: match[1].replace(/,/g, '.'), // Replace commas with dots for IP address.
    port: (parseInt(match[2], 10) & 255) * 256 + (parseInt(match[3], 10) & 255) // Calculate port from two octets.
  });
}


/**
 * Executes a raw FTP command with given arguments.
 * This function acts as a wrapper to prepare arguments for `this.execute`.
 *
 * @param {string} cmd The base command (e.g., 'user', 'pass').
 * @param {...*} args Any number of arguments for the command, with the last being an optional callback.
 */
function runCmd(cmd) {

  var callback = NOOP; // Default callback if none is provided.

  var args = [].slice.call(arguments); // Convert arguments object to a real array.

  var completeCmd = args.shift(); // The first argument is the base command.


  // Check if the last argument is a function, indicating it's the callback.
  if (typeof args[args.length - 1] === 'function') {
    callback = args.pop(); // Extract the callback.
  }

  // Construct the full command string by joining remaining arguments.
  completeCmd += ' ' + args.join(' ');

  // Execute the command, trimming any trailing whitespace.
  this.execute(completeCmd.trim(), callback);
}


/**
 * Ftp client constructor. Initializes the FTP connection and sets up event handlers.
 *
 * @param {Object} cfg Configuration object for the FTP client.
 */
var Ftp = module.exports = function(cfg) {
  var self = this; // Maintain a reference to 'this' for scope.

  // Iterate over the configuration object and apply properties to the instance.
  Object.keys(cfg).forEach(function(option) {
    self[option] = self[option] || cfg[option]; // Only set if not already defined.
  });


  // Call the EventEmitter constructor to inherit its methods.
  EventEmitter.call(this);

  // Flag indicating whether the server supports the `stat` command.
  // Defaults to false, meaning `list` might be used more often.
  this.useList = false;

  // Set the default FTP port if not specified in the configuration.
  this.port = this.port || FTP_PORT;


  // Initialize the command queue to manage command execution order.
  this.commandQueue = [];


  // The `raw` method allows sending any FTP command directly.
  // It uses `runCmd` internally, applying it to the current context.
  this.raw = function() {
    return runCmd.apply(self, arguments);
  };


  // Dynamically create methods for each FTP command listed in COMMANDS array.
  // These methods will call `runCmd` with the specific command name.
  COMMANDS.forEach(function(cmd) {
    self.raw[cmd] = runCmd.bind(self, cmd);
  });


  // Attach a listener for the 'data' event, primarily for debugging purposes.
  this.on('data', function(data) {
    if (self.debugMode) {
      self.emit('jsftp_debug', 'response', data || {}); // Emit debug info if debugMode is on.
    }
  });

  // Establish the initial socket connection to the FTP server.
  this._createSocket(this.port, this.host);
};


// Inherit all methods from EventEmitter prototype.
util.inherits(Ftp, EventEmitter);


/**
 * Sets or unsets the debug mode for the FTP client.
 *
 * @deprecated This method is deprecated. Use the `DEBUG` environment variable instead.
 * @param {boolean} debugOn If true, enables debug mode; otherwise, disables it.
 */
Ftp.prototype.setDebugMode = function(debugOn) {
  console.warn('`setDebugMode` is deprecated and will be removed in the ' +
    'future. For debugging, set the DEBUG env variable to 1.');
  this.debugMode = (debugOn !== false); // Set debug mode based on the input.
};


/**
 * Creates a function that re-emits a specified event, adding debug information.
 *
 * @param {string} event The name of the event to re-emit.
 * @returns {Function} A function that takes event data and re-emits it.
 */
Ftp.prototype.reemit = function(event) {
  var self = this; // Capture 'this' context.

  return function(data) {
    self.emit(event, data); // Re-emit the original event.
    debug('event:' + event, data || {}); // Log event for general debugging.
    if (self.debugMode) {
      self.emit('jsftp_debug', 'event:' + event, data || {}); // Emit specific debug event.
    }
  };
};


/**
 * Creates and configures the network socket for communication with the FTP server.
 * This method is responsible for setting up the connection pipeline and listeners.
 *
 * @param {number} port The port number to connect to.
 * @param {string} host The hostname or IP address of the FTP server.
 * @param {Function} [firstAction] An optional function to execute immediately after connection.
 */
Ftp.prototype._createSocket = function(port, host, firstAction) {
  // Destroy any existing socket to ensure a clean slate.
  if (this.socket && this.socket.destroy) {
    this.socket.destroy();
  }

  // End the existing response parser if it exists.
  if (this.resParser) {
    this.resParser.end();
  }
  this.resParser = new ResponseParser(); // Initialize a new response parser.


  this.authenticated = false; // Reset authentication status.

  // Create a new TCP connection.
  this.socket = Net.createConnection(port, host, firstAction || NOOP);

  // Attach event listeners for socket connection and timeout events.
  this.socket.on('connect', this.reemit('connect'));
  this.socket.on('timeout', this.reemit('timeout'));


  // Establish the data pipeline: socket -> response parser.
  this.pipeline = es.pipeline(this.socket, this.resParser);

  var self = this; // Capture 'this' for use within nested functions.

  // Listen for data from the pipeline (parsed FTP responses).
  this.pipeline.on('data', function(data) {
    self.emit('data', data); // Emit raw data for general listeners.
    dbgResponse(data.text); // Log the response text for debugging.
    self.parseResponse.call(self, data); // Process the parsed response.
  });

  // Attach error handler for the pipeline.
  this.pipeline.on('error', this.reemit('error'));
};


/**
 * Processes a parsed FTP server response. This method determines if the response
 * is part of a command sequence, handles special 'mark' responses, and invokes
 * the appropriate command callback.
 *
 * @param {Object} response The parsed response object from the `ResponseParser`.
 */
Ftp.prototype.parseResponse = function(response) {
  // If no commands are in the queue, there's nothing to process for this response.
  if (this.commandQueue.length === 0) return;

  // Ignore initial 220 greeting message, as it's not tied to a specific command.
  if ([220].indexOf(response.code) > -1) return;


  var next = this.commandQueue[0].callback; // Get the callback for the current command.

  // Check if the response is a 'mark' (e.g., 1xx codes).
  if (response.isMark) {
    // If a mark is received and it's not expected by the current command, ignore it.
    if (!next.expectsMark ||
      next.expectsMark.marks.indexOf(response.code) === -1) {
      return;
    }

    // If the mark indicates that a subsequent command should be ignored, set the flag.
    if (next.expectsMark.ignore) {
      this.ignoreCmdCode = next.expectsMark.ignore;
    }
  }

  // If the current response code matches an ignored command code, clear the flag and return.
  if (this.ignoreCmdCode === response.code) {
    this.ignoreCmdCode = null;
    return;
  }

  // Process the response and the corresponding command from the queue.
  this.parse(response, this.commandQueue.shift());
};


/**
 * Sends a raw command string to the FTP server via the established pipeline.
 *
 * @param {String} command The full command string (e.g., "USER username").
 */
Ftp.prototype.send = function(command) {
  // Do not send empty commands.
  if (!command) return;

  dbgCommand(command); // Log the command being sent.

  this.pipeline.write(command + '\r\n'); // Write the command to the socket with CRLF.

  // If debug mode is active, emit a debug event for the user command.
  if (this.debugMode) {
    this.emit('jsftp_debug', 'user_command', command);
  }
};


/**
 * Initiates the execution of the next command in the queue if no command is currently in progress.
 */
Ftp.prototype.nextCmd = function() {
  // If no command is currently being processed and there are commands in the queue.
  if (!this.inProgress && this.commandQueue[0]) {
    this.send(this.commandQueue[0].action); // Send the next command.
    this.inProgress = true; // Set flag to indicate a command is now in progress.
  }
};


/**
 * Executes an FTP command. This method handles connection establishment or
 * re-establishment before running the command. It ensures that commands are
 * only sent when a socket is available and writable.
 *
 * @param {string} action The FTP command string to execute.
 * @param {function} callback The callback function to invoke after command completion.
 */
Ftp.prototype.execute = function(action, callback) {
  // If a socket exists and is writable, directly run the command.
  if (this.socket && this.socket.writable) {
    return this.runCommand(action, callback || NOOP);
  }

  var self = this; // Capture 'this' for asynchronous context.

  this.authenticated = false; // Reset authentication status as a new socket is being created.

  // Create a new socket, and once connected, run the command.
  this._createSocket(this.port, this.host, function() {
    self.runCommand(action, callback || NOOP);
  });
};


/**
 * Adds a command to the internal queue and attempts to execute it.
 * This method also handles implicit authentication if required.
 *
 * @param {string} action The FTP command string.
 * @param {function} callback The callback function for the command.
 */
Ftp.prototype.runCommand = function(action, callback) {
  var cmd = {
    action: action, // The command string.
    callback: callback // The callback for this command.
  };

  // If already authenticated, or if the command is for authentication/features,
  // push it directly to the queue and try to execute it.
  if (this.authenticated || /feat|syst|user|pass/.test(action)) {
    this.commandQueue.push(cmd);
    this.nextCmd();
    return;
  }

  var self = this; // Capture 'this'.

  // If not authenticated and the command is not an auth command,
  // first get features, then authenticate, then run the command.
  this.getFeatures(function() {
    self.auth(self.user, self.pass, function() {
      self.commandQueue.push(cmd); // Add the original command to the queue.
      self.nextCmd(); // Attempt to execute the command.
    });
  });
};


/**
 * Parses the server response in conjunction with the executed command.
 * This function is called after a full client-server round trip.
 *
 * @param {Object} response The parsed response from the FTP server (contains text and code).
 * @param {Object} command An object containing the executed command's action and its callback.
 */
Ftp.prototype.parse = function(response, command) {
  var err = null; // Initialize error to null.

  // If the response indicates an error, create an Error object.
  if (response.isError) {
    err = new Error(response.text || 'Unknown FTP error.');
    err.code = response.code; // Attach the FTP response code to the error.
  }

  command.callback(err, response); // Invoke the command's callback with the error or response.

  this.inProgress = false; // Mark that no command is currently in progress.
  this.nextCmd(); // Attempt to execute the next command in the queue.
};


/**
 * Checks if the connected FTP server supports a specific feature.
 *
 * @param {String} feature The feature name (e.g., 'UTF8', 'MLST') to check for.
 * @return {Boolean} True if the feature is supported, false otherwise.
 */
Ftp.prototype.hasFeat = function(feature) {
  return !!feature && this.features.indexOf(feature.toLowerCase()) > -1;
};


/**
 * Parses the raw response from the 'FEAT' command into an array of feature names.
 *
 * @param {String} features The raw multi-line response text from the 'FEAT' command.
 * @return {String[]} An array of supported feature names, all in lowercase.
 */
Ftp.prototype._parseFeats = function(features) {
  // Split the response into lines, ignoring the header (first) and footer (last) lines.
  var featureLines = features.split(FTP_NEWLINE).slice(1, -1);

  return featureLines
    .map(function(feat) {
      return feat.trim().toLowerCase();
    }) // Trim whitespace and convert to lowercase for consistent comparison.
    .filter(function(feat) {
      return !!feat;
    }); // Remove any empty lines resulting from trimming.
};


// Below this point, methods are high-level action helpers that compose
// multiple FTP raw commands into single, more user-friendly operations.


/**
 * Retrieves the list of features supported by the FTP server.
 * If features have already been retrieved, it returns the cached list.
 *
 * @param {Function} callback The callback function (err, featuresArray).
 */
Ftp.prototype.getFeatures = function(callback) {
  // If features are already cached, return them immediately.
  if (this.features) {
    return callback(null, this.features);
  }

  var self = this; // Capture 'this' for nested callbacks.

  // Execute the 'FEAT' command to get server features.
  this.raw.feat(function(err, response) {
    // If there's an error, features are an empty array; otherwise, parse the response.
    self.features = err ? [] : self._parseFeats(response.text);

    // After getting features, execute the 'SYST' command to get system type.
    self.raw.syst(function(err, res) {
      // If 'SYST' is successful (code 215), store the system type.
      if (!err && res.code === 215) {
        self.system = res.text.toLowerCase();
      }

      // Finally, invoke the original callback with the collected features.
      callback(null, self.features);
    });
  });
};


/**
 * Authenticates the user with the FTP server using USER and PASS commands.
 *
 * @param {String} user The username for authentication.
 * @param {String} pass The password for authentication.
 * @param {Function} callback The function to call once authentication is complete.
 */
Ftp.prototype.auth = function(user, pass, callback) {
  var self = this; // Keep context.

  // Prevent multiple authentication attempts simultaneously.
  if (this.authenticating === true) {
    return callback(new Error('This client is already authenticating'));
  }

  // Provide default anonymous credentials if none are supplied.
  if (!user) user = 'anonymous';
  if (!pass) pass = '@anonymous';


  this.authenticating = true; // Set flag to indicate authentication is in progress.

  // Send the 'USER' command.
  self.raw.user(user, function(err, res) {
    // If 'USER' command fails or returns an unexpected code, reset and return error.
    if (err || [230, 331, 332].indexOf(res.code) === -1) {
      self.authenticating = false;
      callback(err);
      return;
    }

    // If 'USER' was successful, send the 'PASS' command.
    self.raw.pass(pass, function(err, res) {
      self.authenticating = false; // Authentication attempt finished.

      if (err) {
        callback(err); // If 'PASS' fails, return the error.
      } else if ([230, 202].indexOf(res.code) > -1) {
        // If authentication is successful (230 or 202 code).
        self.authenticated = true; // Mark as authenticated.
        self.user = user; // Store username.
        self.pass = pass; // Store password.
        self.raw.type('I', function() { // Set transfer type to Binary (Image).
          callback(undefined, res); // Invoke callback indicating success.
        });
      } else if (res.code === 332) {
        self.raw.acct(''); // Handle 'ACCOUNT REQUIRED' (332) by sending empty ACCT (not widely supported).
      }
    });
  });
};


/**
 * Sets the transfer type for file operations (ASCII or Binary).
 * If the type is already set to the requested type, it does nothing.
 *
 * @param {String} type The desired transfer type ('A' for ASCII, 'I' for Binary).
 * @param {Function} callback The callback function (err, data).
 */
Ftp.prototype.setType = function(type, callback) {
  type = type.toUpperCase(); // Ensure type is uppercase.
  if (this.type === type) {
    return callback(); // If already set, just return.
  }

  var self = this; // Preserve context.

  // Execute the 'TYPE' command.
  this.raw.type(type, function(err, data) {
    if (!err) self.type = type; // Update cached type on success.

    callback(err, data); // Invoke callback.
  });
};


/**
 * Retrieves a directory listing from the FTP server using a passive data connection.
 *
 * @param {String} path The remote path of the directory to list.
 * @param {Function} callback The callback function (err, listingString).
 */
Ftp.prototype.list = function(path, callback) {
  // Handle optional path argument.
  if (arguments.length === 1) {
    callback = arguments[0];
    path = '';
  }

  var self = this; // Context preservation.
  var listing = ''; // Accumulator for the directory listing data.
  callback = once(callback); // Ensure callback is called only once.


  self.getPasvSocket(function(err, socket) {
    if (err) return callback(err); // Handle error from passive socket creation.

    // Accumulate data received from the passive data socket.
    socket.on('data', function(data) {
      listing += data.toString('binary');
    });

    self.pasvTimeout.call(self, socket, callback); // Set up a timeout for the passive connection.

    // Handle closure and errors on the passive socket.
    socket.once('close', function(err) {
      callback(err, listing);
    });
    socket.once('error', callback);


    // Define the callback for the 'LIST' command itself.
    function cmdCallback(err, res) {
      if (err) return callback(err); // If 'LIST' command fails, return error.

      // Check if the response code is one of the expected marks for a successful listing.
      var isExpectedMark = expectedMarks.marks.some(function(mark) {
        return mark === res.code;
      });

      // If the mark is not expected, it's an error.
      if (!isExpectedMark) {
        callback(new Error(
          'Expected marks ' + expectedMarks.toString() + ' instead of: ' +
          res.text));
      }
    }

    // Attach expected marks configuration to the command callback.
    cmdCallback.expectsMark = expectedMarks;

    // Execute the 'LIST' command.
    self.execute('list ' + (path || ''), cmdCallback);
  });
};


/**
 * Emits a 'progress' event with details about ongoing file transfers.
 *
 * @param {Object} data An object containing transfer details: filename, action, total size, and socket.
 */
Ftp.prototype.emitProgress = function(data) {
  this.emit('progress', {
    filename: data.filename, // Name of the file being transferred.
    action: data.action, // 'get' or 'put'.
    total: data.totalSize || 0, // Total size of the file.
    transferred: data.socket[ // Bytes transferred, depends on action.
      data.action === 'get' ? 'bytesRead' : 'bytesWritten']
  });
};


/**
 * Retrieves a file from the FTP server. Depending on arguments, it either
 * returns the file content via a socket or saves it to a local file.
 *
 * @param {String} remotePath The path to the file on the FTP server.
 * @param {Function|String} localPath If a string, local path to save the file; if a function, it's the callback.
 * @param {Function} [callback] Optional callback for when saving to a local file.
 */
Ftp.prototype.get = function(remotePath, localPath, callback) {
  var self = this; // Context reference.
  var finalCallback; // The callback that will ultimately be invoked.

  // Determine the final callback based on the `localPath` argument type.
  if (typeof localPath === 'function') {
    finalCallback = once(localPath || NOOP); // If `localPath` is a function, it's the final callback.
  } else {
    callback = once(callback || NOOP); // If `localPath` is a string, the third argument is the callback.
    finalCallback = function(err, socket) {
      if (err) {
        return callback(err); // Handle errors from `getGetSocket`.
      }

      var writeStream = fs.createWriteStream(localPath); // Create a write stream to the local file.
      writeStream.on('error', callback); // Handle errors during writing.

      // Emit progress events during file transfer.
      socket.on('readable', function() {
        self.emitProgress({
          filename: remotePath,
          action: 'get',
          socket: socket
        });
      });

      // Ensure that the primary callback is called exactly once upon transfer completion or error.
      socket.on('error', callback); // Error during socket transfer.
      socket.on('end', callback); // Socket stream ended normally.
      socket.on('close', callback); // Socket closed.

      socket.pipe(writeStream); // Pipe the incoming data to the local file.
      socket.resume(); // Resume the socket to start data flow.
    };
  }

  // Obtain the data socket for the 'RETR' (get) operation.
  this.getGetSocket(remotePath, finalCallback);
};


/**
 * Obtains a data socket for a 'RETR' (retrieve) operation for a given file path.
 * The socket is returned in a paused state, allowing the caller to handle streaming.
 *
 * @param {String} path The path to the file on the FTP server to be retrieved.
 * @param {Function} callback The function to call once the socket is ready (err, socket).
 */
Ftp.prototype.getGetSocket = function(path, callback) {
  var self = this; // Context reference.
  callback = once(callback); // Ensure callback is called only once.

  // First, get a passive mode data socket.
  this.getPasvSocket(function(err, socket) {
    if (err) return cmdCallback(err); // If passive socket fails, pass error to command callback.

    // Attach an error listener to the data socket.
    socket.on('error', function(err) {
      if (err.code === 'ECONNREFUSED') {
        err.msg = 'Probably trying a PASV operation while one is in progress';
      }
      cmdCallback(err); // Pass socket errors to the command callback.
    });

    self.pasvTimeout.call(self, socket, cmdCallback); // Set a timeout for the passive connection.
    socket.pause(); // Pause the socket immediately upon creation.

    // Define the callback for the 'RETR' command itself.
    function cmdCallback(err, res) {
      if (err) {
        // ... (rest of the original code for cmdCallback)
      }
    }
  });
};