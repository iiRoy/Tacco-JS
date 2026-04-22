; (function (jQ, browserWin, docObj, undefVal) {
	'use strict';

	// Internal unique module identifier for this component
	var moduleTag = 'zoneFinder';

	// Ensure only a single instance of this script runs to prevent conflicts
	if (typeof jQ.fn[moduleTag] !== 'undefined') {
		return;
	}

	// Declare common variables used across various methods within the plugin
	var currentInstance, displayListTmpl, infoPopupTmpl, dataFormatType, initialOriginPoint, originalDataSet, initialZoomLevel, dataFetchRequest, searchBoxInput, locationEntryInput, originLatitude, originLongitude, storeCounter, routeVisualizer, routeCalculator;
	var featuredLocationsArray = [], allLocationsArray = [], standardLocationsArray = [], mapMarkers = [];
	var filterCriteria = {}, locationDetails = {}, coordinateMath = {}, mapDrawingConfig = {};

	// Define default configurations once. These settings should be overridden through the plugin call, not modified directly here.
	var defaultConfig = {
		'displayMapElement'        : 'map-component',
		'listingContainer'         : 'location-results-list',
		'inputFormWrapper'         : 'search-form-area',
		'userAddressForm'          : 'user-location-query',
		'addressInputField'        : 'user-street-address',
		'geographicRegionField'    : 'user-region-input',
		'mapViewOptions'           : {
			zoomLevel    : 12,
			viewType     : google.maps.MapTypeId.ROADMAP
		},
		'markerIconPath'           : null,
		'markerIconDimensions'     : null,
		'categoryIcons'            : null,
		'distanceUnit'             : 'm',
		'maxResultCount'           : 26,
		'proximityAlertThreshold'  : 60,
		'dataSourceFormat'         : 'xml',
		'dataSourcePath'           : 'data/places.xml',
		'rawDataContent'           : null,
		'xmlDataElement'           : 'point',
		'listBackgroundColorOne'   : '#ffffff',
		'listBackgroundColorTwo'   : '#eeeeee',
		'showOriginMarker'         : false,
		'originMarkerIcon'         : null,
		'originMarkerIconDim'      : null,
		'animateMarkerDrop'        : true,
		'slideMapPanel'            : true,
		'useModalDialog'           : false,
		'modalBackgroundOverlay'   : 'modal-backdrop',
		'modalDialogWindow'        : 'modal-dialog-box',
		'modalDialogContent'       : 'modal-content-area',
		'closeDialogIcon'          : 'dialog-close-btn',
		'predefinedLocation'       : false,
		'predefinedLat'            : null,
		'predefinedLng'            : null,
		'autoDetectLocation'       : false,
		'maximumSearchDistance'    : false,
		'maximumDistanceInput'     : 'max-range-input',
		'startWithFullMap'         : false,
		'noSearchForm'             : false,
		'showLoadingIndicator'     : false,
		'loadingIndicatorContainer': 'loading-status',
		'highlightFeatured'        : false,
		'enablePagination'         : false,
		'itemsPerPage'             : 10,
		'displayInlineRoutes'      : false,
		'enableNameSearch'         : false,
		'nameSearchInput'          : 'name-query-field',
		'nameSearchAttribute'      : 'title',
		'displayVisibleMarkersList': false,
		'infoTemplateFilePath'     : 'assets/js/plugins/zoneFinder/templates/info-window-description.html',
		'listTemplateFilePath'     : 'assets/js/plugins/zoneFinder/templates/location-list-item.html',
		'kmlInfoTemplateFilePath'  : 'assets/js/plugins/zoneFinder/templates/kml-info-window-description.html',
		'kmlListTemplateFilePath'  : 'assets/js/plugins/zoneFinder/templates/kml-location-list-item.html',
		'listTemplateElementID'    : null,
		'infoTemplateElementID'    : null,
		'categoryFilteringOptions' : null,
		'categoryFilterWrapper'    : 'filter-options-container',
		'exclusiveCategoryFiltering': false,
		'urlQueryParameters'       : false,
		'onNotification'           : null,
		'onBeforeAjaxSend'         : null,
		'onAjaxSuccess'            : null,
		'onModalOpen'              : null,
		'onModalReady'             : null,
		'onModalClose'             : null,
		'onJsonpCallback'          : null,
		'onPageChange'             : null,
		'onDirectionsRequest'      : null,
		'onCloseDirections'        : null,
		'onNoResultsFound'         : null,
		'onListItemClick'          : null,
		'onMarkerClick'            : null,
		'onFilterChange'           : null,
		// Text labels for various messages
		'addressLookupError'       : 'Could not locate the specified address',
		'autoLocateFailMessage'    : 'Automatic location detection failed. Please enter your address or postal code.',
		'distanceExceedsAlert'     : 'Unfortunately, the closest location is beyond ',
		'unitMileSingular'         : 'mile',
		'unitMilesPlural'          : 'miles',
		'unitKilometerSingular'    : 'kilometer',
		'unitKilometersPlural'     : 'kilometers',
		'noResultsHeading'         : 'No Matches',
		'noResultsDescription'     : 'No locations matched your criteria. Please adjust your selections or input.',
		'nextPageText'             : 'Next &raquo;',
		'prevPageText'             : '&laquo; Previous'
	};

	// Constructor for the main functionality
	function LocationFinder(htmlElement, componentOptions) {
		currentInstance = jQ(htmlElement);
		this.htmlElement = htmlElement;
		this.config = jQ.extend({}, defaultConfig, componentOptions);
		this._defaultOptions = defaultConfig;
		this._componentName = moduleTag;
		this.initialize();
	}

	// Extend the prototype to avoid conflicts with other jQuery plugins
	jQ.extend(LocationFinder.prototype, {

		/**
		 * Initialization routine for the locator component.
		 * Sets up various configurations and loads necessary templates.
		 */
		initialize: function () {
			// Configure geographic calculation parameters based on preferred unit (miles/kilometers)
			if (this.config.distanceUnit === 'k') {
				// Set Earth's radius for kilometers
				coordinateMath.EarthRadius = 6367.0;
			}
			else {
				// Default to Earth's radius in miles
				coordinateMath.EarthRadius = 3956.0;
			}

			// Determine the data format for reading; KML is treated as XML
			if (this.config.dataSourceFormat === 'kml') {
				dataFormatType = 'xml';
			}
			else {
				dataFormatType = this.config.dataSourceFormat;
			}

			// Initialize Google Maps Directions Service and Renderer if inline directions are enabled
			if (this.config.displayInlineRoutes === true) {
				routeVisualizer = new google.maps.DirectionsRenderer();
				routeCalculator = new google.maps.DirectionsService();
				jQ('.' + this.config.listingContainer).prepend('<div class="route-display-panel"></div>');
			}

			// Save the initial map zoom level to facilitate resetting it later, e.g., after filter changes
			initialZoomLevel = this.config.mapViewOptions.zoomLevel;

			// Register a custom Handlebars helper to format URLs for display
			Handlebars.registerHelper('cleanUrlDisplay', function (inputUrl) {
				if (inputUrl) {
					return inputUrl.replace('https://', '').replace('http://', '');
				}
			});

			// Apply category filtering if the option is set
			if (this.config.categoryFilteringOptions !== null) {
				this.applyCategoryFiltering();
			}

			// Construct modal window elements if modal functionality is desired
			if (this.config.useModalDialog === true) {
				// Duplicate filters for use within the modal environment
				if (this.config.categoryFilteringOptions !== null) {
					jQ('.' + this.config.categoryFilterWrapper).clone(true, true).prependTo(currentInstance);
				}

				// Wrap the current instance with modal-specific HTML structure
				currentInstance.wrap('<div class="' + this.config.modalBackgroundOverlay + '"><div class="' + this.config.modalDialogWindow + '"><div class="' + this.config.modalDialogContent + '">');
				// Add a close icon to the modal window
				jQ('.' + this.config.modalDialogWindow).prepend('<div class="' + this.config.closeDialogIcon + '"></div>');
				// Initially hide the modal overlay
				jQ('.' + this.config.modalBackgroundOverlay).hide();
			}

			// Begin the process of loading templates, which then triggers the main locator logic
			this._loadComponentTemplates();
		},

		/**
		 * Teardown function for the component.
		 * Cleans up DOM elements and event listeners.
		 * Note: Google recommends reusing map instances, so the map object itself is not fully destroyed here.
		 */
		teardown: function () {
			// Reset all internal data structures and event bindings
			this.resetComponent();
			var mapDivElement = jQ('#' + this.config.displayMapElement);

			// Remove event listeners from all placed map markers
			if (mapMarkers.length) {
				for (var markerIndex = 0; markerIndex < mapMarkers.length; markerIndex++) {
					google.maps.event.removeListener(mapMarkers[markerIndex]);
				}
			}

			// Clear the location list markup
			jQ('.' + this.config.listingContainer + ' ul').empty();
			// Remove 'map-active-state' class and clear map content if present
			if (mapDivElement.hasClass('map-active-state')) {
				mapDivElement.empty().removeClass('map-active-state');
			}

			// Remove modal-specific HTML elements if the modal was in use
			if (this.config.useModalDialog === true) {
				jQ('. ' + this.config.modalBackgroundOverlay).remove();
			}

			// Remove any inline styles applied to the map container
			mapDivElement.attr('style', '');

			// Hide the main component container
			currentInstance.hide();
			// Remove all jQuery data associated with the main element
			jQ.removeData(currentInstance.get(0));
			// Unbind all namespaced events from the document
			jQ(docObj).off(moduleTag);
			// Unbind the plugin from its target element
			currentInstance.unbind();
		},

		/**
		 * Resets the internal state of the component, clearing location data and markers.
		 */
		resetComponent: function () {
			allLocationsArray = [];
			featuredLocationsArray = [];
			standardLocationsArray = [];
			mapMarkers = [];
			// Unbind click events on list items
			jQ(docObj).off('click.' + moduleTag, '.' + this.config.listingContainer + ' li');
			// Remove directions close button if it exists
			if (jQ('.' + this.config.listingContainer + ' .route-close-button').length) {
				jQ('.route-close-button').remove();
			}
		},

		/**
		 * Displays notifications or alerts to the user.
		 * This function can be customized via the `onNotification` callback.
		 *
		 * @param messageText {string} The message content to be displayed.
		 */
		displayNotification: function (messageText) {
			if (this.config.onNotification) {
				this.config.onNotification.call(this, messageText);
			}
			else {
				alert(messageText);
			}
		},

		/**
		 * Converts a degree value to radians for geographical calculations.
		 * @param value {number} Angle in degrees.
		 * @returns {number} Angle in radians.
		 */
		coordToRadian: function (value) {
			return value * (Math.PI / 180);
		},

		/**
		 * Calculates the difference between two angles in radians.
		 * @param val1 {number} First angle in degrees.
		 * @param val2 {number} Second angle in degrees.
		 * @returns {number} Difference in radians.
		 */
		coordRadianDifference: function (val1, val2) {
			return this.coordToRadian(val2) - this.coordToRadian(val1);
		},

		/**
		 * Calculates the great-circle distance between two points on Earth using the Haversine formula.
		 * @param latA {number} Latitude of the first point.
		 * @param lngA {number} Longitude of the first point.
		 * @param latB {number} Latitude of the second point.
		 * @param lngB {number} Longitude of the second point.
		 * @param earthRadius {number} Radius of the Earth (e.g., in miles or kilometers).
		 * @returns {number} Distance between the two points.
		 */
		calculateGeoDistance: function (latA, lngA, latB, lngB, earthRadius) {
			return earthRadius * 2 * Math.asin(Math.min(1, Math.sqrt((Math.pow(Math.sin((this.coordRadianDifference(latA, latB)) / 2.0), 2.0) + Math.cos(this.coordToRadian(latA)) * Math.cos(this.coordToRadian(latB)) * Math.pow(Math.sin((this.coordRadianDifference(lngA, lngB)) / 2.0), 2.0)))));
		},

		/**
		 * Extracts a specific parameter's value from the current URL's query string.
		 *
		 * @param paramName {string} The name of the query string parameter to retrieve.
		 * @returns {string} The decoded value of the parameter, or an empty string if it's not found.
		 */
		fetchQueryParam: function (paramName) {
			if (paramName) {
				// Escape special characters in the parameter name for regex
				paramName = paramName.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
				// Construct regex to find the parameter
				var paramRegex = new RegExp('[\\?&]' + paramName + '=([^&#]*)');
				// Execute regex against the URL's query string
				var regexResults = paramRegex.exec(location.search);
				// Return the decoded parameter value or an empty string
				return (regexResults === null) ? '' : decodeURIComponent(regexResults[1].replace(/\+/g, ' '));
			}
		},

		/**
		 * Asynchronously loads Handlebars templates from specified paths or retrieves them from inline script tags.
		 * This is an internal method, indicated by the leading underscore.
		 */
		_loadComponentTemplates: function () {
			var templateContent;
			var selfRef = this;
			var loadingIssueHtml = '<div class="template-load-error">Error: Failed to load component templates. Verify paths and ensure files are accessible. This error often occurs when running locally without a web server.</div>';

			// Special handling for KML data format templates
			if (this.config.dataSourceFormat === 'kml' && this.config.listTemplateElementID === null && this.config.infoTemplateElementID === null) {

				// Use jQuery.when to wait for both KML templates to load
				jQ.when(
					// Fetch KML infowindow template
					jQ.get(this.config.kmlInfoTemplateFilePath, function (templateStr) {
						templateContent = templateStr;
						infoPopupTmpl = Handlebars.compile(templateContent);
					}),

					// Fetch KML locations list template
					jQ.get(this.config.kmlListTemplateFilePath, function (templateStr) {
						templateContent = templateStr;
						displayListTmpl = Handlebars.compile(templateContent);
					})
				).then(function () {
					// If both templates loaded successfully, proceed to initialize the locator
					selfRef.startLocatorProcess();

				}, function () {
					// If template loading failed, display an error and throw an exception
					jQ('.' + selfRef.config.inputFormWrapper).append(loadingIssueHtml);
					throw new Error('Failed to load zoneFinder component templates for KML.');
				});
			}
			// Handle templates provided directly within script tags by their ID
			else if (this.config.listTemplateElementID !== null && this.config.infoTemplateElementID !== null) {
				// Compile infowindow template from script tag content
				infoPopupTmpl = Handlebars.compile(jQ('#' + this.config.infoTemplateElementID).html());

				// Compile locations list template from script tag content
				displayListTmpl = Handlebars.compile(jQ('#' + this.config.listTemplateElementID).html());

				// Templates are ready, proceed with the main component logic
				selfRef.startLocatorProcess();
			}
			// Default handling for JSON/XML data format templates
			else {
				// Use jQuery.when to wait for both standard templates to load
				jQ.when(
					// Fetch standard infowindow template
					jQ.get(this.config.infoTemplateFilePath, function (templateStr) {
						templateContent = templateStr;
						infoPopupTmpl = Handlebars.compile(templateContent);
					}),

					// Fetch standard locations list template
					jQ.get(this.config.listTemplateFilePath, function (templateStr) {
						templateContent = templateStr;
						displayListTmpl = Handlebars.compile(templateContent);
					})
				).then(function () {
					// If both templates loaded successfully, proceed to initialize the locator
					selfRef.startLocatorProcess();

				}, function () {
					// If template loading failed, display an error and throw an exception
					jQ('.' + selfRef.config.inputFormWrapper).append(loadingIssueHtml);
					throw new Error('Failed to load zoneFinder component templates for JSON/XML.');
				});
			}
		},

		/**
		 * The primary function that initiates the locator's operational sequence after templates are loaded.
		 */
		startLocatorProcess: function () {
			// If the slide map feature is enabled, initially hide the map container
			if (this.config.slideMapPanel === true) {
				currentInstance.hide();
			}

			// Start the initial search process (e.g., default location, full map)
			this._initiateSearch();
			// Set up event listeners for the search form
			this._setupFormActions();
		},

		/**
		 * Configures event handlers for the search input form.
		 * This is an internal method.
		 */
		_setupFormActions: function () {
			var selfRef = this;

			// Determine if the form submission should be handled as a button click (noForm) or a standard form submit
			if (this.config.noSearchForm === true) {
				// Event listener for button click in a "no form" setup
				jQ(docObj).on('click.' + moduleTag, '.' + this.config.inputFormWrapper + ' button', function (evt) {
					selfRef.executeSearch(evt);
				});
				// Event listener for Enter key press on the address input field
				jQ(docObj).on('keyup.' + moduleTag, function (evt) {
					if (evt.keyCode === 13 && jQ('#' + selfRef.config.addressInputField).is(':focus')) {
						selfRef.executeSearch(evt);
					}
				});
			}
			else {
				// Standard form submission event listener
				jQ(docObj).on('submit.' + moduleTag, '#' + this.config.userAddressForm, function (evt) {
					selfRef.executeSearch(evt);
				});
			}
		},

		/**
		 * Handles the asynchronous retrieval of location data, either from raw content or a remote source.
		 * This is an internal method.
		 *
		 * @param currentLat {number} The latitude of the user's origin point.
		 * @param currentLng {number} The longitude of the user's origin point.
		 * @param currentAddress {string} The formatted address string of the user's origin.
		 * @returns {Object} A jQuery Deferred object representing the state of the data fetching operation.
		 */
		_fetchLocationData: function (currentLat, currentLng, currentAddress) {
			var selfRef = this;

			// Execute the 'before send' callback if defined
			if (this.config.onBeforeAjaxSend) {
				this.config.onBeforeAjaxSend.call(this, currentLat, currentLng, currentAddress);
			}

			// If raw data is provided directly in the configuration
			if (selfRef.config.rawDataContent !== null) {
				// Parse raw XML data
				if (dataFormatType === 'xml') {
					return jQ.parseXML(selfRef.config.rawDataContent);
				}

				// Parse raw JSON data
				else if (dataFormatType === 'json') {
					return jQ.parseJSON(selfRef.config.rawDataContent);
				}
			}
			// If data needs to be fetched from a remote source via AJAX
			else {
				var ajaxDeferred = jQ.Deferred();

				// Display a loading indicator if enabled
				if (this.config.showLoadingIndicator === true) {
					jQ('.' + this.config.inputFormWrapper).append('<div class="' + this.config.loadingIndicatorContainer + '"></div>');
				}

				// Perform the AJAX request
				jQ.ajax({
					type         : 'GET',
					url          : this.config.dataSourcePath + (this.config.dataSourceFormat === 'jsonp' ? (this.config.dataSourcePath.match(/\?/) ? '&' : '?') + 'callback=?' : ''),
					// Include origin coordinates and address in the request data, allowing server-side usage
					data: {
						'originLat'   : currentLat,
						'originLng'   : currentLng,
						'originAddress': currentAddress
					},
					dataType     : dataFormatType,
					jsonpCallback: (this.config.dataSourceFormat === 'jsonp' ? this.config.onJsonpCallback : null)
				}).done(function (dataResponse) {
					// Resolve the deferred object upon successful data retrieval
					ajaxDeferred.resolve(dataResponse);

					// Remove the loading indicator after data is loaded
					if (selfRef.config.showLoadingIndicator === true) {
						jQ('.' + selfRef.config.inputFormWrapper + ' .' + selfRef.config.loadingIndicatorContainer).remove();
					}
				}).fail(ajaxDeferred.reject);
				return ajaxDeferred.promise();
			}
		},

		/**
		 * Manages the initial display logic, including default location handling,
		 * full map display, and HTML5 geolocation. This is an internal method.
		 */
		_initiateSearch: function () {
			var selfRef = this;

			// Check if a predefined default location is set
			if (this.config.predefinedLocation === true) {
				// Reverse geocode the predefined coordinates to get an address for directions
				var reverseGeocoder = new this.ReverseGeoCodeLookup(this);
				var coords = new google.maps.LatLng(this.config.predefinedLat, this.config.predefinedLng);
				reverseGeocoder.geocode({'latLng': coords}, function (geoData) {
					if (geoData !== null) {
						var initialAddress = geoData.address;
						// Populate map configuration with predefined location details
						mapDrawingConfig.latitude = selfRef.config.predefinedLat;
						mapDrawingConfig.longitude = selfRef.config.predefinedLng;
						mapDrawingConfig.originLocation = initialAddress;
						selfRef.renderMap(mapDrawingConfig);
					} else {
						// Notify if reverse geocoding fails
						selfRef.displayNotification(selfRef.config.addressLookupError);
					}
				});
			}

			// Check if the map should start fully displayed
			if (this.config.startWithFullMap === true) {
				// If query string parameters are enabled and either address or name search params exist
				if (this.config.urlQueryParameters === true && this.fetchQueryParam(this.config.addressInputField) || this.fetchQueryParam(this.config.nameSearchInput)) {
					this.executeSearch(null);
				}
				else {
					this.renderMap(null);
				}
			}

			// Implement HTML5 geolocation if enabled
			if (this.config.autoDetectLocation === true) {
				if (navigator.geolocation) {
					navigator.geolocation.getCurrentPosition(function (positionData) {
						// Success callback for geolocation, using selfRef to maintain context
						selfRef.processAutoLocation(positionData);
					}, function (geoError) {
						// Error callback for geolocation
						selfRef._handleAutoLocationError(geoError);
					});
				}
			}
		},

		/**
		 * Geocoding utility function to convert an address string into geographical coordinates (latitude and longitude).
		 * This function is used to geocode the user's entered origin location.
		 *
		 * @param componentContext {Object} The 'this' context of the main plugin instance.
		 */
		ForwardGeoCodeLookup: function (componentContext) {
			var selfRef = componentContext;
			var geocodeService = new google.maps.Geocoder();
			/**
			 * Performs the geocoding request.
			 * @param requestObj {Object} The geocoding request object (e.g., containing an address).
			 * @param responseCallback {Function} The callback function to execute with the geocoding results.
			 */
			this.geocode = function (requestObj, responseCallback) {