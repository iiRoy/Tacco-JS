var routeVisualizer;
var globeCanvas = null;
var heightService = null;
var pathSegment;
var travelPaths = null;
var inclinationData = null;
var travelDistance = null;
var travelDuration = null;
var pointMarkers = [];
var altitudeReadings = [];
var globeSegments = [];
var unitSystem;
var displayUnit = null;
var conversionFactor = null;
// Initialize the Google Charts library with the column chart component.
google.load("visualization", "1", {packages: ["columnchart"]});

// Executes once the document structure is fully loaded.
$(function () {
    var startLoc = getURLParameter('from');
    var endLoc = getURLParameter('to');
    var journeyMode = getURLParameter('travelMode');
    unitSystem = getURLParameter('measurementMode');

    // If a shared link was used, populate the input fields.
    if (startLoc != "null") {
        $('#from').val(decodeURLParameter(startLoc));
    }

    if (endLoc != "null") {
        $('#to').val(decodeURLParameter(endLoc));
    }

    if (journeyMode != "null") {
        $('#travel-mode').val(decodeURLParameter(journeyMode));
    }

    if (unitSystem === 'null') {
        unitSystem = 'miles';
    }
    else {
        $('#measurement-mode').val(decodeURLParameter(unitSystem));
    }

    $("#from-to-switcher").on("click", function (eventObj) {
        var originField = $("#from");
        var destinationField = $("#to");
        var previousOriginValue = originField.val();
        originField.val(destinationField.val());
        destinationField.val(previousOriginValue);
    });

    // Establish an event handler to trigger the journey calculation when
    // the submission button is activated.
    $("form#routes").on("submit", function (evt) {
        
        unitSystem = $("#measurement-mode").val();
        displayUnit = unitSystem == "miles" ? "ft" : "m";
        evt.preventDefault();
        calculateJourney();
    });

    setupGlobeView();
    configureAutocomplete('from');
    configureAutocomplete('to');

    if (startLoc != "null" && endLoc != "null") {
        calculateJourney();
    }
});

function setupGlobeView() {
    // Configure settings for a draggable route display.
    var renderOptions = {
        draggable: true,
        hideRouteList: true,
        polylineOptions: {
            strokeOpacity: 0
        }
    };
    // Instantiate the Google Maps Directions Renderer.
    routeVisualizer = new google.maps.DirectionsRenderer(renderOptions);
    var canvasElement = $('#map-canvas').get(0);
    var canvasOptions = {
        center: new google.maps.LatLng(37.787930,-122.4074990),
        zoom: 13,
        // Disable some default UI controls but retain mouse zoom.
        disableDefaultUI: false,
        mapTypeId: google.maps.MapTypeId.HYBRID
    };
    // Create the primary Google Maps object.
    globeCanvas = new google.maps.Map(canvasElement, canvasOptions);
    routeVisualizer.setMap(globeCanvas);
    // Integrate the elevation data service.
    heightService = new google.maps.ElevationService();

    // Set up a callback to update elevation data if the user selects
    // an alternative route from the provided options.
    google.maps.event.addListener(
        routeVisualizer,
        'routeindex_changed',
        refreshJourneyData
    );
}

function configureAutocomplete(inputField) {
    var inputElement = document.getElementById(inputField);
    autoSuggest = new google.maps.places.Autocomplete(inputElement);

    // Prevent form submission when pressing Enter key in autocomplete,
    // if the suggestion box is visible.
    // Reference: http://stackoverflow.com/questions/11388251/google-autocomplete-enter-to-select
    $('#' + inputField).keydown(function (keyEvent) {
      if (keyEvent.which == 13 && $('.pac-container:visible').length)
        return false;
    });
}

function calculateJourney() {
    var originPoint = $("#from").val() || $("#from").attr("placeholder");
    var destPoint = $("#to").val() || $("#to").attr("placeholder");
    var transportMode = $("#travel-mode").val();
    var routeRequest = {
        origin: originPoint,
        destination: destPoint,
        travelMode: google.maps.TravelMode[transportMode.toUpperCase()]
    };
    var PathService = new google.maps.DirectionsService();
    PathService.route(routeRequest, function(routeResult, serviceStatus) {
        if (serviceStatus === "ZERO_RESULTS") {
            alert("No travel path could be determined.");
            return;
        }
        // Verify if the region supports directions.
        if (serviceStatus == google.maps.DirectionsStatus.OK) {
            routeVisualizer.setDirections(routeResult);
        }
    });
    createShareableReference(originPoint, destPoint, transportMode);
}
function createShareableReference(beginPoint, endPoint, transportChoice) {
    // Modify the URL to include parameters for sharing.
    history.replaceState('null', 'Flat Route Finder', '?from=' + encodeWebParameter(beginPoint) + '&to=' + encodeWebParameter(endPoint) +
        '&travelMode=' + transportChoice + '&measurementMode=' + unitSystem);
}

