class GeographicCalculations {
    static earthRadius = 3956.0; // Default: miles. Will be updated to km if config says so.

    static convertToRadians(degrees) {
        return degrees * (Math.PI / 180);
    }

    static calculateRadianDifference(deg1, deg2) {
        return this.convertToRadians(deg2) - this.convertToRadians(deg1);
    }

    static computeHaversineDistance(latitude1, longitude1, latitude2, longitude2) {
        const deltaLat = this.calculateRadianDifference(latitude1, latitude2);
        const deltaLng = this.calculateRadianDifference(longitude1, longitude2);

        const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
                  Math.cos(this.convertToRadians(latitude1)) * Math.cos(this.convertToRadians(latitude2)) *
                  Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return this.earthRadius * c;
    }
}

class LocationServiceApp {
    // Default configuration settings
    static defaultConfiguration = {
        'mapDisplayId'             : 'bh-sl-map',
        'siteListingContainer'     : 'bh-sl-loc-list',
        'inputFormWrapper'         : 'bh-sl-form-container',
        'searchFormId'             : 'bh-sl-user-location',
        'addressInputId'           : 'bh-sl-address',
        'regionInputId'            : 'bh-sl-region',
        'mapSetup'                 : {
            zoomLevel: 12,
            mapType  : google.maps.MapTypeId.ROADMAP
        },
        'pinIconPath'              : null,
        'pinIconDimensions'        : null,
        'categoryPinIcons'         : null,
        'distanceUnit'             : 'm', // 'm' for miles, 'km' for kilometers
        'maxLocationsToShow'       : 26,
        'distanceWarningThreshold' : 60,
        'dataTransferType'         : 'xml',
        'dataSourceURL'            : 'data/locations.xml',
        'rawInputData'             : null,
        'xmlLocationElement'       : 'marker',
        'listStripingColor1'       : '#ffffff',
        'listStripingColor2'       : '#eeeeee',
        'originPinDisplay'         : false,
        'originPinIconPath'        : null,
        'originPinIconDimensions'  : null,
        'animatePinOnSelect'       : true,
        'slideMapPanel'            : true,
        'useModalWindow'           : false,
        'modalOverlayClass'        : 'bh-sl-overlay',
        'modalWindowClass'         : 'bh-sl-modal-window',
        'modalContentClass'        : 'bh-sl-modal-content',
        'modalCloseIconClass'      : 'bh-sl-close-icon',
        'initialLocation'          : false,
        'initialLatitude'          : null,
        'initialLongitude'         : null,
        'autoDetectLocation'       : false,
        'maximumSearchDistance'    : false,
        'maximumDistanceInputId'   : 'bh-sl-maxdistance',
        'showFullMapOnLoad'        : false,
        'noFormSubmission'         : false,
        'showLoadingIndicator'     : false,
        'loadingIndicatorContainer': 'bh-sl-loading',
        'highlightFeatured'        : false,
        'enablePagination'         : false,
        'itemsPerPage'             : 10,
        'showInlineDirections'     : false,
        'enableNameSearch'         : false,
        'nameSearchInputId'        : 'bh-sl-search',
        'locationNameAttribute'    : 'name',
        'displayVisibleMarkersList': false,
        'infoBoxTemplateURL'       : 'assets/js/plugins/storeLocator/templates/infowindow-description.html',
        'locationListTemplateURL'  : 'assets/js/plugins/storeLocator/templates/location-list-description.html',
        'kmlInfoBoxTemplateURL'    : 'assets/js/plugins/storeLocator/templates/kml-infowindow-description.html',
        'kmlLocationListTemplateURL': 'assets/js/plugins/storeLocator/templates/kml-location-list-description.html',
        'locationListTemplateId'   : null,
        'infoBoxTemplateId'        : null,
        'categoryFilters'          : null,
        'categoryFiltersContainer' : 'bh-sl-filters-container',
        'exclusiveCategoryFiltering': false,
        'useQueryStringParameters' : false,
        'onUserAlert'              : null,
        'onDataFetchStart'         : null,
        'onDataFetchSuccess'       : null,
        'onModalOpen'              : null,
        'onModalReady'             : null,
        'onModalClose'             : null,
        'onJsonpCallback'          : null,
        'onPageChange'             : null,
        'onDirectionsRequest'      : null,
        'onCloseDirections'        : null,
        'onNoResults'              : null,
        'onListEntryClick'         : null,
        'onPinClick'               : null,
        'onFilterChange'           : null,
        // Language options
        'addressNotFoundMessage'   : 'Unable to find address',
        'autoLocateErrorMessage'   : 'Automatic location detection failed. Please fill in your address or zip code.',
        'distanceExceededMessage'  : 'Unfortunately, our closest location is more than ',
        'mileTerm'                 : 'mile',
        'milesTerm'                : 'miles',
        'kilometerTerm'            : 'kilometer',
        'kilometersTerm'           : 'kilometers',
        'noResultsHeading'         : 'No results',
        'noResultsDescription'     : 'No locations were found with the given criteria. Please modify your selections or input.',
        'nextPageLabel'            : 'Next &raquo;',
        'previousPageLabel'        : '&laquo; Prev'
    };

    // Internal state variables
    containerElement;
    configuration;
    processedDataType;
    initialLocationText;
    initialDataSource;
    initialMapLevel;
    locationSearchElement;
    addressEntryElement;
    originLatitude;
    originLongitude;
    storeCount;
    routeVisualizer;
    routeCalculator;

    premiumSites = [];
    allLocations = [];
    standardSites = [];
    mapPins = [];

