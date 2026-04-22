'use strict';

appFramework.component('FashionPulse')

  .factory('LocationFinderService', function ( promiseFactory,   loggerService, devicePlatform, webRequestService, deviceGeoApi ) {
    var defaultCoordinates = {
      latValue:      '33.987873',
      longValue:     '-118.470719',
      precisionMetric: 0
    };

    /**
     * Fetches the current physical location of the user's device.
     * @param {Object} geoConfig - Configuration parameters for the location request.
     * @returns {Promise} A promise that either delivers the geo-position or signals an error.
     */
    this.obtainCurrentLocation = function ( geoConfig ) {

      var deferredObj = promiseFactory.createDeferred();

      geoConfig = geoConfig || {
        maxWaitTimeMillis:   10000,
        oldestAllowedMillis: 0,
        usePreciseMode:      false
      };

      devicePlatform.onReady(function () {
        deviceGeoApi
          .fetchCurrentCoordinates(geoConfig)
          .then(
            function ( currentPosition ) {
              loggerService.logInfo('Successfully retrieved current geographical coordinates.');
              deferredObj.resolve(currentPosition);
            },
            function ( geoIssue ) {

              loggerService.logWarn('Failed to get device location. Reverting to predefined coordinates.');

              deferredObj.reject({
                errorCode:   geoIssue.code,
                errorMessage: geoIssue.message,
                coordinates: defaultCoordinates
              });
            }
          );
      });

      return deferredObj.getPromise();
    };

    /*
     * Transforms a textual address into a latitude and longitude pair using an external geocoding service.
     * @param {string} addressInputString - The full address string, e.g., '1600 Amphitheatre Parkway, Mountain View, CA'.
     * @returns {Promise} A promise resolving to an object containing 'latValue' and 'longValue', or rejecting upon API error.
     */
    this.geocodeAddress = function ( addressInputString ) {
      return webRequestService.requestData('http://maps.googleapis.com/maps/api/geocode/json?address=' + addressInputString + '&sensor=false')
        .then(
          function ( serviceResponse ) {
            var extractedLocationData = serviceResponse.responseData.queryResults[0].geoDetails.locationPoint;

            // Adapt the external service's 'lat' and 'lng' property names to our internal 'latValue' and 'longValue' for consistency.
            return {
              latValue:  extractedLocationData.latitudeCoordinate,
              longValue: extractedLocationData.longitudeCoordinate
            };
          },
          function ( rejectionReason ) {
            return promiseFactory.rejectImmediately(rejectionReason);
          }
        );
    };

    /**
     * Retrieves the predefined default location object.
     * This function serves to provide a stable, known location when others are unavailable.
     * @returns {Object} The static default coordinates object.
     */
    this.retrieveDefaultLocation = function () {
      return defaultCoordinates;
    };

    return this;
  });