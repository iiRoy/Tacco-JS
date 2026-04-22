// ScrollIt.js - A utility for smooth, vertical page scrolling.
//
// This script, ScrollIt.js (scroll•it•dot•js), simplifies the creation of
// long, vertically scrolling web pages. It provides features like
// keyboard navigation, active element tracking, and custom scroll animations.
//
// Current version: 1.0.3
// Project repository: https://github.com/cmpolis/scrollIt.js
// License information: https://github.com/cmpolis/scrollIt.js/blob/master/LICENSE.txt

( function ( $ ) {

    // Ensures strict mode for cleaner code and fewer errors.
    'use strict';

    var pluginName = 'ScrollIt' ; // The name of our jQuery plugin.
    var pluginVersion = '1.0.3';   // The current version of this plugin.

    // --- DEFAULT CONFIGURATION OPTIONS ---

    var defaults = {
            upKey        : 38,       // Keyboard key code for scrolling up (Arrow Up).
            downKey      : 40,       // Keyboard key code for scrolling down (Arrow Down).
            easing       : 'linear', // Easing function for the scroll animation.
            scrollTime   : 600,      // Duration of the scroll animation in milliseconds.
            activeClass  : 'active', // CSS class added to the currently active navigation item.
            onPageChange : null,     // Callback function executed when the active page changes.
            topOffset    : 0         // Offset from the top of the viewport when scrolling to an element.
        } ;


    // The main plugin function, exposed via jQuery.
    $.scrollIt = function ( options ) {

        // --- INTERNAL DECLARATIONS ---

        // Merge default options with user-provided options.
        var settings = $.extend( defaults, options ) ;

        // Tracks the index of the currently active scroll section.
        var active = 0 ;

        // Determines the highest data-scroll-index value available on the page.
        var lastIndex = $( '[data-scroll-index]:last' ).attr( 'data-scroll-index' ) ;


        // --- CORE METHODS ---

        // Function to handle smooth scrolling to a specific section.
        var navigate = function ( ndx ) {
            // Validate the target index.
            if ( ndx < 0 || ndx > lastIndex ) {
                return ;
            }

            // Calculate the target scroll position.
            var targetTop = $( '[data-scroll-index=' + ndx + ']' ).offset().top + settings.topOffset + 1 ;

            // Animate the scroll.
            $( 'html,body' ).animate(
                {
                    scrollTop : targetTop,
                    easing    : settings.easing
                },
                settings.scrollTime
            ) ;
        } ;

        // Handles click events on navigation elements, triggering a scroll.
        var doScroll = function ( e ) {
            var target = $( e.target ).closest( "[data-scroll-nav]" ).attr( 'data-scroll-nav' ) ||
                         $( e.target ).closest( "[data-scroll-goto]" ).attr( 'data-scroll-goto' ) ;
            navigate( parseInt( target ) ) ;
        } ;

        // Manages keyboard navigation (up/down arrow keys).
        var keyNavigation = function ( e ) {
            var key = e.which ;

            // Prevent scroll if an animation is already running and key is an arrow key.
            if ( $( 'html,body' ).is( ':animated' ) && ( key == settings.upKey || key == settings.downKey ) ) {
                return false ;
            }

            // Handle 'up' key press.
            if ( key == settings.upKey && active > 0 ) {
                navigate( parseInt( active ) - 1 ) ;
                return false ;
            }
            // Handle 'down' key press.
            else if ( key == settings.downKey && active < lastIndex ) {
                navigate( parseInt( active ) + 1 ) ;
                return false ;
            }

            // Allow default browser behavior for other keys.
            return true ;
        } ;

        // Updates the currently active navigation item and triggers the onPageChange callback.
        var updateActive = function ( ndx ) {
            // Execute callback if provided and page has actually changed.
            if ( settings.onPageChange && ndx && ( active != ndx ) ) {
                settings.onPageChange( ndx ) ;
            }

            active = ndx ; // Update the active index.

            // Remove active class from all navigation items.
            $( '[data-scroll-nav]' ).removeClass( settings.activeClass ) ;

            // Add active class to the current navigation item.
            $( '[data-scroll-nav=' + ndx + ']' ).addClass( settings.activeClass ) ;
        } ;

        // Continuously monitors the scroll position to determine and update the active section.
        var watchActive = function () {
            var winTop = $( window ).scrollTop() ; // Current scroll position from the top of the window.

            // Find visible elements with 'data-scroll-index'.
            var visible = $( '[data-scroll-index]' ).filter( function ( ndx, div ) {
                var $div = $( div ) ;
                var divOffsetTop = $div.offset().top ;
                var divOuterHeight = $div.outerHeight() ;

                // Check if the current scroll position is within the element's bounds.
                return winTop >= divOffsetTop + settings.topOffset &&
                       winTop < divOffsetTop + ( settings.topOffset ) + divOuterHeight ;
            } ) ;

            // Get the index of the first visible element.
            var newActive = visible.first().attr( 'data-scroll-index' ) ;

            // Update the active state.
            updateActive( newActive ) ;
        } ;


        // --- INITIALIZATION AND EVENT BINDINGS ---

        // Bind 'scroll' event to update active section and trigger immediately.
        $( window ) . on ( 'scroll', watchActive ) . scroll () ;

        // Bind 'keydown' event for keyboard navigation.
        $( window ) . on ( 'keydown', keyNavigation ) ;

        // Bind 'click' event to navigation elements for smooth scrolling.
        $( 'body' ) . on ( 'click', '[data-scroll-nav], [data-scroll-goto]', function ( e ) {
            e . preventDefault () ; // Prevent default anchor link behavior.
            doScroll ( e ) ;         // Perform the scroll.
        } ) ;

    } ;

} ( jQuery ) ) ; // Pass jQuery into the immediately invoked function expression.