'use strict';

// This Angular module provides a directive for integrating Google Places Autocomplete
// functionality directly into text input fields. It enhances user experience
// by offering location suggestions and retrieving comprehensive place data.
//
// INSTRUCTIONAL USAGE:
//
// To enable the autocomplete feature on an input element:
//
// <input type="text"
//        google-place-input
//        ng-model="yourAddressModel"
//        config-settings="autocompleteConfiguration"
//        result-data="placeDetailsObject"/>
//
// DIRECTIVE ATTRIBUTES:
//
// + ng-model:          (Required) The primary data model to bind the input field's string value.
//                      This will typically hold the formatted address of the selected place.
//
// + result-data:       (Optional) An object that will be populated with the full Google Place
//                      result, including address components, geographical coordinates, and other
//                      detailed information about the selected location.
//
// + config-settings:   (Optional) An object used to customize the behavior and filtering
//                      of the Google Places Autocomplete service.
//
//   PROPERTIES FOR 'config-settings':
//   - types:          String or Array of Strings. Examples: 'geocode', 'establishment',
//                     '(regions)', or '(cities)'. Filters prediction results.
//   - bounds:         A google.maps.LatLngBounds object. Biases results towards a specific
//                     geographical area, though results outside these bounds may still appear.
//   - country:        String, an ISO 3166-1 Alpha-2 compatible country code (e.g., 'US', 'CA', 'GB').
//                     Restricts results to a particular country.
//   - confirmOnEnter: Boolean. If true, pressing the Enter key will automatically select
//                     the first item in the autocomplete prediction list. If false (default),
//                     Enter will simply dismiss the prediction list without selection.
//
// EXAMPLE 'config-settings' OBJECT:
//
//    autocompleteConfiguration = {
//        types: ['(cities)'],
//        country: 'GB',
//        confirmOnEnter: true
//    }

