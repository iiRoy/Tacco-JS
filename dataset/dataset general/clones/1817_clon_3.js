"use strict";

const utilityModule = require("util");
const eventEmitterCore = require("events");
const SocketClientAdapter = require("faye-websocket");
const EnhancedJSON = require("ddp-ejson");
const httpRequestAgent = require('request');
const pathConcatenator = require('path').join;
const utilityBelt = require("ddp-underscore-patched"); // Renamed for Type II, kept for structural similarity

// Define internal error types for the connection manager
const ConnectionErrorCatalog = {
  ConnectionLost: new Error("RemoteDataLink: Connection to DDP endpoint terminated unexpectedly"),
  NegotiationFailed: new Error("RemoteDataLink: DDP version negotiation failed")
};

/**
 * Manages a DDP connection, including re-connection logic,
 * message parsing, and local data store synchronization.
 */
const RemoteDataLink = function(configuration) {
  // Ensure 'new' keyword is used
  if (!(this instanceof RemoteDataLink)) {
    return new RemoteDataLink(configuration);
  }

  const instanceScope = this;

  // Initialize configuration with a fallback to an empty object
  const connectionConfig = configuration || {};

  // --- Backwards Compatibility Layer ---
  // Migrate old configuration keys to new, standardized ones
  if (connectionConfig.hasOwnProperty("use_ssl")) {
    connectionConfig.ssl = connectionConfig.use_ssl;
  }
  if (connectionConfig.hasOwnProperty("auto_reconnect")) {
    connectionConfig.automaticReconnect = connectionConfig.auto_reconnect;
  }
  if (connectionConfig.hasOwnProperty("auto_reconnect_timer")) {
    connectionConfig.reconnectionDelayMs = connectionConfig.auto_reconnect_timer;
  }
  if (connectionConfig.hasOwnProperty("maintain_collections")) {
    connectionConfig.manageLocalCollections = connectionConfig.maintain_collections;
  }
  if (connectionConfig.hasOwnProperty("ddp_version")) {
    connectionConfig.protocolVersion = connectionConfig.ddp_version;
  }
  // --- End Backwards Compatibility ---

  // --- Default Configuration Settings ---
  instanceScope.serverHost = connectionConfig.host || "localhost";
  instanceScope.serverPort = connectionConfig.port || 3000;
  instanceScope.socketPath = connectionConfig.path;
  instanceScope.useSecureTransport = connectionConfig.ssl || (instanceScope.serverPort === 443);
  instanceScope.transportSecurityOptions = connectionConfig.tlsOpts || {};
  instanceScope.enableSockJsFallback = connectionConfig.useSockJs || false;

  // Connection management parameters
  instanceScope.automaticReconnect = connectionConfig.hasOwnProperty("automaticReconnect") ? connectionConfig.automaticReconnect : true;
  instanceScope.reconnectionDelayMs = connectionConfig.hasOwnProperty("reconnectionDelayMs") ? connectionConfig.reconnectionDelayMs : 500;
  instanceScope.connectionUrl = connectionConfig.url;

  // DDP protocol versioning
  instanceScope.protocolVersion = connectionConfig.hasOwnProperty("protocolVersion") ? connectionConfig.protocolVersion : "1";
  instanceScope.allowedProtocolVersions = ["1", "pre2", "pre1"];

  // Expose the EnhancedJSON utility for client-side type extensions
  instanceScope.ExtendedJSONParser = EnhancedJSON;

  // Local data store for managed collections
  instanceScope.managedLocalCollections = {}; // Renamed from 'collections'
  if (connectionConfig.hasOwnProperty("manageLocalCollections") ? connectionConfig.manageLocalCollections : true) {
    instanceScope.manageLocalCollections = true; // Ensure this flag is explicitly set
  } else {
    instanceScope.manageLocalCollections = false;
  }


  // --- Internal State Tracking ---
  instanceScope._isEstablishingConnection = false; // Renamed from _isConnecting
  instanceScope._isAttemptingReconnection = false; // Renamed from _isReconnecting
  instanceScope._connectionPermanentlyFailed = false; // New flag for unrecoverable errors
  instanceScope._isExplicitlyClosing = false; // Renamed from _isClosing
  instanceScope._sequenceCounter = 0; // Renamed from _nextId

  // Callbacks and handlers for DDP messages
  instanceScope._responseHandlers = {}; // Renamed from _callbacks for method/sub results
  instanceScope._updateNotificationHandlers = {}; // Renamed from _updatedCallbacks for method updates
  instanceScope._activeMethodCalls = {}; // Renamed from _pendingMethods for tracking in-flight methods
  instanceScope._collectionObservers = {}; // Renamed from _observers for collection change notifications
};

