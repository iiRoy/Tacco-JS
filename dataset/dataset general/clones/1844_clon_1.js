/*******************************************************************************
 *
 * This is the Within Viewport jQuery Plugin.
 *
 * It acts as a helpful companion plugin for the core `withinViewport.js` utility.
 *
 * @file        within-viewport.jquery.js
 * @description Provides jQuery methods and custom selectors for viewport checks.
 * @author      Craig Patik <http://patik.com/>
 * @version     0.0.3 (Updated: 2014-03-03)
 * @license     MIT (See project repository for full license text)
 *
 ******************************************************************************/

( function ( $ ) {

    // Main plugin method for jQuery collections
    /**
     *  @function $.fn.withinViewport
     *  @description Checks if elements in a jQuery collection are within the viewport.
     *  @param  {Object|string} [settings] Optional settings object, or a string
     *                                      representing the 'sides' parameter (e.g., "top").
     *  @returns {jQuery} A new jQuery collection containing only elements that
     *                    are currently within the viewport based on the provided settings.
     */
    $.fn.withinViewport = function ( settings ) {
        // Normalize settings: if a string is passed, treat it as the 'sides' option.
        if ( typeof settings === "string" ) {

            settings = { sides: settings };
        }

        // Merge default options with user-provided settings.
        // The 'sides' option defaults to "all" if not specified.
        var opts = $.extend( {}, settings, { sides: "all" } ),
            // Initialize an array to hold elements found to be within the viewport.
            elems = [];

        // Iterate over each element in the current jQuery collection.
        this.each( function () {

            // Call the core `withinViewport` function (assumed to be globally available).
            if ( withinViewport( this, opts ) ) {
                // If the element is within the viewport, add it to our results array.
                elems.push( this );
            }
        } );

        // Return a new jQuery object containing the filtered elements.
        return $( elems );
    };


    // Register a custom jQuery selector for general viewport checking.
    $.extend( $.expr[ ":" ], {

        "within-viewport": function ( element ) {
            // This selector checks if an element is within the viewport from any side.
            return withinViewport( element, "all" );
        }
    } );


    /**
     * =========================================================================
     * Optional Enhancements and Shortcuts
     *
     * The following sections provide convenient shorthand methods and additional
     * custom selectors. You can uncomment or comment out these blocks based on
     * your project's specific requirements and coding style preferences.
     * =========================================================================
     */

    // Shorthand jQuery methods for specific sides.
    /* These methods allow developers to quickly check for visibility
       from a particular direction without passing a settings object. */

    $.fn.withinViewportTop = function ( settings ) {

        var opts;

        // Handle string-based settings for convenience.
        if ( typeof settings === "string" ) {
            settings = { sides: settings };
        }

        // Configure options to specifically check the 'top' side.
        opts = $.extend( {}, settings, { sides: "top" } ),
        elems = []; // Array to collect matching elements.

        this.each( function () {
            // Delegate the actual check to the core utility.
            if ( withinViewport( this, opts ) ) {
                elems.push( this );
            }
        } );

        return $( elems );
    };


    $.fn.withinViewportRight = function ( settings ) {

        var opts; // Declare options variable.

        if ( typeof settings === "string" ) {
            // Convert string to an object with 'sides' property.
            settings = { sides: settings };
        }

        opts = $.extend( {}, settings, { sides: "right" } ),
        elems = []; // Initialize an empty array for results.

        this.each( function () {
            if ( withinViewport( this, opts ) ) {
                elems.push( this );
            }
        } );

        // Return a new jQuery set.
        return $( elems );
    };


    $.fn.withinViewportBottom = function ( settings ) {

        var opts;

        if ( typeof settings === "string" ) {
            settings = { sides: settings };
        }

        opts = $.extend( {}, settings, { sides: "bottom" } ),
        elems = [];

        this.each( function () {
            // Perform the viewport check.
            if ( withinViewport( this, opts ) ) {
                elems.push( this );
            }
        } );

        return $( elems );
    };


    $.fn.withinViewportLeft = function ( settings ) {

        var opts;

        if ( typeof settings === "string" ) {
            settings = { sides: settings };
        }

        opts = $.extend( {}, settings, { sides: "left" } ),
        elems = [];

        this.each( function () {
            if ( withinViewport( this, opts ) ) {
                elems.push( this );
            }
        } );

        return $( elems );
    };


    // Additional custom jQuery selectors for specific viewport checks.
    $.extend( $.expr[ ":" ], {

        "within-viewport-top": function ( element ) {
            // Check if the element is visible from the top side.
            return withinViewport( element, "top" );
        },

        "within-viewport-right": function ( element ) {
            return withinViewport( element, "right" );
        },

        "within-viewport-bottom": function ( element ) {
            return withinViewport( element, "bottom" );
        },

        "within-viewport-left": function ( element ) {
            return withinViewport( element, "left" );
        }

        // Example custom selector (currently commented out)
        // , // Don't forget the comma for additional properties!
        // "within-viewport-top-left-45": function ( element ) {
        //     /* This demonstrates how to create a highly specific
        //      * selector with custom offsets for multiple sides. */
        //     return withinViewport( element, { sides: 'top left', top: 45, left: 45 } );
        // }

    } );


} ( jQuery ) ); // Immediately-invoked function expression (IIFE)