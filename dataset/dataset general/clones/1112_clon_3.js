L.Control.SpatialLocator = L.Control.extend({

	// Configuration parameters for the overview map control.
	settings: {
		// Default placement on the main map.
		placement: 'bottomright',

		// Enable/disable the visibility toggle button.
		canToggleVisibility: false,

		// Zoom level adjustment for the overview map relative to the primary map.
		zoomDelta: -5,

		// If true, the overview map's zoom level is fixed.
		fixedZoomLevel: false,

		// Enable/disable zoom animations for the overview map.
		animateZooming: false,

		// Automatically hide/show the overview map based on main map activity.
		autoHideOnMove: false,

		// Dimensions of the overview map panel.
		panelWidth: 150,
		panelHeight: 150,

		// Styling options for the rectangle indicating the main map's current viewport.
		viewportIndicatorStyle: {color: "#ff0000", weight: 1, interactive: false, opacity:1, fillOpacity:0.5},

		// Styling options for the rectangle indicating the main map's previous viewport during drag.
		movementTraceStyle: {color: "#000000", weight: 1, interactive: false, opacity:0, fillOpacity:0}
	},

	// Text displayed when the overview map is visible (to hide it).
	collapseLabel: 'Hide Overview',

	// Text displayed when the overview map is hidden (to show it).
	expandLabel: 'Show Overview',

	// The base layer to be displayed within the overview map.
	_init: function (baseLayer, configOptions) {
		// Merge user-provided options with default settings.
		L.Util.setOptions(this, configOptions);

		// Ensure viewport indicators are not interactive, overriding user input if necessary.
		this.settings.viewportIndicatorStyle.interactive = false;
		this.settings.movementTraceStyle.interactive = false;

		this._baseLayerRef = baseLayer; // Reference to the layer for the overview map.
		this._hasToggleFeature = this.settings.canToggleVisibility; // Cache toggle setting.
	},

	// Method called when the control is added to the main map.
	attachToMap: function (primaryMap) {
		this._primaryMap = primaryMap; // Store reference to the main map.

		// Create the container element for the overview map and prevent event propagation.
		this._displayPanel = L.DomUtil.create('div', 'leaflet-control-overviewmap ' + this.settings.placement);
		L.DomUtil.setStyles(this._displayPanel, {
			width: this.settings.panelWidth + 'px',
			height: this.settings.panelHeight + 'px'
		});
		L.DomEvent.on(this._displayPanel, 'mousewheel', L.DomEvent.stopPropagation);

		// Initialize the internal Leaflet map instance for the overview.
		this._overviewMapInstance = new L.Map(this._displayPanel, {
			attributionControl: false,
			zoomControl: false,
			animateZooming: this.settings.animateZooming,
			autoHideOnMove: this.settings.autoHideOnMove,
			touchZoom: !this.settings.fixedZoomLevel,
			scrollWheelZoom: !this.settings.fixedZoomLevel,
			doubleClickZoom: !this.settings.fixedZoomLevel,
			boxZoom: !this.settings.fixedZoomLevel,
			crs: primaryMap.options.crs // Use the same coordinate reference system as the primary map.
		});

		this._overviewMapInstance.addLayer(this._baseLayerRef);

		// Flags to prevent infinite loop synchronization between the two maps.
		this._primaryMapIsMoving = false;
		this._overviewMapIsMoving = false;

		// State variables for panel visibility.
		this._manualVisibilityOverride = false; // True if user explicitly toggled visibility.
		this._isCollapsed = false; // True if the panel is currently hidden.

		// Conditionally add the toggle button based on configuration.
		if (this._hasToggleFeature) {
			this._createVisibilityToggleButton();
		}

		// Once the overview map is ready, set up initial state and event listeners.
		this._overviewMapInstance.whenReady(() => {
			this._currentViewportMarker = L.rectangle(this._primaryMap.getBounds(), this.settings.viewportIndicatorStyle).addTo(this._overviewMapInstance);
			this._previousViewportMarker = L.rectangle(this._primaryMap.getBounds(), this.settings.movementTraceStyle).addTo(this._overviewMapInstance);
			this._setupEventBindings(); // Centralize event binding logic.
			L.DomEvent.disableClickPropagation(this._displayPanel);
		});

		// Call the parent's addTo method to ensure proper control placement.
		L.Control.prototype.addTo.call(this, primaryMap);

		// Set initial view and visibility state.
		this._overviewMapInstance.setView(this._primaryMap.getCenter(), this._determineOptimalZoom(true));
		this._updatePanelState(this._shouldBeCollapsed());

		return this._displayPanel;
	},

	// Overrides the default `addTo` method to ensure initial view is set after control is added.
	addTo: function (map) {
		return this.attachToMap(map); // Delegate to the renamed method.
	},

	// Method called when the control is removed from the main map.
	onRemove: function (map) {
		this._removeEventBindings(); // Clean up all event listeners.

		if (this._baseLayerRef && this._overviewMapInstance && this._overviewMapInstance.hasLayer(this._baseLayerRef)) {
			this._overviewMapInstance.removeLayer(this._baseLayerRef);
		}
		if (this._overviewMapInstance) {
			this._overviewMapInstance.remove(); // Dispose of the overview map instance.
			this._overviewMapInstance = null;
		}
		if (this._displayPanel) {
			L.DomUtil.remove(this._displayPanel); // Remove the DOM element.
			this._displayPanel = null;
		}

		// Call parent's onRemove to ensure proper cleanup.
		L.Control.prototype.onRemove.call(this, map);
	},

	// Helper to set up all event listeners for map synchronization and user interaction.
	_setupEventBindings: function () {
		const mainMap = this._primaryMap;
		const overviewMap = this._overviewMapInstance;

		mainMap.on('moveend', this._onPrimaryMapMovementEnd, this);
		mainMap.on('move', this._onPrimaryMapMoving, this);

		overviewMap.on('movestart', this._onOverviewMapDragStart, this);
		overviewMap.on('move', this._onOverviewMapDragging, this);
		overviewMap.on('moveend', this._onOverviewMapDragEnd, this);
		overviewMap.on('click', this._onOverviewMapClicked, this);
		overviewMap.on('touchend', this._onOverviewMapClicked, this);
	},

	// Helper to remove all event listeners.
	_removeEventBindings: function () {
		const mainMap = this._primaryMap;
		const overviewMap = this._overviewMapInstance;

		if (mainMap) {
			mainMap.off('moveend', this._onPrimaryMapMovementEnd, this);
			mainMap.off('move', this._onPrimaryMapMoving, this);
		}
		if (overviewMap) {
			overviewMap.off('movestart', this._onOverviewMapDragStart, this);
			overviewMap.off('move', this._onOverviewMapDragging, this);
			overviewMap.off('moveend', this._onOverviewMapDragEnd, this);
			overviewMap.off('click', this._onOverviewMapClicked, this);
			overviewMap.off('touchend', this._onOverviewMapClicked, this);
		}
	},

	// Creates and adds the button to toggle overview map visibility.
	_createVisibilityToggleButton: function () {
		const btnContent = '<span class="overviewmap-toggle-icon"></span>'; // Using CSS for icon.
		this._toggleButtonRef = this._generateButtonElement(
			btnContent,
			this.collapseLabel,
			'leaflet-control-overviewmap-toggle',
			this._displayPanel,
			this._handleToggleClick,
			this
		);
	},

	// Generic utility to create an interactive button element.
	_generateButtonElement: function (htmlContent, tooltip, className, parentContainer, clickHandler, contextScope) {
		const buttonElement = L.DomUtil.create('button', className, parentContainer);
		buttonElement.innerHTML = htmlContent;
		buttonElement.type = 'button'; // Explicitly set type to button to prevent form submission.
		buttonElement.title = tooltip;

		// Stop propagation of various DOM events to prevent interference with the main map.
		const stopEvent = L.DomEvent.stopPropagation;
		L.DomEvent
			.on(buttonElement, 'click', stopEvent)
			.on(buttonElement, 'mousedown', stopEvent)
			.on(buttonElement, 'dblclick', stopEvent)
			.on(buttonElement, 'click', L.DomEvent.preventDefault) // Prevent default link/button action.
			.on(buttonElement, 'click', clickHandler, contextScope);

		return buttonElement;
	},

	// Handles clicks on the toggle button.
	_handleToggleClick: function () {
		this._manualVisibilityOverride = true; // Mark as user-initiated action.
		this._updatePanelState(!this._isCollapsed); // Toggle current state.
		this._toggleButtonRef.title = this._isCollapsed ? this.expandLabel : this.collapseLabel;
	},

	// Determines if the panel should be collapsed based on auto-hide and manual override.
	_shouldBeCollapsed: function() {
		return this.settings.autoHideOnMove && !this._manualVisibilityOverride;
	},

	// Updates the visibility state of the overview map panel.
	_updatePanelState: function (collapsePanel) {
		if (collapsePanel === this._isCollapsed) return; // No change needed.

		this._isCollapsed = collapsePanel; // Update internal state.

		if (this._hasToggleFeature) {
			// If toggle feature is enabled, shrink/expand the panel.
			if (collapsePanel) {
				L.DomUtil.setStyles(this._displayPanel, { width: '24px', height: '24px' }); // Slightly larger collapsed state.
				L.DomUtil.addClass(this._toggleButtonRef, 'collapsed-state');
			} else {
				L.DomUtil.setStyles(this._displayPanel, { width: this.settings.panelWidth + 'px', height: this.settings.panelHeight + 'px' });
				L.DomUtil.removeClass(this._toggleButtonRef, 'collapsed-state');
			}
		} else {
			// If no toggle, simply hide/show the entire container.
			this._displayPanel.style.display = collapsePanel ? 'none' : 'block';
		}
	},

	// Event handler for when the primary map finishes moving.
	_onPrimaryMapMovementEnd: function (evt) {
		if (!this._overviewMapIsMoving) {
			this._primaryMapIsMoving = true;
			this._overviewMapInstance.setView(this._primaryMap.getCenter(), this._determineOptimalZoom(true));
			this._updatePanelState(this._shouldBeCollapsed());
		} else {
			this._overviewMapIsMoving = false; // Reset flag if it was set by overview map.
		}
		this._currentViewportMarker.setBounds(this._primaryMap.getBounds());
	},

	// Event handler for when the primary map is actively moving.
	_onPrimaryMapMoving: function (evt) {
		this._currentViewportMarker.setBounds(this._primaryMap.getBounds());
	},

	// Records the initial position of the viewport marker when overview map drag starts.
	_onOverviewMapDragStart: function (evt) {
		const lastBounds = this._currentViewportMarker.getBounds();
		this._lastViewportMarkerCoords = {
			sw: this._overviewMapInstance.latLngToContainerPoint(lastBounds.getSouthWest()),
			ne: this._overviewMapInstance.latLngToContainerPoint(lastBounds.getNorthEast())
		};
	},

	// Updates the shadow rectangle during overview map dragging.
	_onOverviewMapDragging: function (evt) {
		if (!this._primaryMapIsMoving && this._lastViewportMarkerCoords) {
			const currentShadowBounds = new L.LatLngBounds(
				this._overviewMapInstance.containerPointToLatLng(this._lastViewportMarkerCoords.sw),
				this._overviewMapInstance.containerPointToLatLng(this._lastViewportMarkerCoords.ne)
			);
			this._previousViewportMarker.setBounds(currentShadowBounds);
			this._previousViewportMarker.setStyle({opacity:1, fillOpacity:0.3});
		}
	},

	// Event handler for when the overview map finishes moving.
	_onOverviewMapDragEnd: function (evt) {
		if (!this._primaryMapIsMoving) {
			this._overviewMapIsMoving = true;
			this._primaryMap.setView(this._overviewMapInstance.getCenter(), this._determineOptimalZoom(false));
			this._previousViewportMarker.setStyle({opacity:0, fillOpacity:0});
		} else {
			this._primaryMapIsMoving = false; // Reset flag if it was set by primary map.
		}
	},

	// Handles click events on the overview map, moving the primary map to the clicked location.
	_onOverviewMapClicked: function (evt) {
		if (evt && evt.latlng) { // Ensure event and coordinates are valid.
			this._primaryMap.setView(evt.latlng);
		}
	},

	// Determines the appropriate zoom level for either map based on synchronization direction.
	_determineOptimalZoom: function (syncFromPrimary) {
		const cfg = this.settings; // Shorthand for configuration.

		// If a fixed zoom level is specified, use that or the primary map's current zoom.
		if (cfg.fixedZoomLevel) {
			return syncFromPrimary ? cfg.fixedZoomLevel : this._primaryMap.getZoom();
		}

		// If synchronizing from primary to overview map, apply the zoom delta.
		if (syncFromPrimary) {
			return this._primaryMap.getZoom() + cfg.zoomDelta;
		}

		// If synchronizing from overview to primary map (more complex logic).
		const ovMapZoom = this._overviewMapInstance.getZoom();
		const primaryMapZoom = this._primaryMap.getZoom();
		const zoomDifference = ovMapZoom - primaryMapZoom;
		let calculatedPrimaryZoom = ovMapZoom - cfg.zoomDelta;

		// Special handling for when the overview map is at its minimum effective zoom.
		const minOvZoomEffective = this._overviewMapInstance.getMinZoom() - cfg.zoomDelta;
		if (zoomDifference > cfg.zoomDelta && primaryMapZoom < minOvZoomEffective) {
			// This means the overview map is effectively "stuck" at its minimum zoom relative to the primary map.
			// If the user tries to zoom in using the overview map:
			if (ovMapZoom > this._lastOverviewMapZoom) {
				calculatedPrimaryZoom = primaryMapZoom + 1; // Increment primary map zoom.
				// To maintain visual consistency, slightly zoom out the overview map.
				this._overviewMapInstance.setZoom(ovMapZoom - 1);
			} else {
				// Otherwise, maintain primary map zoom (e.g., just panning).
				calculatedPrimaryZoom = primaryMapZoom;
			}
		}

		this._lastOverviewMapZoom = ovMapZoom; // Update last known overview map zoom.
		return calculatedPrimaryZoom;
	}
});