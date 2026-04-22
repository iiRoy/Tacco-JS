let globalMapInstance;
let activeInfoWindowId = null; // Tracks the ID of the currently open information window
const windowContainer = new Map(); // Stores InfoBox instances, mapped by their unique identifiers
const pointMarkers = []; // Collection of all geographic markers
const DEFAULT_MAP_ELEMENT_ID = "mapa"; // ID of the HTML element where the map will be rendered
const DEFAULT_MARKER_ICON_PATH = 'img/marcador.png'; // Default icon for points of interest
const DEFAULT_MAP_LATITUDE = -18.8800397; // Initial center latitude for the map
const DEFAULT_MAP_LONGITUDE = -47.05878999999999; // Initial center longitude for the map
const DEFAULT_MAP_ZOOM_LEVEL = 7; // Initial zoom level for the map view

/**
 * Initializes the Google Maps application.
 * Sets up the map instance with default coordinates and options.
 */
function bootApplication() {
    // Ensure the Google Maps API is loaded before proceeding
    if (typeof google === 'undefined' || typeof google.maps === 'undefined') {
        console.error("Google Maps API not loaded. Cannot initialize application.");
        return;
    }

    // Define the central geographic coordinates for the initial map view
    const initialCoords = new google.maps.LatLng(DEFAULT_MAP_LATITUDE, DEFAULT_MAP_LONGITUDE);

    // Retrieve the HTML element designated for the map
    const mapDisplayElement = document.getElementById(DEFAULT_MAP_ELEMENT_ID);
    if (!mapDisplayElement) {
        console.error(`Map element with ID '${DEFAULT_MAP_ELEMENT_ID}' not found.`);
        return;
    }

    // Configure the map's initial properties
    const mapConfiguration = {
        zoom: DEFAULT_MAP_ZOOM_LEVEL, // Set the default zoom level
        center: initialCoords, // Position the map at the specified coordinates
        mapTypeId: google.maps.MapTypeId.HYBRID, // Use a hybrid view (satellite + roadmap)
        streetViewControl: false, // Disable Street View for a cleaner look
        fullscreenControl: true // Enable fullscreen control
    };

    // Instantiate the map object and assign it to the global variable
    globalMapInstance = new google.maps.Map(mapDisplayElement, mapConfiguration);

    console.info("Google Maps application initialized successfully.");
}

// Execute the map initialization routine upon script load
bootApplication();

/**
 * Closes the currently active information window, if one is open.
 * Resets the tracking variable for the active window.
 */
function closeActiveInfoWindow() {
    if (activeInfoWindowId !== null && windowContainer.has(activeInfoWindowId)) {
        const currentInfoWindow = windowContainer.get(activeInfoWindowId);
        currentInfoWindow.close();
        console.log(`Info window with ID ${activeInfoWindowId} closed.`);
        activeInfoWindowId = null; // Clear the reference to the closed window
    }
}

/**
 * Displays an information window associated with a specific point on the map.
 * Closes any previously open information window before opening the new one.
 * @param {number} dataIdentifier - The unique ID of the point to display details for.
 * @param {google.maps.Marker} targetMarker - The marker object associated with the point.
 */
function displayPointDetails(dataIdentifier, targetMarker) {
    // Attempt to close any information window that might be currently open
    closeActiveInfoWindow();

    // Verify if an information window exists for the given identifier
    if (!windowContainer.has(dataIdentifier)) {
        console.warn(`No info window found for identifier: ${dataIdentifier}.`);
        return;
    }

    // Retrieve the InfoBox instance from the container
    const selectedInfoWindow = windowContainer.get(dataIdentifier);

    // Open the selected information window on the map, anchored to its marker
    selectedInfoWindow.open(globalMapInstance, targetMarker);

    // Update the global tracker to reflect the newly opened window
    activeInfoWindowId = dataIdentifier;
    console.log(`Info window for ID ${dataIdentifier} opened.`);
}

/**
 * Fetches location data from a JSON file and renders them as markers on the map.
 * Also sets up information windows and marker clustering.
 */