// Expose error definitions
RemoteDataLink.ErrorDefinitions = ConnectionErrorCatalog;

/**
 * Inherits from EventEmitter to provide event-driven capabilities.
 */
utilityModule.inherits(RemoteDataLink, eventEmitterCore.EventEmitter);

/**
 * Sets up event listeners for the underlying transport socket.
 * @private
 */
RemoteDataLink.prototype._setupSocketListeners = function() {
  const contextRef = this; // Renamed 'self' to 'contextRef' for consistency

  // Handle successful socket opening
  contextRef.transportSocket.on("open", function() {
    // Immediately send the DDP 'connect' message upon socket establishment
    contextRef._dispatchMessage({
      msg: "connect",
      version: contextRef.protocolVersion,
      support: contextRef.allowedProtocolVersions
    });
  });

  // Handle socket errors
  contextRef.transportSocket.on("error", function(errObject) {
    // If an error occurs during initial connection, emit a 'connectionFailed' event
    if (contextRef._isEstablishingConnection) {
      contextRef.emit("connectionFailed", errObject.message || "Unknown transport error occurred during connection attempt.");
    }
    // Always emit a generic transport error
    contextRef.emit("transportError", errObject);
  });

  // Handle socket closure
  contextRef.transportSocket.on("close", function(socketEvent) {
    contextRef.emit("transportClosed", socketEvent.code, socketEvent.reason);
    contextRef._terminateActiveRequests(); // Clean up any pending method calls
    contextRef._initiateReconnectionAttempt(); // Attempt to recover if auto-reconnect is enabled
  });

  // Handle incoming messages from the server
  contextRef.transportSocket.on("message", function(socketEvent) {
    contextRef._processIncomingMessage(socketEvent.data);
    contextRef.emit("rawDataMessage", socketEvent.data); // Emit raw message for debugging/logging
  });
};

/**
 * Clears any active reconnection timer.
 * @private
 */
RemoteDataLink.prototype._resetReconnectionTimer = function() {
  const contextRef = this;
  if (contextRef.reconnectionTimerHandle) {
    clearTimeout(contextRef.reconnectionTimerHandle);
    contextRef.reconnectionTimerHandle = null;
  }
};

/**
 * Attempts to re-establish connection after a network error, if automatic reconnection is enabled.
 * @private
 */
RemoteDataLink.prototype._initiateReconnectionAttempt = function() {
  const contextRef = this;
  // Only attempt reconnection if enabled, not permanently failed, and not explicitly closing
  if (contextRef.automaticReconnect && !contextRef._connectionPermanentlyFailed && !contextRef._isExplicitlyClosing) {
    contextRef._resetReconnectionTimer();
    console.warn(`[RemoteDataLink] Connection lost. Attempting to reconnect in ${contextRef.reconnectionDelayMs}ms...`);
    contextRef.reconnectionTimerHandle = setTimeout(() => {
      contextRef.establishConnection(); // Attempt to connect again
    }, contextRef.reconnectionDelayMs);
    contextRef._isAttemptingReconnection = true; // Set reconnection flag
  } else if (!contextRef.automaticReconnect && !contextRef._isExplicitlyClosing) {
    console.log("[RemoteDataLink] Automatic reconnection is disabled. Connection will not be re-established.");
  }
};

