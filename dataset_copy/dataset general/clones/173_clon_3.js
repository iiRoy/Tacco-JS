// Configuration object holding various display parameters for the geographical icons.
// These settings control dimensions, colors, and border properties of the generated visuals.
const visualConfiguration = {
  canvasSize: 72,       // Desired pixel dimension (width and height) for the final icons.
  internalPadding: 3,   // Spacing in pixels around the map feature within its canvas.
  regionFillColor: "#5c5c5c", // Hex code for the interior color of geographic regions.
  outlineStrokeColor: "#0a0a0a", // Hex code for the border color of geographic regions.
  outlineThickness: 1   // Pixel thickness of the border stroke.
};

// A floating informational box, acting as a tooltip, dynamically positioned.
// It is initially hidden and becomes visible on mouse interaction with icons.
const dynamicInfoBox = d3.select("body").append("div")
  .attr("class", "data-hover-tip") // Custom CSS class for styling.
  .style("position", "absolute")
  .style("visibility", "hidden") // Controls visibility (hidden/visible).
  .style("background-color", "rgba(0,0,0,0.75)") // Semi-transparent dark background.
  .style("color", "white")
  .style("padding", "6px 10px")
  .style("border-radius", "4px")
  .style("font-family", "Arial, sans-serif")
  .style("font-size", "12px")
  .style("pointer-events", "none"); // Ensures it doesn't block mouse events for underlying elements.

// D3 selections for the SVG and PNG export buttons.
const downloadSvgButton = d3.select("button#vectorSave");
const downloadPngButton = d3.select("button#rasterSave");

// Attach click event handlers to the export buttons.
downloadSvgButton.on("click", () => {
  // Select all SVG elements residing in the vector preview area.
  const allVectorElements = d3.select("#vectorPreview").selectAll("svg");
  // Iterate over each selected SVG and trigger the export function.
  allVectorElements.each(initiateSvgDownload);
});

downloadPngButton.on("click", () => {
  // Select all canvas elements residing in the raster preview area.
  const allRasterElements = d3.select("#rasterPreview").selectAll("canvas");
  // Iterate over each selected canvas and trigger the export function.
  allRasterElements.each(initiatePngDownload);
});

// Use d3-queue to asynchronously load multiple data files in parallel.
// The `await` callback will be invoked once all data requests are complete.
d3.queue()
  .defer(d3.json, "data/world-110m.json") // Loads TopoJSON data for world map.
  .defer(d3.tsv, "data/world-110m-country-names.tsv") // Loads TSV data for country names.
  .await(processGeographicData); // Callback function to handle loaded data.

/**
 * Main entry point after all necessary data files have been loaded.
 * This function orchestrates the creation of both vector and raster map icons.
 * @param {Error} fetchError - An error object if any data loading failed.
 * @param {Object} worldTopoJson - The TopoJSON object containing world geometry.
 * @param {Array<Object>} countryNameRecords - An array of objects, each with 'id' and 'name'.
 */
function processGeographicData(fetchError, worldTopoJson, countryNameRecords) {
  // Crucial check: If there's an error during data loading, log it and abort.
  if (fetchError) {
    console.error("Data acquisition failed:", fetchError);
    // User feedback: display a simple message on the page.
    d3.select("body").append("p").attr("class", "error-msg").text("Failed to load map data. Check console for details.");
    return; // Exit the function to prevent further errors.
  }

  // Build a fast lookup map from country ID (number) to country name (string).
  const countryIdToLabel = new Map();
  countryNameRecords.forEach(record => {
    // Ensure ID is treated as an integer for consistent lookup.
    countryIdToLabel.set(parseInt(record.id, 10), record.name);
  });

  // Step 1: Generate the vector-based (SVG) geographical icons.
  constructVectorIcons(worldTopoJson, countryIdToLabel);

  // Step 2: Once SVGs are created, iterate through them to generate raster (PNG) versions.
  const createdSvgElements = d3.select("#vectorPreview").selectAll("svg");
  createdSvgElements.each(convertSvgToCanvas);
}

