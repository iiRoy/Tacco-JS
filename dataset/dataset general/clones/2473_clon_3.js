const webFramework = require("express");
const httpVerbs = require("methods");
const verifier = require('assert');
const queryParser = require("querystring");
const EventHub = require("events").EventEmitter;

module.exports = function(listenPortValue, customMiddlewaresArray) {
  const webAppInstance = webFramework();

  webAppInstance.on("error", (err) => {
    console.error("Web application encountered an error:", err.message, err.stack);
    // In a production app, more robust error handling or process exit might be considered.
  });

  // Apply standard Express body parsing middlewares with enhanced options
  webAppInstance.use(webFramework.json({ limit: '2mb' })); // Increased payload limit to 2MB
  webAppInstance.use(webFramework.urlencoded({ extended: true, parameterLimit: 5000 })); // Allow nested objects and increased parameter limit

  // Iterate and attach any user-defined custom middlewares
  if (Array.isArray(customMiddlewaresArray) && customMiddlewaresArray.length > 0) {
    customMiddlewaresArray.forEach((mwFunc, index) => {
      if (typeof mwFunc === 'function') {
        webAppInstance.use(mwFunc);
      } else {
        console.warn(`Skipping invalid middleware at index ${index}: Not a function.`);
      }
    });
  }

  // Custom middleware to capture raw text bodies for specific content types
  const rawTextBodyCaptureMiddleware = (requestCtx, responseCtx, nextHandler) => {
    if (requestCtx.is('text/*') && requestCtx.method !== 'GET' && requestCtx.method !== 'HEAD') {
      let accumulatedText = '';
      requestCtx.setEncoding('utf8');

      requestCtx.on('data', (dataChunk) => {
        accumulatedText += dataChunk;
        // Implement a safeguard against excessively large text bodies
        if (Buffer.byteLength(accumulatedText, 'utf8') > 1024 * 1024 * 5) { // 5MB limit
          const error = new Error('Request text body exceeds maximum allowed size.');
          error.statusCode = 413; // Payload Too Large
          nextHandler(error);
          requestCtx.destroy(); // Terminate the connection
        }
      });

      requestCtx.on('end', () => {
        requestCtx.rawTextBody = accumulatedText; // Store the captured raw text
        nextHandler();
      });

      requestCtx.on('error', (err) => {
        console.error("Error during raw text body processing:", err.message);
        nextHandler(err); // Pass stream errors to Express error handling
      });
    } else {
      nextHandler();
    }
  };
  webAppInstance.use(rawTextBodyCaptureMiddleware);

  let httpServerInstance;
  let effectiveListenPort = listenPortValue;

  // Validate and normalize the listening port, defaulting to a random available port if invalid
  if (typeof effectiveListenPort !== 'number' || effectiveListenPort < 0 || effectiveListenPort > 65535 || isNaN(effectiveListenPort)) {
    console.warn(`Invalid or no specific port provided (${listenPortValue}). Server will listen on a random available port (0).`);
    effectiveListenPort = 0;
  }

  httpServerInstance = webAppInstance.listen(effectiveListenPort, () => {
    const serverAddress = httpServerInstance.address();
    console.log(`Mock HTTP server successfully launched on ${serverAddress.family} ${serverAddress.address}:${serverAddress.port}`);
  });

  // Augment the server instance with methods for defining mock expectations
  httpVerbs.forEach((methodName) => {
    httpServerInstance[methodName] = (targetEndpoint) => {
      return new MockExpectation(webAppInstance, methodName, targetEndpoint);
    };
  });

  // Function to clear all dynamically registered mock routes
  httpServerInstance.clearAllMocks = function() {
    console.log("Attempting to clear all dynamically registered mock routes.");
    // This approach attempts to remove layers that have a 'route' property,
    // which are typically Express route handlers. It might not catch all scenarios
    // if mocks are registered in very custom ways, but serves as a general reset.
    webAppInstance._router.stack = webAppInstance._router.stack.filter(layer => {
      // Keep layers that are not route handlers or are built-in middlewares
      const isRouteHandler = layer.route && layer.handle && layer.handle.name === 'handle';
      return !isRouteHandler;
    });
    console.log("Mock route stack reset complete.");
  };

  return httpServerInstance;
};

