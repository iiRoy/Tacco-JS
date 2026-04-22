let appState = {
    routeDisplay: null, // Manages the display of directions on the map
    geoMap: null, // The primary Google Map object
    altitudeProcessor: null, // Service for fetching elevation data
    calculatedRoutes: null, // Stores the full set of routes from DirectionsService
    gradientData: [], // Array to hold slope information for each segment
    journeyDistance: null, // Total distance of the calculated route
    journeyDuration: null, // Total duration of the calculated route
    visualMarkers: [], // Array to store any temporary markers
    elevationPoints: [], // Raw elevation data points
    drawnPathSegments: [], // Polylines drawn on the map for segments
    activeUnitSystem: 'miles', // Current measurement unit preference ('miles' or 'metric')
    displayUnitLabel: 'ft', // Label for elevation display ('ft' or 'm')
    altitudeConversionFactor: null, // Factor to convert meters to feet if needed
    hoverMarker: null, // Marker displayed on chart hover
    infoBubble: null, // Info window displayed on chart hover
};

// Incorporates Google's charting library for data visualization
google.load("chartingLib", "1", { packages: ["barGraph"] });

// Helper function to safely retrieve and decode URL parameters
const fetchDecodedUrlParam = (paramKey) => {
    const urlParams = new URLSearchParams(window.location.search);
    const value = urlParams.get(paramKey);
    // Return null if parameter is not found or explicitly 'null' string
    return (value !== null && value !== 'null') ? decodeURIComponent(value.replace(/\+/g, " ")) : null;
};

// Helper function to encode a string for URL inclusion
const urlEncodeString = (inputStr) => {
    return encodeURIComponent(inputStr).replace(/%20/g, "+");
};

// Utility to set value of a jQuery-selected input element if value is present
const assignInputValue = (selector, value) => {
    if (value !== null) {
        $(selector).val(value);
    }
};

// Main application initialization block, executes once the DOM is fully loaded
$(function () {
    // Extract initial route parameters from the URL
    const initialOriginLoc = fetchDecodedUrlParam('origin');
    const initialDestinationLoc = fetchDecodedUrlParam('destination');
    const preferredTransportMode = fetchDecodedUrlParam('transportMode');
    const userUnitPreference = fetchDecodedUrlParam('units');

    // Pre-populate input fields if URL parameters are available
    assignInputValue('#origin-input', initialOriginLoc);
    assignInputValue('#destination-input', initialDestinationLoc);
    assignInputValue('#transport-mode-select', preferredTransportMode);

    // Set the active measurement unit, defaulting to miles
    if (userUnitPreference === null) {
        appState.activeUnitSystem = 'miles';
    } else {
        appState.activeUnitSystem = userUnitPreference;
        assignInputValue('#units-select', userUnitPreference);
    }
    appState.displayUnitLabel = (appState.activeUnitSystem === 'miles') ? 'ft' : 'm';

    // Configure the 'swap locations' button functionality
    $("#swap-locations-button").on("click", function (event) {
        event.preventDefault(); // Prevent default button behavior
        const $sourceInput = $("#origin-input");
        const $targetInput = $("#destination-input");
        const tempVal = $sourceInput.val();
        $sourceInput.val($targetInput.val());
        $targetInput.val(tempVal);
    });

    // Attach event handler for route calculation form submission
    $("form#route-finder-form").on("submit", function (event) {
        event.preventDefault(); // Stop the form from submitting normally
        appState.activeUnitSystem = $("#units-select").val();
        appState.displayUnitLabel = (appState.activeUnitSystem === "miles") ? "ft" : "m";
        calculateAndDisplayRoute();
    });

    // Initialize the map and location autocomplete features
    initializeMapView();
    configureAutocompleteForInput('origin-input');
    configureAutocompleteForInput('destination-input');

    // Trigger route calculation automatically if both origin and destination are specified in the URL
    if (initialOriginLoc !== null && initialDestinationLoc !== null) {
        calculateAndDisplayRoute();
    }
});

