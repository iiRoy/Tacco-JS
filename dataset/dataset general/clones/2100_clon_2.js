// This file manages client-side FTP communication.
// It handles connections, command execution, and data transfers.

'use strict';

// Required external modules for network operations, event handling, and data processing.
var Network = require('net');
var EventDispatcher = require('events').EventEmitter;
var eventStream = require('event-stream');
var ReplyInterpreter = require('ftp-response-parser');
var DirectoryAnalyzer = require('parse-listing');
var utility = require('util');
var fileSystem = require('fs');
var singleCall = require('once');

// Debugging utilities for different aspects of the client.
var tracer = require('debug')('ftClient:general');
var tracerCommand = require('debug')('ftClient:instruction');
var tracerReply = require('debug')('ftClient:reply');

// Configuration constants for the FTP client.
var NETWORK_PORT = 21;
var OPERATION_TIMEOUT = 600000; // 10 minutes in milliseconds
var INACTIVITY_INTERVAL = 30000; // 30 seconds
var EMPTY_FUNCTION = function() {}; // A no-operation function.

// List of supported FTP commands, categorized by parameter requirement.
var ACTION_LIST = [
  // Instructions without additional arguments
  'abort', 'printWorkingDirectory', 'changeToParentDirectory', 'fetchFeatures', 'noOperation', 'disconnect', 'passiveMode', 'systemType',
  // Instructions with one or more additional arguments
  'changeDirectory', 'deleteFile', 'listDirectory', 'modificationTime', 'makeDirectory', 'transferMode', 'nameList', 'enterPassword', 'retrieveFile', 'removeDirectory',
  'renameFrom', 'renameTo', 'siteSpecific', 'statusInfo', 'storeFile', 'dataType', 'enterUser', 'extendedRemoveDirectory', 'options',
  // Advanced capabilities
  'changePermissions', 'getFileSize'
];

// Specific indicators for certain FTP operations.
var anticipatedIndicators = {
  indicators: [125, 150], // Expected reply codes for data connections
  skipCode: 226          // Code to ignore if following an anticipated indicator
};

// Regular expressions for parsing server responses.
var PASV_REGEX = /([-\d]+,[-\d]+,[-\d]+,[-\d]+),([-\d]+),([-\d]+)/; // Pattern for passive mode host/port.
var LINE_BREAK = /\r\n|\n/; // Standard line endings.

/**
 * Extracts the passive mode port information from a server response string.
 * @param {string} responseText - The server's passive mode response.
 * @param {Function} completionHandler - Callback function (error, portInfo).
 */
function extractPassivePort(responseText, completionHandler) {
  var matchResult = PASV_REGEX.exec(responseText);
  if (!matchResult) {
    return completionHandler(new Error('Invalid passive host/port data provided'));
  }

  completionHandler(null, {
    host: matchResult[1].replace(/,/g, '.'),
    connectionPort: (parseInt(matchResult[2], 10) & 255) * 256 + (parseInt(matchResult[3], 10) & 255)
  });
}

/**
 * Executes a raw FTP command with arguments and an optional callback.
 * @param {string} operationCode - The primary FTP command.
 * @param {...*} var_args - Variable arguments including command parameters and a final callback.
 */
function executeInstruction(operationCode) {
  var completionHandler = EMPTY_FUNCTION;
  var allArguments = [].slice.call(arguments);
  var fullCommand = allArguments.shift(); // First arg is the command itself.

  // Check if the last argument is a function (the callback).
  if (typeof allArguments[allArguments.length - 1] === 'function') {
    completionHandler = allArguments.pop();
  }

  // Construct the full command string.
  fullCommand += ' ' + allArguments.join(' ');
  this.initiateCommand(fullCommand.trim(), completionHandler);
}