    activeFilters = {};
    mapInstanceConfiguration = {};

    currentInfoWindow = null;
    currentMapInstance = null;

    // Bound event handlers for removal
    boundFormClickHandler;
    boundFormKeyupHandler;
    boundFormSubmitHandler;
    boundListClickHandler;

    // Template rendering functions (replacing Handlebars compiled templates)
    infoBoxRenderer = (data) => `<div>${JSON.stringify(data)}</div>`; // Default fallback
    locationDisplayRenderer = (data) => `<li>${JSON.stringify(data)}</li>`; // Default fallback

    constructor(element, options) {
        if (!element) {
            console.error("LocationServiceApp: No target element provided for instantiation.");
            return;
        }

        this.containerElement = element;
        this.configuration = { ...LocationServiceApp.defaultConfiguration, ...options };

        this.bootstrap();
    }

    /**
     * Initializes the application components.
     */
    bootstrap() {
        // Set EarthRadius for distance calculations
        if (this.configuration.distanceUnit === 'km') {
            GeographicCalculations.earthRadius = 6367.0; // Kilometers
        } else {
            GeographicCalculations.earthRadius = 3956.0; // Default: miles
        }

        // Determine data type for fetching
        this.processedDataType = (this.configuration.dataTransferType === 'kml') ? 'xml' : this.configuration.dataTransferType;

        // Setup directions services if enabled
        if (this.configuration.showInlineDirections === true) {
            this.routeVisualizer = new google.maps.DirectionsRenderer();
            this.routeCalculator = new google.maps.DirectionsService();
            const locationListContainer = document.querySelector('.' + this.configuration.siteListingContainer);
            if (locationListContainer) {
                const directionsPanel = document.createElement('div');
                directionsPanel.className = 'bh-sl-directions-panel';
                locationListContainer.prepend(directionsPanel);
            }
        }

        // Save initial zoom level
        this.initialMapLevel = this.configuration.mapSetup.zoomLevel;

        // Handle taxonomy filtering setup
        if (this.configuration.categoryFilters !== null) {
            this.applyCategoryFiltering();
        }

        // Setup modal window if enabled
        if (this.configuration.useModalWindow === true) {
            if (this.configuration.categoryFilters !== null) {
                const filtersContainer = document.querySelector('.' + this.configuration.categoryFiltersContainer);
                if (filtersContainer) {
                    const clonedFilters = filtersContainer.cloneNode(true);
                    this.containerElement.prepend(clonedFilters);
                }
            }

            const overlayDiv = document.createElement('div');
            overlayDiv.className = this.configuration.modalOverlayClass;
            overlayDiv.style.display = 'none';

            const modalWindowDiv = document.createElement('div');
            modalWindowDiv.className = this.configuration.modalWindowClass;

            const modalContentDiv = document.createElement('div');
            modalContentDiv.className = this.configuration.modalContentClass;

            modalContentDiv.appendChild(this.containerElement);
            modalWindowDiv.appendChild(modalContentDiv);
            overlayDiv.appendChild(modalWindowDiv);

            document.body.appendChild(overlayDiv);

            const closeButton = document.createElement('div');
            closeButton.className = this.configuration.modalCloseIconClass;
            modalWindowDiv.prepend(closeButton);

            closeButton.addEventListener('click', () => this.hideModalDialog());
            overlayDiv.addEventListener('click', (e) => {
                if (e.target === overlayDiv) {
                    this.hideModalDialog();
                }
            });
        }

        this.prepareRenderers();
    }

    /**
     * Cleans up the application.
     */
    decommission() {
        this.clearState();
        const mapDiv = document.getElementById(this.configuration.mapDisplayId);

        this.mapPins.forEach(pin => {
            google.maps.event.clearInstanceListeners(pin);
        });

        const listContainer = document.querySelector('.' + this.configuration.siteListingContainer + ' ul');
        if (listContainer) listContainer.innerHTML = '';

        if (mapDiv && mapDiv.classList.contains('bh-sl-map-open')) {
            mapDiv.innerHTML = '';
            mapDiv.classList.remove('bh-sl-map-open');
        }

        if (this.configuration.useModalWindow === true) {
            const overlay = document.querySelector('.' + this.configuration.modalOverlayClass);
            if (overlay) overlay.remove();
        }

        if (mapDiv) mapDiv.removeAttribute('style');

        if (this.containerElement) this.containerElement.style.display = 'none';

        document.removeEventListener('click', this.boundFormClickHandler);
        document.removeEventListener('keyup', this.boundFormKeyupHandler);
        const searchForm = document.getElementById(this.configuration.searchFormId);
        if (searchForm) searchForm.removeEventListener('submit', this.boundFormSubmitHandler);
        const listElement = document.querySelector('.' + this.configuration.siteListingContainer);
        if (listElement) listElement.removeEventListener('click', this.boundListClickHandler);
    }

    /**
     * Resets internal state variables.
     */
    clearState() {
        this.allLocations = [];
        this.premiumSites = [];
        this.standardSites = [];
        this.removeMapMarkers();
        this.clearLocationList();

        const listElement = document.querySelector('.' + this.configuration.siteListingContainer);
        if (listElement) listElement.removeEventListener('click', this.boundListClickHandler);

        const directionsPanel = document.querySelector('.bh-sl-directions-panel');
        if (directionsPanel && directionsPanel.querySelector('.bh-sl-close-directions-container')) {
             directionsPanel.querySelector('.bh-sl-close-directions-container').remove();
        }
    }

