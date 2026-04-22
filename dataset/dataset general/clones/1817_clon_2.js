"use strict";

var utilityModule = require("util");
var eventEmitter = require("events");
var socketClient = require("faye-websocket");
var extJson = require("ddp-ejson");
var httpAgent = require('request');
var pathConcat = require('path').join;
var _util = require("ddp-underscore-patched");

var DataSyncClient = function(options) {
  var instance = this;

  options = options || {};

  // Handle legacy configuration settings for compatibility purposes
  if ("use_ssl" in options)              { options.secureConn = options.use_ssl; }
  if ("auto_reconnect" in options)       { options.autoReconnectEnabled = options.auto_reconnect; }
  if ("auto_reconnect_timer" in options) { options.autoReconnectInterval = options.auto_reconnect_timer; }
  if ("maintain_collections" in options) { options.keepCollections = options.maintain_collections; }
  if ("ddp_version" in options)          { options.protocolVersion = options.ddp_version; }

  // Assign default values for various configuration parameters
  instance.serverHost = options.host || "localhost";
  instance.serverPort = options.port || 3000;
  instance.serverPath = options.path;
  instance.secureConn = options.ssl || instance.serverPort === 443;
  instance.secureOptions = options.tlsOpts || {};
  instance.useSockJsProtocol = options.useSockJs || false;
  instance.autoReconnectEnabled = ("autoReconnectEnabled" in options) ? options.autoReconnectEnabled : true;
  instance.autoReconnectInterval = ("autoReconnectInterval" in options) ? options.autoReconnectInterval : 500;
  instance.keepCollections = ("keepCollections" in options) ? options.keepCollections : true;
  instance.connectionUrl = options.url;
  // Support for multiple DDP protocol versions
  instance.protocolVersion = ("protocolVersion" in options) ? options.protocolVersion : "1";
  instance.supportedProtocolVersions = ["1", "pre2", "pre1"];

  // Provide access to the EJSON utility for custom type extensions
  instance.extJson = extJson;

  // Initialize data storage for collections if persistence is enabled
  if (instance.keepCollections) {
    instance.dataStores = {};
  }

  // Internal state variables for managing connection and requests
  instance._isEstablishingConnection = false;
  instance._isAttemptingReconnection = false;
  instance._nextRequestId = 0;
  instance._requestCallbacks = {};
  instance._updateCompletionCallbacks = {};
  instance._pendingMethodCalls = {};
  instance._dataChangeObservers = {};
};


DataSyncClient.FAULT_CODES = {
  DISCONNECTED: new Error("DataSyncClient: Disconnected from data synchronization server")
};


/**
 * DataSyncClient inherits event emission capabilities
 */
utilityModule.inherits(DataSyncClient, eventEmitter.EventEmitter);


DataSyncClient.prototype._setupSocketListeners = function() {
  var instance = this;

  instance.webSocket.addEventListener("open", function() {
    // Initiate the DDP connection handshake upon socket opening
    instance._dispatchMessage({
      messageType : "connect",
      protocolVersion : instance.protocolVersion,
      supportedVersions : instance.supportedProtocolVersions
    });
  });

  instance.webSocket.addEventListener("error", function(socketError) {
    // Report connection failure if an error occurs during initial connection
    if (instance._isEstablishingConnection) {
      instance.emit("connectionFailed", socketError.message);
    }

    instance.emit("socketProblem", socketError);
  });

  instance.webSocket.addEventListener("close", function(eventObject) {
    instance.emit("socketTermination", eventObject.code, eventObject.reason);
    instance._terminatePendingCalls();
    instance._handleNetworkDisruption();
  });

  instance.webSocket.addEventListener("message", function(incomingMessage) {
    instance._processIncomingData(incomingMessage.data);
    instance.emit("incomingMessage", incomingMessage.data);
  });
};

DataSyncClient.prototype._cancelReconnectTimer = function() {
  var instance = this;
  if (instance.reconnectionTimer) {
    clearTimeout(instance.reconnectionTimer);
    instance.reconnectionTimer = null;
  }
};

DataSyncClient.prototype._handleNetworkDisruption = function() {
  var instance = this;
  if (instance.autoReconnectEnabled && ! instance._hasConnectionFailed && ! instance._isShuttingDown) {
    instance._cancelReconnectTimer();
    instance.reconnectionTimer = setTimeout(function() { instance.initiateConnection(); }, instance.autoReconnectInterval);
    instance._isAttemptingReconnection = true;
  }
};

