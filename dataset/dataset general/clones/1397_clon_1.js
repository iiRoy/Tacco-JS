;(  function ( global, factory ) {

    // Define module for AMD loaders.
    if ( typeof define === 'function' && define.amd ) {

        define( [ 'jquery' ], factory );

    }
    // Define module for CommonJS environments.
    else if ( typeof exports === 'object' ) {

        factory( require( 'jquery' ) );

    }
    // Fallback for browser global.
    else {

        factory( global.jQuery );

    }

} ) ( this, function ( $ ) {

    'use strict'; /* Enforce strict mode for better error handling and cleaner code. */

    /**
     * Parses a user-provided string describing a hotspot location.
     * Hotspot strings are used to position the custom cursor's active point
     * relative to its visual representation. This function translates
     * human-readable descriptions into numerical pixel offsets.
     *
     * Example Usage Patterns:
     *
     * - `hotspot: 'center'` : The cursor's hotspot is precisely in the middle of its bounding box.
     * - `hotspot: 'center left'` : Vertically centered, but horizontally aligned to the far left.
     * - `hotspot: 'top right'` : Positions the hotspot at the top-right corner.
     * - `hotspot: 'center top'` : Horizontally centered, but vertically aligned to the top edge.
     *
     * @param {String} hotspot    A descriptive string for the desired hotspot position.
     * @param {Number} size       The square dimension (width/height) of the cursor in pixels.
     *
     * @returns {[Number, Number]} An array containing two numeric elements:
     *                             the [x-offset, y-offset] for the hotspot in pixels.
     *
     * @throws {Error} If the `hotspot` parameter is not a string, or if `cursorSize` is not a number.
     */
    var parseHotspotString = function ( hotspot, cursorSize ) {

        var xOffset = 0, yOffset = 0; // Initialize offsets to the top-left corner (0,0).

        // Basic input validation: ensure hotspot is a string.
        if ( typeof hotspot !== 'string' ) {
            $.error( 'Hotspot value provided is not a string and cannot be parsed.' );
        }

        // Basic input validation: ensure cursorSize is a number.
        if ( typeof cursorSize !== 'number' ) {
            $.error( 'The cursor size parameter must be a numeric value.' );
        }

        // Split the hotspot string by spaces and process each part.
        hotspot.split( ' ' ).forEach( function ( part ) {

            switch ( part ) {

                case 'center':
                    xOffset = cursorSize / 2; // Center horizontally
                    yOffset = cursorSize / 2; // Center vertically
                    break;

                case 'top':
                    yOffset = 0; // Align to the top edge
                    break;

                case 'bottom':
                    // Browsers typically render custom cursors with a (0,0) hotspot
                    // if the yOffset is precisely at the very last pixel (cursorSize).
                    // Subtracting 1 ensures it's within the valid pixel range.
                    yOffset = cursorSize - 1;
                    break;

                case 'left':
                    xOffset = 0; // Align to the left edge
                    break;

                case 'right':
                    xOffset = cursorSize - 1; // Align to the right edge
                    break;

            }
        } );

        return [ xOffset, yOffset ]; // Return the calculated [x, y] offsets.
    };

    /**
     * Generates a new canvas element containing the flipped contents of an original canvas.
     * This utility function supports flipping along horizontal, vertical, or both axes.
     *
     * @param {HTMLCanvasElement} canvas      The source canvas element to be flipped.
     * @param {String}            direction   The axis/axes along which to flip the canvas.
     *                                        Valid options are:
     *                                        - 'horizontal' : Flips left-to-right.
     *                                        - 'vertical'   : Flips top-to-bottom.
     *                                        - 'both'       : Flips along both axes.
     *
     * @returns {HTMLCanvasElement} A newly created canvas element with the flipped content.
     * @throws {Error} If the provided `direction` is not one of the allowed values.
     */
    function flipCanvas ( canvas, direction ) {

        // Validate the `direction` parameter to ensure it's one of the expected values.
        if ( $.inArray( direction, [ 'horizontal', 'vertical', 'both' ] ) === -1 ) {
            $.error( 'Flip value must be one of horizontal, vertical, or both.' );
        }

        // Create a new canvas element to draw the flipped image onto.
        var flippedCanvas = $( '<canvas />' )[ 0 ], flippedContext;

        // Ensure the new canvas has the same dimensions as the original.
        flippedCanvas.width = canvas.width;
        flippedCanvas.height = canvas.height;

        // Get the 2D rendering context for the new canvas.
        flippedContext = flippedCanvas.getContext( '2d' );

        // Apply transformations for horizontal flipping.
        if ( direction === 'horizontal' || direction === 'both' ) {
            flippedContext.translate( canvas.width, 0 ); // Move origin to the right edge.
            flippedContext.scale( -1, 1 );               // Flip horizontally.
        }

        // Apply transformations for vertical flipping.
        if ( direction === 'vertical' || direction === 'both' ) {
            flippedContext.translate( 0, canvas.height ); // Move origin to the bottom edge.
            flippedContext.scale( 1, -1 );                // Flip vertically.
        }

        // Draw the original canvas content onto the transformed context of the new canvas.
        flippedContext.drawImage( canvas, 0, 0, canvas.width, canvas.height );

        return flippedCanvas; // Return the canvas with the flipped image.
    }

    // Extend jQuery's prototype with the new `awesomeCursor` method.
    $.fn.extend( {

        awesomeCursor: function ( iconName, options ) {

            // Merge default options with user-provided options.
            options = $.extend( {}, $.fn.awesomeCursor.defaults, options );

            // Validate that an icon name (string) is provided.
            if ( typeof iconName !== 'string' || !iconName ) {
                $.error( 'The first parameter must be the icon name, e.g., \'pencil\'.' );
            }

            // Convert size to an integer if it's provided as a string.
            options.size = typeof options.size === 'string' ?
                parseInt( options.size, 10 ) :
                options.size;

            // Parse the hotspot string into an [x, y] array if it's a string.
            if ( typeof options.hotspot === 'string' ) {
                options.hotspot = parseHotspotString( options.hotspot, options.size );
            }

            // Clamp hotspot coordinates to be within the bounds of the cursor's size.
            options.hotspot = $.map( options.hotspot, function ( coordinate ) {
                return Math.min( options.size - 1, Math.max( 0, coordinate ) );
            } );

            var cssClass = ( function ( name, template ) {
                    // Apply template if it's a string, replacing '%s' with the icon name.
                    if ( typeof template === 'string' ) {
                        return template.replace( /%s/g, name );
                    }
                    // Apply template if it's a function.
                    else if ( typeof template === 'function' ) {
                        return template( name );
                    }
                    // Default: return the name as is.
                    return name;
                } ) ( iconName, options.font.cssClass ),
                srcElement = $( '<i />', {
                    class: cssClass,
                    style: 'position: absolute; left: -9999px; top: -9999px;' // Hide off-screen.
                } ),
                canvas = $( '<canvas />' )[ 0 ],
                canvasSize = options.size,
                hotspotOffset, unicode, dataURL, context;

            // Append the source element to the DOM temporarily to compute its style.
            $( 'body' ).append( srcElement );

            // Retrieve the unicode character for the icon using pseudo-element content.
            unicode = window.getComputedStyle( srcElement[ 0 ], ':before' )
                .getPropertyValue( 'content' );

            // Remove the temporary source element from the DOM.
            srcElement.remove();

            // Adjust canvas size if an outline is requested, to accommodate its width.
            if ( options.outline ) {
                canvasSize += 2; // Add 1px padding on each side for the outline.
            }

            // Handle cursor rotation.
            if ( options.rotate ) {

                // @TODO: Consider refactoring this rotation logic into a dedicated helper function.

                // Calculate new canvas size to prevent cropping after rotation.
                // This formula finds the diagonal of the original square, ensuring the rotated
                // square fits entirely within the new canvas.
                canvasSize = Math.ceil( Math.sqrt(
                    Math.pow( canvasSize, 2 ) + Math.pow( canvasSize, 2 )
                ) );

                hotspotOffset = ( canvasSize - options.size ) / 2; // Offset for centering the original icon.
                canvas.width = canvasSize;                           // Set new canvas width.
                canvas.height = canvasSize;                          // Set new canvas height.

                context = canvas.getContext( '2d' );                  // Get 2D rendering context.
                context.translate( canvas.width / 2, canvas.height / 2 ); // Move origin to center.

                // Rotate the canvas context. Canvas API uses radians, convert degrees.
                context.rotate( options.rotate * Math.PI / 180 );
                context.translate( -canvas.width / 2, -canvas.height / 2 ); // Move origin back.

                // Adjust hotspot coordinates to account for the increased canvas size due to rotation.
                options.hotspot[ 0 ] += options.hotspot[ 0 ] !== canvas.width / 2 ?
                    hotspotOffset : 0;
                options.hotspot[ 1 ] += options.hotspot[ 1 ] !== canvas.height / 2 ?
                    hotspotOffset : 0;

            }
            // If no rotation, set canvas dimensions directly.
            else {

                canvas.height = canvasSize;
                canvas.width = canvasSize;

                context = canvas.getContext( '2d' ); // Get 2D rendering context.
            }

            // Firefox may wrap extracted unicode values in quotation marks; remove them. Issue #10.
            unicode = unicode.replace( /"/g, '' );

            // Configure context and draw the icon to the canvas.
            context.fillStyle = options.color;                   // Set fill color.
            context.font = options.size + 'px ' + options.font.family; // Set font style and size.
            context.textAlign = 'center';                        // Center text horizontally.
            context.textBaseline = 'middle';                     // Center text vertically.
            context.fillText( unicode, canvasSize / 2, canvasSize / 2 ); // Draw the icon.

            // Apply outline if specified in options.
            if ( options.outline ) {
                context.lineWidth = 0.5;                     // Set outline width.
                context.strokeStyle = options.outline;       // Set outline color.
                context.strokeText( unicode, canvasSize / 2, canvasSize / 2 ); // Draw outline.
            }

            // Apply flip transformation if specified.
            if ( options.flip ) {
                canvas = flipCanvas( canvas, options.flip ); // Use the helper function to flip.
            }

            // Convert the canvas content to a data URL.
            dataURL = canvas.toDataURL( 'image/png' );

            // Apply the custom cursor CSS to the selected elements.
            $( this ).css( 'cursor', [
                'url(' + dataURL + ')', // The data URL of the custom cursor image.
                options.hotspot[ 0 ],   // X-coordinate of the hotspot.
                options.hotspot[ 1 ],   // Y-coordinate of the hotspot.
                ',',                    // Separator for fallback.
                'auto'                  // Fallback cursor style.
            ].join( ' ' ) );

            // Return the jQuery object to maintain chainability.
            return this;
        }
    } );

    // Expose default options, allowing users to override them globally.
    $.fn.awesomeCursor.defaults = {
        color: '#000000',           // Default icon color (black).
        size: 18,                   // Default icon size in pixels.
        hotspot: [ 0, 0 ],          // Default hotspot at top-left corner.
        flip: '',                   // No flipping by default.
        rotate: 0,                  // No rotation by default.
        outline: null,              // No outline by default.
        font: {
            family: 'FontAwesome',  // Default font family (Font Awesome).
            cssClass: 'fa fa-%s'    // Default CSS class template for icons.
        }
    };
} );