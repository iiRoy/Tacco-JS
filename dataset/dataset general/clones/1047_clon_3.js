/*
 * Module: Web Server Performance Monitor
 * Copyright (c) 2023 Advanced Dev Solutions
 * License: Apache 2.0
 */

/**
 * Provides a middleware component to track and report the processing time
 * for incoming HTTP requests. It appends a custom header to the response,
 * indicating how long the server took to generate the response body.
 *
 * The timing is captured from the moment the request enters this middleware
 * until the response headers are prepared to be sent back to the client.
 *
 * @returns {Function} An Express/Connect-compatible middleware function.
 * @public
 */
module.exports = function measureRequestDurationUtility() {
  // This outer function configures and returns the actual middleware.
  // No options are currently supported, but this structure allows for future expansion.

  return function(requestContext, responseContext, proceedToNextHandler) {
    // A unique identifier for the response timing mechanism.
    const HEADER_KEY_FOR_DURATION = 'X-Server-Processing-Time';
    const TIME_UNIT_SUFFIX = 'ms'; // Milliseconds for consistency.

    // Record the precise moment this request began its journey through our handler.
    const initialTimestamp = Date.now(); // Using Date.now() for a simpler millisecond timestamp.

    // Safeguard against accidental re-execution or multiple timing attempts for a single response.
    // If this flag is already set, it means another instance of this middleware (or similar logic)
    // has already initiated timing. We should not interfere or re-initialize.
    if (responseContext._processingDurationFlag) {
      // console.warn('Warning: Request processing duration already being tracked for this response.');
      return proceedToNextHandler(); // Simply pass control to the next middleware.
    }
    // Mark this response context as being handled by our duration tracker.
    responseContext._processingDurationFlag = true;

    // Attach an event listener to the 'header' event of the response object.
    // This event fires just before the HTTP headers are sent to the client.
    responseContext.on('header', function() {
      // Capture the current time when headers are about to be sent.
      const finalTimestamp = Date.now();
      // Calculate the total time elapsed since the request entered this middleware.
      const elapsedTimeInMs = finalTimestamp - initialTimestamp;

      // Format the duration string for the HTTP header.
      const formattedDurationValue = `${elapsedTimeInMs}${TIME_UNIT_SUFFIX}`;

      // Set the custom header with the calculated duration.
      responseContext.setHeader(HEADER_KEY_FOR_DURATION, formattedDurationValue);

      // Optional: Log the duration for debugging purposes.
      // This could be conditional based on an environment variable or a configuration option.
      // console.debug(`[Duration Monitor] Request completed in: ${formattedDurationValue}`);
    });

    // Ensure the `proceedToNextHandler` is a function before calling it.
    // This is a robust check for middleware chaining.
    if (typeof proceedToNextHandler === 'function') {
      proceedToNextHandler(); // Pass control to the next middleware in the chain.
    } else {
      console.error('Error: Next middleware handler is not a function. Middleware chain broken.');
      // Depending on context, one might throw an error or attempt to end the response here.
      // For a Type III clone, adding this error handling is a good structural change.
    }
  };
};