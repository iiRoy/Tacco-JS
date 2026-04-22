/*
 * This is an Indoor layer implementation for Leaflet.
 * It handles displaying GeoJSON data, specifically managing features across different 'levels' within a building.
 *
 * The addData method expects a GeoJSON feature collection where each feature includes a 'level' property.
 * This property specifies on which indoor level the feature should be displayed.
 *
 * The getLevels method allows retrieval of all unique levels currently present in the layer.
 */
L.Indoor = L.Class.extend( {

  options:
    {
      // Default configuration for the L.Indoor layer.
      // The 'getLevel' function specifies how to extract the level information from a GeoJSON feature.
      // By default, it looks for a 'level' attribute within the feature's properties.
      // Users can override this function in the options if their data structure differs.
      getLevel: function ( feature )
      {
        return feature.properties.level;
      }
    },

  initialize: function ( data, options )
  {
    // Sets the options for this instance, merging defaults with user-provided ones.
    L.setOptions( this, options );
    // Update the local options reference to reflect the merged options.
    options = this.options;

    // Initialize an object to store layers for each level.
    var layers = this._layers = { };
    // The map instance this layer is added to, initially null.
    this._map = null;

    // Check if a specific initial level is provided in the options.
    if ( "level" in this.options )
    {
      this._level = this.options.level;
    }
    else
    {
      this._level = null;
    }
    // A placeholder for the original onEachFeature function if it exists.
    var onEachFeature;
    if ( "onEachFeature" in this.options ) {
      onEachFeature = this.options.onEachFeature;
    }

    // Overrides the onEachFeature option to handle indoor-specific logic.
    this.options.onEachFeature = function ( feature, layer )
    {
      // If an original onEachFeature function was provided, call it first.
      if ( onEachFeature ) {
        onEachFeature( feature, layer );
      }

      // If a custom marker creation function is provided.
      if ( "markerForFeature" in options )
      {
        var marker = options.markerForFeature( feature );
        if ( typeof ( marker ) !== 'undefined' )
        {
          // Attach a click event listener to the marker.
          marker.on( 'click', function ( e )
          {
            layer.fire( 'click', e );
          } );

          // Determine the level of the current feature.
          var level = options.getLevel( feature );

          if ( typeof ( level ) === 'undefined' )
          {
            console.warn( "level undefined for" );
            console.log( feature );
          }
          else
          {
            // Helper function to add the marker to a specific level's layer.
            function addToLevel ( level )
            {
              layers[ level ].addLayer( marker );
            }

            // Handle features that might span multiple levels.
            if ( L.Util.isArray( level ) )
            {
              level.forEach( addToLevel );
            }
            else
            {
              addToLevel( level );
            }
          }
        }
      }
    };

    // Add the initial data provided during initialization.
    this.addData( data );
  },

  addTo: function ( map )
  {
    // Adds this indoor layer to the provided Leaflet map instance.
    map.addLayer( this );
    return this;
  },

  onAdd: function ( map )
  {
    // Stores a reference to the map when the layer is added.
    this._map = map;

    // If no initial level was set, try to default to the first available level.
    if ( this._level === null )
    {
      var levels = this.getLevels( );

      // If there are any levels, set the current level to the first one.
      if ( levels.length !== 0 )
      {
        this._level = levels[ 0 ];
      }
    }

    // If a level is now set, add its corresponding sub-layer to the map.
    if ( this._level !== null )
    {
      if ( this._level in this._layers )
      {
        this._map.addLayer( this._layers[ this._level ] );
      }
      else
      {
        /*
         * TODO: Implement a warning mechanism here if the selected level
         * does not have any data associated with it.
         */
      }
    }
  },

  onRemove: function ( map )
  {
    // When the layer is removed from the map, ensure the current level's sub-layer is also removed.
    if ( this._level in this._layers )
    {
      this._map.removeLayer( this._layers[ this._level ] );
    }

    // Clear the map reference.
    this._map = null;
  },

  addData: function ( data )
  {
    // Reference to the internal layers object and options.
    var layers = this._layers,
      options = this.options,
      // Determine if 'data' is an array of features or a GeoJSON FeatureCollection.
      features = L.Util.isArray( data ) ? data : data.features;

    features.forEach( function ( part )
    {
      // Extract the level for the current feature.
      var level = options.getLevel( part );

      var layer; // Declare layer variable here.

      // If the level is undefined or null, skip this feature and potentially warn.
      if ( typeof level === 'undefined' || level === null )
      {
        /*
         * TODO: Add a console warning or other notification for features
         * without a valid level property.
         */
        return;
      }

      // Ensure the feature has geometry, as expected by GeoJSON.
      if ( !( "geometry" in part ) )
      {
        /*
         * TODO: Re-evaluate if this check is still necessary or if it should
         * trigger a warning/error.
         */
        return;
      }

      // Check if the feature is associated with multiple levels.
      if ( L.Util.isArray( level ) )
      {
        level.forEach( function ( level )
        {
          // If a layer for this specific level already exists, use it.
          if ( level in layers )
          {
            layer = layers[ level ];
          }
          else
          {
            // Otherwise, create a new L.geoJson layer for this level.
            layer = layers[ level ] = L.geoJson( {
              type: "FeatureCollection",
              features: [ ]
            }, options );
          }
          // Add the current feature part to the appropriate level's layer.
          layer.addData( part );
        } );
      }
      else
      {
        // Feature is on a single level.
        if ( level in layers )
        {
          layer = layers[ level ];
        }
        else
        {
          layer = layers[ level ] = L.geoJson( {
            type: "FeatureCollection",
            features: [ ]
          }, options );
        }
        // Add the current feature part to the appropriate level's layer.
        layer.addData( part );
      }
    } );
  },

  getLevels: function ( )
  {
    // Returns an array of all unique level identifiers currently present in the layer.
    return Object.keys( this._layers );
  },

  getLevel: function ( )
  {
    // Returns the currently active level.
    return this._level;
  },

  setLevel: function ( level )
  {
    // If 'level' is an object (e.g., from an event), extract the 'newLevel' property.
    if ( typeof ( level ) === 'object' )
    {
      level = level.newLevel;
    }

    // If the requested level is already the current level, do nothing.
    if ( this._level === level ) {
      return;
    }

    // Get references to the old and new sub-layers.
    var oldLayer = this._layers[ this._level ];
    var layer = this._layers[ level ];

    // If the layer is currently on a map.
    if ( this._map !== null )
    {
      // If the old layer is currently displayed, remove it from the map.
      if ( this._map.hasLayer( oldLayer ) )
      {
        this._map.removeLayer( oldLayer );
      }

      // If the new layer exists, add it to the map to display.
      if ( layer )
      {
        this._map.addLayer( layer );
      }
    }

    // Update the internal reference to the current active level.
    this._level = level;
  },

  resetStyle: function ( layer )
  {
    // Resets the style of a given sub-layer to its default options.
    layer.options = layer.defaultOptions;
    // Applies the global style defined in the indoor layer's options.
    this._setLayerStyle( layer, this.options.style );
    return this;
  },

  _setLayerStyle: function ( layer, style )
  {
    // If the style is a function, execute it with the feature to get the actual style object.
    if ( typeof style === 'function' )
    {
      style = style( layer.feature );
    }
    // If the layer has a setStyle method (e.g., GeoJSON layer), apply the style.
    if ( layer.setStyle )
    {
      layer.setStyle( style );
    }
  }
} ); // End of L.Indoor.extend({}) definition.

