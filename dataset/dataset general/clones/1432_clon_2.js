/*
 * Copyright 2024 NewDeveloper
 *
 * This software is licensed under the MIT License.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
/**
 * MyAppSystem.js
 * https://github.com/YourOrg/myappsystem-js
 *
 * Requires
 * - jQuery 3.x.x http://jquery.com/
 *
 * Documentation available at
 * https://github.com/YourOrg/myappsystem/wiki/JQuery.myappsystem.js-API
 *
 * Inspired by similar connection libraries
 * - Connectify by SomeOtherDev http://someotherdev.github.io/connectify/
 */
(function(buildModule) {
    if (typeof define === 'function' && define.amd) {
        // Asynchronous Module Definition
        define(['jquery'], buildModule);
    } else {
        // Standard browser global scope (Window)
        buildModule(jQuery);
    }
}(function(jQuery) {

    jQuery(window).bind("depart.appsys", function () {
        jQuery.appsys.disconnectAll();
    });

    jQuery(window).bind("networkLoss", function () {
        var activeConnsCopy = [].concat(jQuery.appsys.activeConns);
        for (var idx = 0; idx < activeConnsCopy.length; idx++) {
            var currentReq = activeConnsCopy[idx];
            currentReq.terminate();
            clearTimeout(currentReq.statusInfo.query.identifier);

            if (currentReq.pulseMonitor) {
                clearTimeout(currentReq.pulseMonitor);
            }
        }
    });

    jQuery(window).bind("networkRestore", function () {
        if (jQuery.appsys.activeConns.length > 0) {
            for (var idx = 0; idx < jQuery.appsys.activeConns.length; idx++) {
                jQuery.appsys.activeConns[idx].initialize();
                jQuery.appsys.activeConns[idx].performAction();
            }
        }
    });

    // Stop the browser's default behavior for ESC key which might close connections in Firefox.
    jQuery(window).keypress(function (evt) {
        if (evt.whichKey === 27) {
            evt.stopDefault();
        }
    });

    var processHttpHeaders = function (inputHeaderStr) {
        var capturedMatch, headerPattern = /^(.*?):[ \t]*([^\r\n]*)\r?$/mg, parsedMap = {};
        while (capturedMatch = headerPattern.exec(inputHeaderStr)) {
            parsedMap[capturedMatch[1]] = capturedMatch[2];
        }
        return parsedMap;
    };

    jQuery.appsys = {
        libVersion: "3.0.0-jquery",
        uniqueIdGen : 0,
        activeConns: [],
        eventHandlers: [],

        onGeneralError: function (responseStatus) {
        },
        onConnectionEnd: function (responseStatus) {
        },
        onConnectionStart: function (responseStatus) {
        },
        onDataReceived: function (responseStatus) {
        },
        onReestablish: function (requestConfig, responseStatus) {
        },
        onDataSent: function (responseStatus) {
        },
        onChannelFailure: function (failureMessage, currentRequest) {
        },
        onInternalMsg: function (responseStatus) {
        },
        onClientExpiry: function(requestConfig){
        },
        onReestablishFailure: function (requestConfig, responseStatus) {
        },

        /**
         * Generates an object from an application subscription that provides methods mirroring the WebSocket interface.
         *
         * @class SocketGatewayAdapter
         * @param {Object} subscriptionReq the configuration object for the underlying subscription
         * @constructor
         */
        SocketGatewayAdapter: function (subscriptionReq) {
            var _connHandle, _gateway;

            /**
             * Overrides the message reception callback within the provided request configuration.
             *
             * @method onDataReceived
             * @param {Object} eventObj the event data object
             */
            subscriptionReq.onDataReceived = function (eventObj) {
                _gateway.onDataReceived({payloadContent: eventObj.payloadContent});
            };

            /**
             * Overrides the message published callback within the provided request configuration.
             *
             * @method onDataSent
             * @param {Object} eventObj the event data object
             */
            subscriptionReq.onDataSent = function (eventObj) {
                _gateway.onDataReceived({payloadContent: eventObj.payloadContent});
            };

            /**
             * Overrides the connection open callback within the provided request configuration to proxy the event to the adapter.
             *
             * @method onConnectionStart
             * @param {Object} eventObj the event data object
             */
            subscriptionReq.onConnectionStart = function (eventObj) {
                _gateway.onConnectionStart(eventObj);
            };

            _gateway = {
                shutDown: function () {
                    _connHandle.shutDown();
                },

                transmit: function (dataContent) {
                    _connHandle.sendData(dataContent);
                },

                onDataReceived: function(eventObj) {
                },

                onConnectionStart: function(eventObj) {
                },

                onConnectionEnd: function (eventObj) {
                },

                onGeneralError: function (eventObj) {

                }
            };
            _connHandle = new $.appsys.initSubscription(subscriptionReq);

            return _gateway;
        },

        SystemChannelRequest: function (configOptions) {

            /**
             * {Object} Configuration parameters for the request.
             *
             * @private
             */
            var _channelConfig = {
                connectionTimeoutMs: 300000,
                httpMethod: 'GET',
                requestHeaders: {},
                contentDataType: '',
                responseCallback: null,
                targetUrl: '',
                requestPayload: '',
                keepAlive: true,
                maxRetryCount: -1,
                autoReconnect: true,
                maxStreamCapacity: 10000000,
                lastProcessedIdx: 0,
                debugLevel: 'info',
                attemptCounter: 0,
                backupHttpMethod: 'GET',
                backupTransportType: 'streaming',
                primaryTransport: 'long-polling',
                customWsImpl: null,
                wsBinaryFormat: null,
                routingUrl: null,
                wsPathSeparator: "@@",
                xdrEnabled: false,
                urlRewritingEnabled: false,
                headersAsQueryParams: true,
                callbackBeforeReconn: false,
                currentReadyState: 0,
                sendCredentials: false,
                monitorMsgSize: false,
                msgSeparator: '|',
                initialConnectTimeout: -1,
                reconnectionDelayMs: 0,
                omitHeaders: true,
                sessionIdentifier: 0,
                isShared: false,
                readResponseMetadata: false,
                maxReconnOnClose: 5,
                protocolEnabled: true,
                pollingFrequencyMs : 0,
                pulse: {
                    clientSide: null,
                    serverSide: null
                },
                acknowledgmentInterval: 0,
                asyncClose: false,
                reconnectOnError: true,
                onGeneralError: function (responseStatus) {
                },
                onConnectionEnd: function (responseStatus) {
                },
                onConnectionStart: function (responseStatus) {
                },
                onDataReceived: function (responseStatus) {
                },
                onReopening: function (requestConfig, responseStatus) {
                },
                onReestablish: function (requestConfig, responseStatus) {
                },
                onDataSent: function (responseStatus) {
                },
                onChannelFailure: function (failureReason, requestConfig) {
                },
                onInternalMsg: function (requestConfig) {
                },
                onReestablishFailure: function (requestConfig, responseStatus) {
                },
                onClientExpiry: function(requestConfig){
                }
            };

            /**
             * {Object} The last received status information for this request.
             *
             * @private
             */
            var _channelStatus = {
                statusCode: 200,
                statusText: "OK",
                receivedContent: '',
                messageQueue: [],
                responseHeaders: [],
                currentState: "messageReceived",
                activeTransport: "polling",
                lastError: null,
                associatedRequest: null,
                incompleteMessage: "",
                isErrorProcessed: false,
                closedDueToClientTimeout: false,
                firefoxReconnecting : false
            };

            /**
             * {WebSocket} The active WebSocket connection.
             *
             * @private
             */
            var _wsConnection = null;

            /**
             * {EventSource} The active Server-Sent Events connection.
             *
             * @private
             */
            var _serverEvents = null;

            /**
             * {XMLHttpRequest, ActiveXObject} The active HTTP request (for streaming or long-polling).
             *
             * @private
             */
            var _activeHttpRequest = null;

            /**
             * {Object} Special handler for IE streaming.
             *
             * @private
             */
            var _ieStreamHandler = null;

            /**
             * {Object} Represents the JSONP request object.
             *
             * @private
             */
            var _jsonpRequest = null;

            /**
             * {boolean} Indicates if the request has been successfully subscribed.
             *
             * @private
             */
            var _isSubscribed = true;

            /**
             * {number} Counter for reconnection attempts.
             *
             * @private
             */
            var _reconnectionAttempts = 0;

            /**
             * The heartbeat interval configured by the server.
             * @type {number}
             * @private
             */
            var _pulseFrequency = 0;

            /**
             * The padding bytes used for server heartbeats.
             * @type {string}
             * @private
             */
            var _pulsePayload = ' ';

            /**
             * {boolean} Flag indicating if the connection is currently being terminated.
             *
             * @private
             */
            var _isAborting = false;

            /**
             * A local "communication channel" function.
             *
             * @private
             */
            var _localChannelFunc = null;

            /**
             * The data storage mechanism utilized.
             *
             * @private
             */
            var _dataStore;

            /**
             * Local storage service instance.
             *
             * @private
             */
            var _localDataStore = null;

            /**
             * A globally unique identifier for this session.
             *
             * @private
             */
            var uniqueSessionId = jQuery.now();

            /** Connection activity monitoring timer */
            var _activityMonitor;

            /** Key used for sharing this connection across contexts */
            var _sessionShareKey;

            // Automatically begin the subscription process
            _initSubscription(configOptions);

            /**
             * Initializes the application request object.
             *
             * @private
             */
            function _initialize() {
                _isSubscribed = true;
                _isAborting = false;
                _reconnectionAttempts = 0;

                _wsConnection = null;
                _serverEvents = null;
                _activeHttpRequest = null;
                _ieStreamHandler = null;
            }

            /**
             * Resets and re-initializes the application object.
             *
             * @private
             */
            function _resetAndInit() {
                _clearConnectionState();
                _initialize();
            }

            /**
             * Determines if logging is enabled for the specified level or higher.
             *
             * @private
             */
            function _canOutputLog(logLevel) {
                if (logLevel == 'debug') {
                    return _channelConfig.debugLevel === 'debug';
                } else if (logLevel == 'info') {
                    return _channelConfig.debugLevel === 'info' || _channelConfig.debugLevel === 'debug';
                } else if (logLevel == 'warn') {
                    return _channelConfig.debugLevel === 'warn' || _channelConfig.debugLevel === 'info' || _channelConfig.debugLevel === 'debug';
                } else if (logLevel == 'error') {
                    return _channelConfig.debugLevel === 'error' || _channelConfig.debugLevel === 'warn' || _channelConfig.debugLevel === 'info' || _channelConfig.debugLevel === 'debug';
                } else {
                    return false;
                }
            }

            /**
             * Subscribes the request using the specified transport. <br>
             * If an existing request is open, it will be closed first.
             *
             * @param {Object} configOptions Configuration parameters for the subscription.
             * @private
             */
            function _initSubscription(configOptions) {
                _resetAndInit();

                _channelConfig = jQuery.extend(_channelConfig, configOptions);
                // Ensure at least one attempt is allowed
                _channelConfig.mrequest = _channelConfig.autoReconnect;
                if (!_channelConfig.autoReconnect) {
                    _channelConfig.autoReconnect = true;
                }
            }

            /**
             * Checks for WebSocket support (either custom implementation or native browser support).
             *
             * @returns {boolean} True if WebSocket is supported, false otherwise.
             * @private
             */
            function _supportsWebsockets() {
                return _channelConfig.customWsImpl != null || window.WebSocket || window.MozWebSocket;
            }

            /**
             * Checks for Server-Sent Events (SSE) support (either custom implementation or native browser support).
             *
             * @returns {boolean} True if SSE is supported, false otherwise.
             * @private
             */
            function _supportsServerEvents() {
                return window.EventSource;
            }

            /**
             * Initiates the connection using the request's configured transport. <br>
             * If the primary transport (e.g., WebSocket) fails, it will attempt to reconnect using a fallback.
             *
             * @private
             */
            function _performConnect() {
                // For connections shared across multiple browser tabs/windows.
                if (_channelConfig.isShared) {
                    _localDataStore = _getLocalStorage(_channelConfig);
                    if (_localDataStore != null) {
                        if (_canOutputLog('debug')) {
                            jQuery.appsys.logDebug("Local storage service detected. All communication will be handled locally.");
                        }

                        if (_localDataStore.open(_channelConfig)) {
                            // Successfully established local connection.
                            return;
                        }
                    }

                    if (_canOutputLog('debug')) {
                        jQuery.appsys.logDebug("No local storage service available or connection failed.");
                    }
                    // If not local or an error occurred, proceed with network connection
                    _localDataStore = null;
                }

                // Protocol handling
                _channelConfig.isFirstMsg = jQuery.appsys.uniqueIdGen == 0 ? true : false;
                _channelConfig.isConnOpen = false;
                _channelConfig.creationTime = jQuery.now();

                // Inherit any UUID set by the user or from a prior connection.
                if (_channelConfig.sessionIdentifier === 0) {
                    _channelConfig.sessionIdentifier = jQuery.appsys.uniqueIdGen;
                }
                _channelConfig.closedDueToClientTimeout = false;