///////////////////////////////////////////////////////////////////////////
// RAW, low level communication functions

/**
 * Sends a DDP message object to the server after EJSON serialization.
 * @param {Object} payloadObject The DDP message object to send.
 * @private
 */
RemoteDataLink.prototype._dispatchMessage = function(payloadObject) {
  if (!this.transportSocket || this.transportSocket.readyState !== SocketClientAdapter.OPEN) {
    console.warn("[RemoteDataLink] Attempted to send message while socket is not open:", payloadObject);
    // Optionally, queue messages here for sending once connection is re-established.
    return;
  }
  this.transportSocket.send(
    EnhancedJSON.stringify(payloadObject)
  );
};

/**
 * Handles an incoming raw message string from the server.
 * Parses it and dispatches it to the appropriate handler based on the 'msg' field.
 * @param {string} rawMessageData The raw message string received from the server.
 * @private
 */
RemoteDataLink.prototype._processIncomingMessage = function(rawMessageData) {
  const contextRef = this;

  let parsedMessage;
  try {
    parsedMessage = EnhancedJSON.parse(rawMessageData);
  } catch (e) {
    console.error("[RemoteDataLink] Failed to parse incoming message as EJSON:", rawMessageData, e);
    contextRef.emit("parsingError", rawMessageData, e);
    return;
  }

  // Early exit if no message type is specified
  if (!parsedMessage || !parsedMessage.msg) {
    console.warn("[RemoteDataLink] Received message without 'msg' field:", parsedMessage);
    return;
  }

  // --- Message Dispatch Map ---
  // This is a Type III change: replacing a long if/else if chain with a map for clarity and extensibility.
  const messageDispatchMap = {
    "failed": (msg) => {
      // DDP version negotiation failed, attempt to renegotiate or fail permanently
      if (contextRef.allowedProtocolVersions.includes(msg.version)) {
        console.log(`[RemoteDataLink] DDP version negotiation: Server requested ${msg.version}. Retrying connection with this version.`);
        contextRef.protocolVersion = msg.version;
        contextRef.establishConnection(); // Re-initiate connection with the new version
      } else {
        console.error(`[RemoteDataLink] DDP version negotiation failed. Server requested ${msg.version}, which is not supported.`);
        contextRef.automaticReconnect = false; // Disable auto-reconnect for this unrecoverable error
        contextRef._connectionPermanentlyFailed = true;
        contextRef.emit("connectionFailed", ConnectionErrorCatalog.NegotiationFailed.message);
      }
    },
    "connected": (msg) => {
      contextRef.currentSessionId = msg.session; // Renamed 'session'
      contextRef.emit("connectionReady"); // Renamed 'connected' event
      contextRef._isEstablishingConnection = false;
      contextRef._isAttemptingReconnection = false;
    },
    "result": (msg) => {
      const callbackFunction = contextRef._responseHandlers[msg.id];
      if (callbackFunction) {
        callbackFunction(msg.error, msg.result);
        delete contextRef._responseHandlers[msg.id];
      } else {
        console.warn(`[RemoteDataLink] Received result for unknown method ID: ${msg.id}`);
      }
    },
    "updated": (msg) => {
      utilityBelt.forEach(msg.methods, (methodIdentifier) => { // Renamed 'methods' to 'methodIds'
        const updateCallback = contextRef._updateNotificationHandlers[methodIdentifier];
        if (updateCallback) {
          updateCallback();
          delete contextRef._updateNotificationHandlers[methodIdentifier];
        } else {
          console.warn(`[RemoteDataLink] Received update for unknown method ID: ${methodIdentifier}`);
        }
      });
    },
    "nosub": (msg) => {
      const callbackFunction = contextRef._responseHandlers[msg.id];
      if (callbackFunction) {
        callbackFunction(msg.error);
        delete contextRef._responseHandlers[msg.id];
      } else {
        console.warn(`[RemoteDataLink] Received nosub for unknown subscription ID: ${msg.id}`);
      }
    },
    "added": (msg) => {
      if (contextRef.manageLocalCollections && msg.collection) {
        const collectionName = msg.collection;
        const documentId = msg.id;

        contextRef.managedLocalCollections[collectionName] = contextRef.managedLocalCollections[collectionName] || {};
        contextRef.managedLocalCollections[collectionName][documentId] = contextRef.managedLocalCollections[collectionName][documentId] || {};

        const documentRef = contextRef.managedLocalCollections[collectionName][documentId];
        documentRef._id = documentId; // Ensure _id is set

        if (msg.fields) {
          Object.assign(documentRef, msg.fields); // More concise way to assign fields
        }

        // Notify observers if any
        if (contextRef._collectionObservers[collectionName]) {
          utilityBelt.forEach(contextRef._collectionObservers[collectionName], (observerInstance) => {
            if (typeof observerInstance.added === 'function') {
              observerInstance.added(documentId);
            }
          });
        }
      }
    },
    "removed": (msg) => {
      if (contextRef.manageLocalCollections && msg.collection) {
        const collectionName = msg.collection;
        const documentId = msg.id;

        // Guard: check if collection and document exist
        if (!contextRef.managedLocalCollections[collectionName] || !contextRef.managedLocalCollections[collectionName][documentId]) {
          console.warn(`[RemoteDataLink] Attempted to remove non-existent document ${documentId} from collection ${collectionName}.`);
          return;
        }

        const oldDocumentValue = contextRef.managedLocalCollections[collectionName][documentId];
        delete contextRef.managedLocalCollections[collectionName][documentId];

        // Notify observers
        if (contextRef._collectionObservers[collectionName]) {
          utilityBelt.forEach(contextRef._collectionObservers[collectionName], (observerInstance) => {
            if (typeof observerInstance.removed === 'function') {
              observerInstance.removed(documentId, oldDocumentValue);
            }
          });
        }
      }
    },
    "changed": (msg) => {
      if (contextRef.manageLocalCollections && msg.collection) {
        const collectionName = msg.collection;
        const documentId = msg.id;

        // Guard: check if collection and document exist
        if (!contextRef.managedLocalCollections[collectionName] || !contextRef.managedLocalCollections[collectionName][documentId]) {
          console.warn(`[RemoteDataLink] Attempted to change non-existent document ${documentId} in collection ${collectionName}.`);
          return;
        }

        const currentDocument = contextRef.managedLocalCollections[collectionName][documentId];
        const oldFieldValues = {};
        const newFieldValues = {};
        const clearedFieldKeys = msg.cleared || [];

        // Apply field updates
        if (msg.fields) {
          utilityBelt.forEach(msg.fields, (value, key) => {
            oldFieldValues[key] = currentDocument[key]; // Store old value
            newFieldValues[key] = value; // Store new value
            currentDocument[key] = value; // Update document
          });
        }

        // Clear fields
        if (clearedFieldKeys.length > 0) {
          clearedFieldKeys.forEach((key) => {
            if (currentDocument.hasOwnProperty(key)) {
              oldFieldValues[key] = currentDocument[key]; // Store old value before deleting
              delete currentDocument[key];
            }
          });
        }

        // Notify observers
        if (contextRef._collectionObservers[collectionName]) {
          utilityBelt.forEach(contextRef._collectionObservers[collectionName], (observerInstance) => {
            if (typeof observerInstance.changed === 'function') {
              observerInstance.changed(documentId, oldFieldValues, clearedFieldKeys, newFieldValues);
            }
          });
        }
      }
    },
    "ready": (msg) => {
      utilityBelt.forEach(msg.subs, (subscriptionIdentifier) => { // Renamed 'subs'
        const callbackFn = contextRef._responseHandlers[subscriptionIdentifier];
        if (callbackFn) {
          callbackFn();
          delete contextRef._responseHandlers[subscriptionIdentifier];
        } else {
          console.warn(`[RemoteDataLink] Received ready for unknown subscription ID: ${subscriptionIdentifier}`);
        }
      });
    },
    "ping": (msg) => {
      const pongMessage = msg.id ? { msg: "pong", id: msg.id } : { msg: "pong" };
      contextRef._dispatchMessage(pongMessage);
    },
    // Adding a default handler for unknown messages
    "default": (msg) => {
      console.log("[RemoteDataLink] Received unhandled DDP message type:", msg.msg, msg);
    }
  };

  // Execute the appropriate handler
  const handler = messageDispatchMap[parsedMessage.msg] || messageDispatchMap["default"];
  handler(parsedMessage);
};


