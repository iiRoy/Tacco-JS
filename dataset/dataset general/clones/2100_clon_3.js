/*
 *  File: ftp-client-core.js
 *  Description: Core module for managing FTP client connections and operations.
 *  This module facilitates interaction with FTP servers, handling command
 *  execution, response parsing, and data transfers.
 *
 *  @license MIT License - For details, refer to the project's license file.
 *  @author [Your Name/Alias Here] (inspired by Sergi Mansilla's work)
 *  @version 2.0.0 (Type III Clone)
 */

'use strict';

// External module dependencies
const NetworkUtil = require('net');
const EventDispatcher = require('events').EventEmitter;
const StreamComposer = require('event-stream'); // Renamed `es`
const FtpReplyInterpreter = require('ftp-response-parser'); // Renamed `ResponseParser`
const DirectoryEntryProcessor = require('parse-listing'); // Renamed `ListingParser`
const NodeUtils = require('util'); // Renamed `util`
const FileSystemAccess = require('fs'); // Renamed `fs`
const CallOnce = require('once'); // Renamed `once`

// Internal debugging utilities
const logGeneral = require('debug')('ftp-client:core'); // Renamed `debug`
const logCmd = require('debug')('ftp-client:command-out'); // Renamed `dbgCommand`
const logReply = require('debug')('ftp-client:response-in'); // Renamed `dbgResponse`

// Core configuration constants
const DEFAULT_CONTROL_PORT = 21; // Renamed `FTP_PORT`
const CONNECTION_IDLE_TIMEOUT_MS = 600000; // Renamed `TIMEOUT` (10 minutes)
const KEEP_ALIVE_INTERVAL_MS = 30000; // Renamed `IDLE_TIME` (30 seconds)
const EMPTY_FUNCTION = function() {}; // Renamed `NOOP`

// List of supported FTP commands, categorized by parameter requirement
const SUPPORTED_FTP_COMMANDS = [ // Renamed `COMMANDS`
  // Commands that typically don't require parameters
  'ABOR', 'PWD', 'CDUP', 'FEAT', 'NOOP', 'QUIT', 'PASV', 'SYST',
  // Commands that usually take one or more parameters
  'CWD', 'DELE', 'LIST', 'MDTM', 'MKD', 'MODE', 'NLST', 'PASS', 'RETR', 'RMD',
  'RNFR', 'RNTO', 'SITE', 'STAT', 'STOR', 'TYPE', 'USER', 'XRMD', 'OPTS',
  // Extended or less common features
  'CHMOD', 'SIZE'
];

// Expected reply codes for data transfer initiation/completion markers
const dataTransferMarkers = { // Renamed `expectedMarks`
  expectedCodes: [125, 150], // Codes indicating data connection is open/ready
  ignoreCode: 226 // Code to ignore after a data transfer completes
};

// Regular expressions for parsing server responses
const PASSIVE_ADDR_PATTERN = /([-\d]+,[-\d]+,[-\d]+,[-\d]+),([-\d]+),([-\d]+)/; // Renamed `RE_PASV`
const CRLF_DELIMITER = /\r\n|\n/; // Renamed `FTP_NEWLINE`

/**
 * Custom error class for FTP specific errors.
 * @extends Error
 */
class FtpClientError extends Error {
  constructor(message, code = null) {
    super(message);
    this.name = 'FtpClientError';
    this.code = code;
    // Capturing stack trace, excluding constructor call from it
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, FtpClientError);
    }
  }
}

/**
 * Extracts host and port information from a passive mode (PASV) server response.
 * @param {string} rawResponseText The raw text from the FTP server's PASV response.
 * @param {Function} completionCallback Callback function (error, {host, port}).
 */
function extractPassivePortInfo(rawResponseText, completionCallback) { // Renamed `getPasvPort`
  const addressMatch = PASSIVE_ADDR_PATTERN.exec(rawResponseText);
  if (!addressMatch) {
    return completionCallback(new FtpClientError('Failed to parse passive address details.'));
  }

  // Extract IP address components and port parts
  const ipAddress = addressMatch[1].replace(/,/g, '.');
  const portSegment1 = parseInt(addressMatch[2], 10);
  const portSegment2 = parseInt(addressMatch[3], 10);

  // Calculate the full port number
  const calculatedPort = (portSegment1 & 0xFF) * 256 + (portSegment2 & 0xFF);

  completionCallback(null, {
    host: ipAddress,
    port: calculatedPort
  });
}

/**
 * Executes a raw FTP command by composing it from arguments and calling the client's `transmitCommand` method.
 * This function handles variable arguments and optional callbacks.
 * @param {string} baseCommand The base FTP command (e.g., 'USER', 'PASS').
 * @param {...any} args Remaining arguments, potentially including a final callback.
 */