// Class definition for managing and defining a single mock expectation
class MockExpectation {
  constructor(appReference, requestMethod, requestPath) {
    this.appReference = appReference;
    this.requestMethod = requestMethod;
    this.requestPath = requestPath;
    this.expectedRequestHeaders = {};
    this.isEphemeral = true; // Renamed from 'removeWhenMet', indicates if mock should be removed after first hit
    this.requestPayload = null;
    this.expectedQueryParams = {};
    this.responseLatencyMs = 0;
    this.processedRequestBody = null; // Stored processed body for comparison
    this.customVerificationFunction = verifier.deepStrictEqual; // Default verification function
    this.mockRouteId = `mock-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`; // Unique ID for the mock
  }

  // Private method to process the expected request payload based on content type
  #processExpectedRequestPayload() {
    if (this.requestPayload === null || this.requestPayload === undefined) {
      this.processedRequestBody = null;
      return;
    }

    let contentType = this.expectedRequestHeaders["content-type"] || "";
    contentType = contentType.toLowerCase();

    if (typeof this.requestPayload === "string") {
      if (contentType.includes("application/x-www-form-urlencoded")) {
        try {
          this.processedRequestBody = queryParser.parse(this.requestPayload);
        } catch (e) {
          console.warn(`[Mock ${this.mockRouteId}] Failed to parse URL-encoded request body string: ${e.message}`);
          this.processedRequestBody = this.requestPayload; // Fallback to raw string if parsing fails
        }
      } else if (contentType.includes("application/json")) {
        try {
          this.processedRequestBody = JSON.parse(this.requestPayload);
        } catch (e) {
          console.warn(`[Mock ${this.mockRouteId}] Failed to parse JSON request body string: ${e.message}`);
          this.processedRequestBody = this.requestPayload; // Fallback to raw string
        }
      } else {
        this.processedRequestBody = this.requestPayload; // Treat as raw text for other text types
      }
    } else if (Buffer.isBuffer(this.requestPayload)) {
      this.processedRequestBody = this.requestPayload.toString('utf8'); // Convert buffer to string for comparison
    } else if (typeof this.requestPayload === "object" && this.requestPayload !== null) {
      this.processedRequestBody = this.requestPayload; // Assume it's already a parsed object
    } else {
      this.processedRequestBody = String(this.requestPayload); // Coerce other types to string
    }
  }

  // Chainable method to specify the expected request payload/body
  withPayload(dataContent) {
    this.requestPayload = dataContent;
    return this;
  }

  // Chainable method to specify expected query parameters
  withQueryParams(queryObject) {
    if (typeof queryObject === "string") {
      try {
        const parsedQs = queryParser.parse(queryObject);
        Object.assign(this.expectedQueryParams, parsedQs);
      } catch (e) {
        console.warn(`[Mock ${this.mockRouteId}] Failed to parse query string input: ${e.message}`);
      }
    } else if (typeof queryObject === "object" && queryObject !== null) {
      Object.assign(this.expectedQueryParams, queryObject);
    } else {
      console.warn(`[Mock ${this.mockRouteId}] Invalid query parameters provided. Expected string or object.`);
    }
    return this;
  }

  // Chainable method to specify an expected request header
  withHeader(headerName, headerValue) {
    if (typeof headerName !== 'string' || !headerName.trim()) {
      console.warn(`[Mock ${this.mockRouteId}] Invalid header name provided: '${headerName}'. Must be a non-empty string.`);
      return this;
    }
    if (headerValue === undefined || headerValue === null) {
      console.warn(`[Mock ${this.mockRouteId}] Header value for '${headerName}' is undefined or null. Consider providing a string value.`);
    }
    // Normalize header name to a standard format (e.g., 'Content-Type' or 'content-type') for consistent matching
    const normalizedName = headerName.toLowerCase(); // Express normalizes incoming headers to lowercase
    this.expectedRequestHeaders[normalizedName] = String(headerValue);
    return this;
  }

  // Chainable method to set a delay before the mock response is sent
  withResponseLatency(delayMilliseconds) {
    if (typeof delayMilliseconds !== 'number' || delayMilliseconds < 0 || isNaN(delayMilliseconds)) {
      console.warn(`[Mock ${this.mockRouteId}] Invalid response latency provided: ${delayMilliseconds}. Using 0ms delay.`);
      this.responseLatencyMs = 0;
    } else {
      this.responseLatencyMs = delayMilliseconds;
    }
    return this;
  }

  // Chainable method to make the mock expectation persistent (not removed after first hit)
  makePersistent() {
    this.isEphemeral = false;
    return this;
  }

  // Main method to define the mock response behavior and register the route
  respondWith(statusCode, responseContent, customResponseHeaders = {}) {
    if (typeof statusCode !== 'number' || statusCode < 100 || statusCode >= 600 || isNaN(statusCode)) {
      throw new Error(`[Mock ${this.mockRouteId}] Invalid HTTP status code provided: ${statusCode}. Must be between 100 and 599.`);
    }

    this.#processExpectedRequestPayload(); // Process the payload once before route registration

    const mockMonitor = new MockMonitor(this); // Initialize the monitor for this expectation

    // Register the mock route with the Express application
    this.appReference[this.requestMethod](this.requestPath, (requestCtx, responseCtx, nextHandler) => {
      console.log(`[Mock ${this.mockRouteId}] HIT: ${this.requestMethod.toUpperCase()} ${this.requestPath}`);

      // Perform validation of incoming request against expectations
      try {
        // Query parameter verification
        if (Object.keys(this.expectedQueryParams).length > 0) {
          this.customVerificationFunction(requestCtx.query, this.expectedQueryParams, `[Mock ${this.mockRouteId}] Query parameters mismatch`);
        }

        // Request body verification
        if (this.processedRequestBody !== null) {
          let actualRequestBody;
          if (requestCtx.rawTextBody !== undefined) { // Our custom middleware captures raw text
            actualRequestBody = requestCtx.rawTextBody;
          } else if (requestCtx.body !== undefined && Object.keys(requestCtx.body).length > 0) {
            actualRequestBody = requestCtx.body; // Express's parsed body for JSON/URL-encoded
          } else {
            actualRequestBody = undefined; // No body received or parsed
          }
          this.customVerificationFunction(actualRequestBody, this.processedRequestBody, `[Mock ${this.mockRouteId}] Request body mismatch`);
        }

        // Request header verification
        for (const headerName in this.expectedRequestHeaders) {
          if (Object.prototype.hasOwnProperty.call(this.expectedRequestHeaders, headerName)) {
            const expectedValue = this.expectedRequestHeaders[headerName];
            // Express automatically lowercases incoming header names
            const actualValue = requestCtx.headers[headerName];
            this.customVerificationFunction(actualValue, expectedValue, `[Mock ${this.mockRouteId}] Header '${headerName}' mismatch`);
          }
        }
      } catch (validationError) {
        console.error(`[Mock ${this.mockRouteId}] Validation failed for incoming request: ${validationError.message}`);
        // For a mock server, we might want to respond with a 400 or 404/500 if validation fails,
        // rather than just passing to next. Here, we'll respond with an error.
        return responseCtx.status(400).send(`Mock validation failed: ${validationError.message}`);
      }

      // Function to send the actual mock response
      const executeMockResponse = () => {
        mockMonitor.signalCompletion(); // Notify the monitor that expectation was met

        // Add a custom header to identify mock responses
        responseCtx.set('X-Mock-Served-By', 'MockeryJS');

        // Apply any user-defined custom response headers
        if (customResponseHeaders && typeof customResponseHeaders === 'object') {
          responseCtx.set(customResponseHeaders);
        }

        // Automatically set Content-Type if not explicitly provided
        if (!responseCtx.get('Content-Type')) {
          if (typeof responseContent === 'object' && responseContent !== null && !Buffer.isBuffer(responseContent)) {
            responseCtx.type('application/json');
          } else if (typeof responseContent === 'string') {
            responseCtx.type('text/plain');
          }
        }

        // Send the response with specified status code and content
        responseCtx.status(statusCode).send(responseContent);

        // If the mock is ephemeral, mark it as 'used' to prevent further hits (soft removal)
        // True removal from Express stack is complex; this is a common workaround for testing.
        if (this.isEphemeral) {
          console.log(`[Mock ${this.mockRouteId}] Ephemeral mock consumed. It will not respond again.`);
          this.isEphemeral = false; // Disable this specific mock instance
          // A more robust system would involve removing the route from Express's stack,
          // but that's beyond simple Type III cloning without major architectural changes.
          // For testing, a full `clearAllMocks` is usually called in `afterEach`.
        }
      };

      // Apply response latency if specified
      if (this.responseLatencyMs > 0) {
        setTimeout(executeMockResponse, this.responseLatencyMs);
      } else {
        executeMockResponse();
      }
    });

    return mockMonitor;
  }
}

