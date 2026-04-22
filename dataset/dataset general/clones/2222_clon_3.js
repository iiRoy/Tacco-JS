const TransactionHandler = require('./transaction_utils').Processor;
const auxiliary = require('util');

/**
 * Utility function to safely extract the raw payload from an incoming HTTP request stream.
 * It handles stream events and enforces a maximum payload size to prevent abuse.
 * @param {Object} incomingRequest - The HTTP request object.
 * @param {Function} completionCallback - Callback function (err, payload) called upon completion or error.
 */
const extractRequestPayload = function (incomingRequest, completionCallback) {
  let receivedChunks = '';
  // Define a maximum acceptable payload size (e.g., 1MB)
  const MAX_PAYLOAD_SIZE = 1024 * 1024;

  // Set the encoding for the incoming data stream to ensure proper string concatenation
  incomingRequest.setEncoding('utf8');

  // Event listener for incoming data chunks
  incomingRequest.on('data', function (dataPiece) {
    receivedChunks += dataPiece;
    // Implement a guard clause for payload size limit
    if (receivedChunks.length > MAX_PAYLOAD_SIZE) {
      incomingRequest.destroy(); // Terminate the connection immediately
      const sizeExceededError = new Error('Incoming payload size limit exceeded.');
      sizeExceededError.name = 'RequestPayloadTooLarge';
      return completionCallback(sizeExceededError);
    }
  });

  // Event listener for the end of the request stream
  incomingRequest.on('end', function () {
    // Attach the processed body to the request object for easy access by subsequent middleware
    incomingRequest.processedBody = receivedChunks;
    completionCallback(null, receivedChunks);
  });

  // Event listener for any errors occurring during stream processing
  incomingRequest.on('error', function (streamError) {
    streamError.name = 'StreamReadError:' + streamError.name;
    completionCallback(streamError);
  });
};


/**
 * Core class for developing transaction-related middleware components.
 * It encapsulates common logic for processing and responding to transaction requests.
 * @class TransactionMiddlewareCore
 * @constructor
 * @param {Object} processingSettings - Configuration object containing merchant details, app IDs, etc.
 */
function TransactionMiddlewareCore(processingSettings) {
  // Perform basic validation on the provided configuration
  if (!processingSettings || typeof processingSettings !== 'object') {
    throw new Error('Critical: Invalid or missing processingSettings for TransactionMiddlewareCore initialization.');
  }
  // Log a warning if a crucial setting like merchantID is absent
  if (!processingSettings.merchantID) {
    console.warn('Configuration Alert: merchantID is not specified in processingSettings.');
  }

  // Instantiate the specialized transaction handler with the given settings
  this.transactionProcessor = new TransactionHandler(processingSettings);
  return this; // Enable fluent interface or chaining
}

/**
 * Finalizes the middleware configuration and returns the Express-compatible middleware function.
 * This function processes incoming requests, validates payloads, and invokes a user-defined handler.
 * @method assembleHandler
 * @for TransactionMiddlewareCore
 * @param  {Function} [primaryCallback] - Optional primary function to handle the validated transaction data.
 * @returns {Function} An Express-style middleware function (req, res, next).
 */
TransactionMiddlewareCore.prototype.assembleHandler = function (primaryCallback) {
  const contextReference = this; // Capture 'this' for use in nested functions
  const processorInstance = contextReference.transactionProcessor;

  // Define a default request handler if none is explicitly provided,
  // to prevent unhandled requests.
  const finalRequestHandler = typeof primaryCallback === 'function' ? primaryCallback :
    function (dataPayload, incomingRequest, responseObject, nextMiddleware) {
      console.info('Info: No custom primary handler provided. Data received, but not specifically processed:', dataPayload);
      // Default behavior: respond with an error indicating no handler
      responseObject.sendResponse(new Error('Endpoint is configured, but no custom handler function was provided.'));
    };

  // The actual middleware function returned to Express
  return function (incomingRequest, responseObject, nextMiddleware) {
    // Implement a guard clause for HTTP method. Only POST requests are expected for transaction notifications.
    if (incomingRequest.method !== 'POST') {
      const methodIssue = new Error('HTTP method not supported for this endpoint.');
      methodIssue.name = 'MethodNotAllowed';
      responseObject.setHeader('Allow', 'POST'); // Inform client about allowed method
      // Use the internal failure handler with a specific HTTP status code
      return contextReference.handleFailure(methodIssue, responseObject, 405);
    }

    // Check if the request body has already been processed by an earlier middleware
    if (incomingRequest.processedBody) {
      // If already processed, directly proceed to validation
      return processReceivedPayload(incomingRequest.processedBody);
    }

    // If not processed, extract the raw payload from the request stream
    extractRequestPayload(incomingRequest, function (payloadError, receivedPayload) {
      if (payloadError) {
        payloadError.name = 'PayloadExtractionFailure:' + payloadError.name;
        // Handle payload extraction errors with a 400 Bad Request status
        return contextReference.handleFailure(payloadError, responseObject, 400);
      }
      // Once payload is extracted, proceed to validation
      processReceivedPayload(receivedPayload);
    });

    // Inner function to handle payload processing and validation
    function processReceivedPayload(payloadContent) {
      processorInstance.verifyAndParse(payloadContent, function (validationError, transactionDetails) {
        // Augment the response object with a convenient reply method
        responseObject.sendResponse = function (responseData) {
          if (responseData instanceof Error) {
            // Log the error for internal tracking
            console.error('Error encountered during response generation:', responseData.message || responseData.name, responseData);
            contextReference.handleFailure(responseData, responseObject);
          } else {
            contextReference.handleSuccess(responseData, responseObject);
          }
        };

        if (validationError) {
          // If the transaction payload fails validation, send an immediate failure response
          console.warn('Transaction payload validation failed:', validationError.message || validationError.name);
          return contextReference.handleFailure(validationError, responseObject, 400); // 400 Bad Request for validation errors
        }

        // If validation is successful, pass control to the user-defined handler with parsed data
        finalRequestHandler(transactionDetails, incomingRequest, responseObject, nextMiddleware);
      });
    }
  };
};

