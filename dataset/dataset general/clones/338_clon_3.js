/* eslint-disable no-unused-vars */
/* This module provides core functionality for the interactive map viewer.
   It handles map initialization, data fetching, context rendering, and feature interaction. */

// Define a global application namespace, replacing 'osmly'
var geoApp = geoApp || {};

/**
 * Initializes and configures the main geographical viewer component.
 * This function sets up the Leaflet map instance with various layers,
 * event handlers, and data interaction capabilities.
 * @returns {L.Map} The configured Leaflet map instance.
 */
geoApp.createViewer = function() {
    // Ensure essential application settings are available before proceeding.
    if (!geoApp.config || !geoApp.config.viewSettings || !geoApp.config.apiAccess) {
        console.error("Critical geoApp configuration is missing. Cannot initialize viewer.");
        // Return a dummy object or throw an error to prevent further issues.
        return {
            on: function() {},
            addLayer: function() {},
            removeLayer: function() {},
            hasLayer: function() {},
            fitBounds: function() {},
            getCenter: function() { return { lat: 0, lng: 0 }; },
            getZoom: function() { return 0; }
        };
    }

    // A unique key for the Bing Maps layer, potentially obfuscated or retrieved from a secure source.
    const bingKeyMaterial = 'Arzdiw4nlOJzRwOz__qailc8NiR31Tt51dN2D7cm57NrnceZnCpgOkmJhNpGoppU';

    // Set up the primary map display object.
    // We're using 'mainDisplayArea' as the DOM element ID.
    const mainViewer = L.map('mainDisplayArea', {
        // Initial geographical coordinates for the map's center.
        initialCoordinates: geoApp.config.viewSettings.initialOrigin,
        // Array of base layers to be displayed initially.
        baseLayers: [
            new L.BingLayer(bingKeyMaterial)
        ],
        // Default zoom level at startup.
        startingZoom: geoApp.config.viewSettings.initialZoom,
        // The highest zoom level allowed for the map.
        maximumZoomLevel: 19,
        // Disable smooth animation transitions for layer changes to improve performance on some devices.
        disableFadeEffect: true
    });

    // Configure the default path for Leaflet icon images.
    // This ensures custom markers and icons are loaded correctly.
    L.Icon.Default.imagePath = 'assets/leaflet-icons/';

    // Attach an event listener for when the map finishes moving.
    // This updates a global link reflecting the current map state.
    mainViewer.on('moveend', function() {
        const currentView = mainViewer.getCenter().wrap(); // Get center coordinates, wrapped around the date line.
        const currentZoom = mainViewer.getZoom(); // Get the current zoom level.

        // Format latitude and longitude to a fixed precision string.
        const formattedLatitude = (Math.round(currentView.lat * 10000) / 10000).toString();
        const formattedLongitude = (Math.round(currentView.lng * 10000) / 10000).toString();
        const formattedZoom = currentZoom.toString();

        // Construct a URL for OpenStreetMap based on the current map view.
        geoApp.shareLink = `https://www.openstreetmap.org/#map=${formattedZoom}/${formattedLatitude}/${formattedLongitude}`;
        // Optionally, notify the UI or log the new link.
        geoApp.interface.logMessage(`Updated share link: ${geoApp.shareLink}`);
    });

    // Manage the map's attribution control (credits/licensing display).
    mainViewer.creditsDisplay.setPrefix(false); // Disable default Leaflet prefix.

    // Check if the application is running in a development environment by inspecting the API endpoint.
    const isDevelopmentServer = geoApp.config.apiAccess.writeEndpoint.includes('dev');
    if (isDevelopmentServer) {
        mainViewer.creditsDisplay.setPrefix('DEVELOPMENT SERVER ACTIVE'); // Add a custom prefix for dev.
    }

    // Define a standard OpenStreetMap tile layer for general viewing.
    mainViewer.osmBaseTiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maximumZoom: 19, // Max zoom level for this tile layer.
        nativeMaxZoom: 18 // Max zoom level available from the tile provider.
    });

    /**
     * Fetches, processes, and displays contextual OpenStreetMap data within a given bounding box.
     * This method handles the lifecycle of context layer management.
     * @param {number[]} boundingArea - An array [minX, minY, maxX, maxY] defining the area of interest.
     * @param {number} [expansionMargin=0] - An optional buffer to expand the bounding area.
     * @param {Function} onCompleteRender - Callback function to execute after context data is rendered.
     */
    mainViewer.fetchAndDisplayContext = function(boundingArea, expansionMargin = 0, onCompleteRender) {
        // Validate input bounding area.
        if (!boundingArea || boundingArea.length !== 4 || !Array.isArray(boundingArea)) {
            console.warn("Invalid bounding area provided for context fetch.");
            return;
        }

        let effectiveBounds = [...boundingArea]; // Create a copy to modify.

        // Apply an expansion margin if provided and valid.
        if (typeof expansionMargin === 'number' && expansionMargin > 0) {
            effectiveBounds = [
                effectiveBounds[0] - expansionMargin,
                effectiveBounds[1] - expansionMargin,
                effectiveBounds[2] + expansionMargin,
                effectiveBounds[3] + expansionMargin
            ];
            geoApp.interface.logMessage(`Context bounds expanded by ${expansionMargin}.`);
        }

        // Remove any previously displayed context layer to avoid overlaps.
        if (mainViewer.isLayerPresent(mainViewer.activeContextOverlay)) {
            mainViewer.removeLayer(mainViewer.activeContextOverlay);
            geoApp.interface.logMessage("Removed previous context overlay.");
        }

        geoApp.interface.displayNotification('Retrieving nearby geographic data...');
        
        // Asynchronously fetch OSM XML data for the calculated bounds.
        retrieveRemoteOsmData(effectiveBounds, function(osmXmlContent) {
            if (!osmXmlContent) {
                geoApp.interface.displayNotification('Failed to retrieve OSM data.', 'error');
                onCompleteRender(); // Still call callback even on failure.
                return;
            }

            geoApp.interface.displayNotification('Processing and rendering geographic features...');
            
            // Convert the raw OSM XML into GeoJSON format.
            const rawGeoJson = geoConverter.xmlToGeoJson(osmXmlContent, true);
            // Filter the GeoJSON features based on application-specific criteria.
            const filteredContext = processAndFilterGeoData(rawGeoJson);
            
            // Render the filtered GeoJSON data as a Leaflet layer.
            renderContextOverlay(filteredContext);
            mainViewer.addVisualLayer(mainViewer.activeContextOverlay); // Add the new layer to the map.
            
            onCompleteRender(); // Execute the completion callback.
            geoApp.interface.displayNotification('Context data loaded and rendered.');
        });
    };

    /**
     * Toggles the visibility of a given Leaflet layer on the map.
     * If the layer is currently visible, it's removed; otherwise, it's added.
     * @param {L.Layer} targetOverlay - The Leaflet layer to toggle.
     */
    mainViewer.switchLayerVisibility = function(targetOverlay) {
        if (!targetOverlay) {
            console.warn("Attempted to toggle a null or undefined layer.");
            return;
        }
        mainViewer.isLayerPresent(targetOverlay) ?
            mainViewer.removeLayer(targetOverlay) :
            mainViewer.addVisualLayer(targetOverlay);
        geoApp.interface.logMessage(`Layer visibility toggled for: ${targetOverlay.name || 'Unnamed Layer'}`);
    };

    /**
     * Fetches OpenStreetMap XML data from the configured read API endpoint.
     * @param {number[]} areaBounds - The bounding box [minX, minY, maxX, maxY] for the data request.
     * @param {Function} dataReadyCallback - Callback function to execute on successful data retrieval,
     *                                       receiving the XML content.
     */
    function retrieveRemoteOsmData(areaBounds, dataReadyCallback) {
        if (!areaBounds || areaBounds.length !== 4) {
            console.error("Invalid bounds provided for OSM data retrieval.");
            dataReadyCallback(null);
            return;
        }

        // Construct the URL for the AJAX request.
        const requestUrl = `${geoApp.config.apiAccess.readEndpoint}bbox=${areaBounds.join(',')}`;

        // Use jQuery's AJAX functionality to fetch the XML.
        jQuery.ajax({
            url: requestUrl,
            dataType: 'xml', // Expecting XML data.
            success: function(osmXmlDocument) {
                // Store the fetched XML for potential later use.
                mainViewer.lastFetchedOsmXml = osmXmlDocument;
                dataReadyCallback(osmXmlDocument);
                geoApp.interface.logMessage("Successfully retrieved OSM XML data.");
            },
            error: function(jqXHR, textStatus, errorThrown) {
                console.error(`Error fetching OSM data: ${textStatus}, ${errorThrown}`);
                geoApp.interface.displayNotification('Error fetching OSM data. Check console.', 'error');
                dataReadyCallback(null); // Indicate failure to the callback.
            },
            timeout: 15000 // Set a timeout for the request (15 seconds).
        });
    }

    /**
     * Filters a GeoJSON FeatureCollection based on predefined criteria in geoApp.config.featureFilters.
     * Features are kept if any of their properties match a filter rule, or if no filters are defined.
     * @param {object} inputGeoJsonData - The raw GeoJSON FeatureCollection to filter.
     * @returns {object} A new GeoJSON FeatureCollection containing only the filtered features.
     */
    function processAndFilterGeoData(inputGeoJsonData) {
        const filteredFeatureCollection = {
            type: 'FeatureCollection',
            geographicElements: [] // Renamed from 'features'
        };

        if (!inputGeoJsonData || !Array.isArray(inputGeoJsonData.features)) {
            console.warn("Input GeoJSON data is invalid or lacks features array.");
            return filteredFeatureCollection;
        }

        const activeFilters = geoApp.config.featureFilters;
        const hasActiveFilters = Object.keys(activeFilters).length > 0;

        // Iterate over each feature in the input GeoJSON.
        inputGeoJsonData.features.forEach(currentElement => {
            let isRelevant = false; // Flag to determine if the feature should be kept.

            if (!currentElement.properties) {
                // Skip features without properties.
                return;
            }

            // If no filters are defined, all features are considered relevant.
            if (!hasActiveFilters) {
                isRelevant = true;
            } else {
                // Check if any of the feature's properties match a filter.
                for (const propKey in currentElement.properties) {
                    if (currentElement.properties.hasOwnProperty(propKey) &&
                        activeFilters.hasOwnProperty(propKey) &&
                        activeFilters[propKey].includes(currentElement.properties[propKey])) {
                        isRelevant = true;
                        break; // Found a match, no need to check further properties for this feature.
                    }
                }
            }

            // If the feature is deemed relevant, add it to the filtered collection.
            if (isRelevant) {
                filteredFeatureCollection.geographicElements.push(currentElement);
            }
        });

        geoApp.interface.logMessage(`Filtered ${inputGeoJsonData.features.length} features down to ${filteredFeatureCollection.geographicElements.length}.`);
        return filteredFeatureCollection;
    }

    /**
     * Renders a GeoJSON FeatureCollection as a Leaflet GeoJSON layer on the map.
     * This function applies styling, creates popups, and sets labels for each feature.
     * @param {object} contextGeoJson - The GeoJSON data to be rendered.
     */
    function renderContextOverlay(contextGeoJson) {
        let featureIdentifierCounter = 0; // Unique ID for each feature in this layer.

        mainViewer.activeContextOverlay = L.geoJson(contextGeoJson, {
            displayStyling: geoApp.config.viewSettings.contextStyle, // Custom styling for context features.
            onEachFeature: function(currentFeature, leafletLayer) {
                // Process each individual GeoJSON feature as it's added to the layer.
                if (!currentFeature.properties || Object.keys(currentFeature.properties).length === 0) {
                    console.warn("Feature without properties encountered, skipping popup/label setup.");
                    return;
                }

                let popupHtmlContent = [];
                let displayLabel = 'Unnamed Element'; // Default label if no name property exists.

                // Set the display label based on the 'name' property, if available.
                if (currentFeature.properties.name) {
                    displayLabel = currentFeature.properties.name;
                }

                const propertyKeys = Object.keys(currentFeature.properties);

                // Build the popup content by iterating through feature properties.
                propertyKeys.forEach(propertyKey => {
                    // Exclude properties starting with 'osm_' from the popup display.
                    if (!propertyKey.startsWith('osm_')) {
                        popupHtmlContent.push(`<li><span class="key-tag">${propertyKey}</span>: ${currentFeature.properties[propertyKey]}</li>`);
                    }
                });

                // Add a "Merge" button to the popup for Point features during 'import' mode.
                if (currentFeature.geometry.type === 'Point' && geoApp.mode.currentMode === 'import') {
                    const mergeButton = `<li class="merge-action-item"
                        data-element-ref="${featureIdentifierCounter}"
                        data-properties-json='${JSON.stringify(currentFeature.properties)}'
                        style="
                        margin-top: 12px;
                        text-align: center;
                        padding: 10px 0;
                        border: 1px solid #aaa;
                        background-color: #eee;
                        cursor: pointer;
                        font-weight: bold;
                        ">Merge with import data</li>`;
                    popupHtmlContent.push(mergeButton);
                }

                // Assign a unique internal ID to the feature's properties.
                currentFeature.properties.uniqueId = featureIdentifierCounter;

                // Bind the generated popup content to the Leaflet layer.
                leafletLayer.bindPopup(`<ul>${popupHtmlContent.join('')}</ul>`);
                // Bind a tooltip/label to the layer.
                leafletLayer.bindTooltip(displayLabel);

                featureIdentifierCounter++; // Increment for the next feature.
            },
            pointToLayer: function(pointFeature, coordinates) {
                // Custom renderer for point features, displaying them as styled circles.
                return L.circleMarker(coordinates, {
                    markerRadius: 6,
                    borderOpacity: 1, // Full opacity for the circle border.
                    fillTransparency: 0.33 // Semi-transparent fill.
                });
            }
        });
        geoApp.interface.logMessage(`Context overlay rendered with ${contextGeoJson.geographicElements.length} features.`);
    }

    /**
     * Displays a specific GeoJSON feature on the map, optionally enabling editing.
     * The map view will adjust to fit the bounds of the feature.
     * @param {object} targetGeoJson - The GeoJSON object representing the feature to display.
     * @param {boolean} enableEditing - If true, enables editing capabilities for the feature.
     * @param {boolean} displayImmediately - If true, adds the feature layer to the map immediately.
     */
    mainViewer.highlightAndEditElement = function(targetGeoJson, enableEditing, displayImmediately) {
        if (!targetGeoJson || !targetGeoJson.geometry) {
            console.error("Invalid GeoJSON provided for feature display/editing.");
            return;
        }

        // Create a new GeoJSON layer for the target feature.
        mainViewer.highlightedElementLayer = L.geoJson(targetGeoJson, {
            visualStyle: geoApp.config.viewSettings.featureStyle, // Custom styling for the highlighted feature.
            configureFeatureInteraction: function(currentRenderedFeature, featureLeafletLayer) {
                // Configure editing capabilities based on the 'enableEditing' flag.
                if (enableEditing) {
                    if (targetGeoJson.geometry.type === 'MultiPolygon') {
                        // For MultiPolygon, enable editing on each sub-layer.
                        Object.values(featureLeafletLayer._layers).forEach(subLayer => {
                            if (subLayer.editing) subLayer.editing.enable();
                        });
                    } else if (targetGeoJson.geometry.type === 'Point') {
                        // For Point features, make them draggable.
                        featureLeafletLayer.options.isDraggable = true;
                    } else if (featureLeafletLayer.editing) {
                        // For other editable types (Polygon, LineString), enable editing directly.
                        featureLeafletLayer.editing.enable();
                    }
                    geoApp.interface.logMessage(`Editing enabled for feature type: ${targetGeoJson.geometry.type}`);
                }
            }
        });

        // Adjust the map viewport to encompass the entire highlighted feature.
        const featureBounds = mainViewer.highlightedElementLayer.getBounds();
        if (featureBounds.isValid()) {
            mainViewer.adjustViewportToBounds(featureBounds);
        } else {
            console.warn("Could not get valid bounds for the feature, map view not adjusted.");
        }


        // Add the layer to the map and bring it to the front if 'displayImmediately' is true.
        if (displayImmediately) {
            mainViewer.highlightedElementLayer.addTo(mainViewer); // Note: using mainViewer itself as the target.
            mainViewer.highlightedElementLayer.bringToForeground();
            geoApp.interface.logMessage("Highlighted feature layer added and brought to foreground.");
        }
    };

    // Return the fully configured map instance.
    return mainViewer;
};