/**
 * Generates the next sequential identifier for DDP messages.
 * @returns {string} The next identifier as a string.
 * @private
 */
RemoteDataLink.prototype._generateNextSequenceIdentifier = function() {
  return (this._sequenceCounter += 1).toString();
};

/**
 * Registers a collection observer to receive change notifications.
 * @param {Object} dataObserver The observer object, must have 'name' and '_id' properties.
 * @private
 */
RemoteDataLink.prototype._registerCollectionObserver = function(dataObserver) {
  if (!dataObserver || !dataObserver.name || !dataObserver._id) {
    console.error("[RemoteDataLink] Invalid observer object provided for registration.", dataObserver);
    return;
  }
  const collectionIdentifier = dataObserver.name;
  this._collectionObservers[collectionIdentifier] = this._collectionObservers[collectionIdentifier] || {};
  this._collectionObservers[collectionIdentifier][dataObserver._id] = dataObserver;
};

/**
 * Deregisters a collection observer.
 * @param {Object} dataObserver The observer object to remove.
 * @private
 */
RemoteDataLink.prototype._deregisterCollectionObserver = function(dataObserver) {
  if (!dataObserver || !dataObserver.name || !dataObserver._id) {
    console.warn("[RemoteDataLink] Attempted to deregister an invalid observer object.", dataObserver);
    return;
  }
  const collectionIdentifier = dataObserver.name;
  if (!this._collectionObservers[collectionIdentifier]) {
    return;
  }
  delete this._collectionObservers[collectionIdentifier][dataObserver._id];
  // Clean up empty observer lists
  if (Object.keys(this._collectionObservers[collectionIdentifier]).length === 0) {
    delete this._collectionObservers[collectionIdentifier];
  }
};

