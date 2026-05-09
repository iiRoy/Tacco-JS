const applicationSettings = {
    // Defines core parameters for the map display.
    mapConfiguration: {
        initialViewCoordinates: [40.735522, -73.997102], // Default latitude and longitude for map center.
        defaultZoomLevel: 14, // Initial zoom factor.
        preventScrollZoom: false // Controls user interaction with scroll wheel.
    },
    // Settings for the base map tile layer.
    tileLayerSource: {
        urlPattern: 'https://{s}.tiles.mapbox.com/v3/{id}/{z}/{x}/{y}.png',
        maximumZoom: 22,
        attributionString: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
                           '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
                           'Imagery © <a href="http://mapbox.com">Mapbox</a>',
        sourceIdentifier: 'examples.map-i875mjb7'
    },
    // Common properties for custom marker icons.
    iconSpecifications: {
        dimensions: [25, 30], // Width and height in pixels.
        anchorOffset: [22, 94], // Point of the icon that corresponds to the marker's location.
        popupOffset: [-3, -76] // Point from which the popup should open relative to the icon anchor.
    },
    // Paths to various icon images.
    imageAssetPaths: {
        lodging: 'static/img/hotel.png',
        vehicleStop: 'static/img/parking.png'
    }
};

/**
 * Constructs a custom Leaflet icon object using predefined specifications.
 * @param {string} imageLocation - The URL path to the icon image file.
 * @returns {L.Icon} A configured Leaflet icon instance.
 */
const createCustomMarkerIcon = (imageLocation) => {
    const iconProps = applicationSettings.iconSpecifications;
    return L.icon({
        iconUrl: imageLocation,
        iconSize: iconProps.dimensions,
        iconAnchor: iconProps.anchorOffset,
        popupAnchor: iconProps.popupOffset
    });
};

// Initialize custom icon types for different points of interest.
const lodgingMarkerIcon = createCustomMarkerIcon(applicationSettings.imageAssetPaths.lodging);
const vehicleStopIcon = createCustomMarkerIcon(applicationSettings.imageAssetPaths.vehicleStop);

// Verify the existence of the HTML element designated for the map display.
const primaryMapContainerId = 'map';
const mapTargetElement = document.getElementById(primaryMapContainerId);
if (!mapTargetElement) {
    console.error(`Map container with ID '${primaryMapContainerId}' not found. Geographic display cannot be initialized.`);
    // A robust application might render a fallback message or take alternative action here.
    // For this demonstration, we proceed assuming the element exists.
}

// Extract map center coordinates for clarity.
const centralLat = applicationSettings.mapConfiguration.initialViewCoordinates[0];
const centralLng = applicationSettings.mapConfiguration.initialViewCoordinates[1];
const initialMapCenter = new L.LatLng(centralLat, centralLng);

// Initialize the main Leaflet map instance.
const geographicDisplay = L.map(primaryMapContainerId, {
    center: initialMapCenter,
    zoom: applicationSettings.mapConfiguration.defaultZoomLevel,
    scrollWheelZoom: applicationSettings.mapConfiguration.preventScrollZoom // Control mouse wheel zoom.
});

// Configure and add the base tile layer to the map.
const baseImageryLayer = L.tileLayer(applicationSettings.tileLayerSource.urlPattern, {
    maxZoom: applicationSettings.tileLayerSource.maximumZoom,
    attribution: applicationSettings.tileLayerSource.attributionString,
    id: applicationSettings.tileLayerSource.sourceIdentifier,
    detectRetina: true // Enable high-resolution tile display for retina screens.
});

baseImageryLayer.addTo(geographicDisplay);

/**
 * Adds a point of interest marker to the map, complete with an optional icon and popup.
 * @param {object} pointDetails - Object containing coordinates, type, and popup content.
 * @param {L.Map} targetMapInstance - The Leaflet map to add the marker to.
 */
const deployLocationPin = (pointDetails, targetMapInstance) => {
    const markerOptions = {};
    // Assign specific icons based on the type of point.
    if (pointDetails.kind === 'parking') {
        markerOptions.icon = vehicleStopIcon;
    } else if (pointDetails.kind === 'hotel') {
        markerOptions.icon = lodgingMarkerIcon;
    }
    // If 'kind' is 'event' or any other unhandled type, `markerOptions.icon` remains undefined,
    // causing L.marker to use its default blue icon, consistent with original behavior.

    L.marker(pointDetails.geoCoordinates, markerOptions)
        .addTo(targetMapInstance)
        .bindPopup(pointDetails.descriptionHtml)
        .openPopup(); // Display the popup immediately upon marker creation.
};

// Centralized data structure for all points of interest to be displayed.
const allPointsOfInterest = [
    {
        geoCoordinates: [40.737257, -73.999952],
        kind: 'parking',
        descriptionHtml: "<h4>Quick Park</h4><p><em>Address: 175 W 12th St</em><br/>Phone: (646) 336-6225</p>"
    },
    {
        geoCoordinates: [40.737987, -73.995353],
        kind: 'parking',
        descriptionHtml: "<h4>Icon Parking</h4><p><em>Location: Union Square, Flatiron, 65 W 15th St</em><br/>Phone: (212) 366-4632</p>"
    },
    {
        geoCoordinates: [40.735843, -73.995481],
        kind: 'parking',
        descriptionHtml: "<h4>Central Parking</h4><p><em>Area: Greenwich Village, Union Square, 20 W 13th St</em><br/>Customer Service: (800) 836-6666</p>"
    },
    {
        geoCoordinates: [40.745614, -73.992231],
        kind: 'hotel',
        descriptionHtml: "<h4>Holiday Inn Manhattan Chelsea</h4><p>Rates: $289.00 - $309.00<br/>Contact: 212-430-8500 (request New School corporate rate)<br/>Web: <a href='http://www.hidowntown-nyc.com/' target='_blank'>Website Link</a></p>"
    },
    {
        geoCoordinates: [40.739726, -73.982344],
        kind: 'hotel',
        descriptionHtml: "<h4>Marcel at Gramercy</h4><p>Rates: $329.00<br/>Contact: 1-888-664-6835 (request New School corporate rate)<br/>Web: <a href='http://www.hotelmarcelnewyork.com/' target='_blank'>Hotel Marcel New York</a></p>"
    },
    {
        geoCoordinates: [40.732738, -73.998708],
        kind: 'hotel',
        descriptionHtml: "<h4>The Washington Square Hotel</h4><p>Rates: $263.00 - $361.00<br/>Contact: 212-777-9515 (request New School corporate rate)<br/>Web: <a href='http://www.wshotel.com/' target='_blank'>Official Website</a></p>"
    },
    {
        geoCoordinates: [40.735522, -73.997102],
        kind: 'event', // This marker will use the default Leaflet icon.
        descriptionHtml: "<h4>[EVENT] Parsons The New School for Design</h4><p>For inquiries regarding hotel reservations, please reach out to Katie Wanner at <a href='mailto:wannk858@newschool.edu'>wannk858@newschool.edu</a></p>"
    }
];

// Iterate through the collected points of interest and add each one to the map.
allPointsOfInterest.forEach(point => deployLocationPin(point, geographicDisplay));