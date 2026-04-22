/*
 * jQuery Mobile Google Maps Plugin - Type I Clone
 *
 * This file contains a Type I clone of the original JavaScript code.
 * All functional aspects, variable names, and logic are preserved.
 *
 * Changes are limited to:
 * - Whitespace adjustments (indentation, line breaks, spacing).
 * - Comments (addition, modification, removal).
 *
 * Original Author Information:
 * @Author: Jochen Vandendriessche <jochen@builtbyrobot.com>
 * @Author URI: http://builtbyrobot.com
 * @Author: Thomas Rickenbach <thomasrickenbach@gmail.com>
 *
 * Marker Options:
 * Markers can utilize all properties available in google.maps.MarkerOptions.
 * Refer to the official Google Maps JavaScript API documentation for details:
 * https://developers.google.com/maps/documentation/javascript/reference#Marker
 *
 * Plugin Configuration Options:
 * - deviceWidth: Specifies the maximum screen width for displaying a static map image.
 * - center: The geographical address or coordinates to center the map on.
 * - zoom: The initial zoom level for the map display.
 * - maptype: Defines the type of map to display (e.g., 'roadmap', 'satellite').
 * - markers: An array of marker objects to be placed on the map.
 *   Each marker object can have additional properties:
 *   - info: HTML content to display in an info window when the marker is clicked.
 *           (Note: Info windows are not supported on static map images.)
 *   - showInfo: A boolean flag to determine if the info window should automatically
 *               open when the map loads.
 *
 * Future Enhancements (TODO):
 * - Implement support for displaying info windows on static map images.
 *
 */

