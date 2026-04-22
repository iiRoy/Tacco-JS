var directionsDisplay;

var map = null;
var elevator = null;
var polyline;
var routes = null;
var slopes = null;
var distance = null;
var duration = null;

var markersArray = [];
var elevations = [];
var mapPaths = [];

var measurementMode;
var metricUnit = null;
var feetMultiplicator = null;

// This line loads the Google Visualization API, specifically the columnchart package.
// It's essential for displaying the elevation and slope charts later on.
google.load("visualization", "1", { packages: ["columnchart"] });

// The main entry point for JavaScript execution, runs after the DOM is fully loaded.
$(function () {
    // Retrieve initial values from URL parameters for sharing functionality.
    var from = getURLParameter('from'); // Origin
    var to = getURLParameter('to'); // Destination
    var travelMode = getURLParameter('travelMode'); // Mode of travel
    measurementMode = getURLParameter('measurementMode'); // Preferred measurement unit

    // Check if 'from' parameter exists and populate the input field.
    if (from != "null") {
        $('#from').val(decodeURLParameter(from));
    }

    // Check if 'to' parameter exists and populate the input field.
    if (to != "null") {
        $('#to').val(decodeURLParameter(to));
    }

    // Check if 'travelMode' parameter exists and set the dropdown.
    if (travelMode != "null") {
        $('#travel-mode').val(decodeURLParameter(travelMode));
    }

    // Set a default measurement mode if none is specified in the URL.
    if (measurementMode === 'null') {
        measurementMode = 'miles'; // Default to miles
    } else {
        // Otherwise, set the dropdown value from the URL parameter.
        $('#measurement-mode').val(decodeURLParameter(measurementMode));
    }

    // Event handler for the 'from-to-switcher' button.
    // This allows users to quickly swap the origin and destination fields.
    $("#from-to-switcher").on("click", function (e) {
        var $fromInput = $("#from"); // jQuery object for the 'from' input.
        var $toInput = $("#to"); // jQuery object for the 'to' input.
        var oldFromVal = $fromInput.val(); // Temporarily store the 'from' value.
        $fromInput.val($toInput.val()); // Set 'from' to 'to's current value.
        $toInput.val(oldFromVal); // Set 'to' to the original 'from' value.
    });

    // Event handler for the route calculation form submission.
    // Prevents default form submission and triggers route calculation.
    $("form#routes").on("submit", function (e) {
        // Update the global measurement mode based on the current form selection.
        measurementMode = $("#measurement-mode").val();
        // Determine the display unit for metrics (feet or meters).
        metricUnit = measurementMode == "miles" ? "ft" : "m";
        e.preventDefault(); // Stop the browser from performing its default form submission.
        calcRoute(); // Call the function to calculate the route.
    });

    // Initialize Google Maps components and autocomplete features.
    initialize_maps(); // Set up the map and services.
    initAutoComplete('from'); // Enable autocomplete for the 'from' input.
    initAutoComplete('to'); // Enable autocomplete for the 'to' input.

    // If both 'from' and 'to' parameters were present in the URL,
    // automatically calculate and display the route on page load.
    if (from != "null" && to != "null") {
        calcRoute();
    }
}); // End of jQuery document ready function.

/**
 * Initializes all Google Maps related objects and settings.
 * This includes the map itself, directions renderer, and elevation service.
 */
function initialize_maps() {
    // Options for the directions renderer, making the route draggable and hiding the step-by-step list.
    var rendererOptions = {
        draggable: true, // Allows users to drag the route on the map.
        hideRouteList: true, // Prevents showing the textual list of directions.
        polylineOptions: {
            strokeOpacity: 0 // Makes the default route polyline invisible, as we will draw custom ones.
        }
    };
    // Create a new DirectionsRenderer instance.
    directionsDisplay = new google.maps.DirectionsRenderer(rendererOptions);

    // Get the DOM element where the map will be displayed.
    var mapCanvas = $('#map-canvas').get(0);
    // Define the initial map options.
    var mapOptions = {
        center: new google.maps.LatLng(37.787930, -122.4074990), // Centered near San Francisco.
        zoom: 13, // Initial zoom level.
        disableDefaultUI: false, // Keep default UI elements (zoom controls, etc.) visible.
        mapTypeId: google.maps.MapTypeId.HYBRID // Display satellite imagery with road labels.
    };
    // Create the Google Map object.
    map = new google.maps.Map(mapCanvas, mapOptions);
    // Link the directions renderer to the map.
    directionsDisplay.setMap(map);
    // Initialize the ElevationService to get terrain elevation data.
    elevator = new google.maps.ElevationService();

    // Add an event listener to the directions display object.
    // This listener triggers 'updateRoutes' whenever the user selects a different route
    // from the suggested alternatives provided by the DirectionsService.
    google.maps.event.addListener(
        directionsDisplay, // Object to listen on
        'routeindex_changed', // Event name
        updateRoutes // Function to call when event occurs
    );
}

