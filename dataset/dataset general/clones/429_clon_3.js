L.Util.PathGauge = L.Draw.Segment.extend({
    // Method to prepare the measurement tool for usage
    initGauge: function() {
        // Invoke the base class's initialization routine
        L.Draw.Segment.prototype.addHooks.call(this);

        // Ensure a map instance is available before proceeding
        if (this._targetMap instanceof L.Map) {
            // Lazily create or reuse the overlay group for measurement points
            if (!this._pointOverlayGroup) {
                this._pointOverlayGroup = new L.LayerGroup();
                this._targetMap.addLayer(this._pointOverlayGroup);
            }

            // Initialize an empty array to store geo-markers
            this._measurementPoints = [];

            // Attach a listener for map clicks to capture measurement points
            this._targetMap.on('click', this._handleMapClick, this);

            // Begin the process of drawing a new path segment
            this._beginPathDrawing();
        } else {
            console.warn("L.Util.PathGauge: Map instance not found during initialization.");
        }
    },

    // Method to clean up resources when the tool is disabled
    deinitGauge: function () {
        // Call the parent's cleanup method
        L.Draw.Segment.prototype.removeHooks.call(this);

        // Clear any pending error display timeouts
        this._resetErrorDisplayTimer();

        // Detach the mouse movement listener, if it was active
        if (this._targetMap) {
            this._targetMap.off('mousemove', this._handleMapMovement, this);
        }

        // Remove any visual guides from the map
        this._removeVisualAids();

        // Reset the cursor style on the map container
        if (this._domHostElement) {
            this._domHostElement.style.cursor = '';
        }

        // Erase the current active path and its associated markers
        this._eraseActivePath();

        // Detach the click listener from the map
        if (this._targetMap) {
            this._targetMap.off('click', this._handleMapClick, this);
        }
    },

    // Initiates the drawing of a new path segment
    _beginPathDrawing: function() {
        // Set the active drawing flag to true
        this._isPathActive = true;

        // Create a new Polyline instance for the current path
        this._currentPathSegment = new L.Polyline([], this.config.pathStyle || {});

        // Set the cursor to indicate drawing mode
        if (this._domHostElement) {
            this._domHostElement.style.cursor = 'crosshair';
        }

        // Update the tooltip to reflect the current drawing state
        this._refreshInfoDisplay();

        // Attach a listener for mouse movement to update the path dynamically
        if (this._targetMap) {
            this._targetMap.on('mousemove', this._handleMapMovement, this);
        }
    },

    // Concludes the current path drawing operation
    _completePathDrawing: function () {
        // Set the active drawing flag to false
        this._isPathActive = false;

        // Perform final cleanup for the path
        this._finalizePath();

        // Remove any temporary visual guides
        this._removeVisualAids();

        // Update the tooltip to reflect the finished state
        this._refreshInfoDisplay();

        // Detach the mouse movement listener
        if (this._targetMap) {
            this._targetMap.off('mousemove', this._handleMapMovement, this);
        }

        // Reset the cursor style
        if (this._domHostElement) {
            this._domHostElement.style.cursor = '';
        }
    },

    // Removes the currently active path and its markers from the map
    _eraseActivePath: function() {
        // Only proceed if there's an active path segment
        if (this._currentPathSegment) {
            this._targetMap.removeLayer(this._currentPathSegment);
            this._currentPathSegment = null; // Clear the reference for garbage collection
        }

        // Clear all stored measurement points
        this._measurementPoints.length = 0;

        // Remove all layers from the marker group, if it exists
        if (this._pointOverlayGroup) {
            this._pointOverlayGroup.clearLayers();
        }
    },

    // Handles map click events for adding points to the path
    _handleMapClick: function(eventObj) {
        // Guard against invalid event data
        if (!eventObj || !eventObj.latlng) {
            console.warn("Click event missing valid latlng.", eventObj);
            return;
        }

        // If not actively drawing, start a new path
        if (!this._isPathActive) {
            this._eraseActivePath(); // Clear any previous incomplete path
            this._beginPathDrawing(); // Start fresh
            // Then proceed to add the clicked point to the new path
        }

        // Logic for adding a point to the path would typically go here
        // (This part is often handled by parent L.Draw.Polyline, so keeping it minimal)
    },

    // Generates the text content for the information display/tooltip
    _compileInfoText: function() {
        // Retrieve the base tooltip text from the parent class
        const infoData = L.Draw.Segment.prototype._getTooltipText.call(this);

        // If drawing is not active, clear the text
        if (!this._isPathActive) {
            infoData.text = '';
        }
        return infoData;
    }
});

