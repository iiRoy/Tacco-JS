// This file is part of the osmly mapping application.
// It handles the initialization and core functionalities of the Leaflet map.
/* jshint multistr:true */ // JSHint directive to allow multi-line strings.

osmly.map = function ( ) {
  // Initialize the Leaflet map instance.
  // The 'map' div is targeted, and initial options are set.
  var map = L.map( 'map', {
    center:        osmly.settings.origin, // Initial map center from settings.
    layers:        [new L.BingLayer( 'Arzdiw4nlOJzRwOz__qailc8NiR31Tt51dN2D7cm57NrnceZnCpgOkmJhNpGoppU' )],
    zoom:          osmly.settings.zoom, // Initial zoom level from settings.
    maxZoom:       19,                   // Maximum zoom level allowed.
    fadeAnimation: false                 // Disable fade animation for performance/consistency.
  } );


  // Set the image path for default Leaflet icons.
  L.Icon.Default.imagePath = 'dist/leaflet-images/';

  // Event listener for when the map finishes moving.
  // Updates the OpenStreetMap link with current coordinates and zoom.
  map.on( 'moveend', function ( ) {
    var coords = map.getCenter( ).wrap( );
    var lat    = coords.lat.toFixed( 4 ).toString( );
    var lng    = coords.lng.toFixed( 4 ).toString( );
    var zoom   = map.getZoom( ).toString( );

    // Construct the OpenStreetMap deep link.
    osmly.osmlink = 'http://www.openstreetmap.org/#map=' + zoom + '/' + lat + '/' + lng;
  } );

  // Attribution control configuration.
  map.attributionControl.setPrefix( false ); // Disable default Leaflet prefix.

  // Check if running on a dev server and update attribution accordingly.
  if ( osmly.settings.writeApi.split( 'dev' ).length > 1 ) {
    map.attributionControl.setPrefix( 'DEV SERVER' );
  }

  // Add OpenStreetMap base tiles.
  map.osmTiles = L.tileLayer( 'http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
    maxZoom:      19, // Max zoom level for these tiles.
    maxNativeZoom: 18 // Max native zoom level for OSM tiles.
  } );


  // Function to handle fetching, filtering, setting, and displaying context data.
  map.context = function ( bbox, buffer, callback ) {
    // If a buffer is provided, expand the bounding box.
    if ( buffer ) {
      bbox = [
        bbox[0] - buffer,
        bbox[1] - buffer,
        bbox[2] + buffer,
        bbox[3] + buffer
      ];
    }

    // Remove the existing context layer if it exists to avoid duplicates.
    if ( map.hasLayer( map.contextLayer ) ) {
      map.removeLayer( map.contextLayer );
    }

    osmly.ui.notify( 'getting nearby OSM data' ); // Notify user about data fetching.
    getOsm( bbox, function ( xml ) {
      osmly.ui.notify( 'rendering OSM data' ); // Notify user about data rendering.
      var context = filterContext( osm_geojson.osm2geojson( xml, true ) );
      setContext( context );
      map.addLayer( map.contextLayer ); // Add the processed context data to the map.
      callback( ); // Execute the callback function.
    } );

    // This section is commented out, likely for offline development or testing purposes.
    // It simulates a delayed context load.
    // setTimeout( function( ) {
    //   setContext( '' );
    //   map.addLayer( map.contextLayer );
    //   callback( );
    // }, 555 );
  }; // End of map.context function.

  // Function to toggle the visibility of a given layer.
  map.toggleLayer = function ( layer ) {
    if ( map.hasLayer( layer ) ) { // Check if the layer is currently on the map.
      map.removeLayer( layer );    // If yes, remove it.
    } else {
      map.addLayer( layer );       // If no, add it.
    }
  }; // End of map.toggleLayer.

  /**
   * Fetches OpenStreetMap data for a given bounding box.
   * @param {Array<number>} bbox - The bounding box [minLon, minLat, maxLon, maxLat].
   * @param {Function} callback - Callback function to execute with the fetched XML data.
   */
  function getOsm ( bbox, callback ) {
    $
      .ajax( {
        url:      osmly.settings.readApi + 'bbox=' + bbox.join( ',' ), // API endpoint for OSM data.
        dataType: 'xml',                                             // Expected data type is XML.
        success:  function ( xml ) {                                 // Success callback.
          map.osmContext = xml;                                      // Store the raw XML context.
          callback( xml );                                           // Invoke the provided callback with XML.
        }
      } );
  } // End of getOsm function.

  // Filters geojson features based on osmly.settings.context.
  function filterContext ( geojson ) {
    var geo = {
      'type':     'FeatureCollection',
      'features': []
    };

    // Iterate through each feature in the geojson.
    for ( var i = 0; i < geojson.features.length; i++ ) {
      var feature = geojson.features[i];
      var match   = false; // Flag to indicate if the feature matches any context criteria.

      // Check properties against context settings.
      for ( var key in feature.properties ) {
        if (
          key in osmly.settings.context &&
          osmly.settings.context[key].indexOf( feature.properties[key] ) > -1 &&
          !match
        ) {
          match = true; // Feature matches context criteria.
        }
      }

      // If feature matches or no context settings are defined, add it.
      if ( match || !Object.keys( osmly.settings.context ).length ) {
        geo.features.push( feature );
      }
    }
    return geo; // Return the filtered GeoJSON.
  } // End of filterContext function.

  /**
   * Sets the context layer on the map using provided GeoJSON data.
   * @param {Object} geojson - The GeoJSON object to render.
   */
  function setContext ( geojson ) {
    var index = 0; // Used for unique ID generation.
    map.contextLayer = L.geoJson( geojson, {
      style: osmly.settings.contextStyle, // Styling for the context layer.
      onEachFeature: function ( feature, layer ) {
        var popup   = '';
        var label   = 'NO NAME, click for tags'; // Default label.
        var t       = 0;
        var tagKeys = Object.keys( feature.properties );

        // If feature has properties, process them for popup and label.
        if ( feature.properties ) {
          layer.bindPopup( popup ); // Bind an empty popup initially.
          // The popup is bound upfront so we can get a leaflet layer id.
          // This ID is included in the 'data-layer' attribute, used for merging operations.

          // Set label if 'name' property exists.
          if ( feature.properties.name ) {
            label = feature.properties.name;
          }
          // Iterate through tags to build popup content.
          while ( t < tagKeys.length ) {
            // We don't display osm_* tags but they're used for merging behind the scenes.
            if ( tagKeys[t].split( 'osm_' ).length === 1 ) {
              popup += '<li><span class="k">' + tagKeys[t] +
                       '</span>: ' + feature.properties[tagKeys[t]] + '</li>';
            }
            t++;
          }
          // Add a merge button for Point features in 'import' mode.
          if ( feature.geometry.type == 'Point' && osmly.mode.now == 'import' ) {
            popup += '<li class="merge" ' +
                     'data-layer-id="' + index + '" ' +
                     'data-tags=\'' + JSON.stringify( feature.properties ) + '\' ' +
                     'style=" ' +
                     'margin-top: 10px; ' +
                     'text-align: center; ' +
                     'padding: 10px 0; ' +
                     'border: 1px solid #aaa; ' +
                     'background-color: #eee; ' +
                     'cursor: pointer; ' +
                     '">Merge with import data</li>';
          }
          feature.properties._id = index;          // Assign a unique ID to the feature.
          layer._popup._content  = popup;          // Set the actual popup content.
          layer.bindLabel( label );                // Bind the label to the layer.
          index++;                                 // Increment index for next feature.
        }
      },
      // Function to determine how points are rendered.
      pointToLayer: function ( feature, latlng ) {
        return L.circleMarker( latlng, {
          radius:      6,    // Radius of the circle marker.
          opacity:     1,    // Opacity of the stroke.
          fillOpacity: 0.33  // Opacity of the fill.
        } );
      }
    } );
  } // End of setContext function.

  /**
   * Sets and optionally displays a specific feature on the map.
   * @param {Object} geojson - The GeoJSON of the feature to set.
   * @param {boolean} edit - Whether the feature should be editable.
   * @param {boolean} show - Whether the feature should be added to the map and brought to front.
   */
  map.setFeature = function ( geojson, edit, show ) {
    map.featureLayer = L.geoJson( geojson, {
      style: osmly.settings.featureStyle, // Apply style from settings.
      onEachFeature: function ( feature, layer ) {
        if ( edit ) { // If edit mode is enabled.
          if ( geojson.geometry.type == 'MultiPolygon' ) {
            // Enable editing for each sub-layer of a MultiPolygon.
            for ( var el in layer._layers ) {
              layer._layers[el].editing.enable( );
            }
          } else if ( geojson.geometry.type == 'Point' ) {
            // Make Point features draggable.
            layer.options.draggable = true;
          } else {
            // Enable editing for other geometry types.
            layer.editing.enable( );
          }
        }
      }
    } );

    // Fit the map bounds to the extent of the new feature.
    map.fitBounds( map.featureLayer.getBounds( ) );

    if ( show ) { // If the feature should be shown.
      map.featureLayer.addTo( osmly.map );     // Add it to the map.
      map.featureLayer.bringToFront( );        // Bring it to the front.
    }
  }; // End of map.setFeature function.


  return map; // Return the initialized map object.
}; // End of osmly.map function definition.