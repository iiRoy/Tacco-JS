/*
 *  Font UnStack 0.1 - A jQuery Plugin
 *
 *  Developed by Phil Oye
 *  Copyright (c) 2009 Phil Oye, http://philoye.com/
 *
 *  Licensed under the MIT license:
 *  http://www.opensource.org/licenses/mit-license.php
 *
 *  This file is a Type I clone, meaning only whitespace and comments have been altered.
 */


(   function ( $ ) {

    // Define the jQuery plugin method `fontunstack`
    $.fn.fontunstack = function ( opts ) {
        $.fontunstack.init( opts, this ); // Initialize the plugin
        return this; // Return `this` for chaining
    };


    // Define the core `fontunstack` object with its methods and properties
    $.fontunstack = {

        // Default options for the plugin
        options: {
            prefix: "set_in_" // Prefix for the CSS class added to elements
        },

        // Initialization method
        init: function ( opts, elems ) {
            var elems = elems || "body"; // Use 'body' as default if no elements are provided
            $.extend( this.options, opts ); // Merge user-provided options with defaults

            // Ensure the prefix is not empty; revert to default if it is
            if ( this.options.prefix == "" ) {
                this.options.prefix = "set_in_";
            }

            // Retrieve the font-family stack from the selected elements
            var stack = $( elems ).css( 'font-family' );

            // If a CSS-style font-family declaration (string) is passed in, convert it to an array
            if ( typeof stack == "string" ) {
                stack = stack.match( /[^'",;\s][^'",;]*/g ) || []; // Parse font names
            }

            // Proceed to analyze the font stack
            this.analyzeStack( stack, elems );
        },

        // Analyzes the font stack to determine the first available font
        analyzeStack: function ( stack, elems ) {
            var generics = [ "monospace", "sans-serif", "serif", "cursive", "fantasy" ]; // List of generic font families
            var baseline = generics[ 0 ]; // Our initial baseline generic font
            var num_fonts = stack.length; // Total number of fonts in the stack
            var last_resort = stack[ num_fonts - 1 ]; // The last font in the stack

            // If the author hasn't included a generic font (which is bad practice), let's add one
            if ( $.inArray( last_resort, generics ) == -1 ) { // Check if the last font is NOT generic
                stack.push( baseline ); // Add our baseline generic
                num_fonts++; // Increment font count
            }

            // If the last generic is the same as our baseline, let's use another generic for testing
            if ( last_resort == baseline ) {
                baseline = generics[ 1 ]; // Switch to the next generic
            }

            // At this point, we're sure there is a generic fallback font.
            // We'll only iterate through the non-generic fonts to find a match.
            for ( var i = 0; i < num_fonts - 1; i++ ) {
                font = stack[ i ]; // Current font in the stack

                if ( $.fontunstack.testFont( font, baseline ) ) {

                    // Remove any existing class that has our prefix to prevent duplicates
                    var re = new RegExp( "\\b" + this.options.prefix + ".*?\\b", "g" );
                    $( elems ).get( 0 ).className = $( elems ).get( 0 ).className.replace( re, "" );

                    // This converts the font name to a safe, lowercase, ANSI-like string,
                    // suitable for a CSS class name.
                    // It removes spaces, punctuation, and handles URL encoding for safety.
                    safe_font_name = encodeURIComponent( font.replace( /[\s\-.!~*'()"]/g, "" ).toLowerCase() );
                    $( elems ).addClass( this.options.prefix + safe_font_name ); // Add the determined font class

                    break; // We only want to find one installed font per stack, so we exit the loop
                }
            }
        },

        // Tests if a requested font is installed on the user's system
        testFont: function ( requested_font, baseline_font ) {
            // Create a hidden span element for font testing
            var span = $( '<span id="font_tester" style="font-family:' + baseline_font + '; font-size:144px;position:absolute;left:-10000px;top:-10000px;visibility:hidden;">mmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmml</span>' );
            $( "body" ).prepend( span ); // Append the span to the body

            var baseline_width = span.width(); // Get the width with the baseline font
            span.css( "font-family", requested_font + "," + baseline_font ); // Apply the requested font
            var requested_width = span.width(); // Get the width with the requested font
            span.remove(); // Clean up: remove the testing span

            // If the width changes, it means the requested font is installed
            return ( requested_width != baseline_width );
        }

    };

})( jQuery ); // Pass jQuery into the immediately invoked function expression