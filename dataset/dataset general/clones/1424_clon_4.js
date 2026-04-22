const GlobalCommLink = (function() {

    let activeClientConnections = [];
    let nextConnectionIdentifier = 0;

    const interpretHeaderString = (textData) => {
        const headerMap = {};
        if (!textData) return headerMap;

        const lines = textData.split(/\r?\n/);
        for (const line of lines) {
            const separatorIndex = line.indexOf(':');
            if (separatorIndex > 0) {
                const key = line.substring(0, separatorIndex).trim();
                const value = line.substring(separatorIndex + 1).trim();
                headerMap[key] = value;
            }
        }
        return headerMap;
    };

    const generateUniqueHandle = () => {
        return `client_${Date.now()}_${nextConnectionIdentifier++}`;
    };

    const outputLog = (level, messages) => {
        if (typeof console !== 'undefined' && console[level]) {
            console[level](...messages);
        }
    };

    const globalEventDispatch = {
        signalError: (data) => {},
        signalClosure: (data) => {},
        signalOpening: (data) => {},
        signalMessage: (data) => {},
        signalReconnection: (requestData, responseData) => {},
        signalPublication: (data) => {},
        signalTransportFailure: (reason, requestData) => {}
    };

    const cleanUpOnUnload = () => {
        activeClientConnections.forEach(conn => {
            if (typeof conn.terminateConnection === 'function') {
                conn.terminateConnection(false);
            }
        });
        activeClientConnections = [];
    };

    if (typeof window !== 'undefined') {
        window.addEventListener('unload', cleanUpOnUnload);
    }

    class ConnectionInitiator {
        #currentOptions;
        #currentResponseState;
        #uniqueId;
        #socketInstance;
        #eventStreamInstance;
        #fetchAbortController;
        #jsonpScriptElement;
        #jsonpCallbackName; // To keep track of the global JSONP callback
        #connectionStateFlags;
        #reconnectionAttempts;
        #reconnectionTimer;

        constructor(config) {
            const defaultRequestParameters = {
                waitDuration: 300000,
                requestMethod: 'GET',
                requestHeaders: {},
                contentType: '',
                completionCallback: null,
                targetUrl: '',
                payloadData: '',
                maintainConnection: true,
                maximumRetries: 60,
                autoReconnect: true,
                maxStreamLength: 10000000,
                lastProcessedIndex: 0,
                loggingLevel: 'info',
                fallbackRequestType: 'GET',
                fallbackProtocol: 'streaming',
                preferredProtocol: 'long-polling',
                customWebSocketProvider: null,
                webSocketEndpoint: null,
                webSocketDelimiter: "@@",
                enableXDomainRequest: false,
                rewriteRequestUrl: false,
                includeHeadersInQuery: true,
                executeCallbackBeforeRetry: false,
                connectionStage: 0,
                lastInteractionTime: 0,
                credentialsRequired: false,
                trackPayloadLength: false,
                messageSplitter: '|',
                connectionTimeout: -1,
                suppressAtmosphereHeaders: false,
                onConnectionError: (resp) => {},
                onConnectionClose: (resp) => {},
                onConnectionOpen: (resp) => {},
                onMessageReceived: (resp) => {},
                onConnectionRetry: (req, resp) => {},
                onMessageBroadcast: (resp) => {},
                onProtocolFailure: (reason, req) => {}
            };

            const defaultResponseParameters = {
                statusCode: 200,
                responseContent: '',
                expectedContentSize: -1,
                responseHeaders: {},
                statusText: "messageReceived",
                usedProtocol: "polling",
                errorDetails: null,
                associatedRequest: null,
                messageIdentifier: 0
            };

            this.#currentOptions = { ...defaultRequestParameters, ...config };
            this.#currentResponseState = { ...defaultResponseParameters };
            this.#uniqueId = generateUniqueHandle();

            this.#connectionStateFlags = {
                isSubscribed: true,
                isAborting: false
            };
            this.#reconnectionAttempts = 0;
            this.#reconnectionTimer = null;

            this.#resetConnectionObjects();

            this.initiateConnection(config);
        }

        #resetConnectionObjects() {
            this.#socketInstance = null;
            this.#eventStreamInstance = null;
            if (this.#fetchAbortController) {
                this.#fetchAbortController.abort('Connection reset');
            }
            this.#fetchAbortController = null;
            if (this.#jsonpScriptElement && this.#jsonpScriptElement.parentNode) {
                this.#jsonpScriptElement.parentNode.removeChild(this.#jsonpScriptElement);
            }
            if (this.#jsonpCallbackName && typeof window[this.#jsonpCallbackName] === 'function') {
                delete window[this.#jsonpCallbackName];
            }
            this.#jsonpScriptElement = null;
            this.#jsonpCallbackName = null;
            clearTimeout(this.#reconnectionTimer);
            this.#reconnectionTimer = null;
        }

        #prepareForNewAttempt() {
            this.#resetConnectionObjects();
            this.#connectionStateFlags.isSubscribed = true;
            this.#connectionStateFlags.isAborting = false;
            this.#reconnectionAttempts = 0;
            this.#currentResponseState = {
                statusCode: 200,
                responseContent: '',
                expectedContentSize: -1,
                responseHeaders: {},
                statusText: "messageReceived",
                usedProtocol: "polling",
                errorDetails: null,
                associatedRequest: null,
                messageIdentifier: 0
            };
        }

        initiateConnection(options) {
            this.#prepareForNewAttempt();
            this.#currentOptions = { ...this.#currentOptions, ...options };
            this.#uniqueId = generateUniqueHandle();

            GlobalCommLink.addActiveConnection(this);

            this.#startTransmission();
        }

        #constructQueryUrl() {
            let url = new URL(this.#currentOptions.targetUrl, typeof window !== 'undefined' ? window.location.origin : 'http://localhost');
            const params = url.searchParams;

            if (this.#currentOptions.includeHeadersInQuery) {
                Object.entries(this.#currentOptions.requestHeaders).forEach(([key, value]) => {
                    params.append(`X-Atmosphere-Request.${key}`, value);
                });
                params.append('X-Atmosphere-Transport', this.#currentOptions.preferredProtocol);
                params.append('X-Atmosphere-TrackMessageLength', this.#currentOptions.trackPayloadLength ? 'true' : 'false');
            }

            if (this.#currentOptions.payloadData && this.#currentOptions.requestMethod === 'GET') {
                params.append("X-Atmosphere-Post-Body", this.#currentOptions.payloadData);
            }

            url.search = params.toString();
            return url.toString();
        }

        #dispatchConnectionEvent(eventTypeName, content, status = 200, protocol = this.#currentOptions.preferredProtocol, error = null) {
            this.#currentResponseState.associatedRequest = { ...this.#currentOptions, id: this.#uniqueId };
            this.#currentResponseState.responseContent = content;
            this.#currentResponseState.statusCode = status;
            this.#currentResponseState.statusText = eventTypeName;
            this.#currentResponseState.usedProtocol = protocol;
            this.#currentResponseState.errorDetails = error;

            switch (eventTypeName) {
                case 'opening':
                    this.#currentOptions.onConnectionOpen(this.#currentResponseState);
                    globalEventDispatch.signalOpening(this.#currentResponseState);
                    break;
                case 'messageReceived':
                    this.#currentOptions.onMessageReceived(this.#currentResponseState);
                    globalEventDispatch.signalMessage(this.#currentResponseState);
                    break;
                case 'error':
                    this.#currentOptions.onConnectionError(this.#currentResponseState);
                    globalEventDispatch.signalError(this.#currentResponseState);
                    break;
                case 'closed':
                    this.#currentOptions.onConnectionClose(this.#currentResponseState);
                    globalEventDispatch.signalClosure(this.#currentResponseState);
                    break;
                case 'reconnecting':
                    this.#currentOptions.onConnectionRetry(this.#currentOptions, this.#currentResponseState);
                    globalEventDispatch.signalReconnection(this.#currentOptions, this.#currentResponseState);
                    break;
                case 'messagePublished':
                    this.#currentOptions.onMessageBroadcast(this.#currentResponseState);
                    globalEventDispatch.signalPublication(this.#currentResponseState);
                    break;
                case 'transportFailure':
                    this.#currentOptions.onProtocolFailure(error, this.#currentOptions);
                    globalEventDispatch.signalTransportFailure(error, this.#currentOptions);
                    break;
            }
        }

        #announceOpening(protocol) {
            const currentProtocol = this.#currentResponseState.usedProtocol;
            this.#currentResponseState.usedProtocol = protocol;
            this.#dispatchConnectionEvent('opening', '', 200, protocol);
            this.#currentResponseState.usedProtocol = currentProtocol;
        }

        #handleReconnectionAttempt(delay = 1000) {
            if (!this.#connectionStateFlags.isSubscribed || this.#connectionStateFlags.isAborting || !this.#currentOptions.autoReconnect) {
                outputLog(this.#currentOptions.loggingLevel, ["Reconnection aborted due to state or autoReconnect setting."]);
                return;
            }

            this.#reconnectionAttempts++;
            if (this.#reconnectionAttempts > this.#currentOptions.maximumRetries) {
                outputLog(this.#currentOptions.loggingLevel, [`Maximum reconnection attempts (${this.#currentOptions.maximumRetries}) reached.`]);
                this.#dispatchConnectionEvent('error', 'Maximum reconnection attempts reached', 0, this.#currentOptions.preferredProtocol, 'max_retries');
                this.terminateConnection(false);
                return;
            }

            this.#dispatchConnectionEvent('reconnecting', 'Attempting to reconnect', 0, this.#currentOptions.preferredProtocol, 'reconnecting');

            this.#reconnectionTimer = setTimeout(() => {
                if (this.#currentOptions.executeCallbackBeforeRetry) {
                    this.#dispatchConnectionEvent('reconnecting', 'Executing callback before retry', 0, this.#currentOptions.preferredProtocol, 'pre_retry_callback');
                }
                this.#startTransmission();
            }, delay);
        }

        #canUseWebSocket() {
            return this.#currentOptions.customWebSocketProvider !== null || (typeof window !== 'undefined' && (window.WebSocket || window.MozWebSocket));
        }

        #canUseEventSource() {
            return typeof window !== 'undefined' && window.EventSource;
        }

        #startTransmission() {
            if (!this.#connectionStateFlags.isSubscribed) return;

            const protocol = this.#currentOptions.preferredProtocol;

            if (protocol === 'websocket') {
                if (!this.#canUseWebSocket()) {
                    outputLog(this.#currentOptions.loggingLevel, ["WebSocket not supported. Falling back to " + this.#currentOptions.fallbackProtocol]);
                    this.#dispatchConnectionEvent('transportFailure', 'WebSocket not supported', 0, protocol, 'no_websocket_support');
                    this.#currentOptions.preferredProtocol = this.#currentOptions.fallbackProtocol;
                    this.#handleReconnectionAttempt(1);
                } else {
                    this.#initiateWebSocketConnection();
                }
            } else if (protocol === 'sse') {
                if (!this.#canUseEventSource()) {
                    outputLog(this.#currentOptions.loggingLevel, ["Server-Sent Events not supported. Falling back to " + this.#currentOptions.fallbackProtocol]);
                    this.#dispatchConnectionEvent('transportFailure', 'SSE not supported', 0, protocol, 'no_sse_support');
                    this.#currentOptions.preferredProtocol = this.#currentOptions.fallbackProtocol;
                    this.#handleReconnectionAttempt(1);
                } else {
                    this.#initiateEventSourceConnection();
                }
            } else if (protocol === 'jsonp') {
                this.#initiateJsonpRequest();
            } else {
                this.#initiateFetchRequest();
            }
        }

        #initiateWebSocketConnection() {
            const wsUrl = this.#constructQueryUrl().replace(/^http/, "ws");
            outputLog(this.#currentOptions.loggingLevel, [`Establishing WebSocket connection to: ${wsUrl}`]);

            try {
                this.#socketInstance = this.#currentOptions.customWebSocketProvider || (window.WebSocket ? new WebSocket(wsUrl) : new MozWebSocket(wsUrl));

                this.#socketInstance.onopen = () => {
                    outputLog(this.#currentOptions.loggingLevel, ["WebSocket connection opened."]);
                    this.#announceOpening('websocket');
                    this.#reconnectionAttempts = 0;
                };

                this.#socketInstance.onmessage = (event) => {
                    outputLog(this.#currentOptions.loggingLevel, ["WebSocket message received:", event.data]);
                    this.#dispatchConnectionEvent('messageReceived', event.data, 200, 'websocket');
                };

                this.#socketInstance.onclose = (event) => {
                    outputLog(this.#currentOptions.loggingLevel, ["WebSocket connection closed:", event]);
                    if (!this.#connectionStateFlags.isAborting && this.#currentOptions.autoReconnect) {
                        this.#handleReconnectionAttempt();
                    } else {
                        this.#dispatchConnectionEvent('closed', 'WebSocket closed', event.code, 'websocket', event.reason);
                    }
                };

                this.#socketInstance.onerror = (error) => {
                    outputLog(this.#currentOptions.loggingLevel, ["WebSocket error:", error]);
                    this.#dispatchConnectionEvent('error', 'WebSocket error', 0, 'websocket', error);
                };
            } catch (e) {
                outputLog(this.#currentOptions.loggingLevel, ["Failed to establish WebSocket connection:", e]);
                this.#dispatchConnectionEvent('error', 'WebSocket connection failed', 0, 'websocket', e.message);
                if (!this.#connectionStateFlags.isAborting) {
                    this.#handleReconnectionAttempt();
                }
            }
        }

        #initiateEventSourceConnection() {
            const sseUrl = this.#constructQueryUrl();
            outputLog(this.#currentOptions.loggingLevel, [`Establishing EventSource connection to: ${sseUrl}`]);

            try {
                this.#eventStreamInstance = new window.EventSource(sseUrl);

                this.#eventStreamInstance.onopen = () => {
                    outputLog(this.#currentOptions.loggingLevel, ["EventSource connection opened."]);
                    this.#announceOpening('sse');
                    this.#reconnectionAttempts = 0;
                };

                this.#eventStreamInstance.onmessage = (event) => {
                    outputLog(this.#currentOptions.loggingLevel, ["EventSource message received:", event.data]);
                    this.#dispatchConnectionEvent('messageReceived', event.data, 200, 'sse');
                };

                this.#eventStreamInstance.onerror = (error) => {
                    outputLog(this.#currentOptions.loggingLevel, ["EventSource error:", error]);
                    this.#dispatchConnectionEvent('error', 'EventSource error', 0, 'sse', error);
                    // EventSource has built-in reconnection, but we might intervene for explicit fallback
                    // or if it enters a permanent error state.
                };
            } catch (e) {
                outputLog(this.#currentOptions.loggingLevel, ["Failed to establish EventSource connection:", e]);
                this.#dispatchConnectionEvent('error', 'EventSource connection failed', 0, 'sse', e.message);
                if (!this.#connectionStateFlags.isAborting) {
                    this.#handleReconnectionAttempt();
                }
            }
        }

        #initiateFetchRequest() {
            const fetchUrl = this.#constructQueryUrl();
            outputLog(this.#currentOptions.loggingLevel, [`Initiating Fetch request to: ${fetchUrl}`]);

            this.#fetchAbortController = new AbortController();
            const signal = this.#fetchAbortController.signal;

            const fetchOptions = {
                method: this.#currentOptions.requestMethod,
                headers: this.#currentOptions.requestHeaders,
                signal: signal,
                credentials: this.#currentOptions.credentialsRequired ? 'include' : 'omit'
            };

            if (this.#currentOptions.requestMethod !== 'GET' && this.#currentOptions.payloadData) {
                fetchOptions.body = this.#currentOptions.payloadData;
            }

            this.#announceOpening('fetch');

            fetch(fetchUrl, fetchOptions)
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    return response.text();
                })
                .then(data => {
                    outputLog(this.#currentOptions.loggingLevel, ["Fetch request successful:", data]);
                    this.#reconnectionAttempts = 0;

                    this.#dispatchConnectionEvent('messageReceived', data, 200, 'fetch');
                    this.#handleReconnectionAttempt();
                })
                .catch(error => {
                    if (error.name === 'AbortError') {
                        outputLog(this.#currentOptions.loggingLevel, ["Fetch request aborted:", error.message]);
                        this.#dispatchConnectionEvent('closed', 'Fetch aborted', 0, 'fetch', error.message);
                    } else {
                        outputLog(this.#currentOptions.loggingLevel, ["Fetch request failed:", error]);
                        this.#dispatchConnectionEvent('error', 'Fetch error', 0, 'fetch', error.message);
                        if (!this.#connectionStateFlags.isAborting) {
                            this.#handleReconnectionAttempt();
                        }
                    }
                });
        }

        #initiateJsonpRequest() {
            this.#jsonpCallbackName = `jsonpResponseHandler_${this.#uniqueId}`;
            const jsonpUrl = new URL(this.#constructQueryUrl());
            jsonpUrl.searchParams.append(this.#currentOptions.jsonp || 'callback', this.#jsonpCallbackName);
            outputLog(this.#currentOptions.loggingLevel, [`Initiating JSONP request to: ${jsonpUrl.toString()}`]);

            this.#announceOpening('jsonp');

            window[this.#jsonpCallbackName] = (data) => {
                outputLog(this.#currentOptions.loggingLevel, ["JSONP response received:", data]);
                this.#reconnectionAttempts = 0;

                try {
                    this.#dispatchConnectionEvent('messageReceived', JSON.stringify(data), 200, 'jsonp');
                    this.#handleReconnectionAttempt();
                } finally {
                    delete window[this.#jsonpCallbackName];
                    this.#jsonpCallbackName = null;
                    if (this.#jsonpScriptElement && this.#jsonpScriptElement.parentNode) {
                        this.#jsonpScriptElement.parentNode.removeChild(this.#jsonpScriptElement);
                        this.#jsonpScriptElement = null;
                    }
                }
            };

            this.#jsonpScriptElement = document.createElement('script');
            this.#jsonpScriptElement.src = jsonpUrl.toString();
            this.#jsonpScriptElement.async = true;

            this.#jsonpScriptElement.onerror = (error) => {
                outputLog(this.#currentOptions.loggingLevel, ["JSONP script load error:", error]);
                this.#dispatchConnectionEvent('error', 'JSONP script load error', 0, 'jsonp', 'script_load_failure');
                delete window[this.#jsonpCallbackName];
                this.#jsonpCallbackName = null;
                if (this.#jsonpScriptElement && this.#jsonpScriptElement.parentNode) {
                    this.#jsonpScriptElement.parentNode.removeChild(this.#jsonpScriptElement);
                    this.#jsonpScriptElement = null;
                }
                if (!this.#connectionStateFlags.isAborting) {
                    this.#handleReconnectionAttempt();
                }
            };

            document.head.appendChild(this.#jsonpScriptElement);
        }

        terminateConnection(shouldAttemptReconnect = false) {
            this.#connectionStateFlags.isAborting = true;
            this.#connectionStateFlags.isSubscribed = false;
            clearTimeout(this.#reconnectionTimer);
            this.#reconnectionTimer = null;

            if (this.#socketInstance) {
                this.#socketInstance.close();
                this.#socketInstance = null;
            }
            if (this.#eventStreamInstance) {
                this.#eventStreamInstance.close();
                this.#eventStreamInstance = null;
            }
            if (this.#fetchAbortController) {
                this.#fetchAbortController.abort('Manual termination');
                this.#fetchAbortController = null;
            }
            if (this.#jsonpScriptElement && this.#jsonpScriptElement.parentNode) {
                if (this.#jsonpCallbackName && typeof window[this.#jsonpCallbackName] === 'function') {
                    delete window[this.#jsonpCallbackName];
                }
                this.#jsonpScriptElement.parentNode.removeChild(this.#jsonpScriptElement);
                this.#jsonpScriptElement = null;
                this.#jsonpCallbackName = null;
            }

            this.#dispatchConnectionEvent('closed', 'Connection terminated', 0, this.#currentResponseState.usedProtocol);

            if (shouldAttemptReconnect && this.#currentOptions.autoReconnect) {
                this.#connectionStateFlags.isAborting = false;
                this.#connectionStateFlags.isSubscribed = true;
                this.#handleReconnectionAttempt();
            } else {
                GlobalCommLink.removeActiveConnection(this.#uniqueId);
            }
        }
    }

    return {
        versionId: "1.0-alternative",
        
        onGlobalError: (fn) => globalEventDispatch.signalError = fn,
        onGlobalClose: (fn) => globalEventDispatch.signalClosure = fn,
        onGlobalOpen: (fn) => globalEventDispatch.signalOpening = fn,
        onGlobalMessage: (fn) => globalEventDispatch.signalMessage = fn,
        onGlobalReconnect: (fn) => globalEventDispatch.signalReconnection = fn,
        onGlobalPublished: (fn) => globalEventDispatch.signalPublication = fn,
        onGlobalTransportFail: (fn) => globalEventDispatch.signalTransportFailure = fn,

        establishConnection: (config) => {
            const newConnection = new ConnectionInitiator(config);
            return {
                disconnect: () => newConnection.terminateConnection(false),
                reconnect: () => newConnection.terminateConnection(true),
            };
        },

        terminateAll: () => {
            cleanUpOnUnload();
        },

        addActiveConnection: (connectionInstance) => {
            activeClientConnections.push(connectionInstance);
        },
        removeActiveConnection: (connectionId) => {
            activeClientConnections = activeClientConnections.filter(conn => conn.#uniqueId !== connectionId);
        },

        // Exposed for testing or specific use cases
        _interpretHeaderString: interpretHeaderString,
        _generateUniqueHandle: generateUniqueHandle
    };

})();