function executeRawCommand(baseCommand, ...args) { // Renamed `runCmd`
  let commandCallback = EMPTY_FUNCTION;
  const commandArguments = [...args]; // Copy args to manipulate

  // Check if the last argument is a function (the callback)
  if (typeof commandArguments[commandArguments.length - 1] === 'function') {
    commandCallback = commandArguments.pop();
  }

  // Construct the full command string
  const fullCommandString = commandArguments.length > 0 ?
    `${baseCommand} ${commandArguments.join(' ')}` :
    baseCommand;

  // Enqueue and send the command
  this.queueAndExecute(fullCommandString.trim(), commandCallback);
}

/**
 * Represents an FTP client capable of connecting to an FTP server
 * and performing various FTP operations.
 * @extends EventDispatcher
 */
const FtpClient = module.exports = function(clientOptions) { // Renamed `Ftp`, `cfg`
  const instanceRef = this; // Renamed `self`
  clientOptions = clientOptions || {}; // Ensure options object exists

  // Apply provided configuration options, prioritizing existing properties
  for (const configKey in clientOptions) { // Renamed `option`
    if (Object.prototype.hasOwnProperty.call(clientOptions, configKey)) {
      instanceRef[configKey] = instanceRef[configKey] || clientOptions[configKey];
    }
  }

  // Initialize the event emitter base class
  EventDispatcher.call(this);

  /**
   * Indicates if the server prefers 'LIST' over 'STAT' for directory listings.
   * Default to false, will be determined after feature negotiation.
   * @type {boolean}
   */
  this.preferListCommand = false; // Renamed `useList`

  /**
   * The control connection port for the FTP server.
   * @type {number}
   */
  this.controlPort = this.controlPort || DEFAULT_CONTROL_PORT; // Renamed `port`

  /**
   * Queue for pending FTP commands. Each item is an object {action, callback}.
   * @type {Array<Object>}
   */
  this.pendingOperations = []; // Renamed `commandQueue`

  /**
   * Flag indicating if a command is currently being processed.
   * @type {boolean}
   */
  this.commandExecuting = false; // Renamed `inProgress`

  /**
   * Stores server capabilities parsed from the FEAT command.
   * @type {Array<string>}
   */
  this.serverCapabilities = null; // Renamed `features`

  /**
   * Stores the detected remote system type (e.g., 'unix').
   * @type {string}
   */
  this.remoteSystemType = null; // Renamed `system`

  /**
   * Flag indicating an authentication process is underway.
   * @type {boolean}
   */
  this.isAuthenticating = false; // Renamed `authenticating`

  /**
   * The current data transfer type (e.g., 'I' for binary, 'A' for ASCII).
   * @type {string}
   */
  this.currentTransferType = null; // Renamed `type`

  /**
   * Custom timeout handler for passive data connections.
   * @type {Function}
   */
  this.dataConnectionTimeout = null; // Renamed `pasvTimeout`

  /**
   * Exposes methods for sending raw FTP commands directly.
   * `this.rawCommands.user('myuser', cb)`
   * @type {Object}
   */
  this.rawCommands = function(...args) { // Renamed `raw`
    return executeRawCommand.apply(instanceRef, args);
  };

  // Dynamically create methods for each supported FTP command
  SUPPORTED_FTP_COMMANDS.forEach(function(cmdName) {
    instanceRef.rawCommands[cmdName.toLowerCase()] = executeRawCommand.bind(instanceRef, cmdName);
  });

  // Event listener for general data flow, specifically for debug logging
  this.on('data', function(receivedData) { // Renamed `data`
    if (instanceRef.loggingEnabled) {
      instanceRef.emit('ftp_debug_output', 'response_data', receivedData || {});
    }
  });

  // Establish the initial control connection
  this._initializeControlConnection(this.controlPort, this.host);
};

// Inherit from EventEmitter
NodeUtils.inherits(FtpClient, EventDispatcher);

/**
 * Enables or disables verbose logging for the client.
 * @param {boolean} enableLogging If true, verbose logging is enabled.
 * @deprecated Use DEBUG environment variable for debugging.
 */
FtpClient.prototype.enableVerboseLogging = function(enableLogging) { // Renamed `setDebugMode`
  console.warn('`enableVerboseLogging` is deprecated. Use the `DEBUG` environment variable for debugging (e.g., `DEBUG=ftp-client:*`).');
  this.loggingEnabled = (enableLogging !== false);
};

/**
 * Creates a function that re-emits a specific event from an internal source
 * to the client's public event interface, optionally adding debug information.
 * @param {string} eventName The name of the event to proxy.
 * @returns {Function} A function that takes event data and emits it.
 */
FtpClient.prototype.proxyEvent = function(eventName) { // Renamed `reemit`
  const instanceRef = this;
  return function(eventPayload) { // Renamed `data`
    instanceRef.emit(eventName, eventPayload);
    logGeneral(`event:${eventName}`, eventPayload || {});
    if (instanceRef.loggingEnabled) {
      instanceRef.emit('ftp_debug_output', `event:${eventName}`, eventPayload || {});
    }
  };
};

/**
 * Initializes or re-initializes the control connection socket.
 * Destroys any existing connection and sets up a new one.
 * @param {number} targetPort The port to connect to.
 * @param {string} targetHost The host address to connect to.
 * @param {Function} [initialActionCallback=EMPTY_FUNCTION] Callback to execute after connection.
 * @private
 */
