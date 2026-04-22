const NodeEventRelay = require('events').EventEmitter;
const SysUtils = require('util');
const PathTools = require('path');
const AsyncFlow = require('async');
const NativeCoordService = require(PathTools.join(__dirname, '/../build/zookeeper.node')).ZooKeeper; // Adjusted path for clarity

// This module provides a wrapper around the native ZooKeeper client.
// It enhances event handling and offers a more ergonomic API.

////////////////////////////////////////////////////////////////////////////////
// Main Client Class Definition
////////////////////////////////////////////////////////////////////////////////

// Export the primary client constructor.
module.exports = CoordinationClient;

/**
 * Constructs a new CoordinationClient instance.
 * @param {string|object} initializationPayload - Connection string or configuration object.
 * @constructor
 */
function CoordinationClient(initializationPayload) {
  const thisClient = this; // Consistent reference to the current instance.

  // Normalize configuration input: if a string, treat it as the connection string.
  if (typeof initializationPayload === 'string') {
    initializationPayload = { serverConnectString: initializationPayload };
  }
  
  // Store the client's operational settings.
  thisClient.clientSettings = initializationPayload;
  
  // Instantiate the underlying native ZooKeeper binding.
  thisClient._underlyingHandle = new NativeCoordService();

  // Override the native object's 'emit' method to intercept and re-dispatch events,
  // ensuring the wrapper instance is passed for specific event types.
  thisClient._underlyingHandle.dispatchSignal = function(signalName, arg1, arg2, arg3) {
    if (thisClient.activityLog) {
      thisClient.activityLog(`Dispatching internal signal '${signalName}' with arguments: ${JSON.stringify([arg1, arg2, arg3])}`);
    }

    // For critical connection lifecycle events, ensure the public wrapper instance is returned.
    if (signalName === 'connect' || signalName === 'close') {
      arg1 = thisClient; // Replace the native object with the wrapper.
    }
    thisClient.emit(signalName, arg1, arg2, arg3); // Re-emit via the wrapper's EventEmitter.
  };

  ////////////////////////////////////////////////////////////////////////////////
  // Mirroring Native Properties
  ////////////////////////////////////////////////////////////////////////////////

  /**
   * Establishes a two-way mirrored property between the wrapper and the native client.
   * This allows direct access and modification of native properties through the wrapper.
   * @param {string} propertyKey - The name of the property to mirror.
   */
  function establishPropertyMirror(propertyKey) {
    Object.defineProperty(thisClient, propertyKey, {
      enumerable: true,
      configurable: true,
      get: function() {
        return thisClient._underlyingHandle[propertyKey];
      },
      set: function(newValue) {
        thisClient._underlyingHandle[propertyKey] = newValue;
      }
    });
  }

  establishPropertyMirror('connectionStatus');      // Reflects the client's connection state.
  establishPropertyMirror('sessionTimeoutMs');      // Configured session timeout.
  establishPropertyMirror('clientIdValue');         // Unique identifier for the client.
  establishPropertyMirror('clientAuthCredential');  // Authentication credential.
  establishPropertyMirror('isSessionExpired');      // Indicates if the session is unrecoverable.

  // Default to returning Buffer objects for data, unless an encoding is specified.
  thisClient.dataEncodingFormat = null;

  /**
   * Configures the encoding format for data retrieved from ZooKeeper.
   * @param {string|null} encodingValue - The encoding to use (e.g., 'utf8', 'ascii'), or null for Buffer.
   */
  thisClient.configureDataEncoding = function configureDataEncoding(encodingValue) {
    thisClient.dataEncodingFormat = encodingValue;
  };

  // Deprecated compatibility layer for 'data_as_buffer'. Use configureDataEncoding() instead.
  Object.defineProperty(thisClient, 'isDataBufferPreferred', {
    enumerable: true,
    configurable: true,
    get: function() {
      // If an encoding is set, data is not a buffer. If no encoding, it's a buffer.
      return thisClient.dataEncodingFormat === null;
    },
    set: function(shouldBeBuffer) {
      // If data should be a buffer, set encoding to null. Otherwise, default to 'utf8'.
      thisClient.dataEncodingFormat = (shouldBeBuffer === true) ? null : 'utf8';
    }
  });
}

