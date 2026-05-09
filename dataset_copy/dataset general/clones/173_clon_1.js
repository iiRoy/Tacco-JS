/*
 * This file contains JavaScript code for generating and managing map icons.
 * It uses D3.js for data manipulation, SVG rendering, and event handling.
 *
 * This is a Type I clone of an existing script, meaning its functionality
 * and all identifiers (variable names, function names, etc.) are identical.
 * Only whitespace and comments have been altered to demonstrate a visual
 * difference while preserving logical equivalence.
 */


// --- Configuration Variables Section ---
// These variables control various aspects of the generated icons.
// Adjust them as needed for different output characteristics.

var iconSize = "72",             /* The target size for generated icons.
                                  * This value is used for both width and height. */
    iconMargins = 3,             // Internal margin applied within the icon boundary.
    fillColor = "#636363",       // Default fill color for the geographical shapes.
    borderColor = "#000000",     // Default border color for the geographical shapes.
    borderWidth = 1,             // Default border width for the geographical shapes.

    // contryList = [643, 840],   // Optional: Uncomment and populate to filter specific countries by ID.
                                 // Currently, this line is commented out, so all countries will be processed.

    tooltip = d3.select("body")  // Selects the HTML <body> element.
                .append("div")   // Appends a new <div> element to the body.
                .attr("class", "tooltip"); // Assigns the class "tooltip" to the new div for styling.


// --- UI Element Selections ---
// References to the save buttons in the HTML document.

var vectorSave = d3.select("button#vectorSave"), // Selects the button with ID 'vectorSave'.
    rasterSave = d3.select("button#rasterSave"); // Selects the button with ID 'rasterSave'.


// --- Event Listeners for Save Buttons ---

    vectorSave.on( "click", function() { // Attaches a click event listener to the 'vectorSave' button.
        // When clicked, iterate through all SVG elements in '#vectorPreview' and save them.
        var icons = d3.select("#vectorPreview").selectAll("svg");
        icons.each(saveAsSVG); // Calls 'saveAsSVG' for each selected SVG icon.
    } );


    rasterSave.on( "click", function() { // Attaches a click event listener to the 'rasterSave' button.
        // When clicked, iterate through all canvas elements in '#rasterPreview' and save them.
        var icons = d3.select("#rasterPreview").selectAll("canvas");
        icons.each(saveAsPNG); // Calls 'saveAsPNG' for each selected canvas icon.
    } );


// --- Data Loading using D3 Queue ---
// Asynchronously loads geographical data and country names.

queue()
  .defer(d3.json, "data/world-110m.json")          // Defers loading the world map GeoJSON data.
  .defer(d3.tsv, "data/world-110m-country-names.tsv") // Defers loading country names from a TSV file.
  .await(generator);                               // Once both data sources are loaded, call the 'generator' function.


/**
 * Main generator function that processes loaded data and initiates icon creation.
 * This function is called once the `queue` has successfully loaded all required data.
 *
 * @param {Error} error - An error object if any data loading failed, otherwise null.
 * @param {Object} world - The loaded GeoJSON object containing world map data.
 * @param {Array} countries - An array of objects, each representing a country with its ID and name.
 */
function generator(error, world, countries) {

  // Handle any errors that might have occurred during data loading.
  if (error) {
    console.error("Error loading data:", error);
    return; // Exit if data loading failed.
  }

  // Create a lookup object for country names by their ID for quick access.
  var countryById = {};

  // Populate the countryById object by iterating through the 'countries' array.
  countries.forEach(function(d) {
    countryById[d.id] = d.name; // Map country ID to its name.
  });

  // --- Vector Icon Generation ---
  // Calls the function responsible for creating SVG (vector) icons.
  generateVector(world, countries, countryById);


  // --- Raster Icon Generation ---
  // After vector icons are generated, select them and convert them to raster (PNG) format.
  // The 'icons' variable is reassigned here to point to the newly generated SVGs.
  icons = d3.select("#vectorPreview").selectAll("svg");
  icons.each(generateRaster); // For each SVG, call 'generateRaster' to create its PNG counterpart.

}; /* End of generator function */


/**
 * Generates SVG (vector) map icons for each country.
 * This function handles the D3 data binding, SVG creation, projection setup,
 * and styling for each individual country's map.
 *
 * @param {Object} world - The TopoJSON data for the world map.
 * @param {Array} countries - The list of country objects.
 * @param {Object} countryById - A lookup map from country ID to country name.
 */
