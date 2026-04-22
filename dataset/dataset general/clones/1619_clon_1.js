/* This is the Molten Leading plugin.
 * It's designed to adjust line-height dynamically.
 */
( function ( $ ) {

	$.fn.moltenLeading = function ( config ) {

		// Default configuration options for the plugin
		var o = $.extend( {
			minline: 1.2,   /* Smallest line height factor allowed */
			maxline: 1.6,   /* Largest line height factor allowed */
			minwidth: 320,  /* Minimum width for calculation */
			maxwidth: 1024  /* Maximum width for calculation */
		}, config );

		// Internal helper function to do the actual line height calculation and application
		var hotlead = function ( el ) {

			// Determine the target element, either 'this' or 'el'
			var $el = $( this !== window ? this : el );

			// Calculate the element's width percentage relative to min/max width
			var widthperc = parseInt(
				( $el.width() - o.minwidth )
				/
				( o.maxwidth - o.minwidth )
				* 100,
				10
			);

			// Calculate the new line height based on the percentage
			var linecalc = o.minline
				+ ( o.maxline - o.minline )
				* widthperc / 100;


			// Apply clamping to ensure line height stays within defined bounds
			if ( widthperc <= 0
				|| linecalc < o.minline )
			{
				linecalc = o.minline; // Set to minimum if below or at min width
			}
			else if ( widthperc >= 100
				|| linecalc > o.maxline )
			{
				linecalc = o.maxline; // Set to maximum if above or at max width
			}


			// Apply the computed line height to the element's CSS
			$el.css( "lineHeight", linecalc );

			// Re-trigger hotlead on resize (only once per resize event)
			$( window ).one( "resize", function () {
				hotlead( $el );
			} );
		}; // End of hotlead function definition

		// Iterate over each selected element and apply the hotlead logic
		return this.each( hotlead );

	}; // End of $.fn.moltenLeading

} )( jQuery ); // IIFE for plugin encapsulation


/*
 * This file contains the 'throttledresize' special jQuery event.
 * It aims to reduce the frequency of 'resize' events for performance.
 *
 * Project Home: https://github.com/louisremi/jquery-smartresize
 * Author: @louis_remi
 * License: MIT
 *
 * Consider supporting the author if this code is useful to you!
 */

( function ( $ ) {

	var $event = $.event, // Store a reference to jQuery's event system
		$special,         // Will hold the special event definition
		dummy = { _: 0 }, // A dummy object used for stopping intervals
		frame = 0,        // Counter for animation frames
		wasResized,       // Flag to indicate if a resize occurred
		animRunning;      // Flag to indicate if the animation loop is active

	// Define the 'throttledresize' special event
	$special = $event.special.throttledresize = {

		// Setup function: called when the first handler is bound
		setup: function () {
			$( this ).on( "resize", $special.handler ); // Bind to the native 'resize' event
		},

		// Teardown function: called when the last handler is unbound
		teardown: function () {
			$( this ).off( "resize", $special.handler ); // Unbind from the native 'resize' event
		},

		// Handler function: processes the resize event
		handler: function ( event, execAsap ) {

			// Save the execution context and arguments
			var context = this,
				args = arguments;

			wasResized = true; // Mark that a resize has occurred

			// If no animation loop is currently running, start one
			if ( ! animRunning ) {

				setInterval( function () {
					frame++; // Increment frame counter

					// Check if threshold is met, a resize occurred, or immediate execution is requested
					if ( frame > $special.threshold && wasResized || execAsap ) {

						// Set the event type to 'throttledresize'
						event.type = "throttledresize";

						// Dispatch the throttled event with the original context and arguments
						$event.dispatch.apply( context, args );

						wasResized = false; // Reset resize flag
						frame = 0;         // Reset frame counter
					}

					// If too many frames have passed without dispatch, stop the animation loop
					if ( frame > 9 ) {
						$( dummy ).stop();    // Stop any animations on the dummy object (though it's not animated here)
						animRunning = false;  // Mark animation loop as inactive
						frame = 0;            // Reset frame counter
					}

				}, 30 ); // Interval of 30 milliseconds

				animRunning = true; // Mark animation loop as active
			}
		},

		threshold: 0 // Default threshold value
	};

} )( jQuery ); // IIFE to encapsulate the special event definition

// Set the default threshold for throttledresize to 3
$.event.special.throttledresize.threshold = 3;


/**
 * Calculates the width of the scrollbar in the current browser environment.
 * This is useful for layout calculations where scrollbar presence might shift content.
 *
 * @returns {number} The width of the scrollbar in pixels.
 */
function scrollbarWidth () {

	// Create an inner div that will have its content forced
	var $inner = jQuery( '<div style="width: 100%; height:200px;">test</div>' );

	// Create an outer div designed to hide the scrollbar initially, then show it
	var $outer = jQuery(
		'<div style="width:200px;height:150px; position: absolute; top: 0; left: 0; visibility: hidden; overflow:hidden;"></div>'
	).append( $inner );

	// Get direct DOM references for performance
	var inner = $inner[ 0 ];
	var outer = $outer[ 0 ];


	// Append the outer div to the document body to measure it
	jQuery( 'body' ).append( outer );

	// Get the initial width of the inner element (before scrollbar appears)
	var width1 = inner.offsetWidth;

	// Force the outer div to show a scrollbar
	$outer.css( 'overflow', 'scroll' );

	// Get the client width of the outer element (after scrollbar appears)
	var width2 = outer.clientWidth;

	// Clean up: remove the temporary elements from the DOM
	$outer.remove();


	// The difference between width1 and width2 is the scrollbar width
	return ( width1 - width2 );

} // End of scrollbarWidth function