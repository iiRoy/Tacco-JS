/* This file contains utility functions and jQuery plugins.
 * It ensures console methods are available and provides text manipulation
 * and responsive typography functionalities.
 */

// This self-executing anonymous function ensures `console` methods
// are safely available across all browser environments.
// It prevents errors in older browsers that might not define `console` or its methods.
( function() {
    // Declare a variable to hold the current method name during iteration.
    var method;

    // A no-operation function, used as a placeholder for undefined console methods.
    var noop = function() {};

    // An array containing all standard console method names.
    var methods = [
        'assert',    'clear',        'count',       'debug',
        'dir',       'dirxml',       'error',       'exception',
        'group',     'groupCollapsed', 'groupEnd',  'info',
        'log',       'markTimeline', 'profile',     'profileEnd',
        'table',     'time',         'timeEnd',     'timeStamp',
        'trace',     'warn'
    ];

    // Get the total number of console methods.
    var length = methods.length;

    // Initialize `window.console` if it doesn't exist, then assign it to a local variable.
    var console = ( window.console = window.console || {} );

    // Loop through the methods array in reverse.
    // The `length--` decrements `length` and returns its original value before decrementing.
    while ( length-- ) {
        // Get the current method name.
        method = methods[ length ];

        // Check if the console object does NOT have the current method.
        // If it's missing, stub it with the noop function to prevent errors.
        if ( ! console[ method ] ) {
            console[ method ] = noop;
        }
    }
}() );


// jQuery/helper plugins are placed in this section.


/*
 * global jQuery: true
 *
 * Lettering.JS 0.6.1 - A micro-plugin for radical web typography.
 *
 * Copyright 2010, Dave Rupert (http://daverupert.com)
 * Released under the WTFPL license (http://sam.zoy.org/wtfpl/)
 *
 * Special thanks to Paul Irish (http://paulirish.com) for his valuable feedback.
 *
 * Date of creation/last modification: Mon Sep 20 17:14:00 2010 -0600
 */
( function ( $ ) {

	// The core injection logic for splitting text into spans.
	function injector( t, splitter, klass, after ) {
		// Retrieve the text content of the jQuery object.
		var text = t.text(),
			// Split the text based on the provided splitter.
			a = text.split( splitter ),
			// Initialize an empty string to build the injected HTML.
			inject = '';

		// Proceed only if there are parts after splitting.
		if ( a.length ) {
			// Iterate over each part of the split text.
			$( a ).each( function ( i, item ) {
				// Append a new span for each item, applying the class and an index.
				// aria-hidden is set to true as these are presentational spans.
				inject += '<span class="' + klass + ( i + 1 ) + '" aria-hidden="true">' + item + '</span>' + after;
			} );

			// Set the aria-label attribute on the original element for accessibility.
			t.attr( 'aria-label', text )
			 // Empty the original element's content.
			 .empty()
			 // Append the newly constructed HTML.
			 .append( inject );
		}
	}


	// Define the available methods for the Lettering.JS plugin.
	var methods = {
		// Default initialization method, splits into individual characters.
		init: function () {

			return this.each( function () {
				// Call the injector with empty splitter for characters.
				injector( $( this ), '', 'char', '' );
			} );

		},

		// Method to split text into words.
		words: function () {

			return this.each( function () {
				// Call the injector with a space as the splitter for words.
				injector( $( this ), ' ', 'word', ' ' );
			} );

		},

		// Method to split text into lines.
		lines: function () {

			return this.each( function () {
				// A unique string used to temporarily replace <br/> tags.
				var r = "eefec303079ad17405c889e092e105b0";
				// Explanation: It's notoriously difficult to consistently split text
				// by <br/> tags across different browsers (especially IE).
				// We replace all <br/> instances with a unique hash (MD5 of "split")
				// to create a consistent delimiter.
				// This unique string should not naturally occur in the text.
				injector( $( this ).children( "br" ).replaceWith( r ).end(), r, 'line', '' );
			} );

		}
	};

	// Extend jQuery's prototype with the `lettering` function.
	$.fn.lettering = function ( method ) {
		// Logic for calling different methods or the default `init`.
		if ( method && methods[ method ] ) {
			// If a specific method exists, call it.
			// `apply` is used to pass arguments array-like.
			return methods[ method ].apply( this, [].slice.call( arguments, 1 ) );
		} else if ( method === 'letters' || ! method ) {
			// If no method is specified or 'letters' is passed, default to `init`.
			// `slice(0)` is used to pass all arguments including the method name itself (which is ignored by init).
			return methods.init.apply( this, [].slice.call( arguments, 0 ) ); // Always pass an array of arguments.
		}
		// If an unknown method is called, throw an error.
		$.error( 'Method ' + method + ' does not exist on jQuery.lettering' );
		// Return `this` for chainability, even on error.
		return this;
	};

} )( jQuery );




/*
 * global jQuery: true
 *
 * FitText.js 1.1 - A jQuery plugin for inflating web type.
 *
 * Copyright 2011, Dave Rupert (http://daverupert.com)
 * Released under the WTFPL license (http://sam.zoy.org/wtfpl/)
 *
 * Date of creation/last modification: Thu May 05 14:23:00 2011 -0600
 */

( function ( $ ) {

  // Extend jQuery's prototype with the `fitText` function.
  $.fn.fitText = function ( kompressor, options ) {

    // Set up default options and merge with provided ones.
    var compressor = kompressor || 1, // Default compressor value is 1.
        settings = $.extend( {
          'minFontSize' : Number.NEGATIVE_INFINITY, // No minimum font size by default.
          'maxFontSize' : Number.POSITIVE_INFINITY  // No maximum font size by default.
        }, options );

    // Iterate over each selected element to apply FitText.
    return this.each( function () {

      // Cache the current jQuery object for performance.
      var $this = $( this );

      // The core resizing function.
      // It calculates font size based on the element's width and compressor value.
      var resizer = function () {
        $this.css( 'font-size', Math.max( Math.min( $this.width() / ( compressor * 10 ), parseFloat( settings.maxFontSize ) ), parseFloat( settings.minFontSize ) ) );
      };

      // Call the resizer function immediately to set the initial font size.
      resizer();

      // Attach the resizer function to the window's resize event.
      // Opera debounces its resize event by default, which is good practice.
      $( window ).on( 'resize', resizer );

    } );

  };

} )( jQuery );