L.TileLayer.CircularPointLayer = L.TileLayer.Canvas.extend({
    layerConfig: {
        pointDiameter: 10, // Diameter in pixels or meters
        scaleWithZoom: true, // true: diameter in meters, false: diameter in pixels (inverted from useAbsoluteRadius)
        mainFillColor: '#000',
        alphaValue: 0.5,
        drawFilledCircles: false, // true results in normal (filled) circles, false (default) for masking (inverted from noMask)
        outlineColor: undefined,
        outlineWidth: 1,
        enableDebugging: false,
        minTileSize: 256
    },

    _initializeLayer: function (inputOptions, initialData) {
        if (!inputOptions || typeof inputOptions !== 'object') {
            inputOptions = {};
        }

        this.layerConfig = Object.assign({}, this.layerConfig, inputOptions);

        this._cachedPixelDiameter = 0;
        this._tileCenterLatLng = null;
        this._isDataLoaded = false;

        // Assign the tile rendering function
        this.drawTile = this._renderTileContent.bind(this);

        if (initialData) {
            this.updatePointData(initialData);
        }

        if (this.layerConfig.enableDebugging) {
            console.log("CircularPointLayer initialized with config:", this.layerConfig);
        }
    },

    _renderTileContent: function (currentTile, currentTileCoords, currentZoom) {
        const renderContext = {
            targetCanvas: currentTile,
            tileCoordinates: currentTileCoords,
            currentZoomLevel: currentZoom
        };

        if (this.layerConfig.enableDebugging) {
            this._addDiagnosticOverlay(renderContext);
        }
        this._processAndDrawData(renderContext);
    },

    _addDiagnosticOverlay: function (renderContext) {
        const tileDimension = this.options.tileSize || this.layerConfig.minTileSize;
        const canvasGraphics = renderContext.targetCanvas.getContext('2d');
        canvasGraphics.globalCompositeOperation = 'source-over'; // Ensure it draws over existing content
        canvasGraphics.strokeStyle = '#FF00FF'; // Magenta outline
        canvasGraphics.fillStyle = 'rgba(255,255,0,0.3)'; // Semi-transparent yellow fill
        canvasGraphics.lineWidth = 1;

        // Draw a border around the tile
        canvasGraphics.strokeRect(0, 0, tileDimension, tileDimension);

        // Mark corners
        const cornerSize = 4;
        canvasGraphics.fillRect(0, 0, cornerSize, cornerSize);
        canvasGraphics.fillRect(0, tileDimension - cornerSize, cornerSize, cornerSize);
        canvasGraphics.fillRect(tileDimension - cornerSize, 0, cornerSize, cornerSize);
        canvasGraphics.fillRect(tileDimension - cornerSize, tileDimension - cornerSize, cornerSize, cornerSize);

        // Display tile coordinates
        canvasGraphics.font = "10px sans-serif";
        canvasGraphics.fillStyle = '#000000';
        const textLabel = `X:${renderContext.tileCoordinates.x} Y:${renderContext.tileCoordinates.y} Z:${renderContext.currentZoomLevel}`;
        canvasGraphics.fillText(textLabel, tileDimension / 2 - 25, tileDimension / 2 - 5);
    },

    updatePointData: function (inputPointCollection) {
        if (!Array.isArray(inputPointCollection)) {
            console.error("Input data must be an array.");
            return;
        }

        if (inputPointCollection.length === 0) {
            this._isDataLoaded = false;
            this._spatialIndexTree = null;
            this.dataBoundary = null;
            if (this._map) this._refreshLayer();
            return;
        }

        this.dataBoundary = new L.LatLngBounds(inputPointCollection);
        this._spatialIndexTree = new QuadTree(this._convertBoundsForSpatialQuery(this.dataBoundary), false, 6, 6);

        const firstEntry = inputPointCollection[0];
        let xProp = 'lng', yProp = 'lat'; // Default to L.LatLng structure
        if (firstEntry && typeof firstEntry === 'object' && !('lat' in firstEntry && 'lng' in firstEntry)) {
            // Assume generic object with 'x' and 'y'
            xProp = 'x';
            yProp = 'y';
        }

        for (const dataItem of inputPointCollection) {
            this._spatialIndexTree.insert({
                x: dataItem[xProp],
                y: dataItem[yProp]
            });
        }
        this._isDataLoaded = true;

        if (this._map) {
            this._refreshLayer();
        }
    },

    setCircleDiameter: function (newDiameter) {
        if (typeof newDiameter !== 'number' || newDiameter <= 0) {
            console.warn("Invalid diameter provided. Must be a positive number.");
            return;
        }
        this.layerConfig.pointDiameter = newDiameter;
        if (this._map) {
            this._refreshLayer();
        }
    },

    _transformGeoToCanvasPixels: function (renderContext, geographicCoordinates) {
        if (!geographicCoordinates || typeof geographicCoordinates.lat === 'undefined' || typeof geographicCoordinates.lng === 'undefined') {
            console.warn("Invalid geographic coordinates for pixel conversion.");
            return [0, 0];
        }

        // Calculate tile's top-left pixel offset relative to map origin
        const tilePixelOffset = renderContext.tileCoordinates.multiplyBy(this.options.tileSize || this.layerConfig.minTileSize);

        // Project actual geo coordinates to global map pixel space
        const projectedMapPoint = this._map.project(new L.LatLng(geographicCoordinates.y, geographicCoordinates.x));

        // Calculate point's pixel position within the current tile
        const pixelX = Math.floor(projectedMapPoint.x - tilePixelOffset.x);
        const pixelY = Math.floor(projectedMapPoint.y - tilePixelOffset.y);
        return [pixelX, pixelY];
    },

    _drawCirclesOnCanvas: function (renderContext, pointsToRender) {
        const targetCanvasElement = renderContext.targetCanvas;
        const canvasContext = targetCanvasElement.getContext('2d');
        const tilePixelSize = this.options.tileSize || this.layerConfig.minTileSize;

        canvasContext.save(); // Save the current canvas state

        canvasContext.globalAlpha = this.layerConfig.alphaValue;
        canvasContext.fillStyle = this.layerConfig.mainFillColor;

        const useOutline = !!this.layerConfig.outlineColor;
        if (useOutline) {
            canvasContext.strokeStyle = this.layerConfig.outlineColor;
            canvasContext.lineWidth = this.layerConfig.outlineWidth;
        }

        const effectiveRadius = this._getEffectivePixelDiameter() / 2; // Radius is half of diameter

        // Clear the tile region for masking if not drawing filled circles
        if (!this.layerConfig.drawFilledCircles) {
            canvasContext.fillRect(0, 0, tilePixelSize, tilePixelSize); // Fill with color to be "cut out"
            canvasContext.globalCompositeOperation = 'destination-out'; // This will make new shapes cut out from existing ones
        } else {
            canvasContext.globalCompositeOperation = 'source-over'; // Standard drawing
        }

        for (const dataPoint of pointsToRender) {
            const circleCenter = this._transformGeoToCanvasPixels(renderContext, dataPoint);
            canvasContext.beginPath();
            canvasContext.arc(circleCenter[0], circleCenter[1], effectiveRadius, 0, Math.PI * 2, true);
            canvasContext.fill();
            if (useOutline) {
                canvasContext.stroke();
            }
        }
        canvasContext.restore(); // Restore the canvas state
    },

    _convertBoundsForSpatialQuery: function (dataBoundary) {
        if (!dataBoundary || !dataBoundary.isValid() || !dataBoundary.getSouthWest()) {
            // Return a small, arbitrary bounding box for empty data sets to prevent errors
            return { x: 0, y: 0, width: 0.001, height: 0.001 };
        }
        const sw = dataBoundary.getSouthWest();
        const ne = dataBoundary.getNorthEast();
        return {
            x: sw.lng,
            y: sw.lat,
            width: ne.lng - sw.lng,
            height: ne.lat - sw.lat
        };
    },

    _calculateLatitudinalDegrees: function () {
        // Convert pointDiameter (meters) to degrees of latitude
        // Earth's circumference is approx 40075017 meters
        return (this.layerConfig.pointDiameter / 40075017) * 360;
    },

    _calculateLongitudinalDegrees: function () {
        // Adjust longitudinal degrees based on current latitude to account for mercator projection
        if (!this._tileCenterLatLng) return this._calculateLatitudinalDegrees(); // Fallback
        const latDegreeRadius = this._calculateLatitudinalDegrees();
        return latDegreeRadius / Math.cos(L.LatLng.DEG_TO_RAD * this._tileCenterLatLng.lat);
    },

    _updatePixelRadius: function () {
        if (!this._map || !this._tileCenterLatLng) {
            this._cachedPixelDiameter = this.layerConfig.pointDiameter; // Default to raw diameter if map/center is unavailable
            return;
        }

        const longitudinalDegreeOffset = this._calculateLongitudinalDegrees();
        const offsetLatLngPoint = new L.LatLng(this._tileCenterLatLng.lat, this._tileCenterLatLng.lng - longitudinalDegreeOffset, true);

        const centerPixelLocation = this._map.latLngToLayerPoint(this._tileCenterLatLng);
        const offsetPixelLocation = this._map.latLngToLayerPoint(offsetLatLngPoint);

        // The pixel distance from the center to the offset point represents the diameter
        this._cachedPixelDiameter = Math.max(Math.round(centerPixelLocation.x - offsetPixelLocation.x) * 2, 1);
    },

    _getEffectivePixelDiameter: function () {
        if (this.layerConfig.scaleWithZoom) { // If scaling by meters (was useAbsoluteRadius=true)
            return this._cachedPixelDiameter || this.layerConfig.pointDiameter; // Use cached or fallback
        } else { // Fixed pixel size (was useAbsoluteRadius=false)
            return this.layerConfig.pointDiameter;
        }
    },

    _processAndDrawData: function (renderContext) {
        if (!this._isDataLoaded || !this._spatialIndexTree || !this._map) {
            if (this.layerConfig.enableDebugging) {
                console.log("Skipping tile render: data not loaded or map not ready.");
            }
            return;
        }

        const currentTilePixelSize = this.options.tileSize || this.layerConfig.minTileSize;

        // Calculate tile's pixel boundaries
        const tileTopLeft = renderContext.tileCoordinates.multiplyBy(currentTilePixelSize);
        const tileBottomRight = tileTopLeft.add(new L.Point(currentTilePixelSize, currentTilePixelSize));

        // If diameter scales with zoom, calculate the center for projection
        if (this.layerConfig.scaleWithZoom) {
            const currentTileCenter = tileTopLeft.add(new L.Point(currentTilePixelSize / 2, currentTilePixelSize / 2));
            this._tileCenterLatLng = this._map.unproject(currentTileCenter);
            this._updatePixelRadius(); // Recalculate pixel diameter
        }

        // Add padding to tile bounds for query, based on effective diameter
        const effectiveDiameter = this._getEffectivePixelDiameter();
        const renderBuffer = new L.Point(effectiveDiameter, effectiveDiameter);

        const paddedTopLeft = tileTopLeft.subtract(renderBuffer);
        const paddedBottomRight = tileBottomRight.add(renderBuffer);

        // Convert padded pixel bounds back to LatLngBounds
        const queryBounds = new L.LatLngBounds(this._map.unproject(paddedBottomRight), this._map.unproject(paddedTopLeft));

        // Retrieve points within the padded bounds from the spatial index
        const queriedPoints = this._spatialIndexTree.retrieveInBounds(this._convertBoundsForSpatialQuery(queryBounds));

        // Draw the retrieved points
        this._drawCirclesOnCanvas(renderContext, queriedPoints);
    },

    _refreshLayer: function() {
        this.redraw();
    }
});

// Factory function for convenience
L.pointRenderer = function (options, data) {
    return new L.TileLayer.CircularPointLayer(options, data);
};