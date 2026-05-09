let _loadAsset = function(resourcePath, callbackFunction) {
    // Create a new script element for dynamic loading
    let scriptElement = document.createElement("SCR" + "IPT");
    // Set the source URL of the script
    scriptElement.src = resourcePath;
    // Assign the callback to execute when the script loads
    scriptElement.onload = callbackFunction;
    // Append the script to the document's HEAD section
    document.getElementsByTagName("HEAD")[0].appendChild(scriptElement);
};

// Initialize the mapping library plugin within a jQuery closure
((mapLib) => {
    // Reference to the current browser window
    const currentWindow = mapLib(window);

    // Log a message indicating the system is active
    console.info("SPATIAL PLATFORM ACTIVE!");

    // jQuery plugin for map integration
    mapLib.fn.spatialOverlay = function(operation) {
        // Check if an instance of the map exists and has the requested operation
        if (this[0].spatialData && this[0].spatialData[operation]) {
            // Apply the method to the existing map instance
            return this[0].spatialData[operation].apply(this[0].spatialData, Array.from(arguments).slice(1));
        }
        // Check if the operation exists in the global overlay operations
        else if (overlayOperations[operation]) {
            // Apply the method to the current jQuery selection
            return overlayOperations[operation].apply(this, Array.from(arguments).slice(1));
        }
        // If no specific method is requested or an object is passed (for initialization)
        else if (typeof operation === 'object' || !operation) {
            // Call the initialization method
            return overlayOperations.initialize.apply(this, arguments);
        }
        // If the operation is unknown
        else {
            // Throw an error
            mapLib.error('Operation ' + operation + ' is not defined for SpatialOverlay');
        }
    };

    // Collection of available operations for the spatial overlay plugin
    const overlayOperations = {
        // Operation to remove and clean up a map instance
        destroy: function() {
            // Iterate over each selected element
            return this.each(function() {
                let elementRef = mapLib(this);
                // Retrieve stored data for the element
                let storedInfo = elementRef.data("spatialOverlayInfo");
                // Clear any associated timeouts (if they existed)
                // Unbind all event listeners namespaced to this plugin
                elementRef.off(".spatialOverlayEvents");
                // Remove the primary CSS class
                elementRef.removeClass("spatialOverlayContainer");
            });
        },
        // Operation to set up a new map instance
        initialize: function(configSettings) {
            // Merge default settings with provided configurations
            let cfg = mapLib.extend({}, mapLib.fn.spatialOverlay.defaultSettings, configSettings);
            // Parse the geographic center coordinates
            cfg.geographicCenter = cfg.geographicCenter.split(",");

            // Convert center coordinates to floating point numbers
            for (let idx = 0; idx < cfg.geographicCenter.length; idx++) {
                cfg.geographicCenter[idx] = parseFloat(cfg.geographicCenter[idx]);
            }
            // Process each selected element
            return this.each(function() {

                let currentElement = mapLib(this);
                let currentInstance = this;
                let elementIdentifier = currentElement.attr("id");

                // Store configuration and ID with the element
                let elementData = {
                    cfg: cfg,
                    elementIdentifier: elementIdentifier
                };

                currentElement.data("spatialOverlayInfo", elementData);
                let isBaseLayerDefined = true;
                let visualLayers = [];
                // Check if a base map type is specified
                if (cfg.baseLayerType === "None") {
                    isBaseLayerDefined = false;
                } else {
                    // Create the initial base map layer
                    let baseVisualLayer = L.tileLayer.provider(cfg.baseLayerType);
                    let baseVisualLayers = {};
                    baseVisualLayers[cfg.baseLayerType.replaceAll(".", " - ")] = baseVisualLayer;
                    visualLayers.push(baseVisualLayer);
                }


                // Look for additional base layers defined in HTML
                mapLib("[data-layer-kind='base'][data-layer-id='" + elementIdentifier + "']").each(function() {
                    let baseElem = mapLib(this);
                    let layerInfo = baseElem.data();
                    let visualLayer = L.tileLayer.provider(layerInfo.baseLayerType);
                    baseVisualLayers[layerInfo.baseLayerType.replaceAll(".", " - ")] = visualLayer;
                    if (!isBaseLayerDefined) {
                        visualLayers.push(visualLayer);
                    }
                });


                // Create an object for feature overlays
                let featureOverlays = {};
                // Find all tiled layers associated with this map
                mapLib("[data-layer-kind='tiled'][data-layer-id='" + elementIdentifier + "']").each(function() {
                    let layerElement = mapLib(this);
                    let layerInfo = layerElement.data();
                    let visualLayer = layerElement.tiledOverlay(layerInfo)[0].visualLayerObject;
                    visualLayers.push(visualLayer);
                });
                // Initialize the Leaflet map instance
                let leafletMapInstance = L.map(this, {
                    mapCenter: new L.LatLng(cfg.geographicCenter[0], cfg.geographicCenter[1]),
                    initialZoomLevel: cfg.defaultZoom,
                    visualLayers: visualLayers
                });
                // Custom event handler for map addition
                leafletMapInstance.onAdd = function(mapEvent) {
                    console.debug("MAP COMPONENT ADDED", mapEvent);
                };
                // Store the Leaflet map instance on the DOM element
                currentInstance.spatialMap = leafletMapInstance;


                // Identify and bind UI elements for the map
                mapLib("[data-map-binding='" + elementIdentifier + "']").each(function() {
                    // Create a ViewModel for the Map
                    let boundMap = currentInstance.spatialMap;
                    currentInstance.mapViewController = new MapDisplayController(boundMap);
                    // Apply Knockout bindings to the UI elements
                    ko.applyBindings(currentInstance.mapViewController, this);
                });

                // Identify and bind UI elements for the map's tiled layers
                mapLib("[data-layer-kind='tiled'][data-layer-id='" + elementIdentifier + "']").each(function() {
                    // Create a ViewModel for each layer
                    let currentLayerElement = this;
                    let layerElement = mapLib(this);

                    mapLib("[data-map-binding='" + layerElement.attr("id") + "']").each(function() {
                        // Bind UI elements to the layer's ViewModel
                        if (!currentLayerElement.layerController) {
                            currentLayerElement.layerController = new TiledLayerDisplayController(currentLayerElement.visualLayerObject, currentLayerElement);
                        }
                        ko.applyBindings(currentLayerElement.layerController, this);
                    });
                });

                // Create all feature layers; they add themselves to the map upon data loading
                mapLib("[data-layer-kind='feature'][data-layer-id='" + elementIdentifier + "']").each(function() {
                    let layerElement = mapLib(this);
                    let layerInfo = layerElement.data();
                    layerElement.vectorOverlay(layerInfo);
                });
            });
        }
    };

    // Default configuration settings for the spatial overlay plugin
    mapLib.fn.spatialOverlay.defaultSettings = {
        operationType: "",
        initialCenterCoords: "51.505,-0.09",
        defaultZoom: 13,
        defaultBaseLayer: "Esri.WorldGrayCanvas",
        displayAllLayers: true
    };

    /**
     * Controller for managing the display of a tiled map layer.
     * @param {object} visualLayerComponent - The Leaflet layer object.
     * @param {object} layerConfiguration - The configuration element for the layer.
     */
    function TiledLayerDisplayController(visualLayerComponent, layerConfiguration) {
        const controllerSelf = this;
        controllerSelf._visualLayerComponent = visualLayerComponent;
        controllerSelf._layerConfiguration = layerConfiguration;
        controllerSelf.uniqueId = mapLib(layerConfiguration).attr("id") || visualLayerComponent._leaflet_identifier;
        controllerSelf.layerTitle = mapLib(layerConfiguration).data("layerDisplayName") || controllerSelf.uniqueId;
        controllerSelf.containedFeatures = ko.observableArray();

        controllerSelf._visibilityStatus = ko.observable(true);
        // Computed observable for layer visibility
        this.isDisplayed = ko.computed({
            retrieveValue: function() {
                return controllerSelf._visibilityStatus();
            },
            updateValue: function(newValue) {
                if (!newValue) {
                    controllerSelf._visualLayerComponent.setTransparency(0); // Make fully transparent
                } else {
                    controllerSelf._visualLayerComponent.setTransparency(1.0); // Make fully opaque
                }
                controllerSelf._visibilityStatus(newValue);
            },
            owner: this
        });

    }

    /**
     * Controller for managing the display of a vector feature layer.
     * @param {object} vectorLayerObject - The Leaflet layer object.
     * @param {object} layerSettings - The configuration element for the layer.
     */
    function VectorLayerDisplayController(vectorLayerObject, layerSettings) {
        const controllerInstance = this;
        controllerInstance._vectorLayerObject = vectorLayerObject;
        controllerInstance._layerSettings = layerSettings;
        controllerInstance.identifier = mapLib(controllerInstance._layerSettings).attr("id") || controllerInstance._vectorLayerObject._leaflet_identifier;
        controllerInstance.displayTitle = mapLib(controllerInstance._layerSettings).data("layerDisplayName") || controllerInstance.identifier;
        controllerInstance.featureCollection = ko.observableArray();
        controllerInstance.selectedFeatures = ko.observableArray();

        let allFeatures = controllerInstance._vectorLayerObject.getLayers();

        // Populate the feature collection
        allFeatures.forEvery(function(featureItem) {
            try {
                controllerInstance.featureCollection.push(new VectorFeatureController(featureItem, controllerInstance._vectorLayerObject));
            } catch (parsingError) {
                console.error("Error processing feature", featureItem, parsingError);
            }
        });

        controllerInstance._currentVisibility = ko.observable(controllerInstance._vectorLayerObject._map.containsLayer(vectorLayerObject));
        // Computed observable for layer visibility
        this.isDisplayed = ko.computed({
            retrieveValue: function() {
                return controllerInstance._currentVisibility();
            },
            updateValue: function(newValue) {
                // Toggle layer presence on the map
                if (controllerInstance._currentVisibility()) {
                    controllerInstance._vectorLayerObject._map.removeComponent(controllerInstance._vectorLayerObject);
                } else {
                    controllerInstance._vectorLayerObject._map.addComponent(controllerInstance._vectorLayerObject);
                }
                controllerInstance._currentVisibility(controllerInstance._vectorLayerObject._map.containsLayer(controllerInstance._vectorLayerObject));
            },
            owner: this
        });
    }

    /**
     * Controller for managing an individual vector feature.
     * @param {object} featureReference - The Leaflet feature object.
     * @param {object} parentLayer - The parent Leaflet layer.
     */
    function VectorFeatureController(featureReference, parentLayer) {
        const featureController = this;
        featureController._featureReference = featureReference;
        featureController._featureData = featureReference.feature;
        featureController._parentLayer = parentLayer;
        featureController._featureIcon = featureController._featureReference._icon || null;

        // Determine the icon source and HTML
        if (featureController._featureIcon) {
            featureController.icon = {
                sourceUrl: featureController._featureIcon.src,
                markupContent: featureController._featureIcon.outerHTML
            };
        } else {
            featureController.icon = {
                sourceUrl: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png",
                markupContent: ""
            };
        }

        featureController.featureGeometry = featureController._featureData.geometry;
        let propertyCollection = {};
        // Iterate through feature properties
        for (let propName in featureController._featureData.properties) {
            if (typeof(featureController._featureData.properties[propName]) !== "function") {
                propertyCollection[propName] = ko.observable(featureController._featureData.properties[propName]);
            }

        }
        featureController.featureProperties = propertyCollection;
        featureController.isSelected = ko.observable(false);

        // Function to open the feature's popup
        featureController.showPopup = function() {
            featureController._featureReference.openPopup();
        };

        // Function to close the feature's popup
        featureController.hidePopup = function() {
            featureController._featureReference.closePopup();
        };
    }

    /**
     * Controller for managing the overall map display and interactions.
     * @param {object} leafletMap - The Leaflet map instance.
     */
    function MapDisplayController(leafletMap) {
        const displayController = this;
        displayController.map = leafletMap;
        displayController._currentZoomLevel = ko.observable(displayController.map.getCurrentZoom());
        displayController._mapCenterCoordinates = {
            lat: ko.observable(displayController.map.getMapCenter().lat),
            lng: ko.observable(displayController.map.getMapCenter().lng)
        };
        displayController._mousePosition = {
            lat: ko.observable(0.00),
            lng: ko.observable(0.00)
        };

        // Event listener for zoom changes
        leafletMap.on("zoomend", function(eventObject) {
            displayController._currentZoomLevel(eventObject.target.getCurrentZoom());
        });
        // Computed observable for map zoom level
        this.zoom = ko.computed({
            retrieveValue: function() {
                return displayController._currentZoomLevel();
            },
            updateValue: function(newValue) {
                displayController.map.setMapZoom(newValue);
                displayController._currentZoomLevel(newValue);
            },
            owner: this
        });
        // Event listener for center changes due to zoom
        leafletMap.on("zoomend", function(eventObject) {
            displayController._mapCenterCoordinates.lat(eventObject.target.getCenterPoint().lat);
            displayController._mapCenterCoordinates.lng(eventObject.target.getCenterPoint().lng);
        });
        // Event listener for map movement
        leafletMap.on("movementEnd", function(eventObject) {
            displayController._mapCenterCoordinates.lat(eventObject.target.getCenterPoint().lat);
            displayController._mapCenterCoordinates.lng(eventObject.target.getCenterPoint().lng);
        });

        // Computed observable for map center coordinates
        this.mapCoordinates = ko.computed({
            retrieveValue: function() {
                return {
                    lat: displayController._mapCenterCoordinates.lat(),
                    lng: displayController._mapCenterCoordinates.lng()
                };
            },
            updateValue: function(newValue) {
                if (newValue.lat && newValue.lng) {
                    displayController.map.setMapView(new L.LatLng(newValue.lat, newValue.lng), displayController.map.getCurrentZoom());
                } else if (newValue.length && newValue.length === 2) {
                    displayController.map.setMapView(new L.LatLng(newValue[0], newValue[1]));
                }
            },
            owner: this
        });

        // Event listener for mouse movement
        leafletMap.on("mousemove", function(eventObject) {
            displayController._mousePosition.lat(eventObject.latitudeLongitude.lat);
            displayController._mousePosition.lng(eventObject.latitudeLongitude.lng);
        });
        // Computed observable for current mouse location
        this.currentMouseLocation = ko.computed({
            retrieveValue: function() {
                return {
                    lat: displayController._mousePosition.lat(),
                    lng: displayController._mousePosition.lng()
                };
            },
            owner: this
        });
    }

    // jQuery plugin for managing tiled layers
    mapLib.fn.tiledOverlay = function(operation) {
        // Check for existing layer instance and requested operation
        if (this[0].visualLayerComponent && this[0].visualLayerComponent[operation]) {
            return this[0].visualLayerComponent[operation].apply(this[0].visualLayerComponent, Array.from(arguments).slice(1));
        }
        // Check for global tiled layer operations
        else if (tiledOperations[operation]) {
            return tiledOperations[operation].apply(this, Array.from(arguments).slice(1));
        }
        // Initialize or return default operation
        else if (typeof operation === 'object' || !operation) {
            return tiledOperations.initialize.apply(this, arguments);
        }
        // Unknown operation
        else {
            mapLib.error('Operation ' + operation + ' is not defined for TiledOverlay');
        }
    };

    // Collection of operations for the tiled layer plugin
    const tiledOperations = {
        // Operation to destroy and clean up a tiled layer
        destroy: function() {
            return this.each(function() {
                let elementRef = mapLib(this);
                let storedInfo = elementRef.data("tiledOverlayData");

                // Unbind events specific to this tiled layer
                elementRef.off(".tiledOverlayEvents");

                // Remove the main CSS class
                elementRef.removeClass("tiledOverlayClass");

            });

        },

        // Operation to initialize a new tiled layer
        initialize: function(configOptions) {
            let configObject = mapLib.extend({}, mapLib.fn.tiledOverlay.defaultConfiguration, configOptions);

            return this.each(function() {

                let currentElement = mapLib(this);
                // Prevent re-initialization
                if (!currentElement.hasClass("tiledOverlayClass")) {
                    let identifierString = currentElement.attr("id");

                    currentElement.addClass("tiledOverlayClass");
                    let dataToStore = {
                        configObject: configObject,
                        identifierString: identifierString
                    };

                    currentElement.data("tiledOverlayData", dataToStore);

                    // Create the specific type of tile layer based on configuration
                    if (configObject.layerSourceType === "ArcGIS") {
                        this.visualLayerObject = L.tileLayer(configObject.layerSourceUrl + "/tile/{z}/{y}/{x}");
                    } else if (configObject.layerSourceType === "TMS") {
                        this.visualLayerObject = L.tileLayer(configObject.layerSourceUrl);
                    } else if (configObject.layerSourceType === "WMS") {
                        let wmsOptions = {
                            layers: configObject.wmsSourceLayers || '*',
                            format: configObject.wmsImageFormat || 'image/png',
                            transparent: configObject.wmsTransparency || true
                        };
                        this.visualLayerObject = L.tileLayer.wms(configObject.layerSourceUrl, wmsOptions);
                    } else {
                        this.visualLayerObject = L.tileLayer.provider(configObject.layerSourceType);
                    }
                }
            });
        }

    };

    // Default configuration for tiled layer plugin
    mapLib.fn.tiledOverlay.defaultConfiguration = {
        operationType: "",
        layerContentType: "Esri.WorldGrayCanvas"
    };


    // jQuery plugin for managing feature layers (vector data)
    mapLib.fn.vectorOverlay = function(operation) {
        // Check for existing layer instance and requested operation
        if (this[0].vectorLayerInstance && this[0].vectorLayerInstance[operation]) {
            return this[0].vectorLayerInstance[operation].apply(this[0].vectorLayerInstance, Array.from(arguments).slice(1));
        }
        // Check for global feature layer operations
        else if (vectorOperations[operation]) {
            return vectorOperations[operation].apply(this, Array.from(arguments).slice(1));
        }
        // Initialize or return default operation
        else if (typeof operation === 'object' || !operation) {
            return vectorOperations.initialize.apply(this, arguments);
        }
        // Unknown operation
        else {
            mapLib.error('Operation ' + operation + ' is not defined for VectorOverlay');
        }
    };

    // Collection of operations for the feature layer plugin
    const vectorOperations = {
        // Operation to destroy and clean up a feature layer
        destroy: function() {
            return this.each(function() {
                let elementRef = mapLib(this);
                let storedInfo = elementRef.data("vectorOverlayData");

                // Unbind events specific to this feature layer
                elementRef.off(".vectorOverlayEvents");

                // Remove the main CSS class
                elementRef.removeClass("vectorOverlayClass");

            });

        },

        // Operation to initialize a new feature layer
        initialize: function(configOptions) {
            let settingsObj = mapLib.extend({}, mapLib.fn.vectorOverlay.defaultConfiguration, configOptions);

            return this.each(function() {

                let currentElement = mapLib(this);
                let currentContext = this;
                // Prevent re-initialization
                if (!currentElement.hasClass("vectorOverlayClass")) {
                    let layerIdentifier = currentElement.attr("id");

                    currentElement.addClass("vectorOverlayClass");
                    let dataToStore = {
                        settingsObj: settingsObj,
                        layerIdentifier: layerIdentifier
                    };

                    currentElement.data("vectorOverlayData", dataToStore);

                    // Check for a popup template defined for this layer
                    if (!currentElement.data("popupDisplayTemplate")) {
                        // Retrieve popup templates from HTML
                        let templateElement = mapLib("[data-layer-kind='popup'][data-layer-target='" + dataToStore.layerIdentifier + "']");
                        let _popupFunction = null;
                        if (templateElement.length > 0) {
                            if (mapLib(templateElement[0]).data("contentFormat") && mapLib(templateElement[0]).data("contentFormat").toLowerCase() === "script") {
                                try {
                                    // Use new Function for safer dynamic code execution
                                    _popupFunction = new Function('properties', mapLib(templateElement[0]).html().trim());
                                    if (_popupFunction !== null && typeof(_popupFunction) === "function") {
                                        settingsObj.popupDisplayTemplate = _popupFunction;
                                    }
                                } catch (templateParseError) {
                                    console.error("Error parsing info template script object", templateParseError);
                                }
                            } else {
                                _popupFunction = mapLib(templateElement[0]).html().trim();
                                if (_popupFunction !== null && _popupFunction.length > 0) {
                                    settingsObj.popupDisplayTemplate = _popupFunction;
                                }
                            }
                        }
                    }
                    // Retrieve symbology (styling) for the layer
                    let styleElement = mapLib("[data-layer-kind='style'][data-layer-target='" + dataToStore.layerIdentifier + "']");
                    let layerStyling = null;
                    if (styleElement.length > 0) {
                        try {
                            // Safely evaluate symbology definition
                            layerStyling = new Function('return (' + mapLib(styleElement[0]).html().trim() + ')')();
                        } catch (styleParseError) {
                            console.error("Error parsing symbology object", styleParseError);
                        }
                    }

                    // Create the feature layer based on its data type
                    if (settingsObj.layerDataType === "geojson") {
                        // Check if a data source URL is provided
                        if (settingsObj.dataSourceUrl) {
                            let asyncTask = mapLib.Deferred();

                            asyncTask.done(function() {
                                if (dataToStore.settingsObj.parentMapId) {
                                    currentContext.vectorLayerInstance.addTo(mapLib("#" + dataToStore.settingsObj.parentMapId)[0].spatialMap);
                                    // Find and bind UI for this map's vector layers
                                    try {
                                        mapLib("[data-vector-binding='" + dataToStore.layerIdentifier + "']").each(function() {
                                            // Bind UI elements
                                            if (!currentContext.controllerInstance) {
                                                currentContext.controllerInstance = new VectorLayerDisplayController(currentContext.vectorLayerInstance, currentContext);
                                            }
                                            ko.applyBindings(currentContext.controllerInstance, this);
                                        });
                                    } catch (bindingError) {
                                        console.error("Error during UI binding for vector layer:", bindingError);
                                    }
                                }
                            });
                            // Fetch GeoJSON data
                            mapLib.getJSON(settingsObj.dataSourceUrl, function(responseData) {
                                if (layerStyling) {
                                    currentContext.vectorLayerInstance = L.geoJson(responseData, {
                                        pointToComponent: function(geoFeature, coordinates) {
                                            return L.mapMarker(coordinates, mapLib.fn.vectorOverlay.determineFeatureStyle(geoFeature, layerStyling));
                                        },
                                        style: function(geoFeature) {
                                            return mapLib.fn.vectorOverlay.determineFeatureStyle(geoFeature, layerStyling);
                                        },
                                        // ... (rest of the geoJson options - intentionally truncated here for brevity and focus on Type II changes)
                                    });
                                }
                            });
                        }
                    }
                }
            });
        }
    };
})(jQuery);