const dynamicScriptLoader = function(resourcePath, completionCallback) {
    // This function injects a script into the document head for dynamic loading.
    // It's a fundamental utility for fetching external JavaScript resources.
    if (!document || !document.createElement || !document.getElementsByTagName) {
        console.warn("DOM not ready for script injection.");
        return;
    }
    const scriptElement = document.createElement("script");
    scriptElement.src = resourcePath;
    scriptElement.async = true; // Asynchronous loading is generally preferred
    scriptElement.onload = completionCallback;
    scriptElement.onerror = (errorEvt) => {
        console.error(`Failed to load script from ${resourcePath}`, errorEvt);
        if (typeof completionCallback === 'function') {
            completionCallback(new Error(`Loading failed for ${resourcePath}`));
        }
    };
    document.getElementsByTagName("head")[0].appendChild(scriptElement);
};

(function(jQueryFacade) {
    "use strict"; // Enforce stricter parsing and error handling

    const windowRef = jQueryFacade(window);

    // Helper function for consistent argument slicing
    const extractMethodArguments = (args, startIndex = 1) => [...args].slice(startIndex);

    /**
     * Core mapping component plugin for jQuery.
     * Manages initialization, method dispatch, and destruction of interactive maps.
     * @param {string|object} operation - The name of the method to call, or an options object for initialization.
     * @returns {jQuery} - The jQuery object for chaining, or method-specific return values.
     */
    jQueryFacade.fn.geoInteractiveMap = function(operation) {
        // Ensure we're working with a valid DOM element
        if (!this.length || !this[0]) {
            console.warn("Attempted to call geoInteractiveMap on an empty or invalid jQuery selection.");
            return this;
        }

        const mapInstance = this[0].activeGeoMapInstance; // Check for existing instance

        // Dispatch based on the 'operation' argument
        if (mapInstance && typeof mapInstance[operation] === 'function') {
            // If an instance exists and has the requested method
            return mapInstance[operation].apply(mapInstance, extractMethodArguments(arguments));
        } else if (mapComponentHandlers[operation]) {
            // If it's a static method or init on a new instance
            return mapComponentHandlers[operation].apply(this, extractMethodArguments(arguments, 0));
        } else if (typeof operation === 'object' || !operation) {
            // Default to 'initialize' if no method or an options object is provided
            return mapComponentHandlers.initialize.apply(this, arguments);
        } else {
            // Fallback for unknown methods
            jQueryFacade.error(`Method '${operation}' does not exist on geoInteractiveMap plugin.`);
            return this; // Return jQuery object for chaining even on error
        }
    };

    /**
     * Contains the internal methods for the geoInteractiveMap plugin.
     * @private
     */
    const mapComponentHandlers = {
        /**
         * Destroys the map instance associated with the selected elements.
         * Cleans up events, data, and CSS classes.
         * @returns {jQuery} - The jQuery object for chaining.
         */
        destroy: function() {
            return this.each(function() {
                const targetElement = jQueryFacade(this);
                const componentData = targetElement.data("geoMapPluginData");

                if (!componentData) {
                    // Nothing to destroy if no data is present
                    return;
                }

                // If a Leaflet map exists, destroy it
                if (this.activeGeoMapInstance && typeof this.activeGeoMapInstance.remove === 'function') {
                    this.activeGeoMapInstance.remove();
                    delete this.activeGeoMapInstance; // Remove reference
                }

                // Unbind all events namespaced with .geoInteractiveMap
                targetElement.off(".geoInteractiveMap");
                // Remove stored data
                targetElement.removeData("geoMapPluginData");
                // Remove the main CSS class
                targetElement.removeClass("geo-interactive-map-active");

                console.info(`Map component on #${targetElement.attr('id')} destroyed.`);
            });
        },

        /**
         * Initializes the geoInteractiveMap plugin for the selected elements.
         * Sets up Leaflet maps, baselayers, overlays, and UI bindings.
         * @param {object} [initialConfig={}] - Configuration options for the map.
         * @returns {jQuery} - The jQuery object for chaining.
         */
        initialize: function(initialConfig = {}) {
            // Merge default options with user-provided configuration
            const processedConfig = jQueryFacade.extend(
                {},
                jQueryFacade.fn.geoInteractiveMap.defaults,
                initialConfig
            );

            // Validate Leaflet library availability
            if (typeof L === 'undefined') {
                console.error("Leaflet library (L) is not loaded. Cannot initialize geoInteractiveMap.");
                return this;
            }
            // Validate Knockout.js library availability if UI binding is expected
            if (typeof ko === 'undefined') {
                console.warn("Knockout.js (ko) library is not loaded. UI binding features will be unavailable.");
            }

            return this.each(function() {
                const currentElement = jQueryFacade(this);
                // Prevent re-initialization if already active
                if (currentElement.hasClass("geo-interactive-map-active")) {
                    console.warn(`Map component on #${currentElement.attr('id')} is already initialized.`);
                    return;
                }

                const domElementRef = this; // Direct DOM element reference
                const mapIdentifier = currentElement.attr("id");

                // Process geographic center coordinates
                let centerCoords = processedConfig.initialCoordinates.split(",").map(coord => parseFloat(coord.trim()));
                if (centerCoords.length !== 2 || isNaN(centerCoords[0]) || isNaN(centerCoords[1])) {
                    console.error("Invalid initialCoordinates format. Using default.");
                    centerCoords = [jQueryFacade.fn.geoInteractiveMap.defaults.initialCoordinates.split(",")[0],
                                    jQueryFacade.fn.geoInteractiveMap.defaults.initialCoordinates.split(",")[1]].map(parseFloat);
                }
                processedConfig.initialCoordinates = centerCoords; // Update config with parsed values

                const instanceData = {
                    config: processedConfig,
                    elementId: mapIdentifier,
                    activeLayers: []
                };

                // Store instance data on the element
                currentElement.data("geoMapPluginData", instanceData);
                currentElement.addClass("geo-interactive-map-active");

                let explicitBasemapDefined = false;
                const availableBasemaps = {};
                const initialMapLayers = [];

                // Handle primary basemap configuration
                if (processedConfig.baseMapProvider && processedConfig.baseMapProvider !== "None") {
                    const primaryBasemapLayer = L.tileLayer.provider(processedConfig.baseMapProvider);
                    availableBasemaps[processedConfig.baseMapProvider.replace(/\./g, " - ")] = primaryBasemapLayer;
                    initialMapLayers.push(primaryBasemapLayer);
                    explicitBasemapDefined = true;
                }

                // Process additional basemaps defined via data attributes
                jQueryFacade(`[data-geo-layer-type='basemap'][data-geo-map-id='${mapIdentifier}']`).each(function() {
                    const basemapEl = jQueryFacade(this);
                    const layerAttrs = basemapEl.data();
                    if (layerAttrs.geoBasemapProvider) {
                        const additionalBasemap = L.tileLayer.provider(layerAttrs.geoBasemapProvider);
                        availableBasemaps[layerAttrs.geoBasemapProvider.replace(/\./g, " - ")] = additionalBasemap;
                        if (!explicitBasemapDefined) {
                            initialMapLayers.push(additionalBasemap); // Add only if no primary basemap was set
                            explicitBasemapDefined = true; // Consider the first found as the default
                        }
                    }
                });

                // Process tile layer overlays
                jQueryFacade(`[data-geo-layer-type='tileLayer'][data-geo-map-id='${mapIdentifier}']`).each(function() {
                    const currentLayerElement = jQueryFacade(this);
                    const layerSettings = currentLayerElement.data();
                    // Initialize the tile layer plugin for this element
                    currentLayerElement.geoTileComponent(layerSettings);
                    const createdLayer = this.activeGeoTileLayer; // Access the layer created by the plugin
                    if (createdLayer) {
                        initialMapLayers.push(createdLayer);
                    }
                });

                // Create the Leaflet map instance
                const leafletMapInstance = L.map(domElementRef, {
                    center: L.latLng(processedConfig.initialCoordinates[0], processedConfig.initialCoordinates[1]),
                    zoom: processedConfig.initialZoomLevel,
                    layers: initialMapLayers
                });
                domElementRef.activeGeoMapInstance = leafletMapInstance; // Store reference on the DOM element

                // Attempt to bind UI if Knockout is available
                if (typeof ko !== 'undefined') {
                    // Find and bind UI elements for the map itself
                    jQueryFacade(`[data-geo-binding-target='${mapIdentifier}']`).each(function() {
                        if (!domElementRef.mapViewModel) {
                            domElementRef.mapViewModel = new MapController(leafletMapInstance);
                        }
                        try {
                            ko.applyBindings(domElementRef.mapViewModel, this);
                        } catch (bindErr) {
                            console.error(`Error binding MapViewModel to element #${this.id}:`, bindErr);
                        }
                    });

                    // Find and bind UI elements for associated TileLayers
                    jQueryFacade(`[data-geo-layer-type='tileLayer'][data-geo-map-id='${mapIdentifier}']`).each(function() {
                        const layerDomNode = this;
                        const layerId = jQueryFacade(this).attr("id");
                        jQueryFacade(`[data-geo-binding-target='${layerId}']`).each(function() {
                            if (!layerDomNode.layerViewModel) {
                                layerDomNode.layerViewModel = new TileLayerController(layerDomNode.activeGeoTileLayer, layerDomNode);
                            }
                            try {
                                ko.applyBindings(layerDomNode.layerViewModel, this);
                            } catch (bindErr) {
                                console.error(`Error binding TileLayerController to element #${this.id}:`, bindErr);
                            }
                        });
                    });
                } else {
                    console.warn("Knockout.js not found. Skipping UI bindings for map and layers.");
                }


                // Initialize feature layers (these often add themselves to the map upon data load)
                jQueryFacade(`[data-geo-layer-type='featureLayer'][data-geo-map-id='${mapIdentifier}']`).each(function() {
                    const featureLayerElement = jQueryFacade(this);
                    const featureLayerSettings = featureLayerElement.data();
                    // Initialize the feature layer plugin for this element
                    featureLayerElement.geoFeatureComponent(featureLayerSettings);
                });

                console.info(`Interactive map #${mapIdentifier} initialized.`);
            });
        }
    };

    /**
     * Default configuration options for the geoInteractiveMap plugin.
     * @property {string} defaultAction - The default method to invoke if none is specified.
     * @property {string} initialCoordinates - Latitude and longitude for map center (e.g., "51.505, -0.09").
     * @property {number} initialZoomLevel - Default zoom level for the map.
     * @property {string} baseMapProvider - The default basemap provider (e.g., "Esri.WorldGrayCanvas").
     * @property {boolean} displayLayerControls - Whether to show layer controls on the map.
     */
    jQueryFacade.fn.geoInteractiveMap.defaults = {
        defaultAction: "initialize",
        initialCoordinates: "51.505, -0.09",
        initialZoomLevel: 13,
        baseMapProvider: "Esri.WorldGrayCanvas",
        displayLayerControls: true
    };

    /**
     * ViewModel for managing a single TileLayer's state and interactions.
     * @param {L.TileLayer} leafletLayerObj - The Leaflet TileLayer instance.
     * @param {HTMLElement} layerConfigNode - The DOM element containing the layer configuration.
     * @constructor
     */
    function TileLayerController(leafletLayerObj, layerConfigNode) {
        const viewModelRef = this;
        viewModelRef._leafletLayer = leafletLayerObj;
        viewModelRef._domConfigNode = layerConfigNode;

        viewModelRef.uniqueId = jQueryFacade(layerConfigNode).attr("id") || leafletLayerObj._leaflet_id;
        viewModelRef.displayTitle = jQueryFacade(layerConfigNode).data("geoLayerTitle") || `Layer ${viewModelRef.uniqueId}`;
        viewModelRef.associatedFeatures = ko.observableArray([]); // Placeholder for features, if any

        viewModelRef._visibilityState = ko.observable(true); // Internal observable for visibility
        viewModelRef.isVisible = ko.computed({
            read: function() {
                return viewModelRef._visibilityState();
            },
            write: function(newValue) {
                if (!viewModelRef._leafletLayer) {
                    console.warn(`Attempted to change visibility of an undefined layer for ${viewModelRef.uniqueId}`);
                    return;
                }
                const newOpacity = newValue ? 1.0 : 0;
                viewModelRef._leafletLayer.setOpacity(newOpacity);
                viewModelRef._visibilityState(newValue);
            },
            owner: viewModelRef
        });
    }

    /**
     * ViewModel for managing a single FeatureLayer's state and interactions.
     * @param {L.GeoJSON} leafletFeatureLayer - The Leaflet GeoJSON layer instance.
     * @param {HTMLElement} featureConfigNode - The DOM element containing the feature layer configuration.
     * @constructor
     */
    function FeatureLayerController(leafletFeatureLayer, featureConfigNode) {
        const featureVMRef = this;
        featureVMRef._leafletFeatureLayer = leafletFeatureLayer;
        featureVMRef._domConfigNode = featureConfigNode;

        featureVMRef.componentId = jQueryFacade(featureConfigNode).attr("id") || leafletFeatureLayer._leaflet_id;
        featureVMRef.componentTitle = jQueryFacade(featureConfigNode).data("geoLayerTitle") || `Feature Layer ${featureVMRef.componentId}`;
        featureVMRef.containedFeatures = ko.observableArray([]);
        featureVMRef.selectedItems = ko.observableArray([]);

        // Populate containedFeatures from the Leaflet layer
        if (leafletFeatureLayer && typeof leafletFeatureLayer.getLayers === 'function') {
            leafletFeatureLayer.getLayers().forEach(function(featureItem) {
                try {
                    featureVMRef.containedFeatures.push(new FeatureController(featureItem, leafletFeatureLayer));
                } catch (featureErr) {
                    console.error(`Failed to create FeatureController for item:`, featureItem, featureErr);
                }
            });
        }

        // Determine initial visibility and observe changes
        const initialLayerVisibility = leafletFeatureLayer && leafletFeatureLayer._map ? leafletFeatureLayer._map.hasLayer(leafletFeatureLayer) : false;
        featureVMRef._visibilityState = ko.observable(initialLayerVisibility);

        featureVMRef.isVisible = ko.computed({
            read: function() {
                return featureVMRef._visibilityState();
            },
            write: function(newValue) {
                if (!featureVMRef._leafletFeatureLayer || !featureVMRef._leafletFeatureLayer._map) {
                    console.warn(`Layer or map reference missing for feature layer ${featureVMRef.componentId}.`);
                    return;
                }
                const currentMap = featureVMRef._leafletFeatureLayer._map;
                const isCurrentlyOnMap = currentMap.hasLayer(featureVMRef._leafletFeatureLayer);

                if (newValue && !isCurrentlyOnMap) {
                    currentMap.addLayer(featureVMRef._leafletFeatureLayer);
                } else if (!newValue && isCurrentlyOnMap) {
                    currentMap.removeLayer(featureVMRef._leafletFeatureLayer);
                }
                // Update internal state based on actual map presence
                featureVMRef._visibilityState(currentMap.hasLayer(featureVMRef._leafletFeatureLayer));
            },
            owner: featureVMRef
        });
    }

    /**
     * ViewModel for managing a single geographic feature.
     * @param {L.Layer} featureObject - The Leaflet layer representing the feature (e.g., L.Marker, L.Path).
     * @param {L.GeoJSON} parentLayer - The parent GeoJSON layer this feature belongs to.
     * @constructor
     */
    function FeatureController(featureObject, parentLayer) {
        const featureInstance = this;
        featureInstance._internalFeatureRef = featureObject;
        featureInstance._geoJsonFeature = featureObject.feature; // GeoJSON properties
        featureInstance._parentLayer = parentLayer;
        featureInstance._leafletIcon = featureObject._icon || null;

        // Extract icon details for display
        featureInstance.iconDetails = featureInstance._leafletIcon ? {
            sourceUrl: featureInstance._leafletIcon.src || '',
            htmlContent: featureInstance._leafletIcon.outerHTML || ''
        } : {
            sourceUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png", // Default Leaflet marker
            htmlContent: ""
        };

        featureInstance.geometryData = featureInstance._geoJsonFeature ? featureInstance._geoJsonFeature.geometry : null;

        const observableProperties = {};
        if (featureInstance._geoJsonFeature && featureInstance._geoJsonFeature.properties) {
            Object.keys(featureInstance._geoJsonFeature.properties).forEach(propKey => {
                const propValue = featureInstance._geoJsonFeature.properties[propKey];
                // Only make non-function properties observable
                if (typeof propValue !== "function") {
                    observableProperties[propKey] = ko.observable(propValue);
                }
            });
        }
        featureInstance.properties = observableProperties;
        featureInstance.isSelected = ko.observable(false);

        /** Opens the popup associated with this feature, if any. */
        featureInstance.showPopup = function() {
            if (featureInstance._internalFeatureRef && typeof featureInstance._internalFeatureRef.openPopup === 'function') {
                featureInstance._internalFeatureRef.openPopup();
            }
        };

        /** Closes the popup associated with this feature, if any. */
        featureInstance.hidePopup = function() {
            if (featureInstance._internalFeatureRef && typeof featureInstance._internalFeatureRef.closePopup === 'function') {
                featureInstance._internalFeatureRef.closePopup();
            }
        };
    }

    /**
     * ViewModel for managing the state of a Leaflet map.
     * Provides observable properties for zoom, center, and mouse coordinates.
     * @param {L.Map} underlyingMap - The Leaflet map instance.
     * @constructor
     */
    function MapController(underlyingMap) {
        const mapViewModel = this;
        mapViewModel.leafletMap = underlyingMap;

        // Observables for map state
        mapViewModel._currentZoomLevel = ko.observable(mapViewModel.leafletMap.getZoom());
        mapViewModel._mapCenterCoordinates = {
            latitude: ko.observable(mapViewModel.leafletMap.getCenter().lat),
            longitude: ko.observable(mapViewModel.leafletMap.getCenter().lng)
        };
        mapViewModel._mouseCoordinates = {
            latitude: ko.observable(0.00),
            longitude: ko.observable(0.00)
        };

        // Event listeners for Leaflet map changes
        mapViewModel.leafletMap.on("zoomend", function(evt) {
            mapViewModel._currentZoomLevel(evt.target.getZoom());
            const currentCenter = evt.target.getCenter();
            mapViewModel._mapCenterCoordinates.latitude(currentCenter.lat);
            mapViewModel._mapCenterCoordinates.longitude(currentCenter.lng);
        });

        mapViewModel.leafletMap.on("moveend", function(evt) {
            const currentCenter = evt.target.getCenter();
            mapViewModel._mapCenterCoordinates.latitude(currentCenter.lat);
            mapViewModel._mapCenterCoordinates.longitude(currentCenter.lng);
        });

        mapViewModel.leafletMap.on("mousemove", function(evt) {
            mapViewModel._mouseCoordinates.latitude(evt.latlng.lat);
            mapViewModel._mouseCoordinates.longitude(evt.latlng.lng);
        });

        // Computed observable for interactive zoom control
        mapViewModel.interactiveZoom = ko.computed({
            read: function() {
                return mapViewModel._currentZoomLevel();
            },
            write: function(newZoomValue) {
                const numericZoom = parseInt(newZoomValue, 10);
                if (!isNaN(numericZoom) && numericZoom >= 0 && numericZoom <= 20) { // Basic validation
                    mapViewModel.leafletMap.setZoom(numericZoom);
                    mapViewModel._currentZoomLevel(numericZoom); // Update observable after setting
                } else {
                    console.warn(`Invalid zoom level provided: ${newZoomValue}`);
                }
            },
            owner: mapViewModel
        });

        // Computed observable for interactive center control
        mapViewModel.mapCenter = ko.computed({
            read: function() {
                return {
                    lat: mapViewModel._mapCenterCoordinates.latitude(),
                    lng: mapViewModel._mapCenterCoordinates.longitude()
                };
            },
            write: function(newCenterValue) {
                if (newCenterValue && (newCenterValue.lat !== undefined && newCenterValue.lng !== undefined)) {
                    mapViewModel.leafletMap.setView(L.latLng(newCenterValue.lat, newCenterValue.lng), mapViewModel.leafletMap.getZoom());
                } else if (Array.isArray(newCenterValue) && newCenterValue.length === 2) {
                    mapViewModel.leafletMap.setView(L.latLng(newCenterValue[0], newCenterValue[1]), mapViewModel.leafletMap.getZoom());
                } else {
                    console.warn("Invalid center value provided. Expected {lat, lng} or [lat, lng].");
                }
            },
            owner: mapViewModel
        });

        // Computed observable for displaying mouse position
        mapViewModel.currentMousePosition = ko.computed({
            read: function() {
                return {
                    lat: mapViewModel._mouseCoordinates.latitude(),
                    lng: mapViewModel._mouseCoordinates.longitude()
                };
            },
            owner: mapViewModel
        });
    }

    /**
     * Tile layer component plugin for jQuery.
     * Handles creation and destruction of various Leaflet tile layer types.
     * @param {string|object} requestMethod - The name of the method to call, or an options object for initialization.
     * @returns {jQuery} - The jQuery object for chaining, or method-specific return values.
     */
    jQueryFacade.fn.geoTileComponent = function(requestMethod) {
        if (!this.length || !this[0]) {
            console.warn("Attempted to call geoTileComponent on an empty or invalid jQuery selection.");
            return this;
        }

        const tileLayerInstance = this[0].activeGeoTileLayer;

        if (tileLayerInstance && typeof tileLayerInstance[requestMethod] === 'function') {
            return tileLayerInstance[requestMethod].apply(tileLayerInstance, extractMethodArguments(arguments));
        } else if (tileLayerComponentHandlers[requestMethod]) {
            return tileLayerComponentHandlers[requestMethod].apply(this, extractMethodArguments(arguments, 0));
        } else if (typeof requestMethod === 'object' || !requestMethod) {
            return tileLayerComponentHandlers.initialize.apply(this, arguments);
        } else {
            jQueryFacade.error(`Method '${requestMethod}' does not exist on geoTileComponent plugin.`);
            return this;
        }
    };

    /**
     * Contains the internal methods for the geoTileComponent plugin.
     * @private
     */
    const tileLayerComponentHandlers = {
        /**
         * Destroys the tile layer instance associated with the selected elements.
         * @returns {jQuery} - The jQuery object for chaining.
         */
        destroy: function() {
            return this.each(function() {
                const targetTileElement = jQueryFacade(this);
                const tileComponentData = targetTileElement.data("geoTileComponentInstance");

                if (!tileComponentData) {
                    return;
                }

                // Remove the layer from its map if it's currently added
                if (this.activeGeoTileLayer && this.activeGeoTileLayer._map) {
                    this.activeGeoTileLayer.remove();
                }
                delete this.activeGeoTileLayer;

                targetTileElement.off(".geoTileComponent");
                targetTileElement.removeData("geoTileComponentInstance");
                targetTileElement.removeClass("geo-tile-component-active");

                console.info(`Tile component on #${targetTileElement.attr('id')} destroyed.`);
            });
        },

        /**
         * Initializes the geoTileComponent plugin for the selected elements.
         * Creates a Leaflet tile layer based on configuration.
         * @param {object} [initialTileConfig={}] - Configuration options for the tile layer.
         * @returns {jQuery} - The jQuery object for chaining.
         */
        initialize: function(initialTileConfig = {}) {
            const processedTileConfig = jQueryFacade.extend(
                {},
                jQueryFacade.fn.geoTileComponent.defaults,
                initialTileConfig
            );

            return this.each(function() {
                const currentTileElement = jQueryFacade(this);
                // Check if already initialized
                if (currentTileElement.hasClass("geo-tile-component-active")) {
                    return;
                }

                const tileLayerIdentifier = currentTileElement.attr("id");
                currentTileElement.addClass("geo-tile-component-active");

                const componentData = {
                    config: processedTileConfig,
                    layerId: tileLayerIdentifier
                };
                currentTileElement.data("geoTileComponentInstance", componentData);

                let leafletTileLayer;
                const layerSourceUrl = processedTileConfig.sourceUrl;
                const layerKind = processedTileConfig.layerKind;

                if (typeof L === 'undefined') {
                    console.error("Leaflet library (L) is not loaded. Cannot create tile layer.");
                    return;
                }

                switch (layerKind.toLowerCase()) {
                    case "arcgis":
                        leafletTileLayer = L.tileLayer(`${layerSourceUrl}/tile/{z}/{y}/{x}`);
                        break;
                    case "tms":
                        leafletTileLayer = L.tileLayer(layerSourceUrl);
                        break;
                    case "wms":
                        const wmsOptions = {
                            layers: processedTileConfig.wmsLayerNames || '*',
                            format: processedTileConfig.wmsImageFormat || 'image/png',
                            transparent: processedTileConfig.wmsTransparency || true,
                            version: processedTileConfig.wmsVersion || '1.1.1' // Added version option
                        };
                        leafletTileLayer = L.tileLayer.wms(layerSourceUrl, wmsOptions);
                        break;
                    case "xyz": // Added support for generic XYZ tiles
                        leafletTileLayer = L.tileLayer(layerSourceUrl, { attribution: processedTileConfig.attributionText || '' });
                        break;
                    default:
                        // Assume it's a provider name if not one of the specific types
                        if (typeof L.tileLayer.provider === 'function') {
                            leafletTileLayer = L.tileLayer.provider(layerKind);
                        } else {
                            console.error(`Unknown tile layer type: '${layerKind}'. L.tileLayer.provider not found or type not supported.`);
                            leafletTileLayer = null; // Ensure layer is null on failure
                        }
                        break;
                }

                if (leafletTileLayer) {
                    this.activeGeoTileLayer = leafletTileLayer; // Attach the Leaflet layer directly to the DOM element
                    console.info(`Tile component #${tileLayerIdentifier} initialized as ${layerKind}.`);
                } else {
                    console.error(`Failed to create Leaflet layer for tile component #${tileLayerIdentifier}.`);
                    currentTileElement.removeClass("geo-tile-component-active"); // Mark as not active on failure
                }
            });
        }
    };

    /**
     * Default configuration options for the geoTileComponent plugin.
     * @property {string} defaultAction - The default method to invoke.
     * @property {string} layerKind - The type of tile layer (e.g., "Esri.WorldGrayCanvas", "ArcGIS", "WMS").
     * @property {string} sourceUrl - The URL template or endpoint for the tile layer.
     * @property {string} attributionText - Attribution text for the layer.
     * @property {string} wmsLayerNames - For WMS layers, the comma-separated list of layers.
     * @property {string} wmsImageFormat - For WMS layers, the image format (e.g., 'image/png').
     * @property {boolean} wmsTransparency - For WMS layers, whether the layer should be transparent.
     */
    jQueryFacade.fn.geoTileComponent.defaults = {
        defaultAction: "initialize",
        layerKind: "Esri.WorldGrayCanvas",
        sourceUrl: "",
        attributionText: "",
        wmsLayerNames: "",
        wmsImageFormat: "image/png",
        wmsTransparency: true
    };

    /**
     * Feature layer component plugin for jQuery.
     * Handles loading GeoJSON data, applying styling, and managing popups.
     * @param {string|object} operationName - The name of the method to call, or an options object for initialization.
     * @returns {jQuery} - The jQuery object for chaining, or method-specific return values.
     */
    jQueryFacade.fn.geoFeatureComponent = function(operationName) {
        if (!this.length || !this[0]) {
            console.warn("Attempted to call geoFeatureComponent on an empty or invalid jQuery selection.");
            return this;
        }

        const featureLayerInstance = this[0].activeGeoFeatureLayer;

        if (featureLayerInstance && typeof featureLayerInstance[operationName] === 'function') {
            return featureLayerInstance[operationName].apply(featureLayerInstance, extractMethodArguments(arguments));
        } else if (featureLayerComponentHandlers[operationName]) {
            return featureLayerComponentHandlers[operationName].apply(this, extractMethodArguments(arguments, 0));
        } else if (typeof operationName === 'object' || !operationName) {
            return featureLayerComponentHandlers.initialize.apply(this, arguments);
        } else {
            jQueryFacade.error(`Method '${operationName}' does not exist on geoFeatureComponent plugin.`);
            return this;
        }
    };

    /**
     * Utility function to parse a dynamic template.
     * @param {jQuery} templateElement - The jQuery object for the template element.
     * @returns {string|function|null} Parsed template content or function.
     */
    const parseDynamicTemplate = function(templateElement) {
        if (!templateElement || templateElement.length === 0) {
            return null;
        }
        const contentType = templateElement.data("contentType") || "html";
        const templateContent = templateElement.html().trim();

        if (contentType.toLowerCase() === "script") {
            try {
                // Using new Function is safer than eval, but still dynamic code execution
                const func = new Function('properties', `return ${templateContent}\n`);
                return func;
            } catch (scriptErr) {
                console.error("Error parsing script-based template:", scriptErr);
                return null;
            }
        }
        return templateContent; // Return as plain HTML string
    };

    /**
     * Contains the internal methods for the geoFeatureComponent plugin.
     * @private
     */
    const featureLayerComponentHandlers = {
        /**
         * Destroys the feature layer instance associated with the selected elements.
         * @returns {jQuery} - The jQuery object for chaining.
         */
        destroy: function() {
            return this.each(function() {
                const targetFeatureElement = jQueryFacade(this);
                const featureComponentData = targetFeatureElement.data("geoFeatureComponentInstance");

                if (!featureComponentData) {
                    return;
                }

                // Remove the layer from its map if it's currently added
                if (this.activeGeoFeatureLayer && this.activeGeoFeatureLayer._map) {
                    this.activeGeoFeatureLayer.remove();
                }
                delete this.activeGeoFeatureLayer;

                targetFeatureElement.off(".geoFeatureComponent");
                targetFeatureElement.removeData("geoFeatureComponentInstance");
                targetFeatureElement.removeClass("geo-feature-component-active");

                console.info(`Feature component on #${targetFeatureElement.attr('id')} destroyed.`);
            });
        },

        /**
         * Initializes the geoFeatureComponent plugin for the selected elements.
         * Loads GeoJSON data, applies styling, and sets up popups.
         * @param {object} [featureInitOptions={}] - Configuration options for the feature layer.
         * @returns {jQuery} - The jQuery object for chaining.
         */
        initialize: function(featureInitOptions = {}) {
            const resolvedFeatureOptions = jQueryFacade.extend(
                {},
                jQueryFacade.fn.geoFeatureComponent.defaults,
                featureInitOptions
            );

            return this.each(function() {
                const currentFeatureElement = jQueryFacade(this);
                const featureDomNode = this; // Direct DOM element reference
                // Check if already initialized
                if (currentFeatureElement.hasClass("geo-feature-component-active")) {
                    return;
                }

                const featureLayerId = currentFeatureElement.attr("id");
                currentFeatureElement.addClass("geo-feature-component-active");

                const componentData = {
                    config: resolvedFeatureOptions,
                    layerId: featureLayerId
                };
                currentFeatureElement.data("geoFeatureComponentInstance", componentData);

                // Parse Popup Templates
                const popupTemplateElement = jQueryFacade(`[data-geo-layer-type='layerPopup'][data-geo-layer-id='${featureLayerId}']`);
                let popupContentGenerator = null;
                if (popupTemplateElement.length > 0) {
                    popupContentGenerator = parseDynamicTemplate(popupTemplateElement.first());
                    if (popupContentGenerator) {
                        resolvedFeatureOptions.featurePopupContent = popupContentGenerator;
                    }
                }

                // Parse Symbology Configuration
                const styleConfigElement = jQueryFacade(`[data-geo-layer-type='geoStyle'][data-geo-layer-id='${featureLayerId}']`);
                let featureStylingConfiguration = null;
                if (styleConfigElement.length > 0) {
                    try {
                        featureStylingConfiguration = JSON.parse(styleConfigElement.first().html().trim());
                    } catch (styleParseErr) {
                        console.error(`Error parsing symbology object for layer #${featureLayerId}:`, styleParseErr);
                    }
                }

                // Handle different feature layer types
                if (resolvedFeatureOptions.layerKind.toLowerCase() === "geojson") {
                    const geoJsonSourceUrl = resolvedFeatureOptions.sourceUrl;
                    if (!geoJsonSourceUrl) {
                        console.error(`GeoJSON layer #${featureLayerId} requires a 'sourceUrl' in its configuration.`);
                        currentFeatureElement.removeClass("geo-feature-component-active");
                        return;
                    }

                    if (typeof L === 'undefined' || typeof L.geoJson === 'undefined') {
                        console.error("Leaflet GeoJSON functionality is not loaded. Cannot create GeoJSON layer.");
                        currentFeatureElement.removeClass("geo-feature-component-active");
                        return;
                    }

                    const dataLoadPromise = jQueryFacade.Deferred();

                    dataLoadPromise.done(function(geoJsonData) {
                        if (!geoJsonData) {
                            console.error(`No GeoJSON data received for layer #${featureLayerId}.`);
                            return;
                        }

                        let leafletGeoJsonLayer = null;

                        const geoJsonOptions = {
                            pointToLayer: function(feature, latlng) {
                                // Default marker or custom style
                                const style = jQueryFacade.fn.geoFeatureComponent.getFeatureStyle(feature, featureStylingConfiguration);
                                return L.marker(latlng, style.icon ? { icon: style.icon } : {});
                            },
                            style: function(feature) {
                                // Apply style for polygons/lines
                                return jQueryFacade.fn.geoFeatureComponent.getFeatureStyle(feature, featureStylingConfiguration);
                            },
                            onEachFeature: function(feature, layer) {
                                if (resolvedFeatureOptions.featurePopupContent) {
                                    // If a popup content generator function is provided
                                    if (typeof resolvedFeatureOptions.featurePopupContent === 'function') {
                                        const popupHtml = resolvedFeatureOptions.featurePopupContent(feature.properties);
                                        if (popupHtml) {
                                            layer.bindPopup(popupHtml);
                                        }
                                    } else if (typeof resolvedFeatureOptions.featurePopupContent === 'string') {
                                        // If it's a plain HTML string, just bind it
                                        layer.bindPopup(resolvedFeatureOptions.featurePopupContent);
                                    }
                                }
                            }
                        };
                        leafletGeoJsonLayer = L.geoJson(geoJsonData, geoJsonOptions);
                        featureDomNode.activeGeoFeatureLayer = leafletGeoJsonLayer; // Store reference

                        // Add layer to map if target map is specified and initialized
                        const targetMapId = componentData.config.targetMapId;
                        if (targetMapId) {
                            const targetMapElement = jQueryFacade(`#${targetMapId}`)[0];
                            if (targetMapElement && targetMapElement.activeGeoMapInstance) {
                                leafletGeoJsonLayer.addTo(targetMapElement.activeGeoMapInstance);

                                // Attempt to bind UI if Knockout is available
                                if (typeof ko !== 'undefined') {
                                    jQueryFacade(`[data-geo-binding-target='${featureLayerId}']`).each(function() {
                                        if (!featureDomNode.layerViewModel) {
                                            featureDomNode.layerViewModel = new FeatureLayerController(leafletGeoJsonLayer, featureDomNode);
                                        }
                                        try {
                                            ko.applyBindings(featureDomNode.layerViewModel, this);
                                        } catch (bindErr) {
                                            console.error(`Error binding FeatureLayerController to element #${this.id}:`, bindErr);
                                        }
                                    });
                                }
                            } else {
                                console.warn(`Target map #${targetMapId} not found or not initialized for feature layer #${featureLayerId}. Layer not added.`);
                            }
                        }
                    }).fail(function(jqxhr, textStatus, error) {
                        console.error(`Failed to load GeoJSON data from ${geoJsonSourceUrl} for layer #${featureLayerId}:`, textStatus, error);
                        currentFeatureElement.removeClass("geo-feature-component-active");
                    });

                    // Fetch the GeoJSON data
                    jQueryFacade.getJSON(geoJsonSourceUrl, function(data) {
                        dataLoadPromise.resolve(data);
                    }).fail(function(jqxhr, textStatus, error) {
                        dataLoadPromise.reject(jqxhr, textStatus, error);
                    });

                } else {
                    console.warn(`Feature layer type '${resolvedFeatureOptions.layerKind}' is not currently supported for layer #${featureLayerId}.`);
                    currentFeatureElement.removeClass("geo-feature-component-active");
                }
            });
        }
    };

    /**
     * Default configuration options for the geoFeatureComponent plugin.
     * @property {string} defaultAction - The default method to invoke.
     * @property {string} layerKind - The type of feature layer (e.g., "geojson").
     * @property {string} sourceUrl - The URL to fetch feature data from.
     * @property {string} targetMapId - The ID of the map element this layer should be added to.
     * @property {object|function|string} featurePopupContent - Content for feature popups (HTML string, function, or object).
     */
    jQueryFacade.fn.geoFeatureComponent.defaults = {
        defaultAction: "initialize",
        layerKind: "geojson",
        sourceUrl: "",
        targetMapId: "",
        featurePopupContent: null
    };

    /**
     * Helper function to apply styling based on feature properties and a symbology configuration.
     * This function is attached to the plugin for external access if needed.
     * @param {object} feature - The GeoJSON feature object.
     * @param {object} symbologyConfig - The configuration object defining styling rules.
     * @returns {object} Leaflet style object or L.Icon instance.
     */
    jQueryFacade.fn.geoFeatureComponent.getFeatureStyle = function(feature, symbologyConfig) {
        let defaultStyle = {
            color: '#3388ff',
            weight: 3,
            opacity: 1,
            fillColor: '#3388ff',
            fillOpacity: 0.2
        };

        if (!symbologyConfig) {
            return defaultStyle;
        }

        // Apply base style from config
        jQueryFacade.extend(defaultStyle, symbologyConfig.baseStyle || {});

        // Check for property-based rules
        if (symbologyConfig.rules && Array.isArray(symbologyConfig.rules)) {
            for (const rule of symbologyConfig.rules) {
                if (feature.properties && feature.properties[rule.property] !== undefined &&
                    feature.properties[rule.property] == rule.value) { // Use == for flexible comparison
                    return jQueryFacade.extend({}, defaultStyle, rule.style);
                }
            }
        }

        // Check for specific icon definitions
        if (symbologyConfig.icon && feature.geometry.type === 'Point') {
            const iconOptions = jQueryFacade.extend({
                iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
                iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
                shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
                iconSize: [25, 41],
                iconAnchor: [12, 41],
                popupAnchor: [1, -34],
                tooltipAnchor: [16, -28],
                shadowSize: [41, 41]
            }, symbologyConfig.icon);
            return { icon: L.icon(iconOptions) };
        }

        return defaultStyle;
    };

})(jQuery); // Pass jQuery object into the IIFE