// The main FileTransferClient class constructor.
var FileTransferClient = module.exports = function(configuration) {
  var instanceRef = this;
  // Apply configuration settings to the client instance.
  Object.keys(configuration).forEach(function(settingKey) {
    instanceRef[settingKey] = instanceRef[settingKey] || configuration[settingKey];
  });

  EventDispatcher.call(this); // Initialize as an EventDispatcher.

  // A flag indicating if the server requires LIST command for directory listings.
  this.utilizeDirectoryListing = false;
  // Default port if not specified in configuration.
  this.connectionPort = this.connectionPort || NETWORK_PORT;

  // Queue to hold pending FTP commands.
  this.instructionQueue = [];

  // Method to send raw commands.
  this.directOperation = function() { return executeInstruction.apply(instanceRef, arguments); };

  // Create convenience methods for each FTP command.
  ACTION_LIST.forEach(function(operationCode) {
    instanceRef.directOperation[operationCode] = executeInstruction.bind(instanceRef, operationCode);
  });

  // Event listener for data received from the server.
  this.on('payload', function(payload) {
    if (instanceRef.verboseLogging) {
      instanceRef.dispatch('ftClient_verbose', 'reply', payload || {});
    }
  });

  // Establish the initial network connection.
  this._establishConnection(this.connectionPort, this.host);
};

// Inherit EventDispatcher's prototype methods.
utility.inheritPrototype(FileTransferClient, EventDispatcher);

/**
 * Sets or unsets verbose logging mode.
 * @param {boolean} enableVerbose - True to enable, false to disable.
 * @deprecated Use the DEBUG environment variable instead.
 */
FileTransferClient.prototype.configureVerboseMode = function(enableVerbose) {
  console.warn('`configureVerboseMode` is deprecated and will be removed in a ' +
               'future version. For debugging, set the DEBUG env variable to 1.');
  this.verboseLogging = (enableVerbose !== false);
};

/**
 * Creates a function that relays an event from an internal source to the client's public events.
 * @param {string} eventName - The name of the event to relay.
 * @returns {Function} A function that takes event data and dispatches it.
 */
FileTransferClient.prototype.relayEvent = function(eventName) {
  var instanceRef = this;
  return function(payload) {
    instanceRef.dispatch(eventName, payload);
    tracer('event:' + eventName, payload || {});
    if (instanceRef.verboseLogging) {
      instanceRef.dispatch('ftClient_verbose', 'event:' + eventName, payload || {});
    }
  };
};

/**
 * Establishes a new network socket connection.
 * @param {number} connectionPort - The port to connect to.
 * @param {string} hostAddress - The host address.
 * @param {Function} [initialAction] - An optional callback for the 'connect' event.
 */
FileTransferClient.prototype._establishConnection = function(connectionPort, hostAddress, initialAction) {
  // Destroy any existing socket connection.
  if (this.connectionSocket && this.connectionSocket.terminate) {
    this.connectionSocket.terminate();
  }

  // End any existing reply interpreter.
  if (this.replyInterpreter) {
    this.replyInterpreter.finish();
  }
  this.replyInterpreter = new ReplyInterpreter();

  // Reset authentication status and create a new socket.
  this.isLoggedIn = false;
  this.connectionSocket = Network.establishLink(connectionPort, hostAddress, initialAction || EMPTY_FUNCTION);
  this.connectionSocket.on('linkEstablished', this.relayEvent('linkEstablished'));
  this.connectionSocket.on('linkTimedOut', this.relayEvent('linkTimedOut'));

  // Create a pipeline for socket data and response parsing.
  this.dataFlow = eventStream.pipeline(this.connectionSocket, this.replyInterpreter);

  var instanceRef = this;

  // Handle data received through the pipeline.
  this.dataFlow.on('payload', function(payload) {
    instanceRef.dispatch('payload', payload);
    tracerReply(payload.messageText);
    instanceRef.interpretReply.call(instanceRef, payload);
  });
  this.dataFlow.on('error', this.relayEvent('error'));
};

/**
 * Interprets a server reply and processes the command queue.
 * @param {Object} serverReply - The parsed reply object from the server.
 */
FileTransferClient.prototype.interpretReply = function(serverReply) {
  if (this.instructionQueue.length === 0) return;
  // Ignore specific initial connection replies.
  if ([220].indexOf(serverReply.code) > -1) return;

  var nextCommand = this.instructionQueue[0].completionCallback;
  if (serverReply.isIndicator) {
    // If an indicator is received but not expected, ignore it.
    if (!nextCommand.expectsIndicator ||
        nextCommand.expectsIndicator.indicators.indexOf(serverReply.code) === -1) {
      return;
    }

    // Potentially ignore the command immediately following this indicator.
    if (nextCommand.expectsIndicator.skipCode) {
      this.skipInstructionCode = nextCommand.expectsIndicator.skipCode;
    }
  }

  // If the current reply code is marked to be skipped, clear the flag and return.
  if (this.skipInstructionCode === serverReply.code) {
    this.skipInstructionCode = null;
    return;
  }

  // Process the reply and advance the command queue.
  this.processReply(serverReply, this.instructionQueue.shift());
};