FtpClient.prototype._initializeControlConnection = function(targetPort, targetHost, initialActionCallback = EMPTY_FUNCTION) { // Renamed `_createSocket`, `port`, `host`, `firstAction`
  // Clean up existing resources if present
  if (this.controlSocket && this.controlSocket.destroy) {
    logGeneral('Destroying existing control socket.');
    this.controlSocket.destroy();
  }

  if (this.replyProcessor) {
    logGeneral('Ending existing reply processor stream.');
    this.replyProcessor.end();
  }

  // Create a new response parser
  this.replyProcessor = new FtpReplyInterpreter(); // Renamed `resParser`

  // Reset authentication status
  this.sessionAuthenticated = false; // Renamed `authenticated`

  // Establish the new TCP connection
  this.controlSocket = NetworkUtil.createConnection(targetPort, targetHost, initialActionCallback); // Renamed `socket`
  this.controlSocket.setNoDelay(true); // Optimize for small packets
  this.controlSocket.setKeepAlive(true, KEEP_ALIVE_INTERVAL_MS); // Keep connection alive
  this.controlSocket.setTimeout(CONNECTION_IDLE_TIMEOUT_MS); // Set a general timeout

  // Attach event handlers
  this.controlSocket.on('connect', this.proxyEvent('connect'));
  this.controlSocket.on('timeout', this.proxyEvent('timeout'));
  this.controlSocket.on('error', (operationError) => { // Enhanced error handling
    logGeneral(`Control socket error: ${operationError.message}`);
    this.emit('error', new FtpClientError(`Control connection failed: ${operationError.message}`, operationError.code));
  });
  this.controlSocket.on('close', (hadError) => {
    logGeneral(`Control socket closed. Had error: ${hadError}`);
    this.emit('close', hadError);
    this.sessionAuthenticated = false; // Reset auth status on close
  });

  // Pipeline the socket data through the response parser
  this.controlPipeline = StreamComposer.pipeline(this.controlSocket, this.replyProcessor); // Renamed `pipeline`

  const instanceRef = this;

  // Process data received from the server
  this.controlPipeline.on('data', function(serverResponse) { // Renamed `data`, `response`
    instanceRef.emit('data', serverResponse);
    logReply(serverResponse.text);
    instanceRef.processServerReply.call(instanceRef, serverResponse);
  });
  this.controlPipeline.on('error', this.proxyEvent('error'));
};

/**
 * Processes incoming server replies, managing the command queue and dispatching callbacks.
 * @param {Object} serverResponse The parsed response object from the FtpReplyInterpreter.
 * @private
 */
FtpClient.prototype.processServerReply = function(serverResponse) { // Renamed `parseResponse`
  // Ignore responses if the command queue is empty or for initial 220 greeting
  if (this.pendingOperations.length === 0 || serverResponse.code === 220) {
    return;
  }

  const currentCommand = this.pendingOperations[0]; // Renamed `next`
  if (!currentCommand || !currentCommand.completionHandler) {
    logGeneral('Warning: No completion handler found for current command in queue.');
    return;
  }

  // Handle expected data transfer marker codes
  if (serverResponse.isMark) {
    const expectedMarkers = currentCommand.completionHandler.expectedDataMarkers;
    // If a mark is received and it's not expected, or it's not one of the expected codes, ignore it.
    if (!expectedMarkers || !expectedMarkers.expectedCodes.includes(serverResponse.code)) {
      logGeneral(`Ignoring unexpected data transfer mark: ${serverResponse.code}`);
      return;
    }

    // If a subsequent reply code should be ignored after this mark
    if (expectedMarkers.ignoreCode) {
      this.skipNextReplyCode = expectedMarkers.ignoreCode; // Renamed `ignoreCmdCode`
      logGeneral(`Will ignore next reply code: ${this.skipNextReplyCode}`);
    }
    return; // Mark processed, wait for actual command reply
  }

  // If the current response code is marked to be ignored
  if (this.skipNextReplyCode === serverResponse.code) {
    logGeneral(`Skipping reply code ${serverResponse.code} as previously marked.`);
    this.skipNextReplyCode = null; // Reset the ignore flag
    return;
  }

  // Finalize the command execution and clear the current command from the queue
  this.finalizeCommandExecution(serverResponse, this.pendingOperations.shift());
};

/**
 * Transmits a command string to the FTP server.
 * @param {string} commandPayload The full command string to send (e.g., "USER anonymous").
 * @private
 */
FtpClient.prototype.transmitCommand = function(commandPayload) { // Renamed `send`
  if (!commandPayload) {
    logGeneral('Attempted to transmit an empty command.');
    return;
  }

  logCmd(commandPayload);
  this.controlPipeline.write(`${commandPayload}\r\n`);

  if (this.loggingEnabled) {
    this.emit('ftp_debug_output', 'client_command_sent', commandPayload);
  }
};