/**
 * Generates and appends SVG elements representing individual countries to the DOM.
 * Each SVG is a scaled and projected map of a country.
 * @param {Object} geoData - TopoJSON data for geographic features.
 * @param {Map<number, string>} countryLabelsMap - Map for country ID to name lookup.
 */
function constructVectorIcons(geoData, countryLabelsMap) {
  // Convert TopoJSON objects to GeoJSON features for D3's geo path generator.
  const geoFeaturesCollection = topojson.feature(geoData, geoData.objects.countries).features;

  // Predefined projection configurations for specific countries.
  // This allows for custom projections for large or complex regions.
  const specializedProjections = {
    643: () => d3.geoAlbers().rotate([-105, 0]).center([-10, 65]).parallels([52, 64]), // Russia's Albers projection.
    840: () => d3.geoAlbersUsa(), // USA-specific Albers projection.
  };

  // Select the target container, bind the geographical data, and create new SVG elements for each feature.
  d3.select("#vectorPreview").selectAll("svg.country-map-icon") // Selects existing icons or prepares for new ones.
    .data(geoFeaturesCollection, d => d.id) // Key function for data binding (country ID).
    .enter().append("svg")
      .attr("class", "country-map-icon") // Add a class for specific styling/selection.
      .each(function(featureDatum) {
        // Dynamically select a projection based on the country's ID, defaulting to Mercator.
        const activeProjection = specializedProjections[featureDatum.id] ?
                                 specializedProjections[featureDatum.id]() :
                                 d3.geoMercator();
        
        // Initialize the D3 path generator with the chosen projection.
        const pathCreator = d3.geoPath().projection(activeProjection);

        // Calculate the bounding box of the geographic feature.
        const [[xMin, yMin], [xMax, yMax]] = pathCreator.bounds(featureDatum);
        const featureWidth = xMax - xMin;
        const featureHeight = yMax - yMin;
        
        // Determine the overall scaling factor to fit the feature within the icon boundaries.
        const availableSpace = visualConfiguration.canvasSize - 2 * visualConfiguration.internalPadding;
        const currentScale = Math.min(
          availableSpace / featureWidth,
          availableSpace / featureHeight
        );

        // Calculate the translation needed to center the feature, accounting for scaling and padding.
        const translationX = (visualConfiguration.internalPadding / currentScale) +
                             ((availableSpace - featureWidth * currentScale) / (2 * currentScale)) - xMin;
        const translationY = (visualConfiguration.internalPadding / currentScale) +
                             ((availableSpace - featureHeight * currentScale) / (2 * currentScale)) - yMin;

        // Apply attributes to the newly created SVG element.
        d3.select(this)
          .attr("width", visualConfiguration.canvasSize)
          .attr("height", visualConfiguration.canvasSize)
          .attr("viewBox", `0 0 ${visualConfiguration.canvasSize} ${visualConfiguration.canvasSize}`) // Defines the internal coordinate system.
          .attr("preserveAspectRatio", "xMidYMid meet") // Ensures scaling maintains aspect ratio and centers content.
          .attr("id", countryLabelsMap.get(featureDatum.id) || `country-${featureDatum.id}`) // Use country name as ID, or a fallback.
          .append("g") // Group element to apply transformations to all contained paths.
            .attr("transform", `scale(${currentScale})translate(${translationX},${translationY})`)
          .append("path") // The actual geographical path element.
            .style("fill", visualConfiguration.regionFillColor)
            .style("stroke", visualConfiguration.outlineStrokeColor)
            .style("stroke-width", `${visualConfiguration.outlineThickness / currentScale}px`) // Adjust stroke thickness for scale.
            .attr("d", pathCreator(featureDatum)); // Set the path data.
      })
      .sort((a, b) => a.id - b.id) // Sort the SVG elements by country ID for consistent order.
      .on("click", initiateSvgDownload) // Allow individual SVG download on click.
      .on("mouseover", function(datum) {
        const countryLabel = countryLabelsMap.get(datum.id);
        if (countryLabel) { // Only show tooltip if a name is found.
          dynamicInfoBox.html(`<strong>${countryLabel}</strong>`)
            .style("visibility", "visible")
            .style("left", (d3.event.pageX + 12) + "px") // Position relative to mouse cursor.
            .style("top", (d3.event.pageY - 18) + "px");
        }
      })
      .on("mousemove", function() { // Update tooltip position as mouse moves.
        dynamicInfoBox
          .style("left", (d3.event.pageX + 12) + "px")
          .style("top", (d3.event.pageY - 18) + "px");
      })
      .on("mouseout", () => {
        dynamicInfoBox.style("visibility", "hidden"); // Hide tooltip on mouse exit.
      });
}