/**
 * Initializes Google Places Autocomplete for a specified input field.
 * @param {string} field - The ID of the input element to attach autocomplete to.
 */
function initAutoComplete(field) {
    var input = document.getElementById(field); // Get the raw DOM element.
    autocomplete = new google.maps.places.Autocomplete(input); // Create Autocomplete instance.

    // Prevent form submission when selecting a place from autocomplete suggestions by pressing Enter.
    // This addresses a common UX issue where Enter submits the form instead of selecting the place.
    $('#' + field).keydown(function (e) {
        if (e.which == 13 && $('.pac-container:visible').length) {
            return false; // Suppress the default Enter key behavior.
        }
    });
}

/**
 * Calculates a route between the specified origin and destination using the chosen travel mode.
 * Displays the route on the map and updates the sharable link in the browser's URL.
 */
function calcRoute() {
    // Retrieve the start and end points from the input fields.
    // Uses placeholder text if the input field is empty.
    var start = $("#from").val() || $("#from").attr("placeholder");
    var end = $("#to").val() || $("#to").attr("placeholder");
    var travelMode = $("#travel-mode").val(); // Get the selected travel mode.

    // Construct the request object for the DirectionsService.
    var request = {
        origin: start, // Start location.
        destination: end, // End location.
        travelMode: google.maps.TravelMode[travelMode.toUpperCase()] // Convert string to DirectionsService enum.
    };

    var DirectionsService = new google.maps.DirectionsService(); // Create a new DirectionsService instance.
    // Make the actual route request to Google Maps API.
    DirectionsService.route(request, function (result, status) {
        // Handle cases where no directions can be found.
        if (status === "ZERO_RESULTS") {
            alert("No directions found."); // Inform the user.
            return; // Exit the function.
        }
        // If directions are successfully retrieved.
        if (status == google.maps.DirectionsStatus.OK) {
            directionsDisplay.setDirections(result); // Render the directions on the map.
        }
    });
    // Update the browser's URL to reflect the current route, enabling sharing.
    sharableLink(start, end, travelMode);
}

/**
 * Updates the browser's history to create a sharable URL for the current route.
 * This function changes the URL without reloading the page.
 * @param {string} start - The origin address.
 * @param {string} end - The destination address.
 * @param {string} travelMode - The selected travel mode.
 */
function sharableLink(start, end, travelMode) {
    history.replaceState('null', 'Flat Route Finder',
        '?from=' + encodeURLParameter(start) + // Encoded 'from' parameter
        '&to=' + encodeURLParameter(end) + // Encoded 'to' parameter
        '&travelMode=' + travelMode + // Travel mode parameter
        '&measurementMode=' + measurementMode // Measurement mode parameter
    );
}

var updating = false; // Flag to prevent multiple simultaneous route updates.

/**
 * Callback function for when the route displayed on the map changes (e.g., user selects an alternative route).
 * This function updates the distance, duration, and re-calculates elevation and slope profiles.
 * Includes a debounce mechanism to handle rapid route changes smoothly.
 */
function updateRoutes() {
    // Debounce logic: if an update is already in progress, ignore subsequent calls for a short period.
    if (updating) return;
    updating = true;
    setTimeout(function () { updating = false; }, 100); // Reset the flag after 100ms.

    console.log("Updating routes"); // Log to console for debugging.

    // Get the currently active route and its path from the directions object.
    var routes = this.directions.routes;
    var path = routes[this.routeIndex].overview_path;
    // Extract distance and duration from the first leg of the selected route.
    distance = routes[this.routeIndex].legs[0].distance;
    duration = routes[this.routeIndex].legs[0].duration;

    // Display the route distance based on the selected measurement mode.
    if (measurementMode == "miles") {
        $("#distance").html(distance.text); // Use Google's formatted text (e.g., "5.2 mi").
    } else {
        $("#distance").html((distance.value / 1000) + "Km"); // Convert meters to kilometers.
    }

    $("#travel-time").html(duration.text); // Display Google's formatted travel time.
    $(".travel-info").show(); // Ensure the travel information panel is visible.
    newPath(path, distance.value); // Initiate the elevation and slope calculation for the new path.
}

