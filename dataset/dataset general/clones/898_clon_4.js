L.CustomPointRenderer = function (initialSettings) {
    const componentDefaults = {
        markSize: 5, // radius
        useTrueSize: true, // useAbsoluteRadius
        fillColor: '#000', // color
        overlayOpacity: 0.5, // opacity
        invertMasking: false, // noMask
        outlineColor: undefined, // lineColor
        outlineThickness: 1, // lineWidth
        showDiagnostics: false, // debug
        tilePixelDimension: 256 // tileSize
    };

    const activeSettings = L.Util.extend({}, componentDefaults, initialSettings);

    let mapInstanceReference; // _map
    let allGeographicPoints = []; // dataset
    let spatialPointIndex = null; // _quad
    let calculatedPixelRadius = 0; // _radius
    let currentGeographicCenter = null; // _latlng

    // Constants for Mercator projection, avoiding direct L.CRS usage
    const earthEquatorialRadius = 6378137; // meters
    const mercatorMaxCoordinate = 20037508.34; // Max X/Y value in meters for Mercator
    const radianConversionFactor = Math.PI / 180;

    // Custom spatial indexing (grid-based) for point storage and querying
    class GridPointIndexer {
        constructor(overallBounds, cellResolution) { // overallBounds: {minX, minY, maxX, maxY}, cellResolution: pixels per grid cell
            this.worldBounds = overallBounds;
            this.cellDim = cellResolution;
            this.gridData = new Map(); // Map<string, Array<Point>>
        }

        addSpatialEntry(entry) { // entry: {globalPxX, globalPxY, originalGeoData}
            const cellKey = this._deriveCellKey(entry.globalPxX, entry.globalPxY);
            if (!this.gridData.has(cellKey)) {
                this.gridData.set(cellKey, []);
            }
            this.gridData.get(cellKey).push(entry);
        }

        retrievePointsInArea(queryArea) { // queryArea: {minX, minY, maxX, maxY} in global pixels (zoom 0)
            const gatheredPoints = [];
            const minCellX = Math.floor((queryArea.minX - this.worldBounds.minX) / this.cellDim);
            const maxCellX = Math.ceil((queryArea.maxX - this.worldBounds.minX) / this.cellDim);
            const minCellY = Math.floor((queryArea.minY - this.worldBounds.minY) / this.cellDim);
            const maxCellY = Math.ceil((queryArea.maxY - this.worldBounds.minY) / this.cellDim);

            for (let y = minCellY; y <= maxCellY; y++) {
                for (let x = minCellX; x <= maxCellX; x++) {
                    const cellKey = `${x}_${y}`;
                    if (this.gridData.has(cellKey)) {
                        this.gridData.get(cellKey).forEach(p => {
                            // Filter points precisely within the query bounding box
                            if (p.globalPxX >= queryArea.minX && p.globalPxX <= queryArea.maxX &&
                                p.globalPxY >= queryArea.minY && p.globalPxY <= queryArea.maxY) {
                                gatheredPoints.push(p.originalGeoData);
                            }
                        });
                    }
                }
            }
            return gatheredPoints;
        }

        _deriveCellKey(xCoord, yCoord) {
            const cellX = Math.floor((xCoord - this.worldBounds.minX) / this.cellDim);
            const cellY = Math.floor((yCoord - this.worldBounds.minY) / this.cellDim);
            return `${cellX}_${cellY}`;
        }

        purgeIndex() {
            this.gridData.clear();
        }
    }

    // This is the custom Leaflet TileLayer implementation
    const CustomTileOverlay = L.TileLayer.extend({
        options: activeSettings, // Leaflet's options mechanism

        onAdd: function (mapRef) {
            mapInstanceReference = mapRef;
            this._map = mapRef; // Leaflet requires _map to be set
            this._reset();
            this._update(); // Initiate tile loading
            mapRef.on('zoomend', this._handleMapZoomChange, this); // Monitor zoom for radius updates
        },

        onRemove: function (mapRef) {
            mapRef.off('zoomend', this._handleMapZoomChange, this);
            L.TileLayer.prototype.onRemove.call(this, mapRef); // Call parent's onRemove
            mapInstanceReference = null;
            if (spatialPointIndex) {
                spatialPointIndex.purgeIndex();
                spatialPointIndex = null;
            }
        },

        _handleMapZoomChange: function() {
            if (activeSettings.useTrueSize && currentGeographicCenter) {
                this._determinePixelRadius(currentGeographicCenter);
                this.redraw();
            }
        },

        _createTile: function (tileCoords) { // tileCoords is L.Point {x, y} for the tile
            const tileCanvas = L.DomUtil.create('canvas', 'leaflet-tile');
            tileCanvas.width = tileCanvas.height = activeSettings.tilePixelDimension;
            tileCanvas.onselectstart = tileCanvas.onmousemove = L.Util.falseFn;

            // Our custom drawing function for this tile
            this._executeTileRendering(tileCanvas, tileCoords, mapInstanceReference.getZoom());

            return tileCanvas;
        },

        _executeTileRendering: function (canvasElement, tileGridCoords, currentZoomLevel) {
            const renderingContextPayload = {
                targetCanvas: canvasElement,
                gridPosition: tileGridCoords,
                mapZoom: currentZoomLevel
            };

            if (activeSettings.showDiagnostics) {
                this._renderDiagnosticOverlay(renderingContextPayload);
            }
            this._processTileDrawing(renderingContextPayload);
        },

        _processTileDrawing: function (renderingContextPayload) {
            if (!spatialPointIndex || !mapInstanceReference) {
                return;
            }

            const currentTileDim = activeSettings.tilePixelDimension;
            const tileTopLeftGlobalPx = L.point(
                renderingContextPayload.gridPosition.x * currentTileDim,
                renderingContextPayload.gridPosition.y * currentTileDim
            );
            const tileBottomRightGlobalPx = L.point(
                tileTopLeftGlobalPx.x + currentTileDim,
                tileTopLeftGlobalPx.y + currentTileDim
            );

            // Update center and radius if using true size (meters)
            if (activeSettings.useTrueSize) {
                const tileCenterGlobalPx = L.point(
                    tileTopLeftGlobalPx.x + currentTileDim / 2,
                    tileTopLeftGlobalPx.y + currentTileDim / 2
                );
                currentGeographicCenter = mapInstanceReference.unproject(tileCenterGlobalPx, renderingContextPayload.mapZoom);
                this._determinePixelRadius(currentGeographicCenter); // Recalculate radius for this tile's context
            }

            const currentCirclePixelSize = this._determinePixelRadius(currentGeographicCenter);

            // Expand query area by radius to include circles that might overlap tile
            const queryExpansion = currentCirclePixelSize;
            const expandedTopLeftPx = L.point(
                tileTopLeftGlobalPx.x - queryExpansion,
                tileTopLeftGlobalPx.y - queryExpansion
            );
            const expandedBottomRightPx = L.point(
                tileBottomRightGlobalPx.x + queryExpansion,
                tileBottomRightGlobalPx.y + queryExpansion
            );

            // Convert expanded pixel bounds to geographic bounds for spatial query
            const southWestGeoBound = mapInstanceReference.unproject(expandedBottomRightPx, renderingContextPayload.mapZoom);
            const northEastGeoBound = mapInstanceReference.unproject(expandedTopLeftPx, renderingContextPayload.mapZoom);

            const queryBoundsForGrid = this._translateGeoBoundsToGridFormat(L.latLngBounds(southWestGeoBound, northEastGeoBound));

            const geographicPointsInView = spatialPointIndex.retrievePointsInArea(queryBoundsForGrid);

            this._performDrawingOperations(renderingContextPayload, geographicPointsInView, currentCirclePixelSize);
        },

        _performDrawingOperations: function (renderingContextPayload, pointData, effectiveCirclePixelSize) {
            const canvasGraphicsContext = renderingContextPayload.targetCanvas.getContext('2d');
            const currentTileDim = activeSettings.tilePixelDimension;

            canvasGraphicsContext.fillStyle = activeSettings.fillColor;
            canvasGraphicsContext.globalAlpha = activeSettings.overlayOpacity;

            if (activeSettings.outlineColor) {
                canvasGraphicsContext.strokeStyle = activeSettings.outlineColor;
                canvasGraphicsContext.lineWidth = activeSettings.outlineThickness;
            }

            if (!activeSettings.invertMasking) { // Masking mode (punch holes)
                canvasGraphicsContext.fillRect(0, 0, currentTileDim, currentTileDim);
                canvasGraphicsContext.globalCompositeOperation = 'destination-out';
            } else { // Normal fill mode
                canvasGraphicsContext.globalCompositeOperation = 'source-over';
            }

            pointData.forEach(function (geoCoord) {
                const pixelOnTile = this._projectGeoToTilePixels(renderingContextPayload, geoCoord);
                canvasGraphicsContext.beginPath();
                canvasGraphicsContext.arc(pixelOnTile[0], pixelOnTile[1], effectiveCirclePixelSize, 0, Math.PI * 2);
                canvasGraphicsContext.fill();
                if (activeSettings.outlineColor) {
                    canvasGraphicsContext.stroke();
                }
            }, this); // 'this' context for _projectGeoToTilePixels
        },

        // Public API functions
        ingestSpatialData: function (inputGeographicPoints) {
            allGeographicPoints = inputGeographicPoints;

            if (!inputGeographicPoints || inputGeographicPoints.length === 0) {
                spatialPointIndex = null;
                if (mapInstanceReference) this.redraw();
                return;
            }

            let minGlobalX = Infinity, minGlobalY = Infinity, maxGlobalX = -Infinity, maxGlobalY = -Infinity;
            let firstInput = inputGeographicPoints[0];
            let longitudeKey = 1, latitudeKey = 0; // Default for [lng, lat]
            if (firstInput instanceof L.LatLng) {
                longitudeKey = 'lng';
                latitudeKey = 'lat';
            } else if (typeof firstInput === 'object' && firstInput.x !== undefined && firstInput.y !== undefined) {
                longitudeKey = 'x';
                latitudeKey = 'y';
            }

            // Project all points to a common global pixel coordinate system (e.g., zoom 0) for grid indexing
            const projectedEntries = inputGeographicPoints.map(p => {
                const currentGeo = (p instanceof L.LatLng) ? p : L.latLng(p[latitudeKey], p[longitudeKey]);
                const globalPixelCoord = this._convertGeoToGlobalPixelZoom0(currentGeo);
                minGlobalX = Math.min(minGlobalX, globalPixelCoord.x);
                minGlobalY = Math.min(minGlobalY, globalPixelCoord.y);
                maxGlobalX = Math.max(maxGlobalX, globalPixelCoord.x);
                maxGlobalY = Math.max(maxGlobalY, globalPixelCoord.y);
                return { globalPxX: globalPixelCoord.x, globalPxY: globalPixelCoord.y, originalGeoData: currentGeo };
            });

            // Use a grid resolution relative to the world for consistent indexing across zooms
            const gridCellSizeGlobalPx = activeSettings.tilePixelDimension * 4; // E.g., 4x tile size at zoom 0
            spatialPointIndex = new GridPointIndexer(
                {minX: minGlobalX, minY: minGlobalY, maxX: maxGlobalX, maxY: maxGlobalY},
                gridCellSizeGlobalPx
            );
            projectedEntries.forEach(entry => spatialPointIndex.addSpatialEntry(entry));

            if (mapInstanceReference) {
                this.redraw();
            }
        },

        adjustCircleSize: function (newRadiusValue) {
            activeSettings.markSize = newRadiusValue;
            if (mapInstanceReference) {
                this.redraw();
            }
        },

        // Helper for debugging overlay
        _renderDiagnosticOverlay: function (renderingContextPayload) {
            const currentTileDim = activeSettings.tilePixelDimension;
            const canvasGraphicsContext = renderingContextPayload.targetCanvas.getContext('2d');
            canvasGraphicsContext.globalCompositeOperation = 'destination-over';
            canvasGraphicsContext.strokeStyle = '#000000';
            canvasGraphicsContext.fillStyle = '#FFFF00';
            canvasGraphicsContext.strokeRect(0, 0, currentTileDim, currentTileDim);
            canvasGraphicsContext.font = "12px Arial";
            canvasGraphicsContext.fillRect(0, 0, 5, 5);
            canvasGraphicsContext.fillRect(0, currentTileDim - 5, 5, 5);
            canvasGraphicsContext.fillRect(currentTileDim - 5, 0, 5, 5);
            canvasGraphicsContext.fillRect(currentTileDim - 5, currentTileDim - 5, 5, 5);
            canvasGraphicsContext.fillRect(currentTileDim / 2 - 5, currentTileDim / 2 - 5, 10, 10);
            canvasGraphicsContext.strokeText(renderingContextPayload.gridPosition.x + ' ' + renderingContextPayload.gridPosition.y + ' ' + renderingContextPayload.mapZoom, currentTileDim / 2 - 30, currentTileDim / 2 - 10);
        },

        // Converts Leaflet LatLngBounds to a simple object for GridPointIndexer
        _translateGeoBoundsToGridFormat: function (geographicBounds) {
            if (!geographicBounds || geographicBounds.getSouthWest() === undefined) {
                return { minX: 0, minY: 0, maxX: 0.1, maxY: 0.1 }; // Placeholder for empty data
            }
            const swGeo = geographicBounds.getSouthWest();
            const neGeo = geographicBounds.getNorthEast();

            // Convert SW/NE LatLng to global pixel coordinates at zoom 0 for grid querying
            const swGlobalPx = this._convertGeoToGlobalPixelZoom0(swGeo);
            const neGlobalPx = this._convertGeoToGlobalPixelZoom0(neGeo);

            return {
                minX: Math.min(swGlobalPx.x, neGlobalPx.x),
                minY: Math.min(swGlobalPx.y, neGlobalPx.y),
                maxX: Math.max(swGlobalPx.x, neGlobalPx.x),
                maxY: Math.max(swGlobalPx.y, neGlobalPx.y)
            };
        },

        // Determines pixel radius, either fixed or projected from meters
        _determinePixelRadius: function (centerGeo) {
            if (!mapInstanceReference) return activeSettings.markSize;

            if (activeSettings.useTrueSize) {
                if (!centerGeo) { // Fallback if center not yet determined
                    centerGeo = mapInstanceReference.getCenter();
                }

                const currentMapZoom = mapInstanceReference.getZoom();
                const radiusInMeters = activeSettings.markSize;

                // Project two points to find pixel distance equivalent to 'radiusInMeters'
                const centerPointProjected = mapInstanceReference.project(centerGeo, currentMapZoom);
                const pointEastOfCenterGeo = L.latLng(
                    centerGeo.lat,
                    centerGeo.lng + (radiusInMeters / (earthEquatorialRadius * Math.cos(centerGeo.lat * radianConversionFactor))) * (180 / Math.PI)
                );
                const pointEastOfCenterProjected = mapInstanceReference.project(pointEastOfCenterGeo, currentMapZoom);

                calculatedPixelRadius = Math.max(Math.round(Math.abs(centerPointProjected.x - pointEastOfCenterProjected.x)), 1);
                return calculatedPixelRadius;
            } else {
                return activeSettings.markSize;
            }
        },

        // Converts geographic coordinates to pixel coordinates relative to the current tile
        _projectGeoToTilePixels: function (renderingContextPayload, geoCoordinates) {
            const currentTileDim = activeSettings.tilePixelDimension;
            const tileTopLeftGlobalPx = L.point(
                renderingContextPayload.gridPosition.x * currentTileDim,
                renderingContextPayload.gridPosition.y * currentTileDim
            );

            // Project the geographic coordinate to global pixel coordinates at current zoom
            const globalPixelPosition = mapInstanceReference.project(geoCoordinates, renderingContextPayload.mapZoom);

            // Calculate pixel coordinates relative to the tile's top-left corner
            const pixelXOnTile = Math.round(globalPixelPosition.x - tileTopLeftGlobalPx.x);
            const pixelYOnTile = Math.round(globalPixelPosition.y - tileTopLeftGlobalPx.y);
            return [pixelXOnTile, pixelYOnTile];
        },

        // Custom Mercator projection to global pixel coordinates at zoom 0
        _convertGeoToGlobalPixelZoom0: function(geoCoord) {
            const lng = geoCoord.lng;
            const lat = geoCoord.lat;

            const xMeter = lng * mercatorMaxCoordinate / 180;
            let yMeter = Math.log(Math.tan((90 + lat) * Math.PI / 360)) / radianConversionFactor;
            yMeter = yMeter * mercatorMaxCoordinate / 180;

            // Convert meters to pixels at zoom 0 (world is 256x256 pixels)
            const worldPixelDimZoom0 = activeSettings.tilePixelDimension;
            const metersPerPixelZoom0 = (2 * mercatorMaxCoordinate) / worldPixelDimZoom0;

            const globalPxX = (xMeter + mercatorMaxCoordinate) / metersPerPixelZoom0;
            const globalPxY = (mercatorMaxCoordinate - yMeter) / metersPerPixelZoom0; // Y-axis inverted for Leaflet's top-left origin

            return { x: globalPxX, y: globalPxY };
        }
    });

    return new CustomTileOverlay();
};