/**
 * Handles successful transaction processing by sending an XML success response.
 * @method handleSuccess
 * @for TransactionMiddlewareCore
 * @param {Object} operationOutcome - Data related to the successful operation (can be ignored for basic success).
 * @param {Object} responseObject - The Express response object.
 */
TransactionMiddlewareCore.prototype.handleSuccess = function (operationOutcome, responseObject) {
  // Ensure a 200 OK HTTP status code for successful operations
  responseObject.statusCode = 200;
  console.log('Transaction processed successfully. Sending "SUCCESS" response to client.');
  // Compose and send the XML success reply
  return responseObject.end(this.transactionProcessor.composeXmlReply({
    responseCode: 'SUCCESS',
    // Additional data from operationOutcome can be included here if relevant
    // e.g., transactionIdentifier: operationOutcome.id
  }));
};

/**
 * Handles failed transaction processing by sending an XML failure response and logging the error.
 * @method handleFailure
 * @for TransactionMiddlewareCore
 * @param {Error} problemReport - The error object describing the failure.
 * @param {Object} responseObject - The Express response object.
 * @param {Number} [httpStatusCode=500] - Optional HTTP status code to send with the response.
 */
TransactionMiddlewareCore.prototype.handleFailure = function (problemReport, responseObject, httpStatusCode = 500) {
  // Set the appropriate HTTP status code, defaulting to 500 Internal Server Error
  responseObject.statusCode = httpStatusCode;

  const failureMessage = problemReport.message || problemReport.name || 'An unhandled processing error occurred.';
  console.error('Transaction processing failed:', failureMessage, 'Details:', problemReport);

  // Compose and send the XML failure reply
  return responseObject.end(this.transactionProcessor.composeXmlReply({
    responseCode: 'FAIL',
    responseMessage: failureMessage
  }));
};

/**
 * Specialized class for handling webhook notifications, inheriting from TransactionMiddlewareCore.
 * @class WebhookNotificationEngine
 * @constructor
 * @param {Object} engineConfiguration - Configuration specific to the notification engine.
 */
function WebhookNotificationEngine(engineConfiguration) {
  // Enforce constructor to be called with 'new' keyword
  if (!(this instanceof WebhookNotificationEngine)) {
    return new WebhookNotificationEngine(engineConfiguration);
  }
  // Call the parent constructor to inherit core functionalities
  TransactionMiddlewareCore.call(this, engineConfiguration);
  // Add any specific properties relevant to webhook notifications
  this.notificationChannel = 'incoming_webhook';
  return this;
}
// Establish the inheritance chain between WebhookNotificationEngine and TransactionMiddlewareCore
auxiliary.inherits(WebhookNotificationEngine, TransactionMiddlewareCore);


/**
 * Factory function to create and configure middleware instances for various transaction processing needs.
 * @param {Object} factoryConfig - Configuration settings for the middleware factory.
 * @returns {Object} An object containing methods to build specific middleware types.
 */
const createMiddlewareFactory = function (factoryConfig) {
  // Validate the factory configuration upon creation
  if (!factoryConfig || typeof factoryConfig !== 'object' || Object.keys(factoryConfig).length === 0) {
    console.error('Error: Middleware factory configuration is either missing, invalid, or empty.');
    throw new Error('Invalid configuration provided to createMiddlewareFactory.');
  }

  return {
    // Method to instantiate a specialized notification handler middleware
    buildNotificationHandler: function () {
      return new WebhookNotificationEngine(factoryConfig);
    }
  };
};

// Expose the WebhookNotificationEngine constructor directly on the factory for advanced usage
createMiddlewareFactory.WebhookNotificationEngine = WebhookNotificationEngine;

// Export the factory function as the main module export
module.exports = createMiddlewareFactory;