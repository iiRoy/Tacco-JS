/**
 * A specialized Leaflet layer designed to visualize multi-floor building data.
 *
 * The 'importFeatureData' method accepts a GeoJSON FeatureCollection. Each individual feature
 * within this collection is expected to possess a specific property indicating its floor.
 *
 * The 'getPresentFloorIDs' method provides an array of all unique floor identifiers
 * currently represented within the layer's data.
 */
L.BuildingFloor = L.Class.extend({

    configuration: {
        // By default, the floor ID is retrieved from the 'level' attribute within
        // the feature's properties. A custom function can be supplied in the
        // options if this structure does not match the data source.
        floorIdExtractor: function(featureEntry) {
            return featureEntry.properties.level;
        }
    },

    _initStructure: function(initialData, userConfiguration) {
        L.setOptions(this, userConfiguration);
        this.configuration = { ...this.configuration, ...this.options }; // Merge default with user-provided

        const floorContainers = new Map(); // Using Map for better key management
        this._floorContainers = floorContainers;
        this._associatedMap = null; // Reference to the Leaflet map instance

        // Determine the initial active floor from user settings or default to null
        this._currentActiveFloorId = Object.prototype.hasOwnProperty.call(this.configuration, 'activeFloor')
            ? this.configuration.activeFloor
            : null;

        let originalFeatureHandler;
        if (Object.prototype.hasOwnProperty.call(this.configuration, 'onEachFeature')) {
            originalFeatureHandler = this.configuration.onEachFeature;
        }

        // Overwrite the default onEachFeature to manage markers and floor assignments
        this.options.onEachFeature = (individualFeature, featureLayer) => {
            // Execute any custom handler provided by the user
            if (originalFeatureHandler) {
                originalFeatureHandler(individualFeature, featureLayer);
            }

            // Handle marker creation and assignment to correct floor containers
            if (Object.prototype.hasOwnProperty.call(this.configuration, 'markerForFeature')) {
                const customMarker = this.configuration.markerForFeature(individualFeature);
                if (customMarker !== undefined && customMarker !== null) {
                    // Attach click event to marker to propagate to its underlying layer
                    customMarker.on('click', (eventData) => {
                        featureLayer.fire('click', eventData);
                    });

                    const extractedFloor = this.configuration.floorIdExtractor(individualFeature);

                    if (extractedFloor === undefined || extractedFloor === null) {
                        // Silently ignore features without a valid floor ID for marker placement
                        return;
                    }

                    const assignToFloorContainer = (floorKey) => {
                        let targetLayerGroup = floorContainers.get(floorKey);
                        if (!targetLayerGroup) {
                            // If container doesn't exist, create a new GeoJSON layer group for this floor
                            targetLayerGroup = L.geoJson({
                                type: "FeatureCollection",
                                features: []
                            }, this.options); // Pass along original options for styling etc.
                            floorContainers.set(floorKey, targetLayerGroup);
                        }
                        targetLayerGroup.addLayer(customMarker);
                    };

                    if (L.Util.isArray(extractedFloor)) {
                        extractedFloor.forEach(assignToFloorContainer);
                    } else {
                        assignToFloorContainer(extractedFloor);
                    }
                }
            }
        };

        // Process any initial data provided during instantiation
        this.importFeatureData(initialData);
    },

    // Attaches this layer to a given map instance
    attachToMap: function (targetMap) {
        targetMap.addLayer(this);
        return this;
    },

    // Lifecycle hook: called when the layer is added to the map
    onAdd: function (mapInstance) {
        this._associatedMap = mapInstance;

        // If no active floor is set, try to pick the first available one
        if (this._currentActiveFloorId === null) {
            const availableFloors = this.getPresentFloorIDs();
            if (availableFloors.length > 0) {
                this._currentActiveFloorId = availableFloors[0];
            }
        }

        // If an active floor is determined, display its corresponding layer group
        if (this._currentActiveFloorId !== null) {
            const currentFloorData = this._floorContainers.get(this._currentActiveFloorId);
            if (currentFloorData) {
                this._associatedMap.addLayer(currentFloorData);
            }
        }
    },

    // Lifecycle hook: called when the layer is removed from the map
    onRemove: function (mapInstance) {
        if (this._currentActiveFloorId !== null) {
            const currentFloorData = this._floorContainers.get(this._currentActiveFloorId);
            if (currentFloorData && this._associatedMap.hasLayer(currentFloorData)) {
                this._associatedMap.removeLayer(currentFloorData);
            }
        }
        this._associatedMap = null;
    },

    // Imports and processes GeoJSON feature data into the layer
    importFeatureData: function(incomingData) {
        if (!incomingData) {
            // Guard clause for empty data
            return;
        }

        const floorDataMap = this._floorContainers;
        const currentOptions = this.options;
        const featuresToProcess = L.Util.isArray(incomingData) ? incomingData : incomingData.features;

        if (!Array.isArray(featuresToProcess)) {
            // Ensure we have an array of features
            return;
        }

        for (const singleFeature of featuresToProcess) {
            const floorIdentifier = currentOptions.floorIdExtractor(singleFeature);

            if (floorIdentifier === undefined || floorIdentifier === null) {
                // Skip features that don't have a valid floor identifier
                continue;
            }

            // Ensure the feature has geometry, otherwise it's not renderable as a GeoJSON layer
            if (!singleFeature.geometry) {
                continue;
            }

            const processAndAddFeature = (fID) => {
                let targetLayerForFloor = floorDataMap.get(fID);
                if (!targetLayerForFloor) {
                    // Create a new GeoJSON layer for this floor if it doesn't exist
                    targetLayerForFloor = L.geoJson({
                        type: "FeatureCollection",
                        features: []
                    }, currentOptions);
                    floorDataMap.set(fID, targetLayerForFloor);
                }
                targetLayerForFloor.addData(singleFeature);
            };

            // Handle features that span multiple floors or a single floor
            if (L.Util.isArray(floorIdentifier)) {
                floorIdentifier.forEach(processAndAddFeature);
            } else {
                processAndAddFeature(floorIdentifier);
            }
        }
    },

    // Retrieves a list of all unique floor IDs present in the loaded data
    getPresentFloorIDs: function() {
        return Array.from(this._floorContainers.keys());
    },

    // Returns the ID of the currently displayed floor
    getCurrentFloorID: function() {
        return this._currentActiveFloorId;
    },

    // Changes the active floor displayed on the map
    changeActiveFloor: function(newFloorSetting) {
        let desiredFloorID = newFloorSetting;
        // Allow passing an object with a 'newFloor' property for flexibility
        if (typeof newFloorSetting === 'object' && newFloorSetting !== null && Object.prototype.hasOwnProperty.call(newFloorSetting, 'newFloor')) {
            desiredFloorID = newFloorSetting.newFloor;
        }

        // If the desired floor is already active, do nothing
        if (this._currentActiveFloorId === desiredFloorID) {
            return;
        }

        const previousFloorLayer = this._floorContainers.get(this._currentActiveFloorId);
        const nextFloorLayer = this._floorContainers.get(desiredFloorID);

        if (this._associatedMap !== null) {
            // Remove the old floor's layer if it was on the map
            if (previousFloorLayer && this._associatedMap.hasLayer(previousFloorLayer)) {
                this._associatedMap.removeLayer(previousFloorLayer);
            }

            // Add the new floor's layer if it exists
            if (nextFloorLayer) {
                this._associatedMap.addLayer(nextFloorLayer);
            }
        }

        // Update the internal state to the new active floor
        this._currentActiveFloorId = desiredFloorID;
    },

    // Resets the style of a given feature layer to its default configuration
    restoreDefaultFeatureStyle: function (featureSubLayer) {
        // Ensure that the layer has a defaultOptions property to revert to
        if (featureSubLayer && featureSubLayer.defaultOptions) {
            featureSubLayer.options = featureSubLayer.defaultOptions;
            this._applyFeatureStyling(featureSubLayer, this.options.style);
        }
        return this;
    },

    // Applies a specific style to a feature layer
    _applyFeatureStyling: function (targetLayer, styleDefinition) {
        let effectiveStyle = styleDefinition;
        if (typeof effectiveStyle === 'function' && targetLayer.feature) {
            effectiveStyle = effectiveStyle(targetLayer.feature);
        }
        if (targetLayer.setStyle) {
            targetLayer.setStyle(effectiveStyle);
        }
    }
});