// Ensure CoordinationClient inherits from NodeEventRelay (EventEmitter).
SysUtils.inherits(CoordinationClient, NodeEventRelay);

////////////////////////////////////////////////////////////////////////////////
// Standardized Constants
////////////////////////////////////////////////////////////////////////////////

// Event names for external consumption (for backwards compatibility, though direct strings are preferred).
CoordinationClient.EventTypes = {
  SESSION_CLOSED: 'close',
  SESSION_CONNECTED: 'connect',
  SESSION_CONNECTING: 'connecting',
  NODE_CREATED: 'created',
  NODE_DELETED: 'deleted',
  NODE_DATA_CHANGED: 'changed',
  NODE_CHILDREN_CHANGED: 'child',
  WATCH_STOPPED: 'notwatching'
};

// Expose all constants from the native ZooKeeper binding directly on the client class.
// This includes error codes, states, permissions, etc.
for (const constantKey in NativeCoordService) {
  // Only expose own properties, not inherited ones.
  if (Object.prototype.hasOwnProperty.call(NativeCoordService, constantKey)) {
    CoordinationClient[constantKey] = NativeCoordService[constantKey];
  }
}

////////////////////////////////////////////////////////////////////////////////
// Client Prototype Methods
////////////////////////////////////////////////////////////////////////////////

/**
 * Configures the activity logging mechanism for the client.
 * @param {boolean|function} loggerConfig - `true` for default console logging, `false` to disable, or a custom function.
 */
CoordinationClient.prototype.setActivityLogger = function(loggerConfig) {
  if (loggerConfig === true) {
    this.activityLog = (logMessage, ...args) => {
      console.log(`[CoordinationClient Log]: ${logMessage}`, ...args);
    };
  } else if (loggerConfig === false) {
    this.activityLog = undefined;
  } else if (typeof loggerConfig === 'function') {
    this.activityLog = loggerConfig;
  } else {
    throw new Error("InvalidConfiguration: Logger must be a function, true (for default console), or false (to disable).");
  }
};

/**
 * Initializes the native client with provided or existing configuration.
 * @param {object} [runtimeOptions] - Configuration overrides for this initialization.
 * @returns {CoordinationClient} The current client instance for chaining.
 */
CoordinationClient.prototype.initializeClient = function(runtimeOptions = {}) {
  const currentClient = this;

  // Merge runtime options with existing client settings.
  // Prioritize runtimeOptions, then existing clientSettings.
  const effectiveConfig = { ...currentClient.clientSettings, ...runtimeOptions };
  currentClient.clientSettings = effectiveConfig; // Update internal settings.

  if (currentClient.activityLog) {
    currentClient.activityLog(`Initializing native client with settings: ${SysUtils.inspect(effectiveConfig)}`);
  }

  // Handle deprecated 'data_as_buffer' setting if present in config.
  if (typeof effectiveConfig.data_as_buffer !== 'undefined') {
    currentClient.isDataBufferPreferred = effectiveConfig.data_as_buffer;
    if (currentClient.activityLog) {
      currentClient.activityLog(`Data output encoding set to: ${currentClient.dataEncodingFormat || 'Buffer'}`);
    }
  }

  // Invoke the native initialization method.
  currentClient._underlyingHandle.init.call(currentClient._underlyingHandle, effectiveConfig);

  // The native code returns a reference to itself; we return the wrapper instance.
  return currentClient;
};

/**
 * Establishes a connection to the ZooKeeper ensemble.
 * @param {object} [connectionOptions] - Options for the connection (e.g., server string).
 * @param {function} callback - Callback function (err, clientInstance).
 */
