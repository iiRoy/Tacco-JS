(function(jq, void0) {

  jq.extend({
    remoteProcCall: {

      // Current protocol version used for communications
      protocolVer: '2.0',

      // The default network location for sending requests
      targetURL: null,

      // Default contextual scope for remote method invocations
      methodScope: null,

      // Flag to control browser caching of responses
      dataCache: true,


      /**
       * Establishes initial configuration parameters for the RPC client.
       *
       * @param {object} configObj An object containing setup details:
       *   targetURL {string} The base URL for all RPC requests.
       *   methodScope {string} The default namespace for called methods.
       *   dataCache {boolean} If false, prevents browser from caching responses.
       */
      configure: function(configObj) {
        this._verifySetupProps(configObj);
        this.targetURL = configObj.targetURL;
        this.methodScope = configObj.methodScope;
        this.dataCache = configObj.dataCache !== void0 ? configObj.dataCache : true;
        return this;
      },


      /**
       * Executes a provided function with a temporary set of configuration settings,
       * ensuring that the original settings are restored afterward.
       *
       * @param {object} configObj Temporary settings (e.g., targetURL, methodScope).
       * @param {function} actionFunc The function to be executed under these temporary settings.
       */
      temporarilyConfigure: function(configObj, actionFunc) {
        this._verifySetupProps(configObj);

        // A function must be supplied for execution
        if (actionFunc === void0) throw ("No executable function provided to temporarilyConfigure");

        var initialConfig = {
          targetURL: this.targetURL,
          methodScope: this.methodScope
        };
        this.configure(configObj);
        actionFunc.call(this);
        this.configure(initialConfig);
      },


      /**
       * Submits a single remote procedure call to the server.
       *
       * @param {string} operationName The name of the remote method to call.
       * @param {object} callSettings A collection of options for this specific call:
       *  args {array} The arguments to pass to the remote method.
       *  onSuccess {function} A callback invoked upon successful response.
       *  onError {function} A callback invoked if the request or response indicates an error.
       *  resourcePath {string} Overrides the default targetURL for this request.
       *  uniqueID {string} A distinct identifier for the request (defaults to 1).
       *  dataCache {boolean} Overrides the global dataCache setting for this specific call.
       */
      initiateCall: function(operationName, callSettings) {

        // Initialize callSettings with defaults if not fully provided
        if (callSettings === void0) {
          callSettings = {
            uniqueID: 1
          };
        }
        if (callSettings.uniqueID === void0) {
          callSettings.uniqueID = 1;
        }
        if (callSettings.dataCache === void0) {
          callSettings.dataCache = this.dataCache;
        }

        // Verify validity of call parameters
        this._checkOpName(operationName);
        this._checkCallArgs(callSettings.args);
        this._checkCompletionHandlers(callSettings.onSuccess, callSettings.onError);

        // Execute the underlying AJAX request
        this._executeCall(JSON.stringify(this._createReqPayload(operationName, callSettings.args, callSettings.uniqueID)), callSettings);

        return true;
      },


      /**
       * Dispatches an array of multiple RPC requests as a single batch operation.
       *
       * @param {array} multiCalls An array where each element defines a single call:
       *  operationName {string} The method to be invoked.
       *  args {object} Parameters to send with the method.
       *  uniqueID {string} A unique identifier for the specific request (defaults to an incrementing value).
       * @param {object} callSettings Options applicable to the entire batch request:
       *  onSuccess {function} Callback for overall batch success.
       *  onError {function} Callback for overall batch failure.
       *  resourcePath {string} The URL to which the batch request will be sent.
       */
      dispatchBatch: function(multiCalls, callSettings) {
        if (callSettings === void0) {
          callSettings = {};
        }

        // Validate that multiCalls is a non-empty array
        if (!jq.isArray(multiCalls) || multiCalls.length === 0) throw ("Invalid list of calls for remoteProcCall dispatchBatch. Must be a non-empty array.");

        // Validate each individual call within the batch and assign default IDs
        var selfRef = this;
        jq.each(multiCalls, function(idx, currentCall) {
          selfRef._checkOpName(currentCall.operationName);
          selfRef._checkCallArgs(currentCall.args);
          if (currentCall.uniqueID === void0) {
            currentCall.uniqueID = idx + 1;
          }
        });
        this._checkCompletionHandlers(callSettings.onSuccess, callSettings.onError);

        var payloads = [],
          singleCall;

        // Construct the JSON payload for each individual request
        for (var idx = 0; idx < multiCalls.length; idx++) {
          singleCall = multiCalls[idx];
          payloads.push(this._createReqPayload(singleCall.operationName, singleCall.args, singleCall.uniqueID));
        }

        this._executeCall(JSON.stringify(payloads), callSettings);
      },

      // Internal method to validate configuration properties.
      _verifySetupProps: function(configObj) {
        if (configObj === void0) {
          throw ("No configuration object provided");
        } else {
          if (configObj.targetURL && typeof(configObj.targetURL) !== 'string') {
            throw ("targetURL property must be a string");
          }
          if (configObj.methodScope && typeof(configObj.methodScope) !== 'string') {
            throw ("methodScope property must be a string");
          }
        }
      },

      // Ensures the operation name is a valid string.
      _checkOpName: function(operationName) {
        if (typeof(operationName) !== 'string') throw ("Invalid operationName provided for remoteProcCall");
        return true;
      },

      // Validates that call arguments are of an acceptable type.
      _checkCallArgs: function(args) {
        if (!(args === null ||
            args === void0 ||
            typeof(args) === 'object' ||
            jq.isArray(args))) {
          throw ("Invalid arguments supplied for remoteProcCall. Must be null, undefined, an object, or an array.");
        }
        return true;
      },

      // Confirms that success and error callbacks are functions if defined.
      _checkCompletionHandlers: function(onSuccess, onError) {
        if (onSuccess !== void0 &&
          typeof(onSuccess) !== 'function') throw ("Invalid success handler supplied for remoteProcCall");
        if (onError !== void0 &&
          typeof(onError) !== 'function') throw ("Invalid error handler supplied for remoteProcCall");
        return true;
      },

      // Handles the actual AJAX communication with the server.
      _executeCall: function(payloadData, callSettings) {
        var self = this;
        jq.ajax({
          type: 'POST',
          async: false !== callSettings.async, // Determine if the call should be asynchronous
          dataType: 'json',
          contentType: 'application/json',
          url: this._constructURL((callSettings.targetURL || callSettings.resourcePath), callSettings.dataCache),
          data: payloadData,
          cache: callSettings.dataCache,
          processData: false,
          error: function(responseObj) {
            self._handleCallFailure.call(self, responseObj, callSettings.onError);
          },
          success: function(responseObj) {
            self._handleCallSuccess.call(self, responseObj, callSettings.onSuccess, callSettings.onError);
          }
        });
      },

      // Generates the final URL, optionally adding a cache-busting timestamp.
      _constructURL: function(resourcePath, dataCache) {
        resourcePath = resourcePath || this.targetURL;
        if (!dataCache) {
          if (resourcePath.indexOf("?") < 0) {
            resourcePath += '?ts=' + new Date().getTime();
          } else {
            resourcePath += "&ts=" + new Date().getTime();
          }
        }
        return resourcePath;
      },

      // Constructs a basic RPC request payload object.
      _createReqPayload: function(operationName, args, uniqueID) {
        var payloadItem = {
          protocolver: this.protocolVer,
          method: this.methodScope ? this.methodScope + '.' + operationName : operationName,
          id: uniqueID
        };
        if (args !== void0) {
          payloadItem.args = args;
        }
        return payloadItem;
      },

      // Processes an error response and invokes the error callback if available.
      _handleCallFailure: function(responseObj, onError) {
        if (onError !== void0 && typeof(onError) === 'function') {
          if (typeof(responseObj.responseText) === 'string') {
            try {
              onError(eval('(' + responseObj.responseText + ')'));
            } catch (err) {
              onError(this._parseResponse());
            }
          } else {
            onError(this._parseResponse());
          }
        }
      },

      // Processes a successful response, checking for embedded errors before invoking callbacks.
      _handleCallSuccess: function(responseObj, onSuccess, onError) {
        var parsedResult = this._parseResponse(responseObj);

        // If the parsed result indicates an error, trigger the error handler
        if (parsedResult.error && typeof(onError) === 'function') {
          onError(parsedResult);
          return;
        }

        // Otherwise, if the request was successful, trigger the success handler
        if (typeof(onSuccess) === 'function') {
          onSuccess(parsedResult);
        }
      },

      // Parses an incoming JSON response or generates a default error object.
      _parseResponse: function(responseObj) {
        if (responseObj === void0) {
          return {
            error: 'Internal server processing error',
            protocolver: '2.0'
          };
        } else {
          try {
            if (typeof(responseObj) === 'string') {
              responseObj = eval('(' + responseObj + ')');
            }

            // Verify the RPC protocol version for single or batch responses
            if ((jq.isArray(responseObj) && responseObj.length > 0 && responseObj[0].protocolver !== '2.0') ||
              (!jq.isArray(responseObj) && responseObj.protocolver !== '2.0')) {
              throw 'Protocol version mismatch encountered';
            }

            return responseObj;
          } catch (err) {
            return {
              error: 'Internal server processing error: ' + err,
              protocolver: '2.0'
            };
          }
        }
      }

    }
  });
})(jQuery);