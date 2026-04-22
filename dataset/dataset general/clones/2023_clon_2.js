// Global reference for our primary mapping object
var mainMap;
// Stores the unique ID of the currently displayed information panel
var activePopupId;
// A collection of all info panels, indexed by their unique IDs
var popupCollection = [];
// An array to hold all geographic marker objects
var pointMarkers = [];

// Function to set up the interactive map interface
function setupMapDisplay()
{
	// Define the initial geographical coordinates for the map's center
	var initialCoords = new google.maps.LatLng(-18.8800397, -47.05878999999999);

    // Configuration settings for the map's view
    var viewSettings = {
        zoom: 5, // Default zoom level
		center: initialCoords, // Map's starting central point
        mapTypeId: google.maps.MapTypeId.ROADMAP // Type of map tiles to display
    };

    // Instantiate the map object and assign it to the global variable
    mainMap = new google.maps.Map(document.getElementById("mapa"), viewSettings);
}

// Execute the map setup routine immediately
setupMapDisplay();

// Displays a specific information panel associated with a marker
function displayPopupPanel(panelId, targetPin) {
	// Check if there's an active panel and if its object exists in the collection
	if (typeof(activePopupId) === 'number' && typeof(popupCollection[activePopupId]) === 'object') {
		// Close the previously opened panel
		popupCollection[activePopupId].close();
	}

	// Open the new panel over the main map, anchored to the target marker
	popupCollection[panelId].open(mainMap, targetPin);
	// Update the identifier of the currently active panel
	activePopupId = panelId;
}

// Retrieves location data from a JSON file and populates the map with markers and info panels
function fetchAndRenderLocations() {

	// Make an AJAX request to load geographical data from a local JSON file
	$.getJSON('js/pontos.json', function(locationData) {

		// Initialize an object to calculate the bounding box for all markers
		var boundaryBox = new google.maps.LatLngBounds();

		// Iterate over each location entry received from the JSON data
		$.each(locationData, function(idx, singleLocation) {

			// Create a new map marker for the current location
			var currentPin = new google.maps.Marker({
				position: new google.maps.LatLng(singleLocation.Latitude, singleLocation.Longitude), // Coordinates for the pin
				title: "A bespoke location point! :-)", // Tooltip text for the marker
				icon: 'img/marcador.png' // Custom image for the marker icon
			});

			// Define options for the information panel
			var panelOptions = {
				content: "<p>" + singleLocation.Descricao + "</p>", // HTML content for the panel
				pixelOffset: new google.maps.Size(-150, 0) // Adjust the panel's position relative to the marker
        	};

			// Create a new InfoBox instance and store it in our collection
			popupCollection[singleLocation.Id] = new InfoBox(panelOptions);
			// Associate the marker with its respective info panel
			popupCollection[singleLocation.Id].associatedPin = currentPin;

			// Attach a click event listener to the marker to open its info panel
			popupCollection[singleLocation.Id].eventHandler = google.maps.event.addListener(currentPin, 'click', function (evt) {
				displayPopupPanel(singleLocation.Id, currentPin); // Call the function to show the panel
			});

			// Add the newly created marker to our global array of markers
			pointMarkers.push(currentPin);

			// Extend the geographical bounds to include this marker's position
			boundaryBox.extend(currentPin.position);

		}); // End of $.each loop

		// Create a marker clusterer to group nearby markers for better performance and aesthetics
		var clusterManager = new MarkerClusterer(mainMap, pointMarkers);

		// Adjust the map's viewport to fit all markers within the calculated bounds
		mainMap.fitBounds(boundaryBox);

	}); // End of $.getJSON callback

} // End of fetchAndRenderLocations function

// Initiate the process of loading and displaying map points
fetchAndRenderLocations();