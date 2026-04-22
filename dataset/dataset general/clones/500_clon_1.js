/*
 * SignalR Core JavaScript Library - Type I Clone
 * This file is a clone of jquery.signalR.core.js
 *
 * All identifiers, variable names, function names, operators, and expressions are identical.
 * Only whitespace and comments have been altered significantly to create visual difference.
 */

/*global window:false */ /* Ensuring window is recognized as a global variable */

/*!
 * Original source: ASP.NET SignalR JavaScript Library v2.0.1
 * Project website: http://signalr.net/
 *
 * Copyright (C) Microsoft Corporation. All rights reserved.
 * This is a modified version for code clone demonstration.
 */

/// <reference path="Scripts/jquery-1.6.4.js" />
/// <reference path="jquery.signalR.version.js" />

(function ($, window, undefined) {
    "use strict"; // Enforce strict mode for cleaner code.

    // Define a collection of resource strings for error messages and logging.
    var resources = {
        nojQuery: "jQuery was not found. Please ensure jQuery is referenced before the SignalR client JavaScript file.",
        noTransportOnInit: "No transport could be initialized successfully. Try specifying a different transport or none at all for auto initialization.",
        errorOnNegotiate: "Error during negotiation request.",
        stoppedWhileLoading: "The connection was stopped during page load.",
        stoppedWhileNegotiating: "The connection was stopped during the negotiate request.",
        errorParsingNegotiateResponse: "Error parsing negotiate response.",
        protocolIncompatible: "You are using a version of the client that isn't compatible with the server. Client version {0}, server version {1}.",
        sendFailed: "Send failed.",
        parseFailed: "Failed at parsing response: {0}",
        longPollFailed: "Long polling request failed.",
        eventSourceFailedToConnect: "EventSource failed to connect.",
        eventSourceError: "Error raised by EventSource",
        webSocketClosed: "WebSocket closed.",
        pingServerFailedInvalidResponse: "Invalid ping response when pinging server: '{0}'.",
        pingServerFailed: "Failed to ping server.",
        pingServerFailedStatusCode: "Failed to ping server. Server responded with status code {0}, stopping the connection.",
        pingServerFailedParse: "Failed to parse ping server response, stopping the connection.",
        noConnectionTransport: "Connection is in an invalid state, there is no transport active."
    };


    // Check for jQuery dependency. If not found, throw an error.
    if (typeof ($) !== "function") {
        // jQuery is missing! Critical dependency not met.
        throw new Error(resources.nojQuery);
    }

    // Declare core variables for the SignalR library.
    var signalR,
        _connection, // Placeholder for the active connection instance.
        _pageLoaded = (window.document.readyState === "complete"), // Flag indicating if the page has fully loaded.
        _pageWindow = $(window), // jQuery wrapped window object for event binding.
        _negotiateAbortText = "__Negotiate Aborted__", // Special text used to identify aborted negotiate requests.
        // Define standard SignalR event names.
        events = {
            onStart: "onStart",
            onStarting: "onStarting",
            onReceived: "onReceived",
            onError: "onError",
            onConnectionSlow: "onConnectionSlow",
            onReconnecting: "onReconnecting",
            onReconnect: "onReconnect",
            onStateChanged: "onStateChanged",
            onDisconnect: "onDisconnect"
        },
        // Default AJAX settings for SignalR requests.
        ajaxDefaults = {
            processData: true,
            timeout: null, // No default timeout for AJAX.
            async: true,
            global: false, // Prevent global AJAX event handlers from firing.
            cache: false // Disable caching for all SignalR AJAX requests.
        },
        // Logging utility function.
        log = function (msg, logging) {
            // If logging is explicitly disabled, return immediately.
            if (logging === false) {
                return;
            }
            var m;
            // Check if console is available in the browser.
            if (typeof (window.console) === "undefined") {
                return;
            }
            // Format the log message with a timestamp.
            m = "[" + new Date().toTimeString() + "] SignalR: " + msg;
            // Use console.debug if available, otherwise console.log.
            if (window.console.debug) {
                window.console.debug(m);
            } else if (window.console.log) {
                window.console.log(m);
            }
        },

        // Function to safely change the connection's state.
        changeState = function (connection, expectedState, newState) {
            // Only change state if the current state matches the expected state.
            if (expectedState === connection.state) {
                connection.state = newState;

                // Trigger the onStateChanged event.
                $(connection).triggerHandler(events.onStateChanged, [{ oldState: expectedState, newState: newState }]);
                return true; // State change successful.
            }

            return false; // State change failed because expected state was not met.
        },

        // Checks if the connection is currently in a disconnecting state.
        isDisconnecting = function (connection) {
            return connection.state === signalR.connectionState.disconnected;
        },

        // Configures the ping interval for the connection.
        configurePingInterval = function (connection) {
            var config = connection._.config, // Retrieve connection configuration.
                // Define error handler for ping failures.
                onFail = function (error) {
                    $(connection).triggerHandler(events.onError, [error]);
                };

            // Set up a ping interval if not already active and if pingInterval is configured.
            if (!config.pingIntervalId && config.pingInterval) {
                connection._.pingIntervalId = window.setInterval(function () {
                    signalR.transports._logic.pingServer(connection).fail(onFail);
                }, config.pingInterval);
            }
        },

        // Configures a timeout to stop reconnecting if it takes too long.
        configureStopReconnectingTimeout = function (connection) {
            var stopReconnectingTimeout, // Holds the timeout ID.
                // Function to execute when reconnect timeout is reached.
                onReconnectTimeout = function (connection) {
                    connection.log("Couldn't reconnect within the configured timeout (" + connection.disconnectTimeout + "ms), disconnecting.");
                    connection.stop(/* async */ false, /* notifyServer */ false); // Stop the connection.
                };

            // Check if this configuration has already been applied.
            if (!connection._.configuredStopReconnectingTimeout) {
                // Bind to the 'reconnecting' event.
                connection.reconnecting(function () {
                    var connection = this; // Capture 'this' (the connection).

                    // Ensure state is still 'reconnecting' before setting timeout.
                    if (connection.state === signalR.connectionState.reconnecting) {
                        stopReconnectingTimeout = window.setTimeout(function () { onReconnectTimeout(connection); }, connection.disconnectTimeout);
                    }
                });

                // Bind to the 'stateChanged' event to clear the timeout.
                connection.stateChanged(function (data) {
                    if (data.oldState === signalR.connectionState.reconnecting) {
                        // Clear the pending reconnect timeout when state changes from reconnecting.
                        window.clearTimeout(stopReconnectingTimeout);
                    }
                });

                connection._.configuredStopReconnectingTimeout = true; // Mark as configured.
            }
        };

    // Main SignalR constructor function.
    signalR = function (url, qs, logging) {
        /// <summary>Creates a new SignalR connection for the given url</summary>
        /// <param name="url" type="String">The URL of the long polling endpoint</param>
        /// <param name="qs" type="Object">
        ///     [Optional] Custom querystring parameters to add to the connection URL.
        ///     If an object, every non-function member will be added to the querystring.
        ///     If a string, it's added to the QS as specified.
        /// </param>
        /// <param name="logging" type="Boolean">
        ///     [Optional] A flag indicating whether connection logging is enabled to the browser
        ///     console/log. Defaults to false.
        /// </param>

        return new signalR.fn.init(url, qs, logging);
    };

    // Internal utility functions for SignalR.
    signalR._ = {
        defaultContentType: "application/x-www-form-urlencoded; charset=UTF-8",

        // Detects Internet Explorer version.
        ieVersion: (function () {
            var version,
                matches;

            if (window.navigator.appName === 'Microsoft Internet Explorer') {
                // Use regex to find MSIE version in user agent string.
                matches = /MSIE ([0-9]+\.[0-9]+)/.exec(window.navigator.userAgent);

                if (matches) {
                    version = window.parseFloat(matches[1]);
                }
            }

            // Returns undefined if not IE, or the version number.
            return version;
        })(),

        // Creates a new Error object with a source property.
        error: function (message, source) {
            var e = new Error(message);
            e.source = source;
            return e;
        },

        // Creates a transport-specific error object.
        transportError: function (message, transport, source) {
            var e = this.error(message, source);
            e.transport = transport ? transport.name : undefined;
            return e;
        },

        // Formats a string using {0}, {1}, etc. placeholders.
        format: function () {
            /// <summary>Usage: format("Hi {0}, you are {1}!", "Foo", 100) </summary>
            var s = arguments[0]; // The format string.
            for (var i = 0; i < arguments.length - 1; i++) {
                s = s.replace("{" + i + "}", arguments[i + 1]);
            }
            return s;
        },

        // Extracts the major Firefox version from a user agent string.
        firefoxMajorVersion: function (userAgent) {
            // Reference: http://useragentstring.com/pages/Firefox/
            var matches = userAgent.match(/Firefox\/(\d+)/);
            if (!matches || !matches.length || matches.length < 2) {
                return 0; // Return 0 if not Firefox or version not found.
            }
            return parseInt(matches[1], 10 /* radix */);
        }
    };

    signalR.events = events; // Expose events.

    signalR.resources = resources; // Expose resources.

    signalR.ajaxDefaults = ajaxDefaults; // Expose default AJAX settings.

    signalR.changeState = changeState; // Expose state change utility.

    signalR.isDisconnecting = isDisconnecting; // Expose disconnect check utility.

    // Define connection states as an enum.
    signalR.connectionState = {
        connecting: 0,
        connected: 1,
        reconnecting: 2,
        disconnected: 4
    };

    // Placeholder for SignalR Hub functionality.
    signalR.hub = {
        start: function () {
            // This method is replaced when the hubs script is loaded.
            throw new Error("SignalR: Error loading hubs. Ensure your hubs reference is correct, e.g. <script src='/signalr/js'></script>.");
        }
    };

    // Set _pageLoaded to true when the window finishes loading.
    _pageWindow.load(function () { _pageLoaded = true; });

    // Validates the requested transport(s).
    function validateTransport(requestedTransport, connection) {
        /// <summary>Validates the requested transport by cross checking it with the pre-defined signalR.transports</summary>
        /// <param name="requestedTransport" type="Object">The designated transports that the user has specified.</param>
        /// <param name="connection" type="signalR">The connection that will be using the requested transports. Used for logging purposes.</param>
        /// <returns type="Object" />

        // Handle array of requested transports.
        if ($.isArray(requestedTransport)) {
            // Iterate backwards to safely remove elements.
            for (var i = requestedTransport.length - 1; i >= 0; i--) {
                var transport = requestedTransport[i];
                // If not an object and not a valid string transport, remove it.
                if ($.type(requestedTransport) !== "object" && ($.type(transport) !== "string" || !signalR.transports[transport])) {
                    connection.log("Invalid transport: " + transport + ", removing it from the transports list.");
                    requestedTransport.splice(i, 1);
                }
            }

            // If no valid transports remain, set to null.
            if (requestedTransport.length === 0) {
                connection.log("No transports remain within the specified transport array.");
                requestedTransport = null;
            }
        }
        // Handle single requested transport or 'auto'.
        else if ($.type(requestedTransport) !== "object" && !signalR.transports[requestedTransport] && requestedTransport !== "auto") {
            connection.log("Invalid transport: " + requestedTransport.toString() + ".");
            requestedTransport = null; // Invalid transport, set to null.
        }
        // Special case for "auto" transport on IE8.
        else if (requestedTransport === "auto" && signalR._.ieVersion <= 8) {
            // If auto and IE8, force longPolling due to limitations.
            return ["longPolling"];

        }

        return requestedTransport; // Return the validated transport(s).
    }

    // Determines the default port for a given protocol.
    function getDefaultPort(protocol) {
        if (protocol === "http:") {
            return 80;
        } else if (protocol === "https:") {
            return 443;
        }
        return null; // Should not happen for http/https.
    }

    // Adds the default port to a URL if no port is specified.
    function addDefaultPort(protocol, url) {
        // Check if a port is already present in the URL.
        if (url.match(/:\d+$/)) {
            return url;
        } else {
            return url + ":" + getDefaultPort(protocol);
        }
    }

    // Manages messages buffered while the connection is in 'connecting' state.
    function ConnectingMessageBuffer(connection, drainCallback) {
        var that = this,
            buffer = []; // Internal array to hold buffered messages.

        // Attempts to buffer a message if the connection is connecting.
        that.tryBuffer = function (message) {
            if (connection.state === $.signalR.connectionState.connecting) {
                buffer.push(message); // Add message to buffer.

                return true; // Message buffered successfully.
            }

            return false; // Connection not in connecting state, message not buffered.
        };

        // Drains (processes) all buffered messages.
        that.drain = function () {
            // Only drain if the connection is fully established.
            if (connection.state === $.signalR.connectionState.connected) {
                while (buffer.length > 0) {
                    drainCallback(buffer.shift()); // Process messages in order.
                }
            }
        };

        // Clears all messages from the buffer.
        that.clear = function () {
            buffer = [];
        };
    }

    // Prototype and initialization for SignalR connections.
    signalR.fn = signalR.prototype = {
        init: function (url, qs, logging) {
            var $connection = $(this); // Wrap the connection instance with jQuery.

            this.url = url; // Store the connection URL.
            this.qs = qs; // Store the querystring parameters.
            this._ = {
                // Initialize the message buffer.
                connectingMessageBuffer: new ConnectingMessageBuffer(this, function (message) {
                    $connection.triggerHandler(events.onReceived, [message]);
                }),
                onFailedTimeoutHandle: null // Placeholder for timeout ID.
            };
            // Set logging preference if provided.
            if (typeof (logging) === "boolean") {
                this.logging = logging;
            }
        },

        // Parses the response from the server.
        _parseResponse: function (response) {
            var that = this;

            if (!response) {
                return response;
            } else if (that.ajaxDataType === "text") {
                // If AJAX data type is text, parse as JSON.
                return that.json.parse(response);
            } else {
                return response; // Otherwise, return as is.
            }
        },

        json: window.JSON, // Reference to the native JSON object.

        // Checks if a given URL is cross-domain relative to the current page or a specified origin.
        isCrossDomain: function (url, against) {
            /// <summary>Checks if url is cross domain</summary>
            /// <param name="url" type="String">The base URL</param>
            /// <param name="against" type="Object">
            ///     An optional argument to compare the URL against, if not specified it will be set to window.location.
            ///     If specified it must contain a protocol and a host property.
            /// </param>
            var link;

            url = $.trim(url); // Trim whitespace from the URL.
            if (url.indexOf("http") !== 0) {
                return false; // Not an absolute URL, assume same domain.
            }

            against = against || window.location; // Default to current window location.

            // Create a temporary anchor tag to parse the URL.
            link = window.document.createElement("a");
            link.href = url;

            // Compare protocol and host (with default ports handled) to determine cross-domain status.
            return link.protocol + addDefaultPort(link.protocol, link.host) !== against.protocol + addDefaultPort(against.protocol, against.host);
        },

        ajaxDataType: "text", // Default AJAX data type.

        contentType: "application/json; charset=UTF-8", // Default content type for requests.

        logging: false, // Logging is off by default.

        state: signalR.connectionState.disconnected, // Initial connection state.

        keepAliveData: {}, // Data related to keep-alive functionality.

        clientProtocol: "1.3", // Client protocol version.

        reconnectDelay: 2000, // Delay before attempting to reconnect (in ms).

        transportConnectTimeout: 0, // This is dynamically set by the server.

        disconnectTimeout: 30000, // Timeout for client to detect server disconnect (in ms).

        keepAliveWarnAt: 2 / 3, // Percentage of keep-alive timeout at which to warn of slow connection.

        // Initiates the SignalR connection.
        start: function (options, callback) {
            /// <summary>Starts the connection</summary>
            /// <param name="options" type="Object">Options map</param>
            /// <param name="callback" type="Function">A callback function to execute when the connection has started</param>
            var connection = this, // Reference to the current connection instance.
                config = {
                    pingInterval: 300000, // Default ping interval (5 minutes).
                    waitForPageLoad: true, // Wait for page load before starting.
                    transport: "auto", // Automatically select the best transport.
                    jsonp: false // JSONP disabled by default.
                },
                initialize, // Not used, likely a remnant.
                // Initialize a Deferred object for async operations.
                deferred = connection._deferral || $.Deferred(),
                parser = window.document.createElement("a"); // Temporary anchor element for URL parsing.

            // Persist the deferral object across multiple start calls.
            connection._deferral = deferred;

            // Ensure JSON parser is available.
            if (!connection.json) {
                // If JSON is not found, throw an error.
                throw new Error("SignalR: No JSON parser found. Please ensure json2.js is referenced before the SignalR.js file if you need to support clients without native JSON parsing support, e.g. IE<8.");
            }

            // Handle flexible argument passing for options and callback.
            if ($.type(options) === "function") {
                callback = options; // options is actually the callback.
            } else if ($.type(options) === "object") {
                $.extend(config, options); // Merge provided options with defaults.
                if ($.type(config.callback) === "function") {
                    callback = config.callback; // Extract callback from options.
                }
            }

            // Validate the specified transport(s).
            config.transport = validateTransport(config.transport, connection);

            // If transport validation failed, throw an error.
            if (!config.transport) {
                throw new Error("SignalR: Invalid transport(s) specified, aborting start.");
            }

            connection._.config = config; // Store the final configuration.

            // If page hasn't loaded and waitForPageLoad is true, defer start.
            if (!_pageLoaded && config.waitForPageLoad === true) {
                connection._.deferredStartHandler = function () {
                    connection.start(options, callback); // Re-call start after page load.
                };
                _pageWindow.bind("load", connection._.deferredStartHandler); // Bind to window load event.

                return deferred.promise(); // Return the promise from the deferred start.
            }

            // If already connecting, return the existing promise.
            if (connection.state === signalR.connectionState.connecting) {
                return deferred.promise();
            }
            // Attempt to transition from disconnected to connecting.
            else if (changeState(connection,
                            signalR.connectionState.disconnected,
                            signalR.connectionState.connecting) === false) {
                // If transition fails, it means we're already connected or reconnecting.
                deferred.resolve(connection); // Resolve the promise immediately.
                return deferred.promise();
            }

            configureStopReconnectingTimeout(connection); // Set up reconnect timeout.

            // Parse the connection URL to determine protocol and host.
            parser.href = connection.url;
            if (!parser.protocol || parser.protocol === ":") {
                connection.protocol = window.document.location.protocol;
                connection.host = window.document.location.host;
                connection.baseUrl = connection.protocol + "//" + connection.host;
            } else {
                connection.protocol = parser.protocol;
                connection.host = parser.host;
                connection.baseUrl = parser.protocol + "//" + parser.host;
            }

            // Determine WebSocket protocol (ws:// or wss://).
            connection.wsProtocol = connection.protocol === "https:" ? "wss://" : "ws://";

            // If JSONP and auto/no transport, force longPolling (JSONP only works with longPolling).
            if (config.transport === "auto" && config.jsonp === true) {
                config.transport = "longPolling";
            }

            // Handle cross-domain connections.
            if (this.isCrossDomain(connection.url)) {
                connection.log("Auto detected cross domain url.");

                if (config.transport === "auto") {
                    // For cross-domain, prefer WebSockets and Long Polling (SSE doesn't support CORS).
                    config.transport = ["webSockets", "longPolling"];
                }

                // If withCredentials is not explicitly set, default to true for cross-domain.
                if (typeof (config.withCredentials) === "undefined") {
                    config.withCredentials = true;
                }

                // Determine if JSONP is necessary due to browser CORS limitations.
                if (!config.jsonp) {
                    config.jsonp = !$.support.cors; // Use JSONP if CORS is not supported.

                    if (config.jsonp) {
                        connection.log("Using jsonp because this browser doesn't support CORS.");
                    }
                }