/**
 * Dispatches the next command in the queue if no command is currently executing.
 * @private
 */
FtpClient.prototype.dispatchNextCommand = function() { // Renamed `nextCmd`
  if (!this.commandExecuting && this.pendingOperations.length > 0) {
    const nextInstruction = this.pendingOperations[0];
    this.transmitCommand(nextInstruction.commandPayload);
    this.commandExecuting = true;
  }
};

/**
 * Queues an FTP command for execution. If the connection is not active or authenticated,
 * it attempts to establish/authenticate before executing the command.
 * @param {string} commandPayload The full command string (e.g., "USER anonymous").
 * @param {Function} [completionCallback=EMPTY_FUNCTION] Callback for command completion.
 */
FtpClient.prototype.queueAndExecute = function(commandPayload, completionCallback = EMPTY_FUNCTION) { // Renamed `execute`, `action`, `callback`
  // If the control socket is ready and writable, proceed to run the command directly.
  if (this.controlSocket && this.controlSocket.writable) {
    this.processCommandInternal(commandPayload, completionCallback);
    return;
  }

  // If not connected or writable, reset authentication and establish a new connection.
  logGeneral('Control socket not ready. Re-initializing connection and authenticating.');
  this.sessionAuthenticated = false; // Reset authentication state
  const instanceRef = this;
  this._initializeControlConnection(this.controlPort, this.host, function() {
    instanceRef.processCommandInternal(commandPayload, completionCallback);
  });
};

/**
 * Internal method to add a command to the queue and trigger dispatching.
 * Handles authentication prerequisites.
 * @param {string} commandPayload The full command string.
 * @param {Function} completionCallback The callback for this command.
 * @private
 */
FtpClient.prototype.processCommandInternal = function(commandPayload, completionCallback) { // Renamed `runCommand`, `action`, `callback`
  const commandDescriptor = { // Renamed `cmd`
    commandPayload: commandPayload,
    completionHandler: completionCallback
  };

  // If already authenticated, or if the command is part of the authentication sequence,
  // simply push to queue and dispatch.
  const authCommandsPattern = /feat|syst|user|pass/i;
  if (this.sessionAuthenticated || authCommandsPattern.test(commandPayload)) {
    this.pendingOperations.push(commandDescriptor);
    this.dispatchNextCommand();
    return;
  }

  // If not authenticated, ensure authentication first, then queue and dispatch.
  const instanceRef = this;
  logGeneral('Authentication required before executing command:', commandPayload);
  this.retrieveServerFeatures(function(operationError) {
    if (operationError) {
      logGeneral('Failed to retrieve server features during pre-authentication:', operationError.message);
      return completionCallback(operationError);
    }
    instanceRef.authenticateClient(instanceRef.user, instanceRef.pass, function(authError) {
      if (authError) {
        logGeneral('Authentication failed during pre-command setup:', authError.message);
        return completionCallback(authError);
      }
      instanceRef.pendingOperations.push(commandDescriptor);
      instanceRef.dispatchNextCommand();
    });
  });
};

/**
 * Finalizes the execution of a command: calls its callback and resets the in-progress flag.
 * @param {Object} serverResponse The server's reply to the command.
 * @param {Object} commandDescriptor Contains the original command and its callback.
 * @private
 */
FtpClient.prototype.finalizeCommandExecution = function(serverResponse, commandDescriptor) { // Renamed `parse`, `response`, `command`
  let operationError = null; // Renamed `err`
  if (serverResponse.isError) {
    operationError = new FtpClientError(serverResponse.text || 'Unknown FTP error occurred.', serverResponse.code);
    logGeneral(`Command failed: ${commandDescriptor.commandPayload}. Error: ${operationError.message}`);
  }

  // Execute the command's completion handler
  if (commandDescriptor.completionHandler) {
    commandDescriptor.completionHandler(operationError, serverResponse);
  } else {
    logGeneral(`Warning: No completion handler for command: ${commandDescriptor.commandPayload}.`);
  }

  this.commandExecuting = false; // Reset the in-progress flag
  this.dispatchNextCommand(); // Attempt to dispatch the next command
};

/**
 * Checks if the FTP server supports a specific feature.
 * @param {string} ftpFeature The feature name (e.g., 'SIZE', 'UTF8').
 * @returns {boolean} True if the feature is supported, false otherwise.
 */
FtpClient.prototype.supportsFeature = function(ftpFeature) { // Renamed `hasFeat`
  if (!ftpFeature || !this.serverCapabilities) {
    return false;
  }
  return this.serverCapabilities.includes(ftpFeature.toLowerCase());
};

/**
 * Parses the raw response from the 'FEAT' command into an array of feature strings.
 * @param {string} rawFeaturesResponse The full text response from the FEAT command.
 * @returns {Array<string>} An array of supported feature names.
 * @private
 */
