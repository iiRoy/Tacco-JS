"use strict"
/* This module provides a DDP client implementation for JavaScript environments.
 * It allows connecting to a Meteor server, calling methods, subscribing to publications,
 * and managing local collections. */

var  util     = require("util")
  , events   = require("events")
  , WebSocket = require("faye-websocket")
  , EJSON    = require("ddp-ejson")
  , request  = require('request')
  , pathJoin = require('path').join
  , _        = require("ddp-underscore-patched")
;


/*
 * DDPClient constructor function.
 * Initializes a new DDP client instance with specified options.
 *
 * @param {Object} opts Configuration options for the DDP client.
 */
var DDPClient = function( opts )
{
  var self = this; /* Store a reference to 'this' for use in closures. */

  opts = opts || {}; // Ensure opts is an object, even if not provided.

  // --- Backwards Compatibility for Old Option Names ---
  if ( "use_ssl" in opts )
  {
    opts.ssl = opts.use_ssl;
  }
  if ( "auto_reconnect" in opts )
  {
    opts.autoReconnect = opts.auto_reconnect;
  }
  if ( "auto_reconnect_timer" in opts )
  {
    opts.autoReconnectTimer = opts.auto_reconnect_timer;
  }
  if ( "maintain_collections" in opts )
  {
    opts.maintainCollections = opts.maintain_collections;
  }
  if ( "ddp_version" in opts )
  {
    opts.ddpVersion = opts.ddp_version;
  }
  // --- End Backwards Compatibility ---

  // --- Default Arguments and Configuration ---
  self.host                 = opts.host || "localhost";
  self.port                 = opts.port || 3000;
  self.path                 = opts.path;
  self.ssl                  = opts.ssl  || self.port === 443; /* Determine SSL usage. */
  self.tlsOpts              = opts.tlsOpts || {}; // Options for TLS/SSL connections.
  self.useSockJs            = opts.useSockJs || false; // Flag to use SockJS for connection.
  self.autoReconnect        = ( "autoReconnect" in opts ) ? opts.autoReconnect : true;
  self.autoReconnectTimer   = ( "autoReconnectTimer" in opts ) ? opts.autoReconnectTimer : 500;
  self.maintainCollections  = ( "maintainCollections" in opts ) ? opts.maintainCollections : true;
  self.url                  = opts.url; // Optional direct URL for WebSocket.

  // Support for multiple DDP protocol versions.
  self.ddpVersion           = ( "ddpVersion" in opts ) ? opts.ddpVersion : "1";
  self.supportedDdpVersions = ["1", "pre2", "pre1"];
  // --- End Default Arguments ---

  // Expose the EJSON object so users can extend it with custom types.
  self.EJSON = EJSON;

  // Initialize very simple collections storage (name -> { id -> document }).
  // This is only enabled if `maintainCollections` is true.
  if ( self.maintainCollections )
  {
    self.collections = {};
  }

  // --- Internal State Tracking ---
  self._isConnecting     = false;
  self._isReconnecting   = false;
  self._nextId           = 0; // Counter for generating unique message IDs.
  self._callbacks        = {}; // Stores callbacks for DDP methods and subscriptions.
  self._updatedCallbacks = {}; // Stores callbacks specifically for method `updated` messages.
  self._pendingMethods   = {}; // Tracks currently pending method calls.
  self._observers        = {}; // Stores observers for collection changes.
  // --- End Internal State Tracking ---
};


/*
 * Defines common DDP client error messages.
 */
DDPClient.ERRORS = {
  DISCONNECTED: new Error( "DDPClient: Disconnected from DDP server" )
};


/**
 * DDPClient inherits from Node.js EventEmitter, allowing it to emit and listen for events.
 */
util.inherits( DDPClient, events.EventEmitter );


/*
 * Sets up event handlers for the underlying WebSocket connection.
 * These handlers manage connection lifecycle and message processing.
 */
DDPClient.prototype._prepareHandlers = function()
{
  var self = this;

  // Handler for when the WebSocket connection is successfully opened.
  self.socket.on( "open", function()
  {
    // Immediately send a DDP 'connect' message to establish the DDP session.
    self._send({
      msg     : "connect",
      version : self.ddpVersion,
      support : self.supportedDdpVersions
    });
  });

  // Handler for WebSocket errors.
  self.socket.on( "error", function( error )
  {
    // If an error occurs during the initial connection attempt, emit a 'failed' event.
    if ( self._isConnecting )
    {
      self.emit( "failed", error.message );
    }

    // Always emit a 'socket-error' event for any socket-related errors.
    self.emit( "socket-error", error );
  });

  // Handler for when the WebSocket connection is closed.
  self.socket.on( "close", function( event )
  {
    self.emit( "socket-close", event.code, event.reason ); // Notify listeners about socket closure.
    self._endPendingMethodCalls(); // Clean up any pending method calls.
    self._recoverNetworkError();   // Attempt to reconnect if auto-reconnect is enabled.
  });

  // Handler for incoming WebSocket messages.
  self.socket.on( "message", function( event )
  {
    self._message( event.data ); // Process the DDP message data.
    self.emit( "message", event.data ); // Emit raw message data for debugging/logging.
  });
};

