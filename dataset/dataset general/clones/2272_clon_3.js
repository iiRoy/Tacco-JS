( function ( $, Leaflet, prettyBytes ) {
	let visualizerCore,
		overlayLayer,
		visualConfig = {
			tileOpacityFactor: 1.0,
			dataOpacityFactor: 1.0,
			pointRadius: 25,
			blurAmount: 15,
			minZoomLevel: 2,
			maxZoomLevel: 18,
			initialLat: 0,
			initialLon: 0,
			initialZoom: 2,
			mapAttribution: 'Data from <a href="https://openstreetmap.org">OpenStreetMap</a> contributors. Visualizer source: <a href="https://github.com/theopolisme/location-history-visualizer">GitHub</a>.'
		};

	// Start the whole process, kicking off the initial UI state.
	initializeInterface();

	function initializeInterface () {
		let fileUploadHandler;

		// Set up the primary mapping component
		visualizerCore = Leaflet.map( 'map' ).setView([visualConfig.initialLat, visualConfig.initialLon], visualConfig.initialZoom);
		Leaflet.tileLayer( 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
			attribution: visualConfig.mapAttribution,
			maxZoom: visualConfig.maxZoomLevel,
			minZoom: visualConfig.minZoomLevel
		} ).addTo( visualizerCore );

		// Configure the file drop mechanism
		fileUploadHandler = new Dropzone( document.body, {
			url: '/', // Dummy URL, we handle the file directly
			previewsContainer: document.createElement( 'div' ), // Suppress visual previews
			clickable: false,
			accept: function ( incomingFile, proceedCallback ) {
				processIncomingFile( incomingFile );
				// The dropzone is effectively "done" after the first file.
				fileUploadHandler.disable();
			}
		} );

		// Provide an alternative for direct file input, especially for mobile
		$( '#file' ).on( 'change', function () {
			const selectedFile = this.files && this.files.length > 0 ? this.files[0] : null;
			if ( selectedFile ) {
				processIncomingFile( selectedFile );
				fileUploadHandler.disable(); // Disable after selection
			}
		} );
	}

	function processIncomingFile ( inputDataFile ) {
		overlayLayer = Leaflet.heatLayer( [], {
			tileOpacity: visualConfig.tileOpacityFactor,
			heatOpacity: visualConfig.dataOpacityFactor,
			radius: visualConfig.pointRadius,
			blur: visualConfig.blurAmount
		} ).addTo( visualizerCore );

		// Transition the UI to the "working" state
		$( 'body' ).addClass( 'active-processing' );
		$( '#intro' ).addClass( 'is-hidden' );
		$( '#working' ).removeClass( 'is-hidden' );

		// Commence file processing
		executeDataExtraction( inputDataFile );

		function updateStatusDisplay ( messageText ) {
			$( '#currentStatus' ).text( messageText );
		}

		function executeDataExtraction ( currentFile ) {
			const fileDisplaySize = prettyBytes( currentFile.size );
			const fileStreamReader = new FileReader();

			updateStatusDisplay( `Preparing to load data from file (${fileDisplaySize})...` );

			function extractCoordsFromJson ( jsonDataString ) {
				const E7_SCALE_FACTOR = 0.0000001; // Google's integer lat/lng representation
				const parsedContent = JSON.parse( jsonDataString );
				const locationRecords = parsedContent.locations;

				if ( !locationRecords || locationRecords.length === 0 ) {
					throw new Error( 'No valid location data found in JSON structure.' );
				}

				const resultCoordinates = locationRecords.map( singleLocation => {
					// Ensure coordinates are numbers before returning
					const lat = singleLocation.latitudeE7 * E7_SCALE_FACTOR;
					const lon = singleLocation.longitudeE7 * E7_SCALE_FACTOR;
					if ( isNaN(lat) || isNaN(lon) ) {
						console.warn('Skipping invalid coordinate pair:', singleLocation);
						return null;
					}
					return [ lat, lon ];
				} ).filter(Boolean); // Filter out any nulls from invalid coordinates

				return resultCoordinates;
			}

			function extractCoordsFromKml ( kmlContent ) {
				// Regex to capture timestamp, longitude, latitude, altitude from KML gx:Track
				const KML_COORD_PATTERN = /<when>(\S+?)<\/when>\s*<gx:coord>(\S+?)\s(\S+?)\s(\S+?)<\/gx:coord>/g;
				let foundPoints = [];
				let currentMatch;

				// Loop through all matches found by the regex
				while ( (currentMatch = KML_COORD_PATTERN.exec( kmlContent )) !== null ) {
					// KML typically has longitude then latitude, convert to Leaflet's lat, lon
					const longitude = parseFloat( currentMatch[2] );
					const latitude = parseFloat( currentMatch[3] );

					if ( !isNaN(latitude) && !isNaN(longitude) ) {
						foundPoints.push( [ latitude, longitude ] );
					} else {
						console.warn('Skipping invalid KML coordinate:', currentMatch);
					}
				}

				return foundPoints;
			}

			fileStreamReader.onprogress = function ( progressEvent ) {
				if ( progressEvent.lengthComputable ) {
					const loadPercentage = Math.round( ( progressEvent.loaded / progressEvent.total ) * 100 );
					updateStatusDisplay( `${loadPercentage}% of ${fileDisplaySize} loaded...` );
				}
			};

			fileStreamReader.onload = function ( loadEvent ) {
				let extractedCoordinates;
				updateStatusDisplay( 'Compiling visual data...' );

				try {
					const fileExtension = currentFile.name.split('.').pop().toLowerCase();
					if ( fileExtension === 'kml' ) {
						extractedCoordinates = extractCoordsFromKml( loadEvent.target.result );
					} else if ( fileExtension === 'json' ) {
						extractedCoordinates = extractCoordsFromJson( loadEvent.target.result );
					} else {
						throw new Error( `Unsupported file type: .${fileExtension}. Please provide a .json or .kml file.` );
					}

					if ( extractedCoordinates.length === 0 ) {
						throw new Error( 'No usable geographic points were found in the file.' );
					}

				} catch ( processingError ) {
					updateStatusDisplay( `An issue occurred during data processing: ${processingError.message}. Please verify the file format and content.` );
					return;
				}

				// Assign the processed coordinates to the heatmap layer
				overlayLayer._latlngs = extractedCoordinates;
				overlayLayer.redraw(); // Force a re-render of the heatmap
				finalizeVisualization( /* countOfPoints */ extractedCoordinates.length );
			};

			fileStreamReader.onerror = function () {
				updateStatusDisplay( `Failed to read the provided file. Error: ${fileStreamReader.error ? fileStreamReader.error.message : 'Unknown error'}.` );
			};

			fileStreamReader.readAsText( currentFile );
		}
	}

	function finalizeVisualization ( totalPointsRendered ) {
		const $completionPanel = $( '#done' );

		// Adjust UI to show completion
		$( 'body' ).removeClass( 'active-processing' );
		$( '#working' ).addClass( 'is-hidden' );
		$completionPanel.removeClass( 'is-hidden' );

		// Display the total number of points
		$( '#numberProcessed' ).text( totalPointsRendered.toLocaleString() );

		// Setup interaction for the completion panel
		$completionPanel.one( 'click', function () {
			$( 'body' ).addClass( 'map-focused' );
			$(this).fadeOut(400, function() { $(this).remove(); }); // Fade out and remove the panel
			enableInteractiveControls();
		} );

		function enableInteractiveControls () {
			const $baseTileLayer = $( '.leaflet-tile-pane' );
			const $heatmapVisualLayer = $( '.leaflet-heatmap-layer' );
			const savedInitialOptions = $.extend( {}, visualConfig ); // Preserve initial settings for reset

			// Synchronize UI input values with current configuration
			function refreshControlInputs () {
				for ( const settingKey in visualConfig ) {
					if ( visualConfig.hasOwnProperty( settingKey ) ) {
						const inputElement = document.getElementById( settingKey );
						if ( inputElement ) { // Only update if an input element exists for this setting
							inputElement.value = visualConfig[settingKey];
						}
					}
				}
			}

			refreshControlInputs(); // Initial sync

			// Attach change listener to all control elements
			$( '.control' ).on( 'input', function () { // Using 'input' for real-time updates
				const controlId = this.id;
				const newValue = parseFloat( this.value );

				if ( isNaN(newValue) ) return; // Basic validation

				switch ( controlId ) {
					case 'tileOpacityFactor':
						$baseTileLayer.css( 'opacity', newValue );
						visualConfig[controlId] = newValue;
						break;
					case 'dataOpacityFactor':
						$heatmapVisualLayer.css( 'opacity', newValue );
						visualConfig[controlId] = newValue;
						break;
					case 'pointRadius':
					case 'blurAmount':
						visualConfig[controlId] = newValue;
						// Trigger heatmap update after a short delay to avoid excessive redraws
						clearTimeout( this.debounceTimer );
						this.debounceTimer = setTimeout( () => {
							overlayLayer.setOptions( {
								radius: visualConfig.pointRadius,
								blur: visualConfig.blurAmount
							} );
						}, 100 );
						break;
					default:
						// For other potential future controls
						visualConfig[controlId] = newValue;
						break;
				}
			} );

			// Setup reset button functionality
			$( '#reset' ).on( 'click', function () {
				$.extend( visualConfig, savedInitialOptions ); // Revert to original settings
				refreshControlInputs(); // Update UI inputs
				overlayLayer.setOptions( { // Reset heatmap specific options
					radius: visualConfig.pointRadius,
					blur: visualConfig.blurAmount
				} );
				// Reset opacity for both layers
				$heatmapVisualLayer.css( 'opacity', visualConfig.dataOpacityFactor );
				$baseTileLayer.css( 'opacity', visualConfig.tileOpacityFactor );
			} );
		}
	}

}( jQuery, L, prettySize ) );