/**
 * This software is provided under the Apache License, Version 2.0.
 * For details, refer to:
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless explicitly stated by applicable law or agreed upon in writing,
 * software distributed under this license is provided "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/*
 * Portions of this code are derived from:
 *
 * jQuery Stream @VERSION
 * Comet Streaming JavaScript Library
 * http://code.google.com/p/jquery-stream/
 *
 * Copyright 2011, Donghwan Kim
 * Licensed under the Apache License, Version 2.0
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Developed for compatibility with jQuery 1.5+
 */

/**
 * For comprehensive documentation, please visit: https://github.com/Atmosphere/atmosphere/wiki/jQuery.atmosphere.js-API
 */
(function($) { // Using a closure to alias jQuery as $ for brevity and scope encapsulation

    // Define some constants for clarity, a new addition
    const CONNECTION_STATE_OPENING = "connecting";
    const CONNECTION_STATE_MESSAGE_RECEIVED = "dataReceived";
    const CONNECTION_STATE_ERROR = "connectionError";
    const CONNECTION_STATE_CLOSED = "connectionClosed";

    const TRANSPORT_WEBSOCKET = "websocket";
    const TRANSPORT_SSE = "sse";
    const TRANSPORT_LONG_POLLING = "long-polling";
    const TRANSPORT_STREAMING = "streaming";
    const TRANSPORT_AJAX = "ajax";
    const TRANSPORT_JSONP = "jsonp";

    /**
     * Helper function to dissect raw header strings into a key-value map.
     * @param {string} rawHeaderString The string containing all HTTP headers.
     * @returns {Object.<string, string>} A map of header names to their values.
     * @private
     */
    const extractHttpHeaders = function(rawHeaderString) {
        let headerMap = {};
        if (!rawHeaderString || typeof rawHeaderString !== 'string') {
            $.cometService.log("warn", ["Attempted to parse an invalid header string."]);
            return headerMap;
        }
        const headerRegex = /^(.*?):[ \t]*([^\r\n]*)\r?$/mg;
        let currentMatch;
        // Using a while loop is fine, but let's rephrase it slightly for cosmetic change
        for (let i = 0; (currentMatch = headerRegex.exec(rawHeaderString)) !== null; i++) {
            // Basic validation for match groups
            if (currentMatch.length >= 3 && currentMatch[1] && currentMatch[2]) {
                headerMap[currentMatch[1].trim()] = currentMatch[2].trim();
            } else {
                $.cometService.log("debug", ["Skipping malformed header segment:", currentMatch]);
            }
        }
        return headerMap;
    };

    /**
     * Core Comet Service module for managing persistent connections.
     * @namespace $.cometService
     */
    $.cometService = {
        libVersion: "1.0.1-alpha", // Slightly updated version string
        activeConnections: [], // Stores instances of StreamConnection
        globalEventHandlers: [], // Stores global callbacks

        // Default global handlers, can be overridden
        onGlobalError: function(eventData) {
            // Placeholder for global error handling
            $.cometService.log("error", ["Global error detected.", eventData]);
        },
        onGlobalClose: function(eventData) {
            // Placeholder for global connection closure
            $.cometService.log("info", ["Global connection closed.", eventData]);
        },
        onGlobalOpen: function(eventData) {
            // Placeholder for global connection opening
            $.cometService.log("info", ["Global connection opened.", eventData]);
        },
        onGlobalMessage: function(eventData) {
            // Placeholder for global message reception
            $.cometService.log("debug", ["Global message received.", eventData]);
        },
        onGlobalReestablish: function(connRequest, eventData) {
            // Placeholder for global reconnection attempts
            $.cometService.log("info", ["Global reconnection attempt.", connRequest, eventData]);
        },
        onGlobalPublish: function(eventData) {
            // Placeholder for global message publication confirmation
            $.cometService.log("debug", ["Global message published.", eventData]);
        },
        onGlobalTransportIssue: function(eventData) {
            // Placeholder for global transport layer failures
            $.cometService.log("warn", ["Global transport failure.", eventData]);
        },

        /**
         * Generates a unique identifier for connection instances.
         * @returns {number} A unique ID.
         */
        generateUniqueId: (function() {
            let nextId = 0;
            return function() {
                return nextId++;
            };
        })(), // Self-executing function for a private counter

        /**
         * Logs messages to the console based on the specified log level.
         * @param {string} level The log level (e.g., 'info', 'warn', 'error', 'debug').
         * @param {Array<any>} messages An array of messages to log.
         */
        log: function(level, messages) {
            if (typeof console !== 'undefined' && console[level]) {
                // Prepend a prefix for easier identification
                console[level].apply(console, ["[CometService]"].concat(messages));
            }
        },

        /**
         * Unsubscribes all active connections.
         * A new utility method for mass cleanup.
         */
        disconnectAll: function() {
            this.log("info", ["Initiating disconnect for all active connections."]);
            // Iterate in reverse if we're modifying the array during iteration
            for (let i = this.activeConnections.length - 1; i >= 0; i--) {
                const conn = this.activeConnections[i];
                if (conn && typeof conn.closeConnection === 'function') {
                    conn.closeConnection();
                    // Remove from array after closing
                    this.activeConnections.splice(i, 1);
                }
            }
            this.activeConnections = []; // Ensure it's empty after loop
        },

        /**
         * Constructor for a new streaming connection.
         * @param {Object} setupOptions Configuration options for this connection.
         * @class
         * @memberof $.cometService
         */
        StreamConnection: function(setupOptions) {

            /**
             * Internal configuration object for the connection.
             * @private
             * @type {Object}
             */
            let _connectionConfig = {
                connectionTimeout: 300000,
                requestMethod: 'GET',
                requestHeaders: {},
                payloadType: '', // Renamed from contentType
                callbackFunction: null, // Renamed from callback
                targetUrl: '', // Renamed from url
                postData: '', // Renamed from data
                autoSuspend: true, // Renamed from suspend
                maxRetries: 60, // Renamed from maxRequest
                autoReconnect: true, // Renamed from reconnect
                streamDataLimit: 10000000, // Renamed from maxStreamingLength
                lastProcessedOffset: 0, // Renamed from lastIndex
                loggingLevel: 'info', // Renamed from logLevel
                reconnectionAttemptCount: 0, // Renamed from requestCount
                backupMethod: 'GET', // Renamed from fallbackMethod
                backupTransport: TRANSPORT_STREAMING, // Renamed from fallbackTransport
                primaryTransport: TRANSPORT_LONG_POLLING, // Renamed from transport
                customWebSocketImpl: null, // Renamed from webSocketImpl
                webSocketEndpoint: null, // Renamed from webSocketUrl
                wsPathSeparator: "@@", // Renamed from webSocketPathDelimiter
                enableXdomainRequest: false, // Renamed from enableXDR
                urlRewritingEnabled: false, // Renamed from rewriteURL
                appendHeadersToQuery: true, // Renamed from attachHeadersAsQueryString
                callbackBeforeReconnection: false, // Renamed from executeCallbackBeforeReconnect
                connectionState: 0, // Renamed from readyState
                lastActivityTime: 0, // Renamed from lastTimestamp
                allowCredentials: false, // Renamed from withCredentials
                monitorMessageLength: false, // Renamed from trackMessageLength
                messageSeparator: '|', // Renamed from messageDelimiter
                initialConnectTimeout: -1, // Renamed from connectTimeout
                stripCometHeaders: false, // Renamed from dropAtmosphereHeaders
                // Connection-specific callbacks, renamed and structured similarly
                onConnError: function(response) {},
                onConnClose: function(response) {},
                onConnOpen: function(response) {},
                onConnMessage: function(response) {},
                onConnReestablish: function(request, response) {},
                onConnPublish: function(response) {},
                onConnTransportFailure: function(reason, request) {}
            };

            /**
             * The most recent response data associated with this connection.
             * @private
             * @type {Object}
             */
            let _lastResponseData = {
                httpStatus: 200, // Renamed from status
                receivedBody: '', // Renamed from responseBody
                expectedContentLength: -1, // Renamed from expectedBodySize
                responseHeaders: {}, // Renamed from headers (changed to object from array)
                connectionPhase: CONNECTION_STATE_MESSAGE_RECEIVED, // Renamed from state
                currentTransport: TRANSPORT_LONG_POLLING, // Renamed from transport
                lastError: null, // Renamed from error
                associatedRequest: null, // Renamed from request
                messageId: 0 // Renamed from id
            };

            /**
             * Unique identifier for this specific connection instance.
             * @private
             * @type {number}
             */
            const _instanceId = $.cometService.generateUniqueId(); // Using the new global ID generator

            /**
             * Reference to the active WebSocket instance, if applicable.
             * @private
             * @type {WebSocket|null}
             */
            let _wsInstance = null;

            /**
             * Reference to the active Server-Sent Events instance, if applicable.
             * @private
             * @type {EventSource|null}
             */
            let _sseInstance = null;

            /**
             * Reference to the active XMLHttpRequest or ActiveXObject for HTTP transports.
             * @private
             * @type {XMLHttpRequest|ActiveXObject|null}
             */
            let _xhrObject = null;

            /**
             * Special object for IE streaming compatibility.
             * @private
             * @type {Object|null}
             */
            let _ieCompatStream = null;

            /**
             * Reference to the current jQuery AJAX request object (for long-polling/jsonp).
             * @private
             * @type {jqXHR|null}
             */
            let _currentAjaxRequest = null;

            /**
             * Flag indicating if the connection is currently subscribed/active.
             * @private
             * @type {boolean}
             */
            let _isSubscribed = true;

            /**
             * Flag indicating if the connection is in the process of aborting.
             * @private
             * @type {boolean}
             */
            let _isAbortingConnection = false;

            /**
             * Timestamp of when the connection was initially established or last re-established.
             * New variable for Type III.
             * @private
             * @type {number}
             */
            let _connectionStartTime = 0;

            // --- Private Helper Functions ---

            /**
             * Initializes or resets the core state variables of the connection.
             * @private
             */
            function _initializeState() {
                _wsInstance = null;
                _sseInstance = null;
                _xhrObject = null;
                _ieCompatStream = null;
                _isSubscribed = true;
                _isAbortingConnection = false;
                _connectionConfig.reconnectionAttemptCount = 0;
                _connectionConfig.lastProcessedOffset = 0; // Reset offset on new connection
                _connectionStartTime = Date.now(); // Record initialization time
                $.cometService.log(_connectionConfig.loggingLevel, [`Connection ${_instanceId} state initialized.`]);
            }

            /**
             * Resets the response object and then re-initializes the connection state.
             * @private
             */
            function _resetConnectionState() {
                _lastResponseData = {
                    httpStatus: 200,
                    receivedBody: '',
                    expectedContentLength: -1,
                    responseHeaders: {},
                    connectionPhase: CONNECTION_STATE_MESSAGE_RECEIVED,
                    currentTransport: TRANSPORT_LONG_POLLING,
                    lastError: null,
                    associatedRequest: null,
                    messageId: 0
                };
                _initializeState();
                $.cometService.log(_connectionConfig.loggingLevel, [`Connection ${_instanceId} state reset.`]);
            }

            /**
             * Configures and prepares the connection based on provided options.
             * @param {Object} newOptions Options to merge with default configuration.
             * @private
             */
            function _initiateSubscription(newOptions) {
                _resetConnectionState();

                // Using Object.assign for merging, a modern alternative to jQuery.extend
                _connectionConfig = Object.assign({}, _connectionConfig, newOptions);

                // Basic validation for targetUrl, a new Type III addition
                if (!_connectionConfig.targetUrl) {
                    $.cometService.log("error", [`Connection ${_instanceId}: No target URL provided. Connection will not proceed.`]);
                    _isSubscribed = false; // Prevent connection without URL
                    return;
                }

                $.cometService.activeConnections.push(this); // Add self to global list
                $.cometService.log(_connectionConfig.loggingLevel, [`Connection ${_instanceId} subscription initiated.`]);
            }

            /**
             * Checks if WebSocket functionality is available in the environment.
             * @returns {boolean} True if WebSockets are supported.
             * @private
             */
            function _checkWsSupport() {
                // Check custom implementation first, then standard browser APIs
                const isSupported = !!(_connectionConfig.customWebSocketImpl || window.WebSocket || window.MozWebSocket);
                $.cometService.log("debug", [`WebSocket support check: ${isSupported}`]);
                return isSupported;
            }

            /**
             * Checks if Server-Sent Events functionality is available.
             * @returns {boolean} True if SSE is supported.
             * @private
             */
            function _checkSseSupport() {
                const isSupported = !!window.EventSource;
                $.cometService.log("debug", [`SSE support check: ${isSupported}`]);
                return isSupported;
            }

            /**
             * Attempts to reconnect using a fallback transport if the primary one fails.
             * @param {string} reason The reason for fallback.
             * @private
             */
            function _reconnectWithFallback(reason) {
                $.cometService.log(_connectionConfig.loggingLevel, [
                    `Connection ${_instanceId}: ${reason}. Attempting fallback to ${_connectionConfig.backupTransport}.`
                ]);
                _connectionConfig.primaryTransport = _connectionConfig.backupTransport;
                _startConnection(); // Re-attempt connection with fallback
            }

            /**
             * Initiates the connection using the configured primary transport.
             * @private
             */
            function _startConnection() {
                if (!_isSubscribed) {
                    $.cometService.log("warn", [`Connection ${_instanceId}: Attempted to start a non-subscribed connection.`]);
                    return;
                }

                _signalConnectionEvent(CONNECTION_STATE_OPENING, _connectionConfig.primaryTransport, _connectionConfig);

                // Use a switch statement for cleaner transport selection, Type III change
                switch (_connectionConfig.primaryTransport) {
                    case TRANSPORT_WEBSOCKET:
                        if (!_checkWsSupport()) {
                            _reconnectWithFallback(`WebSocket not supported.`);
                        } else {
                            _establishWebSocketConnection(false);
                        }
                        break;
                    case TRANSPORT_SSE:
                        if (!_checkSseSupport()) {
                            _reconnectWithFallback(`Server-Sent Events not supported.`);
                        } else {
                            _establishSseConnection(false);
                        }
                        break;
                    case TRANSPORT_LONG_POLLING:
                    case TRANSPORT_STREAMING:
                    case TRANSPORT_AJAX: // Explicitly handle AJAX
                        _handleAjaxTransport(_connectionConfig);
                        break;
                    case TRANSPORT_JSONP:
                        _handleJsonpTransport(_connectionConfig);
                        break;
                    default:
                        $.cometService.log("error", [`Connection ${_instanceId}: Unknown or unsupported transport: ${_connectionConfig.primaryTransport}.`]);
                        _signalConnectionEvent(CONNECTION_STATE_ERROR, _connectionConfig.primaryTransport, _connectionConfig);
                        break;
                }
            }

            /**
             * Updates the response object and invokes the appropriate callbacks.
             * @param {string} phase The current phase of the connection (e.g., 'opening', 'messageReceived').
             * @param {string} transport The transport method being used.
             * @param {Object} currentRequest The current request configuration.
             * @private
             */
            function _signalConnectionEvent(phase, transport, currentRequest) {
                // Store a reference to the current instance for the close method
                const self = this;
                currentRequest.closeConnection = function() {
                    self.closeConnection(); // Expose instance method
                    currentRequest.autoReconnect = false; // Prevent further auto-reconnections
                };

                _lastResponseData.associatedRequest = currentRequest;
                const previousPhase = _lastResponseData.connectionPhase;
                _lastResponseData.connectionPhase = phase;
                _lastResponseData.httpStatus = 200; // Assume success for general events
                const previousTransport = _lastResponseData.currentTransport;
                _lastResponseData.currentTransport = transport;

                _invokeCallbacks(); // Invoke instance and global callbacks
                _lastResponseData.connectionPhase = previousPhase; // Restore for next event
                _lastResponseData.currentTransport = previousTransport; // Restore
            }

            /**
             * Prepares the URL and data for HTTP-based transports (AJAX/JSONP).
             * @param {Object} reqConfig The request configuration.
             * @returns {{url: string, data: string}} Prepared URL and data.
             * @private
             */
            function _prepareHttpPayload(reqConfig) {
                let currentUrl = reqConfig.targetUrl;
                let currentData = reqConfig.postData;

                if (reqConfig.appendHeadersToQuery) {
                    // This function _addHeadersToUrl needs to exist or be inlined
                    currentUrl = _addHeadersToUrl(reqConfig);
                    if (currentData !== '') {
                        currentUrl += "&X-CometService-Post-Body=" + encodeURIComponent(currentData); // Renamed header
                        currentData = ''; // Clear data as it's now in URL
                    }
                }
                return { url: currentUrl, data: currentData };
            }

            /**
             * Handles JSONP transport requests.
             * @param {Object} reqConfig The request configuration.
             * @private
             */
            function _handleJsonpTransport(reqConfig) {
                const { url, data } = _prepareHttpPayload(reqConfig);

                if (!url) {
                    $.cometService.log("error", [`Connection ${_instanceId}: JSONP request failed, URL is empty.`]);
                    _signalConnectionEvent(CONNECTION_STATE_ERROR, TRANSPORT_JSONP, reqConfig);
                    return;
                }

                _currentAjaxRequest = $.ajax({
                    url: url,
                    type: reqConfig.requestMethod,
                    dataType: "jsonp",
                    jsonp: "jsonpCallbackHandler", // Renamed jsonp callback parameter
                    data: data,
                    timeout: reqConfig.connectionTimeout, // Added explicit timeout
                    error: function(jqXHR, statusText, errorThrown) {
                        $.cometService.log("warn", [`Connection ${_instanceId}: JSONP error. Status: ${jqXHR.status}, Text: ${statusText}, Error: ${errorThrown}`]);
                        // Only try reconnect if status is not a definitive error and retries are allowed
                        if (jqXHR.status < 300 && reqConfig.reconnectionAttemptCount < reqConfig.maxRetries) {
                            _attemptReconnection(_currentAjaxRequest, reqConfig, statusText, jqXHR.status);
                        } else {
                            _processCallback(statusText, CONNECTION_STATE_ERROR, jqXHR.status, TRANSPORT_JSONP);
                        }
                    },
                    success: function(jsonResponse) {
                        reqConfig.reconnectionAttemptCount++;

                        // Check if callback should execute before reconnection
                        if (reqConfig.callbackBeforeReconnection) {
                            _attemptReconnection(_currentAjaxRequest, reqConfig, "success", 200);
                        }

                        let messageContent = jsonResponse.message;
                        if (messageContent !== null && typeof messageContent !== 'string') {
                            try {
                                messageContent = JSON.stringify(messageContent); // Use native JSON.stringify
                            } catch (err) {
                                $.cometService.log("warn", [`Connection ${_instanceId}: Failed to stringify JSON message, possibly partial.`, err]);
                                // Message might be partial, proceed with original if stringification failed
                            }
                        }

                        _processCallback(messageContent, CONNECTION_STATE_MESSAGE_RECEIVED, 200, TRANSPORT_JSONP);

                        if (!reqConfig.callbackBeforeReconnection) {
                            _attemptReconnection(_currentAjaxRequest, reqConfig, "success", 200);
                        }
                    },
                    beforeSend: function(xhr) {
                        _prepareHttpRequest(xhr, reqConfig);
                    }
                });
            }

            /**
             * Handles standard AJAX transport requests (long-polling, streaming).
             * @param {Object} reqConfig The request configuration.
             * @private
             */
            function _handleAjaxTransport(reqConfig) {
                const { url, data } = _prepareHttpPayload(reqConfig);

                if (!url) {
                    $.cometService.log("error", [`Connection ${_instanceId}: AJAX request failed, URL is empty.`]);
                    _signalConnectionEvent(CONNECTION_STATE_ERROR, TRANSPORT_AJAX, reqConfig);
                    return;
                }

                _currentAjaxRequest = $.ajax({
                    url: url,
                    type: reqConfig.requestMethod,
                    data: data,
                    timeout: reqConfig.connectionTimeout, // Added explicit timeout
                    xhrFields: {
                        withCredentials: reqConfig.allowCredentials // Renamed property
                    },
                    error: function(xhrObject, statusText, errorThrown) {
                        $.cometService.log("warn", [`Connection ${_instanceId}: AJAX error. Status: ${xhrObject.status}, Text: ${statusText}, Error: ${errorThrown}`]);
                        if (xhrObject.status < 300 && reqConfig.reconnectionAttemptCount < reqConfig.maxRetries) {
                            _attemptReconnection(_currentAjaxRequest, reqConfig, statusText, xhrObject.status);
                        } else {
                            _processCallback(statusText, CONNECTION_STATE_ERROR, xhrObject.status, reqConfig.primaryTransport);
                        }
                    },
                    success: function(responseData, statusText, xhrObject) {
                        reqConfig.reconnectionAttemptCount++;

                        if (reqConfig.callbackBeforeReconnection) {
                            _attemptReconnection(_currentAjaxRequest, reqConfig, "success", 200);
                        }

                        _processCallback(responseData, CONNECTION_STATE_MESSAGE_RECEIVED, 200, reqConfig.primaryTransport);

                        if (!reqConfig.callbackBeforeReconnection) {
                            _attemptReconnection(_currentAjaxRequest, reqConfig, "success", 200);
                        }
                    },
                    beforeSend: function(xhrObject) {
                        _prepareHttpRequest(xhrObject, reqConfig);
                    }
                });
            }

            /**
             * Helper to prepare HTTP requests before sending.
             * Renamed from _doRequest and slightly modified.
             * @param {XMLHttpRequest} xhr The XMLHttpRequest object.
             * @param {Object} reqConfig The request configuration.
             * @private
             */
            function _prepareHttpRequest(xhr, reqConfig) {
                // Add custom headers
                for (const headerName in reqConfig.requestHeaders) {
                    if (reqConfig.requestHeaders.hasOwnProperty(headerName)) {
                        xhr.setRequestHeader(headerName, reqConfig.requestHeaders[headerName]);
                    }
                }

                // Set custom CometService headers
                xhr.setRequestHeader("X-CometService-Transport", reqConfig.primaryTransport); // Renamed header
                xhr.setRequestHeader("X-CometService-Request-ID", _instanceId); // New header
                xhr.setRequestHeader("X-CometService-Max-Retries", reqConfig.maxRetries); // New header
            }

            /**
             * Attempts to reconnect the connection after a success or error.
             * @param {jqXHR} currentXHR The current AJAX request object.
             * @param {Object} reqConfig The request configuration.
             * @param {string} status The status text.
             * @param {number} httpStatus The HTTP status code.
             * @private
             */
            function _attemptReconnection(currentXHR, reqConfig, status, httpStatus) {
                if (reqConfig.autoReconnect && reqConfig.reconnectionAttemptCount < reqConfig.maxRetries) {
                    $.cometService.log(reqConfig.loggingLevel, [`Connection ${_instanceId}: Reconnecting (${reqConfig.reconnectionAttemptCount}/${reqConfig.maxRetries})...`]);
                    // Introduce a small delay before reconnecting, a new Type III addition
                    setTimeout(() => {
                        _startConnection(); // Re-execute the connection logic
                        _processCallback(status, "reconnecting", httpStatus, reqConfig.primaryTransport); // Signal reconnect event
                    }, 500 + Math.random() * 1000); // Random delay between 0.5 and 1.5 seconds
                } else {
                    $.cometService.log("error", [`Connection ${_instanceId}: Maximum reconnection attempts (${reqConfig.maxRetries}) reached.`]);
                    _processCallback("Max retries reached", CONNECTION_STATE_ERROR, 0, reqConfig.primaryTransport);
                    _isSubscribed = false; // Mark as unsubscribed if max retries reached
                }
            }

            /**
             * Creates a WebSocket instance, either custom or native.
             * @param {string} endpoint The WebSocket URL.
             * @returns {WebSocket} A WebSocket object.
             * @private
             */
            function _createWebSocketInstance(endpoint) {
                if (!endpoint || typeof endpoint !== 'string') {
                    $.cometService.log("error", [`Connection ${_instanceId}: Invalid WebSocket endpoint provided: ${endpoint}`]);
                    throw new Error("Invalid WebSocket endpoint."); // Throw for immediate failure
                }
                if (_connectionConfig.customWebSocketImpl) {
                    $.cometService.log("debug", [`Connection ${_instanceId}: Using custom WebSocket implementation.`]);
                    return _connectionConfig.customWebSocketImpl;
                } else if (window.WebSocket) {
                    $.cometService.log("debug", [`Connection ${_instanceId}: Using native WebSocket.`]);
                    return new WebSocket(endpoint);
                } else if (window.MozWebSocket) {
                    $.cometService.log("debug", [`Connection ${_instanceId}: Using MozWebSocket.`]);
                    return new MozWebSocket(endpoint);
                }
                // Should not reach here if _checkWsSupport is used
                throw new Error("WebSocket API not available.");
            }

            /**
             * Constructs the WebSocket URL from the base URL and headers.
             * @param {Object} reqConfig The request configuration.
             * @returns {string} The final WebSocket URL.
             * @private
             */
            function _generateWsUrl(reqConfig) {
                let baseUrl = reqConfig.targetUrl;
                if (reqConfig.appendHeadersToQuery) {
                    baseUrl = _addHeadersToUrl(reqConfig); // Reuse header-adding logic
                }

                // Using URL object for robust URL manipulation, a Type III addition
                try {
                    const urlObj = new URL(baseUrl);
                    urlObj.protocol = urlObj.protocol === 'https:' ? 'wss:' : 'ws:';
                    // Decode URI component just in case, though URL object usually handles it
                    return decodeURIComponent(urlObj.toString());
                } catch (e) {
                    $.cometService.log("error", [`Connection ${_instanceId}: Failed to parse/build WebSocket URL from "${baseUrl}".`, e]);
                    return baseUrl.replace(/^http/, "ws"); // Fallback to simple replace
                }
            }

            /**
             * Constructs the Server-Sent Events URL from the base URL and headers.
             * @param {Object} reqConfig The request configuration.
             * @returns {string} The final SSE URL.
             * @private
             */
            function _generateSseUrl(reqConfig) {
                let baseUrl = reqConfig.targetUrl;
                if (reqConfig.appendHeadersToQuery) {
                    baseUrl = _addHeadersToUrl(reqConfig);
                }
                // SSE URLs are typically HTTP/HTTPS, no protocol change needed
                return decodeURIComponent(baseUrl);
            }

            /**
             * Helper function to add headers as query parameters to a URL.
             * Renamed from _attachHeaders.
             * @param {Object} reqConfig The request configuration.
             * @returns {string} The URL with headers appended as query parameters.
             * @private
             */
            function _addHeadersToUrl(reqConfig) {
                let url = reqConfig.targetUrl;
                let queryParams = [];

                // Add standard CometService headers
                queryParams.push("X-CometService-Transport=" + reqConfig.primaryTransport);
                queryParams.push("X-CometService-Request-ID=" + _instanceId);
                queryParams.push("X-CometService-Max-Retries=" + reqConfig.maxRetries);
                queryParams.push("X-CometService-Streaming-Length=" + reqConfig.streamDataLimit);

                // Add custom user-defined headers
                for (const headerKey in reqConfig.requestHeaders) {
                    if (reqConfig.requestHeaders.hasOwnProperty(headerKey)) {
                        queryParams.push(`${headerKey}=${encodeURIComponent(reqConfig.requestHeaders[headerKey])}`);
                    }
                }

                // Append query parameters
                const separator = url.indexOf('?') === -1 ? '?' : '&';
                return url + separator + queryParams.join('&');
            }

            /**
             * Establishes a Server-Sent Events connection.
             * @param {boolean} alreadyOpen Flag indicating if connection is already open (reconnect scenario).
             * @private
             */
            function _establishSseConnection(alreadyOpen) {
                _lastResponseData.currentTransport = TRANSPORT_SSE;

                const sseEndpoint = _generateSseUrl(_connectionConfig);

                if (!sseEndpoint) {
                    $.cometService.log("error", [`Connection ${_instanceId}: SSE endpoint is empty, cannot establish connection.`]);
                    _reconnectWithFallback("Empty SSE endpoint.");
                    return;
                }

                $.cometService.log(_connectionConfig.loggingLevel, [`Connection ${_instanceId}: Attempting to connect via SSE to ${sseEndpoint}.`]);

                // Guard against re-opening if already open, Type III addition
                if (_sseInstance && _sseInstance.readyState !== EventSource.CLOSED) {
                    $.cometService.log("warn", [`Connection ${_instanceId}: SSE instance already active, skipping re-initialization.`]);
                    return;
                }

                _sseInstance = new EventSource(sseEndpoint);

                _sseInstance.onopen = function(event) {
                    if (!alreadyOpen) {
                        _processCallback("SSE connection opened", CONNECTION_STATE_OPENING, 200, TRANSPORT_SSE, event);
                    }
                    $.cometService.log(_connectionConfig.loggingLevel, [`Connection ${_instanceId}: SSE connection established.`]);
                };

                _sseInstance.onmessage = function(event) {
                    _processCallback(event.data, CONNECTION_STATE_MESSAGE_RECEIVED, 200, TRANSPORT_SSE, event);
                    $.cometService.log(_connectionConfig.loggingLevel, [`Connection ${_instanceId}: SSE message received.`, event.data]);
                };

                _sseInstance.onerror = function(event) {
                    $.cometService.log("error", [`Connection ${_instanceId}: SSE error detected.`, event]);
                    _processCallback("SSE error", CONNECTION_STATE_ERROR, 0, TRANSPORT_SSE, event);
                    // Check if the event source was explicitly closed or if it's a network error
                    if (_sseInstance.readyState === EventSource.CLOSED) {
                        $.cometService.log(_connectionConfig.loggingLevel, [`Connection ${_instanceId}: SSE connection closed due to error.`]);
                        if (_connectionConfig.autoReconnect) {
                            _attemptReconnection(null, _connectionConfig, "SSE error, reconnecting", 0);
                        } else {
                            _processCallback("SSE connection closed", CONNECTION_STATE_CLOSED, 0, TRANSPORT_SSE, event);
                        }
                    } else {
                        // For other errors, might need specific handling or just log
                        $.cometService.log("debug", [`Connection ${_instanceId}: SSE error but connection might still be open. ReadyState: ${_sseInstance.readyState}`]);
                    }
                };
            }

            /**
             * Establishes a WebSocket connection.
             * @param {boolean} alreadyOpen Flag indicating if connection is already open (reconnect scenario).
             * @private
             */
            function _establishWebSocketConnection(alreadyOpen) {
                _lastResponseData.currentTransport = TRANSPORT_WEBSOCKET;
                const wsEndpoint = _generateWsUrl(_connectionConfig);

                if (!wsEndpoint) {
                    $.cometService.log("error", [`Connection ${_instanceId}: WebSocket endpoint is empty, cannot establish connection.`]);
                    _reconnectWithFallback("Empty WebSocket endpoint.");
                    return;
                }

                $.cometService.log(_connectionConfig.loggingLevel, [`Connection ${_instanceId}: Attempting to connect via WebSocket to ${wsEndpoint}.`]);

                // Guard against re-opening if already open
                if (_wsInstance && _wsInstance.readyState === WebSocket.OPEN) {
                    $.cometService.log("warn", [`Connection ${_instanceId}: WebSocket instance already active, skipping re-initialization.`]);
                    return;
                }

                try {
                    _wsInstance = _createWebSocketInstance(wsEndpoint);
                } catch (e) {
                    $.cometService.log("error", [`Connection ${_instanceId}: Failed to create WebSocket instance:`, e]);
                    _reconnectWithFallback("Failed to create WebSocket instance.");
                    return;
                }

                _wsInstance.onopen = function(event) {
                    if (!alreadyOpen) {
                        _processCallback("WebSocket connection opened", CONNECTION_STATE_OPENING, 200, TRANSPORT_WEBSOCKET, event);
                    }
                    $.cometService.log(_connectionConfig.loggingLevel, [`Connection ${_instanceId}: WebSocket connection established.`]);
                };

                _wsInstance.onmessage = function(event) {
                    _processCallback(event.data, CONNECTION_STATE_MESSAGE_RECEIVED, 200, TRANSPORT_WEBSOCKET, event);
                    $.cometService.log(_connectionConfig.loggingLevel, [`Connection ${_instanceId}: WebSocket message received.`, event.data]);
                };

                _wsInstance.onclose = function(event) {
                    $.cometService.log("info", [`Connection ${_instanceId}: WebSocket connection closed. Code: ${event.code}, Reason: ${event.reason}`]);
                    _processCallback("WebSocket closed", CONNECTION_STATE_CLOSED, event.code, TRANSPORT_WEBSOCKET, event);
                    if (_connectionConfig.autoReconnect) {
                        _attemptReconnection(null, _connectionConfig, "WebSocket closed, reconnecting", event.code);
                    }
                };

                _wsInstance.onerror = function(event) {
                    $.cometService.log("error", [`Connection ${_instanceId}: WebSocket error detected.`, event]);
                    _processCallback("WebSocket error", CONNECTION_STATE_ERROR, 0, TRANSPORT_WEBSOCKET, event);
                    // On error, the onclose event will usually follow, so no explicit reconnect here
                };
            }

            /**
             * Processes a callback by updating the response object and invoking relevant handlers.
             * Renamed from _prepareCallback and extended.
             * @param {any} data The data associated with the callback.
             * @param {string} phase The connection phase.
             * @param {number} statusCode The HTTP status code or similar.
             * @param {string} currentTransport The transport in use.
             * @param {Event|Object} [originalEvent] The original event object if available.
             * @private
             */
            function _processCallback(data, phase, statusCode, currentTransport, originalEvent = {}) {
                _lastResponseData.receivedBody = data;
                _lastResponseData.connectionPhase = phase;
                _lastResponseData.httpStatus = statusCode;
                _lastResponseData.currentTransport = currentTransport;
                _lastResponseData.lastError = (phase === CONNECTION_STATE_ERROR) ? originalEvent : null;
                _lastResponseData.messageId++; // Increment message ID with each processed callback

                _invokeCallbacks();
            }

            /**
             * Invokes the appropriate instance-level and global callbacks based on the current response phase.
             * Renamed from _invokeCallback and refined.
             * @private
             */
            function _invokeCallbacks() {
                const currentPhase = _lastResponseData.connectionPhase;
                const response = Object.assign({}, _lastResponseData); // Pass a copy of response data

                // Invoke instance-specific callbacks first
                switch (currentPhase) {
                    case CONNECTION_STATE_OPENING:
                        _connectionConfig.onConnOpen(response);
                        $.cometService.onGlobalOpen(response);
                        break;
                    case CONNECTION_STATE_MESSAGE_RECEIVED:
                        _connectionConfig.onConnMessage(response);
                        $.cometService.onGlobalMessage(response);
                        break;
                    case CONNECTION_STATE_ERROR:
                        _connectionConfig.onConnError(response);
                        $.cometService.onGlobalError(response);
                        break;
                    case CONNECTION_STATE_CLOSED:
                        _connectionConfig.onConnClose(response);
                        $.cometService.onGlobalClose(response);
                        break;
                    case "reconnecting": // Custom phase for reconnection attempts
                        _connectionConfig.onConnReestablish(_connectionConfig, response);
                        $.cometService.onGlobalReestablish(_connectionConfig, response);
                        break;
                    case "messagePublished": // For publish confirmations
                        _connectionConfig.onConnPublish(response);
                        $.cometService.onGlobalPublish(response);
                        break;
                    case "transportFailure": // For transport-specific issues
                        _connectionConfig.onConnTransportFailure(response.lastError, _connectionConfig);
                        $.cometService.onGlobalTransportIssue(response);
                        break;
                    default:
                        $.cometService.log("warn", [`Connection ${_instanceId}: Unhandled connection phase: ${currentPhase}`]);
                        break;
                }

                // Also invoke the generic callbackFunction if provided
                if (typeof _connectionConfig.callbackFunction === 'function') {
                    _connectionConfig.callbackFunction(response);
                }
            }

            /**
             * Public method to manually close the connection.
             * @memberof $.cometService.StreamConnection.prototype
             */
            this.closeConnection = function() {
                if (_isAbortingConnection) {
                    $.cometService.log(_connectionConfig.loggingLevel, [`Connection ${_instanceId}: Already aborting.`]);
                    return;
                }
                _isAbortingConnection = true;
                _isSubscribed = false; // Mark as unsubscribed

                $.cometService.log(_connectionConfig.loggingLevel, [`Connection ${_instanceId}: Closing connection.`]);

                if (_currentAjaxRequest) {
                    _currentAjaxRequest.abort();
                    _currentAjaxRequest = null;
                }
                if (_wsInstance) {
                    _wsInstance.close();
                    _wsInstance = null;
                }
                if (_sseInstance) {
                    _sseInstance.close();
                    _sseInstance = null;
                }

                _processCallback("Connection manually closed", CONNECTION_STATE_CLOSED, 200, _lastResponseData.currentTransport);
                _isAbortingConnection = false;

                // Remove this instance from the global activeConnections array
                const index = $.cometService.activeConnections.indexOf(this);
                if (index > -1) {
                    $.cometService.activeConnections.splice(index, 1);
                }
            };

            /**
             * Public method to get the current connection configuration.
             * @returns {Object} A copy of the current configuration.
             * @memberof $.cometService.StreamConnection.prototype
             */
            this.getConfiguration = function() {
                return Object.assign({}, _connectionConfig);
            };

            /**
             * Public method to get the last response data.
             * @returns {Object} A copy of the last response data.
             * @memberof $.cometService.StreamConnection.prototype
             */
            this.getLastResponse = function() {
                return Object.assign({}, _lastResponseData);
            };

            /**
             * Public method to send data over an active WebSocket connection.
             * @param {string|Object} message The message to send.
             * @returns {boolean} True if message was sent, false otherwise.
             * @memberof $.cometService.StreamConnection.prototype
             */
            this.sendData = function(message) {
                if (_connectionConfig.primaryTransport !== TRANSPORT_WEBSOCKET || !_wsInstance || _wsInstance.readyState !== WebSocket.OPEN) {
                    $.cometService.log("warn", [`Connection ${_instanceId}: Cannot send data, WebSocket is not open or not primary transport.`]);
                    return false;
                }
                let dataToSend = message;
                if (typeof message !== 'string') {
                    try {
                        dataToSend = JSON.stringify(message);
                    } catch (e) {
                        $.cometService.log("error", [`Connection ${_instanceId}: Failed to stringify message for WebSocket send:`, e]);
                        return false;
                    }
                }
                _wsInstance.send(dataToSend);
                $.cometService.log(_connectionConfig.loggingLevel, [`Connection ${_instanceId}: Data sent via WebSocket.`, dataToSend]);
                _processCallback(dataToSend, "messagePublished", 200, TRANSPORT_WEBSOCKET); // Signal publish event
                return true;
            };

            // Automatic call to initiate subscription and start connection
            _initiateSubscription.call(this, setupOptions); // Use .call to set 'this' context
            _startConnection(); // Immediately start the connection
        }
    };

    // jQuery unload event handler, slightly rephrased
    $(window).on('beforeunload unload', function() {
        $.cometService.log("info", ["Window is unloading, disconnecting all CometService connections."]);
        $.cometService.disconnectAll();
    });

})(jQuery); // Pass jQuery to the closure