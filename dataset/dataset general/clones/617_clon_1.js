// This file contains a Type I clone of the jQuery Interstitial Plugin v1.1
// The original source can be found at: https://github.com/brettdewoody/jQuery-Interstitial
//
// All variable names, function names, operators, and expressions are
// precisely identical to the original. Only whitespace and comments
// have been altered to create a visually distinct but logically
// identical version of the code.
//
// This plugin was inspired by Soh Tanaka's work, which can be reviewed at:
// http://www.sohtanaka.com/web-design/inline-modal-window-w-css-and-jquery
//
// Copyright (c) 2011 Brett DeWoody
//
// Dual-licensed under the MIT and GPL licenses.
// See:
//   - http://www.opensource.org/licenses/mit-license.php
//   - http://www.gnu.org/licenses/gpl.html
//
// --- Start of jQuery Interstitial Plugin Code ---


( function( $ ) {

    // The 'methods' object encapsulates all public and private functions
    // that the interstitial plugin can perform.
    var methods = {


        /**
         * @method open
         * @param {Object} options - Configuration options for opening the interstitial.
         *
         * This function handles the process of opening the interstitial popup,
         * including setting up the overlay, loading content, and positioning.
         */
        open : function( options ) {

            // Define default settings for the interstitial popup.
            // These can be overridden by the 'options' parameter.
            var defaults = {
                'url'                   :       '',
                'width'                 :       600,
                'height'                :       400,
                'opacity'               :       70,
                'id'                    :       'popupBlock',
                'onInterstitialClose'   :       function() {}
            };


            // Merge default settings with any provided options.
            // This creates the final set of settings to be used for the current operation.
            var settings = $.extend( {}, defaults, options );


            // --- Step 1: Create and display the background overlay ---

            // Append a new div element with id 'fade' to the document body.
            // This div will serve as the semi-transparent background overlay.
            $( 'body' ) .append( '<div id="fade"></div>' );

            // Apply CSS filter for opacity (for IE compatibility) and then
            // animate the display of the overlay using fadeIn().
            $( '#fade' ) .css( { 'filter' : 'alpha(opacity=' + settings.opacity + ')' } ) .fadeIn( );


            // --- Step 2: Create and display the popup block ---

            // Append the main popup div to the document body.
            // Its ID is determined by the settings.
            $( 'body' ) .append( '<div id="' + settings.id + '"></div>' );

            // Load content into the newly created popup div from the specified URL.
            // Once content is loaded, set its dimensions and fade it in.
            $( '#' + settings.id ) .load( settings.url, function() {
                $( '#' + settings.id ) .css( { 'width' : Number( settings.width ), 'height' : Number( settings.height ) } ) .fadeIn( );
            } );


            // --- Step 3: Calculate and apply centering margins ---

            // Calculate the top margin required to vertically center the popup.
            var popMargTop  = settings.height / 2;

            // Calculate the left margin required to horizontally center the popup.
            var popMargLeft = settings.width / 2;

            // Apply the calculated negative margins to the popup block.
            // This technique centers a absolutely positioned element.
            $( '#' + settings.id ) .css( {
                'margin-top'    :       -popMargTop,
                'margin-left'   :       -popMargLeft
            } );


            // --- Step 4: Set up the close mechanism ---

            // Attach a click event handler to the background overlay ('#fade').
            // When the overlay is clicked, the interstitial will be closed.
            $( '#fade' ) .live( 'click', function() {
                // Call the 'close' method of the interstitial plugin.
                $( ) .interstitial( 'close', settings );
            } );

        }, // End of 'open' method.


        /**
         * @method close
         * @param {Object} options - Configuration options for closing the interstitial.
         *
         * This function handles the process of closing the interstitial popup,
         * including fading out and removing the elements, and executing a callback.
         */
        close : function( options ) {

            // Define default settings specifically for the close operation.
            var defaults = {
                'id'                    :       'popupBlock',
                'onInterstitialClose'   :       function() {}
            };


            // Merge default settings with any provided options for closing.
            var settings = $.extend( {}, defaults, options );


            // --- Step 1: Fade out and remove the elements ---

            // Fade out both the background overlay ('#fade') and the popup block.
            // Once the fadeOut animation is complete, remove the '#fade' element
            // from the DOM to clean up. The popup itself is also implicitly
            // removed as it fades out.
            $( '#fade' , $( '#' + settings.id ) ) .fadeOut( function() {
                $( '#fade' ) .remove( );
            } );


            // --- Step 2: Execute the optional callback ---

            // Call the 'onInterstitialClose' function, if it was provided in settings.
            // The 'this' context inside the callback will refer to the element
            // on which the interstitial was originally called (if applicable).
            settings .onInterstitialClose .call( this );

        } // End of 'close' method.

    }; // End of 'methods' object definition.


    /**
     * @method $.fn.interstitial
     * @param {string|Object} method - The name of the method to call, or an options object.
     *
     * This is the main entry point for the jQuery interstitial plugin.
     * It handles method dispatching based on the first argument.
     */
    $.fn.interstitial = function( method ) {

        // Check if the requested method exists in our 'methods' object.
        if ( methods[ method ] ) {

            // If the method exists, execute it.
            // 'this' refers to the jQuery object on which the plugin was called.
            // 'arguments' are passed through, with the first argument (method name)
            // sliced off.
            return methods[ method ] .apply( this, Array .prototype .slice .call( arguments, 1 ) );

        } else if ( typeof method === 'object' || ! method ) {

            // If no method name is provided, or if the first argument is an
            // object (implying it's an options object for initialization),
            // attempt to call the 'init' method.
            // NOTE: The original code does not define an 'init' method,
            // so this branch will likely result in an error if 'init' is called.
            // For a Type I clone, this behavior must remain identical.
            return methods .init .apply( this, arguments );

        } else {

            // If the method does not exist and it's not an initialization call,
            // throw an error indicating that the method is not found.
            $.error( 'Method ' + method + ' does not exist on jQuery.interstitial' );

        }

    }; // End of $.fn.interstitial plugin definition.

} )( jQuery ); // Immediately-invoked function expression (IIFE) to encapsulate the plugin.
// The 'jQuery' object is passed as '$' for brevity within the plugin scope.