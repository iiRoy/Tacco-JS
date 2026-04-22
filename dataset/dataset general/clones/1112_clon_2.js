L.Control.OverviewMapComponent = L.Control.extend({

	// Component's configurable parameters
	settings: {

		// Placement of the control on the parent map
		placement: 'bottomright',

		// Option to show a button for toggling the overview map's visibility
		allowMinimization: false,

		// Numeric difference in zoom level between the main map and the overview map
		zoomDelta: -5,

		// Boolean indicating if the overview map's zoom level should be static
		fixedZoomLevel: false,

		// Flag to enable or disable zoom animations on the overview map
		animateZoom: false,

		// Automatically hide/show the overview map based on certain conditions
		autoMinimize: false,

		// Desired pixel width of the overview map display area
		viewWidth: 150,

		// Desired pixel height of the overview map display area
		viewHeight: 150,

		// Styling attributes for the rectangle indicating the main map's view
		targetBoxOptions: { lineColor: "#ff0000", lineWidth: 1, interactive: false, borderOpacity: 1, fillTransparency: 0.5 },

		// Styling attributes for the temporary rectangle shown during overview map dragging
		ghostBoxOptions: { lineColor: "#000000", lineWidth: 1, interactive: false, borderOpacity: 0, fillTransparency: 0 }

	},
	
	// Caption for the toggle button when the overview map is visible (to hide it)
	collapseCaption: 'Conceal Overview',
	
	// Caption for the toggle button when the overview map is hidden (to show it)
	expandCaption: 'Reveal Overview',
	
	// Initializes the overview map component with a base layer and options
	setupComponent: function (baseLayer, componentOptions) {
		// Merge user-provided options with default settings
		L.Utility.configure(this, componentOptions);
		
		// Ensure the interactive property is false for all aiming rectangles
		this.settings.targetBoxOptions.interactive = false;
		this.settings.ghostBoxOptions.interactive = false;
		
		// Store a reference to the primary map layer for the overview
		this._baseLayerRef = baseLayer;
	},
	
	// Called when the control is added to a Leaflet map
	attachToMap: function (hostMap) {

		// Keep a reference to the main map instance
		this._hostMapRef = hostMap;

		// Create the main container div for the overview map and prevent event bubbling
		this._displayContainer = L.DOMHelper.makeElement('div', 'overview-map-control');
		this._displayContainer.style.width = this.settings.viewWidth + 'px';
		this._displayContainer.style.height = this.settings.viewHeight + 'px';
		L.DOMHelper.attachEvent(this._displayContainer, 'wheel', L.DOMHelper.haltPropagation);


		// Create the actual Leaflet map instance for the overview
		this._overviewMapRef = new L.MapInstance(this._displayContainer,
		{
			showAttribution: false, // Disable attribution on the overview map
			showZoomControls: false, // Disable zoom controls
			animateZoom: this.settings.animateZoom, // Inherit zoom animation setting
			autoMinimize: this.settings.autoMinimize, // Inherit auto-minimize setting
			allowTouchZoom: !this.settings.fixedZoomLevel, // Enable touch zoom unless level is fixed
			allowScrollZoom: !this.settings.fixedZoomLevel, // Enable scroll zoom unless level is fixed
			allowDoubleClickZoom: !this.settings.fixedZoomLevel, // Enable double-click zoom unless level is fixed
			allowBoxZoom: !this.settings.fixedZoomLevel, // Enable box zoom unless level is fixed
			coordinateRefSys: hostMap.options.crs // Use the same coordinate reference system as the host map
		});
		
		// Add the specified base layer to the overview map
		this._overviewMapRef.addOverlay(this._baseLayerRef);

		// Flags to prevent infinite loop of map movement notifications
		this._isHostMapMoving = false;
		this._isOverviewMapMoving = false;

		// State variables for display control
		this._userControlledVisibility = false; // Tracks if user manually changed visibility
		this._isCollapsed = false; // Current collapsed state of the overview map

		// If a toggle button is configured, create it
		if (this.settings.allowMinimization) {
			this._createToggleControl();
		}

		// Execute code once the overview map is fully initialized and ready
		this._overviewMapRef.onReady(L.Utility.bindContext(function () {
			// Initialize the rectangle showing the main map's view on the overview map
			this._targetRectangle = L.RectangleElement(this._hostMapRef.getCurrentBounds(), this.settings.targetBoxOptions).placeOnMap(this._overviewMapRef);
			// Initialize the ghost rectangle (used during dragging)
			this._ghostRectangle = L.RectangleElement(this._hostMapRef.getCurrentBounds(), this.settings.ghostBoxOptions).placeOnMap(this._overviewMapRef);
			
			// Attach event listeners to the main map
			this._hostMapRef.on('moveFinished', this._onHostMapMotionEnd, this);
			this._hostMapRef.on('moving', this._onHostMapMotion, this);
			
			// Attach event listeners to the overview map
			this._overviewMapRef.on('moveStarted', this._onOverviewMapMotionStart, this);
			this._overviewMapRef.on('moving', this._onOverviewMapMotion, this);
			this._overviewMapRef.on('moveFinished', this._onOverviewMapMotionEnd, this);
			this._overviewMapRef.on('singleClick', this._onOverviewMapInteraction, this);
			this._overviewMapRef.on('touchRelease', this._onOverviewMapInteraction, this);
			
			// Prevent click events within the container from propagating up to the main map
			L.DOMHelper.preventClickPropagation(this._displayContainer);
		}, this));
		
		return this._displayContainer; // Return the DOM element for the control
	},

	// Extends the base control's addTo method to set initial view
	appendComponentTo: function (hostMap) {
		L.ControlBase.prototype.appendComponentTo.call(this, hostMap);
		// Set the initial center and zoom for the overview map
		this._overviewMapRef.setCenterAndZoom(this._hostMapRef.getCenter(), this._determineZoomLevel(true));
		// Set the initial display state based on conditions
		this._manageVisibility(this._determineCollapsedState()); // NOTE: _determineCollapsedState is not defined in the provided snippet and will cause an error. This replicates the original code's behavior.
		return this;
	},

	// Called when the control is removed from a Leaflet map
	detachFromMap: function (hostMap) {
		// Remove all event listeners from the main map
		this._hostMapRef.off('moveFinished', this._onHostMapMotionEnd, this);
		this._hostMapRef.off('moving', this._onHostMapMotion, this);
		
		// Remove all event listeners from the overview map
		this._overviewMapRef.off('moveFinished', this._onOverviewMapMotionEnd, this);
		this._overviewMapRef.off('singleClick', this._onOverviewMapInteraction, this);
		this._overviewMapRef.off('touchRelease', this._onOverviewMapInteraction, this);
	
		// Remove the base layer from the overview map
		this._overviewMapRef.removeOverlay(this._baseLayerRef);
	},

	// Creates the toggle button for the overview map display
	_createToggleControl: function () {
		this._visibilityToggleButton = this.settings.allowMinimization ? this._generateActionButton(
				'', this.collapseCaption, 'overview-map-toggle-button', this._displayContainer, this._handleToggleClick, this) : undefined;
	},

	// Helper function to generate a generic action button (anchor tag)
	_generateActionButton: function (buttonHTML, buttonTitle, cssClass, parentContainer, callbackFunction, executionScope) {
		var anchorElement = L.DOMHelper.makeElement('a', cssClass, parentContainer);
		anchorElement.innerHTML = buttonHTML;
		anchorElement.hyperlinkRef = '#'; // Standard empty href
		anchorElement.title = buttonTitle; // Set tooltip text

		var stopEvent = L.DOMHelper.haltPropagation; // Cache the stop propagation function

		// Attach various event listeners to the button
		L.DOMHelper
			.attachEvent(anchorElement, 'singleClick', stopEvent)
			.attachEvent(anchorElement, 'mousePress', stopEvent)
			.attachEvent(anchorElement, 'doubleClick', stopEvent)
			.attachEvent(anchorElement, 'singleClick', L.DOMHelper.preventStandardBehavior) // Prevent default click action
			.attachEvent(anchorElement, 'singleClick', callbackFunction, executionScope); // Attach custom click handler

		return anchorElement; // Return the created button element
	},

	// Handles the click event on the toggle button
	_handleToggleClick: function () {
		this._userControlledVisibility = true; // Mark that user initiated the change
		if (!this._isCollapsed) {
			this._collapseView(); // Hide the overview map
			this._visibilityToggleButton.title = this.expandCaption; // Update button text for next action
		}
		else {
			this._expandView(); // Show the overview map
			this._visibilityToggleButton.title = this.collapseCaption; // Update button text for next action
		}
	},

	// Manages the visible/collapsed state of the overview map
	_manageVisibility: function (shouldCollapse) {
		if (shouldCollapse !== this._isCollapsed) {
			if (!this._isCollapsed) {
				this._collapseView();
			}
			else {
				this._expandView();
			}
		}
	},

	// Collapses the overview map display
	_collapseView: function () {
		// Adjust container size and add CSS class if minimization is allowed
		if (this.settings.allowMinimization) {
			this._displayContainer.style.width = '19px';
			this._displayContainer.style.height = '19px';
			this._visibilityToggleButton.className += ' collapsed-state';
		}
		// Otherwise, simply hide the container
		else {
			this._displayContainer.style.display = 'none';
		}
		this._isCollapsed = true; // Update internal state
	},

	// Expands the overview map display to its normal size
	_expandView: function () {
		// Restore container size and remove CSS class if minimization is allowed
		if (this.settings.allowMinimization) {
			this._displayContainer.style.width = this.settings.viewWidth + 'px';
			this._displayContainer.style.height = this.settings.viewHeight + 'px';
			this._visibilityToggleButton.className = this._visibilityToggleButton.className
					.replace(/(?:^|\s)collapsed-state(?!\S)/g, ''); // Remove the 'collapsed-state' class
		}
		// Otherwise, make the container visible
		else {
			this._displayContainer.style.display = 'block';
		}
		this._isCollapsed = false; // Update internal state
	},

	// Event handler for when the main map finishes its movement
	_onHostMapMotionEnd: function (ev) {
		if (!this._isOverviewMapMoving) {
			this._isHostMapMoving = true; // Set flag to indicate main map is moving
			this._overviewMapRef.setCenterAndZoom(this._hostMapRef.getCenter(), this._determineZoomLevel(true)); // Update overview map's view
			this._manageVisibility(this._determineCollapsedState()); // Adjust visibility based on state (will error if _determineCollapsedState is missing)
		} else {
			this._isOverviewMapMoving = false; // Reset overview map moving flag
		}
		this._targetRectangle.setBounds(this._hostMapRef.getCurrentBounds()); // Update the target rectangle's position
	},

	// Event handler for when the main map is actively moving
	_onHostMapMotion: function (ev) {
		this._targetRectangle.setBounds(this._hostMapRef.getCurrentBounds()); // Continuously update target rectangle
	},

	// Event handler for when the overview map starts moving
	_onOverviewMapMotionStart:function (ev) {
		var previousTargetBounds = this._targetRectangle.getCurrentBounds(); // Get current bounds of the target rectangle
		var southWestPoint = this._overviewMapRef.coordToPixel(previousTargetBounds.getSouthWestCorner()); // Convert SW coordinate to pixel
		var northEastPoint = this._overviewMapRef.coordToPixel(previousTargetBounds.getNorthEastCorner()); // Convert NE coordinate to pixel
		this._lastTargetRectPosition = {southWest:southWestPoint,northEast:northEastPoint}; // Store pixel positions for ghost rectangle
	},

	// Event handler for when the overview map is actively moving
	_onOverviewMapMotion: function (ev) {
		if (!this._isHostMapMoving && this._lastTargetRectPosition) { // Proceed only if main map is not moving and we have a stored position
			// Update the ghost rectangle's bounds based on the overview map's current view
			this._ghostRectangle.setBounds(new L.CoordinateBounds(this._overviewMapRef.pixelToCoord(this._lastTargetRectPosition.southWest),this._overviewMapRef.pixelToCoord(this._lastTargetRectPosition.northEast)));
			this._ghostRectangle.setStyle({borderOpacity:1,fillTransparency:0.3}); // Make the ghost rectangle visible
		}
	},

	// Event handler for when the overview map finishes its movement
	_onOverviewMapMotionEnd: function (ev) {
		if (!this._isHostMapMoving) {
			this._isOverviewMapMoving = true; // Set flag to indicate overview map is moving
			this._hostMapRef.setCenterAndZoom(this._overviewMapRef.getCenter(), this._determineZoomLevel(false)); // Update main map's view
			this._ghostRectangle.setStyle({borderOpacity:0,fillTransparency:0}); // Hide the ghost rectangle
		} else {
			this._isHostMapMoving = false; // Reset main map moving flag
		}
	},
	
	// Event handler for click/touch interactions on the overview map
	_onOverviewMapInteraction : function( ev ) {
		this._hostMapRef.setCenterAndZoom(ev.latlng); // Center the main map on the clicked location
	},

	// Calculates the appropriate zoom level for either map based on context
	_determineZoomLevel: function (fromHostToOverview) {
		// If the zoom level is not fixed
		if (!this.settings.fixedZoomLevel) {
			if (fromHostToOverview) {
				// Calculate overview map zoom based on main map zoom and delta
				return this._hostMapRef.getCurrentZoom() + this.settings.zoomDelta;
			} else {
				// Calculate main map zoom based on overview map zoom
				var currentZoomDifference = this._overviewMapRef.getCurrentZoom() - this._hostMapRef.getCurrentZoom();
				var suggestedZoom = this._overviewMapRef.getCurrentZoom() - this.settings.zoomDelta;
				var returnZoomLevel;
				
				// Handle specific scenario where overview map is at its minimum zoom
				if (currentZoomDifference > this.settings.zoomDelta && this._hostMapRef.getCurrentZoom() < this._overviewMapRef.getMinimumZoom() - this.settings.zoomDelta) {
					// This condition means the overview map is fully zoomed out and cannot zoom further.
					if (this._overviewMapRef.getCurrentZoom() > this._previousOverviewZoom) {
						// If the user is trying to zoom in via the overview map, zoom the main map in.
						returnZoomLevel = this._hostMapRef.getCurrentZoom() + 1;
						// To maintain visual coherence, slightly zoom out the overview map.
						this._overviewMapRef.adjustZoom(this._overviewMapRef.getCurrentZoom() - 1);
					} else {
						// If user is trying to zoom out past the overview map's minimum or just panning, ignore zoom change.
						returnZoomLevel = this._hostMapRef.getCurrentZoom();
					}
				} else {
					// This covers most cases, especially with sensible zoom configurations.
					returnZoomLevel = suggestedZoom;
				}
				this._previousOverviewZoom = this._overviewMapRef.getCurrentZoom(); // Store current overview zoom for next comparison
				return returnZoomLevel;
			}
		} else {
			// If the zoom level is fixed
			if (fromHostToOverview) {
				return this.settings.fixedZoomLevel; // Return the predefined fixed zoom level
			} else {
				return this._hostMapRef.getCurrentZoom(); // Keep main map's current zoom
			}
		}
	}
});