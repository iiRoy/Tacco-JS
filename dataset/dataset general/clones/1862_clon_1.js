/*
 * File: loadgpx.4.js - A JavaScript utility for parsing GPX data.
 *
 * This script provides functionality to load and display GPX (GPS Exchange Format)
 * data, typically containing tracks and waypoints, onto a Google Maps instance.
 *
 * Copyright Information:
 * Original Author: Kaz Okuda (http://notions.okuda.ca) - 2006
 *
 * This software is free. It is distributed under the terms of the GNU General Public License,
 * version 2 or any later version, as published by the Free Software Foundation.
 *
 * This program is distributed in the hope that it will be useful, but without any warranty;
 * without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 * Please refer to the GNU General Public License for full details.
 *
 * A copy of the GNU General Public License should have been provided with this program.
 * If not, write to:
 * Free Software Foundation, Inc.
 * 51 Franklin Street, Fifth Floor
 * Boston, MA 02110-1301, USA.
 *
 * For support, questions, or to leave comments, please visit:
 * http://notions.okuda.ca/geotagging/projects-im-working-on/gpx-viewer/
 * The GPL license link is also available there.
 *
 */

/*
 * Revision History and Updates:
 *
 *  - Rev 1: Initial core implementation.
 *  - Rev 2: Refactored `LoadGPXFileIntoGoogleMap` responsibility; added configuration
 *           options for track colour, width, and minimum trackpoint delta.
 *  - Rev 3: Enhanced waypoint parsing for improved compatibility with Firefox.
 *  - Rev 4: Major upgrade to Google Maps API v2. Attempted to modify map centering
 *           and zoom calculations, but GMAP API 2 requires prior centering/zooming.
 *           Bounding box calculations were retained as commented-out code for future use.
 *
 *  - 2010-05-28: Updated for Google Maps API v3 and significant file refactoring.
 *                (Contribution by Chris Peplin)
 *
 * Author: Kaz Okuda
 * Project URI: http://notions.okuda.ca/geotagging/projects-im-working-on/gpx-viewer/
 *
 * Google Maps API v3 updates by Chris Peplin
 * GitHub Fork: https://github.com/peplin/gpxviewer
 *
 */

// Define the GPXParser constructor function.
function GPXParser(xmlDoc, map) {

  // Store the XML document containing GPX data.
  this.xmlDoc = xmlDoc;

  // Store the Google Map object where data will be displayed.
  this.map = map;

  // Default track line colour (magenta).
  this.trackcolour = "#ff00ff";

  // Default track line width in pixels.
  this.trackwidth = 5;

  // Minimum distance delta between track points to avoid redundancy.
  this.mintrackpointdelta = 0.0001;

}


// Method to set the track line colour.
GPXParser.prototype.setTrackColour = function(colour) {

  // Update the internal track colour property.
  this.trackcolour = colour;

};


// Method to set the track line width.
GPXParser.prototype.setTrackWidth = function(width) {

  // Update the internal track width property.
  this.trackwidth = width;

};


// Method to set the minimum distance between consecutive track points.
// This helps in culling unnecessary points from the map rendering, improving performance.
GPXParser.prototype.setMinTrackPointDelta = function(delta) {

  // Update the minimum track point delta property.
  this.mintrackpointdelta = delta;

};


// Helper method to translate GPX node names into more readable strings.
GPXParser.prototype.translateName = function(name) {

  // Check if the name is "wpt" (waypoint).
  if (name == "wpt") {
    return "Waypoint";
  }

  // Check if the name is "trkpt" (track point).
  else if (name == "trkpt") {
    return "Track Point";
  }

  // If neither, return nothing.
};


