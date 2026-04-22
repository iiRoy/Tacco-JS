/*******************************************************************************
 *  jQuery.print, version 1.0.3
 *
 *  (c) Sathvik Ponangi, Doers' Guild. All rights reserved.
 *
 *  Licence: CC-By (http://creativecommons.org/licenses/by/3.0/)
 *
 *  This script provides enhanced printing capabilities for jQuery elements.
 *  It supports printing specific elements, applying styles, and using iframes
 *  or new windows for the print operation.
 ******************************************************************************/

; (function ( $) {
    "use strict"; /* Enforce strict mode for cleaner code. */
    // This is the main closure for all our plugin definitions.

    /**
     * Helper function to convert a string into a valid jQuery object.
     * If the string is valid HTML, it's cloned. Otherwise, it's wrapped in a span.
     *
     * @param {string} string The input string to convert.
     * @returns {jQuery} A jQuery object representing the input.
     */
    function getjQueryObject ( string ) {
        // Initialize an empty jQuery object.
        var jqObj = $( "" );
        try {
            // Attempt to create a jQuery object from the string and clone it.
            jqObj = $( string ).clone();
        }
        catch ( e ) {
            // If an error occurs (e.g., malformed HTML), wrap it in a span.
            jqObj = $( "<span />" ).html( string );
        }
        // Return the resulting jQuery object.
        return jqObj;
    }

    /**
     * Checks if the given object is a DOM Node.
     * This is a cross-browser compatible way to check for Node type.
     *
     * @param {any} o The object to check.
     * @returns {boolean} True if the object is a Node, false otherwise.
     */
    function isNode ( o ) {
        /* This implementation is based on a StackOverflow answer:
         * http://stackoverflow.com/a/384380/937891
         */
        return !!( typeof Node === "object"
            ? o instanceof Node // For browsers that support Node constructor.
            : o && typeof o === "object" && typeof o.nodeType === "number" && typeof o.nodeName === "string" // Fallback for others.
        );
    }


    /*
     * Main plugin definition.
     * Assigns the print function to both $.print and $.fn.print.
     * This allows for both static calls ($.print()) and instance calls ($(selector).print()).
     */
    $.print = $.fn.print = function ( ) {
        // This function orchestrates the printing of a given set of elements.

        var options,
            $this,
            self = this; // Store reference to `this` context.

        // console.log("Printing", this, arguments); // Debugging line, often commented out in production.


        if ( self instanceof $ ) {
            // If 'self' is a jQuery object, extract the first DOM element.
            self = self.get( 0 );
        }

        if ( isNode( self ) ) {
            // Case 1: `this` is a direct HTML element (e.g., $(selector).print()).
            $this = $( self );
            if ( arguments.length > 0 ) {
                // If arguments are provided, the first one is considered options.
                options = arguments[ 0 ];
            }
        } else {
            // Case 2: Static call (e.g., $.print() or $.print(selector, options) or $.print(options)).
            if ( arguments.length > 0 ) {
                // Check if the first argument is a selector.
                $this = $( arguments[ 0 ] );
                if ( isNode( $this[ 0 ] ) ) {
                    // First argument is a selector/element, so second argument might be options.
                    if ( arguments.length > 1 ) {
                        options = arguments[ 1 ];
                    }
                } else {
                    // First argument is not a selector, so it must be the options object.
                    options = arguments[ 0 ];
                    $this = $( "html" ); // Default to printing the entire document.
                }
            } else {
                // No arguments provided, print the entire HTML document.
                $this = $( "html" );
            }
        }


        // Define default options for the printing operation.
        var defaults = {
            globalStyles : true,        // Include all global <style> and <link> stylesheets.
            mediaPrint : false,         // Only include <link media="print"> stylesheets.
            stylesheet : null,          // URL to an additional stylesheet to include.
            noPrintSelector : ".no-print", // Selector for elements to exclude from printing.
            iframe : true,              // Use an iframe for printing (recommended).
            append : null,              // HTML/text to append to the printed content.
            prepend : null              // HTML/text to prepend to the printed content.
        };

        // Merge default options with user-provided options.
        // The `options || {}` ensures that if options is undefined, an empty object is used.
        options = $.extend( { }, defaults, ( options || { } ) );

        var $styles = $( "" ); // Initialize an empty jQuery object for styles.

        if ( options.globalStyles ) {
            // Collect all <style>, <link>, <meta>, and <title> tags from the current document.
            // These are considered global styles/metadata.
            $styles = $( "style, link, meta, title" );
        } else if ( options.mediaPrint ) {
            // Alternatively, only collect <link> tags specifically for print media.
            $styles = $( "link[media=print]" );
        }

        if ( options.stylesheet ) {
            // If a custom stylesheet URL is provided, create a link tag for it
            // and merge it with the existing collected styles.
            $styles = $.merge( $styles, $( '<link rel="stylesheet" href="' + options.stylesheet + '">' ) );
        }

        // Create a deep copy of the element(s) to be printed.
        var copy = $this.clone();

        // Wrap the cloned content in a temporary span to easily manipulate its HTML.
        copy = $( "<span/>" ).append( copy );

        // Remove elements that are marked with the 'noPrintSelector' from the copy.
        copy.find( options.noPrintSelector ).remove();

        // Append the collected styles to the cloned content.
        copy.append( $styles.clone() );

        // Append any user-specified content.
        copy.append( getjQueryObject( options.append ) );

        // Prepend any user-specified content.
        copy.prepend( getjQueryObject( options.prepend ) );

        // Get the final HTML markup string of the content to be printed.
        var content = copy.html();

        // Destroy the temporary copy element to clean up memory.
        copy.remove();

        var w, wdoc; // Declare variables for the window/iframe and its document.

        if ( options.iframe ) {
            // Option 1: Use an iframe for printing. This is generally preferred for better control.
            try {
                var $iframe = $( options.iframe + "" ); // Try to find an existing iframe.
                var iframeCount = $iframe.length;

                if ( iframeCount === 0 ) {
                    // If no existing iframe is specified or found, create a new one.
                    $iframe = $( '<iframe height="0" width="0" border="0" wmode="Opaque"/>' )
                        .prependTo( 'body' ) // Add to the body.
                        .css( {
                            "position" : "absolute",
                            "top" : -999, // Position off-screen.
                            "left" : -999
                        } );
                }

                w = $iframe.get( 0 ); // Get the DOM element of the iframe.
                w = w.contentWindow || w.contentDocument || w; // Get the window object of the iframe.
                wdoc = w.document || w.contentDocument || w; // Get the document object of the iframe.

                wdoc.open(); // Open the iframe's document for writing.
                wdoc.write( content ); // Write the prepared HTML content into the iframe.
                wdoc.close(); // Close the document, forcing the browser to render it.

                // Use a timeout to ensure the iframe content is fully rendered before printing.
                setTimeout( function ( ) {
                    // Fix for IE: Allow it to render the iframe content.
                    w.focus(); // Focus the iframe window.
                    w.print(); // Trigger the print dialog.

                    setTimeout( function ( ) {
                        // Another timeout for IE cleanup.
                        if ( iframeCount === 0 ) {
                            // If we created the iframe, remove it after printing.
                            $iframe.remove();
                        }
                    }, 100 ); // Short delay for removal.
                }, 250 ); // Longer delay for rendering.

            } catch ( e ) {
                // If iframe method fails (e.g., security restrictions), fall back to pop-up.
                console.error( "Failed to print from iframe", e.stack, e.message );

                // Option 2 (Fallback): Use a new window for printing.
                w = window.open(); // Open a new browser window.
                w.document.write( content ); // Write content to the new window.
                w.document.close(); // Close the document.
                w.focus(); // Focus the new window.
                w.print(); // Trigger print dialog.
                w.close(); // Close the new window after printing.
            }
        } else {
            // Option 2 (Explicit): Use a new window for printing if iframe option is disabled.
            w = window.open(); // Open a new browser window.
            w.document.write( content ); // Write content to the new window.
            w.document.close(); // Close the document.
            w.focus(); // Focus the new window.
            w.print(); // Trigger print dialog.
            w.close(); // Close the new window after printing.
        }

        return this; // Return the original jQuery object for chainability.
    };

})( jQuery ); // Pass jQuery into the IIFE.