FtpClient.prototype._parseFeatureList = function(rawFeaturesResponse) { // Renamed `_parseFeats`
  // Split by newline, remove header (first line) and footer (last line)
  const featureListLines = rawFeaturesResponse.split(CRLF_DELIMITER).slice(1, -1); // Renamed `featureLines`
  return featureListLines
    .map(function(featLine) { return featLine.trim().toLowerCase(); })
    .filter(function(featLine) { return !!featLine; }); // Filter out any empty strings
};

/**
 * Retrieves and caches the server's supported features and system type.
 * @param {Function} completionCallback Callback (error, featuresArray).
 */
FtpClient.prototype.retrieveServerFeatures = function(completionCallback) { // Renamed `getFeatures`
  if (this.serverCapabilities) {
    // Features already retrieved, return cached value
    return completionCallback(null, this.serverCapabilities);
  }

  const instanceRef = this;
  // First, get features
  this.rawCommands.feat(function(operationError, featResult) { // Renamed `res`
    instanceRef.serverCapabilities = operationError ? [] : instanceRef._parseFeatureList(featResult.text);

    // Then, get system type
    instanceRef.rawCommands.syst(function(systError, systResult) {
      if (!systError && systResult.code === 215) {
        instanceRef.remoteSystemType = systResult.text.toLowerCase();
      } else if (systError) {
        logGeneral(`Error retrieving system type: ${systError.message}`);
      }

      completionCallback(null, instanceRef.serverCapabilities);
    });
  });
};

/**
 * Authenticates the client with the FTP server using provided credentials.
 * @param {string} username The user's login name.
 * @param {string} password The user's password.
 * @param {Function} completionCallback Callback (error, serverResponse).
 */
FtpClient.prototype.authenticateClient = function(username, password, completionCallback) { // Renamed `auth`, `user`, `pass`, `callback`
  const instanceRef = this;

  if (this.isAuthenticating) {
    return completionCallback(new FtpClientError('Authentication process is already active.'));
  }

  // Set default credentials if not provided
  const clientUsername = username || 'anonymous';
  const clientPassword = password || '@anonymous';

  this.isAuthenticating = true;
  logGeneral(`Attempting authentication for user: ${clientUsername}`);

  // Send USER command
  this.rawCommands.user(clientUsername, function(operationError, userResult) {
    if (operationError) {
      instanceRef.isAuthenticating = false;
      return completionCallback(operationError);
    }

    // Check expected reply codes for USER command
    if (![230, 331, 332].includes(userResult.code)) {
      instanceRef.isAuthenticating = false;
      return completionCallback(new FtpClientError(`Unexpected reply to USER command: ${userResult.text}`, userResult.code));
    }

    // Send PASS command
    instanceRef.rawCommands.pass(clientPassword, function(passError, passResult) {
      instanceRef.isAuthenticating = false; // Authentication attempt finished

      if (passError) {
        return completionCallback(passError);
      }

      if ([230, 202].includes(passResult.code)) {
        instanceRef.sessionAuthenticated = true;
        instanceRef.user = clientUsername; // Store actual authenticated username
        instanceRef.pass = clientPassword; // Store actual authenticated password (consider security implications)

        // Set transfer type to Binary (Image) by default after successful login
        instanceRef.setTransferType('I', function(typeError) {
          if (typeError) {
            logGeneral(`Warning: Failed to set default transfer type to 'I': ${typeError.message}`);
          }
          completionCallback(undefined, passResult);
        });
      } else if (passResult.code === 332) {
        logGeneral('Server requires account information (ACCT) which is not fully supported.');
        // For now, we'll just complete with success, as ACCT is rarely used.
        // If ACCT were critical, we'd need a rawCommands.acct('') call here.
        completionCallback(new FtpClientError(`Authentication failed: ${passResult.text}`, passResult.code));
      } else {
        completionCallback(new FtpClientError(`Authentication failed with unexpected reply: ${passResult.text}`, passResult.code));
      }
    });
  });
};

/**
 * Sets the data transfer type (e.g., 'I' for binary, 'A' for ASCII).
 * @param {string} newType The desired transfer type ('I' or 'A').
 * @param {Function} completionCallback Callback (error, serverResponse).
 */
FtpClient.prototype.setTransferType = function(newType, completionCallback) { // Renamed `setType`, `type`, `callback`
  const requestedType = newType.toUpperCase();
  if (this.currentTransferType === requestedType) {
    return completionCallback(null); // Already set to this type
  }

  const instanceRef = this;
  this.rawCommands.type(requestedType, function(operationError, typeResult) { // Renamed `data`
    if (!operationError) {
      instanceRef.currentTransferType = requestedType;
    } else {
      logGeneral(`Failed to set transfer type to ${requestedType}: ${operationError.message}`);
    }
    completionCallback(operationError, typeResult);
  });
};

/**
 * Establishes a passive data connection by issuing the PASV command and connecting to the reported address.
 * @param {Function} completionCallback Callback (error, dataChannelSocket).
 */