// Method to create a Google Maps marker from a GPX point element.
GPXParser.prototype.createMarker = function(point) {

  // Extract longitude and latitude from the point element's attributes.
  var lon = parseFloat(point.getAttribute("lon"));
  var lat = parseFloat(point.getAttribute("lat"));

  // Initialize an empty string for marker's info window HTML content.
  var html = "";

  // Get all child elements named "html" within the point.
  var pointElements = point.getElementsByTagName("html");

  // If "html" elements are found, use their content for the info window.
  if (pointElements.length > 0) {
    for (i = 0; i < pointElements.item(0).childNodes.length; i++) {
      html += pointElements.item(0).childNodes[i].nodeValue;
    }
  }
  // If no "html" element, construct default HTML from point attributes and child nodes.
  else {
    // Start with a bolded translated name of the point type.
    html = "<b>" + this.translateName(point.nodeName) + "</b><br>";

    // Get all attributes of the point element.
    var attributes = point.attributes;
    var attrlen = attributes.length;

    // Iterate through attributes and append them to the HTML.
    for (i = 0; i < attrlen; i++) {
      html += attributes.item(i).name + " = " +
        attributes.item(i).nodeValue + "<br>";
    }

    // Check for child nodes if they exist.
    if (point.hasChildNodes) {
      var children = point.childNodes;
      var childrenlen = children.length;

      // Iterate through child nodes to extract their names and values.
      for (i = 0; i < childrenlen; i++) {
        // Skip non-element nodes or nodes without first child.
        if (children[i].nodeType != 1) continue;
        if (children[i].firstChild == null) continue;

        html += children[i].nodeName + " = " +
          children[i].firstChild.nodeValue + "<br>";
      }
    }
  }

  // Create a new Google Maps Marker object.
  var marker = new google.maps.Marker({
    position: new google.maps.LatLng(lat, lon), // Set marker position.
    map: this.map // Assign marker to the map.
  });

  // Create an info window for the marker.
  var infowindow = new google.maps.InfoWindow({
    content: html, // Set info window content.
    size: new google.maps.Size(50, 50) // Set info window size (deprecated in v3, but kept for compatibility).
  });

  // Add a click listener to the marker to open the info window.
  google.maps.event.addListener(marker, "click", function() {
    infowindow.open(this.map, marker); // Open the info window when marker is clicked.
  });

};


// Method to add a single track segment to the Google Map.
GPXParser.prototype.addTrackSegmentToMap = function(trackSegment, colour,
  width) {

  // Retrieve all track points within this segment.
  var trackpoints = trackSegment.getElementsByTagName("trkpt");

  // If no track points are found, exit.
  if (trackpoints.length == 0) {
    return;
  }

  // Initialize an array to hold LatLng objects for the polyline.
  var pointarray = [];

  // Process the very first track point.
  var lastlon = parseFloat(trackpoints[0].getAttribute("lon"));
  var lastlat = parseFloat(trackpoints[0].getAttribute("lat"));
  var latlng = new google.maps.LatLng(lastlat, lastlon);

  // Add the first point to the array.
  pointarray.push(latlng);

  // Iterate through the remaining track points, starting from the second one.
  for (var i = 1; i < trackpoints.length; i++) {
    var lon = parseFloat(trackpoints[i].getAttribute("lon"));
    var lat = parseFloat(trackpoints[i].getAttribute("lat"));

    // Calculate differences in latitude and longitude.
    var latdiff = lat - lastlat;
    var londiff = lon - lastlon;

    // Only add the point if it's sufficiently far from the last point,
    // based on the minimum track point delta.
    if (Math.sqrt(latdiff * latdiff + londiff * londiff) > this.mintrackpointdelta) {
      lastlon = lon; // Update last longitude.
      lastlat = lat; // Update last latitude.
      latlng = new google.maps.LatLng(lat, lon); // Create new LatLng object.
      pointarray.push(latlng); // Add to the array.
    }

  }

  // Create a new Google Maps Polyline object.
  var polyline = new google.maps.Polyline({
    path: pointarray, // Set the path of the polyline.
    strokeColor: colour, // Set the stroke colour.
    strokeWeight: width, // Set the stroke width.
    map: this.map // Assign the polyline to the map.
  });

};


// Method to add an entire track (which can contain multiple segments) to the map.
GPXParser.prototype.addTrackToMap = function(track, colour, width) {

  // Get all track segments within the given track.
  var segments = track.getElementsByTagName("trkseg");

  // Iterate over each segment and add it to the map.
  for (var i = 0; i < segments.length; i++) {
    // Call the helper function to add each segment.
    var segmentlatlngbounds = this.addTrackSegmentToMap(segments[i], colour,
      width);
  }

};