CoordinationClient.prototype.establishConnection = function(connectionOptions, callback) {
  const currentClient = this;

  // Argument reordering for flexibility.
  if (typeof connectionOptions === 'function') {
    callback = connectionOptions;
    connectionOptions = {};
  }
  connectionOptions = connectionOptions || {};

  // Validate callback existence.
  if (typeof callback !== 'function') {
    const errorMsg = "A callback function is required to establish connection.";
    if (currentClient.activityLog) currentClient.activityLog(`Error: ${errorMsg}`);
    throw new Error(errorMsg);
  }

  // Initialize the client before attempting connection.
  currentClient.initializeClient(connectionOptions);

  /**
   * Handles errors during the connection process.
   * @param {Error} err - The error object.
   */
  function connectionErrorHandler(err) {
    currentClient.removeListener('error', connectionErrorHandler);
    currentClient.removeListener('connect', connectionSuccessHandler);
    if (currentClient.activityLog) currentClient.activityLog(`Connection error occurred: ${err.message}`);
    callback(err);
  }

  /**
   * Handles successful connection.
   */
  function connectionSuccessHandler() {
    currentClient.removeListener('error', connectionErrorHandler);
    currentClient.removeListener('connect', connectionSuccessHandler);
    if (currentClient.activityLog) currentClient.activityLog("Successfully established connection.");
    callback(null, currentClient);
  }

  currentClient.on('error', connectionErrorHandler);
  currentClient.on('connect', connectionSuccessHandler);

  // Note: The commented-out a_get call from the original was an implicit connection check.
  // Modern clients typically rely on the 'connect' event for readiness.
};

/**
 * Terminates the client's connection to ZooKeeper.
 * @returns {*} The result of the native close operation.
 */
CoordinationClient.prototype.terminateConnection = function() {
  if (!this._underlyingHandle) {
    if (this.activityLog) this.activityLog("Attempted to close a client without an underlying handle.");
    return; // Or throw an error, depending on desired behavior.
  }
  if (this.activityLog) this.activityLog("Initiating client connection termination.");
  return this._underlyingHandle.close.apply(this._underlyingHandle, arguments);
};

/**
 * Asynchronously creates a new node in ZooKeeper.
 * @returns {*} The result of the native create operation.
 */
CoordinationClient.prototype.asyncCreateNode = function() {
  if (this.activityLog) this.activityLog("Calling asyncCreateNode with: " + SysUtils.inspect(arguments));
  return this._underlyingHandle.a_create.apply(this._underlyingHandle, arguments);
};

/**
 * Asynchronously checks for the existence of a node.
 * @returns {*} The result of the native exists operation.
 */
CoordinationClient.prototype.asyncCheckNodeExists = function() {
  if (this.activityLog) this.activityLog("Calling asyncCheckNodeExists with: " + SysUtils.inspect(arguments));
  return this._underlyingHandle.a_exists.apply(this._underlyingHandle, arguments);
};

/**
 * Asynchronously checks for the existence of a node and sets a watch.
 * @returns {*} The result of the native watch exists operation.
 */
CoordinationClient.prototype.asyncWatchNodeExists = function() {
  if (this.activityLog) this.activityLog("Calling asyncWatchNodeExists with: " + SysUtils.inspect(arguments));
  return this._underlyingHandle.aw_exists.apply(this._underlyingHandle, arguments);
};

/**
 * Asynchronously retrieves data from a node.
 * @param {string} nodePath - The path to the node.
 * @param {boolean} setWatch - Whether to set a watch on the node.
 * @param {function} dataCallback - Callback function (rc, error, stat, data).
 * @returns {*} The result of the native get operation.
 */
CoordinationClient.prototype.asyncRetrieveNodeData = function(nodePath, setWatch, dataCallback) {
  const currentClient = this;
  if (this.activityLog) this.activityLog("Calling asyncRetrieveNodeData for path: " + nodePath);
  return this._underlyingHandle.a_get.call(this._underlyingHandle, nodePath, setWatch, function(rc, error, stat, rawData) {
    let processedData = rawData;
    // Apply encoding if specified and data is present.
    if (rawData instanceof Buffer && currentClient.dataEncodingFormat) {
      processedData = rawData.toString(currentClient.dataEncodingFormat);
    }
    dataCallback(rc, error, stat, processedData);
  });
};