/*
 * Clears any active reconnect timeout, preventing multiple reconnect attempts.
 */
DDPClient.prototype._clearReconnectTimeout = function() {
  var self = this;
  if ( self.reconnectTimeout )
  {
    clearTimeout( self.reconnectTimeout );
    self.reconnectTimeout = null;
  }
};

/*
 * Handles network errors by attempting to reconnect if configured to do so.
 */
DDPClient.prototype._recoverNetworkError = function() {
  var self = this;
  /* Reconnect only if autoReconnect is true,
   * connection hasn't permanently failed, and
   * the client isn't explicitly closing. */
  if ( self.autoReconnect && ! self._connectionFailed && ! self._isClosing )
  {
    self._clearReconnectTimeout(); // Clear any previous reconnect timer.
    // Set a new timeout to attempt reconnection after the specified delay.
    self.reconnectTimeout = setTimeout( function() { self.connect(); }, self.autoReconnectTimer );
    self._isReconnecting = true; // Mark client as being in a reconnecting state.
  }
};

///////////////////////////////////////////////////////////////////////////
// RAW, low level functions for DDP communication

/*
 * Sends a DDP message over the WebSocket.
 * The message object is first serialized to EJSON.
 *
 * @param {Object} data The DDP message object to send.
 */
DDPClient.prototype._send = function( data )
{
  this.socket.send(
    EJSON.stringify( data ) // Convert JavaScript object to EJSON string.
  );
};

/*
 * Processes an incoming DDP message from the server.
 * This is the core message handling logic.
 *
 * @param {String} data The raw EJSON string received from the server.
 */
