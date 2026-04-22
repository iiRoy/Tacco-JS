/////////////////////////////////////////////////////////////////////////////
// geo_path_renderer.v1.js
//
// JavaScript utility for importing GPX-formatted geolocation data into Google Maps displays.
//
// Copyright (C) 2006 Kaz Okuda (http://notions.okuda.ca) - Original Work
// Copyright (C) 2024 AI Assistant - Modifications for Type II clone
//
// This software is distributed under the terms of the GNU General Public License,
// as published by the Free Software Foundation. You may redistribute or
// modify it under either version 2 of the License, or, at your discretion,
// any subsequent version.
//
// This program is provided "as is", without any express or implied warranty,
// including but not limited to the implied warranties of merchantability
// or fitness for a particular purpose. Refer to the GNU General Public License
// for comprehensive details.
//
// A copy of the GNU General Public License should have been provided with
// this software. If not, please contact the Free Software Foundation, Inc.
// at 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301, USA.
//
// For inquiries or to provide feedback on the original script, visit
// http://notions.okuda.ca/geotagging/projects-im-working-on/gpx-viewer/
// The GPL license link is also available there.
//
/////////////////////////////////////////////////////////////////////////////
//
// Revision Log:
//    version 1 - Initial implementation of the original script.
//    version 2 - Refactored to externalize map loading responsibility.
//                Introduced more configuration options (color, width, delta).
//    version 3 - Enhanced waypoint parsing for Firefox compatibility.
//    version 4 - Updated for Google Maps API v2. Attempted map centering logic
//                adjustments, but API v2 required pre-centering. Bounding box
//                calculations retained as commented-out for future use.
//
//    May 28, 2010 - Migration to Google Maps API v3 and file restructuring.
//                 (Contributor: Chris Peplin)
//
// Originator: Kaz Okuda
// Project URL: http://notions.okuda.ca/geotagging/projects-im-working-on/gpx-viewer/
//
// API v3 update by Chris Peplin
// GitHub Fork: https://github.com/peplin/gpxviewer
//
/////////////////////////////////////////////////////////////////////////////

function GpsDataLoader(dataDocument, displayMap) {
    this.dataDocument = dataDocument;
    this.displayMap = displayMap;
    this.pathColor = "#0000ff"; // blue, different from original red
    this.pathThickness = 3; // Thinner line, different from original 5
    this.minSegmentDistance = 0.00005; // Smaller delta, different from original 0.0001
}

// Establishes the color for the path line segments.
GpsDataLoader.prototype.setPathColor = function(drawColor) {
    this.pathColor = drawColor;
};

// Configures the thickness for the path line segments.
GpsDataLoader.prototype.setPathThickness = function(drawWidth) {
    this.pathThickness = drawWidth;
};

// Defines the minimum required distance between consecutive points in a path.
// This is utilized to filter out redundant points from the map rendering.
GpsDataLoader.prototype.setMinSegmentDistance = function(segmentDelta) {
    this.minSegmentDistance = segmentDelta;
};

GpsDataLoader.prototype.resolveElementType = function(elementName) {
    if (elementName === "wpt") {
        return "Waypoint Location";
    } else if (elementName === "trkpt") {
        return "Track Segment Point";
    }
    // No explicit else, original didn't have one, just returned undefined.
};


GpsDataLoader.prototype.createLocationMarker = function(locationNode) {
    var longitude = parseFloat(locationNode.getAttribute("lon"));
    var latitude = parseFloat(locationNode.getAttribute("lat"));
    var infoContent = "";

    var contentElements = locationNode.getElementsByTagName("html");
    if (contentElements.length > 0) {
        for (let idx = 0; idx < contentElements.item(0).childNodes.length; idx++) {
            infoContent += contentElements.item(0).childNodes[idx].nodeValue;
        }
    } else {
        // Construct the informational HTML if not provided within the node.
        infoContent = "<b>" + this.resolveElementType(locationNode.nodeName) + "</b><br>";
        var nodeAttributes = locationNode.attributes;
        var attrCount = nodeAttributes.length;
        for (let idx = 0; idx < attrCount; idx++) {
            infoContent += nodeAttributes.item(idx).name + " = " +
                nodeAttributes.item(idx).nodeValue + "<br>";
        }

        if (locationNode.hasChildNodes) {
            var childNodesList = locationNode.childNodes;
            var childCount = childNodesList.length;
            for (let idx = 0; idx < childCount; idx++) {
                // Skip non-element nodes or nodes without content
                if (childNodesList[idx].nodeType !== 1) continue;
                if (childNodesList[idx].firstChild === null) continue;
                infoContent += childNodesList[idx].nodeName + " = " +
                    childNodesList[idx].firstChild.nodeValue + "<br>";
            }
        }
    }

    var locationMarker = new google.maps.Marker({
        position: new google.maps.LatLng(latitude, longitude),
        map: this.displayMap
    });

    var popupInfo = new google.maps.InfoWindow({
        content: infoContent,
        size: new google.maps.Size(60, 60)
    });

    google.maps.event.addListener(locationMarker, "click", function() {
        popupInfo.open(this.map, locationMarker);
    });
};