/*
 * Factory function for creating new L.Indoor instances.
 * Provides a convenient way to instantiate the indoor layer without using 'new'.
 */
L.indoor = function ( data, options )
{
  return new L.Indoor( data, options );
};

L.Control.Level = L.Control.extend( {
  includes: L.Mixin.Events, // Incorporates Leaflet's event system.

  options:
    {
      position: 'bottomright', // Default position for the control on the map.

      // Function to parse level strings into integers for sorting and comparison.
      // By default, uses parseInt with base 10.
      parseLevel: function ( level )
      {
        return parseInt( level, 10 );
      }
    },

  initialize: function ( options )
  {
    // Apply user-defined options, merging them with defaults.
    L.setOptions( this, options );

    this._map = null; // Reference to the map instance.
    this._buttons = { }; // Stores references to the level control buttons.
    this._listeners = [ ]; // Array to hold event listeners (though L.Mixin.Events handles most).
    this._level = options.level; // The initially selected level.

    // Register an event listener for level changes to update button states.
    this.addEventListener( "levelchange", this._levelChange, this );
  },

  onAdd: function ( map )
  {
    // Create the main container div for the control buttons.
    var div = L.DomUtil.create( 'div', 'leaflet-bar leaflet-control' );

    // Apply basic styling to the control's text.
    div.style.font = "18px 'Lucida Console',Monaco,monospace";

    // Cache references for easier access within the loop and closure.
    var buttons = this._buttons;
    var activeLevel = this._level;
    var self = this; // Preserve 'this' context for event handlers.

    var levels = [ ]; // Array to hold level data with parsed numbers and original labels.

    // Iterate through the provided levels to prepare them for sorting.
    for ( var i = 0; i < this.options.levels.length; i++ )
    {
      var level = this.options.levels[ i ];

      // Parse the level string into a numeric value for sorting.
      var levelNum = self.options.parseLevel( level );

      levels.push( {
        num: levelNum,
        label: level
      } );
    }

    // Sort levels numerically in ascending order.
    levels.sort( function ( a, b )
    {
      return a.num - b.num;
    } );

    // Create buttons for each level, adding them in reverse sorted order (highest level at top).
    for ( i = levels.length - 1; i >= 0; i-- )
    {
      var level = levels[ i ].num; // Numeric representation of the level.
      var originalLevel = levels[ i ].label; // Original string label of the level.

      // Create an anchor element for the level button.
      var levelBtn = L.DomUtil.create( 'a', 'leaflet-button-part', div );

      // Highlight the button corresponding to the currently active level.
      if ( level === activeLevel || originalLevel === activeLevel )
      {
        levelBtn.style.backgroundColor = "#b0b0b0";
      }

      // Set the button's text to the original level label.
      levelBtn.appendChild( levelBtn.ownerDocument.createTextNode( originalLevel ) );

      // Use a closure to capture the 'level' variable for the click handler.
      ( function ( level )
      {
        levelBtn.onclick = function ( )
        {
          self.setLevel( level ); // Call setLevel when the button is clicked.
        };
      } )( level );

      // Store a reference to the button using its numeric level as the key.
      buttons[ level ] = levelBtn;
    }

    return div; // Return the created control container.
  },

  _levelChange: function ( e )
  {
    // Update button styles when the level changes.
    if ( this._map !== null )
    {
      // If there was a previous level, reset its button's background color.
      if ( typeof e.oldLevel !== "undefined" ) {
        this._buttons[ e.oldLevel ].style.backgroundColor = "#FFFFFF";
      }
      // Highlight the button for the new active level.
      this._buttons[ e.newLevel ].style.backgroundColor = "#b0b0b0";
    }
  },

  setLevel: function ( level )
  {
    // If the requested level is already the current level, do nothing.
    if ( level === this._level ) {
      return;
    }

    // Store the old level before updating.
    var oldLevel = this._level;
    this._level = level; // Set the new current level.

    // Fire a 'levelchange' event to notify listeners (like the Indoor layer).
    this.fireEvent( "levelchange", {
      oldLevel: oldLevel,
      newLevel: level
    } );
  },

  getLevel: function ( )
  {
    // Returns the currently active level managed by this control.
    return this._level;
  }
} ); // End of L.Control.Level.extend({}) definition.

/*
 * Factory function for creating new L.Control.Level instances.
 * This provides a shorthand for initializing the level control.
 */
L.Control.level = function ( options )
{
  return new L.Control.Level( options );
};