DDPClient.prototype._message = function( data )
{
  var self = this;

  data = EJSON.parse( data ); // Parse the EJSON string back into a JavaScript object.

  // TODO: 'addedBefore' -- not yet implemented in Meteor's standard DDP.
  // TODO: 'movedBefore' -- not yet implemented in Meteor's standard DDP.

  if ( ! data.msg )
  {
    return; // If no 'msg' field, it's not a standard DDP message, ignore.
  }
  else if ( data.msg === "failed" )
  {
    // Server failed to connect with the requested DDP version.
    if ( self.supportedDdpVersions.indexOf( data.version ) !== -1 )
    {
      // If the server suggests a supported version, switch to it and try again.
      this.ddpVersion = data.version;
      self.connect();
    }
    else
    {
      // Otherwise, we cannot negotiate a common DDP version.
      self.autoReconnect = false; // Disable auto-reconnect as it's a protocol mismatch.
      self.emit( "failed", "Cannot negotiate DDP version" );
    }
  }
  else if ( data.msg === "connected" )
  {
    // DDP session successfully established.
    self.session = data.session; // Store the session ID.
    self.emit( "connected" );    // Notify listeners.
  }
  // Handle method call results.
  else if ( data.msg === "result" )
  {
    var cb = self._callbacks[data.id]; // Retrieve the callback associated with this method ID.

    if ( cb )
    {
      cb( data.error, data.result ); // Execute the callback with error or result.
      delete self._callbacks[data.id]; // Remove the callback as it's been used.
    }
  }
  // Handle method `updated` messages.
  else if ( data.msg === "updated" )
  {
    _.each( data.methods, function ( methodId )
    {
      var cb = self._updatedCallbacks[methodId];
      if ( cb )
      {
        cb(); // Execute the 'updated' callback.
        delete self._updatedCallbacks[methodId]; // Remove it.
      }
    });
  }
  // Handle subscription 'nosub' (no subscription) messages.
  else if ( data.msg === "nosub" )
  {
    var cb = self._callbacks[data.id]; // Retrieve the callback for this subscription ID.

    if ( cb )
    {
      cb( data.error ); // Execute the callback with an error if present.
      delete self._callbacks[data.id]; // Remove the callback.
    }
  }
  // Handle 'added' message for collection documents.
  else if ( data.msg === "added" )
  {
    if ( self.maintainCollections && data.collection )
    {
      var name = data.collection, id = data.id;

      // Ensure the collection and document object exist.
      if ( ! self.collections[name] )     { self.collections[name] = {}; }
      if ( ! self.collections[name][id] ) { self.collections[name][id] = {}; }

      self.collections[name][id]._id = id; // Set the _id field.

      // Add all fields provided in the message.
      if ( data.fields )
      {
        _.each( data.fields, function( value, key )
        {
          self.collections[name][id][key] = value;
        });
      }

      // Notify any registered observers for this collection.
      if ( self._observers[name] )
      {
        _.each( self._observers[name], function( observer )
        {
          observer.added( id );
        });
      }
    }
  }
  // Handle 'removed' message for collection documents.
  else if ( data.msg === "removed" )
  {
    if ( self.maintainCollections && data.collection )
    {
      var name = data.collection, id = data.id;

      // If the document doesn't exist locally, there's nothing to remove.
      if ( ! self.collections[name][id] )
      {
        return;
      }

      var oldValue = self.collections[name][id]; // Store current value for observers.

      delete self.collections[name][id]; // Remove the document from the local collection.

      // Notify any registered observers.
      if ( self._observers[name] )
      {
        _.each( self._observers[name], function( observer )
        {
          observer.removed( id, oldValue );
        });
      }
    }
  }
  // Handle 'changed' message for collection documents.
  else if ( data.msg === "changed" )
  {
    if ( self.maintainCollections && data.collection )
    {
      var name = data.collection, id = data.id;

      // If collection or document doesn't exist, ignore the change.
      if ( ! self.collections[name] )     { return; }
      if ( ! self.collections[name][id] ) { return; }

      var oldFields     = {}, // To store old values of changed fields.
          clearedFields = data.cleared || [], // Fields that were cleared/deleted.
          newFields     = {}; // To store new values of changed fields.

      // Update existing fields with new values.
      if ( data.fields )
      {
        _.each( data.fields, function( value, key )
        {
            oldFields[key] = self.collections[name][id][key]; // Store old value.
            newFields[key] = value;                            // Store new value.
            self.collections[name][id][key] = value;           // Apply new value.
        });
      }

      // Remove fields specified in 'cleared'.
      if ( data.cleared )
      {
        _.each( data.cleared, function( fieldKey )
        {
            delete self.collections[name][id][fieldKey];
        });
      }

      // Notify observers of the change.
      if ( self._observers[name] )
      {
        _.each( self._observers[name], function( observer )
        {
          observer.changed( id, oldFields, clearedFields, newFields );
        });
      }
    }
  }
  // Handle 'ready' message for subscriptions.
  else if ( data.msg === "ready" )
  {
    _.each( data.subs, function( subscriptionId )
    {
      var cb = self._callbacks[subscriptionId];
      if ( cb )
      {
        cb(); // Execute the subscription ready callback.
        delete self._callbacks[subscriptionId]; // Remove the callback.
      }
    });
  }
  // Handle 'ping' message for heartbeat mechanism (especially for DDP pre2).
  else if ( data.msg === "ping" )
  {
    // Respond with a 'pong' message, including the ID if present in the 'ping'.
    self._send(
      _.has( data, "id" ) ? { msg : "pong", id : data.id } : { msg : "pong" }
    );
  }
};


/*
 * Generates a unique ID for DDP messages (methods, subscriptions).
 * Increments an internal counter and returns its string representation.
 *
 * @returns {String} A unique message ID.
 */
DDPClient.prototype._getNextId = function()
{
  return ( this._nextId += 1 ).toString();
};


/*
 * Registers an observer for a specific collection.
 * Observers are notified of 'added', 'removed', and 'changed' events.
 *
 * @param {Object} observer The observer object, which must have `name` and `_id` properties.
 */
DDPClient.prototype._addObserver = function( observer )
{
  // Initialize observer storage for the collection if it doesn't exist.
  if ( ! this._observers[observer.name] )
  {
    this._observers[observer.name] = {};
  }
  this._observers[observer.name][observer._id] = observer; // Store the observer.
};


/*
 * Unregisters an observer from a collection.
 *
 * @param {Object} observer The observer object to remove.
 */
DDPClient.prototype._removeObserver = function( observer )
{
  if ( ! this._observers[observer.name] ) { return; } // If no observers for this collection, do nothing.

  delete this._observers[observer.name][observer._id]; // Remove the specific observer.
};

//////////////////////////////////////////////////////////////////////////
// USER functions -- use these to control the client

/*
 * Establishes a connection to the DDP server.
 * If `autoReconnect` is true, this function will be called again on disconnect.
 *
 * @param {Function} [connected] Optional callback function.
 *   - `connected(error, isReconnecting)`:
 *     - `error`: An error object if connection failed, or undefined on success.
 *     - `isReconnecting`: Boolean, true if this connection attempt is a reconnect.
 */
