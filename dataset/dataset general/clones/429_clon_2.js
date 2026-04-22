// Define a new measurement tool class, extending Leaflet's drawing polyline functionality.
L.Pathing.RangefinderTool = L.Draw.Polyline.extend({

    // Initializes the tool by setting up event listeners and internal states.
    setupInstrument: function() {
        L.Draw.Polyline.prototype.addHooks.call(this); // Call the parent's setup method to ensure base functionality.
                                                       // This refers to the original parent class method.
        // Verify if a map instance is available for interaction.
        if (this._targetMap) {
            this._pointRegistry = new L.LayerGroup(); // Create a dedicated layer group for measurement points.
            this._targetMap.addLayer(this._pointRegistry); // Add this group to the map display.

            this._collectedPoints = []; // Initialize an array to hold individual point markers.
            this._targetMap.on('mousedown', this._onMapInteraction, this); // Attach a listener for map clicks to handle drawing.
            this._initiatePathSegment(); // Start the initial path drawing process.
        }
    },

    // Cleans up the tool by removing event listeners and clearing resources.
    teardownInstrument: function () {
        L.Draw.Polyline.prototype.removeHooks.call(this); // Invoke the parent's teardown method for proper cleanup.
                                                          // This refers to the original parent class method.

        this._clearFeedbackTimer(); // Dismiss any active error or feedback messages that might be displayed.

        // This block is crucial for ensuring guide lines and cursor styles are reset,
        // even if the control is deactivated before any drawing operations occurred.
        // Future refactoring might consolidate this behavior.
        this._targetMap.off('mousemove', this._onPointerMove); // Detach the mouse movement tracker.
        this._eraseGuideLines(); // Remove all visual guide lines from the map.
        this._controlElement.style.cursor = ''; // Reset the cursor style to its default.

        this._removeCurrentPath(); // Clear any partially or fully drawn path segments.

        this._targetMap.off('mousedown', this._onMapInteraction, this); // Remove the map click listener.
    },

    // Starts the process of drawing a new path segment.
    _initiatePathSegment: function () {
        this._isDrawingActive = true; // Set the internal state to indicate active drawing.
        this._currentPath = new L.Polyline([], this.configSettings.pathOptions); // Create a new Leaflet Polyline instance.

        this._controlElement.style.cursor = 'crosshair'; // Change the cursor to a crosshair to indicate drawing mode.

        this._updateInstructionDisplay(); // Refresh the tooltip or instruction text shown to the user.
        this._targetMap.on('mousemove', this._onPointerMove, this); // Begin tracking mouse movement for path creation.
    },

    // Finalizes the current path segment, completing the drawing process.
    _completePathSegment: function () {
        this._isDrawingActive = false; // Set drawing state to inactive.

        this._finalizePathConstruction(); // Perform any final cleanup or processing for the path.
        this._eraseGuideLines(); // Ensure all temporary guide lines are removed from the map.

        this._updateInstructionDisplay(); // Update the instruction display one last time to reflect completion.

        this._targetMap.off('mousemove', this._onPointerMove); // Stop listening for mouse movement events.
        this._controlElement.style.cursor = ''; // Reset the cursor style to default.
    },

    // Removes the currently drawn path and any associated markers.
    _removeCurrentPath: function () {
        // Only proceed if there's an active path segment to remove.
        if (!this._currentPath) {
            return;
        }
        this._targetMap.removeLayer(this._currentPath); // Remove the polyline from the map's layers.
        delete this._currentPath; // Dereference the polyline object to aid garbage collection.
        this._collectedPoints.splice(0); // Clear the array holding references to collected points.
        this._pointRegistry.clearLayers(); // Remove all markers from the dedicated layer group.
    },

    // Handles map interaction (e.g., mouse clicks) to manage the drawing state.
    _onMapInteraction: function (evtData) {
        // If drawing is not currently active, a click signifies the start of a new measurement.
        if (!this._isDrawingActive) {
            this._removeCurrentPath(); // Clear any previous or incomplete path.
            this._initiatePathSegment(); // Initiate a fresh path drawing process.
            return;
        }
    },

    // Retrieves the text content for the tool's tooltip or instructional display.
    _retrieveInstructionText: function () {
        var instructionText = L.Draw.Polyline.prototype._getTooltipText.call(this); // Obtain the parent's default tooltip text.
                                                                                // This refers to the original parent class method.
        // If drawing is not active, clear the instruction text to prevent stale information.
        if (!this._isDrawingActive) {
            instructionText.text = '';
        }
        return instructionText; // Return the prepared instruction text object.
    }
});


