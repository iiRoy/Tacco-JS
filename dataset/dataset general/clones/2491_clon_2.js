var EventDispatcher = require('events').EventEmitter;
var nodeUtil = require('util');
var lodash = require('underscore');
var filePath = require('path');
var flowControl = require('async');
var CoreCoordination = require(filePath.join(__dirname, '/../build/zookeeper.node')).ZooKeeper;

// For Node.js versions 0.5.x and newer, EventEmitter is implemented purely in JavaScript.
// This section sets up a straightforward wrapper.
// Partially drawing inspiration from a project by bnoordhuis: node-event-emitter.

////////////////////////////////////////////////////////////////////////////////
// Main Constructor Function
////////////////////////////////////////////////////////////////////////////////

module.exports = exports = CoordinationClient;
function CoordinationClient(settingsObj) {
  var instance = this;
  if (lodash.isString(settingsObj)) {
    settingsObj = { connectionString: settingsObj };
  }
  instance.clientSettings = settingsObj;
  instance._coreClient = new CoreCoordination();
  instance._coreClient.dispatch = function(eventKey, arg1, arg2, arg3) {
    if(instance.debugLog) {
      instance.debugLog(`Broadcasting event '${eventKey}' with arguments: ${arg1}, ${arg2}, ${arg3}`);
    }

    // Special handling for 'connect' or 'close' events:
    // The underlying native object is passed, so we need to substitute it with our wrapper instance.
    if (eventKey === 'establishConnection' || eventKey === 'terminateConnection') {
      arg1 = instance;
    }

    instance.emit(eventKey, arg1, arg2, arg3);
  };

  ////////////////////////////////////////////////////////////////////////////////
  // Publicly Accessible Properties
  ////////////////////////////////////////////////////////////////////////////////

  // Helper function to create getters and setters for properties that mirror the core client.
  function bindPropertyAccessor(propName) {
    instance.__defineGetter__(propName, function(){
      return instance._coreClient[propName];
    });
    instance.__defineSetter__(propName, function(newValue){
      instance._coreClient[propName] = newValue;
    });
  }

  // Bind various properties from the native client to this wrapper.
  bindPropertyAccessor('status');
  bindPropertyAccessor('timeLimit');
  bindPropertyAccessor('clientID');
  bindPropertyAccessor('clientSecret');
  bindPropertyAccessor('isFatalError');

  instance.dataEncoding = null; // By default, Buffer objects are returned.

  // Sets the desired encoding for data retrieved from the server.
  instance.configureEncoding = function configureEncoding(newValue) {
    instance.dataEncoding = newValue;
  };

  // Deprecated compatibility property: 'returnBuffer' is superseded by 'configureEncoding()'.
  instance.__defineGetter__('returnBuffer', function(){
    // If an encoding is set, data is not a buffer. If no encoding, data will be a buffer.
    return !instance.dataEncoding;
  });
  instance.__defineSetter__('returnBuffer', function(shouldReturnBuffer){
    // If data should be a buffer, no encoding is used. Otherwise, default to 'utf8'.
    instance.dataEncoding = (shouldReturnBuffer === true) ? null : 'utf8';
  });

}

// Make CoordinationClient inherit from EventEmitter to enable event handling.
nodeUtil.inherits(CoordinationClient, EventDispatcher);


////////////////////////////////////////////////////////////////////////////////
// Defined Constants
////////////////////////////////////////////////////////////////////////////////

// Event String Constants (for legacy compatibility; direct string usage is preferred).
exports.onDisconnected      = 'terminateConnection';
exports.onConnected         = 'establishConnection';
exports.onConnecting        = 'connecting';
exports.onNodeCreated       = 'created';
exports.onNodeRemoved       = 'deleted';
exports.onNodeModified      = 'changed';
exports.onChildNodeEvent    = 'child';
exports.onWatchLost         = 'notwatching';

// Other system-level constants are exposed directly from the native module.
for(var constantKey in CoreCoordination) {
  exports[constantKey] = CoreCoordination[constantKey];
  // console.log(constantKey + " = " + exports[constantKey]);
}