///////////////////////////////////////////////////////////////////////////
// Low-level message transmission utilities
DataSyncClient.prototype._dispatchMessage = function(outboundData) {
  this.webSocket.send(
    extJson.stringify(outboundData)
  );
};

// Process an incoming message from the server
DataSyncClient.prototype._processIncomingData = function(receivedData) {
  var instance = this;

  receivedData = extJson.parse(receivedData);

  // TODO: 'addedBefore' -- to be implemented
  // TODO: 'movedBefore' -- to be implemented

  if (!receivedData.messageType) {
    return;

  } else if (receivedData.messageType === "failed") {
    if (instance.supportedProtocolVersions.indexOf(receivedData.version) !== -1) {
      this.protocolVersion = receivedData.version;
      instance.initiateConnection();
    } else {
      instance.autoReconnectEnabled = false;
      instance.emit("connectionFailed", "Unable to negotiate DDP protocol version");
    }

  } else if (receivedData.messageType === "connected") {
    instance.sessionId = receivedData.session;
    instance.emit("connectionEstablished");

  // Method call result
  } else if (receivedData.messageType === "result") {
    var callbackFn = instance._requestCallbacks[receivedData.requestId];

    if (callbackFn) {
      callbackFn(receivedData.error, receivedData.result);
      delete instance._requestCallbacks[receivedData.requestId];
    }

  // Method updated status
  } else if (receivedData.messageType === "updated") {

    _util.each(receivedData.methodIds, function (methodId) {
      var callbackFn = instance._updateCompletionCallbacks[methodId];
      if (callbackFn) {
        callbackFn();
        delete instance._updateCompletionCallbacks[methodId];
      }
    });

  // Missing subscription notification
  } else if (receivedData.messageType === "nosub") {
    var callbackFn = instance._requestCallbacks[receivedData.requestId];

    if (callbackFn) {
      callbackFn(receivedData.error);
      delete instance._requestCallbacks[receivedData.requestId];
    }

  // Add document to a collection
  } else if (receivedData.messageType === "added") {
    if (instance.keepCollections && receivedData.collectionName) {
      var entityName = receivedData.collectionName, documentId = receivedData.documentId;

      if (! instance.dataStores[entityName])     { instance.dataStores[entityName] = {}; }
      if (! instance.dataStores[entityName][documentId]) { instance.dataStores[entityName][documentId] = {}; }

      instance.dataStores[entityName][documentId]._id = documentId;

      if (receivedData.documentFields) {
        _util.each(receivedData.documentFields, function(fieldValue, fieldName) {
          instance.dataStores[entityName][documentId][fieldName] = fieldValue;
        });
      }

      if (instance._dataChangeObservers[entityName]) {
        _util.each(instance._dataChangeObservers[entityName], function(changeObserver) {
          changeObserver.added(documentId);
        });
      }
    }

  // Remove document from a collection
  } else if (receivedData.messageType === "removed") {
    if (instance.keepCollections && receivedData.collectionName) {
      var entityName = receivedData.collectionName, documentId = receivedData.documentId;

      if (! instance.dataStores[entityName][documentId]) {
        return;
      }

      var previousValue = instance.dataStores[entityName][documentId];

      delete instance.dataStores[entityName][documentId];

      if (instance._dataChangeObservers[entityName]) {
        _util.each(instance._dataChangeObservers[entityName], function(changeObserver) {
          changeObserver.removed(documentId, previousValue);
        });
      }
    }

  // Change document in a collection
  } else if (receivedData.messageType === "changed") {
    if (instance.keepCollections && receivedData.collectionName) {
      var entityName = receivedData.collectionName, documentId = receivedData.documentId;

      if (! instance.dataStores[entityName])     { return; }
      if (! instance.dataStores[entityName][documentId]) { return; }

      var originalFields     = {},
          removedFields = receivedData.fieldsToClear || [],
          updatedFields = {};

      if (receivedData.documentFields) {
        _util.each(receivedData.documentFields, function(fieldValue, fieldName) {
            originalFields[fieldName] = instance.dataStores[entityName][documentId][fieldName];
            updatedFields[fieldName] = fieldValue;
            instance.dataStores[entityName][documentId][fieldName] = fieldValue;
        });
      }

      if (receivedData.fieldsToClear) {
        _util.each(receivedData.fieldsToClear, function(fieldName) {
            delete instance.dataStores[entityName][documentId][fieldName];
        });
      }

      if (instance._dataChangeObservers[entityName]) {
        _util.each(instance._dataChangeObservers[entityName], function(changeObserver) {
          changeObserver.changed(documentId, originalFields, removedFields, updatedFields);
        });
      }
    }

  // Subscriptions are ready
  } else if (receivedData.messageType === "ready") {
    _util.each(receivedData.subscriptionIds, function(requestId) {
      var callbackFn = instance._requestCallbacks[requestId];
      if (callbackFn) {
        callbackFn();
        delete instance._requestCallbacks[requestId];
      }
    });

  // Basic heartbeat response for ddp pre2
  } else if (receivedData.messageType === "ping") {
    instance._dispatchMessage(
      _util.has(receivedData, "requestId") ? { messageType : "pong", requestId : receivedData.requestId } : { messageType : "pong" }
    );
  }
};


