/**
 * GeoRouteVisualizer
 *
 * A sophisticated JavaScript utility for parsing GPX-like geographic data
 * from an XML Document Object Model and rendering it onto a Google Maps display.
 * This component handles the visualization of tracked paths and significant
 * waypoints, offering configurable styling and viewport adjustment.
 *
 * This software is provided under the terms of the GNU General Public License,
 * version 2 or any later version. For detailed licensing information, please
 * refer to the accompanying LICENSE file or visit the GNU website.
 *
 * Author: Kaz Okuda (original concept)
 * Enhanced for Google Maps API v3 by Chris Peplin
 * Refactored and modernized by AI Assistant for Type III cloning.
 *
 * Extensive modifications applied:
 * - Renamed all classes, methods, variables, and parameters.
 * - Updated to use modern JavaScript syntax (const, let, arrow functions).
 * - Rewrote comments for clarity and style.
 * - Introduced helper functions for common operations (e.g., attribute parsing).
 * - Added guard clauses and validation checks for robustness.
 * - Modified default values and styling parameters.
 * - Refactored HTML generation using template literals.
 * - Streamlined loop structures where appropriate.
 * - Removed redundant or less critical functionality (`centerAndZoomToLatLngBounds`).
 * - Altered data processing logic slightly while maintaining core functionality.
 * - Changed numerical precision and distance calculation methods.
 */

function GeoRouteVisualizer(sourceDataDOM, displayArea) {
    // Validate essential inputs upon instantiation.
    if (!(sourceDataDOM instanceof Document) || !displayArea) {
        console.error("GeoRouteVisualizer: Invalid sourceDataDOM or displayArea provided.");
        throw new Error("Initialization failed: XML document or map instance is missing.");
    }

    /** @private {Document} The XML document containing geographic data. */
    this.sourceDataDOM = sourceDataDOM;
    /** @private {google.maps.Map} The Google Maps instance for visualization. */
    this.displayArea = displayArea;

    /** @private {string} Default hexadecimal color for path segments. */
    this.pathStrokeColor = "#0000ff"; // A distinct blue
    /** @private {number} Default pixel thickness for path segments. */
    this.pathStrokeWeight = 6;
    /** @private {number} Minimum distance (in degrees) between consecutive path points to be rendered. */
    this.minSegmentDistance = 0.00005; // Slightly stricter delta
}

/**
 * Helper to safely parse a float attribute from an XML node.
 * @private
 * @param {Element} node The XML element.
 * @param {string} attributeName The name of the attribute to parse.
 * @returns {number} The parsed float value, or NaN if not found/invalid.
 */
const _safeParseFloatAttribute = (node, attributeName) => {
    const attrValue = node.getAttribute(attributeName);
    return attrValue ? parseFloat(attrValue) : NaN;
};

/**
 * Configures the visual color for all subsequent path renderings.
 * @param {string} newColor The new hexadecimal color string (e.g., "#RRGGBB").
 */