// Sets up the Google Maps interface and its associated services
function initializeMapView() {
    // Configuration for how directions are rendered on the map
    const mapRenderSettings = {
        draggable: true, // Allows user to drag the route to modify it
        hideRouteList: true, // Suppresses the textual list of directions
        polylineOptions: {
            strokeOpacity: 0 // Makes the default route line invisible
        }
    };
    // Create the directions renderer instance
    appState.routeDisplay = new google.maps.DirectionsRenderer(mapRenderSettings);

    // Obtain the DOM element where the map will be rendered
    const mapCanvasElement = $('#map-render-canvas').get(0);
    // Define the initial map properties
    const mapInitializationOptions = {
        zoom: 13, // Default zoom level
        center: new google.maps.LatLng(37.787930, -122.4074990), // Centered on a common location (e.g., San Francisco)
        disableDefaultUI: false, // Ensures default UI controls (zoom, pan) are visible
        mapTypeId: google.maps.MapTypeId.HYBRID // Sets map type to a combination of satellite and road maps
    };
    // Instantiate the Google Map object
    appState.geoMap = new google.maps.Map(mapCanvasElement, mapInitializationOptions);
    appState.routeDisplay.setMap(appState.geoMap); // Link the directions renderer to this map

    // Initialize the Google Maps Elevation Service
    appState.altitudeProcessor = new google.maps.ElevationService();

    // Attach an event listener to update route details when a different route alternative is selected
    google.maps.event.addListener(
        appState.routeDisplay,
        'routeindex_changed', // Event triggered when the active route index changes
        updateRouteAndElevationInfo // Callback function to execute
    );
}

// Configures Google Places Autocomplete for a specific input field
function configureAutocompleteForInput(elementId) {
    const targetInputElement = document.getElementById(elementId);
    if (!targetInputElement) {
        console.error(`Error: Autocomplete target element #${elementId} not found.`);
        return;
    }
    // Create a new Autocomplete object linked to the input field
    const locationSuggester = new google.maps.places.Autocomplete(targetInputElement);

    // Prevent form submission when pressing Enter if autocomplete suggestions are visible
    $(`#${elementId}`).on('keydown', function (e) {
        // Check for Enter key (keyCode 13) and if the autocomplete container is visible
        if (e.which === 13 && $('.pac-container:visible').length > 0) {
            e.preventDefault(); // Stop the default Enter key action
            return false; // Prevent form submission
        }
        return true; // Allow other key presses to propagate
    });
}

// Orchestrates the process of calculating and displaying a route
function calculateAndDisplayRoute() {
    const departurePoint = $("#origin-input").val();
    const arrivalPoint = $("#destination-input").val();
    const selectedMode = $("#transport-mode-select").val();

    // Input validation: ensure both origin and destination are provided
    if (!departurePoint || !arrivalPoint) {
        alert("Please specify both an origin and a destination to plan your journey.");
        return;
    }

    // Prepare the request object for the Directions Service
    const directionsRequest = {
        origin: departurePoint,
        destination: arrivalPoint,
        travelMode: google.maps.TravelMode[selectedMode.toUpperCase()] // Convert string mode to Google Maps enum
    };

    // Instantiate and execute the Google Maps Directions Service
    const routeFinderService = new google.maps.DirectionsService();
    routeFinderService.route(directionsRequest, function (response, status) {
        if (status === google.maps.DirectionsStatus.ZERO_RESULTS) {
            alert("No route could be determined between the specified locations.");
            return;
        }
        if (status === google.maps.DirectionsStatus.OK) {
            appState.routeDisplay.setDirections(response); // Render the successful route on the map
        } else {
            console.error("Directions Service encountered an error:", status);
            alert(`An unexpected error occurred while fetching directions: ${status}`);
        }
    });

    // Update the browser's URL to enable sharing of the current route
    generateShareableUrl(departurePoint, arrivalPoint, selectedMode);
}

// Updates the browser's URL with the current route parameters for sharing
function generateShareableUrl(startLocation, endLocation, modeOfTravel) {
    // Construct new URL parameters using URLSearchParams for clarity
    const urlParameters = new URLSearchParams();
    urlParameters.append('origin', urlEncodeString(startLocation));
    urlParameters.append('destination', urlEncodeString(endLocation));
    urlParameters.append('transportMode', modeOfTravel);
    urlParameters.append('units', appState.activeUnitSystem);

    // Replace the current history state, effectively changing the URL without a page reload
    window.history.replaceState(null, 'Route & Elevation Analysis', `?${urlParameters.toString()}`);
}

let isRouteProcessingActive = false; // Flag to prevent concurrent route updates