// Method to center and zoom the map based on the extent of a track segment or points.
GPXParser.prototype.centerAndZoom = function(trackSegment) {

  // Define the types of points to consider for bounding box calculation.
  var pointlist = new Array("trkpt", "wpt");

  // Initialize min/max latitude and longitude.
  var minlat = 0;
  var maxlat = 0;
  var minlon = 0;
  var maxlon = 0;

  // Loop through both track points and waypoints.
  for (var pointtype = 0; pointtype < pointlist.length; pointtype++) {

    // Retrieve all points of the current type from the track segment.
    var trackpoints = trackSegment.getElementsByTagName(
      pointlist[pointtype]);

    // Initialize min/max coordinates if they haven't been set yet and points exist.
    if ((trackpoints.length > 0) && (minlat == maxlat) && (minlat == 0)) {
      minlat = parseFloat(trackpoints[0].getAttribute("lat"));
      maxlat = parseFloat(trackpoints[0].getAttribute("lat"));
      minlon = parseFloat(trackpoints[0].getAttribute("lon"));
      maxlon = parseFloat(trackpoints[0].getAttribute("lon"));
    }

    // Iterate through all points to find the true min/max coordinates.
    for (var i = 0; i < trackpoints.length; i++) {
      var lon = parseFloat(trackpoints[i].getAttribute("lon"));
      var lat = parseFloat(trackpoints[i].getAttribute("lat"));

      // Update min/max longitude.
      if (lon < minlon) minlon = lon;
      if (lon > maxlon) maxlon = lon;

      // Update min/max latitude.
      if (lat < minlat) minlat = lat;
      if (lat > maxlat) maxlat = lat;
    }
  }

  // If no points were found (minlat/maxlat remain 0), set a default map view.
  if ((minlat == maxlat) && (minlat == 0)) {
    this.map.setCenter(new google.maps.LatLng(49.327667, -122.942333), 14);
    return;
  }

  // Calculate the center point based on the min/max coordinates.
  var centerlon = (maxlon + minlon) / 2;
  var centerlat = (maxlat + minlat) / 2;

  // Create a LatLngBounds object using the calculated min/max coordinates.
  var bounds = new google.maps.LatLngBounds(
    new google.maps.LatLng(minlat, minlon),
    new google.maps.LatLng(maxlat, maxlon));

  // Set the map center to the calculated center.
  this.map.setCenter(new google.maps.LatLng(centerlat, centerlon));

  // Adjust the map's zoom level to fit the entire bounds.
  this.map.fitBounds(bounds);

};


// Method to center and zoom the map based on an array of LatLngBounds.
GPXParser.prototype.centerAndZoomToLatLngBounds = function(latlngboundsarray) {

  // Create an empty bounding box.
  var boundingbox = new google.maps.LatLngBounds();

  // Iterate through the array of LatLngBounds.
  for (var i = 0; i < latlngboundsarray.length; i++) {
    // If a bounding box is not empty, extend the main boundingbox to include it.
    if (!latlngboundsarray[i].isEmpty()) {
      boundingbox.extend(latlngboundsarray[i].getSouthWest());
      boundingbox.extend(latlngboundsarray[i].getNorthEast());
    }
  }

  // Calculate the center latitude and longitude of the aggregated bounding box.
  var centerlat = (boundingbox.getNorthEast().lat() +
    boundingbox.getSouthWest().lat()) / 2;
  var centerlng = (boundingbox.getNorthEast().lng() +
    boundingbox.getSouthWest().lng()) / 2;

  // Set the map's center and zoom level.
  // Note: getBoundsZoomLevel is deprecated in v3, fitBounds is preferred.
  // This code might need update for full v3 compatibility but retains original logic.
  this.map.setCenter(new google.maps.LatLng(centerlat, centerlng),
    this.map.getBoundsZoomLevel(boundingbox));

};


// Method to add all track points from the GPX document to the map.
GPXParser.prototype.addTrackpointsToMap = function() {

  // Get all "trk" (track) elements from the XML document.
  var tracks = this.xmlDoc.documentElement.getElementsByTagName("trk");

  // Iterate through each track.
  for (var i = 0; i < tracks.length; i++) {
    // Add each track to the map using the configured colour and width.
    this.addTrackToMap(tracks[i], this.trackcolour, this.trackwidth);
  }

};


// Method to add all waypoints from the GPX document to the map.
GPXParser.prototype.addWaypointsToMap = function() {

  // Get all "wpt" (waypoint) elements from the XML document.
  var waypoints = this.xmlDoc.documentElement.getElementsByTagName("wpt");

  // Iterate through each waypoint.
  for (var i = 0; i < waypoints.length; i++) {
    // Create a marker for each waypoint.
    this.createMarker(waypoints[i]);
  }

};