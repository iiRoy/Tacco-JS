(function ( envCtx ) { /*
 *  This self-executing function initializes a responsive image loading mechanism.
 *  It takes the global context (typically the window object) as an argument.
 */

	envCtx.adaptiveImageProcessor = function () { // Defines the core function for processing image source sets
		const visualAssets = document.querySelectorAll( 'img' ); // Retrieves all <img> elements within the document
		let parsedSourceSets = Object.create( null ); // An object to store mappings of resolution to image URLs for a single image
		const currentViewportWidth = envCtx.document.documentElement.clientWidth; // Determines the current width of the user's viewport
		const largeDisplayBuffer = 200; // A buffer value used for determining when to apply 'infinite' resolution images

		/**
		 *  Parses an array of source set definitions and populates the `parsedSourceSets` object.
		 *  Each definition string contains a URL and an optional width descriptor.
		 *  @param {string[]} sourceDefinitions - An array where each string is a part of the srcset attribute.
		 */
		const processSourceString = function ( sourceDefinitions ) {
			for ( let defIndex = 0; defIndex < sourceDefinitions.length; defIndex++ ) {
				let currentEntry = sourceDefinitions[defIndex].replace( /^\s*/, '' ).split( ' ' ); // Cleans leading whitespace and splits the string into URL and width
				let parsedWidth = parseInt( currentEntry[1], 10 ); // Extracts and converts the width string to an integer
				if ( !currentEntry[1] ) { // If no width descriptor is present, it's considered 'infinite'
					parsedWidth = 'infinite';
				}
				parsedSourceSets[parsedWidth] = currentEntry[0]; // Stores the URL, keyed by its corresponding width
			}
		};

		/**
		 *  Scans the `parsedSourceSets` object to find the largest numerical width defined.
		 *  @param {Object} widthUrlMap - The object containing width-to-URL mappings.
		 *  @returns {number} The highest numerical width found among the keys.
		 */
		const findMaximumDimension = function ( widthUrlMap ) {
			let greatestDimension = 0; // Initializes the variable to hold the maximum width
			for ( const dimensionKey in parsedSourceSets ) { // Iterates through the keys (widths) in the source set map
				if ( parsedSourceSets.hasOwnProperty( dimensionKey ) && parseInt( dimensionKey, 10 ) > greatestDimension ) {
					greatestDimension = dimensionKey; // Updates if a larger numerical width is found
				}
			}
			return parseInt( greatestDimension, 10 ); // Returns the maximum dimension as an integer
		};

		for ( let elementPosition = 0; elementPosition < visualAssets.length; elementPosition++ ) { // Loops through each image element found on the page
			if ( visualAssets[elementPosition].getAttribute('srcset') ) { // Checks if the current image has a 'srcset' attribute
				const sourceDefinitions = visualAssets[elementPosition].getAttribute('srcset').split(','); // Splits the srcset string into individual source definitions
				parsedSourceSets = Object.create( null ); // Resets the source set map for the new image
				processSourceString( sourceDefinitions ); // Populates `parsedSourceSets` for the current image

				const highestAvailableResolution = findMaximumDimension(parsedSourceSets); // Determines the largest specified width for the current image's srcset
				let selectedSourceLink = ''; // Variable to store the URL of the image to be loaded
				for ( const widthOption in parsedSourceSets ) { // Iterates through each width option defined for the current image
					if ( parsedSourceSets.hasOwnProperty( widthOption ) ) { // Ensures the property belongs directly to the object
						if ( currentViewportWidth >= widthOption && widthOption !== 'infinite' ) { // If viewport width is sufficient and it's not the 'infinite' option
							selectedSourceLink = parsedSourceSets[widthOption]; // Select this source URL
						} else if ( widthOption === 'infinite' && currentViewportWidth > ( highestAvailableResolution + largeDisplayBuffer ) ) { // If it's the 'infinite' option and viewport is significantly larger than the highest defined resolution
							selectedSourceLink = parsedSourceSets[widthOption]; // Select the 'infinite' source URL
						}
					}
				}
				visualAssets[elementPosition].src = selectedSourceLink; // Applies the chosen image URL to the image's 'src' attribute
			}
		}
	};
	

	// Attaches event listeners to trigger the image processor on various DOM events.
	// This ensures responsive images are loaded correctly on resize and initial page load.
	if ( envCtx.addEventListener ) { // Checks for modern event listener support
		envCtx.addEventListener( "resize", envCtx.adaptiveImageProcessor, false ); // Binds the processor to the window resize event
		envCtx.addEventListener( "DOMContentLoaded", function() { // Binds to the DOMContentLoaded event for initial execution
			envCtx.adaptiveImageProcessor(); // Executes the processor immediately after the DOM is ready
			// Removes the 'load' event listener to prevent duplicate execution if DOMContentLoaded fires first
			envCtx.removeEventListener( "load", envCtx.adaptiveImageProcessor, false );
		}, false );
		envCtx.addEventListener( "load", envCtx.adaptiveImageProcessor, false ); // Binds as a fallback to the window load event
	}
	else if ( envCtx.attachEvent ) { // Checks for legacy Internet Explorer event attachment method
		envCtx.attachEvent( "onload", envCtx.adaptiveImageProcessor ); // Attaches the processor to the 'onload' event for older browsers
	}

})(this); // Passes 'this' (which refers to the window object in a browser environment) to the function