// Factory function for convenience
L.buildingFloor = function(initialData, userConfiguration) {
    return new L.BuildingFloor(initialData, userConfiguration);
};

/**
 * A custom Leaflet control for switching between different floors of a building.
 * It provides buttons for each floor and manages the active floor display.
 */
L.FloorSwitchControl = L.Control.extend({
    includes: L.Mixin.Events,

    controlSettings: {
        position: 'bottomright', // Default position on the map

        // Function to convert floor labels (e.g., "B1", "G", "F1") into sortable numeric values.
        // Defaults to parsing as integer.
        floorValueParser: function(floorLabel) {
            return parseInt(floorLabel, 10);
        }
    },

    _constructControl: function(options) {
        L.setOptions(this, options);
        this.controlSettings = { ...this.controlSettings, ...this.options }; // Merge default with user-provided

        this._linkedMap = null; // Map instance this control is linked to
        this._floorButtons = new Map(); // Stores references to floor button DOM elements
        this._eventHandlers = []; // Placeholder for potential future event cleanup
        this._currentSelectedFloor = this.controlSettings.activeFloor || null; // Initial active floor from settings

        // Register internal event listener for floor changes
        this.addEventListener("floorDisplayChanged", this._handleFloorChangeUI, this);
    },

    // Lifecycle hook: called when the control is added to the map
    _onControlAdded: function(mapInstance) {
        this._linkedMap = mapInstance;
        const containerElement = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-floor-control-panel');

        // Apply basic styling for the control container
        containerElement.style.font = "16px Arial, sans-serif";
        containerElement.style.backgroundColor = 'white';
        containerElement.style.padding = '5px';
        containerElement.style.borderRadius = '5px';
        containerElement.style.boxShadow = '0 1px 5px rgba(0,0,0,0.4)';
        containerElement.style.textAlign = 'center';

        const floorButtonMap = this._floorButtons;
        const initiallySelectedFloor = this._currentSelectedFloor;
        const selfReference = this; // Capture 'this' for closures

        const rawFloorLabels = this.controlSettings.levels;
        if (!Array.isArray(rawFloorLabels) || rawFloorLabels.length === 0) {
            // Guard clause if no levels are provided
            return containerElement;
        }

        // Prepare floor data for sorting (numeric value + original label)
        const sortableFloors = rawFloorLabels.map(label => ({
            numericValue: selfReference.controlSettings.floorValueParser(label),
            originalLabel: label
        }));

        // Sort floors, typically from highest to lowest for display order
        sortableFloors.sort((a, b) => b.numericValue - a.numericValue);

        // Create and append buttons for each floor
        for (const floorEntry of sortableFloors) {
            const floorButtonElement = L.DomUtil.create('a', 'leaflet-button-part leaflet-floor-button', containerElement);
            floorButtonElement.href = '#'; // Make it clickable
            floorButtonElement.style.display = 'block';
            floorButtonElement.style.padding = '5px 10px';
            floorButtonElement.style.margin = '2px 0';
            floorButtonElement.style.textDecoration = 'none';
            floorButtonElement.style.color = '#333';
            floorButtonElement.style.backgroundColor = '#f4f4f4'; // Default button color
            floorButtonElement.style.border = '1px solid #ccc';
            floorButtonElement.style.borderRadius = '3px';

            // Highlight the initially selected floor
            if (floorEntry.numericValue === initiallySelectedFloor || floorEntry.originalLabel === initiallySelectedFloor) {
                floorButtonElement.style.backgroundColor = "#b0b0b0";
                floorButtonElement.style.color = 'white';
            }

            floorButtonElement.textContent = floorEntry.originalLabel; // Use textContent for security

            // Attach click event using a closure to capture the correct floor ID
            ((capturedFloorID) => {
                L.DomEvent.on(floorButtonElement, 'click', L.DomEvent.stop) // Stop event propagation
                         .on(floorButtonElement, 'click', () => {
                             selfReference.setDisplayedFloor(capturedFloorID);
                         });
            })(floorEntry.originalLabel); // Pass originalLabel as the floor ID

            floorButtonMap.set(floorEntry.originalLabel, floorButtonElement);
        }

        return containerElement;
    },

    // Internal handler for updating button styles when the floor changes
    _handleFloorChangeUI: function(eventData) {
        if (this._linkedMap === null) {
            // Only update UI if control is active on a map
            return;
        }

        const { previousFloorID, newFloorID } = eventData;
        const buttonMap = this._floorButtons;

        // Reset style of the old active button
        if (previousFloorID && buttonMap.has(previousFloorID)) {
            const oldButton = buttonMap.get(previousFloorID);
            oldButton.style.backgroundColor = "#f4f4f4";
            oldButton.style.color = '#333';
        }

        // Apply active style to the new button
        if (newFloorID && buttonMap.has(newFloorID)) {
            const newButton = buttonMap.get(newFloorID);
            newButton.style.backgroundColor = "#b0b0b0";
            newButton.style.color = 'white';
        }
    },

    // Public method to programmatically change the displayed floor
    setDisplayedFloor: function(targetFloorIdentifier) {
        // If the target floor is already active, do nothing
        if (targetFloorIdentifier === this._currentSelectedFloor) {
            return;
        }

        const oldActiveFloor = this._currentSelectedFloor;
        this._currentSelectedFloor = targetFloorIdentifier;

        // Fire a custom event to notify listeners about the floor change
        this.fireEvent("floorDisplayChanged", {
            previousFloorID: oldActiveFloor,
            newFloorID: targetFloorIdentifier
        });
    },

    // Public method to retrieve the currently displayed floor's identifier
    getDisplayedFloor: function() {
        return this._currentSelectedFloor;
    }
});

// Factory function for convenience
L.floorSwitchControl = function (controlOptions) {
    return new L.FloorSwitchControl(controlOptions);
};