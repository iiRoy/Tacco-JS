const SpatialDisplay = {};

// Custom event dispatcher for cleaner separation in FloorSelectorWidget
class LevelChangeEmitter extends EventTarget {
    notifyChange(oldFloor, newFloor) {
        this.dispatchEvent(new CustomEvent('floorChanged', {
            detail: { oldFloor, newFloor }
        }));
    }
}

// --- SpatialLevelManager (Type IV clone of L.Indoor) ---
SpatialDisplay.SpatialLevelManager = class extends L.LayerGroup {
    constructor(initialData, userConfiguration) {
        super(); // Initialize L.LayerGroup

        this._mapReference = null;
        this._featureRegistry = new Map(); // Stores { levels: string[], leafletLayer: L.Layer } keyed by unique feature ID
        this._discoveredFloors = new Set();
        this._activeFloorIdentifier = null;

        this.configuration = {
            levelExtractor: (feature) => feature.properties.level,
            featureProcessor: null, // Equivalent to original onEachFeature
            markerGenerator: null, // Equivalent to original markerForFeature
            ...userConfiguration
        };

        // Process initial data if provided
        if (initialData) {
            this.ingestSpatialData(initialData);
        }
    }

    // Equivalent to L.Indoor.addTo
    placeOnMap(targetMap) {
        targetMap.addLayer(this);
        return this;
    }

    // Leaflet lifecycle hook when layer is added to map (equivalent to L.Indoor.onAdd)
    onAdd(targetMap) {
        this._mapReference = targetMap;

        // If no active floor is set, pick the first discovered one
        if (this._activeFloorIdentifier === null && this._discoveredFloors.size > 0) {
            this._activeFloorIdentifier = Array.from(this._discoveredFloors)[0];
        }

        this._synchronizeDisplayedLayers();
    }

    // Leaflet lifecycle hook when layer is removed from map (equivalent to L.Indoor.onRemove)
    onRemove(targetMap) {
        this.clearLayers(); // Remove all layers from this L.LayerGroup
        this._mapReference = null;
    }

    // Equivalent to L.Indoor.addData
    ingestSpatialData(geojsonData) {
        const inputFeatures = L.Util.isArray(geojsonData) ? geojsonData : geojsonData.features;

        inputFeatures.forEach((geoFeature, idx) => {
            const uniqueFeatureId = geoFeature.id || `feature-auto-${Date.now()}-${idx}`;

            const extractedLevels = this.configuration.levelExtractor(geoFeature);
            let featureLevels = L.Util.isArray(extractedLevels) ? extractedLevels : [extractedLevels];
            featureLevels = featureLevels.filter(lvl => lvl !== undefined && lvl !== null);

            if (featureLevels.length === 0) {
                console.warn("No valid floor level found for feature:", geoFeature);
                return;
            }

            // Add all extracted levels to our set of known floors
            featureLevels.forEach(lvl => this._discoveredFloors.add(lvl));

            let generatedLeafletLayer;

            if (this.configuration.markerGenerator) {
                // If a marker generator function is provided, create a marker
                const markerInstance = this.configuration.markerGenerator(geoFeature);
                if (markerInstance) {
                    markerInstance.on('click', (event) => {
                        // Forward click event if needed
                        // this.fire('featureClick', { originalEvent: event, feature: geoFeature, layer: markerInstance });
                    });
                    generatedLeafletLayer = markerInstance;
                }
            } else {
                // Otherwise, create a single-feature L.geoJson layer
                generatedLeafletLayer = L.geoJson(geoFeature, {
                    ...this.configuration, // Pass general options like style, filter, etc.
                    onEachFeature: undefined // We handle onEachFeature explicitly here
                });
            }

            if (generatedLeafletLayer && this.configuration.featureProcessor) {
                this.configuration.featureProcessor(geoFeature, generatedLeafletLayer);
            }

            if (generatedLeafletLayer) {
                this._featureRegistry.set(uniqueFeatureId, {
                    levels: featureLevels,
                    leafletLayer: generatedLeafletLayer
                });
            }
        });

        // If the manager is already on the map, refresh the display to include new data
        if (this._mapReference) {
            this._synchronizeDisplayedLayers();
        }
    }

    // Internal method to update visible layers based on the active floor
    _synchronizeDisplayedLayers() {
        this.clearLayers(); // Clear all current layers from this L.LayerGroup

        if (this._activeFloorIdentifier === null) {
            return;
        }

        this._featureRegistry.forEach(entry => {
            if (entry.levels.includes(this._activeFloorIdentifier)) {
                this.addLayer(entry.leafletLayer);
            }
        });
    }

    // Equivalent to L.Indoor.getLevels
    getAllAvailableFloors() {
        return Array.from(this._discoveredFloors).sort((a, b) => {
            // Attempt a numeric sort if possible, fallback to string sort
            const numA = parseFloat(a);
            const numB = parseFloat(b);
            if (!isNaN(numA) && !isNaN(numB)) {
                return numA - numB;
            }
            return String(a).localeCompare(String(b));
        });
    }

    // Equivalent to L.Indoor.getLevel
    getCurrentFloorIdentifier() {
        return this._activeFloorIdentifier;
    }

    // Equivalent to L.Indoor.setLevel
    setActiveFloor(newFloorIdentifier) {
        // Handle potential object input from event, similar to original
        if (typeof newFloorIdentifier === 'object' && 'newLevel' in newFloorIdentifier) {
            newFloorIdentifier = newFloorIdentifier.newLevel;
        }

        if (this._activeFloorIdentifier === newFloorIdentifier) {
            return;
        }

        this._activeFloorIdentifier = newFloorIdentifier;

        if (this._mapReference) {
            this._synchronizeDisplayedLayers();
        }
    }

    // Equivalent to L.Indoor.resetStyle
    clearFeatureStyling(targetLayer) {
        if (targetLayer.options && targetLayer.defaultOptions) {
            targetLayer.options = { ...targetLayer.defaultOptions }; // Create new options object
        }
        this.applyFeatureStyling(targetLayer, this.configuration.style); // Re-apply default style from config
    }

    // Equivalent to L.Indoor._setLayerStyle
    applyFeatureStyling(targetLayer, styleDefinition) {
        let finalStyle = styleDefinition;
        if (typeof styleDefinition === 'function' && targetLayer.feature) {
            finalStyle = styleDefinition(targetLayer.feature);
        }
        if (targetLayer.setStyle) {
            targetLayer.setStyle(finalStyle);
        }
    }
};

