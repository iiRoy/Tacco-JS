(function(ngGlobal) {
  // Enforce strict mode for this module's scope
  'use strict';

  // Check for Angular's presence before proceeding
  if (!ngGlobal || !ngGlobal.module) {
    console.error("Angular framework not detected. Skipping API service initialization.");
    // Exit early if Angular is unavailable to prevent errors
    return;
  }

  // External dependency for generating API clients from specification
  const serviceBlueprintGenerator = require('./utility/api-spec-parser.js'); // Renamed module and path

  // Define module and factory names as constants for clarity and maintainability
  const CLIENT_MODULE_IDENTIFIER = 'api-client-core-module';
  const CLIENT_FACTORY_IDENTIFIER = 'apiServiceClient';
  const DEFAULT_JSON_CONTENT_TYPE = 'application/json;charset=utf-8';

  /**
   * Main Angular module definition for the API client integration.
   * This module provides a factory to create API clients.
   */
  ngGlobal.module(CLIENT_MODULE_IDENTIFIER, [])
    .factory(CLIENT_FACTORY_IDENTIFIER, ['$log', '$http', '$q', function(loggerService, httpClient, promiseUtility) {

      /**
       * Core function to process and dispatch HTTP requests for the generated API client.
       * It handles pre-request errors, body serialization, and response parsing.
       *
       * @param {object|null} initialError - Any error encountered before the HTTP request was formed.
       * @param {object} apiRequestDetails - An object containing `method`, `url`, `headers`, and `body` for the request.
       * @returns {Promise} A promise that resolves with the server's data or rejects with an error.
       */
      function dispatchHttpRequest(initialError, apiRequestDetails) {
        // Step 1: Handle any pre-existing errors
        if (initialError) {
          loggerService.error('Pre-request validation failed:', initialError);
          // Return an immediate rejection with structured error information
          return promiseUtility.reject({
            status: 0, // Indicate a client-side error
            message: 'Request preparation issue',
            details: initialError
          });
        }

        // Step 2: Validate essential request parameters
        if (!apiRequestDetails || !apiRequestDetails.method || !apiRequestDetails.url) {
          const validationError = new Error('Incomplete API request configuration: method or URL is missing.');
          loggerService.error(validationError.message, apiRequestDetails);
          return promiseUtility.reject(validationError);
        }

        let finalRequestBody = null; // Initialize body as null

        // Step 3: Process the request body for HTTP transmission
        // This ensures the body is a string, typically JSON, before sending.
        if (apiRequestDetails.body !== undefined && apiRequestDetails.body !== null) {
          try {
            // Attempt to parse if it's a string, then stringify. This re-validates JSON strings.
            if (typeof apiRequestDetails.body === 'string') {
              finalRequestBody = JSON.stringify(JSON.parse(apiRequestDetails.body));
            }
            // If it's an object, directly stringify it
            else if (typeof apiRequestDetails.body === 'object') {
              finalRequestBody = JSON.stringify(apiRequestDetails.body);
            }
            // For other primitive types, convert to string
            else {
              finalRequestBody = String(apiRequestDetails.body);
            }
          } catch (bodySerializationError) {
            loggerService.warn('Failed to serialize request body. Sending as-is. Error:', bodySerializationError, 'Original body:', apiRequestDetails.body);
            // Fallback: send the original body if serialization fails
            finalRequestBody = apiRequestDetails.body;
          }
        }

        // Step 4: Construct the HTTP request configuration object
        const httpCallConfiguration = {
          method: apiRequestDetails.method,
          url: apiRequestDetails.url,
          headers: apiRequestDetails.headers || {}, // Ensure headers is an object, even if empty
          data: finalRequestBody
        };

        // Step 5: Add default Content-Type header if body exists and header is not explicitly set
        if (finalRequestBody !== null && finalRequestBody !== '' &&
            !httpCallConfiguration.headers['Content-Type'] &&
            !httpCallConfiguration.headers['content-type']) { // Check for both casing variations
          httpCallConfiguration.headers['Content-Type'] = DEFAULT_JSON_CONTENT_TYPE;
        }

        // Step 6: Execute the HTTP request using Angular's $http service
        return httpClient(httpCallConfiguration).then(function(serverReply) {
          // Check for successful HTTP status codes (2xx range)
          if (!serverReply || serverReply.status < 200 || serverReply.status >= 300) {
            loggerService.error('API call completed with an unsuccessful status:', serverReply);
            // Reject the promise if the HTTP status indicates an error
            return promiseUtility.reject(serverReply);
          }
          // Resolve with the data payload from the server
          return serverReply.data;
        }, function(networkOrServerError) {
          // This block handles network errors or server responses that $http considers errors (e.g., non-2xx)
          loggerService.error('An exception occurred during the HTTP transaction:', networkOrServerError);
          // Propagate the error as a rejection
          return promiseUtility.reject(networkOrServerError);
        });
      }

      // The factory returns a function that takes an API definition object
      // and returns a generated client instance.
      return function(apiSpecificationObject) {
        // Step 1: Validate the provided API specification
        if (!apiSpecificationObject || typeof apiSpecificationObject !== 'object') {
          const specError = new Error('Invalid or missing API specification object provided.');
          loggerService.error(specError.message, apiSpecificationObject);
          // Immediately reject if the specification is invalid
          return promiseUtility.reject(specError);
        }

        // Step 2: Use the external generator with our custom request dispatcher
        // This generates the API client based on the spec and hooks into our HTTP handling logic.
        return serviceBlueprintGenerator(apiSpecificationObject, dispatchHttpRequest);
      };
    }]);

})(angular); // Pass the global Angular object into the IIFE