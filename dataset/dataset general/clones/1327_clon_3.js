// A sophisticated mapping component designed for jQuery-enabled mobile web applications.
// This module intelligently renders Google Maps experiences, adapting between
// interactive map views and optimized static map images based on the user's device
// screen dimensions. It aims to provide a performant and responsive mapping solution.
//
// Original Concept & Development Contributions:
// Jochen Vandendriessche <jochen@builtbyrobot.com> (http://builtbyrobot.com)
// Thomas Rickenbach <thomasrickenbach@gmail.com>
//
// Core Capabilities:
// - Adaptive Display: Automatically switches to a static image for smaller screens
//   to improve load times and resource usage, while offering a full interactive map
//   on larger displays.
// - Extensive Marker Support: Compatible with standard Google Maps MarkerOptions.
//   Includes specialized handling for custom HTML content within info windows.
// - Configuration Flexibility: Key map parameters like center location, zoom level,
//   and map type can be conveniently specified through HTML data attributes.
//
// Detailed Marker Object Properties:
// - Each object within the 'mapPins' array should align with `google.maps.MarkerOptions`.
// - `infoHtml`: A string containing HTML content for the marker's information window.
//   (Note: This feature is only available for interactive maps, not static images.)
// - `autoShowInfo`: A boolean flag. If `true`, the info window for this marker
//   will automatically open when the interactive map finishes loading.
//
// Outstanding Enhancements (Future Development):
// - Integrate functionality to display `infoHtml` content for static map markers,
//   potentially through a custom overlay or modal UI.
// - Implement more robust error recovery and user feedback mechanisms for
//   geocoding failures or issues with the Google Maps API.
// - Explore performance optimizations for geocoding multiple markers (e.g.,
//   batch geocoding requests or client-side caching of resolved coordinates).
// - Provide built-in support for managing and securely applying Google Maps API keys.

