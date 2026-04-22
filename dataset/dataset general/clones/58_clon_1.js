/*
 * This file contains various utility functions and map-related logic
 * for a data visualization project, likely for BuzzFeed News.
 * It's structured as an immediately invoked function expression (IIFE)
 * to prevent global scope pollution.
 */
( function ( ) {

  // Establish the root object, `window` in the browser, or `exports` on the server.
  var root = this;

  /**
   * Adds commas to a number for better readability.
   * @param {number|string} int - The number to format.
   * @returns {string} The formatted number with commas.
   */
  root.commafy = function ( int ) {
    // Declare a variable to hold the regular expression.
    var r;

    // Convert the input to a string, ensuring it can be processed by regex.
    int += "";

    // Define the regular expression to find digits followed by three digits.
    // This targets groups of three from the right, before the decimal point.
    r = /(\d+)(\d{3})/;

    // Loop while the regex finds matches, inserting a comma.
    while ( r.test( int ) ) {
      int = int.replace( r, "$1,$2" );
    }

    // Return the comma-formatted string.
    return int;
  };


  /**
   * Converts a number to a percentage with a specified number of decimal places.
   * @param {number} num - The number to convert.
   * @param {number} dec - The number of decimal places to round to.
   * @returns {number} The rounded percentage.
   */
  root.percentify = function ( num, dec ) {
    // Calculate the multiplier for rounding to the desired decimal places.
    var mult = Math.pow( 10, dec );

    // Multiply by 100 to get a percentage, then round and divide to maintain decimal precision.
    return Math.round( num * 100 * mult ) / mult;
  };


  // Initialize a color scale using the 'chroma.js' library.
  // This scale defines a gradient from blue to white to pink.
  var color_scale = chroma.scale( [ '#00CCFF', "#FFF", '#FF0099' ] )
    .domain( [ 0.0, 0.25, 0.50 ], 20 ) // Defines the input domain and interpolation steps.
    .mode( 'lab' ); // Uses the 'lab' color space for more perceptually uniform interpolation.


  /**
   * Scales a percentage value to a color from the predefined `color_scale`.
   * @param {number} pct - The percentage value (0.0 to 1.0).
   * @returns {string} The hexadecimal color string.
   */
  var scaleColor = function ( pct ) {
    // Retrieve the color from the scale and convert it to a hex string.
    return color_scale( pct ).hex( );
  };


  /**
   * Builds and returns a Leaflet control object for a map legend.
   * This legend displays a color gradient representing data values.
   * @returns {L.Control} The Leaflet legend control.
   */
  var buildLegend = function ( ) {
    // Create a new Leaflet control positioned at the bottom left.
    var holder = L.control( { position: "bottomleft" } );

    // Create the legend div element.
    var legend = holder._div = L.DomUtil.create( "div", "legend map-control" );

    // Define constants for the legend's visual representation.
    var CHUNKS = 10; // Number of segments in the legend bar.
    var MAX = 0.5; // Maximum data value represented by the legend.

    // Generate the HTML for the individual colored bars within the legend.
    var inner_html = _.map( _.range( 10 ), function ( i ) {
      // Each bar's width is proportional to the total chunks, and its background color
      // is determined by its position in the scale.
      return "<div class='legend-bar' style='width: " + 100 / CHUNKS +
        "%; background: " + scaleColor( MAX * i / CHUNKS ) + "'></div>";
    } ).join( "" ); // Join all bar HTML strings together.

    // Wrap the inner bars HTML in a container.
    var html = "<div class='legend-bars'>" + inner_html + "</div>";

    // Set the inner HTML of the legend div.
    legend.innerHTML = html;

    // Define the `onAdd` method for the Leaflet control.
    // This method is called when the control is added to the map.
    holder.onAdd = function ( map ) { return this._div; };

    // Return the configured legend holder.
    return holder;
  };


  /**
   * Generates the HTML string for a map legend, including text labels.
   * This version is intended for direct HTML insertion rather than a Leaflet control.
   * @returns {string} The HTML string for the legend.
   */
  var buildLegendHTML = function ( ) {
    // Constants for legend construction, similar to `buildLegend`.
    var CHUNKS = 10;
    var MAX = 0.5;

    // Generate HTML for the color bars, with an extra chunk for the end label.
    var inner = _.map( _.range( CHUNKS + 1 ), function ( i ) {
      // Calculate width for each bar, accounting for the extra chunk.
      return "<div class='legend-bar' style='width: " + 100 / ( CHUNKS + 1 ) +
        "%; background: " + scaleColor( MAX * i / CHUNKS ) + "'></div>";
    } ).join( "" );

    // Combine the bars with text labels for percentage ranges.
    var html = "<div class='legend'>" +
      "<div class='legend-bars'>" + inner + "</div>" +
      "<div class='legend-text'>" +
      "<span class='legend-text-left'>0%</span>" +
      "<span class='legend-text-center'>Female Ridership</span>" +
      "<span class='legend-text-right'>50%+</span>" +
      "</div>"; // Close the legend div.
    return html;
  };


  /**
   * Builds and returns a Leaflet control for displaying information,
   * such as station details or help text.
   * @returns {L.Control} The Leaflet info control.
   */
  var buildInfo = function ( ) {
    // Create a new Leaflet control without a specific position initially.
    var info = L.control( );

    // Load a template for station information using Underscore.js.
    var station_tmpl = _.template( $( ".tmpl.station" ).html( ) );

    // Define default hover help text for desktop and mobile users.
    var hover_help = "<div class='helptext'>" +
      "<span class='helptext-main'>Hover over any station for details. Double-click on a station to zoom in.</span>" +
      "<span class='helptext-mobile'>Tap on any station for details.</span>" +
      "</div>";

    // Get the legend HTML to include in the default info display.
    var legend = buildLegendHTML( );

    // Combine help text and legend for the default display.
    var default_html = hover_help + legend;

    // Define the `onAdd` method for the info control.
    info.onAdd = function ( map ) {
      // Create the info div and assign it to `_div`.
      this._div = L.DomUtil.create( 'div', 'info map-control' );

      // Initialize the control's content.
      this.update( );

      // Return the created div.
      return this._div;
    };

    // Define the `update` method for the info control.
    // This method changes the content of the info div.
    info.update = function ( station ) {
      // If a station object is provided, use the station template; otherwise, use default HTML.
      this._div.innerHTML = station ? station_tmpl( station ) : default_html;
    };

    // Return the configured info control.
    return info;

  };


  /**
   * Highlights a given Leaflet marker and updates the info panel.
   * @param {L.CircleMarker} marker - The marker to highlight.
   * @param {L.Control} info - The info control to update.
   */
  var highlightMarker = function ( marker, info ) {
    // Store original styles to restore later.
    marker._styles = marker.options;

    // Apply new styles for highlighting.
    marker.setStyle( {
      fillColor: "#ffee00", // Bright yellow fill.
      weight: 2,             // Thicker border.
      opacity: 1             // Fully opaque.
    } );

    // Store the marker's original position in the DOM to maintain z-index order.
    marker.prevPos = marker.$container.index( );

    // Bring the highlighted marker to the front of other markers.
    marker.bringToFront( );

    // Update the info panel with details of the highlighted station.
    info.update( marker.station );
  };


  /**
   * Resets a highlighted Leaflet marker to its original appearance and clears the info panel.
   * @param {L.CircleMarker} marker - The marker to reset.
   * @param {L.Control} info - The info control to clear.
   */
  var resetMarker = function ( marker, info ) {
    // Restore the marker's original styles.
    marker.setStyle( marker._styles );

    // Get the jQuery wrapped container for the marker.
    var $c = marker.$container;

    // Insert the marker back into its original position in the DOM
    // to restore its z-index relative to other markers.
    $c.insertBefore( $c.parent( ).children( )[ marker.prevPos ] );

    // Clear the info panel.
    info.update( );
  };


  /**
   * Zooms the map to a specific marker's location.
   * @param {L.CircleMarker} marker - The marker to zoom to.
   * @param {L.Map} map - The Leaflet map instance.
   */
  var zoomToMarker = function ( marker, map ) {
    // Set the map's view to the marker's coordinates, increasing zoom level by 1.
    map.setView( marker._latlng, map.getZoom( ) + 1 );
  };


  /**
   * Pans the map to center on a specific marker's location.
   * @param {L.CircleMarker} marker - The marker to pan to.
   * @param {L.Map} map - The Leaflet map instance.
   */
  var panToMarker = function ( marker, map ) {
    // Pan the map smoothly to the marker's geographical coordinates.
    map.panTo( marker._latlng );
  };


  /**
   * Builds an array of Leaflet circle markers for a given set of stations.
   * @param {Array<Object>} stations - An array of station data objects.
   * @param {L.Map} map - The Leaflet map instance.
   * @param {L.Control} info - The info control for updating details.
   * @returns {Array<L.CircleMarker>} An array of Leaflet circle markers.
   */
  var buildMarkers = function ( stations, map, info ) {
    // Extract all 'trips_total' values to determine the maximum for scaling.
    var trip_totals = _.pluck( stations, "trips_total" );

    // Find the maximum number of trips among all stations.
    var max_trips = Math.max.apply( Math.max, trip_totals );


    /**
     * Calculates the radius for a marker based on its total trips relative to the maximum.
     * @param {number} total - The total trips for the current station.
     * @param {number} max - The maximum total trips across all stations.
     * @returns {number} The calculated radius.
     */
    var scaleRadius = function ( total, max ) {
      // Calculate the percentage of total trips.
      var pct = total / max;

      // Ensure a minimum radius by flooring the percentage at 0.2.
      var floored = Math.max( 0.2, pct );

      // Apply a square root scaling for visual perception.
      return 8 * Math.sqrt( floored );
    };

    // Create a Leaflet circle marker for each station.
    var markers = _.map( stations, function ( s ) {
      // Create marker with dynamic radius and color.
      var marker = L.circleMarker( s.lat_lng, {
        radius: scaleRadius( s.trips_total, max_trips ),
        weight: 1, // Border thickness.
        opacity: 1, // Border opacity.
        color: "#000", // Black border.
        fillOpacity: 1, // Fill opacity.
        fillColor: scaleColor( s.fpct_total ), // Fill color based on female percentage.
      } );

      // Attach the original station data to the marker object.
      marker.station = s;

      // Attach event listeners for user interaction.
      marker.on( {
        mouseover: function ( e ) { highlightMarker( e.target, info ); }, // Highlight on hover.
        mouseout: function ( e ) { resetMarker( e.target, info ); },     // Reset on hover out.
        dblclick: function ( e ) { zoomToMarker( e.target, map ); },     // Zoom on double-click.
        add: function ( e ) {
          // Store a jQuery reference to the marker's DOM element for later manipulation.
          marker.$container = $( marker._container );
        }
      } );

      // Return the created marker.
      return marker;
    } );

    // Return the array of markers.
    return markers;
  };


  /**
   * Builds and returns a Leaflet control displaying lists of "top" stations
   * (e.g., least-female and most-female ridership).
   * @param {Array<L.CircleMarker>} markers - An array of all station markers.
   * @param {L.Map} map - The Leaflet map instance.
   * @param {L.Control} info - The info control for updating details.
   * @returns {L.Control} The Leaflet control for top stations.
   */
  var buildTopStations = function ( markers, map, info ) {
    // Create a new Leaflet control positioned at the bottom right.
    var holder = L.control( { position: "bottomright" } );

    // Load templates for station groups and individual station items.
    var group_tmpl = _.template( $( ".tmpl.station-group" ).html( ) );
    var item_tmpl = _.template( $( ".tmpl.station-item" ).html( ) );

    // Filter markers to include only stations with a significant number of trips.
    var filtered = _.filter( markers, function ( m ) {
      return m.station.trips_total >= 1000;
    } );

    // Sort the filtered markers by female ridership percentage.
    var sorted = _.sortBy( filtered, function ( m ) {
      return m.station.fpct_total;
    } );

    // Define the number of stations to include in each "top" group.
    var group_size = 5;

    // Create groups for "Least-Female" and "Most-Female" stations.
    var groups = [
      {
        name: "Least-Female",
        markers: sorted.slice( 0, group_size ) // Get the first `group_size` elements.
      },
      {
        name: "Most-Female",
        markers: sorted.slice( -1 * group_size ).reverse( ) // Get the last `group_size` elements and reverse them.
      }
    ];

    // Define the `onAdd` method for the top stations control.
    holder.onAdd = function ( map ) {
      // Create the main div for the control.
      var inner = L.DomUtil.create( 'div', 'map-control station-list top-stations' );

      // Wrap the div in jQuery for easier manipulation.
      var $inner = $( inner );

      // Generate HTML for each group of stations.
      var $groups = _.map( groups, function ( group ) {
        // Create a jQuery object for the group using its template.
        var $group = $( group_tmpl( { group: group } ) );

        // Generate HTML for each station within the current group.
        var $stations = _.map( group.markers, function ( m ) {
          // Create a jQuery object for the station item.
          var $station = $( item_tmpl( { station: m.station } ) );

          // Attach event handlers for interaction with the station list items.
          $station.on( "mouseover", function ( e ) {
            highlightMarker( m, info ); // Highlight marker on map.
          } );
          $station.on( "mouseout", function ( e ) {
            resetMarker( m, info );     // Reset marker on map.
          } );
          $station.on( "dblclick", function ( e ) {
            zoomToMarker( m, map );     // Zoom map to marker.
          } );
          $station.on( "click", function ( e ) {
            panToMarker( m, map );      // Pan map to marker.
          } );

          // Return the jQuery object for the station item.
          return $station;
        } );

        // Append the generated station items to the group's container.
        $group.find( ".station-group-stations" ).append( $stations );

        // Return the jQuery object for the group.
        return $group;
      } );

      // Append all generated groups to the main control div.
      $inner.append( $groups );

      // Return the main div.
      return inner;
    };

    // Return the configured top stations holder.
    return holder;
  };


  /**
   * Initializes and displays the Leaflet map with stations and controls.
   * @param {Array<Object>} stations - An array of station data objects.
   * @param {Array<L.TileLayer>} tile_layers - An array of Leaflet tile layers to add to the map.
   * @param {string|HTMLElement} div - The ID or DOM element where the map will be rendered.
   */
  var buildMap = function ( stations, tile_layers, div ) {

    // Pre-process station data: convert lat/lng strings to Leaflet LatLng objects.
    _.each( stations, function ( s ) {
      s.lat_lng = new L.LatLng( s.lat, s.lng );
    } );

    // Extract all LatLng objects to calculate the bounding box for the map.
    var lat_lngs = _.pluck( stations, "lat_lng" );

    // Create a Leaflet LatLngBounds object from the station coordinates.
    var bounds = L.latLngBounds( lat_lngs );

    // Initialize the Leaflet map.
    var map = new L.Map( div, {
      scrollWheelZoom: false,      // Disable scroll wheel zooming.
      doubleClickZoom: false,      // Disable double-click zooming (handled by custom event).
      minZoom: 9,                  // Set minimum zoom level.
      attributionControl: false    // Disable default Leaflet attribution control.
    } );

    // Add a custom attribution control to the map.
    L.control.attribution( { position: 'bottomleft' } ).addTo( map );

    // Fit the map view to the calculated bounds of all stations.
    map.fitBounds( bounds );

    // Add all specified tile layers to the map.
    _.each( tile_layers, function ( layer ) {
      map.addLayer( layer );
    } );

    // Build the info control, station markers, and top stations control.
    var info = buildInfo( );
    var markers = buildMarkers( stations, map, info );
    var top_stations = buildTopStations( markers, map, info );

    // Add the controls and markers to the map.
    info.addTo( map );
    top_stations.addTo( map );
    L.layerGroup( markers ).addTo( map ); // Add all markers as a single layer group.
  };


  /**
   * Fetches station data from a URL, then builds and displays the map.
   * @param {string} stations_url - The URL to fetch station data (CSV format).
   * @param {Array<L.TileLayer>} tile_layers - An array of Leaflet tile layers.
   * @param {string|HTMLElement} div - The ID or DOM element for the map.
   */
  var mapStations = function ( stations_url, tile_layers, div ) {
    // Make an AJAX GET request to the stations URL.
    $.get( stations_url, function ( csv ) {
      // Parse the CSV data using jQuery's parse method (assuming a custom `$.parse` exists or similar).
      var stations = $.parse( csv ).results.rows;

      // Once data is loaded, build the map.
      buildMap( stations, tile_layers, div );
    } );
  };


  // Ensure the BuzzFeedNews namespace exists.
  root.BuzzFeedNews = root.BuzzFeedNews || { };

  // Expose the `mapStations` function under `BuzzFeedNews.local`.
  root.BuzzFeedNews.local = {
    mapStations: mapStations
  };

} ).call( this ); // Execute the IIFE, passing `this` (global object) as context.