/**
 * Asynchronously retrieves data from a node and sets a watch with a separate watch callback.
 * @param {string} nodePath - The path to the node.
 * @param {function} watchCallback - Callback for watch events.
 * @param {function} dataCallback - Callback function (rc, error, stat, data).
 * @returns {*} The result of the native watch get operation.
 */
CoordinationClient.prototype.asyncWatchAndRetrieveNodeData = function(nodePath, watchCallback, dataCallback) {
  const currentClient = this;
  if (this.activityLog) this.activityLog("Calling asyncWatchAndRetrieveNodeData for path: " + nodePath);
  return this._underlyingHandle.aw_get.call(this._underlyingHandle, nodePath, watchCallback, function(rc, error, stat, rawData) {
    let processedData = rawData;
    // Apply encoding if specified and data is present.
    if (rawData instanceof Buffer && currentClient.dataEncodingFormat) {
      processedData = rawData.toString(currentClient.dataEncodingFormat);
    }
    dataCallback(rc, error, stat, processedData);
  });
};

/**
 * Asynchronously lists children of a node.
 * @returns {*} The result of the native get children operation.
 */
CoordinationClient.prototype.asyncListChildren = function() {
  if (this.activityLog) this.activityLog("Calling asyncListChildren with: " + SysUtils.inspect(arguments));
  return this._underlyingHandle.a_get_children.apply(this._underlyingHandle, arguments);
};

/**
 * Asynchronously lists children of a node and sets a watch.
 * @returns {*} The result of the native watch children operation.
 */
CoordinationClient.prototype.asyncWatchChildren = function() {
  if (this.activityLog) this.activityLog("Calling asyncWatchChildren with: " + SysUtils.inspect(arguments));
  return this._underlyingHandle.aw_get_children.apply(this._underlyingHandle, arguments);
};

/**
 * Asynchronously lists children of a node, returning stat information.
 * @returns {*} The result of the native get children2 operation.
 */
CoordinationClient.prototype.asyncListChildrenWithStat = function() {
  if (this.activityLog) this.activityLog("Calling asyncListChildrenWithStat with: " + SysUtils.inspect(arguments));
  return this._underlyingHandle.a_get_children2.apply(this._underlyingHandle, arguments);
};

/**
 * Asynchronously lists children of a node with stat information and sets a watch.
 * @returns {*} The result of the native watch children2 operation.
 */
CoordinationClient.prototype.asyncWatchChildrenWithStat = function() {
  if (this.activityLog) this.activityLog("Calling asyncWatchChildrenWithStat with: " + SysUtils.inspect(arguments));
  return this._underlyingHandle.aw_get_children2.apply(this._underlyingHandle, arguments);
};

/**
 * Asynchronously sets data for a node.
 * @returns {*} The result of the native set operation.
 */
CoordinationClient.prototype.asyncSetNodeData = function() {
  if (this.activityLog) this.activityLog("Calling asyncSetNodeData with: " + SysUtils.inspect(arguments));
  return this._underlyingHandle.a_set.apply(this._underlyingHandle, arguments);
};

/**
 * Asynchronously deletes a node.
 * @returns {*} The result of the native delete operation.
 */
CoordinationClient.prototype.asyncDeleteNode = function() {
  if (this.activityLog) this.activityLog("Calling asyncDeleteNode with: " + SysUtils.inspect(arguments));
  return this._underlyingHandle.a_delete_.apply(this._underlyingHandle, arguments);
};

/**
 * Asynchronously retrieves the Access Control List (ACL) for a node.
 * @returns {*} The result of the native get ACL operation.
 */
CoordinationClient.prototype.asyncGetNodeACL = function() {
  if (this.activityLog) this.activityLog("Calling asyncGetNodeACL with: " + SysUtils.inspect(arguments));
  return this._underlyingHandle.a_get_acl.apply(this._underlyingHandle, arguments);
};

