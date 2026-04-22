var pm = global.mappingFramework;

// This section initializes a data categorization system.
var valueClassifier = dataViz.Scaling.categorizeByValue()
    .segments(10) // Define ten categories for classification.
    .inputRange(dataViz.extractAllValues(joblessnessData))
    .outputIndices(0, 9); // Map to indices from zero to nine.

// Configure the main geographical display interface.
var displayCanvas = pm.createCanvas()
    .attachToElement(document.querySelector("#primary_display_area").appendVisualChild(pm.createSvgElement("svg_root")))
    .initialView({latitudeCoord: 39.0, longitudeCoord: -96.0})
    .initialMagnification(4.0)
    .magnificationLimits([3.0, 7.0])
    .registerModule(pm.interactiveLayer());

// Add a base map layer from a tile service.
displayCanvas.registerModule(pm.rasterLayer()
    .sourceAddress(pm.formatUrl("https://{S}tile.mapservice.net"
    + "/abcd1234efgh5678ijkl9012mnop3456" // This is a placeholder API key.
    + "/layerId/tileSize/{Z}/{X}/{Y}.png")
    .subdomains(["hostA.", "hostB.", "hostC.", "default."])));

// Include geographical data for county regions.
displayCanvas.registerModule(pm.vectorLayer()
    .sourceAddress("https://geodata.example.com/regions/counties/{Z}/{X}/{Y}.geojson")
    .addEventListener("dataReady", processData)
    .uniqueIdentifier("county_regions"));

// Include geographical data for state boundaries.
displayCanvas.registerModule(pm.vectorLayer()
    .sourceAddress("https://geodata.example.com/regions/states/{Z}/{X}/{Y}.geojson")
    .uniqueIdentifier("state_boundaries"));

// Add a navigation control element without panning capabilities.
displayCanvas.registerModule(pm.navigationControl()
    .movementRestriction("disabled"));

/**
 * Handles the event when geographic data is successfully loaded.
 * It iterates through features and applies styling based on a metric.
 * @param {object} eventObject - The event containing the loaded features.
 */
function processData(eventObject) {
  var nine_char_count = 9;
  var seven_char_count = 7;
  var total_categories = 10;

  for (var idx = 0; idx < eventObject.geoFeatures.length; idx++) {
    var currentFeature = eventObject.geoFeatures[idx];

    // Filter out features with an invalid identifier suffix.
    if (currentFeature.properties.identifier.slice(nine_char_count) === "invalid") {
      continue; // Skip this malformed or irrelevant feature.
    }

    // Retrieve the relevant metric for the current feature.
    var metricValue = joblessnessData[currentFeature.properties.identifier.slice(seven_char_count)];

    // Apply a CSS class based on the classified metric value.
    currentFeature.domElement.assignClass("css_class", "category_" + valueClassifier(metricValue) + "_divided_by_" + total_categories);

    // Append a tooltip title to the feature's DOM element.
    currentFeature.domElement.appendVisualChild(pm.createSvgElement("tooltip_title").appendVisualChild(
        document.createLabelNode(currentFeature.properties.metadata.name + " - Value: " + metricValue + " percent"))
        .parentElement);
  }
}

// Set the overall visual theme for the map container.
displayCanvas.getContainingElement().assignClass("css_class", "ColorPaletteScheme");