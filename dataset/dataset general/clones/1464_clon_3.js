(function (docRef, googleMapsAPI) {
    // This module, PositionTracker, is responsible for initializing and managing a Google Map display.
    // It handles map configuration, marker placement, information pop-ups, and responsive adjustments.
    const PositionTracker = {
        // Comprehensive bundle of configuration settings for the map and its various elements.
        optionsBundle: {
            // Geographic coordinates representing the primary location for the map's initial focus.
            locationPoints: {
                latitudeVal: null,
                longitudeVal: null
            },
            // Specific display options passed directly to the Google Map constructor.
            mapDisplayOpts: {
                initialViewpoint: null, // This will be dynamically set from locationPoints.
                magnificationLevel: 14, // Default zoom level for the map.
                zoomWidgetEnabled: true, // Enables the default zoom controls (+/- buttons).
                zoomWidgetSettings: {
                    visualMode: googleMapsAPI.maps.ZoomControlStyle.SMALL // Smaller zoom controls.
                },
                preventDblClickZoom: false, // Allows double-click to zoom in.
                mapTypeSelectorEnabled: true, // Displays controls to switch between map types (e.g., satellite, roadmap).
                scaleBarEnabled: true, // Shows a scale bar on the map.
                scrollWheelInteraction: false, // Disables zooming with the mouse scroll wheel.
                streetViewWidgetEnabled: false, // Hides the Street View "Pegman" control.
                panEnabled: true, // Allows users to drag and pan the map with the mouse.
                baseMapType: googleMapsAPI.maps.MapTypeId.ROADMAP, // Sets the default map type to roadmap.
                // Note: 'panControl' and 'overviewMapControl' were omitted for simplicity as 'panEnabled' and zoom controls often suffice.
                // An array of JSON objects defining custom visual styles for various map features.
                visualStylingRules: [
                    {
                        elementCategory: 'water',
                        styleModifiers: [
                            {
                                fillColor: '#c8e6f0' // A light blue color for water bodies.
                            },
                            {
                                displayState: 'on' // Ensures water features are visible.
                            }
                        ]
                    },
                    {
                        elementCategory: 'landscape',
                        styleModifiers: [
                            {
                                colorSaturation: -120 // Reduces color intensity for landscapes.
                            },
                            {
                                colorLightness: 20 // Makes landscapes slightly brighter.
                            },
                            {
                                fillColor: '#f2f2f2' // A very light grey for land areas.
                            },
                            {
                                displayState: 'on'
                            }
                        ]
                    },
                    {
                        elementCategory: 'road',
                        styleModifiers: [
                            {
                                colorSaturation: -90 // Roads appear less colorful.
                            },
                            {
                                colorLightness: 50 // Roads are made brighter.
                            }
                        ]
                    },
                    {
                        elementCategory: 'road.highway',
                        styleModifiers: [
                            {
                                displayState: 'simplified' // Highways are shown in a less detailed manner.
                            }
                        ]
                    },
                    {
                        elementCategory: 'road.arterial',
                        subCategory: 'labels.icon',
                        styleModifiers: [
                            {
                                displayState: 'off' // Hides icons on arterial road labels.
                            }
                        ]
                    },
                    {
                        elementCategory: 'administrative',
                        subCategory: 'labels.text.fill',
                        styleModifiers: [
                            {
                                fillColor: '#666666' // Sets a darker grey for administrative text labels.
                            }
                        ]
                    },
                    {
                        elementCategory: 'poi', // Points of Interest.
                        styleModifiers: [
                            {
                                colorSaturation: -100 // Completely desaturates POIs.
                            },
                            {
                                colorLightness: 55 // Makes POIs brighter.
                            },
                            {
                                displayState: 'off' // Turns off the display of all Points of Interest.
                            }
                        ]
                    }
                ],
            },
            markerIconURL: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png' // Default URL for the map marker icon.
        },
        displayInstance: null, // Holds the actual Google Map object once initialized.
        locationPin: null, // Stores the Google Map Marker object.
        popupInfoBox: null, // Represents the Google Map InfoWindow object.

        /**
         * Safely retrieves a data attribute from a given HTML element.
         * It prioritizes the `dataset` property for modern browsers and falls back to `getAttribute`.
         * @param {HTMLElement} element - The DOM element to query.
         * @param {string} attributeName - The base name of the data attribute (e.g., 'lat' for 'data-lat').
         * @returns {string|null} The value of the data attribute, or null if not found.
         */
        _retrieveDataAttr: function(element, attributeName) {
            if (!element) return null;
            let value = (element.dataset && element.dataset[attributeName]) || element.getAttribute(`data-${attributeName}`);
            this._logStatus(`Debug: Attempting to retrieve data-${attributeName}: '${value}'`);
            return value;
        },

        /**
         * Simple internal logging utility for debugging purposes.
         * @param {string} message - The message to log.
         */
        _logStatus: function(message) {
            if (typeof console !== 'undefined' && console.log) {
                console.log(`[PositionTracker] ${message}`);
            }
        },

        /**
         * Initializes the map module within a designated HTML container element.
         * This is the primary entry point for setting up the map.
         * @param {HTMLElement} containerElement - The DOM element where the Google Map will be rendered.
         */
        initializeMapModule: function (containerElement) {
            // Guard clause: Ensure the container element is valid and the Google Maps API is fully loaded.
            if (!containerElement || !googleMapsAPI || !googleMapsAPI.maps || !googleMapsAPI.maps.Map) {
                this._logStatus("Error: Initialization failed. Invalid container element or Google Maps API not fully loaded.");
                return;
            }

            this._logStatus("Info: Starting map module initialization process...");

            // Extract geographic data and icon path from the container element's data attributes.
            const latStr = this._retrieveDataAttr(containerElement, 'lat');
            const lngStr = this._retrieveDataAttr(containerElement, 'lng');
            const iconPathStr = this._retrieveDataAttr(containerElement, 'icon');

            // Parse and assign coordinates, defaulting to 0 if parsing fails.
            this.optionsBundle.locationPoints.latitudeVal = parseFloat(latStr) || 0;
            this.optionsBundle.locationPoints.longitudeVal = parseFloat(lngStr) || 0;

            // Apply custom icon path if provided, otherwise retain the default.
            if (iconPathStr) {
                this.optionsBundle.markerIconURL = iconPathStr;
            } else {
                this._logStatus("Info: No custom marker icon path found; using the default icon.");
            }

            // Create the initial geographic point object for the map's center.
            const initialGeoPoint = new googleMapsAPI.maps.LatLng(
                this.optionsBundle.locationPoints.latitudeVal,
                this.optionsBundle.locationPoints.longitudeVal
            );
            this.optionsBundle.mapDisplayOpts.initialViewpoint = initialGeoPoint;

            // Instantiate the Google Map. A temporary local variable is used for clarity.
            const newMapInstance = new googleMapsAPI.maps.Map(containerElement, this.optionsBundle.mapDisplayOpts);
            this.displayInstance = newMapInstance;
            this._logStatus("Info: Google Map instance successfully created.");

            // Proceed to create and place the location marker.
            this._createLocationPin();

            // Then, generate and display the information window associated with the marker.
            this._generateInfoWindow();

            // Add an event listener to the map itself for when it becomes idle.
            googleMapsAPI.maps.event.addListener(this.displayInstance, 'idle', () => {
                this._logStatus(`Map State: Map is currently idle. Its center is at: ${this.displayInstance.getCenter().toUrlValue()}`);
            });

            // Attach dynamic event handlers, such as for window resizing.
            this._attachEventHandlers();

            this._logStatus("Success: Map module initialization completed.");
        },

        /**
         * Attaches necessary event listeners to global objects like the window.
         * Uses an arrow function to ensure 'this' context remains bound to PositionTracker.
         */
        _attachEventHandlers: function () {
            docRef.defaultView.addEventListener('resize', () => {
                this._adjustView();
            });
            this._logStatus("Info: Window resize listener successfully attached.");
        },

        /**
         * Creates and places the primary location marker on the initialized map.
         */
        _createLocationPin: function () {
            // Guard clause: Ensure valid coordinates are set before attempting to create a marker.
            if (this.optionsBundle.locationPoints.latitudeVal === null || this.optionsBundle.locationPoints.longitudeVal === null) {
                this._logStatus("Error: Cannot create marker; location coordinates are not defined.");
                return;
            }
            const markerPosition = new googleMapsAPI.maps.LatLng(
                this.optionsBundle.locationPoints.latitudeVal,
                this.optionsBundle.locationPoints.longitudeVal
            );

            this.locationPin = new googleMapsAPI.maps.Marker({
                geographicPosition: markerPosition,
                displayInstance: this.displayInstance, // Assigns the marker to the current map instance.
                icon: this.optionsBundle.markerIconURL,
                title: "Our Primary Location" // Added a descriptive title for the marker.
            });
            this._logStatus("Info: Location marker successfully created and placed on the map.");
        },

        /**
         * Generates and manages the info window that displays when the marker is interacted with.
         */
        _generateInfoWindow: function () {
            // Retrieve the HTML content for the info window from a designated template element.
            const infoContentElement = docRef.querySelector('[data-map-template="true"]');
            const infoContentHTML = infoContentElement ? infoContentElement.innerMarkup : '<div><p>Information not available.</p></div>';

            // Guard clause: Ensure a marker exists before attempting to create an info window for it.
            if (!this.locationPin) {
                this._logStatus("Error: Cannot create info window; location pin (marker) is not available.");
                return;
            }

            this.popupInfoBox = new googleMapsAPI.maps.InfoWindow({
                innerMarkup: infoContentHTML,
                maxWidth: 300 // Sets a maximum width for the info window.
            });

            // Open the info window immediately upon generation.
            this.popupInfoBox.open(this.displayInstance, this.locationPin);
            this._logStatus("Info: Info window generated and initially opened.");

            // Attach a click event listener to the marker to reopen the info window if closed.
            googleMapsAPI.maps.event.addListener(this.locationPin, 'click', () => {
                this.popupInfoBox.open(this.displayInstance, this.locationPin);
                this._logStatus("Event: Marker click detected; info window re-opened.");
            });
        },

        /**
         * Adjusts the map's view, typically invoked when the browser window is resized.
         * It recenters the map on the marker and attempts to pan to keep the info window visible.
         */
        _adjustView: function () {
            // Guard clause: Ensure both map and marker instances are available.
            if (!this.displayInstance || !this.locationPin) {
                this._logStatus("Warning: Cannot adjust map view; map instance or location marker is null.");
                return;
            }

            // Recenter the map directly on the marker's current position.
            this.displayInstance.setCenter(this.locationPin.getPosition());

            // If the info window is currently open, pan the map slightly upwards
            // to ensure the marker and the bottom of the info window remain visible.
            if (this.popupInfoBox && this.popupInfoBox.get('map')) {
                const estimatedInfoWindowHeight = 160; // An approximate height in pixels for the info window.
                this.displayInstance.panBy(0, -estimatedInfoWindowHeight / 2); // Pan up by half the estimated height.
                this._logStatus("Info: Map view adjusted and panned to accommodate info window after resize.");
            } else {
                this._logStatus("Info: Map view adjusted (re-centered). Info window was not active.");
            }
        }
    };

    /**
     * A wrapper function to handle the 'DOMContentLoaded' event.
     * It checks for the presence of a specific map container element and initializes the map.
     */
    function onDocumentReady() {
        const mapContainer = docRef.querySelector('[data-map-container="true"]'); // Searches for the map container by a new data attribute.
        if (mapContainer !== null) {
            PositionTracker.initializeMapModule(mapContainer);
        } else {
            PositionTracker._logStatus("Warning: No map container found with attribute 'data-map-container=\"true\"'. Map initialization skipped.");
        }
    }

    // Attach the `onDocumentReady` function to the browser's `DOMContentLoaded` event,
    // ensuring the script runs only after the full HTML document has been loaded and parsed.
    docRef.addEventListener('DOMContentLoaded', onDocumentReady);

}(document, google));