GeoRouteVisualizer.prototype.definePathColor = function(newColor) {
    if (typeof newColor === 'string' && newColor.match(/^#[0-9a-fA-F]{6}$/)) {
        this.pathStrokeColor = newColor;
    } else {
        console.warn("Invalid color format provided. Keeping current path color.");
    }
};

/**
 * Establishes the pixel thickness for path segments.
 * @param {number} newThickness The new width in pixels.
 */
GeoRouteVisualizer.prototype.definePathThickness = function(newThickness) {
    if (typeof newThickness === 'number' && newThickness > 0) {
        this.pathStrokeWeight = newThickness;
    } else {
        console.warn("Invalid thickness value provided. Keeping current path thickness.");
    }
};

/**
 * Sets the minimum spatial gap required between successive points to be included in a path.
 * This helps in culling redundant points and optimizing rendering performance.
 * @param {number} minimumGap The minimum distance threshold (in degrees).
 */
GeoRouteVisualizer.prototype.establishMinPointGap = function(minimumGap) {
    if (typeof minimumGap === 'number' && minimumGap >= 0) {
        this.minSegmentDistance = minimumGap;
    } else {
        console.warn("Invalid minimum point gap provided. Keeping current value.");
    }
};

/**
 * Provides a user-friendly label for a given XML node name.
 * @private
 * @param {string} nodeIdentifier The original XML node name (e.g., "wpt", "trkpt").
 * @returns {string} A descriptive label for the node type.
 */
GeoRouteVisualizer.prototype.getFeatureLabel = function(nodeIdentifier) {
    switch (nodeIdentifier) {
        case "wpt":
            return "Geographic Waypoint";
        case "trkpt":
            return "Track Coordinate";
        case "rtept":
            return "Route Point";
        default:
            return "Unknown Feature";
    }
};

/**
 * Creates and places a map marker (pin) on the display area for a given geographic element.
 * The marker will display detailed information in an info window upon click.
 * @param {Element} elementNode The XML element representing a point (e.g., <wpt>).
 */
GeoRouteVisualizer.prototype.produceMapPin = function(elementNode) {
    const longitude = _safeParseFloatAttribute(elementNode, "lon");
    const latitude = _safeParseFloatAttribute(elementNode, "lat");

    // Guard clause for invalid coordinates
    if (isNaN(latitude) || isNaN(longitude)) {
        console.warn("Skipping marker due to invalid coordinates:", elementNode);
        return;
    }

    const position = new google.maps.LatLng(latitude, longitude);
    let contentHtml = '';

    const htmlElements = elementNode.getElementsByTagName("html");
    if (htmlElements.length > 0 && htmlElements[0].childNodes.length > 0) {
        // If an <html/> child exists, use its content directly.
        for (const child of htmlElements[0].childNodes) {
            contentHtml += child.nodeValue;
        }
    } else {
        // Otherwise, dynamically construct HTML from attributes and child nodes.
        contentHtml += `<h3>${this.getFeatureLabel(elementNode.nodeName)}</h3>`;
        contentHtml += `<b>Latitude:</b> ${latitude.toFixed(6)}<br>`;
        contentHtml += `<b>Longitude:</b> ${longitude.toFixed(6)}<br>`;

        // Iterate over attributes
        for (const attr of Array.from(elementNode.attributes)) {
            contentHtml += `<b>${attr.name}:</b> ${attr.value}<br>`;
        }

        // Iterate over child nodes (excluding 'html' if it existed)
        for (const child of Array.from(elementNode.children)) {
            // Only process element nodes with text content
            if (child.nodeType === Node.ELEMENT_NODE && child.firstChild && child.firstChild.nodeValue) {
                contentHtml += `<b>${child.nodeName}:</b> ${child.firstChild.nodeValue}<br>`;
            }
        }
    }

    const mapPin = new google.maps.Marker({
        position: position,
        map: this.displayArea
    });

    const infoPanel = new google.maps.InfoWindow({
        content: `<div style="font-family: Arial, sans-serif; font-size: 13px;">${contentHtml}</div>`
    });

    // Attach click listener for the info window.
    google.maps.event.addListener(mapPin, "click", () => {
        infoPanel.open(this.displayArea, mapPin);
    });
};

/**
 * Renders a single track segment as a polyline on the map.
 * @param {Element} segmentNode The XML element representing a track segment (<trkseg>).
 * @param {string} segmentColor The color for this segment.
 * @param {number} segmentWidth The width for this segment.
 */
GeoRouteVisualizer.prototype.renderPathSegment = function(segmentNode, segmentColor, segmentWidth) {
    const coordinateNodes = segmentNode.getElementsByTagName("trkpt");

    if (coordinateNodes.length < 2) { // Need at least two points for a segment.
        return;
    }

    const coordinatePairList = [];
    let prevLongitude = NaN;
    let prevLatitude = NaN;

    // Process the first point separately to initialize previous coordinates
    const firstNode = coordinateNodes[0];
    let currentLongitude = _safeParseFloatAttribute(firstNode, "lon");
    let currentLatitude = _safeParseFloatAttribute(firstNode, "lat");

    if (!isNaN(currentLatitude) && !isNaN(currentLongitude)) {
        coordinatePairList.push(new google.maps.LatLng(currentLatitude, currentLongitude));
        prevLongitude = currentLongitude;
        prevLatitude = currentLatitude;
    } else {
        console.warn("First track point in segment has invalid coordinates. Skipping segment.", segmentNode);
        return;
    }

    // Iterate through subsequent points, applying the minimum distance filter.
    for (let i = 1; i < coordinateNodes.length; i++) {
        const node = coordinateNodes[i];
        currentLongitude = _safeParseFloatAttribute(node, "lon");
        currentLatitude = _safeParseFloatAttribute(node, "lat");

        if (isNaN(currentLatitude) || isNaN(currentLongitude)) {
            console.warn(`Skipping invalid track point at index ${i} in segment.`);
            continue;
        }

        // Calculate Euclidean distance (simplified for small deltas, not geodesic).
        const latDifference = currentLatitude - prevLatitude;
        const lonDifference = currentLongitude - prevLongitude;
        const distanceSquared = (latDifference * latDifference) + (lonDifference * lonDifference);

        // Check if the point is sufficiently far from the last included point.
        if (Math.sqrt(distanceSquared) > this.minSegmentDistance) {
            coordinatePairList.push(new google.maps.LatLng(currentLatitude, currentLongitude));
            prevLongitude = currentLongitude;
            prevLatitude = currentLatitude;
        }
    }

    // Only draw if there are at least two points in the filtered list.
    if (coordinatePairList.length > 1) {
        new google.maps.Polyline({
            path: coordinatePairList,
            strokeColor: segmentColor,
            strokeWeight: segmentWidth,
            map: this.displayArea,
            geodesic: true // Render as a geodesic line, accounting for Earth's curvature.
        });
    }
};

/**
 * Visualizes an entire route, which may consist of multiple segments.
 * @param {Element} routeElement The XML element representing a track (<trk>).
 * @param {string} routeColor The default color for this route.
 * @param {number} routeWidth The default width for this route.
 */
GeoRouteVisualizer.prototype.visualizeRoute = function(routeElement, routeColor, routeWidth) {
    const routeSegments = routeElement.getElementsByTagName("trkseg");

    if (routeSegments.length === 0) {
        console.info("No track segments found within route element:", routeElement);
        return;
    }

    // Iterate over each segment and render it.
    for (const segment of Array.from(routeSegments)) {
        this.renderPathSegment(segment, routeColor, routeWidth);
    }
};

/**
 * Adjusts the map's viewport (center and zoom level) to encompass all relevant geographic points.
 * @param {Element} dataContainer The primary XML element containing track points or waypoints.
 */
GeoRouteVisualizer.prototype.adjustViewportToFit = function(dataContainer) {
    const searchTags = ["trkpt", "wpt"]; // Elements to consider for bounding box calculation.
    let minLatitude = Infinity;
    let maxLatitude = -Infinity;
    let minLongitude = Infinity;
    let maxLongitude = -Infinity;
    let foundAnyPoints = false;

    // Iterate through specified point types to find overall min/max coordinates.
    for (const tag of searchTags) {
        const points = dataContainer.getElementsByTagName(tag);

        for (const pointNode of Array.from(points)) {
            const currentLongitude = _safeParseFloatAttribute(pointNode, "lon");
            const currentLatitude = _safeParseFloatAttribute(pointNode, "lat");

            if (isNaN(currentLatitude) || isNaN(currentLongitude)) {
                continue; // Skip invalid points.
            }

            minLongitude = Math.min(minLongitude, currentLongitude);
            maxLongitude = Math.max(maxLongitude, currentLongitude);
            minLatitude = Math.min(minLatitude, currentLatitude);
            maxLatitude = Math.max(maxLatitude, currentLatitude);
            foundAnyPoints = true;
        }
    }

    // If no valid points were found, set a default view or do nothing.
    if (!foundAnyPoints) {
        console.info("No geographic points found for viewport adjustment. Setting default view.");
        // Default to a known location (e.g., Vancouver, Canada) with a moderate zoom.
        this.displayArea.setCenter(new google.maps.LatLng(49.2827, -123.1207));
        this.displayArea.setZoom(10);
        return;
    }

    // Create a LatLngBounds object to encapsulate all points.
    const overallBounds = new google.maps.LatLngBounds(
        new google.maps.LatLng(minLatitude, minLongitude),
        new google.maps.LatLng(maxLatitude, maxLongitude)
    );

    // If the bounds are valid (not a single point or degenerate line), fit the map.
    if (!overallBounds.isEmpty()) {
        this.displayArea.fitBounds(overallBounds);
    } else {
        // Handle the case where all points are identical (degenerate bounds).
        const centerPoint = new google.maps.LatLng(minLatitude, minLongitude);
        this.displayArea.setCenter(centerPoint);
        this.displayArea.setZoom(15); // A close-up zoom for a single point.
    }
};

/**
 * Processes all track elements within the loaded XML data and renders them as polylines on the map.
 */
GeoRouteVisualizer.prototype.processAndDisplayPaths = function() {
    const routeElements = this.sourceDataDOM.documentElement.getElementsByTagName("trk");

    if (routeElements.length === 0) {
        console.info("No track elements (<trk>) found in the source data.");
        return;
    }

    // Iterate over each track and visualize it.
    for (const route of Array.from(routeElements)) {
        this.visualizeRoute(route, this.pathStrokeColor, this.pathStrokeWeight);
    }
};

/**
 * Processes all waypoint elements within the loaded XML data and renders them as markers on the map.
 */
GeoRouteVisualizer.prototype.processAndDisplayWaypoints = function() {
    const pointOfInterestElements = this.sourceDataDOM.documentElement.getElementsByTagName("wpt");

    if (pointOfInterestElements.length === 0) {
        console.info("No waypoint elements (<wpt>) found in the source data.");
        return;
    }

    // Iterate over each waypoint and create a marker for it.
    for (const waypoint of Array.from(pointOfInterestElements)) {
        this.produceMapPin(waypoint);
    }
};