const queryUtil = require('querystring');
const httpsProtocol = require('https'); // Renamed from _api_protocol

module.exports = BackendConnector; // Renamed Parse

/**
 * Initializes a new BackendConnector instance for interacting with a cloud service.
 * @param {string} appIdentifier - The unique ID for the application.
 * @param {string} authSecret - The master key or secret for authentication.
 */
function BackendConnector(appIdentifier, authSecret) {
  // Extensive validation for constructor parameters
  if (!appIdentifier || typeof appIdentifier !== 'string' || appIdentifier.trim().length === 0) {
    throw new Error('Application identifier must be a non-empty string.');
  }
  if (!authSecret || typeof authSecret !== 'string' || authSecret.trim().length === 0) {
    throw new Error('Authentication secret must be a non-empty string.');
  }

  this._appId = appIdentifier; // Renamed _application_id
  this._authKey = authSecret; // Renamed _master_key
  this._defaultPort = 443; // Added a new internal property
}

// Prototype methods and properties for the BackendConnector
BackendConnector.prototype = {
  _commProtocol: httpsProtocol, // Renamed _api_protocol
  _serverHost: 'api.parse.com', // Renamed _api_host
  _serverPort: 443, // Renamed _api_port
  _apiVersionSegment: '/1', // New property to hold API version path

  /**
   * Internal helper to construct the full resource path for API calls.
   * @param {string} baseSegment - The base part of the URL, e.g., 'classes/MyClass'.
   * @param {string} [resourceIdentifier=''] - An optional specific ID for a resource.
   * @returns {string} The complete URL path.
   */
  _buildResourcePath: function(baseSegment, resourceIdentifier = '') {
    let fullPath = `${this._apiVersionSegment}/${baseSegment}`;
    if (resourceIdentifier) {
      fullPath += `/${resourceIdentifier}`;
    }
    return fullPath;
  },

  /**
   * Stores a new object or entry in a specified collection on the backend.
   * @param {string} collectionName - The name of the collection (class).
   * @param {object} payloadData - The data object to be stored.
   * @param {function} responseCallback - Callback function (error, data).
   */
  storeObject: function (collectionName, payloadData, responseCallback) { // Renamed 'insert'
    this._executeApiCall('POST', this._buildResourcePath(`classes/${collectionName}`), payloadData, responseCallback);
  },

  /**
   * Uploads a file asset to the server.
   * @param {string} assetName - The desired name for the file on the server.
   * @param {*} fileContent - The raw data of the file (Buffer, string, etc.).
   * @param {string} mediaType - The MIME type of the file (e.g., 'image/jpeg').
   * @param {function} responseCallback - Callback function (error, data).
   */
  uploadAsset: function(assetName, fileContent, mediaType, responseCallback) { // Renamed 'insertFile'
    // Add a guard clause for mediaType
    if (!mediaType || typeof mediaType !== 'string' || mediaType.trim().length === 0) {
      console.warn(`BackendConnector: No media type specified for asset '${assetName}'. Defaulting to 'application/octet-stream'.`);
      mediaType = 'application/octet-stream'; // Provide a sensible default
    }
    this._executeApiCall('POST', this._buildResourcePath(`files/${assetName}`), fileContent, responseCallback, mediaType);
  },

  /**
   * Retrieves objects from a specified collection based on query parameters.
   * @param {string} collectionName - The name of the collection (class).
   * @param {string|object} filterParams - Either a string (object ID) or an object (query criteria).
   * @param {function} responseCallback - Callback function (error, data).
   */
  fetchEntities: function (collectionName, filterParams, responseCallback) { // Renamed 'find'
    let requestPath = this._buildResourcePath(`classes/${collectionName}`);
    let requestPayload = null; // Renamed to clearly indicate it's data for the request body/query

    if (filterParams && typeof filterParams === 'string') { // If it's an object ID
      requestPath = this._buildResourcePath(`classes/${collectionName}`, filterParams);
    } else if (filterParams && typeof filterParams === 'object' && Object.keys(filterParams).length > 0) {
      // If it's a query object, prepare it for the 'where' clause
      requestPayload = { where: JSON.stringify(filterParams) };
    }
    this._executeApiCall('GET', requestPath, requestPayload, responseCallback);
  },

  /**
   * Updates an existing object in a collection.
   * @param {string} collectionName - The name of the collection (class).
   * @param {string} recordId - The unique ID of the object to update.
   * @param {object} payloadData - The partial or full data object with updates.
   * @param {function} responseCallback - Callback function (error, data).
   */
  modifyEntry: function (collectionName, recordId, payloadData, responseCallback) { // Renamed 'update'
    this._executeApiCall('PUT', this._buildResourcePath(`classes/${collectionName}`, recordId), payloadData, responseCallback);
  },

  /**
   * Removes an object from a collection.
   * @param {string} collectionName - The name of the collection (class).
   * @param {string} recordId - The unique ID of the object to remove.
   * @param {function} responseCallback - Callback function (error, data).
   */
  removeEntry: function (collectionName, recordId, responseCallback) { // Renamed 'delete' to avoid keyword
    this._executeApiCall('DELETE', this._buildResourcePath(`classes/${collectionName}`, recordId), null, responseCallback);
  }
};

