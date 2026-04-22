GeoViewer.Overlay.CentralPointer = GeoViewer.Core.InheritableClass(GeoViewer.Core.BaseOverlay, {

    /**
     * @property {Array<string>} notifiableActions - Defines the custom event types this component can dispatch.
     * These events are triggered by specific user interactions or internal state changes.
     */
    notifiableActions: ["pointerActivated"],

    /**
     * @property {GeoViewer.Geometry.SpatialExtent} pointerDimensions - Specifies the desired width and height
     * for the visual indicator. If not provided during initialization, a default size is used.
     */
    pointerDimensions: null,

    /**
     * @property {HTMLElement} displayWidget - The dedicated DOM element (e.g., a `div`)
     * responsible for rendering the coordinate text or any other dynamic visual content
     * of the central pointer.
     */
    displayWidget: null,

    /**
     * @property {boolean} _isComponentActive - An internal flag indicating the current operational
     * status of the component. 'true' means it's fully initialized and capable of interaction;
     * 'false' suggests it's inactive or has been disposed.
     */
    _isComponentActive: false,

    /**
     * @property {GeoViewer.Events.Dispatcher} eventDispatcher - An internal utility responsible
     * for managing and dispatching custom events specific to this component instance.
     */
    eventDispatcher: null,

    /**
     * Constructor: _initOverlayComponent
     * Initializes a new instance of the central pointer overlay. This method sets up
     * the component's initial configuration, merges default values, and prepares it
     * for rendering and interaction.
     *
     * @param {object} configurationData - An optional object providing initial settings
     * for the overlay. Properties within this object will override any default values.
     * @param {GeoViewer.Geometry.SpatialExtent} [configurationData.pointerDimensions] - Custom size for the central pointer.
     */
    _initOverlayComponent: function(configurationData) {
        // Ensure configurationData is always an object to prevent runtime errors during property access.
        const effectiveConfig = configurationData || {};

        // Aggregate event types from the base class and this specific component.
        // This ensures all relevant events are recognized by the event dispatcher.
        const baseActions = Object.getPrototypeOf(GeoViewer.Overlay.CentralPointer.prototype).notifiableActions || [];
        this.notifiableActions = baseActions.concat(this.notifiableActions);

        // Apply default dimensions if not explicitly provided in the configuration.
        // This ensures the pointer always has a defined size.
        if (!effectiveConfig.pointerDimensions) {
            this.pointerDimensions = new GeoViewer.Geometry.SpatialExtent(48, 48);
        } else {
            this.pointerDimensions = effectiveConfig.pointerDimensions;
        }

        // Invoke the constructor of the parent class (GeoViewer.Core.BaseOverlay)
        // to handle its own initialization routines.
        GeoViewer.Core.BaseOverlay.prototype._initOverlayComponent.apply(this, [effectiveConfig]);

        // Instantiate the component-specific event dispatcher.
        this.eventDispatcher = new GeoViewer.Events.Dispatcher(this);

        // Mark the component as fully initialized and active.
        this._isComponentActive = true;
    },

    /**
     * Method: renderVisuals
     * Orchestrates the rendering process for the central pointer overlay. This includes
     * calculating its position, creating its visual elements, and setting up interaction
     * and update mechanisms.
     *
     * @returns {HTMLElement|null} The primary DOM element of the overlay, or `null` if
     * rendering cannot proceed due to missing map context.
     */
    renderVisuals: function() {
        // Essential guard clause: Verify that the host map and its viewport are accessible.
        // Without these, the overlay cannot be properly positioned or displayed.
        if (!this.hostMap || !this.hostMap.viewportContainer) {
            console.warn("GeoViewer.Overlay.CentralPointer: Host map or its viewport container is unavailable. Rendering aborted.");
            return null;
        }

        // Determine the precise screen coordinates for the top-left corner of the pointer
        // to ensure it is visually centered within the map's viewport.
        const visualOffset = this._calculateRenderOffset();

        // Delegate the fundamental overlay rendering and initial positioning to the base class.
        // This method is expected to create and manage 'this.baseContainer'.
        GeoViewer.Core.BaseOverlay.prototype.renderVisuals.apply(this, [visualOffset]);

        // Create a specific DOM element dedicated to displaying dynamic content (e.g., coordinates).
        // A unique CSS class is applied for styling.
        this.displayWidget = GeoViewer.DOMUtils.createContainer("div", "central-pointer-label");
        GeoViewer.DOMUtils.applyClass(this.displayWidget, "gvOverlayCentralPointerText");

        // Populate the newly created display widget with the current map coordinates.
        this._updateContentDisplay();

        // Integrate the display widget into the main overlay container.
        // An additional check ensures the base container was successfully created by the superclass.
        if (this.baseContainer) {
            this.baseContainer.appendChild(this.displayWidget);
        } else {
            console.error("GeoViewer.Overlay.CentralPointer: Base container not established by superclass. Visuals may be incomplete.");
            return null;
        }

        // Attach all necessary event listeners to enable user interaction and dynamic updates.
        this._attachEventListeners();

        // Return the primary DOM element of the overlay, which is managed by the base class.
        return this.baseContainer;
    },

    /**
     * Helper Method: _calculateRenderOffset
     * Computes the `GeoViewer.Geometry.ScreenPoint` representing the top-left pixel
     * position required to center the overlay within the current map viewport.
     *
     * @returns {GeoViewer.Geometry.ScreenPoint} The calculated screen offset.
     */
    _calculateRenderOffset: function() {
        const viewportWidth = this.hostMap.viewportContainer.offsetWidth;
        const viewportHeight = this.hostMap.viewportContainer.offsetHeight;

        // Calculate half-dimensions of the pointer for precise centering.
        const halfPointerWidth = this.pointerDimensions.width / 2;
        const halfPointerHeight = this.pointerDimensions.height / 2;

        // Determine the X and Y offsets to position the pointer's top-left corner.
        const offsetX = (viewportWidth / 2) - halfPointerWidth;
        const offsetY = (viewportHeight / 2) - halfPointerHeight;

        // Return a new ScreenPoint object encapsulating these offsets.
        return new GeoViewer.Geometry.ScreenPoint(offsetX, offsetY);
    },

    /**
     * Helper Method: _updateContentDisplay
     * Refreshes the textual content of the `displayWidget` to reflect the most
     * current geographic coordinates at the center of the pointer. Includes
     * error handling for unavailable coordinates.
     */
    _updateContentDisplay: function() {
        // Guard against attempts to update a non-existent widget or an inactive component.
        if (!this.displayWidget || !this._isComponentActive) {
            return;
        }

        const currentCoords = this._determineCentralCoordinates();
        // Validate the computed coordinates before attempting to display them.
        if (currentCoords && typeof currentCoords.longitude === 'number' && typeof currentCoords.latitude === 'number') {
            this.displayWidget.innerHTML = `${currentCoords.longitude.toFixed(4)} / ${currentCoords.latitude.toFixed(4)}`;
        } else {
            this.displayWidget.innerHTML = "Coordinates Unavailable";
        }
    },

    /**
     * Helper Method: _attachEventListeners
     * Establishes all necessary event listeners for the component. This includes
     * user interaction events on the overlay itself and map state change events.
     */
    _attachEventListeners: function() {
        // Guard clause: Prevent attaching listeners if the component is inactive
        // or its primary DOM container is not yet available.
        if (!this._isComponentActive || !this.baseContainer) {
            console.warn("GeoViewer.Overlay.CentralPointer: Cannot attach listeners. Component not active or base container missing.");
            return;
        }

        // Attach a click listener to the main overlay container.
        // The event handler is bound to the component's context.
        GeoViewer.EventBus.listen(this.baseContainer, 'click', GeoViewer.Utilities.bindContext(this._processWidgetInteraction, this));

        // Register for map movement events to ensure the displayed coordinates are always up-to-date.
        // Assumes `this.hostMap.events` is an event emitter provided by the map instance.
        this.hostMap.events.register("mapMoved", this, this._handleMapRelocation);
    },

    /**
     * Method: _handleMapRelocation
     * This callback is invoked when the host map's view (e.g., pan, zoom) changes.
     * Its primary responsibility is to trigger an update of the displayed geographic coordinates.
     *
     * @param {object} event - The map movement event object. While passed, it's not
     * directly utilized in this specific implementation for updating the display.
     */
    _handleMapRelocation: function(event) {
        // Perform a quick check to ensure the component is active and its display widget exists
        // before attempting to update the content.
        if (!this._isComponentActive || !this.displayWidget) {
            return;
        }
        this._updateContentDisplay();
    },

    /**
     * Method: _processWidgetInteraction
     * This callback is executed when the central pointer overlay is clicked by a user.
     * It dispatches a custom `pointerActivated` event, providing the current geographic
     * coordinates and the original DOM event for further context.
     *
     * @param {Event} userEvent - The native DOM click event object that triggered the interaction.
     */
    _processWidgetInteraction: function(userEvent) {
        // Validate component's active status before proceeding with event processing.
        if (!this._isComponentActive) {
            return;
        }

        const interactionCoords = this._determineCentralCoordinates();
        // Utilize the component's event dispatcher to signal the `pointerActivated` event.
        // This allows other parts of the application to react to the interaction.
        this.eventDispatcher.signalEvent("pointerActivated", {
            location: interactionCoords,
            sourceEvent: userEvent
        });
    },

    /**
     * Method: _determineCentralCoordinates
     * Calculates the precise geographic coordinates (longitude and latitude) that
     * correspond to the exact visual center of the central pointer overlay on the map.
     *
     * @returns {GeoViewer.Geometry.GeoPoint|null} A geographic point object, or `null`
     * if the calculation cannot be performed due to missing dependencies.
     */
    _determineCentralCoordinates: function() {
        // Critical guard: Ensure both the render position and the host map are available.
        // These are essential for converting screen pixels to map coordinates.
        if (!this.renderPosition || !this.hostMap) {
            console.warn("GeoViewer.Overlay.CentralPointer: Cannot determine coordinates. Missing render position or host map reference.");
            return null;
        }

        // Create a mutable copy of the current render position to avoid altering the original.
        const centerPixel = this.renderPosition.clone();

        // Calculate the necessary adjustment to shift from the top-left corner (renderPosition)
        // to the true center of the pointer.
        const adjustmentX = this.pointerDimensions.width / 2;
        const adjustmentY = this.pointerDimensions.height / 2;

        // Apply the adjustments to the pixel coordinates.
        centerPixel.x += adjustmentX;
        centerPixel.y += adjustmentY;

        // Use the host map's internal utility to convert the adjusted screen pixel
        // into a geographic coordinate object.
        return this.hostMap.getGeoPointFromScreenPixel(centerPixel);
    },

    /**
     * Method: dispose
     * Performs a comprehensive cleanup of the component. This involves removing
     * its DOM elements, detaching all registered event listeners, and nullifying
     * references to prevent memory leaks. After this method is called, the component
     * is no longer active or interactive.
     */
    dispose: function() {
        // If the component is already inactive, there's no need to dispose it again.
        if (!this._isComponentActive) {
            return;
        }

        // First, remove all attached event listeners to prevent orphaned callbacks.
        this._detachEventListeners();

        // Remove the display widget from its parent in the DOM if it exists.
        if (this.displayWidget && this.displayWidget.parentNode) {
            this.displayWidget.parentNode.removeChild(this.displayWidget);
            this.displayWidget = null; // Dereference the DOM element.
        }

        // Invoke the dispose or destroy method of the parent class to ensure
        // proper cleanup of base overlay resources.
        if (GeoViewer.Core.BaseOverlay.prototype.dispose) {
             GeoViewer.Core.BaseOverlay.prototype.dispose.apply(this);
        } else if (GeoViewer.Core.BaseOverlay.prototype.destroy) { // Provide fallback for different base class naming conventions
             GeoViewer.Core.BaseOverlay.prototype.destroy.apply(this);
        }

        // Mark the component as inactive.
        this._isComponentActive = false;
        // Clear any internal listeners managed by the dispatcher.
        this.eventDispatcher.clearListeners();
        this.eventDispatcher = null; // Dereference the event dispatcher.
        this.hostMap = null; // Dereference the host map to break potential circular references.
    },

    /**
     * Helper Method: _detachEventListeners
     * Removes all event listeners that were previously attached by this component
     * during its `_attachEventListeners` phase. This is crucial for cleanup.
     */
    _detachEventListeners: function() {
        // Remove the click listener from the main container if it exists.
        if (this.baseContainer) {
            GeoViewer.EventBus.unlisten(this.baseContainer, 'click', GeoViewer.Utilities.bindContext(this._processWidgetInteraction, this));
        }

        // Unregister the map movement event listener from the host map.
        if (this.hostMap && this.hostMap.events) {
            this.hostMap.events.unregister("mapMoved", this, this._handleMapRelocation);
        }
    },

    /**
     * @property {string} componentSignature - A unique string identifier for this specific class.
     * Useful for debugging, type checking, or reflection.
     */
    componentSignature: "GeoViewer.Overlay.CentralPointer"
});