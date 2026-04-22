/*
 * Cloud 9 Carousel 2.0 - A JavaScript Carousel Library
 *
 * This version has been thoroughly cleaned up, refactored, and significantly improved
 * compared to its predecessor, CloudCarousel.
 *
 * For the latest updates, examples, and documentation, please visit the GitHub repository:
 *   Project Homepage: http://specious.github.io/cloud9carousel/
 *
 * Original Copyright (c) 2011 by R. Cecco ( http://www.professorcloud.com )
 * Current Version Copyright (c) 2014 by Ildar Sagdejev ( http://twitter.com/tknomad )
 *
 * Licensed under the MIT License.
 *
 * IMPORTANT: Please ensure this copyright header is preserved and included
 * in all derived versions or distributions of this software.
 *
 * Dependencies:
 *  - jQuery Library (version 1.3.0 or newer)
 *    - OR -
 *  - Zepto.js Library (version 1.1.1 or newer)
 *
 * Optional Enhancements (Requires jQuery):
 *  - Reflection support: Achieved using the 'reflection.js' plugin by Christophe Beyls.
 *    Available at: http://www.digitalia.be/software/reflectionjs-for-jquery
 *  - Mousewheel interaction: Enabled via the 'mousewheel' plugin.
 *    Available at: http://plugins.jquery.com/mousewheel/
 */