FtpClient.prototype.establishPassiveDataConnection = function(completionCallback) { // Renamed `getPasvSocket`
  const instanceRef = this;
  completionCallback = CallOnce(completionCallback); // Ensure callback is called only once

  this.rawCommands.pasv(function(operationError, pasvResult) {
    if (operationError) {
      return completionCallback(operationError);
    }

    if (pasvResult.code !== 227) { // 227: Entering Passive Mode (h1,h2,h3,h4,p1,p2)
      return completionCallback(new FtpClientError(`Unexpected PASV response: ${pasvResult.text}`, pasvResult.code));
    }

    extractPassivePortInfo(pasvResult.text, function(parseError, passiveInfo) {
      if (parseError) {
        return completionCallback(parseError);
      }

      logGeneral(`Passive mode initiated. Connecting to ${passiveInfo.host}:${passiveInfo.port}`);
      const dataChannelSocket = NetworkUtil.createConnection(passiveInfo.port, passiveInfo.host, function() {
        logGeneral('Passive data channel connected.');
        dataChannelSocket.setNoDelay(true);
        dataChannelSocket.setKeepAlive(true, KEEP_ALIVE_INTERVAL_MS);
        completionCallback(null, dataChannelSocket);
      });

      // Handle data channel socket errors
      dataChannelSocket.on('error', function(socketError) {
        logGeneral(`Data channel socket error: ${socketError.message}`);
        completionCallback(new FtpClientError(`Data connection failed: ${socketError.message}`, socketError.code));
      });

      // Set a timeout for the data connection itself
      dataChannelSocket.setTimeout(CONNECTION_IDLE_TIMEOUT_MS, function() {
        logGeneral('Data channel socket timed out.');
        dataChannelSocket.destroy(new FtpClientError('Data channel connection timed out.'));
      });
    });
  });
};

/**
 * Lists the contents of a remote directory using a passive data connection.
 * @param {string} [remotePath=''] The path to the directory to list.
 * @param {Function} completionCallback Function to call with errors or results.
 */
FtpClient.prototype.listDirectoryContents = function(remotePath, completionCallback) { // Renamed `list`, `path`, `callback`
  // Handle optional remotePath argument
  if (arguments.length === 1 && typeof remotePath === 'function') {
    completionCallback = remotePath;
    remotePath = '';
  }

  completionCallback = CallOnce(completionCallback); // Ensure callback is called only once
  const instanceRef = this;
  let directoryListingBuffer = ''; // Renamed `listing`

  this.establishPassiveDataConnection(function(operationError, dataChannelSocket) { // Renamed `socket`
    if (operationError) {
      return completionCallback(operationError);
    }

    dataChannelSocket.on('data', function(receivedData) { // Renamed `data`
      directoryListingBuffer += receivedData.toString('binary'); // Append received data
    });

    // Handle data channel closure
    dataChannelSocket.once('close', function(closeError) { // Renamed `err`
      if (closeError) {
        logGeneral('Data channel closed with error during list:', closeError.message);
        return completionCallback(closeError);
      }
      logGeneral('Data channel closed successfully for list.');
      completionCallback(null, directoryListingBuffer);
    });
    dataChannelSocket.once('error', completionCallback); // Direct error handling for the data socket

    // Define the callback for the LIST command itself
    function listCommandCompletionHandler(cmdError, cmdResult) { // Renamed `cmdCallback`
      if (cmdError) {
        dataChannelSocket.destroy(); // Close data socket on command error
        return completionCallback(cmdError);
      }

      // Check if the server's reply code matches expected data transfer markers
      const isRecognizedMarker = dataTransferMarkers.expectedCodes.includes(cmdResult.code); // Renamed `isExpectedMark`

      if (!isRecognizedMarker) {
        dataChannelSocket.destroy();
        return completionCallback(new FtpClientError(
          `Unexpected reply code ${cmdResult.code} for LIST command. Expected one of: ${dataTransferMarkers.expectedCodes.join(', ')}. Reply: ${cmdResult.text}`
        ));
      }
      logGeneral(`LIST command initiated, server replied with ${cmdResult.code}. Data transfer should follow.`);
      // Data transfer is expected, the socket will handle the data event
    }

    // Attach expected markers to the callback for `processServerReply`
    listCommandCompletionHandler.expectedDataMarkers = dataTransferMarkers;

    // Execute the LIST command on the control connection
    instanceRef.queueAndExecute(`LIST ${remotePath || ''}`, listCommandCompletionHandler);
  });
};

/**
 * Emits a 'progress' event during data transfers.
 * @param {Object} transferInfo Information about the current transfer.
 * @param {string} transferInfo.filename The name of the file being transferred.
 * @param {string} transferInfo.action The action ('get' or 'put').
 * @param {number} transferInfo.totalSize The total size of the file (if known).
 * @param {NetworkUtil.Socket} transferInfo.dataChannelSocket The data channel socket.
 */
FtpClient.prototype.notifyTransferProgress = function(transferInfo) { // Renamed `emitProgress`, `data`
  const bytesTransferred = transferInfo.action === 'get' ?
    transferInfo.dataChannelSocket.bytesRead :
    transferInfo.dataChannelSocket.bytesWritten;

  this.emit('progress', {
    filename: transferInfo.filename,
    action: transferInfo.action,
    total: transferInfo.totalSize || 0,
    transferred: bytesTransferred
  });
};