L.Control.DistanceTool = L.Control.extend({

    // Static properties for the control
    statics: {
        TOOL_NAME: 'Measure distances on map',
        DEFAULT_ICON_CLASS: 'fa fa-ruler-combined' // Example for a new icon class
    },
    // Configuration options for the control
    configuration: {
        placement: 'topleft', // Position on the map
        instrumentSettings: {} // Settings passed to the measurement handler
    },

    // Toggles the activation state of the measurement tool
    toggleActivation: function() {
        // Ensure the tool instance exists
        if (!this.toolInstance) {
            console.error("Distance tool instance not initialized.");
            return;
        }

        // Log the current action
        console.log(`Toggling distance tool: current state is ${this.toolInstance.isActive() ? 'active' : 'inactive'}`);

        if (this.toolInstance.isActive()) {
            this.toolInstance.deactivate(); // Directly call deactivate
        } else {
            this.toolInstance.activate(); // Directly call activate
        }
    },

    // Lifecycle hook: called when the control is added to the map
    initializeControl: function(mapReference) {
        const baseCssClass = 'leaflet-control-draw';
        const barContainerClass = 'leaflet-bar';

        // Create the main container div for the control button
        this._controlDomElement = L.DomUtil.create('div', barContainerClass);

        // Instantiate the actual path measurement handler
        this.toolInstance = new L.Util.PathGauge(mapReference, this.configuration.instrumentSettings);

        // Attach event listeners to update the button's appearance
        this.toolInstance.on('activated', () => {
            L.DomUtil.addClass(this._controlDomElement, 'active-state');
            console.log('Distance tool activated.');
        });

        this.toolInstance.on('deactivated', () => {
            L.DomUtil.removeClass(this._controlDomElement, 'active-state');
            console.log('Distance tool deactivated.');
        });

        // Create the interactive link (button) element
        const triggerLink = L.DomUtil.create('a', `${baseCssClass}-distancetool`, this._controlDomElement);
        triggerLink.href = '#';
        triggerLink.title = L.Control.DistanceTool.TOOL_NAME;
        triggerLink.setAttribute('role', 'button');
        triggerLink.setAttribute('aria-label', L.Control.DistanceTool.TOOL_NAME);

        // Add an icon span inside the link
        const iconSpan = L.DomUtil.create('span', L.Control.DistanceTool.DEFAULT_ICON_CLASS, triggerLink);
        iconSpan.setAttribute('aria-hidden', 'true');

        // Attach event handlers for the button click
        L.DomEvent
            .on(triggerLink, 'click', L.DomEvent.stopPropagation)
            .on(triggerLink, 'click', L.DomEvent.preventDefault)
            .on(triggerLink, 'click', this.toggleActivation, this); // Use .on for modern Leaflet

        return this._controlDomElement;
    }
});


// Augment L.Map's default options with a new property
L.Map.augmentDefaultOptions({
    enableDistanceMeasurement: false // Default to disabled
});


// Add an initialization hook to L.Map to automatically add the control
L.Map.onInitialize(function () {
    // Check if the map options explicitly enable the distance measurement control
    if (this.options.enableDistanceMeasurement === true) {
        // Create and add the distance measurement control to the map
        this.distanceTool = L.Control.createDistanceTool().addTo(this);
    }
});


// Factory function to create a new instance of L.Control.DistanceTool
L.Control.createDistanceTool = function (toolOptions) {
    // Provide a default empty object for options if none are given
    const mergedOptions = toolOptions || {};
    return new L.Control.DistanceTool(mergedOptions);
};