//////////////////////////////////////////////////////////////////////////
// USER-FACING API functions

/**
 * Initiates the connection to the DDP server.
 * @param {Function} [onConnectionReady] Callback function invoked when the 'connected' message is received.
 *                                       Receives (error, isReconnecting).
 */
RemoteDataLink.prototype.establishConnection = function(onConnectionReady) {
  const ctx = this;

  // Prevent multiple connection attempts if one is already in progress
  if (ctx._isEstablishingConnection && !ctx._isAttemptingReconnection) {
    console.log("[RemoteDataLink] Connection establishment already in progress.");
    return;
  }

  ctx._isEstablishingConnection = true;
  ctx._connectionPermanentlyFailed = false;
  ctx._isExplicitlyClosing = false;

  if (typeof onConnectionReady === 'function') {
    // Use `once` to ensure these listeners are removed after the first event
    ctx.once("connectionReady", (/* no args from this event */) => {
      ctx._resetReconnectionTimer(); // Clear any pending reconnection timers
      onConnectionReady(undefined, ctx._isAttemptingReconnection);
      ctx._isEstablishingConnection = false;
      ctx._isAttemptingRereconnection = false;
    });
    ctx.once("connectionFailed", (errorReason) => {
      ctx._isEstablishingConnection = false;
      ctx._connectionPermanentlyFailed = true;
      onConnectionReady(errorReason, ctx._isAttemptingReconnection);
    });
  }

  // Determine connection method: SockJS fallback or direct WebSocket
  if (ctx.enableSockJsFallback) {
    ctx._initiateSockJsFallback();
  } else {
    const endpointUrl = ctx._composeWebSocketEndpoint();
    ctx._initializeWebSocketTransport(endpointUrl);
  }
};

