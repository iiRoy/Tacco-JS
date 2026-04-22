function GpsDataProcessor(sourceXmlInput, targetMapDisplay) {
    let internalXml = sourceXmlInput;
    let boundMap = targetMapDisplay;
    let currentRouteHue = "#ff00ff";
    let currentRouteThickness = 5;
    let minimalSpatialGap = 0.0001;

    const elementLabelMap = {
        "wpt": "Landmark",
        "trkpt": "Path Point"
    };

    const retrieveXmlContent = (element, xPathQuery, fallback = '') => {
        const evaluator = new XPathEvaluator();
        const result = evaluator.evaluate(xPathQuery, element, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
        return result.singleNodeValue ? result.singleNodeValue.textContent : fallback;
    };

    const retrieveXmlAttribute = (element, attributeName, fallback = '') => {
        return element.getAttribute(attributeName) || fallback;
    };

    const composeInfoPaneContent = (elementNode, labelTranslator) => {
        let contentAccumulator = `<b>${labelTranslator[elementNode.nodeName] || elementNode.nodeName}</b><br>`;

        Array.from(elementNode.attributes).forEach(attr => {
            contentAccumulator += `${attr.name} = ${attr.value}<br>`;
        });

        Array.from(elementNode.children).forEach(child => {
            if (child.firstChild && child.firstChild.nodeValue) {
                contentAccumulator += `${child.nodeName} = ${child.firstChild.nodeValue}<br>`;
            }
        });
        return contentAccumulator;
    };

    return {
        configureRouteHue: (colorCode) => {
            currentRouteHue = colorCode;
        },

        configureRouteThickness: (pixelWidth) => {
            currentRouteThickness = pixelWidth;
        },

        configureMinSpatialGap: (gapValue) => {
            minimalSpatialGap = gapValue;
        },

        processAndDisplay: () => {
            const collectedLandmarks = [];
            const collectedPaths = [];
            let aggregateExtents = { minLat: Infinity, maxLat: -Infinity, minLng: Infinity, maxLng: -Infinity };
            let pointsDetected = false;

            // Handle Landmarks (Waypoints)
            const landmarkNodes = internalXml.evaluate("//wpt", internalXml, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
            for (let i = 0; i < landmarkNodes.snapshotLength; i++) {
                const currentLandmarkNode = landmarkNodes.snapshotItem(i);
                const latitude = parseFloat(retrieveXmlAttribute(currentLandmarkNode, "lat"));
                const longitude = parseFloat(retrieveXmlAttribute(currentLandmarkNode, "lon"));
                const infoHtml = retrieveXmlContent(currentLandmarkNode, "html") || composeInfoPaneContent(currentLandmarkNode, elementLabelMap);

                if (!isNaN(latitude) && !isNaN(longitude)) {
                    collectedLandmarks.push({
                        coordinates: { latitude, longitude },
                        paneContent: infoHtml
                    });
                    aggregateExtents.minLat = Math.min(aggregateExtents.minLat, latitude);
                    aggregateExtents.maxLat = Math.max(aggregateExtents.maxLat, latitude);
                    aggregateExtents.minLng = Math.min(aggregateExtents.minLng, longitude);
                    aggregateExtents.maxLng = Math.max(aggregateExtents.maxLng, longitude);
                    pointsDetected = true;
                }
            }

            // Handle Paths (Tracks)
            const pathNodes = internalXml.evaluate("//trk", internalXml, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
            for (let i = 0; i < pathNodes.snapshotLength; i++) {
                const currentPathNode = pathNodes.snapshotItem(i);
                const pathSegments = [];

                const segmentNodes = internalXml.evaluate("trkseg", currentPathNode, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
                for (let j = 0; j < segmentNodes.snapshotLength; j++) {
                    const currentSegmentNode = segmentNodes.snapshotItem(j);
                    const segmentCoordinates = [];
                    let lastLatitude = null;
                    let lastLongitude = null;

                    const pathPointNodes = internalXml.evaluate("trkpt", currentSegmentNode, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
                    for (let k = 0; k < pathPointNodes.snapshotLength; k++) {
                        const currentPathPointNode = pathPointNodes.snapshotItem(k);
                        const currentLatitude = parseFloat(retrieveXmlAttribute(currentPathPointNode, "lat"));
                        const currentLongitude = parseFloat(retrieveXmlAttribute(currentPathPointNode, "lon"));

                        if (!isNaN(currentLatitude) && !isNaN(currentLongitude)) {
                            if (lastLatitude === null ||
                                Math.sqrt(Math.pow(currentLatitude - lastLatitude, 2) + Math.pow(currentLongitude - lastLongitude, 2)) > minimalSpatialGap) {
                                segmentCoordinates.push({ latitude: currentLatitude, longitude: currentLongitude });
                                lastLatitude = currentLatitude;
                                lastLongitude = currentLongitude;

                                aggregateExtents.minLat = Math.min(aggregateExtents.minLat, currentLatitude);
                                aggregateExtents.maxLat = Math.max(aggregateExtents.maxLat, currentLatitude);
                                aggregateExtents.minLng = Math.min(aggregateExtents.minLng, currentLongitude);
                                aggregateExtents.maxLng = Math.max(aggregateExtents.maxLng, currentLongitude);
                                pointsDetected = true;
                            }
                        }
                    }
                    if (segmentCoordinates.length > 0) {
                        pathSegments.push({ coordinateList: segmentCoordinates });
                    }
                }
                if (pathSegments.length > 0) {
                    collectedPaths.push({
                        segments: pathSegments,
                        renderColor: currentRouteHue,
                        renderWidth: currentRouteThickness
                    });
                }
            }

            // Render Landmarks on the map
            collectedLandmarks.forEach(lm => {
                const geoPosition = new google.maps.LatLng(lm.coordinates.latitude, lm.coordinates.longitude);
                const mapPin = new google.maps.Marker({
                    position: geoPosition,
                    map: boundMap
                });

                const informationBubble = new google.maps.InfoWindow({
                    content: lm.paneContent,
                    size: new google.maps.Size(50, 50)
                });

                google.maps.event.addListener(mapPin, "click", () => {
                    informationBubble.open(boundMap, mapPin);
                });
            });

            // Render Paths on the map
            collectedPaths.forEach(pth => {
                pth.segments.forEach(seg => {
                    const pathGeometries = seg.coordinateList.map(pt => new google.maps.LatLng(pt.latitude, pt.longitude));
                    if (pathGeometries.length > 0) {
                        new google.maps.Polyline({
                            path: pathGeometries,
                            strokeColor: pth.renderColor,
                            strokeWeight: pth.renderWidth,
                            map: boundMap
                        });
                    }
                });
            });

            // Adjust map view
            if (pointsDetected) {
                const mapViewportBounds = new google.maps.LatLngBounds(
                    new google.maps.LatLng(aggregateExtents.minLat, aggregateExtents.minLng),
                    new google.maps.LatLng(aggregateExtents.maxLat, aggregateExtents.maxLng)
                );
                boundMap.fitBounds(mapViewportBounds);
            } else {
                // Default view if no points found, as per original logic
                boundMap.setCenter(new google.maps.LatLng(49.327667, -122.942333));
                boundMap.setZoom(14);
            }
        }
    };
}