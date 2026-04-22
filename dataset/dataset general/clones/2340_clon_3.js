"use strict";

(function(jq) {

  // Centralized instance for the Google Maps Geocoding service.
  // Initialized only once when the plugin is first invoked.
  let mapCoordinateResolver = null;

  /**
   * jQuery plugin: geoLocator
   * Enhances input fields to automatically geocode addresses and display them on a Google Map.
   *
   * @param {object} clientSettings - Custom configuration options provided by the user.
   * @returns {jq} The jQuery object for method chaining.
   */
  const geoLocatePlugin = jq.fn.geoLocator = function(clientSettings) {
    // Guard clause: Initialize the geocoder if it hasn't been already and Google Maps API is ready.
    if (!mapCoordinateResolver && typeof google !== 'undefined' && google.maps && google.maps.Geocoder) {
        mapCoordinateResolver = new google.maps.Geocoder();
        // Expose the resolver for potential external use or testing.
        geoLocatePlugin.mapService = mapCoordinateResolver;
    } else if (!mapCoordinateResolver) {
        // Log an error if the Google Maps API or Geocoder is missing.
        console.error("GeoLocator: Google Maps API or Geocoder service not available. Plugin cannot function.");
        return this; // Return early if critical dependencies are absent.
    }

    // Deep merge default options with user-provided settings.
    const activeConfiguration = jq.extend(true, {}, geoLocatePlugin.defaultOptions, clientSettings || {});

    // Retrieve the defined sequence of processing steps for this plugin.
    const processingSequence = activeConfiguration.workflowSteps || geoLocatePlugin.coreLogic;

    // Iterate through each stage in the processing sequence.
    // Object.entries provides a robust way to loop over object properties.
    for (const [stageIdentifier, stageCallbacks] of Object.entries(processingSequence)) {
        // Ensure that the handlers for a stage are an array of functions.
        if (!Array.isArray(stageCallbacks)) {
            console.warn(`GeoLocator: Skipping invalid stage '${stageIdentifier}'. Expected an array of functions.`);
            continue;
        }

        // Execute each callback function associated with the current stage.
        // The 'this' context refers to the jQuery wrapped element(s).
        stageCallbacks.forEach(callbackFunction => {
            if (typeof callbackFunction === 'function') {
                // Use .apply for explicit context binding and passing arguments as an array.
                callbackFunction.apply(this, [activeConfiguration]);
            }
        });
    }

    // Trigger the initial event to commence the plugin's operations.
    // This event will be caught by handlers defined in 'setupPluginEnvironment'.
    return this.trigger("geoLocatePlugin.initiateOperation");
  };

  /**
   * Contains the core operational logic and event handlers for the geoLocator plugin.
   * Each property represents a distinct processing stage or event.
   */
  geoLocatePlugin.coreLogic = {
    /**
     * Stage 1: Sets up the plugin environment, processes initial map coordinates,
     * and binds the primary initialization event.
     * @param {object} currentSettings - The effective configuration for this instance.
     */
    setupPluginEnvironment: [function(currentSettings) {
      // Validate the structure of initial coordinates to prevent errors.
      const initialCoords = currentSettings.mapBase.startCoordinates;
      if (!Array.isArray(initialCoords) || initialCoords.length !== 2 || typeof initialCoords[0] !== 'number' || typeof initialCoords[1] !== 'number') {
        console.warn("GeoLocator: Invalid initial coordinates provided. Falling back to default [0, 0].");
        currentSettings.mapBase.startCoordinates = [0, 0];
        currentSettings.mapBase.initialMapCenter = new google.maps.LatLng(0, 0);
      } else {
        // Convert array coordinates into a Google Maps LatLng object.
        currentSettings.mapBase.initialMapCenter = new google.maps.LatLng(initialCoords[0], initialCoords[1]);
      }

      // Bind to the custom initialization event to orchestrate subsequent actions.
      this.on("geoLocatePlugin.initiateOperation", function() {
        // Use jq(this) to ensure we're operating on the jQuery object for event chaining.
        jq(this)
          .trigger("geoLocatePlugin.renderMapContainer") // Proceed to render the map
          .trigger("geoLocatePlugin.processUserInput");  // Prepare to handle user input
      });
    }],

    /**
     * Stage 2: Creates the Google Map display area and positions it relative to the input field.
     * @param {object} currentSettings - The effective configuration.
     */
    renderMapContainer: [function(currentSettings) {
      this.on("geoLocatePlugin.renderMapContainer", function() {
        const inputFieldElement = jq(this);
        // Create the div element that will host the Google Map.
        const mapDisplayWrapper = jq("<div>", { "class": currentSettings.displayClasses.containerClass });

        const placementStrategy = currentSettings.displayClasses.insertionStrategy; // e.g., "before", "after", or a CSS selector.

        // Implement different insertion methods based on the configuration.
        if (placementStrategy === "before" || placementStrategy === "after") {
          inputFieldElement[placementStrategy](mapDisplayWrapper);
        } else if (jq(placementStrategy).length) { // Check if the selector finds an element.
          jq(placementStrategy).append(mapDisplayWrapper);
        } else {
          // Fallback if the placement strategy is invalid or selector yields no results.
          console.error(`GeoLocator: Invalid map container placement strategy: '${placementStrategy}'. Appending to body as fallback.`);
          jq("body").append(mapDisplayWrapper);
        }

        // Attach a keyup event listener to the input field.
        // Namespacing the event ('keyup.geoLocatorInput') prevents conflicts.
        inputFieldElement.on("keyup.geoLocatorInput", function() {
          inputFieldElement.trigger("geoLocatePlugin.processUserInput");
        });

        // Configure map options using values from the `currentSettings`.
        const mapOptions = {
          zoom: currentSettings.mapBase.zoomLevel,
          center: currentSettings.mapBase.initialMapCenter,
          draggable: currentSettings.mapBase.isDraggable,
          mapTypeId: currentSettings.mapBase.mapTileType,
          scrollwheel: currentSettings.mapBase.allowScrollWheel,
          disableDefaultUI: currentSettings.mapBase.hideUI,
          disableDoubleClickZoom: currentSettings.mapBase.noDoubleClickZoom
        };

        // Instantiate the Google Map and store it using jQuery's data API on the input element.
        // This ensures the map instance is directly associated with the element that triggered the plugin.
        const googleMapInstance = new google.maps.Map(mapDisplayWrapper[0], mapOptions);
        jq.data(this, 'activeGoogleMap', googleMapInstance);
        jq.data(this, 'currentLocationMarker', null); // Initialize marker reference.
      });
    }],

    /**
     * Stage 3: Handles user input, applies a debounce mechanism, and initiates geocoding requests.
     * @param {object} currentSettings - The effective configuration.
     */
    processUserInput: [function(currentSettings) {
      // Local variables for debounce timer and tracking the last geocoded query.
      let debounceTimerHandle = null;
      let lastGeocodedQuery = '';

      this.on("geoLocatePlugin.processUserInput", function() {
        const inputSource = jq(this);
        // Sanitize and normalize the search query: trim, collapse multiple spaces, convert to lowercase.
        const currentSearchText = inputSource.val().trim().replace(/\s{2,}/g, " ").toLowerCase();

        // Clear any existing debounce timer to restart the countdown.
        clearTimeout(debounceTimerHandle);

        // Guard clause: If the query is identical to the last one, skip geocoding.
        if (currentSearchText === lastGeocodedQuery) {
          // console.log("GeoLocator: Input unchanged, suppressing redundant geocode request.");
          return;
        }

        // If the query is empty, trigger a response indicating no results and reset.
        if (!currentSearchText) {
          inputSource.trigger("geoLocatePlugin.handleGeocodeResponse", [[], "NO_INPUT_PROVIDED"]);
          lastGeocodedQuery = ''; // Reset last query as there's no active search.
          return;
        }

        // Set a new debounce timer. The geocoding request will fire after the delay.
        debounceTimerHandle = setTimeout(() => {
          lastGeocodedQuery = currentSearchText; // Update the last successfully processed query.
          console.info(`GeoLocator: Initiating geocode for: "${currentSearchText}"`);

          // Execute the geocoding request using the shared resolver instance.
          mapCoordinateResolver.geocode({ address: currentSearchText }, (responseResults, queryStatus) => {
            inputSource.trigger("geoLocatePlugin.handleGeocodeResponse", [responseResults, queryStatus]);
          });
        }, currentSettings.timing.searchDelayMs);
      });
    }],

    /**
     * Stage 4: Processes the geocoding API response, updates the map, and positions the marker.
     * @param {object} currentSettings - The effective configuration.
     */
    handleGeocodeResponse: [function(currentSettings) {
      this.on("geoLocatePlugin.handleGeocodeResponse", function(eventObject, resolvedLocations, responseStatus) {
        const mapReference = jq.data(this, 'activeGoogleMap');
        let markerReference = jq.data(this, 'currentLocationMarker');

        // Lazy initialization of the map marker.
        if (!markerReference) {
          markerReference = new google.maps.Marker();
          jq.data(this, 'currentLocationMarker', markerReference); // Store the newly created marker.
        }

        // Check if the geocoding operation was successful and yielded results.
        if (responseStatus === google.maps.GeocoderStatus.OK && resolvedLocations && resolvedLocations.length > 0) {
          const primaryResult = resolvedLocations[0];
          const geographicData = primaryResult.geometry;
          const pinpointLocation = geographicData.location;

          // Apply zoom and center settings based on successful geocoding configuration.
          if (currentSettings.successBehavior.zoomLevel === "auto") {
            mapReference.fitBounds(geographicData.viewport); // Auto-adjust zoom to fit the result's viewport.
          } else {
            mapReference.setZoom(currentSettings.successBehavior.zoomLevel);
            mapReference.setCenter(pinpointLocation);
          }

          // Update the marker's position and ensure it's visible on the map.
          markerReference.setPosition(pinpointLocation);
          markerReference.setMap(mapReference);

          // Trigger success event, passing results.
          jq(this).trigger("geoLocatePlugin.locationLocated", [resolvedLocations, responseStatus]);
        } else {
          // Handle geocoding failure or no results scenario.
          console.warn(`GeoLocator: Geocoding request failed or returned no results. Status: ${responseStatus}`);

          // Remove the marker from the map if it was previously displayed.
          if (markerReference) {
            markerReference.setMap(null);
          }

          // Reset the map to its initial default state.
          mapReference.setZoom(currentSettings.mapBase.zoomLevel);
          mapReference.setCenter(currentSettings.mapBase.initialMapCenter);

          // Trigger failure event, passing status.
          jq(this).trigger("geoLocatePlugin.locationNotLocated", [resolvedLocations, responseStatus]);
        }
      });
    }],

    // Placeholder arrays for custom user-defined callback functions.
    // These events can be hooked into by users of the plugin.
    locationLocated: [],
    locationNotLocated: []
  };

  /**
   * Default configuration options for the geoLocator plugin.
   * These can be overridden by passing an options object to the plugin.
   */
  geoLocatePlugin.defaultOptions = {
    // Styling and placement of the map container.
    displayClasses: {
      containerClass: "geo-map-display-area", // CSS class for the map div.
      // Where to insert the map container relative to the input.
      // Options: "before", "after", or a valid jQuery selector (e.g., "#map-container-id").
      insertionStrategy: "after"
    },

    // Timing-related settings.
    timing: {
      // Delay (in milliseconds) after user input before a geocode request is made.
      searchDelayMs: 650 // Slightly increased delay for improved performance and reduced API calls.
    },

    // Behavior when a geocoding request is successful.
    successBehavior: {
      // Zoom level to apply after a successful geocode. "auto" will fit bounds.
      zoomLevel: "auto"
    },

    // Base settings for the Google Map instance.
    mapBase: {
      zoomLevel: 2, // Default zoom level for the map.
      startCoordinates: [40, -100], // Changed initial center coordinates (e.g., somewhere in central US).
      isDraggable: false, // Prevents map dragging by default.
      mapTileType: google.maps.MapTypeId.ROADMAP, // Type of map tiles to display.
      allowScrollWheel: false, // Disables zooming via mouse scroll wheel.
      hideUI: true, // Hides default Google Map UI controls.
      noDoubleClickZoom: true // Disables zooming on double-click.
    }
  };

})(jQuery);