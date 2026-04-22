((globalJQuery, globalWindow) => {
    "use strict";

    const EventStreamClient = {};

    const notificationMessages = {
        missingJQuery: "Framework missing. Ensure jQuery is loaded before the client script.",
        noInitialTransport: "No protocol handler could be established. Try a different handler or allow automatic selection.",
        negotiationFailure: "Error during initial handshake request.",
        terminationDuringLoad: "Communication ceased during page load.",
        terminationDuringNegotiation: "Communication ceased during handshake.",
        negotiationResponseIssue: "Problem parsing handshake response.",
        protocolMismatch: "Client version {0} is incompatible with server version {1}.",
        transmissionFailed: "Transmission failed.",
        parsingFailed: "Failed to interpret response: {0}",
        longPollingFailure: "Long polling request encountered an issue.",
        eventSourceConnectionError: "EventSource could not establish connection.",
        eventSourceRuntimeError: "EventSource reported an error.",
        webSocketClosure: "WebSocket connection terminated.",
        heartbeatCheckInvalid: "Invalid heartbeat response from server: '{0}'.",
        heartbeatCheckFailure: "Failed to perform heartbeat check.",
        heartbeatCheckStatusError: "Heartbeat check failed. Server responded with status {0}, terminating connection.",
        heartbeatCheckParseError: "Failed to parse heartbeat response, terminating connection.",
        noActiveProtocol: "Connection is in an invalid state, no active protocol handler."
    };

    if (!globalJQuery || typeof globalJQuery !== "function") {
        throw new Error(notificationMessages.missingJQuery);
    }

    const consoleLogger = (messageContent, enableLogging) => {
        if (enableLogging === false || !globalWindow.console) {
            return;
        }
        const formattedMessage = `[${new Date().toTimeString()}] EventStreamClient: ${messageContent}`;
        if (globalWindow.console.debug) {
            globalWindow.console.debug(formattedMessage);
        } else if (globalWindow.console.log) {
            globalWindow.console.log(formattedMessage);
        }
    };

    const StatusEvents = {
        onCommence: "onCommence",
        onCommencing: "onCommencing",
        onDataReceived: "onDataReceived",
        onFault: "onFault",
        onSlowConnection: "onSlowConnection",
        onReestablishing: "onReestablishing",
        onReestablished: "onReestablished",
        onStatusChange: "onStatusChange",
        onDisconnect: "onDisconnect"
    };

    const StandardHttpConfig = {
        processData: true,
        timeout: null,
        async: true,
        global: false,
        cache: false
    };

    const transitionLinkStatus = (commLink, expectedState, nextState) => {
        if (expectedState === commLink.currentStatus) {
            commLink.currentStatus = nextState;
            globalJQuery(commLink).triggerHandler(StatusEvents.onStatusChange, [{ previousStatus: expectedState, newStatus: nextState }]);
            return true;
        }
        return false;
    };

    const isLinkSevered = (commLink) => commLink.currentStatus === EventStreamClient.linkStatus.offline;

    const establishHeartbeatCheck = (commLink) => {
        const currentConfiguration = commLink.internalConfig;
        const failureCallback = (fault) => {
            globalJQuery(commLink).triggerHandler(StatusEvents.onFault, [fault]);
        };

        if (!currentConfiguration.heartbeatTimerId && currentConfiguration.heartbeatInterval) {
            commLink.internalConfig.heartbeatTimerId = globalWindow.setInterval(() => {
                EventStreamClient.protocolHandlers._logic.pingServer(commLink).fail(failureCallback);
            }, currentConfiguration.heartbeatInterval);
        }
    };

    const setReconnectGuard = (commLink) => {
        let reconnectTimeoutHandle;
        const onReconnectTimeoutReached = (link) => {
            link.traceOutput(`Couldn't reestablish connection within the configured timeout (${link.disconnectGuardDuration}ms), terminating.`);
            link.terminateConnection(/* synchronous */ false, /* notifyRemote */ false);
        };

        if (!commLink.internalConfig.reconnectGuardSetup) {
            // Using jQuery's custom event system for internal events
            globalJQuery(commLink).on(StatusEvents.onReestablishing, () => {
                if (commLink.currentStatus === EventStreamClient.linkStatus.reconnecting) {
                    reconnectTimeoutHandle = globalWindow.setTimeout(() => { onReconnectTimeoutReached(commLink); }, commLink.disconnectGuardDuration);
                }
            });

            globalJQuery(commLink).on(StatusEvents.onStatusChange, (event, data) => {
                if (data.previousStatus === EventStreamClient.linkStatus.reconnecting) {
                    globalWindow.clearTimeout(reconnectTimeoutHandle);
                }
            });

            commLink.internalConfig.reconnectGuardSetup = true;
        }
    };

    EventStreamClient.linkStatus = {
        connecting: 0,
        online: 1,
        reconnecting: 2,
        offline: 4
    };

    EventStreamClient.utility = {
        defaultEncoding: "application/x-www-form-urlencoded; charset=UTF-8",

        browserIEVersion: (() => {
            let versionInfo;
            const matches = globalWindow.navigator.userAgent.match(/MSIE ([0-9]+\.[0-9]+)/);
            if (matches) {
                versionInfo = globalWindow.parseFloat(matches[1]);
            }
            return versionInfo;
        })(),

        createFault: (description, sourceComponent) => {
            const err = new Error(description);
            err.origin = sourceComponent;
            return err;
        },

        createProtocolFault: (description, protocolComponent, sourceComponent) => {
            const err = EventStreamClient.utility.createFault(description, sourceComponent);
            err.protocol = protocolComponent ? protocolComponent.name : undefined;
            return err;
        },

        formatString: (...args) => {
            let template = args[0];
            for (let i = 0; i < args.length - 1; i++) {
                template = template.replace(new RegExp("\\{" + i + "\\}", "g"), args[i + 1]);
            }
            return template;
        },

        getFirefoxMajorVersion: (agentString) => {
            const matches = agentString.match(/Firefox\/(\d+)/);
            return (matches && matches.length >= 2) ? parseInt(matches[1], 10) : 0;
        }
    };

    EventStreamClient.notificationMessages = notificationMessages;
    EventStreamClient.StatusEvents = StatusEvents;
    EventStreamClient.StandardHttpConfig = StandardHttpConfig;
    EventStreamClient.transitionLinkStatus = transitionLinkStatus;
    EventStreamClient.isLinkSevered = isLinkSevered;

    globalJQuery(globalWindow).on("load", () => { EventStreamClient.domReadyIndicator = true; });

    EventStreamClient.interfaceHub = {
        initiate: () => {
            throw new Error("EventStreamClient: Interface hubs not loaded. Verify your hub reference, e.g., <script src='/signalr/js'></script>.");
        }
    };

    EventStreamClient.domReadyIndicator = (globalWindow.document.readyState === "complete");

    class PendingTransmissionCache {
        #messageQueue = [];
        #linkRef;
        #drainCompletion;

        constructor(linkReference, drainCallbackAction) {
            this.#linkRef = linkReference;
            this.#drainCompletion = drainCallbackAction;
        }

        attemptBuffering(payload) {
            if (this.#linkRef.currentStatus === EventStreamClient.linkStatus.connecting) {
                this.#messageQueue.push(payload);
                return true;
            }
            return false;
        }

        flushCache() {
            if (this.#linkRef.currentStatus === EventStreamClient.linkStatus.online) {
                while (this.#messageQueue.length > 0) {
                    this.#drainCompletion(this.#messageQueue.shift());
                }
            }
        }

        clearCache() {
            this.#messageQueue = [];
        }
    }

    class ConnectionInstance {
        constructor(endpointUrl, queryParameters, enableTracing) {
            this.remoteAddress = endpointUrl;
            this.queryParams = queryParameters;
            this.internalConfig = {
                messageBuffer: new PendingTransmissionCache(this, (dataPayload) => {
                    globalJQuery(this).triggerHandler(StatusEvents.onDataReceived, [dataPayload]);
                }),
                pendingFailureTimeout: null
            };
            if (typeof enableTracing === "boolean") {
                this.enableTracing = enableTracing;
            }
        }

        decodeReplyContent(serverReply) {
            if (!serverReply) {
                return serverReply;
            } else if (this.dataExchangeFormat === "text") {
                return this.jsonParser.parse(serverReply);
            } else {
                return serverReply;
            }
        }

        jsonParser = globalWindow.JSON;

        isOriginMismatch(targetAddress, compareAgainst) {
            targetAddress = globalJQuery.trim(targetAddress);
            if (!targetAddress.startsWith("http")) {
                return false;
            }

            compareAgainst = compareAgainst || globalWindow.location;
            const tempAnchor = globalWindow.document.createElement("a");
            tempAnchor.href = targetAddress;

            const deriveStandardPort = (scheme) => scheme === "http:" ? 80 : (scheme === "https:" ? 443 : null);

            const applyStandardPort = (scheme, host) => {
                if (host.match(/:\d+$/)) {
                    return host;
                } else {
                    const stdPort = deriveStandardPort(scheme);
                    return stdPort ? `${host}:${stdPort}` : host;
                }
            };

            return `${tempAnchor.protocol}${applyStandardPort(tempAnchor.protocol, tempAnchor.host)}` !==
                   `${compareAgainst.protocol}${applyStandardPort(compareAgainst.protocol, compareAgainst.host)}`;
        }

        dataExchangeFormat = "text";
        requestContentType = "application/json; charset=UTF-8";
        enableTracing = false;
        currentStatus = EventStreamClient.linkStatus.offline;
        keepAliveData = {};
        clientProtocolVersion = "1.3";
        reconnectAttemptDelay = 2000;
        protocolConnectTimeout = 0;
        disconnectGuardDuration = 30000;
        keepAliveWarningThreshold = 2 / 3;

        traceOutput(message) {
            consoleLogger(message, this.enableTracing);
        }

        // Placeholder for terminateConnection, as it's not in the original snippet but called by setReconnectGuard
        terminateConnection(sync, notify) {
            this.traceOutput(`Connection terminated (sync: ${sync}, notify: ${notify}).`);
            this.currentStatus = EventStreamClient.linkStatus.offline;
            globalJQuery(this).triggerHandler(StatusEvents.onDisconnect);
        }

        // Placeholder for onReestablishing, onStatusChange (used by setReconnectGuard)
        // These are effectively wrappers around jQuery event binding
        onReestablishing(handler) {
            globalJQuery(this).on(StatusEvents.onReestablishing, handler);
        }
        onStatusChange(handler) {
            globalJQuery(this).on(StatusEvents.onStatusChange, (event, data) => handler(data));
        }

        initiateCommunication(optionsParam, completionCallback) {
            let connectionOptions = {
                heartbeatInterval: 300000,
                awaitPageLoad: true,
                protocolHandler: "auto",
                useJsonP: false,
                allowCredentials: undefined // Added for clarity, matches original logic
            };
            let deferredResult = this.pendingOperation || globalJQuery.Deferred();
            this.pendingOperation = deferredResult;

            if (!this.jsonParser) {
                throw new Error("EventStreamClient: No JSON parser available. Ensure json2.js is referenced for older browsers (e.g., IE<8).");
            }

            if (typeof optionsParam === "function") {
                completionCallback = optionsParam;
            } else if (typeof optionsParam === "object") {
                globalJQuery.extend(connectionOptions, optionsParam);
                if (typeof connectionOptions.completionCallback === "function") {
                    completionCallback = connectionOptions.completionCallback;
                }
            }

            const verifyProtocolHandler = (requestedHandler, currentLink) => {
                if (Array.isArray(requestedHandler)) {
                    const validHandlers = requestedHandler.filter(handler => {
                        const isValid = typeof handler === "string" && EventStreamClient.protocolHandlers[handler];
                        if (!isValid) {
                            currentLink.traceOutput(`Invalid protocol handler: ${handler}, removing from list.`);
                        }
                        return isValid;
                    });
                    return validHandlers.length > 0 ? validHandlers : null;
                } else if (typeof requestedHandler !== "object" && !EventStreamClient.protocolHandlers[requestedHandler] && requestedHandler !== "auto") {
                    currentLink.traceOutput(`Invalid protocol handler: ${requestedHandler.toString()}.`);
                    return null;
                } else if (requestedHandler === "auto" && EventStreamClient.utility.browserIEVersion <= 8) {
                    return ["longPolling"];
                }
                return requestedHandler;
            };

            connectionOptions.protocolHandler = verifyProtocolHandler(connectionOptions.protocolHandler, this);

            if (!connectionOptions.protocolHandler) {
                throw new Error("EventStreamClient: No valid protocol handler(s) specified, aborting initiation.");
            }

            // Merge new options into internalConfig, ensuring existing messageBuffer is preserved
            this.internalConfig = { ...this.internalConfig, ...connectionOptions };

            if (!EventStreamClient.domReadyIndicator && connectionOptions.awaitPageLoad) {
                this.internalConfig.deferredStartHandler = () => this.initiateCommunication(optionsParam, completionCallback);
                globalJQuery(globalWindow).on("load", this.internalConfig.deferredStartHandler);
                return deferredResult.promise();
            }

            if (this.currentStatus === EventStreamClient.linkStatus.connecting) {
                return deferredResult.promise();
            } else if (!transitionLinkStatus(this, EventStreamClient.linkStatus.offline, EventStreamClient.linkStatus.connecting)) {
                deferredResult.resolve(this);
                return deferredResult.promise();
            }

            setReconnectGuard(this);

            const urlParser = globalWindow.document.createElement("a");
            urlParser.href = this.remoteAddress;

            this.protocolScheme = urlParser.protocol || globalWindow.location.protocol;
            this.hostName = urlParser.host || globalWindow.location.host;
            this.baseUri = `${this.protocolScheme}//${this.hostName}`;

            this.webSocketScheme = this.protocolScheme === "https:" ? "wss://" : "ws://";

            if (connectionOptions.protocolHandler === "auto" && connectionOptions.useJsonP) {
                connectionOptions.protocolHandler = "longPolling";
            }

            if (this.isOriginMismatch(this.remoteAddress)) {
                this.traceOutput("Cross-domain URL detected.");

                if (connectionOptions.protocolHandler === "auto") {
                    connectionOptions.protocolHandler = ["webSockets", "longPolling"];
                }

                if (typeof connectionOptions.allowCredentials === "undefined") {
                    connectionOptions.allowCredentials = true;
                }

                if (!connectionOptions.useJsonP) {
                    // Basic CORS detection without $.support.cors
                    const hasNativeCORS = (globalWindow.XMLHttpRequest && "withCredentials" in new globalWindow.XMLHttpRequest());
                    connectionOptions.useJsonP = !hasNativeCORS;

                    if (connectionOptions.useJsonP) {
                        this.traceOutput("Utilizing JSONP due to perceived lack of native CORS support.");
                    }
                }
            }
        }
    }
    EventStreamClient.ConnectionInstance = ConnectionInstance;

    EventStreamClient.createLink = (endpointUrl, queryParameters, enableTracing) => {
        return new EventStreamClient.ConnectionInstance(endpointUrl, queryParameters, enableTracing);
    };

    // Placeholder for protocolHandlers._logic.pingServer to satisfy establishHeartbeatCheck
    EventStreamClient.protocolHandlers = {
        _logic: {
            pingServer: (commLink) => {
                commLink.traceOutput("Heartbeat check initiated (placeholder).");
                // This should return a deferred object as per the original's .fail(onFail) usage
                return globalJQuery.Deferred().resolve();
            }
        }
    };

    globalWindow.EventStreamClient = EventStreamClient;

})(jQuery, window);