/**
 * Terminates all pending method calls, invoking their callbacks with a disconnected error.
 * @private
 */
RemoteDataLink.prototype._terminateActiveRequests = function() {
  const ctx = this;
  // Create a copy of keys to iterate over, as callbacks might delete from the original map
  const activeRequestIdentifiers = Object.keys(ctx._activeMethodCalls);
  ctx._activeMethodCalls = {}; // Clear the map

  activeRequestIdentifiers.forEach((requestId) => {
    // Notify method result callbacks
    if (ctx._responseHandlers[requestId]) {
      ctx._responseHandlers[requestId](RemoteDataLink.ErrorDefinitions.ConnectionLost);
      delete ctx._responseHandlers[requestId];
    }
    // Notify method update callbacks
    if (ctx._updateNotificationHandlers[requestId]) {
      ctx._updateNotificationHandlers[requestId](); // Updated callbacks typically don't receive errors directly
      delete ctx._updateNotificationHandlers[requestId];
    }
  });
};

/**
 * Attempts to establish connection using SockJS protocol if enabled.
 * This involves an initial HTTP request to discover the SockJS endpoint.
 * @private
 */
RemoteDataLink.prototype._initiateSockJsFallback = function() {
  const ctx = this;

  const scheme = ctx.useSecureTransport ? "https://" : "http://";
  const randomToken = Math.random().toString(36).substring(2, 15); // Generate a random string for cache busting if needed

  // Construct the SockJS info URL
  const infoPath = pathConcatenator("/", ctx.socketPath || "", "sockjs/info");
  const infoUrl = `${scheme}${ctx.serverHost}:${ctx.serverPort}${infoPath}?${randomToken}`; // Added random token

  const httpOptions = {
    url: infoUrl,
    agentOptions: ctx.transportSecurityOptions,
    timeout: 5000 // Add a timeout for the HTTP request
  };

  httpRequestAgent.get(httpOptions, function(err, res, body) {
    if (err) {
      console.error("[RemoteDataLink] SockJS info request failed:", err.message);
      ctx._initiateReconnectionAttempt();
      return;
    }

    if (res.statusCode !== 200) {
      console.error(`[RemoteDataLink] SockJS info request returned status ${res.statusCode}. Falling back to direct WebSocket.`);
      const endpointUrl = ctx._composeWebSocketEndpoint();
      ctx._initializeWebSocketTransport(endpointUrl);
      return;
    }

    if (!body) {
      console.warn("[RemoteDataLink] SockJS info response was empty. Falling back to direct WebSocket.");
      const endpointUrl = ctx._composeWebSocketEndpoint();
      ctx._initializeWebSocketTransport(endpointUrl);
      return;
    }

    try {
      const sockJsInfo = JSON.parse(body);
      let websocketEndpoint;

      if (!sockJsInfo.base_url) {
        // No base_url means use the same host for pure WS
        websocketEndpoint = ctx._composeWebSocketEndpoint();
      } else if (sockJsInfo.base_url.startsWith("http")) {
        // Absolute base_url, replace http/https with ws/wss
        websocketEndpoint = sockJsInfo.base_url.replace(/^http/, "ws") + "/websocket";
      } else {
        // Relative base_url, append to current host
        websocketEndpoint = ctx._composeWebSocketEndpoint(sockJsInfo.base_url + "/websocket");
      }
      ctx._initializeWebSocketTransport(websocketEndpoint);

    } catch (parseError) {
      console.error("[RemoteDataLink] Failed to parse SockJS info response:", parseError, body);
      const endpointUrl = ctx._composeWebSocketEndpoint();
      ctx._initializeWebSocketTransport(endpointUrl);
    }
  });
};