( function ( $ ) {

	"use strict";

	// An array to store references to all Google Maps marker objects created.
	var allMarkers = [],

		// Object containing the public and private methods for the plugin.
		methods = {

			/**
			 * Initializes the Google Maps plugin on the selected element(s).
			 *
			 * @param {object} config - Configuration options for the map.
			 */
			init : function ( config ) {

				// Enable the new visual refresh for Google Maps, which is currently opt-in.
				google.maps.visualRefresh = true;

				// Extend default options with user-provided configuration.
				var options = $.extend( {
					deviceWidth: 580, // Default width for static image fallback.
					markers: []       // Array to hold map markers.
				}, config );

				// Default settings for the map, used internally.
				var settings = {
					center: '', // Default center, can be overridden by data-attribute or config.
					zoom: '5',  // Default zoom level.
					size: screen.width + 'x' +  480, // Map size based on screen width.
					scale: window.devicePixelRatio ? window.devicePixelRatio : 1, // Device pixel ratio for high-res screens.
					maptype: 'roadmap', // Default map type.
					sensor: false       // Indicates whether the application uses a location sensor.
				};

				// Store the jQuery object of the current element for efficient access.
				var $this = $( this );

				/*
				 * Determine map width based on device screen width.
				 * This approach avoids browser sniffing and targets small displays universally.
				 *
				 * The original code also had a commented-out iframe example, which is not relevant
				 * to the logic but preserved as a comment here for Type I cloning.
				 *
				 * <iframe width="425" height="350" frameborder="0" scrolling="no" marginheight="0" marginwidth="0" src="http://maps.google.com/maps?f=q&amp;source=s_q&amp;hl=nl&amp;geocode=&amp;q=Brugse+Heirweg+37,+aartrijke&amp;aq=&amp;sll=51.122175,3.086483&amp;sspn=0.009253,0.021651&amp;vpsrc=0&amp;ie=UTF8&amp;hq=&amp;hnear=Brugse+Heirweg+37,+8211+Zedelgem,+West-Vlaanderen,+Vlaams+Gewest&amp;t=m&amp;z=14&amp;ll=51.122175,3.086483&amp;output=embed"></iframe>
				 */

				// Base URI for the Google Static Maps API.
				options.imgURI = 'http://maps.googleapis.com/maps/api/staticmap?';

				// Attach internal settings to the options object.
				options.settings = settings;

				// Override default settings with data attributes from the element, if present.
				options.settings.center  = $this.attr( 'data-center' )  || options.settings.center;
				options.settings.zoom    = $this.attr( 'data-zoom' )    || options.settings.zoom;
				options.settings.maptype = $this.attr( 'data-maptype' ) || options.settings.maptype;

				// Store the complete options object in the element's data.
				$this.data( 'options', options );

				// Decide whether to show a static image or an interactive map based on device width.
				if ( screen.width < options.deviceWidth ) {
					// Device width is less than the threshold, show a static image.
					$this.mobileGmap( 'showImage' );
				} else {
					// Device width is sufficient, show the interactive map.
					$this.mobileGmap( 'showMap' );
				}

			}, // End of init method.


			/**
			 * Displays an interactive Google Map on the selected element.
			 */
			showMap : function () {

				// Add a class for styling and retrieve options from data.
				var $this = $( this ).addClass( 'gmap_map' ),
					options = $this.data( 'options' );

				// Initialize Google Maps Geocoder service.
				var geocoder = new google.maps.Geocoder();

				// Placeholder for map options, to be populated after geocoding.
				var mapOptions = {};

				// Get the raw DOM element to pass to the Google Map constructor.
				var htmlObj = $this.get( 0 );

				// Geocode the center address to get its geographical coordinates.
				geocoder.geocode( {
					'address': options.settings.center
				}, function ( results, status ) {

					// Check if geocoding was successful.
					if ( status === google.maps.GeocoderStatus.OK ) {

						// Populate map options using geocoded location and plugin settings.
						mapOptions = {
							zoom: parseInt( options.settings.zoom, 10 ), // Ensure zoom is an integer.
							center: results[ 0 ].geometry.location,      // Use geocoded location as center.
							mapTypeId: options.settings.maptype          // Set map type.
						};

						// Create a new Google Map instance.
						var map = new google.maps.Map( htmlObj, mapOptions );

						// Object to hold marker options, initialized empty.
						var marker_options = {};

						// Check if there are markers to add to the map.
						if ( options.markers.length ) {

							// Loop through each marker defined in the options.
							for ( var i = 0; i < options.markers.length; i++ ) {

								// Extend default marker options with current marker's properties.
								// Ensure the map property is set for the marker.
								marker_options = $.extend( {
									map: map
								}, options.markers[ i ] );

								// If marker position is not defined or explicitly 'center',
								// use the map's center location.
								if ( ! marker_options.position || marker_options.position == 'center' ) {
									marker_options.position = results[ 0 ].geometry.location;
								}

								// Check if the marker position needs to be geocoded (i.e., it's a string address).
								if ( typeof marker_options.position !== 'object' ) {

									// Use an IIFE to capture the current marker_options for the async geocode call.
									( function ( geocoded_marker ) {

										// Geocode the marker's address.
										geocoder.geocode( {
											'address' : geocoded_marker.position
										}, function ( results, status ) {

											// If geocoding is successful for the marker.
											if ( status === google.maps.GeocoderStatus.OK ) {
												// Update the marker's position with the geocoded coordinates.
												geocoded_marker.position = results[ 0 ].geometry.location;
												// Add the marker to the map.
												methods._addMarker( geocoded_marker );
											}

										} );

									} )( marker_options ); // Immediately invoke with current marker_options.

								} else {
									// Position is already a LatLng object, add the marker directly.
									methods._addMarker( marker_options );
								}

							} // End of markers loop.

						} // End of if (options.markers.length).

					} // End of if (status === google.maps.GeocoderStatus.OK).

				} ); // End of geocoder.geocode callback.

			}, // End of showMap method.


			/**
			 * Adds a single marker to the Google Map.
			 * This is a private helper method.
			 *
			 * @param {object} marker_options - Options for the marker, including position, map, etc.
			 */
			_addMarker : function ( marker_options ) {

				var marker_info; // Variable to temporarily hold info window content.

				// Extract info window content if present and delete it from marker_options
				// as it's not a standard Google Maps Marker property.
				if ( marker_options.info ) {
					marker_info = marker_options.info;
					delete marker_options.info;
				}

				// Create a new Google Maps Marker instance.
				var new_marker = new google.maps.Marker( marker_options );

				// If info window content was provided.
				if ( marker_info ) {

					// Create a new InfoWindow with the provided content.
					var infoWindow = new google.maps.InfoWindow( {
						content: marker_info
					} );

					// Add a click listener to the marker to open the info window.
					google.maps.event.addListener( new_marker, 'click', function () {
						infoWindow.open( marker_options.map, new_marker );
					} );

					// If the 'showInfo' flag is set, open the info window automatically on load.
					if ( marker_options.showInfo ) {
						/*
						 * A small timeout is necessary here.
						 * This allows the info window to correctly calculate its height
						 * after its content has fully rendered and adjusted.
						 */
						window.setTimeout( function () {
							infoWindow.open( marker_options.map, new_marker );
						}, 100 );
					}

				} // End of if (marker_info).

				// Add the newly created marker to the global array of all markers.
				allMarkers.push( new_marker );

			}, // End of _addMarker method.


			/**
			 * Displays a static Google Maps image on the selected element.
			 * This is used as a fallback for smaller screens or when JS maps are not desired.
			 */
			showImage : function () {

				// Add a class for styling and retrieve options.
				var $this = $( this ).addClass( 'gmap_image' ),
					par = [],        // Array to hold URL parameters for static map.
					r = new Image(), // Create an Image object for the static map.
					l = document.createElement( 'a' ), // Create an anchor element to wrap the image.
					options = $this.data( 'options' ),
					i = 0,           // Loop counter.
					m = [];          // Array to hold marker parameters for static map.

				// Iterate over map settings to build URL parameters.
				for ( var o in options.settings ) {
					par.push( o + '=' + options.settings[ o ] );
				}

				// If markers are defined, prepare them for the static map URL.
				if ( options.markers.length ) {
					var t = []; // Temporary array for individual marker properties.
					// Loop through each marker.
					for ( ; i < options.markers.length; i++ ) {
						t = []; // Reset temporary array for current marker.
						// Loop through properties of the current marker.
						for ( var j in options.markers[ i ] ) {
							// Handle 'position' property specially.
							if ( j == 'position' ) {
								// Use map center if position is empty or 'center', otherwise format the position string.
								t.push( ( ! options.markers[ i ][ j ] || options.markers[ i ][ j ] == 'center' ) ? options.settings.center : options.markers[ i ][ j ].replace( / /gi, '+' ) );
							} else {
								// For other properties, format as key:value.
								t.push( j + ':' + options.markers[ i ][ j ] );
							}
						}
						// Add the formatted marker string to the 'm' array.
						m.push( '&markers=' + t.join( '%7C' ) );
					}
				}

				// Construct the full URL for the static map image.
				r.src = options.imgURI + par.join( '&' ) + m.join( '' );

				// Set the href of the anchor tag to a Google Maps search link for the center.
				l.href = '//maps.google.com/maps?q=' + options.settings.center;

				// Append the static map image to the anchor tag.
				l.appendChild( r );

				// Clear the element's content and append the anchor tag with the image.
				$( this ).empty().append( l );

			} // End of showImage method.

		}; // End of methods object.


	/**
	 * jQuery plugin entry point.
	 * Allows calling methods or initializing the plugin.
	 *
	 * @param {string|object} method - The method name to call or an options object for initialization.
	 */
	$.fn.mobileGmap = function ( method ) {

		// Check if the requested method exists in our 'methods' object.
		if ( methods[ method ] ) {

			// Call the method and pass arguments, excluding the method name itself.
			return methods[ method ].apply( this, Array.prototype.slice.call( arguments, 1 ) );

		} else if ( typeof method === 'object' || ! method ) {

			// If no method name is provided, or if an object (options) is passed,
			// assume it's an initialization call.
			return methods.init.apply( this, arguments );

		} else {

			// If an unknown method is called, throw an error.
			$.error( 'Method ' + method + ' does not exist on jQuery.mobileGmap' );

		}

	}; // End of $.fn.mobileGmap.

} )( this.jQuery ); // End of IIFE, passing jQuery.