// Placeholder for global app configuration (simulating osmly.settings)
geoApp.config = {
    viewSettings: {
        initialOrigin: [51.505, -0.09], // Default center
        initialZoom: 13,
        contextStyle: {
            color: '#ff7800',
            weight: 3,
            opacity: 0.65,
            fillColor: '#ff7800',
            fillOpacity: 0.2
        },
        featureStyle: {
            color: '#0000FF',
            weight: 5,
            opacity: 0.9,
            fillColor: '#0000FF',
            fillOpacity: 0.4
        }
    },
    apiAccess: {
        readEndpoint: 'https://api.openstreetmap.org/api/0.6/map?',
        writeEndpoint: 'https://api.openstreetmap.org/api/0.6/changeset/create'
    },
    featureFilters: {
        'highway': ['residential', 'unclassified', 'service'],
        'building': ['yes', 'house']
    }
};

// Placeholder for global app UI utilities (simulating osmly.ui)
geoApp.interface = {
    displayNotification: function(message, type = 'info') {
        console.log(`[UI Notification - ${type.toUpperCase()}]: ${message}`);
        // In a real app, this would update a UI element.
    },
    logMessage: function(message) {
        // console.debug(`[APP LOG]: ${message}`);
    }
};

// Placeholder for global app mode (simulating osmly.mode)
geoApp.mode = {
    currentMode: 'view' // Can be 'view', 'import', 'edit'
};

