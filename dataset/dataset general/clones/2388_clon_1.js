// This is a re-engineered version of the Juicy Slider Core.
// Initial creation by Van Ting in 2013.
// Refactored for improved readability and maintainability.
// Implemented as a standard jQuery plugin architecture.


( function( $ ) { // Wrap the plugin in an immediately invoked function expression (IIFE) for scope isolation

    $.fn.juicyslider = function( options ) { // Define the juicyslider plugin on jQuery's prototype

        // Initialize plugin settings by merging defaults with user-provided options.
        var settings = $.extend( { // Use $.extend to create a deep copy of default settings.
                // Core configuration parameters for the slider:
                mode: "cover", // Determines how images fit: "cover" (fill) or "contain" (fit within bounds).
                width: '100%', // Slider width: Use 'null' for window width, or specify 'px'/'%' values.
                height: '100%', // Slider height: Use 'null' for window height, or specify 'px'/'%' values.
                mask: "raster", // Visual mask effect: "raster", "square", "strip", or "none" for no mask.
                bgcolor: "#000", // Background color of the slider container.
                autoplay: 4000, // Autoplay interval in milliseconds. 0 disables autoplay.
                shuffle: false, // Boolean: If true, slides will be shuffled randomly.
                show: { // Parameters for the slide 'show' transition effect.
                    effect: 'fade', // jQuery UI effect name (e.g., 'fade', 'slide', 'puff').
                    duration: 1500 // Duration of the 'show' effect in milliseconds.
                },
                hide: { // Parameters for the slide 'hide' transition effect.
                    effect: 'fade', // jQuery UI effect name.
                    duration: 1500 // Duration of the 'hide' effect in milliseconds.
                }
            },
            options // User-defined options override the defaults.
        ),
        // Cache frequently accessed DOM elements and variables for performance.
        slides = this.find( 'li' ), // All individual slide elements within the slider container.
        amount = slides.length, // Total number of slides available.
        current = 0, // Index of the currently active slide (0-based).

        // Core function to handle slide transitions.
        turnSlide = function( event ) {
            var step = 1; // Default step for navigation (e.g., next slide).

            // Check if the call originated from a click event.
            if ( event ) {
                event.preventDefault(); // Prevent default browser actions (e.g., link clicks).
                step = event.data.step; // Extract the navigation step from event data (-1 for prev, 1 for next).
            }

            // Apply shuffling logic if enabled.
            if ( settings.shuffle )
            { // If shuffle is true, pick a random step.
                step = Math.floor( Math.random() * ( amount - 1 ) + 1 ); // Random step, ensuring it's not 0.
            }

            // Hide the current slide with the configured effect.
            $( slides[ current ] ).hide( settings.hide );

            // Calculate the index of the next slide, handling wrap-around for both positive and negative steps.
            current = ( ( ( current + step ) % amount ) + amount ) % amount;

            // Temporarily display the next slide to measure its dimensions accurately before hiding it again.
            $( slides[ current ] ).css( { display: 'block' } );

            // Recalculate and apply image resizing based on new slide.
            resizeImg();

            // Hide the slide again, as it will be shown with an effect shortly.
            $( slides[ current ] ).css( { display: 'none' } );

            // Show the newly selected slide with the configured effect.
            $( slides[ current ] ).show( settings.show );
        },

        // Cache the window object for resize events and dimensions.
        theWindow = $( window ),

        // Reference to the main slider container element (the jQuery object on which the plugin was called).
        viewport = this;


        // Apply the background color to the slider container.
        this.css( 'background-color', settings.bgcolor );


        // Configure the mask image based on settings.
        // If mask is 'none', no background image is set.
        this.find( '.mask' ).css( 'background-image', settings.mask == 'none' ? 'none' : 'url(./img/' + settings.mask + '.png)' );


        // Attach click handlers for navigation buttons.
        this.find( '.nav.next' ).click( { step: 1 }, turnSlide ); // 'Next' button advances by 1.
        this.find( '.nav.prev' ).click( { step: -1 }, turnSlide ); // 'Prev' button goes back by 1.


        // Set up autoplay if the interval is greater than 0.
        if ( settings.autoplay > 0 ) {
            setInterval( turnSlide, settings.autoplay ); // Repeatedly call turnSlide at the specified interval.
        }


        /*
         *  Function to dynamically resize background images within the slider.
         *  Ensures images fit or cover the viewport based on 'mode' setting.
         */
        function resizeImg() {

            // Determine and set the slider's viewport dimensions.
            // If width/height are null, use window dimensions; otherwise, use specified values.
            viewport.width( settings.width == null ? theWindow.width() : settings.width );
            viewport.height( settings.height == null ? theWindow.height() : settings.height );

            // Retrieve current viewport dimensions after potential resizing.
            var vieww = viewport.width();
            var viewh = viewport.height();
            var viewRatio = vieww / viewh; // Aspect ratio of the viewport.

            // Get the image element within the current slide.
            var bgimg = $( slides[ current ] ).find( "img" ); // The image element that needs resizing.


            // Inner function to perform the actual resizing calculations and CSS application.
            var doResize = function() {

                var imgRatio = bgimg.width() / bgimg.height(); // Aspect ratio of the image.

                // Logic to apply 'maxw' (max-width) or 'maxh' (max-height) classes
                // and calculate position for 'cover' or 'contain' modes.
                if ( ( viewRatio < imgRatio && settings.mode == 'contain' ) || ( viewRatio >= imgRatio && settings.mode == 'cover' ) ) {

                    bgimg.removeClass( 'maxh' ).addClass( 'maxw' ).css( {
                        // Calculate vertical offset to center the image if max-width is applied.
                        top: ( viewh - vieww / imgRatio ) / 2,
                        left: 0
                    } );
                } else {
                    bgimg.removeClass( 'maxw' ).addClass( 'maxh' ).css( {
                        // Calculate horizontal offset to center the image if max-height is applied.
                        top: 0,
                        left: ( vieww - imgRatio * viewh ) / 2
                    } );
                }
            };

            // Check if the image is already loaded. If so, resize immediately.
            // Otherwise, wait for the image to load before resizing.
            bgimg.get( 0 ).complete ? doResize() : bgimg.load( doResize );
        }

        // Attach resize event handler to the window and trigger it once initially
        // to set up the correct image dimensions on page load.
        theWindow.resize( resizeImg ).trigger( 'resize' );

        // Return the jQuery object to maintain chainability.
        return this;
    };

} ( jQuery ) ); // Pass jQuery to the IIFE.