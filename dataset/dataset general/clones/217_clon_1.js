var _includeScript = function ( u , onl ) { // Function to dynamically include external JavaScript files
  // Create a new script element for the document.
  var s = document.createElement( "SCR" + "IPT" );

  // Set the source URL of the script.
  s.src = u ;

  // Assign the onload event handler.
  s.onload = onl ;

  // Append the script element to the HEAD section of the document.
  document.getElementsByTagName( "HEAD" ) [ 0 ] . appendChild( s ) ;
}

;
// This immediately invoked function expression (IIFE) wraps the plugin's code
// to prevent global scope pollution and ensure jQuery is passed as '$'.
( function ( $ ) {

  // Cache the window object for performance.
  var $window = $( window ) ;

  // Log a message to the console indicating the plugin is enabled.
  console.log( "GEO5 ENABLED!" ) ;

  // Define the 'geomap' jQuery plugin.
  // This is the entry point for interacting with the map functionality.
  $.fn.geomap = function ( method ) {
    // Check if the geomap instance already exists on the first element
    // and if the specified method exists on that instance.
    if ( this[0] . geomap && this[0] . geomap [ method ] ) {
      // If it exists, call the method on the existing instance.
      return this[0] . geomap [ method ] . apply( this[0] . geomap , Array.prototype.slice.call( arguments , 1 ) ) ;
    } // Check if the method exists in the global 'methods' object.
    else if ( methods[ method ] ) {
      // If it exists, call the method on the current jQuery selection.
      return methods[ method ] . apply( this , Array.prototype.slice.call( arguments , 1 ) ) ;
    } // If no method is specified or 'method' is an object (options for init).
    else if ( typeof method === 'object' || ! method ) {
      // Call the 'init' method with the provided arguments.
      return methods.init.apply( this , arguments ) ;
    } // If the method does not exist.
    else {
      // Throw an error indicating the method is not found.
      $.error( 'Method ' + method + ' does not exist on GEO5 geomap' ) ;
    }
  }

  // Private methods object for the geomap plugin.
  var methods = {
    // The 'destroy' method cleans up map-related elements and data.
    destroy : function ( ) {
      return this.each( function ( ) {
        var el = $( this ) ; // Get the current element as a jQuery object.
        var data = el.data( "geo5map" ) ; // Retrieve stored data.

        // TODO: clear any existing timeouts associated with this map instance.
        // unbind all events namespaced with .geo5map to prevent memory leaks.
        el.unbind( ".geo5map" ) ;
        // remove the main css class, reverting element styling.
        el.removeClass( "geo5map" ) ;
      } ) ;
    } ,

    // The 'init' method initializes the geomap plugin on selected elements.
    init : function ( options ) {
      // Merge default options with user-provided options.
      var opts = $.extend( { } , $.fn.geomap.defaults , options ) ;

      // Parse the geographic center coordinates from a string to an array.
      opts.geoCentre = opts.geoCentre.split( "," ) ;

      // Convert string coordinates to floating-point numbers.
      for ( var x = 0 ; x < opts.geoCentre.length ; x++ ) {
        opts.geoCentre[ x ] = parseFloat( opts.geoCentre[ x ] ) ;
      }

      // Iterate over each selected element to initialize the map.
      return this.each( function ( ) {

        var me = $( this ) ; // Current element as jQuery object.
        var myself = this ; // Current DOM element.
        var mapID = me.attr( "id" ) ; // Get the ID of the map container.

        // Store configuration and map ID in the element's data.
        var data = {
          opts : opts ,
          mapID : mapID
        } ;

        me.data( "geo5map" , data ) ; // Attach data to the element.
        var isSpecified = true ; // Flag to track if a basemap is explicitly specified.
        var layers = [ ] ; // Array to hold initial map layers.

        // Handle basemap creation.
        if ( opts.geoBasemap == "None" ) {
          isSpecified = false ; // No basemap specified in options.
        } else {
          // Create the initial basemap layer using L.tileLayer.provider.
          var basemap = L.tileLayer.provider( opts.geoBasemap ) ;
          var basemaps = { } ; // Object to store named basemaps.
          // Add the initial basemap to the basemaps object.
          basemaps[ opts.geoBasemap.replace( "." , " - " ) ] = basemap ;
          layers.push( basemap ) ; // Add to the layers array for initial map load.
        }

        // Find and add any additional basemaps defined via data attributes.
        $( "[data-geo-type='basemap'][data-geo-map='" + mapID + "']" ).each( function ( ) {
          var $b = $( this ) ; // Current basemap element.
          var dat = $b.data( ) ; // Data attributes for this basemap.
          var lyr = L.tileLayer.provider( dat.geoBasemap ) ; // Create the basemap layer.
          basemaps[ dat.geoBasemap.replace( "." , " - " ) ] = lyr ; // Add to the basemaps object.
          if ( ! isSpecified ) {
            layers.push( lyr ) ; // If no basemap was initially specified, add this one.
          }
        } ) ;

        // Initialize an object to hold overlay layers (currently unused in this block).
        var overlays = { } ;

        // Find and add any tile layers defined via data attributes.
        $( "[data-geo-type='tileLayer'][data-geo-map='" + mapID + "']" ).each( function ( ) {
          var $layer = $( this ) ; // Current tile layer element.
          var dat = $layer.data( ) ; // Data attributes for this tile layer.
          // Initialize the tileLayer plugin on the element and get the Leaflet layer.
          var lyr = $layer.tileLayer( dat ) [ 0 ] . geolayer ;
          layers.push( lyr ) ; // Add the Leaflet layer to the initial map layers.
        } ) ;

        // Create the Leaflet map instance.
        var map = L.map( this , {
          center : new L.LatLng( opts.geoCentre[0] , opts.geoCentre[1] ) , // Set initial map center.
          zoom : opts.geoZoom , // Set initial zoom level.
          layers : layers // Add the collected layers to the map.
        } ) ;

        // Event handler for when the map is added.
        map.onAdd = function ( ll ) {
          console.log( "MAP ONADD" , ll ) ;
        }

        myself.geomap = map ; // Store the Leaflet map instance on the DOM element.

        // Find and bind any UI elements associated with this map.
        $( "[data-geo-binding='" + mapID + "']" ).each( function ( ) {
          // Create a ViewModel for the Map instance.
          var m = myself.geomap ;
          myself.mapView = new MapViewModel( m ) ;
          // Apply Knockout.js bindings to the UI elements.
          ko.applyBindings( myself.mapView , this ) ;
        } ) ;

        // Find and bind any UI elements associated with this map's TileLayers.
        $( "[data-geo-type='tileLayer'][data-geo-map='" + mapID + "']" ).each( function ( ) {
          // The current layer's DOM element.
          var layerSelf = this ;
          var $layer = $( this ) ; // jQuery wrapper for the layer element.

          // Find specific UI elements bound to this layer's ID.
          $( "[data-geo-binding='" + $layer.attr( "id" ) + "']" ).each( function ( ) {
            // Bind the UI elements to a new TileLayerViewModel if not already created.
            if ( ! layerSelf.layerView ) {
              layerSelf.layerView = new TileLayerViewModel( layerSelf.geolayer , layerSelf ) ;
            }
            ko.applyBindings( layerSelf.layerView , this ) ;
          } ) ;
        } ) ;

        // Create all the featureLayers. Feature layers add themselves to the map
        // due to their delayed data loading mechanism.
        $( "[data-geo-type='featureLayer'][data-geo-map='" + mapID + "']" ).each( function ( ) {
          var $layer = $( this ) ; // Current feature layer element.
          var dat = $layer.data( ) ; // Data attributes for this feature layer.
          $layer.featureLayer( dat ) ; // Initialize the featureLayer plugin.
        } ) ;
      } ) ;
    }
  } ; // End of 'methods' object.

  // Default options for the geomap plugin.
  $.fn.geomap.defaults = {
    method : "" , // Default method, usually not used directly.
    geoCentre : "51.505, -0.09" , // Default map center coordinates.
    geoZoom : 13 , // Default zoom level.
    geoBasemap : "Esri.WorldGrayCanvas" , // Default basemap provider.
    showLayers : true // Whether to show layers by default.
  } ;

  /**
   * TileLayerViewModel constructor.
   * Manages the state and interactions for a single tile layer.
   * @param {L.Layer} layer - The Leaflet tile layer object.
   * @param {HTMLElement} config - The DOM element configuring this layer.
   */
  function TileLayerViewModel ( layer , config ) {
    var self = this ; // Reference to the ViewModel instance.
    self._layer = layer ; // Store the Leaflet layer instance.
    self._config = config ; // Store the configuration DOM element.
    // Get ID from config or Leaflet's internal ID.
    self.id = $( config ) . attr( "id" ) || layer._leaflet_id ;
    // Get title from data attribute or use ID.
    self.title = $( config ) . data( "geoLayerTitle" ) || self.id ;
    self.features = ko.observableArray( ) ; // Observable array for features (not typically used for tile layers).

    self._visible = ko.observable( true ) ; // Internal observable for visibility state.

    // Computed observable for layer visibility, handling opacity changes.
    this.visible = ko.computed( {
      read : function ( ) {
        return self._visible( ) ; // Return current visibility state.
      } ,
      write : function ( value ) {
        if ( ! value ) {
          self._layer.setOpacity( 0 ) ; // Hide layer by setting opacity to 0.
        } else {
          self._layer.setOpacity( 1.0 ) ; // Show layer by setting opacity to 1.
        }
        self._visible( value ) ; // Update internal visibility observable.
      } ,
      owner : this // Ensure 'this' context is correct for computed.
    } ) ;

  }

  /**
   * FeatureLayerViewModel constructor.
   * Manages the state and interactions for a single feature layer (e.g., GeoJSON).
   * @param {L.Layer} layer - The Leaflet feature layer object.
   * @param {HTMLElement} config - The DOM element configuring this layer.
   */
  function FeatureLayerViewModel ( layer , config ) {
    var self = this ; // Reference to the ViewModel instance.
    self._layer = layer ; // Store the Leaflet feature layer instance.
    self._config = config ; // Store the configuration DOM element.
    // Get ID from config or Leaflet's internal ID.
    self.id = $( self._config ) . attr( "id" ) || self._layer._leaflet_id ;
    // Get title from data attribute or use ID.
    self.title = $( self._config ) . data( "geoLayerTitle" ) || self.id ;
    self.features = ko.observableArray( ) ; // Observable array for individual features within this layer.
    self.selection = ko.observableArray( ) ; // Observable array for selected features.

    var feats = self._layer.getLayers( ) ; // Get all features (layers) from the Leaflet layer.

    // Iterate over features and create FeatureViewModel for each.
    feats.forEach( function ( f ) {
      try {
        self.features.push( new FeatureViewModel( f , self._layer ) ) ;
      } catch ( errrr ) {
        console.log( "errrrrrrrrrp" , f , errrr ) ; // Log any errors during feature ViewModel creation.
      }
    } ) ;

    // Internal observable for layer visibility, initialized based on if it's on the map.
    self._visible = ko.observable( self._layer._map.hasLayer( layer ) ) ;

    // Computed observable for layer visibility, handling adding/removing from map.
    this.visible = ko.computed( {
      read : function ( ) {
        return self._visible( ) ; // Return current visibility state.
      } ,
      write : function ( value ) {
        // If the layer is currently visible, remove it from the map.
        if ( self._visible( ) ) {
          self._layer._map.removeLayer( self._layer ) ;
        } else {
          // Otherwise, add it to the map.
          self._layer._map.addLayer( self._layer ) ;
        }
        // Update internal visibility observable based on actual map state.
        self._visible( self._layer._map.hasLayer( self._layer ) ) ;
      } ,
      owner : this // Ensure 'this' context is correct for computed.
    } ) ;
  }

  /**
   * FeatureViewModel constructor.
   * Represents a single feature within a feature layer.
   * @param {L.Layer} f - The Leaflet layer object for the individual feature (e.g., L.Marker).
   * @param {L.Layer} layer - The parent Leaflet feature layer.
   */
  function FeatureViewModel ( f , layer ) {
    var self = this ; // Reference to the ViewModel instance.
    self._f = f ; // Store the Leaflet feature object.
    self._feature = f.feature ; // Store the raw GeoJSON feature object.
    self._layer = layer ; // Store the parent Leaflet layer.
    self._icon = self._f._icon || null ; // Store the icon element if it exists (for markers).

    // Determine the icon properties for display.
    if ( self._icon ) {
      self.icon = {
        src : self._icon.src , // Source URL of the icon image.
        html : self._icon.outerHTML // Full HTML of the icon element.
      }
    } else {
      self.icon = {
        src : "http://maps.google.com/mapfiles/ms/icons/blue-dot.png" , // Default icon.
        html : "" // No custom HTML for default.
      }
    }

    self.geometry = self._feature.geometry ; // The GeoJSON geometry object.
    var props = { } ; // Object to hold observable properties.

    // Convert feature properties to Knockout observables.
    for ( var p in self._feature.properties ) {
      if ( typeof ( self._feature.properties[p] ) !== "function" ) {
        props[p] = ko.observable( self._feature.properties[p] ) ;
      }
    }
    self.properties = props ; // The observable properties of the feature.
    self.selected = ko.observable( false ) ; // Observable for selection state.

    // Function to open the feature's popup.
    self.openPopup = function ( ) {
      self._f.openPopup( ) ;
    }

    // Function to close the feature's popup.
    self.closePopup = function ( ) {
      self._f.closePopup( ) ;
    }
  }

  /**
   * MapViewModel constructor.
   * Manages the state and interactions for the main map instance.
   * @param {L.Map} map - The Leaflet map object.
   */
  function MapViewModel ( map ) {
    var self = this ; // Reference to the ViewModel instance.
    self.map = map ; // Store the Leaflet map instance.
    // Observable for the map's current zoom level.
    self._zoom = ko.observable( self.map.getZoom( ) ) ;
    // Observables for the map's current center coordinates.
    self._centre = {
      lat : ko.observable( self.map.getCenter( ) . lat ) ,
      lng : ko.observable( self.map.getCenter( ) . lng )
    }
    // Observables for the current mouse coordinates on the map.
    self._mouse = {
      lat : ko.observable( 0.00 ) ,
      lng : ko.observable( 0.00 )
    }

    // Event listener for map zoom changes.
    map.on( "zoomend" , function ( evt ) {
      self._zoom( evt.target.getZoom( ) ) ; // Update the zoom observable.
    } ) ;

    // Computed observable for the map's zoom level, allowing two-way binding.
    this.zoom = ko.computed( {
      read : function ( ) {
        return self._zoom( ) ; // Return current zoom level.
      } ,
      write : function ( value ) {
        self.map.setZoom( value ) ; // Set map zoom.
        self._zoom( value ) ; // Update internal observable.
      } ,
      owner : this // Ensure 'this' context is correct for computed.
    } ) ;

    // Event listeners for map center changes (zoomend and moveend).
    map.on( "zoomend" , function ( evt ) {
      self._centre.lat( evt.target.getCenter( ) . lat ) ;
      self._centre.lng( evt.target.getCenter( ) . lng ) ;
    } ) ;
    map.on( "moveend" , function ( evt ) {
      self._centre.lat( evt.target.getCenter( ) . lat ) ;
      self._centre.lng( evt.target.getCenter( ) . lng ) ;
    } ) ;

    // Computed observable for the map's center coordinates, allowing two-way binding.
    this.centre = ko.computed( {
      read : function ( ) {
        return {
          lat : self._centre.lat( ) ,
          lng : self._centre.lng( )
        } ;
      } ,
      write : function ( value ) {
        // Handle different input formats for setting the center.
        if ( value.lat && value.lng ) {
          self.map.setView( new L.LatLng( value.lat , value.lng ) , self.map.getZoom( ) ) ;
        } else if ( value.length && value.length == 2 ) {
          self.map.setView( new L.LatLng( value[0] , value[1] ) ) ;
        }
      } ,
      owner : this // Ensure 'this' context is correct for computed.
    } ) ;

    // Event listener for mouse movement on the map.
    map.on( "mousemove" , function ( evt ) {
      self._mouse.lat( evt.latlng.lat ) ; // Update mouse latitude.
      self._mouse.lng( evt.latlng.lng ) ; // Update mouse longitude.
    } ) ;

    // Computed observable for the current mouse location.
    this.mouseLocation = ko.computed( {
      read : function ( ) {
        return {
          lat : self._mouse.lat( ) ,
          lng : self._mouse.lng( )
        } ;
      } ,
      owner : this // Ensure 'this' context is correct for computed.
    } ) ;
  }

  // Define the 'tileLayer' jQuery plugin.
  // This is for creating and managing individual tile layers.
  $.fn.tileLayer = function ( method ) {
    // Check if a Leaflet layer instance exists on the first element
    // and if the specified method exists on that instance.
    if ( this[0] . geolayer && this[0] . geolayer [ method ] ) {
      // If it exists, call the method on the existing instance.
      return this[0] . geolayer [ method ] . apply( this[0] . geolayer , Array.prototype.slice.call( arguments , 1 ) ) ;
    } // Check if the method exists in the 'tilemethods' object.
    else if ( tilemethods[ method ] ) {
      // If it exists, call the method on the current jQuery selection.
      return tilemethods[ method ] . apply( this , Array.prototype.slice.call( arguments , 1 ) ) ;
    } // If no method is specified or 'method' is an object (options for init).
    else if ( typeof method === 'object' || ! method ) {
      // Call the 'init' method with the provided arguments.
      return tilemethods.init.apply( this , arguments ) ;
    } // If the method does not exist.
    else {
      // Throw an error.
      $.error( 'Method ' + method + ' does not exist on GEO5 tileLayer' ) ;
    }
  }

  // Private methods object for the tileLayer plugin.
  var tilemethods = {
    // The 'destroy' method cleans up tile layer-related elements and data.
    destroy : function ( ) {
      return this.each( function ( ) {
        var el = $( this ) ; // Get the current element as a jQuery object.
        var data = el.data( "geo5tileLayer" ) ; // Retrieve stored data.

        // unbind all events namespaced with .geo5tileLayer.
        el.unbind( ".geo5tileLayer" ) ;

        // remove the main css class.
        el.removeClass( "geo5tileLayer" ) ;

      } ) ;

    } ,

    // The 'init' method initializes the tileLayer plugin.
    init : function ( options ) {
      // Merge default options with user-provided options.
      var opts = $.extend( { } , $.fn.tileLayer.defaults , options ) ;

      // Iterate over each selected element to initialize the tile layer.
      return this.each( function ( ) {

        var me = $( this ) ; // Current element as jQuery object.
        // Prevent re-initialization if the class is already present.
        if ( ! me.hasClass( "geo5tileLayer" ) ) {
          var layerID = me.attr( "id" ) ; // Get the ID of the layer container.

          me.addClass( "geo5tileLayer" ) ; // Add the plugin-specific class.
          var data = {
            opts : opts ,
            layerID : layerID
          } ;

          me.data( "geo5tileLayer" , data ) ; // Attach data to the element.

          // Create the appropriate Leaflet tile layer based on 'geoLayerType'.
          if ( opts.geoLayerType == "ArcGIS" ) {
            // For ArcGIS tile services.
            this.geolayer = L.tileLayer( opts.geoLayerUrl + "/tile/{z}/{y}/{x}" ) ;
            // Example URL: http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}
          } else if ( opts.geoLayerType == "TMS" ) {
            // For TMS (Tile Map Service) layers.
            this.geolayer = L.tileLayer( opts.geoLayerUrl ) ;
          } else if ( opts.geoLayerType == "WMS" ) {
            // For WMS (Web Map Service) layers.
            var lyr = {
              layers : opts.wmsLayers || '*' , // WMS layers to request.
              format : opts.wmsFormat || 'image/png' , // Image format.
              transparent : opts.wmsTransparent || true // Transparency setting.
            } ;
            this.geolayer = L.tileLayer.wms( opts.geoLayerUrl , lyr ) ;
          } else {
            // For other tile layer providers (e.g., from Leaflet-providers).
            this.geolayer = L.tileLayer.provider( opts.geoLayerType ) ;
          }
        }
      } ) ;
    }

  } ; // End of 'tilemethods' object.

  // Default options for the tileLayer plugin.
  $.fn.tileLayer.defaults = {
    method : "" , // Default method.
    geoLayerType : "Esri.WorldGrayCanvas" // Default tile layer type.
  } ;

  // Define the 'featureLayer' jQuery plugin.
  // This is for creating and managing individual feature layers (e.g., GeoJSON).
  $.fn.featureLayer = function ( method ) {
    // Check if a Leaflet layer instance exists on the first element
    // and if the specified method exists on that instance.
    if ( this[0] . geolayer && this[0] . geolayer [ method ] ) {
      // If it exists, call the method on the existing instance.
      return this[0] . geolayer [ method ] . apply( this[0] . geolayer , Array.prototype.slice.call( arguments , 1 ) ) ;
    } // Check if the method exists in the 'featureLayermethods' object.
    else if ( featureLayermethods[ method ] ) {
      // If it exists, call the method on the current jQuery selection.
      return featureLayermethods[ method ] . apply( this , Array.prototype.slice.call( arguments , 1 ) ) ;
    } // If no method is specified or 'method' is an object (options for init).
    else if ( typeof method === 'object' || ! method ) {
      // Call the 'init' method with the provided arguments.
      return featureLayermethods.init.apply( this , arguments ) ;
    } // If the method does not exist.
    else {
      // Throw an error.
      $.error( 'Method ' + method + ' does not exist on GEO5 featureLayer' ) ;
    }
  }

  // Private methods object for the featureLayer plugin.
  var featureLayermethods = {
    // The 'destroy' method cleans up feature layer-related elements and data.
    destroy : function ( ) {
      return this.each( function ( ) {
        var el = $( this ) ; // Current element as jQuery object.
        var data = el.data( "geo5featureLayer" ) ; // Retrieve stored data.

        // unbind all events namespaced with .geo5featureLayer.
        el.unbind( ".geo5featureLayer" ) ;

        // remove the main css class.
        el.removeClass( "geo5featureLayer" ) ;

      } ) ;

    } ,

    // The 'init' method initializes the featureLayer plugin.
    init : function ( options ) {
      // Merge default options with user-provided options.
      var opts = $.extend( { } , $.fn.featureLayer.defaults , options ) ;

      // Iterate over each selected element to initialize the feature layer.
      return this.each( function ( ) {

        var me = $( this ) ; // Current element as jQuery object.
        var self = this ; // Current DOM element.

        // Prevent re-initialization.
        if ( ! me.hasClass( "geo5featureLayer" ) ) {
          var layerID = me.attr( "id" ) ; // Get the ID of the layer container.

          me.addClass( "geo5featureLayer" ) ; // Add the plugin-specific class.
          var data = {
            opts : opts ,
            layerID : layerID
          } ;

          me.data( "geo5featureLayer" , data ) ; // Attach data to the element.

          // Check if an infotemplate has been specified for this layer.
          if ( ! me.data( "layerPopupTemplate" ) ) {
            // Get Popup Templates defined via data attributes.
            var tmpl = $( "[data-geo-type='layerPopup'][data-geo-layer='" + data.layerID + "']" ) ;
            var _geo5_popup = null ;
            if ( tmpl.length > 0 ) {
              // If template is a script, evaluate it as a function.
              if ( $( tmpl[0] ) . data( "contentType" ) && $( tmpl[0] ) . data( "contentType" ) . toLowerCase( ) == "script" ) {
                try {
                  _geo5_popup = eval( "_geo5_popup=function(properties){" + $( tmpl[0] ) . html( ) . trim( ) + "\n}" ) ; // Parse script.
                  if ( _geo5_popup != null && typeof ( _geo5_popup ) == "function" ) {
                    opts.layerPopupTemplate = _geo5_popup ; // Assign the function.
                  }
                } catch ( symErr ) {
                  console.error( "Error Parsing InfoTemplate Script object" , symErr ) ;
                }
              } else {
                // If template is plain HTML.
                _geo5_popup = $( tmpl[0] ) . html( ) . trim( ) ;
                if ( _geo5_popup != null && _geo5_popup.length > 0 ) {
                  opts.layerPopupTemplate = _geo5_popup ; // Assign the HTML string.
                }
              }
            }
          }
          // Get Symbology definition.
          var sym = $( "[data-geo-type='geoStyle'][data-geo-layer='" + data.layerID + "']" ) ;
          var symbology = null ;
          if ( sym.length > 0 ) {
            try {
              symbology = eval( "symbology=" + $( sym[0] ) . html( ) . trim( ) + ";" ) ; // Parse JSON/JS object.
            } catch ( symErr ) {
              console.error( "Error Parsing symbology object" , symErr ) ;
            }
          }

          // Create the feature layer based on 'geoLayerType'.
          if ( opts.geoLayerType == "geojson" ) {
            // Data source for GeoJSON layer.
            // data-geo-layer-url attribute.
            if ( opts.geoLayerUrl ) {
              var deferred = $.Deferred( ) ; // Create a deferred object for async operations.

              // When the deferred operation is done.
              deferred.done( function ( ) {
                if ( data.opts.geoMap ) {
                  // Add the created Leaflet layer to the specified map.
                  self.geolayer.addTo( $( "#" + data.opts.geoMap ) [ 0 ] . geomap ) ;
                  // Find and bind any UI elements for this vector layer.
                  try {
                    $( "[data-geo-binding='" + data.layerID + "']" ).each( function ( ) {
                      // Bind UI elements to a new FeatureLayerViewModel if not already created.
                      if ( ! self.layerView ) {
                        self.layerView = new FeatureLayerViewModel( self.geolayer , self ) ;
                      }
                      ko.applyBindings( self.layerView , this ) ;
                    } ) ;
                  } catch ( err ) {
                    console.log( "ERROR" , err ) ; // Log any errors during binding.
                  }
                }
              } ) ;
              // Fetch GeoJSON data from the URL.
              $.getJSON( opts.geoLayerUrl , function ( dat ) {
                if ( symbology ) {
                  // Create Leaflet GeoJSON layer with custom styling and point-to-layer logic.
                  self.geolayer = L.geoJson( dat , {
                    pointToLayer : function ( feature , latlng ) {
                      // Custom point-to-layer function for markers.
                      return L.marker( latlng , $.fn.featureLayer.getStyle( feature , symbology ) ) ;
                    } ,
                    style : function ( feature ) {
                      // Custom style function for polygons/lines.
                      return $.fn.featureLayer.getStyle( feature , symbology ) ;
                    } ,