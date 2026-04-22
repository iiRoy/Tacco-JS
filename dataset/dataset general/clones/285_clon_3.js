var StreetViewProcessor = StreetViewProcessor || {};

StreetViewProcessor.TileAggregator = function (initSettings) {

    // Ensure strict mode for robust code execution.
    'use strict';

    // Internal configuration and state variables, initialized upon instantiation.
    var _initialConfig = initSettings || {}, // User-provided settings.
        _currentLocationData,               // Geographic coordinates of the panorama.
        _magnificationLevel,                // Current zoom level for tile fetching.
        _panoramaIdentifier,                // Unique ID of the current panorama.
        _mapService = new google.maps.StreetViewService(), // Google Street View API client.
        _processedTileCount = 0,            // Counter for tiles already rendered.
        _totalTilesExpected = 0,            // Total number of tiles to fetch and render.
        _outputCanvasElement = document.createElement('canvas'), // Offscreen canvas for composition.
        _drawingContext = _outputCanvasElement.getContext('2d'), // 2D rendering context for the canvas.
        _viewRotationAngle = 0,             // Rotation angle of the panoramic view.
        _viewPitchAngle = 0,                // Pitch angle of the panoramic view.
        _copyrightInfo = '',                // Copyright information for the panorama.
        _onScaleAdjusted = null,            // Callback for when canvas size changes. (Currently unused)
        _lastReportedProgress = -1;         // Tracks the last progress percentage reported.

    // Helper function to validate numerical inputs.
    const _isValidNumeric = (val, min = -Infinity, max = Infinity) => typeof val === 'number' && !isNaN(val) && val >= min && val <= max;

    /**
     * Reports the current progress of the panorama loading process.
     * @param {number} currentProgress - The progress percentage (0-100).
     */
    this.notifyProgress = function (currentProgress) {
        // Validate input and avoid reporting the same progress repeatedly.
        if (!_isValidNumeric(currentProgress, 0, 100) || currentProgress === _lastReportedProgress) {
            return;
        }

        _lastReportedProgress = currentProgress; // Update last reported progress.

        // Invoke the external progress handler if it exists.
        if (this.onProgressCallback) {
            this.onProgressCallback(currentProgress);
        }
    };

    /**
     * Signals an error encountered during panorama processing.
     * @param {string} errorMessage - Description of the error.
     */
    this.signalFailure = function (errorMessage) {
        const finalMessage = errorMessage || 'An unknown error occurred during panoramic view processing.';

        // If an error handler is provided, use it; otherwise, log to console.
        if (this.onErrorCallback) {
            this.onErrorCallback(finalMessage);
        } else {
            console.error('[StreetViewProcessor Error]:', finalMessage);
        }
    };

    /**
     * Adjusts the dimensions of the internal canvas based on the current magnification level.
     * This ensures the canvas is appropriately sized for the panoramic texture.
     */
    this.adjustCanvasDimensions = function () {
        if (!_isValidNumeric(_magnificationLevel, 0, 3)) { // Typical zoom levels are 0-3
            this.signalFailure('Invalid magnification level for canvas adjustment.');
            return;
        }

        // Calculate canvas dimensions based on standard tile size (416px) and zoom level.
        const baseDimension = 416;
        const scaleFactor = (1 << _magnificationLevel); // Equivalent to Math.pow(2, _magnificationLevel)
        const canvasWidth = baseDimension * scaleFactor;
        const canvasHeight = (baseDimension * (1 << (_magnificationLevel - 1))); // Height is half of base width

        // Apply new dimensions to the canvas.
        _outputCanvasElement.width = canvasWidth;
        _outputCanvasElement.height = canvasHeight;

        // Configure the drawing context for proper panorama orientation (flip horizontally).
        // This sets the transformation matrix to scale X by -1, and translate X to canvas width.
        _drawingContext.setTransform(-1, 0, 0, 1, _outputCanvasElement.width, 0);

        // Optional: Notify if a size change callback is registered.
        if (_onScaleAdjusted) {
            _onScaleAdjusted(canvasWidth, canvasHeight);
        }
    };

    /**
     * Integrates a single tile segment onto the main panorama canvas.
     * Manages tile count and reports overall progress.
     * @param {number} tileX - X-coordinate of the tile in the grid.
     * @param {number} tileY - Y-coordinate of the tile in the grid.
     * @param {HTMLImageElement} tileImage - The loaded image element for the tile.
     */
    this.integrateTileSegment = function (tileX, tileY, tileImage) {
        // Basic validation for image input.
        if (!(tileImage instanceof HTMLImageElement)) {
            console.warn('Attempted to integrate non-image object as tile. Skipping draw operation.');
            // Still increment count to prevent infinite loading state.
        } else {
            // Draw the tile onto the canvas at its calculated position.
            const TILE_PIXEL_SIZE = 512; // Standard Google Street View tile size.
            _drawingContext.drawImage(tileImage, tileX * TILE_PIXEL_SIZE, tileY * TILE_PIXEL_SIZE);
        }

        _processedTileCount = _processedTileCount + 1; // Increment processed tile counter.

        // Check if total tiles expected is zero to prevent division by zero.
        if (_totalTilesExpected === 0) {
            console.warn('Total tiles expected is zero, cannot calculate progress.');
            return;
        }

        // Calculate and report loading progress.
        const currentPercentage = Math.floor((_processedTileCount / _totalTilesExpected) * 100);
        this.notifyProgress(currentPercentage);

        // If all tiles have been processed, finalize the panorama.
        if (_processedTileCount >= _totalTilesExpected) {
            this.finalPanoCanvas = _outputCanvasElement; // Expose the composed canvas.
            if (this.onPanoramaReadyCallback) {
                // Use setTimeout to ensure all synchronous tasks are done before callback.
                setTimeout(() => this.onPanoramaReadyCallback(), 0);
            }
        }
    };

    /**
     * Initiates the process of assembling the full panorama from individual tiles.
     * Fetches tiles based on the panorama ID and current magnification level.
     * @param {string} panoIdToAssemble - The unique identifier of the panorama.
     */
    this.assembleFullPanorama = function (panoIdToAssemble) {
        if (!panoIdToAssemble || typeof panoIdToAssemble !== 'string') {
            this.signalFailure('No valid panorama ID provided for assembly.');
            return;
        }

        this.notifyProgress(0); // Reset and report initial progress.
        console.debug(`[StreetViewProcessor]: Starting tile assembly for pano ID: ${panoIdToAssemble} at zoom level ${_magnificationLevel}...`);

        // Determine the grid dimensions (width and height) for the current zoom level.
        const gridWidth = (_magnificationLevel === 3) ? 7 : (1 << _magnificationLevel); // Equivalent to Math.pow(2, _magnificationLevel)
        const gridHeight = (1 << (_magnificationLevel - 1)); // Equivalent to Math.pow(2, _magnificationLevel - 1)

        const currentInstance = this; // Capture 'this' for use within nested callbacks.

        _processedTileCount = 0;
        _totalTilesExpected = gridWidth * gridHeight;

        // Guard against zero tiles if calculations resulted in unexpected values.
        if (_totalTilesExpected === 0) {
            this.signalFailure('Calculated zero tiles to load. Check zoom level or panorama ID.');
            return;
        }

        // Iterate through the tile grid, constructing URLs and fetching each tile.
        for (let rowIdx = 0; rowIdx < gridHeight; rowIdx++) {
            for (let colIdx = 0; colIdx < gridWidth; colIdx++) {
                // Construct the tile URL. Adding a unique timestamp to prevent caching issues.
                const tileUrl = `https://maps.google.com/cbk?output=tile&panoid=${panoIdToAssemble}&zoom=${_magnificationLevel}&x=${colIdx}&y=${rowIdx}&t=${Date.now()}`;

                // Use an IIFE to capture current rowIdx and colIdx for the asynchronous image load.
                ((currentCol, currentRow) => {
                    const tileImg = new Image();
                    tileImg.addEventListener('load', function () {
                        // On successful load, integrate the tile into the panorama.
                        currentInstance.integrateTileSegment(currentCol, currentRow, this);
                    });
                    tileImg.addEventListener('error', function () {
                        // Log errors for individual tiles but don't halt the entire process.
                        console.warn(`[StreetViewProcessor]: Failed to load tile: x=${currentCol}, y=${currentRow}. URL: ${tileUrl}`);
                        // Even if a tile fails, we still increment count to prevent infinite loading state.
                        currentInstance.integrateTileSegment(currentCol, currentRow, new Image()); // Pass a dummy image or null
                    });
                    tileImg.crossOrigin = 'anonymous'; // Enable CORS for images from different origins.
                    tileImg.src = tileUrl; // Set the source to start loading the image.
                })(colIdx, rowIdx);
            }
        }
    };

    /**
     * Fetches panoramic metadata for a given geographic location.
     * @param {google.maps.LatLng | google.maps.LatLngLiteral} geoCoordinates - The location to query.
     * @param {Function} completionCallback - Callback function to execute upon data retrieval.
     */
    this.fetchPanoramaData = function (geoCoordinates, completionCallback) {
        if (!geoCoordinates || typeof completionCallback !== 'function') {
            this.signalFailure('Invalid geographic coordinates or callback provided for panorama data fetch.');
            return;
        }

        console.debug('[StreetViewProcessor]: Requesting panorama data for:', geoCoordinates);
        const requestRadius = _initialConfig.searchRadius || 75; // Default search radius in meters, increased from 50.
        const currentInstance = this;

        _mapService.getPanoramaByLocation(geoCoordinates, requestRadius, function (queryResult, queryStatus) {
            if (queryStatus === google.maps.StreetViewStatus.OK && queryResult) {
                // Successfully retrieved panorama data.
                if (currentInstance.onDataRetrieved) {
                    currentInstance.onDataRetrieved(queryResult);
                }

                // Extract and store relevant panorama metadata.
                // Ensure tiles property exists before accessing.
                if (queryResult.tiles) {
                    _viewRotationAngle = queryResult.tiles.centerHeading * Math.PI / 180.0;
                    _viewPitchAngle = queryResult.tiles.originPitch;
                } else {
                    console.warn('[StreetViewProcessor]: Panorama result missing "tiles" property.');
                }
                _copyrightInfo = queryResult.copyright;

                // Expose key properties on the instance for external access.
                currentInstance.panoCopyright = _copyrightInfo;
                _panoramaIdentifier = queryResult.location.pano;
                currentInstance.currentLocation = geoCoordinates;
                currentInstance.panoRotation = _viewRotationAngle;
                currentInstance.panoPitch = _viewPitchAngle;
                currentInstance.captureDate = queryResult.imageDate;
                currentInstance.uniquePanoId = _panoramaIdentifier;

                completionCallback(); // Invoke the completion callback.
            } else {
                // Failed to retrieve panorama data.
                if (currentInstance.onNoDataAvailable) {
                    currentInstance.onNoDataAvailable(queryStatus);
                } else {
                    console.warn('[StreetViewProcessor]: No specific handler for "no panorama data".');
                }
                currentInstance.signalFailure('Could not retrieve panorama for the specified location. Reason: ' + queryStatus);
                completionCallback(); // Still call callback to ensure flow continues.
            }
        });
    };

    /**
     * Sets the magnification level for the panorama.
     * This will trigger a canvas resize if the level changes.
     * @param {number} newZoomLevel - The desired zoom level (typically 0-3).
     */
    this.setMagnification = function (newZoomLevel) {
        if (!_isValidNumeric(newZoomLevel, 0, 3)) {
            this.signalFailure(`Attempted to set invalid magnification level: ${newZoomLevel}. Must be between 0 and 3.`);
            return;
        }

        // Only update and adjust if the zoom level actually changes.
        if (_magnificationLevel !== newZoomLevel) {
            _magnificationLevel = newZoomLevel;
            this.adjustCanvasDimensions();
            console.debug(`[StreetViewProcessor]: Magnification level updated to: ${_magnificationLevel}`);
        }
    };

    // Initialize the magnification level using provided config or a default.
    this.setMagnification(_initialConfig.initialZoom || 1);

    // Expose the canvas element directly for external use.
    this.getComposedCanvas = () => _outputCanvasElement;
};