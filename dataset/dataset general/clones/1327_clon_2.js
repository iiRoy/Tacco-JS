/*
 *  Interactive Location Display Component for jQuery applications.
 *  @Author: Anonymous Contributor <anon@example.org>
 *  @Project URI: http://example.org/geo-viewer
 *
 *  Marker configurations can mirror properties defined in google.maps.MarkerOptions.
 *  Consult the official documentation for details:
 *  https://developers.google.com/maps/documentation/javascript/reference#Marker
 *
 *  Supported Initialization Parameters:
 *  - maxDisplayWidth: Maximum screen pixel width to show a static map image instead of an interactive one.
 *  - initialMapCenter: A geographic address or LatLng string where the map will be centered.
 *  - startingZoomLevel: The initial magnification level of the map.
 *  - mapVisualStyle: Specifies the type of map (e.g., 'roadmap', 'satellite', 'hybrid', 'terrain').
 *  - mapPoints: An array of objects, each defining a marker to be placed on the map.
 *    - Each point object may include an 'htmlContent' property for an info window (not supported on static images).
 *    - 'autoOpenInfo': A boolean flag; if true, the info window will open automatically upon map load.
 *
 *  Pending Features:
 *  - Display info windows on static map representations.
 */

( function ( jQ ) {

  "use strict"; // Activate strict mode for improved code quality and error detection.

  let storedMapPoints = [ ]; // Collection to keep references to all generated map markers.

  const mapComponentHandlers = {

    initializeView: function ( configurationObject ) {
      // Opt-in to the new visual refresh for Google Maps API.
      google.maps.visualRefresh = true;

      const displaySettings = jQ.extend( {
        maxDisplayWidth: 580,
        mapPoints: [ ]
      }, configurationObject );

      let visualConfiguration = {
        initialMapCenter: '',
        startingZoomLevel: '5',
        renderedDimensions: screen.width + 'x' + 480,
        devicePixelDensity: window.devicePixelRatio || 1,
        mapVisualStyle: 'roadmap',
        locationSensorEnabled: false
      };

      // Determine static image vs. interactive map based on screen width.
      // This is a robust approach, avoiding unreliable browser sniffing.
      const currentElement = jQ( this ); // Store the jQuery-wrapped DOM element for reuse.

      // Construct the base URL for the Google Static Maps API service.
      displaySettings.staticImageURL = 'http://maps.googleapis.com/maps/api/staticmap?';
      displaySettings.runtimeConfiguration = visualConfiguration;

      // Override default configuration with values from data attributes on the HTML element.
      displaySettings.runtimeConfiguration.initialMapCenter =
        currentElement.attr( 'data-center' ) || displaySettings.runtimeConfiguration.initialMapCenter;
      displaySettings.runtimeConfiguration.startingZoomLevel =
        currentElement.attr( 'data-zoom' ) || displaySettings.runtimeConfiguration.startingZoomLevel;
      displaySettings.runtimeConfiguration.mapVisualStyle =
        currentElement.attr( 'data-maptype' ) || displaySettings.runtimeConfiguration.mapVisualStyle;

      currentElement.data( 'geoViewerOptions', displaySettings ); // Persist the finalized options on the element.

      // Execute the appropriate display method based on screen size.
      if ( screen.width < displaySettings.maxDisplayWidth ) {
        currentElement.geoViewer( 'showStaticMapImage' );
      } else {
        currentElement.geoViewer( 'displayInteractiveMap' );
      }
    },

    displayInteractiveMap: function ( ) {
      const targetElement = jQ( this ).addClass( 'geo_dynamic_map' ),
        mapSetupData = targetElement.data( 'geoViewerOptions' );

      const locationTranslator = new google.maps.Geocoder( ); // API service for converting addresses to coordinates.
      let mapDisplayProperties = { }; // Object to hold options for the Google Map constructor.

      const domTargetNode = targetElement.get( 0 ); // Extract the native DOM element.

      // Initiate geocoding for the primary map center address.
      locationTranslator.geocode( {
        'address': mapSetupData.runtimeConfiguration.initialMapCenter
      }, function ( geocodeResults, queryStatus ) {
        if ( queryStatus === google.maps.GeocoderStatus.OK ) {
          // Configure map options using geocoded center and stored settings.
          mapDisplayProperties.zoom = Number( mapSetupData.runtimeConfiguration.startingZoomLevel );
          mapDisplayProperties.center = geocodeResults[ 0 ].geometry.location;
          mapDisplayProperties.mapTypeId = mapSetupData.runtimeConfiguration.mapVisualStyle;

          const mapInstance = new google.maps.Map( domTargetNode, mapDisplayProperties ); // Construct the map.
          let markerConfig = { }; // Temporary object for individual marker settings.

          if ( mapSetupData.mapPoints.length ) {
            for ( let pointIndex = 0; pointIndex < mapSetupData.mapPoints.length; pointIndex++ ) {
              markerConfig = jQ.extend( {
                map: mapInstance // Associate the marker with this map instance.
              }, mapSetupData.mapPoints[ pointIndex ] );

              // If marker position is undefined or specified as 'center', use the map's geocoded center.
              if ( !markerConfig.position || markerConfig.position === 'center' ) {
                markerConfig.position = geocodeResults[ 0 ].geometry.location;
              }

              // If the marker position is an address string, it needs geocoding.
              if ( typeof markerConfig.position !== 'object' ) {
                ( function ( geocodedMarkerData ) { // Enclose in IIFE to preserve `geocodedMarkerData` for callback.
                  locationTranslator.geocode( {
                    'address': geocodedMarkerData.position
                  }, function ( subGeocodeResults, subQueryStatus ) {
                    if ( subQueryStatus === google.maps.GeocoderStatus.OK ) {
                      geocodedMarkerData.position = subGeocodeResults[ 0 ].geometry.location;
                      mapComponentHandlers._addMapPoint( geocodedMarkerData ); // Add the marker once geocoded.
                    }
                  } );
                } )( markerConfig );
              } else {
                mapComponentHandlers._addMapPoint( markerConfig ); // Add marker directly if coordinates are provided.
              }
            }
          }
        }
      } );
    },

    _addMapPoint: function ( markerConfiguration ) {
      let infoWindowHTML; // Content for the popup window.

      if ( markerConfiguration.htmlContent ) {
        infoWindowHTML = markerConfiguration.htmlContent;
        delete markerConfiguration.htmlContent; // Remove custom property before passing to Google Maps API.
      }

      const newPin = new google.maps.Marker( markerConfiguration ); // Instantiate the Google Map Marker.

      if ( infoWindowHTML ) {
        const detailsPopup = new google.maps.InfoWindow( {
          content: infoWindowHTML
        } );

        // Attach an event listener to display the info window on marker click.
        google.maps.event.addListener( newPin, 'click', function ( ) {
          detailsPopup.open( markerConfiguration.map, newPin );
        } );

        // If configured, open the info window immediately.
        if ( markerConfiguration.autoOpenInfo ) {
          // A small delay helps ensure the info window's dimensions are correctly calculated.
          window.setTimeout( function ( ) {
            detailsPopup.open( markerConfiguration.map, newPin );
          }, 100 );
        }
      }
      storedMapPoints.push( newPin ); // Add the newly created marker to our global collection.
    },

    showStaticMapImage: function ( ) {
      const targetElement = jQ( this ).addClass( 'geo_static_image' ),
        urlParameterSegments = [ ], // Array to build up parts of the static map URL query.
        mapImageElement = new Image( ), // HTML Image object for the static map.
        mapHyperlink = document.createElement( 'a' ), // HTML Anchor element to wrap the image.
        mapSetupData = targetElement.data( 'geoViewerOptions' );

      let currentMarkerIterator = 0, // Counter for iterating through map points.
        markerURLSegments = [ ]; // Array to store URL parts specific to markers.

      // Assemble general map parameters for the static map URL.
      for ( const configKey in mapSetupData.runtimeConfiguration ) {
        urlParameterSegments.push( configKey + '=' + mapSetupData.runtimeConfiguration[ configKey ] );
      }

      // Process and format marker data if available.
      if ( mapSetupData.mapPoints.length ) {
        let temporaryMarkerParams = [ ];
        for ( ; currentMarkerIterator < mapSetupData.mapPoints.length; currentMarkerIterator++ ) {
          temporaryMarkerParams = [ ]; // Reset for each individual marker.
          for ( const markerPropertyKey in mapSetupData.mapPoints[ currentMarkerIterator ] ) {
            if ( markerPropertyKey === 'position' ) {
              // Encode position (address or 'center') for the URL.
              const positionValue = mapSetupData.mapPoints[ currentMarkerIterator ][ markerPropertyKey ];
              temporaryMarkerParams.push( ( !positionValue || positionValue === 'center' ) ?
                mapSetupData.runtimeConfiguration.initialMapCenter :
                positionValue.replace( / /gi, '+' ) );
            } else {
              temporaryMarkerParams.push( markerPropertyKey + ':' + mapSetupData.mapPoints[ currentMarkerIterator ][ markerPropertyKey ] );
            }
          }
          markerURLSegments.push( '&markers=' + temporaryMarkerParams.join( '%7C' ) ); // URL-encode the separator.
        }
      }

      // Construct the full URL for the static map image.
      mapImageElement.src = mapSetupData.staticImageURL + urlParameterSegments.join( '&' ) + markerURLSegments.join( '' );
      mapHyperlink.href = '//maps.google.com/maps?q=' + mapSetupData.runtimeConfiguration.initialMapCenter; // Link to interactive Google Maps.
      mapHyperlink.appendChild( mapImageElement ); // Place the static image inside the link.
      jQ( this ).empty( ).append( mapHyperlink ); // Clear existing content and insert the new map image/link.
    }

  }; // End of mapComponentHandlers object.

  // Define the jQuery plugin interface.
  jQ.fn.geoViewer = function ( actionName ) {
    if ( mapComponentHandlers[ actionName ] ) {
      // Execute the specified handler, passing additional arguments.
      return mapComponentHandlers[ actionName ].apply( this, Array.prototype.slice.call( arguments, 1 ) );
    } else if ( typeof actionName === 'object' || !actionName ) {
      // If no method name or an options object is passed, initialize the view.
      return mapComponentHandlers.initializeView.apply( this, arguments );
    } else {
      // Handle cases where an unknown method name is provided.
      jQ.error( 'Action "' + actionName + '" does not exist on jQ.geoViewer plugin.' );
    }
  };

} )( this.jQuery ); // Pass jQuery object to the immediately invoked function expression.