// Class definition for monitoring the completion status of a mock expectation
class MockMonitor extends EventHub {
  #isFulfilled = false; // Private field to track completion status

  constructor(monitoredExpectation) {
    super();
    this.configuration = {
      defaultAwaitTimeout: 3000 // Default timeout for awaiting completion
    };
    this.monitoredExpectation = monitoredExpectation;

    this.on("expectationFulfilled", () => {
      this.#isFulfilled = true;
    });
  }

  // Method to explicitly signal that the monitored expectation has been met
  signalCompletion() {
    this.emit("expectationFulfilled");
  }

  // Method to synchronously check if the expectation has been fulfilled
  checkIfCompleted() {
    if (!this.#isFulfilled) {
      throw new Error(`[Mock ${this.monitoredExpectation.mockRouteId}] Expectation for ${this.monitoredExpectation.requestMethod.toUpperCase()} ${this.monitoredExpectation.requestPath} has not been fulfilled yet.`);
    }
    return true;
  }

  // Asynchronous method to wait for the expectation to be fulfilled, using Promises
  awaitCompletion(durationMs, completionCallback) {
    let effectiveDuration = durationMs;
    let effectiveCallback = completionCallback;

    // Handle optional `durationMs` argument when it's actually the callback
    if (typeof durationMs === "function" && completionCallback === undefined) {
      effectiveCallback = durationMs;
      effectiveDuration = this.configuration.defaultAwaitTimeout;
    } else if (typeof durationMs !== "number" || durationMs <= 0 || isNaN(durationMs)) {
      console.warn(`[Mock ${this.monitoredExpectation.mockRouteId}] Invalid wait duration provided: ${durationMs}. Using default timeout of ${this.configuration.defaultAwaitTimeout}ms.`);
      effectiveDuration = this.configuration.defaultAwaitTimeout;
    }

    // Ensure a valid callback function is available
    if (typeof effectiveCallback !== "function") {
      console.warn(`[Mock ${this.monitoredExpectation.mockRouteId}] No valid completion callback provided for awaitCompletion. Proceeding without one.`);
      effectiveCallback = () => {}; // Provide a no-op function
    }

    return new Promise((resolve, reject) => {
      if (this.#isFulfilled) {
        effectiveCallback(null, true);
        return resolve(true);
      }

      let timeoutTimer = null;
      const onExpectationMet = () => {
        clearTimeout(timeoutTimer);
        this.removeListener("expectationFulfilled", onExpectationMet);
        effectiveCallback(null, true);
        resolve(true);
      };

      this.once("expectationFulfilled", onExpectationMet);

      timeoutTimer = setTimeout(() => {
        this.removeListener("expectationFulfilled", onExpectationMet);
        const error = new Error(`[Mock ${this.monitoredExpectation.mockRouteId}] Expectation for ${this.monitoredExpectation.requestMethod.toUpperCase()} ${this.monitoredExpectation.requestPath} was not fulfilled within ${effectiveDuration}ms.`);
        effectiveCallback(error, false);
        reject(error);
      }, effectiveDuration);
    });
  }
}