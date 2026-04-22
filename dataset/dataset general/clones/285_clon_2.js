let MAPVIEW_UTILITIES = MAPVIEW_UTILITIES || {};

// Constructor for the MapViewProvider module.
// This module manages loading and displaying street view panoramas.
MAPVIEW_UTILITIES.MapViewProvider = function (configOptions) {

	'use strict'; // Enforce strict mode for cleaner code.

	// Private internal configuration and state variables.
	let _initialConfig = configOptions || {}; // Stores initial configuration passed to the constructor.
	let _mapPosition;             // Geographic coordinates for the panorama.
	let _currentMagnification;    // Current zoom level for the panorama tiles.
	let _panoramaIdentifier;      // Unique ID for the current panorama view.
	const _streetViewService = new google.maps.StreetViewService(); // Google Street View API client.
	let _processedTiles = 0;      // Counter for tiles loaded during composition.
	let _totalTiles = 0;          // Total number of tiles expected for the current view.
	const _renderCanvas = document.createElement('canvas'); // The HTML canvas element for rendering.
	const _canvasContext = _renderCanvas.getContext('2d'); // 2D rendering context of the canvas.

	// Internal variables for panorama orientation and metadata.
	let headingAngle = 0;         // Horizontal rotation (yaw) of the panorama.
	let verticalTilt = 0;         // Vertical tilt (pitch) of the panorama.
	let attributionText = '';     // Copyright or attribution string for the panorama.

	// Callback functions that can be set externally.
	let onViewDimensionChange = null; // Fired when canvas dimensions are adjusted.
	let onViewRenderComplete = null;  // Fired when panorama loading and composition finishes.
		
	/**
	 * Updates the loading progress.
	 * @param {number} progressValue - The current progress percentage (0-100).
	 */
	this.updateProgress = function (progressValue) {
	
		if (this.onLoadingProgress) {
			this.onLoadingProgress(progressValue);
		}
		
	};

	/**
	 * Signals an error condition.
	 * If an error handler is defined, it will be called; otherwise, logs to console.
	 * @param {string} errorMessage - Description of the error.
	 */
	this.signalIssue = function (errorMessage) {
	
		if (this.onOperationError) {
			this.onOperationError(errorMessage);
		} else {
			console.error(errorMessage);
		}
		
	};

	/**
	 * Adjusts the canvas resolution based on the current magnification level.
	 * This sets up the canvas for rendering the panorama tiles.
	 */
	this.adjustCanvasResolution = function () {
	
		// Calculate canvas width and height based on zoom level.
		let widthDim = 416 * Math.pow(2, _currentMagnification);
		let heightDim = (416 * Math.pow(2, _currentMagnification - 1));

		// Apply dimensions to the canvas element.
		_renderCanvas.width = widthDim;
		_renderCanvas.height = heightDim;

		// Set up the canvas context for horizontal flipping (common for street view).
		_canvasContext.translate(_renderCanvas.width, 0);
		_canvasContext.scale(-1, 1);
	};

	/**
	 * Integrates a single tile segment onto the main rendering canvas.
	 * @param {number} tileX - The X-coordinate of the tile in the grid.
	 * @param {number} tileY - The Y-coordinate of the tile in the grid.
	 * @param {HTMLImageElement} tileImage - The loaded image element for the tile.
	 */
	this.integrateTileSegment = function (tileX, tileY, tileImage) {
	
		// Draw the tile image onto the canvas at its correct position.
		_canvasContext.drawImage(tileImage, tileX * 512, tileY * 512);
		_processedTiles++; // Increment the count of processed tiles.
		
		// Calculate and update the loading progress.
		let progressValue = Math.round(_processedTiles * 100 / _totalTiles);
		this.updateProgress(progressValue);
		
		// Check if all tiles have been processed.
		if (_processedTiles === _totalTiles) {
			this.outputCanvas = _renderCanvas; // Expose the completed canvas.
			if (this.onViewRenderComplete) {
				this.onViewRenderComplete(); // Trigger the completion callback.
			}
		}
		
	};

	/**
	 * Assembles the full panorama view by loading and composing individual tiles.
	 * @param {string} viewId - The unique identifier of the panorama to compose.
	 */
	this.assembleFullView = function (viewId) {
	
		this.updateProgress(0); // Reset progress at the start of composition.
		console.log('Initiating panorama composition for magnification ' + _currentMagnification + '...');
		
		// Determine the grid dimensions for tiles based on magnification.
		let widthDim = (_currentMagnification === 3) ? 7 : Math.pow(2, _currentMagnification);
		let heightDim = Math.pow(2, _currentMagnification - 1);
		
		let instanceRef = this; // Store reference to 'this' for use in nested functions.
		let imageUrl;             // Variable to hold the URL for each tile.
		let tileX, tileY;         // Loop variables for tile coordinates.
				
		_processedTiles = 0;       // Reset processed tile count.
		_totalTiles = widthDim * heightDim; // Calculate total expected tiles.
	
		// Loop through the tile grid to fetch and compose each tile.
		for (tileY = 0; tileY < heightDim; tileY++) {
			for (tileX = 0; tileX < widthDim; tileX++) {
				// Construct the URL for the specific tile.
				imageUrl = 'http://maps.google.com/cbk?output=tile&panoid=' + viewId + '&zoom=' + _currentMagnification + '&x=' + tileX + '&y=' + tileY + '&' + Date.now();
				
				// Use an IIFE to capture tileX and tileY for each asynchronous load.
				(function (currentTileX, currentTileY) { 
					let tileElement = new Image(); // Create a new image element.
					tileElement.addEventListener('load', function () {
						// When the tile image loads, integrate it into the canvas.
						instanceRef.integrateTileSegment(currentTileX, currentTileY, this);
					});
					tileElement.crossOrigin = ''; // Enable cross-origin loading.
					tileElement.src = imageUrl;   // Set the image source, initiating the load.
				})(tileX, tileY);
			}
		}
		
	};
	
	/**
	 * Fetches panorama data for a given geographical location.
	 * @param {google.maps.LatLng} geoCoordinates - The latitude/longitude to search for.
	 * @param {function} completionCallback - Callback function to execute after data retrieval.
	 */
	this.fetchViewData = function (geoCoordinates, completionCallback) {
	
		console.log('Requesting panorama data for location:', geoCoordinates);
		let instanceRef = this; // Store reference to 'this' for use in the callback.

		// Use the Street View service to get panorama data by location.
		_streetViewService.getPanoramaByLocation(geoCoordinates, 50, function (viewData, requestStatus) {
			if (requestStatus === google.maps.StreetViewStatus.OK) {
				// If data is successfully retrieved, update instance properties.
				if (instanceRef.onViewDataReceived) instanceRef.onViewDataReceived(viewData);
				
				headingAngle = viewData.tiles.centerHeading * Math.PI / 180.0;
				verticalTilt = viewData.tiles.originPitch;
				attributionText = viewData.copyright;

				instanceRef.viewAttribution = viewData.copyright;
				_panoramaIdentifier = viewData.location.pano;
				instanceRef.currentLocation = geoCoordinates;
				instanceRef.currentHeading = headingAngle;
				instanceRef.currentTilt = verticalTilt;
				instanceRef.captureDate = viewData.imageDate;
				instanceRef.viewIdentifier = _panoramaIdentifier;

				completionCallback(); // Execute the completion callback.
			} else {
				// If no panorama data is found or an error occurs.
				if (instanceRef.onNoViewData) instanceRef.onNoViewData(requestStatus);
				instanceRef.signalIssue('Failed to retrieve panorama for the specified reason: ' + requestStatus);
				completionCallback(); // Still execute callback to ensure flow continues.
			}
		});
		
	};
	
	/**
	 * Sets the magnification level for the panorama view.
	 * @param {number} newMagnification - The desired zoom level.
	 */
	this.setMagnificationLevel = function (newMagnification) {
		_currentMagnification = newMagnification;
		this.adjustCanvasResolution(); // Adjust canvas to new zoom.
	};

	// Initialize the zoom level when the constructor is called.
	this.setMagnificationLevel(_initialConfig.zoom || 1);

};