(function(externalJQuery){
	"use strict";

	// --- Internal Constants and Helper Functions ---

	// Base URL for the Google Static Maps API, used for generating map images.
	const STATIC_MAP_API_ENDPOINT = 'https://maps.googleapis.com/maps/api/staticmap?';

	// A utility function to deeply merge objects, mimicking jQuery.extend(true, ...).
	// This ensures that default configurations are properly overridden by user settings.
	const deepMerge = externalJQuery.extend;

	// A private array to keep track of all Google Maps Marker instances created
	// on the interactive map, allowing for potential manipulation or cleanup.
	let interactiveMapMarkers = [];

	// This object encapsulates all the core logic and methods for the map widget.
	const mapWidgetCoreLogic = {

		/**
		 * Orchestrates the initial setup of the map component on a target DOM element.
		 * It determines the appropriate map rendering strategy (interactive or static)
		 * based on the detected screen width and user-defined preferences.
		 * @param {object} initialSettings - Configuration object containing user-defined parameters for the map widget.
		 */
		initializeMapComponent : function(initialSettings) {
			// Pre-check: Verify that the Google Maps API script has been successfully loaded.
			if (typeof google === 'undefined' || typeof google.maps === 'undefined') {
				console.error("Google Maps API is not detected. The map widget cannot be initialized.");
				// Trigger a custom event to notify external code about the API loading failure.
				externalJQuery(this).trigger('jqmmap:api_load_error');
				return; // Halt initialization if API is unavailable.
			}

			// Define the default configuration for the map widget.
			const defaultWidgetConfig = {
				maxStaticRenderWidth: 768, // Max screen width (pixels) to display a static map image.
				mapPins: [] // An array of marker definition objects.
			};

			// Merge default settings with any provided user settings. A deep merge is used
			// to ensure complex objects like `mapPins` are handled correctly.
			const effectiveWidgetConfig = deepMerge(true, {}, defaultWidgetConfig, initialSettings);

			// Define the fundamental display parameters for the map, applicable to both
			// interactive and static renditions.
			const fundamentalMapParams = {
				primaryAddress: '', // The geographical center, specified as an address string.
				zoomLevel: '8', // Initial zoom level for the map.
				displayDimensions: `${screen.width}x${Math.min(600, screen.height * 0.6)}`, // Calculated image dimensions.
				devicePixelRatio: window.devicePixelRatio || 1, // Scale factor for high-DPI screens.
				mapDisplayType: 'roadmap', // e.g., 'roadmap', 'satellite', 'terrain', 'hybrid'.
				sensorParameter: false // Legacy Google Maps API parameter, included for compatibility.
			};

			// Obtain a jQuery reference to the element on which the widget is being initialized.
			const targetElement = externalJQuery(this);

			// Override fundamental map parameters using data attributes found on the target element.
			// This allows for quick, declarative configuration directly in HTML.
			fundamentalMapParams.primaryAddress = targetElement.attr('data-map-center-location') || fundamentalMapParams.primaryAddress;
			fundamentalMapParams.zoomLevel = targetElement.attr('data-map-initial-zoom') || fundamentalMapParams.zoomLevel;
			fundamentalMapParams.mapDisplayType = targetElement.attr('data-map-view-style') || fundamentalMapParams.mapDisplayType;

			// Store the consolidated widget configuration and map parameters within the
			// element's data store for access by other methods.
			targetElement.data('jqmMapComponentData', {
				widgetConfiguration: effectiveWidgetConfig,
				mapCoreParameters: fundamentalMapParams
			});

			// Conditional rendering: Choose between an interactive map or a static image.
			if (screen.width < effectiveWidgetConfig.maxStaticRenderWidth) {
				targetElement.jqmMapWidget('renderStaticImage');
			} else {
				targetElement.jqmMapWidget('showInteractiveMap');
			}
		},

		/**
		 * Displays a fully interactive Google Map within the designated element.
		 * This method is typically invoked when the screen size is sufficiently large.
		 */
		showInteractiveMap : function(){
			const targetElement = externalJQuery(this).addClass('jqm-map-interactive-view');
			const componentData = targetElement.data('jqmMapComponentData');
			const widgetConfiguration = componentData.widgetConfiguration;
			const mapCoreParameters = componentData.mapCoreParameters;

			// Instantiate Google's Geocoder service to translate addresses into geographic coordinates.
			const geocodingService = new google.maps.Geocoder();
			// Retrieve the raw DOM element to pass to the Google Map constructor.
			const mapDomContainer = targetElement.get(0);

			// Begin by geocoding the primary address to determine the map's center.
			geocodingService.geocode({ 'address': mapCoreParameters.primaryAddress }, function(geocodeResults, geocodeStatus) {
				// Check if geocoding was successful and returned at least one result.
				if (geocodeStatus === google.maps.GeocoderStatus.OK && geocodeResults.length > 0) {
					// Assemble the options object required to construct the Google Map.
					const interactiveMapOptions = {
						zoom: Number.parseInt(mapCoreParameters.zoomLevel, 10), // Ensure zoom is an integer.
						center: geocodeResults[0].geometry.location, // Use the geocoded location as center.
						mapTypeId: mapCoreParameters.mapDisplayType
					};
					// Create and render the new Google Map instance.
					const mapInstance = new google.maps.Map(mapDomContainer, interactiveMapOptions);

					// Iterate through the configured map pins and add them to the map.
					if(widgetConfiguration.mapPins.length > 0) {
						widgetConfiguration.mapPins.forEach(function(pinDefinition) {
							// Clone the pin definition and attach the map instance.
							const currentPinOptions = deepMerge({}, pinDefinition, { map: mapInstance });

							// Determine the marker's position:
							if(!currentPinOptions.position || currentPinOptions.position === 'center') {
								// If no position or 'center' is specified, use the map's center.
								currentPinOptions.position = geocodeResults[0].geometry.location;
								mapWidgetCoreLogic.addMapMarker(currentPinOptions);
							} else if (typeof currentPinOptions.position === 'string') {
								// If position is an address string, geocode it separately.
								geocodingService.geocode({ 'address' : currentPinOptions.position }, function(markerGeoResults, markerGeoStatus) {
									if(markerGeoStatus === google.maps.GeocoderStatus.OK && markerGeoResults.length > 0) {
										currentPinOptions.position = markerGeoResults[0].geometry.location;
										mapWidgetCoreLogic.addMapMarker(currentPinOptions);
									} else {
										console.warn("Failed to geocode marker address:", currentPinOptions.position, "Status:", markerGeoStatus);
										targetElement.trigger('jqmmap:marker_geocode_failed', [currentPinOptions.position, markerGeoStatus]);
									}
								});
							} else {
								// Assume position is already a google.maps.LatLng object or compatible.
								mapWidgetCoreLogic.addMapMarker(currentPinOptions);
							}
						});
					}
					// Trigger an event indicating the interactive map has fully loaded.
					targetElement.trigger('jqmmap:interactive_map_ready', [mapInstance]);
				} else {
					console.error("Geocoding failed for the map's primary address:", mapCoreParameters.primaryAddress, "Status:", geocodeStatus);
					targetElement.trigger('jqmmap:center_geocode_failed', [geocodeStatus]);
				}
			});
		},

		/**
		 * Instantiates and places a single Google Maps Marker on the interactive map.
		 * This method also configures and manages the associated info window, including
		 * automatic opening behavior if specified.
		 * @param {object} markerConfiguration - An object containing `google.maps.MarkerOptions`
		 *   along with custom properties like `infoHtml` and `autoShowInfo`.
		 */
		addMapMarker : function(markerConfiguration){
			let infoWindowHtmlContent = null;

			// Extract custom 'infoHtml' property for info window content.
			if(markerConfiguration.infoHtml) {
				infoWindowHtmlContent = markerConfiguration.infoHtml;
				// Remove this custom property to prevent it from being passed to the
				// Google Maps Marker constructor, which expects specific options.
				delete markerConfiguration.infoHtml;
			}

			// Create the actual Google Maps Marker instance.
			const newMarkerInstance = new google.maps.Marker(markerConfiguration);

			// If HTML content for an info window was provided, set it up.
			if(infoWindowHtmlContent) {
				const markerInfoWindow = new google.maps.InfoWindow({
					content: infoWindowHtmlContent
				});

				// Attach a click event listener to the marker to open its info window.
				google.maps.event.addListener(newMarkerInstance, 'click', function() {
					markerInfoWindow.open(markerConfiguration.map, newMarkerInstance);
				});

				// If 'autoShowInfo' is true, open the info window automatically after a short delay.
				// The delay helps ensure the info window has enough time to calculate its dimensions
				// correctly after the map has rendered.
				if(markerConfiguration.autoShowInfo) {
					window.setTimeout(function(){
						markerInfoWindow.open(markerConfiguration.map, newMarkerInstance);
					}, 250); // Slightly increased delay for better reliability.
				}
			}
			interactiveMapMarkers.push(newMarkerInstance); // Add the new marker to our global registry.
		},

		/**
		 * Generates and displays a static Google Map image instead of an interactive map.
		 * This is the preferred rendering method for devices with smaller screen widths
		 * to optimize performance and reduce bandwidth usage.
		 */
		renderStaticImage : function(){
			const targetElement = externalJQuery(this).addClass('jqm-map-static-image-view');
			const componentData = targetElement.data('jqmMapComponentData');
			const widgetConfiguration = componentData.widgetConfiguration;
			const mapCoreParameters = componentData.mapCoreParameters;

			// An array to build the URL parameters for the Static Maps API request.
			const staticMapUrlParams = [];

			// Add the primary map parameters to the URL.
			staticMapUrlParams.push(`center=${encodeURIComponent(mapCoreParameters.primaryAddress)}`);
			staticMapUrlParams.push(`zoom=${mapCoreParameters.zoomLevel}`);
			staticMapUrlParams.push(`size=${mapCoreParameters.displayDimensions}`);
			staticMapUrlParams.push(`scale=${mapCoreParameters.devicePixelRatio}`);
			staticMapUrlParams.push(`maptype=${mapCoreParameters.mapDisplayType}`);
			staticMapUrlParams.push(`sensor=${mapCoreParameters.sensorParameter}`);

			// Process each marker definition to include it in the static map URL.
			if (widgetConfiguration.mapPins.length > 0) {
				widgetConfiguration.mapPins.forEach(function(pinDefinition) {
					const markerPropertySegments = [];
					for (const propKey in pinDefinition) {
						// Ensure the property belongs directly to the pinDefinition object.
						if (Object.prototype.hasOwnProperty.call(pinDefinition, propKey)) {
							// For static maps, the 'position' property is handled specially.
							if (propKey === 'position') {
								const markerLocation = (!pinDefinition[propKey] || pinDefinition[propKey] === 'center')
									? mapCoreParameters.primaryAddress // Use map center if position is not specified.
									: pinDefinition[propKey];
								// Replace spaces with '+' for URL compatibility in static map addresses.
								markerPropertySegments.push(encodeURIComponent(markerLocation.replace(/ /g, '+')));
							} else if (propKey !== 'infoHtml' && propKey !== 'autoShowInfo') {
								// Exclude interactive-only properties from the static map URL.
								markerPropertySegments.push(`${propKey}:${encodeURIComponent(pinDefinition[propKey])}`);
							}
						}
					}
					// Only add the 'markers' parameter if there are valid segments for it.
					if (markerPropertySegments.length > 0) {
						staticMapUrlParams.push(`markers=${markerPropertySegments.join('%7C')}`); // '%7C' is the URL-encoded pipe character.
					}
				});
			}

			// Construct the complete URL for the static map image.
			const fullStaticImageUrl = STATIC_MAP_API_ENDPOINT + staticMapUrlParams.join('&');

			// Create an HTML Image element to display the static map.
			const staticMapImageElement = new Image();
			staticMapImageElement.src = fullStaticImageUrl;
			staticMapImageElement.alt = `Static map centered at ${mapCoreParameters.primaryAddress}`; // Add alt text for accessibility.
			staticMapImageElement.className = 'jqm-static-map-image'; // Assign a CSS class.

			// Create an anchor element that will wrap the image, linking to Google Maps.
			const mapInteractiveLink = document.createElement('a');
			mapInteractiveLink.href = `//maps.google.com/maps?q=${encodeURIComponent(mapCoreParameters.primaryAddress)}`;
			mapInteractiveLink.target = '_blank'; // Open the interactive map in a new browser tab.
			mapInteractiveLink.className = 'jqm-map-interactive-link';

			// Append the image to the link, and the link to the target DOM element.
			mapInteractiveLink.appendChild(staticMapImageElement);
			targetElement.empty().append(mapInteractiveLink);

			// Attach event listeners to monitor the loading status of the static map image.
			staticMapImageElement.onload = function() {
				targetElement.trigger('jqmmap:static_image_loaded', [staticMapImageElement.src]);
			};
			staticMapImageElement.onerror = function() {
				console.error("Failed to load static map image from URL:", staticMapImageElement.src);
				targetElement.trigger('jqmmap:static_image_load_failed', [staticMapImageElement.src]);
			};
		}
	};

	/**
	 * Defines the jQuery plugin interface for `jqmMapWidget`.
	 * This allows users to initialize the map component or invoke its methods
	 * directly on jQuery-selected elements.
	 * @param {string|object} action - A string representing a method name to call,
	 *   or an object containing initialization settings for the widget.
	 * @returns {jQuery} The jQuery object, enabling method chaining.
	 */
	externalJQuery.fn.jqmMapWidget = function(action){
		// If the first argument is a string and matches an existing method in `mapWidgetCoreLogic`.
		if ( typeof action === 'string' && typeof mapWidgetCoreLogic[action] === 'function' ) {
			// Call the specified method, passing all arguments except the method name itself.
			// `Array.prototype.slice.call(arguments, 1)` creates a new array from arguments,
			// starting from the second argument.
			return mapWidgetCoreLogic[ action ].apply( this, Array.prototype.slice.call( arguments, 1 ));
		} else if ( typeof action === 'object' || ! action ) {
			// If the argument is an object (initialization settings) or no argument is provided,
			// assume it's an initialization request.
			return mapWidgetCoreLogic.initializeMapComponent.apply( this, arguments );
		} else {
			// If an unknown method name is provided, log an error.
			externalJQuery.error( `The method "${action}" does not exist on jQuery.jqmMapWidget.` );
			return this; // Return the jQuery object for graceful chaining even on error.
		}
	};

})(this.jQuery);