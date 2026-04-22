(function(moduleEntry) {
    // Check for AMD loader like RequireJS
    if (typeof define === 'function' && define.amd) {
        // Asynchronous Module Definition: depends on 'jquery'
        define(['jquery'], moduleEntry);
    } else {
        // Standard browser global scope (window object)
        moduleEntry(window.jQuery);
    }
}(function(domContext) { // Renamed jQuery to domContext for internal use

    // Ensure proper cleanup when the window or tab is closed/navigated away.
    domContext(window).on("beforeunload.rtm", function() {
        // Disconnect all active subscriptions managed by our communication layer.
        domContext.realtimeComm.disconnectAll();
    });

    // Handle network going offline: terminate all active connections.
    domContext(window).on("offline.rtm", function() {
        // Create a copy to avoid issues if the original array is modified during iteration.
        const currentConnections = [...domContext.realtimeComm.activeSubscriptions];
        for (let idx = 0; idx < currentConnections.length; idx++) {
            const connectionHandle = currentConnections[idx];
            // Close the connection gracefully.
            connectionHandle.terminate();
            // Clear any pending reconnect timers for this request.
            if (connectionHandle.getConnectionId()) { // Assuming getConnectionId exists or similar logic
                clearTimeout(connectionHandle.getConnectionId());
            }

            // If a heartbeat timer is active, stop it.
            if (connectionHandle.heartbeatMonitor) {
                clearTimeout(connectionHandle.heartbeatMonitor);
            }
        }
    });

    // Handle network coming back online: attempt to re-establish connections.
    domContext(window).on("online.rtm", function() {
        if (domContext.realtimeComm.activeSubscriptions.length > 0) {
            // Re-initialize and re-execute each active subscription.
            domContext.realtimeComm.activeSubscriptions.forEach(function(currentConn) {
                currentConn.initialize(); // Renamed init()
                currentConn.startConnection(); // Renamed execute()
            });
        }
    });

    // Prevent the ESC key from interrupting active connections in certain browsers (e.g., Firefox).
    domContext(window).on("keydown", function(keyboardEvent) {
        if (keyboardEvent.key === 'Escape' || keyboardEvent.which === 27) { // Check both .key and .which for broader compatibility
            keyboardEvent.preventDefault(); // Stop default browser behavior.
        }
    });

    /**
     * Parses a raw HTTP header string into a key-value object.
     * @param {string} rawHeaderString The string containing HTTP headers.
     * @returns {Object.<string, string>} An object mapping header names to their values.
     */
    const decodeHeaderString = function(rawHeaderString) {
        const headerPattern = /^(.*?):[ \t]*([^\r\n]*)\r?$/mg;
        const parsedHeaders = {};
        let headerMatch;
        // Iterate through all matches found in the header string.
        while ((headerMatch = headerPattern.exec(rawHeaderString)) !== null) {
            if (headerMatch[1] && headerMatch[2]) {
                parsedHeaders[headerMatch[1].trim()] = headerMatch[2].trim();
            }
        }
        return parsedHeaders;
    };

    // The core communication management object.
    domContext.realtimeComm = {
        libVersion: "3.0.0-alpha", // Updated version string
        globalSessionId: 0, // Unique identifier for the current browser session.
        activeSubscriptions: [], // List of currently active subscription objects.
        eventListeners: [], // Generic callback storage.

        // Default event handlers, can be overridden by specific subscriptions.
        handleError: function(eventPayload) {},
        handleDisconnect: function(eventPayload) {},
        handleConnect: function(eventPayload) {},
        handleIncomingMessage: function(eventPayload) {},
        handleReconnectionAttempt: function(requestObj, eventPayload) {},
        handleOutgoingMessageConfirmation: function(eventPayload) {},
        handleTransportIssue: function(issueMessage, requestObj) {},
        handleLocalBroadcast: function(eventPayload) {},
        handleClientInactivity: function(requestObj) {},
        handleFailedReconnection: function(requestObj, eventPayload) {},

        /**
         * Provides a WebSocket-like API wrapper for internal subscription objects.
         * Simplifies interaction with the underlying communication mechanism.
         *
         * @class SocketInterfaceWrapper
         * @param {Object} subscriptionOptions Configuration for the underlying subscription.
         * @constructor
         */
        SocketInterfaceWrapper: function(subscriptionOptions) {
            let internalSocketInstance;
            let publicSocketApi; // The object exposed to the user.

            // Overrides the onMessage callback in the given request config.
            subscriptionOptions.onDataReceived = function(messageEvent) {
                publicSocketApi.onMessageReceived({
                    data: messageEvent.receivedBody
                });
            };

            // Overrides the onMessagePublished callback.
            subscriptionOptions.onOutgoingConfirmation = function(confirmEvent) {
                publicSocketApi.onMessageReceived({
                    data: confirmEvent.receivedBody
                });
            };

            // Overrides the onOpen callback to proxy the event to the adapter.
            subscriptionOptions.onConnectionOpened = function(connectEvent) {
                publicSocketApi.onConnectionOpen(connectEvent);
            };

            // Define the public API for the socket wrapper.
            publicSocketApi = {
                // Closes the underlying communication channel.
                closeConnection: function() {
                    internalSocketInstance.terminate();
                },

                // Sends data through the channel.
                sendData: function(payload) {
                    internalSocketInstance.pushPayload(payload);
                },

                // Callback for incoming messages.
                onMessageReceived: function(messageEvent) {},

                // Callback for connection establishment.
                onConnectionOpen: function(connectEvent) {},

                // Callback for connection closure.
                onConnectionClosed: function(closeEvent) {},

                // Callback for errors.
                onErrorOccurred: function(errorEvent) {}
            };
            // Create the actual subscription using the manager.
            internalSocketInstance = new domContext.realtimeComm.createSubscription(subscriptionOptions);

            return publicSocketApi;
        },

        /**
         * Manages the configuration and lifecycle of an Atmosphere-like subscription.
         * This class encapsulates all parameters and state for a single connection.
         *
         * @class ChannelSubscriptionConfigurator
         * @param {Object} initialSettings Initial configuration for the subscription.
         * @constructor
         */
        createSubscription: function(initialSettings) {

            // Default configuration for a new subscription.
            // Using let/const for better scope management.
            let config = {
                connectionTimeoutMs: 300000,
                httpMethod: 'GET',
                httpHeaders: {},
                requestContentType: '',
                onDataCallback: null,
                targetUrl: '',
                postPayload: '',
                autoSuspendConnection: true,
                maxRetries: -1,
                enableAutoReconnect: true,
                maxStreamLengthBytes: 10000000,
                lastProcessedIndex: 0,
                debugLevel: 'info',
                attemptCount: 0,
                altHttpMethod: 'GET',
                altTransportMechanism: 'streaming',
                preferredTransport: 'long-polling',
                customWebSocketProvider: null,
                binaryDataFormat: null,
                redirectUrl: null,
                pathSeparator: "@@",
                xdrEnabled: false,
                rewriteTargetUrl: false,
                headersAsQueryParams: true,
                invokeCallbackBeforeReconnect: false,
                connectionState: 0, // 0: CONNECTING, 1: OPEN, 2: CLOSING, 3: CLOSED
                sendCredentials: false,
                monitorPayloadLength: false,
                payloadDelimiter: '|',
                initialConnectTimeoutMs: -1,
                reconnectDelayMs: 0,
                omitHttpHeaders: true,
                sessionIdentifier: 0,
                sharedAcrossTabs: false,
                parseResponseHeaders: false,
                maxReconnectAttemptsOnClose: 5,
                protocolEnabled: true,
                pollingFrequencyMs: 0,
                heartbeatConfig: {
                    clientInterval: null,
                    serverInterval: null
                },
                acknowledgementIntervalMs: 0,
                asyncDisconnect: false,
                autoReconnectOnServerError: true,
                // Localized event handlers for this specific subscription
                onConnectionError: function(response) {},
                onConnectionClosed: function(response) {},
                onConnectionOpened: function(response) {},
                onDataReceived: function(response) {},
                onReopenRequest: function(request, response) {},
                onReconnectionAttempt: function(request, response) {},
                onOutgoingConfirmation: function(response) {},
                onTransportIssue: function(reason, request) {},
                onLocalDataBroadcast: function(request) {},
                onClientActivityTimeout: function(request) {},
                onFailedToReconnect: function(request, response) {}
            };

            // Holds the most recent response details.
            let lastResponseStatus = {
                statusCode: 200,
                statusText: "OK",
                receivedBody: '',
                parsedMessages: [],
                responseHeaders: {},
                currentStatus: "dataReceived", // Renamed state
                usedTransport: "polling", // Renamed transport
                lastError: null,
                associatedRequest: null, // Reference to the parent request object
                incompleteMessageSegment: "",
                errorProcessed: false,
                disconnectedByClientTimeout: false,
                firefoxReconnecting: false
            };

            let activeWebSocket = null; // Currently active WebSocket instance.
            let activeEventSource = null; // Currently active EventSource instance.
            let xhrConnection = null; // Active XMLHttpRequest for HTTP transports.
            let ieStreamHandler = null; // Special object for IE streaming.
            let jsonpRequestObject = null; // Object for JSONP transport.

            let isSubscribed = true; // Flag indicating if the subscription is active.
            let reconnectionAttemptCounter = 0; // Counts reconnection attempts.

            let serverHeartbeatPeriod = 0; // Heartbeat interval from the server.
            let heartbeatFiller = ' '; // Padding characters for heartbeat.

            let isAbortingConnection = false; // Flag if connection is being deliberately aborted.
            let localCommunicationChannel = null; // For local/tab-shared communication.
            let tabSyncService; // Service for inter-tab synchronization.
            let localTabStorage = null; // Local storage service instance.

            const instanceId = Date.now() + Math.random().toString(36).substring(2, 9); // Unique ID for this instance.
            let operationTimer; // Timer for measuring operation durations.
            let connectionSharingKey; // Key for shared connection instances.

            // Automatically kick off the subscription process.
            initializeSubscription(initialSettings);

            /**
             * Resets key connection state variables.
             * @private
             */
            function resetConnectionState() {
                isSubscribed = true;
                isAbortingConnection = false;
                reconnectionAttemptCounter = 0;

                activeWebSocket = null;
                activeEventSource = null;
                xhrConnection = null;
                ieStreamHandler = null;
                jsonpRequestObject = null;
            }

            /**
             * Performs a full re-initialization of the component.
             * @private
             */
            function reinitializeComponent() {
                resetConnectionState();
                // If a _clearState method was implied, it would go here. For now, resetConnectionState covers it.
            }

            /**
             * Determines if a log message should be output based on configured debug level.
             * @param {string} logSeverity The severity level of the message (e.g., 'debug', 'info', 'warn', 'error').
             * @returns {boolean} True if the message should be logged, false otherwise.
             * @private
             */
            function shouldLog(logSeverity) {
                const levels = {
                    'debug': 0,
                    'info': 1,
                    'warn': 2,
                    'error': 3,
                    'none': 4
                };
                const currentLevel = levels[config.debugLevel] !== undefined ? levels[config.debugLevel] : levels['info'];
                const messageLevel = levels[logSeverity] !== undefined ? levels[logSeverity] : levels['info'];
                return messageLevel >= currentLevel;
            }

            /**
             * Initiates or updates the subscription based on provided options.
             * @param {Object} options Configuration parameters for the subscription.
             * @private
             */
            function initializeSubscription(options) {
                if (!options) {
                    if (shouldLog('warn')) {
                        domContext.realtimeComm.handleTransportIssue("Subscription options are missing.", null);
                    }
                    return;
                }

                reinitializeComponent();

                // Merge default configuration with provided options.
                // Using Object.assign for merging, a modern alternative to jQuery.extend.
                config = Object.assign({}, config, options);

                // Ensure reconnect is enabled if maxRetries is set.
                if (config.maxRetries > 0) {
                    config.enableAutoReconnect = true;
                }
            }

            /**
             * Checks if WebSocket functionality is available.
             * @returns {boolean} True if WebSocket is supported, false otherwise.
             * @private
             */
            function isWebSocketSupported() {
                return config.customWebSocketProvider !== null || window.WebSocket !== undefined || window.MozWebSocket !== undefined;
            }

            /**
             * Checks if Server-Sent Events (SSE) functionality is available.
             * @returns {boolean} True if SSE is supported, false otherwise.
             * @private
             */
            function isEventSourceSupported() {
                return window.EventSource !== undefined;
            }

            /**
             * Executes the connection using the configured transport.
             * Handles shared connection logic and initial setup.
             * @private
             */
            function initiateConnection() {
                // Handle shared connections across multiple browser tabs/windows.
                if (config.sharedAcrossTabs) {
                    // Placeholder for actual local storage helper.
                    // In a real implementation, `getLocalStorageHelper` would return an object
                    // that manages communication via localStorage/BroadcastChannel.
                    localTabStorage = (function(cfg) {
                        // Dummy implementation for cloning purposes.
                        // In a real scenario, this would involve complex logic
                        // to establish inter-tab communication.
                        if (typeof localStorage !== 'undefined') {
                            return {
                                open: function(cfg) {
                                    if (shouldLog('debug')) {
                                        domContext.realtimeComm.logDebug("Attempting to open shared local storage channel.");
                                    }
                                    // Simulate successful opening if a key exists
                                    const sharedKey = cfg.targetUrl + "_" + cfg.sessionIdentifier;
                                    if (localStorage.getItem(sharedKey + "_active")) {
                                        if (shouldLog('debug')) {
                                            domContext.realtimeComm.logDebug("Shared channel already active, connecting locally.");
                                        }
                                        return true; // Simulate local connection.
                                    }
                                    localStorage.setItem(sharedKey + "_active", Date.now());
                                    return false; // Simulate not found or new channel.
                                },
                                close: function(cfg) {
                                    const sharedKey = cfg.targetUrl + "_" + cfg.sessionIdentifier;
                                    localStorage.removeItem(sharedKey + "_active");
                                },
                                send: function(msg) {
                                    console.log("Local storage send:", msg);
                                }
                            };
                        }
                        return null;
                    })(config);

                    if (localTabStorage !== null) {
                        if (shouldLog('debug')) {
                            domContext.realtimeComm.logDebug("Local storage service detected. All communication will be handled locally.");
                        }

                        if (localTabStorage.open(config)) {
                            // If local storage successfully opened a shared channel, we're done.
                            return;
                        }
                    }

                    if (shouldLog('debug')) {
                        domContext.realtimeComm.logDebug("No local storage service available or shared channel not active.");
                    }
                    localTabStorage = null; // Ensure it's null if not used or failed.
                }

                // Prepare connection metadata.
                config.isFirstMessage = domContext.realtimeComm.globalSessionId === 0;
                config.connectionOpen = false;
                config.connectionTimestamp = Date.now();

                // Propagate UUID if it's already set from a previous connection or user.
                if (config.sessionIdentifier === 0) {
                    config.sessionIdentifier = domContext.realtimeComm.globalSessionId;
                }
                config.disconnectedByClientTimeout = false;

                // --- Additional Type III changes: Guard clauses, simplified logging, new variables ---
                if (!config.targetUrl) {
                    if (shouldLog('error')) {
                        domContext.realtimeComm.handleTransportIssue("Connection attempt failed: No target URL provided.", null);
                    }
                    return; // Early exit if no URL.
                }

                // Example of adding an intermediate step or helper variable
                const currentTransportOption = config.preferredTransport.toLowerCase();
                const isWebSocketPreferred = currentTransportOption === 'websocket';
                const isSsePreferred = currentTransportOption === 'sse';

                if (isWebSocketPreferred && !isWebSocketSupported()) {
                    if (shouldLog('warn')) {
                        domContext.realtimeComm.handleTransportIssue("WebSocket transport preferred but not supported. Falling back to: " + config.altTransportMechanism, config);
                    }
                    config.preferredTransport = config.altTransportMechanism; // Fallback
                } else if (isSsePreferred && !isEventSourceSupported()) {
                    if (shouldLog('warn')) {
                        domContext.realtimeComm.handleTransportIssue("SSE transport preferred but not supported. Falling back to: " + config.altTransportMechanism, config);
                    }
                    config.preferredTransport = config.altTransportMechanism; // Fallback
                }

                // Placeholder for actual connection logic (Type III: simplified, focusing on config)
                // In a full clone, this would trigger the actual AJAX/WebSocket/SSE connection.
                if (shouldLog('info')) {
                    domContext.realtimeComm.handleConnect({
                        message: `Initiating connection to ${config.targetUrl} using ${config.preferredTransport}.`
                    });
                }
            }

            // Public interface for the ChannelSubscriptionConfigurator instance.
            return {
                initialize: resetConnectionState, // Expose reset as initialize
                startConnection: initiateConnection, // Expose execute as startConnection
                terminate: function() {
                    isAbortingConnection = true;
                    if (shouldLog('info')) {
                        domContext.realtimeComm.handleDisconnect({
                            message: "Connection explicitly terminated by client."
                        });
                    }
                    // In a full implementation, this would close activeWebSocket, xhrConnection etc.
                    if (localTabStorage) {
                        localTabStorage.close(config);
                    }
                },
                getConnectionId: function() {
                    return instanceId;
                },
                hasHeartbeat: function() {
                    return !!this.heartbeatMonitor; // Check if heartbeatMonitor property exists and is not null/undefined
                },
                // Expose config for debugging/inspection (Type III: simplified getter)
                getConfig: function() {
                    return { ...config
                    };
                },
                pushPayload: function(data) {
                    if (shouldLog('debug')) {
                        domContext.realtimeComm.handleOutgoingMessageConfirmation({
                            message: "Simulating sending data: " + data
                        });
                    }
                    // Actual send logic would go here.
                }
            };
        }
    };
}));