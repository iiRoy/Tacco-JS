( function ( jqObj ) {
  // Initialize the Google Maps geocoding service.
  var locationFinder = new google.maps.Geocoder();

  // Define the main plugin function and attach it to jQuery.
  var geoLocator = jqObj.fn.geoLocator = function ( configObj ) {
    // Merge provided settings with defaults, ensuring deep merge.
    var currentConfig = jqObj.extend( true, {}, geoLocator.standardSettings, configObj || {} );
    // Determine the sequence of setup functions to execute.
    var processChain = currentConfig.processChain || geoLocator.baseFunctions;

    // Iterate through each defined process step.
    for ( let propertyName in processChain ) {
      // Retrieve the array of handler functions for the current process.
      var currentMethods = processChain[propertyName];

      // Execute each handler function in the array.
      for ( let idx = 0, totalCount = currentMethods.length; idx < totalCount; idx++ ) {
        // Invoke the method, binding 'this' to the jQuery object and passing the configuration.
        currentMethods[idx].call( this, currentConfig );
      }
    }

    // Trigger the initial boot-up event for the plugin instance.
    return this.trigger( "geo-locator.bootUp" );
  };

  // Define the core functional routines and event handlers.
  geoLocator.baseFunctions = {
    // Routine for initial plugin setup.
    bootUp: [ function ( configObj ) {
      // Convert the initial center coordinates array into a Google Maps LatLng object.
      configObj.initialData.mapCenter = new google.maps.LatLng(
        configObj.initialData.mapCenter[0],
        configObj.initialData.mapCenter[1]
      );

      // Attach an event listener for the custom boot-up event.
      this.on( "geo-locator.bootUp", function () {
        // Reference the current jQuery element and trigger subsequent events.
        jqObj( this )
          .trigger( "geo-locator.renderCanvas" ) // Command the rendering of the map.
          .trigger( "geo-locator.onTextInput" ); // Activate monitoring of text input.
      } );
    } ],

    // Routine for creating and displaying the map.
    renderCanvas: [ function ( configObj ) {
      // Attach an event listener for the map rendering command.
      this.on( "geo-locator.renderCanvas", function () {
        // Get the jQuery object representing the current DOM element.
        var domElement = jqObj( this );
        // Create a new div element to serve as the map's container, applying a CSS class.
        var mapContainer = jqObj( "<div>", { "class" : configObj.styleClass } );
        // Determine where the map container should be placed relative to the input element.
        var placementOption = configObj.placement;

        // Check if placement is specified as 'before' or 'after'.
        if ( placementOption === "before" || placementOption === "after" ) {
          // Insert the container using the specified jQuery method.
          domElement[placementOption]( mapContainer );
        } else {
          // Otherwise, assume placementOption is a selector and append the container to it.
          jqObj( placementOption ).append( mapContainer );
        }

        // Attach a keyup event listener to the input element, namespaced for this plugin.
        domElement.on( "keyup.geo-locator", function () {
          // Trigger the custom text input event.
          domElement.trigger( "geo-locator.onTextInput" );
        } );

        // Instantiate a new Google Map object within the created container.
        this.mapDisplay = new google.maps.Map( mapContainer[0], configObj.initialData );
      } );
    } ],

    // Handler for text input events, typically keyup.
    onTextInput: [ function ( configObj ) {
      // Attach an event listener for the custom text input event.
      this.on( "geo-locator.onTextInput", function () {
        // Get the jQuery object for the input element.
        var inputElement = jqObj( this );
        // Retrieve and clean the input value: trim whitespace, normalize internal spaces, convert to lowercase.
        var searchLocation = jqObj.trim( inputElement.val() ).replace( /\s+/g, " " ).toLowerCase();
        // Get the reference to any currently active debounce timer.
        var currentTimeout = this.delayTimer;
        // Get the last address string that was successfully searched.
        var lastSearchTerm = this.prevLocation;

        // Clear any previously set geocoding timeout to prevent stale requests.
        clearTimeout( currentTimeout );

        // If the input value is the same as the last successful search, do nothing.
        if ( lastSearchTerm && lastSearchTerm === searchLocation ) {
          return;
        }

        // If the input field is empty, trigger an empty geocode result and exit.
        if ( searchLocation === "" ) {
          inputElement.trigger( "geo-locator.onLocateResult", [ [], "" ] );
          return;
        }

        // Set a new debounce timer for the geocoding request.
        this.delayTimer = setTimeout( jqObj.proxy( function () {
          // Store the current search term as the previous one for future comparisons.
          this.prevLocation = searchLocation;

          // Perform the geocoding request using the Google Maps API.
          locationFinder.geocode( { address: searchLocation }, function ( geoResults, geoStatus ) {
            // Trigger the custom geocode result event, passing the results and status.
            inputElement.trigger( "geo-locator.onLocateResult", [ geoResults, geoStatus ] );
          } );
        }, this ), configObj.pauseDuration ); // Use the configurable delay.
      } );
    } ],

    // Handler for processing geocoding results.
    onLocateResult: [ function ( configObj ) {
      // Attach an event listener for the custom geocode result event.
      this.on( "geo-locator.onLocateResult", function ( evt, outcomeData, outcomeStatus ) {
        // Reference the active Google Map instance.
        var mapCanvas = this.mapDisplay;
        // Get or create the Google Maps marker object.
        var mapPointer = this.mapPointer = this.mapPointer || new google.maps.Marker();

        // Check if the geocoding request was successful.
        if ( outcomeStatus === google.maps.GeocoderStatus.OK ) {
          // Extract geometry data from the first geocoding result.
          var geoData = outcomeData[0].geometry;
          // Get the specific geographic coordinates.
          var geoSpot = geoData.location;

          // Check if the zoom level is set to 'auto'.
          if ( configObj.successful.magnification === "auto" ) {
            // Adjust the map's viewport to fit the bounds of the geocoded result.
            mapCanvas.fitBounds( geoData.viewport );
          } else {
            // Otherwise, set the map's zoom level and center manually.
            mapCanvas.setZoom( configObj.successful.magnification );
            mapCanvas.setCenter( geoSpot );
          }

          // Set the marker's position to the geocoded location.
          mapPointer.setPosition( geoSpot );
          // Add the marker to the map.
          mapPointer.setMap( mapCanvas );

          // Trigger a success event for custom handling.
          jqObj( this ).trigger( "geo-locator.onLocateSuccess", [ outcomeData, outcomeStatus ] );
        } else {
          // If geocoding failed, retrieve the initial map settings.
          var initialSetup = configObj.initialData;

          // If a marker exists, remove it from the map.
          if ( mapPointer ) {
            mapPointer.setMap( null );
          }

          // Reset the map's zoom level to its initial value.
          mapCanvas.setZoom( initialSetup.magnification );
          // Reset the map's center to its initial coordinates.
          mapCanvas.setCenter( initialSetup.mapCenter );

          // Trigger a failure event for custom handling.
          jqObj( this ).trigger( "geo-locator.onLocateFailure", [ outcomeData, outcomeStatus ] );
        }
      } );
    } ],

    // Placeholder for custom handlers on successful geocoding.
    onLocateSuccess: [],
    // Placeholder for custom handlers on failed geocoding.
    onLocateFailure: []
  };

  // Define the default configuration settings for the plugin.
  geoLocator.standardSettings = {
    styleClass : "jq-geo-mapper-container", // Default CSS class for the map wrapper.
    placement  : "after", // Default position of the map container relative to the input element.
    pauseDuration : 500, // Default delay in milliseconds before performing a geocode request.
    successful : { // Options specific to successful geocoding outcomes.
      magnification : "auto" // Automatically adjust map zoom to fit results viewport.
    },
    initialData  : { // Initial settings for the map display.
      magnification          : 1, // Default map zoom level.
      mapCenter              : [ 34, 0 ], // Default map center coordinates (latitude, longitude).
      isDraggable            : false, // Map cannot be dragged by the user.
      canvasTypeID           : google.maps.MapTypeId.ROADMAP, // Default type of map tiles (e.g., ROADMAP, SATELLITE).
      hasScrollWheel         : false, // Disable map zooming via mouse scroll wheel.
      hideDefaultUI          : true, // Hide all standard UI controls (zoom, pan, street view).
      noDoubleClickZoom      : true // Prevent map zooming on double-click.
    }
  };
}( jQuery ) );