( function ( jq, leafletLib, byteFormatter ) {
	const
		// Main geographical render area
		geoMap;
	let
		// The visible heat overlay
		heatLayer,
		// Configuration for the heatmap visualization
		layerConfig = {
			tileTransparency: 1.0,
			heatmapTransparency: 1.0,
			pointRadius: 25,
			blurAmount: 15
		};

	// Initiate the entire process
	initVisualization();

	/**
	 * Sets up the initial map and file input mechanisms.
	 */
	function initVisualization () {
		let fileDropper;

		// Configure the geospatial map component
		geoMap = leafletLib.map( 'displayArea' ).setView( [ 0, 0 ], 2 );
		leafletLib.tileLayer( 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
			attribution: 'Location history visualizer is open source. <a href="https://github.com/theopolisme/location-history-visualizer">GitHub</a>. Map data &copy; <a href="https://openstreetmap.org">OpenStreetMap</a> contributors.',
			maxZoom: 18,
			minZoom: 2
		} ).addTo( geoMap );

		// Prepare the file drop area
		fileDropper = new Dropzone( document.body, {
			url: '/', // Dummy URL for Dropzone
			previewsContainer: document.createElement( 'div' ), // Suppress previews in the DOM
			clickable: false, // Only allow drag-and-drop actions
			accept: function ( droppedFile, completionCallback ) {
				processInputFile( droppedFile );
				fileDropper.disable(); // Task completed, disable further drops
			}
		} );

		// For mobile device users, enable a direct file selection option
		jq( '#fileSelector' ).on( 'change', function () {
			processInputFile( this.files[0] );
			fileDropper.disable(); // Disable after selection
		} );
	}

	/**
	 * Handles the selected file and starts processing.
	 * @param {File} inputDoc The file object to process.
	 */
	function processInputFile ( inputDoc ) {
		heatLayer = leafletLib.heatLayer( [], layerConfig ).addTo( geoMap );

		// Transition UI state to processing
		jq( 'body' ).addClass( 'working' );
		jq( '#startScreen' ).addClass( 'hidden' );
		jq( '#processingScreen' ).removeClass( 'hidden' );

		// Begin the data processing pipeline
		handleDataFile( inputDoc );

		/**
		 * Updates the status message displayed to the user.
		 * @param {string} messageText The message to display.
		 */
		function updateProgress ( messageText ) {
			jq( '#statusMessage' ).text( messageText );
		}

		/**
		 * Reads and processes the content of the provided file.
		 * @param {File} docToProcess The file object.
		 */
		function handleDataFile ( docToProcess ) {
			const
				docSize = byteFormatter( docToProcess.size ),
				fileParser = new FileReader();

			updateProgress( `Preparing to import data (${docSize})...` );

			/**
			 * Extracts geographic coordinates from a Google Takeout JSON string.
			 * @param {string} jsonData The JSON string content.
			 * @returns {Array<Array<number>>} An array of [latitude, longitude] pairs.
			 * @throws {ReferenceError} If no location data is found.
			 */
			function extractCoordsFromJson ( jsonData ) {
				const COORD_SCALE_FACTOR = 0.0000001; // Google's integer lat/lng conversion
				const coordList = JSON.parse( jsonData ).locations;

				if ( !coordList || coordList.length === 0 ) {
					throw new ReferenceError( 'No geographical position data detected.' );
				}

				return coordList.map( function ( singleCoord ) {
					return [ singleCoord.latitudeE7 * COORD_SCALE_FACTOR, singleCoord.longitudeE7 * COORD_SCALE_FACTOR ];
				} );
			}

			/**
			 * Extracts geographic coordinates from a KML string.
			 * @param {string} kmlData The KML string content.
			 * @returns {Array<Array<number>>} An array of [latitude, longitude] pairs.
			 */
			function extractCoordsFromKml ( kmlData ) {
				// Regex to capture timestamp, longitude, latitude, and altitude from KML
				const KML_PATTERN = /<when>(.*?)<\/when>\s*<gx:coord>(\S*)\s(\S*)\s(\S*)<\/gx:coord>/g;
				const coordList = [];
				let kmlResult = KML_PATTERN.exec( kmlData );

				// kmlResult array structure:
				//  [1] ISO 8601 timestamp
				//  [2] longitude
				//  [3] latitude
				//  [4] altitude (often not present in Google Location History KML)

				while ( kmlResult !== null ) {
					coordList.push( [ Number( kmlResult[3] ), Number( kmlResult[2] ) ] );
					kmlResult = KML_PATTERN.exec( kmlData );
				}

				return coordList;
			}

			fileParser.onprogress = function ( evt ) {
				const progressPercent = Math.round( ( evt.loaded / evt.total ) * 100 );
				updateProgress( `${progressPercent}% of ${docSize} loaded...` );
			};

			fileParser.onload = function ( evt ) {
				let coordinates;

				updateProgress( 'Generating visual map...' );

				try {
					if ( /\.kml$/i.test( docToProcess.name ) ) {
						coordinates = extractCoordsFromKml( evt.target.result );
					} else {
						coordinates = extractCoordsFromJson( evt.target.result );
					}
				} catch ( errorObj ) {
					updateProgress( `Error during map generation: ${errorObj.message}. Please ensure you are uploading a valid Google Takeout JSON or KML file containing location data. If the problem persists, check the GitHub repository.` );
					return; // Exit if an error occurs
				}

				heatLayer._latlngs = coordinates; // Directly assign coordinates to heatmap layer

				heatLayer.redraw(); // Force a redraw of the heatmap
				finalizeDisplay( /* totalPoints */ coordinates.length );
			};

			fileParser.onerror = function () {
				updateProgress( `Failed to read the provided file. Error: ${fileParser.error}. Please verify the file is a "direct-from-Google" JSON or KML and retry. For persistent issues, refer to the project's GitHub page.` );
			};

			fileParser.readAsText( docToProcess ); // Start reading the file as text
		}
	}

	/**
	 * Finalizes the display, shows processed count, and enables controls.
	 * @param {number} processedCount The total number of location points processed.
	 */
	function finalizeDisplay ( processedCount ) {
		const finishOverlay = jq( '#completionOverlay' );

		// Modify UI visibility to show completion
		jq( 'body' ).removeClass( 'working' );
		jq( '#processingScreen' ).addClass( 'hidden' );
		finishOverlay.removeClass( 'hidden' );

		// Display the count of processed items
		jq( '#totalProcessed' ).text( processedCount.toLocaleString() );

		// Set up dismissal for the completion overlay
		finishOverlay.one( 'click', function () {
			jq( 'body' ).addClass( 'map-active' );
			finishOverlay.fadeOut();
			enableUserControls(); // Activate interactive map controls
		} );

		/**
		 * Enables and initializes the interactive map controls.
		 */
		function enableUserControls () {
			const
				mapTilesContainer = jq( '.map-tile-container' ), // Select the tile layer element
				heatOverlayElement = jq( '.heatmap-overlay' ), // Select the heatmap layer element
				initialLayerConfig = jq.extend( {}, layerConfig ); // Store original settings for reset

			/**
			 * Synchronizes DOM input values with the current layer configuration.
			 */
			function refreshControlValues () {
				let configKey;
				for ( configKey in layerConfig ) {
					if ( layerConfig.hasOwnProperty( configKey ) ) {
						// Ensure an element with this ID exists before attempting to set its value
						const controlElement = document.getElementById( configKey );
						if ( controlElement ) {
							controlElement.value = layerConfig[configKey];
						}
					}
				}
			}

			refreshControlValues(); // Initial sync of control values

			// Attach change listeners to all configuration input elements
			jq( '.config-input' ).on( 'change', function () {
				switch ( this.id ) {
					case 'tileTransparency':
						mapTilesContainer.css( 'opacity', this.value );
						break;
					case 'heatmapTransparency':
						heatOverlayElement.css( 'opacity', this.value );
						break;
					default:
						// For other controls (pointRadius, blurAmount), update heatLayer options
						layerConfig[ this.id ] = Number( this.value );
						heatLayer.setOptions( layerConfig );
						break;
				}
			} );

			// Handle the reset button click event
			jq( '#resetSettings' ).on( 'click', function () {
				jq.extend( layerConfig, initialLayerConfig ); // Revert to initial settings
				refreshControlValues(); // Update UI inputs to reflect reset values
				heatLayer.setOptions( layerConfig ); // Apply settings to heatmap
				// Also reset the opacity of the layers explicitly, as they are controlled separately
				heatOverlayElement.css( 'opacity', initialLayerConfig.heatmapTransparency );
				mapTilesContainer.css( 'opacity', initialLayerConfig.tileTransparency );
			} );
		}
	}

}( jQuery, L, prettySize ) );