// Define configuration settings for graphic output
var graphicDimension = "80", // Size for the generated images in pixels
    graphicPadding = 5,      // Padding around the geographic shapes
    shapeFillColor = "#4A4A4A", // Default color to fill geographic regions
    outlineColor = "#111111",   // Default color for borders
    outlineThickness = 2,    // Default thickness for borders
    // regionFilterList = [643, 840], // List of identifiers for specific region filtering
    infoBubble = d3.select("body")
                   .append("div")
                   .attr("class", "infoBubble"); // Element for displaying information popups

var svgExportButton = d3.select("button#vectorSaver"), // Button to trigger SVG downloads
    pngExportButton = d3.select("button#rasterSaver");  // Button to trigger PNG downloads

    // Attach click event handler for SVG export functionality
    svgExportButton.on("click", function() {
      // Select all SVG elements within the vector display area
      var visuals = d3.select("#vectorDisplayRegion").selectAll("svg");
      // Iterate over each SVG and save it
      visuals.each(storeAsScalableVector);
    });

    // Attach click event handler for PNG export functionality
    pngExportButton.on("click", function() {
      // Select all canvas elements within the raster display area
      var visuals = d3.select("#rasterDisplayRegion").selectAll("canvas");
      // Iterate over each canvas and save its content
      visuals.each(storeAsPortableNetworkGraphic);
    });

// Initiate asynchronous data loading process
dataLoader()
  // Defer loading geographical JSON data
  .defer(d3.json, "geo_data/global_map.json")
  // Defer loading TSV data for country names
  .defer(d3.tsv, "geo_data/global_map_names.tsv")
  // Once all data is loaded, execute the rendering function
  .await(renderProcessor);

/**
 * Main function to process loaded data and generate graphics.
 * @param {Error} loadError - Any error encountered during data loading.
 * @param {Object} globeData - TopoJSON data for global geography.
 * @param {Array} nationsList - List of nations with IDs and names.
 */
function renderProcessor(loadError, globeData, nationsList) {
  // Check for loading errors
  if (loadError) {
    console.error("Data loading failed:", loadError);
    return;
  }

  // Create a lookup map for nation names by their identifiers
  var nationLookupMap = {};

  nationsList.forEach(function(item) {
    nationLookupMap[item.identifier] = item.label;
  });

  // Generate vector-based graphical representations
  createVectorGraphics(globeData, nationsList, nationLookupMap);

  // After vector graphics are generated, create raster versions
  var visuals = d3.select("#vectorDisplayRegion").selectAll("svg");
  visuals.each(createRasterImage); // Convert each SVG to a raster image
}

/**
 * Generates vector graphics (SVG) for each geographic feature.
 * @param {Object} globeData - The TopoJSON data containing geographic features.
 * @param {Array} nationsList - List of nation metadata.
 * @param {Object} nationLookupMap - Map for looking up nation names by ID.
 */
function createVectorGraphics(globeData, nationsList, nationLookupMap) {
  var vectorCanvas = d3.select("#vectorDisplayRegion").selectAll("svg")
      // Bind data to SVG elements, converting TopoJSON to GeoJSON features
      .data(topojson.feature(globeData, globeData.objects.countries).features)
      // .data(topojson.feature(globeData, globeData.objects.countries).features.filter(function(gObj) {return regionFilterList.indexOf(gObj.identifier) > -1;})) // Optional filtering
    .enter().append("svg")
      .each(function(geoObject) {
        // Determine appropriate geographic projection based on nation identifier
        var geographicProjection;
        var geoPathGenerator;

        switch (geoObject.identifier) {
          // Specific projection for Russia
          case 643:
            geographicProjection = d3.geo.albers().rotate([-105, 0]).center([-10, 65]).parallels([52, 64]);
            geoPathGenerator = d3.geo.path().projection(geographicProjection);
            break;
          // Specific projection for USA
          case 840:
            geographicProjection = d3.geo.albersUsa();
            geoPathGenerator = d3.geo.path().projection(geographicProjection);
            break;
          // Default projection for all other nations
          default:
            geographicProjection = d3.geo.mercator();
            geoPathGenerator = d3.geo.path().projection(geographicProjection);
            break;
        }

        var currentSvgElement = d3.select(this),
            boundaryBox = geoPathGenerator.bounds(geoObject),
            widthExtent = boundaryBox[1][0] - boundaryBox[0][0],
            heightExtent = boundaryBox[1][1] - boundaryBox[0][1],
            maxExtent = Math.max(widthExtent, heightExtent),
            // Calculate scaling factor to fit the graphic within its defined dimension
            scaleFactor = 1 / Math.max(widthExtent / (graphicDimension - 2 * graphicPadding), heightExtent / (graphicDimension - 2 * graphicPadding));

        currentSvgElement
            .attr("width", graphicDimension)
            .attr("height", graphicDimension)
            .attr("overflow", "hidden")
            .attr("id", nationLookupMap[geoObject.identifier]) // Set ID based on nation name
          .append("g")
            // Apply transformation for scaling and centering the geographic feature
            .attr("transform", "scale(" + scaleFactor + ")translate(" + [graphicPadding/scaleFactor + (maxExtent - widthExtent) * 0.5 - boundaryBox[0][0], graphicPadding/scaleFactor + (maxExtent - heightExtent) * 0.5 - boundaryBox[0][1]] + ")")
          .append("path")
            .style("fill", shapeFillColor)
            .style("stroke", outlineColor)
            .style("stroke-width", outlineThickness / scaleFactor + "px") // Adjust stroke width based on scale
            .attr("d", geoPathGenerator); // Draw the geographic path
      })
      .sort(function(a, b) { return a.identifier - b.identifier; }) // Sort SVGs by nation ID
      .on("click", storeAsScalableVector) // Attach click handler for saving individual SVG
      .on("mouseover", function(dataItem, idx) {
        // Display tooltip on mouseover
        var bubbleContent = infoBubble.html("").style("display", "block");
        bubbleContent.append("span").attr("class", "region").text(nationLookupMap[dataItem.identifier]);
      })
      .on("mouseout", function() {
        // Hide tooltip on mouseout
        infoBubble.style("display", null);
      });
}