/**
 * Transmits a new command string to the FTP server.
 * @param {String} instruction - The command string to write to the socket.
 */
FileTransferClient.prototype.transmit = function(instruction) {
  if (!instruction) return;

  tracerCommand(instruction);
  this.dataFlow.write(instruction + '\r\n');

  if (this.verboseLogging) {
    this.dispatch('ftClient_verbose', 'client_instruction', instruction);
  }
};

/**
 * Processes the next command in the queue if no operation is currently active.
 */
FileTransferClient.prototype.processNextInstruction = function() {
  if (!this.operationActive && this.instructionQueue[0]) {
    this.transmit(this.instructionQueue[0].commandAction);
    this.operationActive = true;
  }
};

/**
 * Checks authentication status and executes a command.
 * If not connected or authenticated, it establishes a new connection
 * and/or authenticates before running the command.
 *
 * @param {string} commandAction - The FTP command action to perform.
 * @param {Function} completionCallback - Callback function to be invoked upon command completion.
 */
FileTransferClient.prototype.initiateCommand = function(commandAction, completionCallback) {
  // If socket is available and writable, run command directly.
  if (this.connectionSocket && this.connectionSocket.canWrite) {
    return this.executeQueuedCommand(commandAction, completionCallback || EMPTY_FUNCTION);
  }

  var instanceRef = this;
  this.isLoggedIn = false; // Reset login status.
  // Establish a new connection, then run the command.
  this._establishConnection(this.connectionPort, this.host, function() {
    instanceRef.executeQueuedCommand(commandAction, completionCallback || EMPTY_FUNCTION);
  });
};

/**
 * Adds a command to the queue and attempts to execute it.
 * Handles authentication flow if necessary.
 *
 * @param {string} commandAction - The FTP command string.
 * @param {Function} completionCallback - Callback for the command.
 */
FileTransferClient.prototype.executeQueuedCommand = function(commandAction, completionCallback) {
  var commandObject = {
    commandAction: commandAction,
    completionCallback: completionCallback
  };

  // If already logged in, or command is for features/system/user/pass, queue and process.
  if (this.isLoggedIn || /feature|system|user|password/.test(commandAction)) {
    this.instructionQueue.push(commandObject);
    this.processNextInstruction();
    return;
  }

  var instanceRef = this;
  // Otherwise, retrieve features and authenticate first.
  this.retrieveCapabilities(function() {
    instanceRef.authenticateClient(instanceRef.username, instanceRef.password, function() {
      instanceRef.instructionQueue.push(commandObject);
      instanceRef.processNextInstruction();
    });
  });
};

/**
 * Processes a server reply and invokes the corresponding command's callback.
 * This is called for each successful client-server round trip.
 *
 * @param {Object} serverReply - The reply object from the server (contains messageText and code).
 * @param {Array} commandObject - Contains the executed command action and its callback.
 */
FileTransferClient.prototype.processReply = function(serverReply, commandObject) {
  var errorObject = null;
  if (serverReply.isError) {
    errorObject = new Error(serverReply.messageText || 'Unknown FTP communication error.');
    errorObject.code = serverReply.code;
  }

  commandObject.completionCallback(errorObject, serverReply);
  this.operationActive = false; // Mark current operation as complete.
  this.processNextInstruction(); // Attempt to process the next command.
};

/**
 * Checks if the current server supports a specific feature.
 * @param {String} capability - The feature name to check.
 * @returns {Boolean} True if the server has the feature, false otherwise.
 */
FileTransferClient.prototype.hasCapability = function(capability) {
  return !!capability && this.capabilities.indexOf(capability.toLowerCase()) > -1;
};

/**
 * Parses the response from the 'FEAT' command into an array of feature names.
 * @param {String} capabilityResponse - Server response string for 'FEAT'.
 * @returns {String[]} An array of lowercase feature names.
 */
FileTransferClient.prototype._parseCapabilities = function(capabilityResponse) {
  // Split response by line, skipping header and footer lines.
  var capabilityLines = capabilityResponse.split(LINE_BREAK).slice(1, -1);
  return capabilityLines
    .map(function(featLine) { return featLine.trim().toLowerCase(); })
    .filter(function(featLine) { return !!featLine; });
};

