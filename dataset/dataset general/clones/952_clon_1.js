AmCharts.AmExport = AmCharts.Class( {

	// Constructor function for the AmExport class
	construct: function ( chart, cfg, init )
	{
		// Store a reference to the current instance
		var _this = this;

		// Debugging flag, set to false by default
		_this.DEBUG = false;

		// Reference to the chart object
		_this.chart = chart;

		// Canvas element, initially null
		_this.canvas = null;

		// Array to hold SVG elements
		_this.svgs = [ ];

		// User-provided configuration
		_this.userCFG = cfg;

		// Default icon for the export button
		_this.buttonIcon = 'export.png';

		// Export format flags
		_this.exportPNG = true;
		_this.exportPDF = false;
		_this.exportJPG = false;
		_this.exportSVG = false;

		// _this.left; // Commented out property
		_this.right = 0; // Right position for the export button

		// _this.bottom; // Commented out property
		_this.top = 0; // Top position for the export button

		// _this.color; // Commented out property
		_this.buttonRollOverColor = "#EFEFEF"; // Color on button hover

		// _this.buttonColor = "#FFFFFF"; // Commented out default button color
		// _this.buttonRollOverAlpha = 0.5; // Commented out button rollover transparency

		_this.textRollOverColor = "#CC0000"; // Text color on button hover
		_this.buttonTitle = "Save chart as an image"; // Tooltip title for the export button
		_this.buttonAlpha = 0.75; // Transparency of the export button

		_this.imageFileName = "amChart"; // Default file name for exported images
		_this.imageBackgroundColor = "#FFFFFF"; // Background color for exported images

		// Initialize if 'init' flag is true
		if ( init )
		{
			_this.init();
		}
	},

	// Helper function to convert a value to a coordinate string
	toCoordinate: function ( value )
	{
		if ( value === undefined ) {
			return "auto"; // If value is undefined, return "auto"
		}

		// Check if the value contains a percentage sign
		if ( String( value ).indexOf( "%" ) != -1 )
		{
			return value; // Return as is if it's a percentage
		}
		else
		{
			return value + "px"; // Otherwise, append "px" for pixel value
		}
	},

	// Initialization method for the AmExport instance
	init: function ( ) {
		var _this = this; // Self-reference for scope

		var formats = []; // Array to hold enabled export formats

		// Populate formats based on export flags
		if ( _this.exportPNG ) {
			formats.push( "png" );
		}
		if ( _this.exportPDF ) {
			formats.push( "pdf" );
		}
		if ( _this.exportJPG ) {
			formats.push( "jpg" );
		}
		if ( _this.exportSVG ) {
			formats.push( "svg" );
		}

		var menuItems = [ ]; // Array to hold menu items for the export button

		// Handle menu item generation based on the number of formats
		if ( formats.length == 1 ) {
			var format = formats[ 0 ]; // Get the single format
			menuItems.push( {
				format: format,
				iconTitle: _this.buttonTitle,
				icon: _this.chart.pathToImages + _this.buttonIcon
			} );
		}
		else if ( formats.length > 1 ) {
			var subItems = []; // Array for sub-menu items
			for ( var i = 0; i < formats.length; i++ ) {
				subItems.push( {
					format: formats[ i ],
					title: formats[ i ].toUpperCase()
				} );
			}
			menuItems.push( {
				onclick: function ( ) {
				},
				icon: _this.chart.pathToImages + _this.buttonIcon,
				items: subItems
			} );
		}

		var color = _this.color; // Get the text color
		if ( color === undefined ) {
			color = _this.chart.color; // Use chart's color if not defined
		}

		var buttonColor = _this.buttonColor; // Get the button background color
		if ( buttonColor === undefined ) {
			buttonColor = "transparent"; // Default to transparent if not defined
		}

		// Main configuration object for the export functionality
		_this.cfg = {
			menuTop: _this.toCoordinate( _this.top ), // Top position of the menu
			menuLeft: _this.toCoordinate( _this.left ), // Left position of the menu
			menuRight: _this.toCoordinate( _this.right ), // Right position of the menu
			menuBottom: _this.toCoordinate( _this.bottom ), // Bottom position of the menu
			menuItems: menuItems, // Generated menu items

			menuItemStyle: { // Styling for menu items
				backgroundColor: buttonColor,
				opacity: _this.buttonAlpha,
				rollOverBackgroundColor: _this.buttonRollOverColor,
				color: color,
				rollOverColor: _this.textRollOverColor,
				paddingTop: '6px',
				paddingRight: '6px',
				paddingBottom: '6px',
				paddingLeft: '6px',
				marginTop: '0px',
				marginRight: '0px',
				marginBottom: '0px',
				marginLeft: '0px',
				textAlign: 'left',
				textDecoration: 'none',
				fontFamily: _this.chart.fontFamily,
				fontSize: _this.chart.fontSize + 'px'
			},

			menuItemOutput: { // Configuration for the output process
				backgroundColor: _this.imageBackgroundColor,
				fileName: _this.imageFileName,
				format: 'png', // Default output format
				output: 'dataurlnewwindow', // Default output method
				render: 'browser', // Default rendering method
				dpi: 90, // Dots per inch for raster images
				onclick: function ( instance, config, event ) {
					event.preventDefault(); // Prevent default click behavior
					instance.output( config ); // Call the output method
				}
			},

			removeImagery: true // Flag to remove imagery from SVG
		};

		// Object to manage processing state
		_this.processing = {
			buffer: [], // Buffer for processing data
			drawn: 0, // Counter for drawn items
			timer: 0 // Timer for processing
		};

		// Adapt configuration based on available libraries
		if ( typeof ( window.canvg ) != 'undefined' && typeof ( window.RGBColor ) != 'undefined' ) {
			_this.cfg.menuItemOutput.render = 'canvg'; // Use canvg if available
		}
		if ( typeof ( window.saveAs ) != 'undefined' ) {
			_this.cfg.menuItemOutput.output = 'save'; // Use saveAs if available
		}
		if ( AmCharts.isIE && AmCharts.IEversion < 10 ) {
			_this.cfg.menuItemOutput.output = 'dataurlnewwindow'; // Fallback for older IE versions
		}

		// Merge user-provided configurations
		var cfg = _this.userCFG;
		if ( cfg ) {
			// Extend specific sub-configs
			cfg.menuItemOutput = AmCharts.extend( _this.cfg.menuItemOutput, cfg.menuItemOutput || {} );
			cfg.menuItemStyle = AmCharts.extend( _this.cfg.menuItemStyle, cfg.menuItemStyle || {} );

			// Extend the main configuration
			_this.cfg = AmCharts.extend( _this.cfg, cfg );
		}

		// Add a reference to this AmExport instance on the chart object
		_this.chart.AmExport = _this;

		// Listen to the 'rendered' event of the chart to set up export buttons
		_this.chart.addListener( 'rendered', function ( ) {
			_this.setup();
		} );

		// If in debug mode, expose AmExport globally for inspection
		if ( _this.DEBUG ) {
			window.AmExport = _this;
		}
	},

	/*
	 * Simple log function for internal debugging purposes.
	 * It prints messages to the console prefixed with "AmExport: ".
	 * @param {arguments} args - Any number of arguments to be logged.
	 */
	log: function ( ) {
		console.log( 'AmExport: ', arguments );
	},

	/*
	 * PUBLIC METHOD: setup
	 * Prepares the export functionality, specifically by generating the export buttons.
	 * This method ensures that the setup is only performed for modern browsers (not older IE).
	 * @param {void}
	 */
	setup: function ( ) {
		var _this = this; // Reference to the AmExport instance

		// Generate buttons only if not an older Internet Explorer version
		if ( !AmCharts.isIE || ( AmCharts.isIE && AmCharts.IEversion > 9 ) ) {
			_this.generateButtons();
		}
	},

	/*
	 * PUBLIC METHOD: generateBinaryArray
	 * Decodes a base64 string into a Uint8Array (binary array).
	 * This implementation is adapted from works by Eli Grey and Devin Samarin.
	 * @param {string} base64_string - The base64 encoded string.
	 * @returns {Uint8Array} A Uint8Array containing the decoded binary data.
	 * @copyright Eli Grey (http://eligrey.com) and Devin Samarin (https://github.com/eboyjr)
	 */
	generateBinaryArray: function ( base64_string ) {
		var
			len = base64_string.length,
			buffer = new Uint8Array( len / 4 * 3 | 0 ), // Allocate buffer for 3/4 of the length
			i = 0,
			outptr = 0,
			last = [ 0, 0 ],
			state = 0,
			save = 0,
			rank, code, undef,
			base64_ranks = new Uint8Array( [
				62, -1, -1, -1, 63, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, -1, -1, -1, 0, -1, -1, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, -1, -1, -1, -1, -1, -1, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51
			] );

		// Iterate through the base64 string
		while ( len-- ) {
			code = base64_string.charCodeAt( i++ );
			rank = base64_ranks[ code - 43 ]; // Get the rank from the lookup table

			if ( rank !== 255 && rank !== undef ) {
				last[ 1 ] = last[ 0 ];
				last[ 0 ] = code;
				save = ( save << 6 ) | rank; // Shift and OR the rank
				state++;

				if ( state === 4 ) {
					buffer[ outptr++ ] = save >>> 16; // First byte
					if ( last[ 1 ] !== 61 /* padding character '=' */ ) {
						buffer[ outptr++ ] = save >>> 8; // Second byte
					}
					if ( last[ 0 ] !== 61 /* padding character '=' */ ) {
						buffer[ outptr++ ] = save; // Third byte
					}
					state = 0; // Reset state
				}
			}
		}
		// Note: The buffer might contain some null bytes at the end if padding was involved.
		// For most image formats, this does not cause issues.
		return buffer;
	},

	/*
	 * PUBLIC METHOD: generateBlob
	 * Creates a Blob object from a given data string and type.
	 * Handles base64 decoding if necessary and provides a fallback for older IE versions.
	 * @param {string} datastring - The data string (can be base64 encoded or raw).
	 * @param {string} type - The MIME type of the blob (e.g., 'image/png', 'application/pdf').
	 * @returns {Blob} A Blob object containing the data.
	 */
	generateBlob: function ( datastring, type ) {
		var _this = this,
			header_end = type != 'image/svg+xml' ? datastring.indexOf( ',' ) + 1 : 0, // Find end of data URI header
			header = datastring.substring( 0, header_end ), // Extract header
			data = datastring, // Initialize data with full string
			blob = new Blob(); // Create a new Blob instance

		// If header indicates base64, decode the data part
		if ( header.indexOf( 'base64' ) != -1 ) {
			data = _this.generateBinaryArray( datastring.substring( header_end ) );
		}

		// Special handling for older Internet Explorer versions (IE < 10)
		if ( AmCharts.isIE && AmCharts.IEversion < 10 ) {
			// Simulate Blob properties for IE
			blob.data = data;
			blob.size = data.length;
			blob.type = type;
			blob.encoding = 'base64'; // Indicate encoding for the fake blob
		} else {
			// For modern browsers, create a standard Blob
			blob = new Blob( [ data ], {
				type: type
			} );
		}
		return blob;
	},

	/*
	 * PUBLIC METHOD: generatePDF
	 * Generates a PDF document from the chart's canvas data.
	 * Requires the jsPDF library to be loaded.
	 * @param {object} cfg - Configuration object, specifically for DPI.
	 * @returns {object} A jsPDF object, or a dummy object if jsPDF is missing.
	 */
	generatePDF: function ( cfg ) {
		var _this = this,
			pdf = {
				output: function ( ) {
					return ''; // Dummy output function if jsPDF is not available
				}
			},
			data = _this.canvas.toDataURL( 'image/jpeg' ), // Get JPEG data from canvas (jsPDF prefers JPG)
			width = ( _this.canvas.width * 25.4 ) / cfg.dpi, // Calculate width in mm
			height = ( _this.canvas.height * 25.4 ) / cfg.dpi; // Calculate height in mm

		// Check if jsPDF library is available
		if ( window.jsPDF ) {
			pdf = new jsPDF(); // Create a new jsPDF instance
			if ( pdf.addImage ) {
				// Add the image to the PDF
				pdf.addImage( data, 'JPEG', 0, 0, width, height );
			} else {
				alert( "Missing jsPDF plugin; Please add the 'addImage' plugin." );
			}
		} else {
			alert( "Missing jsPDF lib; Don't forget to add the addImage plugin." );
		}

		return pdf;
	},

	/*
	 * PUBLIC METHOD: output
	 * Initiates the export process based on the given configuration.
	 * It generates the final output (SVG, PDF, PNG, JPG) and handles various output methods (save, data URI, new window).
	 * @param {object} cfg - Configuration for the output, overriding default menuItemOutput settings.
	 * @param {function} externalCallback - Optional callback function to be executed after output generation.
	 * @returns {void} The result of generateOutput, which triggers the actual rendering.
	 */
	output: function ( cfg, externalCallback ) {
		var _this = this; // Reference to the AmExport instance
		// Extend the default output configuration with provided settings
		cfg = AmCharts.extend( AmCharts.extend( {}, _this.cfg.menuItemOutput ), cfg || {} );

		// If chart has a prepareForExport method, call it
		if ( _this.chart.prepareForExport ) {
			_this.chart.prepareForExport();
		}


		/*
		 * PRIVATE FUNCTION: internalCallback
		 * This function is called once the drawing process on the canvas is complete.
		 * It handles the final data conversion and output based on the configured format and output method.
		 * @param {void}
		 */
		function internalCallback ( ) {
			var data = null; // Variable to hold the output data
			var blob; // Variable to hold the Blob object

			// --- SVG Output ---
			if ( cfg.format == 'image/svg+xml' || cfg.format == 'svg' ) {
				data = _this.generateSVG(); // Generate SVG string
				blob = _this.generateBlob( data, 'image/svg+xml' ); // Create SVG blob

				if ( cfg.output == 'save' ) {
					saveAs( blob, cfg.fileName + '.svg' ); // Save SVG file
				} else if ( cfg.output == 'datastring' || cfg.output == 'datauristring' || cfg.output == 'dataurlstring' ) {
					blob = 'data:image/svg+xml;base64,' + btoa( data ); // Return base64 data URI string
				} else if ( cfg.output == 'dataurlnewwindow' ) {
					window.open( 'data:image/svg+xml;base64,' + btoa( data ) ); // Open in new window
				} else if ( cfg.output == 'datauri' || cfg.output == 'dataurl' ) {
					location.href = 'data:image/svg+xml;base64,' + btoa( data ); // Navigate current window
				} else if ( cfg.output == 'datastream' ) {
					location.href = 'data:image/octet-stream;base64,' + data; // Download as octet-stream
				}

				if ( externalCallback ) {
					externalCallback.apply( _this, [ blob ] ); // Execute external callback
				}

				// --- PDF Output ---
			} else if ( cfg.format == 'application/pdf' || cfg.format == 'pdf' ) {
				data = _this.generatePDF( cfg ).output( 'dataurlstring' ); // Generate PDF data URI
				blob = _this.generateBlob( data, 'application/pdf' ); // Create PDF blob

				if ( cfg.output == 'save' ) {
					saveAs( blob, cfg.fileName + '.pdf' ); // Save PDF file
				} else if ( cfg.output == 'datastring' || cfg.output == 'datauristring' || cfg.output == 'dataurlstring' ) {
					blob = data; // Return data URI string
				} else if ( cfg.output == 'dataurlnewwindow' ) {
					window.open( data ); // Open in new window
				} else if ( cfg.output == 'datauri' || cfg.output == 'dataurl' ) {
					location.href = data; // Navigate current window
				} else if ( cfg.output == 'datastream' ) {
					location.href = data.replace( 'application/pdf', 'application/octet-stream' ); // Download as octet-stream
				}

				if ( externalCallback ) {
					externalCallback.apply( _this, [ blob ] ); // Execute external callback
				}

				// --- PNG Output ---
			} else if ( cfg.format == 'image/png' || cfg.format == 'png' ) {
				data = _this.canvas.toDataURL( 'image/png' ); // Get PNG data URI from canvas
				blob = _this.generateBlob( data, 'image/png' ); // Create PNG blob

				if ( cfg.output == 'save' ) {
					saveAs( blob, cfg.fileName + '.png' ); // Save PNG file
				} else if ( cfg.output == 'datastring' || cfg.output == 'datauristring' || cfg.output == 'dataurlstring' ) {
					blob = data; // Return data URI string
				} else if ( cfg.output == 'dataurlnewwindow' ) {
					window.open( data ); // Open in new window
				} else if ( cfg.output == 'datauri' || cfg.output == 'dataurl' ) {
					location.href = data; // Navigate current window
				} else if ( cfg.output == 'datastream' ) {
					location.href = data.replace( 'image/png', 'image/octet-stream' ); // Download as octet-stream
				}

				if ( externalCallback ) {
					externalCallback.apply( _this, [ blob ] ); // Execute external callback
				}

				// --- JPG Output ---
			} else if ( cfg.format == 'image/jpeg' || cfg.format == 'jpeg' || cfg.format == 'jpg' ) {
				data = _this.canvas.toDataURL( 'image/jpeg' ); // Get JPEG data URI from canvas
				blob = _this.generateBlob( data, 'image/jpeg' ); // Create JPEG blob

				if ( cfg.output == 'save' ) {
					saveAs( blob, cfg.fileName + '.jpg' ); // Save JPG file
				} else if ( cfg.output == 'datastring' || cfg.output == 'datauristring' || cfg.output == 'dataurlstring' ) {
					blob = data; // Return data URI string
				} else if ( cfg.output == 'dataurlnewwindow' ) {
					window.open( data ); // Open in new window
				} else if ( cfg.output == 'datauri' || cfg.output == 'dataurl' ) {
					location.href = data; // Navigate current window
				} else if ( cfg.output == 'datastream' ) {
					location.href = data.replace( 'image/jpeg', 'image/octet-stream' ); // Download as octet-stream
				}

				if ( externalCallback ) {
					externalCallback.apply( _this, [ blob ] ); // Execute external callback
				}
			}

		}

		// Call the generateOutput method which orchestrates the canvas rendering
		return _this.generateOutput( cfg, internalCallback );
	},

	/*
	 * PUBLIC METHOD: polifySVG
	 * "Polifies" (polyfills/enhances) an SVG element by adding necessary attributes
	 * and optionally embedding linked images as base64 data URIs.
	 * @param {SVGElement} svg - The SVG element to polify.
	 * @returns {SVGElement} The modified SVG element.
	 */
	polifySVG: function ( svg ) {
		var _this = this; // Reference to the AmExport instance

		// Recursive function to iterate through elements and apply changes
		function recursiveChange ( svgElement, tag ) {
			var items = svgElement.getElementsByTagName( tag ); // Get all elements of the specified tag
			var i = items.length; // Initialize loop counter

			while ( i-- ) { // Loop backwards for safer DOM manipulation
				if ( _this.cfg.removeImagery ) {
					// If removeImagery is true, remove the element from its parent
					items[ i ].parentNode.removeChild( items[ i ] );
				} else {
					// Otherwise, embed the image data
					var image = document.createElement( 'img' ); // Create a temporary image element
					var canvas = document.createElement( 'canvas' ); // Create a temporary canvas
					var ctx = canvas.getContext( '2d' ); // Get 2D rendering context

					// Set canvas dimensions from SVG element attributes
					canvas.width = items[ i ].getAttribute( 'width' );
					canvas.height = items[ i ].getAttribute( 'height' );

					// Set image source and dimensions from SVG element attributes
					image.src = items[ i ].getAttribute( 'xlink:href' );
					image.width = items[ i ].getAttribute( 'width' );
					image.height = items[ i ].getAttribute( 'height' );

					var datastring; // Variable to hold the data URI

					try {
						// Attempt to draw the image onto the canvas
						ctx.drawImage( image, 0, 0, image.width, image.height );
						datastring = canvas.toDataURL(); // Get data URI from canvas
					} catch ( err ) {
						// Catch CORS tainted canvas errors
						datastring = image.src; // Fallback to original src if tainted

						_this.log( 'Tainted canvas, reached browser CORS security; origin from imagery must be equal to the server!' );
						throw new Error( err ); // Re-throw the error
					}

					// Update the xlink:href attribute with the base64 data URI
					items[ i ].setAttribute( 'xlink:href', datastring );
				}

			}
		}

		// Add necessary xmlns attributes to the SVG element
		// This is particularly important for valid SVG files, especially for older browsers or specific renderers
		if ( AmCharts.IEversion == 0 ) { // Check if not IE (assuming 0 implies non-IE)
			svg.setAttribute( 'xmlns', 'http://www.w3.org/2000/svg' );
			if ( !_this.cfg.removeImagery ) {
				svg.setAttribute( 'xmlns:xlink', 'http://www.w3.org/1999/xlink' );
			}
		}

		// Apply recursive changes to 'pattern' and 'image' elements
		recursiveChange( svg, 'pattern' );
		recursiveChange( svg, 'image' );

		// Store the polified SVG in the instance's svgs array
		_this.svgs.push( svg );

		return svg; // Return the modified SVG element
	},

	/*
	 * PUBLIC METHOD: generateSVG
	 * Stacks multiple SVG elements (from the processing buffer) into a single SVG element.
	 * This creates a composite SVG from all chart components.
	 * @param {void}
	 * @returns {string} The serialized string of the combined SVG element.
	 */
	generateSVG: function ( ) {
		var _this = this; // Reference to the AmExport instance
		var context = document.createElement( 'svg' ); // Create a new SVG container element

		// Set essential SVG attributes for the combined context
		context.setAttribute( 'xmlns', 'http://www.w3.org/2000/svg' );
		context.setAttribute( 'xmlns:xlink', 'http://www.w3.org/1999/xlink' );

		// Iterate through the buffered SVG data
		for ( var i = 0; i < _this.processing.buffer.length; i++ ) {
			var group = document.createElement( 'g' ), // Create a group element for each SVG
				data = _this.processing.buffer[ i ]; // Get the SVG element and its position

			// Ensure individual SVG elements also have xmlns attributes
			data[ 0 ].setAttribute( 'xmlns', 'http://www.w3.org/2000/svg' );
			data[ 0 ].setAttribute( 'xmlns:xlink', 'http://www.w3.org/1999/xlink' );

			// Apply translation transform based on stored position
			group.setAttribute( 'transform', 'translate(' + data[ 1 ].x + ',' + data[ 1 ].y + ')' );
			group.appendChild( data[ 0 ] ); // Append the SVG element to the group
			context.appendChild( group ); // Append the group to the main context SVG
		}

		// Serialize the entire SVG context to a string
		return new XMLSerializer().serializeToString( context );
	},

	/*
	 * PUBLIC METHOD: generateOutput
	 * Orchestrates the process of generating a canvas from SVG elements and then
	 * performing the final output (e.g., saving, opening in new window).
	 * This function handles the rendering of SVGs onto a canvas using either
	 * the browser's native capabilities or the canvg library.
	 * @param {object} cfg - Configuration object for output settings.
	 * @param {function} callback - Callback function to be executed after the canvas drawing is finished.
	 * @returns {void}
	 */
	generateOutput: function ( cfg, callback ) {
		var _this = this, // Reference to the AmExport instance
			coll = [], // Temporary array for SVG collections
			svgs = [], // Array to hold actual SVG elements
			canvas = document.createElement( 'canvas' ), // Create a new canvas element
			context = canvas.getContext( '2d' ), // Get 2D rendering context
			offset = {
				y: 0,
				x: 0
			}; // Offset for positioning SVGs on canvas

		// Collect all SVG elements within the chart's div
		coll = _this.chart.div.getElementsByTagName( 'svg' );
		for ( var i = 0; i < coll.length; i++ ) {
			svgs.push( coll[ i ] ); // Add each found SVG to the svgs array
		}