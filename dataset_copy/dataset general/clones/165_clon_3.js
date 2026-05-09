;(typeof define === 'function' ? function (exportMethod) { define('WampConnector', exportMethod); } :
    typeof exports === 'object' ? function (exportMethod) { module.exports = exportMethod(); } :
    function (exportMethod) { this.WampConnector = exportMethod(); }
)(function () {

    // This section defines core protocol message types and error codes for WAMP.
    // It's a fundamental part of the client's communication dictionary.

    const ProtocolOpCodes = {
        HANDSHAKE: 1,           // HELLO
        WELCOME_MSG: 2,         // WELCOME
        TERMINATE_SESSION: 3,   // ABORT
        CHALLENGE_AUTH: 4,      // CHALLENGE
        AUTH_RESPONSE: 5,       // AUTHENTICATE
        GOODBYE_MSG: 6,         // GOODBYE
        KEEP_ALIVE: 7,          // HEARTBEAT (often not used in WAMPv2, but kept for completeness)
        ERROR_INDICATION: 8,    // ERROR

        PUBLISH_EVENT: 16,      // PUBLISH
        PUBLISH_CONFIRM: 17,    // PUBLISHED
        SUBSCRIBE_TOPIC: 32,    // SUBSCRIBE
        SUBSCRIBE_CONFIRM: 33,  // SUBSCRIBED
        UNSUBSCRIBE_TOPIC: 34,  // UNSUBSCRIBE
        UNSUBSCRIBE_CONFIRM: 35,// UNSUBSCRIBED
        TOPIC_EVENT: 36,        // EVENT

        INVOKE_PROCEDURE: 48,   // CALL
        CANCEL_INVOCATION: 49,  // CANCEL
        INVOCATION_RESULT: 50,  // RESULT

        REGISTER_PROCEDURE: 64, // REGISTER
        REGISTER_CONFIRM: 65,   // REGISTERED
        UNREGISTER_PROCEDURE: 66,// UNREGISTER
        UNREGISTER_CONFIRM: 67, // UNREGISTERED
        PROCEDURE_INVOCATION: 68,// INVOCATION
        INTERRUPT_INVOCATION: 69,// INTERRUPT
        INVOCATION_YIELD: 70    // YIELD
    };

    const IssueCodes = {
        SUCCESS_STATUS: {
            code: 0,
            description: 'Operation completed successfully.'
        },
        INVALID_URI_FORMAT: {
            code: 1,
            description: 'Provided URI for topic or procedure is malformed or invalid!'
        },
        BROKER_UNAVAILABLE: {
            code: 2,
            description: 'Server does not support the Broker role for PubSub functionality!'
        },
        MISSING_CALLBACK_HANDLER: {
            code: 3,
            description: 'A required callback function was not supplied!'
        },
        BAD_INPUT_PARAMETER: {
            code: 4,
            description: 'One or more input parameters are invalid or of incorrect type!'
        },
        UNEXPECTED_SUB_CONFIRM: {
            code: 5,
            description: 'Received subscription confirmation for an unknown subscription request!'
        },
        UNEXPECTED_SUB_ERROR: {
            code: 6,
            description: 'Received an error for an unknown subscription!'
        },
        NONEXISTENT_UNSUB_REQ: {
            code: 7,
            description: 'Attempted to unsubscribe from a subscription that does not exist!'
        },
        UNEXPECTED_UNSUB_CONFIRM: {
            code: 8,
            description: 'Received unsubscription confirmation for an unknown subscription!'
        },
        UNEXPECTED_PUB_ERROR: {
            code: 9,
            description: 'Received an error for an unknown publication request!'
        },
        UNEXPECTED_PUB_CONFIRM: {
            code: 10,
            description: 'Received publication confirmation for an unknown publication!'
        },
        UNEXPECTED_SUB_EVENT: {
            code: 11,
            description: 'Received an event for an unknown or inactive subscription!'
        },
        DEALER_UNAVAILABLE: {
            code: 12,
            description: 'Server does not support the Dealer role for RPC functionality!'
        },
        UNEXPECTED_CALL_RESULT: {
            code: 13,
            description: 'Received RPC result for a call that is not pending!'
        },
        UNEXPECTED_CALL_ERROR: {
            code: 14,
            description: 'Received RPC error for a call that is not pending!'
        },
        PROCEDURE_ALREADY_REGISTERED: {
            code: 15,
            description: 'The specified RPC procedure name is already registered!'
        },
        UNEXPECTED_REG_CONFIRM: {
            code: 16,
            description: 'Received RPC registration confirmation for an unknown procedure!'
        },
        UNEXPECTED_UNREG_CONFIRM: {
            code: 17,
            description: 'Received RPC unregistration confirmation for an unknown procedure!'
        },
        UNEXPECTED_REG_ERROR: {
            code: 18,
            description: 'Received an error for an unknown RPC registration request!'
        },
        UNEXPECTED_INVOCATION: {
            code: 19,
            description: 'Received an invocation for an RPC that is not registered!'
        },
        NO_MATCHING_INVOCATION_ID: {
            code: 20,
            description: 'No pending RPC invocation matches the provided request ID!'
        },
        MISSING_WAMP_REALM: {
            code: 21,
            description: 'No WAMP realm was specified for connection!'
        },
        UNSUPPORTED_TRANSPORT: {
            code: 22,
            description: 'No suitable WebSocket implementation found in the environment!'
        },
        INVALID_WAMP_URI: {
            code: 23,
            description: 'WAMP URI does not conform to specification for strict mode!'
        }
    };

    const runningInNodeEnv = (typeof process === 'object' && Object.prototype.toString.call(process) === '[object process]');

    // Helper function to validate WAMP URIs
    function isValidWampUri(uri, strict = true) {
        if (typeof uri !== 'string' || uri.length === 0) {
            return false;
        }
        // Basic check for valid characters and segments
        const parts = uri.split('.');
        if (strict) {
            // Strict WAMP URI validation
            // Must not start/end with a dot, must not contain empty segments
            if (uri.startsWith('.') || uri.endsWith('.') || parts.some(p => p.length === 0)) {
                return false;
            }
            // Each segment must be a valid identifier (alphanum + underscore)
            const identifierRegex = /^[a-zA-Z0-9_]+$/;
            if (!parts.every(p => identifierRegex.test(p))) {
                return false;
            }
        }
        return true;
    }


    // Resolves WebSocket endpoint for browser environment
    function resolveBrowserEndpoint(inputUrl) {
        let connectionScheme, portSegment;

        if (!inputUrl) {
            connectionScheme = window.location.protocol === 'https:' ? 'wss://' : 'ws://';
            portSegment = window.location.port ? `:${window.location.port}` : '';
            return connectionScheme + window.location.hostname + portSegment + '/ws';
        }

        if (inputUrl.startsWith('ws://') || inputUrl.startsWith('wss://')) {
            return inputUrl;
        }

        // Assume default scheme if only domain or path is provided
        connectionScheme = window.location.protocol === 'https:' ? 'wss://' : 'ws://';

        if (/:(\d{1,5})$/.test(inputUrl)) { // Contains port, e.g., 'example.com:8080'
            return connectionScheme + inputUrl;
        } else if (inputUrl.startsWith('/')) { // Just a path, e.g., '/my-websocket'
            portSegment = window.location.port ? `:${window.location.port}` : '';
            return connectionScheme + window.location.hostname + portSegment + inputUrl;
        } else { // Assume domain, e.g., 'example.com'
            return connectionScheme + inputUrl;
        }
    }

    // Resolves WebSocket endpoint for Node.js environment
    function validateNodeEndpoint(inputUrl) {
        if (inputUrl && (inputUrl.startsWith('ws://') || inputUrl.startsWith('wss://'))) {
            return inputUrl;
        }
        return null; // Node environment requires explicit ws/wss scheme
    }

    // Creates a WebSocket instance based on environment
    function createSocketInstance(endpointUrl, negotiationProtocols) {
        const resolvedEndpoint = runningInNodeEnv ? validateNodeEndpoint(endpointUrl) : resolveBrowserEndpoint(endpointUrl);
        const globalScope = runningInNodeEnv ? global : window;

        if (!resolvedEndpoint) {
            return null;
        }

        if ('WebSocket' in globalScope) {
            return new globalScope.WebSocket(resolvedEndpoint, negotiationProtocols);
        } else if ('MozWebSocket' in globalScope) { // Older Firefox support
            return new globalScope.MozWebSocket(resolvedEndpoint, negotiationProtocols);
        } else {
            return null; // No WebSocket support
        }
    }

    /**
     * WAMP Client Connection Manager
     * @param {string} endpointUrl - The WebSocket URL for the WAMP router.
     * @param {Object} configParams - Configuration options for the client.
     */
    const WampConnector = function (endpointUrl, configParams) {

        /**
         * Library semantic versioning identifier
         * @type {string}
         * @private
         */
        this.libVersion = 'v1.0.6-alpha';

        /**
         * The WebSocket URL to connect to the WAMP router.
         * @type {string|undefined}
         * @private
         */
        this.socketAddress = (typeof arguments[0] === 'string') ? endpointUrl : undefined;

        /**
         * WAMP sub-protocols for WebSocket negotiation.
         * @type {Array<string>}
         * @private
         */
        this.negotiationProtocols = ['wamp.2.json'];

        /**
         * WAMP roles and their supported features by this client.
         * @type {object}
         * @private
         */
        this.clientCapabilities = {
            agent: 'WampConnector.js ' + this.libVersion,
            roles: {
                publisher: {
                    supportedFeatures: {
                        subscriber_blackwhite_listing: true,
                        publisher_exclusion: true,
                        publisher_identification: true
                    }
                },
                subscriber: {
                    supportedFeatures: {}
                },
                caller: {
                    supportedFeatures: {
                        callee_blackwhite_listing: true,
                        caller_exclusion: true,
                        caller_identification: true,
                        progressive_call_results: true,
                        call_canceling: true
                    }
                },
                callee: {
                    supportedFeatures: {
                        caller_identification: true
                    }
                }
            }
        };

        /**
         * Internal object to maintain various runtime states.
         * @type {Object}
         * @private
         */
        this.internalState = {
            /**
             * Current WAMP session identifier.
             * @type {string|null}
             */
            activeSessionId: null,

            /**
             * Features and roles advertised by the connected WAMP router.
             */
            remotePeerCapabilities: { roles: {} },

            /**
             * Flag indicating if a graceful disconnection is in progress.
             * @type {boolean}
             */
            isTerminatingConnection: false,

            /**
             * Status of the most recent client operation.
             */
            lastOperationStatus: { code: 0, description: 'Operation completed successfully!', requestId: 0 },

            /**
             * Handle for the reconnection timer.
             * @type {number|null}
             */
            reconnectionTimerHandle: null,

            /**
             * Counter for consecutive reconnection attempts.
             * @type {number}
             */
            reconnectionAttemptCount: 0
        };

        /**
         * The active WebSocket connection instance.
         * @type {WebSocket|null}
         * @private
         */
        this.webSocketConnection = null;

        /**
         * Queue for messages to be sent when the WebSocket is not ready.
         * @type {Array<string>}
         * @private
         */
        this.messageSendQueue = [];

        /**
         * Stores pending WAMP requests awaiting a response.
         * @type {Object<string, object>}
         * @private
         */
        this.pendingRequests = {};

        /**
         * Stores active RPC calls initiated by this client.
         * @type {Object<string, object>}
         * @private
         */
        this.activeCalls = {};

        /**
         * Stores active topic subscriptions.
         * @type {Object<string, object>}
         * @private
         */
        this.activeSubscriptions = {};

        /**
         * List of topic URIs currently subscribed to.
         * @type {Array<string>}
         * @private
         */
        this.subscribedTopicNames = [];

        /**
         * Stores RPC procedures registered by this client.
         * @type {Object<string, object>}
         * @private
         */
        this.registeredProcedures = {};

        /**
         * List of procedure URIs currently registered.
         * @type {Array<string>}
         * @private
         */
        this.registeredProcedureNames = [];

        /**
         * Client configurable options.
         * @type {Object}
         * @private
         */
        this.clientConfiguration = {
            /**
             * Flag to enable or disable automatic reconnection attempts.
             * @type {boolean}
             */
            shouldAutoReconnect: true,

            /**
             * Time delay in milliseconds between reconnection attempts.
             * @type {number}
             */
            reconnectionDelayMillis: 2 * 1000,

            /**
             * Maximum number of reconnection attempts before giving up.
             * @type {number}
             */
            maxReconnectionAttempts: 25,

            /**
             * Message serialization format (e.g., 'json', 'msgpack').
             * @type {string}
             */
            serializationFormat: 'json',

            /**
             * The WAMP realm to join upon connection.
             * @type {string|null}
             */
            wampRealm: null,

            /**
             * Callback invoked when the WAMP session is successfully established.
             * @type {function|null}
             */
            onConnectionEstablished: null,

            /**
             * Callback invoked when the WebSocket connection is closed.
             * @type {function|null}
             */
            onConnectionClosed: null,

            /**
             * Callback invoked when a WebSocket error occurs.
             * @type {function|null}
             */
            onConnectionError: null,

            /**
             * Callback invoked before each reconnection attempt.
             * @type {function|null}
             */
            onReconnectionAttempt: null,

            /**
             * Debug logging flag.
             * @type {boolean}
             */
            enableDebugLogging: false
        };

        // Process constructor arguments for configuration
        if (arguments.length === 1) {
            if (this._isInputPlainObject(arguments[0])) {
                this.clientConfiguration = this._combineObjects(this.clientConfiguration, arguments[0]);
            }
        } else if (arguments.length === 2) {
            if (this._isInputPlainObject(configParams)) {
                this.clientConfiguration = this._combineObjects(this.clientConfiguration, configParams);
            }
        }

        // Validate essential configuration before proceeding
        if (!this.clientConfiguration.wampRealm) {
            this.internalState.lastOperationStatus = IssueCodes.MISSING_WAMP_REALM;
            return; // Exit constructor early if realm is missing
        }

        // Initialize connection if a URL was provided
        if (this.socketAddress) {
            this._updateSocketProtocols();
            this.webSocketConnection = createSocketInstance(this.socketAddress, this.negotiationProtocols);

            if (!this.webSocketConnection) {
                this.internalState.lastOperationStatus = IssueCodes.UNSUPPORTED_TRANSPORT;
                return;
            }
            this._setupSocketHandlers();
        } else if (this.clientConfiguration.enableDebugLogging) {
            console.warn('WampConnector: No WebSocket URL provided at instantiation. Connection must be initiated manually.');
        }

    };

    /* Internal utility methods for WampConnector */

    /**
     * Generates a new unique request identifier for WAMP messages.
     * @returns {number} A unique request ID.
     * @private
     */
    WampConnector.prototype._generateUniqueRequestId = function () {
        const MAX_ID_RANGE = 100000000000000; // A reasonable range to avoid very large numbers
        const MAX_RETRIES = 100; // Max attempts to find a unique ID

        let currentId;
        let attempts = 0;

        do {
            currentId = Math.floor(Math.random() * MAX_ID_RANGE);
            attempts++;
            if (attempts > MAX_RETRIES) {
                // Fallback or error if too many collisions
                console.error('WampConnector: Failed to generate a unique request ID after multiple attempts.');
                // Potentially throw an error or handle
                return -1; // Indicate failure
            }
        } while (currentId in this.pendingRequests);

        return currentId;
    };

    /**
     * Combines properties from multiple source objects into a single target object.
     * Later objects' properties overwrite earlier ones.
     * @param {...Object} sources - One or more objects to merge.
     * @returns {Object} A new object containing merged properties.
     * @private
     */
    WampConnector.prototype._combineObjects = function (...sources) {
        if (!sources || sources.length === 0) {
            return {};
        }
        const target = {};
        for (let i = 0; i < sources.length; i++) {
            const currentSource = sources[i];
            if (currentSource && typeof currentSource === 'object') {
                for (const key in currentSource) {
                    if (Object.prototype.hasOwnProperty.call(currentSource, key)) {
                        target[key] = currentSource[key];
                    }
                }
            }
        }
        return target;
    };

    /**
     * Checks if a given value is an array.
     * @param {*} value - The value to check.
     * @returns {boolean} True if the value is an array, false otherwise.
     * @private
     */
    WampConnector.prototype._isInputArray = function (value) {
        return Array.isArray(value);
    };

    /**
     * Checks if a given value is a plain JavaScript object (not an array, null, etc.).
     * @param {*} value - The value to check.
     * @returns {boolean} True if the value is a plain object, false otherwise.
     * @private
     */
    WampConnector.prototype._isInputPlainObject = function (value) {
        return value !== null && typeof value === 'object' && value.constructor === Object;
    };

    /**
     * Updates the WebSocket sub-protocols based on the configured serialization format.
     * @private
     */
    WampConnector.prototype._updateSocketProtocols = function () {
        // This method could be extended to support other serialization formats like msgpack
        // For now, it just ensures 'wamp.2.json' is present.
        if (this.clientConfiguration.serializationFormat === 'json') {
            if (!this.negotiationProtocols.includes('wamp.2.json')) {
                this.negotiationProtocols.push('wamp.2.json');
            }
        }
        // Add more protocols if other serialization formats are supported
    };

    /**
     * Sets up event handlers for the WebSocket connection.
     * @private
     */
    WampConnector.prototype._setupSocketHandlers = function () {
        if (!this.webSocketConnection) {
            if (this.clientConfiguration.enableDebugLogging) {
                console.error('WampConnector: Cannot set up handlers, WebSocket connection is null.');
            }
            return;
        }

        this.webSocketConnection.onopen = (event) => {
            if (this.clientConfiguration.enableDebugLogging) {
                console.log('WampConnector: WebSocket connection opened:', event);
            }
            // Reset reconnection state on successful connect
            this.internalState.reconnectionAttemptCount = 0;
            if (this.internalState.reconnectionTimerHandle) {
                clearTimeout(this.internalState.reconnectionTimerHandle);
                this.internalState.reconnectionTimerHandle = null;
            }
            // Perform WAMP HELLO handshake
            this._sendWampHello();
        };

        this.webSocketConnection.onmessage = (event) => {
            if (this.clientConfiguration.enableDebugLogging) {
                console.log('WampConnector: Received message:', event.data);
            }
            this._processIncomingMessage(event.data);
        };

        this.webSocketConnection.onclose = (event) => {
            if (this.clientConfiguration.enableDebugLogging) {
                console.log('WampConnector: WebSocket connection closed:', event.code, event.reason);
            }
            this.internalState.activeSessionId = null; // Clear session ID
            if (typeof this.clientConfiguration.onConnectionClosed === 'function') {
                this.clientConfiguration.onConnectionClosed(event);
            }

            if (this.clientConfiguration.shouldAutoReconnect && !this.internalState.isTerminatingConnection) {
                this._attemptReconnection();
            } else {
                this.internalState.isTerminatingConnection = false; // Reset for future manual connects
            }
        };

        this.webSocketConnection.onerror = (event) => {
            if (this.clientConfiguration.enableDebugLogging) {
                console.error('WampConnector: WebSocket error:', event);
            }
            if (typeof this.clientConfiguration.onConnectionError === 'function') {
                this.clientConfiguration.onConnectionError(event);
            }
        };
    };

    /**
     * Sends the WAMP HELLO message to the router.
     * @private
     */
    WampConnector.prototype._sendWampHello = function () {
        const helloMessage = [
            ProtocolOpCodes.HANDSHAKE,
            this.clientConfiguration.wampRealm,
            this.clientCapabilities
        ];
        this._sendMessage(helloMessage);
    };

    /**
     * Processes an incoming WAMP message from the WebSocket.
     * @param {string} rawMessage - The raw message string received from the WebSocket.
     * @private
     */
    WampConnector.prototype._processIncomingMessage = function (rawMessage) {
        let message;
        try {
            message = JSON.parse(rawMessage);
        } catch (e) {
            if (this.clientConfiguration.enableDebugLogging) {
                console.error('WampConnector: Failed to parse incoming message as JSON:', e, rawMessage);
            }
            return;
        }

        if (!Array.isArray(message) || message.length === 0) {
            if (this.clientConfiguration.enableDebugLogging) {
                console.warn('WampConnector: Received invalid WAMP message format:', message);
            }
            return;
        }

        const messageType = message[0];

        switch (messageType) {
            case ProtocolOpCodes.WELCOME_MSG:
                this._handleWelcome(message);
                break;
            case ProtocolOpCodes.PUBLISH_CONFIRM:
                this._handlePublishConfirmation(message);
                break;
            case ProtocolOpCodes.SUBSCRIBE_CONFIRM:
                this._handleSubscribeConfirmation(message);
                break;
            case ProtocolOpCodes.UNSUBSCRIBE_CONFIRM:
                this._handleUnsubscribeConfirmation(message);
                break;
            case ProtocolOpCodes.TOPIC_EVENT:
                this._handleTopicEvent(message);
                break;
            case ProtocolOpCodes.INVOCATION_RESULT:
                this._handleCallResult(message);
                break;
            case ProtocolOpCodes.REGISTER_CONFIRM:
                this._handleRegisterConfirmation(message);
                break;
            case ProtocolOpCodes.UNREGISTER_CONFIRM:
                this._handleUnregisterConfirmation(message);
                break;
            case ProtocolOpCodes.PROCEDURE_INVOCATION:
                this._handleProcedureInvocation(message);
                break;
            case ProtocolOpCodes.ERROR_INDICATION:
                this._handleErrorMessage(message);
                break;
            case ProtocolOpCodes.GOODBYE_MSG:
                this._handleGoodbye(message);
                break;
            default:
                if (this.clientConfiguration.enableDebugLogging) {
                    console.warn('WampConnector: Unhandled WAMP message type:', messageType, message);
                }
                break;
        }
    };

    /**
     * Sends a WAMP message over the WebSocket.
     * If the socket is not open, the message is queued.
     * @param {Array<any>} message - The WAMP message array to send.
     * @private
     */
    WampConnector.prototype._sendMessage = function (message) {
        const serializedMessage = JSON.stringify(message);
        if (this.webSocketConnection && this.webSocketConnection.readyState === WebSocket.OPEN) {
            this.webSocketConnection.send(serializedMessage);
        } else {
            this.messageSendQueue.push(serializedMessage);
            if (this.clientConfiguration.enableDebugLogging) {
                console.warn('WampConnector: WebSocket not open, message queued:', message);
            }
        }
    };

    /**
     * Attempts to reconnect to the WAMP router.
     * @private
     */
    WampConnector.prototype._attemptReconnection = function () {
        if (!this.clientConfiguration.shouldAutoReconnect) {
            return;
        }

        this.internalState.reconnectionAttemptCount++;

        if (this.internalState.reconnectionAttemptCount > this.clientConfiguration.maxReconnectionAttempts) {
            if (this.clientConfiguration.enableDebugLogging) {
                console.error('WampConnector: Maximum reconnection attempts reached. Giving up.');
            }
            if (typeof this.clientConfiguration.onConnectionError === 'function') {
                this.clientConfiguration.onConnectionError({
                    code: 'MaxReconnectionAttempts',
                    reason: 'Max reconnection attempts reached'
                });
            }
            return;
        }

        if (typeof this.clientConfiguration.onReconnectionAttempt === 'function') {
            this.clientConfiguration.onReconnectionAttempt(this.internalState.reconnectionAttemptCount);
        }

        if (this.clientConfiguration.enableDebugLogging) {
            console.log(`WampConnector: Reconnecting attempt ${this.internalState.reconnectionAttemptCount}...`);
        }

        this.internalState.reconnectionTimerHandle = setTimeout(() => {
            this.webSocketConnection = createSocketInstance(this.socketAddress, this.negotiationProtocols);
            if (this.webSocketConnection) {
                this._setupSocketHandlers();
            } else {
                if (this.clientConfiguration.enableDebugLogging) {
                    console.error('WampConnector: Failed to create new WebSocket instance for reconnection.');
                }
                // If creation fails, try again after delay
                this._attemptReconnection();
            }
        }, this.clientConfiguration.reconnectionDelayMillis);
    };

    // --- WAMP Message Handlers ---

    WampConnector.prototype._handleWelcome = function (message) {
        const [msgType, sessionId, details] = message;
        this.internalState.activeSessionId = sessionId;
        this.internalState.remotePeerCapabilities = details;

        if (this.clientConfiguration.enableDebugLogging) {
            console.log(`WampConnector: WAMP session established. Session ID: ${sessionId}`);
        }

        // Send any queued messages
        while (this.messageSendQueue.length > 0) {
            this.webSocketConnection.send(this.messageSendQueue.shift());
        }

        if (typeof this.clientConfiguration.onConnectionEstablished === 'function') {
            this.clientConfiguration.onConnectionEstablished({
                sessionId: sessionId,
                details: details
            });
        }
    };

    WampConnector.prototype._handlePublishConfirmation = function (message) {
        const [msgType, publishRequestId, publicationId] = message;
        const request = this.pendingRequests[publishRequestId];

        if (request && typeof request.onSuccess === 'function') {
            request.onSuccess({ publicationId: publicationId });
        } else if (!request && this.clientConfiguration.enableDebugLogging) {
            console.warn('WampConnector: Received publish confirmation for unknown request ID:', publishRequestId);
            this.internalState.lastOperationStatus = IssueCodes.UNEXPECTED_PUB_CONFIRM;
        }
        delete this.pendingRequests[publishRequestId];
    };

    WampConnector.prototype._handleSubscribeConfirmation = function (message) {
        const [msgType, subscribeRequestId, subscriptionId] = message;
        const request = this.pendingRequests[subscribeRequestId];

        if (request) {
            request.subscriptionId = subscriptionId; // Store subscription ID
            this.activeSubscriptions[subscriptionId] = request;
            this.subscribedTopicNames.push(request.topic);

            if (typeof request.onSuccess === 'function') {
                request.onSuccess({ subscriptionId: subscriptionId });
            }
        } else if (this.clientConfiguration.enableDebugLogging) {
            console.warn('WampConnector: Received subscribe confirmation for unknown request ID:', subscribeRequestId);
            this.internalState.lastOperationStatus = IssueCodes.UNEXPECTED_SUB_CONFIRM;
        }
        delete this.pendingRequests[subscribeRequestId];
    };

    WampConnector.prototype._handleUnsubscribeConfirmation = function (message) {
        const [msgType, unsubscribeRequestId] = message;
        const request = this.pendingRequests[unsubscribeRequestId];

        if (request) {
            const subscriptionId = request.subscriptionId;
            if (this.activeSubscriptions[subscriptionId]) {
                const topicIndex = this.subscribedTopicNames.indexOf(this.activeSubscriptions[subscriptionId].topic);
                if (topicIndex > -1) {
                    this.subscribedTopicNames.splice(topicIndex, 1);
                }
                delete this.activeSubscriptions[subscriptionId];
            }

            if (typeof request.onSuccess === 'function') {
                request.onSuccess();
            }
        } else if (this.clientConfiguration.enableDebugLogging) {
            console.warn('WampConnector: Received unsubscribe confirmation for unknown request ID:', unsubscribeRequestId);
            this.internalState.lastOperationStatus = IssueCodes.UNEXPECTED_UNSUB_CONFIRM;
        }
        delete this.pendingRequests[unsubscribeRequestId];
    };

    WampConnector.prototype._handleTopicEvent = function (message) {
        const [msgType, subscriptionId, publicationId, details, args, kwargs] = message;
        const subscription = this.activeSubscriptions[subscriptionId];

        if (subscription && typeof subscription.onEvent === 'function') {
            subscription.onEvent({
                details: details,
                args: args || [],
                kwargs: kwargs || {}
            });
        } else if (this.clientConfiguration.enableDebugLogging) {
            console.warn('WampConnector: Received event for unknown subscription ID:', subscriptionId);
            this.internalState.lastOperationStatus = IssueCodes.UNEXPECTED_SUB_EVENT;
        }
    };

    WampConnector.prototype._handleCallResult = function (message) {
        const [msgType, callRequestId, details, args, kwargs] = message;
        const call = this.pendingRequests[callRequestId];

        if (call && typeof call.onSuccess === 'function') {
            call.onSuccess({
                details: details,
                args: args || [],
                kwargs: kwargs || {}
            });
        } else if (this.clientConfiguration.enableDebugLogging) {
            console.warn('WampConnector: Received RPC result for unknown request ID:', callRequestId);
            this.internalState.lastOperationStatus = IssueCodes.UNEXPECTED_CALL_RESULT;
        }
        delete this.pendingRequests[callRequestId];
    };

    WampConnector.prototype._handleRegisterConfirmation = function (message) {
        const [msgType, registerRequestId, registrationId] = message;
        const request = this.pendingRequests[registerRequestId];

        if (request) {
            request.registrationId = registrationId; // Store registration ID
            this.registeredProcedures[registrationId] = request;
            this.registeredProcedureNames.push(request.procedure);

            if (typeof request.onSuccess === 'function') {
                request.onSuccess({ registrationId: registrationId });
            }
        } else if (this.clientConfiguration.enableDebugLogging) {
            console.warn('WampConnector: Received RPC registration confirmation for unknown request ID:', registerRequestId);
            this.internalState.lastOperationStatus = IssueCodes.UNEXPECTED_REG_CONFIRM;
        }
        delete this.pendingRequests[registerRequestId];
    };

    WampConnector.prototype._handleUnregisterConfirmation = function (message) {
        const [msgType, unregisterRequestId] = message;
        const request = this.pendingRequests[unregisterRequestId];

        if (request) {
            const registrationId = request.registrationId;
            if (this.registeredProcedures[registrationId]) {
                const procIndex = this.registeredProcedureNames.indexOf(this.registeredProcedures[registrationId].procedure);
                if (procIndex > -1) {
                    this.registeredProcedureNames.splice(procIndex, 1);
                }
                delete this.registeredProcedures[registrationId];
            }

            if (typeof request.onSuccess === 'function') {
                request.onSuccess();
            }
        } else if (this.clientConfiguration.enableDebugLogging) {
            console.warn('WampConnector: Received RPC unregistration confirmation for unknown request ID:', unregisterRequestId);
            this.internalState.lastOperationStatus = IssueCodes.UNEXPECTED_UNREG_CONFIRM;
        }
        delete this.pendingRequests[unregisterRequestId];
    };

    WampConnector.prototype._handleProcedureInvocation = function (message) {
        const [msgType, invocationRequestId, registrationId, details, args, kwargs] = message;
        const registration = this.registeredProcedures[registrationId];

        if (registration && typeof registration.onInvocation === 'function') {
            const procedureExecutor = registration.onInvocation;
            try {
                // Execute the registered procedure
                const result = procedureExecutor({
                    details: details,
                    args: args || [],
                    kwargs: kwargs || {}
                });

                // Send YIELD message with the result
                const yieldMessage = [
                    ProtocolOpCodes.INVOCATION_YIELD,
                    invocationRequestId,
                    {}, // Options
                    [result] // Result as a single argument
                ];
                this._sendMessage(yieldMessage);

            } catch (e) {
                // If the procedure throws an error, send an ERROR message
                const errorMessage = [
                    ProtocolOpCodes.ERROR_INDICATION,
                    ProtocolOpCodes.PROCEDURE_INVOCATION,
                    invocationRequestId,
                    {}, // Options
                    'wamp.error.runtime_error', // Error URI
                    [e.message] // Error message as argument
                ];
                this._sendMessage(errorMessage);
                if (this.clientConfiguration.enableDebugLogging) {
                    console.error('WampConnector: Error during RPC invocation:', e);
                }
            }
        } else if (this.clientConfiguration.enableDebugLogging) {
            console.warn('WampConnector: Received invocation for unknown registration ID:', registrationId);
            this.internalState.lastOperationStatus = IssueCodes.UNEXPECTED_INVOCATION;
        }
    };

    WampConnector.prototype._handleErrorMessage = function (message) {
        const [msgType, errorType, requestTypeId, details, errorUri, args, kwargs] = message;
        const requestId = message[2]; // The original request ID that caused the error

        const request = this.pendingRequests[requestId];
        if (request && typeof request.onError === 'function') {
            request.onError({
                errorType: errorType,
                details: details,
                errorUri: errorUri,
                args: args || [],
                kwargs: kwargs || {}
            });
        } else if (this.clientConfiguration.enableDebugLogging) {
            console.warn('WampConnector: Received error for unknown request ID:', requestId, message);
            this.internalState.lastOperationStatus = IssueCodes.UNEXPECTED_REG_ERROR; // Generic error, could be more specific
        }
        delete this.pendingRequests[requestId];
    };

    WampConnector.prototype._handleGoodbye = function (message) {
        const [msgType, details] = message;
        if (this.clientConfiguration.enableDebugLogging) {
            console.log('WampConnector: Received GOODBYE from router:', details);
        }
        // If we initiated goodbye, then we just close. Otherwise, respond.
        if (!this.internalState.isTerminatingConnection) {
            this.internalState.isTerminatingConnection = true; // Prevent endless loop
            const goodbyeResponse = [
                ProtocolOpCodes.GOODBYE_MSG,
                {} // No details for response, typically
            ];
            this._sendMessage(goodbyeResponse);
        }
        this.webSocketConnection.close();
    };


    // --- Public API Methods ---

    /**
     * Connects to the WAMP router.
     * @returns {WampConnector} The WampConnector instance for chaining.
     */
    WampConnector.prototype.connect = function () {
        if (!this.socketAddress) {
            this.internalState.lastOperationStatus = IssueCodes.BAD_INPUT_PARAMETER;
            if (this.clientConfiguration.enableDebugLogging) {
                console.error('WampConnector: Cannot connect without a WebSocket URL.');
            }
            return this;
        }

        if (this.webSocketConnection && this.webSocketConnection.readyState === WebSocket.OPEN) {
            if (this.clientConfiguration.enableDebugLogging) {
                console.warn('WampConnector: Already connected.');
            }
            this.internalState.lastOperationStatus = IssueCodes.SUCCESS_STATUS;
            return this;
        }

        this._updateSocketProtocols();
        this.webSocketConnection = createSocketInstance(this.socketAddress, this.negotiationProtocols);

        if (!this.webSocketConnection) {
            this.internalState.lastOperationStatus = IssueCodes.UNSUPPORTED_TRANSPORT;
            if (this.clientConfiguration.enableDebugLogging) {
                console.error('WampConnector: Failed to create WebSocket instance. Check environment support.');
            }
            return this;
        }

        this._setupSocketHandlers();
        this.internalState.lastOperationStatus = IssueCodes.SUCCESS_STATUS;
        return this;
    };

    /**
     * Disconnects from the WAMP router.
     * @returns {WampConnector} The WampConnector instance for chaining.
     */
    WampConnector.prototype.disconnect = function () {
        if (this.webSocketConnection && this.webSocketConnection.readyState === WebSocket.OPEN) {
            this.internalState.isTerminatingConnection = true;
            const goodbyeMessage = [
                ProtocolOpCodes.GOODBYE_MSG,
                {} // No details for now
            ];
            this._sendMessage(goodbyeMessage);
            // WebSocket will be closed upon receiving GOODBYE or timeout
            this.internalState.lastOperationStatus = IssueCodes.SUCCESS_STATUS;
        } else {
            if (this.clientConfiguration.enableDebugLogging) {
                console.warn('WampConnector: Not connected, cannot disconnect.');
            }
            this.internalState.lastOperationStatus = IssueCodes.SUCCESS_STATUS; // Already disconnected state
        }
        return this;
    };

    /**
     * Publishes an event to a WAMP topic.
     * @param {string} topicUri - The URI of the topic to publish to.
     * @param {Array<any>} [args] - Positional arguments for the event.
     * @param {Object} [kwargs] - Keyword arguments for the event.
     * @param {Object} [options] - Publish options (e.g., `acknowledge`, `exclude`, `eligible`).
     * @returns {Object} An object with `onSuccess` and `onError` methods for the publish confirmation.
     */
    WampConnector.prototype.publish = function (topicUri, args = [], kwargs = {}, options = {}) {
        const requestId = this._generateUniqueRequestId();
        if (requestId === -1) {
            this.internalState.lastOperationStatus = { ...IssueCodes.BAD_INPUT_PARAMETER, description: 'Failed to generate unique request ID.' };
            return { onSuccess: () => {}, onError: (e) => {} };
        }

        if (!isValidWampUri(topicUri, true)) {
            this.internalState.lastOperationStatus = IssueCodes.INVALID_WAMP_URI;
            if (this.clientConfiguration.enableDebugLogging) {
                console.error(`WampConnector: Invalid topic URI: ${topicUri}`);
            }
            return { onSuccess: () => {}, onError: (e) => {} };
        }

        const publishOptions = this._combineObjects({}, options, {
            acknowledge: true // Always request acknowledge for callback handling
        });

        const publishMessage = [
            ProtocolOpCodes.PUBLISH_EVENT,
            requestId,
            publishOptions,
            topicUri,
            this._isInputArray(args) ? args : [],
            this._isInputPlainObject(kwargs) ? kwargs : {}
        ];

        const callbacks = {
            onSuccess: null,
            onError: null
        };
        this.pendingRequests[requestId] = callbacks;
        this._sendMessage(publishMessage);
        this.internalState.lastOperationStatus = IssueCodes.SUCCESS_STATUS;
        this.internalState.lastOperationStatus.requestId = requestId;
        return callbacks;
    };

    /**
     * Subscribes to a WAMP topic.
     * @param {string} topicUri - The URI of the topic to subscribe to.
     * @param {function} eventHandler - The callback function to receive events.
     * @param {Object} [options] - Subscription options.
     * @returns {Object} An object with `onSuccess`, `onError`, and `cancel` methods.
     */
    WampConnector.prototype.subscribe = function (topicUri, eventHandler, options = {}) {
        const requestId = this._generateUniqueRequestId();
        if (requestId === -1) {
            this.internalState.lastOperationStatus = { ...IssueCodes.BAD_INPUT_PARAMETER, description: 'Failed to generate unique request ID.' };
            return { onSuccess: () => {}, onError: (e) => {} };
        }

        if (!isValidWampUri(topicUri, true)) {
            this.internalState.lastOperationStatus = IssueCodes.INVALID_WAMP_URI;
            if (this.clientConfiguration.enableDebugLogging) {
                console.error(`WampConnector: Invalid topic URI: ${topicUri}`);
            }
            return { onSuccess: () => {}, onError: (e) => {} };
        }

        if (typeof eventHandler !== 'function') {
            this.internalState.lastOperationStatus = IssueCodes.MISSING_CALLBACK_HANDLER;
            if (this.clientConfiguration.enableDebugLogging) {
                console.error('WampConnector: Subscribe requires an event handler function.');
            }
            return { onSuccess: () => {}, onError: (e) => {} };
        }

        const subscribeMessage = [
            ProtocolOpCodes.SUBSCRIBE_TOPIC,
            requestId,
            options,
            topicUri
        ];

        const callbacks = {
            onSuccess: null,
            onError: null,
            onEvent: eventHandler,
            topic: topicUri, // Store topic for later use
            subscriptionId: null, // Will be filled upon confirmation
            cancel: () => {
                // Method to cancel this specific subscription
                if (callbacks.subscriptionId) {
                    this.unsubscribe(callbacks.subscriptionId);
                } else {
                    if (this.clientConfiguration.enableDebugLogging) {
                        console.warn('WampConnector: Cannot cancel subscription: ID not yet received.');
                    }
                }
            }
        };
        this.pendingRequests[requestId] = callbacks;
        this._sendMessage(subscribeMessage);
        this.internalState.lastOperationStatus = IssueCodes.SUCCESS_STATUS;
        this.internalState.lastOperationStatus.requestId = requestId;
        return callbacks;
    };

    /**
     * Unsubscribes from a WAMP topic using its subscription ID.
     * @param {number} subscriptionId - The ID of the subscription to cancel.
     * @returns {Object} An object with `onSuccess` and `onError` methods for the unsubscription confirmation.
     */
    WampConnector.prototype.unsubscribe = function (subscriptionId) {
        const requestId = this._generateUniqueRequestId();
        if (requestId === -1) {
            this.internalState.lastOperationStatus = { ...IssueCodes.BAD_INPUT_PARAMETER, description: 'Failed to generate unique request ID.' };
            return { onSuccess: () => {}, onError: (e) => {} };
        }

        const subscription = this.activeSubscriptions[subscriptionId];
        if (!subscription) {
            this.internalState.lastOperationStatus = IssueCodes.NONEXISTENT_UNSUB_REQ;
            if (this.clientConfiguration.enableDebugLogging) {
                console.warn(`WampConnector: Attempted to unsubscribe from non-existent subscription ID: ${subscriptionId}`);
            }
            return { onSuccess: () => {}, onError: (e) => {} };
        }

        const unsubscribeMessage = [
            ProtocolOpCodes.UNSUBSCRIBE_TOPIC,
            requestId,
            subscriptionId
        ];

        const callbacks = {
            onSuccess: null,
            onError: null,
            subscriptionId: subscriptionId // Store for confirmation matching
        };
        this.pendingRequests[requestId] = callbacks;
        this._sendMessage(unsubscribeMessage);
        this.internalState.lastOperationStatus = IssueCodes.SUCCESS_STATUS;
        this.internalState.lastOperationStatus.requestId = requestId;
        return callbacks;
    };

    /**
     * Calls a WAMP RPC procedure.
     * @param {string} procedureUri - The URI of the procedure to call.
     * @param {Array<any>} [args] - Positional arguments for the call.
     * @param {Object} [kwargs] - Keyword arguments for the call.
     * @param {Object} [options] - Call options.
     * @returns {Object} An object with `onSuccess`, `onError`, and `cancel` methods.
     */
    WampConnector.prototype.call = function (procedureUri, args = [], kwargs = {}, options = {}) {
        const requestId = this._generateUniqueRequestId();
        if (requestId === -1) {
            this.internalState.lastOperationStatus = { ...IssueCodes.BAD_INPUT_PARAMETER, description: 'Failed to generate unique request ID.' };
            return { onSuccess: () => {}, onError: (e) => {} };
        }

        if (!isValidWampUri(procedureUri, true)) {
            this.internalState.lastOperationStatus = IssueCodes.INVALID_WAMP_URI;
            if (this.clientConfiguration.enableDebugLogging) {
                console.error(`WampConnector: Invalid procedure URI: ${procedureUri}`);
            }
            return { onSuccess: () => {}, onError: (e) => {} };
        }

        const callMessage = [
            ProtocolOpCodes.INVOKE_PROCEDURE,
            requestId,
            options,
            procedureUri,
            this._isInputArray(args) ? args : [],
            this._isInputPlainObject(kwargs) ? kwargs : {}
        ];

        const callbacks = {
            onSuccess: null,
            onError: null,
            cancel: () => {
                // Cancel RPC call
                const cancelMessage = [
                    ProtocolOpCodes.CANCEL_INVOCATION,
                    requestId,
                    {} // Options for cancel
                ];
                this._sendMessage(cancelMessage);
                if (this.clientConfiguration.enableDebugLogging) {
                    console.log(`WampConnector: Sent cancel for RPC call ID: ${requestId}`);
                }
                // Clear pending request immediately, as it's cancelled
                delete this.pendingRequests[requestId];
            }
        };
        this.pendingRequests[requestId] = callbacks;
        this._sendMessage(callMessage);
        this.internalState.lastOperationStatus = IssueCodes.SUCCESS_STATUS;
        this.internalState.lastOperationStatus.requestId = requestId;
        return callbacks;
    };

    /**
     * Registers a local function as a WAMP RPC procedure.
     * @param {string} procedureUri - The URI under which to register the procedure.
     * @param {function} handlerFunction - The local function to be called when the RPC is invoked.
     * @param {Object} [options] - Registration options.
     * @returns {Object} An object with `onSuccess`, `onError`, and `unregister` methods.
     */
    WampConnector.prototype.register = function (procedureUri, handlerFunction, options = {}) {
        const requestId = this._generateUniqueRequestId();
        if (requestId === -1) {
            this.internalState.lastOperationStatus = { ...IssueCodes.BAD_INPUT_PARAMETER, description: 'Failed to generate unique request ID.' };
            return { onSuccess: () => {}, onError: (e) => {} };
        }

        if (!isValidWampUri(procedureUri, true)) {
            this.internalState.lastOperationStatus = IssueCodes.INVALID_WAMP_URI;
            if (this.clientConfiguration.enableDebugLogging) {
                console.error(`WampConnector: Invalid procedure URI: ${procedureUri}`);
            }
            return { onSuccess: () => {}, onError: (e) => {} };
        }

        if (typeof handlerFunction !== 'function') {
            this.internalState.lastOperationStatus = IssueCodes.MISSING_CALLBACK_HANDLER;
            if (this.clientConfiguration.enableDebugLogging) {
                console.error('WampConnector: Register requires a handler function.');
            }
            return { onSuccess: () => {}, onError: (e) => {} };
        }

        // Check if procedure is already registered
        if (this.registeredProcedureNames.includes(procedureUri)) {
            this.internalState.lastOperationStatus = IssueCodes.PROCEDURE_ALREADY_REGISTERED;
            if (this.clientConfiguration.enableDebugLogging) {
                console.warn(`WampConnector: Procedure '${procedureUri}' is already registered.`);
            }
            return { onSuccess: () => {}, onError: (e) => {} };
        }

        const registerMessage = [
            ProtocolOpCodes.REGISTER_PROCEDURE,
            requestId,
            options,
            procedureUri
        ];

        const callbacks = {
            onSuccess: null,
            onError: null,
            onInvocation: handlerFunction,
            procedure: procedureUri, // Store procedure URI
            registrationId: null, // Will be filled upon confirmation
            unregister: () => {
                // Method to unregister this specific procedure
                if (callbacks.registrationId) {
                    this.unregister(callbacks.registrationId);
                } else {
                    if (this.clientConfiguration.enableDebugLogging) {
                        console.warn('WampConnector: Cannot unregister procedure: ID not yet received.');
                    }
                }
            }
        };
        this.pendingRequests[requestId] = callbacks;
        this._sendMessage(registerMessage);
        this.internalState.lastOperationStatus = IssueCodes.SUCCESS_STATUS;
        this.internalState.lastOperationStatus.requestId = requestId;
        return callbacks;
    };

    /**
     * Unregisters a previously registered RPC procedure.
     * @param {number} registrationId - The ID of the procedure registration to cancel.
     * @returns {Object} An object with `onSuccess` and `onError` methods for the unregistration confirmation.
     */
    WampConnector.prototype.unregister = function (registrationId) {
        const requestId = this._generateUniqueRequestId();
        if (requestId === -1) {
            this.internalState.lastOperationStatus = { ...IssueCodes.BAD_INPUT_PARAMETER, description: 'Failed to generate unique request ID.' };
            return { onSuccess: () => {}, onError: (e) => {} };
        }

        const registration = this.registeredProcedures[registrationId];
        if (!registration) {
            this.internalState.lastOperationStatus = IssueCodes.NONEXISTENT_UNSUB_REQ; // Reusing error code, could make a specific one
            if (this.clientConfiguration.enableDebugLogging) {
                console.warn(`WampConnector: Attempted to unregister non-existent registration ID: ${registrationId}`);
            }
            return { onSuccess: () => {}, onError: (e) => {} };
        }

        const unregisterMessage = [
            ProtocolOpCodes.UNREGISTER_PROCEDURE,
            requestId,
            registrationId
        ];

        const callbacks = {
            onSuccess: null,
            onError: null,
            registrationId: registrationId // Store for confirmation matching
        };
        this.pendingRequests[requestId] = callbacks;
        this._sendMessage(unregisterMessage);
        this.internalState.lastOperationStatus = IssueCodes.SUCCESS_STATUS;
        this.internalState.lastOperationStatus.requestId = requestId;
        return callbacks;
    };

    // Expose the WampConnector constructor
    return WampConnector;

});