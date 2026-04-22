/*
 * jQuery Waypoints Sticky Elements Shortcut - Version 2.0.2
 *
 * This plugin provides a convenient way to make elements "sticky"
 * when they hit a Waypoint.
 *
 * Copyright (c) 2011-2013 Caleb Troughton
 * Dual licensed under the MIT and GPL licenses.
 * For license details, please refer to:
 * https://github.com/imakewebthings/jquery-waypoints/blob/master/licenses.txt
 */


( function ( ) { // Start of main IIFE

	// Universal Module Definition (UMD) pattern for compatibility
	( function ( root, factory ) {

		// Check for AMD loader (e.g., RequireJS)
		if  ( typeof define  ===  'function'  &&  define.amd )
		{
			// AMD. Register as an anonymous module.
			return define ( [ 'jquery', 'waypoints' ], factory );
		}
		else
		{
			// Browser globals (no AMD)
			return factory ( root.jQuery );
		}

	} ) ( this, function ( $ ) { // Pass global 'this' and jQuery instance

		// Define default options and a helper function for wrapping elements
		var defaults , wrap ;


		defaults = {
			wrapper   :   '<div class="sticky-wrapper" />'  , // HTML for the wrapping element
			stuckClass:   'stuck'                             // Class added when element is stuck
		} ;


		/**
		 * Helper function to wrap the target elements.
		 * @param {jQuery} $elements - The jQuery collection of elements to wrap.
		 * @param {object} options   - The options object containing the wrapper HTML.
		 * @returns {jQuery} The jQuery collection of the newly created wrapper elements.
		 */
		wrap = function ( $elements, options )
		{
			$elements.wrap ( options.wrapper ) ;
			return $elements.parent ( ) ;
		} ;


		// Extend jQuery Waypoints with a 'sticky' function
		$.waypoints ( 'extendFn', 'sticky', function ( opt ) {

			var $wrap, options, originalHandler;

			// Merge default options with user-provided options
			options = $.extend (
				{ } ,
				$.fn.waypoint.defaults ,
				defaults ,
				opt
			) ;

			// Wrap the elements and get a reference to the wrapper
			$wrap = wrap ( this, options );

			// Store the original handler if one was provided
			originalHandler = options.handler;

			// Override the handler to manage the 'stuck' state
			options.handler = function ( direction ) {

				var $sticky, shouldBeStuck;

				// Get the first child of the current element (the actual sticky element)
				$sticky = $ ( this ).children ( ':first' );

				// Determine if the element should be stuck based on scroll direction
				shouldBeStuck = direction === 'down' || direction === 'right';

				// Toggle the 'stuck' class
				$sticky.toggleClass ( options.stuckClass, shouldBeStuck );

				// Adjust the wrapper's height to prevent content jump
				$wrap.height ( shouldBeStuck ? $sticky.outerHeight ( ) : '' );

				// Call the original handler if it exists
				if ( originalHandler  !=  null )
				{
					return originalHandler.call ( this, direction );
				}

			} ; // End of custom handler

			// Initialize the Waypoint on the wrapper element
			$wrap.waypoint ( options );

			// Store the stuck class on the element's data for later unsticking
			return this.data ( 'stuckClass', options.stuckClass );

		} ) ; // End of sticky extendFn


		// Extend jQuery Waypoints with an 'unsticky' function
		return $.waypoints ( 'extendFn', 'unsticky', function ( ) {

			// Destroy the Waypoint on the parent wrapper
			this.parent ( ).waypoint ( 'destroy' );

			// Unwrap the element, removing the sticky wrapper
			this.unwrap ( );

			// Remove the 'stuck' class from the element
			return this.removeClass ( this.data ( 'stuckClass' ) );

		} ) ; // End of unsticky extendFn

	} ) ; // End of factory function

} ) .call ( this ) ; // Invoke the main IIFE with 'this' as context