// Factory function for SpatialLevelManager (equivalent to L.indoor)
SpatialDisplay.createSpatialManager = function(data, options) {
    return new SpatialDisplay.SpatialLevelManager(data, options);
};


// --- FloorSelectorWidget (Type IV clone of L.Control.Level) ---
SpatialDisplay.FloorSelectorWidget = class extends L.Control {
    constructor(widgetConfiguration) {
        super({ position: 'bottomright', ...widgetConfiguration });

        this._leafletMap = null;
        this._floorButtonElements = new Map(); // Map<string, HTMLElement> to store button references
        this._currentActiveFloorLabel = widgetConfiguration.level; // Initial active floor label
        this._floorValueParser = widgetConfiguration.floorValueParser || ((label) => parseInt(label, 10));
        this._availableFloorLabels = widgetConfiguration.floorLabels || [];

        // Use a standard EventTarget for custom events, instead of L.Mixin.Events
        this._floorChangeEmitter = new LevelChangeEmitter();
        this._floorChangeEmitter.addEventListener('floorChanged', this._updateButtonVisuals.bind(this));
    }

    // Leaflet lifecycle hook for control rendering (equivalent to L.Control.Level.onAdd)
    onAdd(mapInstance) {
        this._leafletMap = mapInstance;
        const containerElement = L.DomUtil.create('div', 'leaflet-bar leaflet-control');
        containerElement.style.font = "18px 'Lucida Console',Monaco,monospace"; // Preserve original style

        const sortedFloorInfo = this._availableFloorLabels
            .map(label => ({
                label: label,
                numericValue: this._floorValueParser(label)
            }))
            .sort((a, b) => a.numericValue - b.numericValue);

        // Render buttons in reverse order as per original
        for (let i = sortedFloorInfo.length - 1; i >= 0; i--) {
            const floorData = sortedFloorInfo[i];
            const buttonElement = L.DomUtil.create('a', 'leaflet-button-part', containerElement);
            buttonElement.textContent = floorData.label;
            buttonElement.href = '#'; // Make it clickable without navigation

            L.DomEvent.disableClickPropagation(buttonElement); // Prevent map clicks
            L.DomEvent.on(buttonElement, 'click', L.DomEvent.preventDefault); // Prevent default link behavior
            L.DomEvent.on(buttonElement, 'click', () => this.selectFloor(floorData.label));

            this._floorButtonElements.set(floorData.label, buttonElement);
        }

        // Apply initial active state styling
        this._applyButtonHighlight(this._currentActiveFloorLabel);

        return containerElement;
    }

    // Leaflet lifecycle hook for control removal (equivalent to L.Control.Level.onRemove)
    onRemove(mapInstance) {
        this._leafletMap = null;
        this._floorButtonElements.clear();
    }

    // Internal handler for floor change events to update button visuals (equivalent to L.Control.Level._levelChange)
    _updateButtonVisuals(event) {
        const { oldFloor, newFloor } = event.detail;

        if (oldFloor && this._floorButtonElements.has(oldFloor)) {
            this._floorButtonElements.get(oldFloor).style.backgroundColor = "#FFFFFF";
        }
        if (newFloor && this._floorButtonElements.has(newFloor)) {
            this._floorButtonElements.get(newFloor).style.backgroundColor = "#b0b0b0";
        }
    }

    // Helper to apply or remove highlight style based on the active floor label
    _applyButtonHighlight(floorLabelToHighlight) {
        this._floorButtonElements.forEach((btn, label) => {
            btn.style.backgroundColor = (label === floorLabelToHighlight) ? "#b0b0b0" : "#FFFFFF";
        });
    }

    // Equivalent to L.Control.Level.setLevel
    selectFloor(newFloorLabel) {
        if (newFloorLabel === this._currentActiveFloorLabel) {
            return;
        }

        const oldFloorLabel = this._currentActiveFloorLabel;
        this._currentActiveFloorLabel = newFloorLabel;

        // Emit a custom event for external listeners
        this._floorChangeEmitter.notifyChange(oldFloorLabel, newFloorLabel);
    }

    // Equivalent to L.Control.Level.getLevel
    retrieveSelectedFloor() {
        return this._currentActiveFloorLabel;
    }

    // Expose the event emitter for external components (e.g., SpatialLevelManager) to listen
    get floorChangeEvents() {
        return this._floorChangeEmitter;
    }
};

// Factory function for FloorSelectorWidget (equivalent to L.Control.level)
SpatialDisplay.createFloorSelector = function(options) {
    return new SpatialDisplay.FloorSelectorWidget(options);
};