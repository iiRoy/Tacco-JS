L.Control.MiniMap = L.Control.extend(
{

  options:
  {

    position: 'bottomright', // Defines the control's placement on the main map.

    toggleDisplay: false,    /* If true, a button will be rendered to allow
                                the user to manually show/hide the minimap. */

    zoomLevelOffset: -5,     // Difference in zoom level between main map and minimap.

    zoomLevelFixed: false,   // Set to true to fix the minimap's zoom level.

    zoomAnimation: false,    // Controls whether zoom animations are enabled on the minimap.

    autoToggleDisplay: false, /* When true, the minimap's visibility might
                                 change automatically based on zoom levels. */

    width: 150,              // The desired width of the minimap container in pixels.

    height: 150,             // The desired height of the minimap container in pixels.

    aimingRectOptions:
    {
      color: "#ff0000",
      weight: 1,
      clickable: false,
      opacity: 1,
      fillOpacity: 0.5
    },

    shadowRectOptions:
    {
      color: "#000000",
      weight: 1,
      clickable: false,
      opacity: 0,
      fillOpacity: 0
    }

  },


  hideText: 'Hide MiniMap', // Text displayed on the toggle button when minimap is visible.


  showText: 'Show MiniMap', // Text displayed on the toggle button when minimap is hidden.


  // The 'layer' parameter represents the Leaflet layer that will be displayed inside the minimap.
  initialize: function ( layer, options )
  {
    L.Util.setOptions(this, options);

    // Explicitly ensure the aiming and shadow rectangles are not clickable.
    // This overrides any user-defined clickable option for these rectangles.
    this.options.aimingRectOptions.clickable = false;
    this.options.shadowRectOptions.clickable = false;

    this._layer = layer;
  },


  onAdd: function ( map )
  {

    // Store a reference to the main Leaflet map instance.
    this._mainMap = map;

    // Create the primary container div for the minimap control.
    // Also, prevent events within this container from propagating to the main map.
    this._container = L.DomUtil.create('div', 'leaflet-control-minimap');

    this._container.style.width = this.options.width + 'px';
    this._container.style.height = this.options.height + 'px';

    // Stop mousewheel events on the minimap container from affecting the main map.
    L.DomEvent.on(this._container, 'mousewheel', L.DomEvent.stopPropagation);


    // Instantiate the actual Leaflet map that will serve as the minimap.
    this._miniMap = new L.Map(this._container,
    {
      attributionControl: false,  // Disable attribution on the minimap.
      zoomControl: false,         // Disable zoom controls on the minimap.
      zoomAnimation: this.options.zoomAnimation, // Apply specified zoom animation setting.
      autoToggleDisplay: this.options.autoToggleDisplay, // Apply specified auto toggle setting.
      touchZoom: !this.options.zoomLevelFixed,       // Touch zoom depends on zoomLevelFixed.
      scrollWheelZoom: !this.options.zoomLevelFixed, // Scroll wheel zoom depends on zoomLevelFixed.
      doubleClickZoom: !this.options.zoomLevelFixed, // Double click zoom depends on zoomLevelFixed.
      boxZoom: !this.options.zoomLevelFixed,         // Box zoom depends on zoomLevelFixed.
      crs: map.options.crs        // Use the same Coordinate Reference System as the main map.
    });


    this._miniMap.addLayer(this._layer); // Add the configured layer to the minimap.

    // These boolean flags prevent an endless loop of maps notifying each other of movement.
    this._mainMapMoving = false;
    this._miniMapMoving = false;

    // This flag tracks if the user has manually toggled the minimap's display state.
    this._userToggledDisplay = false;
    this._minimized = false; // Initial state: minimap is not minimized.

    // If the toggleDisplay option is enabled, add the corresponding button.
    if (this.options.toggleDisplay)
    {
      this._addToggleButton();
    }

    // Execute this block once the minimap is fully initialized and ready.
    this._miniMap.whenReady(L.Util.bind(function ()
    {
      // Create and add the aiming rectangle (shows main map's view).
      this._aimingRect = L.rectangle(this._mainMap.getBounds(), this.options.aimingRectOptions).addTo(this._miniMap);
      // Create and add the shadow rectangle (appears when dragging the minimap).
      this._shadowRect = L.rectangle(this._mainMap.getBounds(), this.options.shadowRectOptions).addTo(this._miniMap);

      // Event listeners for main map movements.
      this._mainMap.on('moveend', this._onMainMapMoved, this);
      this._mainMap.on('move', this._onMainMapMoving, this);

      // Event listeners for minimap interactions.
      this._miniMap.on('movestart', this._onMiniMapMoveStarted, this);
      this._miniMap.on('move', this._onMiniMapMoving, this);
      this._miniMap.on('moveend', this._onMiniMapMoved, this);
      this._miniMap.on( 'click', this._onMiniMapClick, this );
      this._miniMap.on( 'touchend', this._onMiniMapClick, this );

      // Disable click event propagation from the minimap container to elements below.
      L.DomEvent.disableClickPropagation(this._container);
    }, this));

    return this._container; // Return the minimap's DOM container element.
  },


  // Overrides the default L.Control.addTo method to ensure immediate minimap setup.
  addTo: function ( map )
  {
    L.Control.prototype.addTo.call(this, map); // Call the parent class's addTo method.

    // Set the initial view of the minimap based on the main map's center and calculated zoom.
    this._miniMap.setView(this._mainMap.getCenter(), this._decideZoom(true));

    // Determine and apply the initial display state (minimized or restored).
    this._setDisplay(this._decideMinimized());

    return this;
  },


  // This method is invoked when the control is removed from the main map.
  onRemove: function ( map )
  {
    // Remove all registered event listeners to prevent potential memory leaks.
    this._mainMap.off('moveend', this._onMainMapMoved, this);
    this._mainMap.off('move', this._onMainMapMoving, this);
    this._miniMap.off('moveend', this._onMiniMapMoved, this);
    this._miniMap.off( 'click', this._onMiniMapClick, this );
    this._miniMap.off( 'touchend', this._onMiniMapClick, this );

    // Remove the layer that was added to the minimap.
    this._miniMap.removeLayer(this._layer);
  },


  // Creates and adds the toggle display button to the minimap container.
  _addToggleButton: function ()
  {
    this._toggleDisplayButton = this.options.toggleDisplay ?
      this._createButton(
        '',
        this.hideText,
        'leaflet-control-minimap-toggle-display',
        this._container,
        this._toggleDisplayButtonClicked,
        this
      ) :
      undefined;
  },


  // A utility function to create an anchor (<a>) element configured as a button.
  _createButton: function ( html, title, className, container, fn, context )
  {
    var link = L.DomUtil.create('a', className, container);
    link.innerHTML = html;
    link.href = '#';
    link.title = title;

    var stop = L.DomEvent.stopPropagation; // Shorthand for stopping event propagation.

    // Attach various event handlers to the created button link.
    L.DomEvent
      .on(link, 'click', stop)         // Prevent click from propagating.
      .on(link, 'mousedown', stop)     // Prevent mousedown from propagating.
      .on(link, 'dblclick', stop)      // Prevent double click from propagating.
      .on(link, 'click', L.DomEvent.preventDefault) // Prevent default link behavior.
      .on(link, 'click', fn, context); // Attach the custom click handler.

    return link;
  },


  // Event handler for when the minimap's toggle button is clicked.
  _toggleDisplayButtonClicked: function ()
  {
    this._userToggledDisplay = true; // Mark that the user has manually interacted.
    if (!this._minimized)
    {
      this._minimize(); // If not minimized, minimize it.
      this._toggleDisplayButton.title = this.showText; // Update button tooltip.
    }
    else
    {
      this._restore();  // If minimized, restore it.
      this._toggleDisplayButton.title = this.hideText;  // Update button tooltip.
    }
  },


  // Sets the display state of the minimap (minimized or restored).
  _setDisplay: function ( minimize )
  {
    if (minimize != this._minimized)
    {
      if (!this._minimized)
      {
        this._minimize(); // Perform minimization if current state is not minimized.
      }
      else
      {
        this._restore();  // Perform restoration if current state is minimized.
      }
    }
  },


  // Minimizes the minimap control, either shrinking it or hiding it.
  _minimize: function ()
  {
    // Apply styling based on whether toggle display is enabled.
    if (this.options.toggleDisplay)
    {
      this._container.style.width = '19px';     // Shrink container width.
      this._container.style.height = '19px';    // Shrink container height.
      this._toggleDisplayButton.className += ' minimized'; // Add CSS class for minimized state.
    }
    else
    {
      this._container.style.display = 'none';   // Hide the container completely.
    }
    this._minimized = true; // Update the internal state.
  },


  // Restores the minimap control to its original size.
  _restore: function ()
  {
    // Apply styling based on whether toggle display is enabled.
    if (this.options.toggleDisplay)
    {
      this._container.style.width = this.options.width + 'px';   // Restore original width.
      this._container.style.height = this.options.height + 'px'; // Restore original height.
      this._toggleDisplayButton.className = this._toggleDisplayButton.className
        .replace(/(?:^|\s)minimized(?!\S)/g, ''); // Remove 'minimized' CSS class.
    }
    else
    {
      this._container.style.display = 'block'; // Make the container visible again.
    }
    this._minimized = false; // Update the internal state.
  },


  // Decides whether the minimap should be minimized based on auto-toggle and user interaction.
  _decideMinimized: function ()
  {
    if (this._userToggledDisplay)
    {
      return this._minimized; // Respect user's explicit choice.
    }

    if (this.options.autoToggleDisplay)
    {
      // Minimize if main map's zoom is too low relative to minimap's min zoom.
      if (this._mainMap.getZoom() < this.options.zoomLevelOffset + this._miniMap.getMinZoom())
      {
        return true;
      }
      else
      {
        return false;
      }
    }

    return this._minimized; // Default to current minimized state.
  },


  // Event handler for when the main map has finished its movement.
  _onMainMapMoved: function ( e )
  {
    // Only process if the minimap wasn't the initiator of the movement.
    if (!this._miniMapMoving)
    {
      this._mainMapMoving = true; // Set flag to indicate main map initiated move.
      // Update minimap's view to reflect the main map's new center and calculated zoom.
      this._miniMap.setView(this._mainMap.getCenter(), this._decideZoom(true));
      this._setDisplay(this._decideMinimized()); // Adjust display state if needed.
    }
    else
    {
      this._miniMapMoving = false; // Reset the minimap moving flag.
    }
    // Update the aiming rectangle to match the main map's new visible bounds.
    this._aimingRect.setBounds(this._mainMap.getBounds());
  },


  // Event handler for when the main map is actively moving.
  _onMainMapMoving: function ( e )
  {
    // Continuously update the aiming rectangle's position to reflect the main map's movement.
    this._aimingRect.setBounds(this._mainMap.getBounds());
  },


  // Event handler for when the minimap begins a movement.
  _onMiniMapMoveStarted: function ( e )
  {
    // Capture the current bounds of the aiming rectangle.
    var lastAimingRect = this._aimingRect.getBounds();
    // Convert SW and NE corners to container points for later shadow calculation.
    var sw = this._miniMap.latLngToContainerPoint(lastAimingRect.getSouthWest());
    var ne = this._miniMap.latLngToContainerPoint(lastAimingRect.getNorthEast());
    this._lastAimingRectPosition = { sw: sw, ne: ne };
  },


  // Event handler for when the minimap is actively moving.
  _onMiniMapMoving: function ( e )
  {
    // If the main map is not moving and we have a stored aiming rectangle position.
    if (!this._mainMapMoving && this._lastAimingRectPosition)
    {
      // Update the shadow rectangle's bounds to follow the minimap's drag.
      this._shadowRect.setBounds(
        new L.LatLngBounds(
          this._miniMap.containerPointToLatLng(this._lastAimingRectPosition.sw),
          this._miniMap.containerPointToLatLng(this._lastAimingRectPosition.ne)
        )
      );
      this._shadowRect.setStyle({ opacity: 1, fillOpacity: 0.3 }); // Make the shadow visible.
    }
  },


  // Event handler for when the minimap has finished its movement.
  _onMiniMapMoved: function ( e )
  {
    // Only process if the main map wasn't the initiator of the movement.
    if (!this._mainMapMoving)
    {
      this._miniMapMoving = true; // Set flag to indicate minimap initiated move.
      // Update main map's view to reflect the minimap's new center and calculated zoom.
      this._mainMap.setView(this._miniMap.getCenter(), this._decideZoom(false));
      this._shadowRect.setStyle({ opacity: 0, fillOpacity: 0 }); // Hide the shadow rectangle.
    }
    else
    {
      this._mainMapMoving = false; // Reset the main map moving flag.
    }
  },


  // Handles click and touchend events on the minimap.
  _onMiniMapClick: function ( e )
  {
    // Center the main map on the geographical point clicked within the minimap.
    this._mainMap.setView(e.latlng);
  },


  // Determines the appropriate zoom level for either the minimap or the main map.
  // 'fromMaintoMini' is true if calculating minimap zoom, false for main map zoom.
  _decideZoom: function ( fromMaintoMini )
  {
    if (!this.options.zoomLevelFixed)
    {
      if (fromMaintoMini)
      {
        return this._mainMap.getZoom() + this.options.zoomLevelOffset;
      }
      else
      {
        var currentDiff = this._miniMap.getZoom() - this._mainMap.getZoom();
        var proposedZoom = this._miniMap.getZoom() - this.options.zoomLevelOffset;
        var toRet;

        // Special handling when minimap is at its minimum zoom level.
        if (currentDiff > this.options.zoomLevelOffset && this._mainMap.getZoom() < this._miniMap.getMinZoom() - this.options.zoomLevelOffset)
        {
          // If the user is trying to zoom in using the minimap, but it's already at its min zoom.
          if (this._miniMap.getZoom() > this._lastMiniMapZoom)
          {
            toRet = this._mainMap.getZoom() + 1; // Zoom main map in.
            // Adjust minimap's zoom to maintain visual consistency.
            this._miniMap.setZoom(this._miniMap.getZoom() - 1);
          }
          else
          {
            // If user is trying to zoom out past minimap's min zoom, or just panning.
            // In this ambiguous case, we keep the main map's zoom unchanged.
            toRet = this._mainMap.getZoom();
          }
        }
        else
        {
          // This is the standard scenario where the proposed zoom is applied.
          toRet = proposedZoom;
        }
        this._lastMiniMapZoom = this._miniMap.getZoom(); // Store current minimap zoom for next comparison.
        return toRet;
      }
    }
    else
    {
      // If zoom level is fixed.
      if (fromMaintoMini)
      {
        return this.options.zoomLevelFixed; // Return the explicitly fixed zoom level for minimap.
      }
      else
      {
        return this._mainMap.getZoom(); // Main map's zoom remains unchanged.
      }
    }
  }

});