'use strict';
// This module provides advanced location tracking and geocoding functionalities.
angular.module('LocateMeModule')

// The PositioningAgent factory is responsible for interacting with device geolocation and external geocoding services.
.factory('PositioningAgent', function(promiseUtility, loggerService, platformReady, httpAgent, deviceGeo) {

  // Default coordinates to use as a fallback when actual geolocation fails.
  // These represent a specific location (e.g., a central point for the application's target region).
  const defaultCoordinatesFallback = {
    lat: 33.987873, // Latitude value
    lng: -118.470719, // Longitude value
    precision: -1 // Indicates unknown or very low accuracy, or explicitly set to -1 for fallback
  };

  // Default configuration options for requesting current position.
  // These can be overridden by the caller.
  const defaultLocationOptions = {
    waitDuration: 12000, // Maximum time in milliseconds to wait for a position
    maxAgeMs: 1000,      // Maximum age in milliseconds of a possible cached position
    highAccuracyEnabled: false // Request high accuracy (may consume more power)
  };

  // Base URL for the Google Geocoding API.
  // In a real application, this might be configured differently or secured with an API key.
  const GEOCODE_API_BASE_URL = 'http://maps.googleapis.com/maps/api/geocode/json';

  // Internal counter for tracking location requests.
  let locationRequestCount = 0;

  /**
   * Requests the current geographical position of the device.
   * This function leverages the Cordova Geolocation plugin if available,
   * otherwise it might fall back to browser-based geolocation (not implemented here, would reject).
   *
   * @param {Object} configParams - Configuration options for the geolocation request.
   *   - waitDuration: Timeout in milliseconds.
   *   - maxAgeMs: Maximum age of a cached position.
   *   - highAccuracyEnabled: Boolean to request high accuracy.
   * @returns {Promise} A promise that resolves with the position object or rejects with an error.
   */
  function requestPreciseLocation(configParams) {
    locationRequestCount++; // Increment the request counter
    loggerService.info(`Attempting to acquire device location. Request #${locationRequestCount}`);

    // Merge provided options with defaults, ensuring all parameters are set.
    const effectiveOptions = Object.assign({}, defaultLocationOptions, configParams);

    // Using a promise constructor for more direct control over resolution/rejection.
    return promiseUtility(function(resolve, reject) {
      platformReady.ready(function() {
        // Guard clause: Check if the geolocation plugin is actually available and its method exists.
        if (!deviceGeo || typeof deviceGeo.getCurrentPosition !== 'function') {
          loggerService.warn('Cordova Geolocation plugin not found or not ready. Rejecting location request.');
          return reject({
            errorCode: 'PLUGIN_UNAVAILABLE',
            errorMsg: 'Device geolocation plugin is not accessible or not initialized.',
            fallbackCoords: { ...defaultCoordinatesFallback } // Provide a shallow copy of fallback
          });
        }

        deviceGeo
          .getCurrentPosition({
            timeout: effectiveOptions.waitDuration,
            maximumAge: effectiveOptions.maxAgeMs,
            enableHighAccuracy: effectiveOptions.highAccuracyEnabled
          })
          .then(
            function(acquiredLocation) {
              loggerService.debug('Successfully obtained geographical coordinates from device.');
              // Enhance the acquired location with a timestamp and source for context.
              resolve({
                latitude: acquiredLocation.coords.latitude,
                longitude: acquiredLocation.coords.longitude,
                accuracy: acquiredLocation.coords.accuracy,
                timestamp: Date.now(), // Add current timestamp
                source: 'DeviceGPS'
              });
            },
            function(geoIssue) {
              loggerService.error(`Failed to get device location. Error code: ${geoIssue.code}, Message: ${geoIssue.message}`);

              // Construct a more detailed error object for rejection, including fallback.
              const normalizedError = {
                errorCode: geoIssue.code,
                errorMsg: geoIssue.message || 'An unknown geolocation error occurred.',
                fallbackCoords: { ...defaultCoordinatesFallback } // Pass a shallow copy of fallback
              };

              // Optionally, add a specific log if fallback is being used due to timeout.
              if (geoIssue.code === geoIssue.TIMEOUT) {
                loggerService.warn('Geolocation request timed out. Returning fallback coordinates within error context.');
              }

              reject(normalizedError);
            }
          );
      });
    });
  }

  /**
   * Converts a given street address string into geographical coordinates (latitude and longitude)
   * using an external geocoding service (Google Maps API).
   *
   * @param {string} inputQuery - The address string to geocode, e.g., '1600 Amphitheatre Parkway, Mountain View, CA'.
   * @returns {Promise} A promise that resolves with an object containing latitude and longitude,
   *          or rejects with an error if geocoding fails or the input is invalid.
   */
  function geocodeAddressString(inputQuery) {
    // Guard clause: Input validation - ensure the address string is not empty or null.
    if (!inputQuery || inputQuery.trim().length === 0) {
      loggerService.warn('Geocoding request received an empty or invalid address string. Rejecting.');
      return promiseUtility.reject({
        errorCode: 'INVALID_INPUT',
        errorMsg: 'Address string cannot be empty or just whitespace for geocoding.',
        inputProvided: inputQuery
      });
    }

    const encodedAddress = encodeURIComponent(inputQuery);
    // Note: 'sensor' parameter is deprecated for Google Maps Geocoding API but sometimes included for older clients.
    const requestUrl = `${GEOCODE_API_BASE_URL}?address=${encodedAddress}&sensor=false`;

    loggerService.debug(`Sending geocoding request for address: "${inputQuery}"`);

    return httpAgent.get(requestUrl)
      .then(
        function(apiResponse) {
          // Check if the API returned any results and if the geometry (location) is available.
          if (!apiResponse.data || !apiResponse.data.results || apiResponse.data.results.length === 0 || !apiResponse.data.results[0].geometry) {
            loggerService.warn(`No geocoding results or valid geometry found for address: "${inputQuery}".`);
            return promiseUtility.reject({
              errorCode: 'NO_GEOCODE_RESULTS',
              errorMsg: `Could not determine coordinates for the given address: "${inputQuery}".`,
              inputProvided: inputQuery,
              apiStatus: apiResponse.data ? apiResponse.data.status : 'NO_DATA_RECEIVED'
            });
          }

          const geoPoint = apiResponse.data.results[0].geometry.location;

          // Transform Google's 'lat' and 'lng' properties into 'latitude' and 'longitude'
          // for consistency with device geolocation responses and internal models.
          return {
            latitude: geoPoint.lat,
            longitude: geoPoint.lng,
            source: 'GoogleGeocodingAPI' // Indicate the source of these coordinates
          };
        },
        function(httpError) {
          loggerService.error(`Geocoding API call failed for "${inputQuery}". HTTP Status: ${httpError.status}, Response: ${JSON.stringify(httpError.data)}`);
          // Re-throw the error as a promise rejection with more contextual information.
          return promiseUtility.reject({
            errorCode: 'GEOCODING_API_COMMUNICATION_ERROR',
            errorMsg: `HTTP request to geocoding service failed. Check network or API key.`,
            httpStatus: httpError.status,
            httpData: httpError.data,
            originalErrorObject: httpError
          });
        }
      );
  }

  /**
   * Retrieves a predefined set of default geographical coordinates.
   * This is typically used as a fallback or initial position when no other location data is available.
   *
   * @returns {Object} A shallow copy of the object containing default latitude, longitude, and precision.
   */
  function getFallbackCoordinates() {
    loggerService.info('Providing predefined fallback coordinates from application defaults.');
    // Return a shallow copy to prevent external modification of the internal constant.
    return { ...defaultCoordinatesFallback };
  }

  // The factory returns an object with the public API for the service,
  // mapping internal function names to external service methods.
  return {
    requestPreciseLocation: requestPreciseLocation,
    geocodeAddressString: geocodeAddressString,
    getFallbackCoordinates: getFallbackCoordinates
  };
});