// --- Action Helpers Below ---
// These methods combine several low-level FTP actions into higher-level commands.

/**
 * Retrieves the features supported by the FTP server.
 * @param {Function} completionCallback - Callback function (error, capabilities).
 */
FileTransferClient.prototype.retrieveCapabilities = function(completionCallback) {
  if (this.capabilities) {
    return completionCallback(null, this.capabilities);
  }

  var instanceRef = this;
  this.directOperation.fetchFeatures(function(errorObject, serverReply) {
    instanceRef.capabilities = errorObject ? [] : instanceRef._parseCapabilities(serverReply.messageText);
    instanceRef.directOperation.systemType(function(errorObject, systemReply) {
      if (!errorObject && systemReply.code === 215) {
        instanceRef.systemInfo = systemReply.messageText.toLowerCase();
      }

      completionCallback(null, instanceRef.capabilities);
    });
  });
};

/**
 * Authenticates the client with the FTP server using username and password.
 * @param {String} username - The user's login name.
 * @param {String} password - The user's password.
 * @param {Function} completionCallback - Callback function to execute after authentication.
 */
FileTransferClient.prototype.authenticateClient = function(username, password, completionCallback) {
  var instanceRef = this;

  if (this.isAuthenticating === true) {
    return completionCallback(new Error('This client is currently undergoing authentication'));
  }

  // Provide default anonymous credentials if none are given.
  if (!username) username = 'anonymous';
  if (!password) password = '@anonymous';

  this.isAuthenticating = true;
  instanceRef.directOperation.enterUser(username, function(errorObject, reply) {
    if (errorObject || [230, 331, 332].indexOf(reply.code) === -1) {
      instanceRef.isAuthenticating = false;
      completionCallback(errorObject);
      return;
    }

    instanceRef.directOperation.enterPassword(password, function(errorObject, reply) {
      instanceRef.isAuthenticating = false;

      if (errorObject) {
        completionCallback(errorObject);
      } else if ([230, 202].indexOf(reply.code) > -1) {
        instanceRef.isLoggedIn = true;
        instanceRef.username = username;
        instanceRef.password = password;
        instanceRef.directOperation.dataType('I', function() { // Set binary transfer type.
          completionCallback(undefined, reply);
        });
      } else if (reply.code === 332) {
        instanceRef.directOperation.accountInfo(''); // ACCT command is rarely supported or needed.
      }
    });
  });
};

/**
 * Sets the data transfer type (e.g., ASCII or Binary).
 * @param {String} transferKind - 'A' for ASCII, 'I' for Binary.
 * @param {Function} completionCallback - Callback (error, data).
 */
FileTransferClient.prototype.setTransferType = function(transferKind, completionCallback) {
  transferKind = transferKind.toUpperCase();
  if (this.transferKind === transferKind) {
    return completionCallback();
  }

  var instanceRef = this;
  this.directOperation.dataType(transferKind, function(errorObject, data) {
    if (!errorObject) instanceRef.transferKind = transferKind;

    completionCallback(errorObject, data);
  });
};

/**
 * Retrieves a directory listing from the FTP server using a passive connection.
 * @param {String} remotePath - The remote path to list.
 * @param {Function} completionCallback - Callback function (error, directoryContent).
 */
FileTransferClient.prototype.directoryListing = function(remotePath, completionCallback) {
  // Handle optional path argument.
  if (arguments.length === 1) {
    completionCallback = arguments[0];
    remotePath = '';
  }

  var instanceRef = this;
  var directoryContent = '';
  completionCallback = singleCall(completionCallback); // Ensure callback is called only once.

    instanceRef.obtainPassiveSocket(function(errorObject, dataSocket) {
      if (errorObject) return completionCallback(errorObject);

      // Accumulate data as it arrives.
      dataSocket.on('payload', function(payload) {
        directoryContent += payload.toBinaryString();
      });

      // Set up a timeout for the passive connection.
      instanceRef.passiveConnectionTimeout.call(instanceRef, dataSocket, completionCallback);

      // Handle socket closure and errors.
      dataSocket.once('connectionClosed', function(errorObject) { completionCallback(errorObject, directoryContent); });
      dataSocket.once('error', completionCallback);

      // Callback for the LIST command itself.
      function instructionCompletion(errorObject, reply) {
        if (errorObject) return completionCallback(errorObject);

        var isAnticipatedIndicator = anticipatedIndicators.indicators.some(function(indicator) {
          return indicator === reply.code;
        });

        if (!isAnticipatedIndicator) {
          completionCallback(new Error(
            'Expected indicators ' + anticipatedIndicators.toString() + ' instead of: ' +
            reply.messageText));
        }
      }

      instructionCompletion.expectsIndicator = anticipatedIndicators;

      // Execute the LIST command.
      instanceRef.initiateCommand('list ' + (remotePath || ''), instructionCompletion);
    });
};

