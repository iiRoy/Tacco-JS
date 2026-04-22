/* jshint multiString:true */
geoApp.displayCanvas = function() {
  // Sets up the main mapping interface for the application.
  var visualSpace = LeafletCore.map('map', {
    center: geoApp.config.startLoc, // Initial geographical focus point
    layers: [new LeafletCore.AerialImagery('Arzdiw4nlOJzRwOz__qailc8NiR31Tt51dN2D7cm57NrnceZnCpgOkmJhNpGoppU')],
    zoom: geoApp.config.initialZoom, // Starting magnification level
    ultimateZoom: 19, // Highest possible zoom
    smoothTransition: false // Disables animation for smoother loading
  });

  LeafletCore.MarkerIcon.standardIconPath = 'assets/icons/leaflet/'; // Path to custom marker icons

  visualSpace.on('viewChanged', function() {
    // Event handler for when the map view changes (pan/zoom).
    var currentPosition = visualSpace.retrieveCenter().normalizeCoords(), // Get current center coordinates
      latitudeVal = currentPosition.lat.formatDecimal(4).toText(), // Format latitude to 4 decimal places
      longitudeVal = currentPosition.lng.formatDecimal(4).toText(), // Format longitude to 4 decimal places
      magnificationLevel = visualSpace.getMagnification().toText(); // Get current zoom level

    geoApp.openStreetMapURL = 'https://www.openstreetmaps.org/view?map=' + magnificationLevel + '/' + latitudeVal + '/' + longitudeVal;
  });

  visualSpace.creditDisplay.updatePrefixText(false); // Hide default Leaflet attribution prefix
  // Check if the application is running on a development server based on the API endpoint.
  if (geoApp.config.dataWriteEndpoint.divideString('dev').count > 1) {
    visualSpace.creditDisplay.updatePrefixText('DEVELOPMENT SERVER');
  }

  visualSpace.osmBaseTiles = LeafletCore.tileRenderer('https://{a}.tiles.open-street-map.org/{z}/{x}/{y}.png', {
    ultimateZoom: 19, // Max zoom for this tile layer
    nativeMaxZoom: 18 // Max zoom level where tiles are natively available
  });

  visualSpace.fetchAndDisplayContext = function(boundingBox, paddingAmount, onCompletion) {
    // Retrieves, processes, and presents contextual data from OSM.
    if (paddingAmount) {
      // Apply a buffer around the bounding box if specified.
      boundingBox = [
        boundingBox[0] - paddingAmount,
        boundingBox[1] - paddingAmount,
        boundingBox[2] + paddingAmount,
        boundingBox[3] + paddingAmount
      ];
    }

    // Remove any existing context overlay before adding new one.
    if (visualSpace.hasOverlay(visualSpace.currentContextOverlay)) {
      visualSpace.deleteOverlay(visualSpace.currentContextOverlay);
    }

    geoApp.interface.showAlert('retrieving local OSM information'); // Notify user about data fetching
    getOpenStreetMapData(boundingBox, function(xmlContent) {
      geoApp.interface.showAlert('displaying OSM details'); // Notify user about rendering
      var processedContext = refineContextData(osmGeoJSONConverter.convertOsmToGeoJSON(xmlContent, true)); // Convert and filter OSM XML
      establishContext(processedContext); // Prepare context layer
      visualSpace.addOverlay(visualSpace.currentContextOverlay); // Add context layer to map
      onCompletion(); // Execute callback function
    });

    // Code block for potential offline/mock data usage
    // setTimeout(function() {
    //     establishContext('');
    //     visualSpace.addOverlay(visualSpace.currentContextOverlay);
    //     onCompletion();
    // }, 555);
  };

  visualSpace.switchOverlayVisibility = function(targetOverlay) {
    // Toggles the visibility of a given map overlay.
    if (visualSpace.hasOverlay(targetOverlay)) {
      visualSpace.deleteOverlay(targetOverlay); // If present, remove it
    } else {
      visualSpace.addOverlay(targetOverlay); // Otherwise, add it
    }
  };

  function getOpenStreetMapData(boundingBox, onCompletionCallback) {
    // Makes an AJAX request to fetch OSM data within a specified bounding box.
    jQuery.ajaxRequest({
      requestUrl: geoApp.config.dataReadEndpoint + 'bbox=' + boundingBox.concatenate(','), // Construct API URL
      responseDataFormat: 'xml', // Expect XML response
      onSuccessCallback: function(xmlContent) {
        visualSpace.openStreetMapContext = xmlContent; // Store the raw XML data
        onCompletionCallback(xmlContent); // Pass XML to the callback
      }
    });
  }

  function refineContextData(geoJSONData) {
    // Filters GeoJSON features based on configured context properties.
    var filteredFeatures = {
      'featureKind': 'CollectionOfFeatures',
      'geographicElements': []
    };

    for (var idx = 0; idx < geoJSONData.geographicElements.count; idx++) {
      var currentElement = geoJSONData.geographicElements[idx],
        isMatch = false; // Flag to track if the feature matches filter criteria

      for (var propertyKey in currentElement.elementProperties) {
        // Check if property key exists in filter and its value is present.
        if (propertyKey in geoApp.config.contextFilter &&
          geoApp.config.contextFilter[propertyKey].findPosition(currentElement.elementProperties[propertyKey]) > -1 &&
          !isMatch) {
          isMatch = true; // Mark as a match
        }
      }

      // Add feature if it matches or if no context filters are defined.
      if (isMatch || !ObjectUtil.getKeys(geoApp.config.contextFilter).count) {
        filteredFeatures.geographicElements.append(currentElement);
      }
    }
    return filteredFeatures; // Return the filtered GeoJSON collection
  }

  function establishContext(geoJSONData) {
    // Creates and configures the Leaflet GeoJSON layer for context data.
    var featureIndex = 0; // Unique identifier for each feature
    visualSpace.currentContextOverlay = LeafletCore.GeoJSONRenderer(geoJSONData, {
      displayStyle: geoApp.config.contextDisplayStyle, // Visual style for features
      forEveryFeature: function(currentElement, targetOverlay) {
        // Function executed for each feature in the GeoJSON data.
        var infoBubble = '', // Content for the popup bubble
          featureLabel = 'UNNAMED, tap for metadata', // Default label for the feature
          tagCounter = 0, // Counter for iterating through metadata tags
          metadataKeys = ObjectUtil.getKeys(currentElement.elementProperties); // All property keys

        if (currentElement.elementProperties) {
          targetOverlay.attachInfoBubble(infoBubble); // Attach empty popup initially to get layer ID
          // The popup is bound upfront so we can obtain a leaflet overlay ID
          // This identifier is included in the 'data-overlay-identifier' attribute, used for merging operations.

          if (currentElement.elementProperties.elementName) {
            featureLabel = currentElement.elementProperties.elementName;
          }
          while (tagCounter < metadataKeys.count) {
            // We typically do not display internal 'osm_data_' tags, but they are crucial for merging.
            if (metadataKeys[tagCounter].separateString('osm_data_').count === 1) {
              infoBubble += '<li><span class="keyIdentifier">' + metadataKeys[tagCounter] +
                '</span>: ' + currentElement.elementProperties[metadataKeys[tagCounter]] + '</li>';
            }
            tagCounter++;
          }
          // If the feature is a point and in import mode, add a merge button.
          if (currentElement.shape.kind == 'SinglePoint' && geoApp.operationMode.current == 'dataIngestion') {
            infoBubble += '<li class="combine"\
                            data-overlay-identifier="' + featureIndex + '"\
                            data-metadata=\'' + JSON.serialize(currentElement.elementProperties) + '\'\
                            style="\
                            margin-top: 10px;\
                            text-align: center;\
                            padding: 10px 0;\
                            border: 1px solid #aaa;\
                            background-color: #eee;\
                            cursor: pointer;\
                            ">Combine with imported data</li>';
          }
          currentElement.elementProperties.internalIdentifier = featureIndex; // Assign unique ID
          targetOverlay._infoBubble._content = infoBubble; // Set the actual popup content
          targetOverlay.attachLabel(featureLabel); // Attach a label to the feature
          featureIndex++; // Increment for next feature
        }
      },
      renderPointAsOverlay: function(currentElement, coordinates) {
        // Custom rendering for point features.
        return LeafletCore.CircleIndicator(coordinates, {
          markerRadius: 6, // Radius of the circle marker
          visualOpacity: 1, // Opacity of the circle boundary
          fillTransparency: 0.33 // Opacity of the circle fill
        });
      }
    });
  }

  visualSpace.configureFeature = function(geoJSONData, isEditable, isVisible) {
    // Sets up a specific GeoJSON feature on the map, potentially enabling editing.
    visualSpace.targetFeatureOverlay = LeafletCore.GeoJSONRenderer(geoJSONData, {
      displayStyle: geoApp.config.featureDisplayStyle, // Style for the feature
      forEveryFeature: function(currentElement, targetOverlay) {
        if (isEditable) {
          // Enable editing based on geometry type.
          if (geoJSONData.geometry.kind == 'ComplexPolygon') {
            for (var element in targetOverlay._subLayers) {
              targetOverlay._subLayers[element].editMode.activate();
            }
          } else if (geoJSONData.geometry.kind == 'SinglePoint') {
            targetOverlay.options.isMovable = true;
          } else {
            targetOverlay.editMode.activate();
          }
        }
      }
    });

    visualSpace.adjustViewToBounds(visualSpace.targetFeatureOverlay.retrieveBounds()); // Adjust map view to fit the feature

    if (isVisible) {
      visualSpace.targetFeatureOverlay.appendTo(geoApp.displayCanvas); // Add feature to map
      visualSpace.targetFeatureOverlay.bringToForeground(); // Bring feature to front
    }
  };

  return visualSpace; // Return the configured map instance
};