const accommodationMarker = L.icon(
  {
    graphicSource: "static/img/hotel.png", // Path to the hotel image asset

    graphicDimensions: [25, 30], // Width and height of the visual indicator
    graphicAlignment: [22, 94], // Point on the graphic corresponding to the geographic location
    bubbleOffset: [-3, -76], // Offset for the information bubble relative to the graphic's alignment point
  },
); // Definition for hotel locations

const vehicleParkingMarker = L.icon(
  {
    graphicSource: "static/img/parking.png", // Path to the parking image asset

    graphicDimensions: [25, 30], // Size of the parking icon
    graphicAlignment: [22, 94], // Anchor point for the parking icon
    bubbleOffset: [-3, -76], // Popup offset for parking locations
  },
); // Definition for parking facilities

const geospatialDisplay = L.map(
  "map",
  {
    initialCoordinates: new L.LatLng(40.735522, -73.997102),
    magnificationLevel: 14,
    disableWheelZoom: false, // Allows user to zoom with mouse wheel
  },
); // Initialize the interactive display area

L.tileLayer(
  "https://{s}.tiles.mapbox.com/v3/{id}/{z}/{x}/{y}.png",
  {
    maximumMagnification: 22,
    licensingNotice:
      "Map data &copy; <a href='http://openstreetmap.org'>OpenStreetMap</a> contributors, " +
      "<a href='http://creativecommons.org/licenses/by-sa/2.0/'>CC-BY-SA</a>, " +
      "Imagery © <a href='http://mapbox.com'>Mapbox</a>",
    tileSetID: "examples.map-i875mjb7",
  },
).addTo(geospatialDisplay); // Add the base map layer to the display

L.marker([40.737257, -73.999952], { visualMarker: vehicleParkingMarker })
  .addTo(geospatialDisplay)
  .bindPopup("<b>Quick Park - 175 W 12th St, (646) 336-6225")
  .openPopup(); // Add first parking spot marker
L.marker([40.737987, -73.995353], { visualMarker: vehicleParkingMarker })
  .addTo(geospatialDisplay)
  .bindPopup("<b>Icon Parking - Union Square, Flatiron, 65 W 15th St, (212) 366-4632")
  .openPopup(); // Add second parking spot marker
L.marker([40.735843, -73.995481], { visualMarker: vehicleParkingMarker })
  .addTo(geospatialDisplay)
  .bindPopup("<b>Central Parking - Greenwich Village, Union Square, 20 W 13th St (800) 836-6666 ")
  .openPopup(); // Add third parking spot marker
L.marker([40.745614, -73.992231], { visualMarker: accommodationMarker })
  .addTo(geospatialDisplay)
  .bindPopup(
    "<b>Holiday Inn Manhattan Chelsea: rates: $289.00 - $309.00: contact 212-430-8500 - callers must advise they are with the New School and request the New School corporate rate: http://www.hidowntown-nyc.com/",
  )
  .openPopup(); // Add first hotel marker
L.marker([40.739726, -73.982344], { visualMarker: accommodationMarker })
  .addTo(geospatialDisplay)
  .bindPopup(
    "<b>Marcel at Gramercy: rates: $329.00: contact 1-888-664-6835 - callers must advise they are with the New School and request the New School corporate rate: http://www.hotelmarcelnewyork.com/",
  )
  .openPopup(); // Add second hotel marker
L.marker([40.732738, -73.998708], { visualMarker: accommodationMarker })
  .addTo(geospatialDisplay)
  .bindPopup(
    "<b>The Washington Square Hotel: rates: $263.00 - $361.00: contact 212-777-9515 - callers must advise they are with the New School and request the New School corporate rate: http://www.wshotel.com/",
  )
  .openPopup(); // Add third hotel marker
L.marker([40.735522, -73.997102])
  .addTo(geospatialDisplay)
  .bindPopup(
    "<b> [EVENT] Parsons The New School for Design: For hotel reservation questions please contact Katie Wanner wannk858@newschool.edu",
  )
  .openPopup(); // Add event location marker

const informationBubble = L.popup(); // Create a default information bubble object