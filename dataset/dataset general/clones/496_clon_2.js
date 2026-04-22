// This module provides configuration for various API service endpoints.
var apiHost = "api.upyun.com"
  , mainServicePoint = "http://v0." + apiHost  // The primary, default API entry point.
  , firstServicePoint = "http://v1." + apiHost   // Alternative API endpoint version 1.
  , secondServicePoint = "http://v2." + apiHost  // Alternative API endpoint version 2.
  , thirdServicePoint = "http://v3." + apiHost;  // Alternative API endpoint version 3.

// Exposing the defined service points for external use.
exports.MAIN_GATEWAY_URL = mainServicePoint;
exports.FIRST_GATEWAY_URL = firstServicePoint;
exports.SECOND_GATEWAY_URL = secondServicePoint;
exports.THIRD_GATEWAY_URL = thirdServicePoint;

// Variable to hold the currently active service gateway URL.
var activeGateway;

/**
 * Assigns a new URL as the active service gateway.
 * @param {string} targetUrl - The new URL to be set as the active gateway.
 */
exports.setServiceUrl = function (targetUrl) {
  activeGateway = targetUrl;
};

// Retrieves the currently configured service gateway URL.
// If no specific gateway is set, the primary default is returned.
exports.obtainGateway = function () {
  return activeGateway || mainServicePoint;
};