(function ($, globalObject, isUndefined) {
    "use strict";

    // Internal messages for connection events and errors
    const systemMessages = {
        noJQueryInstance: "jQuery environment missing. Please ensure jQuery is loaded before the client communication library.",
        transportInitFailure: "No suitable communication method could be established. Consider specifying a different transport or allowing automatic selection.",
        negotiationError: "An error occurred during the initial negotiation phase.",
        shutdownDuringLoad: "The communication link was terminated while the page was still loading.",
        shutdownDuringNegotiation: "The communication link was terminated during the negotiation request.",
        negotiationParseError: "Failed to interpret the negotiation response from the server.",
        protocolMismatch: "Client version {0} is incompatible with server version {1}.",
        dataSendFailure: "Data transmission failed.",
        responseParseFailure: "Unable to parse server response: {0}",
        pollingRequestFailed: "Long polling request encountered an error.",
        eventSourceConnectionFailed: "EventSource could not establish a connection.",
        eventSourceRuntimeError: "EventSource reported an error.",
        websocketDisconnected: "WebSocket connection was closed.",
        heartbeatInvalidResponse: "Server heartbeat response was invalid: '{0}'.",
        heartbeatCheckFailed: "Server heartbeat check failed.",
        heartbeatStatusCodeError: "Server heartbeat failed with status code {0}, terminating connection.",
        heartbeatParseError: "Failed to parse server heartbeat response, initiating connection termination.",
        noActiveTransport: "Connection is in an unstable state; no active communication transport is present."
    };

    // Verify jQuery presence early
    if (!($ && typeof $.fn === 'object')) {
        throw new Error(systemMessages.noJQueryInstance);
    }

    let primaryLink, // Main connection instance
        domContentLoaded = (globalObject.document.readyState === "complete"),
        domObserver = $(globalObject),
        negotiationCancellationFlag = "__NEGOTIATION_ABORTED_SIGNAL__",
        channelEvents = {
            onSessionStart: "onSessionStart",
            onSessionStarting: "onSessionStarting",
            onDataReceived: "onDataReceived",
            onErrorOccurred: "onErrorOccurred",
            onLinkSlow: "onLinkSlow",
            onReconnectingLink: "onReconnectingLink",
            onLinkReconnected: "onLinkReconnected",
            onStateChange: "onStateChange",
            onLinkDisconnect: "onLinkDisconnect"
        },
        xhrDefaultSetup = {
            processData: true,
            timeout: null,
            async: true,
            global: false,
            cache: false
        },
        // Basic logging utility
        outputLog = (messageText, enableLogging) => {
            if (enableLogging === false || !globalObject.console) {
                return;
            }
            const formattedMessage = `[${new Date().toTimeString()}] CommLink: ${messageText}`;
            if (globalObject.console.debug) {
                globalObject.console.debug(formattedMessage);
            } else if (globalObject.console.log) {
                globalObject.console.log(formattedMessage);
            }
        },

        // Helper to transition connection state
        updateConnectionState = (commConnection, currentStatus, newStatus) => {
            if (currentStatus === commConnection.status) {
                commConnection.status = newStatus;
                // Trigger event for state change, passing a structured object
                $(commConnection).triggerHandler(channelEvents.onStateChange, [{ previousStatus: currentStatus, currentStatus: newStatus }]);
                return true;
            }
            return false;
        },

        // Check if connection is in a disconnected state
        isLinkTerminated = (commConnection) => commConnection.status === primaryLink.linkStatus.terminated,

        // Setup the server heartbeat mechanism
        initializeHeartbeat = (commConnection) => {
            const configData = commConnection._.configuration,
                onHeartbeatFailure = (issueDetails) => {
                    $(commConnection).triggerHandler(channelEvents.onErrorOccurred, [issueDetails]);
                };

            // Only set up if not already running and interval is defined
            if (!configData.heartbeatMonitorId && configData.heartbeatInterval) {
                commConnection._.heartbeatMonitorId = globalObject.setInterval(() => {
                    primaryLink.transports._coreLogic.sendHeartbeatToServer(commConnection).fail(onHeartbeatFailure);
                }, configData.heartbeatInterval);
            }
        },

        // Configure timeout for automatic reconnection attempts
        setupReconnectionTimeout = (commConnection) => {
            let reconnectLimitTimer;
            const handleReconnectTimeout = (conn) => {
                conn.writeLog(`Reconnection limit (${conn.disconnectGracePeriod}ms) reached, terminating connection.`);
                conn.stop(/* async */ false, /* notifyServer */ false);
            };

            // Prevent multiple configurations if already set up
            if (commConnection._.reconnectionTimeoutConfigured) {
                return;
            }

            commConnection.onReconnectingLink(() => {
                // Check state again, as user handlers might change it
                if (commConnection.status === primaryLink.linkStatus.reconnecting) {
                    reconnectLimitTimer = globalObject.setTimeout(() => handleReconnectTimeout(commConnection), commConnection.disconnectGracePeriod);
                }
            });

            commConnection.onStateChange((eventData, stateInfo) => {
                if (stateInfo.previousStatus === primaryLink.linkStatus.reconnecting) {
                    // Clear the timeout if reconnection is no longer active
                    globalObject.clearTimeout(reconnectLimitTimer);
                }
            });

            commConnection._.reconnectionTimeoutConfigured = true;
        };

    // Main CommLink factory function
    primaryLink = (endpointUrl, queryParameters, enableDebugLog) => {
        /// <summary>Establishes a new communication link to the given URL</summary>
        /// <param name="endpointUrl" type="String">The server endpoint URL</param>
        /// <param name="queryParameters" type="Object/String">
        ///     [Optional] Custom query string parameters. Can be an object (non-function members added) or a string.
        /// </param>
        /// <param name="enableDebugLog" type="Boolean">
        ///     [Optional] Flag to enable/disable console logging. Defaults to false.
        /// </param>
        return new primaryLink.coreFunctions.createInstance(endpointUrl, queryParameters, enableDebugLog);
    };

    // Internal utilities and helpers
    primaryLink._internal = {
        defaultRequestType: "application/x-www-form-urlencoded; charset=UTF-8",

        browserInfo: (() => {
            const agent = globalObject.navigator.userAgent;
            let ieVersionMatch, firefoxVersionMatch;

            const browserData = {
                isIE: false,
                ieMajorVersion: 0,
                firefoxMajorVersion: 0,
                // Add more browser detection if needed for other transports
            };

            if (agent.includes('MSIE') || agent.includes('Trident')) { // Covers IE11's UA
                browserData.isIE = true;
                ieVersionMatch = /MSIE ([0-9]+\.[0-9]+)|rv:([0-9]+\.[0-9]+)\)/.exec(agent);
                if (ieVersionMatch) {
                    browserData.ieMajorVersion = parseFloat(ieVersionMatch[1] || ieVersionMatch[2]);
                }
            }

            firefoxVersionMatch = agent.match(/Firefox\/(\d+)/);
            if (firefoxVersionMatch && firefoxVersionMatch.length >= 2) {
                browserData.firefoxMajorVersion = parseInt(firefoxVersionMatch[1], 10);
            }

            return browserData;
        })(),

        // Unified error object creator
        createLinkError: (msg, sourceModule, transportName) => {
            const errorObj = new Error(msg);
            errorObj.source = sourceModule;
            if (transportName) {
                errorObj.transport = transportName;
            }
            return errorObj;
        },

        // Simple string interpolation function
        interpolateString: (...args) => {
            let baseString = args[0];
            for (let i = 0; i < args.length - 1; i++) {
                // Use a global regex replacement for all occurrences
                baseString = baseString.replace(new RegExp(`\\{${i}\\}`, 'g'), args[i + 1]);
            }
            return baseString;
        },

        // Check if an object is an array
        isArray: (obj) => Array.isArray(obj),

        // Check if an object is a plain object
        isPlainObject: (obj) => $.isPlainObject(obj)
    };

    primaryLink.channelEvents = channelEvents;
    primaryLink.systemMessages = systemMessages;
    primaryLink.xhrDefaultSetup = xhrDefaultSetup;
    primaryLink.updateConnectionState = updateConnectionState;
    primaryLink.isLinkTerminated = isLinkTerminated;

    // Define connection states
    primaryLink.linkStatus = {
        connecting: 0,
        connected: 1,
        reconnecting: 2,
        terminated: 4
    };

    // Placeholder for Hubs functionality
    primaryLink.hubInterface = {
        begin: () => {
            throw new Error("CommLink: Hubs interface not properly loaded. Ensure your hub script reference is correct (e.g., <script src='/signalr/js'></script>).");
        }
    };

    // Update domContentLoaded status when page is fully loaded
    domObserver.on("load", () => { domContentLoaded = true; });

    // Internal function to validate requested transport types
    function validateAndFilterTransports(requestedTransports, commConnectionInstance) {
        let finalTransports = requestedTransports;

        if (primaryLink._internal.isArray(requestedTransports)) {
            // Filter out invalid transports from the array
            finalTransports = requestedTransports.filter(transportName => {
                if (typeof transportName !== "string" || !primaryLink.transports[transportName]) {
                    commConnectionInstance.writeLog(`Invalid transport type: '${transportName}'. It will be excluded from the list.`);
                    return false;
                }
                return true;
            });

            if (finalTransports.length === 0) {
                commConnectionInstance.writeLog("No valid transports remaining in the specified array.");
                return null;
            }
        } else if (typeof requestedTransports !== "object" && !primaryLink.transports[requestedTransports] && requestedTransports !== "auto") {
            // If it's a single invalid string transport
            commConnectionInstance.writeLog(`Unrecognized transport identifier: '${requestedTransports}'.`);
            return null;
        } else if (requestedTransports === "auto" && primaryLink._internal.browserInfo.ieMajorVersion > 0 && primaryLink._internal.browserInfo.ieMajorVersion <= 8) {
            // Force longPolling for IE8 and below when 'auto' is specified
            commConnectionInstance.writeLog("Detected IE8 or older, forcing 'longPolling' transport for 'auto' selection.");
            return ["longPolling"];
        }

        return finalTransports;
    }

    // Determine default port based on protocol
    function resolveStandardPort(protocol) {
        return protocol === "http:" ? 80 : (protocol === "https:" ? 443 : null);
    }

    // Append default port to host if missing, handles cases like "localhost"
    function ensurePortOnHost(protocol, hostWithOptionalPort) {
        // If a port is already present (e.g., "host:8080"), return as is
        if (hostWithOptionalPort.match(/:\d+$/)) {
            return hostWithOptionalPort;
        }
        const defaultPort = resolveStandardPort(protocol);
        return defaultPort ? `${hostWithOptionalPort}:${defaultPort}` : hostWithOptionalPort;
    }

    // Buffer for messages sent while connection is establishing
    function PreConnectionMessageBuffer(linkRef, messageProcessor) {
        const messageQueue = [];
        this.attemptEnqueue = (msg) => {
            if (linkRef.status === $.signalR.linkStatus.connecting) {
                messageQueue.push(msg);
                return true;
            }
            return false;
        };

        this.flushQueue = () => {
            // Only process if the connection is fully established
            if (linkRef.status === $.signalR.linkStatus.connected) {
                while (messageQueue.length > 0) {
                    messageProcessor(messageQueue.shift());
                }
            }
        };

        this.clearBuffer = () => {
            messageQueue.length = 0; // Efficiently clear the array
        };
    }

    // Prototype for CommLink instances
    primaryLink.coreFunctions = primaryLink.prototype = {
        // Constructor for a new CommLink instance
        createInstance: function (endpointPath, queryArgs, debugFlag) {
            const linkInstance = $(this); // Wrap 'this' with jQuery

            this.endpointPath = endpointPath;
            this.queryArgs = queryArgs;
            this._ = {
                pendingMessageBuffer: new PreConnectionMessageBuffer(this, (message) => {
                    linkInstance.triggerHandler(channelEvents.onDataReceived, [message]);
                }),
                connectionFailureTimeout: null,
                // Additional internal properties for configuration
                configuration: {},
                reconnectionTimeoutConfigured: false
            };

            // Set logging preference, defaulting to false if not boolean
            this.enableDebugLog = typeof debugFlag === "boolean" ? debugFlag : false;
        },

        // Method to parse incoming server responses
        processIncomingPayload: function (rawResponse) {
            if (!rawResponse) {
                return rawResponse;
            }
            // If AJAX data type is 'text', assume JSON string and parse
            if (this.ajaxResponseFormat === "text") {
                try {
                    return this.jsonSerializer.parse(rawResponse);
                } catch (e) {
                    this.writeLog(primaryLink.systemMessages.responseParseFailure.replace("{0}", rawResponse));
                    // Re-throw or handle parsing error more gracefully
                    throw primaryLink._internal.createLinkError("Failed to parse response", "processIncomingPayload", this.activeTransportName);
                }
            }
            return rawResponse; // Otherwise, return as is
        },

        jsonSerializer: globalObject.JSON, // Reference to native JSON object

        // Check if a URL is cross-domain relative to the current location
        isExternalOrigin: function (checkUrl, compareAgainst) {
            checkUrl = $.trim(checkUrl);
            // If URL doesn't start with http, it's relative or same-domain
            if (!checkUrl.startsWith("http")) {
                return false;
            }

            // Default comparison is against window.location
            const referenceLocation = compareAgainst || globalObject.location;

            // Use a temporary anchor element for robust URL parsing
            const urlParserElement = globalObject.document.createElement("a");
            urlParserElement.href = checkUrl;

            // Compare protocol and host (with normalized ports)
            return (urlParserElement.protocol + ensurePortOnHost(urlParserElement.protocol, urlParserElement.host)) !==
                   (referenceLocation.protocol + ensurePortOnHost(referenceLocation.protocol, referenceLocation.host));
        },

        ajaxResponseFormat: "text", // Expected format for AJAX responses

        requestContentType: "application/json; charset=UTF-8",

        enableDebugLog: false, // Default logging state

        status: primaryLink.linkStatus.terminated, // Initial connection state

        keepAlivePayload: {}, // Data to send with keep-alive pings

        clientApiVersion: "1.3", // Client protocol version

        reconnectWaitTime: 2000, // Time to wait before attempting reconnection

        transportInitTimeout: 0, // Server-configured transport initialization timeout

        disconnectGracePeriod: 30000, // Server-configured grace period before forceful disconnect

        keepAliveWarningThreshold: 2 / 3, // Ratio of keep-alive interval to trigger warning

        // Custom logging wrapper
        writeLog: function (msg) {
            outputLog(msg, this.enableDebugLog);
        },

        // Initiate the connection process
        start: function (options, completionCallback) {
            /// <summary>Starts the communication link</summary>
            /// <param name="options" type="Object">Configuration options map</param>
            /// <param name="completionCallback" type="Function">Callback function to execute upon successful connection start</param>
            const currentLink = this;
            const linkConfig = {
                heartbeatInterval: 300000, // Default heartbeat interval
                awaitPageLoad: true,       // Wait for DOM content to load
                transportMechanism: "auto",// Default transport selection
                useJsonp: false            // Default to not use JSONP
            };

            // Use an existing deferred object if start is called multiple times
            const linkDeferred = currentLink._deferral || $.Deferred();
            currentLink._deferral = linkDeferred; // Persist the deferred object

            // JSON parser check
            if (!currentLink.jsonSerializer) {
                throw new Error("CommLink: No JSON parser found. Ensure json2.js is referenced if supporting older browsers (e.g., IE<8).");
            }

            // Handle flexible argument passing (options object or just callback)
            if (typeof options === "function") {
                completionCallback = options;
            } else if (primaryLink._internal.isPlainObject(options)) {
                $.extend(linkConfig, options); // Merge provided options
                if (typeof linkConfig.callback === "function") {
                    completionCallback = linkConfig.callback;
                }
            }

            // Validate and update transport configuration
            linkConfig.transportMechanism = validateAndFilterTransports(linkConfig.transportMechanism, currentLink);
            if (!linkConfig.transportMechanism) {
                throw new Error("CommLink: Invalid transport(s) specified, connection initiation aborted.");
            }

            currentLink._.configuration = linkConfig; // Store validated config

            // Handle page load dependency
            if (!domContentLoaded && linkConfig.awaitPageLoad === true) {
                currentLink._.deferredStartHandler = () => {
                    currentLink.start(options, completionCallback);
                };
                domObserver.one("load", currentLink._.deferredStartHandler); // Use .one() to bind once
                return linkDeferred.promise();
            }

            // If already connecting, return the existing promise
            if (currentLink.status === primaryLink.linkStatus.connecting) {
                return linkDeferred.promise();
            }

            // Attempt to transition from 'terminated' to 'connecting'
            if (!updateConnectionState(currentLink, primaryLink.linkStatus.terminated, primaryLink.linkStatus.connecting)) {
                // If transition failed, we are already connected or reconnecting, so just resolve
                currentLink.writeLog("Connection is already active or reconnecting, resolving start promise.");
                linkDeferred.resolve(currentLink);
                return linkDeferred.promise();
            }

            setupReconnectionTimeout(currentLink); // Configure the reconnection timeout guard

            // Parse URL to determine protocol and host
            const urlParser = globalObject.document.createElement("a");
            urlParser.href = currentLink.endpointPath;

            if (!urlParser.protocol || urlParser.protocol === ":") {
                // If protocol is relative, derive from current page
                currentLink.protocol = globalObject.location.protocol;
                currentLink.host = globalObject.location.host;
                currentLink.baseUri = `${currentLink.protocol}//${currentLink.host}`;
            } else {
                currentLink.protocol = urlParser.protocol;
                currentLink.host = urlParser.host;
                currentLink.baseUri = `${currentLink.protocol}//${currentLink.host}`;
            }

            // Determine WebSocket protocol
            currentLink.wsProtocol = currentLink.protocol === "https:" ? "wss://" : "ws://";

            // If JSONP is requested with "auto" transport, force longPolling
            if (linkConfig.transportMechanism === "auto" && linkConfig.useJsonp === true) {
                currentLink.writeLog("JSONP enabled with 'auto' transport, forcing 'longPolling'.");
                linkConfig.transportMechanism = "longPolling";
            }

            // Handle cross-domain scenarios
            if (this.isExternalOrigin(currentLink.endpointPath)) {
                currentLink.writeLog("Cross-domain URL detected.");

                if (linkConfig.transportMechanism === "auto") {
                    // EventSource (SSE) doesn't support CORS, so limit auto to WebSockets and LongPolling
                    linkConfig.transportMechanism = ["webSockets", "longPolling"];
                    currentLink.writeLog("Limiting auto-transport to WebSockets and LongPolling for cross-domain.");
                }

                // Default withCredentials to true for cross-domain requests
                if (isUndefined(linkConfig.withCredentials)) {
                    linkConfig.withCredentials = true;
                }

                // If browser doesn't support CORS, force JSONP for negotiation and AJAX
                if (!linkConfig.useJsonp && !$.support.cors) {
                    linkConfig.useJsonp = true;
                    currentLink.writeLog("Browser lacks CORS support, enabling JSONP for cross-domain requests.");
                }
            }
            // ... (rest of the start method would follow)
            // This is just a partial clone as per the provided code snippet.
        }
    };
})(jQuery, window);