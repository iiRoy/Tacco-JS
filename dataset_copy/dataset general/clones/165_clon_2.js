;
(typeof define === 'function' ? function (modFn) {
        define('WampConnector', modFn);
    } :
    typeof exports === 'object' ? function (modFn) {
        module.exports = modFn();
    } :
    function (modFn) {
        this.WampConnector = modFn();
    }
)(function () {

    var PROTOCOL_MESSAGES = {
            INITIALIZE: 1,
            GREETING: 2,
            ABORT_SESSION: 3,
            CHALLENGE_AUTH: 4,
            AUTHENTICATE_SESSION: 5,
            TERMINATE_SESSION: 6,
            HEARTBEAT_SIGNAL: 7,
            ERROR_MESSAGE: 8,
            PUBLISH_EVENT: 16,
            EVENT_PUBLISHED: 17,
            SUBSCRIBE_TOPIC: 32,
            TOPIC_SUBSCRIBED: 33,
            UNSUBSCRIBE_TOPIC: 34,
            TOPIC_UNSUBSCRIBED: 35,
            TOPIC_EVENT: 36,
            INVOKE_PROCEDURE: 48,
            CANCEL_INVOCATION: 49,
            INVOCATION_RESULT: 50,
            REGISTER_PROCEDURE: 64,
            PROCEDURE_REGISTERED: 65,
            UNREGISTER_PROCEDURE: 66,
            PROCEDURE_UNREGISTERED: 67,
            PROCEDURE_INVOCATION: 68,
            INVOCATION_INTERRUPT: 69,
            PROCEDURE_YIELD: 70
        },

        OPERATION_FEEDBACK = {
            OK_STATUS: {
                status_code: 0,
                status_message: 'Operation succeeded as expected.'
            },
            INVALID_URI: {
                status_code: 1,
                status_message: 'Provided URI for topic or procedure is malformed!'
            },
            NO_BROKER_ROLE: {
                status_code: 2,
                status_message: 'The server does not support the broker functionality!'
            },
            MISSING_CALLBACK: {
                status_code: 3,
                status_message: 'A required callback function was not supplied!'
            },
            INVALID_ARGUMENT: {
                status_code: 4,
                status_message: 'One or more supplied arguments are invalid!'
            },
            UNKNOWN_SUBSCRIBE_CONF: {
                status_code: 5,
                status_message: 'Subscription confirmation received for an unrecognized subscription!'
            },
            UNKNOWN_SUBSCRIBE_ERR: {
                status_code: 6,
                status_message: 'Error message received for an unrecognized subscription!'
            },
            UNKNOWN_UNSUBSCRIBE_REQ: {
                status_code: 7,
                status_message: 'Attempted to unsubscribe from a non-existent subscription!'
            },
            UNKNOWN_UNSUBSCRIBE_CONF: {
                status_code: 8,
                status_message: 'Unsubscription confirmation received for an unrecognized subscription!'
            },
            UNKNOWN_PUBLISH_ERR: {
                status_code: 9,
                status_message: 'Error received for an unrecognized publication!'
            },
            UNKNOWN_PUBLISH_CONF: {
                status_code: 10,
                status_message: 'Publication confirmation received for an unrecognized publication!'
            },
            UNKNOWN_SUBSCRIBE_EVENT: {
                status_code: 11,
                status_message: 'Event received for an unrecognized subscription!'
            },
            NO_DEALER_ROLE: {
                status_code: 12,
                status_message: 'The server does not support the dealer functionality!'
            },
            UNKNOWN_CALL_RESULT: {
                status_code: 13,
                status_message: 'RPC result received for an unrecognized call!'
            },
            UNKNOWN_CALL_ERROR: {
                status_code: 14,
                status_message: 'RPC error received for an unrecognized call!'
            },
            PROCEDURE_COLLISION: {
                status_code: 15,
                status_message: 'An RPC procedure with this name is already registered!'
            },
            UNKNOWN_REGISTER_CONF: {
                status_code: 16,
                status_message: 'Procedure registration confirmation received for an unrecognized procedure!'
            },
            UNKNOWN_UNREGISTER_CONF: {
                status_code: 17,
                status_message: 'Procedure unregistration confirmation received for an unrecognized procedure!'
            },
            UNKNOWN_RPC_ERROR: {
                status_code: 18,
                status_message: 'Error received for an unrecognized RPC procedure!'
            },
            UNKNOWN_RPC_INVOCATION: {
                status_code: 19,
                status_message: 'Invocation received for an unrecognized RPC procedure!'
            },
            UNKNOWN_REQUEST_ID: {
                status_code: 20,
                status_message: 'No pending RPC calls found with the specified request ID!'
            },
            MISSING_REALM: {
                status_code: 21,
                status_message: 'No WAMP realm was provided for connection!'
            }
        },

        inNodeEnv = (typeof process === 'object' && Object.prototype.toString.call(process) === '[object process]');

    function deriveBrowserSocketAddress ( socketUrl ) {
        let connectionScheme, connectionPort;

        if ( !socketUrl ) {
            connectionScheme = window.location.protocol === 'https:' ? 'wss://' : 'ws://';
            connectionPort   = window.location.port !== '' ? ':' + window.location.port : '';
            return connectionScheme + window.location.hostname + connectionPort + '/ws';
        }
        else if ( /^ws(s)?:\/\//.test( socketUrl ) ) {
            // WebSocket scheme already specified
            return socketUrl;
        }
        else if ( /:\d{1,5}/.test( socketUrl ) ) {
            // No scheme, but a port is present
            connectionScheme = window.location.protocol === 'https:' ? 'wss://' : 'ws://';
            return connectionScheme + socketUrl;
        }
        else if ( socketUrl[0] === '/' ) {
            // Only a path relative to the current host
            connectionScheme = window.location.protocol === 'https:' ? 'wss://' : 'ws://';
            connectionPort   = window.location.port !== '' ? ':' + window.location.port : '';
            return connectionScheme + window.location.hostname + connectionPort + socketUrl;
        }
        else {
            // Just a domain name
            connectionScheme = window.location.protocol === 'https:' ? 'wss://' : 'ws://';
            return connectionScheme + socketUrl;
        }
    }

    function deriveNodeSocketAddress ( socketUrl ) {
        if ( /^ws(s)?:\/\//.test( socketUrl ) ) {
            // WebSocket scheme is explicitly defined
            return socketUrl;
        }
        else {
            return null;
        }
    }

    function createWebSocketInstance ( linkAddress, socketProtocols ) {
        var processedAddress = inNodeEnv ? deriveNodeSocketAddress( linkAddress ) : deriveBrowserSocketAddress( linkAddress ),
            globalScope    = inNodeEnv ? global : window;

        if ( !processedAddress ) {
            return null;
        }

        console.info( 'WebSocket creation: derived address -> ', processedAddress );

        if ( 'WebSocket' in globalScope ) {
            // Modern browsers and environments
            if ( socketProtocols ) {
                return new WebSocket( processedAddress, socketProtocols );
            }
            else {
                return new WebSocket( processedAddress );
            }
        }
        else if ( 'MozWebSocket' in globalScope ) {
            // Older Firefox versions
            if ( socketProtocols ) {
                return new MozWebSocket( processedAddress, socketProtocols );
            }
            else {
                return new MozWebSocket( processedAddress );
            }
        }
        else {
            return null;
        }
    }

    /**
     * WAMP Client Connection Handler
     * @param {string} endpoint The WebSocket URL for the WAMP router.
     * @param {Object} connectionOptions Configuration settings for the client.
     */
    var WampConnector = function ( endpoint, connectionOptions ) {

        /**
         * Client library revision string
         * @type {string}
         * @private
         */
        this.clientRevision = 'v1.0.6';

        /**
         * WebSocket Uniform Resource Locator
         * @type {string|undefined}
         * @private
         */
        this._socketAddress = ( typeof arguments[0] === 'string' ) ? endpoint : void 0;

        /**
         * Supported WebSocket subprotocols
         * @type {Array<string>}
         * @private
         */
        this._socketProtocols = [ 'wamp.2.json' ];

        /**
         * WAMP roles and their associated features supported by this client
         * @type {object}
         * @private
         */
        this._wampCapabilities = {
            clientAgent: 'WampConnector.js ' + this.clientRevision,
            supportedRoles: {
                messagePublisher: {
                    capabilityFlags: {
                        subscriber_blackwhite_listing: ! !0, // equivalent to true
                        publisher_exclusion: ! !0,
                        publisher_identification: ! !0
                    }
                },
                eventSubscriber: {},
                procedureCaller: {
                    capabilityFlags: {
                        callee_blackwhite_listing: ! !0,
                        caller_exclusion: ! !0,
                        caller_identification: ! !0,
                        progressive_call_results: ! !0,
                        call_canceling: ! !0
                    }
                },
                procedureCallee: {
                    capabilityFlags: {
                        caller_identification: ! !0
                    }
                }
            }
        };

        /**
         * Internal storage for transient and persistent state
         * @type {Object}
         * @private
         */
        this._internalState = {
            /**
             * Current WAMP Session Identifier
             * @type {string|null}
             */
            sessionIdentifier: null,

            /**
             * Server's advertised WAMP roles and features
             */
            serverCapabilities: { supportedRoles: {} },

            /**
             * Flag indicating if a disconnect sequence is in progress
             * @type {boolean}
             */
            isInitiatingDisconnect: ! !1, // equivalent to false

            /**
             * Result of the most recent operation
             */
            lastOperationResult: { status_code: 0, status_message: 'Operation was successful.', request_id: 0 },

            /**
             * Handle for the reconnection timer
             * @type {number|null}
             */
            reconnectTimerHandle: null,

            /**
             * Counter for reconnection attempts
             * @type {number}
             */
            reconnectionAttemptsCount: 0
        };

        /**
         * The active WebSocket connection object
         * @type {Object|null}
         * @private
         */
        this._webSocketInstance = null;

        /**
         * Queue for messages awaiting WebSocket availability
         * @type {Array<any>}
         * @private
         */
        this._pendingSocketMessages = [];

        /**
         * Map of outstanding WAMP requests by ID
         * @type {object}
         * @private
         */
        this._activeRequests = {};

        /**
         * Map of active RPC calls
         * @type {object}
         * @private
         */
        this._outstandingCalls = {};

        /**
         * Map of active Pub/Sub subscriptions
         * @type {object}
         * @private
         */
        this._managedSubscriptions = {};

        /**
         * List of subscribed topics
         * @type {Array<string>}
         * @private
         */
        this._subscribedTopicsList = [];

        /**
         * Map of registered RPC procedures
         * @type {object}
         * @private
         */
        this._registeredProcedures = {};

        /**
         * List of registered RPC procedure names
         * @type {Array<string>}
         * @private
         */
        this._procedureNamesList = [];

        /**
         * Configuration settings for the WAMP client
         * @type {Object}
         * @private
         */
        this._configuration = {
            /**
             * Controls automatic reconnection behavior
             * @type {boolean}
             */
            automaticReconnection: ! !0, // equivalent to true

            /**
             * Delay between reconnection attempts (milliseconds)
             * @type {number}
             */
            reconnectionDelayMillis: 2 * 1000,

            /**
             * Maximum number of reconnection attempts
             * @type {number}
             */
            maximumRetries: 25,

            /**
             * Serialization format for WAMP messages
             * @type {string}
             */
            messageSerializationFormat: 'json',

            /**
             * The WAMP realm to connect to
             * @type {string|null}
             */
            wampRealm: null,

            /**
             * Callback function for successful connection
             * @type {function|null}
             */
            onConnectionEstablished: null,

            /**
             * Callback function for connection closure
             * @type {function|null}
             */
            onConnectionClosed: null,

            /**
             * Callback function for connection errors
             * @type {function|null}
             */
            onConnectionError: null,

            /**
             * Callback function for each reconnection attempt
             * @type {function|null}
             */
            onReconnectionAttempt: null
        };

        const constructorArgs = arguments;

        switch ( constructorArgs.length ) {
            case 1:
                if ( typeof constructorArgs[0] !== 'string' ) {
                    this._configuration = this._combineObjects( this._configuration, constructorArgs[0] );
                }
                break;
            case 2:
                this._configuration = this._combineObjects( this._configuration, connectionOptions );
                break;
        }

        if ( this._configuration.wampRealm ) {
            this._configureSocketProtocols();
            this._webSocketInstance = createWebSocketInstance( this._socketAddress, this._socketProtocols );
            this._initializeSocketEventHandlers();
        }
        else {
            this._internalState.lastOperationResult = OPERATION_FEEDBACK.MISSING_REALM;
        }
    };

    /* Internal utility functions for the WAMP client */

    /**
     * Generates a new, unique request identifier.
     * @returns {number} A positive integer serving as a unique request ID.
     * @private
     */
    WampConnector.prototype._generateUniqueRequestId = function () {
        let currentRequestId;

        do {
            // Generate a random number within a safe integer range to avoid issues with JSON serialization
            currentRequestId = Math.floor( Math.random() * 100000000000000 );
        } while ( currentRequestId in this._activeRequests );

        return currentRequestId;
    };

    /**
     * Combines properties from multiple source objects into a single target object.
     * @returns {Object} The merged object.
     * @private
     */
    WampConnector.prototype._combineObjects = function () {
        let mergedObject = {},
            idx,
            numArgs = arguments.length,
            propName;

        for ( idx = 0; idx < numArgs; idx++ ) {
            for ( propName in arguments[idx] ) {
                mergedObject[propName] = arguments[idx][propName];
            }
        }

        return mergedObject;
    };

    /**
     * Determines if the provided value is an array.
     * @param {*} value The value to check.
     * @returns {boolean} True if the value is an array, false otherwise.
     * @private
     */
    WampConnector.prototype._checkIfArray = function ( value ) {
        return ( !!value ) && ( value.constructor === Array );
    };

    /**
     * Determines if the provided value is a plain object (not an array).
     * @param {*} value The value to check.
     * @returns {boolean} True if the value is a plain object, false otherwise.
     * @private
     */
    WampConnector.prototype._checkIfPlainObject = function ( value ) {
        return value === Object( value ) && Object.prototype.toString.call( value ) !== '[object Array]';
    };

    /**
     * Configures the WebSocket protocols based on client settings.
     * (This method's full implementation was not present in the original snippet, so it's a placeholder.)
     * @private
     */
    WampConnector.prototype._configureSocketProtocols = function () {
        // Placeholder for actual logic
    };

    /**
     * Attaches necessary event handlers to the WebSocket instance.
     * (This method's full implementation was not present in the original snippet, so it's a placeholder.)
     * @private
     */
    WampConnector.prototype._initializeSocketEventHandlers = function () {
        // Placeholder for actual logic
    };

    return WampConnector;

});