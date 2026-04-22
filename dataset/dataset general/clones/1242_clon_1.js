/*
 * jQuery Spotlight Plugin - Type I Clone
 *
 * This version retains all original logic, identifiers, and expressions.
 * Only whitespace and comments have been altered for visual distinction.
 *
 * Project Page: http://github.com/
 * Original Plugin code by Gilbert Pellegrom (2009)
 * Licensed under the GPL license (http://www.gnu.org/licenses/gpl-3.0.html)
 * Version 2.0.1 (2014)
 *
 * This file is a Type I clone, meaning it is exactly equal to the original,
 * save for variations in whitespace and comments.
 * No functional changes whatsoever.
 */

( function ( factory ) {

    if ( typeof define === 'function' && define.amd ) {

        // AMD. Register as an anonymous module for RequireJS.
        define( [ 'jquery' ] , factory ) ;

    } else {

        // Browser globals (window.jQuery)
        factory( jQuery ) ;

    }

} ( function ( $ ) {

    // Store a reference to the currently active spotlight overlay.
    var currentOverlay ;

    $.fn.spotlight = function ( options ) {

        // Default method is 'create' if no string option is provided.
        var method = 'create' ;

        // Merge default settings with user-provided options.
        // The 'settings' variable is intentionally global to this scope (no 'var').
        settings = $.extend( { } , {
            opacity             : .5 ,        // Opacity of the spotlight overlay.
            speed               : 400 ,       // Animation speed in milliseconds.
            color               : '#333' ,    // Background color of the overlay.
            animate             : true ,      // Whether to animate the overlay appearance/disappearance.
            easing              : '' ,        // Easing function for animations (e.g., 'swing', 'linear').
            exitEvent           : 'click' ,   // Event that triggers the closing of the spotlight.
            onShow              : function ( ) {
                // Callback function executed when the spotlight is shown.
                // By default, it does nothing.
            } ,
            onHide              : function ( ) {
                // Callback function executed when the spotlight is hidden.
                // By default, it does nothing.
            } ,
            spotlightZIndex     : 9999 ,      // CSS z-index for the spotlight overlay.
            spotlightElementClass : 'spotlight-background' , // CSS class for the overlay element.
            parentSelector      : 'html' ,    // Selector for the parent element the overlay is appended to.
            paddingX            : 0 ,         // Horizontal padding around the spotlighted elements.
            paddingY            : 0           // Vertical padding around the spotlighted elements.
        } , options ) ;

        /**
         * Closes and removes the current spotlight overlay.
         * Handles animation if enabled in settings.
         */
        function closeOverlay ( ) {

            // If no overlay is currently active, there's nothing to do.
            if ( ! currentOverlay ) {
                return ;
            }

            // Check if animation is enabled for closing.
            if ( settings.animate ) {

                // Animate the overlay's opacity to 0.
                currentOverlay.animate( { opacity : 0 } , settings.speed , settings.easing , function ( ) {
                    // Once animation is complete, remove the overlay from the DOM.
                    currentOverlay.remove( ) ;
                    // Clear the reference to the overlay.
                    currentOverlay = null ;

                    // Trigger the user-defined onHide callback.
                    settings.onHide.call( this ) ;
                } ) ;

            } else {

                // If no animation, just remove the overlay immediately.
                currentOverlay.remove( ) ;
                currentOverlay = null ;

                // Trigger the user-defined onHide callback.
                settings.onHide.call( this ) ;

            }

        } // End of closeOverlay function.

        // Check if the first argument is a string (indicating a method call).
        if ( typeof options === 'string' ) {
            method = options ;
            // The actual options object would be the second argument.
            options = arguments[ 1 ] ;
        }

        // Handle specific method calls like 'close' or 'destroy'.
        switch ( method ) {

            case 'close' :
            case 'destroy' :
                closeOverlay( ) ; // Call the closeOverlay function.
                return ; // Exit the plugin execution.

        }

        // Declare variables used within the spotlight scope.
        var elements = $( this ) , // The jQuery collection of elements to spotlight.
            overlay ,               // The canvas element used as the overlay.
            parent ,                // The parent element the overlay is appended to.
            context ;               // The 2D rendering context of the canvas.


        /**
         * Fills the overlay with the background color and clears
         * regions corresponding to the spotlighted elements.
         */
        function fillOverlay ( ) {

            // Set the fill color for the canvas context.
            context.fillStyle = settings.color ;
            // Draw a rectangle over the entire canvas (parent area).
            context.fillRect( 0 , 0 , parent.innerWidth( ) , parent.innerHeight( ) ) ;

            // Iterate over each element in the collection to create a "hole".
            elements.each( function ( i , e ) {

                e = $( e ) ; // Wrap the DOM element in a jQuery object.

                // Get the current position of the element relative to its offset parent.
                var currentPos = e.position( ) ;

                // Clear a rectangle area on the canvas for the current element.
                // This creates the "spotlight" effect.
                context.clearRect(
                    currentPos.left - settings.paddingX ,
                    currentPos.top - settings.paddingY ,
                    e.outerWidth( ) + ( settings.paddingX * 2 ) ,
                    e.outerHeight( ) + ( settings.paddingY * 2 )
                ) ;

            } ) ;

        } // End of fillOverlay function.


        /**
         * Handles window resizing events to adjust the overlay dimensions
         * and redraw the spotlight.
         *
         * @param e The event object (not directly used, but part of event handler signature).
         */
        function handleResize ( e ) {

            // Update the canvas width attribute to match the parent's inner width.
            overlay.attr( 'width' , parent.innerWidth( ) ) ;
            // Update the canvas height attribute to match the parent's inner height.
            overlay.attr( 'height' , parent.innerHeight( ) ) ;

            // If the canvas context has been initialized, redraw the overlay.
            if ( typeof context !== 'undefined' ) {
                fillOverlay( ) ;
            }

        } // End of handleResize function.


        // First, ensure any existing spotlight is closed before creating a new one.
        closeOverlay( ) ;

        // Create the canvas element for the overlay.
        overlay = $( '<canvas></canvas>' ) ;
        // Add the specified CSS class to the overlay.
        overlay.addClass( settings.spotlightElementClass ) ;

        // Set the newly created overlay as the current active overlay.
        currentOverlay = overlay ;

        // Determine the parent element where the overlay will be appended.
        parent = $( settings.parentSelector ) ;
        // Append the overlay canvas to the parent element.
        parent.append( overlay ) ;

        // Re-reference the elements that need to be spotlighted (though 'elements' is already defined).
        var element = $( this ) ;

        // Define the CSS properties for the overlay.
        var cssConfig = {
            position : 'absolute' , // Position the overlay absolutely.
            top      : 0 ,         // Align to the top of the parent.
            left     : 0 ,         // Align to the left of the parent.
            height   : '100%' ,    // Make it span the full height of the parent.
            width    : '100%' ,    // Make it span the full width of the parent.
            zIndex   : settings.spotlightZIndex // Set the z-index.
        } ;

        // If the parent selector is 'html', ensure the html element has 100% height.
        if ( settings.parentSelector == 'html' ) {
            parent.css( 'height' , '100%' ) ;
        }

        // Apply the defined CSS configuration to the overlay.
        overlay.css( cssConfig ) ;
        // Immediately call handleResize to set initial dimensions and draw the spotlight.
        handleResize( ) ;
        // Bind the handleResize function to the window's resize event.
        $( window ).resize( handleResize ) ;

        // Get the 2D rendering context from the canvas element.
        context = overlay[ 0 ].getContext( '2d' ) ;

        // Fill the overlay and clear the spotlighted areas.
        fillOverlay( ) ;

        // Handle the animation for fading in the spotlight.
        if ( settings.animate ) {

            // Animate the overlay's opacity from 0 to the target opacity.
            overlay.animate( { opacity : settings.opacity } , settings.speed , settings.easing , function ( ) {
                // Trigger the user-defined onShow callback after animation completes.
                settings.onShow.call( this ) ;
            } ) ;

        } else {

            // If no animation, set the opacity immediately.
            overlay.css( 'opacity' , settings.opacity ) ;

            // Trigger the user-defined onShow callback.
            settings.onShow.call( this ) ;

        }

        // Set up the event listener to close the spotlight.
        // Uses event delegation on 'document' for robustness.
        $( document ).on( settings.exitEvent , overlay , closeOverlay ) ;

        // Return the original jQuery object to maintain chainability.
        return this ;

    } ; // End of $.fn.spotlight function definition.

} ) ) ; // End of IIFE.