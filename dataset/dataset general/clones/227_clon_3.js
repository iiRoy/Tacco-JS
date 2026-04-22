/*
 * L.Control.OverviewMap: An enhanced overview map control for Leaflet.
 * This component provides a smaller, synchronized map view within the main map interface,
 * allowing users to orient themselves in a larger context.
 *
 * It supports customizable display, zoom synchronization, and interactive elements.
 *
 * @author: Code Clone Generator
 * @version: 2.0.0
 * @license: MIT (or similar, assuming original license)
 */

L.Control.OverviewMap = L.Control.extend({
    // Configuration parameters for the overview map.
    options: {
        // Placement of the control on the primary map (e.g., 'bottomright', 'topleft').
        placement: 'bottomright',

        // Flag to indicate if a toggle button should be rendered.
        canToggleVisibility: false,

        // The difference in zoom levels between the primary and overview maps.
        // A positive value means the overview map is more zoomed out.
        zoomDelta: 5,

        // If true, the overview map maintains a fixed zoom level as specified here,
        // ignoring the primary map's zoom and `zoomDelta`.
        fixedZoomLevel: false,

        // Enable or disable zoom animation on the overview map.
        animateZoom: false,

        // Automatically hide the overview map if the primary map's bounds fully contain the overview map's bounds.
        // This is useful for preventing the overview from showing the same area as the main map.
        autoHideWhenCovered: false,

        // The default width of the overview panel in pixels.
        panelWidth: 150,

        // The default height of the overview panel in pixels.
        panelHeight: 150,

        // The width of the overview panel when collapsed (if `canToggleVisibility` is true).
        compactWidth: 20,

        // The height of the overview panel when collapsed.
        compactHeight: 20,

        // CSS class applied when the overview map is minimized.
        minimizedClass: 'leaflet-control-overview-compact',

        // CSS class applied when the overview map is fully visible.
        visibleClass: 'leaflet-control-overview-expanded',

        // Default visibility state when the control is added.
        defaultVisible: true,

        // Options for the rectangle indicating the primary map's visible area on the overview map.
        visibleAreaStyle: {
            color: "#ff7800",
            weight: 1,
            clickable: false,
            fillOpacity: 0.2,
            opacity: 1
        },

        // Options for the rectangle shown when dragging the overview map to indicate a new primary map view.
        dragIndicatorStyle: {
            color: "#000000",
            weight: 1,
            clickable: false,
            opacity: 0,
            fillOpacity: 0
        }
    },

    // Text displayed on the toggle button when the overview map is visible (to collapse it).
    collapseTip: 'Hide Overview',

    // Text displayed on the toggle button when the overview map is collapsed (to expand it).
    expandTip: 'Show Overview',

    /**
     * Initializes the overview map control with a base layer and optional configuration.
     * @param {L.Layer} baseLayerForOverview - The map layer to be displayed within the overview map.
     * @param {Object} configParams - Custom configuration options to override defaults.
     */
    initialize: function (baseLayerForOverview, configParams) {
        // Apply user-provided options, merging them with default settings.
        L.Util.extend(this.options, configParams);

        // Ensure the interactive rectangles are not clickable, regardless of user input.
        // This prevents unintended interactions with the overview map's UI elements.
        this.options.visibleAreaStyle.clickable = false;
        this.options.dragIndicatorStyle.clickable = false;

        // Store the provided layer for the overview map.
        this._overviewLayer = baseLayerForOverview;

        // Internal flags to prevent infinite feedback loops between the primary and overview maps.
        this._isPrimaryMapMoving = false; // True if the main map is currently moving.
        this._isOverviewMapMoving = false; // True if the overview map is currently moving.

        // Flag to track if the user has manually toggled the visibility.
        this._explicitlyControlledVisibility = false;

        // Current collapsed state of the overview map.
        this._isCollapsed = !this.options.defaultVisible;

        // Placeholder for the last recorded zoom level of the overview map.
        this._lastOverviewZoom = null;

        // Guard clause: Ensure a valid layer is provided.
        if (!L.Util.isArray(baseLayerForOverview) && !baseLayerForOverview.onAdd) {
            console.warn("OverviewMap: Provided base layer is not a valid Leaflet layer.");
            // Optionally throw an error or handle gracefully.
        }
    },

    /**
     * Called when the control is added to a Leaflet map.
     * This method creates the overview map container, initializes the overview map,
     * and sets up event listeners for synchronization.
     * @param {L.Map} primaryMap - The main Leaflet map instance this control is added to.
     * @returns {HTMLElement} The DOM element for the control's container.
     */
    onAdd: function (primaryMap) {
        this._primaryMap = primaryMap; // Store a reference to the main map.

        const currentOptions = this.options; // Cache options for easier access.

        // Create the main container div for the overview map.
        this._overviewContainer = L.DomUtil.create('div', 'leaflet-control-overview');
        this._overviewContainer.style.width = currentOptions.panelWidth + 'px';
        this._overviewContainer.style.height = currentOptions.panelHeight + 'px';

        // Prevent events within the overview map from propagating to the primary map.
        L.DomEvent.disableClickPropagation(this._overviewContainer);
        // Stop mousewheel events from scrolling the main map.
        L.DomEvent.on(this._overviewContainer, 'mousewheel', L.DomEvent.stopPropagation);

        // Initialize the actual overview map within its container.
        this._overviewMap = new L.Map(this._overviewContainer, {
            attributionControl: false,      // No attribution needed for overview.
            zoomControl: false,             // No zoom control needed.
            zoomAnimation: currentOptions.animateZoom, // Use configured zoom animation.
            touchZoom: !currentOptions.fixedZoomLevel, // Disable touch zoom if fixed zoom.
            scrollWheelZoom: !currentOptions.fixedZoomLevel, // Disable scroll zoom if fixed zoom.
            doubleClickZoom: !currentOptions.fixedZoomLevel, // Disable double-click zoom if fixed zoom.
            boxZoom: !currentOptions.fixedZoomLevel,       // Disable box zoom if fixed zoom.
            crs: primaryMap.options.crs     // Use the same coordinate reference system as the primary map.
        });

        // Add the base layer to the overview map.
        this._overviewMap.addLayer(this._overviewLayer);

        // If toggling is enabled, create and append the toggle button.
        if (currentOptions.canToggleVisibility) {
            this._setupToggleButton();
        }

        // Wait for the overview map to be ready before adding interactive elements and listeners.
        this._overviewMap.whenReady(L.Util.bind(function () {
            // Create the rectangle that outlines the primary map's visible area.
            this._activeViewRect = L.rectangle(this._primaryMap.getBounds(), currentOptions.visibleAreaStyle).addTo(this._overviewMap);

            // Create the rectangle that shows where the primary map would move to during a drag operation.
            this._dragPreviewRect = L.rectangle(this._primaryMap.getBounds(), currentOptions.dragIndicatorStyle).addTo(this._overviewMap);

            // Establish event listeners for synchronization between maps.
            this._primaryMap.on('moveend', this._onPrimaryMapMovementEnd, this);
            this._primaryMap.on('move', this._onPrimaryMapMoving, this);
            this._overviewMap.on('movestart', this._onOverviewMapDragStart, this);
            this._overviewMap.on('move', this._onOverviewMapDragging, this);
            this._overviewMap.on('moveend', this._onOverviewMapDragEnd, this);

            // Set initial visibility based on options.
            this._adjustVisibility(this._shouldBeCollapsed());
        }, this));

        return this._overviewContainer;
    },

    /**
     * Overrides the default `addTo` method to ensure the overview map is correctly initialized
     * and its initial view is set after being added to a map.
     * @param {L.Map} targetMap - The map to add this control to.
     * @returns {L.Control.OverviewMap} This control instance.
     */
    addTo: function (targetMap) {
        L.Control.prototype.addTo.call(this, targetMap); // Call the parent method.

        // Set the overview map's initial view to synchronize with the primary map.
        // It uses the primary map's center and a calculated zoom level.
        if (this._overviewMap && this._primaryMap) {
            this._overviewMap.setView(this._primaryMap.getCenter(), this._determineZoomLevel(true));
            this._adjustVisibility(this._shouldBeCollapsed());
        } else {
            console.warn("OverviewMap: Cannot set initial view, maps not fully initialized.");
        }
        return this;
    },

    /**
     * Cleans up event listeners and removes the overview map when the control is removed from the primary map.
     * @param {L.Map} removedFromMap - The map this control is being removed from.
     */
    onRemove: function (removedFromMap) {
        if (this._primaryMap) {
            this._primaryMap.off('moveend', this._onPrimaryMapMovementEnd, this);
            this._primaryMap.off('move', this._onPrimaryMapMoving, this);
        }
        if (this._overviewMap) {
            this._overviewMap.off('movestart', this._onOverviewMapDragStart, this);
            this._overviewMap.off('move', this._onOverviewMapDragging, this);
            this._overviewMap.off('moveend', this._onOverviewMapDragEnd, this);
            this._overviewMap.removeLayer(this._overviewLayer);
        }
        // Also remove the rectangles from the overview map if they exist.
        if (this._activeViewRect) this._overviewMap.removeLayer(this._activeViewRect);
        if (this._dragPreviewRect) this._overviewMap.removeLayer(this._dragPreviewRect);

        // Clear references to prevent memory leaks.
        this._primaryMap = null;
        this._overviewMap = null;
        this._overviewContainer = null;
        this._visibilityToggleButton = null;
        this._activeViewRect = null;
        this._dragPreviewRect = null;
    },

    /**
     * Replaces the current base layer of the overview map with a new one.
     * This is useful for dynamic layer switching.
     * @param {L.Layer} newBaseLayer - The new layer to display in the overview map.
     */
    changeLayer: function (newBaseLayer) {
        // Ensure the overview map exists before attempting layer manipulation.
        if (this._overviewMap && this._overviewLayer) {
            this._overviewMap.removeLayer(this._overviewLayer); // Remove the old layer.
        }
        this._overviewLayer = newBaseLayer; // Update the stored layer.
        if (this._overviewMap && this._overviewLayer) {
            this._overviewMap.addLayer(this._overviewLayer); // Add the new layer.
        }
    },

    /**
     * Creates and configures the toggle button for the overview map's visibility.
     */
    _setupToggleButton: function () {
        const toggleOptions = this.options;
        const buttonTitle = this._isCollapsed ? this.expandTip : this.collapseTip;

        // Helper function to create the button element.
        const createButtonElement = (title, className, container) => {
            const linkElem = L.DomUtil.create('a', className, container);
            linkElem.href = '#';
            linkElem.title = title;
            linkElem.setAttribute('role', 'button');
            linkElem.setAttribute('aria-label', title);
            return linkElem;
        };

        this._visibilityToggleButton = createButtonElement(
            buttonTitle,
            `leaflet-control-overview-toggle-btn leaflet-control-overview-toggle-btn-${toggleOptions.placement}`,
            this._overviewContainer
        );

        // Set initial dimensions for the button.
        this._visibilityToggleButton.style.width = toggleOptions.compactWidth + 'px';
        this._visibilityToggleButton.style.height = toggleOptions.compactHeight + 'px';

        // Attach event listeners for user interaction.
        L.DomEvent
            .on(this._visibilityToggleButton, 'click', L.DomEvent.stopPropagation)
            .on(this._visibilityToggleButton, 'mousedown', L.DomEvent.stopPropagation)
            .on(this._visibilityToggleButton, 'dblclick', L.DomEvent.stopPropagation)
            .on(this._visibilityToggleButton, 'click', L.DomEvent.preventDefault)
            .on(this._visibilityToggleButton, 'click', this._handleToggleButtonClick, this);
    },

    /**
     * Handles the click event on the visibility toggle button.
     * Toggles the collapsed state and updates the button's appearance and title.
     */
    _handleToggleButtonClick: function () {
        this._explicitlyControlledVisibility = true; // User has manually interacted.

        // Determine the new state and apply it.
        if (!this._isCollapsed) {
            this._collapseView();
            this._visibilityToggleButton.title = this.expandTip;
        } else {
            this._expandView();
            this._visibilityToggleButton.title = this.collapseTip;
        }
    },

    /**
     * Adjusts the visibility of the overview map based on the requested state.
     * @param {boolean} collapseStateRequested - True to collapse, false to expand.
     */
    _adjustVisibility: function (collapseStateRequested) {
        // Only act if the requested state is different from the current state.
        if (collapseStateRequested !== this._isCollapsed) {
            if (!this._isCollapsed) { // Currently expanded, need to collapse.
                this._collapseView();
            } else { // Currently collapsed, need to expand.
                this._expandView();
            }
        }
    },

    /**
     * Collapses the overview map to its compact state or hides it entirely.
     */
    _collapseView: function () {
        const opts = this.options;
        if (opts.canToggleVisibility) {
            // Adjust container dimensions to compact size.
            this._overviewContainer.style.width = opts.compactWidth + 'px';
            this._overviewContainer.style.height = opts.compactHeight + 'px';
            // Add CSS class for visual styling of the minimized state.
            L.DomUtil.addClass(this._overviewContainer, opts.minimizedClass);
            L.DomUtil.removeClass(this._overviewContainer, opts.visibleClass);

            // Update button class if it exists.
            if (this._visibilityToggleButton) {
                L.DomUtil.addClass(this._visibilityToggleButton, `minimized-${opts.placement}`);
                this._visibilityToggleButton.title = this.expandTip;
            }
        } else {
            // If no toggle button, just hide the container.
            this._overviewContainer.style.display = 'none';
        }
        this._isCollapsed = true;
    },

    /**
     * Restores the overview map to its full size and visibility.
     */
    _expandView: function () {
        const opts = this.options;
        if (opts.canToggleVisibility) {
            // Restore container dimensions to full size.
            this._overviewContainer.style.width = opts.panelWidth + 'px';
            this._overviewContainer.style.height = opts.panelHeight + 'px';
            // Remove minimized CSS class and add visible class.
            L.DomUtil.removeClass(this._overviewContainer, opts.minimizedClass);
            L.DomUtil.addClass(this._overviewContainer, opts.visibleClass);

            // Update button class and title if it exists.
            if (this._visibilityToggleButton) {
                L.DomUtil.removeClass(this._visibilityToggleButton, `minimized-${opts.placement}`);
                this._visibilityToggleButton.title = this.collapseTip;
            }
        } else {
            // If no toggle button, just show the container.
            this._overviewContainer.style.display = 'block';
        }
        this._isCollapsed = false;
    },

    /**
     * Event handler for when the primary map finishes moving.
     * Synchronizes the overview map's view and updates the visible area rectangle.
     */
    _onPrimaryMapMovementEnd: function () {
        // Avoid feedback loop if the overview map initiated the movement.
        if (!this._isOverviewMapMoving) {
            this._isPrimaryMapMoving = true; // Indicate that primary map is the source of movement.
            // Update overview map's view based on primary map's center and calculated zoom.
            this._overviewMap.setView(this._primaryMap.getCenter(), this._determineZoomLevel(true));
            // Adjust visibility if auto-hide is enabled.
            this._adjustVisibility(this._shouldBeCollapsed());
        } else {
            this._isOverviewMapMoving = false; // Reset the flag if overview map was moving.
        }
        // Always update the visible area rectangle to reflect the primary map's current bounds.
        if (this._activeViewRect) {
            this._activeViewRect.setBounds(this._primaryMap.getBounds());
        }
    },

    /**
     * Event handler for when the primary map is actively moving.
     * Continuously updates the visible area rectangle on the overview map.
     */
    _onPrimaryMapMoving: function () {
        // Update the rectangle representing the main map's view in real-time.
        if (this._activeViewRect) {
            this._activeViewRect.setBounds(this._primaryMap.getBounds());
        }
    },

    /**
     * Event handler for when a drag operation starts on the overview map.
     * Records the initial position of the visible area rectangle for drag preview.
     */
    _onOverviewMapDragStart: function () {
        // Get the current bounds of the active view rectangle.
        const currentActiveBounds = this._activeViewRect.getBounds();
        // Convert the southwest and northeast corners to container points on the overview map.
        const swPoint = this._overviewMap.latLngToContainerPoint(currentActiveBounds.getSouthWest());
        const nePoint = this._overviewMap.latLngToContainerPoint(currentActiveBounds.getNorthEast());
        // Store these screen coordinates for later use in dragging.
        this._lastActiveRectScreenCoords = { sw: swPoint, ne: nePoint };
    },

    /**
     * Event handler for when the overview map is actively being dragged.
     * Updates the drag preview rectangle to show where the main map would move.
     */
    _onOverviewMapDragging: function () {
        // Only proceed if the primary map is not currently driving the movement
        // and we have initial screen coordinates for the active rectangle.
        if (!this._isPrimaryMapMoving && this._lastActiveRectScreenCoords) {
            // Convert the stored screen coordinates back to LatLngs based on the current overview map view.
            const newSW = this._overviewMap.containerPointToLatLng(this._lastActiveRectScreenCoords.sw);
            const newNE = this._overviewMap.containerPointToLatLng(this._lastActiveRectScreenCoords.ne);
            // Create new LatLngBounds for the drag preview.
            const previewBounds = L.latLngBounds(newSW, newNE);

            // Update the drag preview rectangle's bounds and make it visible.
            this._dragPreviewRect.setBounds(previewBounds);
            this._dragPreviewRect.setStyle({ opacity: 1, fillOpacity: 0.3 });
        }
    },

    /**
     * Event handler for when the overview map finishes moving (e.g., after a drag or zoom).
     * Synchronizes the primary map's view and hides the drag preview.
     */
    _onOverviewMapDragEnd: function () {
        // Avoid feedback loop if the primary map initiated the movement.
        if (!this._isPrimaryMapMoving) {
            this._isOverviewMapMoving = true; // Indicate that overview map is the source.
            // Update primary map's view based on overview map's center and calculated zoom.
            this._primaryMap.setView(this._overviewMap.getCenter(), this._determineZoomLevel(false));
            // Hide the drag preview rectangle.
            this._dragPreviewRect.setStyle({ opacity: 0, fillOpacity: 0 });
        } else {
            this._isPrimaryMapMoving = false; // Reset the flag if primary map was moving.
        }
    },

    /**
     * Determines the appropriate zoom level for either the overview map or the primary map.
     * @param {boolean} isFromPrimaryToOverview - True if calculating zoom for overview map based on primary.
     *                                            False if calculating zoom for primary map based on overview.
     * @returns {number} The calculated zoom level.
     */
    _determineZoomLevel: function (isFromPrimaryToOverview) {
        const opts = this.options;

        // If a fixed zoom level is configured, use that directly.
        if (opts.fixedZoomLevel !== false) {
            return isFromPrimaryToOverview ? opts.fixedZoomLevel : this._primaryMap.getZoom();
        }

        if (isFromPrimaryToOverview) {
            // Calculate overview map zoom: primary map zoom MINUS the delta (since delta is positive, meaning overview is more zoomed out).
            return this._primaryMap.getZoom() - opts.zoomDelta;
        } else {
            // Calculating primary map zoom from overview map.
            const currentOverviewZoom = this._overviewMap.getZoom();
            const primaryMapCurrentZoom = this._primaryMap.getZoom();
            let proposedPrimaryZoom = currentOverviewZoom + opts.zoomDelta;

            // Handle edge cases where overview map hits its minimum zoom.
            // This complex logic ensures a smooth experience when the overview map cannot zoom out further.
            if (currentOverviewZoom <= this._overviewMap.getMinZoom() &&
                primaryMapCurrentZoom - opts.zoomDelta < this._overviewMap.getMinZoom()) {
                // The overview map is at or near its minimum zoom, and the primary map is also very zoomed out.
                // We need to be careful not to make the primary map zoom in too much or jump around.

                if (currentOverviewZoom > this._lastOverviewZoom) {
                    // This implies the user tried to zoom IN the overview map, but it was at min zoom.
                    // We interpret this as a desire to zoom in the primary map.
                    proposedPrimaryZoom = primaryMapCurrentZoom + 1;
                    // To keep visual consistency, we "cheat" and zoom the overview map out again,
                    // effectively preventing it from zooming in past its min.
                    this._overviewMap.setZoom(currentOverviewZoom - 1);
                } else {
                    // User either tried to zoom out past min, or just panned. Ignore zoom changes.
                    proposedPrimaryZoom = primaryMapCurrentZoom;
                }
            }

            // Store the current overview map zoom for the next comparison.
            this._lastOverviewZoom = currentOverviewZoom;
            return proposedPrimaryZoom;
        }
    },

    /**
     * Determines if the overview map should be collapsed, considering user input and auto-hide options.
     * @returns {boolean} True if the overview map should be collapsed, false otherwise.
     */
    _shouldBeCollapsed: function () {
        // If the user has manually toggled visibility, their preference takes precedence.
        if (this._explicitlyControlledVisibility) {
            return this._isCollapsed;
        }

        // If auto-hide is enabled, check if the primary map fully covers the overview map's area.
        if (this.options.autoHideWhenCovered && this._primaryMap && this._overviewMap) {
            // Hide if the primary map's visible bounds contain the entire overview map's visible bounds.
            return this._primaryMap.getBounds().contains(this._overviewMap.getBounds());
        }

        // Otherwise, return the current collapsed state (or default visibility if not yet set).
        return this._isCollapsed;
    }
});

