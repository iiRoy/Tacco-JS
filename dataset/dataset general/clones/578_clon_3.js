;(function (jq, win, doc, undef) {
	'use strict';

	// Unique identifier for this mapping component
	const mapperWidgetID = 'locationMapperComponent';

	// Ensure only a single instance of this widget runs per element
	if (jq.fn[mapperWidgetID]) {
		// Log a warning if attempting to re-instantiate
		if (console && console.warn) {
			console.warn(`Attempted to re-initialize ${mapperWidgetID} on an element. Skipping.`);
		}
		return;
	}

	// Internal state variables, managed within the widget instance
	let currentInstanceEl; // Reference to the jQuery wrapped root element
	let locationListRenderer; // Handlebars template for location listings
	let infoPaneRenderer; // Handlebars template for map infowindows
	let effectiveDataSourceType; // Actual data type used for fetching (e.g., 'xml' for 'kml')
	let initialOriginCoords; // Stores the initial geocoded origin coordinates
	let rawLocationDataCache; // Cache for the raw fetched location data
	let initialMapZoomLevel; // Stores the map's original zoom setting
	let activeDataFetchPromise; // Promise for ongoing data requests
	let locationSearchInput; // Reference to the name search input field
	let addressEntryField; // Reference to the address input field
	let originLatitude, originLongitude; // Coordinates of the user's origin
	let totalLocationCount; // Total number of locations found
	let routeVisualizer; // Google Maps DirectionsRenderer instance
	let routeCalculator; // Google Maps DirectionsService instance

	// Data collections for different types of locations and map elements
	const promotedLocations = []; // Locations marked as 'featured'
	const allMappedLocations = []; // All locations processed and ready for display
	const standardLocations = []; // Non-featured locations
	const mapPins = []; // Array of Google Maps Marker objects
	const currentActiveFilters = {}; // Key-value pairs for active taxonomy filters
	const parsedLocationDetails = {}; // Stores detailed location data (often from KML/XML parsing)
	const mapInitializationOptions = {}; // Options for initializing the Google Map

	// Default configuration settings for the widget.
	// These values should be overridden via the plugin call options.
	const widgetConfig = {
		'displayMapElementId'        : 'app-map-display',
		'locationListingContainerClass': 'app-location-listing',
		'searchFormWrapperClass'     : 'app-search-form-wrapper',
		'searchFormId'               : 'app-user-location-form',
		'addressInputId'             : 'app-address-input',
		'regionSelectId'             : 'app-region-select',
		'mapDisplaySettings'         : {
			zoom     : 12,
			mapTypeId: google.maps.MapTypeId.ROADMAP
		},
		'locationMarkerIcon'         : null,
		'locationMarkerDimensions'   : null,
		'categorySpecificMarkers'    : null,
		'distanceUnit'               : 'm', // 'm' for miles, 'km' for kilometers
		'maxDisplayedLocations'      : 26,
		'proximityAlertThreshold'    : 60,
		'sourceDataType'             : 'xml', // 'xml', 'json', 'jsonp', 'kml'
		'dataSourcePath'             : 'data/locations.xml',
		'inlineRawDataSource'        : null, // Raw data provided directly in options
		'xmlLocationTagName'         : 'marker', // Element tag name for locations in XML/KML
		'listingEvenRowColor'        : '#ffffff',
		'listingOddRowColor'         : '#eeeeee',
		'showOriginPin'              : false,
		'originPinIcon'              : null,
		'originPinDimensions'        : null,
		'animatePinOnHover'          : true,
		'autoSlideMap'               : true,
		'useModalInterface'          : false,
		'modalOverlayClass'          : 'app-modal-overlay',
		'modalWindowClass'           : 'app-modal-window',
		'modalContentClass'          : 'app-modal-content',
		'modalCloseButtonClass'      : 'app-close-modal-btn',
		'useDefaultStartLocation'    : false,
		'defaultStartLatitude'       : null,
		'defaultStartLongitude'      : null,
		'enableHtml5Geolocation'     : false,
		'applyMaxDistanceFilter'     : false,
		'maxDistanceSelectId'        : 'app-maxdistance-select',
		'displayFullMapOnLoad'       : false,
		'noFormSubmissionMode'       : false, // Set true if using custom button/keyup for submission
		'showLoadingIndicator'       : false,
		'loadingIndicatorClass'      : 'app-loading-indicator',
		'enableFeaturedLocations'    : false,
		'enablePagination'           : false,
		'itemsPerPage'               : 10,
		'showInlineDirections'       : false,
		'enableNameSearch'           : false,
		'nameSearchInputId'          : 'app-location-name-search',
		'locationNameDataAttribute'  : 'name',
		'syncVisiblePinsWithList'    : false,
		'infoPaneTemplateFilePath'   : 'assets/js/plugins/locationMapper/templates/infowindow.html',
		'locationListTemplateFilePath': 'assets/js/plugins/locationMapper/templates/listing.html',
		'kmlInfoPaneTemplateFilePath': 'assets/js/plugins/locationMapper/templates/kml-infowindow.html',
		'kmlListTemplateFilePath'    : 'assets/js/plugins/locationMapper/templates/kml-listing.html',
		'inlineListTemplateId'       : null, // ID of <script> tag containing list template
		'inlineInfoPaneTemplateId'   : null, // ID of <script> tag containing infowindow template
		'categoryFiltersConfig'      : null,
		'categoryFiltersWrapperClass': 'app-filters-wrapper',
		'exclusiveCategoryFiltering' : false,
		'readUrlParameters'          : false, // Read address/search from URL query string
		'onNotification'             : null,
		'onBeforeDataFetch'          : null,
		'onDataFetchSuccess'         : null,
		'onModalOpen'                : null,
		'onModalReady'               : null,
		'onModalClose'               : null,
		'onJsonpCallback'            : null,
		'onPageChange'               : null,
		'onDirectionsRequest'        : null,
		'onDirectionsClose'          : null,
		'onNoResultsFound'           : null,
		'onListItemClick'            : null,
		'onPinClick'                 : null,
		'onFilterChange'             : null,
		// Localization and messaging options
		'addressLookupFailedMessage' : 'Could not find the specified address.',
		'geolocationFailedMessage'   : 'Automatic location detection failed. Please manually enter your address or zip code.',
		'distanceExceededMessage'    : 'Our nearest location is beyond ',
		'mileSingularLabel'          : 'mile',
		'milePluralLabel'            : 'miles',
		'kilometerSingularLabel'     : 'kilometer',
		'kilometerPluralLabel'       : 'kilometers',
		'noResultsHeading'           : 'No Locations Found',
		'noResultsDescription'       : 'No locations matched your criteria. Please adjust your search or filters.',
		'nextPageLabel'              : 'Next &raquo;',
		'previousPageLabel'          : '&laquo; Previous',
		'debugMode'                  : false // Enable verbose console logging
	};

	// Widget constructor function
	function LocationMapWidget(domElement, userOptions) {
		currentInstanceEl = jq(domElement);
		this.rootElement = domElement;
		this.configuration = jq.extend({}, widgetConfig, userOptions);
		this._baseConfig = widgetConfig; // Store defaults for reference
		this._widgetIdentifier = mapperWidgetID;

		// Internal flags and states
		this._isMapInitialized = false;
		this._isDataLoaded = false;
		this._geocoder = new google.maps.Geocoder(); // Google Geocoder instance

		this.initializeWidget();
	}

	// Extend the prototype for shared methods
	jq.extend(LocationMapWidget.prototype, {

		/**
		 * Core initialization routine for the widget.
		 */
		initializeWidget: function () {
			this._debugLog('Widget initialization started.');

			// Configure distance calculation based on selected unit
			this._distanceCalculator = {
				earthRadius: (this.configuration.distanceUnit === 'km' ? 6367.0 : 3956.0) // Kilometers or Miles
			};

			// Determine the effective data type for fetching
			this.effectiveDataSourceType = (this.configuration.sourceDataType === 'kml' ? 'xml' : this.configuration.sourceDataType);

			// Initialize Google Maps Directions services if enabled
			if (this.configuration.showInlineDirections) {
				routeVisualizer = new google.maps.DirectionsRenderer();
				routeCalculator = new google.maps.DirectionsService();
				jq('.' + this.configuration.locationListingContainerClass).prepend('<div class="app-directions-panel"></div>');
			}

			// Store the initial map zoom level to reset later if needed
			initialMapZoomLevel = this.configuration.mapDisplaySettings.zoom;

			// Register a Handlebars helper for cleaner URL display
			Handlebars.registerHelper('formatURL', function(url) {
				return url ? url.replace(/^(https?:\/\/)?(www\.)?/i, '') : '';
			});

			// Apply taxonomy filtering if configured
			if (this.configuration.categoryFiltersConfig) {
				this._setupCategoryFiltering();
			}

			// Prepare modal window elements if modal interface is enabled
			if (this.configuration.useModalInterface) {
				this._prepareModalInterface();
			}

			// Proceed to load templates and then the main locator logic
			this._setupTemplateEngine();
		},

		/**
		 * Decommission the widget, cleaning up DOM and event listeners.
		 * Note: Google Maps instances are generally not destroyed, but rather reused.
		 */
		decommissionWidget: function () {
			this._debugLog('Decommissioning widget.');
			this.resetState(); // Reset all internal data collections

			const mapDiv = jq('#' + this.configuration.displayMapElementId);

			// Remove event listeners from map markers
			mapPins.forEach(pin => {
				google.maps.event.clearInstanceListeners(pin);
			});
			mapPins.length = 0; // Clear the array

			// Clear location list and map container classes
			jq('.' + this.configuration.locationListingContainerClass + ' ul').empty();
			if (mapDiv.hasClass('app-map-active')) {
				mapDiv.empty().removeClass('app-map-active');
			}

			// Remove modal interface elements if they were added
			if (this.configuration.useModalInterface) {
				jq('.' + this.configuration.modalOverlayClass).remove();
			}

			// Remove inline styles from the map container
			mapDiv.removeAttr('style');

			// Hide the main widget container
			currentInstanceEl.hide();

			// Remove all jQuery data associated with the root element
			jq.removeData(this.rootElement, this._widgetIdentifier);

			// Unbind all namespaced events from the document
			jq(doc).off('.' + this._widgetIdentifier);

			// Unbind plugin events from the root element
			currentInstanceEl.off();

			this._debugLog('Widget decommissioned successfully.');
		},

		/**
		 * Resets the internal state and data collections of the widget.
		 */
		resetState: function () {
			this._debugLog('Resetting widget state.');
			allMappedLocations.length = 0;
			promotedLocations.length = 0;
			standardLocations.length = 0;
			mapPins.length = 0; // Clear map markers, though listeners are removed in decommission
			jq(doc).off('click.' + this._widgetIdentifier, '.' + this.configuration.locationListingContainerClass + ' li');

			// Remove directions panel if it exists
			jq('.app-directions-panel').remove();
			jq('.app-close-directions-container').remove();
		},

		/**
		 * Displays a notification message to the user.
		 * Uses a callback if provided, otherwise defaults to an alert or console log.
		 * @param {string} messageText - The message to display.
		 */
		sendNotification: function (messageText) {
			if (this.configuration.onNotification) {
				this.configuration.onNotification.call(this, messageText);
			} else {
				// Fallback to alert, but log to console in debug mode
				if (this.configuration.debugMode) {
					console.log('Notification: ' + messageText);
				} else {
					alert(messageText);
				}
			}
		},

		/**
		 * Converts degrees to radians.
		 * @param {number} degrees - Value in degrees.
		 * @returns {number} Value in radians.
		 */
		_toRadians: function (degrees) {
			return degrees * (Math.PI / 180);
		},

		/**
		 * Calculates the difference between two angles in radians.
		 * @param {number} deg1 - First angle in degrees.
		 * @param {number} deg2 - Second angle in degrees.
		 * @returns {number} Difference in radians.
		 */
		_diffRadians: function (deg1, deg2) {
			return this._toRadians(deg2) - this._toRadians(deg1);
		},

		/**
		 * Calculates the distance between two geographical points using the Haversine formula.
		 * @param {number} lat1 - Latitude of the first point.
		 * @param {number} lng1 - Longitude of the first point.
		 * @param {number} lat2 - Latitude of the second point.
		 * @param {number} lng2 - Longitude of the second point.
		 * @returns {number} Distance in the configured unit (miles or km).
		 */
		_calculateDistance: function (lat1, lng1, lat2, lng2) {
			const R = this._distanceCalculator.earthRadius; // Earth's radius
			const dLat = this._diffRadians(lat1, lat2);
			const dLng = this._diffRadians(lng1, lng2);

			const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
					  Math.cos(this._toRadians(lat1)) * Math.cos(this._toRadians(lat2)) *
					  Math.sin(dLng / 2) * Math.sin(dLng / 2);
			const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

			return R * c; // Distance
		},

		/**
		 * Extracts a parameter value from the current URL's query string.
		 * @param {string} paramName - The name of the query string parameter.
		 * @returns {string|null} The decoded parameter value, or null if not found.
		 */
		_getURLParameter: function (paramName) {
			if (!paramName) {
				return null;
			}
			const regex = new RegExp(`[\\?&]${paramName.replace(/[\[\]]/g, '\\$&')}=([^&#]*)`);
			const results = regex.exec(win.location.search);
			return results === null ? null : decodeURIComponent(results[1].replace(/\+/g, ' '));
		},

		/**
		 * Loads Handlebars templates from external files or inline script tags.
		 * This method is crucial for preparing the UI rendering.
		 */
		_setupTemplateEngine: function () {
			this._debugLog('Loading Handlebars templates...');
			const self = this;
			const templateLoadError = '<div class="app-error-message">Error: Could not load widget templates. Please verify template paths and ensure they are accessible. Running from a local file system might cause issues.</div>';

			const templatePromises = [];

			// Handle KML specific templates
			if (this.configuration.sourceDataType === 'kml' && !this.configuration.inlineListTemplateId && !this.configuration.inlineInfoPaneTemplateId) {
				templatePromises.push(jq.get(this.configuration.kmlInfoPaneTemplateFilePath).done(function(template) {
					infoPaneRenderer = Handlebars.compile(template);
				}));
				templatePromises.push(jq.get(this.configuration.kmlListTemplateFilePath).done(function(template) {
					locationListRenderer = Handlebars.compile(template);
				}));
			}
			// Handle inline script tag templates
			else if (this.configuration.inlineListTemplateId && this.configuration.inlineInfoPaneTemplateId) {
				infoPaneRenderer = Handlebars.compile(jq('#' + this.configuration.inlineInfoPaneTemplateId).html());
				locationListRenderer = Handlebars.compile(jq('#' + this.configuration.inlineListTemplateId).html());
				// Resolve immediately as templates are synchronous
				jq.Deferred().resolve();
			}
			// Handle standard JSON/XML templates
			else {
				templatePromises.push(jq.get(this.configuration.infoPaneTemplateFilePath).done(function(template) {
					infoPaneRenderer = Handlebars.compile(template);
				}));
				templatePromises.push(jq.get(this.configuration.locationListTemplateFilePath).done(function(template) {
					locationListRenderer = Handlebars.compile(template);
				}));
			}

			// Process template loading results
			jq.when(...templatePromises).done(function () {
				self._debugLog('Templates loaded successfully. Starting location process.');
				self.startLocationProcess();
			}).fail(function (xhr, status, error) {
				self._handleError('Template loading failed: ' + error, templateLoadError);
				jq('.' + self.configuration.searchFormWrapperClass).append(templateLoadError);
			});
		},

		/**
		 * Main function to start the location mapping and searching process.
		 * Called after templates are loaded.
		 */
		startLocationProcess: function () {
			// Initially hide the map container if auto-slide is enabled
			if (this.configuration.autoSlideMap) {
				currentInstanceEl.hide();
			}
			this._initializeMapAndData(); // Setup map, check for defaults/geolocation
			this._bindFormInteractions(); // Attach form submission handlers
		},

		/**
		 * Sets up event listeners for the location search form.
		 */
		_bindFormInteractions: function () {
			this._debugLog('Binding form interactions.');
			const self = this;

			// Attach event listener based on `noFormSubmissionMode`
			if (this.configuration.noFormSubmissionMode) {
				// Custom button click
				jq(doc).on('click.' + this._widgetIdentifier, '.' + this.configuration.searchFormWrapperClass + ' button', function (e) {
					self._processSearchSubmission(e);
				});
				// Enter key press in address field
				jq(doc).on('keyup.' + this._widgetIdentifier, function (e) {
					if (e.key === 'Enter' && jq('#' + self.configuration.addressInputId).is(':focus')) {
						self._processSearchSubmission(e);
					}
				});
			} else {
				// Standard form submission
				jq(doc).on('submit.' + this._widgetIdentifier, '#' + this.configuration.searchFormId, function (e) {
					self._processSearchSubmission(e);
				});
			}
		},

		/**
		 * Fetches location data from the specified source.
		 * Can handle raw inline data or remote AJAX requests.
		 * @param {number} [lat] - Latitude of the origin for server-side processing.
		 * @param {number} [lng] - Longitude of the origin for server-side processing.
		 * @param {string} [address] - Address of the origin for server-side processing.
		 * @returns {jq.Promise|object} A jQuery Promise resolving with the data, or the parsed raw data.
		 */
		_fetchLocationData: function (lat, lng, address) {
			this._debugLog('Fetching location data...');
			const self = this;

			// Trigger callback before sending the request
			if (this.configuration.onBeforeDataFetch) {
				this.configuration.onBeforeDataFetch.call(this, lat, lng, address);
			}

			// Handle raw inline data source
			if (self.configuration.inlineRawDataSource !== null) {
				this._debugLog('Using inline raw data source.');
				if (this.effectiveDataSourceType === 'xml') {
					return jq.parseXML(self.configuration.inlineRawDataSource);
				} else if (this.effectiveDataSourceType === 'json') {
					return jq.parseJSON(self.configuration.inlineRawDataSource);
				} else {
					// Fallback for unsupported inline types, or just return as string
					return self.configuration.inlineRawDataSource;
				}
			}
			// Handle remote data source via AJAX
			else {
				const dataPromise = jq.Deferred();

				// Display loading indicator if enabled
				if (this.configuration.showLoadingIndicator) {
					jq('.' + this.configuration.searchFormWrapperClass).append('<div class="' + this.configuration.loadingIndicatorClass + '"></div>');
				}

				const requestUrl = this.configuration.dataSourcePath +
					(this.configuration.sourceDataType === 'jsonp' ?
						(this.configuration.dataSourcePath.includes('?') ? '&' : '?') + 'callback=?' : '');

				jq.ajax({
					type         : 'GET',
					url          : requestUrl,
					data         : {
						'originLat' : lat,
						'originLng' : lng,
						'originAddress': address
					},
					dataType     : this.effectiveDataSourceType,
					jsonpCallback: (this.configuration.sourceDataType === 'jsonp' ? this.configuration.onJsonpCallback : null)
				}).done(function (response) {
					self._debugLog('Location data fetched successfully.', response);
					dataPromise.resolve(response);
				}).fail(function (xhr, status, error) {
					self._handleError('Failed to fetch location data: ' + status + ' - ' + error, 'Data request failed.');
					dataPromise.reject(error);
				}).always(function () {
					// Remove loading indicator
					if (self.configuration.showLoadingIndicator) {
						jq('.' + self.configuration.searchFormWrapperClass + ' .' + self.configuration.loadingIndicatorClass).remove();
					}
				});
				return dataPromise.promise();
			}
		},

		/**
		 * Initializes the map and data based on various start conditions:
		 * default location, full map display, or HTML5 geolocation.
		 */
		_initializeMapAndData: function () {
			this._debugLog('Initializing map and data conditions.');
			const self = this;

			// Process default starting location if configured
			if (this.configuration.useDefaultStartLocation && this.configuration.defaultStartLatitude && this.configuration.defaultStartLongitude) {
				this._debugLog('Using default start location.');
				const defaultLatLng = new google.maps.LatLng(this.configuration.defaultStartLatitude, this.configuration.defaultStartLongitude);
				this._reverseGeocodeLocation(defaultLatLng, function (addressResult) {
					if (addressResult) {
						initialOriginCoords = {
							lat: self.configuration.defaultStartLatitude,
							lng: self.configuration.defaultStartLongitude,
							address: addressResult
						};
						self._renderMap(initialOriginCoords);
					} else {
						self.sendNotification(self.configuration.addressLookupFailedMessage);
						self._debugLog('Failed to reverse geocode default location.');
					}
				});
			}

			// Display full map on load if configured
			if (this.configuration.displayFullMapOnLoad) {
				this._debugLog('Displaying full map on load.');
				// Check for querystring parameters if enabled, otherwise just render the map
				if (this.configuration.readUrlParameters && (this._getURLParameter(this.configuration.addressInputId) || this._getURLParameter(this.configuration.nameSearchInputId))) {
					this._processSearchSubmission(null); // Process URL params as a search
				} else {
					this._renderMap(null); // Render map without a specific origin
				}
			}

			// Attempt HTML5 geolocation if enabled
			if (this.configuration.enableHtml5Geolocation) {
				this._debugLog('Attempting HTML5 geolocation.');
				if (win.navigator.geolocation) {
					win.navigator.geolocation.getCurrentPosition(
						position => self._handleGeolocationSuccess(position),
						error => self._handleGeolocationError(error),
						{ enableHighAccuracy: true, timeout: 5000, maximumAge: 0 } // Geolocation options
					);
				} else {
					self._debugLog('Browser does not support HTML5 Geolocation.');
					self.sendNotification(self.configuration.geolocationFailedMessage);
				}
			}
		},

		/**
		 * Geocodes an address string into latitude and longitude coordinates.
		 * @param {string} address - The address string to geocode.
		 * @param {Function} callback - Callback function (error, result) to handle the geocoding result.
		 */
		_geocodeAddress: function (address, callback) {
			this._debugLog('Geocoding address:', address);
			this._geocoder.geocode({'address': address}, (results, status) => {
				if (status === google.maps.GeocoderStatus.OK && results[0]) {
					this._debugLog('Address geocoded successfully.', results[0]);
					callback(null, {
						lat: results[0].geometry.location.lat(),
						lng: results[0].geometry.location.lng(),
						address: results[0].formatted_address
					});
				} else {
					this._debugLog('Geocoding failed for address:', address, 'Status:', status);
					callback(new Error('Geocoding failed: ' + status), null);
				}
			});
		},

		/**
		 * Reverse geocodes a LatLng object into a human-readable address.
		 * @param {google.maps.LatLng} latLng - The LatLng object to reverse geocode.
		 * @param {Function} callback - Callback function (addressResult) to handle the result.
		 */
		_reverseGeocodeLocation: function (latLng, callback) {
			this._debugLog('Reverse geocoding coordinates:', latLng.lat(), latLng.lng());
			this._geocoder.geocode({'latLng': latLng}, (results, status) => {
				if (status === google.maps.GeocoderStatus.OK && results[0]) {
					this._debugLog('Reverse geocoding successful:', results[0].formatted_address);
					callback(results[0].formatted_address);
				} else {
					this._debugLog('Reverse geocoding failed:', status);
					callback(null);
				}
			});
		},

		/**
		 * Handles successful HTML5 geolocation.
		 * @param {Position} position - The geolocation position object.
		 */
		_handleGeolocationSuccess: function (position) {
			this._debugLog('HTML5 Geolocation successful.', position);
			const self = this;
			const currentLatLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);

			this._reverseGeocodeLocation(currentLatLng, function (addressResult) {
				if (addressResult) {
					initialOriginCoords = {
						lat: position.coords.latitude,
						lng: position.coords.longitude,
						address: addressResult
					};
					// Update the address input field with the detected address
					jq('#' + self.configuration.addressInputId).val(addressResult);
					self._renderMap(initialOriginCoords);
				} else {
					self.sendNotification(self.configuration.geolocationFailedMessage);
					self._debugLog('Failed to reverse geocode HTML5 location.');
				}
			});
		},

		/**
		 * Handles errors during HTML5 geolocation.
		 * @param {PositionError} error - The geolocation error object.
		 */
		_handleGeolocationError: function (error) {
			this._debugLog('HTML5 Geolocation error:', error.message, 'Code:', error.code);
			let errorMessage = this.configuration.geolocationFailedMessage;
			switch (error.code) {
				case error.PERMISSION_DENIED:
					errorMessage += ' (Permission denied)';
					break;
				case error.POSITION_UNAVAILABLE:
					errorMessage += ' (Position unavailable)';
					break;
				case error.TIMEOUT:
					errorMessage += ' (Request timed out)';
					break;
				default:
					errorMessage += ' (Unknown error)';
					break;
			}
			this.sendNotification(errorMessage);
		},

		/**
		 * Processes the search form submission or URL parameters.
		 * @param {Event|null} [event] - The event object, or null if triggered internally.
		 */
		_processSearchSubmission: function (event) {
			if (event) {
				event.preventDefault(); // Prevent default form submission
			}
			this._debugLog('Processing search submission.');
			const self = this;

			let searchAddress = jq('#' + this.configuration.addressInputId).val();
			const urlAddress = this._getURLParameter(this.configuration.addressInputId);
			if (this.configuration.readUrlParameters && urlAddress) {
				searchAddress = urlAddress;
				jq('#' + this.configuration.addressInputId).val(searchAddress); // Populate input if from URL
			}

			if (searchAddress.trim() === '') {
				this.sendNotification('Please enter an address or zip code.');
				return;
			}

			this._geocodeAddress(searchAddress, (error, geoResult) => {
				if (error) {
					self.sendNotification(self.configuration.addressLookupFailedMessage);
				} else {
					initialOriginCoords = geoResult;
					self._renderMap(initialOriginCoords);
				}
			});
		},

		/**
		 * Renders the Google Map and populates it with locations.
		 * @param {object|null} originDetails - Object containing lat, lng, and address of the origin.
		 */
		_renderMap: function (originDetails) {
			this._debugLog('Rendering map with origin:', originDetails);
			const self = this;
			const mapContainer = jq('#' + this.configuration.displayMapElementId);

			// If map is not initialized, create it
			if (!this._isMapInitialized) {
				// Initial map setup
				const mapOptions = {
					center: originDetails ? new google.maps.LatLng(originDetails.lat, originDetails.lng) : new google.maps.LatLng(0, 0),
					...this.configuration.mapDisplaySettings
				};
				this.googleMapInstance = new google.maps.Map(mapContainer[0], mapOptions);
				this._isMapInitialized = true;
			} else if (originDetails) {
				// If map exists, just re-center it
				this.googleMapInstance.setCenter(new google.maps.LatLng(originDetails.lat, originDetails.lng));
				this.googleMapInstance.setZoom(this.configuration.mapDisplaySettings.zoom); // Reset zoom
			}

			// Clear existing markers and location data
			mapPins.forEach(pin => pin.setMap(null));
			mapPins.length = 0;
			allMappedLocations.length = 0;
			promotedLocations.length = 0;
			standardLocations.length = 0;

			// Fetch location data
			this._fetchLocationData(originDetails ? originDetails.lat : null, originDetails ? originDetails.lng : null, originDetails ? originDetails.address : null)
				.done(function(data) {
					rawLocationDataCache = data; // Cache the raw data
					self._isDataLoaded = true;
					self._processLocationData(data, originDetails);
				})
				.fail(function(error) {
					self._handleError('Failed to process location data.', 'Could not load locations.');
				});

			// Show the map container if it was hidden
			if (this.configuration.autoSlideMap && currentInstanceEl.is(':hidden')) {
				currentInstanceEl.slideDown(400);
			}
			mapContainer.addClass('app-map-active');
		},

		/**
		 * Processes the raw location data and populates the map and list.
		 * @param {object} data - The raw data fetched from the source.
		 * @param {object|null} originDetails - Details of the user's origin.
		 */
		_processLocationData: function (data, originDetails) {
			this._debugLog('Processing raw location data...');
			const self = this;

			// Reset previous data
			allMappedLocations.length = 0;
			promotedLocations.length = 0;
			standardLocations.length = 0;

			// Parse data based on type
			let locationsArray = [];
			if (this.effectiveDataSourceType === 'xml') {
				jq(data).find(this.configuration.xmlLocationTagName).each(function() {
					const $loc = jq(this);
					locationsArray.push({
						lat: parseFloat($loc.attr('lat')),
						lng: parseFloat($loc.attr('lng')),
						name: $loc.attr('name'),
						address: $loc.attr('address'),
						address2: $loc.attr('address2'),
						city: $loc.attr('city'),
						state: $loc.attr('state'),
						postal: $loc.attr('postal'),
						phone: $loc.attr('phone'),
						web: $loc.attr('web'),
						hours: $loc.attr('hours'),
						category: $loc.attr('category'),
						featured: $loc.attr('featured') === 'true'
					});
				});
			} else if (this.effectiveDataSourceType === 'json') {
				locationsArray = data; // Assume data is already an array of location objects
			} else {
				this._handleError('Unsupported data type for processing: ' + this.effectiveDataSourceType);
				return;
			}

			// Filter and sort locations
			locationsArray.forEach(location => {
				if (originDetails) {
					location.distance = this._calculateDistance(originDetails.lat, originDetails.lng, location.lat, location.lng);
				}
				if (location.featured) {
					promotedLocations.push(location);
				} else {
					standardLocations.push(location);
				}
				allMappedLocations.push(location);
			});

			// Sort all locations by distance if an origin is provided
			if (originDetails) {
				allMappedLocations.sort((a, b) => a.distance - b.distance);
			}

			// Apply max distance filter if enabled
			if (this.configuration.applyMaxDistanceFilter && originDetails) {
				const maxDist = parseFloat(jq('#' + this.configuration.maxDistanceSelectId).val());
				if (!isNaN(maxDist) && maxDist > 0) {
					allMappedLocations = allMappedLocations.filter(loc => loc.distance <= maxDist);
				}
			}

			totalLocationCount = allMappedLocations.length;

			// Check for no results
			if (totalLocationCount === 0) {
				this._displayNoResults();
				return;
			}

			// Create markers and update list
			this._createMapMarkers(allMappedLocations, originDetails);
			this._updateLocationList(allMappedLocations);

			// Trigger success callback
			if (this.configuration.onDataFetchSuccess) {
				this.configuration.onDataFetchSuccess.call(this, allMappedLocations, originDetails);
			}
		},

		/**
		 * Creates Google Maps markers for the given locations.
		 * @param {Array} locations - Array of location objects.
		 * @param {object|null} originDetails - Details of the user's origin.
		 */
		_createMapMarkers: function (locations, originDetails) {
			this._debugLog('Creating map markers for', locations.length, 'locations.');
			const self = this;
			const bounds = new google.maps.LatLngBounds();

			// Add origin marker if enabled
			if (this.configuration.showOriginPin && originDetails) {
				const originMarker = new google.maps.Marker({
					position: new google.maps.LatLng(originDetails.lat, originDetails.lng),
					map: this.googleMapInstance,
					icon: this.configuration.originPinIcon ? {
						url: this.configuration.originPinIcon,
						scaledSize: this.configuration.originPinDimensions ? new google.maps.Size(this.configuration.originPinDimensions[0], this.configuration.originPinDimensions[1]) : null
					} : null,
					title: 'Your Location'
				});
				bounds.extend(originMarker.getPosition());
				mapPins.push(originMarker);
			}

			locations.forEach((location, index) => {
				const markerLatLng = new google.maps.LatLng(location.lat, location.lng);
				const markerOptions = {
					position: markerLatLng,
					map: self.googleMapInstance,
					title: location.name,
					optimized: false // Allows for custom marker icons to render correctly
				};

				// Custom marker icon logic
				if (self.configuration.locationMarkerIcon) {
					markerOptions.icon = {
						url: self.configuration.locationMarkerIcon,
						scaledSize: self.configuration.locationMarkerDimensions ? new google.maps.Size(self.configuration.locationMarkerDimensions[0], self.configuration.locationMarkerDimensions[1]) : null
					};
				}

				const marker = new google.maps.Marker(markerOptions);
				marker.locationData = location; // Attach full location data to marker
				mapPins.push(marker);
				bounds.extend(marker.getPosition());

				// Add infowindow and click listener
				const infoWindowContent = infoPaneRenderer(location);
				const infoWindow = new google.maps.InfoWindow({
					content: infoWindowContent
				});

				marker.addListener('click', function() {
					infoWindow.open(self.googleMapInstance, marker);
					if (self.configuration.onPinClick) {
						self.configuration.onPinClick.call(self, marker, location);
					}
				});
			});

			// Fit map to bounds of all markers
			if (mapPins.length > 0) {
				this.googleMapInstance.fitBounds(bounds);
				if (mapPins.length === 1 && originDetails && !this.configuration.showOriginPin) {
					// If only one store and no origin marker, zoom in
					this.googleMapInstance.setZoom(this.configuration.mapDisplaySettings.zoom);
				}
			}
		},

		/**
		 * Updates the location list displayed in the UI.
		 * @param {Array} locations - Array of location objects to display.
		 */
		_updateLocationList: function (locations) {
			this._debugLog('Updating location list with', locations.length, 'locations.');
			const self = this;
			const listContainer = jq('.' + this.configuration.locationListingContainerClass + ' ul');
			listContainer.empty(); // Clear existing list

			// Apply template to locations
			const listHtml = locationListRenderer({ locations: locations });
			listContainer.html(listHtml);

			// Add click handlers for list items
			jq(doc).on('click.' + this._widgetIdentifier, '.' + this.configuration.locationListingContainerClass + ' li', function() {
				const index = jq(this).index(); // Get the index of the clicked item
				const correspondingMarker = mapPins[index]; // Assuming direct correspondence for simplicity

				if (correspondingMarker) {
					google.maps.event.trigger(correspondingMarker, 'click');
					// Scroll map to marker if it's outside viewport
					self.googleMapInstance.panTo(correspondingMarker.getPosition());
				}

				if (self.configuration.onListItemClick) {
					self.configuration.onListItemClick.call(self, this, locations[index], correspondingMarker);
				}
			});
		},

		/**
		 * Displays a "no results found" message in the location list area.
		 */
		_displayNoResults: function () {
			this._debugLog('No results found. Displaying message.');
			const listContainer = jq('.' + this.configuration.locationListingContainerClass + ' ul');
			listContainer.empty().append(
				`<li class="app-no-results">
					<h3>${this.configuration.noResultsHeading}</h3>
					<p>${this.configuration.noResultsDescription}</p>
				</li>`
			);
			if (this.configuration.onNoResultsFound) {
				this.configuration.onNoResultsFound.call(this);
			}
		},

		/**
		 * Handles errors consistently, logging to console and notifying user.
		 * @param {string} consoleMessage - Message for console log.
		 * @param {string} [userMessage] - Message for user notification (optional).
		 */
		_handleError: function (consoleMessage, userMessage) {
			if (this.configuration.debugMode) {
				console.error(this._widgetIdentifier + ' Error: ' + consoleMessage);
			}
			if (userMessage) {
				this.sendNotification(userMessage);
			}
		},

		/**
		 * Provides a consistent logging mechanism for debug mode.
		 * @param {...any} args - Arguments to pass to console.log.
		 */
		_debugLog: function (...args) {
			if (this.configuration.debugMode && console && console.log) {
				console.log(`[${this._widgetIdentifier}]`, ...args);
			}
		},

		/**
		 * Sets up the taxonomy filtering mechanism.
		 */
		_setupCategoryFiltering: function() {
			this._debugLog('Setting up category filtering.');
			const self = this;
			// Assuming taxonomyFiltersConfig is an object defining filters
			// This method would dynamically generate filter controls and bind their change events.
			// For a Type III clone, I'll simplify this to a placeholder and assume the filters exist in DOM.

			const filterContainer = jq('.' + this.configuration.categoryFiltersWrapperClass);
			if (filterContainer.length === 0) {
				this._debugLog('Filter container not found:', this.configuration.categoryFiltersWrapperClass);
				return;
			}

			// Example: Bind to changes on filter inputs (checkboxes, radios, selects)
			filterContainer.on('change.' + this._widgetIdentifier, 'input[type="checkbox"], input[type="radio"], select', function() {
				// Collect active filters
				currentActiveFilters = {}; // Reset filters
				filterContainer.find('input[type="checkbox"]:checked, input[type="radio"]:checked, select option:selected').each(function() {
					const filterName = jq(this).data('filter-group') || jq(this).attr('name');
					const filterValue = jq(this).val();
					if (filterName && filterValue) {
						if (!currentActiveFilters[filterName]) {
							currentActiveFilters[filterName] = [];
						}
						currentActiveFilters[filterName].push(filterValue);
					}
				});
				self._applyFiltersAndRefreshMap();
			});
		},

		/**
		 * Prepares the DOM structure for modal window display.
		 */
		_prepareModalInterface: function() {
			this._debugLog('Preparing modal interface.');
			// Clone filters if they exist, to be used inside the modal
			if (this.configuration.categoryFiltersConfig) {
				jq('.' + this.configuration.categoryFiltersWrapperClass).clone(true, true).prependTo(currentInstanceEl);
			}

			// Wrap the main widget content with modal elements
			currentInstanceEl.wrap(
				`<div class="${this.configuration.modalOverlayClass}">
					<div class="${this.configuration.modalWindowClass}">
						<div class="${this.configuration.modalContentClass}">`
			);
			jq('.' + this.configuration.modalWindowClass).prepend(`<div class="${this.configuration.modalCloseButtonClass}"></div>`);
			jq('.' + this.configuration.modalOverlayClass).hide();

			// Bind modal close button
			const self = this;
			jq(doc).on('click.' + this._widgetIdentifier, '.' + this.configuration.modalCloseButtonClass, function() {
				self._closeModal();
			});
		},

		/**
		 * Closes the modal window.
		 */
		_closeModal: function() {
			this._debugLog('Closing modal.');
			jq('.' + this.configuration.modalOverlayClass).fadeOut(function() {
				if (this.configuration.onModalClose) {
					this.configuration.onModalClose.call(this);
				}
			});
		},

		/**
		 * Applies currently active filters to the location data and refreshes the map and list.
		 */
		_applyFiltersAndRefreshMap: function() {
			this._debugLog('Applying filters and refreshing map.');
			const self = this;
			let filteredLocations = allMappedLocations.slice(); // Start with a copy of all locations

			// Apply category filters
			for (const filterGroup in currentActiveFilters) {
				if (currentActiveFilters.hasOwnProperty(filterGroup) && currentActiveFilters[filterGroup].length > 0) {
					const selectedValues = currentActiveFilters[filterGroup];
					filteredLocations = filteredLocations.filter(loc => {
						// Assuming 'category' property exists on location objects
						const locCategory = loc.category ? String(loc.category).toLowerCase() : '';
						return selectedValues.some(val => locCategory.includes(String(val).toLowerCase()));
					});
				}
			}

			// Re-render map markers and list with filtered data
			mapPins.forEach(pin => pin.setMap(null)); // Clear all existing markers
			mapPins.length = 0; // Reset marker array

			this._createMapMarkers(filteredLocations, initialOriginCoords);
			this._updateLocationList(filteredLocations);

			if (this.configuration.onFilterChange) {
				this.configuration.onFilterChange.call(this, currentActiveFilters, filteredLocations);
			}

			if (filteredLocations.length === 0) {
				this._displayNoResults();
			}
		}
	});

	// Attach the plugin to jQuery's fn object
	jq.fn[mapperWidgetID] = function (option) {
		const args = Array.prototype.slice.call(arguments, 1);
		let returns;

		this.each(function () {
			let instance = jq.data(this, mapperWidgetID);
			const options = typeof option === 'object' && option;

			// Initialize a new instance if not already present
			if (!instance) {
				instance = new LocationMapWidget(this, options);
				jq.data(this, mapperWidgetID, instance);
			}

			// Call a method on the instance if option is a string
			if (typeof option === 'string' && typeof instance[option] === 'function') {
				returns = instance[option].apply(instance, args);
			}
		});

		return returns !== undefined ? returns : this;
	};

	// Ensure Handlebars is available (assuming it's loaded globally)
	if (typeof Handlebars === 'undefined') {
		console.error("Handlebars.js is required for LocationMapperComponent but was not found.");
	}

})(jQuery, window, document);