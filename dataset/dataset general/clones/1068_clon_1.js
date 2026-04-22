/*
 * This is a Type I clone of the original Srcery JavaScript module.
 * It provides responsive image handling with srcset polyfill and lazy loading.
 *
 * Changes from the original are strictly limited to whitespace and comments,
 * ensuring logical and structural identity while appearing visually distinct.
 *
 * All variable names, function names, operators, and expressions are
 * preserved exactly as they were in the source code.
 */

var Srcery = ( function ( ) {

    // Internal configuration limits for behavior like delay, eagerness, and batch size.
    var limits = { delay: 400, eagerness: 3, batchLength: 6 },

        // Shorthands for document and window objects for brevity.
        d = document,
        g = window,

        // Variables for tracking batch processing and current scroll position.
        batchIndex = 0,
        position = 0,

        // Loop counters and temporary storage variables.
        i,
        hold,
        len,
        s,

        // Variables to store image source and srcset attributes.
        src,
        srcset,

        // Viewport dimensions, cached for performance.
        vHeight,
        vWidth,

        // Image width for srcset parsing.
        w,

        // Flag to indicate if a batch processing timeout is queued.
        queued,

        // Function declarations (will be defined later).
        attr,
        getImages,
        onEvent,
        inViewport,
        loadImage,
        runImages;


    // Helper function to manage HTML attributes: get or set.
    // Accepts two or three arguments.
    attr = function ( ) {

        // If three arguments are provided (element, attributeName, value),
        // it means we are attempting to set an attribute.
        return arguments.length - 2 ?

            // Check if the current attribute value is different from the new value.
            // If it is, set the attribute and return the result of the comparison.
            ( attr( arguments[0], arguments[1] ) != arguments[2] ) && arguments[0].setAttribute( arguments[1], arguments[2] ) :

            // If only two arguments are provided (element, attributeName),
            // it means we are attempting to get an attribute.
            arguments[0].getAttribute( arguments[1] );
    };


    // Populates the 'imgs' variable with a collection of image elements.
    // Prioritizes 'data-srcset' for responsive images, falls back to all 'img' tags.
    getImages = function ( ) {

        // Use querySelectorAll for modern browsers, targeting images with 'data-srcset'.
        // Fallback to getElementsByTagName for older browsers.
        imgs = d.querySelectorAll ?
               d.querySelectorAll( 'img[data-srcset]' ) :
               d.getElementsByTagName( 'img' );

    };


    // Cross-browser event listener attachment.
    onEvent = function ( event, action ) {

        // Modern browsers using addEventListener.
        g.addEventListener ?
            this.addEventListener( event, action, false ) :

            // IE-specific attachEvent.
            ( g.attachEvent ) ?
                this.attachEvent( 'on' + event, action ) :

                // Fallback for very old browsers (or specific contexts).
                ( this[ 'on' + event ] = action );

    };


    // Checks if an element is currently within the viewport,
    // optionally considering an 'eagerness' buffer.
    inViewport = function ( el ) {

        // If an image has an 'data-original-src' attribute, it means it has
        // already been processed or loaded, so it's effectively "in viewport".
        if ( attr( el, 'data-original-src' ) ) {
            return true;
        }

        // Retrieve the size and position of the element relative to the viewport.
        var rect = el.getBoundingClientRect( );

        // Determine if the element's bounding box intersects with the viewport,
        // extended by an 'eagerness' factor.
        return (
           rect.left   >= 0 - limits.eagerness * viewportHeight( ) &&
           rect.top <= limits.eagerness * viewportHeight( )
        );

    };


    // Sets the 'src' attribute of an image, but only if it's different
    // from the current 'src' to avoid unnecessary reloads.
    loadSrc = function ( img, src ) {

        // Compare current 'src' with the new one.
        if ( attr( img, 'src' ) != src ) {

            // Increment batch index to track images loaded in the current batch.
            batchIndex += 1;

            // Set the 'src' attribute. This triggers the image load.
            attr( img, 'src', src );

        }
    };


    // Processes a single image element to determine and load the appropriate source.
    loadImage = function ( img ) {

        // Get the 'data-srcset' attribute value.
        srcset = attr( img, 'data-srcset' );

        // If no 'data-srcset' attribute, there's nothing to do here.
        if ( !srcset ) {
            return;
        }

        // If the image's original source hasn't been saved yet, save it.
        // This is useful for potential restoration or tracking.
        if ( !attr( img, 'data-original-src' ) ) {
            attr( img, 'data-original-src', attr( img, 'src' ) );
        }

        // Split the srcset string into an array of individual source candidates.
        // Handles both comma and optional space after comma.
        srcset = srcset.split( /, ?/ );

        // Iterate through each candidate in the srcset array.
        for ( s = 0; s < srcset.length; s++ ) {

            // Check if the srcset candidate ends with 'w' (e.g., "image.jpg 300w").
            if ( !srcset[s].match( /\dw$/ ) ) {

                // If no 'w' descriptor, it's a regular lazy load candidate.
                src = srcset[s];
                loadSrc( img, src );

            } else {

                // Capture the numeric width value (e.g., "300" from "300w").
                w = +srcset[s].match( /\d+(?=w$)/ );

                // If the candidate width is less than or equal to the viewport width,
                // it's a suitable source for the current display.
                if ( w <= vWidth ) {

                    // Extract the actual image URL (before the 'w' descriptor).
                    src = srcset[s].split( / / )[0];
                    loadSrc( img, src );

                    // Once a suitable source is found and loaded, stop processing this srcset.
                    break;

                }
            }
        }
    };


    // Main function to iterate through images, check viewport visibility,
    // and trigger image loading in batches.
    runImages = function ( ) {

        // Exit immediately if a processing hold is active.
        if ( !hold ) {

            hold = true; // Set hold to true to prevent re-entry.

            // Recalculate viewport width once per 'runImages' call for efficiency.
            vWidth = viewportWidth( );
            queued = false; // Reset queued flag for new batch.

            len = imgs.length; // Cache images array length.

            // Ensure 'position' is valid, resetting to 0 if it's not explicitly set.
            // This line `position == position ? 0 : position;` is a bit unusual;
            // it effectively does nothing if `position` is a number,
            // but if `position` somehow became `NaN`, it would set it to `0`.
            // A more direct `position = position || 0;` might be clearer.
            position = position == position ? 0 : position;


            // Loop through images starting from the current 'position'.
            for ( i = position; i < len; i++ ) {

                // Check if the current batch size limit has not been reached.
                if ( batchIndex < limits.batchLength ) {

                    // If the image is within the viewport, load it.
                    if ( inViewport( imgs[i] ) ) {
                        loadImage( imgs[i] );
                    }

                } else { // If batch limit is reached.

                    // If a new batch processing hasn't been queued yet.
                    if ( !queued ) {
                        queued = true; // Mark as queued.

                        // Schedule the next batch to run after a short delay.
                        // This allows the browser to render current batch.
                        setTimeout( function ( ) {
                            batchIndex = queued = 0; // Reset batch counter and queued flag.
                            position = i; // Save current position for the next run.
                            runImages( ); // Recursively call runImages for the next batch.
                        }, limits.delay / 10 ); // Shorter delay for batch continuation.
                        return; // Exit current runImages call.
                    }
                }
            }

            // If the loop finishes without hitting batch limit or queuing,
            // reset hold and queued for the next event.
            hold = queued = false;

        } else { // If 'hold' is true (meaning runImages is already active or recently active).

            // If a delayed rerun hasn't been queued yet.
            if ( !queued ) {
                queued = true; // Mark as queued.

                // Schedule a rerun after the main delay.
                // This prevents rapid, consecutive calls to runImages.
                setTimeout( function ( ) {
                    if ( hold ) { // Only proceed if still on hold.
                        hold = queued = false; // Release hold and reset queued.
                        runImages( ); // Rerun the image processing.
                    }
                }, limits.delay ); // Standard delay for event throttling.
            }
        }
    };


    // Calculates and caches the viewport height.
    viewportHeight = function ( ) {

        // Cache 'vHeight' after first calculation,
        // falls back to documentElement.clientHeight for older IE.
        return vHeight = vHeight ||
            ( g.innerHeight || d.documentElement.clientHeight );

    };


    // Calculates the effective viewport width,
    // accounting for device pixel ratio (retina displays).
    viewportWidth = function ( ) {

        // Use window.innerWidth for modern browsers,
        // fallback to document.body.parentNode.clientWidth for older IE/quirks mode.
        // Multiply by devicePixelRatio for high-DPI screens.
        return ( g.innerWidth || d.body.parentNode.clientWidth ) * ( g.devicePixelRatio || 1 );

    };


    // Initial setup: reset flags.
    queued = hold = false;

    // First call to get the initial set of images.
    getImages( );

    // Attach event listeners for initial load and dynamic changes.
    onEvent( 'load', runImages ); // Run on page load.
    onEvent( 'orientationchange', function ( ) {
        // When orientation changes, reset cached height and force a rerun.
        vHeight = 0; // Invalidate cached viewport height.
        hold = false; // Release any active hold.
        runImages( ); // Trigger image re-evaluation.
    } );
    onEvent( 'scroll', runImages ); // Run on scroll events.
    onEvent( 'orientationchange', runImages ); // Redundant, but kept for clone fidelity.


    // If 'imgs' array is empty after initial `getImages`,
    // try again after a short delay, useful for dynamically loaded content.
    !imgs.length &&
        setTimeout( getImages, limits.delay );


    // Public interface for the Srcery module.
    return ( {

        // Allows dynamic updates to the internal limits configuration.
        // Example usage: Srcery.set( { eagerness: 1 } );
        set: function ( options ) {
            for ( var property in options ) {
                // Ensure the property belongs to the options object itself, not its prototype chain.
                if ( options.hasOwnProperty( property ) ) {
                    limits[ property ] = options[ property ];
                }
            }
        },

        // Allows adding new image elements to the tracking array.
        // Useful for images loaded via AJAX after initial page load.
        // Example usage: Srcery.push( newImageElement );
        push: function ( img ) {
            return imgs.push( img );
        },

        // Immediately loads all images, bypassing lazy loading.
        // Example usage: Srcery.now();
        now: function ( ) {
            for ( i = 0, len = imgs.length; i < len; i++ ) {
                loadImage( imgs[i] );
            }
        }

        // Optional internal debug method (commented out in original).
        //, imgs: function ( ) {
        //    return imgs;
        //}

    } );

} ) ( ); // Immediately invoked function expression (IIFE)