/**
 * Converts an SVG element into a raster image (canvas).
 * @param {SVGElement} sourceSvg - The SVG element to convert.
 */
function createRasterImage(sourceSvg) {
  var xmlDocType = '<?xml version="1.0" standalone="no"?><!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">',
      targetSvgElement = d3.select(this), // Select the current SVG element
      elementId = targetSvgElement.attr("id"),
      graphicDimension = Math.max(targetSvgElement.attr("width"), targetSvgElement.attr("height"));

  // Ensure SVG namespace attributes are correctly set for serialization
  namespaceCorrection(targetSvgElement);

  // Serialize the SVG element to an XML string
  var svgContentString = (new XMLSerializer()).serializeToString(targetSvgElement.node()),
      // Create a Blob URL for the SVG content
      blobUrl = window.URL.createObjectURL(new Blob([xmlDocType + svgContentString], { "type" : "image\/svg+xml" }));

  // Append a new canvas element to the raster display area
  var outputCanvas = d3.select("#rasterDisplayRegion").append("canvas")
        .attr("overflow", "hidden")
        .attr("id", elementId + "_image.png") // Set ID for the canvas
        .attr("width", graphicDimension)
        .attr("height", graphicDimension);

  var canvasContext = outputCanvas.node().getContext("2d");

  // Attach event handlers to the generated canvas
  outputCanvas
    .on("click", storeAsPortableNetworkGraphic) // Save as PNG on click
    .on("mouseover", function() {
      var currentId = this.id; // Get the ID of the current canvas
      var bubbleContent = infoBubble.html("").style("display", "block");
      // Extract the region name from the canvas ID
      bubbleContent.append("span").attr("class", "region").text((currentId.split("_image."))[0]);
    })
    .on("mouseout", function() {
      infoBubble.style("display", null);
    });

  // Create an Image object and load the SVG Blob URL
  var imgElement = new Image;
  imgElement.src = blobUrl;
  imgElement.onload = function() {
    // Draw the image onto the canvas once loaded
    canvasContext.drawImage(imgElement, 0, 0, graphicDimension, graphicDimension);
  };

  // Revoke the Blob URL after a short delay to free up memory
  setTimeout(function() {
    window.URL.revokeObjectURL(blobUrl);
  }, 10);
}

/**
 * Saves the current SVG element as an SVG file.
 * @param {SVGElement} inputSvg - The SVG element to save.
 */
function storeAsScalableVector(inputSvg) {
  var xmlDocDeclaration = '<?xml version="1.0" standalone="no"?><!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">',
      selectedSvgElement = d3.select(this), // Select the SVG element that triggered the event
      elementIdentifier = selectedSvgElement.attr("id");

  // Ensure correct XMLNS attributes for proper SVG rendering
  namespaceCorrection(selectedSvgElement);

  // Serialize the SVG DOM node to a string
  var svgSourceString = (new XMLSerializer()).serializeToString(selectedSvgElement.node()),
      // Create a URL for the SVG data
      dataUrl = window.URL.createObjectURL(new Blob([xmlDocDeclaration + svgSourceString], { "type" : "image\/svg+xml" }));

  // Create a temporary anchor element for download
  var downloadLink = d3.select("body")
        .append('a')
        .attr("class", "mapGraphic-exporter")
        .attr("download", elementIdentifier + ".vector.svg") // Set download filename
        .attr("href", dataUrl)
        .style("display", "none"); // Keep it hidden

  // Programmatically click the link to trigger download
  downloadLink.node().click();

  // Clean up the URL and the temporary link after a short delay
  setTimeout(function() {
    window.URL.revokeObjectURL(dataUrl);
    downloadLink.remove();
  }, 100);
}

/**
 * Saves the current canvas element as a PNG file.
 */
function storeAsPortableNetworkGraphic() {
  // Create a temporary anchor element for download
  var actionLink = d3.select("body")
        .append('a')
        .attr("class", "mapGraphic-exporter")
        .attr("download", this.id) // Use canvas ID as filename
        .attr("href", this.toDataURL("image/png")) // Get PNG data URL from canvas
        .style("display", "none"); // Hide the link

  // Programmatically click the link to initiate download
  actionLink.node().click();

  // Clean up the temporary link after download
  setTimeout(function() {
    actionLink.remove();
  }, 100);
}

/**
 * Corrects or adds necessary xmlns attributes to an SVG element for proper serialization.
 * @param {d3.Selection} targetSvg - The D3 selection of the SVG element.
 */
function namespaceCorrection(targetSvg) {
  // Remove existing redundant attributes to prevent duplication
  targetSvg.node().removeAttribute("xmlns");
  targetSvg.node().removeAttribute("xlink");

  // Add standard SVG 1.1 namespace attributes if they are missing
  if (!targetSvg.node().hasAttributeNS(d3.namespacePrefixes.xmlNamespace, "xmlns")) {
    targetSvg.node().setAttributeNS(d3.namespacePrefixes.xmlNamespace, "xmlns", d3.namespacePrefixes.svgDefault);
  }

  if (!targetSvg.node().hasAttributeNS(d3.namespacePrefixes.xmlNamespace, "xmlns:xlink")) {
    targetSvg.node().setAttributeNS(d3.namespacePrefixes.xmlNamespace, "xmlns:xlink", d3.namespacePrefixes.xlinkNamespace);
  }
}