/**
 * Requests elevation data for a given geographical path.
 * @param {Array<google.maps.LatLng>} path - An array of LatLng points defining the path.
 */
function newPath(path) {
    // Define the request object for the ElevationService.
    var pathRequest = {
        'path': path, // The array of LatLng points.
        'samples': 300 // Number of elevation samples to retrieve along the path.
    };
    // Call the Google Maps ElevationService to get elevation data.
    elevator.getElevationAlongPath(pathRequest, plotElevation);
}

/**
 * Callback function for the ElevationService. Processes the elevation data,
 * draws an elevation profile chart, and prepares for slope visualization.
 * @param {Array<google.maps.ElevationResult>} elevations - An array of elevation data points.
 * @param {google.maps.ElevationStatus} status - The status of the elevation request.
 */
function plotElevation(elevations, status) {
    var slope, data, i, slopeChart, elevationChart, slopeChartDiv; // Declare local variables.

    // Check if the elevation data was successfully retrieved.
    if (status !== google.maps.ElevationStatus.OK) {
        alert("Error getting elevation data from Google"); // Notify user of error.
        return; // Stop execution if there's an error.
    }

    // Make the elevation chart div visible.
    elevationChartDiv = $("#elevation_chart").css('display', 'block');
    // Create a new DataTable for the Google Visualization chart.
    map.elevationData = new google.visualization.DataTable();
    map.elevationData.addColumn('string', 'Sample'); // X-axis, typically empty for continuous data.
    map.elevationData.addColumn('number', 'Elevation'); // Y-axis for elevation values.
    map.elevationData.locations = []; // Custom property to store LatLng objects.
    map.elevationData.elevation = []; // Custom property to store numeric elevation values.

    // Populate the DataTable with elevation data, applying unit conversion if necessary.
    for (i = 0; i < elevations.length; i++) {
        // Determine the conversion factor based on the measurement mode.
        if (measurementMode == "miles") {
            feetMultiplicator = 3.28084; // Convert meters to feet.
        } else {
            feetMultiplicator = 1; // Keep as meters (no conversion).
        }

        map.elevationData.addRow([
            '', // Empty string for the x-axis label.
            elevations[i].elevation * feetMultiplicator // Converted elevation value.
        ]);
        // Store the original location and converted elevation for interactive features (e.g., hover).
        map.elevationData.locations.push(elevations[i].location);
        map.elevationData.elevation.push(elevations[i].elevation * feetMultiplicator);
    }

    // Draw the elevation chart using the populated DataTable.
    elevationChart = new google.visualization.ColumnChart(elevationChartDiv.get(0));
    elevationChart.draw(map.elevationData, {
        // width: 500, // Example: fixed width
        // height: 245, // Example: fixed height
        legend: 'none', // Do not display a legend.
        titleY: 'Elevation (' + metricUnit + ')' // Y-axis title dynamically set.
    });
    // Attach event listeners to the chart for interactivity and proceed to plot slope.
    changeElevation(elevationChart, elevations);
}

/**
 * Attaches event listeners to the elevation chart for interactive features
 * like displaying markers on hover, and then proceeds to plot the slope profile.
 * @param {google.visualization.ColumnChart} elevationChart - The Google Chart object for elevation.
 * @param {Array<google.maps.ElevationResult>} elevations - The raw elevation data.
 */
function changeElevation(elevationChart, elevations) {
    // Add event listener for mouseover on the elevation chart columns.
    google.visualization.events.addListener(elevationChart, 'onmouseover', elevationHover);
    // Add event listener for mouseout to clear the temporary marker.
    google.visualization.events.addListener(elevationChart, 'onmouseout',
        elevationClear);

    plotSlope(elevations); // Proceed to calculate and plot the slope.
}

/**
 * Calculates the slope between consecutive elevation points and plots a slope profile chart.
 * Also prepares the data for drawing color-coded polylines on the map.
 * @param {Array<google.maps.ElevationResult>} elevations - The raw elevation data.
 */