// Placeholder for geo data conversion utility (simulating osm_geojson)
var geoConverter = {
    xmlToGeoJson: function(xmlDoc, includeMetadata) {
        // Dummy implementation for conversion
        // In a real scenario, this would parse OSM XML and convert to GeoJSON.
        console.log("Converting XML to GeoJSON (dummy). Include metadata:", includeMetadata);
        return {
            type: 'FeatureCollection',
            features: [
                {
                    type: 'Feature',
                    geometry: { type: 'Point', coordinates: [-0.09, 51.505] },
                    properties: { name: 'Dummy Point', highway: 'residential', osm_id: '123' }
                },
                {
                    type: 'Feature',
                    geometry: { type: 'Polygon', coordinates: [[[-0.1, 51.5], [-0.1, 51.51], [-0.08, 51.51], [-0.08, 51.5], [-0.1, 51.5]]] },
                    properties: { name: 'Dummy Building', building: 'yes', osm_id: '456' }
                }
            ]
        };
    }
};

// Extend Leaflet to add custom methods or properties if needed.
// For example, to make `isLayerPresent` and `addVisualLayer` available on L.Map instances.
if (typeof L !== 'undefined') {
    L.Map.include({
        isLayerPresent: function(layer) {
            return this.hasLayer(layer);
        },
        addVisualLayer: function(layer) {
            return this.addLayer(layer);
        },
        adjustViewportToBounds: function(bounds) {
            return this.fitBounds(bounds);
        },
        // Renaming default attributionControl
        get creditsDisplay() {
            return this.attributionControl;
        }
    });

    // Dummy L.BingLayer constructor for demonstration if Leaflet-Bing is not loaded.
    if (!L.BingLayer) {
        L.BingLayer = L.TileLayer.extend({
            initialize: function(key, options) {
                console.warn("L.BingLayer is a dummy implementation. Please include Leaflet-Bing plugin for full functionality.");
                L.TileLayer.prototype.initialize.call(this, 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', options); // Fallback to OSM
            }
        });
    }
}
/* eslint-enable no-unused-vars */