/**
 * Retrieves a file from the FTP server. Can either return a readable socket or save to a local file.
 * @param {string} remoteFilePath The path to the file on the FTP server.
 * @param {string|Function} localDestination If a string, path to local file. If a function, it's the completion callback.
 * @param {Function} [completionCallback] Callback for file transfer completion.
 */
FtpClient.prototype.retrieveFile = function(remoteFilePath, localDestination, completionCallback) { // Renamed `get`, `remotePath`, `localPath`, `callback`
  const instanceRef = this;
  let handlerForCompletion; // Renamed `finalCallback`

  // Determine the final completion handler based on arguments
  if (typeof localDestination === 'function') {
    handlerForCompletion = CallOnce(localDestination || EMPTY_FUNCTION);
    localDestination = null; // Indicate no local file path provided
  } else {
    completionCallback = CallOnce(completionCallback || EMPTY_FUNCTION);
    // If a local path is provided, create a handler that writes to file
    handlerForCompletion = function(operationError, dataChannelSocket) { // Renamed `socket`
      if (operationError) {
        return completionCallback(operationError);
      }

      if (!localDestination) {
        return completionCallback(new FtpClientError('Local destination path is required for file saving.'));
      }

      // Create a write stream to the local file
      const outputFileStream = FileSystemAccess.createWriteStream(localDestination); // Renamed `writeStream`
      outputFileStream.on('error', function(writeError) {
        logGeneral(`Error writing to local file ${localDestination}: ${writeError.message}`);
        completionCallback(new FtpClientError(`Failed to write to local file: ${writeError.message}`, writeError.code));
      });

      // Emit progress events
      dataChannelSocket.on('readable', function() {
        instanceRef.notifyTransferProgress({
          filename: remoteFilePath,
          action: 'get',
          dataChannelSocket: dataChannelSocket
        });
      });

      // Ensure all possible completion/error states are handled for the socket
      dataChannelSocket.on('error', function(socketError) {
        logGeneral(`Data socket error during file retrieval: ${socketError.message}`);
        completionCallback(new FtpClientError(`Data transfer error: ${socketError.message}`, socketError.code));
      });
      dataChannelSocket.on('end', () => completionCallback(null)); // Successful end of transfer
      dataChannelSocket.on('close', (hadError) => { // Ensure close is always handled, even if 'end' wasn't fired
        if (hadError && !dataChannelSocket.errored) { // Only call if not already errored
          completionCallback(new FtpClientError('Data connection closed unexpectedly during retrieval.'));
        }
      });

      // Pipe the incoming data to the local file
      dataChannelSocket.pipe(outputFileStream);
      dataChannelSocket.resume(); // Resume the socket to start data flow
    };
  }

  // Get the data retrieval socket, which will then trigger the handlerForCompletion
  this.getDataRetrievalSocket(remoteFilePath, handlerForCompletion);
};

/**
 * Returns a readable socket for retrieving a file (RETR command).
 * The socket is returned in a paused state, allowing the user to resume it.
 * @param {string} remoteFilePath The path to the file to be retrieved.
 * @param {Function} completionCallback Callback (error, dataChannelSocket).
 */
FtpClient.prototype.getDataRetrievalSocket = function(remoteFilePath, completionCallback) { // Renamed `getGetSocket`, `path`, `callback`
  const instanceRef = this;
  completionCallback = CallOnce(completionCallback); // Ensure callback is called only once

  this.establishPassiveDataConnection(function(operationError, dataChannelSocket) { // Renamed `socket`
    if (operationError) {
      return commandReplyHandler(operationError); // Use the internal handler
    }

    // Attach error handler to the data socket
    dataChannelSocket.on('error', function(socketError) {
      if (socketError.code === 'ECONNREFUSED') {
        socketError.message = 'Possible passive operation collision or server issue.';
      }
      commandReplyHandler(new FtpClientError(`Data retrieval socket error: ${socketError.message}`, socketError.code));
    });

    dataChannelSocket.pause(); // Pause the socket until the RETR command is acknowledged

    // Define the callback for the RETR command
    function commandReplyHandler(cmdError, cmdResult) { // Renamed `cmdCallback`
      if (cmdError) {
        dataChannelSocket.destroy(); // Close data socket on command error
        return completionCallback(cmdError);
      }

      const isRecognizedMarker = dataTransferMarkers.expectedCodes.includes(cmdResult.code);
      if (!isRecognizedMarker) {
        dataChannelSocket.destroy();
        return completionCallback(new FtpClientError(
          `Unexpected reply code ${cmdResult.code} for RETR command. Expected one of: ${dataTransferMarkers.expectedCodes.join(', ')}. Reply: ${cmdResult.text}`
        ));
      }
      logGeneral(`RETR command initiated, server replied with ${cmdResult.code}. Data transfer expected.`);
      completionCallback(null, dataChannelSocket); // Return the paused socket
    }

    // Attach expected markers to the callback for `processServerReply`
    commandReplyHandler.expectedDataMarkers = dataTransferMarkers;

    // Execute the RETR command on the control connection
    instanceRef.queueAndExecute(`RETR ${remoteFilePath}`, commandReplyHandler);
  });
};