/**
 * Dispatches a progress event during file transfer operations.
 * @param {Object} progressData - Contains filename, operation type, total size, and transferred bytes.
 */
FileTransferClient.prototype.dispatchProgress = function(progressData) {
  this.dispatch('progress', {
    itemFilename: progressData.itemFilename,
    operationType: progressData.operationType,
    totalSize: progressData.totalSize || 0,
    bytesTransferred: progressData.dataSocket[
      progressData.operationType === 'get' ? 'octetsRead' : 'octetsWritten']
  });
};

/**
 * Retrieves a file from the FTP server. Can either return content via callback
 * or save directly to a local file path.
 *
 * @param {String} sourcePath - Remote path of the file to retrieve.
 * @param {Function|String} destinationPath - Local path to save the file, or a callback if retrieving content.
 * @param {Function} [completionCallback] - Optional callback for file saving operations.
 */
FileTransferClient.prototype.retrieveFile = function(sourcePath, destinationPath, completionCallback) {
  var instanceRef = this;
  var finalCompletionHandler;

  // Determine if a local path is provided or if content is returned directly.
  if (typeof destinationPath === 'function') {
    finalCompletionHandler = singleCall(destinationPath || EMPTY_FUNCTION);
  } else {
    completionCallback = singleCall(completionCallback || EMPTY_FUNCTION);
    finalCompletionHandler = function(errorObject, dataSocket) {
      if (errorObject) {
        return completionCallback(errorObject);
      }

      var writeDataStream = fileSystem.createWriteStream(destinationPath);
      writeDataStream.on('error', completionCallback);

      // Emit progress events as data is read.
      dataSocket.on('canRead', function() {
        instanceRef.dispatchProgress({
          itemFilename: sourcePath,
          operationType: 'get',
          dataSocket: dataSocket
        });
      });

      // Ensure the callback is called once upon stream completion or error.
      dataSocket.on('error', completionCallback);
      dataSocket.on('streamEnd', completionCallback);
      dataSocket.on('connectionClosed', completionCallback);

      // Pipe the incoming data to the local file stream.
      dataSocket.pipe(writeDataStream);
      dataSocket.unpause(); // Resume the socket to start data flow.
    };
  }

  // Obtain the socket for retrieving the file.
  this.obtainRetrieveSocket(sourcePath, finalCompletionHandler);
};

/**
 * Provides a socket configured for a RETR (retrieve) operation on a given path.
 * The socket is returned in a paused state, requiring the user to resume it.
 *
 * @param {String} pathToFile - Path to the remote file to be retrieved.
 * @param {Function} completionCallback - Callback function (error, dataSocket).
 */
FileTransferClient.prototype.obtainRetrieveSocket = function(pathToFile, completionCallback) {
  var instanceRef = this;
  completionCallback = singleCall(completionCallback); // Ensure callback is invoked only once.
  this.obtainPassiveSocket(function(errorObject, dataSocket) {
    if (errorObject) return instructionCompletion(errorObject);

    // Handle specific socket errors.
    dataSocket.on('error', function(errorObject) {
      if (errorObject.code === 'CONNECTION_REJECTED') {
        errorObject.message = 'Likely attempting a passive operation while another is active';
      }
      instructionCompletion(errorObject);
    });

    // Set up a timeout for the passive data connection.
    instanceRef.passiveConnectionTimeout.call(instanceRef, dataSocket, instructionCompletion);
    dataSocket.suspend(); // Pause the socket until the user explicitly resumes it.

    // Callback for the RETR command itself.
    function instructionCompletion(errorObject, reply) {
      if (errorObject) {