// Extend L.Map's default options to include a flag for enabling the overview map.
L.Map.mergeOptions({
    overviewMapEnabled: false
});

// Add an initialization hook to L.Map to automatically create and add the overview map
// if the `overviewMapEnabled` option is set to true.
L.Map.addInitHook(function () {
    if (this.options.overviewMapEnabled) {
        // The `overviewMapEnabled` option can also be an object containing layer and options.
        // If it's just `true`, we assume a default setup might be desired, but for a real-world scenario,
        // it would typically be an object specifying the layer.
        // For this clone, we assume it's used with `L.control.overview` directly.
        // This hook might be simplified or removed in some Type III clones,
        // or expanded to handle different `overviewMapEnabled` types.
        if (this.options.overviewMapLayer) { // Assuming a new option for the default layer.
             this.overviewControl = (new L.Control.OverviewMap(this.options.overviewMapLayer, this.options.overviewMapOptions)).addTo(this);
        } else {
             // Fallback or error if no layer specified when auto-enabling.
             console.warn("OverviewMap: Auto-enabling requires 'overviewMapLayer' option.");
        }
    }
});

/**
 * Factory function for creating an instance of L.Control.OverviewMap.
 * This provides a convenient way to instantiate the control.
 * @param {L.Layer} layer - The base layer for the overview map.
 * @param {Object} options - Configuration options for the overview map.
 * @returns {L.Control.OverviewMap} A new instance of the overview map control.
 */
L.control.overview = function (layer, options) {
    return new L.Control.OverviewMap(layer, options);
};