/**
 * Stores a file on the FTP server from a local path or a readable stream.
 * @param {string|NodeJS.ReadableStream} source A local file path or a readable stream.
 * @param {string} remoteDestinationPath The path on the FTP server where the file will be stored.
 * @param {Function} [completionCallback] Callback for file transfer completion.
 */
FtpClient.prototype.storeFile = function(source, remoteDestinationPath, completionCallback) {
  completionCallback = CallOnce(completionCallback || EMPTY_FUNCTION);
  const instanceRef = this;

  let readableStream;
  if (typeof source === 'string') {
    // If source is a string, assume it's a local file path
    readableStream = FileSystemAccess.createReadStream(source);
    readableStream.on('error', function(readError) {
      logGeneral(`Error reading local file ${source}: ${readError.message}`);
      completionCallback(new FtpClientError(`Failed to read local file: ${readError.message}`, readError.code));
    });
  } else if (source && typeof source.pipe === 'function' && typeof source.resume === 'function') {
    // If source is a readable stream
    readableStream = source;
  } else {
    return completionCallback(new FtpClientError('Invalid source for file storage. Must be a path string or a ReadableStream.'));
  }

  this.establishPassiveDataConnection(function(operationError, dataChannelSocket) {
    if (operationError) {
      readableStream.destroy();
      return completionCallback(operationError);
    }

    // Attach error handlers to the data socket
    dataChannelSocket.on('error', function(socketError) {
      logGeneral(`Data socket error during file storage: ${socketError.message}`);
      readableStream.destroy();
      completionCallback(new FtpClientError(`Data transfer error: ${socketError.message}`, socketError.code));
    });

    // Emit progress events
    dataChannelSocket.on('drain', function() {
      instanceRef.notifyTransferProgress({
        filename: remoteDestinationPath,
        action: 'put',
        dataChannelSocket: dataChannelSocket
      });
    });

    dataChannelSocket.on('close', (hadError) => {
      if (hadError && !dataChannelSocket.errored) {
        completionCallback(new FtpClientError('Data connection closed unexpectedly during storage.'));
      }
    });

    // Define the callback for the STOR command
    function storeCommandCompletionHandler(cmdError, cmdResult) {
      if (cmdError) {
        dataChannelSocket.destroy();
        readableStream.destroy();
        return completionCallback(cmdError);
      }

      const isRecognizedMarker = dataTransferMarkers.expectedCodes.includes(cmdResult.code);
      if (!isRecognizedMarker) {
        dataChannelSocket.destroy();
        readableStream.destroy();
        return completionCallback(new FtpClientError(
          `Unexpected reply code ${cmdResult.code} for STOR command. Expected one of: ${dataTransferMarkers.expectedCodes.join(', ')}. Reply: ${cmdResult.text}`
        ));
      }
      logGeneral(`STOR command initiated, server replied with ${cmdResult.code}. Data transfer expected.`);

      // Pipe the readable stream to the data channel socket
      readableStream.pipe(dataChannelSocket);

      // Handle stream and socket completion
      readableStream.on('end', function() {
        logGeneral('Local file stream ended, all data sent.');
        dataChannelSocket.end(); // Signal end of data to the server
      });

      dataChannelSocket.on('finish', function() {
        logGeneral('Data socket finished writing all data.');
        completionCallback(null); // All data written, transfer complete
      });
    }

    // Attach expected markers to the callback for `processServerReply`
    storeCommandCompletionHandler.expectedDataMarkers = dataTransferMarkers;

    // Execute the STOR command on the control connection
    instanceRef.queueAndExecute(`STOR ${remoteDestinationPath}`, storeCommandCompletionHandler);
  });
};

/**
 * Disconnects the client from the FTP server and cleans up resources.
 * @param {Function} [completionCallback=EMPTY_FUNCTION] Callback invoked after disconnection.
 */
FtpClient.prototype.disconnect = function(completionCallback = EMPTY_FUNCTION) {
  logGeneral('Initiating client disconnection.');

  if (this.controlSocket && !this.controlSocket.destroyed) {
    this.queueAndExecute('QUIT', (err, res) => {
      if (err) {
        logGeneral(`Error during QUIT command: ${err.message}`);
        // Still attempt to destroy the socket even if QUIT fails
      } else {
        logGeneral(`QUIT command successful: ${res.text}`);
      }
      this.controlSocket.destroy();
      this.controlSocket = null;
      this.sessionAuthenticated = false;
      this.pendingOperations = [];
      this.commandExecuting = false;
      completionCallback(err, res);
    });
  } else {
    logGeneral('No active control socket to disconnect.');
    this.sessionAuthenticated = false;
    this.pendingOperations = [];
    this.commandExecuting = false;
    completionCallback(null, { code: 221, text: 'Already disconnected.' });
  }
};