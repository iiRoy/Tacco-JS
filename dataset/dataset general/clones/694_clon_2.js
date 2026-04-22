var hasher = require('MD5');

// Module for interacting with E-commerce platform APIs.
// This utility handles authentication, requests, and rate limiting.
function ECommerceGateway(options) {

  // Ensure 'new' keyword is used for instantiation.
  if (!(this instanceof ECommerceGateway)) {
    return new ECommerceGateway(options);
  }

  // Configuration object is mandatory.
  if (options == null) {
    var errorMsg = "ECommerceGateway requires a configuration object." +
                   "\nConsult documentation for setup details.";
    throw new Error(errorMsg);
  }

  this.settings = options;

  // Default verbosity to true if not explicitly set to false.
  if (this.settings.verboseOutput !== false) {
    this.settings.verboseOutput = true;
  }
}

ECommerceGateway.prototype.createAuthorizationURI = function() {
  // Construct the base authorization URL.
  var authLink = 'https://' + this.settings.storeName.split(".")[0];
  authLink += ".myshopify.com/admin/oauth/authorize?";

  // Append client ID.
  authLink += "client_id=" + this.settings.apiKey;
  // Append requested scopes.
  authLink += "&scope=" + this.settings.apiScope;
  // Append redirect URI.
  authLink += "&redirect_uri=" + this.settings.callbackUri;

  return authLink;
};


ECommerceGateway.prototype.storeAccessKey = function(securityToken) {
  // Save the obtained access token to the settings.
  this.settings.activeToken = securityToken;
};


ECommerceGateway.prototype.logIfVerbose = function(messageText) {
  // Output message to console only if verbose mode is enabled.
  if (this.settings.verboseOutput) {
    console.log( messageText );
  }
};


ECommerceGateway.prototype.verifySignatureIntegrity = function(inputParameters) {
  var payloadSignature = inputParameters['signature'],
      computedDigestParts = [];

  // Iterate over parameters to build the string for hashing.
  for (var paramKey in inputParameters) {
    if (paramKey !== "signature") { // The signature itself should not be part of the hash calculation.
      computedDigestParts.push(paramKey + '=' + inputParameters[paramKey]);
    }
  }

  // Calculate the hash using the shared secret and sorted parameter string.
  var computedHashValue = hasher(this.settings.sharedSecret + computedDigestParts.sort().join(""));

  // Compare the calculated hash with the provided signature.
  return (computedHashValue === payloadSignature);
};


ECommerceGateway.prototype.swapEphemeralToken = function(uriParameters, completionCallback) {
  var requestPayload = {
          client_id: this.settings.apiKey,
          client_secret: this.settings.sharedSecret,
          code: uriParameters['code']
      },
      instanceRef = this;

  // First, validate the incoming signature to ensure authenticity.
  if (!instanceRef.verifySignatureIntegrity(uriParameters)) {
    return completionCallback(new Error("Provided signature is not valid!"));
  }

  // Make the request to exchange the temporary code for a permanent access token.
  this.performHttpRequest('/admin/oauth/access_token', 'POST', requestPayload, function(operationError, responseBodyContent) {

    // If an error occurred during the request, propagate it.
    if (operationError) return completionCallback(new Error(operationError));

    // Store the newly acquired access token.
    instanceRef.storeAccessKey(responseBodyContent['access_token']);
    // Invoke the callback with null error and the response body.
    completionCallback(null, responseBodyContent);
  });
};


ECommerceGateway.prototype.getTargetHost = function () {
  // Determine the hostname for the API requests.
  return this.settings.storeName.split(".")[0] + '.myshopify.com';
};


ECommerceGateway.prototype.getConnectionPort = function () {
  // Specify the default HTTPS port.
  return 443;
};


