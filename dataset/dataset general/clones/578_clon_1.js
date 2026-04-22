/* global define, window, document, Handlebars, google */

/*
 * This is the main entry point for the store locator plugin.
 * It's wrapped in an immediately invoked function expression (IIFE)
 * to prevent global scope pollution.
 */
;(function ( $, window, document, undefined ) {

	// Strict mode helps catch common coding errors and "unsafe" actions.
	'use strict' ;

	// Define the plugin's name. This is used for jQuery.fn.
	var pluginName = 'storeLocator' ;


	// Prevent multiple instantiations of the plugin on the same element.
	// If the plugin is already attached to $.fn, we just return.
	if ( typeof $.fn[pluginName] !== 'undefined' ) {
		return ;
	}


	// --- Global Variables ---
	// These variables are declared here to be accessible across various methods
	// within the plugin's scope.
	var $this ,
		listTemplate ,
		infowindowTemplate ,
		dataTypeRead ,
		originalOrigin ,
		originalData ,
		originalZoom ,
		dataRequest ,
		searchInput ,
		addressInput ,
		olat ,
		olng ,
		storeNum ,
		directionsDisplay ,
		directionsService ;

	// Arrays for organizing location data and markers.
	var featuredset   =   [ ] ,
		locationset   =   [ ] ,
		normalset     =   [ ] ,
		markers       =   [ ] ;

	// Objects for various settings and data structures.
	var filters       =   { } ,
		locationData  =   { } ,
		GeoCodeCalc   =   { } ,
		mappingObj    =   { } ;


	/*
	 * --- Default Settings ---
	 * These are the default options for the plugin.
	 * They should NOT be modified directly in this file.
	 * Instead, override them when you initialize the plugin.
	 */
	var defaults = {
		'mapID'                    :   'bh-sl-map'                                                                , // ID of the map container
		'locationList'             :   'bh-sl-loc-list'                                                           , // Class of the location list container
		'formContainer'            :   'bh-sl-form-container'                                                     , // Class of the form container
		'formID'                   :   'bh-sl-user-location'                                                      , // ID of the search form
		'addressID'                :   'bh-sl-address'                                                            , // ID of the address input field
		'regionID'                 :   'bh-sl-region'                                                             , // ID of the region input field (optional)
		'mapSettings'              :   {                                                                            // Google Maps API settings
			zoom     :   12                                                                                         ,
			mapTypeId:   google.maps.MapTypeId.ROADMAP
		}                                                                                                       ,
		'markerImg'                :   null                                                                       , // Custom marker image path
		'markerDim'                :   null                                                                       , // Custom marker dimensions (e.g., { width: 32, height: 32 })
		'catMarkers'               :   null                                                                       , // Categorized markers (e.g., { 'category1': 'path/to/marker1.png' })
		'lengthUnit'               :   'm'                                                                        , // Distance unit: 'm' for miles, 'km' for kilometers
		'storeLimit'               :   26                                                                         , // Maximum number of stores to display
		'distanceAlert'            :   60                                                                         , // Distance threshold for alert message
		'dataType'                 :   'xml'                                                                      , // Data type: 'xml', 'json', 'jsonp', or 'kml'
		'dataLocation'             :   'data/locations.xml'                                                       , // Path to the data file (XML, JSON, KML)
		'dataRaw'                  :   null                                                                       , // Raw data string (XML or JSON) for inline use
		'xmlElement'               :   'marker'                                                                   , // XML element name for locations (if using XML)
		'listColor1'               :   '#ffffff'                                                                  , // Background color for odd list items
		'listColor2'               :   '#eeeeee'                                                                  , // Background color for even list items
		'originMarker'             :   false                                                                      , // Show a marker for the origin address
		'originMarkerImg'          :   null                                                                       , // Custom image for the origin marker
		'originMarkerDim'          :   null                                                                       , // Dimensions for the origin marker
		'bounceMarker'             :   true                                                                       , // Bounce markers on hover/click
		'slideMap'                 :   true                                                                       , // Slide map into view on search
		'modal'                    :   false                                                                      , // Enable modal window for the locator
		'overlay'                  :   'bh-sl-overlay'                                                            , // Class for the modal overlay
		'modalWindow'              :   'bh-sl-modal-window'                                                       , // Class for the modal window
		'modalContent'             :   'bh-sl-modal-content'                                                      , // Class for the modal content area
		'closeIcon'                :   'bh-sl-close-icon'                                                         , // Class for the modal close icon
		'defaultLoc'               :   false                                                                      , // Use a default location on load
		'defaultLat'               :   null                                                                       , // Default latitude
		'defaultLng'               :   null                                                                       , // Default longitude
		'autoGeocode'              :   false                                                                      , // Attempt to auto-geocode user's location
		'maxDistance'              :   false                                                                      , // Enable maximum distance filter
		'maxDistanceID'            :   'bh-sl-maxdistance'                                                        , // ID of the max distance select field
		'fullMapStart'             :   false                                                                      , // Display full map on load without searching
		'noForm'                   :   false                                                                      , // Don't use a form element (e.g., for custom search buttons)
		'loading'                  :   false                                                                      , // Show a loading indicator during AJAX requests
		'loadingContainer'         :   'bh-sl-loading'                                                            , // Class for the loading indicator container
		'featuredLocations'        :   false                                                                      , // Display featured locations (requires 'featured' attribute in data)
		'pagination'               :   false                                                                      , // Enable pagination for location list
		'locationsPerPage'         :   10                                                                         , // Number of locations to show per page
		'inlineDirections'         :   false                                                                      , // Display directions panel inline
		'nameSearch'               :   false                                                                      , // Enable searching by location name
		'searchID'                 :   'bh-sl-search'                                                             , // ID of the name search input field
		'nameAttribute'            :   'name'                                                                     , // Attribute name for location names in data
		'visibleMarkersList'       :   false                                                                      , // Only show markers that are currently visible in the list
		'infowindowTemplatePath'   :   'assets/js/plugins/storeLocator/templates/infowindow-description.html'     , // Path to the infowindow Handlebars template
		'listTemplatePath'         :   'assets/js/plugins/storeLocator/templates/location-list-description.html'  , // Path to the list Handlebars template
		'KMLinfowindowTemplatePath':   'assets/js/plugins/storeLocator/templates/kml-infowindow-description.html' , // Path to KML infowindow template
		'KMLlistTemplatePath'      :   'assets/js/plugins/storeLocator/templates/kml-location-list-description.html', // Path to KML list template
		'listTemplateID'           :   null                                                                       , // ID of inline list template script tag
		'infowindowTemplateID'     :   null                                                                       , // ID of inline infowindow template script tag
		'taxonomyFilters'          :   null                                                                       , // Taxonomy filter settings (object)
		'taxonomyFiltersContainer' :   'bh-sl-filters-container'                                                  , // Class for the taxonomy filters container
		'exclusiveFiltering'       :   false                                                                      , // If true, only one filter can be selected at a time
		'querystringParams'        :   false                                                                      , // Allow passing address/search via querystring
		'callbackNotify'           :   null                                                                       , // Callback for notifications (overrides default alert)
		'callbackBeforeSend'       :   null                                                                       , // Callback before AJAX data request
		'callbackSuccess'          :   null                                                                       , // Callback after successful data load and processing
		'callbackModalOpen'        :   null                                                                       , // Callback when modal opens
		'callbackModalReady'       :   null                                                                       , // Callback when modal is ready
		'callbackModalClose'       :   null                                                                       , // Callback when modal closes
		'callbackJsonp'            :   null                                                                       , // Callback for JSONP requests
		'callbackPageChange'       :   null                                                                       , // Callback on pagination page change
		'callbackDirectionsRequest':   null                                                                       , // Callback when directions are requested
		'callbackCloseDirections'  :   null                                                                       , // Callback when directions are closed
		'callbackNoResults'        :   null                                                                       , // Callback when no results are found
		'callbackListClick'        :   null                                                                       , // Callback on list item click
		'callbackMarkerClick'      :   null                                                                       , // Callback on marker click
		'callbackFilters'          :   null                                                                       , // Callback on filter change
		// Language options: These messages can be customized.
		'addressErrorAlert'        :   'Unable to find address'                                                   ,
		'autoGeocodeErrorAlert'    :   'Automatic location detection failed. Please fill in your address or zip code.',
		'distanceErrorAlert'       :   'Unfortunately, our closest location is more than '                        ,
		'mileLang'                 :   'mile'                                                                     ,
		'milesLang'                :   'miles'                                                                    ,
		'kilometerLang'            :   'kilometer'                                                                ,
		'kilometersLang'           :   'kilometers'                                                               ,
		'noResultsTitle'           :   'No results'                                                               ,
		'noResultsDesc'            :   'No locations were found with the given criteria. Please modify your selections or input.' ,
		'nextPage'                 :   'Next &raquo;'                                                            ,
		'prevPage'                 :   '&laquo; Prev'
	} ;

	/**
	 * Plugin Constructor
	 * Initializes the plugin instance.
	 * @param {HTMLElement} element - The DOM element to which the plugin is attached.
	 * @param {Object} options - User-defined options to override defaults.
	 */
	function Plugin ( element , options ) {
		// Store a reference to the jQuery object for the element.
		$this = $( element ) ;
		this.element = element ;

		// Merge default settings with user-provided options.
		this.settings = $.extend( { } , defaults , options ) ;
		this._defaults = defaults ;
		this._name = pluginName ;

		// Kick off the initialization process.
		this.init( ) ;
	}

	// Extend the Plugin prototype with various methods.
	$.extend( Plugin.prototype , {

		/**
		 * Initialization function.
		 * This method sets up the initial state and components of the plugin.
		 */
		init: function ( ) {
			// Determine EarthRadius for distance calculations based on unit.
			if ( this.settings.lengthUnit === 'km' ) {
				// Use kilometers.
				GeoCodeCalc.EarthRadius = 6367.0 ;
			}
			else {
				// Default to miles.
				GeoCodeCalc.EarthRadius = 3956.0 ;
			}

			// If data type is KML, treat it as XML for parsing.
			if ( this.settings.dataType === 'kml' ) {
				dataTypeRead = 'xml' ;
			}
			else {
				dataTypeRead = this.settings.dataType ;
			}

			// Set up Google Maps Directions Service if inline directions are enabled.
			if ( this.settings.inlineDirections === true ) {
				directionsDisplay = new google.maps.DirectionsRenderer( ) ;
				directionsService = new google.maps.DirectionsService( ) ;
				// Prepend a panel for directions display.
				$('.' + this.settings.locationList).prepend( '<div class="bh-sl-directions-panel"></div>' ) ;
			}

			// Store the initial map zoom setting.
			// This is useful if taxonomy filtering changes the zoom and it needs to be reset.
			originalZoom = this.settings.mapSettings.zoom ;

			// Register a Handlebars helper to clean up URLs for display.
			Handlebars.registerHelper( 'niceURL' , function ( url ) {
				if ( url ) {
					return url.replace( 'https://' , '' ).replace( 'http://' , '' ) ;
				}
			} ) ;

			// Apply taxonomy filtering if configured.
			if ( this.settings.taxonomyFilters !== null ) {
				this.taxonomyFiltering( ) ;
			}

			// If modal functionality is enabled, set up the modal structure.
			if ( this.settings.modal === true ) {
				// If filters exist, clone them into the modal.
				if ( this.settings.taxonomyFilters !== null ) {
					// Perform a deep clone of the filters.
					$('.' + this.settings.taxonomyFiltersContainer).clone( true , true ).prependTo( $this ) ;
				}

				// Wrap the plugin's element with modal divs.
				$this.wrap( '<div class="' + this.settings.overlay + '"><div class="' + this.settings.modalWindow + '"><div class="' + this.settings.modalContent + '">' ) ;
				// Add a close icon to the modal.
				$('.' + this.settings.modalWindow).prepend( '<div class="' + this.settings.closeIcon + '"></div>' ) ;
				// Initially hide the modal overlay.
				$('.' + this.settings.overlay).hide( ) ;
			}

			// Load the necessary Handlebars templates before proceeding.
			this._loadTemplates( ) ;
		} ,

		/**
		 * Destroys the plugin instance.
		 * Cleans up DOM elements, event listeners, and data associated with the plugin.
		 * Note: Google Maps instances are typically not destroyed, but reused as per Google's recommendation.
		 */
		destroy: function ( ) {
			// First, reset the plugin's internal state.
			this.reset( ) ;
			var $mapDiv = $( '#' + this.settings.mapID ) ;

			// Remove event listeners from Google Maps markers.
			if ( markers.length ) {
				for ( var i = 0 ; i <= markers.length ; i++ ) {
					google.maps.event.removeListener( markers[i] ) ;
				}
			}

			// Clear the location list markup.
			$( '.' + this.settings.locationList + ' ul' ).empty( ) ;

			// Remove map-related classes and content if the map is open.
			if ( $mapDiv.hasClass( 'bh-sl-map-open' ) ) {
				$mapDiv.empty( ).removeClass( 'bh-sl-map-open' ) ;
			}

			// Remove modal markup if modal was used.
			if ( this.settings.modal === true ) {
				$( '. ' + this.settings.overlay ).remove( ) ;
			}

			// Clear any inline map styling from the container.
			$mapDiv.attr( 'style' , '' ) ;

			// Hide the main plugin container.
			$this.hide( ) ;

			// Remove data associated with the DOM element.
			$.removeData( $this.get( 0 ) ) ;

			// Unbind namespaced events from the document.
			$( document ).off( pluginName ) ;

			// Unbind all events from the plugin's main element.
			$this.unbind( ) ;
		} ,

		/**
		 * Resets various internal states and clears data.
		 */
		reset: function ( ) {
			// Clear location and marker arrays.
			locationset = [ ] ;
			featuredset = [ ] ;
			normalset   = [ ] ;
			markers     = [ ] ;

			// Unbind click events from location list items.
			$( document ).off( 'click.' + pluginName , '.' + this.settings.locationList + ' li' ) ;

			// Remove directions close container if it exists.
			if ( $( '.' + this.settings.locationList + ' .bh-sl-close-directions-container' ).length ) {
				$( '.bh-sl-close-directions-container' ).remove( ) ;
			}
		} ,

		/**
		 * Displays notifications to the user.
		 * Uses a callback if provided, otherwise defaults to a standard alert.
		 *
		 * @param {string} notifyText - The message to be displayed.
		 */
		notify: function ( notifyText ) {
			if ( this.settings.callbackNotify ) {
				// Call the custom notification callback.
				this.settings.callbackNotify.call( this , notifyText ) ;
			}
			else {
				// Fallback to default alert.
				alert( notifyText ) ;
			}
		} ,

		/**
		 * Converts degrees to radians for geographical calculations.
		 * @param {number} v - Value in degrees.
		 * @returns {number} Value in radians.
		 */
		geoCodeCalcToRadian: function ( v ) {
			return v * ( Math.PI / 180 ) ;
		} ,

		/**
		 * Calculates the difference between two values in radians.
		 * @param {number} v1 - First value in degrees.
		 * @param {number} v2 - Second value in degrees.
		 * @returns {number} Difference in radians.
		 */
		geoCodeCalcDiffRadian: function ( v1 , v2 ) {
			return this.geoCodeCalcToRadian( v2 ) - this.geoCodeCalcToRadian( v1 ) ;
		} ,

		/**
		 * Calculates the distance between two geographical points using the Haversine formula.
		 * @param {number} lat1 - Latitude of the first point.
		 * @param {number} lng1 - Longitude of the first point.
		 * @param {number} lat2 - Latitude of the second point.
		 * @param {number} lng2 - Longitude of the second point.
		 * @param {number} radius - Earth's radius (in miles or kilometers).
		 * @returns {number} The distance between the two points.
		 */
		geoCodeCalcCalcDistance: function ( lat1 , lng1 , lat2 , lng2 , radius ) {
			return radius * 2 * Math.asin( Math.min( 1 , Math.sqrt( ( Math.pow( Math.sin( ( this.geoCodeCalcDiffRadian( lat1 , lat2 ) ) / 2.0 ) , 2.0 ) + Math.cos( this.geoCodeCalcToRadian( lat1 ) ) * Math.cos( this.geoCodeCalcToRadian( lat2 ) ) * Math.pow( Math.sin( ( this.geoCodeCalcDiffRadian( lng1 , lng2 ) ) / 2.0 ) , 2.0 ) ) ) ) ) ;
		} ,

		/**
		 * Retrieves a specific parameter from the URL's query string.
		 *
		 * @param {string} param - The name of the query string parameter to retrieve.
		 * @returns {string} The decoded value of the parameter, or an empty string if not found.
		 */
		getQueryString: function ( param ) {
			if ( param ) {
				// Escape special characters in the parameter name for regex.
				param = param.replace( /[\[]/ , '\\[' ).replace( /[\]]/ , '\\]' ) ;
				var regex = new RegExp( '[\\?&]' + param + '=([^&#]*)' ) ,
					results = regex.exec( location.search ) ;
				// Return the decoded value or an empty string.
				return ( results === null ) ? '' : decodeURIComponent( results[1].replace( /\+/g , ' ' ) ) ;
			}
		} ,

		/**
		 * Loads Handlebars templates from external files or inline script tags.
		 * This is a private method, indicated by the underscore prefix.
		 */
		_loadTemplates: function ( ) {
			var source ;
			var _this = this ; // Cache 'this' for use in callbacks.
			var templateError = '<div class="bh-sl-error">Error: Could not load plugin templates. Check the paths and ensure they have been uploaded. Paths will be wrong if you do not run this from a web server.</div>' ;

			// Handle KML templates specifically if external paths are used.
			if ( this.settings.dataType === 'kml' && this.settings.listTemplateID === null && this.settings.infowindowTemplateID === null ) {

				// Use $.when for parallel loading of multiple AJAX requests.
				$.when(
					// AJAX request for KML infowindow template.
					$.get( this.settings.KMLinfowindowTemplatePath , function ( template ) {
						source = template ;
						infowindowTemplate = Handlebars.compile( source ) ;
					} ) ,

					// AJAX request for KML locations list template.
					$.get( this.settings.KMLlistTemplatePath , function ( template ) {
						source = template ;
						listTemplate = Handlebars.compile( source ) ;
					} )
				).then( function ( ) {
					// If both templates load successfully, proceed to locator.
					_this.locator( ) ;

				} , function ( ) {
					// If KML templates fail to load, display an error.
					$( '.' + _this.settings.formContainer ).append( templateError ) ;
					throw new Error( 'Could not load storeLocator plugin templates' ) ;
				} ) ;
			}
			// Handle templates provided directly in script tags by ID.
			else if ( this.settings.listTemplateID !== null && this.settings.infowindowTemplateID !== null ) {
				// Compile infowindow template from script tag content.
				infowindowTemplate = Handlebars.compile( $( '#' + this.settings.infowindowTemplateID ).html( ) ) ;

				// Compile locations list template from script tag content.
				listTemplate = Handlebars.compile( $( '#' + this.settings.listTemplateID ).html( ) ) ;

				// Continue to the main script logic.
				_this.locator( ) ;
			}
			// Default case: Load JSON/XML templates from external paths.
			else {
				// Parallel loading of infowindow and list templates.
				$.when(
					// AJAX request for infowindow template.
					$.get( this.settings.infowindowTemplatePath , function ( template ) {
						source = template ;
						infowindowTemplate = Handlebars.compile( source ) ;
					} ) ,

					// AJAX request for locations list template.
					$.get( this.settings.listTemplatePath , function ( template ) {
						source = template ;
						listTemplate = Handlebars.compile( source ) ;
					} )
				).then( function ( ) {
					// If templates load successfully, proceed.
					_this.locator( ) ;

				} , function ( ) {
					// If JSON/XML templates fail to load, display an error.
					$( '.' + _this.settings.formContainer ).append( templateError ) ;
					throw new Error( 'Could not load storeLocator plugin templates' ) ;
				} ) ;
			}
		} ,

		/**
		 * The primary function that runs after templates are loaded.
		 * It prepares the map and sets up form event handlers.
		 */
		locator: function ( ) {
			// If slideMap is true, hide the map container initially.
			if ( this.settings.slideMap === true ) {
				$this.hide( ) ; // Conceal the map container.
			}

			// Start the plugin's core logic.
			this._start( ) ;

			// Set up event handlers for the search form.
			this._formEventHandler( ) ;
		} ,

		/**
		 * Sets up the event handler for the search form.
		 * This is a private method.
		 */
		_formEventHandler: function ( ) {
			var _this = this ; // Capture 'this' for use in event handlers.

			// Determine if a form element is used or if a custom button triggers the search.
			if ( this.settings.noForm === true ) {
				// If no form, attach click handler to a button.
				$( document ).on( 'click.' + pluginName , '.' + this.settings.formContainer + ' button' , function ( e ) {
					_this.processForm( e ) ;
				} ) ;
				// Also, handle "Enter" key press if the address input is focused.
				$( document ).on( 'keyup.' + pluginName , function ( e ) {
					if ( e.keyCode === 13 && $( '#' + _this.settings.addressID ).is( ':focus' ) ) {
						_this.processForm( e ) ;
					}
				} ) ;
			}
			else {
				// If a form is used, attach a submit handler.
				$( document ).on( 'submit.' + pluginName , '#' + this.settings.formID , function ( e ) {
					_this.processForm( e ) ;
				} ) ;
			}
		} ,

		/**
		 * Handles AJAX requests to fetch location data.
		 * This is a private method.
		 *
		 * @param {number} lat - Latitude of the origin.
		 * @param {number} lng - Longitude of the origin.
		 * @param {string} address - Street address of the origin.
		 * @returns {Object} A deferred object that resolves with the data.
		 */
		_getData: function ( lat , lng , address ) {
			var _this = this ;

			// Execute the 'callbackBeforeSend' if defined.
			if ( this.settings.callbackBeforeSend ) {
				this.settings.callbackBeforeSend.call( this , lat , lng , address ) ;
			}

			// Check for raw data provided directly in settings.
			if ( _this.settings.dataRaw !== null ) {
				// If XML raw data, parse it.
				if ( dataTypeRead === 'xml' ) {
					return $.parseXML( _this.settings.dataRaw ) ;
				}
				// If JSON raw data, parse it.
				else if ( dataTypeRead === 'json' ) {
					return $.parseJSON( _this.settings.dataRaw ) ;
				}
			}
			// If data is to be fetched remotely via AJAX.
			else {
				var d = $.Deferred( ) ; // Create a deferred object for async operations.

				// Show loading indicator if enabled.
				if ( this.settings.loading === true ) {
					$( '.' + this.settings.formContainer ).append( '<div class="' + this.settings.loadingContainer + '"></div>' ) ;
				}

				// Perform the AJAX request.
				$.ajax( {
					type         : 'GET'                                                                                   ,
					url          : this.settings.dataLocation + ( this.settings.dataType === 'jsonp' ? ( this.settings.dataLocation.match( /\?/ ) ? '&' : '?' ) + 'callback=?' : '' ) , // Append callback for JSONP
					// Pass origin coordinates and address for backend processing.
					data         : {
						'origLat'    : lat                                                                                 ,
						'origLng'    : lng                                                                                 ,
						'origAddress': address
					}                                                                                                      ,
					dataType     : dataTypeRead                                                                            ,
					jsonpCallback: ( this.settings.dataType === 'jsonp' ? this.settings.callbackJsonp : null )
				} ).done( function ( p ) {
					d.resolve( p ) ; // Resolve the deferred object on success.

					// Remove loading indicator.
					if ( _this.settings.loading === true ) {
						$( '.' + _this.settings.formContainer + ' .' + _this.settings.loadingContainer ).remove( ) ;
					}
				} ).fail( d.reject ) ; // Reject the deferred object on failure.
				return d.promise( ) ; // Return the promise aspect of the deferred object.
			}
		} ,

		/**
		 * Initializes the plugin based on default location, full map, or HTML5 geolocation settings.
		 * This is a private method.
		 */
		_start: function ( ) {
			var _this = this ; // Cache 'this' for use in callbacks.

			// If a default location is specified.
			if ( this.settings.defaultLoc === true ) {
				// Reverse geocode to get the address for the directions link.
				var r = new this.reverseGoogleGeocode( this ) ;
				var latlng = new google.maps.LatLng( this.settings.defaultLat , this.settings.defaultLng ) ;
				r.geocode( { 'latLng': latlng } , function ( data ) {
					if ( data !== null ) {
						var originAddress = data.address ;
						mappingObj.lat = _this.settings.defaultLat ;
						mappingObj.lng = _this.settings.defaultLng ;
						mappingObj.origin = originAddress ;
						_this.mapping( mappingObj ) ; // Initialize map with default location.
					} else {
						// Notify if reverse geocoding fails.
						_this.notify( _this.settings.addressErrorAlert ) ;
					}
				} ) ;
			}

			// If the full map should be displayed on start.
			if ( this.settings.fullMapStart === true ) {
				// Check for address/search parameters in the querystring.
				if ( this.settings.querystringParams === true && this.getQueryString( this.settings.addressID ) || this.getQueryString( this.settings.searchID ) ) {
					this.processForm( null ) ; // Process form with querystring data.
				}
				else {
					this.mapping( null ) ; // Simply display the map without a specific search.
				}
			}

			// If HTML5 geolocation is enabled.
			if ( this.settings.autoGeocode === true ) {
				if ( navigator.geolocation ) {
					navigator.geolocation.getCurrentPosition( function ( position ) {
						// Call autoGeocodeQuery with the position data.
						_this.autoGeocodeQuery( position ) ;
					} , function ( error ) {
						// Handle geolocation errors.
						_this._autoGeocodeError( error ) ;
					} ) ;
				}
			}
		} ,

		/**
		 * Constructor for a Google Geocode service wrapper.
		 * Used to geocode the origin (user-entered location).
		 *
		 * @param {Object} thisObj - The context of the plugin instance.
		 */
		googleGeocode: function ( thisObj ) {
			var _this = thisObj ; // Store the plugin context.
			var geocoder = new google.maps.Geocoder( ) ; // Create a new Google Geocoder instance.
			this.geocode = function ( request , callbackFunction ) {
				// This method will be implemented further within the plugin.
			}