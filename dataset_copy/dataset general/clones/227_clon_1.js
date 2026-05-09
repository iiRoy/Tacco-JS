L.Control.MiniMap=L.Control.extend(
{
	/*
	 * This is the configuration object for the MiniMap control.
	 * It defines various options that control the behavior and appearance
	 * of the minimap, such as its position, size, and display toggling.
	 */
	options:
	{
		position: 'bottomright',  // Specifies the corner where the control will be placed.
		toggleDisplay: false,     // If true, a button to toggle the minimap's visibility will be shown.
		zoomLevelOffset: -5,      // The zoom level of the minimap relative to the main map.
		zoomLevelFixed: false,    // If true, the minimap's zoom level is fixed and doesn't follow the main map's zoom.
		zoomAnimation: false,     // Whether zoom animations are enabled for the minimap.
		autoToggleDisplay: false, // If true, the minimap automatically minimizes when the main map's view contains the entire minimap area.
		width: 150,               // The width of the minimap container in pixels.
		height: 150,              // The height of the minimap container in pixels.
		collapsedWidth: 19,       // The width of the minimap when collapsed (if toggleDisplay is true).
		collapsedHeight: 19,      // The height of the minimap when collapsed (if toggleDisplay is true).

		// Options for the aiming rectangle, which shows the main map's view on the minimap.
		aimingRectOptions:
		{
			color: "#ff7800",
			weight: 1,
			clickable: false
		},

		// Options for the shadow rectangle, which appears during minimap panning.
		shadowRectOptions:
		{
			color: "#000000",
			weight: 1,
			clickable: false,
			opacity:0,
			fillOpacity:0
		}
	}, /* End of options object */

	// Text to display on the toggle button when the minimap is visible (to hide it).
	hideText: 'Hide MiniMap',

	// Text to display on the toggle button when the minimap is hidden (to show it).
	showText: 'Show MiniMap',

	// The `initialize` method is called when a new instance of L.Control.MiniMap is created.
	// It sets up the control with the provided layer and options.
	initialize: function (layer, options)
	{
		// Apply the user-provided options, overriding defaults if specified.
		L.Util.setOptions(this, options);

		// Ensure that the aiming and shadow rectangles are not clickable,
		// regardless of what the user might have set in `aimingRectOptions` or `shadowRectOptions`.
		this.options.aimingRectOptions.clickable = false;
		this.options.shadowRectOptions.clickable = false;

		// Store the layer that will be displayed within the minimap.
		this._layer = layer;
	}, /* End of initialize method */

	// The `onAdd` method is called when the control is added to a map.
	// It's responsible for creating the minimap's DOM elements and setting up event listeners.
	onAdd: function (map)
	{
		// Keep a reference to the main map to which this control is added.
		this._mainMap = map;

		// Create the main container div for the minimap.
		// Assign a specific CSS class for styling.
		this._container = L.DomUtil.create('div', 'leaflet-control-minimap');

		// Set the initial dimensions of the minimap container based on options.
		this._container.style.width  = this.options.width + 'px';
		this._container.style.height = this.options.height + 'px';

		// Prevent click events within the minimap container from propagating to the main map.
		L.DomEvent.disableClickPropagation(this._container);

		// Stop mousewheel events from propagating, preventing unwanted main map zooming/panning.
		L.DomEvent.on(this._container, 'mousewheel', L.DomEvent.stopPropagation);

		// Create a new Leaflet map instance within the minimap container.
		// This will serve as the actual minimap.
		this._miniMap = new L.Map(this._container,
		{
			attributionControl: false,          // No attribution on the minimap.
			zoomControl: false,                 // No zoom controls on the minimap.
			zoomAnimation: this.options.zoomAnimation, // Use the configured zoom animation setting.
			autoToggleDisplay: this.options.autoToggleDisplay, // Use the configured auto-toggle setting.
			touchZoom: !this.options.zoomLevelFixed,   // Disable touch zoom if zoom level is fixed.
			scrollWheelZoom: !this.options.zoomLevelFixed, // Disable scroll wheel zoom if zoom level is fixed.
			doubleClickZoom: !this.options.zoomLevelFixed, // Disable double click zoom if zoom level is fixed.
			boxZoom: !this.options.zoomLevelFixed,     // Disable box zoom if zoom level is fixed.
			crs: map.options.crs                // Use the same Coordinate Reference System as the main map.
		});

		// Add the specified base layer to the minimap.
		this._miniMap.addLayer(this._layer);

		// Initialize flags to prevent infinite loops when maps notify each other of movement.
		this._mainMapMoving = false;
		this._miniMapMoving = false;

		// Track whether the user has manually toggled the minimap display.
		this._userToggledDisplay = false;

		// Initial state of the minimap: not minimized.
		this._minimized = false;

		// If toggle display is enabled, create the toggle button.
		if (this.options.toggleDisplay)
		{
			this._addToggleButton();
		}

		// Once the minimap is ready, set up the aiming and shadow rectangles,
		// and attach event listeners for map movements.
		this._miniMap.whenReady(L.Util.bind(function ()
		{
			// Create the aiming rectangle, representing the main map's current view.
			this._aimingRect = L.rectangle(this._mainMap.getBounds(), this.options.aimingRectOptions).addTo(this._miniMap);

			// Create the shadow rectangle, used during minimap panning.
			this._shadowRect = L.rectangle(this._mainMap.getBounds(), this.options.shadowRectOptions).addTo(this._miniMap);

			// Listen for movement events on the main map.
			this._mainMap.on('moveend', this._onMainMapMoved, this);
			this._mainMap.on('move',    this._onMainMapMoving, this);

			// Listen for movement events on the minimap itself.
			this._miniMap.on('movestart', this._onMiniMapMoveStarted, this);
			this._miniMap.on('move',      this._onMiniMapMoving, this);
			this._miniMap.on('moveend',   this._onMiniMapMoved, this);

		}, this)); // End of whenReady callback

		// Return the created container element to Leaflet.
		return this._container;
	}, /* End of onAdd method */

	// Overrides the default `addTo` method to ensure minimap's view is set correctly.
	addTo: function (map)
	{
		// Call the original `addTo` method from the parent class.
		L.Control.prototype.addTo.call(this, map);

		// Set the minimap's initial view to the center of the main map,
		// and decide its zoom level based on the configuration.
		this._miniMap.setView(this._mainMap.getCenter(), this._decideZoom(true));

		// Set the initial display state (minimized or restored) based on options.
		this._setDisplay(this._decideMinimized());

		// Return this control instance for chaining.
		return this;
	}, /* End of addTo method */

	// The `onRemove` method is called when the control is removed from a map.
	// It's responsible for cleaning up event listeners and removing layers.
	onRemove: function (map)
	{
		// Remove event listeners from the main map.
		this._mainMap.off('moveend', this._onMainMapMoved, this);
		this._mainMap.off('move',    this._onMainMapMoving, this);

		// Remove event listeners from the minimap.
		this._miniMap.off('moveend', this._onMiniMapMoved, this);

		// Remove the layer from the minimap.
		this._miniMap.removeLayer(this._layer);
	}, /* End of onRemove method */

	// Allows changing the layer displayed within the minimap dynamically.
	changeLayer: function (layer)
	{
		// Remove the currently displayed layer from the minimap.
		this._miniMap.removeLayer(this._layer);

		// Update the internal reference to the new layer.
		this._layer = layer;

		// Add the new layer to the minimap.
		this._miniMap.addLayer(this._layer);
	}, /* End of changeLayer method */

	// Helper method to add the toggle button for minimizing/restoring the minimap.
	_addToggleButton: function ()
	{
		// Create the toggle button only if `toggleDisplay` option is true.
		this._toggleDisplayButton = this.options.toggleDisplay ? this._createButton(
				'', // Empty HTML content for the button.
				this.hideText, // Initial title for the button.
				('leaflet-control-minimap-toggle-display leaflet-control-minimap-toggle-display-' // CSS classes for styling.
				+ this.options.position),
				this._container, // Parent container for the button.
				this._toggleDisplayButtonClicked, // Click handler function.
				this) : undefined; // If toggleDisplay is false, button is undefined.

		// Set the dimensions of the toggle button to match collapsed size.
		this._toggleDisplayButton.style.width  = this.options.collapsedWidth  + 'px';
		this._toggleDisplayButton.style.height = this.options.collapsedHeight + 'px';
	}, /* End of _addToggleButton method */

	// Helper method to create a generic button element.
	_createButton: function (html, title, className, container, fn, context)
	{
		// Create an anchor element.
		var link = L.DomUtil.create('a', className, container);

		// Set its inner HTML, href, and title attribute.
		link.innerHTML = html;
		link.href      = '#';
		link.title     = title;

		// Define a shortcut for L.DomEvent.stopPropagation.
		var stop = L.DomEvent.stopPropagation;

		// Attach various event listeners to the link to prevent propagation
		// and handle the click action.
		L.DomEvent
			.on(link, 'click',    stop)
			.on(link, 'mousedown',stop)
			.on(link, 'dblclick', stop)
			.on(link, 'click',    L.DomEvent.preventDefault) // Prevent default link behavior.
			.on(link, 'click',    fn, context); // Attach the custom click handler.

		// Return the created link element.
		return link;
	}, /* End of _createButton method */

	// Handler for when the toggle display button is clicked.
	_toggleDisplayButtonClicked: function ()
	{
		// Mark that the user has explicitly interacted with the display toggle.
		this._userToggledDisplay = true;

		// If the minimap is currently not minimized, minimize it.
		if (!this._minimized)
		{
			this._minimize();
			this._toggleDisplayButton.title = this.showText; // Update button title.
		}
		// Otherwise, restore it.
		else
		{
			this._restore();
			this._toggleDisplayButton.title = this.hideText; // Update button title.
		}
	}, /* End of _toggleDisplayButtonClicked method */

	// Sets the display state of the minimap (minimized or restored).
	_setDisplay: function (minimize)
	{
		// Only change state if the requested state is different from the current state.
		if (minimize != this._minimized)
		{
			if (!this._minimized)
			{
				this._minimize(); // If currently not minimized, minimize it.
			}
			else
			{
				this._restore();  // If currently minimized, restore it.
			}
		}
	}, /* End of _setDisplay method */

	// Minimizes the minimap.
	_minimize: function ()
	{
		// Apply styles to hide or collapse the minimap.
		if (this.options.toggleDisplay)
		{
			this._container.style.width  = this.options.collapsedWidth  + 'px';
			this._container.style.height = this.options.collapsedHeight + 'px';
			// Add a class to the toggle button to indicate its minimized state.
			this._toggleDisplayButton.className += (' minimized-' + this.options.position);
		}
		else
		{
			this._container.style.display = 'none'; // Simply hide the container if no toggle button.
		}

		// Update the minimized state flag.
		this._minimized = true;
	}, /* End of _minimize method */

	// Restores the minimap to its full size.
	_restore: function ()
	{
		// Apply styles to show or expand the minimap.
		if (this.options.toggleDisplay)
		{
			this._container.style.width  = this.options.width  + 'px';
			this._container.style.height = this.options.height + 'px';
			// Remove the minimized class from the toggle button.
			this._toggleDisplayButton.className = this._toggleDisplayButton.className
					.replace('minimized-'  + this.options.position, '');
		}
		else
		{
			this._container.style.display = 'block'; // Show the container if no toggle button.
		}

		// Update the minimized state flag.
		this._minimized = false;
	}, /* End of _restore method */

	// Event handler for when the main map has finished moving.
	_onMainMapMoved: function (e)
	{
		// Prevent infinite loop: if minimap initiated the move, skip main map update.
		if (!this._miniMapMoving)
		{
			this._mainMapMoving = true; // Indicate main map is moving.
			// Update minimap's view to match main map's center and calculated zoom.
			this._miniMap.setView(this._mainMap.getCenter(), this._decideZoom(true));
			// Decide if the minimap should be minimized based on its new state.
			this._setDisplay(this._decideMinimized());
		}
		else
		{
			this._miniMapMoving = false; // Reset minimap moving flag.
		}

		// Update the aiming rectangle's bounds to reflect the main map's new view.
		this._aimingRect.setBounds(this._mainMap.getBounds());
	}, /* End of _onMainMapMoved method */

	// Event handler for when the main map is currently moving.
	_onMainMapMoving: function (e)
	{
		// Continuously update the aiming rectangle's bounds during main map movement.
		this._aimingRect.setBounds(this._mainMap.getBounds());
	}, /* End of _onMainMapMoving method */

	// Event handler for when the minimap starts moving.
	_onMiniMapMoveStarted:function (e)
	{
		// Store the current position of the aiming rectangle to calculate shadow position later.
		var lastAimingRect = this._aimingRect.getBounds();
		var sw = this._miniMap.latLngToContainerPoint(lastAimingRect.getSouthWest());
		var ne = this._miniMap.latLngToContainerPoint(lastAimingRect.getNorthEast());
		this._lastAimingRectPosition = {sw:sw,ne:ne};
	}, /* End of _onMiniMapMoveStarted method */

	// Event handler for when the minimap is currently moving.
	_onMiniMapMoving: function (e)
	{
		// If the main map didn't initiate this move and we have a stored aiming rect position.
		if (!this._mainMapMoving && this._lastAimingRectPosition)
		{
			// Update the shadow rectangle's bounds to follow the minimap's pan.
			this._shadowRect.setBounds(new L.LatLngBounds(this._miniMap.containerPointToLatLng(this._lastAimingRectPosition.sw),this._miniMap.containerPointToLatLng(this._lastAimingRectPosition.ne)));
			// Make the shadow rectangle visible with some opacity.
			this._shadowRect.setStyle({opacity:1,fillOpacity:0.3});
		}
	}, /* End of _onMiniMapMoving method */

	// Event handler for when the minimap has finished moving.
	_onMiniMapMoved: function (e)
	{
		// Prevent infinite loop: if main map initiated the move, skip minimap update.
		if (!this._mainMapMoving)
		{
			this._miniMapMoving = true; // Indicate minimap is moving.
			// Update main map's view to match minimap's center and calculated zoom.
			this._mainMap.setView(this._miniMap.getCenter(), this._decideZoom(false));
			// Hide the shadow rectangle after the move.
			this._shadowRect.setStyle({opacity:0,fillOpacity:0});
		}
		else
		{
			this._mainMapMoving = false; // Reset main map moving flag.
		}
	}, /* End of _onMiniMapMoved method */

	// Determines the appropriate zoom level for either the minimap or the main map.
	_decideZoom: function (fromMaintoMini)
	{
		// If zoom level is not fixed, calculate it dynamically.
		if (!this.options.zoomLevelFixed)
		{
			if (fromMaintoMini)
			{
				// If updating minimap from main map, apply offset.
				return this._mainMap.getZoom() + this.options.zoomLevelOffset;
			}
			else
			{
				// If updating main map from minimap.
				var currentDiff = this._miniMap.getZoom() - this._mainMap.getZoom();
				var proposedZoom = this._miniMap.getZoom() - this.options.zoomLevelOffset;
				var toRet;

				// Special handling for edge cases where minimap hits its minimum zoom.
				if (currentDiff > this.options.zoomLevelOffset && this._mainMap.getZoom() < this._miniMap.getMinZoom() - this.options.zoomLevelOffset)
				{
					// This means the minimap is zoomed out to its minimum and can't zoom further.
					if (this._miniMap.getZoom() > this._lastMiniMapZoom)
					{
						// If the user is trying to zoom IN using the minimap, zoom the main map in.
						toRet = this._mainMap.getZoom() + 1;
						// To keep visual consistency, zoom the minimap out slightly.
						this._miniMap.setZoom(this._miniMap.getZoom() -1);
					}
					else
					{
						// If user is zooming out past minimap's min zoom or just panning, ignore zoom change.
						toRet = this._mainMap.getZoom();
					}
				}
				else
				{
					// Normal case: apply the calculated proposed zoom.
					toRet = proposedZoom;
				}

				// Store the minimap's current zoom for the next comparison.
				this._lastMiniMapZoom = this._miniMap.getZoom();
				return toRet;
			}
		}
		else
		{
			// If zoom level is fixed, use the fixed level or main map's zoom.
			if (fromMaintoMini)
			{
				return this.options.zoomLevelFixed;
			}
			else
			{
				return this._mainMap.getZoom();
			}
		}
	}, /* End of _decideZoom method */

	// Decides whether the minimap should be in a minimized state.
	_decideMinimized: function ()
	{
		// If the user has explicitly toggled the display, respect that choice.
		if (this._userToggledDisplay)
		{
			return this._minimized;
		}

		// If auto-toggle display is enabled.
		if (this.options.autoToggleDisplay)
		{
			// Minimize if the main map's bounds completely contain the minimap's bounds.
			if (this._mainMap.getBounds().contains(this._miniMap.getBounds()))
			{
				return true;
			}
			return false; // Otherwise, do not minimize.
		}

		// Default: return the current minimized state.
		return this._minimized;
	} /* End of _decideMinimized method */
}); /* End of L.Control.MiniMap extend */

// Merge default options for L.Map to include miniMapControl.
L.Map.mergeOptions(
{
	miniMapControl: false
});

// Add an initialization hook to L.Map to automatically create a minimap control
// if the `miniMapControl` option is true.
L.Map.addInitHook(function ()
{
	if (this.options.miniMapControl)
	{
		// Create and add a new MiniMap control to the map instance.
		this.miniMapControl = (new L.Control.MiniMap()).addTo(this);
	}
});

// Factory function for creating a new L.Control.MiniMap instance.
// This provides a convenient way to instantiate the control.
L.control.minimap = function (layer, options)
{
	return new L.Control.MiniMap(layer, options);
};