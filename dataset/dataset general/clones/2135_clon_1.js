var po=org.polymaps; // Initialize Polymaps library reference

// This section computes the quantiles for data visualization.
// It uses pv.Scale.quantile to categorize unemployment data into 9 noniles.
var quantile = pv.Scale.quantile()
    .quantiles(9) // Divide data into 9 equal parts.
    .domain(pv.values(unemployment)) // The data range from the unemployment values.
    .range(0,8); // The output range for the quantiles, 0 to 8.

// Set up the main map object using Polymaps.
var map=po.map()
  .container(document.getElementById("map").appendChild(po.svg("svg"))) // Attach map to SVG within a div.
  .center({lat:39,lon:-96}) // Geographic center of the map (approximate US center).
  .zoom(4) // Initial zoom level.
  .zoomRange([3,7]) // Allowed zoom levels.
  .add(po.interact()); // Enable interactive map features (pan, zoom).

// Add a base layer of map tiles from CloudMade.
// The URL uses placeholders for host, zoom, X, and Y coordinates.
map.add(po.image()
  .url(po.url("http://{S}tile.cloudmade.com" // CloudMade tile service base URL.
    + "/1a1b06b230af4efdbb989ea99e9841af" // API key for CloudMade (please register your own!).
    + "/20760/256/{Z}/{X}/{Y}.png") // Tile format: style ID, size, zoom, X, Y.
    .hosts(["a.","b.","c.",""]))); // Possible subdomains for tile loading.

// Add GeoJSON layer for county boundaries.
// Data is fetched from a Polymaps AppEngine instance.
map.add(po.geoJson()
  .url("http://polymaps.appspot.com/county/{Z}/{X}/{Y}.json") // URL for county GeoJSON data.
  .on("load",load) // Event handler for when GeoJSON data is loaded.
  .id("county")); // Identifier for this layer.

// Add GeoJSON layer for state boundaries.
// This layer provides context but might not be styled based on data.
map.add(po.geoJson()
  .url("http://polymaps.appspot.com/state/{Z}/{X}/{Y}.json") // URL for state GeoJSON data.
  .id("state")); // Identifier for this layer.

// Add a compass control to the map, but disable panning.
map.add(po.compass()
  .pan("none")); // Compass will show orientation but not pan the map.

// This function processes loaded GeoJSON features.
function load(e) {

  // Loop through each feature in the loaded GeoJSON data.
  for (var i = 0; i < e.features.length; i++) {
    var feature = e.features[i]; // Current geographic feature (e.g., a county).

    // Skip features with bogus county IDs (e.g., "000" suffix often means state-level data).
    if (feature.data.id.substring(9) == "000") continue; // Check for specific ID pattern.

    // Retrieve unemployment data for the current feature based on its ID.
    var d = unemployment[feature.data.id.substring(7)]; // Extract relevant part of ID to match unemployment data.

    // Set the CSS class of the feature's SVG element for styling.
    // The class is derived from the quantile of the unemployment data.
    feature.element.setAttribute("class","q"+quantile(d)+"-"+9); // e.g., "q3-9" for 3rd nonile out of 9.

    // Append a title element to the feature's SVG element.
    // This provides a tooltip with the county name and unemployment rate.
    feature.element.appendChild(po.svg("title").appendChild(
      document.createTextNode(feature.data.properties.name+": "+d+"%")) // Create text node with info.
      .parentNode); // Append the text node to the title, then the title to the feature element.
  }
}

// Set a CSS class on the map's container for overall styling (e.g., color scheme).
map.container().setAttribute("class","Blues"); // Apply "Blues" class, likely for a color palette.