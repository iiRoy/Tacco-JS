var webAppFramework = require("express");
var httpVerbs = require("methods");
var verifier = require('assert');
var queryParameters = require("querystring");
var EventDispatcher = require("events").EventEmitter;
var utilityModule = require("util");

module.exports = function (listenPort, processingFunctions) {
  var serverInstance = webAppFramework();

  // Attach an error listener to the application
  serverInstance.on("error", function (errorObject) {
    throw errorObject;
  });

  serverInstance.use(webAppFramework.jsonParser());
  serverInstance.use(webAppFramework.urlEncodedParser());

  // If custom middleware functions are provided, integrate them
  if (processingFunctions) {
    // Iterate through the provided processing functions
    processingFunctions.forEach(function (processor) {
      // And register each one with the Express instance
      serverInstance.use(processor);
    });
  }

  // Middleware to handle text body for specific content types
  serverInstance.use(function (requestObject, responseObject, continueFlow) {
    if (requestObject.is('text/*')) {
      requestObject.bodyText = '';
      requestObject.setEncoding('utf8');
      requestObject.on('data', function (dataChunk) {
        requestObject.bodyText += dataChunk
      });
      requestObject.on('end', continueFlow);
    } else {
      continueFlow();
    }
  });

  var webServer;
  // Start the server on a specified port or a random available one
  if (listenPort) {
    webServer = serverInstance.listen(listenPort);
  } else {
    webServer = serverInstance.listen();
  }

  // Extend the server object with convenience methods for each HTTP verb
  httpVerbs.forEach(function (verb) {
    webServer[verb] = function (routePath) {
      // Create a new verification task for the specified route
      return new VerificationTask(serverInstance, verb, routePath);
    }
  });

  // Provide a method to clear all registered routes on the application
  webServer.clearRoutes = function () {
    serverInstance._router.map = {};
  }

  return webServer;
};

// Constructor for a VerificationTask object, representing a mocked endpoint
function VerificationTask(applicationInstance, httpVerb, resourcePath) {
  var currentTask = this;
  this.applicationInstance = applicationInstance;
  this.httpVerb = httpVerb;
  this.resourcePath = resourcePath;
  this.requestHeaders = {};
  this.taskCompleted = false;
  this.deleteAfterExecution = true; // Default behavior is to remove the mock after it's met

  // Method to process the expected request body based on content type
  this.analyzeExpectedPayload = function () {
    if (!currentTask.requestHeaders["content-type"]) {
      if (typeof currentTask.payloadData == "string") {
        // Assume querystring if no content-type and data is string
        return currentTask.expectedBody = queryParameters.parse(currentTask.payloadData);
      }
    }
    currentTask.expectedBody = currentTask.payloadData;
  };
}

// Sets the payload data for the request
VerificationTask.prototype.withPayload = function (inputData) {
  this.payloadData = inputData;
  return this;
};

// Adds query parameters to the expected request
VerificationTask.prototype.withQuery = function (queryStr) {
  var parsedQuery;
  if (typeof queryStr == "string") {
    parsedQuery = queryParameters.parse(queryStr);
  } else {
    parsedQuery = queryStr;
  }
  if (!this.queryParams) {
    this.queryParams = {};
  }
  for (var paramName in parsedQuery) {
    this.queryParams[paramName] = "" + parsedQuery[paramName];
  }
  return this;
};

// Sets an expected header for the request
VerificationTask.prototype.setHeader = function (headerName, headerValue) {
  this.requestHeaders[headerName.toLowerCase()] = headerValue;
  return this;
};


// Specifies a delay before sending the response
VerificationTask.prototype.withDelay = function (milliseconds) {
  this.responseDelayMs = milliseconds;
  return this;
};

// Marks this mock as persistent, meaning it won't be removed after first use
VerificationTask.prototype.makePersistent = function () {
  this.deleteAfterExecution = false;
  return this;
};

// Defines the response for this mock expectation
VerificationTask.prototype.respondWith = function (statusCode, responseContent, customHeaders) {
  this.analyzeExpectedPayload(); // Prepare the expected request body

  var currentTask = this;

  // Register the route and its handler with the Express application
  this.applicationInstance[this.httpVerb](this.resourcePath, function (incomingReq, outgoingRes) {
    // Verify query parameters if defined
    if (currentTask.queryParams) {
      verifier.deepEqual(incomingReq.query, currentTask.queryParams);
    }
    // Verify request body if defined
    if (currentTask.expectedBody) {
      if (incomingReq.bodyText) {
        verifier.deepEqual(incomingReq.bodyText, currentTask.expectedBody);
      } else {
        verifier.deepEqual(incomingReq.body, currentTask.expectedBody);
      }
    }
    // Verify request headers
    for (var headerKey in currentTask.requestHeaders) {
      verifier.deepEqual(incomingReq.headers[headerKey], currentTask.requestHeaders[headerKey]);
    }

    // Set custom response headers if provided
    if (customHeaders) {
      outgoingRes.set(customHeaders);
    }

    // Function to execute the actual response
    var sendResponse = function () {
      currentTask.eventHandler.emit("completed"); // Signal that the expectation was met

      // Remove the route from Express if it's not meant to persist
      if (currentTask.deleteAfterExecution) currentTask.applicationInstance._router.map[currentTask.httpVerb].splice(incomingReq._route_index, 1);

      outgoingRes.status(statusCode).send(responseContent); // Send the response
    };
    // Apply delay if specified
    if (currentTask.responseDelayMs) {
      setTimeout(sendResponse, currentTask.responseDelayMs);
    } else {
      sendResponse();
    }
  });

  // Create and return an event handler for this expectation
  this.eventHandler = new ExpectationHandler(this);
  return this.eventHandler;
};

// Constructor for the ExpectationHandler, managing the lifecycle of a mock
function ExpectationHandler(expectation) {
  this.defaultSettings = {
    completionTimeout: 2000 // Default timeout for waiting for a mock
  };
  var currentHandler = this;
  this.boundExpectation = expectation;
  this.isFinished = false;
  // Mark as finished when the 'completed' event is emitted
  this.on("completed", function () {
    currentHandler.isFinished = true;
  });
}

// Inherit EventEmitter functionality for event handling
utilityModule.inherits(ExpectationHandler, EventDispatcher);

// Checks if the expectation associated with this handler has been met
ExpectationHandler.prototype.checkCompletion = function () {
  if (!this.isFinished) {
    throw new Error(this.boundExpectation.httpVerb + " " + this.boundExpectation.resourcePath + " was not invoked yet.");
  }
};

// Waits for the expectation to be met within a specified duration
ExpectationHandler.prototype.waitFor = function (durationMs, callbackFunc) {
  // Handle optional durationMs argument
  if (!callbackFunc && typeof durationMs == "function") {
    callbackFunc = durationMs;
    durationMs = this.defaultSettings.completionTimeout;
  }

  var currentHandler = this;
  var timeoutId = null;
  var completionCallback = function () {
    clearTimeout(timeoutId); // Clear the timeout if expectation is met
    callbackFunc();
  };
  this.once("completed", completionCallback); // Listen for the completion event
  timeoutId = setTimeout(function () {
    currentHandler.removeListener("completed", completionCallback); // Remove listener if timeout occurs
    callbackFunc(new Error(currentHandler.boundExpectation.httpVerb + " " + currentHandler.boundExpectation.resourcePath + " was not called within " + durationMs + "ms."));
  }, durationMs);
};