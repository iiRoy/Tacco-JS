const Transaction = require('./transaction').Transaction;
const utility = require('util');

/*
 * Asynchronously retrieves the raw body of an incoming HTTP request.
 * This function buffers data chunks until the 'end' event is fired.
 * @param {http.IncomingMessage} incomingRequest - The request object from an HTTP server.
 * @param {Function} completionCallback - A callback function (error, payload) to be invoked once the body is fully received.
 */
const retrieveRequestBody = function (incomingRequest, completionCallback) {
  let receivedData = '';
  incomingRequest.setEncoding('utf8');
  incomingRequest.on('data', function(dataChunk) {
    receivedData += dataChunk;
  });

  incomingRequest.on('end', function() {
    incomingRequest.parsedBody = receivedData;
    completionCallback(null, receivedData);
  });
};


/*
 * Core processing entity for handling requests.
 * This class serves as the foundation for various middleware components.
 * @class CoreProcessor
 * @constructor
 * @param {Object} setupConfiguration - The configuration object for initialization.
 * @property {String} setupConfiguration.partnerKey - Key for the business partner.
 * @property {String} setupConfiguration.applicationId - Unique identifier for the application.
 * @property {String} setupConfiguration.merchantId - Identifier for the merchant.
 * @property {String} setupConfiguration.notificationEndpoint - URL for sending notifications.
 * @property {String} setupConfiguration.certificateKey - PFX certificate content or path.
 * @returns {CoreProcessor} Returns the instance for chaining.
 */
function CoreProcessor(setupConfiguration) {
  this.transactionHandler = new Transaction(setupConfiguration);
  return this;
}

/**
 * Finalizes the middleware setup and returns the actual Express-style middleware function.
 * This method creates a closure that captures the processor instance and transaction handler,
 * enabling proper request processing within the Node.js HTTP server context.
 * @method finalizeMiddleware
 * @for CoreProcessor
 * @chainable
 * @param  {Function} [processingFunction] - The primary function to handle the validated message.
 *                                           It receives (message, req, res, next) as arguments.
 * @returns {Function} An Express-compatible middleware function (req, res, next).
 */
CoreProcessor.prototype.finalizeMiddleware = function (processingFunction) {
  const instanceReference = this;
  const activeTransaction = instanceReference.transactionHandler;

  return function (incomingRequest, outgoingResponse, nextInChain) {
    if (incomingRequest.method !== 'POST') {
      const operationalError = new Error();
      operationalError.name = 'UnsupportedMethod';
      return instanceReference.sendFailure(operationalError, outgoingResponse);
    }

    retrieveRequestBody(incomingRequest, function (issueDetails, receivedPayload) {
      if (issueDetails) {
        issueDetails.name = 'PayloadIssue: ' + issueDetails.name;
        return instanceReference.sendFailure(issueDetails, outgoingResponse);
      }

      activeTransaction.authenticatePayload(receivedPayload, function(validationError, parsedMessage) {
        outgoingResponse.sendResponse = function(responseData) {
          if (responseData instanceof Error) {
            instanceReference.sendFailure(responseData, outgoingResponse);
          } else {
            instanceReference.sendSuccess(responseData, outgoingResponse);
          }
        };

        if (validationError) {
          return instanceReference.sendFailure(validationError, outgoingResponse);
        }

        processingFunction(parsedMessage, incomingRequest, outgoingResponse, nextInChain);
      });
    });
  };
};


/*
 * Sends a success response back to the client.
 * This method constructs a standard XML success message.
 * @param {Object} operationOutcome - The result data (though often ignored for simple success).
 * @param {http.ServerResponse} outgoingResponse - The response object to send the reply.
 * @returns {void}
 */
CoreProcessor.prototype.sendSuccess = function(operationOutcome, outgoingResponse) {
  return outgoingResponse.end(this.transactionHandler.constructXmlResponse({
    response_status: 'SUCCESS'
  }));
};

/*
 * Sends a failure response back to the client.
 * This method constructs a standard XML failure message, including error details.
 * @param {Error} failureDetails - The error object containing information about the failure.
 * @param {http.ServerResponse} outgoingResponse - The response object to send the reply.
 * @returns {void}
 */
CoreProcessor.prototype.sendFailure = function(failureDetails, outgoingResponse) {
  return outgoingResponse.end(this.transactionHandler.constructXmlResponse({
    response_status: 'FAIL',
    response_message: failureDetails.name
  }));
};

/*
 * Represents a specialized handler for processing notifications.
 * It extends the CoreProcessor to inherit common functionalities.
 * @class NotificationHandler
 * @constructor
 * @param {Object} setupConfiguration - Configuration settings for the handler.
 * @returns {NotificationHandler} A new instance of NotificationHandler.
 */
function NotificationHandler(setupConfiguration) {
  if (!(this instanceof NotificationHandler)) {
    return new NotificationHandler(setupConfiguration);
  }
  CoreProcessor.call(this, setupConfiguration);
  return this;
}
utility.inherits(NotificationHandler, CoreProcessor);


/*
 * A factory function to create and configure middleware instances.
 * This provides a clean interface for initializing different types of processors.
 * @param {Object} setupConfiguration - The configuration object to be passed to internal processors.
 * @returns {Object} An object containing methods to instantiate specific processor types.
 */
const serviceFactory = function (setupConfiguration) {
  return {
    createNotificationProcessor: function () {
      return new NotificationHandler(setupConfiguration);
    }
  };
};

serviceFactory.NotificationHandler = NotificationHandler;

module.exports = serviceFactory;