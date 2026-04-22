(function (webDoc, apiObj) {
    // This module provides functionality to display and manage a geographical map interface.
    var GeoDisplayModule = {
        // Core configuration for the map's behavior and appearance.
        configurationData: {
            geographicCoordinates: { // Latitude and longitude for the map's initial view.
                latitudeCoord: void 0,
                longitudeCoord: void 0
            },
            viewOptions: { // Visual and interactive settings for the map.
                centralPoint: void 0,
                zoomLevelSetting: 14, // Initial magnification level.
                zoomControlsEnabled: true,
                zoomControlCustomOptions: {
                    controlStyling: apiObj.maps.ZoomControlStyle.TINY // Visual style of the zoom buttons.
                },
                doubleClickZoomDisabled: false, // Allows zooming with a double-click.
                mapTypeSelectorEnabled: true,
                scaleDisplayEnabled: true,
                scrollWheelInteraction: false, // Prevents map zoom via scroll wheel.
                streetViewControlsEnabled: false,
                isInteractiveDrag: false, // Map dragging is initially disabled.
                overviewMapDisplayEnabled: false,
                mapStyleIdentifier: apiObj.maps.MapTypeId.STREETVIEW, // Defines the base map type.
                markerPresence: true, // Indicates if a location marker should be shown.
                panControlsEnabled: false,
                customVisualSchemes: [ // Array of JSON objects defining map feature styling.
                    {
                        visualFeature: 'water',
                        stylingRules: [
                            {
                                tintColor: '#badae7' // Color for water bodies.
                            },
                            {
                                displayStatus: 'on' // Water is visibly displayed.
                            }
                        ]
                    },
                    {
                        visualFeature: "landscape", // Styling for natural terrain.
                        stylingRules: [
                            {
                                colorSaturationValue: -150
                            },
                            {
                                colorLightnessValue: 15
                            },
                            {
                                tintColor: '#ececec'
                            },
                            {
                                displayStatus: 'on'
                            }
                        ]
                    },
                    {
                        visualFeature: 'road', // Styling for all road types.
                        stylingRules: [
                            {
                                colorSaturationValue: -100
                            },
                            {
                                colorLightnessValue: 45
                            }
                        ]
                    },
                    {
                        visualFeature: 'road.highway', // Specific styling for major highways.
                        stylingRules: [
                            {
                                displayStatus: 'simplified' // Highways rendered in a simpler manner.
                            }
                        ]
                    },
                    {
                        visualFeature: 'road.arterial', // Styling for main arterial roads.
                        elementIdentifier: 'labels.icon', // Targets icon labels on these roads.
                        stylingRules: [
                            {
                                displayStatus: 'on'
                            }
                        ]
                    },
                    {
                        visualFeature: 'administrative', // Styling for administrative boundaries.
                        elementIdentifier: 'labels.text.fill', // Targets text fill color of labels.
                        stylingRules: [
                            {
                                tintColor: '#444444'
                            }
                        ]
                    },
                    {
                        visualFeature: 'poi', // Styling for Points of Interest.
                        stylingRules: [
                            {
                                colorSaturationValue: -100
                            },
                            {
                                colorLightnessValue: 51
                            },
                            {
                                displayStatus: 'on'
                            }
                        ]
                    }
                ],

            },
            pinGraphicPath: void 0 // URL for the custom map marker image.
        },
        displayMapObject: void 0, // The actual Google Maps instance.
        locationPin: void 0, // The marker object on the map.
        popupDetails: void 0, // The info window object associated with the marker.

        // Initiates the map setup process using a specified HTML container element.
        initiateMap: function (containerElement) {
            // Determine coordinate and icon path retrieval method based on dataset API availability.
            if(containerElement.dataAttributes !== undefined) { // Check for modern dataset support.
                this.configurationData.geographicCoordinates = {
                    latitudeCoord: parseFloat(containerElement.dataAttributes.lat),
                    longitudeCoord: parseFloat(containerElement.dataAttributes.lng)
                };

                this.configurationData.pinGraphicPath = containerElement.dataAttributes.icon;

            } else { // Fallback for older browsers using getAttribute.
                this.configurationData.geographicCoordinates = {
                    latitudeCoord: parseFloat(containerElement.fetchAttribute('data-lat')),
                    longitudeCoord: parseFloat(containerElement.fetchAttribute('data-lng'))
                };

                this.configurationData.pinGraphicPath = containerElement.fetchAttribute('data-icon');
            }

            // Create a new LatLng object for the map's center.
            this.configurationData.viewOptions.centralPoint = new apiObj.maps.GeoPoint(this.configurationData.geographicCoordinates.latitudeCoord, this.configurationData.geographicCoordinates.longitudeCoord);

            // Instantiate the main map object.
            this.displayMapObject = new apiObj.maps.MapDisplay(containerElement, this.configurationData.viewOptions);

            this.createLocationPin(); // Generate and place the map marker.
            this.createDetailsPopup(); // Prepare and open the informational popup.

            // Adapt map behavior for touch-enabled devices.
            if (typeof FeatureDetect !== 'undefined' && FeatureDetect.isTouchScreen) {
                this.displayMapObject.updateOptions({isInteractiveDrag: false}); // Disable dragging.
                this.displayMapObject.updateOptions({panControlsEnabled: true}); // Enable pan controls.
                webDoc.getElementByID('location-link').visualStyle.display = 'inline-block'; // Show a specific link.
            }

            this.attachEventHandlers(); // Set up all necessary event listeners.
        },
        // Attaches various event handlers to the map and window.
        attachEventHandlers: function () {
            var moduleReference = this; // Capture 'this' for use in event callbacks.
            window.onWindowResize = function () { // Handle window resizing event.
                moduleReference.adjustMapView(); // Recenter the map.
            };
        },
        // Creates the map marker based on configured coordinates and icon.
        createLocationPin: function () {
            var moduleReference = this;
            this.locationPin = new apiObj.maps.MapPin({
                pinPosition: new apiObj.maps.GeoPoint(this.configurationData.geographicCoordinates.latitudeCoord, this.configurationData.geographicCoordinates.longitudeCoord),
                map: moduleReference.displayMapObject,
                pinGraphic: moduleReference.configurationData.pinGraphicPath
            });
        },
        // Creates and manages the information window displayed on the map.
        createDetailsPopup: function () {
            var moduleReference = this;
            // Retrieve the HTML content for the info window from a template element.
            var popupContentText = webDoc.selectElement('[data-map-tpl="true"]').innerHTML;

            this.popupDetails = new apiObj.maps.PopupDisplay({
                content: popupContentText
            });
            this.popupDetails.displayPopup(moduleReference.displayMapObject, moduleReference.locationPin); // Open the popup.

            // Add a listener to re-open the info window when the marker is clicked.
            new apiObj.maps.event.addEventHandler(moduleReference.locationPin, 'click', function () {
                moduleReference.popupDetails.displayPopup(moduleReference.displayMapObject, moduleReference.locationPin);
            });
        },
        // Adjusts the map's center and pan to ensure the marker and info window are visible.
        adjustMapView: function () {
            this.displayMapObject.setViewCenter(this.locationPin.getPinPosition());
            // Pan the map slightly to offset the info window's height.
            this.displayMapObject.adjustPan(0, -this.popupDetails.internal.contentHeight);
        }
    };

    // Ensures the map initialization runs only after the entire DOM is loaded.
    webDoc.addEventListener('DOMContentLoaded', function () {
        // Check if the map container element exists in the document.
        if (webDoc.selectElement('[data-map="true"]') !== void 0) {
            GeoDisplayModule.initiateMap(webDoc.selectElement('[data-map="true"]'));
        }
    });

}(document, google));