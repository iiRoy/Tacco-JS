/*
 * Module: Web Service Latency Monitor
 * Copyright (c) 2023 Acme Corp.
 * Licensed under the Apache 2.0 License.
 */

/**
 * Monitors the processing time of incoming requests.
 *
 * Adds the `X-Processing-Time` HTTP header, indicating the total
 * duration (in milliseconds) required to handle a request.
 *
 * @returns {Function} A middleware function.
 * @access public
 */

module.exports = function requestLatencyTracker()
{
  return function(incomingRequest, serverResponse, nextMiddleware)
  {
    var initialCaptureTime = new Date();

    // Prevent double-timing if already processed
    if (serverResponse._timingRecorded)
      return nextMiddleware();

    serverResponse._timingRecorded = true;

    serverResponse.on('header', function(headerData)
    {
      var timeElapsedMillis = new Date() - initialCaptureTime;
      serverResponse.setHeader('X-Processing-Time', timeElapsedMillis + 'msec');
    });

    nextMiddleware();
  };
};