/**
 * Converts a given SVG element into a rasterized image on a Canvas element.
 * The resulting Canvas is appended to the raster preview area.
 * @param {SVGElement} elementToRasterize - The SVG DOM element to be processed (implicitly `this` context).
 */
function convertSvgToCanvas(elementToRasterize) {
  const currentSvgSelection = d3.select(this);
  const svgNodeId = currentSvgSelection.attr("id");

  // Ensure proper XML namespace attributes are present for correct SVG serialization.
  standardizeSvgNamespaces(currentSvgSelection);

  // Serialize the SVG DOM node into an XML string.
  const serializedSvgString = (new XMLSerializer()).serializeToString(currentSvgSelection.node());
  // Create a data URI for the SVG string, which can be used as an image source.
  const svgImageSource = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(serializedSvgString)}`;

  // Create a new canvas element to hold the rasterized image.
  const newCanvasElement = d3.select("#rasterPreview").append("canvas")
    .attr("id", `${svgNodeId}.png`) // Assign an ID with a .png suffix.
    .attr("width", visualConfiguration.canvasSize)
    .attr("height", visualConfiguration.canvasSize);

  const canvasContext = newCanvasElement.node().getContext("2d");

  // Attach event listeners to the newly created canvas element.
  newCanvasElement
    .on("click", initiatePngDownload) // Allow individual PNG download on click.
    .on("mouseover", function() {
      const canvasId = this.id;
      // Extract the base name from the canvas ID (e.g., "Germany.png" -> "Germany").
      const baseName = canvasId.split(".")[0];
      dynamicInfoBox.html(`<strong>${baseName}</strong> (PNG)`)
        .style("visibility", "visible")
        .style("left", (d3.event.pageX + 12) + "px")
        .style("top", (d3.event.pageY - 18) + "px");
    })
    .on("mousemove", function() {
      dynamicInfoBox
        .style("left", (d3.event.pageX + 12) + "px")
        .style("top", (d3.event.pageY - 18) + "px");
    })
    .on("mouseout", () => {
      dynamicInfoBox.style("visibility", "hidden");
    });

  // Create an Image object, set its source to the SVG data URI, and draw it onto the canvas.
  const tempImage = new Image();
  tempImage.onload = () => {
    canvasContext.drawImage(tempImage, 0, 0, visualConfiguration.canvasSize, visualConfiguration.canvasSize);
  };
  tempImage.onerror = (err) => {
    console.error(`Error loading SVG (${svgNodeId}) into image for rasterization:`, err);
  };
  tempImage.src = svgImageSource;
}

/**
 * Triggers the download of an SVG element as a .svg file.
 * @param {SVGElement} targetSvgElement - The SVG DOM element to be downloaded (implicitly `this` context).
 */
function initiateSvgDownload(targetSvgElement) {
  const currentSvgSelection = d3.select(this);
  const outputFilename = currentSvgSelection.attr("id") || "unnamed-vector";

  // Ensure the SVG has correct XML namespace attributes for proper file saving.
  standardizeSvgNamespaces(currentSvgSelection);
  
  // Explicitly add XML and DOCTYPE declarations for standalone SVG file validity.
  const svgXmlDeclaration = '<?xml version="1.0" standalone="no"?>';
  const svgDoctypeDeclaration = '<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">';
  const serializedSvg = (new XMLSerializer()).serializeToString(currentSvgSelection.node());
  
  const svgBlobContent = new Blob([svgXmlDeclaration, svgDoctypeDeclaration, serializedSvg], { type: "image/svg+xml" });
  const blobUrl = window.URL.createObjectURL(svgBlobContent);

  // Create a temporary anchor element to facilitate the download.
  const tempDownloadLink = d3.select("body").append("a")
    .attr("class", "download-trigger-link")
    .attr("download", `${outputFilename}.svg`)
    .attr("href", blobUrl)
    .style("display", "none");

  // Programmatically click the link to start the download.
  tempDownloadLink.node().click();

  // Clean up the temporary URL and link after a short delay.
  setTimeout(() => {
    window.URL.revokeObjectURL(blobUrl);
    tempDownloadLink.remove();
  }, 180); // A slightly longer delay for browser processing.
}

/**
 * Triggers the download of a Canvas element as a .png file.
 * @param {HTMLElement} targetCanvasElement - The Canvas DOM element to be downloaded (implicitly `this` context).
 */
function initiatePngDownload() {
  const currentCanvasSelection = d3.select(this);
  const outputFilename = currentCanvasSelection.attr("id") || "unnamed-raster.png";

  // Validate that 'this' is indeed a canvas element.
  const canvasNode = currentCanvasSelection.node();
  if (!(canvasNode instanceof HTMLCanvasElement) || typeof canvasNode.toDataURL !== 'function') {
    console.error("Attempted to download PNG from an invalid or non-canvas element.");
    return; // Abort if not a valid canvas.
  }

  // Get the data URL of the canvas content as a PNG image.
  const pngDataUrl = canvasNode.toDataURL("image/png");

  // Create a temporary anchor element for the download.
  const tempDownloadLink = d3.select("body").append("a")
    .attr("class", "download-trigger-link")
    .attr("download", outputFilename)
    .attr("href", pngDataUrl)
    .style("display", "none");

  // Programmatically click the link.
  tempDownloadLink.node().click();

  // Clean up the temporary link after a brief moment.
  setTimeout(() => {
    tempDownloadLink.remove();
  }, 180); // A slightly longer delay.
}

/**
 * Ensures that an SVG element has the correct and complete XML namespace attributes.
 * This is crucial for proper serialization and rendering in different contexts.
 * @param {D3Selection} svgSelection - A D3 selection representing the SVG element.
 */
function standardizeSvgNamespaces(svgSelection) {
  const svgDomNode = svgSelection.node();
  if (!svgDomNode || !(svgDomNode instanceof SVGElement)) {
    console.warn("Namespace standardization attempted on a non-SVG or null node.");
    return; // Guard against invalid nodes.
  }

  // Remove any existing, potentially redundant or incorrect namespace attributes.
  svgDomNode.removeAttribute("xmlns");
  svgDomNode.removeAttribute("xmlns:xlink"); // Older xlink namespace might not be needed but removed for cleanliness.

  // Add the standard SVG XML namespace if it's not present.
  if (!svgDomNode.hasAttributeNS(d3.ns.prefix.xmlns, "xmlns")) {
    svgDomNode.setAttributeNS(d3.ns.prefix.xmlns, "xmlns", d3.ns.prefix.svg);
  }
  // Add the XLINK namespace if it's missing (often required for older tools or specific SVG features).
  if (!svgDomNode.hasAttributeNS(d3.ns.prefix.xmlns, "xmlns:xlink")) {
    svgDomNode.setAttributeNS(d3.ns.prefix.xmlns, "xmlns:xlink", d3.ns.prefix.xlink);
  }
}