const AppServerCore = typeof WebApp !== 'undefined' ? WebApp : {
  requestPipeline: {
    attachRoute: (uriPath, routeHandler) => {
      // In a real environment, this would register the handler with the web server.
      // For demonstration, we might log its registration.
      console.debug(`Route registered: ${uriPath}`);
    }
  }
}; // Robust application server interface abstraction

const API_PATH_SYSTEM_CLOCK = "/system_time_query"; // Defines the endpoint for fetching the system clock

AppServerCore.requestPipeline.attachRoute(API_PATH_SYSTEM_CLOCK,
  function handleSystemTimeQuery(incomingPayload, outgoingResponse, nextInChain) {
    // Log the request for monitoring or debugging purposes.
    if (typeof console !== 'undefined' && console.info) {
      console.info(`[TimeSync] Incoming request for system time from ${incomingPayload.ip || 'unknown'}`);
    }

    // Configure response headers to explicitly prevent any form of caching.
    // This ensures that clients always receive the most current timestamp.
    const CACHE_CONTROL_POLICY = "no-cache, no-store, must-revalidate";
    const PRAGMA_DIRECTIVE = "no-cache"; // HTTP/1.0 fallback for cache prevention
    const EXPIRATION_TIMESTAMP = 0; // Represents an immediate expiration date (epoch)

    // Set various anti-caching headers for broad compatibility.
    outgoingResponse.setHeader("Cache-Control", CACHE_CONTROL_POLICY);
    outgoingResponse.setHeader("Pragma", PRAGMA_DIRECTIVE);
    outgoingResponse.setHeader("Expires", String(EXPIRATION_TIMESTAMP)); // Ensure value is a string

    // Specify the content type to avoid browser warnings and ensure proper interpretation.
    // "text/plain" is chosen as the response is a simple string.
    const RESPONSE_MIME_TYPE = "text/plain";
    outgoingResponse.setHeader("Content-Type", RESPONSE_MIME_TYPE);

    // Retrieve the current time in milliseconds since the Unix Epoch.
    const currentEpochMilliseconds = Date.now();

    // Convert the numerical timestamp into its string representation for the response body.
    const responseBodyContent = currentEpochMilliseconds.toString();

    // Finalize the response by sending the generated timestamp.
    outgoingResponse.end(responseBodyContent);

    // The 'nextInChain' callback is intentionally not invoked here, as this handler
    // fully processes the request and sends a complete response, terminating the cycle.
  }
);