'use strict';

/*
 * This Angular.js directive integrates Google Places Autocomplete functionality into a text input field.
 * For more details on Google Places Autocomplete, refer to: https://developers.google.com/maps/documentation/javascript/places
 *
 * Example usage in an HTML template:
 *
 * <input type="text"  ng-autocomplete ng-model="autocomplete" options="myOptionsObject" details="placeDetailsObject"/>
 *
 * Directive attributes:
 *
 * + ng-model: Binds to the value of the autocomplete text box. This is typically the selected place's name or address.
 *
 * + details: (Optional) An object that will be populated with the comprehensive details of the selected place,
 *            including address components, latitude/longitude, etc.
 *
 * + options: (Optional) An object containing configuration parameters for the autocomplete service.
 *            Available options include:
 *
 *       + types:         String. Specifies the type of place predictions to return. Valid values are 'geocode',
 *                        'establishment', '(regions)', or '(cities)'. For example, '(cities)' restricts results to cities.
 *       + bounds:        Google maps LatLngBounds Object. Biases the results towards a specific geographical area,
 *                        though results outside these bounds may still be returned.
 *       + country:       String. An ISO 3166-1 Alpha-2 compatible country code. E.g., 'ca' for Canada, 'us' for United States, 'gb' for Great Britain.
 *       + watchEnter:    Boolean. If true, pressing Enter will automatically select the top autocomplete result.
 *                        If false (default), Enter key press will simply end the autocomplete process without selection.
 *
 * Example options object:
 *
 *    var myOptionsObject = {
 *        types: '(cities)',  // Restrict results to cities only
 *        country: 'ca'       // Limit results to Canada
 *    };
 *
 */