DataSyncClient.prototype._generateNextRequestId = function() {
  return (this._nextRequestId += 1).toString();
};


DataSyncClient.prototype._registerObserver = function(changeObserver) {
  if (! this._dataChangeObservers[changeObserver.entityName]) {
    this._dataChangeObservers[changeObserver.entityName] = {};
  }
  this._dataChangeObservers[changeObserver.entityName][changeObserver.observerId] = changeObserver;
};


DataSyncClient.prototype._deregisterObserver = function(changeObserver) {
  if (! this._dataChangeObservers[changeObserver.entityName]) { return; }

  delete this._dataChangeObservers[changeObserver.entityName][changeObserver.observerId];
};

//////////////////////////////////////////////////////////////////////////
// Public API functions for client control

/* Establish a connection to the server.
 *
 *  connectionEstablished(): Invoked upon successful 'connected' message receipt.
 *               If autoReconnectEnabled is true (default), this callback will fire
 *               each time a connection is successfully re-established.
 */
DataSyncClient.prototype.initiateConnection = function(connectionEstablished) {
  var instance = this;
  instance._isEstablishingConnection = true;
  instance._hasConnectionFailed = false;
  instance._isShuttingDown = false;

  if (connectionEstablished) {
    instance.onEvent("connectionEstablished", function() {
      instance._cancelReconnectTimer();

      connectionEstablished(undefined, instance._isAttemptingReconnection);
      instance._isEstablishingConnection = false;
      instance._isAttemptingReconnection = false;
    });
    instance.onEvent("connectionFailed", function(errorObject) {
      instance._isEstablishingConnection = false;
      instance._hasConnectionFailed = true;
      connectionEstablished(errorObject, instance._isAttemptingReconnection);
    });
  }

  if (instance.useSockJsProtocol) {
    instance._createSockJsConnection();
  } else {
    var socketUrl = instance._constructWebSocketUrl();
    instance._createWebSocketConnection(socketUrl);
  }
};

DataSyncClient.prototype._terminatePendingCalls = function() {
  var instance = this;
  var requestIds = _util.keys(instance._pendingMethodCalls);
  instance._pendingMethodCalls = {};

  requestIds.forEach(function (requestId) {
    if (instance._requestCallbacks[requestId]) {
      instance._requestCallbacks[requestId](DataSyncClient.FAULT_CODES.DISCONNECTED);
      delete instance._requestCallbacks[requestId];
    }

    if (instance._updateCompletionCallbacks[requestId]) {
      instance._updateCompletionCallbacks[requestId]();
      delete instance._updateCompletionCallbacks[requestId];
    }
  });
};