var processingUpdate = false;
function refreshJourneyData() {
    if (processingUpdate) return;
    processingUpdate = true;
    setTimeout(function () { processingUpdate = false; }, 100);
    console.log("Updating journey information");
    // Clear any previously plotted path data if it exists.

    var allJourneys = this.directions.routes;
    var currentPath = allJourneys[this.routeIndex].overview_path;
    pathDistance = allJourneys[this.routeIndex].legs[0].distance;
    pathDuration = allJourneys[this.routeIndex].legs[0].duration;
    
    /* Displays the total distance in either miles or kilometers,
     based on the selected unit system. */
    if(unitSystem == "miles"){
        $("#distance").html(pathDistance.text);
    }
    else{
        $("#distance").html((pathDistance.value / 1000) + "Km");
    }
    
    $("#travel-time").html(pathDuration.text);
    $(".travel-info").show();
    processNewPath(currentPath, pathDistance.value);
}

function processNewPath(segmentGeometry) {
        var segmentRequest = {
        'path': segmentGeometry,
        'samples': 300
    };
        // Begin the request for elevation data along the path.
    heightService.getElevationAlongPath(segmentRequest, displayAltitudeProfile);
}
// Receives an array of elevation result objects, then renders a path on the map
// and generates an elevation chart.
function displayAltitudeProfile(altitudeValues, serviceStatus) {
    var gradientValue, chartData, idx, gradientGraph, altitudeGraph, altitudeGraphContainer;
    if (serviceStatus !== google.maps.ElevationStatus.OK) {
        alert("An error occurred while retrieving elevation data from Google.");
        return;
    }
    // Create a new chart within the designated elevation chart div.
    altitudeGraphContainer = $("#elevation_chart").css('display', 'block');
    // Extract the necessary data for populating the chart.
    globeCanvas.altitudeData = new google.visualization.DataTable();
    globeCanvas.altitudeData.addColumn('string', 'Sample');
    globeCanvas.altitudeData.addColumn('number', 'Elevation');
    globeCanvas.altitudeData.locations = [];
    globeCanvas.altitudeData.elevation = [];
    for (idx = 0; idx < altitudeValues.length; idx++) {
        
        // Convert elevation measurements from meters to feet if applicable.
        //console.log(unitSystem);
        if(unitSystem == "miles"){
            conversionFactor = 3.28084;
        }
        else{
            conversionFactor = 1;
        }
        
        globeCanvas.altitudeData.addRow([
            '',
            altitudeValues[idx].elevation * conversionFactor
        ]);
        globeCanvas.altitudeData.locations.push( altitudeValues[idx].location );
        globeCanvas.altitudeData.elevation.push( altitudeValues[idx].elevation * conversionFactor );
        
    }
    
    // Render the chart using the prepared data in its container.
    
    altitudeGraph = new google.visualization.ColumnChart(altitudeGraphContainer.get(0));
    altitudeGraph.draw(globeCanvas.altitudeData, {
        // width: 500,
        // height: 245,
        legend: 'none',
        titleY: 'Altitude ('+displayUnit+')'
    });
    adjustAltitudeDisplay(altitudeGraph, altitudeValues);
}
function adjustAltitudeDisplay(altitudePlot, altitudePoints) {
    // Attach an event listener to the chart to display location and elevation on hover.
    google.visualization.events.addListener(altitudePlot, 'onmouseover', altitudeCursorHover);
    google.visualization.events.addListener(altitudePlot, 'onmouseout',
        altitudeCursorClear);

    displayGradientProfile(altitudePoints);
}
function displayGradientProfile(altitudeReadings){
    gradientGraphContainer = $("#slope_chart").css('display', 'block');
    // Extract data for populating the gradient chart.
    globeCanvas.gradientData = new google.visualization.DataTable();
    globeCanvas.gradientData.addColumn('string', 'Sample');
    globeCanvas.gradientData.addColumn('number', 'Slope');

    // Iterate through each elevation data point,
    // computing the gradient using consecutive points.
    // Store these gradients in a dedicated array.
    inclinationData = [];
    for (idx = 0; idx < altitudeReadings.length - 1; idx++) {
        calculatedGradient = (computeGradient(altitudeReadings[idx+1].elevation, altitudeReadings[idx].elevation, pathDistance.value/300)) * 100;
        globeCanvas.gradientData.addRow(['', calculatedGradient]);
        inclinationData.push({
            slope: calculatedGradient,
            location: findMidpoint(altitudeReadings[idx], altitudeReadings[idx+1])
        });
    }

// Render the gradient chart with the processed data.
    gradientGraph = new google.visualization.ColumnChart(gradientGraphContainer.get(0));
    gradientGraph.draw(globeCanvas.gradientData, {
        // width: 500,
        // height: 245,
        legend: 'none',
        titleY: 'gradient %'
    });
    adjustGradientDisplay(gradientGraph, altitudeReadings, inclinationData);
}
function adjustGradientDisplay(gradientPlot, altitudeSet, gradientSet) {
    // Create event listeners for the gradient chart to show location and gradient.
    google.visualization.events.addListener(gradientPlot, 'onmouseover', altitudeCursorHover);
    google.visualization.events.addListener(gradientPlot, 'onmouseout',
        altitudeCursorClear);
    renderPathSegments(altitudeSet, gradientSet);
}

