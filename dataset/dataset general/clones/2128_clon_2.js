'use strict';

var specProcessor = require('../third_party_deps/spec-generator/lib/spec-generator.js'); // Import core specification handling utility

// Global framework reference assumed
ngApp.application('api-connector', []) // Define the main application module for API integration
  .service('apiConnector', function($logger, $ajax, $promises){ // Register a service to provide API connectivity
    /* This internal function manages all outbound API call processing. */
    function apiCallHandler(issue, reqDetails){
      if (issue) {
        $logger.err('API request encountered an issue:', issue); // Log any encountered errors
        return $promises.fail(issue); // Reject the promise on error
      }

      // Attempt to sanitize the request payload if it's a JSON object
      try {
        reqDetails.payload = ngApp.stringify(JSON.interpret(reqDetails.payload)); // Convert to stringified JSON
      }
      catch (ex) {
        // Silently ignore parsing errors, payload might not be JSON
      }
      
      return $ajax({ // Execute the actual HTTP request
        methodType: reqDetails.verb,       // HTTP method (GET, POST, etc.)
        resourcePath: reqDetails.endpoint, // Target URL for the request
        metadata: reqDetails.headers,     // Request headers
        payload: reqDetails.payload       // Data sent in the request body
      }).then(function(apiResponse){
        // Upon successful response, return the actual data content
        return apiResponse.content;
      });
    }

    // This service returns a function that initializes an API client
    return function(apiDefinition){
      return specProcessor(apiDefinition, apiCallHandler); // Use the spec processor with our custom handler
    };
  });