angular.module( "ngAutocomplete", [] )
    .directive( 'ngAutocomplete', function() {

        // The directive definition object
        return {
            require: 'ngModel', // Requires ngModel controller for data binding
            scope: {            // Isolate scope for the directive
                ngModel: '=',   // Two-way data binding for the input value
                options: '=?',  // Optional two-way data binding for autocomplete options
                details: '=?'   // Optional two-way data binding for place details
            },

            // The link function is executed once the template has been cloned and is ready.
            link: function( scope, element, attrs, controller ) {

                // Private variables for managing autocomplete state
                var opts;           // Stores the processed options for Google Places Autocomplete
                var watchEnter = false; // Flag to determine behavior on Enter key press


                /**
                 * Initializes or updates the Google Places Autocomplete options.
                 * This function processes the `scope.options` and applies them to the `scope.gPlace` instance.
                 */
                var initOpts = function() {
                    // Reset options object
                    opts = {};

                    // Check if custom options were provided
                    if ( scope.options ) {

                        // Determine the watchEnter behavior
                        if ( scope.options.watchEnter !== true ) {
                            watchEnter = false; // Default behavior: Enter ends autocomplete
                        } else {
                            watchEnter = true;  // Custom behavior: Enter selects top result
                        }

                        // Set place types if provided
                        if ( scope.options.types ) {
                            opts.types = [];
                            opts.types.push( scope.options.types );
                            scope.gPlace.setTypes( opts.types );
                        } else {
                            // If no types specified, clear any previous type restrictions
                            scope.gPlace.setTypes( [] );
                        }

                        // Set geographic bounds if provided
                        if ( scope.options.bounds ) {
                            opts.bounds = scope.options.bounds;
                            scope.gPlace.setBounds( opts.bounds );
                        } else {
                            // If no bounds specified, clear any previous bound restrictions
                            scope.gPlace.setBounds( null );
                        }

                        // Set country restrictions if provided
                        if ( scope.options.country ) {
                            opts.componentRestrictions = {
                                country: scope.options.country
                            };
                            scope.gPlace.setComponentRestrictions( opts.componentRestrictions );
                        } else {
                            // If no country specified, clear any previous country restrictions
                            scope.gPlace.setComponentRestrictions( null );
                        }
                    }
                }; // End of initOpts function


                // Initialize Google Places Autocomplete instance if not already present
                if ( scope.gPlace == undefined ) {
                    // Create a new Autocomplete object, binding it to the input element
                    // The second argument is an options object, initially empty
                    scope.gPlace = new google.maps.places.Autocomplete( element[0], {} );
                }


                // Add an event listener for the 'place_changed' event on the autocomplete instance
                google.maps.event.addListener( scope.gPlace, 'place_changed', function() {
                    // Retrieve the selected place's details
                    var result = scope.gPlace.getPlace();

                    // Check if a valid place was selected
                    if ( result !== undefined ) {
                        // If the result has address components, it's a complete place selection
                        if ( result.address_components !== undefined ) {

                            // Apply changes within Angular's digest cycle
                            scope.$apply( function() {
                                // Update the 'details' model with the full place object
                                scope.details = result;
                                // Update the ngModel with the value from the input element
                                controller.$setViewValue( element.val() );
                            } );
                        }
                        // If result has no address components, it means the user typed something but didn't explicitly select from dropdown
                        else {
                            // If 'watchEnter' is true, try to get the first result based on the typed text
                            if ( watchEnter ) {
                                getPlace( result );
                            }
                        }
                    }
                } ); // End of addListener


                /**
                 * Function to retrieve the first autocomplete result using the AutocompleteService
                 * when 'watchEnter' is enabled and a direct place selection didn't occur.
                 *
                 * @param {Object} result - The partial place object from the autocomplete input.
                 */
                var getPlace = function( result ) {
                    // Initialize the AutocompleteService
                    var autocompleteService = new google.maps.places.AutocompleteService();

                    // Only proceed if the input text has content
                    if ( result.name.length > 0 ) {
                        // Request place predictions based on the input text
                        autocompleteService.getPlacePredictions(
                            {
                                input: result.name,
                                offset: result.name.length
                            },
                            function listentoresult( list, status ) {
                                // If no predictions or an empty list is returned
                                if ( list == null || list.length == 0 ) {

                                    // Update scope to clear details
                                    scope.$apply( function() {
                                        scope.details = null;
                                    } );

                                }
                                // If predictions are found
                                else {
                                    // Initialize the PlacesService to get detailed information
                                    var placesService = new google.maps.places.PlacesService( element[0] );
                                    placesService.getDetails(
                                        { 'reference': list[0].reference }, // Use the reference of the first prediction
                                        function detailsresult( detailsResult, placesServiceStatus ) {

                                            // Check if the details request was successful
                                            if ( placesServiceStatus == google.maps.GeocoderStatus.OK ) {
                                                // Apply changes within Angular's digest cycle
                                                scope.$apply( function() {

                                                    // Update ngModel with the formatted address
                                                    controller.$setViewValue( detailsResult.formatted_address );
                                                    // Update the input element's value
                                                    element.val( detailsResult.formatted_address );

                                                    // Populate the 'details' model with the full place details
                                                    scope.details = detailsResult;

                                                    // On focusout, the input value might revert.
                                                    // This ensures the selected formatted address is retained.
                                                    var watchFocusOut = element.on( 'focusout', function( event ) {
                                                        element.val( detailsResult.formatted_address );
                                                        element.unbind( 'focusout' ); // Remove the event listener after one use
                                                    } );

                                                } ); // End of scope.$apply
                                            }
                                        }
                                    ); // End of getDetails
                                }
                            }
                        ); // End of getPlacePredictions
                    }
                }; // End of getPlace function


                // Custom render function for ngModel
                controller.$render = function() {
                    var location = controller.$viewValue; // Get the current view value from ngModel
                    element.val( location ); // Set the input element's value
                };


                /**
                 * Helper function to return the options object for watching.
                 * @returns {Object} The options object from the scope.
                 */
                scope.watchOptions = function() {
                    return scope.options;
                };

                // Watch the 'options' object for deep changes (third argument 'true')
                // and re-initialize autocomplete options if it changes
                scope.$watch( scope.watchOptions, function() {
                    initOpts(); // Re-run initialization when options change
                }, true ); // Deep watch for object changes


            } // End of link function
        }; // End of directive return object
    } ); // End of directive definition