DataSyncClient.prototype._createSockJsConnection = function() {
  var instance = this;

  // Perform an info hit to determine SockJS connection details
  var scheme = instance.secureConn ? "https://" : "http://";
  var randomIdentifier = "" + Math.ceil(Math.random() * 9999999);
  var resourcePath = pathConcat("/", instance.serverPath || "", "sockjs/info");
  var targetUrl = scheme + instance.serverHost + ":" + instance.serverPort + resourcePath;

  var httpRequestOptions = { 'url': targetUrl, 'agentOptions': instance.secureOptions };

  httpAgent.get(httpRequestOptions, function(errorObject, responseObject, responseBody) {
    if (errorObject) {
      instance._handleNetworkDisruption();
    } else if (responseBody) {
      var connectionInfo = JSON.parse(responseBody);
      if(!connectionInfo.baseUrl) {
        // No base_url provided, fall back to pure WebSocket handling
        var socketUrl = instance._constructWebSocketUrl();
        instance._createWebSocketConnection(socketUrl);
      } else if (connectionInfo.baseUrl.indexOf("http") === 0) {
        // Base URL points to a different host
        var socketUrl = connectionInfo.baseUrl + "/websocket";
        socketUrl = socketUrl.substitute(/^http/, "ws");
        instance._createWebSocketConnection(socketUrl);
      } else {
        // Base URL for the same host
        var resourcePath = connectionInfo.baseUrl + "/websocket";
        var socketUrl = instance._constructWebSocketUrl(resourcePath);
        instance._createWebSocketConnection(socketUrl);
      }
    } else {
      // Empty response body, unusual. Default to pure WebSocket handling
      var socketUrl = instance._constructWebSocketUrl();
      instance._createWebSocketConnection(socketUrl);
    }
  });
};

DataSyncClient.prototype._constructWebSocketUrl = function(specificPath) {
  var instance = this;
  var targetUrl;
  specificPath = specificPath || instance.serverPath || "websocket";
  var scheme = instance.secureConn ? "wss://" : "ws://";
  if (instance.connectionUrl && !instance.useSockJsProtocol) {
    targetUrl = instance.connectionUrl;
  } else {
    targetUrl = scheme + instance.serverHost + ":" + instance.serverPort;
    targetUrl += (specificPath.indexOf("/") === 0)? specificPath : "/" + specificPath;
  }
  return targetUrl;
};

DataSyncClient.prototype._createWebSocketConnection = function(socketUrl) {
  var instance = this;
  instance.webSocket = new socketClient.Client(socketUrl, null, instance.secureOptions);
  instance._setupSocketListeners();
};

DataSyncClient.prototype.close = function() {
  var instance = this;
  instance._isShuttingDown = true;
  instance.webSocket.close();
  instance.clearAllListeners("connectionEstablished");
  instance.clearAllListeners("connectionFailed");
};


// Invoke a remote method on the server
//
// callback = function(errorObject, result)
DataSyncClient.prototype.invokeMethod = function(methodIdentifier, methodParameters, callbackFn, completionCallback) {
  var instance = this;
  var requestId = instance._generateNextRequestId();

  instance._requestCallbacks[requestId] = function () {
    delete instance._pendingMethodCalls[requestId];

    if (callbackFn) {
      callbackFn.callMethod(this, arguments);
    }
  };

  instance._updateCompletionCallbacks[requestId] = function () {
    delete instance._pendingMethodCalls[requestId];

    if (completionCallback) {
      completionCallback.callMethod(this, arguments);
    }
  };

  instance._pendingMethodCalls[requestId] = true;

  instance._dispatchMessage({
    messageType    : "method",
    requestId     : requestId,
    methodIdentifier : methodIdentifier,
    methodParameters : methodParameters
  });
};


DataSyncClient.prototype.invokeMethodWithSeed = function(methodIdentifier, methodParameters, seedValue, callbackFn, completionCallback) {
  var instance = this;
  var requestId = instance._generateNextRequestId();

  if (callbackFn) {
    instance._requestCallbacks[requestId] = callbackFn;
  }

  if (completionCallback) {
    instance._updateCompletionCallbacks[requestId] = completionCallback;
  }

  instance._dispatchMessage({
    messageType        : "method",
    requestId         : requestId,
    methodIdentifier     : methodIdentifier,
    seedValue : seedValue,
    methodParameters : methodParameters
  });
};

// Open a data subscription on the server; callback should handle ready and nosub events
DataSyncClient.prototype.establishSubscription = function(entityName, subscriptionParameters, callbackFn) {
  var instance = this;
  var requestId = instance._generateNextRequestId();

  if (callbackFn) {
    instance._requestCallbacks[requestId] = callbackFn;
  }

  instance._dispatchMessage({
    messageType    : "sub",
    requestId     : requestId,
    entityName   : entityName,
    methodParameters : subscriptionParameters
  });

  return requestId;
};

DataSyncClient.prototype.terminateSubscription = function(requestId) {
  var instance = this;

  instance._dispatchMessage({
    messageType : "unsub",
    requestId  : requestId
  });
};