function clearPathSegments() {
    for (var idx = 0; idx < globeSegments.length; idx++) {
        var segment = globeSegments[idx];
        segment.setMap(null);
    }

    globeSegments = [];
}

function renderPathSegments (altitudePoints, gradientValues) {
    // Generate a polyline for each elevation interval, color-coded by gradient.
    // Remove any existing polylines before rendering new ones.
    clearPathSegments();

    for (var idx = 0; idx < gradientValues.length; idx++) {
        var segmentCoords = [
            altitudePoints[idx].location,
            altitudePoints[idx+1].location
        ];
        var absoluteGradient = Math.abs(gradientValues[idx].slope);
        if (absoluteGradient <= 5) {
            segmentColor = "#3CB371";
        } else if (absoluteGradient <= 10) {
            segmentColor = "#FFFF00";
        } else if (absoluteGradient <= 15) {
            segmentColor = "#3366FF";
        } else if (absoluteGradient <= 20) {
            segmentColor = "#FF0000";
        }
        else {
            segmentColor = "#000000";
        }
        currentSegment = new google.maps.Polyline({
            path: segmentCoords,
            strokeColor: segmentColor,
            strokeOpacity: 0.5,
            strokeWeight: 5,
            draggable: true
        });
        currentSegment.setMap(globeCanvas);
        globeSegments.push(currentSegment);
    }
}

function degAngle(grade) {
    return Math.floor(grade * 45) / 100;
}

function altitudeCursorHover (eventObject) {
    // Display the location on the map.
    var pointLocation = globeCanvas.altitudeData.locations[eventObject.row];
    var pointAltitude = globeCanvas.altitudeData.elevation[eventObject.row];
    var pointGradient = inclinationData[eventObject.row].slope;
    var popupContent = "Altitude: " + Math.round(pointAltitude) + " " + displayUnit + "<br>" +
        "Gradient: " + Math.round(pointGradient) + "% (" + degAngle(pointGradient) + "&#176;)";

    globeCanvas.positionMarker = new google.maps.Marker({
        position: pointLocation,
        map: globeCanvas,
        labelContent: "Lat: " + pointLocation.lat() + ". Lng: " + pointLocation.lng() +
            ". Altitude: " + pointAltitude
    });
    displayInfoPanel(popupContent);
}
function displayInfoPanel(messageText) {
    // Add an informational window to the map.
    globeCanvas.infoBubble = new google.maps.InfoWindow({
        content: messageText
    });
    globeCanvas.infoBubble.open(globeCanvas, globeCanvas.positionMarker);
}
function altitudeCursorClear (eventData) {
    globeCanvas.positionMarker.setMap(null);
}

function findMidpoint(coordOne, coordTwo) {
    // To determine the midpoint, average the respective coordinates.
    var latitude = (coordOne.location.lat() + coordTwo.location.lat()) / 2;
    var longitude = (coordOne.location.lng() + coordTwo.location.lng()) / 2;
    return new google.maps.LatLng(latitude, longitude);
}

// Compute the gradient using the elevation difference between two points
// over a specified distance in meters.
function computeGradient(heightOneMeter, heightTwoMeter, segmentLengthMeter) {
    gradientResult = (heightOneMeter - heightTwoMeter) / segmentLengthMeter;
    return gradientResult;
}

// Retrieves a specific URL parameter, e.g., 'to' or 'from', for sharing links.
// Source: http://stackoverflow.com/questions/1403888/get-url-parameter-with-jquery
function getURLParameter(paramKey) {
    return decodeURIComponent((RegExp(paramKey + '=' + '(.+?)(&|$)')
        .exec(location.search)||[,null])[1]);
}

// Replaces spaces with plus (+) signs for URL encoding.
function encodeWebParameter(inputString) {
  return encodeURIComponent(inputString).replace(/%20/g, "+");
}

// Replaces plus (+) signs with spaces for URL decoding.
function decodeURLParameter(encodedString) {
  return decodeURIComponent(encodedString).replace(/[!'()]/g, escape)
    .replace(/\+/g, " ");
}