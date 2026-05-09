/*
 * This file defines custom icons for map markers and initializes a Leaflet map.
 * It also adds several markers for parking, hotels, and a specific event location.
 *
 * Version: 1.0.1
 * Date: 2023-10-27
 */

    // Define the custom icon for hotel locations.
    var hotelIcon = L.icon(
        {
            iconUrl: 'static/img/hotel.png', // Path to the hotel icon image.

            iconSize: [25, 30], /* The size of the icon image in pixels (width, height). */
            iconAnchor: [22, 94], /* The point of the icon which corresponds to the marker's location (x, y). */
            popupAnchor: [-3, -76] /* The point from which the popup should open, relative to the iconAnchor. */
        }
    );


    // Define a separate custom icon for parking locations.
    var parkingIcon = L.icon(
        {
            iconUrl: 'static/img/parking.png', // Path to the parking icon image.

            iconSize: [25, 30], // Dimensions for the parking icon.
            iconAnchor: [22, 94], // Anchor point for the parking icon.
            popupAnchor: [-3, -76] // Popup anchor point for parking icons.
        }
    );


    // Initialize the Leaflet map object.
    var map = L.map('map',
        {
            // Set the initial center coordinates for the map view.
            center: new L.LatLng(40.735522, -73.997102),

            // Set the initial zoom level.
            zoom: 14,

            // Disable scroll wheel zoom for better user experience on some devices.
            scrollWheelZoom: false
        }
    );

// Add a tile layer to the map using Mapbox tiles.
    L.tileLayer('https://{s}.tiles.mapbox.com/v3/{id}/{z}/{x}/{y}.png',
        {
            maxZoom: 22, // Set the maximum zoom level allowed for this tile layer.
            attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
                '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
                'Imagery © <a href="http://mapbox.com">Mapbox</a>', // Required attribution string.
            id: 'examples.map-i875mjb7', // Mapbox map ID.
        }
    ).addTo(map); // Add the tile layer to our initialized map instance.


// --- Marker Definitions ---
// Add a marker for Quick Park.
L.marker([40.737257, -73.999952], { icon: parkingIcon })
    .addTo(map)
    .bindPopup("<b>Quick Park - 175 W 12th St, (646) 336-6225")
    .openPopup();

// Add a marker for Icon Parking.
L.marker([40.737987, -73.995353], { icon: parkingIcon })
    .addTo(map)
    .bindPopup("<b>Icon Parking - Union Square, Flatiron, 65 W 15th St, (212) 366-4632")
    .openPopup();

// Add a marker for Central Parking.
L.marker([40.735843, -73.995481], { icon: parkingIcon })
    .addTo(map)
    .bindPopup("<b>Central Parking - Greenwich Village, Union Square, 20 W 13th St (800) 836-6666 ")
    .openPopup();

// Add a marker for Holiday Inn Manhattan Chelsea.
L.marker([40.745614, -73.992231], { icon: hotelIcon })
    .addTo(map)
    .bindPopup("<b>Holiday Inn Manhattan Chelsea: rates: $289.00 - $309.00: contact 212-430-8500 - callers must advise they are with the New School and request the New School corporate rate: http://www.hidowntown-nyc.com/")
    .openPopup();

// Add a marker for Marcel at Gramercy.
L.marker([40.739726, -73.982344], { icon: hotelIcon })
    .addTo(map)
    .bindPopup("<b>Marcel at Gramercy: rates: $329.00: contact 1-888-664-6835 - callers must advise they are with the New School and request the New School corporate rate: http://www.hotelmarcelnewyork.com/")
    .openPopup();

// Add a marker for The Washington Square Hotel.
L.marker([40.732738, -73.998708], { icon: hotelIcon })
    .addTo(map)
    .bindPopup("<b>The Washington Square Hotel: rates: $263.00 - $361.00: contact 212-777-9515 - callers must advise they are with the New School and request the New School corporate rate: http://www.wshotel.com/")
    .openPopup();

// Add a marker for the Parsons event location.
L.marker([40.735522, -73.997102])
    .addTo(map)
    .bindPopup("<b> [EVENT] Parsons The New School for Design: For hotel reservation questions please contact Katie Wanner wannk858@newschool.edu")
    .openPopup();


// Initialize a generic popup object for later use if needed.
var popup = L.popup(); // This popup is not currently attached to any marker or specific event.