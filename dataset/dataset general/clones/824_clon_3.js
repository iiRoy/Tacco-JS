(function($, undefined) {
  // Ensure jQuery is available before proceeding.
  if (typeof $ === 'undefined' || typeof $.extend === 'undefined') {
    throw new Error("jQuery library is not loaded. This client requires jQuery.");
  }

  // Extend jQuery with our remote procedure call client functionality.
  $.extend({
    remoteProcClient: {
      // Current protocol version for RPC messages.
      protocolVer: '2.0',

      // Default URL for RPC requests if not specified per call.
      serviceUri: null,

      // Default scope prefix for method names.
      methodScope: null,

      // Flag indicating whether requests should be cached by the browser by default.
      dataCaching: true,

      // Flag indicating whether requests should be asynchronous by default.
      defaultAsync: true,

      /**
       * Initializes the RPC client with optional global settings.
       *
       * @param {object} initOptions - Configuration object.
       *   @property {string} serviceUri - The default endpoint URL for RPC requests.
       *   @property {string} methodScope - The default namespace/scope for RPC methods.
       *   @property {boolean} dataCaching - If false, appends a timestamp to prevent browser caching (default: true).
       *   @property {boolean} asyncMode - If false, requests will be synchronous (default: true).
       * @returns {object} The RPC client instance for chaining.
       */
      initialize: function(initOptions) {
        // Validate the incoming configuration parameters.
        this._checkConfiguration(initOptions);

        this.serviceUri = initOptions.serviceUri || this.serviceUri;
        this.methodScope = initOptions.methodScope || this.methodScope;
        this.dataCaching = (typeof initOptions.dataCaching === 'boolean') ? initOptions.dataCaching : this.dataCaching;
        this.defaultAsync = (typeof initOptions.asyncMode === 'boolean') ? initOptions.asyncMode : this.defaultAsync;

        return this;
      },

      /**
       * Executes a provided function with temporary RPC client configurations,
       * then reverts to the original settings.
       *
       * @param {object} tempSettings - Temporary settings to apply (e.g., serviceUri, methodScope).
       *   @property {string} serviceUri - Temporary endpoint for RPC requests.
       *   @property {string} methodScope - Temporary namespace for RPC requests.
       * @param {function} actionFunc - The function to execute with the temporary settings in place.
       * @throws {Error} If no valid function is provided.
       */
      temporarilyConfigure: function(tempSettings, actionFunc) {
        this._checkConfiguration(tempSettings);

        if (typeof actionFunc !== 'function') {
          throw new Error("A valid function must be supplied for temporary configuration execution.");
        }

        // Store current settings to restore them later.
        var initialSettings = {
          serviceUri: this.serviceUri,
          methodScope: this.methodScope,
          dataCaching: this.dataCaching,
          asyncMode: this.defaultAsync
        };

        // Apply temporary settings.
        this.initialize(tempSettings);

        try {
          // Execute the provided function.
          actionFunc.call(this);
        } finally {
          // Always restore original settings, even if an error occurs.
          this.initialize(initialSettings);
        }
      },

      /**
       * Invokes a single remote procedure call.
       *
       * @param {string} funcName - The name of the RPC method to call.
       * @param {object} callOptions - An object containing request parameters and callbacks.
       *   @property {Array|object} funcArgs - Arguments to send with the method call.
       *   @property {function} onSuccess - Callback executed upon successful response.
       *   @property {function} onError - Callback executed if the request fails or returns an error.
       *   @property {string} targetUrl - Overrides the default serviceUri for this specific request.
       *   @property {string|number} correlationId - A unique identifier for this request (defaults to 1).
       *   @property {boolean} dataCaching - Overrides the default dataCaching setting for this request.
       *   @property {boolean} asyncMode - Overrides the default asyncMode setting for this request.
       * @returns {boolean} True if the request was initiated successfully.
       */
      invokeMethod: function(funcName, callOptions) {
        var finalOptions = $.extend({}, callOptions); // Create a mutable copy.

        // Apply default values if not explicitly set.
        finalOptions.correlationId = finalOptions.correlationId ?? 1;
        finalOptions.dataCaching = finalOptions.dataCaching ?? this.dataCaching;
        finalOptions.asyncMode = finalOptions.asyncMode ?? this.defaultAsync;

        // Perform validations on method name, arguments, and callbacks.
        this._verifyMethodName(funcName);
        this._verifyMethodArgs(finalOptions.funcArgs);
        this._verifyCallbacks(finalOptions.onSuccess, finalOptions.onError);

        // Construct the RPC request payload.
        var payload = this._createRequestPayload(funcName, finalOptions.funcArgs, finalOptions.correlationId);
        var jsonPayload = JSON.stringify(payload);

        // Execute the AJAX call.
        this._executeAjaxCall(jsonPayload, finalOptions);

        return true;
      },

      /**
       * Submits multiple RPC requests as a single batch.
       *
       * @param {Array<object>} methodCalls - An array of objects, each describing a method call.
       *   @property {string} funcName - The name of the method.
       *   @property {Array|object} funcArgs - Arguments for the method.
       *   @property {string|number} correlationId - Identifier for this specific call within the batch (defaults to 1-indexed incrementer).
       * @param {object} batchOpts - Options for the overall batch request.
       *   @property {function} onSuccess - Callback for overall batch success.
       *   @property {function} onError - Callback for overall batch failure.
       *   @property {string} targetUrl - Overrides the default serviceUri for this batch.
       *   @property {boolean} dataCaching - Overrides default dataCaching for this batch.
       *   @property {boolean} asyncMode - Overrides default asyncMode for this batch.
       * @throws {Error} If `methodCalls` is not a valid non-empty array.
       */
      invokeBatchMethods: function(methodCalls, batchOpts) {
        var finalBatchOpts = $.extend({}, batchOpts); // Ensure batchOpts is an object.

        // Validate the batch input structure.
        if (!Array.isArray(methodCalls) || methodCalls.length === 0) {
          throw new Error("Invalid method calls supplied for batch invocation. Must be a non-empty array of objects.");
        }

        // Apply default values for batch options.
        finalBatchOpts.dataCaching = finalBatchOpts.dataCaching ?? this.dataCaching;
        finalBatchOpts.asyncMode = finalBatchOpts.asyncMode ?? this.defaultAsync;

        // Validate each individual method call within the batch.
        var selfRef = this;
        $.each(methodCalls, function(idx, currentCall) {
          selfRef._verifyMethodName(currentCall.funcName);
          selfRef._verifyMethodArgs(currentCall.funcArgs);
          // Assign a default correlationId if not provided.
          currentCall.correlationId = currentCall.correlationId ?? (idx + 1);
        });

        // Validate the overall batch request callbacks.
        this._verifyCallbacks(finalBatchOpts.onSuccess, finalBatchOpts.onError);

        var payloadItems = [];
        // Prepare the payload for each method call in the batch.
        for (var idx = 0; idx < methodCalls.length; idx++) {
          var singleCall = methodCalls[idx];
          payloadItems.push(this._createRequestPayload(singleCall.funcName, singleCall.funcArgs, singleCall.correlationId));
        }

        // Execute the AJAX call with the combined payload.
        this._executeAjaxCall(JSON.stringify(payloadItems), finalBatchOpts);
      },

      /**
       * Internal helper to validate RPC client configuration parameters.
       * @param {object} inputArgs - The configuration object to validate.
       * @throws {Error} If configuration parameters are invalid.
       */
      _checkConfiguration: function(inputArgs) {
        if (!inputArgs || typeof inputArgs !== 'object') {
          throw new Error("Configuration options must be a valid object.");
        }

        if (inputArgs.serviceUri !== undefined && typeof inputArgs.serviceUri !== 'string') {
          throw new Error("Service URI configuration must be a string.");
        }
        if (inputArgs.methodScope !== undefined && typeof inputArgs.methodScope !== 'string') {
          throw new Error("Method scope configuration must be a string.");
        }
        if (inputArgs.dataCaching !== undefined && typeof inputArgs.dataCaching !== 'boolean') {
          throw new Error("Data caching configuration must be a boolean.");
        }
        if (inputArgs.asyncMode !== undefined && typeof inputArgs.asyncMode !== 'boolean') {
          throw new Error("Asynchronous mode configuration must be a boolean.");
        }
      },

      /**
       * Internal helper to validate an RPC method name.
       * @param {string} name - The method name to validate.
       * @throws {Error} If the method name is invalid.
       */
      _verifyMethodName: function(name) {
        if (typeof name !== 'string' || name.trim() === '') {
          throw new Error("Invalid method name supplied for RPC invocation. It must be a non-empty string.");
        }
      },

      /**
       * Internal helper to validate RPC method arguments.
       * @param {Array|object|null|undefined} args - The arguments to validate.
       * @throws {Error} If the arguments are in an invalid format.
       */
      _verifyMethodArgs: function(args) {
        if (args !== null && args !== undefined && typeof args !== 'object' && !Array.isArray(args)) {
          throw new Error("Invalid method arguments supplied for RPC request. They must be empty, an object, or an array.");
        }
      },

      /**
       * Internal helper to validate RPC success and error callbacks.
       * @param {function} onSuccess - The success callback.
       * @param {function} onError - The error callback.
       * @throws {Error} If any callback is provided but not a function.
       */
      _verifyCallbacks: function(onSuccess, onError) {
        if (onSuccess !== undefined && typeof onSuccess !== 'function') {
          throw new Error("Invalid success callback provided for RPC request. Must be a function or undefined.");
        }
        if (onError !== undefined && typeof onError !== 'function') {
          throw new Error("Invalid error callback provided for RPC request. Must be a function or undefined.");
        }
      },

      /**
       * Internal method to perform the actual AJAX request.
       * @param {string} serializedPayload - The JSON string representation of the RPC request.
       * @param {object} ajaxOptions - Options for the AJAX call (e.g., targetUrl, dataCaching, asyncMode, onSuccess, onError).
       */
      _executeAjaxCall: function(serializedPayload, ajaxOptions) {
        var selfRef = this;
        var requestUrl = this._determineRequestUrl(
          ajaxOptions.targetUrl || this.serviceUri,
          ajaxOptions.dataCaching
        );

        $.ajax({
          type: 'POST',
          async: ajaxOptions.asyncMode,
          dataType: 'json',
          contentType: 'application/json',
          url: requestUrl,
          data: serializedPayload,
          cache: ajaxOptions.dataCaching,
          processData: false, // Prevents jQuery from transforming the data.
          error: function(jqXHR, textStatus, errorThrown) {
            selfRef._handleRequestError.call(selfRef, jqXHR, ajaxOptions.onError, textStatus, errorThrown);
          },
          success: function(serverResponse) {
            selfRef._handleRequestSuccess.call(selfRef, serverResponse, ajaxOptions.onSuccess, ajaxOptions.onError);
          }
        });
      },

      /**
       * Internal method to construct the appropriate URL for an RPC request,
       * potentially adding a cache-busting timestamp.
       * @param {string} basePath - The base URL for the request.
       * @param {boolean} useCache - Whether caching is allowed for this request.
       * @returns {string} The final URL.
       */
      _determineRequestUrl: function(basePath, useCache) {
        var finalUrl = basePath || this.serviceUri;

        if (!finalUrl) {
          throw new Error("No service URI or target URL specified for the RPC request.");
        }

        // Append a timestamp parameter to prevent caching if 'useCache' is false.
        if (!useCache) {
          var timestampParam = 'ts=' + new Date().getTime();
          if (finalUrl.includes("?")) {
            finalUrl += "&" + timestampParam;
          } else {
            finalUrl += "?" + timestampParam;
          }
        }
        return finalUrl;
      },

      /**
       * Internal method to create an RPC protocol-compliant request object.
       * @param {string} methodIdentifier - The name of the RPC method.
       * @param {Array|object} methodArguments - The arguments for the method.
       * @param {string|number} reqId - The correlation ID for the request.
       * @returns {object} The structured RPC request payload.
       */
      _createRequestPayload: function(methodIdentifier, methodArguments, reqId) {
        var payloadObject = {
          jsonrpc: this.protocolVer,
          id: reqId
        };

        payloadObject.method = this.methodScope ? `${this.methodScope}.${methodIdentifier}` : methodIdentifier;

        if (methodArguments !== undefined) {
          payloadObject.params = methodArguments; // Using 'params' as per JSON-RPC spec.
        }
        return payloadObject;
      },

      /**
       * Internal method to handle errors from the AJAX request.
       * @param {object} jqXHR - The jQuery XMLHttpRequest object.
       * @param {function} errorCallback - The user-defined error callback.
       * @param {string} textStatus - The status of the request (e.g., "error", "timeout").
       * @param {string} errorThrown - The HTTP error message, if any.
       */
      _handleRequestError: function(jqXHR, errorCallback, textStatus, errorThrown) {
        if (typeof errorCallback === 'function') {
          var parsedError = null;
          if (jqXHR.responseText) {
            try {
              parsedError = JSON.parse(jqXHR.responseText);
            } catch (exception) {
              // If responseText isn't valid JSON, create a generic error object.
              parsedError = this._parseResponse(null, `Server response parsing error: ${exception.message}`);
            }
          }
          // Pass a structured error object to the callback.
          errorCallback(parsedError || this._parseResponse(null, `Request failed: ${textStatus} ${errorThrown}`));
        }
      },

      /**
       * Internal method to handle successful AJAX responses, checking for RPC-level errors.
       * @param {object} serverResponse - The raw JSON response from the server.
       * @param {function} successCallback - The user-defined success callback.
       * @param {function} errorCallback - The user-defined error callback.
       */
      _handleRequestSuccess: function(serverResponse, successCallback, errorCallback) {
        var processedResult = this._parseResponse(serverResponse);

        // If the parsed response contains an RPC error, trigger the error callback.
        if (processedResult && processedResult.error && typeof errorCallback === 'function') {
          errorCallback(processedResult);
          return;
        }

        // Otherwise, if a success callback exists, execute it with the successful response.
        if (typeof successCallback === 'function') {
          successCallback(processedResult);
        }
      },

      /**
       * Internal method to parse and validate an RPC response object.
       * Ensures the response adheres to the expected RPC protocol version.
       * @param {string|object} rawResponse - The raw response data from the server.
       * @param {string} [defaultErrorMessage='Internal server error'] - Message for generic errors.
       * @returns {object} A parsed and validated RPC response object, or an error object.
       */
      _parseResponse: function(rawResponse, defaultErrorMessage) {
        var errorMessage = defaultErrorMessage || 'Internal server error';

        if (rawResponse === undefined || rawResponse === null) {
          return {
            error: errorMessage,
            jsonrpc: this.protocolVer
          };
        }

        try {
          var processedResponse = rawResponse;
          // Attempt to parse if the response is a string.
          if (typeof rawResponse === 'string') {
            processedResponse = JSON.parse(rawResponse);
          }

          // Validate the RPC protocol version for single or batch responses.
          var isBatch = Array.isArray(processedResponse);
          var versionCheck = isBatch ?
            (processedResponse.length === 0 || processedResponse[0].jsonrpc === this.protocolVer) :
            (processedResponse.jsonrpc === this.protocolVer);

          if (!versionCheck) {
            throw new Error('Protocol version mismatch in RPC response.');
          }

          return processedResponse;
        } catch (exception) {
          // Return a structured error if parsing or validation fails.
          return {
            error: `Response processing failed: ${exception.message || errorMessage}`,
            jsonrpc: this.protocolVer
          };
        }
      }
    }
  });
})(jQuery);