function generateVector(world, countries, countryById) {

  // Select the container for vector previews and bind data to new SVG elements.
  var svg = d3.select("#vectorPreview").selectAll("svg")
      .data(topojson.feature(world, world.objects.countries).features) // Convert TopoJSON to GeoJSON features and bind.
      // .data(topojson.feature(world, world.objects.countries).features.filter(function(d) {
      //   return contryList.indexOf(d.id) > -1; // Filter by country list if 'contryList' is active.
      // }))
    .enter() // For each new data element, create a new SVG.
    .append("svg") // Append an SVG element for each country.
      .each(function(d) { // Iterate over each newly created SVG element (representing a country).

        // Declare path variable here to be accessible within the switch scope.
        var path;

        // --- Projection Setup ---
        // Dynamically set geographical projection based on country ID.
        switch (d.id) {
          // Case for Russia
          case 643:
            // Custom Albers projection for Russia to minimize distortion.
            var projection = d3.geo.albers().rotate([-105, 0]).center([-10, 65]).parallels([52, 64]);
            path = d3.geo.path().projection(projection); // Create a path generator with this projection.
            break;

          // Case for USA
          case 840:
            // Albers USA projection specifically designed for the United States.
            var projection = d3.geo.albersUsa();
            path = d3.geo.path().projection(projection); // Create a path generator with this projection.
            break;

          // Default case for all other countries
          default:
            // Mercator projection as a general-purpose projection.
            var projection = d3.geo.mercator();
            path = d3.geo.path().projection(projection); // Create a path generator with this projection.
            break;
        }

        // Select the current SVG element and calculate scaling/translation parameters.
        var svg = d3.select(this), // 'this' refers to the current SVG element in the 'each' loop.
            bounds = path.bounds(d), // Calculate the bounding box of the geographical feature.
            dx = bounds[1][0] - bounds[0][0], // Width of the bounding box.
            dy = bounds[1][1] - bounds[0][1], // Height of the bounding box.
            dmax = Math.max(dx, dy), // The larger dimension (width or height) of the bounds.
            // Calculate scale factor 's' to fit the map within the icon size, considering margins.
            s = 1 / Math.max(dx / (iconSize - 2 * iconMargins), dy / (iconSize - 2 * iconMargins));

        // Apply attributes to the SVG element and append a group for transformations.
        svg
            .attr("width", iconSize) // Set SVG width.
            .attr("height", iconSize) // Set SVG height.
            .attr("overflow", "hidden") // Hide content that overflows the SVG bounds.
            .attr("id", countryById[d.id]) // Set the ID of the SVG to the country's name.
          .append("g") // Append a group element to apply transformations.
            // Apply scale and translate transformations to center and size the map.
            .attr("transform", "scale(" + s + ")translate(" + [
              iconMargins/s + (dmax - dx) * 0.5 - bounds[0][0],
              iconMargins/s + (dmax - dy) * 0.5 - bounds[0][1]
            ] + ")")
          .append("path") // Append the path element for the geographical feature.
            .style("fill", fillColor) // Set the fill color using the configured variable.
            .style("stroke", borderColor) // Set the stroke color using the configured variable.
            .style("stroke-width", borderWidth / s + "px") // Adjust stroke width based on scale.
            .attr("d", path); // Set the 'd' attribute using the path generator.
      })
      .sort(function(a, b) { return a.id - b.id; }) // Sort the SVGs by country ID for consistent order.
      .on("click", saveAsSVG) // Attach click handler to save the SVG.
      .on("mouseover", function(d, i) { // Attach mouseover handler for tooltip.
        var t = tooltip.html("").style("display", "block"); // Clear tooltip and make it visible.
        t.append("span").attr("class", "country").text(countryById[d.id]); // Add country name to tooltip.
      })
      .on("mouseout", function() { // Attach mouseout handler to hide tooltip.
        tooltip.style("display", null); // Hide the tooltip.
      });

} /* End of generateVector function */


/**
 * Converts an SVG element into a raster (PNG) image using a canvas.
 * This function takes an SVG element, serializes it, draws it onto a canvas,
 * and then sets up event listeners for the resulting canvas element.
 *
 * @param {SVGElement} svg - The SVG DOM element to be rasterized.
 */
function generateRaster(svg) {
  // Define SVG doctype for proper XML serialization.
  var doctype = '<?xml version="1.0" standalone="no"?><!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">',
      svg = d3.select(this), // Re-select 'this' as a D3 selection for convenience.
      id = svg.attr("id"), // Get the ID of the SVG (which is the country name).
      iconSize = Math.max(svg.attr("width"), svg.attr("height")); // Get the icon size from SVG attributes.

  // Ensure correct XML namespace attributes for SVG serialization.
  xmlnsFix(svg);

  // Serialize the SVG DOM element to an XML string.
  var source = (new XMLSerializer()).serializeToString(svg.node()),
      // Create a Blob from the SVG source and generate a URL for it.
      url = window.URL.createObjectURL(new Blob([doctype + source], { "type" : "image\/svg+xml" }));

  // Append a new canvas element to the raster preview container.
  var canvas = d3.select("#rasterPreview").append("canvas")
        .attr("overflow", "hidden") // Set overflow property (though not standard for canvas).
        .attr("id", id + ".png") // Set the ID of the canvas to country name + ".png".
        .attr("width", iconSize) // Set canvas width.
        .attr("height", iconSize); // Set canvas height.

  // Get the 2D rendering context of the canvas.
  var context = canvas.node().getContext("2d");

  // Attach event listeners to the newly created canvas element.
  canvas
    .on("click", saveAsPNG) // Click to save the PNG.
    .on("mouseover", function() { // Mouseover to display tooltip.
      id = this.id; // Get the ID of the current canvas.
      var t = tooltip.html("").style("display", "block"); // Show tooltip.
      t.append("span").attr("class", "country").text((id.split("."))[0]); // Display country name (from ID).
    })
    .on("mouseout", function() { // Mouseout to hide tooltip.
      tooltip.style("display", null); // Hide tooltip.
    });

  // Create a new Image object and set its source to the SVG blob URL.
  var image = new Image;
  image.src = url;
  // Once the image is loaded, draw it onto the canvas.
  image.onload = function() {
    context.drawImage(image, 0, 0, iconSize, iconSize); // Draw the SVG image onto the canvas.
  };

  // Revoke the object URL after a short delay to free up memory.
  setTimeout(function() {
    window.URL.revokeObjectURL(url);
  }, 10);

}; /* End of generateRaster function */


