/*
	Totem Ticker Plugin
	Copyright (c) 2011 Zach Dunn / www.buildinternet.com

	This code is released under the MIT License.
	Feel free to use, modify, and distribute as per the license terms.
	--------------------------
	The overall structure of this plugin is based on Doug Neiner's popular jQuery plugin blueprint.
	You can find more details here: http://starter.pixelgraphics.us/
*/
(   function( $ ) {

    // Ensure that the $.omr namespace exists. If not, create it as a new object.
    if  ( ! $.omr ) {
        $.omr = new Object();
    } ;

    // Define the core totemticker plugin function within the $.omr namespace.
    $.omr.totemticker = function( el, options ) {

        var base = this ; // 'base' will refer to the current instance of the plugin.

        // Store the original DOM element and its jQuery-wrapped version.
        base.el = el ;
        base.$el = $( el ) ;

        // Add a reverse reference from the DOM object back to the plugin instance.
        // This allows easy access to the plugin instance from the element itself.
        base.$el.data( "omr.totemticker", base ) ;

        // The initialization method for the plugin.
        base.init = function() {
            // Merge default options with any user-provided options.
            base.options = $.extend( {}, $.omr.totemticker.defaultOptions, options ) ;

            // Declare a variable to hold the ticker interval ID.
            var   _ticker_ref ;
            base.ticker = _ticker_ref ; // Initialize base.ticker.

            // Adjust the height of the ticker container based on configuration.
            base.format_ticker() ;

            // Set up event handlers for navigation elements (if specified).
            base.setup_nav() ;

            // Begin the automatic scrolling interval.
            base.start_interval() ;

            // Uncomment the line below for debugging purposes to output options to console.
            //base.debug_info();
        } ;

        // Method to start the ticker's scrolling interval.
        base.start_interval = function() {

            // Clear any previously existing interval to prevent multiple tickers running.
            clearInterval( base.ticker ) ;

            // Check the direction option to determine scroll behavior.
            if  ( base.options.direction == 'up' ) {
                // If the scrolling direction is 'up'.
                base.ticker = setInterval( function() {
                    // Detach the last list item, prepend it to the top, and set its margin-top.
                    base.$el.find( 'li:last' ).detach().prependTo( base.$el ).css( 'marginTop', '-' + base.options.row_height ) ;
                    // Animate the first list item to scroll into view.
                    base.$el.find( 'li:first' ).animate( {
                        marginTop: '0px'
                    }, base.options.speed, function () {
                        // Callback function after animation completes (currently empty).
                    } ) ;
                }, base.options.interval ) ;
            } else {
                // Otherwise, the default direction is 'down'.
                base.ticker = setInterval( function() {

                    // Animate the first list item to scroll out of view.
                    base.$el.find( 'li:first' ).animate( {
                        marginTop: '-' + base.options.row_height
                    }, base.options.speed, function() {
                        // After animation, detach it, reset its margin, and append to the end.
                        $( this ).detach().css( 'marginTop', '0' ).appendTo( base.$el ) ;
                    } ) ;

                }, base.options.interval ) ;
            }
        } ;

        // Method to reset the ticker interval (stop and then immediately restart).
        base.reset_interval = function() {
            clearInterval( base.ticker ) ;
            base.start_interval() ;
        } ;

        // Method to stop the ticker by clearing its interval.
        base.stop_interval = function() {
            clearInterval( base.ticker ) ;
        } ;

        // Formats the ticker's container height based on 'max_items' option.
        base.format_ticker = function() {

            if  ( typeof( base.options.max_items ) != "undefined" && base.options.max_items != null ) {

                // Remove 'px' from row_height to perform calculations.
                var stripped_height = base.options.row_height.replace( /px/i, '' ) ;
                // Calculate the total height for the ticker.
                var ticker_height = stripped_height * base.options.max_items ;

                // Apply the calculated height and hide overflow.
                base.$el.css( {
                    height		: ticker_height + 'px',
                    overflow	: 'hidden'
                } ) ;

            } else {
                // If no specific max_items is set, just ensure overflow is hidden.
                base.$el.css( {
                    overflow	: 'hidden'
                } ) ;
            }

        } ;

        // Sets up event listeners for navigation controls.
        base.setup_nav = function() {

            // Setup for the Stop Button.
            if  ( typeof( base.options.stop ) != "undefined" && base.options.stop != null ) {
                $( base.options.stop ).click( function() {
                    base.stop_interval() ; // Call the stop method.
                    return false ; // Prevent default link behavior.
                } ) ;
            }

            // Setup for the Start Button.
            if  ( typeof( base.options.start ) != "undefined" && base.options.start != null ) {
                $( base.options.start ).click( function() {
                    base.start_interval() ; // Call the start method.
                    return false ; // Prevent default link behavior.
                } ) ;
            }

            // Setup for the Previous Button (scrolls up one item).
            if  ( typeof( base.options.previous ) != "undefined" && base.options.previous != null ) {
                $( base.options.previous ).click( function() {
                    // Move the last item to the top and position it for animation.
                    base.$el.find( 'li:last' ).detach().prependTo( base.$el ).css( 'marginTop', '-' + base.options.row_height ) ;
                    // Animate the new first item into view.
                    base.$el.find( 'li:first' ).animate( {
                        marginTop: '0px'
                    }, base.options.speed, function () {
                        base.reset_interval() ; // Reset interval after manual interaction.
                    } ) ;
                    return false ; // Prevent default link behavior.
                } ) ;
            }

            // Setup for the Next Button (scrolls down one item).
            if  ( typeof( base.options.next ) != "undefined" && base.options.next != null ) {
                $( base.options.next ).click( function() {
                    // Animate the first item out of view.
                    base.$el.find( 'li:first' ).animate( {
                        marginTop: '-' + base.options.row_height
                    }, base.options.speed, function() {
                        // After animation, move it to the end and reset its position.
                        $( this ).detach().css( 'marginTop', '0px' ).appendTo( base.$el ) ;
                        base.reset_interval() ; // Reset interval after manual interaction.
                    } ) ;
                    return false ; // Prevent default link behavior.
                } ) ;
            }

            // Setup for stop on mouse hover functionality.
            if  ( typeof( base.options.mousestop ) != "undefined" && base.options.mousestop === true ) {
                base.$el.mouseenter( function() {
                    base.stop_interval() ; // Stop the ticker on mouse enter.
                } ).mouseleave( function() {
                    base.start_interval() ; // Restart the ticker on mouse leave.
                } ) ;
            }

            /*
                TO DO List for future enhancements:
                ----------------
                - Implement a continuous scrolling mode without discrete steps.
                - Add support for vertical alignment options.
                - Improve accessibility features.
            */

        } ;

        // Debugging function to log current options to the console.
        base.debug_info = function() {
            // Dump all current options into the console for inspection.
            console.log( base.options ) ;
        } ;

        // Call the initialization method to start the plugin.
        base.init() ;
    } ;

    // Define the default options for the totemticker plugin.
    // These can be overridden by user-provided options.
    $.omr.totemticker.defaultOptions = {
        message		:	'Ticker Loaded',	/* A placeholder message (currently disregarded by the plugin logic). */
        next		:	null,		/* Selector (ID or class) for the 'next' navigation button/link. */
        previous	:	null,		/* Selector (ID or class) for the 'previous' navigation button/link. */
        stop		:	null,		/* Selector (ID or class) for the 'stop' navigation button/link. */
        start		:	null,		/* Selector (ID or class) for the 'start' navigation button/link. */
        row_height	:	'100px',	/* The fixed height of each individual ticker row (e.g., '50px'). */
        speed		:	800,		/* The duration of the scroll animation in milliseconds. */
        interval	:	4000,		/* The delay between automatic scrolls in milliseconds. */
        max_items	: 	null, 		/* An integer specifying how many items should be visible at once.
                                       If set, the container's height will be adjusted. (OPTIONAL) */
        mousestop	:	false,		/* If 'true', the ticker will pause when the mouse is over it. */
        direction	:	'down'		/* The direction the list will scroll ('up' or 'down'). */
    } ;

    // jQuery plugin wrapper definition.
    // This allows users to call `$(selector).totemticker(options)`.
    $.fn.totemticker = function( options ) {
        return this.each( function() {
            // For each selected element, create a new instance of the totemticker plugin.
            ( new $.omr.totemticker( this, options ) ) ;
        } ) ;
    } ;

} )( jQuery ) ; // Pass jQuery into the immediately invoked function expression.