/**
 * Constructs the full WebSocket endpoint URL based on configuration.
 * @param {string} [customPathSegment] An optional path segment to append, overriding the default.
 * @returns {string} The complete WebSocket URL.
 * @private
 */
RemoteDataLink.prototype._composeWebSocketEndpoint = function(customPathSegment) {
  const ctx = this;
  let finalUrl;
  const socketScheme = ctx.useSecureTransport ? "wss://" : "ws://";
  const effectivePath = customPathSegment || ctx.socketPath || "websocket";

  // If a full URL is provided and SockJS is not enabled, use it directly
  if (ctx.connectionUrl && !ctx.enableSockJsFallback) {
    finalUrl = ctx.connectionUrl;
  } else {
    // Construct URL from host, port, and path
    finalUrl = `${socketScheme}${ctx.serverHost}:${ctx.serverPort}`;
    // Ensure path starts with a slash
    finalUrl += (effectivePath.startsWith("/")) ? effectivePath : `/${effectivePath}`;
  }
  return finalUrl;
};

/**
 * Establishes the actual WebSocket connection using the provided URL.
 * @param {string} endpointUrl The full WebSocket URL to connect to.
 * @private
 */
RemoteDataLink.prototype._initializeWebSocketTransport = function(endpointUrl) {
  const ctx = this;
  console.log(`[RemoteDataLink] Connecting to DDP via WebSocket at: ${endpointUrl}`);
  ctx.transportSocket = new SocketClientAdapter.Client(endpointUrl, null, ctx.transportSecurityOptions);
  ctx._setupSocketListeners();
};

/**
 * Terminates the active DDP connection and cleans up event listeners.
 */
RemoteDataLink.prototype.terminateConnection = function() {
  const ctx = this;
  if (!ctx.transportSocket || ctx.transportSocket.readyState === SocketClientAdapter.CLOSED) {
    console.log("[RemoteDataLink] Connection is already closed or not established.");
    return;
  }

  ctx._isExplicitlyClosing = true;
  ctx._resetReconnectionTimer(); // Ensure no pending reconnects
  ctx.transportSocket.close();

  // Remove all connection-related listeners to prevent memory leaks or unwanted behavior
  ctx.off("connectionReady");
  ctx.off("connectionFailed");
  ctx.off("transportError");
  ctx.off("transportClosed");
  ctx.off("rawDataMessage");
  ctx.off("parsingError");

  console.log("[RemoteDataLink] Connection explicitly terminated.");
};

/**
 * Invokes a method on the DDP server.
 * @param {string} methodName The name of the method to call.
 * @param {Array} methodArguments An array of arguments for the method.
 * @param {Function} [completionCallback] Callback for method result (error, result).
 * @param {Function} [onUpdateNotification] Callback for when the method's data has been updated.
 */
RemoteDataLink.prototype.invokeMethod = function(methodName, methodArguments, completionCallback, onUpdateNotification) {
  const ctx = this;
  if (typeof methodName !== 'string' || !methodName.trim()) {
    console.error("[RemoteDataLink] Method name must be a non-empty string.");
    if (completionCallback) {
      completionCallback(new Error("Invalid method name provided."));
    }
    return;
  }

  const requestId = ctx._generateNextSequenceIdentifier();

  // Wrap the completion callback to ensure _activeMethodCalls is cleaned up
  ctx._responseHandlers[requestId] = function (err, res) {
    delete ctx._activeMethodCalls[requestId]; // Remove from pending list
    if (completionCallback) {
      completionCallback.apply(this, arguments);
    }
  };

  // Wrap the update notification callback
  ctx._updateNotificationHandlers[requestId] = function () {
    // Note: Updated callbacks usually don't delete from _activeMethodCalls directly,
    // as the result callback is the primary completion signal.
    if (onUpdateNotification) {
      onUpdateNotification.apply(this, arguments);
    }
  };

  ctx._activeMethodCalls[requestId] = true; // Mark as an active method call

  ctx._dispatchMessage({
    msg: "method",
    id: requestId,
    method: methodName,
    params: methodArguments
  });
};

