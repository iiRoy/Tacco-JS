const EventDispatcher = require('events').EventEmitter;
const secureHttp = require('https');
const encoderUtil = require('./base64');

/**
 * @class ApiCommunicator
 * @extends EventDispatcher
 * @description Core class for handling secure HTTP communications with an API.
 * This component facilitates sending POST requests and managing their lifecycle,
 * including authentication and response processing.
 */
let ApiCommunicator = function(resourcePrefix) {
  // The primary host for API requests (e.g., 'api.example.com')
  this.targetHost = 'boxcar.io';
  // A common path segment that prefixes all requests (e.g., '/v1/users')
  this.resourcePrefix = resourcePrefix;

  // Initialize event emitting capabilities by invoking the parent constructor.
  // This allows instances of ApiCommunicator to emit and listen for events.
  EventDispatcher.call(this);

  // Internal flag for enabling extended logging, useful during development.
  this._enableVerboseLogging = true;
};

// Establish the prototype chain for proper inheritance from EventDispatcher.
// Object.create is preferred over `new EventDispatcher()` to avoid calling
// the parent constructor multiple times and to create a clean prototype object.
ApiCommunicator.prototype = Object.create(EventDispatcher.prototype);
// Explicitly set the constructor property to maintain correct object type identification.
ApiCommunicator.prototype.constructor = ApiCommunicator;

/**
 * @private
 * @description Constructs the HTTP Authorization header string in Basic format.
 * This is a utility function, moved out of the main method for modularity.
 * @param {object} accessCredentials - An object containing 'username' and 'password' strings.
 * @returns {string|null} The formatted 'Basic <base64_encoded_string>' header value, or null if credentials are invalid.
 */
function _buildAuthHeaderString(accessCredentials) {
  if (accessCredentials && typeof accessCredentials.username === 'string' && typeof accessCredentials.password === 'string') {
    const authenticationToken = accessCredentials.username + ':' + accessCredentials.password;
    return 'Basic ' + encoderUtil.encode(authenticationToken);
  }
  return null;
}

/**
 * Dispatches an HTTP POST request to a designated API endpoint.
 * This method serializes data, applies authentication, and handles the server's response.
 *
 * @param {string} endpointPath - The specific relative path for the API call (e.g., '/messages/send').
 * @param {object} requestPayload - An object containing key-value pairs to be sent in the request body.
 * @param {object} [accessCredentials] - Optional object with 'username' and 'password' for basic authentication.
 * @emits ApiCommunicator#requestCompleted - Emitted when the server responds, providing status information.
 * @emits ApiCommunicator#communicationError - Emitted if an error occurs during the HTTP request process.
 */
ApiCommunicator.prototype.sendPayload = function(endpointPath, requestPayload, accessCredentials) {
  const instanceContext = this; // Renamed 'self' to 'instanceContext' for better readability.
  const defaultSecurePort = 443; // Standard HTTPS port.

  // --- Pre-flight Input Validation (Added Guard Clauses) ---
  if (typeof endpointPath !== 'string' || endpointPath.trim() === '') {
    if (instanceContext._enableVerboseLogging) console.warn('ApiCommunicator: An invalid or empty endpointPath was provided.');
    instanceContext.emit('communicationError', new Error('Invalid API endpoint path specified.'));
    return; // Halt execution if validation fails.
  }
  if (typeof requestPayload !== 'object' || requestPayload === null) {
    if (instanceContext._enableVerboseLogging) console.warn('ApiCommunicator: Request payload must be a non-null object.');
    instanceContext.emit('communicationError', new Error('Payload data must be a valid object.'));
    return; // Halt execution if validation fails.
  }

  // --- Data Serialization and Encoding (Rewritten using functional methods) ---
  // Converts the payload object into a URL-encoded string.
  // Filters out falsy values from the payload, mirroring original behavior.
  const encodedSegments = Object.keys(requestPayload)
    .filter(keyName => Boolean(requestPayload[keyName])) // Only include truthy values.
    .map(keyName => {
      // Ensure both keys and values are properly URL-encoded.
      return encodeURIComponent(keyName) + '=' + encodeURIComponent(requestPayload[keyName]);
    });
  const httpRequestContent = encodedSegments.join('&');

  // Log the generated request body for debugging purposes (Added fragment).
  if (instanceContext._enableVerboseLogging) {
    console.log(`[DEBUG] Preparing to send to ${instanceContext.targetHost}${instanceContext.resourcePrefix}${endpointPath}. Body preview: "${httpRequestContent.substring(0, 120)}..."`);
  }

  // --- HTTP Request Configuration (Renamed and Enhanced) ---
  const requestSettings = {
    hostname: instanceContext.targetHost, // Using 'hostname' for clarity, consistent with Node.js http/https module.
    port: defaultSecurePort,
    path: instanceContext.resourcePrefix + endpointPath,
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded', // Explicitly declare content type.
      'Content-Length': Buffer.byteLength(httpRequestContent, 'utf8') // Accurate byte length for multi-byte characters.
    }
  };

  // --- Authentication Header Insertion (Updated with helper function and checks) ---
  const authHeaderValue = _buildAuthHeaderString(accessCredentials);
  if (authHeaderValue) {
    requestSettings.headers['Authorization'] = authHeaderValue;
  } else if (accessCredentials && instanceContext._enableVerboseLogging) {
     // Log a warning if credentials were provided but couldn't be used.
     console.warn('ApiCommunicator: Invalid or incomplete credentials prevented Authorization header generation.');
  }

  // --- Initiate the Secure HTTP Request ---
  const httpOperation = secureHttp.request(requestSettings, (serverResponse) => {
    // --- Response Handling (Deleted `resBody` accumulation, simplified) ---
    // The original code accumulated the response body (`resBody`) but only
    // emitted the status code. To maintain functional similarity and simplify,
    // the accumulation of the full response body is removed here.
    // If the body content were needed, it would be re-implemented.

    serverResponse.setEncoding('utf8'); // Ensure proper character decoding.

    // Consume data fragments to ensure the 'end' event is always fired,
    // even if the data itself is not stored (Added fragment for robustness).
    serverResponse.on('data', (dataFragment) => {
      if (instanceContext._enableVerboseLogging) {
        // console.log(`[DEBUG] Received data fragment (not stored): ${dataFragment.substring(0, 80)}...`);
      }
      // Data is processed (read) but not stored, as only status is emitted.
    });

    serverResponse.on('end', () => {
      // Emit a more descriptive event, including status and a general message.
      instanceContext.emit('requestCompleted', {
        status: serverResponse.statusCode,
        message: 'API request successfully completed.',
        // Additional response headers or summary could be added here if needed.
      });
    });
  });

  // --- Request Error Handling (Added Fragment) ---
  // Listen for errors that occur during the request setup or transmission.
  httpOperation.on('error', (operationIssue) => {
    if (instanceContext._enableVerboseLogging) {
      console.error('ApiCommunicator: An error occurred during the HTTP request:', operationIssue.message);
    }
    instanceContext.emit('communicationError', operationIssue);
  });

  // --- Send the Request Body and Finalize ---
  httpOperation.write(httpRequestContent); // Write the prepared URL-encoded data to the request body.
  httpOperation.end(); // Signal that the request body is complete and send the request.
};

// Export the ApiCommunicator class to allow other modules to instantiate it.
module.exports = ApiCommunicator;