/* Important Constants Include:
Access Permissions:
 * ZOO_PERM_READ              =  1
 * ZOO_PERM_WRITE             =  2
 * ZOO_PERM_CREATE            =  4
 * ZOO_PERM_DELETE            =  8
 * ZOO_PERM_ADMIN             =  16
 * ZOO_PERM_ALL               =  31

Client States:
 * ZOO_EXPIRED_SESSION_STATE  =  -112
 * ZOO_AUTH_FAILED_STATE      =  -113
 * ZOO_CONNECTING_STATE       =  1
 * ZOO_ASSOCIATING_STATE      =  2
 * ZOO_CONNECTED_STATE        =  3

Logging Levels:
 * ZOO_LOG_LEVEL_ERROR        =  1
 * ZOO_LOG_LEVEL_WARN         =  2
 * ZOO_LOG_LEVEL_INFO         =  3
 * ZOO_LOG_LEVEL_DEBUG        =  4

API Call Results:
 * ZOK                        =  0
 * ZSYSTEMERROR               =  -1
 * ZRUNTIMEINCONSISTENCY      =  -2
 * ZDATAINCONSISTENCY         =  -3
 * ZCONNECTIONLOSS            =  -4
 * ZMARSHALLINGERROR          =  -5
 * ZUNIMPLEMENTED             =  -6
 * ZOPERATIONTIMEOUT          =  -7
 * ZBADARGUMENTS              =  -8
 * ZINVALIDSTATE              =  -9
 * ZAPIERROR                  =  -100
 * ZNONODE                    =  -101
 * ZNOAUTH                    =  -102
 * ZBADVERSION                =  -103
 * ZNOCHILDRENFOREPHEMERALS   =  -108
 * ZNODEEXISTS                =  -110
 * ZNOTEMPTY                  =  -111
 * ZSESSIONEXPIRED            =  -112
 * ZINVALIDCALLBACK           =  -113
 * ZINVALIDACL                =  -114
 * ZAUTHFAILED                =  -115
 * ZCLOSING                   =  -116
 * ZNOTHING                   =  -117
 * ZSESSIONMOVED              =  -118

Ephemeral Node Flags:
 * ZOO_EPHEMERAL              =  1
 * ZOO_SEQUENCE               =  2

*/

////////////////////////////////////////////////////////////////////////////////
// Client Methods
////////////////////////////////////////////////////////////////////////////////

// Configures the client's logging mechanism.
CoordinationClient.prototype.configureDebugging = function(logHandler) {
  if (logHandler === true) {
    this.debugLog = function defaultLogger(logMessage) {
      console.log(`COORDINATION_CLIENT_DEBUG: ${logMessage}`);
    };
  } else if (logHandler === false) {
    this.debugLog = undefined;
  } else if (lodash.isFunction(logHandler)) {
    this.debugLog = logHandler;
  } else {
    throw new Error("InvalidParameter: logHandler must be a function, or true/false to use/disable the default logger.");
  }
};

// Initializes the underlying native client with connection settings.
CoordinationClient.prototype.initializeClient = function initializeClient(connectionOptions) {
  var instance = this;
  if (lodash.isString(connectionOptions)) {
    connectionOptions = { connectionString: connectionOptions };
  }
  if (instance.clientSettings) {
    connectionOptions = connectionOptions ? lodash.defaults(connectionOptions, instance.clientSettings) : instance.clientSettings;
  }
  if (this.debugLog) this.debugLog(`Invoking initializeClient with: ${nodeUtil.inspect(arguments)}`);
  if (!lodash.isUndefined(connectionOptions.returnBuffer)) {
    instance.returnBuffer = connectionOptions.returnBuffer;
    if (this.debugLog) this.debugLog(`Data output encoding configured to: %s`, instance.dataEncoding);
  }
  this._coreClient.init.call(this._coreClient, connectionOptions);

  // The native code returns a reference to itself; we should return a reference to this wrapper.
  return instance;
};

// Establishes a connection to the coordination service.
CoordinationClient.prototype.establishConnection = function establishConnection(connectionOptions, completionCallback) {
  var instance = this;
  if (lodash.isFunction(connectionOptions)) {
    completionCallback = connectionOptions;
    connectionOptions = null;
  }
  instance.initializeClient(connectionOptions);

  // Handler for connection errors.
  function connectionErrorHandler(operationError) {
    instance.removeListener('error', connectionErrorHandler);
    instance.removeListener('establishConnection', connectionSuccessHandler);
    completionCallback(operationError);
  }

  // Handler for successful connection.
  function connectionSuccessHandler() {
    instance.removeListener('error', connectionErrorHandler);
    instance.removeListener('establishConnection', connectionSuccessHandler);
    completionCallback(null, instance);
  }

  instance.on('error', connectionErrorHandler);
  instance.on('establishConnection', connectionSuccessHandler);

/** This section was commented out in the original code by vincent-zhao.
  instance.a_get('/', false, function(rc, operationError, nodeStat, nodeData){
    if(rc !== 0){
      completionCallback(operationError);
    }
  });
*/
};