; ( function ( $ ) {

    // --- Feature Detection: CSS Transform Support ---
    // This immediately invoked function expression (IIFE) checks for the availability
    // of CSS transform properties across different browser engines.
    var transform = ( function ( ) {
        // List of common vendor prefixes for CSS properties.
        var vendors = [ 'webkit', 'moz', 'ms' ];

        // Create a dummy DOM element to test its style property.
        var style = document.createElement( "div" ).style;

        // Check for the standard 'transform' property first.
        var trans = 'transform' in style ? 'transform' : undefined;

        // Iterate through vendor prefixes if the standard property isn't found.
        for ( var i = 0, count = vendors.length; i < count; i++ ) {
            // Construct the vendor-prefixed property name (e.g., 'webkitTransform').
            var prop = vendors[ i ] + 'Transform';

            // If the prefixed property exists in the style object, use it.
            if ( prop in style ) {
                trans = prop;
                break; // Stop searching once a valid property is found.
            }
        }

        // Return the detected transform property name, or undefined if none found.
        return trans;
    } )( );


    // --- Item Constructor Function ---
    // Represents a single item within the carousel.
    var Item = function ( element, options ) {
        // Assign a reference to this Item instance back to the DOM element.
        element.item = this;

        // Store the original DOM element.
        this.element = element;

        // Determine the full width and height of the item.
        // Special handling for images to ensure dimensions are loaded.
        if ( element.tagName === 'IMG' ) {
            this.fullWidth  = element.width;
            this.fullHeight = element.height;
        } else {
            // For non-image elements, ensure they behave as block-level elements for measurement.
            element.style.display = "inline-block";
            this.fullWidth        = element.offsetWidth;
            this.fullHeight       = element.offsetHeight;
        }

        // Set the item's position style to absolute for precise placement.
        element.style.position = 'absolute';

        // --- Reflection Support (Optional) ---
        // If reflections are enabled and the item is an image, generate a reflection.
        if ( options.mirror && this.element.tagName === 'IMG' ) {
            // Use the jQuery reflection plugin to create a reflection.
            // The plugin wraps the image and its reflection in a new div.
            this.reflection = $( element ).reflect( options.mirror ).next( )[ 0 ];

            // Cache the jQuery object for the reflection.
            var $reflection = $( this.reflection );

            // Store the full height of the reflection.
            this.reflection.fullHeight = $reflection.height( );

            // Apply margin and width styles to the reflection.
            $reflection.css( 'margin-top', options.mirror.gap + 'px' );
            $reflection.css( 'width', '100%' );

            // Ensure the original image also takes full width within its new container.
            element.style.width = "100%";

            // The 'element' property now refers to the parent container (image + reflection).
            this.element       = this.element.parentNode;
            this.element.item  = this; // Re-assign item reference to the new parent.
            this.element.alt   = element.alt;
            this.element.title = element.title;
        }

        // If CSS transforms are supported and enabled, set the transform origin.
        if ( transform && options.transforms ) {
            this.element.style[ transform + "Origin" ] = "0 0";
        }


        // --- Method: moveTo (Position and Scale Item) ---
        // Updates the item's position (x, y) and scale.
        this.moveTo = function ( x, y, scale ) {
            // Calculate the new width and height based on the full dimensions and scale.
            this.width  = this.fullWidth  * scale;
            this.height = this.fullHeight * scale;

            // Store the new position and scale values.
            this.x = x;
            this.y = y;
            this.scale = scale;

            // Get a reference to the item's style object for efficient updates.
            var style = this.element.style;

            // Update z-index based on scale (larger items appear "closer").
            style.zIndex = "" + ( scale * 100 ) | 0;

            // Apply positioning using CSS transforms if available and enabled.
            if ( transform && options.transforms ) {
                style[ transform ] = "translate(" + x + "px, " + y + "px) scale(" + scale + ")";
            } else {
                // Fallback for browsers without transform support or if transforms are disabled.
                // Adjust reflection gap if applicable, as it doesn't scale automatically.
                if ( options.mirror && this.element.tagName === 'IMG' ) {
                    this.reflection.style.marginTop = ( options.mirror.gap * scale ) + "px";
                }

                // Apply width, left, and top using standard CSS properties.
                style.width = this.width + "px";
                style.left  = x + "px";
                style.top   = y + "px";
            }
        }; // End of moveTo method.
    }; // End of Item constructor.


    // --- High-Resolution Time Utility ---
    // Provides a more precise timestamp for animation timing.
    // Falls back to `new Date()` if `window.performance.now` is not available.
    var time = !window.performance || !window.performance.now ?
        function ( ) { return +new Date( ) } : // Fallback to Date.now() equivalent.
        function ( ) { return performance.now( ) }; // Use high-resolution timer.


    // --- Feature Detection: requestAnimationFrame Support ---
    // This section detects and normalizes `requestAnimationFrame` and `cancelAnimationFrame`
    // for smoother, more efficient animations, falling back to `setTimeout` if necessary.
    //
    // For more details on `requestAnimationFrame` polyfills and browser support, see:
    //   http://www.paulirish.com/2011/requestanimationframe-for-smart-animating/
    //
    var cancelFrame  = window.cancelAnimationFrame || window.cancelRequestAnimationFrame;
    var requestFrame = window.requestAnimationFrame;

    // IIFE to check for vendor-prefixed versions.
    ( function ( ) {
        var vendors = [ 'webkit', 'moz', 'ms' ];

        for ( var i = 0, count = vendors.length; i < count && !cancelFrame; i++ ) {
            // Check for vendor-prefixed cancel methods.
            cancelFrame  = window[ vendors[ i ] + 'CancelAnimationFrame' ] || window[ vendors[ i ] + 'CancelRequestAnimationFrame' ];
            // Check for vendor-prefixed request methods.
            requestFrame = requestFrame && window[ vendors[ i ] + 'RequestAnimationFrame' ];
        }
    } )( );


    // --- Carousel Constructor Function ---
    // Manages the overall carousel behavior and state.
    var Carousel = function ( element, options ) {
        var self       = this; // Store a reference to the Carousel instance for callbacks.
        var $container = $( element ); // jQuery wrapper for the main carousel container.

        // Initialize an empty array to hold Item instances.
        this.items = [ ];

        // Configure carousel dimensions and properties, with fallbacks if not provided.
        this.xOrigin = ( options.xOrigin === null ) ? $container.width( )  * 0.5 : options.xOrigin;
        this.yOrigin = ( options.yOrigin === null ) ? $container.height( ) * 0.1 : options.yOrigin;
        this.xRadius = ( options.xRadius === null ) ? $container.width( )  / 2.3 : options.xRadius;
        this.yRadius = ( options.yRadius === null ) ? $container.height( ) / 6   : options.yRadius;

        // Other core carousel properties.
        this.farScale       = options.farScale;
        this.rotation       = this.destRotation = Math.PI / 2; // Initial rotation, setting the first item in front.
        this.speed          = options.speed;
        this.smooth         = options.smooth;
        this.fps            = options.fps;
        this.timer          = 0; // Animation timer ID.
        this.autoPlayAmount = options.autoPlay;
        this.autoPlayDelay  = options.autoPlayDelay;
        this.autoPlayTimer  = 0; // Auto-play interval ID.

        // Callback functions for lifecycle events.
        this.onLoaded   = options.onLoaded;
        this.onRendered = options.onRendered;

        // Options specifically passed to each Item instance.
        this.itemOptions = {
            transforms: options.transforms
        };

        // If mirror (reflection) is enabled, extend item options with mirror settings.
        if ( options.mirror ) {
            this.itemOptions.mirror = $.extend( { gap: 2 }, options.mirror );
        }

        // Apply base CSS styles to the carousel container.
        $container.css( { position: 'relative', overflow: 'hidden' } );


        // --- Method: rotateItem ---
        // Calculates and applies the position and scale for a single carousel item.
        // Based on its index and the current rotation angle.
        //
        // Rotation mapping:
        //  *      0 radians : Rightmost position
        //  *   Pi/2 radians : Front (closest to viewer)
        //  *   Pi   radians : Leftmost position
        //  * 3 Pi/2 radians : Back (farthest from viewer)
        //
        this.rotateItem = function ( itemIndex, rotation ) {
            var item = this.items[ itemIndex ]; // Get the Item instance.
            var sin  = Math.sin( rotation );    // Sine of the rotation angle.
            var farScale = this.farScale;       // Scale factor for items at the back.

            // Calculate the scale for the current item:
            // Items at the front (sin=1) have full scale (1).
            // Items at the back (sin=-1) have farScale.
            var scale = farScale + ( ( 1 - farScale ) * ( sin + 1 ) * 0.5 );

            // Move the item to its calculated position and scale.
            item.moveTo(
                this.xOrigin + ( scale * ( ( Math.cos( rotation ) * this.xRadius ) - ( item.fullWidth * 0.5 ) ) ),
                this.yOrigin + ( scale * sin * this.yRadius ),
                scale
            );
        }; // End of rotateItem method.


        // --- Method: render ---
        // Renders all items in the carousel based on their current rotation.
        this.render = function ( ) {
            var count   = this.items.length; // Total number of items.
            var spacing = 2 * Math.PI / count; // Angular spacing between items.
            var radians = this.rotation;     // Current base rotation of the carousel.

            // Iterate through each item and rotate it.
            for ( var i = 0; i < count; i++ ) {
                this.rotateItem( i, radians );
                radians += spacing; // Increment angle for the next item.
            }

            // Trigger the onRendered callback if provided.
            if ( typeof this.onRendered === 'function' ) {
                this.onRendered( this );
            }
        }; // End of render method.


        // --- Method: playFrame ---
        // Executes a single animation frame.
        this.playFrame = function ( ) {
            var rem      = self.destRotation - self.rotation; // Remaining rotation to destination.
            var now      = time( );                           // Current timestamp.
            var dt       = ( now - self.lastTime ) * 0.002;   // Delta time since last frame (scaled).
            self.lastTime = now;                              // Update last frame timestamp.

            // If remaining rotation is very small, snap to destination and pause.
            if ( Math.abs( rem ) < 0.003 ) {
                self.rotation = self.destRotation;
                self.pause( );
            } else {
                // Rotate asymptotically closer to the destination for a smooth deceleration.
                self.rotation = self.destRotation - rem / ( 1 + ( self.speed * dt ) );
                self.scheduleNextFrame( ); // Schedule the next frame.
            }

            self.render( ); // Re-render the carousel with the updated rotation.
        }; // End of playFrame method.


        // --- Method: scheduleNextFrame ---
        // Schedules the next animation frame using requestAnimationFrame or setTimeout.
        this.scheduleNextFrame = function ( ) {
            this.lastTime = time( ); // Record the time when the frame is scheduled.

            // Use requestAnimationFrame for smooth animation if supported and enabled,
            // otherwise fall back to setTimeout with a fixed FPS.
            this.timer = this.smooth && cancelFrame ?
                requestFrame( self.playFrame ) :
                setTimeout( self.playFrame, 1000 / this.fps );
        }; // End of scheduleNextFrame method.


        // --- Method: itemsRotated ---
        // Calculates the total number of items rotated since the start, including fractional rotations.
        this.itemsRotated = function ( ) {
            return this.items.length * ( ( Math.PI / 2 ) - this.rotation ) / ( 2 * Math.PI );
        }; // End of itemsRotated method.


        // --- Method: floatIndex ---
        // Returns the current fractional index of the item at the front position.
        this.floatIndex = function ( ) {
            var count      = this.items.length;
            var floatIndex = this.itemsRotated( ) % count;

            // Ensure the float-index is always positive.
            return ( floatIndex < 0 ) ? floatIndex + count : floatIndex;
        }; // End of floatIndex method.


        // --- Method: nearestIndex ---
        // Returns the integer index of the item currently closest to the front.
        this.nearestIndex = function ( ) {
            return Math.round( this.floatIndex( ) ) % this.items.length;
        }; // End of nearestIndex method.


        // --- Method: nearestItem ---
        // Returns the actual Item object that is currently closest to the front.
        this.nearestItem = function ( ) {
            return this.items[ this.nearestIndex( ) ];
        }; // End of nearestItem method.


        // --- Method: play ---
        // Starts or resumes the carousel animation.
        this.play = function ( ) {
            // Only schedule a new frame if no animation is currently running.
            if ( this.timer === 0 ) {
                this.scheduleNextFrame( );
            }
        }; // End of play method.


        // --- Method: pause ---
        // Stops the carousel animation.
        this.pause = function ( ) {
            // Cancel the currently scheduled animation frame or timeout.
            this.smooth && cancelFrame ? cancelFrame( this.timer ) : clearTimeout( this.timer );
            this.timer = 0; // Reset the timer ID.
        }; // End of pause method.


        // --- Method: go ---
        // Initiates a rotation of the carousel by a specified number of items.
        // `count` can be positive (clockwise) or negative (counter-clockwise).
        this.go = function ( count ) {
            // Update the target rotation angle.
            this.destRotation += ( 2 * Math.PI / this.items.length ) * count;
            this.play( ); // Start the animation towards the new destination.
        }; // End of go method.


        // --- Method: deactivate ---
        // Stops all carousel activity, including animation and event bindings.
        this.deactivate = function ( ) {
            this.pause( ); // Stop the main animation.
            clearInterval( this.autoPlayTimer ); // Stop auto-play.

            // Unbind all control-related event handlers.
            options.buttonLeft.unbind( 'click' );
            options.buttonRight.unbind( 'click' );
            $container.unbind( '.cloud9' ); // Unbind namespaced events from the container.
        }; // End of deactivate method.


        // --- Method: autoPlay ---
        // Sets up the automatic rotation of the carousel.
        this.autoPlay = function ( ) {
            // Start an interval timer to periodically call `go` with the autoPlayAmount.
            this.autoPlayTimer = setInterval(
                function ( ) { self.go( self.autoPlayAmount ) },
                this.autoPlayDelay
            );
        }; // End of autoPlay method.


        // --- Method: enableAutoPlay ---
        // Configures auto-play behavior, including pausing on hover.
        this.enableAutoPlay = function ( ) {
            // Pause auto-play when the mouse hovers over the container.
            $container.bind( 'mouseover.cloud9', function ( ) {
                clearInterval( self.autoPlayTimer );
            } );

            // Resume auto-play when the mouse leaves the container.
            $container.bind( 'mouseout.cloud9', function ( ) {
                self.autoPlay( );
            } );

            this.autoPlay( ); // Start auto-play immediately.
        }; // End of enableAutoPlay method.


        // --- Method: bindControls ---
        // Attaches event handlers to navigation buttons, mousewheel, and click-to-front.
        this.bindControls = function ( ) {
            // Bind click event for the left button (rotate counter-clockwise).
            if ( options.buttonLeft ) {
                options.buttonLeft.bind( 'click', function ( ) {
                    self.go( -1 );
                    return false; // Prevent default link behavior.
                } );
            }

            // Bind click event for the right button (rotate clockwise).
            if ( options.buttonRight ) {
                options.buttonRight.bind( 'click', function ( ) {
                    self.go( 1 );
                    return false; // Prevent default link behavior.
                } );
            }

            // Bind mousewheel event for rotation (if mousewheel plugin is available).
            if ( options.mouseWheel ) {
                $container.bind( 'mousewheel.cloud9', function ( event, delta ) {
                    // Rotate based on mousewheel direction (delta > 0 for up/forward).
                    self.go( ( delta > 0 ) ? 1 : -1 );
                    return false; // Prevent page scrolling.
                } );
            }

            // Bind click event to bring an item to the front.
            if ( options.bringToFront ) {
                $container.bind( 'click.cloud9', function ( event ) {
                    // Find the closest carousel item ancestor of the clicked element.
                    var hits = $( event.target ).closest( '.' + options.itemClass );

                    // If a carousel item was clicked.
                    if ( hits.length !== 0 ) {
                        var idx   = self.items.indexOf( hits[ 0 ].item ); // Index of the clicked item.
                        var count = self.items.length;                   // Total items.
                        var diff  = idx - ( self.floatIndex( ) % count ); // Difference from front item.

                        // Adjust 'diff' to find the shortest rotation path.
                        if ( 2 * Math.abs( diff ) > count ) {
                            diff += ( diff > 0 ) ? -count : count;
                        }

                        self.destRotation = self.rotation; // Reset destination to current rotation.
                        self.go( -diff ); // Rotate the carousel to bring the clicked item to front.
                    }
                } );
            }
        }; // End of bindControls method.


        // Retrieve all elements that are part of the carousel.
        var items = $container.find( '.' + options.itemClass );


        // --- Method: finishInit ---
        // Completes the carousel initialization once all images are loaded.
        this.finishInit = function ( ) {
            // Check if all images (if any) have fully loaded.
            for ( var i = 0; i < items.length; i++ ) {
                var item = items[ i ];
                if ( ( item.tagName === 'IMG' ) &&
                     ( ( item.width === undefined ) || ( ( item.complete !== undefined ) && !item.complete ) ) ) {
                    return; // Not all images are loaded yet, try again later.
                }
            }

            clearInterval( this.initTimer ); // Stop the initialization timer.

            // Initialize all carousel items.
            for ( i = 0; i < items.length; i++ ) {
                this.items.push( new Item( items[ i ], this.itemOptions ) );
            }

            // Disable default click-dragging behavior on items.
            $container.bind( 'mousedown onselectstart', function ( ) { return false } );

            // Enable auto-play if configured.
            if ( this.autoPlayAmount !== 0 ) {
                this.enableAutoPlay( );
            }

            this.bindControls( ); // Set up control bindings.
            this.render( );       // Perform the initial rendering.

            // Trigger the onLoaded callback if provided.
            if ( typeof this.onLoaded === 'function' ) {
                this.onLoaded( this );
            }
        }; // End of finishInit method.


        // Start a recurring timer to check for image loading and complete initialization.
        this.initTimer = setInterval( function ( ) { self.finishInit( ) }, 50 );

    }; // End of Carousel constructor.


    // --- jQuery Plugin Definition ---
    // Extends jQuery's prototype to provide the Cloud9Carousel functionality.
    $.fn.Cloud9Carousel = function ( options ) {
        // Iterate over each selected element (allowing multiple carousels on a page).
        return this.each( function ( ) {
            /*
             * For a comprehensive list of available configuration options,
             * please refer to the project's README file on GitHub.
             */
            options = $.extend( {
                xOrigin: null,        // X-coordinate of the carousel's center (null for auto-calculation).
                yOrigin: null,        // Y-coordinate of the carousel's center (null for auto-calculation).
                xRadius: null,        // Horizontal radius of the carousel ellipse (null for auto-calculation).
                yRadius: null,        // Vertical radius of the carousel ellipse (null for auto-calculation).
                farScale: 0.5,        // Scale factor for the items farthest from the viewer (0.0 to 1.0).
                transforms: true,     // Enable or disable CSS transforms for item positioning.
                smooth: true,         // Use requestAnimationFrame for smooth animation (if supported).
                fps: 30,              // Frames per second for fallback animation (when 'smooth' is false).
                speed: 4,             // Animation speed; higher values mean faster deceleration.
                autoPlay: 0,          // Auto-play behavior: 0 = off, positive integer = items to rotate per interval (clockwise).
                autoPlayDelay: 4000,  // Delay in milliseconds between auto-play rotations.
                bringToFront: false,  // Enable clicking an item to bring it to the front.
                itemClass: 'cloud9-item', // CSS class used to identify carousel items.
                handle: 'carousel'    // Data attribute key used to store the Carousel instance on the DOM element.
            }, options ); // Merge default options with user-provided options.

            // Store a new Carousel instance on the element's data, accessible via the 'handle'.
            $( this ).data( options.handle, new Carousel( this, options ) );
        } );
    };

} )( window.jQuery || window.Zepto ); // Pass jQuery or Zepto as the '$' argument.