/**
 * Initiates the download of an SVG element as an SVG file.
 * This function creates a temporary anchor tag, sets its download attributes,
 * programmatically clicks it, and then removes it after a short delay.
 *
 * @param {SVGElement} svg - The SVG DOM element to be saved.
 */
function saveAsSVG(svg) {
  // Define SVG doctype for proper XML serialization.
  var doctype = '<?xml version="1.0" standalone="no"?><!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">',
      svg = d3.select(this), // Re-select 'this' as a D3 selection.
      id = svg.attr("id"); // Get the ID of the SVG element.

  // Ensure correct XML namespace attributes are present.
  xmlnsFix(svg);

  // Serialize the SVG to an XML string.
  var source = (new XMLSerializer()).serializeToString(svg.node()),
      // Create a Blob from the SVG source and generate a URL for it.
      url = window.URL.createObjectURL(new Blob([doctype + source], { "type" : "image\/svg+xml" }));

  // Create a temporary anchor element to trigger the download.
  var a = d3.select("body")
        .append('a') // Append the anchor tag to the body.
        .attr("class", "mapIcon-generator") // Assign a class for potential styling/cleanup.
        .attr("download", id + ".svg") // Set the download filename.
        .attr("href", url) // Set the href to the SVG blob URL.
        .style("display", "none"); // Hide the anchor tag.

  a.node().click(); // Programmatically click the anchor to initiate download.

  // Clean up: revoke the URL and remove the anchor tag after a delay.
  setTimeout(function() {
    window.URL.revokeObjectURL(url); // Release the object URL.
    a.remove(); // Remove the temporary anchor element.
  }, 100);

}; /* End of saveAsSVG function */


/**
 * Initiates the download of a canvas element as a PNG image file.
 * This function creates a temporary anchor tag, sets its download attributes
 * using the canvas's `toDataURL` method, programmatically clicks it,
 * and then removes it after a short delay.
 */
function saveAsPNG() {
  // 'this' context here refers to the canvas DOM element.
  var a = d3.select("body")
        .append('a') // Append a temporary anchor tag to the body.
        .attr("class", "mapIcon-generator") // Assign a class for identification.
        .attr("download", this.id) // Set the download filename using the canvas ID.
        .attr("href", this.toDataURL("image/png")) // Set the href to the canvas's data URL (PNG format).
        .style("display", "none"); // Hide the anchor tag from view.

  a.node().click(); // Programmatically click the anchor to trigger the download.

  // Clean up: remove the temporary anchor tag after a short delay.
  setTimeout(function() {
    a.remove(); // Remove the anchor element from the DOM.
  }, 100);

}; /* End of saveAsPNG function */


/**
 * Ensures correct XML namespace attributes are present on an SVG element
 * for proper serialization and rendering in different contexts.
 * This is crucial for cross-browser compatibility when dealing with generated SVGs.
 *
 * @param {D3Selection} svg - A D3 selection of the SVG element to fix namespaces for.
 */
function xmlnsFix(svg) {
  // Remove existing potentially problematic attributes to avoid duplication.
  svg.node().removeAttribute("xmlns");
  svg.node().removeAttribute("xlink");

  // These attributes are essential for a valid SVG 1.1 document.
  // Check if the 'xmlns' attribute is missing in the correct namespace.
  if (!svg.node().hasAttributeNS(d3.ns.prefix.xmlns, "xmlns")) {
    // If missing, set the 'xmlns' attribute with the SVG namespace URI.
    svg.node().setAttributeNS(d3.ns.prefix.xmlns, "xmlns", d3.ns.prefix.svg);
  }

  // Check if the 'xmlns:xlink' attribute is missing in the correct namespace.
  if (!svg.node().hasAttributeNS(d3.ns.prefix.xmlns, "xmlns:xlink")) {
    // If missing, set the 'xmlns:xlink' attribute with the XLink namespace URI.
    svg.node().setAttributeNS(d3.ns.prefix.xmlns, "xmlns:xlink", d3.ns.prefix.xlink);
  }

}; /* End of xmlnsFix function */