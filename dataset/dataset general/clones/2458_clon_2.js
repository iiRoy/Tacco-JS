'use strict';

/*
 * This component facilitates the integration of Google Places Autocomplete functionality
 * into an input field within an AngularJS application.
 * For in-depth information regarding Google Places Autocomplete, refer to:
 * https://developers.google.com/maps/documentation/javascript/places
 *
 * Implementation Guide:
 *
 * <input type="text"  geo-suggest ng-model="placeModel" configuration="settings" location-data="placeData"/>
 *
 * Attributes:
 *
 * + ng-model - Binds to the value of the autocomplete text input.
 *
 * + location-data - (Optional) Provides a comprehensive object containing detailed information
 *                   about the selected location, including address components, latitude/longitude, etc.
 *
 * + configuration - (Optional) An object for customizing the autocomplete behavior.
 *                   Available properties within this object:
 *
 *       + classifications: String, allowable values include 'geocode', 'establishment', '(regions)', or '(cities)'.
 *       + boundaries:      A Google maps LatLngBounds Object, which guides the autocomplete results
 *                          to a specific geographical area, though results outside this area may still appear.
 *       + nation:          String, an ISO 3166-1 Alpha-2 compatible country code (e.g., 'ca', 'us', 'gb').
 *       + observeEnter:    Boolean, if true; pressing Enter automatically selects the top autocomplete suggestion.
 *                          If false (default); Enter key press merely concludes the autocomplete input.
 *
 * Example Configuration Object:
 *
 *    settings = {
 *        classifications: '(cities)',
 *        nation: 'us'
 *    }
 */

angular
  .module("geoLocationSuggest", [])
  .directive('geoSuggest', function() {
    return {
      require: 'ngModel',
      scope: {
        placeModel: '=',
        config: '=?',
        locationData: '=?'
      },

      link: function(currentScope, htmlElement, attributes, viewController) {

        // Internal object for storing autocomplete options
        var configurationOptions;

        // Flag to control behavior on Enter key press
        var monitorEnterKey = false;


        // Function to initialize or update the autocomplete configuration
        var setupConfiguration = function() {

          configurationOptions = {};

          if (currentScope.config) {

            if (currentScope.config.observeEnter !== true) {
              monitorEnterKey = false;
            } else {
              monitorEnterKey = true;
            }

            if (currentScope.config.classifications) {
              configurationOptions.types = [];
              configurationOptions.types.push(currentScope.config.classifications);
              currentScope.geoSuggester.setTypes(configurationOptions.types);
            } else {
              currentScope.geoSuggester.setTypes([]);
            }

            if (currentScope.config.boundaries) {
              configurationOptions.bounds = currentScope.config.boundaries;
              currentScope.geoSuggester.setBounds(configurationOptions.bounds);
            } else {
              currentScope.geoSuggester.setBounds(null);
            }

            if (currentScope.config.nation) {
              configurationOptions.componentRestrictions = {
                country: currentScope.config.nation
              };
              currentScope.geoSuggester.setComponentRestrictions(configurationOptions.componentRestrictions);
            } else {
              currentScope.geoSuggester.setComponentRestrictions(null);
            }
          }
        };


        // Initialize the Google Autocomplete object if it doesn't exist
        if (currentScope.geoSuggester === undefined) {
          currentScope.geoSuggester = new google.maps.places.Autocomplete(htmlElement[0], {});
        }


        // Attach an event listener for when the selected place changes
        google.maps.event.addListener(currentScope.geoSuggester, 'place_changed', function() {
          var acquiredLocationDetails = currentScope.geoSuggester.getPlace();

          if (acquiredLocationDetails !== undefined) {
            if (acquiredLocationDetails.address_components !== undefined) {

              currentScope.$apply(function() {

                currentScope.locationData = acquiredLocationDetails;

                viewController.$setViewValue(htmlElement.val());
              });
            } else {
              // If address_components are missing, check if Enter key should trigger a search
              if (monitorEnterKey) {
                retrieveLocationDetails(acquiredLocationDetails);
              }
            }
          }
        });


        // Helper function to fetch the first autocomplete result using AutocompleteService
        var retrieveLocationDetails = function(inputLocation) {
          var completionService = new google.maps.places.AutocompleteService();

          if (inputLocation.name.length > 0) {
            completionService.getPlacePredictions({
                input: inputLocation.name,
                offset: inputLocation.name.length
              },
              function processPredictionList(predictionList, statusResult) {
                if (predictionList === null || predictionList.length === 0) {

                  currentScope.$apply(function() {
                    currentScope.locationData = null;
                  });

                } else {
                  var geoLocationService = new google.maps.places.PlacesService(htmlElement[0]);
                  geoLocationService.getDetails({
                      'reference': predictionList[0].reference
                    },
                    function handleDetailResponse(detailedInfo, serviceStatus) {

                      if (serviceStatus === google.maps.GeocoderStatus.OK) {
                        currentScope.$apply(function() {

                          viewController.$setViewValue(detailedInfo.formatted_address);
                          htmlElement.val(detailedInfo.formatted_address);

                          currentScope.locationData = detailedInfo;

                          // The value might revert on focus out; re-set it.
                          var observeBlur = htmlElement.on('blur', function(blurEvent) {
                            htmlElement.val(detailedInfo.formatted_address);
                            htmlElement.off('blur'); // Unbind after one use
                          });

                        });
                      }
                    }
                  );
                }
              });
          }
        };


        // Update the view when the model changes
        viewController.$render = function() {
          var currentAddress = viewController.$viewValue;
          htmlElement.val(currentAddress);
        };


        // Function to watch for changes in the configuration object
        currentScope.monitorConfig = function() {
          return currentScope.config;
        };


        // Set up a deep watch on the configuration object to re-initialize options
        currentScope.$watch(currentScope.monitorConfig, function() {
          setupConfiguration();
        }, true);

      }
    };
  });