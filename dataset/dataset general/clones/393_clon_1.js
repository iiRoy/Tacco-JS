/**
 *  ===================
 *  jQuery humbleSlider
 *  ===================
 *  @author   Alexander Junger
 *  @version  0.5.3
 *
 *  For information regarding use, distribution, and any modifications
 *  to this software, please refer to the accompanying license file.
 */


( function($) {

    $.fn.humbleSlider = function humbleSlider ( config ) {

        function HumbleSlider ( el, config ) {
            // Store the main element as a jQuery object
            this.$el = $( el );
            // Find the container element within the slider
            this.$container = this.$el.find( ".container" );
            // Locate all individual slider image elements
            this.$images = this.$container.find( ".slider-image" );

            // Store the configuration settings
            this.config = config;

            // Apply CSS transition properties to the container for smooth sliding
            this.$container.css( 'transition', 'left ' + this.config.speed + 's ease' );


            // Initialize the current image index to the first image
            this.currentImage = 0;
            // Total number of images in the slider, will be calculated later
            this.totalImages = null;

            // Perform initial setup for the slider
            this.init();
        }

        // Define prototype methods for the HumbleSlider object
        HumbleSlider.prototype = {
            /**
             *  Determines if the slider contains only a single image.
             *  This is useful for disabling navigation controls when not needed.
             *  @returns {boolean} True if only one image is present, false otherwise.
             */
            isSingular : function( ) {
                // Count slider images, excluding any 'overview' elements, and check if count is <= 1
                return ( $( this.$el ).find( ".slider-image" ).not( ".overview" ).length ) <= 1;
            },

            // Initializes the slider's event listeners and layout
            init : function ( ) {
                // Placeholder for future refactoring relating to an 'overview' feature.
                // It was previously commented out, indicating it's not active.

                // $(this.config.swipe.trigger).find(this.$el).find('.overview').remove();

                // Add navigation controls to the DOM if the slider is not singular and navigation is enabled.
                if ( !this.isSingular( ) && this.config.navigation ) {
                    this.$el.append(
                        "<a href='#' class='slider-controls'>" +
                            "<img class='next' src='" + this.config.nextImage + "'/>" +
                            "<span class='counter'>" + ( this.currentImage + 1 ) + "/" + ( this.totalImages ) + "</span>" +
                            "</a>"
                    );
                }

                /**
                 *  Binds a click event listener to the slider controls.
                 *  When clicked, it prevents default action and triggers a slide to the next image.
                 */
                this.$el.find( ".slider-controls" ).on( "click", function( e ) {
                    e.preventDefault( ); // Prevent default link behavior
                    this.inputHandler( 1 ); // Move to the next image
                }.bind( this ) ); // Ensure 'this' context refers to the HumbleSlider instance

                /**
                 *  Another placeholder for future refactoring related to an 'overview' feature.
                 *  This section was also commented out previously.
                 */

                // this.$el.find(".thumbnail-image").on("click", this.thumbnailListener.bind(this));


                // If there's only one image, hide the navigation controls
                if ( this.totalImages == 1 ) {
                    this.$el.find( ".slider-controls" ).addClass( "hide" );
                }
                /**
                 *  This block was commented out, suggesting a feature to stop a swipe suggestion
                 *  interval when the slider is interacted with.
                 */
                /*
                 else {
                    // stop suggesting swipe, if present, as soon as the slider is clicked on
                    this.$el.on('click', function() {
                        clearInterval(this.swipeSuggestInterval);
                    });
                }
                 */

                // Enable swipe gestures if configured
                if ( this.config.swipe.enabled ) {
                    $( this.config.swipe.trigger ).find( this.$container ).swipe( {
                        triggerOnTouchEnd : true, // Trigger swipe events on touch end
                        swipeStatus : this.swipeStatus.bind( this ), // Handle swipe status changes
                        allowPageScroll:"vertical" // Allow vertical page scrolling during horizontal swipes
                    } );
                }

                // Support slider navigation using keyboard arrow keys if enabled
                if ( this.config.key.enabled ) {
                    $( document ).keydown( function( e ) {
                        // Check which key was pressed
                        switch ( e.which ) {
                            case this.config.key.previous: // Left arrow key for previous image
                                this.inputHandler( -1 );
                                break;

                            case this.config.key.next: // Right arrow key for next image
                                this.inputHandler( 1 );
                                break;

                            default: return; // Ignore other keys
                        }
                        e.preventDefault( ); // Prevent default browser actions for arrow keys
                    }.bind( this ) ); // Bind 'this' to the HumbleSlider instance
                }

                // Calculate the total number of images after initialization
                this.totalImages = this.$el.find( '.slider-image' ).length;
                // Adjust the slider's size and layout
                this.adjustSize( );
                // Update the image counter display
                this.refreshCounter( );
            },

            /**
             *  This method was commented out, suggesting a thumbnail click listener for an overview feature.
             *  @param e The event object for the click on the thumbnail.
             *
             thumbnailListener : function(e) {
                e.preventDefault();
                var transitionOffset = this.currentImage;
                this.currentImage = parseInt(e.currentTarget.dataset.image, 10);
                transitionOffset -= this.currentImage;
                this.slide(transitionOffset);
            },
             */

            /**
             *  Adjusts all necessary CSS values to ensure the slider functions correctly.
             *  This includes setting overflow, width, and float properties.
             */
            adjustSize : function( ) {
                this.$el.css( "overflow", "hidden" ); // Hide overflow content
                this.$container.css( {
                    width: this.totalImages * 100 + "%" // Set container width to accommodate all images
                } );
                this.$images.css( {
                    float: "left", // Float images left to arrange them horizontally
                    width: 100 / this.totalImages + "%" // Each image takes an equal percentage of the container width
                } );

                // Initialize hisrc for high-resolution images, if available
                this.$images.find( 'img' ).hisrc( { useTransparentGif: true } );
                // Set aspect ratio for image containers
                this.$images.find( '.img-container' ).css( {
                    'height': '0px', // Use padding-top for aspect ratio
                    'padding-top': this.config.height // Height based on configuration (e.g., 50% for 2:1 aspect)
                } );
            },

            /**
             *  Updates the counter text to reflect the currently displayed image.
             *  The counter typically shows "currentImage / totalImages".
             */
            refreshCounter : function( ) {
                this.$el.find( ".counter" ).text( ( this.currentImage + 1 ) + "/" + ( this.totalImages ) );
            },

            /**
             *  This method was commented out, intended to refresh control visibility based on the current image.
             *
             refreshControls : function() {
                if(this.currentImage === this.totalImages-1) {
                    this.$el.find(".slider-controls").addClass("hide");
                } else {
                    this.$el.find(".slider-controls").removeClass("hide");
                }
            },
             */

            /**
             *  The core sliding mechanism. Moves the image container to display the target image.
             *  @param offset (optional) Defines the transition time based on the number of images slid.
             */
            slide : function( offset ) {
                // If offset is not provided, default to 1 for a single image slide
                if ( typeof offset == 'undefined' ) {
                    offset = 1;
                }
                // Ensure offset is a positive value for transition duration calculation
                offset = Math.abs( offset );

                this.$container.css( {
                    transition: "left, " + this.config.speed * offset + "s ease", // Set transition duration dynamically
                    left:   ( this.currentImage * -100 ) + "%" // Calculate the 'left' position for the current image
                } );

                /**
                 *  This was commented out, indicating it was part of a larger feature.
                 *  this.refreshControls();
                 */

                this.refreshCounter( ); // Update the displayed image counter
            },

            /**
             *  Calculates the new current image index based on an offset and then triggers the slide.
             *  Uses a specific arithmetic term to handle JavaScript's modulo operator behavior with negative numbers.
             *  @param offset - Determines the direction and magnitude of the slide (e.g., 1 for next, -1 for previous).
             */
            inputHandler : function( offset ) {
                var transitionOffset = this.currentImage; // Store current image for transition calculation
                // Calculate new currentImage using modulo to loop around totalImages
                this.currentImage = ( ( ( this.currentImage + offset ) % this.totalImages ) + this.totalImages ) % this.totalImages;
                transitionOffset -= this.currentImage; // Calculate actual images moved for transition speed

                this.slide( transitionOffset ); // Trigger the slide animation
            },

            /*
             setSwipeSuggest : function() {
             this.$container.css('left', '-15px');
             setTimeout(function() {
             this.$container.css('left', '7px');

             setTimeout(function() {
             this.$container.css('left', '0px');
             }, 250);
             }, 250);
             },

             swipeSuggestInterval : setInterval(this.setSwipeSuggest, 3000),
             */

            /**
             *  A straightforward function to slide the slider one image to the left (previous image)
             *  in response to a swipe gesture.
             */
            previousImage : function( )
            {
                var transitionOffset = this.currentImage; // Keep track of initial position
                this.currentImage = Math.max( this.currentImage - 1, 0 ); // Decrement, but not below 0
                transitionOffset -= this.currentImage; // Calculate offset for smooth transition
                this.slide( transitionOffset ); // Perform the slide
            },

            /**
             *  A straightforward function to slide the slider one image to the right (next image)
             *  in response to a swipe gesture.
             */
            nextImage : function( )
            {
                var transitionOffset = this.currentImage; // Keep track of initial position
                this.currentImage = Math.min( this.currentImage + 1, this.totalImages - 1 ); // Increment, but not beyond last image
                transitionOffset -= this.currentImage; // Calculate offset for smooth transition
                this.slide( transitionOffset ); // Perform the slide
            },

            /**
             *  Manually updates the position of the images during a drag event.
             *  This provides real-time feedback during a swipe.
             *  @param distance The distance of the drag.
             *  @param duration The duration of the transition.
             */
            scrollImages : function( distance, duration )
            {
                /*
                 // clear swipeSuggestInterval on touch devices if still active
                 if(this.swipeSuggestInterval) {
                 clearInterval(this.swipeSuggestInterval);
                 }
                 */
                // Invert the number if necessary to match CSS 'left' property
                var value = ( distance < 0 ? "" : "-" ) + Math.abs( distance ).toString( );
                this.$container.css( "transition", "left " + duration + "s ease" ); // Set transition for the drag
                this.$container.css( "left", value +"%" ); // Apply the new 'left' position
            },

            /**
             *  Handles each phase of a swipe gesture (move, cancel, end).
             *  - 'move': Drags the div manually.
             *  - 'cancel': Animates back to the original position.
             *  - 'end': Animates to the next or previous image based on swipe direction.
             *  @param event The original event object.
             *  @param phase The current phase of the swipe (start, move, end, cancel).
             *  @param direction The direction of the swipe (left, right, up, down).
             *  @param distance The distance of the swipe.
             *  @param fingers The number of fingers used in the swipe.
             */

            swipeStatus : function( event, phase, direction, distance, fingers )
            {
                // Convert pixel distance to percentage relative to slider width
                var distance = 100 / $( this.$el ).width( ) * distance;
                // If we are moving before the swipe ends, and it's a horizontal swipe, manually drag images
                if ( phase=="move" && ( direction=="left" || direction=="right" ) )
                {
                    var duration=0; // No transition duration during manual drag

                    if ( direction == "left" )
                        this.scrollImages( ( 100 * this.currentImage ) + distance, duration ); // Drag left

                    else if ( direction == "right" )
                        this.scrollImages( ( 100 * this.currentImage ) - distance, duration ); // Drag right
                }

                // If the swipe is cancelled, snap back to the beginning position
                else if ( phase == "cancel" )
                {
                    this.scrollImages( 100 * this.currentImage, this.speed ); // Revert to current image position
                }

                // If the swipe has ended, move to the next or previous image
                else if ( phase =="end" )
                {
                    if ( direction == "right" )
                        this.previousImage( ); // Swipe right means go to previous image
                    else if ( direction == "left" )
                        this.nextImage( ); // Swipe left means go to next image
                }
            }
        };

        // Iterate over each selected element to apply the humbleSlider functionality
        this.each( function( ) {
            // Merge default configuration with user-provided configuration
            var myConfig = $.extend( { }, jQuery.fn.humbleSlider.DEFAULT_CONFIG, config );
            // Store a new HumbleSlider instance on the element's data
            $( this ).data( 'humbleSlider', new HumbleSlider( this, myConfig ) );
        } );
        return this; // Allow jQuery method chaining
    };

    /*************************************************************************************************
     *  IMPORTANT: YOU SHOULD PASS A CONFIGURATION PARAMETER INSTEAD OF OVERWRITING THE DEFAULT.   *
     *************************************************************************************************/
    jQuery.fn.humbleSlider.DEFAULT_CONFIG = {
        /**
         *  Duration in seconds for sliding a single image.
         *  For example, sliding 3 images with a speed of 0.5s would take (3 * 0.5) = 1.5 seconds by default.
         */
        speed:  0.5,

        /**
         *  Configures support for touch gestures.
         *
         *  'trigger': The slider must have a parent element matching this selector to enable swipe.
         *  The default value '.touch' is designed to work with Modernizr, which adds '.touch' to the HTML
         *  element if touch events are detected.
         *
         *  If swipe functionality should always be active regardless of touch detection,
         *  you can set this to 'html' or 'body'.
         */
        swipe: {
            enabled: true, // Enable or disable swipe functionality
            trigger: '.touch' // Selector for the swipe trigger element
        },

        /**
         *  Configures support for keyboard navigation.
         *  'previous' and 'next' values represent the key codes.
         *  By default, these are set to the left (37) and right (39) arrow keys.
         */
        key: {
            enabled: true, // Enable or disable keyboard navigation
            previous: 37,  // Key code for navigating to the previous image (left arrow)
            next: 39       // Key code for navigating to the next image (right arrow)
        },

        navigation: true, // Controls the visibility of navigation buttons (highly recommended to keep true!)

        /**
         *  Path to the image used in the navigation bar.
         *  The default is a white, base64 encoded SVG arrow graphic.
         */
        nextImage: 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4NCjwhLS0gR2VuZXJhdG9yOiBBZG9iZSBJbGx1c3RyYXRvciAxNS4xLjAsIFNWRyBFeHBvcnQgUGx1Zy1JbiAuIFNWRyBWZXJzaW9uOiA2LjAwIEJ1aWxkIDApICAtLT4NCjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+DQo8c3ZnIHZlcnNpb249IjEuMSIgaWQ9IkViZW5lXzEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4Ig0KCSB3aWR0aD0iMjAwcHgiIGhlaWdodD0iMjAwcHgiIHZpZXdCb3g9IjAgMCAyMDAgMjAwIiBlbmFibGUtYmFja2dyb3VuZD0ibmV3IDAgMCAyMDAgMjAwIiB4bWw6c3BhY2U9InByZXNlcnZlIj4NCjxwb2x5bGluZSBmaWxsPSJub25lIiBzdHJva2U9IiNGRkZGRkYiIHN0cm9rZS13aWR0aD0iOCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWNvaW49InJvdW5kIiBzdHJva2UtbWl0ZXJsaW1pdD0iMTAiIHBvaW50cz0iDQoJNTUuMzU0LDUuOTQ2IDE0NC42NDYsOTkuNjE0IDU1LjM1NCwxOTQuMDUzICI/Pg0KPC9zdmc+DQo=',

        height: '50%' // Defines the aspect ratio of the images (e.g., 50% for a 2:1 width-to-height ratio)
    };

} )( jQuery );