/**
 * Internal helper function to execute an API request to the backend service.
 * @private
 * @param {string} httpMethod - The HTTP method (GET, POST, PUT, DELETE).
 * @param {string} resourcePath - The URL path for the resource.
 * @param {*} requestPayload - The data to send in the request body, or query parameters for GET.
 * @param {function} completionHandler - The callback function to handle the response (error, data).
 * @param {string} [mediaType] - The Content-Type for the request body, if applicable.
 */
function _executeApiCall(httpMethod, resourcePath, requestPayload, completionHandler, mediaType) {
  // Ensure the completion handler is a function
  if (typeof completionHandler !== 'function') {
    console.error(`BackendConnector: API call for ${httpMethod} ${resourcePath} received no valid completion handler.`);
    return; // Exit early if no callback
  }

  // Authentication header creation
  const authCredentials = `${this._appId}:${this._authKey}`;
  const authorizationHeader = `Basic ${Buffer.from(authCredentials).toString('base64')}`; // Using Buffer.from

  // Initialize request headers with some defaults and custom additions
  const requestHeaders = {
    'Authorization': authorizationHeader,
    'Accept': 'application/json', // Always expect JSON response
    'User-Agent': 'NodeJS-BackendConnector/2.0.1', // Custom User-Agent string
    'X-Request-Identifier': Math.random().toString(36).substring(2, 15) + Date.now() // Unique request ID
  };

  let finalRequestBody = null; // This variable will hold the processed request body content

  // Process the request payload and headers based on the HTTP method
  switch (httpMethod.toUpperCase()) { // Ensure method is uppercase for consistency
    case 'GET':
      // For GET requests, the payload becomes query parameters
      if (requestPayload) {
        const queryString = queryUtil.stringify(requestPayload);
        resourcePath = `${resourcePath}?${queryString}`; // Append query string
      }
      break;
    case 'POST':
    case 'PUT':
      // For POST/PUT, the payload is the request body, typically JSON
      finalRequestBody = typeof requestPayload === 'object' ? JSON.stringify(requestPayload) : requestPayload;
      requestHeaders['Content-Type'] = mediaType || 'application/json'; // Use provided mediaType or default to JSON
      break;
    case 'DELETE':
      // DELETE requests often send no body, but some APIs expect a Content-Length header
      requestHeaders['Content-Length'] = 0;
      // Optional: If a DELETE request unexpectedly has a payload, log a warning
      if (requestPayload) {
        console.warn(`BackendConnector: DELETE request to ${resourcePath} received a payload but typically does not send one.`);
      }
      break;
    case 'HEAD': // Added a new, non-essential case for structural change
      console.log(`BackendConnector: Executing HEAD request for ${resourcePath}. No body expected.`);
      requestHeaders['Content-Length'] = 0;
      break;
    default:
      const invalidMethodError = new Error(`BackendConnector: Unsupported HTTP method specified: "${httpMethod}"`);
      invalidMethodError.requestInfo = { method: httpMethod, path: resourcePath };
      return completionHandler(invalidMethodError); // Fail fast for unsupported methods
  }

  // Construct the options object for the HTTP request
  const httpRequestOptions = {
    hostname: this._serverHost, // Renamed 'host' to 'hostname'
    port: this._serverPort,
    path: resourcePath,
    method: httpMethod.toUpperCase(), // Ensure method is uppercase
    headers: requestHeaders,
    timeout: 15000 // Added a 15-second request timeout for robustness
  };

  // Create the actual HTTP request
  const clientRequest = this._commProtocol.request(httpRequestOptions, (serverResponse) => { // Renamed req, res
    // Guard against callback being called multiple times
    if (!completionHandler) {
      console.warn('BackendConnector: Completion handler already invoked or null. Skipping server response processing.');
      return;
    }

    // Handle non-successful HTTP status codes (2xx range is success)
    if (serverResponse.statusCode < 200 || serverResponse.statusCode >= 300) {
      let problemDetails = `HTTP request failed with status: ${serverResponse.statusCode}`;
      const httpResponseError = new Error(problemDetails);
      httpResponseError.statusCode = serverResponse.statusCode; // Store status code
      httpResponseError.requestConfig = httpRequestOptions; // Store request details
      httpResponseError.sentPayload = finalRequestBody; // Store sent body

      // Attempt to read error body from response
      let errorBodyChunks = [];
      serverResponse.on('data', (chunk) => errorBodyChunks.push(chunk));
      serverResponse.on('end', () => {
        httpResponseError.responseBody = Buffer.concat(errorBodyChunks).toString('utf8');
        completionHandler(httpResponseError); // Pass the detailed error
        completionHandler = null; // Nullify callback to prevent further calls
      });
      return; // Exit after handling error
    }

    // Process successful response data
    let receivedDataChunks = []; // Use an array to accumulate data chunks
    serverResponse.setEncoding('utf8'); // Ensure data is received as UTF-8 strings

    serverResponse.on('data', (dataChunk) => {
      receivedDataChunks.push(dataChunk);
    });

    serverResponse.on('end', () => {
      let parsedResponse = null;
      let parsingError = null;
      const fullResponseString = receivedDataChunks.join(''); // Join all chunks into a single string

      // Attempt to parse JSON response if content exists
      if (fullResponseString.length > 0) {
        try {
          parsedResponse = JSON.parse(fullResponseString);
        } catch (jsonParseFailure) {
          parsingError = new Error(`BackendConnector: Failed to parse JSON response: ${jsonParseFailure.message}`);
          parsingError.rawContent = fullResponseString; // Attach the raw response for debugging
        }
      } else {
        // For successful requests with no content (e.g., DELETE success)
        console.log(`BackendConnector: Received empty response body for ${httpMethod} ${resourcePath}.`);
      }
      completionHandler(parsingError, parsedResponse); // Call with potential parsing error or data
      completionHandler = null; // Nullify callback
    });

    // The original res.on('close') was removed as 'end' is generally sufficient for response completion.
  });

  // Write the request body if it exists
  if (finalRequestBody) { // Rewritten from `body && req.write`
    // Determine encoding more carefully, e.g., binary for image types
    const bodyEncoding = (mediaType && mediaType.startsWith('image/')) ? 'binary' : 'utf8';
    clientRequest.write(finalRequestBody, bodyEncoding);
  }
  clientRequest.end(); // Must always call .end() to send the request

  // Handle errors during the request itself (e.g., network issues, DNS lookup failures)
  clientRequest.on('error', (networkIssue) => {
    // Guard against calling callback multiple times
    if (completionHandler) {
      const wrappedNetworkError = new Error(`BackendConnector: Network request failed for ${httpMethod} ${resourcePath}: ${networkIssue.message}`);
      wrappedNetworkError.originalError = networkIssue;
      wrappedNetworkError.requestConfig = httpRequestOptions;
      completionHandler(wrappedNetworkError);
      completionHandler = null; // Nullify callback
    }
  });

  // Handle request timeout specifically
  clientRequest.on('timeout', () => {
    clientRequest.destroy(); // Abort the request
    if (completionHandler) {
      const timeoutError = new Error(`BackendConnector: Request timed out after ${httpRequestOptions.timeout}ms for ${httpMethod} ${resourcePath}.`);
      timeoutError.code = 'ETIMEDOUT'; // Standard timeout error code
      timeoutError.requestConfig = httpRequestOptions;
      completionHandler(timeoutError);
      completionHandler = null; // Nullify callback
    }
  });
}