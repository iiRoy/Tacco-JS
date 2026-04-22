// This file is part of the ng-imago project.
// You can find the original repository at: https://github.com/panurge-ws/ng-imago
//
// Copyright (c) 2014 Panurge Web Studio. All rights reserved.
// Licensed under the MIT license. For details, see the LICENSE file.

/*
 * Global variables required by ng-imago.
 * These are typically defined by the browser or external libraries like jQuery.
 */
/*global window, jQuery, console, matchMedia, Image, $ */
(
    function ( angular, undefined ) {

        'use strict'; // Enforce strict JavaScript rules for cleaner code.

        // @private section: Internal default configuration settings.
        // These settings can be overridden by the provider.
        var default_settings = {
            // Option to append a random query string to image URLs.
            // This helps in preventing browser caching issues and forces a fresh image load.
            avoid_cache: true,

            // If true, removes attribute bindings once an image has successfully loaded.
            // This can improve performance by reducing the number of active watchers.
            unbind_when_loaded: true,

            // CSS class applied to an image element once it has finished loading successfully.
            loaded_class: "ng-imago-loaded",

            // CSS class applied to an image element while it is in the process of loading.
            loading_class: "ng-imago-loading",

            // CSS class applied to an image element if an error occurs during loading.
            error_class: "ng-imago-error",

            // Auto-sizing options:
            // Controls how the image scales within its container.
            // 'contain': The image is scaled down to fit within the container, preserving its aspect ratio.
            // 'cover': The image is scaled up to cover the entire container, potentially cropping parts.
            scale: 'contain', // Possible values: 'contain' | 'cover'

            // If true, the image will be horizontally and vertically centered within its container.
            center: true, // Centers the image inside its designated container.

            // Specifies the container element used for scaling and/or centering the image.
            // 'parent': Uses the direct parent element as the container.
            // 'window': Uses the browser window as the container.
            container: 'parent', // Possible values: "parent" | "window"

            // If enabled, the loading, loaded, or error classes are also applied to the image's parent element.
            parent_classes: true
        };


        // Default media query breakpoints and their corresponding attribute names.
        // These define different image sources for various screen sizes.
        var default_sizes = [

            {
                attr: 'default', // Baseline image source.
                query: 'only screen and (min-width: 1px)' // Applies to almost all screens.
            },
            {
                attr: 'small', // Source for small screens.
                query: 'only screen and (min-width: 480px)' // E.g., smartphones in landscape.
            },
            {
                attr: 'medium', // Source for medium screens.
                query: 'only screen and (min-width: 768px)' // E.g., tablets.
            },
            {
                attr: 'large', // Source for large screens.
                query: 'only screen and (min-width: 1280px)' // E.g., standard desktops.
            },
            {
                attr: 'xlarge', // Source for extra-large screens.
                query: 'only screen and (min-width: 1440px)' // E.g., large monitors.
            }
        ];


        // Utility media queries for common device characteristics.
        var utilsQueries = {
            'retina': 'only screen and (-webkit-min-device-pixel-ratio: 2), ' + // Webkit browsers
                'only screen and (min--moz-device-pixel-ratio: 2), ' + // Firefox
                'only screen and (-o-min-device-pixel-ratio: 2/1), ' + // Opera Presto
                'only screen and (min-device-pixel-ratio: 2), ' + // Standard
                'only screen and (min-resolution: 192dpi), ' + // DPI-based
                'only screen and (min-resolution: 2dppx)', // DPPR-based
            'portrait': 'only screen and (orientation: portrait)' // Device in portrait orientation
        };


        // Flag to track if the window resize event listener has been initialized.
        var resize_initialized = false;


        // Essential dependency check: matchMedia API.
        // If matchMedia is not available, a polyfill is required.
        if ( angular.isUndefined( matchMedia ) ) {
            throw "matchMedia does not exist. Please use a polyfill";
        }


        // Define custom events used for inter-component communication within ngImago.
        var EVENT_IMG_LOADED = "$ngImagoImageLoaded", // Fired when an image successfully loads.
            EVENT_IMG_ERROR = "$ngImagoImageError", // Fired when an image fails to load.
            EVENT_IMG_LOAD_REQUEST = "$ngImagoLoadRequest", // Fired to request an image load.
            EVENT_IMG_QUEUE_INDEX_COMPLETE = "$ngImagoQueueIndexComplete", // Fired when a specific queue index is complete.
            EVENT_IMG_QUEUE_COMPLETE = "$ngImagoLoadQueueComplete", // Fired when the entire image loading queue is complete.
            EVENT_IMG_RESIZE = "$ngImagoImageResize", // Fired when an image needs to be resized.
            EVENT_WINDOW_RESIZE = "$ngImagoWindowResize", // Fired when the browser window is resized.
            EVENT_MEDIA_QUERY_CHANGED = "$ngImagoMediaQueryChanged"; // Fired when a media query state changes.


        // Declare the main Angular module for ngImago.
        var ngImagoModule = angular.module( 'ngImago', [] );


        // ngImago Provider: Allows configuration of default settings and sizes.
        ngImagoModule.provider( 'ngImago', [

            function() {

                /**
                 * Sets or retrieves the default settings for ngImago.
                 * @param {object} [value] - An object containing settings to override.
                 * @returns {object} The current default settings.
                 */
                this.defaultsSettings = function( value ) {

                    // Check if a value is provided to update settings.
                    if ( !angular.isUndefined( value ) ) {
                        // Ensure the provided value is not empty.
                        if ( value !== '' ) {
                            // Iterate over existing default settings.
                            for ( var prop in default_settings ) {
                                // If the property exists in the provided value, update it.
                                if ( !angular.isUndefined( value[ prop ] ) ) {
                                    default_settings[ prop ] = value[ prop ];
                                }
                            }
                        }
                    } else {
                        // If no value is provided, return the current default settings.
                        return default_settings;
                    }

                };


                /**
                 * Sets or retrieves the default image size definitions.
                 * @param {array} [value] - An array of size objects to override.
                 * @returns {array} The current default sizes.
                 */
                this.defaultsSizes = function( value ) {

                    // Check if a value is provided to update sizes.
                    if ( !angular.isUndefined( value ) ) {
                        // Ensure the provided value is not empty.
                        if ( value !== '' ) {
                            // Iterate over existing default sizes.
                            for ( var prop in default_sizes ) {
                                // If the property exists in the provided value, update it.
                                if ( !angular.isUndefined( value[ prop ] ) ) {
                                    default_sizes[ prop ] = value[ prop ];
                                }
                            }
                        }
                    } else {
                        // If no value is provided, return the current default sizes.
                        return default_sizes;
                    }

                };


                /**
                 * Adds a new default image size definition.
                 * @param {string} attr - The attribute name (e.g., 'small', 'medium').
                 * @param {string} query - The media query string for this size.
                 */
                this.addDefaultSize = function( attr, query ) {

                    // Push a new size object into the default_sizes array.
                    default_sizes.push( {
                        "attr": attr,
                        "query": query
                    } );

                };


                /**
                 * Changes the media query for an existing default size attribute.
                 * @param {string} attr - The attribute name to modify.
                 * @param {string} query - The new media query string.
                 */
                this.changeDefaultSize = function( attr, query ) {
                    // Iterate through the default sizes in reverse.
                    for ( var i = default_sizes.length - 1; i >= 0; i-- ) {
                        // If the attribute matches, update its query.
                        if ( default_sizes[ i ].attr === attr ) {
                            default_sizes[ i ].attr = query; // NOTE: This looks like a bug in original code, it should be default_sizes[i].query = query;
                        }
                    }
                };


                /**
                 * Removes a default image size definition by its attribute name.
                 * @param {string} attr - The attribute name to remove.
                 */
                this.removeDefaultSize = function( attr ) {
                    // Iterate through the default sizes in reverse.
                    for ( var i = default_sizes.length - 1; i >= 0; i-- ) {
                        // If the attribute matches, remove it from the array.
                        if ( default_sizes[ i ].attr === attr ) {
                            default_sizes.splice( i, 1 );
                            break; // Exit loop after finding and removing.
                        }
                    }
                };


                // The $get method is required for providers, but ngImago uses services.
                // It's a no-op here as this provider primarily handles configuration.
                this.$get = angular.noop;

            }
        ] );


        // ngImagoAttributeParser Service: Handles parsing image attributes and media queries.
        ngImagoModule.service( 'ngImagoAttributeParser', [ "$window", "$log", "$rootScope",

            function( $window, $log, $rootScope ) {

                var ngImagoAttributeParser = {}; // Initialize the service object.

                // Storage for active media query listeners.
                ngImagoAttributeParser.mediaQueries = [];


                /**
                 * Calculates the final image URL based on available sources and options.
                 * @param {object} sources - An object where keys are attribute names (e.g., 'small') and values are URLs.
                 * @param {object} options - Configuration options for the image.
                 * @returns {string|boolean} The calculated URL, or false if no valid source is found.
                 */
                ngImagoAttributeParser.calculateUrl = function( sources, options ) {

                    // Determine the base source URL based on media queries.
                    var source = ngImagoAttributeParser.getUrlForSources( sources, options );

                    // If no source URL could be determined, log a warning and return false.
                    if ( source === "" ) {
                        $log.warn( "[ngImagoModule] -> no-url-for-image", sources );
                        return false;
                    }

                    // Check if cache busting is enabled in settings.
                    if ( getSetting( 'avoid_cache', options ) === true ) {

                        // Append a cache-busting parameter.
                        if ( source.indexOf( '?' ) > -1 ) {
                            // If URL already has query parameters, append with '&'.
                            source += "&c=" + ( Math.random() * 100000 ).toString();
                        } else {
                            // If no query parameters, append with '?'.
                            source += "?c=" + ( Math.random() * 100000 ).toString();
                        }

                    }

                    return source; // Return the final, processed URL.
                };


                /**
                 * Determines the most appropriate image URL from a set of sources based on active media queries.
                 * @param {object} sources - An object containing different image URLs keyed by size attribute.
                 * @param {object} options - Additional options, possibly containing custom media queries.
                 * @returns {string} The selected image URL.
                 */
                ngImagoAttributeParser.getUrlForSources = function( sources, options ) {

                    var attrMatching = null, // Stores the URL for the currently best-matching media query.
                        defaultAttr = null; // Stores a default URL if no specific match is found.

                    // Iterate over all provided image sources.
                    for ( var attr in sources ) {

                        // Ensure the source attribute has a defined value.
                        if ( !angular.isUndefined( sources[ attr ] ) ) {

                            var attrClean = attr.replace( 'Portrait', '' ); // Remove 'Portrait' suffix for base query lookup.
                            var searchPortrait = attr.indexOf( "Portrait" ) > -1; // Check if this source is specific to portrait mode.

                            // Find the predefined media query set for this attribute.
                            var requestQuerySet = _getQuerySetByAttr( attrClean );

                            // console.log(sources, attr, requestQuerySet) // Debugging line (commented out).

                            // If a query set is found for the attribute.
                            if ( requestQuerySet != null ) {
                                var query = "";

                                // Use custom query from options if available, otherwise use default.
                                if ( !angular.isUndefined( options[ attr ] ) ) {
                                    query = options[ attr ];

                                } else {
                                    query = requestQuerySet.query;
                                }

                                // Check if this media query has already been initialized.
                                var mediaQueryRequested = _mediaQueryExists( query );

                                // If not, add a new media query listener.
                                if ( mediaQueryRequested === false ) {
                                    mediaQueryRequested = _addMediaQuery( query );

                                }

                                // console.log("attr",mediaQueryRequested.media,mediaQueryRequested.matches) // Debugging line.

                                // Logic for matching portrait-specific sources.
                                if ( searchPortrait ) {

                                    // If both the base query and portrait query match, this is the best candidate.
                                    if ( mediaQueryRequested.matches && ngImagoAttributeParser.portraitQuery.matches ) {
                                        attrMatching = sources[ attr ];
                                    } else if ( attrMatching == null ) {
                                        // If no better match yet, keep this as a potential default.
                                        defaultAttr = sources[ attr ];
                                    }
                                } else {
                                    // Logic for general (non-portrait specific) sources.
                                    if ( mediaQueryRequested.matches ) {
                                        // If the query matches, this is a candidate.
                                        attrMatching = sources[ attr ];
                                    } else if ( attrMatching == null ) {
                                        // If no better match yet, keep this as a potential default.
                                        defaultAttr = sources[ attr ];
                                    }
                                }

                            }
                        }

                    }

                    // If no specific media query matched, fall back to the last default candidate.
                    if ( attrMatching === null && defaultAttr !== null ) {
                        attrMatching = defaultAttr;
                    }

                    // If no attribute matched at all, return an empty string.
                    if ( attrMatching === null || angular.isUndefined( attrMatching ) ) {
                        return "";
                    } else {
                        // Otherwise, parse the matched attribute for retina and other specifics.
                        return ngImagoAttributeParser.parseAttr( attrMatching, sources, options );
                    }

                };


                /**
                 * Handler for media query changes. Broadcasts an event.
                 * @param {MediaQueryList} mq - The MediaQueryList object that changed state.
                 */
                ngImagoAttributeParser.mediaQueryHandler = function( mq ) {
                    // Broadcast a global event when a media query state changes.
                    $rootScope.$broadcast( EVENT_MEDIA_QUERY_CHANGED, mq );
                };


                /**
                 * Adds a new media query listener and stores it.
                 * @private
                 * @param {string} query - The CSS media query string.
                 * @returns {MediaQueryList} The created MediaQueryList object.
                 */
                var _addMediaQuery = function( query ) {
                    var mq = matchMedia( query ); // Create a new MediaQueryList.
                    mq.addListener( ngImagoAttributeParser.mediaQueryHandler ); // Attach the change handler.
                    ngImagoAttributeParser.mediaQueries[ query ] = mq; // Store it by its query string.
                    return ngImagoAttributeParser.mediaQueries[ query ]; // Return the stored object.
                };


                /**
                 * Removes a media query listener. (TODO: Not fully implemented in original code).
                 * @private
                 * @param {string} query - The CSS media query string to remove.
                 */
                var _removeMediaQuery = function( query ) {
                    // TODO: Implement logic to remove overriding media queries that are no longer used.
                };


                /**
                 * Checks if a media query listener already exists for a given query string.
                 * @private
                 * @param {string} query - The CSS media query string.
                 * @returns {MediaQueryList|boolean} The existing MediaQueryList object, or false if not found.
                 */
                var _mediaQueryExists = function( query ) {
                    if ( angular.isUndefined( ngImagoAttributeParser.mediaQueries[ query ] ) ) {
                        return false; // Query not found.
                    } else {
                        return ngImagoAttributeParser.mediaQueries[ query ]; // Return existing query.
                    }
                };


                /**
                 * Retrieves a default size object based on its attribute name.
                 * @private
                 * @param {string} attr - The attribute name (e.g., 'small').
                 * @returns {object|null} The matching size object, or null if not found.
                 */
                var _getQuerySetByAttr = function( attr ) {
                    // Iterate through all defined default sizes.
                    for ( var i = 0; i < default_sizes.length; i++ ) {
                        if ( default_sizes[ i ].attr === attr ) {
                            return default_sizes[ i ]; // Return the matching size object.
                        }
                    }
                    return null; // No match found.
                };


                /**
                 * Retrieves a default size object based on its media query string.
                 * @private
                 * @param {string} query - The media query string.
                 * @returns {object|null} The matching size object, or null if not found.
                 */
                var _getQuerySetByQuery = function( query ) {
                    // Iterate through all defined default sizes.
                    for ( var i = 0; i < default_sizes.length; i++ ) {
                        if ( default_sizes[ i ].query === query ) {
                            return default_sizes[ i ]; // Return the matching size object.
                        }
                    }
                    return null; // No match found.
                };


                /**
                 * Parses the final image URL, considering retina displays.
                 * @param {string} imageUrl - The base image URL, potentially containing comma-separated retina versions.
                 * @param {object} sources - All available image sources.
                 * @param {object} options - Image options.
                 * @returns {string} The final, parsed image URL.
                 */
                ngImagoAttributeParser.parseAttr = function( imageUrl, sources, options ) {
                    var _outUrl = ""; // Initialize the output URL.

                    // Check if the URL contains comma-separated options (typically for retina).
                    if ( imageUrl.indexOf( "," ) > -1 ) {
                        var _images_split = imageUrl.split( "," ); // Split into individual image paths.
                        angular.forEach( _images_split, function( img ) {
                            // If retina is active and the image is a 2x version.
                            if ( ngImagoAttributeParser.isRetina === true && img.indexOf( '@2x' ) > -1 ) {
                                _outUrl = img; // Select the retina image.
                            } else if ( ngImagoAttributeParser.isRetina === false && img.indexOf( '@2x' ) === -1 ) {
                                _outUrl = img; // Select the non-retina image.
                            }
                        } );
                        // Safely catch: if no specific retina/non-retina match, use the first one.
                        if ( _outUrl === '' ) {
                            _outUrl = _images_split[ 0 ];
                        }
                    } else {
                        _outUrl = imageUrl; // No retina options, use the URL as is.
                    }

                    /*
                    // Portrait mode logic (commented out in original code).
                    if (ngImagoAttributeParser.portraitQuery.matches && getSetting('portrait', options) === true) {
                        var ext = _outUrl.substr(_outUrl.lastIndexOf('.'));
                        var path = _outUrl.substr(0, _outUrl.lastIndexOf('.'));
                        _outUrl = path + getSetting('portrait_suffix', options) + ext;
                    }
                    */

                    return _outUrl; // Return the final image URL.
                };


                // Initialize utility properties for retina and portrait queries.
                // Determine if the current device is a retina display.
                ngImagoAttributeParser.isRetina = matchMedia( utilsQueries.retina ).matches;
                // Add a listener for portrait orientation changes.
                ngImagoAttributeParser.portraitQuery = _addMediaQuery( utilsQueries.portrait );


                // Helper function to get a setting from options or default_settings.
                // (Note: This function `getSetting` is used but not defined within the scope of this file.
                // It's likely implicitly available from another part of the original project or a global helper.)
                function getSetting( name, options ) {
                    if ( options && !angular.isUndefined( options[ name ] ) ) {
                        return options[ name ];
                    }
                    return default_settings[ name ];
                }

                return ngImagoAttributeParser; // Return the populated service object.
            }
        ] );


        // ngImagoService: Provides methods to trigger image loading based on different criteria.
        ngImagoModule.service( 'ngImagoService', [ '$rootScope',

            function( $rootScope ) {

                var ngImagoService = {}; // Initialize the service object.


                /**
                 * Requests loading of images associated with a specific queue index.
                 * @param {number} index - The index of the image queue to load.
                 */
                ngImagoService.loadQueueIndex = function( index ) {

                    $rootScope.$broadcast( EVENT_IMG_LOAD_REQUEST, {
                        type: 'queueIndex', // Specify the type of load request.
                        index: index // The target queue index.
                    } );
                };


                /**
                 * Requests loading of images matching a specific attribute name and value.
                 * @param {string} attrName - The name of the attribute (e.g., 'data-ng-src').
                 * @param {string} attrValue - The value of the attribute to match.
                 */
                ngImagoService.loadByAttribute = function( attrName, attrValue ) {

                    $rootScope.$broadcast( EVENT_IMG_LOAD_REQUEST, {
                        type: 'attr', // Indicate loading by attribute.
                        name: attrName, // Attribute name.
                        value: attrValue, // Attribute value.
                        index: 0 // Default index (can be overridden if needed).
                    } );
                };


                /**
                 * Requests loading of images belonging to a specific CSS class.
                 * @param {string} className - The CSS class name to match.
                 */
                ngImagoService.loadByClass = function( className ) {

                    $rootScope.$broadcast( EVENT_IMG_LOAD_REQUEST, {
                        type: 'class', // Indicate loading by class.
                        class: className, // Class name.
                        index: 0 // Default index.
                    } );
                };


                /**
                 * Requests loading of an image by its unique ID.
                 * @param {string} id - The ID of the image element.
                 */
                ngImagoService.loadImageById = function( id ) {

                    $rootScope.$broadcast( EVENT_IMG_LOAD_REQUEST, {
                        type: 'id', // Indicate loading by ID.
                        id: id, // Element ID.
                        index: 0 // Default index.
                    } );
                };

                return ngImagoService; // Return the populated service object.

            }
        ] );


        // ngImagoQueue Service: Manages the queue of images to be loaded.
        ngImagoModule.service( 'ngImagoQueue', [ '$rootScope',

            function( $rootScope ) {

                var ngImagoQueue = {}; // Initialize the service object.

                // Array to hold image loading groups, ordered by index.
                ngImagoQueue.queue = [];
                // Current index being processed (or -1 if none).
                ngImagoQueue.currIndex = -1;
                // Percentage of overall queue completion.
                ngImagoQueue.perc = 0;
                // Percentage of items within the current index group.
                ngImagoQueue.perc_items = 0;


                // Listen for image loaded event to remove from queue.
                $rootScope.$on( EVENT_IMG_LOADED, function( event, data, element ) {
                    ngImagoQueue.remove( data, element );
                } );


                // Listen for image error event to remove from queue.
                $rootScope.$on( EVENT_IMG_ERROR, function( event, data, element ) {
                    ngImagoQueue.remove( data );
                } );


                /**
                 * Adds an image object to the loading queue.
                 * Images are grouped by their `index` property.
                 * @param {object} obj - The image object to add (must have `index` and `url`).
                 */
                ngImagoQueue.add = function( obj ) {

                    var indexGroup = ngImagoQueue.indexExists( obj.index ); // Check if a group for this index already exists.
                    if ( !indexGroup ) {
                        // If not, create a new group.
                        indexGroup = {
                            index: obj.index,
                            items: []
                        };
                        ngImagoQueue.queue.push( indexGroup ); // Add the new group to the queue.
                    }

                    // Prevent adding the same item multiple times.
                    if ( ngImagoQueue.itemExists( indexGroup.items, obj ) ) {
                        return;
                    }

                    indexGroup.items.push( obj ); // Add the image object to its respective group.

                    // Keep the queue sorted by index.
                    ngImagoQueue.queue.sort( function( a, b ) {
                        return a.index - b.index;
                    } );

                };


                /**
                 * Checks if an index group exists in the queue.
                 * Optionally removes the group if `andRemove` is true.
                 * @param {number} index - The index to search for.
                 * @param {boolean} [andRemove=false] - If true, the group is removed if found.
                 * @returns {object|boolean} The index group object, or false if not found.
                 */
                ngImagoQueue.indexExists = function( index, andRemove ) {

                    // If queue is empty or undefined, no index can exist.
                    if ( !ngImagoQueue.queue || ngImagoQueue.queue.length === 0 ) {
                        return false;
                    }

                    // Iterate through the queue in reverse for efficient removal.
                    for ( var i = ngImagoQueue.queue.length - 1; i >= 0; i-- ) {
                        if ( ngImagoQueue.queue[ i ].index === index ) {
                            if ( andRemove === true ) {
                                // Remove and return the removed group.
                                return ngImagoQueue.queue.splice( i, 1 );
                            } else {
                                // Return the existing group.
                                return ngImagoQueue.queue[ i ];
                            }
                        }
                    }

                    return false; // No group found for the given index.
                };


                /**
                 * Checks if a specific image item exists within a dictionary (items array of a group).
                 * Optionally removes the item if `andRemove` is true.
                 * @param {array} dict - The array of items within an index group.
                 * @param {object} obj - The image object to search for (must have a `url` property).
                 * @param {boolean} [andRemove=false] - If true, the item is removed if found.
                 * @returns {object|boolean} The found item, or false if not found.
                 */
                ngImagoQueue.itemExists = function( dict, obj, andRemove ) {

                    // If dict is null, try to find the index group first.
                    if ( dict === null ) {
                        var indexGroup = ngImagoQueue.indexExists( obj.index );
                        if ( indexGroup && indexGroup.items && indexGroup.items.length > 0 ) {
                            dict = indexGroup.items; // Use the items array from the found group.
                        }
                    }

                    // If dict is still null or empty, no item can exist.
                    if ( !dict || dict.length === 0 ) {
                        return false;
                    }

                    // Iterate through the items in reverse for efficient removal.
                    for ( var i = dict.length - 1; i >= 0; i-- ) {
                        if ( dict[ i ].url === obj.url ) {
                            if ( andRemove === true ) {
                                // Remove and return the removed item.
                                return dict.splice( i, 1 );
                            } else {
                                // Return the existing item.
                                return dict[ i ];
                            }
                        }
                    }

                    return false; // No item found.
                };


                /**
                 * Removes an entire index group from the queue.
                 * @param {number} index - The index of the group to remove.
                 * @returns {array|boolean} The removed group array (splice result), or false if not found.
                 */
                ngImagoQueue.removeQueueIndex = function( index ) {

                    // If queue is empty or undefined, nothing to remove.
                    if ( !ngImagoQueue.queue || ngImagoQueue.queue.length === 0 ) {
                        return false;
                    }

                    // Iterate through the queue in reverse.
                    for ( var i = ngImagoQueue.queue.length - 1; i >= 0; i-- ) {
                        if ( ngImagoQueue.queue[ i ].index === index ) {
                            return ngImagoQueue.queue.splice( i, 1 ); // Remove and return the group.
                        }
                    }

                    return false; // No group found for the given index.
                };


                /**
                 * Removes a specific image object from its respective queue group.
                 * @param {object} obj - The image object to remove (must have `index` and `url`).
                 * @param {object} [element] - Optional: The DOM element associated with the image.
                 */
                ngImagoQueue.remove = function( obj, element ) {

                    // If the object is undefined, there's nothing to remove.
                    if ( angular.isUndefined( obj ) ) {
                        return;
                    }

                    var thisIndex = obj.index; // Get the index of the object.

                    var indexGroup = ngImagoQueue.indexExists( obj.index ); // Find the group for this index.

                    // Attempt to remove the item from its group.
                    var item = ngImagoQueue.itemExists( indexGroup.items, obj, true );
                    // Further logic would likely go here to check if the group is empty and then remove the group.
                    // This implementation snippet ends abruptly.
                };

            }
        ] );

    }
)( angular ); // Pass angular into the IIFE.