// Function triggered when the displayed route changes (e.g., user drags route, selects alternative)
function updateRouteAndElevationInfo() {
    // Implement a simple debounce to avoid excessive calls
    if (isRouteProcessingActive) return;
    isRouteProcessingActive = true;
    setTimeout(() => { isRouteProcessingActive = false; }, 100); // Reset flag after a short delay

    console.info("Initiating update for route details and elevation profile...");

    // Validate that directions and routes are available
    if (!this.directions || !this.directions.routes || this.directions.routes.length === 0) {
        console.warn("No valid route data found for update.");
        return;
    }

    const currentlySelectedRoute = this.directions.routes[this.routeIndex];
    if (!currentlySelectedRoute || !currentlySelectedRoute.legs || currentlySelectedRoute.legs.length === 0) {
        console.warn("The selected route alternative is incomplete or invalid.");
        return;
    }

    // Extract key information from the first leg of the route
    const mainPathOverview = currentlySelectedRoute.overview_path;
    const primaryLeg = currentlySelectedRoute.legs[0];

    appState.journeyDistance = primaryLeg.distance;
    appState.journeyDuration = primaryLeg.duration;

    // Display the route distance, converting to kilometers if metric system is active
    const distanceOutputElement = $("#route-distance");
    if (appState.activeUnitSystem === "miles") {
        distanceOutputElement.html(appState.journeyDistance.text);
    } else {
        const distanceInKm = (appState.journeyDistance.value / 1000).toFixed(2);
        distanceOutputElement.html(`${distanceInKm} Km`);
    }

    // Display the route duration
    $("#travel-duration").html(appState.journeyDuration.text);
    $(".route-summary-info").show(); // Ensure the summary display is visible

    // Proceed to fetch and process elevation data for the new path
    requestElevationDataForPath(mainPathOverview);
}

// Requests elevation data for a given geographical path
function requestElevationDataForPath(pathCoordinates) {
    // Define the parameters for the elevation request
    const elevationQuery = {
        'path': pathCoordinates,
        'samples': 300 // Number of elevation points to sample along the path
    };
    // Send the request to the Google Maps Elevation Service
    appState.altitudeProcessor.getElevationAlongPath(elevationQuery, renderElevationProfile);
}

// Callback function to process and display elevation data as a chart
function renderElevationProfile(rawAltitudeData, responseStatus) {
    if (responseStatus !== google.maps.ElevationStatus.OK) {
        console.error("Elevation data retrieval failed:", responseStatus);
        alert(`Failed to obtain elevation data from Google: ${responseStatus}`);
        return;
    }

    if (!rawAltitudeData || rawAltitudeData.length === 0) {
        console.warn("No elevation data was returned by the service.");
        return;
    }

    // Ensure the chart container is displayed
    const elevationChartContainer = $("#elevation-profile-chart").css('display', 'block');

    // Prepare a DataTable for Google Charts to hold elevation information
    appState.geoMap.altitudeDataSet = new google.visualization.DataTable();
    appState.geoMap.altitudeDataSet.addColumn('string', 'Path Point');
    appState.geoMap.altitudeDataSet.addColumn('number', 'Elevation');

    // Store original locations and processed altitudes separately for marker placement
    appState.geoMap.altitudeDataSet.locations = [];
    appState.geoMap.altitudeDataSet.altitudes = [];

    // Determine the conversion factor from meters (Google's default) to the active unit system
    appState.altitudeConversionFactor = (appState.activeUnitSystem === "miles") ? 3.28084 : 1; // 1 meter = ~3.28 feet

    // Iterate through raw elevation data, apply conversion, and populate the DataTable
    for (let i = 0; i < rawAltitudeData.length; i++) {
        const convertedAltitude = rawAltitudeData[i].elevation * appState.altitudeConversionFactor;
        appState.geoMap.altitudeDataSet.addRow([
            '', // Empty string for X-axis labels (points are implicit)
            convertedAltitude
        ]);
        appState.geoMap.altitudeDataSet.locations.push(rawAltitudeData[i].location);
        appState.geoMap.altitudeDataSet.altitudes.push(convertedAltitude);
    }

    // Create and draw the column chart for elevation
    const elevationGraph = new google.visualization.ColumnChart(elevationChartContainer.get(0));
    elevationGraph.draw(appState.geoMap.altitudeDataSet, {
        legend: 'none', // Hide chart legend
        titleY: `Elevation (${appState.displayUnitLabel})`, // Y-axis title based on units
        tooltip: { isHtml: true } // Allows custom HTML content in tooltips
    });

    // Configure interactive events for the elevation chart
    setupElevationChartInteraction(elevationGraph, rawAltitudeData);
}

// Configures mouse interaction events for the elevation chart
function setupElevationChartInteraction(altitudeChart, rawElevationInput) {
    // Add listeners for mouseover and mouseout events on the chart columns
    google.visualization.events.addListener(altitudeChart, 'onmouseover', handleChartHoverEvent);
    google.visualization.events.addListener(altitudeChart, 'onmouseout', handleChartMouseExit);

    // Proceed to calculate and visualize the grade profile
    calculateAndPlotGradeProfile(rawElevationInput);
}

