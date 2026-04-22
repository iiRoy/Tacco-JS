// This file is a Type I clone of the original Atmosphere.js source code.
// All identifiers, variable names, function names, operators, and expressions are identical.
// Only whitespace and comments have been altered to demonstrate Type I cloning.

// Original Copyright and License Information:
/*
 * Copyright 2014 Jeanfrancois Arcand
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// Original Project Information:
/**
 * Atmosphere.js
 * Project URL: https://github.com/Atmosphere/atmosphere-javascript
 *
 * Dependencies:
 *   - jQuery 2.0.3 (http://jquery.com/)
 *
 * API Documentation:
 *   - https://github.com/Atmosphere/atmosphere/wiki/jQuery.atmosphere.js-API
 *
 * Inspiration:
 *   - Highly inspired by Portal by Donghwan Kim (http://flowersinthesand.github.io/portal/)
 */

( function ( factory ) {
  // Check for AMD (Asynchronous Module Definition) environment
  if ( typeof define === 'function' && define.amd ) {
    // If AMD is detected, define the module with 'jquery' as a dependency.
    define( ['jquery'], factory );
  } else {
    // If not AMD, assume browser globals (e.g., `window` object).
    // The factory function is called directly with the global jQuery object.
    factory( jQuery );
  }

  // The factory function is immediately invoked with the jQuery object.
} ( function ( jQuery ) {

  // Bind an event handler to the window's 'unload' event, scoped to 'atmosphere'.
  // This ensures that the unsubscribe logic runs when the page is being closed or navigated away from.
  jQuery( window ).bind( "unload.atmosphere", function () {
    // Call the unsubscribe method of the atmosphere plugin.
    jQuery.atmosphere.unsubscribe();
  } );

  // Bind an event handler for when the browser goes offline.
  jQuery( window ).bind( "offline", function () {
    // Create a clone of the current requests array to avoid issues with modification during iteration.
    var requestsClone = [].concat( jQuery.atmosphere.requests );

    // Iterate through each cloned request.
    for ( var i = 0; i < requestsClone.length; i++ ) {
      var rq = requestsClone[i];

      // Close the request.
      rq.close();

      // Clear the associated timeout for the request's ID.
      clearTimeout( rq.response.request.id );

      // If a heartbeat timer exists for this request, clear it.
      if ( rq.heartbeatTimer ) {
        clearTimeout( rq.heartbeatTimer );
      }
    }
  } );

  // Bind an event handler for when the browser comes online.
  jQuery( window ).bind( "online", function () {
    // Check if there are any active atmosphere requests.
    if ( jQuery.atmosphere.requests.length > 0 ) {
      // Iterate through each active request.
      for ( var i = 0; i < jQuery.atmosphere.requests.length; i++ ) {
        // Initialize the request.
        jQuery.atmosphere.requests[i].init();
        // Execute (start) the request.
        jQuery.atmosphere.requests[i].execute();
      }
    }
  } );

  // Prevent the ESC key from terminating the connection in Firefox.
  // This is a specific browser workaround.
  jQuery( window ).keypress( function ( e ) {
    // If the pressed key's keyCode is 27 (ESC key).
    if ( e.keyCode === 27 ) {
      // Prevent the default action associated with the ESC key.
      e.preventDefault();
    }
  } );

  /**
   * Parses raw HTTP header strings into a key-value object.
   *
   * @param {string} headerString - The raw header string to parse.
   * @returns {Object} An object where keys are header names and values are header values.
   * @private
   */
  var parseHeaders = function ( headerString ) {
    // Regular expression to match header lines: "Key: Value".
    // `mg` flags: `m` for multiline, `g` for global (find all matches).
    var match,
      rheaders = /^(.*?):[ \t]*([^\r\n]*)\r?$/mg,
      headers = {};

    // Loop through all matches found by the regex.
    while ( match = rheaders.exec( headerString ) ) {
      // Store the matched header key and value in the 'headers' object.
      // match[1] is the header name, match[2] is the header value.
      headers[match[1]] = match[2];
    }

    // Return the parsed headers object.
    return headers;
  };

  // Define the main jQuery.atmosphere plugin object.
  jQuery.atmosphere = {
    // Current version of the Atmosphere JavaScript client.
    version: "2.2.6-jquery",

    // A unique identifier, initialized to 0.
    uuid: 0,

    // Array to hold all active Atmosphere requests.
    requests: [],

    // Array to hold callback functions (purpose might be internal or specific).
    callbacks: [],

    // Default error handler function.
    onError: function ( response ) {
      // Placeholder for custom error handling logic.
    },

    // Default close handler function.
    onClose: function ( response ) {
      // Placeholder for custom close handling logic.
    },

    // Default open handler function.
    onOpen: function ( response ) {
      // Placeholder for custom open handling logic.
    },

    // Default message handler function.
    onMessage: function ( response ) {
      // Placeholder for custom message handling logic.
    },

    // Default reconnect handler function.
    onReconnect: function ( request, response ) {
      // Placeholder for custom reconnect handling logic.
    },

    // Default message published handler function.
    onMessagePublished: function ( response ) {
      // Placeholder for custom message published handling logic.
    },

    // Default transport failure handler function.
    onTransportFailure: function ( errorMessage, _request ) {
      // Placeholder for custom transport failure handling logic.
    },

    // Default local message handler function.
    onLocalMessage: function ( response ) {
      // Placeholder for custom local message handling logic.
    },

    // Default client timeout handler function.
    onClientTimeout: function ( request ) {
      // Placeholder for custom client timeout logic.
    },

    // Default failure to reconnect handler function.
    onFailureToReconnect: function ( request, response ) {
      // Placeholder for custom failure to reconnect handling logic.
    },

    /**
     * Creates an object based on an atmosphere subscription that exposes functions defined by the Websocket interface.
     * This acts as a compatibility layer or adapter.
     *
     * @class WebsocketApiAdapter
     * @param {Object} request - The request object to build the underlying subscription.
     * @constructor
     */
    WebsocketApiAdapter: function ( request ) {
      // Private variables for the adapter instance.
      var _socket,
        _adapter;

      /**
       * Overrides the onMessage callback in the given request.
       * This method is called when a message is received from the Atmosphere subscription.
       *
       * @method onMessage
       * @param {Object} e - The event object containing response data.
       */
      request.onMessage = function ( e ) {
        // Call the adapter's onmessage handler, formatting the data to mimic a standard WebSocket message event.
        _adapter.onmessage( {
          data: e.responseBody
        } );
      };

      /**
       * Overrides the onMessagePublished callback in the given request.
       * This method is called when a message sent by the client has been published by the server.
       *
       * @method onMessagePublished
       * @param {Object} e - The event object containing response data.
       */
      request.onMessagePublished = function ( e ) {
        // Call the adapter's onmessage handler, formatting the data.
        _adapter.onmessage( {
          data: e.responseBody
        } );
      };

      /**
       * Overrides the onOpen callback in the given request to proxy the event to the adapter.
       * This method is called when the connection to the Atmosphere server is successfully opened.
       *
       * @method onOpen
       * @param {Object} e - The event object.
       */
      request.onOpen = function ( e ) {
        // Call the adapter's onopen handler.
        _adapter.onopen( e );
      };

      // The adapter object that exposes WebSocket-like methods and event handlers.
      _adapter = {
        /**
         * Closes the underlying Atmosphere subscription.
         */
        close: function () {
          _socket.close();
        },

        /**
         * Sends data through the underlying Atmosphere subscription.
         *
         * @param {string} data - The data to send.
         */
        send: function ( data ) {
          _socket.push( data );
        },

        // Placeholder for the onmessage event handler.
        onmessage: function ( e ) {},

        // Placeholder for the onopen event handler.
        onopen: function ( e ) {},

        // Placeholder for the onclose event handler.
        onclose: function ( e ) {},

        // Placeholder for the onerror event handler.
        onerror: function ( e ) {

        }
      };

      // Create a new Atmosphere subscription using the provided request object.
      // This is where the actual connection is established.
      _socket = new $.atmosphere.subscribe( request );

      // Return the adapter object, which provides the WebSocket-like interface.
      return _adapter;
    },

    /**
     * Represents an Atmosphere client request.
     * This constructor sets up the configuration and internal state for an Atmosphere connection.
     *
     * @constructor
     * @param {Object} options - Configuration options for the request.
     */
    AtmosphereRequest: function ( options ) {

      /**
       * {Object} Private request parameters and their default values.
       * These can be overridden by the options passed to the constructor.
       *
       * @private
       */
      var _request = {
        timeout: 300000, // Default timeout in milliseconds (5 minutes).
        method: 'GET', // HTTP method for the request.
        headers: {}, // Custom HTTP headers.
        contentType: '', // Content-Type for POST requests.
        callback: null, // General callback function.
        url: '', // The URL to connect to.
        data: '', // Data to send with the request.
        suspend: true, // Whether to suspend the connection (long-polling/streaming).
        maxRequest: -1, // Maximum number of requests before reconnecting (-1 for unlimited).
        reconnect: true, // Whether to automatically reconnect on connection loss.
        maxStreamingLength: 10000000, // Max length of streaming data before reconnect.
        lastIndex: 0, // Last processed index in the response body.
        logLevel: 'info', // Logging level (debug, info, warn, error).
        requestCount: 0, // Counter for reconnection attempts.
        fallbackMethod: 'GET', // HTTP method for fallback transports.
        fallbackTransport: 'streaming', // Transport to use if primary fails.
        transport: 'long-polling', // Primary transport mechanism.
        webSocketImpl: null, // Custom WebSocket implementation.
        webSocketBinaryType: null, // WebSocket binary message type.
        dispatchUrl: null, // URL for dispatching messages.
        webSocketPathDelimiter: "@@", // Delimiter for WebSocket path.
        enableXDR: false, // Enable XDomainRequest for IE.
        rewriteURL: false, // Rewrite URL for some transports.
        attachHeadersAsQueryString: true, // Attach headers as query parameters.
        executeCallbackBeforeReconnect: false, // Execute callbacks before reconnecting.
        readyState: 0, // Ready state of the connection (0 = UNSENT).
        withCredentials: false, // Send cookies and HTTP authentication credentials.
        trackMessageLength: false, // Track message length for chunked responses.
        messageDelimiter: '|', // Delimiter for messages in a single response.
        connectTimeout: -1, // Timeout for initial connection.
        reconnectInterval: 0, // Interval between reconnect attempts.
        dropHeaders: true, // Drop headers on reconnect.
        uuid: 0, // Unique ID for the client.
        shared: false, // Whether the connection is shared across tabs/windows.
        readResponsesHeaders: false, // Read response headers for messages.
        maxReconnectOnClose: 5, // Max reconnect attempts when connection is closed.
        enableProtocol: true, // Enable Atmosphere Protocol.
        pollingInterval: 0, // Interval for polling transport.
        heartbeat: { // Heartbeat configuration.
          client: null, // Client-side heartbeat interval.
          server: null // Server-side heartbeat interval.
        },
        ackInterval: 0, // Acknowledgment interval.
        closeAsync: false, // Close connection asynchronously.
        reconnectOnServerError: true, // Reconnect on 5xx server errors.

        // Request-specific callback functions, can override global ones.
        onError: function ( response ) {},
        onClose: function ( response ) {},
        onOpen: function ( response ) {},
        onMessage: function ( response ) {},
        onReopen: function ( request, response ) {}, // Called when connection reopens.
        onReconnect: function ( request, response ) {},
        onMessagePublished: function ( response ) {},
        onTransportFailure: function ( reason, request ) {},
        onLocalMessage: function ( request ) {},
        onFailureToReconnect: function ( request, response ) {},
        onClientTimeout: function ( request ) {}
      };

      /**
       * {Object} Private request's last response object.
       * Contains information about the most recent server response.
       *
       * @private
       */
      var _response = {
        status: 200, // HTTP status code.
        reasonPhrase: "OK", // HTTP reason phrase.
        responseBody: '', // The raw response body.
        messages: [], // Array of parsed messages.
        headers: [], // Response headers.
        state: "messageReceived", // Current state of the response processing.
        transport: "polling", // The transport used for this response.
        error: null, // Any error associated with the response.
        request: null, // Reference back to the original request.
        partialMessage: "", // Stores partial messages in streaming scenarios.
        errorHandled: false, // Flag indicating if an error has been handled.
        closedByClientTimeout: false, // Flag if connection was closed due to client timeout.
        ffTryingReconnect: false // Firefox specific flag for reconnect attempts.
      };

      /**
       * {websocket} Reference to the opened WebSocket object.
       * Will be null if WebSocket is not the active transport.
       *
       * @private
       */
      var _websocket = null;

      /**
       * {SSE} Reference to the opened Server-Sent Events (SSE) object.
       * Will be null if SSE is not the active transport.
       *
       * @private
       */
      var _sse = null;

      /**
       * {XMLHttpRequest, ActiveXObject} Reference to the active AJAX request object.
       * Used for HTTP streaming or long-polling transports.
       *
       * @private
       */
      var _activeRequest = null;

      /**
       * {Object} Object used for streaming with Internet Explorer.
       * Specific to IE's XDomainRequest or other IE-specific streaming mechanisms.
       *
       * @private
       */
      var _ieStream = null;

      /**
       * {Object} Object used for JSONP transport.
       * This typically refers to the jQuery XHR object returned by `$.ajax({dataType: 'jsonp'})`.
       *
       * @private
       */
      var _jqxhr = null;

      /**
       * {boolean} Flag indicating whether the request has been subscribed or not.
       * `true` if subscribed, `false` otherwise.
       *
       * @private
       */
      var _subscribed = true;

      /**
       * {number} Counter for the number of test reconnections.
       * Used to track how many times a reconnect attempt has been made.
       *
       * @private
       */
      var _requestCount = 0;

      /**
       * The Heartbeat interval sent by the server.
       * @type {number}
       * @private
       */
      var _heartbeatInterval = 0;

      /**
       * The Heartbeat bytes (padding character) sent by the server.
       * @type {string}
       * @private
       */
      var _heartbeatPadding = ' ';

      /**
       * {boolean} Flag indicating if the request is currently being aborted.
       *
       * @private
       */
      var _abordingConnection = false;

      /**
       * A local "channel" of communication.
       * This might be used for inter-tab communication when `shared` is enabled.
       *
       * @private
       */
      var _localSocketF = null;

      /**
       * The storage service used (e.g., localStorage) for shared connections.
       *
       * @private
       */
      var _storageService;

      /**
       * Local communication service (e.g., localStorage-based).
       *
       * @private
       */
      var _localStorageService = null;

      /**
       * A Unique ID for this request instance.
       * Generated using `jQuery.now()` for a simple timestamp-based ID.
       *
       * @private
       */
      var guid = jQuery.now();

      /**
       * Timer used for tracing/debugging connection times.
       * @private
       */
      var _traceTimer;

      /**
       * Key used for sharing connection across different browser tabs/windows.
       * @private
       */
      var _sharingKey;

      // Automatic call to the _subscribe function when a new AtmosphereRequest is created.
      // This immediately starts the subscription process with the provided options.
      _subscribe( options );

      /**
       * Initializes the atmosphere request object.
       * Resets internal state variables.
       *
       * @private
       */
      function _init() {
        _subscribed = true; // Mark as subscribed.
        _abordingConnection = false; // Not aborting connection.
        _requestCount = 0; // Reset reconnection attempt counter.

        // Clear references to active transport objects.
        _websocket = null;
        _sse = null;
        _activeRequest = null;
        _ieStream = null;
      }

      /**
       * Re-initializes the atmosphere object.
       * Clears the current state and then re-initializes.
       *
       * @private
       */
      function _reinit() {
        _clearState(); // Assuming _clearState is defined elsewhere or implicitly (not in this snippet).
        _init(); // Call the initialization function.
      }

      /**
       * Returns true if the given logging level is equal to or above the configured log level.
       * This function determines whether a log message should be displayed based on the `_request.logLevel`.
       *
       * @param {string} level - The logging level to check (e.g., 'debug', 'info', 'warn', 'error').
       * @returns {boolean} True if logging is enabled for the given level, false otherwise.
       * @private
       */
      function _canLog( level ) {
        // Check for 'debug' level.
        if ( level == 'debug' ) {
          return _request.logLevel === 'debug';
        }
        // Check for 'info' level (includes 'debug').
        else if ( level == 'info' ) {
          return _request.logLevel === 'info' || _request.logLevel === 'debug';
        }
        // Check for 'warn' level (includes 'info' and 'debug').
        else if ( level == 'warn' ) {
          return _request.logLevel === 'warn' || _request.logLevel === 'info' || _request.logLevel === 'debug';
        }
        // Check for 'error' level (includes 'warn', 'info', and 'debug').
        else if ( level == 'error' ) {
          return _request.logLevel === 'error' || _request.logLevel === 'warn' || _request.logLevel === 'info' || _request.logLevel === 'debug';
        }
        // If the level is not recognized, or if no log level is set.
        else {
          return false;
        }
      }

      /**
       * Subscribes the request using the configured transport.
       * If a request is currently open, it will be closed before a new one is established.
       *
       * @param {Object} options - Request parameters to extend the default configuration.
       * @private
       */
      function _subscribe( options ) {
        _reinit(); // Re-initialize the request state.

        // Merge the provided options with the default request parameters.
        // `jQuery.extend` performs a shallow copy.
        _request = jQuery.extend( _request, options );

        // Ensure at least 1 request is allowed if `reconnect` is true.
        // `mrequest` seems to be a custom property to track max requests.
        _request.mrequest = _request.reconnect;
        // If reconnect is explicitly set to false, ensure it's still treated as true for internal logic,
        // but `mrequest` might govern actual reconnection behavior.
        if ( !_request.reconnect ) {
          _request.reconnect = true;
        }
      }

      /**
       * Checks if WebSocket transport is supported by the client.
       * This includes checking for a custom `webSocketImpl` or the native browser `WebSocket` / `MozWebSocket` objects.
       *
       * @returns {boolean} True if WebSocket is supported, false otherwise.
       * @private
       */
      function _supportWebsocket() {
        // Return true if a custom WebSocket implementation is provided,
        // or if the native `WebSocket` or `MozWebSocket` objects are available in the browser.
        return _request.webSocketImpl != null || window.WebSocket || window.MozWebSocket;
      }

      /**
       * Checks if Server-Sent Events (SSE) transport is supported by the client.
       * This function specifically checks for the `EventSource` object in the browser's `window` object.
       *
       * @returns {boolean} True if SSE is supported, false otherwise.
       * @private
       */
      function _supportSSE() {
        // Return true if the `EventSource` object is available in the global scope.
        return window.EventSource;
      }

      /**
       * Opens the request using the configured transport mechanism.
       * If the requested transport is 'websocket' but WebSocket cannot be opened,
       * the request will automatically attempt to reconnect using a fallback transport.
       *
       * @private
       */
      function _execute() {
        // Handle shared connections across multiple browser tabs/windows.
        if ( _request.shared ) {
          _localStorageService = _local( _request ); // Assuming _local() is a function that provides a localStorage service.
          if ( _localStorageService != null ) {
            if ( _canLog( 'debug' ) ) {
              jQuery.atmosphere.debug( "Storage service available. All communication will be local" );
            }

            // Attempt to open the local storage service.
            if ( _localStorageService.open( _request ) ) {
              // If successful, communication is handled locally.
              return; // Exit _execute, as the connection is local.
            }
          }

          if ( _canLog( 'debug' ) ) {
            jQuery.atmosphere.debug( "No Storage service available." );
          }
          // If local storage service was not available or failed to open,
          // reset it to null to indicate no local sharing.
          _localStorageService = null;
        }

        // --- Protocol Initialization ---

        // Determine if this is the very first message being sent by any Atmosphere client.
        // `jQuery.atmosphere.uuid` is a global counter or identifier.
        _request.firstMessage = jQuery.atmosphere.uuid == 0 ? true : false;
        _request.isOpen = false; // Mark the request as not yet open.
        _request.ctime = jQuery.now(); // Record the connection time.

        // Carry over any UUID that was set by the user or obtained from a previous connection.
        if ( _request.uuid === 0 ) {
          _request.uuid = jQuery.atmosphere.uuid;
        }
        _request.closedByClientTimeout = false; // Reset the client timeout flag.
      }
    }
  } );
} ) );