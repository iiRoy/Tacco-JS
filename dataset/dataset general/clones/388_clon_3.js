/* Project: Geospatial Visualization Module
   Maintainer: Custom Solutions Team
*/

/*jslint white: false, nomen: false, debug: false, devel: true, onevar: false, plusplus: false, browser: true, bitwise: false, es5: true, maxerr: 200 */
/*global jQuery: false, $: false, log: false, window: false, WSJNG: false, _: false, google: false, localStorage: false */

// Essential client-side utilities
if (typeof window.util === 'undefined' || window.util === null) {
    window.util = {};
}

// A simple type detection utility, robust for common types.
if (!window.util.determineType) {
    window.util.determineType = function(candidate) {
        var detectionResult = typeof candidate;
        if (detectionResult === "object") {
            if (candidate === null) {
                return "null";
            }
            if (Array.isArray(candidate)) { // More robust check for arrays
                return "array";
            }
        }
        return detectionResult;
    };
}

// ***************************************
// Safeguard for console operations in older browsers.
// ***************************************
if (!window.console || !window.console.log) {
    window.console = {
        "log": function() {},
        "warn": function() {},
        "error": function() {}
    };
}

// ***************************************
// Establish the primary application namespace for map components.
// ***************************************
var geoMapViz = geoMapViz || {};