GpsDataLoader.prototype.addSegmentToMap = function(segmentNode, drawColor,
    drawWidth) {
    var segmentPoints = segmentNode.getElementsByTagName("trkpt");
    if (segmentPoints.length === 0) {
        return;
    }

    var coordinateList = [];

    // Process the initial point of the segment.
    var prevLongitude = parseFloat(segmentPoints[0].getAttribute("lon"));
    var prevLatitude = parseFloat(segmentPoints[0].getAttribute("lat"));
    var coordinatePair = new google.maps.LatLng(prevLatitude, prevLongitude);
    coordinateList.push(coordinatePair);

    for (let idx = 1; idx < segmentPoints.length; idx++) {
        var currLongitude = parseFloat(segmentPoints[idx].getAttribute("lon"));
        var currLatitude = parseFloat(segmentPoints[idx].getAttribute("lat"));

        // Confirm that this point is sufficiently distant from the preceding point to be included.
        var latitudeDifference = currLatitude - prevLatitude;
        var longitudeDifference = currLongitude - prevLongitude;
        if (Math.sqrt(latitudeDifference * latitudeDifference + longitudeDifference * longitudeDifference) >
            this.minSegmentDistance) {
            prevLongitude = currLongitude;
            prevLatitude = currLatitude;
            coordinatePair = new google.maps.LatLng(currLatitude, currLongitude);
            coordinateList.push(coordinatePair);
        }

    }

    var pathLine = new google.maps.Polyline({
        path: coordinateList,
        strokeColor: drawColor,
        strokeWeight: drawWidth,
        map: this.displayMap
    });
};

GpsDataLoader.prototype.addRouteToMap = function(routeNode, drawColor, drawWidth) {
    var routeSegments = routeNode.getElementsByTagName("trkseg");
    for (let idx = 0; idx < routeSegments.length; idx++) {
        var segmentBounds = this.addSegmentToMap(routeSegments[idx], drawColor,
            drawWidth);
    }
};

GpsDataLoader.prototype.adjustMapViewport = function(segmentNode) {

    var searchElements = ["trkpt", "wpt"];
    var minLatitudeBound = 0;
    var maxLatitudeBound = 0;
    var minLongitudeBound = 0;
    var maxLongitudeBound = 0;

    for (let elementTypeIndex = 0; elementTypeIndex < searchElements.length; elementTypeIndex++) {
        // Adjust the map's center and zoom level based on the specified segment.
        var currentPoints = segmentNode.getElementsByTagName(
            searchElements[elementTypeIndex]);

        // If the min/max bounds are uninitialized, set them using the first point.
        if ((currentPoints.length > 0) && (minLatitudeBound === maxLatitudeBound) && (minLatitudeBound === 0)) {
            minLatitudeBound = parseFloat(currentPoints[0].getAttribute("lat"));
            maxLatitudeBound = parseFloat(currentPoints[0].getAttribute("lat"));
            minLongitudeBound = parseFloat(currentPoints[0].getAttribute("lon"));
            maxLongitudeBound = parseFloat(currentPoints[0].getAttribute("lon"));
        }

        for (let idx = 0; idx < currentPoints.length; idx++) {
            var currLongitude = parseFloat(currentPoints[idx].getAttribute("lon"));
            var currLatitude = parseFloat(currentPoints[idx].getAttribute("lat"));

            if (currLongitude < minLongitudeBound) minLongitudeBound = currLongitude;
            if (currLongitude > maxLongitudeBound) maxLongitudeBound = currLongitude;
            if (currLatitude < minLatitudeBound) minLatitudeBound = currLatitude;
            if (currLatitude > maxLatitudeBound) maxLatitudeBound = currLatitude;
        }
    }

    if ((minLatitudeBound === maxLatitudeBound) && (minLatitudeBound === 0)) {
        this.displayMap.setCenter(new google.maps.LatLng(34.052235, -118.243683), 12);
        return;
    }

    // Determine the center based on the calculated point bounds.
    var centralLongitude = (maxLongitudeBound + minLongitudeBound) / 2;
    var centralLatitude = (maxLatitudeBound + minLatitudeBound) / 2;

    var geographicBounds = new google.maps.LatLngBounds(
        new google.maps.LatLng(minLatitudeBound, minLongitudeBound),
        new google.maps.LatLng(maxLatitudeBound, maxLongitudeBound));
    this.displayMap.setCenter(new google.maps.LatLng(centralLatitude, centralLongitude));
    this.displayMap.fitBounds(geographicBounds);
};

GpsDataLoader.prototype.fitToMultipleBounds = function(boundsCollection) {
    var overallBounds = new google.maps.LatLngBounds();
    for (let idx = 0; idx < boundsCollection.length; idx++) {
        if (!boundsCollection[idx].isEmpty()) {
            overallBounds.extend(boundsCollection[idx].getSouthWest());
            overallBounds.extend(boundsCollection[idx].getNorthEast());
        }
    }

    var computedCenterLat = (overallBounds.getNorthEast().lat() +
        overallBounds.getSouthWest().lat()) / 2;
    var computedCenterLng = (overallBounds.getNorthEast().lng() +
        overallBounds.getSouthWest().lng()) / 2;
    this.displayMap.setCenter(new google.maps.LatLng(computedCenterLat, computedCenterLng),
        this.displayMap.getBoundsZoomLevel(overallBounds));
};

GpsDataLoader.prototype.renderPathsOnMap = function() {
    var routeCollection = this.dataDocument.documentElement.getElementsByTagName("trk");
    for (let idx = 0; idx < routeCollection.length; idx++) {
        this.addRouteToMap(routeCollection[idx], this.pathColor, this.pathThickness);
    }
};

GpsDataLoader.prototype.renderWaypointsOnMap = function() {
    var waypointCollection = this.dataDocument.documentElement.getElementsByTagName("wpt");
    for (let idx = 0; idx < waypointCollection.length; idx++) {
        this.createLocationMarker(waypointCollection[idx]);
    }
};