DDPClient.prototype.connect = function( connected )
{
  var self = this;
  self._isConnecting     = true;  // Mark that a connection attempt is in progress.
  self._connectionFailed = false; // Reset connection failure flag.
  self._isClosing        = false; // Reset closing flag.

  if ( connected )
  {
    // Attach a one-time listener for the 'connected' event.
    self.addListener( "connected", function()
    {
      self._clearReconnectTimeout(); // Clear any reconnect timers on successful connection.

      connected( undefined, self._isReconnecting ); // Invoke the user's callback.
      self._isConnecting   = false; // Reset connecting state.
      self._isReconnecting = false; // Reset reconnecting state.
    });
    // Attach a one-time listener for the 'failed' event.
    self.addListener( "failed", function( error )
    {
      self._isConnecting     = false; // Reset connecting state.
      self._connectionFailed = true;  // Mark connection as failed.
      connected( error, self._isReconnecting ); // Invoke user's callback with error.
    });
  }

  // Determine connection method: SockJS or direct WebSocket.
  if ( self.useSockJs )
  {
    self._makeSockJSConnection();
  }
  else
  {
    var url = self._buildWsUrl(); // Build the WebSocket URL.
    self._makeWebSocketConnection( url );
  }
};

/*
 * Cleans up any pending method calls when the connection is lost.
 * All pending callbacks are invoked with a DISCONNECTED error.
 */
DDPClient.prototype._endPendingMethodCalls = function()
{
  var self = this;
  var ids = _.keys( self._pendingMethods ); // Get IDs of all pending methods.
  self._pendingMethods = {}; // Clear the pending methods tracker.

  ids.forEach( function ( id )
  {
    // If there's a primary callback, invoke it with a disconnected error.
    if ( self._callbacks[id] )
    {
      self._callbacks[id]( DDPClient.ERRORS.DISCONNECTED );
      delete self._callbacks[id];
    }

    // If there's an `updated` callback, invoke it (without error, as it's just a state change).
    if ( self._updatedCallbacks[id] )
    {
      self._updatedCallbacks[id]();
      delete self._updatedCallbacks[id];
    }
  });
};

/*
 * Initiates a SockJS connection by first making an HTTP info request.
 * This determines the actual WebSocket URL to use for SockJS.
 */
DDPClient.prototype._makeSockJSConnection = function()
{
  var self = this;

  // Build the URL for the SockJS info endpoint.
  var protocol    = self.ssl ? "https://" : "http://";
  var randomValue = "" + Math.ceil( Math.random() * 9999999 ); // A random number for cache busting.
  var path        = pathJoin( "/", self.path || "", "sockjs/info" );
  var url         = protocol + self.host + ":" + self.port + path;

  var requestOpts = { 'url': url, 'agentOptions': self.tlsOpts };

  // Make an HTTP GET request to the SockJS info endpoint.
  request.get( requestOpts, function( err, res, body )
  {
    if ( err )
    {
      self._recoverNetworkError(); // If HTTP request fails, attempt network recovery.
    }
    else if ( body )
    {
      var info = JSON.parse( body );
      if ( ! info.base_url )
      {
        // No base_url provided by SockJS info, fall back to pure WS handling.
        var wsUrl = self._buildWsUrl();
        self._makeWebSocketConnection( wsUrl );
      }
      else if ( info.base_url.indexOf( "http" ) === 0 )
      {
        // Base URL is for a different host, construct WS URL from it.
        var wsUrl = info.base_url + "/websocket";
        wsUrl = wsUrl.replace( /^http/, "ws" ); // Change http(s) to ws(s).
        self._makeWebSocketConnection( wsUrl );
      }
      else
      {
        // Base URL is relative to the same host.
        var wsPath = info.base_url + "/websocket";
        var wsUrl = self._buildWsUrl( wsPath );
        self._makeWebSocketConnection( wsUrl );
      }
    }
    else
    {
      // No body in response, unexpected. Fall back to pure WS handling.
      var wsUrl = self._buildWsUrl();
      self._makeWebSocketConnection( wsUrl );
    }
  });
};

/*
 * Constructs the full WebSocket URL based on client configuration.
 *
 * @param {String} [path] Optional custom path segment for the WebSocket URL.
 * @returns {String} The complete WebSocket URL.
 */
