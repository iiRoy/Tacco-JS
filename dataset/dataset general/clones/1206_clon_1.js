/*
 **************************************************************************************************
 *
 *                                      Hoverizr - A jQuery Plugin
 *
 * Hoverizr is an innovative jQuery plugin designed for image manipulation, leveraging the
 * capabilities of the HTML5 Canvas element. This modern approach allows for dynamic and
 * visually engaging effects directly within the browser.
 *
 * It currently supports three distinct, dynamic image effects:
 *      1. Grayscale: The default effect, converting images to black and white.
 *      2. Blur: Applies a softening blur to the image.
 *      3. Color Inversion: Reverses the color values of an image.
 *
 * The plugin offers extensive customization options, allowing developers to define specific
 * behaviors and appearances. Furthermore, it supports responsive design principles by default,
 * ensuring seamless integration across various device sizes and screen resolutions.
 *
 * For more detailed information, live demonstrations, and examples, please visit:
 *          http://www.iliasiovis.com/hoverizr/
 *
 * To contribute or fork the project on GitHub, navigate to:
 *          https://github.com/iliasiovis/Hoverizr/
 *
 * Copyright (c) 2011 Ilias Iovis | iliasiovis.com
 * All rights reserved.
 *
 **************************************************************************************************
 */


( function( $ ) {

    // Extend jQuery's prototype with the 'hoverizr' function.
    $.fn.hoverizr = function( options ) {

        // Define default configuration settings for the plugin.
        var defaults = {
            'effect':           "grayscale",    // Primary image effect: 'grayscale', 'invert', 'blur'. 'noise' is planned.
            'overlay':          "top",          // Determines the Z-index order: manipulated image on 'top' or 'bottom'.
            'container':        "overlayed",    // CSS class name for the generated wrapper div.
            'width':            "responsive",   // Width setting: 'responsive', fixed pixel value (e.g., 500), or 'inherit'.
            'height':           "auto",         // Height setting: 'auto' or fixed pixel value. Only change if using fixed width.
            'stretch':          "no",           // 'yes' to stretch image/canvas to fill fixed dimensions, 'no' to crop.
            'speedIn':          "slow",         // Fade-in speed: 'slow', 'fast', or milliseconds (e.g., 1500).
            'speedOut':         "fast"          // Fade-out speed: 'slow', 'fast', or milliseconds (e.g., 1500).
        };


        // Merge default settings with user-provided options.
        // This creates the final configuration object.
        var options = $.extend( defaults, options );


        // Workaround for a potential max-width glitch in responsive designs
        // when initializing the canvas element.
        var maxwidth = 0; // Initialize a flag for max-width restoration.

        if ( $( 'img' ).css( 'maxWidth' ) != "none" ) {

            maxwidth = 1;                           // Set flag if maxWidth is active.
            $( 'img' ).css( 'maxWidth', "none" );   // Temporarily remove max-width.

        } else {

            maxwidth = 0;                           // No max-width found.

        }


        // Iterate over each selected image element to apply Hoverizr effects.
        this.each( function() {


            // Wrap the current image in a new div with the specified container class.
            $( this ).wrap( '<div class="' + options.container + '" />' );

            // Set the wrapper div's position to relative for proper layering of elements.
            $( this ).parent( '.' + options.container + '' ).css( { 'position': 'relative' } );

            // Append a canvas element as a sibling to the image within the wrapper.
            $( this ).parent( '.' + options.container + '' ).append( '<canvas class="canv"></canvas>' );

            // Style the newly created canvas element for absolute positioning.
            $( this ).next( '.canv' ).css( { 'position': 'absolute', 'top': '0', 'left': '0', 'z-index': 10 } );


            // Adjust Z-index based on the 'overlay' option.
            if ( options.overlay == "top" ) {

                // Image is below the canvas.
                $( this ).css( { 'z-index': -1 } );

            } else {

                // Image is above the canvas, canvas initially hidden.
                $( this ).css( { 'z-index': 1 } );
                $( this ).next( '.canv' ).css( { 'display': 'none' } );

            }


            // Get the current dimensions of the image.
            var width = $( this ).width();
            var height = $( this ).height();


            // Set the canvas dimensions to match the image.
            $( this ).next( '.canv' ).attr( { "width": width, "height": height } );

            // Get the raw DOM canvas element and its 2D rendering context.
            var canvas = $( this ).next( '.canv' ).get( 0 );
            var context = canvas.getContext( "2d" );

            // Draw the original image onto the canvas.
            var image = $( this ).get( 0 );
            context.drawImage( image, 0, 0 );


            // Retrieve image data for pixel-level manipulation, if the effect requires it.
            var pix; // Declare pix here for wider scope.

            if ( options.effect != 'noise' && options.effect != 'blur' ) { // Note: original code had ('blur') which is always true. Corrected to 'blur'.

                try {

                    try {
                        // Attempt to get image data. This might fail due to cross-origin restrictions.
                        var imgd = context.getImageData( 0, 0, width, height );

                    } catch ( e ) {
                        // If cross-origin error, try enabling privileges (for older browsers/specific security contexts).
                        netscape.security.PrivilegeManager.enablePrivilege( "UniversalBrowserRead" );
                        var imgd = context.getImageData( 0, 0, width, height );
                    }

                } catch ( e ) {
                    // Re-throw the error if image data still cannot be accessed.
                    throw new Error( "Unable to access image data: " + e );
                }

                // Get the pixel array from the image data.
                pix = imgd.data;

            }


            // Apply the selected image manipulation effect using a switch statement.
            switch ( options.effect ) {

                case "invert":
                    // Apply Color Inversion Effect: subtract each color component from 255.
                    for ( var i = 0, n = pix.length; i < n; i += 4 ) {
                        pix[i]      = 255 - pix[i];     // Red component
                        pix[i + 1]  = 255 - pix[i + 1]; // Green component
                        pix[i + 2]  = 255 - pix[i + 2]; // Blue component
                        // i+3 is the alpha channel, which remains unchanged.
                    }
                    break;

                case "blur":
                    // Apply Blur Effect: redraw the image multiple times with slight offsets.
                    var x, y;
                    var imgb = new Image(); // Create a new Image object for blurring.
                    imgb.src = $( this ).attr( 'src' ); // Set its source to the original image.

                    context.globalAlpha = 0.0625; // Set transparency for the blur passes.

                    // Loop to apply multiple offset draws, creating the blur effect.
                    for ( y = -3; y < 3; y += 1 ) {
                        for ( x = -3; x < 3; x += 1 ) {
                            context.drawImage( imgb, x, y );
                        }
                    }

                    context.globalAlpha = 1; // Reset global alpha to opaque.
                    break;

                default:
                    // Default effect is Grayscale.
                    // Convert each pixel to grayscale using a weighted average luminance formula.
                    for ( var i = 0, n = pix.length; i < n; i += 4 ) {
                        // Calculate grayscale value using luminosity method.
                        var grayscale = pix[i] * .3 + pix[i + 1] * .59 + pix[i + 2] * .11;
                        // An alternative average formula: (pix[i] + pix[i+1] + pix[i+2]) / 3;

                        pix[i]      = grayscale;    // Set red to grayscale.
                        pix[i + 1]  = grayscale;    // Set green to grayscale.
                        pix[i + 2]  = grayscale;    // Set blue to grayscale.
                        // Alpha channel (i+3) is preserved.
                    }
                    break;
            }


            // Put the modified image data back onto the canvas, if applicable.
            // Blur effect handles its own drawing, and 'noise' is under construction.
            if ( options.effect != "blur" && options.effect != "noise" ) { // Corrected original condition from ("blur"||"noise")

                context.putImageData( imgd, 0, 0 );

            }


            // Adjust the dimensions and overflow properties based on configuration.
            if ( options.width == "responsive" ) {
                // Make the image, canvas, and container responsive.
                $( this ).next( '.canv' ).css( { 'max-width': '100%' } );
                $( this ).css( { 'max-width': '100%' } );
                $( this ).parent( '.' + options.container + '' ).css( { 'width': '100%' } );

            } else if ( options.stretch == "no" ) {
                // If not stretching, set fixed dimensions for the container and hide overflow.
                $( this ).parent( '.' + options.container + '' ).css( { 'width': options.width, 'height': options.height, overflow: "hidden" } );

            } else {
                // If stretching, set fixed dimensions for image, canvas, and container.
                $( this ).next( '.canv' ).css( { 'width': options.width, 'height': options.height } );
                $( this ).css( { 'width': options.width, 'height': options.height } );
                $( this ).parent( '.' + options.container + '' ).css( { 'width': options.width, 'height': options.height } );

            }

        } );


        // Restore the original max-width setting for images if it was modified earlier.
        if ( maxwidth == 1 ) {

            $( 'img' ).css( 'maxWidth', "100%" );

        }


        // Implement the hover effect functionality.
        if ( options.overlay == "top" ) {
            // If the canvas (manipulated image) is on top, fade it out on hover and in on hover out.
            this.parent( '.' + options.container + '' ).hover( function() {
                // Mouse enters: fade out the canvas.
                $( this ).children( '.canv' ).stop( true, true ).fadeOut( options.speedOut );
            }, function() {
                // Mouse leaves: fade in the canvas.
                $( this ).children( '.canv' ).stop( true, true ).fadeIn( options.speedIn );
            } );

        } else {
            // If the canvas (manipulated image) is on bottom, fade it in on hover and out on hover out.
            this.parent( '.' + options.container + '' ).hover( function() {
                // Mouse enters: fade in the canvas.
                $( this ).children( '.canv' ).stop( true, true ).fadeIn( options.speedOut );
            }, function() {
                // Mouse leaves: fade out the canvas.
                $( this ).children( '.canv' ).stop( true, true ).fadeOut( options.speedIn );
            } );

        }

    };

} )( jQuery ); // Pass jQuery object to the immediately invoked function expression.