// Calculates and displays the grade (slope) profile along the route
function calculateAndPlotGradeProfile(elevationPoints) {
    // Ensure the grade chart container is visible
    const gradeChartContainer = $("#slope-profile-chart").css('display', 'block');

    // Prepare a DataTable for the grade chart
    appState.geoMap.gradeDataSet = new google.visualization.DataTable();
    appState.geoMap.gradeDataSet.addColumn('string', 'Route Segment');
    appState.geoMap.gradeDataSet.addColumn('number', 'Grade');

    appState.gradientData = []; // Clear previous gradient data

    // Approximate length of each segment between elevation samples
    // Ensure segment length is in the same units as elevation for correct grade calculation
    const segmentApproxLength = (appState.journeyDistance.value * appState.altitudeConversionFactor) / (elevationPoints.length - 1);

    // Iterate through elevation points to calculate grade for each segment
    for (let i = 0; i < elevationPoints.length - 1; i++) {
        const currentSegmentGrade = determineSegmentGrade(
            elevationPoints[i + 1].elevation * appState.altitudeConversionFactor,
            elevationPoints[i].elevation * appState.altitudeConversionFactor,
            segmentApproxLength
        ) * 100; // Convert to percentage

        appState.geoMap.gradeDataSet.addRow(['', currentSegmentGrade]);
        appState.gradientData.push({
            grade: currentSegmentGrade,
            midpointLocation: deriveMidpoint(elevationPoints[i], elevationPoints[i + 1])
        });
    }

    // Create and draw the column chart for grade profile
    const gradeGraph = new google.visualization.ColumnChart(gradeChartContainer.get(0));
    gradeGraph.draw(appState.geoMap.gradeDataSet, {
        legend: 'none', // Hide chart legend
        titleY: 'Grade (%)', // Y-axis title
        tooltip: { isHtml: true } // Enable HTML tooltips
    });

    // Set up interactive events for the grade chart
    setupGradeChartInteraction(gradeGraph, elevationPoints, appState.gradientData);
}

// Configures mouse interaction events for the grade chart
function setupGradeChartInteraction(gradeChart, segmentElevations, segmentGrades) {
    // Add listeners for mouseover and mouseout events
    google.visualization.events.addListener(gradeChart, 'onmouseover', handleChartHoverEvent);
    google.visualization.events.addListener(gradeChart, 'onmouseout', handleChartMouseExit);

    // Render the route segments on the map, color-coded by grade
    drawColorCodedRouteSegments(segmentElevations, segmentGrades);
}

// Removes all currently drawn polyline segments from the map
function clearMapPathSegments() {
    if (appState.drawnPathSegments && appState.drawnPathSegments.length > 0) {
        appState.drawnPathSegments.forEach(segmentLine => segmentLine.setMap(null));
        appState.drawnPathSegments = []; // Reset the array of segments
    }
}

// Draws polyline segments on the map, with colors indicating the grade (slope)
function drawColorCodedRouteSegments(segmentElevationPoints, segmentGradeData) {
    clearMapPathSegments(); // First, clear any previously drawn segments

    if (!segmentElevationPoints || segmentElevationPoints.length < 2 || !segmentGradeData || segmentGradeData.length === 0) {
        console.warn("Insufficient data to draw color-coded route segments.");
        return;
    }

    for (let i = 0; i < segmentGradeData.length; i++) {
        const pathCoords = [
            segmentElevationPoints[i].location,
            segmentElevationPoints[i + 1].location
        ];
        const absoluteGradeValue = Math.abs(segmentGradeData[i].grade);

        // Assign a color based on the absolute grade percentage
        let segmentStrokeColor = "#000000"; // Default to black for very high or unclassified grades
        if (absoluteGradeValue <= 5) {
            segmentStrokeColor = "#3CB371"; // Green: gentle slope
        } else if (absoluteGradeValue <= 10) {
            segmentStrokeColor = "#FFFF00"; // Yellow: moderate slope
        } else if (absoluteGradeValue <= 15) {
            segmentStrokeColor = "#3366FF"; // Blue: steep slope
        } else if (absoluteGradeValue <= 20) {
            segmentStrokeColor = "#FF0000"; // Red: very steep slope
        }

        // Create a new polyline for this segment
        const segmentLine = new google.maps.Polyline({
            path: pathCoords,
            strokeColor: segmentStrokeColor,
            strokeOpacity: 0.75, // Slightly higher opacity
            strokeWeight: 7, // Thicker line for better visibility
            draggable: false // Prevent individual segment dragging
        });
        segmentLine.setMap(appState.geoMap); // Add segment to the map
        appState.drawnPathSegments.push(segmentLine); // Store for later removal
    }
}