/**
 * Asynchronously sets the Access Control List (ACL) for a node.
 * @returns {*} The result of the native set ACL operation.
 */
CoordinationClient.prototype.asyncSetNodeACL = function() {
  if (this.activityLog) this.activityLog("Calling asyncSetNodeACL with: " + SysUtils.inspect(arguments));
  return this._underlyingHandle.a_set_acl.apply(this._underlyingHandle, arguments);
};

/**
 * Asynchronously adds authentication credentials to the client.
 * @returns {*} The result of the native add auth operation.
 */
CoordinationClient.prototype.addAuthenticationCredentials = function() {
  if (this.activityLog) this.activityLog("Calling addAuthenticationCredentials with: " + SysUtils.inspect(arguments));
  return this._underlyingHandle.add_auth.apply(this._underlyingHandle, arguments);
};

/**
 * Recursively creates a ZNode path, similar to `mkdir -p`.
 * @param {string} fullPath - The complete path to create.
 * @param {function} completionCallback - Callback function (err, success).
 */
CoordinationClient.prototype.ensurePathExists = function(fullPath, completionCallback) {
  if (this.activityLog) this.activityLog(`Attempting to ensure path exists: ${fullPath}`);
  return ensurePathExistsRecursive(this, fullPath, completionCallback);
};

// Zookeeper paths do not support '.' or '..' components.
// This utility function recursively creates parent nodes if they don't exist.
function ensurePathExistsRecursive(clientInstance, targetPath, finalCallback) {
  const normalizedPath = PathTools.normalize(targetPath);
  const pathSegments = normalizedPath.split('/').filter(segment => segment.length > 0); // Remove empty strings

  if (pathSegments.length === 0) {
    // If the path is just '/', it always exists.
    return finalCallback(null, true);
  }

  const creationTasks = [];
  for (let i = 0; i < pathSegments.length; i++) {
    const currentSubpath = '/' + pathSegments.slice(0, i + 1).join('/');
    creationTasks.push(AsyncFlow.apply(attemptNodeCreation, clientInstance, currentSubpath));
  }

  // Execute creation tasks in sequence.
  AsyncFlow.waterfall(creationTasks, (operationError, lastResult) => {
    if (operationError) {
      if (clientInstance.activityLog) clientInstance.activityLog(`Error during path creation for ${targetPath}: ${operationError.message}`);
      return finalCallback(operationError);
    }
    if (clientInstance.activityLog) clientInstance.activityLog(`Successfully ensured path exists: ${targetPath}`);
    return finalCallback(null, true); // All parts of the path were successfully created or already existed.
  });
}

/**
 * Attempts to create a single ZNode. If it already exists, it's considered a success.
 * @param {CoordinationClient} clientInstance - The client instance.
 * @param {string} nodePath - The path of the node to create.
 * @param {function} completionCb - Callback function (err).
 */
function attemptNodeCreation(clientInstance, nodePath, completionCb) {
  const nodeContent = Buffer.from('zk-path-helper-node', 'utf8'); // Store some arbitrary data.
  const nodeFlags = 0; // Standard persistent node.

  clientInstance.asyncCreateNode(nodePath, nodeContent, nodeFlags, (responseCode, errorMsg, createdZkPath) => {
    // If the node already exists, it's not an error for mkdirp.
    if (responseCode === CoordinationClient.ZNODEEXISTS) {
      if (clientInstance.activityLog) clientInstance.activityLog(`Node already exists: ${nodePath}. Continuing.`);
      return completionCb(null);
    }
    // Any other non-zero response code is an actual error.
    if (responseCode !== 0) {
      const specificError = new Error(`Coordination Service Error: Code=${responseCode}, Message=${errorMsg || 'Unknown'}. Path: ${nodePath}`);
      if (clientInstance.activityLog) clientInstance.activityLog(`Failed to create node ${nodePath}: ${specificError.message}`);
      return completionCb(specificError);
    }
    // Node created successfully.
    if (clientInstance.activityLog) clientInstance.activityLog(`Successfully created node: ${createdZkPath}`);
    return completionCb(null);
  });
}