(function() {
    "use strict"; // Enable strict mode for cleaner code.

    // Internal utility toolkit, mimicking some Underscore/Lodash functions.
    // Designed to be self-contained to avoid external dependencies for basic operations.
    geoMapViz.toolkit = window.geoMapVizToolkit || (function() {
        var toolkit = {};
        var sentinelValue = {}; // Used to signal early exit from iteration.

        var nativeSlice = Array.prototype.slice;
        var nativeArrayIterator = Array.prototype.forEach;

        /**
         * Iterates over elements of a collection (array or object).
         * @param {Array|Object} collection - The collection to iterate over.
         * @param {Function} processor - The function to call for each element.
         * @param {Object} [contextObj] - The `this` binding for the processor function.
         */
        toolkit.forEachElement = function(collection, processor, contextObj) {
            if (collection === null || typeof collection === 'undefined') {
                return;
            }

            // Prefer native forEach for arrays if available.
            if (nativeArrayIterator && collection.forEach === nativeArrayIterator) {
                collection.forEach(processor, contextObj);
            } else if (typeof collection.length === 'number' && collection.length >= 0 && collection.length === Math.floor(collection.length)) { // Array-like objects
                for (var elementIndex = 0, totalElements = collection.length; elementIndex < totalElements; elementIndex++) {
                    // Check for sparse arrays and allow early exit via sentinelValue.
                    if (elementIndex in collection && processor.call(contextObj, collection[elementIndex], elementIndex, collection) === sentinelValue) {
                        return;
                    }
                }
            } else { // Plain objects
                for (var propertyKey in collection) {
                    // Ensure it's an own property to avoid iterating prototype chain.
                    if (Object.prototype.hasOwnProperty.call(collection, propertyKey)) {
                        if (processor.call(contextObj, collection[propertyKey], propertyKey, collection) === sentinelValue) {
                            return;
                        }
                    }
                }
            }
        };

        /**
         * Merges properties from one or more source objects into a target object.
         * Later sources override properties from earlier ones.
         * @param {Object} targetObj - The object to extend.
         * @param {...Object} sources - One or more source objects.
         * @returns {Object} The extended target object.
         */
        toolkit.assignProperties = function(targetObj) {
            targetObj = targetObj || {}; // Ensure target is an object.
            toolkit.forEachElement(nativeSlice.call(arguments, 1), function(sourceObject) {
                if (sourceObject) { // Ensure sourceObject is not null/undefined
                    for (var propertyName in sourceObject) {
                        if (Object.prototype.hasOwnProperty.call(sourceObject, propertyName)) { // Check for own properties
                            // Only assign if the source property is not undefined, allowing nulls.
                            if (sourceObject[propertyName] !== undefined) {
                                targetObj[propertyName] = sourceObject[propertyName];
                            }
                        }
                    }
                }
            });
            return targetObj;
        };

        return toolkit;
    }());

    // Augment Google Maps LatLng object with GeoJSON export capability.
    // This provides a convenient way to get standard [longitude, latitude] array.
    if (google && google.maps && google.maps.LatLng && !google.maps.LatLng.prototype.exportCoordinates) {
        google.maps.LatLng.prototype.exportCoordinates = function() {
            var longitude = this.lng();
            var latitude = this.lat();
            // Basic validation for coordinates.
            if (typeof longitude !== 'number' || typeof latitude !== 'number' || isNaN(longitude) || isNaN(latitude)) {
                console.warn("Invalid LatLng coordinates detected during export.");
                return [0, 0]; // Return a default or throw an error.
            }
            return [longitude, latitude];
        };
    }

    // Augment Google Maps MVCArray object for exporting its contents as a GeoJSON-like array of coordinate arrays.
    if (google && google.maps && google.maps.MVCArray && !google.maps.MVCArray.prototype.exportGeomArray) {
        google.maps.MVCArray.prototype.exportGeomArray = function() {
            var rawMapElements = this.getArray();
            var processedCoordinates = [];
            // Use Array.prototype.map for conciseness if available, otherwise fallback.
            if (Array.prototype.map) {
                processedCoordinates = rawMapElements.map(function(element) {
                    if (element && typeof element.exportCoordinates === 'function') {
                        return element.exportCoordinates();
                    }
                    return null; // Handle cases where element might not be a LatLng.
                }).filter(function(item) { return item !== null; }); // Remove nulls.
            } else {
                for (var k = 0, numElements = rawMapElements.length; k < numElements; k++) {
                    var currentElement = rawMapElements[k];
                    if (currentElement && typeof currentElement.exportCoordinates === 'function') {
                        processedCoordinates.push(currentElement.exportCoordinates());
                    }
                }
            }
            return processedCoordinates;
        };
    }

    /**
     * Represents an interactive geographical region on a Google Map.
     * This class manages the visual representation and interaction state (selected/highlighted)
     * of a multi-polygon feature.
     *
     * @class geoMapViz.InteractiveArea
     * @param {Object} config - Configuration object for the area.
     * @param {string} config.uniqueIdentifier - A unique string ID for this area.
     * @param {Array<Array<Array<google.maps.LatLng>>>} config.multiPolygonData - GeoJSON-like array of LatLng objects defining the area's boundaries.
     * @param {Object} [config.metadata] - Optional object containing additional data fields.
     * @param {google.maps.Map} config.mapInstance - The Google Maps instance where the area will be rendered.
     * @param {Object} [config.selectionManager] - An object responsible for managing selection states across multiple areas.
     * @param {Function} [config.onHighlight] - Callback function triggered when the area is highlighted.
     * @param {Function} [config.onSelect] - Callback function triggered when the area is selected.
     * @param {Function} [config.getResponsiveDefaultOpts] - Function returning default polygon options based on dynamic conditions.
     * @param {Function} [config.getResponsiveHighlightOpts] - Function returning highlight options.
     * @param {Function} [config.getResponsiveSelectOpts] - Function returning select options.
     * @param {string} [config.baseFillColor] - Initial fill color for the unselected state.
     */
    geoMapViz.InteractiveArea = function(config) {
        var instanceRef = this; // Capture 'this' for use in event handlers.

        // Validate essential configuration parameters.
        if (!config || !config.uniqueIdentifier || !config.multiPolygonData || !config.mapInstance) {
            console.error("geoMapViz.InteractiveArea: Missing essential configuration parameters (uniqueIdentifier, multiPolygonData, mapInstance).");
            throw new Error("Invalid InteractiveArea configuration.");
        }

        this.uniqueIdentifier = config.uniqueIdentifier;
        this.graphicPolygons = []; // Stores google.maps.Polygon objects.
        this.associatedData = config.metadata || {};
        this.selectionManager = config.selectionManager || geoMapViz.defaultSelectionManager; // External manager for state.

        this._isSelected = false;
        this._isHighlighted = false;

        this.onHighlightAction = config.onHighlight;
        this.onSelectionAction = config.onSelect;

        // Default functions for responsive options if not provided.
        var defaultOptionProvider = function() { return {}; };
        this._getResponsiveDefaultOpts = config.getResponsiveDefaultOpts || defaultOptionProvider;
        this._getResponsiveHighlightOpts = config.getResponsiveHighlightOpts || defaultOptionProvider;
        this._getResponsiveSelectOpts = config.getResponsiveSelectOpts || defaultOptionProvider;

        // Establish initial base style options.
        this.defaultShapeOptions = geoMapViz.toolkit.assignProperties({}, this._baseStyleOptions);
        if (config.baseFillColor) {
            this.defaultShapeOptions.fillColor = config.baseFillColor;
        }

        // Store event listener references for proper cleanup.
        this._activeListeners = [];

        // Helper for event binding.
        var bindPolygonEvents = function(polygonObject) {
            var mouseOverHandle = google.maps.event.addListener(polygonObject, "mousemove", handleMouseOver);
            var mouseOutHandle = google.maps.event.addListener(polygonObject, "mouseout", handleMouseOut);
            var clickHandle = google.maps.event.addListener(polygonObject, "click", handleMouseClick);
            instanceRef._activeListeners.push(mouseOverHandle, mouseOutHandle, clickHandle);
        };

        // Event handler definitions.
        function handleMouseOver(eventData) {
            instanceRef.setHighlightState(true);
        }

        function handleMouseOut(eventData) {
            instanceRef.setHighlightState(false);
        }

        function handleMouseClick(eventData) {
            instanceRef.setSelectionState(!instanceRef.isCurrentlySelected());
        }

        // Process multi-polygon data to create Google Maps Polygon objects.
        var polygonCreationData = config.multiPolygonData;
        if (!Array.isArray(polygonCreationData) || polygonCreationData.length === 0) {
            console.warn("InteractiveArea created with no valid multi-polygon data.");
            // Consider throwing an error or handling gracefully if this is a critical input.
            return; 
        }

        for (var polygonIdx = 0, numPolygons = polygonCreationData.length; polygonIdx < numPolygons; polygonIdx++) {
            var currentPolygonPaths = polygonCreationData[polygonIdx];
            if (!currentPolygonPaths || currentPolygonPaths.length === 0) {
                console.warn("Skipping empty polygon path at index: " + polygonIdx + " for area " + this.uniqueIdentifier);
                continue;
            }
            var newPolygon = new google.maps.Polygon(geoMapViz.toolkit.assignProperties({},
                this.defaultShapeOptions,
                this._getResponsiveDefaultOpts(), {
                    paths: currentPolygonPaths,
                    map: config.mapInstance
                }));
            this.graphicPolygons.push(newPolygon);
            bindPolygonEvents(newPolygon); // Attach events for each new polygon.
        }

        // Store the last applied options to optimize redraw calls.
        this._lastAppliedOptions = null;
        // Initial redraw to ensure correct state.
        this.updateVisualState();
    };

    geoMapViz.InteractiveArea.prototype = {
        // Base styling for polygons when not selected or highlighted.
        _baseStyleOptions: Object.freeze({ // Freeze to prevent accidental modification.
            clickable: true,
            fillColor: "#CCCCCC", // Slightly different default color.
            strokeColor: "#333333",
            strokeWeight: 0.8, // Slightly thinner stroke.
            strokeOpacity: 0.3
        }),
        // Style overrides for the selected state.
        _selectedStyleOverrides: Object.freeze({
            strokeOpacity: 1.0,
            strokeWeight: 1.5, // Slightly thicker.
            strokeColor: "#0000CC", // Darker blue.
            zIndex: 2 // Ensure selected polygons are above others.
        }),
        // Style overrides for the highlighted (hover) state.
        _highlightStyleOverrides: Object.freeze({
            strokeOpacity: 1.0,
            strokeWeight: 1.2, // Medium thickness.
            strokeColor: "#00CC00", // Green.
            zIndex: 1 // Highlighted polygons are above default but below selected.
        }),

        /**
         * Helper to trigger a callback function if it exists.
         * @private
         * @param {Function} cb - The callback function to execute.
         */
        _triggerCallback: function(cb) {
            if (typeof cb === 'function') {
                try {
                    cb.call(this);
                } catch (e) {
                    console.error("Error executing InteractiveArea callback:", e);
                }
            }
        },

        /**
         * Compares two style option objects for equality.
         * @private
         * @param {Object} opts1 - First options object.
         * @param {Object} opts2 - Second options object.
         * @returns {boolean} True if options are functionally identical, false otherwise.
         */
        _isEqualOptions: function(opts1, opts2) {
            if (opts1 === opts2) return true;
            if (!opts1 || !opts2 || typeof opts1 !== 'object' || typeof opts2 !== 'object') return false;

            var keys1 = Object.keys(opts1);
            var keys2 = Object.keys(opts2);

            if (keys1.length !== keys2.length) return false;

            for (var i = 0; i < keys1.length; i++) {
                var key = keys1[i];
                if (!opts2.hasOwnProperty(key) || opts1[key] !== opts2[key]) {
                    return false;
                }
            }
            return true;
        },

        /**
         * Removes the interactive area from the map and cleans up resources.
         */
        dispose: function() {
            var self = this;
            if (!self.graphicPolygons || self.graphicPolygons.length === 0) {
                return; // Nothing to dispose.
            }

            // Clear all attached listeners.
            geoMapViz.toolkit.forEachElement(this._activeListeners, function(listenerHandle) {
                google.maps.event.removeListener(listenerHandle);
            });
            this._activeListeners = []; // Clear the array.

            // Remove polygons from the map.
            geoMapViz.toolkit.forEachElement(self.graphicPolygons, function(polygon) {
                if (polygon && typeof polygon.setMap === 'function') {
                    polygon.setMap(null);
                }
            });

            // Nullify references to aid garbage collection.
            this.graphicPolygons = null;
            this.selectionManager = null;
            this.onHighlightAction = null;
            this.onSelectionAction = null;
            this._lastAppliedOptions = null;
            // Additional cleanup for responsive option functions if they were dynamically created.
            this._getResponsiveDefaultOpts = null;
            this._getResponsiveHighlightOpts = null;
            this._getResponsiveSelectOpts = null;
        },

        /**
         * Exports the geometric representation of the area in a GeoJSON-like format.
         * @returns {Array} An array representing a GeoJSON MultiPolygon structure.
         */
        getGeoJSONRepresentation: function() {
            var geoJsonOutput = [];
            if (!this.graphicPolygons || this.graphicPolygons.length === 0) {
                return geoJsonOutput;
            }
            geoMapViz.toolkit.forEachElement(this.graphicPolygons, function(polygon) {
                if (polygon && typeof polygon.getPaths === 'function' && typeof polygon.getPaths().exportGeomArray === 'function') {
                    geoJsonOutput.push(polygon.getPaths().exportGeomArray());
                }
            });
            return geoJsonOutput;
        },

        /**
         * Refreshes the visual styling of the polygons based on the current state (selected/highlighted).
         * This method intelligently applies style updates to avoid redundant API calls.
         */
        updateVisualState: function() {
            if (!this.graphicPolygons || this.graphicPolygons.length === 0) {
                return; // No polygons to update.
            }

            var currentStyleConfiguration = geoMapViz.toolkit.assignProperties({},
                this.defaultShapeOptions,
                this._getResponsiveDefaultOpts()
            );

            if (this._isHighlighted) {
                geoMapViz.toolkit.assignProperties(currentStyleConfiguration,
                    this._highlightStyleOverrides,
                    this._getResponsiveHighlightOpts()
                );
            }

            if (this._isSelected) {
                geoMapViz.toolkit.assignProperties(currentStyleConfiguration,
                    this._selectedStyleOverrides,
                    this._getResponsiveSelectOpts()
                );
            }
            
            // Optimize: Only apply options if they have actually changed.
            if (this._isEqualOptions(this._lastAppliedOptions, currentStyleConfiguration)) {
                return;
            }

            for (var polyIndex = 0, totalPolyCount = this.graphicPolygons.length; polyIndex < totalPolyCount; polyIndex++) {
                var currentPoly = this.graphicPolygons[polyIndex];
                if (currentPoly && typeof currentPoly.setOptions === 'function') {
                    currentPoly.setOptions(currentStyleConfiguration);
                }
            }
            this._lastAppliedOptions = currentStyleConfiguration; // Store for next comparison.
        },

        /**
         * Checks if the area is currently selected.
         * @returns {boolean} True if selected, false otherwise.
         */
        isCurrentlySelected: function() {
            return this._isSelected;
        },

        /**
         * Sets the selection state of the area.
         * If `true`, it will deselect any previously selected area managed by the same selectionManager.
         * @param {boolean} newState - The desired selection state.
         */
        setSelectionState: function(newState) {
            if (typeof newState !== 'boolean' || this._isSelected === newState) {
                return; // No change or invalid input.
            }

            this._isSelected = newState;

            if (this._isSelected) {
                // If a selection manager exists, ensure only one item is selected at a time.
                if (this.selectionManager && this.selectionManager.selectedArea && this.selectionManager.selectedArea !== this) {
                    this.selectionManager.selectedArea.setSelectionState(false); // Deselect previous.
                }
                if (this.selectionManager) {
                    this.selectionManager.selectedArea = this; // Set current as selected.
                }
                this._triggerCallback(this.onSelectionAction);
            } else {
                if (this.selectionManager && this.selectionManager.selectedArea === this) {
                    this.selectionManager.selectedArea = null; // Clear manager's reference.
                }
                // Optional: Trigger a deselection callback if needed.
            }
            this.updateVisualState();
        },

        /**
         * Checks if the area is currently highlighted.
         * @returns {boolean} True if highlighted, false otherwise.
         */
        isCurrentlyHighlighted: function() {
            return this._isHighlighted;
        },

        /**
         * Sets the highlight state of the area.
         * @param {boolean} newState - The desired highlight state.
         */
        setHighlightState: function(newState) {
            if (typeof newState !== 'boolean' || this._isHighlighted === newState) {
                return; // No change or invalid input.
            }

            this._isHighlighted = newState;
            this.updateVisualState(); // Visual state update is always needed.
            if (this._isHighlighted) {
                this._triggerCallback(this.onHighlightAction);
            }
        }
    };

    // Provide a default selection manager if none is explicitly passed.
    // This allows basic single-selection behavior out of the box.
    if (!geoMapViz.defaultSelectionManager) {
        geoMapViz.defaultSelectionManager = {
            selectedArea: null // Holds the currently selected InteractiveArea instance.
        };
    }

}());