// Converts a grade percentage value into an approximate degree angle
function convertGradeToDegrees(gradePercentage) {
    // This is a simplified linear approximation. For more accuracy, use atan(grade/100).
    // The original code used (slope * 45) / 100 which is roughly 0.45 * slope.
    return (gradePercentage * 0.45);
}

// Handles mouseover events on the elevation or grade charts
function handleChartHoverEvent(chartEventData) {
    // Determine the relevant data table based on which chart is being hovered
    const dataTable = appState.geoMap.altitudeDataSet || appState.geoMap.gradeDataSet;
    if (!dataTable || chartEventData.row === undefined || chartEventData.row === null) {
        console.warn("Chart hover event missing valid data or row index.");
        return;
    }

    const currentMapLocation = dataTable.locations[chartEventData.row];
    if (!currentMapLocation) {
        console.warn("No geographical location found for the hovered chart point.");
        return;
    }

    const currentAltitude = appState.geoMap.altitudeDataSet.altitudes[chartEventData.row];
    let segmentGradeInfo = null;
    let midpointLocationForGrade = currentMapLocation; // Default to current location

    // If gradient data is available for this point, use it
    if (appState.gradientData && appState.gradientData[chartEventData.row]) {
        segmentGradeInfo = appState.gradientData[chartEventData.row].grade;
        midpointLocationForGrade = appState.gradientData[chartEventData.row].midpointLocation;
    }

    // Clear any existing hover marker and info window
    if (appState.hoverMarker) {
        appState.hoverMarker.setMap(null);
    }
    if (appState.infoBubble) {
        appState.infoBubble.close();
    }

    // Create a new marker at the hovered location
    appState.hoverMarker = new google.maps.Marker({
        position: midpointLocationForGrade, // Use midpoint for grade, or exact location for elevation
        map: appState.geoMap,
        title: "Hover Location"
    });

    // Construct the content string for the info window
    let infoWindowContent = `<strong>Location Details:</strong><br>`;
    if (currentAltitude !== undefined && currentAltitude !== null) {
        infoWindowContent += `Altitude: ${Math.round(currentAltitude)} ${appState.displayUnitLabel}<br>`;
    }
    if (segmentGradeInfo !== null) {
        const gradeInDegrees = convertGradeToDegrees(segmentGradeInfo);
        infoWindowContent += `Grade: ${Math.round(segmentGradeInfo)}% (${gradeInDegrees.toFixed(1)}&deg;)<br>`;
    }
    infoWindowContent += `Lat: ${currentMapLocation.lat().toFixed(5)}, Lng: ${currentMapLocation.lng().toFixed(5)}`;

    // Display the info window
    showInfoWindowOnMap(infoWindowContent, appState.hoverMarker);
}

// Displays an information window on the map, attached to a specific marker
function showInfoWindowOnMap(contentHtml, markerObject) {
    // If an info window is already open, close it before opening a new one
    if (appState.infoBubble) {
        appState.infoBubble.close();
    }
    // Create a new InfoWindow instance
    appState.infoBubble = new google.maps.InfoWindow({
        content: contentHtml
    });
    // Open the info window, linked to the provided marker
    appState.infoBubble.open(appState.geoMap, markerObject);
}

// Handles mouseout events on the charts, clearing the hover marker and info window
function handleChartMouseExit(chartEventData) {
    if (appState.hoverMarker) {
        appState.hoverMarker.setMap(null); // Hide the marker
        appState.hoverMarker = null; // Dereference the marker
    }
    if (appState.infoBubble) {
        appState.infoBubble.close(); // Close the info window
        appState.infoBubble = null; // Dereference the info window
    }
}

// Computes the geographical midpoint between two LatLng points
function deriveMidpoint(point1Data, point2Data) {
    const latitudeAvg = (point1Data.location.lat() + point2Data.location.lat()) / 2;
    const longitudeAvg = (point1Data.location.lng() + point2Data.location.lng()) / 2;
    return new google.maps.LatLng(latitudeAvg, longitudeAvg);
}

// Calculates the grade (slope) between two elevation points over a given horizontal distance
function determineSegmentGrade(elevationA, elevationB, horizontalDistance) {
    if (horizontalDistance === 0) {
        console.warn("Attempted to calculate grade with zero horizontal distance. Returning 0.");
        return 0; // Prevent division by zero
    }
    const altitudeDifference = elevationA - elevationB;
    return altitudeDifference / horizontalDistance;
}