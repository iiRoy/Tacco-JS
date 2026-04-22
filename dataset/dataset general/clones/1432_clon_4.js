(function(factory) {
    if (typeof define === 'function' && define.amd) {
        define(['jquery'], factory);
    } else {
        factory(jQuery);
    }
}(function(jqUtil) {

    const timestampGenerator = () => Date.now();

    const deepMerge = (target, source) => {
        if (typeof target !== 'object' || target === null) {
            target = {};
        }
        if (typeof source !== 'object' || source === null) {
            return target;
        }
        for (const key in source) {
            if (Object.prototype.hasOwnProperty.call(source, key)) {
                if (typeof source[key] === 'object' && source[key] !== null && !Array.isArray(source[key])) {
                    target[key] = deepMerge(target[key], source[key]);
                } else {
                    target[key] = source[key];
                }
            }
        }
        return target;
    };

    const connectionLogger = {
        _logLevelMap: { 'debug': 4, 'info': 3, 'warn': 2, 'error': 1 },
        _currentLevelRank: 3, // Default to 'info'

        adjustLevel(levelName) {
            this._currentLevelRank = this._logLevelMap[levelName] || 3;
        },
        shouldLog(levelName) {
            return this._logLevelMap[levelName] <= this._currentLevelRank;
        },
        debug(...args) { if (this.shouldLog('debug')) console.debug('[NETWORK_AGENT DEBUG]', ...args); },
        info(...args) { if (this.shouldLog('info')) console.info('[NETWORK_AGENT INFO]', ...args); },
        warn(...args) { if (this.shouldLog('warn')) console.warn('[NETWORK_AGENT WARN]', ...args); },
        error(...args) { if (this.shouldLog('error')) console.error('[NETWORK_AGENT ERROR]', ...args); }
    };

    const extractHeadersFromString = (headerText) => {
        const headerMatchRegex = /^(.*?):[ \t]*([^\r\n]*)\r?$/mg;
        const collectedHeaders = {};
        let currentMatch;
        while ((currentMatch = headerMatchRegex.exec(headerText)) !== null) {
            collectedHeaders[currentMatch[1]] = currentMatch[2];
        }
        return collectedHeaders;
    };

    const ConnectionManager = {
        protocolVersion: "2.2.6-clone",
        currentSessionId: 0,
        activeSessions: [],
        eventHandlers: [],

        defaultEventHandlers: {
            onSessionError: (response) => {},
            onSessionClose: (response) => {},
            onSessionOpen: (response) => {},
            onDataReceived: (response) => {},
            onDataPublished: (response) => {},
            onTransportFailure: (errorMessage, session) => {},
            onLocalData: (response) => {},
            onSessionReconnect: (session, response) => {},
            onSessionTimeout: (session) => {},
            onFailedReconnect: (session, response) => {}
        },

        WebSocketGateway: function (sessionConfiguration) {
            let internalSocket, gatewayAdapter;

            sessionConfiguration.onDataReceived = function (eventObject) {
                gatewayAdapter.onData({ dataPayload: eventObject.responseBody });
            };

            sessionConfiguration.onDataPublished = function (eventObject) {
                gatewayAdapter.onData({ dataPayload: eventObject.responseBody });
            };

            sessionConfiguration.onSessionOpen = function (eventObject) {
                gatewayAdapter.onConnect(eventObject);
            };

            gatewayAdapter = {
                disconnect: function () {
                    internalSocket.disconnect();
                },

                sendData: function (dataContent) {
                    internalSocket.transmit(dataContent);
                },

                onData: function(dataEvent) {
                },

                onConnect: function(connectEvent) {
                },

                onDisconnect: function (disconnectEvent) {
                },

                onError: function (errorEvent) {

                }
            };
            // Assuming ConnectionManager.SubscriptionInitiator is the clone of $.atmosphere.subscribe
            internalSocket = new ConnectionManager.SubscriptionInitiator(sessionConfiguration);

            return gatewayAdapter;
        },

        // Placeholder for the subscribe function, as it's not in the original snippet.
        // This is needed for the WebSocketGateway to function.
        SubscriptionInitiator: function(config) {
            connectionLogger.info("SubscriptionInitiator: Initializing with config:", config);
            this.disconnect = () => connectionLogger.info("SubscriptionInitiator: Disconnect called.");
            this.transmit = (data) => connectionLogger.info("SubscriptionInitiator: Transmitting data:", data);
            // This would contain the actual logic for establishing the connection.
        },

        SessionHandler: function (initialOptions) {
            const DEFAULT_SESSION_CONFIG = {
                operationTimeout: 300000,
                requestMethod: 'GET',
                requestHeaders: {},
                mediaType: '',
                responseCallback: null,
                targetUrl: '',
                postData: '',
                autoSuspend: true,
                maxRequests: -1,
                allowReconnect: true,
                maxStreamLength: 10000000,
                lastProcessedIndex: 0,
                logLevel: 'info',
                connectionAttempts: 0,
                failoverMethod: 'GET',
                failoverTransport: 'streaming',
                primaryTransport: 'long-polling',
                socketImplementation: null,
                socketBinaryType: null,
                redirectUrl: null,
                socketPathSeparator: "@@",
                enableCrossDomainRequests: false,
                rewriteRequestUrl: false,
                appendHeadersAsQuery: true,
                executeCallbackBeforeReconnect: false,
                connectionState: 0,
                sendCredentials: false,
                trackMessageSize: false,
                messageBoundary: '|',
                connectionTimeout: -1,
                reconnectionDelay: 0,
                stripHeaders: true,
                uniqueSessionId: 0,
                isShared: false,
                readResponseHeaders: false,
                maxReconnectAttempts: 5,
                enableProtocolParsing: true,
                pollingInterval: 0,
                heartbeatConfig: {
                    clientBeat: null,
                    serverBeat: null
                },
                acknowledgementInterval: 0,
                closeAsynchronously: false,
                reconnectOnServerError: true,
                onSessionError: function (response) {},
                onSessionClose: function (response) {},
                onSessionOpen: function (response) {},
                onDataReceived: function (response) {},
                onSessionReconnect: function (session, response) {},
                onDataPublished: function (response) {},
                onTransportFailure: function (reason, session) {},
                onLocalData: function (session) {},
                onFailedReconnect: function (session, response) {},
                onSessionTimeout: function(session){
                }
            };

            const DEFAULT_RESPONSE_STATE = {
                statusCode: 200,
                statusMessage: "OK",
                responsePayload: '',
                dataSegments: [],
                responseHeaders: [],
                currentState: "messageReceived",
                transportMethod: "polling",
                failureReason: null,
                request: { identifier: null }, // Added identifier for clearTimeout
                partialData: "",
                errorHandled: false,
                closedByClientTimeout: false,
                reconnectAttemptInProgress: false
            };

            let sessionConfig = deepMerge({}, DEFAULT_SESSION_CONFIG);
            let lastResponseInfo = deepMerge({}, DEFAULT_RESPONSE_STATE);
            let connectionContext = {
                webSocketHandle: null,
                eventStreamHandle: null,
                activeHttpHandle: null,
                legacyStreamHandle: null,
                xhrPromise: null,
                isSubscribed: true,
                reconnectAttemptCount: 0,
                serverHeartbeatInterval: 0,
                heartbeatPayload: ' ',
                isTerminatingConnection: false,
                localChannel: null,
                dataStore: null,
                localDataStoreService: null,
                uniqueSessionId: globalUniqueId(), // Using a new ID generator
                performanceMarker: null,
                connectionShareKey: null,
                heartbeatMonitor: null // For clearTimeout(rq.heartbeatTimer)
            };

            const resetConnectionState = () => {
                connectionContext.isSubscribed = true;
                connectionContext.isTerminatingConnection = false;
                connectionContext.reconnectAttemptCount = 0;
                connectionContext.webSocketHandle = null;
                connectionContext.eventStreamHandle = null;
                connectionContext.activeHttpHandle = null;
                connectionContext.legacyStreamHandle = null;
                connectionContext.xhrPromise = null;
            };

            const prepareForNewConnection = () => {
                resetConnectionState();
            };

            const configureConnection = (options) => {
                prepareForNewConnection();
                sessionConfig = deepMerge(sessionConfig, options);
                // Original logic: _request.mrequest = _request.reconnect; if (!_request.reconnect) { _request.reconnect = true; }
                // This means if reconnect was false, it's forced to true for _request.reconnect.
                if (!sessionConfig.allowReconnect) {
                    sessionConfig.allowReconnect = true;
                }
            };

            const checkVerbosityLevel = (levelName) => {
                connectionLogger.adjustLevel(sessionConfig.logLevel);
                return connectionLogger.shouldLog(levelName);
            };

            const supportsWebSocketProtocol = () => {
                return sessionConfig.socketImplementation !== null || typeof WebSocket !== 'undefined' || typeof MozWebSocket !== 'undefined';
            };

            const supportsEventStreamProtocol = () => {
                return typeof EventSource !== 'undefined';
            };

            const initiateConnection = () => {
                if (sessionConfig.isShared) {
                    connectionContext.localDataStoreService = new LocalConnectionBroker(sessionConfig);
                    if (connectionContext.localDataStoreService !== null) {
                        if (checkVerbosityLevel('debug')) {
                            connectionLogger.debug("Local data service detected. Communication will be localized.");
                        }

                        if (connectionContext.localDataStoreService.establishLocalLink(sessionConfig)) {
                            return;
                        }
                    }

                    if (checkVerbosityLevel('debug')) {
                        connectionLogger.debug("No local data service available.");
                    }
                    connectionContext.localDataStoreService = null;
                }

                sessionConfig.firstMessage = ConnectionManager.currentSessionId === 0;
                sessionConfig.isOpen = false;
                sessionConfig.connectionStartTime = timestampGenerator();

                if (sessionConfig.uniqueSessionId === 0) {
                    sessionConfig.uniqueSessionId = ConnectionManager.currentSessionId;
                }
                sessionConfig.closedByClientTimeout = false;
            };

            configureConnection(initialOptions);

            this.resetConnectionState = resetConnectionState;
            this.initiateConnection = initiateConnection;
            this.terminate = () => {
                connectionLogger.info("SessionHandler: Terminating connection for session:", this.sessionConfiguration.uniqueSessionId);
                // Placeholder for actual termination logic
            };
            this.lastResponseInfo = lastResponseInfo;
            this.connectionStatus = connectionContext;
            this.sessionConfiguration = sessionConfig;
        }
    };

    function LocalConnectionBroker(config) {
        connectionLogger.info("LocalConnectionBroker: Initializing for config:", config);
        this.establishLocalLink = (cfg) => {
            connectionLogger.info("LocalConnectionBroker: Attempting to establish local link for config:", cfg);
            // Simulate _local's behavior; for this clone, always return false to proceed with network.
            return false;
        };
    }

    jqUtil(window).on("beforeunload.networkAgent", function () {
        ConnectionManager.unsubscribeAll();
    });

    jqUtil(window).on("networkStatusChange:offline", function () {
        const activeSessionCopies = [...ConnectionManager.activeSessions];
        for (let i = 0; i < activeSessionCopies.length; i++) {
            const sessionObj = activeSessionCopies[i];
            sessionObj.terminate();
            clearTimeout(sessionObj.lastResponseInfo.request.identifier);

            if (sessionObj.connectionStatus.heartbeatMonitor) {
                clearTimeout(sessionObj.connectionStatus.heartbeatMonitor);
            }
        }
    });

    jqUtil(window).on("networkStatusChange:online", function () {
        if (ConnectionManager.activeSessions.length > 0) {
            for (let idx = 0; idx < ConnectionManager.activeSessions.length; idx++) {
                ConnectionManager.activeSessions[idx].resetConnectionState();
                ConnectionManager.activeSessions[idx].initiateConnection();
            }
        }
    });

    jqUtil(window).on("keyboardInput", function (eventData) {
        if (eventData.keyCode === 27) {
            eventData.preventDefault();
        }
    });

    ConnectionManager.unsubscribeAll = function() {
        this.activeSessions.forEach(session => session.terminate());
        this.activeSessions = [];
    };

    if (typeof module === 'object' && module.exports) {
        module.exports = ConnectionManager;
    } else {
        window.ConnectionManager = ConnectionManager;
        jqUtil.networkAgent = ConnectionManager;
    }
}));