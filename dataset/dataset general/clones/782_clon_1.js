( function ( debug , $ ) {
    'use strict' ;

    // Configuration object for the debug module.
    // Contains various settings and utility functions.
    debug . config = {
        baselineAdjust : -8 , // Adjustment value for the baseline display.

        /**
         * Retrieves the font size of a given element.
         * @param {HTMLElement} element - The DOM element to query.
         * @returns {number} The font size in pixels.
         */
        fontSize : function ( element ) {
            return parseInt( $ ( element ) . css( 'font-size' ) . replace( 'px' , '' ) , 10 ) ;
        } ,

        /**
         * Calculates the effective line height based on body's line-height or font size.
         * @returns {number} The line height in pixels.
         */
        lineHeight : function ( ) {
            var value = $ ( 'body' ) . css( 'line-height' ) ;
            // If line-height is specified in 'px', use it. Otherwise, calculate based on font size.
            return ( value . indexOf( 'px' ) > -1 ) ? value . replace( 'px' , '' ) : value * debug . config . fontSize( 'html' ) ;
        }
    } ;


    /**
     * Builds and appends the debug panel to the body.
     * This panel contains various buttons for toggling debug features.
     */
    debug . buildPanel = function ( ) {
        // Construct the HTML for the debug panel.
        $ ( '<div id="debug-panel">' +
            '<button class="debug-cog">Debug</button>' +
            '<ul>' +
            '<li><button data-option="boxes">Highlight regions</button></li>' +
            '<li><button data-option="baseline">Show baseline</button></li>' +
            '<li><button data-option="grid">Show grid</button></li>' +
            '<li><button data-option="viewportSize">Viewport size</button></li>' +
            '<li>' +
                '<button data-option="viewportSummary">Viewport summary</button>' +
                '<button class="position" data-position="1">Position</button>' +
            '</li>' +
            '<li><button data-option="visualize">Visualize breakpoints</button></li>' +
            '</ul>' +
            '</div>' ) . appendTo( 'body' ) ;

        // Cache the newly created panel element.
        var $panel = $ ( '#debug-panel' ) ;

        // Initialize button functionalities.
        debug . buildButtons . options( $panel ) ;
        debug . buildButtons . view( $panel ) ;
    } ;


    // Object containing methods for building and managing panel buttons.
    debug . buildButtons = {

        /**
         * Initializes the functionality for option-toggling buttons.
         * @param {jQuery} $panel - The jQuery object representing the debug panel.
         */
        options : function ( $panel ) {
            // Find all buttons with a 'data-option' attribute.
            var $optionButtons = $panel . find( '[data-option]' ) ,
                optionsArray = [ ] ; // Array to store the names of options.

            // Populate optionsArray with data-option values.
            $ . each( $optionButtons , function ( index , value ) {
                optionsArray . push( $ ( value ) . attr( 'data-option' ) ) ;
            } ) ;

            /* This section handles the click events for the option buttons */
            $optionButtons . on( 'click' , function ( ) {
                var $input = $ ( this ) ,
                    $option = $input . attr( 'data-option' ) ;

                // Check if the option is currently 'on'.
                if ( $input . hasClass( 'on' ) ) {
                    debug[ $option ] . off( ) ; // Turn the debug feature off.
                    $input . removeClass( 'on' ) ; // Remove the 'on' class from the button.

                    // If localStorage is available, remove the stored state.
                    if ( window . localStorage ) {
                        localStorage . removeItem( 'debug-' + $option ) ;
                    }
                } else {
                    debug[ $option ] . on( ) ; // Turn the debug feature on.
                    $input . addClass( 'on' ) ; // Add the 'on' class to the button.

                    // If localStorage is available, store the 'on' state.
                    if ( window . localStorage ) {
                        localStorage . setItem( 'debug-' + $option , true ) ;
                    }
                }
            } ) ;

            // Restore previously set options from localStorage on page load.
            if ( window . localStorage ) {
                $ . each( optionsArray , function ( index , value ) {
                    if ( localStorage . getItem( 'debug-' + value ) === 'true' ) {
                        // Trigger a click event to activate the option.
                        $optionButtons . filter( '[data-option="' + value + '"]' ) . trigger( 'click' ) ;
                    }
                } ) ;
            }
        } , // End of options function.

        /**
         * Initializes the functionality for opening and closing the debug panel itself.
         * @param {jQuery} $panel - The jQuery object representing the debug panel.
         */
        view : function ( $panel ) {
            var $button = $panel . children( 'button' ) , // The main "Debug" button.

                // Function to close the panel.
                closePanel = function ( ) {
                    $panel . removeClass( 'open' ) ;
                    $ ( document ) . off( 'click.debugPanel' ) ; // Remove the global click handler.
                } ,

                // Function to open the panel.
                openPanel = function ( ) {
                    $panel . addClass( 'open' ) ;

                    // Add a global click handler to close the panel if clicked outside.
                    $ ( document ) . on( 'click.debugPanel' , function ( e ) {
                        if ( $ ( e . target ) . parents( ) . filter( $panel ) . length !== 1 ) {
                            closePanel( ) ;
                        }
                    } ) ;
                } ;

            // Attach click handler to the main "Debug" button.
            $button . on( 'click' , function ( ) {
                if ( $panel . hasClass( 'open' ) ) {
                    closePanel( ) ;
                } else {
                    openPanel( ) ;
                }

                return false ; // Prevent default button action.
            } ) ;
        } // End of view function.
    } ;


    // Module for baseline visualization.
    debug . baseline = {

        /**
         * Turns off the baseline display.
         */
        off : function ( ) {
            $ ( '#debug-baseline' ) . remove( ) ;
        } ,

        /**
         * Turns on the baseline display.
         * Creates an ordered list of lines to represent the baseline grid.
         */
        on : function ( ) {
            var config = debug . config ,
                baselineHeight = ( config . lineHeight( ) - 1 ) / config . fontSize( 'body' ) , // Calculate line height in 'em'.
                baselineLength = $ ( document ) . height( ) / config . lineHeight( ) , // Number of baseline lines needed.
                i ,
                output = [ ] ; // Array to build the HTML string.

            // Generate list items for each baseline.
            for ( i = 0 ; i <= baselineLength ; i += 1 ) {
                output . push( '<li style="height:' + baselineHeight + 'em"></li>' ) ;
            }

            // Append the baseline grid to the body.
            $ ( 'body' ) . append( '<ol id="debug-baseline" style="top:' + config . baselineAdjust + 'px">' + output . join( '' ) + '</ol>' ) ;
        }
    } ;


    // Module for highlighting regions with boxes.
    debug . boxes = {

        /**
         * Turns off region highlighting.
         * Removes debug classes and elements.
         */
        off : function ( ) {
            $ ( 'html' ) . removeClass( 'debug' ) ; // Remove global debug class.

            $ ( '.debug-number' ) . remove( ) ; // Remove numbering elements.

            // Unwrap and remove debug boxes.
            $ . each( $ ( '.debug-box' ) , function ( index , value ) {
                var $debugBox = $ ( value ) ;
                $debugBox . contents( ) . appendTo( $debugBox . parent( ) ) ; // Move contents out of the box.
                $debugBox . remove( ) ; // Remove the box itself.
            } ) ;
        } ,

        /**
         * Turns on region highlighting.
         * Wraps regions with debug boxes and adds numbers.
         */
        on : function ( ) {
            $ ( 'html' ) . addClass( 'debug' ) ; // Add global debug class.

            // Find all elements with class 'region' that are not part of the grid or nested regions.
            $ . each( $ ( '.region' ) . not( '#debug-grid .region, .region .region' ) , function ( index , value ) {
                $ ( value )
                    . wrapInner( '<div class="debug-box"></div>' ) // Wrap content in a debug box.
                    . find( '.debug-box' ) . append( '<div class="debug-number">' + ( index + 1 ) + '</div>' ) ; // Add a number.
            } ) ;
        }
    } ;


    /**
     * Calculates pixel values from CSS query strings.
     * Supports 'em' and 'px' units for 'min-width' or 'min-height'.
     * @param {string} query - The CSS media query string.
     * @param {string} property - The CSS property to extract (e.g., 'min-width').
     * @returns {number|boolean} The calculated pixel value, or false if not found.
     */
    debug . calculatePixels = function ( query , property ) {
        var value ;

        // Check if the query contains the specified property.
        if ( query . indexOf( property ) > 0 ) {
            value = query . replace( '(' + property + ':' , '' ) ; // Extract the value part.

            // Handle 'em' units.
            if ( query . indexOf( 'em' ) > 0 ) {
                value = Math . round( value . replace( 'em)' , '' ) * debug . config . fontSize( 'html' ) * 100000 ) / 100000 ;
            }

            // Handle 'px' units.
            if ( query . indexOf( 'px' ) > 0 ) {
                value = value . replace( 'px)' , '' ) ;
            }
        }

        return value ? value : false ; // Return value or false.
    } ;


    // Module for grid visualization.
    debug . grid = {

        /**
         * Turns off the grid display.
         */
        off : function ( ) {
            $ ( '#debug-grid' ) . remove( ) ;
        } ,

        /**
         * Turns on the grid display.
         * Appends a simple grid structure to the body.
         */
        on : function ( ) {
            var i ,
                grid = '<div id="debug-grid"><div class="fields">' ;

            // Create 17 grid regions.
            for ( i = 0 ; i <= 16 ; i += 1 ) {
                grid += '<div class="region"></div>' ;
            }

            grid += '</div></div>' ;

            $ ( 'body' ) . append( grid ) ;
        }
    } ;


    // Module for displaying viewport size.
    debug . viewportSize = {

        /**
         * Turns off the viewport size display.
         */
        off : function ( ) {
            $ ( '#debug-viewport-size' ) . remove( ) ;
        } ,

        /**
         * Turns on the viewport size display.
         * Displays current viewport width, height, and device pixel ratio.
         */
        on : function ( ) {
            $ ( 'body' ) . append( '<div id="debug-viewport-size"></div>' ) ;

            var $debugViewportSize = $ ( '#debug-viewport-size' ) ,

                // Function to update the displayed size.
                updateSize = function ( ) {
                    $debugViewportSize . html(
                        debug . viewportWidth( ) + ' &times; ' + debug . viewportHeight( ) + ' / ' +
                        ( window . devicePixelRatio ? ( Math . round( window . devicePixelRatio * 100000 ) / 100000 ) : '?' )
                    ) ;
                } ;

            updateSize( ) ; // Initial update.
            $ ( window ) . resize( updateSize ) ; // Update on window resize.
        }
    } ;


    // Module for viewport summary (active media queries).
    debug . viewportSummary = {

        /**
         * Turns off the viewport summary display.
         */
        off : function ( ) {
            $ ( '#debug-viewport-summary' ) . remove( ) ;
        } ,

        /**
         * Turns on the viewport summary display.
         * Shows a table of media queries and highlights active ones.
         */
        on : function ( ) {
            $ ( 'body' ) . append( '<div id="debug-viewport-summary"></div>' ) ;

            var $debugViewportSummary = $ ( '#debug-viewport-summary' ) ,
                content = '' ,
                mediaQueries = frwd . mediaQueries , // Assuming 'frwd' is available globally.

                // Function to update the active state of media queries.
                updateSize = function ( ) {
                    $ . each( mediaQueries , function ( index , value ) {
                        var result = frwd . matchViewport( index ) ;
                        $debugViewportSummary . find( '.' + index ) . removeClass( '' + !result ) . addClass( '' + result ) ;
                    } ) ;
                } ;

            // Build the table header for non-active queries.
            content += '<table>' +
                '<tr class="none true">' +
                    '<th>none</th>' +
                    '<td colspan="3">no active media queries</td>' +
                '</tr>' ;

            // Iterate through media queries to build table rows.
            $ . each( mediaQueries , function ( index , value ) {
                var query = value . query ,
                    pixels = debug . calculatePixels( query , 'min-width' ) || debug . calculatePixels( query , 'min-height' ) ;

                content += '<tr class="' + index + '">' +
                        '<th>' + index + '</th>' +
                        '<td>' + query + '</td>' +
                        '<td>' + ( pixels ? pixels + 'px' : '' ) + '</td>' +
                    '</tr>' ;
            } ) ;

            content += '</table>' ;

            $debugViewportSummary . html( content ) ; // Set the HTML content.

            updateSize( ) ; // Initial update.
            $ ( window ) . resize( updateSize ) ; // Update on window resize.
            debug . viewportSummary . position . init( ) ; // Initialize position functionality.
            debug . viewportSummary . minimize . init( ) ; // Initialize minimize functionality.
        } , // End of viewportSummary.on

        // Sub-module for minimizing the viewport summary.
        minimize : {
            /**
             * Attaches click handler for minimizing/restoring the summary.
             */
            click : function ( ) {
                // Selector for the summary panel.
                $ ( '#debug-viewport-summary' ) . on( 'click' , function ( ) {
                    // Toggle minimize state based on current class.
                    debug . viewportSummary . minimize[ ( $ ( this ) . hasClass( 'minimized' ) ) ? 'off' : 'on' ]( ) ;
                    return false ; // Prevent default action.
                } ) ;
            } ,

            /**
             * Initializes the minimize functionality, restoring state from localStorage.
             */
            init : function ( ) {
                if ( window . localStorage && localStorage . getItem( 'debug-minimized' ) ) {
                    debug . viewportSummary . minimize[ localStorage . getItem( 'debug-minimized' ) ]( ) ;
                }

                debug . viewportSummary . minimize . click( ) ; // Set up the click handler.
            } ,

            /**
             * Turns off minimized state for the summary panel.
             */
            off : function ( ) {
                // Selector for the summary panel.
                $ ( '#debug-viewport-summary' ) . removeClass( 'minimized' ) ;

                if ( window . localStorage ) {
                    localStorage . setItem( 'debug-minimized' , 'off' ) ;
                }
            } ,

            /**
             * Turns on minimized state for the summary panel.
             */
            on : function ( ) {
                // Selector for the summary panel.
                $ ( '#debug-viewport-summary' ) . addClass( 'minimized' ) ;

                if ( window . localStorage ) {
                    localStorage . setItem( 'debug-minimized' , 'on' ) ;
                }
            }
        } , // End of minimize sub-module.

        // Sub-module for positioning the viewport summary.
        position : {
            /**
             * Attaches click handler for changing the position of the summary.
             */
            click : function ( ) {
                $ ( '#debug-panel' ) . find( '.position' ) . off( 'click' ) . on( 'click' , function ( ) {
                    var current = $ ( this ) . attr( 'data-position' ) ,
                        next = parseInt( current , 10 ) + 1 ;

                    if ( next > 4 ) {
                        next = 1 ; // Cycle positions from 1 to 4.
                    }

                    debug . viewportSummary . position . move( next ) ; // Apply the new position.

                    if ( window . localStorage ) {
                        localStorage . setItem( 'debug-position' , next ) ; // Store position in localStorage.
                    }
                } ) ;
            } ,

            /**
             * Initializes the position functionality, restoring state from localStorage.
             */
            init : function ( ) {
                if ( window . localStorage && localStorage . getItem( 'debug-position' ) ) {
                    debug . viewportSummary . position . move( localStorage . getItem( 'debug-position' ) ) ;
                }

                debug . viewportSummary . position . click( ) ; // Set up the click handler.
            } ,

            /**
             * Moves the summary panel to a specified position.
             * @param {number} i - The position index (1-4).
             */
            move : function ( i ) {
                var $debugViewportSummary = $ ( '#debug-viewport-summary' ) ,
                    keeper = 'minimized' ,
                    reAddClass = ( $debugViewportSummary . hasClass( keeper ) ) ? true : false ; // Check if it was minimized.

                $debugViewportSummary . removeClass( ) . addClass( 'position' + i ) ; // Remove all classes and add new position class.
                if ( reAddClass ) {
                    $debugViewportSummary . addClass( keeper ) ; // Re-add minimized class if it was present.
                }
                $ ( '#debug-panel' ) . find( '.position' ) . attr( 'data-position' , i ) ; // Update the position button's data attribute.
            }
        } // End of position sub-module.
    } ; // End of viewportSummary module.


    /**
     * Retrieves the current viewport height.
     * @returns {number} The viewport height in pixels.
     */
    debug . viewportHeight = function ( ) {
        return window . innerHeight || document . documentElement . clientHeight || document . body . clientHeight || 0 ;
    } ;


    /**
     * Retrieves the current viewport width.
     * @returns {number} The viewport width in pixels.
     */
    debug . viewportWidth = function ( ) {
        return window . innerWidth || document . documentElement . clientWidth || document . body . clientWidth || 0 ;
    } ;


    // Module for visualizing breakpoints.
    debug . visualize = {

        /**
         * Turns off breakpoint visualization.
         */
        off : function ( ) {
            $ ( '.debug-visualize' ) . remove( ) ;
        } ,

        /**
         * Turns on breakpoint visualization.
         * Displays lines corresponding to media query breakpoints.
         */
        on : function ( ) {
            var query ,
                widths = '' ,
                heights = '' ;

            // Iterate through defined media queries.
            $ . each( frwd . mediaQueries , function ( index , value ) {
                query = value . query ;

                // If it's a min-width query, add to widths string.
                if ( query . indexOf( 'min-width' ) > 0 ) {
                    value = debug . calculatePixels( query , 'min-width' ) ;
                    widths += '<li style="width: ' + value + 'px"><span>' + index + '</span></li>' ;
                }

                // If it's a min-height query, add to heights string.
                if ( query . indexOf( 'min-height' ) > 0 ) {
                    value = debug . calculatePixels( query , 'min-height' ) ;
                    heights += '<li style="height: ' + value + 'px"><span>' + index + '</span></li>' ;
                }
            } ) ;

            // Append width visualization if any breakpoints were found.
            if ( widths ) {
                $ ( 'body' ) . append( '<ol class="debug-visualize debug-visualize-width">' + widths + '</ol>' ) ;
            }

            // Append height visualization if any breakpoints were found.
            if ( heights ) {
                $ ( 'body' ) . append( '<ol class="debug-visualize debug-visualize-height">' + heights + '</ol>' ) ;
            }
        }
    } ;

    // Initialize the debug panel once the DOM is ready.
    $ ( debug . buildPanel ) ;

// Self-executing anonymous function, passing 'debug' and 'jQuery'.
// 'debug' is attached to window.frwd.debug, creating it if it doesn't exist.
} ( window . frwd . debug = window . frwd . debug || { } , jQuery ) ) ;