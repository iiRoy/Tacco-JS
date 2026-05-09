// This JavaScript file contains the core logic for the jQuery.print plugin.
// It enables printing specific DOM elements or the entire document.
//
// @license
// jQuery.print, version 1.3.1
// Developed by Sathvik Ponangi, part of Doers' Guild.
//
// This software is licensed under the Creative Commons Attribution 3.0 License (CC-By).
// For more details, please visit: http://creativecommons.org/licenses/by/3.0/
//
// All rights reserved by Sathvik Ponangi and Doers' Guild.
//--------------------------------------------------------------------------------------------------


( function ( $ ) {

    "use strict"; // Enforce strict mode for cleaner, safer code execution.


    /**
     * Converts a given string into a valid jQuery object for manipulation.
     * If the string represents valid HTML, it's cloned. Otherwise, it's wrapped in a span.
     *
     * @param {string} string - The input string, potentially HTML.
     * @returns {jQuery} A jQuery object representing the input string.
     */
    function getjQueryObject ( string ) {

        // Initialize an empty jQuery object.
        var jqObj = $( "" );

        try {
            // Attempt to create a jQuery object from the string and clone it.
            // This handles cases where 'string' is valid HTML.
            jqObj = $( string )
                        .clone();
        }
        catch ( e ) {
            // If parsing as HTML fails (e.g., it's just plain text),
            // wrap the string in a new span element.
            jqObj = $( "<span />" )
                        .html( string );
        }

        // Return the resulting jQuery object.
        return jqObj;

    } // End of getjQueryObject function.


    /**
     * Handles the actual printing of content within a specified window or iframe.
     * Includes workarounds for various browser-specific printing quirks.
     *
     * @param {Window} frameWindow - The target window/iframe to print.
     * @returns {jQuery.Deferred} A Deferred object that resolves upon successful printing.
     */
    function printFrame ( frameWindow ) {

        // Create a new Deferred object to manage asynchronous operations.
        var def = $.Deferred();

        try {
            // Use setTimeout to allow the browser to fully render the iframe content
            // before attempting to print, especially important for IE.
            setTimeout( function () {

                // Bring the frame window into focus to ensure print dialog appears correctly.
                frameWindow.focus();

                try {
                    // Attempt to use document.execCommand('print').
                    // This is a known workaround for IE11 which sometimes prints the whole page
                    // instead of just the iframe content when print() is called directly.
                    if ( ! frameWindow.document.execCommand( 'print', false, null ) ) {
                        // If execCommand returns false, it indicates failure (e.g., not supported, or permissions).
                        // In such cases, fall back to the standard print() method.
                        // Reference: http://stackoverflow.com/a/21336448/937891
                        frameWindow.print();
                    }
                }
                catch ( e ) {
                    // If execCommand throws an error, proceed with the standard print() method.
                    frameWindow.print();
                }

                // Close the print window/frame after printing is initiated.
                frameWindow.close();

                // Resolve the Deferred object, indicating successful completion.
                def.resolve();

            }, 250 ); // A small delay (250ms) to ensure rendering.
        }
        catch ( err ) {
            // If any error occurs during the print initiation process, reject the Deferred.
            def.reject( err );
        }

        // Return the Deferred object.
        return def;

    } // End of printFrame function.


    /**
     * Opens a new browser window, writes content into it, and then initiates printing.
     * This is typically used as a fallback or for simple printing scenarios.
     *
     * @param {string} content - The HTML content to be printed.
     * @returns {jQuery.Deferred} A Deferred object from the printFrame function.
     */
    function printContentInNewWindow ( content ) {

        // Open a new, blank browser window.
        var w = window.open();

        // Write the provided HTML content into the new window's document.
        w.document.write( content );

        // Close the document stream to ensure all content is rendered.
        w.document.close();

        // Pass the new window to the printFrame function to handle printing.
        return printFrame( w );

    } // End of printContentInNewWindow function.


    /**
     * Checks if a given object is a DOM Node.
     *
     * @param {any} o - The object to check.
     * @returns {boolean} True if the object is a Node, false otherwise.
     * @see http://stackoverflow.com/a/384380/937891
     */
    function isNode ( o ) {

        // The check varies based on browser environment and Node availability.
        // Modern browsers: check if 'o' is an instance of Node.
        // Older browsers/environments: check for object type, nodeType (number), and nodeName (string).
        return !! ( typeof Node === "object" ? o instanceof Node : o && typeof o === "object" && typeof o.nodeType === "number" && typeof o.nodeName === "string" );

    } // End of isNode function.


    // Extend jQuery to add the .print() method and a global $.print() function.
    $.print = $.fn.print = function () {

        // Declare variables for options, jQuery object of the element to print, and 'this' context.
        var options,
            $this,
            self = this;

        // console.log("Printing", this, arguments); // Debugging line, commented out.

        // Determine the context of 'self'. If 'self' is a jQuery object,
        // extract the underlying DOM element for further processing.
        if ( self instanceof $ ) {
            self = self.get( 0 );
        }

        // --- Argument Parsing Logic ---

        // Case 1: $(selector).print() or $(element).print()
        if ( isNode( self ) ) {
            // If 'self' is a valid HTML element (e.g., from a jQuery selection like `$('#myDiv').print()`).
            $this = $( self ); // The element to print is 'self'.

            // Check if options were passed as the first argument.
            if ( arguments.length > 0 ) {
                options = arguments[ 0 ];
            }
        }
        // Case 2: $.print(selector, options), $.print(options), or $.print()
        else {
            if ( arguments.length > 0 ) {
                // If there are arguments, determine if the first is a selector or options.

                // Attempt to interpret the first argument as a selector.
                $this = $( arguments[ 0 ] );

                if ( isNode( $this[ 0 ] ) ) {
                    // If the first argument successfully resolved to a DOM node (i.e., it was a selector).
                    // Check if options were passed as the second argument.
                    if ( arguments.length > 1 ) {
                        options = arguments[ 1 ];
                    }
                } else {
                    // If the first argument was NOT a valid selector, it must be the options object.
                    options = arguments[ 0 ];
                    $this = $( "html" ); // Default to printing the entire HTML document.
                }
            } else {
                // No arguments provided (e.g., $.print()), so print the entire HTML document.
                $this = $( "html" );
            }
        }

        // --- Default Options Configuration ---

        // Define the default settings for the print operation.
        var defaults = {
            globalStyles: true,             // Include all <style> and <link> elements from the head.
            mediaPrint: false,              // Only include <link media="print"> stylesheets.
            stylesheet: null,               // URL to an additional stylesheet to include.
            noPrintSelector: ".no-print",   // Selector for elements that should be excluded from printing.
            iframe: true,                   // Use an iframe for printing (generally more reliable).
            append: null,                   // HTML content to append to the printed content.
            prepend: null,                  // HTML content to prepend to the printed content.
            manuallyCopyFormValues: true,   // Copy form field values into their HTML attributes before printing.
            deferred: $.Deferred()          // A Deferred object to track the printing process.
        };

        // Merge the default options with any user-provided options.
        // `(options || {})` ensures that an empty object is used if 'options' is undefined.
        options = $.extend( {}, defaults, ( options || {} ) );


        // --- Style Sheet Collection ---

        var $styles = $( "" ); // Initialize an empty jQuery object for styles.

        if ( options.globalStyles ) {
            // If 'globalStyles' is true, collect all <style>, <link>, <meta>, and <title> tags.
            // These are typically found in the document's head and define the page's overall styling.
            $styles = $( "style, link, meta, title" );
        } else if ( options.mediaPrint ) {
            // If 'mediaPrint' is true, specifically target <link> elements with media="print" attribute.
            // These stylesheets are designed for print output.
            $styles = $( "link[media=print]" );
        }

        // If a custom stylesheet URL is provided, create a new <link> element for it.
        if ( options.stylesheet ) {
            // Use $.merge to combine the collected styles with the new custom stylesheet link.
            $styles = $.merge( $styles, $( '<link rel="stylesheet" href="' + options.stylesheet + '">' ) );
        }


        // --- Content Preparation ---

        // Create a deep clone of the element(s) selected for printing.
        // This prevents modifications to the original DOM structure.
        var copy = $this.clone();

        // Wrap the cloned content within a new <span> element.
        // This ensures we can easily get the full HTML markup string, including the outer element.
        copy = $( "<span/>" )
            .append( copy );

        // Remove any elements that match the 'noPrintSelector' from the cloned content.
        // This allows developers to mark certain parts of the page as non-printable.
        copy.find( options.noPrintSelector )
            .remove();

        // Append the collected stylesheets to the cloned content.
        // Cloning the styles ensures they are independent copies.
        copy.append( $styles.clone() );

        // Append any user-specified HTML content.
        copy.append( getjQueryObject( options.append ) );

        // Prepend any user-specified HTML content.
        copy.prepend( getjQueryObject( options.prepend ) );


        // --- Form Value Copying (Important for User Input) ---

        if ( options.manuallyCopyFormValues ) {
            // This feature addresses a common issue where user-modified input field values
            // (e.g., text entered into a textarea) are not always reflected in the printed output
            // if they haven't been explicitly saved back to the 'value' attribute or DOM.
            // Reference: http://stackoverflow.com/a/26707753

            copy.find( "input, select, textarea" )
                .each( function () {
                    var $field = $( this ); // Current form field.

                    // Handle radio buttons and checkboxes.
                    if ( $field.is( "[type='radio']" ) || $field.is( "[type='checkbox']" ) ) {
                        if ( $field.prop( "checked" ) ) {
                            // If checked, set the 'checked' attribute to ensure it appears checked in print.
                            $field.attr( "checked", "checked" );
                        }
                    }
                    // Handle select (dropdown) elements.
                    else if ( $field.is( "select" ) ) {
                        // Find the currently selected option and set its 'selected' attribute.
                        $field.find( ":selected" )
                            .attr( "selected", "selected" );
                    }
                    // Handle other input types (text, number, textarea, etc.).
                    else {
                        // Copy the current value of the field into its 'value' attribute.
                        $field.attr( "value", $field.val() );
                    }
                } );
        }


        // Extract the final HTML markup string from the prepared copy.
        var content = copy.html();

        // --- Deferred Notification ---

        // Notify the Deferred object with the generated markup and the cloned elements.
        // This can be useful for debugging, logging, or extending functionality.
        try {
            options.deferred.notify( 'generated_markup', content, copy );
        }
        catch ( err ) {
            console.warn( 'Error notifying deferred object during markup generation:', err );
        }

        // --- Cleanup ---

        // Remove the temporary copy from the DOM to prevent memory leaks.
        copy.remove();


        // --- Printing Mechanism Selection (Iframe vs. New Window) ---

        if ( options.iframe ) {
            // If 'iframe' option is true, attempt to use an iframe for printing.
            // This method is generally preferred for better control and less disruption to the main page.
            try {
                // Try to find an existing iframe specified by `options.iframe` (if it's a selector string).
                var $iframe = $( options.iframe + "" );
                var iframeCount = $iframe.length;

                if ( iframeCount === 0 ) {
                    // If no existing iframe was found (or options.iframe was true), create a new, hidden iframe.
                    $iframe = $( '<iframe height="0" width="0" border="0" wmode="Opaque"/>' )
                        .prependTo( 'body' ) // Add the iframe to the beginning of the body.
                        .css( {
                            "position": "absolute",
                            "top": -999, // Position it off-screen.
                            "left": -999 // Position it off-screen.
                        } );
                }

                // Get references to the iframe's window and document objects.
                var w, wdoc;
                w = $iframe.get( 0 ); // Get the raw DOM element of the iframe.
                w = w.contentWindow || w.contentDocument || w; // Get the window object.
                wdoc = w.document || w.contentDocument || w; // Get the document object.

                // Open the iframe's document stream, write the content, and then close it.
                // This prepares the iframe for printing.
                wdoc.open();
                wdoc.write( content );
                wdoc.close();

                // Call printFrame to initiate the print operation on the iframe.
                printFrame( w )
                    .done( function () {
                        // Success callback: Executed if printFrame resolves successfully.
                        // Use a short timeout to allow IE to finish its printing process.
                        setTimeout( function () {
                            if ( iframeCount === 0 ) {
                                // If the iframe was created by this plugin, remove it after printing.
                                $iframe.remove();
                            }
                        }, 100 ); // Small delay.
                    } )
                    .fail( function ( err ) {
                        // Failure callback: If printing from iframe fails for any reason.
                        console.error( "Failed to print from iframe, falling back to new window method:", err );
                        // Fallback to opening a new window for printing.
                        printContentInNewWindow( content );
                    } )
                    .always( function () {
                        // Always callback: Executed regardless of success or failure.
                        // Resolve the main Deferred object of the print plugin.
                        try {
                            options.deferred.resolve();
                        }
                        catch ( err ) {
                            console.warn( 'Error notifying deferred object during iframe print "always" handler:', err );
                        }
                    } );
            }
            catch ( e ) {
                // If an error occurs during the iframe creation or manipulation process.
                console.error( "Failed to print from iframe due to an error, falling back to new window method:", e.stack, e.message );
                // Fallback to opening a new window for printing.
                printContentInNewWindow( content )
                    .always( function () {
                        // Resolve the main Deferred object after the fallback print completes.
                        try {
                            options.deferred.resolve();
                        }
                        catch ( err ) {
                            console.warn( 'Error notifying deferred object during new window print fallback "always" handler:', err );
                        }
                    } );
            }
        }
        else {
            // If 'iframe' option is false, or iframe method is explicitly not used,
            // open a new browser window for printing.
            printContentInNewWindow( content )
                .always( function () {
                    // Resolve the main Deferred object once printing in the new window is initiated.
                    try {
                        options.deferred.resolve();
                    }
                    catch ( err ) {
                        console.warn( 'Error notifying deferred object during new window print "always" handler:', err );
                    }
                } );
        }

        // Return the original jQuery object to maintain chainability.
        return this;

    }; // End of $.print and $.fn.print function definition.

} )( jQuery ); // Immediately-invoked function expression (IIFE) to encapsulate the plugin.