DDPClient.prototype._buildWsUrl = function( path )
{
  var self = this;
  var url;
  path = path || self.path || "websocket"; // Default WebSocket path.
  var protocol = self.ssl ? "wss://" : "ws://";

  if ( self.url && ! self.useSockJs )
  {
    // If a direct URL is provided and not using SockJS, use it directly.
    url = self.url;
  }
  else
  {
    // Construct URL from host, port, and path.
    url = protocol + self.host + ":" + self.port;
    url += ( path.indexOf( "/" ) === 0 ) ? path : "/" + path; // Ensure path starts with a slash.
  }
  return url;
};

/*
 * Establishes the actual WebSocket connection using faye-websocket.
 *
 * @param {String} url The WebSocket URL to connect to.
 */
DDPClient.prototype._makeWebSocketConnection = function( url )
{
  var self = this;
  self.socket = new WebSocket.Client( url, null, self.tlsOpts ); // Create WebSocket client.
  self._prepareHandlers(); // Set up event handlers for the new socket.
};

/*
 * Closes the DDP client connection.
 * Disables auto-reconnect and removes all event listeners.
 */
DDPClient.prototype.close = function()
{
  var self = this;
  self._isClosing = true; // Mark client as explicitly closing.
  self.socket.close();   // Close the underlying WebSocket connection.
  // Remove all listeners for 'connected' and 'failed' to prevent further callbacks.
  self.removeAllListeners( "connected" );
  self.removeAllListeners( "failed" );
};


/*
 * Calls a remote method on the DDP server.
 *
 * @param {String}   name            The name of the method to call.
 * @param {Array}    params          An array of arguments to pass to the method.
 * @param {Function} [callback]      Callback for the method result: `function(err, result)`.
 * @param {Function} [updatedCallback] Callback for when the method's `updated` message is received: `function()`.
 */
DDPClient.prototype.call = function( name, params, callback, updatedCallback )
{
  var self = this;
  var id   = self._getNextId(); // Get a unique ID for this method call.

  // Store the primary callback, wrapping it to clean up pending methods.
  self._callbacks[id] = function ()
  {
    delete self._pendingMethods[id]; // Remove from pending methods.

    if ( callback )
    {
      callback.apply( this, arguments ); // Execute the original callback.
    }
  };

  // Store the 'updated' callback, also wrapping for cleanup.
  self._updatedCallbacks[id] = function ()
  {
    delete self._pendingMethods[id]; // Remove from pending methods.

    if ( updatedCallback )
    {
      updatedCallback.apply( this, arguments ); // Execute the original updated callback.
    }
  };

  self._pendingMethods[id] = true; // Mark this method as pending.

  // Send the DDP 'method' message.
  self._send({
    msg    : "method",
    id     : id,
    method : name,
    params : params
  });
};


/*
 * Calls a remote method on the DDP server with a specific random seed.
 * This is typically used for methods that rely on client-side random number generation
 * for deterministic results (e.g., in optimistic UI updates).
 *
 * @param {String}   name          The name of the method to call.
 * @param {Array}    params        An array of arguments.
 * @param {String}   randomSeed    A client-generated random seed.
 * @param {Function} [callback]    Callback for the method result: `function(err, result)`.
 * @param {Function} [updatedCallback] Callback for when the method's `updated` message is received: `function()`.
 */
DDPClient.prototype.callWithRandomSeed = function( name, params, randomSeed, callback, updatedCallback )
{
  var self = this;
  var id   = self._getNextId();

  if ( callback )
  {
    self._callbacks[id] = callback;
  }

  if ( updatedCallback )
  {
    self._updatedCallbacks[id] = updatedCallback;
  }

  // Send the DDP 'method' message, including the random seed.
  self._send({
    msg        : "method",
    id         : id,
    method     : name,
    randomSeed : randomSeed,
    params     : params
  });
};

/*
 * Subscribes to a publication on the DDP server.
 *
 * @param {String}   name     The name of the publication.
 * @param {Array}    params   An array of arguments to pass to the publication.
 * @param {Function} [callback] Callback for when the subscription is ready or fails: `function(err)`.
 * @returns {String} The subscription ID.
 */
DDPClient.prototype.subscribe = function( name, params, callback )
{
  var self = this;
  var id   = self._getNextId();

  if ( callback )
  {
    self._callbacks[id] = callback;
  }

  // Send the DDP 'sub' message.
  self._send({
    msg    : "sub",
    id     : id,
    name   : name,
    params : params
  });

  return id; // Return the subscription ID for potential unsubscription later.
};

/*
 * Unsubscribes from a publication.
 *
 * @param {String} id The ID of the subscription to unsubscribe from.
 */
DDPClient.prototype.unsubscribe = function( id )
{
  var self = this;

  // Send the DDP 'unsub' message.
  self._send({
    msg : "unsub",
    id  : id
  });
};