function plotSlope(elevations) {
    // Make the slope chart div visible.
    slopeChartDiv = $("#slope_chart").css('display', 'block');
    // Create a new DataTable for the slope chart.
    map.slopeData = new google.visualization.DataTable();
    map.slopeData.addColumn('string', 'Sample'); // X-axis label.
    map.slopeData.addColumn('number', 'Slope'); // Y-axis label for slope percentage.

    // Initialize an array to store detailed slope information (value and midpoint location).
    slopes = [];
    // Iterate through elevation data to calculate slope for each segment.
    for (i = 0; i < elevations.length - 1; i++) {
        // Calculate slope: (change in elevation / segment distance) * 100 for percentage.
        // Assumes total distance is split evenly across 300 samples.
        slope = (calcSlope(elevations[i + 1].elevation, elevations[i].elevation, distance.value / 300)) * 100;
        map.slopeData.addRow(['', slope]); // Add slope to the DataTable.
        slopes.push({
            slope: slope, // Store the calculated slope percentage.
            location: midpoint(elevations[i], elevations[i + 1]) // Store the geographical midpoint of the segment.
        });
    }

    // Draw the slope chart.
    slopeChart = new google.visualization.ColumnChart(slopeChartDiv.get(0));
    slopeChart.draw(map.slopeData, {
        // width: 500, // Example: fixed width
        // height: 245, // Example: fixed height
        legend: 'none', // No legend.
        titleY: 'slope %' // Y-axis title.
    });
    // Attach event listeners to the slope chart and draw polylines.
    changeSlope(slopeChart, elevations, slopes);
}

/**
 * Attaches event listeners to the slope chart for interactive features
 * and then proceeds to draw color-coded polylines on the map based on slope.
 * @param {google.visualization.ColumnChart} slopeChart - The Google Chart object for slope.
 * @param {Array<google.maps.ElevationResult>} elevations - The raw elevation data.
 * @param {Array<Object>} slopes - The calculated slope data (value and midpoint).
 */
function changeSlope(slopeChart, elevations, slopes) {
    // Add event listener for mouseover on the slope chart columns.
    google.visualization.events.addListener(slopeChart, 'onmouseover', elevationHover);
    // Add event listener for mouseout to clear the temporary marker.
    google.visualization.events.addListener(slopeChart, 'onmouseout',
        elevationClear);
    // Draw the color-coded polylines on the map.
    drawPolyline(elevations, slopes);
}

/**
 * Removes all custom polylines (mapPaths) currently displayed on the map.
 * This is called before drawing new polylines to prevent overlapping.
 */
function removePolylines() {
    for (var i = 0; i < mapPaths.length; i++) {
        var path = mapPaths[i]; // Get each polyline object.
        path.setMap(null); // Remove it from the map.
    }

    mapPaths = []; // Clear the array of polyline references.
}

/**
 * Draws color-coded polylines on the map, where each segment's color represents its slope.
 * @param {Array<google.maps.ElevationResult>} elevations - The raw elevation data.
 * @param {Array<Object>} slopes - The calculated slope data including slope percentage and midpoint.
 */
function drawPolyline(elevations, slopes) {
    // First, clear any previously drawn polylines.
    removePolylines();

    var pathColor; // Variable to hold the color for the current segment.

    // Iterate through each slope segment to create and draw a polyline.
    for (var i = 0; i < slopes.length; i++) {
        // Define the two points for the current polyline segment.
        var routePath = [
            elevations[i].location,
            elevations[i + 1].location
        ];
        var absSlope = Math.abs(slopes[i].slope); // Use absolute slope for color determination.

        // Assign a color based on the absolute slope percentage.
        if (absSlope <= 5) {
            pathColor = "#3CB371"; // Green for gentle slopes.
        } else if (absSlope <= 10) {
            pathColor = "#FFFF00"; // Yellow for moderate slopes.
        } else if (absSlope <= 15) {
            pathColor = "#3366FF"; // Blue for steeper slopes.
        } else if (absSlope <= 20) {
            pathColor = "#FF0000"; // Red for very steep slopes.
        }
        else {
            pathColor = "#000000"; // Black for extreme slopes.
        }
        // Create a new Polyline object.
        mapPath = new google.maps.Polyline({
            path: routePath, // The coordinates of the segment.
            strokeColor: pathColor, // The color determined above.
            strokeOpacity: 0.5, // Semi-transparent.
            strokeWeight: 5, // Line thickness.
            draggable: true // Allows dragging (though not used for route recalculation here).
        });
        mapPath.setMap(map); // Add the polyline to the map.
        mapPaths.push(mapPath); // Store the polyline in the array for later removal.
    }
}

/**
 * Converts a slope percentage to an approximate degree value.
 * This is a simplified calculation, not a precise arctangent.
 * @param {number} slope - The slope percentage (e.g., 10 for 10%).
 * @returns {number} The approximate slope in degrees.
 */
function deg(slope) {
    return Math.floor(slope * 45) / 100; // A linear approximation: 100% slope is approx 45 degrees.
}