// Defines a new Leaflet control for the measurement tool, extending the base Control class.
L.Control.RangefinderWidget = L.Control.extend({

    // Static properties (metadata) accessible directly on the class.
    metadata: {
        WIDGET_CAPTION: 'Measure distances and areas on the map' // Title for the control button.
    },
    // Configuration options for this specific control instance.
    config: {
        placement: 'topleft', // Default position on the map (e.g., 'topleft', 'bottomright').
        toolSettings: {}      // Configuration object to pass to the underlying RangefinderTool instance.
    },

    // Toggles the active state of the measurement tool associated with this control.
    toggleActivity: function () {
        // Check if the underlying tool instance is currently enabled.
        if (this.toolInstance.enabled()) {
            this.toolInstance.disable.call(this.toolInstance); // Deactivate the measurement tool.
        } else {
            this.toolInstance.enable.call(this.toolInstance); // Activate the measurement tool.
        }
    },

    // Method called by Leaflet when the control is added to a map.
    attachToMap: function (currentMap) {
        var baseCssClass = 'map-tool-component'; // Define a base CSS class for control elements.

        this._mainContainer = L.DomUtil.create('div', 'map-toolbar-housing'); // Create the main container DOM element.

        // Instantiate the RangefinderTool, passing the map and specific tool settings.
        this.toolInstance = new L.Pathing.RangefinderTool(currentMap, this.config.toolSettings);

        // Add a CSS class to the control's container when the tool becomes active.
        this.toolInstance.on('enabled', function () {
            L.DomUtil.addClass(this._mainContainer, 'active-status');
        }, this);

        // Remove the CSS class when the tool becomes inactive.
        this.toolInstance.on('disabled', function () {
            L.DomUtil.removeClass(this._mainContainer, 'active-status');
        }, this);

        var actionButton = L.DomUtil.create('a', baseCssClass + '-range', this._mainContainer);
        actionButton.href = '#'; // Set href to '#' to make it a clickable link.
        actionButton.title = L.Control.RangefinderWidget.metadata.WIDGET_CAPTION; // Set the tooltip text for the button.

        // Attach multiple event listeners to the action button for click handling.
        L.DomEvent
            .addListener(actionButton, 'click', L.DomEvent.stopPropagation) // Prevent event from bubbling up.
            .addListener(actionButton, 'click', L.DomEvent.preventDefault)  // Stop default link behavior (e.g., page jump).
            .addListener(actionButton, 'click', this.toggleActivity, this); // Call the toggleActivity method on click.

        return this._mainContainer; // Return the main container DOM element to be added to the map.
    }
});


// Merge custom options into Leaflet's default map options.
L.Map.augmentOptions({
    rangefinderEnabled: false // Default setting: the rangefinder widget is disabled by default.
});


// Add an initialization hook that runs for all new Leaflet map instances.
L.Map.onMapCreation(function () {
    // If the 'rangefinderEnabled' option is set to true for this map,
    // create and add the RangefinderWidget control.
    if (this.options.rangefinderEnabled) {
        this.activeRangefinder = L.Control.createRangefinderWidget().addTo(this);
    }
});


// Factory function to provide a convenient way to create new instances of the RangefinderWidget.
L.Control.createRangefinderWidget = function (customOptions) {
    return new L.Control.RangefinderWidget(customOptions);
};