/**
 * Invokes a method on the DDP server, providing a random seed for deterministic results.
 * @param {string} methodName The name of the method to call.
 * @param {Array} methodArguments An array of arguments for the method.
 * @param {string} randomSeed A random seed string.
 * @param {Function} [completionCallback] Callback for method result (error, result).
 * @param {Function} [onUpdateNotification] Callback for when the method's data has been updated.
 */
RemoteDataLink.prototype.invokeMethodWithSeed = function(methodName, methodArguments, randomSeed, completionCallback, onUpdateNotification) {
  const ctx = this;
  if (typeof methodName !== 'string' || !methodName.trim()) {
    console.error("[RemoteDataLink] Method name must be a non-empty string.");
    if (completionCallback) {
      completionCallback(new Error("Invalid method name provided."));
    }
    return;
  }
  if (typeof randomSeed !== 'string' || !randomSeed.trim()) {
    console.error("[RemoteDataLink] Random seed must be a non-empty string.");
    if (completionCallback) {
      completionCallback(new Error("Invalid random seed provided."));
    }
    return;
  }

  const requestId = ctx._generateNextSequenceIdentifier();

  if (completionCallback) {
    ctx._responseHandlers[requestId] = completionCallback;
  }

  if (onUpdateNotification) {
    ctx._updateNotificationHandlers[requestId] = onUpdateNotification;
  }

  ctx._dispatchMessage({
    msg: "method",
    id: requestId,
    method: methodName,
    randomSeed: randomSeed,
    params: methodArguments
  });
};

/**
 * Establishes a subscription to a publication on the DDP server.
 * @param {string} subscriptionName The name of the publication to subscribe to.
 * @param {Array} subscriptionParameters An array of arguments for the publication.
 * @param {Function} [onSubscriptionReady] Callback invoked when the subscription becomes ready (error).
 * @returns {string} The ID of the established subscription.
 */
RemoteDataLink.prototype.establishSubscription = function(subscriptionName, subscriptionParameters, onSubscriptionReady) {
  const ctx = this;
  if (typeof subscriptionName !== 'string' || !subscriptionName.trim()) {
    console.error("[RemoteDataLink] Subscription name must be a non-empty string.");
    if (onSubscriptionReady) {
      onSubscriptionReady(new Error("Invalid subscription name provided."));
    }
    return null; // Return null on invalid input
  }

  const subscriptionIdentifier = ctx._generateNextSequenceIdentifier();

  if (onSubscriptionReady) {
    ctx._responseHandlers[subscriptionIdentifier] = onSubscriptionReady;
  }

  ctx._dispatchMessage({
    msg: "sub",
    id: subscriptionIdentifier,
    name: subscriptionName,
    params: subscriptionParameters
  });

  return subscriptionIdentifier;
};

/**
 * Cancels an active subscription on the DDP server.
 * @param {string} subscriptionIdentifier The ID of the subscription to cancel.
 */
RemoteDataLink.prototype.cancelSubscription = function(subscriptionIdentifier) {
  const ctx = this;
  if (typeof subscriptionIdentifier !== 'string' || !subscriptionIdentifier.trim()) {
    console.warn("[RemoteDataLink] Attempted to cancel subscription with an invalid ID.", subscriptionIdentifier);
    return;
  }

  ctx._dispatchMessage({
    msg: "unsub",
    id: subscriptionIdentifier
  });

  // Clean up any pending callbacks for this subscription immediately
  delete ctx._responseHandlers[subscriptionIdentifier];
};