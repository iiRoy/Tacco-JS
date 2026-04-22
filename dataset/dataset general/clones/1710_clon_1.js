/*
 *  This is a jQuery plugin named 'firefly'
 *  Version: 0.2
 *
 *  Original Author: Dharmveer Motyar
 *  Blog:            http://motyar.blogspot.com
 *
 *  Last Modified:   $Id$ (Placeholder for SCM systems)
 *
 *  License Information:
 *  This software is licensed under the MIT License.
 *  For details, see: http://www.opensource.org/licenses/mit-license.php
 *
 *  Purpose:
 *  Creates a dynamic and visually appealing firefly effect on a webpage.
 *
 *  Usage Example:
 *  Simply call $.firefly(); to activate the effect on the document body.
 *
 *  jQuery Plugin Details:
 *  @name       firefly
 *  @type       jQuery
 *  @category   Plugins/firefly
 */
( function ( $ ) {

	// --- Plugin's Default Configuration ---
	// These settings can be overridden by passing an options object to $.firefly()
	var defaults = {

		images : [
			'http://dharmmotyar.googlecode.com/svn/trunk/images/spark.png',
			'http://dharmmotyar.googlecode.com/svn/trunk/images//spark2.png',
			'http://dharmmotyar.googlecode.com/svn/trunk/images/spark3.png',
			'http://dharmmotyar.googlecode.com/svn/trunk/images/spark4.png'
		], // Array of image paths for the firefly sprites

		total    : 10,  // The number of fireflies to display

		ofTop    : 0,   // Vertical offset (unused in current implementation, might be for future use)

		ofLeft   : 0,   // Horizontal offset (unused in current implementation, might be for future use)

		on       : 'document.body', // The selector for the element on which fireflies will appear

		twinkle  : 0.2  // Probability of a firefly having 0 opacity (twinkling effect)
	};


	/**
	 *  Main function to initialize the firefly effect.
	 *  @param {object} settings - Optional configuration settings to override defaults.
	 */
	$.firefly = function ( settings ) {

		// Extend default settings with user-provided settings
		$.firefly.settings = $.extend( {}, defaults, settings );

		// Determine the dimensions of the container element
		$.firefly.eleHeight = $( $.firefly.settings.on ).height();
		$.firefly.eleWidth  = $( $.firefly.settings.on ).width();


		// Check if the target element is the document body or a specific element
		if ( $.firefly.settings.on !== 'document.body' ) {

			// If it's a specific element, get its offset
			var off = $( $.firefly.settings.on ).offset();

			$.firefly.offsetTop  = off.top;
			$.firefly.offsetLeft = off.left;

			// Re-calculate height/width, just in case (redundant but harmless)
			$.firefly.eleHeight  = $( $.firefly.settings.on ).height();
			$.firefly.eleWidth   = $( $.firefly.settings.on ).width();
		}
		else {
			// If it's the document body, offsets are zero
			$.firefly.offsetTop  = 0;
			$.firefly.offsetLeft = 0;

			// Get body dimensions
			$.firefly.eleHeight  = $( document.body ).height();
			$.firefly.eleWidth   = $( document.body ).width();
		}


		// Preload images to avoid flickering
		if ( $.firefly.preloadImages() ) {

			// Create and start flying each firefly
			for ( i = 0; i < $.firefly.settings.total; i++ ) {

				// Select a random image for each firefly
				var randomImageIndex = $.firefly.random( ( $.firefly.settings.images ).length );

				$.firefly.fly( $.firefly.create( $.firefly.settings.images[ randomImageIndex ] ) );
			}
		}

		return; // The function doesn't return a value directly
	};



	/*
	 *  --- Public Utility Functions ---
	 *  These functions are attached to $.firefly for broader access
	 */


	/**
	 * Creates a single firefly (spark) element and appends it to the container.
	 * @param {string} img - The URL of the image to use for the firefly.
	 * @returns {jQuery} The created spark element.
	 */
	$.firefly.create = function ( img ) {

		// Create an image element and set its source, initially hidden
		var spark = $( '<img>' ).attr( { 'src' : img } ).hide();

		// Append the spark to the correct parent element
		if ( $.firefly.settings.on === 'document.body' ) {
			$( document.body ).append( spark );
		}
		else {
			$( $.firefly.settings.on ).append( spark );
		}

		// Apply initial CSS properties and make it visible
		return spark.css( {
			'position'  : 'absolute',

			'z-index'   : -1 * $.firefly.random( 20 ), // Place behind other content

			top         : $.firefly.offsetTop  + $.firefly.random( ( $.firefly.eleHeight - 50 ) ), // Random vertical position

			left        : $.firefly.offsetLeft + $.firefly.random( ( $.firefly.eleWidth  - 50 ) )  // Random horizontal position
		} ).show();
	};



	/**
	 * Makes a firefly element "fly" by animating its position and opacity.
	 * This function calls itself recursively to create continuous movement.
	 * @param {jQuery} sp - The spark (firefly) element to animate.
	 */
	$.firefly.fly = function ( sp ) {

		// Animate the spark's properties
		$( sp ).animate( {
			top       : $.firefly.offsetTop  + $.firefly.random( ( $.firefly.eleHeight - 50 ) ), // New random top position
			left      : $.firefly.offsetLeft + $.firefly.random( ( $.firefly.eleWidth  - 50 ) ), // New random left position
			opacity   : $.firefly.opacity( $.firefly.settings.twinkle )                          // Apply twinkle effect
		},
		( ( $.firefly.random( 10 ) + 5 ) * 2000 ), // Random duration between 10 and 30 seconds (5*2000 to 15*2000)
		function () { $.firefly.fly( sp ); }       // Callback: once animation completes, call fly again
		);
	};


	/**
	 * Stops the animation of a specific firefly.
	 * @param {jQuery} sp - The spark (firefly) element whose animation should be stopped.
	 */
	$.firefly.stop = function ( sp ) {
		$( sp ).stop(); // jQuery's stop method halts current animations
	};


	/**
	 * Preloads all firefly images to ensure smooth animation.
	 * @returns {boolean} Always returns true after attempting to preload.
	 */
	$.firefly.preloadImages = function () {

		var preloads = new Object(); // Create an object to hold image references

		for ( i = 0; i < ( $.firefly.settings.images ).length; i++ ) {
			preloads[ i ] = new Image();            // Create a new Image object
			preloads[ i ].src = $.firefly.settings.images[ i ]; // Set its source to trigger loading
		}

		return true; // Indicate that preloading process was initiated
	};


	/**
	 * Generates a random integer between 0 (inclusive) and max (exclusive).
	 * @param {number} max - The upper bound for the random number.
	 * @returns {number} A random integer.
	 */
	$.firefly.random = function ( max ) {
		return Math.ceil( Math.random() * max ) - 1; // Generates 0 to max-1
	};


	/**
	 * Determines the opacity for a firefly, creating a twinkling effect.
	 * @param {number} min - The minimum probability threshold for opacity to be 0.
	 * @returns {number} Either 0 (invisible) or 1 (visible).
	 */
	$.firefly.opacity = function ( min ) {
		var op = Math.random(); // Generate a random number between 0 and 1

		if ( op < min ) {
			return 0; // If random number is below threshold, set opacity to 0
		}
		else {
			return 1; // Otherwise, set opacity to 1
		}
	};

// End of the self-executing anonymous function, passing jQuery as $
} )( jQuery );