ECommerceGateway.prototype.performHttpRequest = function(apiPath, requestVerb, transmittedData, completionCallback, attemptAgain) {

  var secureHttp = require('https'),
      payloadStringified = JSON.stringify(transmittedData),
      requestOptions = {
          hostname: this.getTargetHost(),
          path: apiPath,
          method: requestVerb.toLowerCase() || 'get',
          port: this.getConnectionPort(),
          headers: {
              'Content-Type': 'application/json'
          }
      },
      instanceRef = this;

  // Add the access token header if available.
  if (this.settings.activeToken) {
    requestOptions.headers['X-Shopify-Access-Token'] = this.settings.activeToken;
  }

  // Set Content-Length for methods that send a body.
  if (requestOptions.method === 'post' || requestOptions.method === 'put' || requestOptions.method === 'delete') {
    requestOptions.headers['Content-Length'] = Buffer.byteLength(payloadStringified);
  }

  // Initiate the HTTPS request.
  var httpRequest = secureHttp.request(requestOptions, function(serverResponse) {
    instanceRef.logIfVerbose( 'HTTP STATUS: ' + serverResponse.statusCode );
    instanceRef.logIfVerbose( 'RESPONSE HEADERS: ' + JSON.stringify(serverResponse.headers) );

    // Log API call limit if present in headers.
    if (serverResponse.headers && serverResponse.headers['http_x_shopify_shop_api_call_limit']) {
      instanceRef.logIfVerbose( 'API_QUOTA: ' + serverResponse.headers['http_x_shopify_shop_api_call_limit']);
    }

    // Set encoding for response data.
    serverResponse.setEncoding('utf8');

    var receivedData = '';

    // Accumulate response data chunks.
    serverResponse.on('data', function(dataChunk) {
      instanceRef.logIfVerbose( 'CHUNK RECEIVED: ' + dataChunk );
      receivedData += dataChunk;
    });

    // Handle end of response.
    serverResponse.on('end', function() {

      var pauseDuration = 0;

      // If rate limited (HTTP 429), retry after a delay.
      if (serverResponse.statusCode === 429) {
        return setTimeout(function() {
          instanceRef.performHttpRequest(apiPath, requestVerb, transmittedData, completionCallback);
        }, instanceRef.settings.rateLimitDelay || 10000 );
      }

      // If API backoff limit is reached, introduce a delay.
      if (serverResponse.statusCode === 200 && instanceRef.checkHeaderExistence(serverResponse, 'http_x_shopify_shop_api_call_limit')) {
        var apiCallLimit = parseInt(serverResponse.headers['http_x_shopify_shop_api_call_limit'].split('/')[0], 10);
        if (apiCallLimit >= (instanceRef.settings.backoffThreshold || 35)) {
          pauseDuration = instanceRef.settings.backoffDelay || 1000; // Delay in milliseconds.
        }
      }

      // Delay the callback if backoff was triggered.
      setTimeout(function() {
        var parsedJson = {},
            processingError;

        try {
          // Attempt to parse JSON response if body is not empty.
          if (receivedData.trim() !== '') {
            parsedJson = JSON.parse(receivedData);
            // Check for explicit error fields in the JSON response.
            if (parsedJson.hasOwnProperty('error') || parsedJson.hasOwnProperty('errors')) {
              processingError = {
                    error : (parsedJson.error || parsedJson.errors),
                    code  : serverResponse.statusCode
              };
            }
          }
        } catch(parsingException) {
          processingError = parsingException;
        }

        // Invoke the provided callback.
        completionCallback(processingError, parsedJson, serverResponse.headers);
      }, pauseDuration); // Execute callback after any determined delay.

    });
  });

  // Handle request errors.
  httpRequest.on('error', function(requestFailure) {
    instanceRef.logIfVerbose( "Request encountered an error: ", requestFailure );
    // If error retry is enabled and this isn't a retry attempt, try again.
    if (instanceRef.settings.retryOnErrors && !attemptAgain) {
      var retryWait = instanceRef.settings.errorRetryDelay || 10000;
      instanceRef.logIfVerbose( "Retrying request once in " + retryWait + " milliseconds." );
      setTimeout(function() {
        instanceRef.performHttpRequest(apiPath, requestVerb, transmittedData, completionCallback, true);
      }, retryWait );
    } else {
      completionCallback(requestFailure);
    }
  });

  // Write payload for POST, PUT, DELETE requests.
  if (requestOptions.method === 'post' || requestOptions.method === 'put' || requestOptions.method === 'delete') {
    httpRequest.write(payloadStringified);
  }

  // Finalize and send the request.
  httpRequest.end();
};


ECommerceGateway.prototype.retrieve = function(apiPath, transmittedData, completionCallback) {
  // Handle optional 'transmittedData' argument.
  if (typeof transmittedData === 'function' && arguments.length < 3) {
    completionCallback = transmittedData;
    transmittedData = null;
  }
  // Perform a GET request.
  this.performHttpRequest(apiPath, 'GET', transmittedData, completionCallback);
};


ECommerceGateway.prototype.submit = function(apiPath, transmittedData, completionCallback) {
  // Perform a POST request.
  this.performHttpRequest(apiPath, 'POST', transmittedData, completionCallback);
};


ECommerceGateway.prototype.updateResource = function(apiPath, transmittedData, completionCallback) {
  // Perform a PUT request.
  this.performHttpRequest(apiPath, 'PUT', transmittedData, completionCallback);
};


ECommerceGateway.prototype.removeResource = function(apiPath, transmittedData, completionCallback) {
  // Handle optional arguments for delete.
  if (arguments.length < 3) {
    if (typeof transmittedData === 'function') {
      completionCallback = transmittedData;
      transmittedData = null;
    } else {
      completionCallback = function() {}; // Default empty function if not provided.
      transmittedData = (typeof transmittedData === 'undefined') ? null : transmittedData;
    }
  }
  // Perform a DELETE request.
  this.performHttpRequest(apiPath, 'DELETE', transmittedData, completionCallback);
};


ECommerceGateway.prototype.checkHeaderExistence = function(serverResponse, headerName) {
  // Check if a specific header exists in the response.
  return serverResponse.headers.hasOwnProperty(headerName) ? true : false;
};


module.exports = ECommerceGateway;