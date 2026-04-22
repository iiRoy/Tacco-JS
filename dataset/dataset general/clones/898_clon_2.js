Leaflet.Layer.ObscureCanvas = Leaflet.Layer.CanvasBase.extend({
    // Configuration parameters for the obscuring canvas layer.
    settings: {
        cirSize: 5, // The base size for the circles.
        absoluteSizeEnabled: true,  /* if true, cirSize is in meters; otherwise, it's in pixels */
        fillShade: '#000', // Default color for the filled circles.
        transparency: 0.5, // Opacity level for the circles.
        noObscuration: false,  // If true, circles are drawn normally; if false, they create a mask.
        outlineShade: undefined,  // Color for the circle's border when noObscuration is true.
        diagMode: false // Enable or disable diagnostic display.
    },

    // Constructor for the layer, initializing its state and rendering logic.
    initComponent: function (configParams, inputData) {
        var componentRef = this; // Store a reference to the current instance for use in nested functions.
        Leaflet.Utilities.applyConfig(this, configParams); // Apply the provided configuration options to this layer.

        // Define the function responsible for rendering individual map tiles.
        this.renderTile = function (targetTile, tileCoordinate, currentZoom) {
            // Create a rendering context object that bundles necessary information.
            var renderContext = {
                drawingSurface: targetTile, // The canvas element provided for drawing.
                tileCoordinate: tileCoordinate, // The x, y coordinates of the tile within the grid.
                currentZoom: currentZoom // The map's current zoom level.
            };

            // Check if diagnostic mode is enabled in the layer's settings.
            if (componentRef.settings.diagMode) {
                componentRef._showDiagnosticInfo(renderContext); // Call the debug information display function.
            }
            this._executeRender(renderContext); // Execute the primary rendering logic for the tile.
        };
    },

    // Displays diagnostic data on the tile for debugging purposes.
    _showDiagnosticInfo: function (renderContext) {
        var maxDimension = this.settings.tileDimension; // Retrieve the maximum dimension of the tile.
        var graphicsCtx = renderContext.drawingSurface.getContext('2d'); // Obtain the 2D rendering context from the canvas.
        graphicsCtx.compositeMode = 'destination-over'; // Set the global composite operation.
        graphicsCtx.strokeShade = '#000000'; // Set the stroke color for outlines.
        graphicsCtx.fillShade = '#FFFF00'; // Set the fill color for shapes.
        graphicsCtx.drawRectOutline(0, 0, maxDimension, maxDimension); // Draw an outline rectangle around the tile.
        graphicsCtx.textFont = "12px Arial"; // Set the font style for text.
        graphicsCtx.drawRectFill(0, 0, 5, 5); // Draw small filled rectangles at corners and center.
        graphicsCtx.drawRectFill(0, maxDimension - 5, 5, 5);
        graphicsCtx.drawRectFill(maxDimension - 5, 0, 5, 5);
        graphicsCtx.drawRectFill(maxDimension - 5, maxDimension - 5, 5, 5);
        graphicsCtx.drawRectFill(maxDimension / 2 - 5, maxDimension / 2 - 5, 10, 10);
        graphicsCtx.drawTextOutline(renderContext.tileCoordinate.x + ' ' + renderContext.tileCoordinate.y + ' ' + renderContext.currentZoom, maxDimension / 2 - 30, maxDimension / 2 - 10); // Display tile coordinates and zoom level.
    },

    // Assigns a new collection of geographical data points to the layer for rendering.
    assignDataSource: function(dataCollection) {
        var componentRef = this; // Capture the current instance.

        this.dataExtent = new L.LatLngBounds(dataCollection); // Compute the geographical bounding box for the entire dataset.

        // Initialize a spatial index (QuadTree) with the dataset's extent for efficient querying.
        this._spatialIndex = new SpatialQuadTree(this._extentToQueryRegion(this.dataExtent), false, 6, 6);

        var initialElement = dataCollection[0]; // Get the first element to infer data structure.
        var xProp = 1, yProp = 0; // Default property indices for non-LatLng objects.
        // If the first element is a Leaflet LatLng object, use 'lng' and 'lat' property names.
        if (initialElement instanceof L.LatLng) {
            xProp = "lng"; // Property name for longitude.
            yProp = "lat"; // Property name for latitude.
        }

        // Iterate through each data item and insert its coordinates into the spatial index.
        dataCollection.forEvery(function(dataItem) {
            componentRef._spatialIndex.addEntry({
                coordX: dataItem[xProp], // Extract the X coordinate (longitude).
                coordY: dataItem[yProp] // Extract the Y coordinate (latitude).
            });
        });

        // If the layer is currently attached to a map, trigger a display refresh to show the new data.
        if (this._mapInstance) {
            this.refreshDisplay();
        }
    },

    // Updates the size of the circles drawn on the canvas and triggers a redraw.
    setCircleSize: function(newSize) {
        this.settings.cirSize = newSize; // Update the circle size in the layer's settings.
        this.refreshDisplay(); // Request the layer to redraw all its tiles.
    },

    // Calculates the pixel offset of a geographical coordinate relative to the current tile's top-left corner.
    _calculateTileOffset: function (renderContext, geoPosition) {
        // Compute the pixel coordinates of the current tile's origin on the map.
        var startPoint = renderContext.tileCoordinate.scaleBy(this.settings.tileDimension);

        // Project the given geographical point to pixel coordinates on the entire map.
        var projPoint = this._mapInstance.projectGeo(new L.LatLng(geoPosition.y, geoPosition.x));

        // Determine the final pixel offset within the tile.
        var offsetX = Math.round(projPoint.x - startPoint.x);
        var offsetY = Math.round(projPoint.y - startPoint.y);
        return [offsetX, offsetY]; // Return the calculated [x, y] pixel offsets.
    },

    // Renders the individual data points as circles on the canvas element.
    _renderPoints: function (renderContext, pointLocations) {
        var canvasElement = renderContext.drawingSurface, // The canvas element for drawing.
            graphicsCtx = canvasElement.getContext('2d'), // The 2D rendering context.
            componentRef = this, // Reference to the current layer instance.
            renderPosition, // Variable to store the calculated pixel position of each point.
            tileDimension = this.settings.tileDimension; // The pixel dimension of a single tile.

        graphicsCtx.fillShade = this.settings.fillShade; // Set the fill color for the circles.

        // If an outline color is defined, configure the stroke style.
        if (this.settings.outlineShade) {
          graphicsCtx.strokeShade = this.settings.outlineShade; // Set the stroke color.
          graphicsCtx.lineWidth = this.settings.borderWidth || 1; // Set the line width, defaulting to 1.
        }

        graphicsCtx.compositeOp = 'source-over'; // Set the default composite operation.
        // If noObscuration is false, it means we are creating a mask; fill the tile first.
        if (!this.settings.noObscuration) {
            graphicsCtx.drawBackground(0, 0, tileDimension, tileDimension); // Fill the entire tile area.
            graphicsCtx.compositeOp = 'destination-out'; // Change composite mode to 'destination-out' for masking effect.
        }

        // Iterate over each geographical point and draw its corresponding circle.
        pointLocations.forEvery(function(geoPosition) {
            renderPosition = componentRef._calculateTileOffset(renderContext, geoPosition); // Get pixel coordinates relative to the tile.
            graphicsCtx.startPath(); // Begin a new drawing path.
            graphicsCtx.drawArc(renderPosition[0], renderPosition[1], componentRef._getCurrentCircleSize(), 0, Math.PI * 2); // Draw a full circle arc.
            graphicsCtx.fillShape(); // Fill the drawn circle.
            // If an outline color is specified, draw the circle's outline.
            if (componentRef.settings.outlineShade) {
                graphicsCtx.drawOutline();
            }
        });
    },

    // Converts a Leaflet LatLngBounds object into a query region format suitable for the spatial index.
    _extentToQueryRegion: function(dataExtent) {
        // If the data extent is empty (e.g., no data points), return a small, default region.
        if (dataExtent.getSouthwestern() == undefined) { return {coordX: 0, coordY: 0, extentWidth: 0.1, extentHeight: 0.1}; }
        return {
            coordX: dataExtent.getSouthwestern().lng, // Longitude of the southwestern corner.
            coordY: dataExtent.getSouthwestern().lat, // Latitude of the southwestern corner.
            extentWidth: dataExtent.getNortheastern().lng - dataExtent.getSouthwestern().lng, // Calculate the width of the bounding box.
            extentHeight: dataExtent.getNortheastern().lat - dataExtent.getSouthwestern().lat // Calculate the height of the bounding box.
        };
    },

    // Calculates the latitude-based component of the circle's size in degrees.
    _getLatitudeSize: function () {
        const EARTH_CIRC_METERS = 40075017; // Earth's approximate circumference at the equator in meters.
        return (this.settings.cirSize / EARTH_CIRC_METERS) * 360; // Convert the circle size from meters to degrees of latitude.
    },

    // Calculates the longitude-based component of the circle's size in degrees, adjusted for latitude.
    _getLongitudeSize: function () {
        const DEGREES_TO_RADIANS = Math.PI / 180; // Conversion factor from degrees to radians.
        // Adjust the latitude size by the cosine of the current latitude to account for Mercator projection distortion.
        return this._getLatitudeSize() / Math.cos(DEGREES_TO_RADIANS * this._currentGeoPoint.lat);
    },

    // Recalculates and updates the pixel size of the circle based on the current map projection and zoom.
    computeProjectedSizes: function () {
        var longitudinalSize = this._getLongitudeSize(), // Get the longitude component of the circle size in degrees.
            geoPointTwo = new L.LatLng(this._currentGeoPoint.lat, this._currentGeoPoint.lng - longitudinalSize, true), // Create a second geographical point shifted westward.
            projectedPointTwo = this._mapInstance.latLngToLayerPoint(geoPointTwo), // Project the second point to pixel coordinates.
            projectedPointOne = this._mapInstance.latLngToLayerPoint(this._currentGeoPoint); // Project the center point to pixel coordinates.
        // Calculate the pixel radius as the difference in x-coordinates and ensure it's at least 1 pixel.
        this._calculatedSize = Math.max(Math.round(projectedPointOne.x - projectedPointTwo.x), 1);
    },

    // Determines the effective pixel radius of a circle, based on configuration (absolute or fixed).
    _getCurrentCircleSize: function() {
        // If absolute radius (in meters) is enabled, use the pre-calculated projected size.
        if (this.settings.absoluteSizeEnabled) {
            return this._calculatedSize;
        } else {
            // Otherwise, use the fixed pixel size directly from the layer's settings.
            return this.settings.cirSize;
        }
    },

    // Main rendering function for a single tile, orchestrating data retrieval and point drawing.
    _executeRender: function (renderContext) {
        // Abort rendering if the spatial index or map instance is not yet available.
        if (!this._spatialIndex || !this._mapInstance) {
            return;
        }

        var tileDimension = this.settings.tileDimension; // Retrieve the standard pixel dimension for a tile.

        // Calculate the pixel coordinates for the tile's northwest and southeast corners.
        var northWestCorner = renderContext.tileCoordinate.scaleBy(tileDimension);
        var southEastCorner = northWestCorner.plus(new L.Point(tileDimension, tileDimension));

        // If absolute radius is enabled, calculate the projected size for this tile's center.
        if (this.settings.absoluteSizeEnabled) {
            var centralPoint = northWestCorner.plus(new L.Point(tileDimension/2, tileDimension/2)); // Find the pixel center of the tile.
            this._currentGeoPoint = this._mapInstance.unprojectLayer(centralPoint); // Convert tile center to geographical coordinates.
            this.computeProjectedSizes(); // Recalculate the projected circle size based on this center.
        }

        // Apply padding around the tile bounds to ensure circles that span tile boundaries are fully rendered.
        var paddingAmount = new L.Point(this._getCurrentCircleSize(), this._getCurrentCircleSize());
        northWestCorner = northWestCorner.minus(paddingAmount); // Expand the northwest corner.
        southEastCorner = southEastCorner.plus(paddingAmount); // Expand the southeast corner.

        // Create a geographical bounding box for the padded tile area.
        var searchExtent = new L.LatLngBounds(this._mapInstance.unprojectLayer(southEastCorner), this._mapInstance.unprojectLayer(northWestCorner));

        // Retrieve data points from the spatial index that fall within this expanded geographical bounding box.
        var pointLocations = this._spatialIndex.fetchWithinBounds(this._extentToQueryRegion(searchExtent));

        this._renderPoints(renderContext, pointLocations); // Proceed to draw the retrieved points on the tile.
    }
});

// Factory function to create an instance of the ObscureCanvas layer.
Leaflet.Layer.obscureCanvas = function(configParams) {
    var canvasLayer = new Leaflet.Layer.ObscureCanvas(configParams); // Instantiate the layer with provided parameters.
    // Parse the Leaflet version number to check for compatibility.
    var currentLeafletVersion = parseInt(L.version.match(/\d{1,}\.(\d{1,})\.\d{1,}/)[1], 10);
    // If the Leaflet version is older than 0.7, assign a legacy tile creation method.
    if (currentLeafletVersion < 7) canvasLayer._generateTile = canvasLayer._legacyGenerateTile;
    return canvasLayer; // Return the newly created layer instance.
};