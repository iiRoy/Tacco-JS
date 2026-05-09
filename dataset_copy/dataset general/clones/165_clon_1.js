/**
* Project: wampy.js
*
* https://github.com/KSDaemon/wampy.js
*
* A lightweight client-side implementation of
* WAMP (The WebSocket Application Messaging Protocol v2)
* http://wamp.ws
*
* Provides asynchronous RPC/PubSub over WebSocket.
*
* Copyright 2014 KSDaemon. Licensed under the MIT License.
* See @license text at http://www.opensource.org/licenses/mit-license.php
*
*/

// This is a module boilerplate for various environments.
// It supports browser globals, Browserify, and AMD.
; (typeof define === 'function' ? function(m) {
  define('Wampy', m);
} :
  typeof exports === 'object' ? function(m) {
    module.exports = m();
  } :
  function(m) {
    this.Wampy = m();
  }
)(function() {


  // WAMP Message Type Codes as per specification
  var WAMP_MSG_SPEC = {
    HELLO: 1,
    WELCOME: 2,
    ABORT: 3,
    CHALLENGE: 4,
    AUTHENTICATE: 5,
    GOODBYE: 6,
    HEARTBEAT: 7,
    ERROR: 8,

    PUBLISH: 16,
    PUBLISHED: 17,

    SUBSCRIBE: 32,
    SUBSCRIBED: 33,
    UNSUBSCRIBE: 34,
    UNSUBSCRIBED: 35,
    EVENT: 36,

    CALL: 48,
    CANCEL: 49,
    RESULT: 50,

    REGISTER: 64,
    REGISTERED: 65,
    UNREGISTER: 66,
    UNREGISTERED: 67,
    INVOCATION: 68,
    INTERRUPT: 69,
    YIELD: 70
  },


  // Detailed WAMP error messages for internal use
  WAMP_ERROR_MSG = {
    SUCCESS: {
      code: 0,
      description: 'Success!'
    },
    URI_ERROR: {
      code: 1,
      description: 'Topic URI doesn\'t meet requirements!'
    },
    NO_BROKER: {
      code: 2,
      description: 'Server doesn\'t provide broker role!'
    },
    NO_CALLBACK_SPEC: {
      code: 3,
      description: 'No required callback function specified!'
    },
    INVALID_PARAM: {
      code: 4,
      description: 'Invalid parameter(s) specified!'
    },
    NON_EXIST_SUBSCRIBE_CONFIRM: {
      code: 5,
      description: 'Received subscribe confirmation to non existent subscription!'
    },
    NON_EXIST_SUBSCRIBE_ERROR: {
      code: 6,
      description: 'Received error for non existent subscription!'
    },
    NON_EXIST_UNSUBSCRIBE: {
      code: 7,
      description: 'Trying to unsubscribe from non existent subscription!'
    },
    NON_EXIST_SUBSCRIBE_UNSUBSCRIBED: {
      code: 8,
      description: 'Received unsubscribe confirmation to non existent subscription!'
    },
    NON_EXIST_PUBLISH_ERROR: {
      code: 9,
      description: 'Received error for non existent publication!'
    },
    NON_EXIST_PUBLISH_PUBLISHED: {
      code: 10,
      description: 'Received publish confirmation for non existent publication!'
    },
    NON_EXIST_SUBSCRIBE_EVENT: {
      code: 11,
      description: 'Received event for non existent subscription!'
    },
    NO_DEALER: {
      code: 12,
      description: 'Server doesn\'t provide dealer role!'
    },
    NON_EXIST_CALL_RESULT: {
      code: 13,
      description: 'Received rpc result for non existent call!'
    },
    NON_EXIST_CALL_ERROR: {
      code: 14,
      description: 'Received rpc call error for non existent call!'
    },
    RPC_ALREADY_REGISTERED: {
      code: 15,
      description: 'RPC already registered!'
    },
    NON_EXIST_RPC_REG: {
      code: 16,
      description: 'Received rpc registration confirmation for non existent rpc!'
    },
    NON_EXIST_RPC_UNREG: {
      code: 17,
      description: 'Received rpc unregistration confirmation for non existent rpc!'
    },
    NON_EXIST_RPC_ERROR: {
      code: 18,
      description: 'Received error for non existent rpc!'
    },
    NON_EXIST_RPC_INVOCATION: {
      code: 19,
      description: 'Received invocation for non existent rpc!'
    },
    NON_EXIST_RPC_REQ_ID: {
      code: 20,
      description: 'No RPC calls in action with specified request ID!'
    },
    NO_REALM: {
      code: 21,
      description: 'No realm specified!'
    }
  },

  // Check if the current environment is Node.js
  isNode = (typeof process === 'object' && Object.prototype.toString.call(process) === '[object process]');


  // Helper function to get the WebSocket server URL in a browser environment
  function getServerUrlBrowser(url) {
    var scheme, port;

    if (!url) {
      scheme = window.location.protocol === 'https:' ? 'wss://' : 'ws://';
      port = window.location.port !== '' ? ':' + window.location.port : '';
      return scheme + window.location.hostname + port + '/ws';
    } else if (/^ws(s)?:\/\//.test(url)) { // ws scheme is specified
      return url;
    } else if (/:\d{1,5}/.test(url)) { // no scheme, but port is specified
      scheme = window.location.protocol === 'https:' ? 'wss://' : 'ws://';
      return scheme + url;
    } else if (url[0] === '/') { // just path on current server
      scheme = window.location.protocol === 'https:' ? 'wss://' : 'ws://';
      port = window.location.port !== '' ? ':' + window.location.port : '';
      return scheme + window.location.hostname + port + url;
    } else { // domain
      scheme = window.location.protocol === 'https:' ? 'wss://' : 'ws://';
      return scheme + url;
    }
  }

  // Helper function to get the WebSocket server URL in a Node.js environment
  function getServerUrlNode(url) {
    if (/^ws(s)?:\/\//.test(url)) { // ws scheme is specified
      return url;
    } else {
      return null;
    }
  }


  // Function to create and return a WebSocket instance
  function getWebSocket(url, protocols) {
    var parsedUrl = isNode ? getServerUrlNode(url) : getServerUrlBrowser(url),
      root = isNode ? global : window;

    if (!parsedUrl) {
      return null;
    }

    console.log('getWebSocket: parsedUrl: ', parsedUrl);

    if ('WebSocket' in root) {
      // Chrome, MSIE, newer Firefox support 'WebSocket'
      if (protocols) {
        return new WebSocket(parsedUrl, protocols);
      } else {
        return new WebSocket(parsedUrl);
      }
    } else if ('MozWebSocket' in root) {
      // Older versions of Firefox used 'MozWebSocket'
      if (protocols) {
        return new MozWebSocket(parsedUrl, protocols);
      } else {
        return new MozWebSocket(parsedUrl);
      }
    } else {
      // No WebSocket implementation found
      return null;
    }
  }

  /**
   * WAMP Client Class
   * @param {string} url - The WebSocket URL to connect to.
   * @param {Object} options - Configuration options for Wampy.
   */
  var Wampy = function(url, options) {

    /**
     * Wampy library version string.
     * @type {string}
     * @private
     */
    this.version = 'v1.0.6';

    /**
     * WebSocket URL for connection.
     * @type {string}
     * @private
     */
    this._url = (typeof arguments[0] === 'string') ? url : undefined;

    /**
     * Array of WebSocket protocols to use.
     * @type {Array}
     * @private
     */
    this._protocols = ['wamp.2.json'];

    /**
     * WAMP features supported by this Wampy client.
     * @type {object}
     * @private
     */
    this._wamp_features = {
      agent: 'Wampy.js ' + this.version,
      roles: {
        publisher: {
          features: {
            subscriber_blackwhite_listing: true,
            publisher_exclusion: true,
            publisher_identification: true
          }
        },
        subscriber: {},
        caller: {
          features: {
            callee_blackwhite_listing: true,
            caller_exclusion: true,
            caller_identification: true,
            progressive_call_results: true,
            call_canceling: true
          }
        },
        callee: {
          features: {
            caller_identification: true
          }
        }
      }
    };

    /**
     * Internal cache for managing object lifetime and state.
     * @type {Object}
     * @private
     */
    this._cache = {
      /**
       * WAMP Session ID.
       * @type {string}
       */
      sessionId: null,

      /**
       * Server WAMP roles and features discovered during connection.
       */
      server_wamp_features: {
        roles: {}
      },

      /**
       * Flag indicating if a goodbye message has been sent.
       * @type {boolean}
       */
      isSayingGoodbye: false,

      /**
       * Status of the last operation performed.
       */
      opStatus: {
        code: 0,
        description: 'Success!',
        reqId: 0
      },

      /**
       * Timer for managing reconnection attempts.
       * @type {null|number}
       */
      timer: null,

      /**
       * Counter for reconnection attempts.
       * @type {number}
       */
      reconnectingAttempts: 0
    };

    /**
     * The underlying WebSocket object.
     * @type {Object|null}
     * @private
     */
    this._ws = null;

    /**
     * Internal queue for WebSocket requests when disconnected.
     * @type {Array}
     * @private
     */
    this._wsQueue = [];

    /**
     * Internal queue for WAMP requests awaiting responses.
     * @type {object}
     * @private
     */
    this._requests = {};

    /**
     * Stored RPC (Remote Procedure Call) registrations.
     * @type {object}
     * @private
     */
    this._calls = {};

    /**
     * Stored Pub/Sub (Publish/Subscribe) subscriptions.
     * @type {object}
     * @private
     */
    this._subscriptions = {};

    /**
     * Stored Pub/Sub topics.
     * @type {Array}
     * @private
     */
    this._subsTopics = [];

    /**
     * Stored RPC Registrations (for callees).
     * @type {object}
     * @private
     */
    this._rpcRegs = {};

    /**
     * Stored RPC names (for callees).
     * @type {Array}
     * @private
     */
    this._rpcNames = [];

    /**
     * Configuration options hash-table.
     * @type {Object}
     * @private
     */
    this._options = {
      /**
       * Flag to enable or disable automatic reconnection.
       * @type {boolean}
       */
      autoReconnect: true,

      /**
       * Interval in milliseconds for reconnection attempts.
       * @type {number}
       */
      reconnectInterval: 2 * 1000,

      /**
       * Maximum number of reconnection retries.
       * @type {number}
       */
      maxRetries: 25,

      /**
       * Message serializer transport encoding ('json' or 'msgpack').
       * @type {string}
       */
      transportEncoding: 'json',

      /**
       * WAMP Realm to join.
       * @type {string|null}
       */
      realm: null,

      /**
       * Callback function to be executed on successful connection.
       * @type {function|null}
       */
      onConnect: null,

      /**
       * Callback function to be executed on WebSocket close.
       * @type {function|null}
       */
      onClose: null,

      /**
       * Callback function to be executed on WebSocket error.
       * @type {function|null}
       */
      onError: null,

      /**
       * Callback function to be executed on reconnection attempt.
       * @type {function|null}
       */
      onReconnect: null

    };

    // Process constructor arguments to set options
    switch (arguments.length) {
      case 1:
        if (typeof arguments[0] !== 'string') {
          this._options = this._merge(this._options, arguments[0]);
        }
        break;
      case 2:
        this._options = this._merge(this._options, options);
        break;
    }

    // Initialize WebSocket connection if realm is specified
    if (this._options.realm) {
      this._setWsProtocols();
      this._ws = getWebSocket(this._url, this._protocols);
      this._initWsCallbacks();
    } else {
      // If no realm is specified, set an error status
      this._cache.opStatus = WAMP_ERROR_MSG.NO_REALM;
    }
  };


  /* Internal utility methods for Wampy */

  /**
   * Generates a new unique request ID.
   * @returns {number} A unique request identifier.
   * @private
   */
  Wampy.prototype._getReqId = function() {
    var reqId;

    do {
      /*
       * Lua (and cjson) outputs big numbers in scientific notation :(
       * Need to find a way of fixing that.
       * For now, I think it's not a big problem to reduce range.
       */
      // reqId = Math.floor(Math.random() * 9007199254740992);
      reqId = Math.floor(Math.random() * 100000000000000);
    } while (reqId in this._requests); // Ensure uniqueness within current requests

    return reqId;
  };

  /**
   * Merges multiple argument objects into a single new object.
   * Properties from later objects overwrite properties from earlier ones.
   * @returns {Object} The merged object.
   * @private
   */
  Wampy.prototype._merge = function() {
    var obj = {},
      i,
      l = arguments.length,
      attr;

    for (i = 0; i < l; i++) {
      for (attr in arguments[i]) {
        obj[attr] = arguments[i][attr];
      }
    }

    return obj;
  };

  /**
   * Checks if a given value is an array.
   * @param {*} obj The value to check.
   * @returns {boolean} True if the value is an array, false otherwise.
   * @private
   */
  Wampy.prototype._isArray = function(obj) {
    return (!!obj) && (obj.constructor === Array);
  };

  /**
   * Checks if a given value is a plain object (not an array).
   * @param {*} obj The value to check.
   * @returns {boolean} True if the value is a plain object, false otherwise.
   * @private
   */
  Wampy.prototype._isObject = function(obj) {
    return obj === Object(obj) && Object.prototype.toString.call(obj) !== '[object Array]';
  };