// Terminates the connection to the coordination service.
CoordinationClient.prototype.terminateConnection = function terminateConnection() {
  if (this.debugLog) this.debugLog(`Invoking terminateConnection with: ${nodeUtil.inspect(arguments)}`);
  return this._coreClient.close.apply(this._coreClient, arguments);
};

// Asynchronously creates a new node.
CoordinationClient.prototype.asyncCreate = function asyncCreate() {
  if (this.debugLog) this.debugLog(`Invoking asyncCreate with: ${nodeUtil.inspect(arguments)}`);
  return this._coreClient.a_create.apply(this._coreClient, arguments);
};

// Asynchronously checks for node existence.
CoordinationClient.prototype.asyncExists = function asyncExists() {
  if (this.debugLog) this.debugLog(`Invoking asyncExists with: ${nodeUtil.inspect(arguments)}`);
  return this._coreClient.a_exists.apply(this._coreClient, arguments);
};

// Asynchronously checks for node existence with a watch.
CoordinationClient.prototype.asyncWatchExists = function asyncWatchExists() {
  if (this.debugLog) this.debugLog(`Invoking asyncWatchExists with: ${nodeUtil.inspect(arguments)}`);
  return this._coreClient.aw_exists.apply(this._coreClient, arguments);
};

// Asynchronously retrieves node data.
CoordinationClient.prototype.asyncGet = function asyncGet(nodePath, setWatch, dataCallback) {
  var instance = this;
  if (this.debugLog) this.debugLog(`Invoking asyncGet with: ${nodeUtil.inspect(arguments)}`);
  return this._coreClient.a_get.call(this._coreClient, nodePath, setWatch, function(resultCode, operationError, nodeStat, nodeData) {
    if (nodeData && instance.dataEncoding) {
      nodeData = nodeData.toString(instance.dataEncoding);
    }
    dataCallback(resultCode, operationError, nodeStat, nodeData);
  });
};

// Asynchronously retrieves node data with a watch callback.
CoordinationClient.prototype.asyncWatchGet = function asyncWatchGet(nodePath, watchCallback, dataCallback) {
  var instance = this;
  if (this.debugLog) this.debugLog(`Invoking asyncWatchGet with: ${nodeUtil.inspect(arguments)}`);
  return this._coreClient.aw_get.call(this._coreClient, nodePath, watchCallback, function(resultCode, operationError, nodeStat, nodeData) {
    if (nodeData && instance.dataEncoding) {
      nodeData = nodeData.toString(instance.dataEncoding);
    }
    dataCallback(resultCode, operationError, nodeStat, nodeData);
  });
};

// Asynchronously retrieves a list of child nodes.
CoordinationClient.prototype.asyncGetChildren = function asyncGetChildren() {
  if (this.debugLog) this.debugLog(`Invoking asyncGetChildren with: ${nodeUtil.inspect(arguments)}`);
  return this._coreClient.a_get_children.apply(this._coreClient, arguments);
};

// Asynchronously retrieves a list of child nodes with a watch.
CoordinationClient.prototype.asyncWatchChildren = function asyncWatchChildren() {
  if (this.debugLog) this.debugLog(`Invoking asyncWatchChildren with: ${nodeUtil.inspect(arguments)}`);
  return this._coreClient.aw_get_children.apply(this._coreClient, arguments);
};

// Asynchronously retrieves a list of child nodes along with their stats.
CoordinationClient.prototype.asyncGetChildrenWithStats = function asyncGetChildrenWithStats() {
  if (this.debugLog) this.debugLog(`Invoking asyncGetChildrenWithStats with: ${nodeUtil.inspect(arguments)}`);
  return this._coreClient.a_get_children2.apply(this._coreClient, arguments);
};