/**
 * Event handler for when the mouse hovers over a point on the elevation or slope chart.
 * Displays a temporary marker and an info window on the map at the corresponding location.
 * @param {Object} x - The event object from the Google Visualization chart, containing row index.
 */
function elevationHover(x) {
    // Retrieve location, elevation, and slope data for the hovered chart point.
    var location = map.elevationData.locations[x.row];
    var elevation = map.elevationData.elevation[x.row];
    var slope = slopes[x.row].slope;

    // Construct the content string for the info window.
    var contentString = "Elevation: " + Math.round(elevation) + " " + metricUnit + "<br>" +
        "Slope: " + Math.round(slope) + "% (" + deg(slope) + "&#176;)";

    // Create a new temporary marker on the map.
    map.locationMarker = new google.maps.Marker({
        position: location, // Geographical position of the marker.
        map: map, // The map to display the marker on.
        labelContent: "Lat: " + location.lat() + ". Lng: " + location.lng() +
            ". Elevation: " + elevation // Detailed label (optional, can be hidden).
    });
    addinfoWindow(contentString); // Display an info window with details.
}

/**
 * Displays an info window on the map at the location of the current marker.
 * @param {string} contentString - The HTML content to display inside the info window.
 */
function addinfoWindow(contentString) {
    // Create a new InfoWindow instance.
    map.infowindow = new google.maps.InfoWindow({
        content: contentString // Set the content of the info window.
    });
    // Open the info window, anchored to the temporary location marker.
    map.infowindow.open(map, map.locationMarker);
}

/**
 * Event handler for when the mouse leaves the elevation or slope chart.
 * Removes the temporary marker and info window from the map.
 * @param {Object} x - The event object (not used in this function).
 */
function elevationClear(x) {
    map.locationMarker.setMap(null); // Remove the marker from the map.
    // Optionally, map.infowindow.close(); could also be called if needed.
}

/**
 * Calculates the geographical midpoint between two elevation points.
 * @param {google.maps.ElevationResult} point1 - The first elevation point object.
 * @param {google.maps.ElevationResult} point2 - The second elevation point object.
 * @returns {google.maps.LatLng} A new LatLng object representing the midpoint.
 */
function midpoint(point1, point2) {
    // Calculate the average of the latitudes and longitudes.
    var lat = (point1.location.lat() + point2.location.lat()) / 2;
    var lng = (point1.location.lng() + point2.location.lng()) / 2;
    return new google.maps.LatLng(lat, lng); // Return the new LatLng for the midpoint.
}

/**
 * Calculates the slope (rise over run) between two elevation points over a given horizontal distance.
 * @param {number} elev1M - Elevation of the first point in meters.
 * @param {number} elev2M - Elevation of the second point in meters.
 * @param {number} distanceM - The horizontal distance between the two points in meters.
 * @returns {number} The calculated slope as a decimal (e.g., 0.05 for 5% slope).
 */
function calcSlope(elev1M, elev2M, distanceM) {
    slope = (elev1M - elev2M) / distanceM; // Basic slope calculation.
    return slope; // Return the slope.
}

/**
 * Retrieves a specific URL parameter by name from the current page's URL.
 * Source: http://stackoverflow.com/questions/1403888/get-url-parameter-with-jquery
 * @param {string} name - The name of the URL parameter to retrieve.
 * @returns {string|null} The decoded value of the parameter, or null if not found.
 */
function getURLParameter(name) {
    // Construct a regular expression to match the parameter name and capture its value.
    return decodeURIComponent((RegExp(name + '=' + '(.+?)(&|$)')
        .exec(location.search) || [, null])[1]); // Execute regex and return the captured group.
}

/**
 * Encodes a string for safe use in a URL parameter.
 * Specifically replaces spaces with plus signs, which is common in URL query strings.
 * @param {string} str - The string to encode.
 * @returns {string} The URL-encoded string.
 */
function encodeURLParameter(str) {
    // First, use standard URI encoding, then replace '%20' (encoded space) with '+'.
    return encodeURIComponent(str).replace(/%20/g, "+");
}

/**
 * Decodes a URL parameter string, converting plus signs back to spaces.
 * Also handles other common URL encoding artifacts.
 * @param {string} str - The string to decode.
 * @returns {string} The URL-decoded string.
 */
function decodeURLParameter(str) {
    // First, escape characters that might be problematic, then replace '+' with spaces.
    return decodeURIComponent(str).replace(/[!'()]/g, escape)
        .replace(/\+/g, " ");
}