function fetchAndRenderLocations() {
    // Preliminary check for Google Maps API availability
    if (typeof google === 'undefined' || typeof google.maps === 'undefined' || globalMapInstance === null) {
        console.error("Google Maps API or map instance not ready. Cannot fetch and render locations.");
        return;
    }

    // Use jQuery's AJAX capabilities to retrieve the location data
    $.getJSON('js/pontos.json', function(locationData) {
        // Initialize a bounds object to automatically adjust the map view
        const boundaryBox = new google.maps.LatLngBounds();

        // Check if location data was successfully retrieved and is an array
        if (!Array.isArray(locationData) || locationData.length === 0) {
            console.warn("No location data received or data is invalid. Skipping marker creation.");
            return;
        }

        // Process each location entry from the fetched data
        locationData.forEach(locationEntry => {
            // Validate essential properties of the location entry
            if (!locationEntry.LocationId || typeof locationEntry.LatCoord === 'undefined' || typeof locationEntry.LongCoord === 'undefined') {
                console.warn("Skipping malformed location entry:", locationEntry);
                return;
            }

            // Create a new marker for the current location
            const locationMarker = new google.maps.Marker({
                position: new google.maps.LatLng(locationEntry.LatCoord, locationEntry.LongCoord),
                title: locationEntry.DescriptionHtml ? `Details for: ${locationEntry.DescriptionHtml.substring(0, 30)}...` : 'Map Point of Interest', // Dynamic title
                icon: DEFAULT_MARKER_ICON_PATH, // Use the default marker icon
                map: null // Initially, markers are not added to the map directly, but to the clusterer
            });

            // Prepare options for the InfoBox (information window)
            const infoWindowOptions = {
                content: `<div class="info-window-content"><p>${locationEntry.DescriptionHtml}</p></div>`,
                pixelOffset: new google.maps.Size(-150, -20) // Adjust pixel offset for better positioning
            };

            // Instantiate a new InfoBox and store it in our container
            const currentInfoWindow = new InfoBox(infoWindowOptions);
            windowContainer.set(locationEntry.LocationId, currentInfoWindow);

            // Attach the marker to the InfoBox for easy reference
            currentInfoWindow.markerReference = locationMarker;

            // Add an event listener to the marker to open its corresponding InfoBox on click
            locationMarker.addListener('click', (eventObject) => {
                displayPointDetails(locationEntry.LocationId, locationMarker);
            });

            // Add the newly created marker to our global collection
            pointMarkers.push(locationMarker);

            // Extend the geographic bounds to include this marker's position
            boundaryBox.extend(locationMarker.getPosition());
        });

        // If markers were added, create a MarkerClusterer
        if (pointMarkers.length > 0) {
            const clusterManager = new MarkerClusterer(globalMapInstance, pointMarkers, {
                imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m'
            });
            console.log(`MarkerClusterer initialized with ${pointMarkers.length} markers.`);
        } else {
            console.info("No markers to cluster.");
        }

        // Adjust the map's viewport to fit all markers within the calculated bounds
        if (!boundaryBox.isEmpty()) {
            globalMapInstance.fitBounds(boundaryBox);
            // Optionally, add a slight zoom out after fitting to show context
            const listener = google.maps.event.addListener(globalMapInstance, "idle", function () {
                if (globalMapInstance.getZoom() > DEFAULT_MAP_ZOOM_LEVEL + 1) globalMapInstance.setZoom(DEFAULT_MAP_ZOOM_LEVEL + 1);
                google.maps.event.removeListener(listener);
            });
            console.log("Map bounds adjusted to fit all markers.");
        } else {
            console.info("Boundary box is empty, no adjustment needed.");
        }

    }).fail(function(jqxhr, textStatus, error) {
        // Handle potential errors during the AJAX request
        const err = textStatus + ", " + error;
        console.error("Request Failed: " + err);
        alert("Failed to load map data. Please try again later.");
    });
}

// Initiate the process of loading and displaying map points
fetchAndRenderLocations();