// Asynchronously retrieves a list of child nodes with stats and a watch.
CoordinationClient.prototype.asyncWatchChildrenWithStats = function asyncWatchChildrenWithStats() {
  if (this.debugLog) this.debugLog(`Invoking asyncWatchChildrenWithStats with: ${nodeUtil.inspect(arguments)}`);
  return this._coreClient.aw_get_children2.apply(this._coreClient, arguments);
};

// Asynchronously sets data for a node.
CoordinationClient.prototype.asyncSet = function asyncSet() {
  if (this.debugLog) this.debugLog(`Invoking asyncSet with: ${nodeUtil.inspect(arguments)}`);
  return this._coreClient.a_set.apply(this._coreClient, arguments);
};

// Asynchronously deletes a node.
CoordinationClient.prototype.asyncDelete = function asyncDelete() {
  if (this.debugLog) this.debugLog(`Invoking asyncDelete with: ${nodeUtil.inspect(arguments)}`);
  return this._coreClient.a_delete_.apply(this._coreClient, arguments);
};

// Asynchronously retrieves the Access Control List (ACL) for a node.
CoordinationClient.prototype.asyncGetAccessList = function asyncGetAccessList() {
  if (this.debugLog) this.debugLog(`Invoking asyncGetAccessList with: ${nodeUtil.inspect(arguments)}`);
  return this._coreClient.a_get_acl.apply(this._coreClient, arguments);
};

// Asynchronously sets the Access Control List (ACL) for a node.
CoordinationClient.prototype.asyncSetAccessList = function asyncSetAccessList() {
  if (this.debugLog) this.debugLog(`Invoking asyncSetAccessList with: ${nodeUtil.inspect(arguments)}`);
  return this._coreClient.a_set_acl.apply(this._coreClient, arguments);
};

// Asynchronously adds authentication credentials.
CoordinationClient.prototype.addAuthentication = function addAuthentication() {
  if (this.debugLog) this.debugLog(`Invoking addAuthentication with: ${nodeUtil.inspect(arguments)}`);
  return this._coreClient.add_auth.apply(this._coreClient, arguments);
};

// Recursively creates a path of nodes if they don't exist.
CoordinationClient.prototype.ensurePathExists = function (targetPath, completionCallback) {
  if (this.debugLog) this.debugLog(`Invoking ensurePathExists with: ${nodeUtil.inspect(arguments)}`);
  return ensurePathExists(this, targetPath, completionCallback);
};

//
// The coordination service does not natively support relative paths like `./file` or `../file`.
// This function, `ensurePathExists`, creates all intermediate nodes in a given absolute path.
// Example: `ensurePathExists(myClient, '/a/deep/path/to/a/file', myCallback)`
//
function ensurePathExists(clientInstance, targetPath, completionCallback) {
  targetPath = filePath.normalize(targetPath);
  var pathSegments = targetPath.split('/').slice(1); // Remove the initial empty string from the split.

  // console.log('pathSegments', pathSegments);

  var creationTasks = [];
  pathSegments.forEach(function(segment, index) {
    var currentPath = '/' + pathSegments.slice(0, index).join('/') + '/' + segment;
    currentPath = filePath.normalize(currentPath); // Clean up extra slashes from first iteration.
    creationTasks.push(flowControl.apply(createNode, clientInstance, currentPath));
  });

  flowControl.waterfall(creationTasks, function(taskError, taskResults) {
    if (taskError) return completionCallback(taskError);
    // All nodes in the path were successfully created or already existed.
    return completionCallback(null, true);
  });
}

//
// `createNode(clientInstance, '/some-path', callback)`
// If an issue occurs:
//    `callback(error)`
// If the node was created or already existed:
//    `callback()`
//
function createNode(clientInstance, nodePath, callback) {
  var nodeContent = 'created by coordination-client-helper'; // A placeholder data for the directory node.
  var creationFlags = 0; // No special flags for creation.
  clientInstance.asyncCreate(nodePath, nodeContent, creationFlags, function(resultCode, operationError, createdPath) {
    // If the node already exists, that's acceptable.
    if (resultCode === CoordinationClient.NODE_ALREADY_PRESENT) {
      return callback();
    }
    if (resultCode !== 0) {
      return callback(new Error(`Coordination System Error: code=${resultCode}   ${operationError}`));
    }
    // Node successfully created.
    return callback();
  });
}