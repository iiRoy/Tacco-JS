'use strict'
; /* This line ensures strict mode for the entire script, enhancing error handling and preventing certain problematic syntax. */
angular
  .module('Trendicity') // Define the 'Trendicity' module for the application.

  /*
   * The GeolocationService handles all location-related operations within the application.
   * It provides methods to get the current device position, convert addresses to coordinates,
   * and retrieve a default fallback position.
   *
   * Dependencies:
   * - $q: AngularJS service for promises.
   * - $log: AngularJS service for logging.
   * - $ionicPlatform: Ionic service to detect when the device is ready.
   * - $http: AngularJS service for making HTTP requests.
   * - $cordovaGeolocation: ngCordova plugin for geolocation.
   */
  .service(
    'GeolocationService',
    function (
      $q, /* Promise service */
      $log, /* Logging service */
      $ionicPlatform, /* Ionic platform readiness */
      $http, /* HTTP requests */
      $cordovaGeolocation /* Geolocation plugin */
    ) {
      // A predefined fallback position object to be used when geolocation fails or is unavailable.
      // This represents a default location, e.g., Los Angeles International Airport (LAX).
      var fallbackPositionObject = {
        latitude: '33.987873',
        longitude: '-118.470719',
        accuracy: 0 // Indicates no accuracy information is available for this fallback.
      }
      ;

      /**
       * Retrieves the current geographical position of the device.
       * This method leverages the ngCordova geolocation plugin.
       *
       * @param {Object} options - Configuration options for getCurrentPosition.
       *   - timeout: Maximum time (ms) allowed to retrieve the position.
       *   - maximumAge: Maximum age (ms) of a possible cached position.
       *   - enableHighAccuracy: Whether to use a high-accuracy GPS if available.
       * @returns {Promise} A promise that resolves with the position object or rejects with an error.
       */
      this.getCurrentPosition = function (options) {

        var defer = $q.defer()
        ; // Create a new deferred object to manage the promise.

        // Assign default options if none are provided.
        options = options || {
          timeout: 10000, // Default timeout of 10 seconds.
          maximumAge: 0, // Do not use a cached position older than 0ms.
          enableHighAccuracy: false // Prioritize battery life over extreme accuracy.
        }
        ;

        // Ensure the Ionic platform is ready before attempting to get geolocation.
        // This is crucial for Cordova plugins to function correctly.
        $ionicPlatform.ready(function () {
          $cordovaGeolocation
            .getCurrentPosition(options) // Attempt to get the current position using the specified options.
            .then(
              function (position) {
                // Success callback: Geolocation was successfully obtained.
                $log.debug('Got geolocation successfully.'); // Log the success.
                defer.resolve(position); // Resolve the promise with the position data.
              },
              function (locationError) {
                // Error callback: Geolocation could not be obtained.
                $log.debug('Did not get geolocation. Error code: ' + locationError.code + ', Message: ' + locationError.message); // Log the error details.

                // Reject the promise with a structured error object,
                // including the fallback position for graceful degradation.
                defer.reject({
                  code: locationError.code,
                  message: locationError.message,
                  coords: fallbackPositionObject // Provide the fallback coordinates.
                });
              }
            )
          ;
        })
        ;

        return defer.promise; // Return the promise object.
      }
      ;

      /**
       * Converts a human-readable address string into a latitude/longitude object
       * using the Google Geocoding API.
       *
       * @param {string} strAddress The address as a string, e.g., 'Willemstad, Curaçao'.
       * @returns {Promise} A promise that resolves with an object containing latitude and longitude,
       *                    or rejects with the reason for failure.
       */
      this.addressToPosition = function (strAddress) {
        // Construct the URL for the Google Geocoding API.
        // 'sensor=false' is a legacy parameter but still widely used.
        var geocodingApiUrl = 'http://maps.googleapis.com/maps/api/geocode/json?address=' + strAddress + '&sensor=false'
        ;

        return $http
          .get(geocodingApiUrl) // Make an HTTP GET request to the Google Geocoding API.
          .then(
            function (result) {
              // Success callback: API call was successful.
              // Extract the location object from the API response.
              var location = result.data.results[0].geometry.location;

              // Transform the 'location.lat' and 'location.lng' properties
              // to 'location.latitude' and 'location.longitude' respectively.
              // This ensures compatibility with the format used by getCurrentPosition.
              return {
                latitude: location.lat,
                longitude: location.lng
              };
            },
            function (reason) {
              // Error callback: HTTP request failed or API returned an error.
              $log.error('Failed to convert address to position:', reason); // Log the error.
              return $q.reject(reason); // Reject the promise with the error reason.
            }
          )
        ;
      }
      ;

      /**
       * Returns the predefined fallback position object.
       * This can be used as a default or when no other position can be obtained.
       *
       * @returns {Object} The fallback position object with latitude, longitude, and accuracy.
       */
      this.getDefaultPosition = function () {
        return fallbackPositionObject; // Simply return the stored fallback coordinates.
      }
      ;

      return this; // Return the service instance itself.
    }
  )
;