angular.module("locationInputModule", [])
  .directive('googlePlaceInput', function() {
    return {
      restrict: 'A', // This directive is intended for use as an attribute.
      require: 'ngModel', // Requires ng-model for data binding.
      scope: {
        inputVal: '=',        // Binds to the input's text value.
        configSettings: '=?', // Optional configuration object.
        resultData: '=?'      // Optional object to store detailed place information.
      },

      link: function(dirScope, inputElement, dirAttrs, modelCtrl) {

        // --- Prerequisite Check: Ensure Google Maps Places API is available ---
        if (typeof google === 'undefined' || !google.maps || !google.maps.places) {
          console.error("Google Maps Places API is not loaded. The 'googlePlaceInput' directive cannot function.");
          return;
        }

        const G_PLACES_SERVICE = google.maps.places;
        let activeAutocompleteOptions = {};
        let autoConfirmFirstEntry = false;
        let autocompleteEngine; // The Google Autocomplete instance

        // A utility function to ensure scope updates are applied correctly within Angular's digest cycle.
        const safeScopeUpdate = (operationFn) => {
          if (!dirScope.$$phase) {
            dirScope.$apply(operationFn);
          } else {
            operationFn();
          }
        };

        // Sets up the Google Autocomplete service with the provided configuration.
        const initializeAutocompleteConfiguration = function() {
          activeAutocompleteOptions = {}; // Clear previous options
          const currentDirectiveConfig = dirScope.configSettings;

          // Determine 'Enter' key behavior
          autoConfirmFirstEntry = (currentDirectiveConfig && currentDirectiveConfig.confirmOnEnter === true);

          if (currentDirectiveConfig) {
            // Configure 'types' filter
            if (currentDirectiveConfig.types) {
              const typesArray = Array.isArray(currentDirectiveConfig.types) ? currentDirectiveConfig.types : [currentDirectiveConfig.types];
              activeAutocompleteOptions.types = typesArray;
              autocompleteEngine?.setTypes(typesArray);
            } else {
              autocompleteEngine?.setTypes([]); // Clear types if not specified
            }

            // Configure 'bounds' bias
            if (currentDirectiveConfig.bounds) {
              activeAutocompleteOptions.bounds = currentDirectiveConfig.bounds;
              autocompleteEngine?.setBounds(currentDirectiveConfig.bounds);
            } else {
              autocompleteEngine?.setBounds(null); // Clear bounds
            }

            // Configure 'country' restriction
            if (currentDirectiveConfig.country) {
              activeAutocompleteOptions.componentRestrictions = {
                country: currentDirectiveConfig.country
              };
              autocompleteEngine?.setComponentRestrictions(activeAutocompleteOptions.componentRestrictions);
            } else {
              autocompleteEngine?.setComponentRestrictions(null); // Clear country restriction
            }
          } else {
            // If no config is provided, ensure all filters/restrictions are reset.
            if (autocompleteEngine) {
              autocompleteEngine.setTypes([]);
              autocompleteEngine.setBounds(null);
              autocompleteEngine.setComponentRestrictions(null);
            }
          }
        };

        // Create the Google Autocomplete instance, attaching it to the input element.
        // Initial options are empty as they will be configured by initializeAutocompleteConfiguration.
        autocompleteEngine = new G_PLACES_SERVICE.Autocomplete(inputElement[0], {});

        // Attach an event listener for when the user selects a place from the suggestions.
        google.maps.event.addListener(autocompleteEngine, 'place_changed', function() {
          const selectedPlaceResult = autocompleteEngine.getPlace();

          if (selectedPlaceResult && selectedPlaceResult.address_components) {
            // A specific place was chosen from the dropdown list.
            safeScopeUpdate(() => {
              dirScope.resultData = selectedPlaceResult;
              modelCtrl.$setViewValue(inputElement.val()); // Update ng-model with the input's current value.
            });
          } else if (autoConfirmFirstEntry && selectedPlaceResult && selectedPlaceResult.name) {
            // User pressed Enter without explicit selection, and auto-confirm is enabled.
            // We'll attempt to fetch details for the top prediction.
            fetchTopPredictionDetails(selectedPlaceResult);
          } else {
            // No specific place selected, or 'Enter' was pressed without auto-confirm.
            safeScopeUpdate(() => {
              dirScope.resultData = null; // Clear any previous detailed result.
            });
          }
        });

        // Helper function to resolve the full details of the first autocomplete prediction,
        // typically used when 'Enter' is pressed without a direct selection.
        const fetchTopPredictionDetails = function(initialPrediction) {
          const predictionQueryService = new G_PLACES_SERVICE.AutocompleteService();

          if (!initialPrediction || !initialPrediction.name || initialPrediction.name.trim().length === 0) {
            safeScopeUpdate(() => {
              dirScope.resultData = null;
            });
            return; // Exit if no valid prediction name is available.
          }

          predictionQueryService.getPlacePredictions({
              input: initialPrediction.name,
              offset: initialPrediction.name.length
            },
            function handlePredictionResponse(predictionList, queryStatus) {
              if (queryStatus !== G_PLACES_SERVICE.PlacesServiceStatus.OK || !predictionList || predictionList.length === 0) {
                console.warn("No valid predictions found or query failed:", queryStatus);
                safeScopeUpdate(() => {
                  dirScope.resultData = null;
                });
                return;
              }

              const placeDetailService = new G_PLACES_SERVICE.PlacesService(inputElement[0]);
              placeDetailService.getDetails({
                  'reference': predictionList[0].reference
                },
                function handleDetailResponse(completeDetails, detailStatus) {
                  if (detailStatus === G_PLACES_SERVICE.PlacesServiceStatus.OK) {
                    safeScopeUpdate(() => {
                      const displayAddress = completeDetails.formatted_address || completeDetails.name || '';
                      modelCtrl.$setViewValue(displayAddress);
                      inputElement.val(displayAddress);
                      dirScope.resultData = completeDetails;

                      // Re-apply the value on focusout to prevent browser autofill/revert issues.
                      const onFocusOutReapply = () => {
                        inputElement.val(displayAddress);
                        inputElement.off('focusout', onFocusOutReapply); // Remove listener after first use.
                      };
                      inputElement.on('focusout', onFocusOutReapply);
                    });
                  } else {
                    console.error("Failed to fetch detailed place information:", detailStatus);
                    safeScopeUpdate(() => {
                      dirScope.resultData = null;
                    });
                  }
                }
              );
            });
        };

        // Overrides the default $render method to update the input element's value
        // when the ng-model value changes programmatically.
        modelCtrl.$render = function() {
          const currentModelValue = modelCtrl.$viewValue;
          inputElement.val(currentModelValue || ''); // Ensure empty string for null/undefined.
        };

        // Set up a deep watch on the 'configSettings' object.
        // This ensures that any changes to the configuration (e.g., types, country)
        // are immediately reflected in the autocomplete behavior.
        dirScope.$watch('configSettings', function(newConfig, oldConfig) {
          // Only reconfigure if the object itself or its properties have changed.
          if (newConfig !== oldConfig) {
            initializeAutocompleteConfiguration();
          }
        }, true); // The 'true' enables deep watching of object properties.

        // Perform initial configuration when the directive links.
        initializeAutocompleteConfiguration();
      }
    };
  });