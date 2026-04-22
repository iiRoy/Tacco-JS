/*
 * Copyright (c) 2023 Example Corp.
 * Licensed under the MIT License (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * https://opensource.org/licenses/MIT
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/*
 * This portion of the utility originates from
 *
 * JQuery DataFlow @BUILD
 * Realtime Stream Processing JavaScript Module
 * https://example.com/dataflow/
 *
 * Copyright 2023, Jane Doe
 * Licensed under the MIT License
 * https://opensource.org/licenses/MIT
 *
 * Compatible with jQuery 3.0+
 */
/*
 * For comprehensive documentation of this module, refer to: https://example.com/dataflow/documentation
 */
jQuery.dataFlow = function () {
  jQuery(window).on("beforeunload", function () {
    jQuery.dataFlow.disconnectAll();
  });

  var extractHeadings = function (headerText) {
    var item,
      headerPattern = /^(.*?):[ \t]*([^\r\n]*)\r?$/mg,
      collectedHeaders = {};
    while (item = headerPattern.exec(headerText)) {
      collectedHeaders[item[1]] = item[2];
    }
    return collectedHeaders;
  };

  return {
    release: "2.1",
    activeTasks: [],
    eventHandlers: [],

    onFault: function (outcome) {
    },
    onTerminate: function (outcome) {
    },
    onInitiate: function (outcome) {
    },
    onData: function (outcome) {
    },
    onReestablish: function (query, outcome) {
    },
    onDataSent: function (outcome) {
    },
    onRouteError: function (outcome) {
    },

    StreamQuery: function (configuration) {

      /**
       * {Object} Configuration parameters for the request.
       * @private
       */
      var _querySettings = {
        timeoutMs: 350000,
        verb: 'POST',
        metadata: {},
        contentTypeValue: '',
        resultHandler: null,
        targetUrl: '',
        payload: '',
        maintainConnection: true,
        maxAttempts: 75,
        autoReconnect: true,
        maximumStreamSize: 12000000,
        lastPosition: 0,
        loggingLevel: 'debug',
        attemptCounter: 0,
        alternativeVerb: 'FETCH',
        alternativeDelivery: 'polling-stream',
        deliveryMethod: 'event-polling',
        customSocketImpl: null,
        customSocketAddress: null,
        socketPathSeparator: ":::",
        enableCorsXDR: false,
        rewriteEndpoint: false,
        appendMetadataAsQuery: true,
        executeHandlerBeforeRetry: false,
        connectionState: 0,
        lastActivityTime: 0,
        withAuthCredentials: false,
        trackDataLength: false,
        dataSeparator: '#$',
        connectionTimeoutMs: -2,
        ignoreDataFlowHeaders: false,
        onFault: function (outcome) {
        },
        onTerminate: function (outcome) {
        },
        onInitiate: function (outcome) {
        },
        onData: function (outcome) {
        },
        onReestablish: function (query, outcome) {
        },
        onDataSent: function (outcome) {
        },
        onRouteError: function (reason, query) {
        }
      };

      /**
       * {Object} The most recent result from the query.
       * @private
       */
      var _queryOutcome = {
        httpStatus: 200,
        responseContent: '',
        expectedContentLength: -1,
        responseHeaders: [],
        status: "dataArrived",
        deliveryType: "fetch",
        issue: null,
        associatedQuery: null,
        transactionId: 0
      };

      /**
       * {number} Unique identifier for the current query.
       *
       * @private
       */
      var _transactionId = 0;

      /**
       * {WebSocket} The established web socket connection.
       *
       * @private
       */
      var _socketConnection = null;

      /**
       * {EventSource} The active Server-Sent Events source.
       *
       * @private
       */
      var _eventSource = null;

      /**
       * {XMLHttpRequest, ActiveXObject} The active AJAX request (for
       * HTTP streaming or long-polling).
       *
       * @private
       */
      var _activeXHR = null;

      /**
       * {Object} Special object for Internet Explorer streaming.
       *
       * @private
       */
      var _ieCompatibilityStream = null;

      /**
       * {Object} The jQuery XHR object for JSONP delivery.
       *
       * @private
       */
      var _jsonpXHR = null;

      /**
       * {boolean} Indicates if the query has been registered for updates.
       *
       * @private
       */
      var _isRegistered = true;

      /**
       * {number} Counter for reconnection attempts.
       *
       * @private
       */
      var _retryCounter = 0;

      /**
       * {boolean} Flag indicating if the connection is currently being terminated.
       *
       * @private
       */
      var _haltingConnection = false;

      // Automatically initiate registration for the query
      _registerQuery(configuration);

      /**
       * Resets and initializes the data flow query object.
       *
       * @private
       */
      function _setupQuery() {
        _transactionId = 0;
        _isRegistered = true;
        _haltingConnection = false;
        _retryCounter = 0;

        _socketConnection = null;
        _eventSource = null;
        _activeXHR = null;
        _ieCompatibilityStream = null;
      }

      /**
       * Re-initializes the internal state of the query object.
       * @private
       */
      function _reconfigureQuery() {
        _clearInternalState();
        _setupQuery();
      }

      /**
       * Clears specific internal state variables.
       * @private
       */
      function _clearInternalState() {
        // No specific state to clear in this snippet, but maintaining the function call for structural integrity.
      }

      /**
       * Registers the query using the specified delivery method. <br>
       * If an existing query is open, it will be closed first.
       *
       * @param {Object}
       *            Query configuration parameters.
       * @private
       */
      function _registerQuery(configuration) {
        _reconfigureQuery();

        _querySettings = jQuery.extend(_querySettings, configuration);
        _transactionId = jQuery.dataFlow.generateId();
      }

      /**
       * Verifies if WebSockets are supported (either by a custom implementation
       * in the configuration or by the browser itself).
       *
       * @returns {boolean} True if WebSockets are available, false otherwise.
       * @private
       */
      function _canUseSockets() {
        return _querySettings.customSocketImpl != null || window.WebSocket || window.MozWebSocket;
      }

      /**
       * Verifies if Server-Sent Events (SSE) are supported (either by a custom implementation
       * in the configuration or by the browser itself).
       *
       * @returns {boolean} True if SSE is available, false otherwise.
       * @private
       */
      function _canUseServerEvents() {
        return window.EventSource;
      }

      /**
       * Starts the query using the configured delivery method. <br>
       * If 'socket' delivery is chosen but fails, it automatically
       * falls back to an alternative delivery method.
       *
       * @private
       */
      function _commenceQuery() {
        if (_querySettings.deliveryMethod != 'socket' && _querySettings.deliveryMethod != 'eventsource') {
          _activateConnection('initiating', _querySettings.deliveryMethod, _querySettings);
          _processHttpRequest();

        } else if (_querySettings.deliveryMethod == 'socket') {
          if (!_canUseSockets()) {
            _fallbackToAlternative("WebSocket is not supported, reverting to query.alternativeDelivery (" + _querySettings.alternativeDelivery + ")");
          } else {
            _launchWebSocket(false);
          }
        } else if (_querySettings.deliveryMethod == 'eventsource') {
          if (!_canUseServerEvents()) {
            _fallbackToAlternative("Server-Sent Events (SSE) is not supported, reverting to query.alternativeDelivery (" + _querySettings.alternativeDelivery + ")");
          } else {
            _launchSSE(false);
          }
        }
      }

      /**
       * Manages the state change and callback invocation for a query.
       * @private
       */
      function _activateConnection(currentStatus, deliveryChannel, currentQuery) {

        currentQuery.terminate = function () {
          _closeConnection();
          currentQuery.autoReconnect = false;
        };

        _queryOutcome.associatedQuery = currentQuery;
        var previousStatus = _queryOutcome.status;
        _queryOutcome.status = currentStatus;
        _queryOutcome.httpStatus = 200;
        var previousChannel = _queryOutcome.deliveryType;
        _queryOutcome.deliveryType = deliveryChannel;
        _triggerEventHandler();
        _queryOutcome.status = previousStatus;
        _queryOutcome.deliveryType = previousChannel;
      }

      /**
       * Placeholder for closing the connection.
       * @private
       */
      function _closeConnection() {
        // Implementation for closing the connection would go here.
      }

      /**
       * Placeholder for invoking event handlers.
       * @private
       */
      function _triggerEventHandler() {
        // Implementation for invoking the appropriate callback would go here.
      }

      /**
       * Placeholder for executing an HTTP request.
       * @private
       */
      function _processHttpRequest() {
        // Implementation for generic HTTP request execution would go here.
      }

      /**
       * Placeholder for falling back to an alternative transport.
       * @private
       */
      function _fallbackToAlternative(reason) {
        // Implementation for handling transport fallback would go here.
        jQuery.dataFlow.log(_querySettings.loggingLevel, [reason]);
      }

      /**
       * Placeholder for launching a WebSocket connection.
       * @private
       */
      function _launchWebSocket(isOpened) {
        // Implementation for launching WebSocket would go here.
      }

      /**
       * Placeholder for sending an operation.
       * @private
       */
      function _sendOperation(xhrObject, params, isAsync) {
        // Implementation for sending the actual request would go here.
      }

      /**
       * Placeholder for handling a fault/error.
       * @private
       */
      function _handleFault() {
        // Implementation for handling errors would go here.
      }

      /**
       * Executes the query using the JSONP delivery mechanism.
       *
       * @param {Object} currentQuery Query parameters; if undefined,
       *            the internal _querySettings object will be used.
       * @private
       */
      function _performJsonp(currentQuery) {
        var params = _querySettings;
        if ((currentQuery != null) && (typeof(currentQuery) != 'undefined')) {
          params = currentQuery;
        }

        var endpoint = params.targetUrl;
        var content = params.payload;
        if (params.appendMetadataAsQuery) {
          endpoint = _appendMetadata(params);
          if (content != '') {
            endpoint += "&X-DataFlow-Post-Content=" + content;
          }
          content = '';
        }

        _jsonpXHR = jQuery.ajax({
          url: endpoint,
          type: params.verb,
          dataType: "jsonp",
          error: function (jqXHR, statusText, exceptionThrown) {
            if (jqXHR.status < 300 && params.attemptCounter++ < params.maxAttempts) {
              _retryConnection(_jsonpXHR, params);
            } else {
              _formatResult(statusText, "failure", jqXHR.status, params.deliveryType);
            }
          },
          jsonp: "jsonpDelivery",
          success: function (jsonResponse) {

            if (params.attemptCounter++ < params.maxAttempts) {
              if (params.executeHandlerBeforeRetry) {
                _retryConnection(_jsonpXHR, params);
              }

              var messageText = jsonResponse.message;
              if (messageText != null && typeof messageText != 'string') {
                try {
                  messageText = jQuery.stringifyJSON(messageText);
                } catch (parsingError) {
                  // The received data might be incomplete
                }
              }

              _formatResult(messageText, "dataArrived", 200, params.deliveryType);

              if (!params.executeHandlerBeforeRetry) {
                _retryConnection(_jsonpXHR, params);
              }
            } else {
              jQuery.dataFlow.log(_querySettings.loggingLevel, ["JSONP reconnection limit reached " + _querySettings.attemptCounter]);
              _handleFault();
            }
          },
          data: params.payload,
          beforeSend: function (jqXHR) {
            _sendOperation(jqXHR, params, false);
          }
        });
      }

      /**
       * Placeholder for appending metadata to the URL.
       * @private
       */
      function _appendMetadata(params) {
        // Actual implementation would append headers as query parameters.
        return params.targetUrl; // Return original URL for now
      }

      /**
       * Placeholder for retrying the connection.
       * @private
       */
      function _retryConnection(xhr, params) {
        // Actual implementation would retry the connection.
      }

      /**
       * Placeholder for formatting and dispatching the result.
       * @private
       */
      function _formatResult(data, status, httpStatus, deliveryType) {
        // Actual implementation would format the response and call a handler.
      }

      /**
       * Executes the query using the standard AJAX delivery mechanism.
       *
       * @param {Object} currentQuery Query parameters; if undefined,
       *            the internal _querySettings object will be used.
       * @private
       */
      function _performAjax(currentQuery) {
        var params = _querySettings;
        if ((currentQuery != null) && (typeof(currentQuery) != 'undefined')) {
          params = currentQuery;
        }

        var endpoint = params.targetUrl;
        var content = params.payload;
        if (params.appendMetadataAsQuery) {
          endpoint = _appendMetadata(params);
          if (content != '') {
            endpoint += "&X-DataFlow-Post-Content=" + content;
          }
          content = '';
        }

        _jsonpXHR = jQuery.ajax({
          url: endpoint,
          type: params.verb,
          error: function (jqXHR, statusText, exceptionThrown) {
            if (jqXHR.status < 300 && params.attemptCounter++ < params.maxAttempts) {
              _retryConnection(_jsonpXHR, params);
            } else {
              _formatResult(statusText, "failure", jqXHR.status, params.deliveryType);
            }
          },
          success: function (returnedData, statusText, jqXHR) {

            if (params.attemptCounter++ < params.maxAttempts) {
              if (params.executeHandlerBeforeRetry) {
                _retryConnection(_jsonpXHR, params);
              }

              _formatResult(returnedData, "dataArrived", 200, params.deliveryType);

              if (!params.executeHandlerBeforeRetry) {
                _retryConnection(_jsonpXHR, params);
              }
            } else {
              jQuery.dataFlow.log(_querySettings.loggingLevel, ["AJAX reconnection limit reached " + _querySettings.attemptCounter]);
              _handleFault();
            }
          },
          data: params.payload,
          beforeSend: function (jqXHR) {
            _sendOperation(jqXHR, params, false);
          }
        });
      }

      /**
       * Creates a WebSocket object instance.
       *
       * @param {string} socketAddress The URL for the WebSocket connection.
       * @returns {WebSocket} A new WebSocket object.
       * @private
       */
      function _acquireWebSocket(socketAddress) {
        if (_querySettings.customSocketImpl != null) {
          return _querySettings.customSocketImpl;
        } else {
          if (window.WebSocket) {
            return new WebSocket(socketAddress);
          } else {
            return new MozWebSocket(socketAddress);
          }
        }
      }

      /**
       * Constructs the WebSocket URL from the query's base URL.
       *
       * @return {string} The WebSocket URL (prefixed with "ws" or "wss" for
       *         secure connections).
       * @private
       */
      function _composeWebSocketAddress() {
        var baseAddress = _querySettings.targetUrl;
        baseAddress = _appendMetadata();
        return decodeURI(jQuery('<a href="' + baseAddress + '"/>')[0].href.replace(/^http/, "ws"));
      }

      /**
       * Constructs the Server-Sent Events (SSE) URL from the query's base URL.
       *
       * @return {string} A URL containing the DataFlow headers.
       * @private
       */
      function _composeSSEAddress() {
        var baseAddress = _querySettings.targetUrl;
        baseAddress = _appendMetadata();
        return baseAddress;
      }

      /**
       * Initiates a Server-Sent Events (SSE) connection. <br>
       * Automatically switches to a fallback delivery method if SSE
       * cannot be established.
       *
       * @private
       */
      function _launchSSE(isAlreadyOpen) {

        _queryOutcome.deliveryType = "eventsource";

        var endpointAddress = _composeSSEAddress(_querySettings.targetUrl);

        jQuery.dataFlow.log(_querySettings.loggingLevel, ["Beginning SSE execution"]);
        if (_querySettings.loggingLevel == 'debug') {