    /**
     * Displays a notification to the user.
     * @param {string} message The notification message.
     */
    alertUser(message) {
        if (this.configuration.onUserAlert) {
            this.configuration.onUserAlert.call(this, message);
        } else {
            alert(message);
        }
    }

    /**
     * Retrieves a query string parameter.
     * @param {string} parameterName The name of the query string parameter.
     * @returns {string} The value of the parameter, or an empty string if not found.
     */
    retrieveURLParameter(parameterName) {
        if (parameterName) {
            const urlParams = new URLSearchParams(window.location.search);
            return urlParams.get(parameterName) || '';
        }
        return '';
    }

    /**
     * Loads templates (or uses static ones) and sets up the rendering functions.
     */
    async prepareRenderers() {
        const processTemplateString = (templateString, data) => {
            let processedString = templateString;
            for (const key in data) {
                // Basic replacement for {{key}}
                processedString = processedString.replace(new RegExp(`{{${key}}}`, 'g'), data[key]);
                // Basic replacement for {{niceURL key}}
                if (key === 'website' && data[key]) {
                     processedString = processedString.replace(new RegExp(`{{niceURL ${key}}}`, 'g'), data[key].replace(/https?:\/\//, ''));
                }
            }
            return processedString;
        };

        if (this.configuration.locationListTemplateId !== null && this.configuration.infoBoxTemplateId !== null) {
            const infoBoxTemplateElement = document.getElementById(this.configuration.infoBoxTemplateId);
            const listTemplateElement = document.getElementById(this.configuration.locationListTemplateId);

            if (infoBoxTemplateElement && listTemplateElement) {
                this.infoBoxRenderer = (data) => processTemplateString(infoBoxTemplateElement.innerHTML, data);
                this.locationDisplayRenderer = (data) => processTemplateString(listTemplateElement.innerHTML, data);
                this.startLocationService();
                return;
            }
        }

        let infoBoxTemplatePath = this.configuration.infoBoxTemplateURL;
        let listTemplatePath = this.configuration.locationListTemplateURL;

        if (this.configuration.dataTransferType === 'kml') {
            infoBoxTemplatePath = this.configuration.kmlInfoBoxTemplateURL;
            listTemplatePath = this.configuration.kmlLocationListTemplateURL;
        }

        try {
            const [infoBoxResponse, listResponse] = await Promise.all([
                fetch(infoBoxTemplatePath),
                fetch(listTemplatePath)
            ]);

            const infoBoxText = await infoBoxResponse.text();
            const listText = await listResponse.text();

            this.infoBoxRenderer = (data) => processTemplateString(infoBoxText, data);
            this.locationDisplayRenderer = (data) => processTemplateString(listText, data);
            this.startLocationService();
        } catch (error) {
            const templateErrorDiv = document.createElement('div');
            templateErrorDiv.className = 'bh-sl-error';
            templateErrorDiv.textContent = 'Error: Could not load plugin templates. Check the paths and ensure they have been uploaded. Paths will be wrong if you do not run this from a web server.';
            const formContainer = document.querySelector('.' + this.configuration.inputFormWrapper);
            if (formContainer) {
                formContainer.appendChild(templateErrorDiv);
            }
            console.error('Failed to load templates:', error);
            throw new Error('Could not load LocationServiceApp templates');
        }
    }

    /**
     * Main function to start the location service after templates are ready.
     */
    startLocationService() {
        if (this.configuration.slideMapPanel === true) {
            this.containerElement.style.display = 'none';
        }

        this.initializeMapAndSearch();
        this.setupFormInteractions();
    }

    /**
     * Sets up event listeners for the search form.
     */
    setupFormInteractions() {
        this.boundFormClickHandler = this.handleSearchSubmission.bind(this);
        this.boundFormKeyupHandler = (e) => {
            const addressInput = document.getElementById(this.configuration.addressInputId);
            if (e.key === 'Enter' && addressInput && document.activeElement === addressInput) {
                this.handleSearchSubmission(e);
            }
        };
        this.boundFormSubmitHandler = this.handleSearchSubmission.bind(this);

        if (this.configuration.noFormSubmission === true) {
            const formContainer = document.querySelector('.' + this.configuration.inputFormWrapper);
            if (formContainer) {
                const searchButton = formContainer.querySelector('button');
                if (searchButton) {
                    searchButton.addEventListener('click', this.boundFormClickHandler);
                }
            }
            document.addEventListener('keyup', this.boundFormKeyupHandler);
        } else {
            const searchForm = document.getElementById(this.configuration.searchFormId);
            if (searchForm) {
                searchForm.addEventListener('submit', this.boundFormSubmitHandler);
            }
        }
    }

    /**
     * Fetches location data from the specified source.
     * @param {number} lat Latitude of the origin.
     * @param {number} lng Longitude of the origin.
     * @param {string} address Address of the origin.
     * @returns {Promise<Document|object>} A promise that resolves with the parsed data.
     */
    async fetchLocationData(lat, lng, address) {
        if (this.configuration.onDataFetchStart) {
            this.configuration.onDataFetchStart.call(this, lat, lng, address);
        }

        if (this.configuration.rawInputData !== null) {
            if (this.processedDataType === 'xml') {
                const parser = new DOMParser();
                return parser.parseFromString(this.configuration.rawInputData, 'text/xml');
            } else if (this.processedDataType === 'json') {
                return JSON.parse(this.configuration.rawInputData);
            }
        } else {
            const loadingContainer = document.querySelector('.' + this.configuration.inputFormWrapper);
            let loadingIndicator;
            if (this.configuration.showLoadingIndicator === true && loadingContainer) {
                loadingIndicator = document.createElement('div');
                loadingIndicator.className = this.configuration.loadingIndicatorContainer;
                loadingContainer.appendChild(loadingIndicator);
            }

            let requestUrl = this.configuration.dataSourceURL;
            const params = new URLSearchParams();
            params.append('origLat', lat);
            params.append('origLng', lng);
            params.append('origAddress', address);

            if (this.configuration.dataTransferType === 'jsonp') {
                return new Promise((resolve, reject) => {
                    const script = document.createElement('script');
                    const uniqueCallback = `jsonp_callback_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
                    script.src = `${requestUrl}${requestUrl.includes('?') ? '&' : '?'}${params.toString()}&callback=${uniqueCallback}`;

                    window[uniqueCallback] = (data) => {
                        resolve(data);
                        if (loadingIndicator) loadingIndicator.remove();
                        document.head.removeChild(script);
                        delete window[uniqueCallback];
                    };

                    script.onerror = (e) => {
                        console.error("JSONP fetch failed:", e);
                        reject(new Error("Failed to load JSONP data."));
                        if (loadingIndicator) loadingIndicator.remove();
                        document.head.removeChild(script);
                        delete window[uniqueCallback];
                    };
                    document.head.appendChild(script);
                });
            } else {
                const response = await fetch(`${requestUrl}?${params.toString()}`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                let data;
                if (this.processedDataType === 'xml') {
                    const text = await response.text();
                    const parser = new DOMParser();
                    data = parser.parseFromString(text, 'text/xml');
                } else {
                    data = await response.json();
                }

                if (loadingIndicator) loadingIndicator.remove();
                if (this.configuration.onDataFetchSuccess) {
                    this.configuration.onDataFetchSuccess.call(this, data);
                }
                return data;
            }
        }
    }

    /**
     * Checks for initial location settings (default, full map, HTML5 geolocation).
     */
    initializeMapAndSearch() {
        if (this.configuration.initialLocation === true) {
            const geocoder = new google.maps.Geocoder();
            const latlng = new google.maps.LatLng(this.configuration.initialLatitude, this.configuration.initialLongitude);
            geocoder.geocode({ 'location': latlng }, (results, status) => {
                if (status === google.maps.GeocoderStatus.OK && results[0]) {
                    this.initialLocationText = results[0].formatted_address;
                    this.mapInstanceConfiguration = {
                        latitude: this.configuration.initialLatitude,
                        longitude: this.configuration.initialLongitude,
                        originAddress: this.initialLocationText
                    };
                    this.renderMapAndLocations(this.mapInstanceConfiguration);
                } else {
                    this.alertUser(this.configuration.addressNotFoundMessage);
                }
            });
        }

        if (this.configuration.showFullMapOnLoad === true) {
            if (this.configuration.useQueryStringParameters === true &&
                (this.retrieveURLParameter(this.configuration.addressInputId) || this.retrieveURLParameter(this.configuration.nameSearchInputId))) {
                this.handleSearchSubmission(null);
            } else {
                this.renderMapAndLocations(null);
            }
        }

        if (this.configuration.autoDetectLocation === true) {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (position) => this.processAutoGeolocation(position),
                    (error) => this.handleAutoLocationError(error)
                );
            }
        }
    }

    /**
     * Handles errors during automatic geolocation.
     * @param {GeolocationPositionError} error The geolocation error object.
     */
    handleAutoLocationError(error) {
        this.alertUser(this.configuration.autoLocateErrorMessage);
    }

    /**
     * Geocodes the user's input address and initiates map rendering.
     * @param {Event|null} event The form submission event, or null if triggered programmatically.
     */
    handleSearchSubmission(event) {
        if (event) {
            event.preventDefault();
        }

        this.clearState();

        this.addressEntryElement = document.getElementById(this.configuration.addressInputId);
        this.locationSearchElement = document.getElementById(this.configuration.nameSearchInputId);

        let searchAddress = '';
        if (this.addressEntryElement) {
            searchAddress = this.addressEntryElement.value;
        }
        if (this.configuration.useQueryStringParameters === true) {
            searchAddress = this.retrieveURLParameter(this.configuration.addressInputId) || searchAddress;
        }

        let nameSearchTerm = '';
        if (this.configuration.enableNameSearch === true && this.locationSearchElement) {
            nameSearchTerm = this.locationSearchElement.value;
        }
        if (this.configuration.useQueryStringParameters === true) {
            nameSearchTerm = this.retrieveURLParameter(this.configuration.nameSearchInputId) || nameSearchTerm;
        }

        if (searchAddress === '' && nameSearchTerm === '' && this.configuration.showFullMapOnLoad !== true && this.configuration.initialLocation !== true) {
            this.alertUser(this.configuration.addressNotFoundMessage);
            return;
        }

        const geocoder = new google.maps.Geocoder();
        geocoder.geocode({ 'address': searchAddress }, (results, status) => {
            if (status === google.maps.GeocoderStatus.OK && results[0]) {
                const location = results[0].geometry.location;
                this.originLatitude = location.lat();
                this.originLongitude = location.lng();
                this.initialLocationText = results[0].formatted_address;

                this.mapInstanceConfiguration = {
                    latitude: this.originLatitude,
                    longitude: this.originLongitude,
                    originAddress: this.initialLocationText,
                    nameSearch: nameSearchTerm
                };
                this.renderMapAndLocations(this.mapInstanceConfiguration);
            } else {
                this.alertUser(this.configuration.addressNotFoundMessage);
            }
        });
    }

    /**
     * Renders the map and displays locations based on provided configuration.
     * @param {object|null} mapConfig Configuration for the map, including origin lat/lng/address.
     */
    async renderMapAndLocations(mapConfig) {
        this.mapInstanceConfiguration = mapConfig || {};

        try {
            const rawData = await this.fetchLocationData(
                this.mapInstanceConfiguration.latitude,
                this.mapInstanceConfiguration.longitude,
                this.mapInstanceConfiguration.originAddress
            );
            this.initialDataSource = rawData;

            this.normalizeDataStructure(rawData);
            this.displayMapComponents();
            this.populateLocationList();
        } catch (error) {
            console.error("Error rendering map and locations:", error);
            this.alertUser("Failed to load or process location data.");
        }
    }

    /**
     * Normalizes raw data (XML/JSON) into a consistent array of location objects.
     * @param {Document|object} rawData The raw XML Document or JSON object.
     */
    normalizeDataStructure(rawData) {
        this.allLocations = [];
        this.premiumSites = [];
        this.standardSites = [];

        let locationNodes;
        if (this.processedDataType === 'xml') {
            locationNodes = rawData.querySelectorAll(this.configuration.xmlLocationElement);
            locationNodes.forEach(node => {
                const location = {};
                node.attributes.forEach(attr => {
                    location[attr.name] = attr.value;
                });
                this.allLocations.push(location);
            });
        } else if (this.processedDataType === 'json' || this.configuration.dataTransferType === 'jsonp') {
            if (Array.isArray(rawData)) {
                this.allLocations = rawData;
            } else if (rawData && Array.isArray(rawData.markers)) {
                this.allLocations = rawData.markers;
            } else {
                console.warn("Unexpected JSON data structure:", rawData);
                this.allLocations = [];
            }
        }

        this.allLocations.forEach(loc => {
            if (this.mapInstanceConfiguration.latitude && this.mapInstanceConfiguration.longitude) {
                loc.distance = GeographicCalculations.computeHaversineDistance(
                    this.mapInstanceConfiguration.latitude,
                    this.mapInstanceConfiguration.longitude,
                    parseFloat(loc.lat),
                    parseFloat(loc.lng)
                );
            } else {
                loc.distance = 0;
            }

            let passesFilters = true;
            for (const filterKey in this.activeFilters) {
                const selectedValue = this.activeFilters[filterKey];
                if (selectedValue && loc[filterKey] !== selectedValue) {
                    passesFilters = false;
                    break;
                }
            }

            if (passesFilters) {
                if (this.configuration.highlightFeatured === true && loc.featured === 'true') {
                    this.premiumSites.push(loc);
                } else {
                    this.standardSites.push(loc);
                }
            }
        });

        this.premiumSites.sort((a, b) => a.distance - b.distance);
        this.standardSites.sort((a, b) => a.distance - b.distance);

        this.allLocations = [...this.premiumSites, ...this.standardSites];

        if (this.configuration.maximumSearchDistance !== false) {
            const maxDistElement = document.getElementById(this.configuration.maximumDistanceInputId);
            const maxDistanceValue = maxDistElement ? parseFloat(maxDistElement.value) : parseFloat(this.configuration.maximumSearchDistance);

            if (!isNaN(maxDistanceValue) && maxDistanceValue > 0) {
                this.allLocations = this.allLocations.filter(loc => loc.distance <= maxDistanceValue);
            }
        }

        if (this.mapInstanceConfiguration.nameSearch && this.mapInstanceConfiguration.nameSearch !== '') {
            const searchRegex = new RegExp(this.mapInstanceConfiguration.nameSearch, 'i');
            this.allLocations = this.allLocations.filter(loc =>
                loc[this.configuration.locationNameAttribute] && loc[this.configuration.locationNameAttribute].match(searchRegex)
            );
        }

        if (this.configuration.maxLocationsToShow > 0 && this.allLocations.length > this.configuration.maxLocationsToShow) {
            this.allLocations = this.allLocations.slice(0, this.configuration.maxLocationsToShow);
        }

        this.storeCount = this.allLocations.length;

        if (this.storeCount === 0 && this.configuration.onNoResults) {
            this.configuration.onNoResults.call(this);
        } else if (this.storeCount === 0) {
            this.alertUser(this.configuration.noResultsHeading + ': ' + this.configuration.noResultsDescription);
        }
    }

    /**
     * Creates and displays the Google Map, and adds markers.
     */
    displayMapComponents() {
        const mapDiv = document.getElementById(this.configuration.mapDisplayId);
        if (!mapDiv) {
            console.error("Map display element not found:", this.configuration.mapDisplayId);
            return;
        }

        if (this.configuration.slideMapPanel === true) {
            this.containerElement.style.display = '';
            mapDiv.classList.add('bh-sl-map-open');
        }

        const mapOptions = {
            zoom: this.configuration.mapSetup.zoomLevel,
            mapTypeId: this.configuration.mapSetup.mapType,
            center: new google.maps.LatLng(
                this.mapInstanceConfiguration.latitude || this.configuration.initialLatitude || 0,
                this.mapInstanceConfiguration.longitude || this.configuration.initialLongitude || 0
            )
        };

        if (this.currentMapInstance) {
            this.currentMapInstance.setCenter(mapOptions.center);
            this.currentMapInstance.setZoom(mapOptions.zoom);
        } else {
            this.currentMapInstance = new google.maps.Map(mapDiv, mapOptions);
        }

        this.removeMapMarkers();

        if (this.configuration.originPinDisplay === true && this.mapInstanceConfiguration.latitude && this.mapInstanceConfiguration.longitude) {
            const originLatLng = new google.maps.LatLng(this.mapInstanceConfiguration.latitude, this.mapInstanceConfiguration.longitude);
            const originMarkerOptions = {
                position: originLatLng,
                map: this.currentMapInstance,
                icon: this.createMarkerIcon(this.configuration.originPinIconPath, this.configuration.originPinIconDimensions),
                title: this.mapInstanceConfiguration.originAddress
            };
            const originPin = new google.maps.Marker(originMarkerOptions);
            this.mapPins.push(originPin);
        }

        this.placeLocationMarkers();

        this.adjustMapBounds();
    }

    /**
     * Creates a custom marker icon object.
     * @param {string|null} path The URL path to the icon image.
     * @param {Array<number>|null} dimensions An array [width, height] for the icon.
     * @returns {google.maps.MarkerImage|null} The marker icon object or null.
     */
    createMarkerIcon(path, dimensions) {
        if (path) {
            const icon = { url: path };
            if (dimensions && dimensions.length === 2) {
                icon.size = new google.maps.Size(dimensions[0], dimensions[1]);
                icon.scaledSize = new google.maps.Size(dimensions[0], dimensions[1]);
                icon.anchor = new google.maps.Point(dimensions[0] / 2, dimensions[1]);
            }
            return icon;
        }
        return null;
    }

    /**
     * Places markers on the map for all filtered locations.
     */
    placeLocationMarkers() {
        this.allLocations.forEach((location, index) => {
            const markerLatLng = new google.maps.LatLng(parseFloat(location.lat), parseFloat(location.lng));
            let markerIcon = null;

            if (this.configuration.categoryPinIcons && location.category && this.configuration.categoryPinIcons[location.category]) {
                const catIcon = this.configuration.categoryPinIcons[location.category];
                markerIcon = this.createMarkerIcon(catIcon.path, catIcon.dimensions);
            } else if (this.configuration.pinIconPath) {
                markerIcon = this.createMarkerIcon(this.configuration.pinIconPath, this.configuration.pinIconDimensions);
            }

            const mapPin = new google.maps.Marker({
                position: markerLatLng,
                map: this.currentMapInstance,
                icon: markerIcon,
                title: location.name,
                animation: google.maps.Animation.DROP
            });

            this.mapPins.push(mapPin);
            this.attachMarkerEvents(mapPin, location, index);
        });
    }

    /**
     * Attaches event listeners to a map marker.
     * @param {google.maps.Marker} mapPin The Google Maps marker object.
     * @param {object} locationData The data for the location.
     * @param {number} index The index of the location in the list.
     */
    attachMarkerEvents(mapPin, locationData, index) {
        mapPin.addListener('click', () => {
            if (this.configuration.animatePinOnSelect === true) {
                mapPin.setAnimation(google.maps.Animation.BOUNCE);
                setTimeout(() => mapPin.setAnimation(null), 700);
            }

            if (this.currentInfoWindow) {
                this.currentInfoWindow.close();
            }

            this.currentInfoWindow = new google.maps.InfoWindow({
                content: this.infoBoxRenderer(locationData)
            });
            this.currentInfoWindow.open(this.currentMapInstance, mapPin);

            if (this.configuration.onPinClick) {
                this.configuration.onPinClick.call(this, mapPin, locationData, index, this.currentInfoWindow);
            }
        });
    }

    /**
     * Adjusts the map bounds to show all markers and the origin.
     */
    adjustMapBounds() {
        if (!this.currentMapInstance || this.mapPins.length === 0) return;

        const bounds = new google.maps.LatLngBounds();
        this.mapPins.forEach(pin => bounds.extend(pin.getPosition()));

        if (this.mapInstanceConfiguration.latitude && this.mapInstanceConfiguration.longitude && this.configuration.originPinDisplay) {
            bounds.extend(new google.maps.LatLng(this.mapInstanceConfiguration.latitude, this.mapInstanceConfiguration.longitude));
        }

        this.currentMapInstance.fitBounds(bounds);

        if (this.mapPins.length === 1 && this.mapInstanceConfiguration.latitude && this.mapInstanceConfiguration.longitude) {
            this.currentMapInstance.setZoom(this.initialMapLevel);
        }
    }

    /**
     * Populates the location list based on filtered and sorted data.
     */
    populateLocationList() {
        let listContainer = document.querySelector('.' + this.configuration.siteListingContainer + ' ul');
        if (!listContainer) {
            const listDiv = document.querySelector('.' + this.configuration.siteListingContainer);
            if (listDiv) {
                listContainer = document.createElement('ul');
                listDiv.appendChild(listContainer);
            } else {
                console.error("Location list container not found:", this.configuration.siteListingContainer);
                return;
            }
        }
        listContainer.innerHTML = '';

        if (this.allLocations.length === 0) {
            const noResultsItem = document.createElement('li');
            noResultsItem.className = 'no-results';
            noResultsItem.innerHTML = `<h3>${this.configuration.noResultsHeading}</h3><p>${this.configuration.noResultsDescription}</p>`;
            listContainer.appendChild(noResultsItem);
            return;
        }

        let locationsToDisplay = this.allLocations;
        let startIndex = 0;
        let endIndex = locationsToDisplay.length;

        if (this.configuration.enablePagination === true) {
            const currentPage = parseInt(listContainer.dataset.currentPage || 1);
            startIndex = (currentPage - 1) * this.configuration.itemsPerPage;
            endIndex = Math.min(startIndex + this.configuration.itemsPerPage, locationsToDisplay.length);
            locationsToDisplay = locationsToDisplay.slice(startIndex, endIndex);
        }

        locationsToDisplay.forEach((location, index) => {
            location.distanceFormatted = this.formatDistanceString(location.distance);
            const listItem = document.createElement('li');
            listItem.className = `location-item ${index % 2 === 0 ? 'even' : 'odd'}`;
            listItem.dataset.locationIndex = this.allLocations.indexOf(location);

            listItem.innerHTML = this.locationDisplayRenderer(location);
            listContainer.appendChild(listItem);
        });

        if (this.configuration.enablePagination === true) {
            this.implementPagination();
        }

        this.boundListClickHandler = this.handleListItemClick.bind(this);
        listContainer.addEventListener('click', this.boundListClickHandler);
    }

    /**
     * Handles clicks on location list items.
     * @param {Event} event The click event.
     */
    handleListItemClick(event) {
        const listItem = event.target.closest('.location-item');
        if (listItem) {
            const originalIndex = parseInt(listItem.dataset.locationIndex);
            const selectedLocation = this.allLocations[originalIndex];
            const correspondingPin = this.mapPins[originalIndex];

            if (selectedLocation && correspondingPin) {
                google.maps.event.trigger(correspondingPin, 'click');

                this.currentMapInstance.panTo(correspondingPin.getPosition());

                if (this.configuration.showInlineDirections === true && event.target.classList.contains('bh-sl-get-directions')) {
                    event.preventDefault();
                    this.requestDirections(selectedLocation);
                }
            }

            if (this.configuration.onListEntryClick) {
                this.configuration.onListEntryClick.call(this, listItem, selectedLocation, originalIndex);
            }
        }
    }

    /**
     * Removes all markers from the map.
     */
    removeMapMarkers() {
        this.mapPins.forEach(pin => pin.setMap(null));
        this.mapPins = [];
        if (this.currentInfoWindow) {
            this.currentInfoWindow.close();
            this.currentInfoWindow = null;
        }
    }

    /**
     * Clears all items from the location list.
     */
    clearLocationList() {
        const listContainer = document.querySelector('.' + this.configuration.siteListingContainer + ' ul');
        if (listContainer) {
            listContainer.innerHTML = '';
        }
        const paginationContainer = document.querySelector('.bh-sl-pagination-container');
        if (paginationContainer) {
            paginationContainer.remove();
        }
    }

    /**
     * Displays the modal window.
     */
    showModalDialog() {
        if (this.configuration.useModalWindow === true) {
            const overlay = document.querySelector('.' + this.configuration.modalOverlayClass);
            if (overlay) {
                overlay.style.display = 'block';
                if (this.configuration.onModalOpen) {
                    this.configuration.onModalOpen.call(this);
                }
            }
        }
    }

    /**
     * Hides the modal window.
     */
    hideModalDialog() {
        if (this.configuration.useModalWindow === true) {
            const overlay = document.querySelector('.' + this.configuration.modalOverlayClass);
            if (overlay) {
                overlay.style.display = 'none';
                if (this.configuration.onModalClose) {
                    this.configuration.onModalClose.call(this);
                }
            }
        }
    }

    /**
     * Formats a distance value into a localized string.
     * @param {number} distance The distance value.
     * @returns {string} The formatted distance string.
     */
    formatDistanceString(distance) {
        if (distance === 0) return '';

        const unit = this.configuration.distanceUnit === 'km' ?
                     (distance === 1 ? this.configuration.kilometerTerm : this.configuration.kilometersTerm) :
                     (distance === 1 ? this.configuration.mileTerm : this.configuration.milesTerm);
        return `${distance.toFixed(2)} ${unit}`;
    }

    /**
     * Sets up taxonomy filtering.
     */
    applyCategoryFiltering() {
        const filtersContainer = document.querySelector('.' + this.configuration.categoryFiltersContainer);
        if (!filtersContainer) return;

        filtersContainer.addEventListener('change', (event) => {
            const target = event.target;
            if (target.matches('input[type="checkbox"], input[type="radio"], select')) {
                const filterName = target.name || target.id;
                let filterValue = '';

                if (target.type === 'checkbox') {
                    const checkedCheckboxes = Array.from(filtersContainer.querySelectorAll(`input[name="${filterName}"]:checked`)).map(cb => cb.value);
                    if (checkedCheckboxes.length > 0) {
                        filterValue = checkedCheckboxes.join(',');
                    }
                } else if (target.type === 'radio') {
                    if (target.checked) filterValue = target.value;
                } else if (target.tagName === 'SELECT') {
                    filterValue = target.value;
                }

                if (filterValue) {
                    this.activeFilters[filterName] = filterValue;
                } else {
                    delete this.activeFilters[filterName];
                }

                if (this.configuration.onFilterChange) {
                    this.configuration.onFilterChange.call(this, this.activeFilters);
                }

                this.normalizeDataStructure(this.initialDataSource);
                this.removeMapMarkers();
                this.placeLocationMarkers();
                this.populateLocationList();
                this.adjustMapBounds();
            }
        });
    }

    /**
     * Processes HTML5 geolocation results.
     * @param {GeolocationPosition} position The geolocation position object.
     */
    processAutoGeolocation(position) {
        this.originLatitude = position.coords.latitude;
        this.originLongitude = position.coords.longitude;

        const geocoder = new google.maps.Geocoder();
        const latlng = new google.maps.LatLng(this.originLatitude, this.originLongitude);

        geocoder.geocode({ 'location': latlng }, (results, status) => {
            if (status === google.maps.GeocoderStatus.OK && results[0]) {
                this.initialLocationText = results[0].formatted_address;
                this.mapInstanceConfiguration = {
                    latitude: this.originLatitude,
                    longitude: this.originLongitude,
                    originAddress: this.initialLocationText
                };
                this.renderMapAndLocations(this.mapInstanceConfiguration);
            } else {
                this.alertUser(this.configuration.addressNotFoundMessage);
            }
        });
    }

    /**
     * Requests and displays directions from the origin to a selected location.
     * @param {object} destinationLocation The location object to get directions to.
     */
    requestDirections(destinationLocation) {
        if (!this.routeCalculator || !this.routeVisualizer || !this.mapInstanceConfiguration.latitude) {
            console.warn("Directions service not initialized or origin not set.");
            return;
        }

        this.routeVisualizer.setMap(this.currentMapInstance);
        this.routeVisualizer.setPanel(document.querySelector('.bh-sl-directions-panel'));

        const request = {
            origin: new google.maps.LatLng(this.mapInstanceConfiguration.latitude, this.mapInstanceConfiguration.longitude),
            destination: new google.maps.LatLng(parseFloat(destinationLocation.lat), parseFloat(destinationLocation.lng)),
            travelMode: google.maps.TravelMode.DRIVING
        };

        this.routeCalculator.route(request, (response, status) => {
            if (status === google.maps.DirectionsStatus.OK) {
                this.routeVisualizer.setDirections(response);

                const listContainer = document.querySelector('.' + this.configuration.siteListingContainer);
                if (listContainer) {
                    const closeDirectionsDiv = document.createElement('div');
                    closeDirectionsDiv.className = 'bh-sl-close-directions-container';
                    closeDirectionsDiv.innerHTML = `<a href="#" class="bh-sl-close-directions">Close Directions</a>`;
                    listContainer.prepend(closeDirectionsDiv);

                    closeDirectionsDiv.querySelector('.bh-sl-close-directions').addEventListener('click', (e) => {
                        e.preventDefault();
                        this.hideDirections();
                    });
                }

                if (this.configuration.onDirectionsRequest) {
                    this.configuration.onDirectionsRequest.call(this, response);
                }
            } else {
                console.error('Directions request failed due to ' + status);
            }
        });
    }

    /**
     * Hides the displayed directions.
     */
    hideDirections() {
        if (this.routeVisualizer) {
            this.routeVisualizer.setMap(null);
            this.routeVisualizer.setPanel(null);
        }
        const closeContainer = document.querySelector('.bh-sl-close-directions-container');
        if (closeContainer) {
            closeContainer.remove();
        }

        if (this.configuration.onCloseDirections) {
            this.configuration.onCloseDirections.call(this);
        }
    }

    /**
     * Implements pagination controls for the location list.
     */
    implementPagination() {
        const listContainer = document.querySelector('.' + this.configuration.siteListingContainer);
        if (!listContainer) return;

        const totalPages = Math.ceil(this.allLocations.length / this.configuration.itemsPerPage);
        if (totalPages <= 1) {
            const existingPagination = document.querySelector('.bh-sl-pagination-container');
            if (existingPagination) existingPagination.remove();
            return;
        }

        let currentPage = parseInt(listContainer.querySelector('ul').dataset.currentPage || 1);
        if (isNaN(currentPage) || currentPage < 1) currentPage = 1;

        let paginationContainer = document.querySelector('.bh-sl-pagination-container');
        if (!paginationContainer) {
            paginationContainer = document.createElement('div');
            paginationContainer.className = 'bh-sl-pagination-container';
            listContainer.appendChild(paginationContainer);
        }
        paginationContainer.innerHTML = '';

        const prevButton = document.createElement('a');
        prevButton.href = '#';
        prevButton.className = 'bh-sl-prev-page';
        prevButton.innerHTML = this.configuration.previousPageLabel;
        if (currentPage === 1) prevButton.classList.add('disabled');
        prevButton.addEventListener('click', (e) => {
            e.preventDefault();
            if (currentPage > 1) {
                this.changePage(currentPage - 1);
            }
        });
        paginationContainer.appendChild(prevButton);

        for (let i = 1; i <= totalPages; i++) {
            const pageLink = document.createElement('a');
            pageLink.href = '#';
            pageLink.className = `bh-sl-page-link ${i === currentPage ? 'active' : ''}`;
            pageLink.textContent = i;
            pageLink.dataset.pageNumber = i;
            pageLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.changePage(i);
            });
            paginationContainer.appendChild(pageLink);
        }

        const nextButton = document.createElement('a');
        nextButton.href = '#';
        nextButton.className = 'bh-sl-next-page';
        nextButton.innerHTML = this.configuration.nextPageLabel;
        if (currentPage === totalPages) nextButton.classList.add('disabled');
        nextButton.addEventListener('click', (e) => {
            e.preventDefault();
            if (currentPage < totalPages) {
                this.changePage(currentPage + 1);
            }
        });
        paginationContainer.appendChild(nextButton);
    }

    /**
     * Changes the current page of the location list.
     * @param {number} newPageNumber The page number to navigate to.
     */
    changePage(newPageNumber) {
        const listUl = document.querySelector('.' + this.configuration.siteListingContainer + ' ul');
        if (listUl) {
            listUl.dataset.currentPage = newPageNumber;
            this.populateLocationList();

            if (this.configuration.onPageChange) {
                this.configuration.onPageChange.call(this, newPageNumber);
            }
        }
    }
}