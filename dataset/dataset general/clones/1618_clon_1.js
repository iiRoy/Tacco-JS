/*
 * File: swipeslide.js
 * Description: Core functionality for the SwipeSlide carousel and its 3D extension.
 * This script provides touch-enabled, responsive sliding capabilities for web elements.
 *
 * Author: [Original Author Name/Organization - if available, otherwise omit]
 * Version: 1.0.0
 * Date: 2023-10-27
 *
 * License: [Specify License if known, e.g., MIT, BSD, etc.]
 */


// Define the main constructor function for the SwipeSlide carousel.
var SwipeSlide = function( container, options )
{

    // Initialize instance options by merging defaults with user-provided settings.
    this.options = $.extend(
        {
            first:           0,                   // Index of the first visible slide upon initialization.
            visibleSlides:   1,                   // Number of slides displayed simultaneously.
            vertical:        false,               // Orientation of the slider: 'false' for horizontal, 'true' for vertical.
            tolerance:       0.5,                 // Drag threshold (0 to 1); 1 mimics iOS scroll behavior.
            delay:           0.3,                 // Animation speed in seconds for slide transitions.
            easing:          'ease-out',          // Easing function for animations (e.g., 'linear', 'ease-in', 'ease-out').
            autoPlay:        false,               // Auto-play interval in seconds, or 'false' to disable.
            useTranslate3d:  true,                // Enable CSS translate3d for hardware-accelerated animations.
            bulletNavigation: 'link',             // Bullet navigation: 'false', 'true' (basic bullets), or 'link' (clickable bullets).
            directionalNavigation: false,         // Enable 'Previous' and 'Next' navigation buttons.
            beforeChange:    null,                // Callback function executed before a slide transition starts.
            afterChange:     null                 // Callback function executed after a slide transition completes.
        },
        options                                   // User-defined options override defaults.
    );


    // Determine the orientation flag for internal use.
    this.isVertical  = !!this.options.vertical;

    // Select the container element, add base classes for styling and orientation.
    this.container   = $( container )
                         . addClass( 'ui-swipeslide' )
                         . addClass( 'ui-swipeslide-' + ( this.isVertical ? 'vertical' : 'horizontal' ) );

    // Select the reel (first child of container), which holds all slides.
    this.reel        = this.container
                         . children()
                         . first()
                         . addClass( 'ui-swipeslide-reel' );

    // Select all individual slides within the reel.
    this.slides      = this.reel
                         . children()
                         . addClass( 'ui-swipeslide-slide' );

    // Calculate the total number of "pages" or slide groups.
    this.numPages    = Math.ceil( this.slides.length / this.options.visibleSlides );

    // Set the initial current page, ensuring it's a valid index.
    this.currentPage = this.validPage( this.options.first );

    // Initialize an empty object to store touch event data.
    this.touch       = {};

    // Detect if the device supports touch events.
    this.isTouch     = 'ontouchstart' in document.documentElement;

    // Define event names based on touch support for cross-device compatibility.
    this.events      = {
        start: this.isTouch ? 'touchstart' : 'mousedown',                   // Event for press/tap initiation.
        move:  this.isTouch ? 'touchmove'  : 'mousemove',                   // Event for dragging/moving.
        end:   this.isTouch ? 'touchend touchcancel touchleave' : 'mouseup mouseout mouseleave', // Events for release/cancel.
        click: this.isTouch ? 'touchend'   : 'click'                        // Event for a brief tap/click.
    };


    // Execute initial setup routines.
    this.setup();

    // Attach all necessary event listeners for interaction.
    this.addEventListeners();

    // Conditionally set up directional navigation if enabled in options.
    if ( this.options.directionalNavigation )
    {
        this.setupDirectionalNavigation();
    }

    // Conditionally set up bullet navigation if enabled in options.
    if ( this.options.bulletNavigation )
    {
        this.setupBulletNavigation();
    }

    // Start auto-play if configured.
    if ( this.options.autoPlay )
    {
        this.autoPlay();
    }
}; // End of SwipeSlide constructor.


// Define methods on the SwipeSlide prototype for shared functionality.
SwipeSlide.prototype = {

    // --- Public API Methods ---
    // These methods provide the primary interface for interacting with the slider.

    /**
     * Navigates the slider to a specified page index.
     * @param {number} index The 0-based index of the target page.
     */
    page: function( index )
    {
        this.stopAutoPlay(); // Stop auto-play to prevent conflicts during manual navigation.

        var newPage  = this.validPage( index ), // Validate the requested page index.
            callback;                           // Placeholder for the post-animation callback.

        // Check if the target page is different from the current page.
        if ( this.currentPage != newPage )
        {
            // If a 'beforeChange' callback is provided, execute it.
            if ( $.isFunction( this.options.beforeChange ) )
            {
                this.options.beforeChange( this, this.currentPage, newPage );
            }
            this.currentPage = newPage; // Update the current page.
            callback         = $.proxy( this.callback, this ); // Set the general animation completion callback.
        }
        else if ( this.options.autoPlay )
        {
            // If no page change occurred but autoPlay is active, re-enable it after potential interaction.
            callback = $.proxy( this.autoPlay, this );
        }

        // Initiate the movement of the reel.
        this.move( 0, this.options.delay, callback );

        // Update the active bullet indicator if bullet navigation is enabled.
        if ( this.options.bulletNavigation )
        {
            this.setActiveBullet();
        }
    },


    /** Moves the slider to the very first page. */
    first:     function()
    {
        this.page( 0 );
    },

    /** Moves the slider to the next page. */
    next:      function()
    {
        this.page( this.currentPage + 1 );
    },

    /** Moves the slider to the previous page. */
    prev:      function()
    {
        this.page( this.currentPage - 1 );
    },

    /** Moves the slider to the very last page. */
    last:      function()
    {
        this.page( this.numPages - 1 );
    },


    /**
     * Checks if the slider is currently on the first page.
     * @returns {boolean} True if on the first page, false otherwise.
     */
    isFirst:   function()
    {
        return this.currentPage == 0;
    },

    /**
     * Checks if the slider is currently on the last page.
     * @returns {boolean} True if on the last page, false otherwise.
     */
    isLast:    function()
    {
        return this.currentPage == this.numPages - 1;
    },


    /**
     * Ensures a given page number is within the valid range (0 to numPages-1).
     * @param {number} num The desired page number.
     * @returns {number} The validated page number.
     */
    validPage: function( num )
    {
        return Math.max( Math.min( num, this.numPages - 1 ), 0 );
    },


    /**
     * Initiates or restarts the auto-play sequence.
     */
    autoPlay:  function()
    {
        // If an auto-play timeout is already active, do nothing.
        if ( this.timeout )
        {
            return false;
        }

        // Determine the next function to call: 'first' if at the end, otherwise 'next'.
        var fn = this.isLast() ? this.first : this.next;

        // Set a timeout to automatically advance slides.
        this.timeout = setTimeout( $.proxy( fn, this ), this.options.autoPlay * 1000 );
    },


    /**
     * Stops any ongoing auto-play timer.
     */
    stopAutoPlay:  function()
    {
        clearTimeout( this.timeout ); // Clear the scheduled timeout.
        delete this.timeout;          // Remove the timeout property.
    },


    /**
     * Returns a jQuery object containing the slides currently visible on the active page.
     * @returns {jQuery} A jQuery collection of the visible slide elements.
     */
    visibleSlides: function()
    {
        return this.slides.slice( this.currentPage, this.currentPage + this.options.visibleSlides );
    },


    // --- Private / Internal Methods ---
    // These methods handle the internal mechanics of the slider.

    /**
     * Handles the visual movement of the reel.
     * @param {number} distance Additional pixel distance to move (e.g., during a drag).
     * @param {number} delay Animation duration in seconds.
     * @param {function} callback Function to execute upon animation completion.
     */
    move: function( distance, delay, callback )
    {
        // Animate the reel using the calculated CSS properties.
        this.reel.animate(
            this.animationProperties( distance ), // Get animation properties based on current state.
            {
                duration: delay * 1000,           // Convert delay from seconds to milliseconds.
                easing:   this.options.easing,    // Use the configured easing function.
                complete: callback                // Execute the callback when animation finishes.
            }
        );
    },


    /**
     * Calculates and returns the CSS properties required for slide animation.
     * @param {number} distance The additional pixel distance to offset the reel.
     * @returns {object} An object containing CSS properties (e.g., translate3d, translateX/Y).
     */
    animationProperties: function( distance )
    {
        // Calculate the target position based on current page, dimension, and extra distance.
        var position = -this.currentPage * this.dimension + distance + 'px',
            props    = {}; // Object to store the resulting CSS properties.

        // If translate3d is enabled, use it for hardware acceleration.
        if ( this.options.useTranslate3d )
        {
            props['translate3d'] = ( this.isVertical ? '0,' + position : position + ',0' ) + ',0';
        }
        else
        {
            // Otherwise, fall back to translateX or translateY.
            props[ this.isVertical ? 'translateY' : 'translateX' ] = position;
        }
        return props;
    },


    /**
     * Performs initial setup of slider dimensions and positions elements.
     */
    setup: function()
    {
        // Determine whether to use 'height' or 'width' based on orientation.
        var fn = this.isVertical ? 'height' : 'width';

        // Get the primary dimension (width or height) of the container.
        this.dimension = this.container[fn]();

        // Calculate the effective tolerance for swipe gestures.
        this.tolerance = this.options.tolerance * this.dimension / 2;

        // Set the dimension of the reel to accommodate all pages.
        this.reel[fn]( this.dimension * this.numPages + 'px' );

        // Set the dimension of each individual slide.
        this.slides[fn]( this.dimension / this.options.visibleSlides + 'px' );

        // Move to the initial slide position without any animation.
        this.move( 0, 0 );
    },


    /**
     * Attaches all necessary event listeners for user interaction and responsiveness.
     */
    addEventListeners: function()
    {
        // Bind touch/mouse start, move, and end events to the reel.
        this.reel
            .on( this.events.start, $.proxy( this.touchStart, this ) ) // On touch/mouse press.
            .on( this.events.move,  $.proxy( this.touchMove,  this ) ) // On touch/mouse drag.
            .on( this.events.end,   $.proxy( this.touchEnd,   this ) ); // On touch/mouse release.

        // Bind click events for directional navigation elements within the container.
        this.container
            .on( this.events.click, '.next',  $.proxy( this.next,  this ) )  // Click on '.next' button.
            .on( this.events.click, '.prev',  $.proxy( this.prev,  this ) )  // Click on '.prev' button.
            .on( this.events.click, '.first', $.proxy( this.first, this ) )  // Click on '.first' button.
            .on( this.events.click, '.last',  $.proxy( this.last,  this ) ); // Click on '.last' button.

        // Bind the 'resize' event to the window to re-run setup on window dimension changes.
        $( window ).on( 'resize', $.proxy( this.setup, this ) );
    },


    /**
     * Handles the initial touch/mouse press event.
     * @param {Event} e The event object.
     * @returns {boolean|undefined} Returns false for non-touch devices to prevent default drag.
     */
    touchStart: function( e )
    {
        this.touch.start = this.trackTouch( e ); // Record the starting coordinates of the touch/mouse.
        delete this.isScroll;                    // Reset the scroll determination flag.

        // If not a touch device, prevent default browser drag behavior.
        if ( !this.isTouch )
        {
            return false;
        }
    },


    /**
     * Handles the touch/mouse movement event.
     * @param {Event} e The event object.
     * @returns {boolean|undefined} Returns false if handling a swipe to prevent default scrolling.
     */
    touchMove: function( e )
    {
        // If touch start was not recorded, ignore move event.
        if ( !this.touch.start )
        {
            return;
        }

        this.touch.end  = this.trackTouch( e ); // Record the current touch/mouse coordinates.
        var distance    = this.distance( this.isVertical ); // Calculate movement in the primary direction.

        // Determine if the gesture is primarily a scroll (vertical) or a swipe (horizontal/vertical swipe).
        if ( typeof this.isScroll == 'undefined' )
        {
            this.isScroll = Math.abs( distance ) < Math.abs( this.distance( !this.isVertical ) );
        }

        // If it's determined to be a swipe (not a scroll).
        if ( !this.isScroll )
        {
            this.stopAutoPlay(); // Temporarily stop auto-play during manual swipe.
            this.move( this.withResistance( distance ), 0 ); // Move the reel with resistance, no animation delay.
            return false; // Prevent default browser scrolling behavior.
        }
    },


    /**
     * Handles the touch/mouse release event.
     * @param {Event} e The event object.
     * @returns {boolean} Returns false to prevent default click behavior after a swipe.
     */
    touchEnd: function( e )
    {
        // If the gesture was a swipe (not a scroll).
        if ( !this.isScroll )
        {
            var distance = this.distance( this.isVertical ), // Calculate the final swipe distance.
                add      = 0;                                // Initialize page adjustment value.

            // Determine if a page change should occur based on the tolerance threshold.
            if ( Math.abs( distance ) > this.tolerance )
            {
                add = distance < 0 ? 1 : -1; // If swiped left/up, go next; if right/down, go previous.
            }
            this.page( this.currentPage + add ); // Navigate to the new page.
        }

        this.touch = {}; // Clear the stored touch data.
        return false;    // Prevent default click behavior that might follow a touchend.
    },


    /**
     * Extracts the pageX and pageY coordinates from a touch or mouse event.
     * @param {Event} e The event object.
     * @returns {object} An object containing 'x' and 'y' coordinates.
     */
    trackTouch: function( e )
    {
        var o = this.isTouch ? e.touches[0] : e; // Get the first touch object or the event itself for mouse.
        return { x: o.pageX, y: o.pageY };       // Return the coordinates.
    },


    /**
     * Calculates the distance moved between touchStart and touchEnd/touchMove.
     * @param {boolean} vertical If true, calculates vertical distance; otherwise, horizontal distance.
     * @returns {number} The distance in pixels.
     */
    distance: function( vertical )
    {
        var d = vertical ? 'y' : 'x'; // Select the appropriate coordinate ('y' for vertical, 'x' for horizontal).
        try
        {
            return this.touch.end[d] - this.touch.start[d]; // Calculate difference.
        }
        catch( e )
        {
            return 0; // Return 0 if touch data is incomplete (e.g., no 'end' point yet).
        }
    },


    /**
     * Applies a resistance effect to the drag distance when attempting to drag beyond the slider's limits.
     * @param {number} d The raw drag distance.
     * @returns {number} The drag distance with resistance applied.
     */
    withResistance: function( d )
    {
        // Apply resistance if dragging past the first slide (drag right/down) or last slide (drag left/up).
        if ( ( this.isFirst() && d > 0 ) || ( this.isLast() && d < 0 ) )
        {
            d /= ( 1 + Math.abs( d ) / this.dimension ); // Reduce the effective drag distance.
        }
        return d;
    },


    /**
     * General callback function executed after a slide animation completes.
     * This method handles user-defined callbacks and restarts auto-play.
     */
    callback: function()
    {
        // Execute the user-defined 'afterChange' callback if provided.
        if ( $.isFunction( this.options.afterChange ) )
        {
            this.options.afterChange( this, this.currentPage ); // Pass the instance and current page.
        }

        // If auto-play is enabled, restart it after the transition.
        if ( this.options.autoPlay )
        {
            this.autoPlay();
        }
    },


    // --- Navigation Setup Methods ---
    // These methods handle the creation and activation of navigation elements.

    /**
     * Sets up directional navigation (e.g., 'Previous' and 'Next' buttons).
     */
    setupDirectionalNavigation: function()
    {
        // Append the HTML structure for directional navigation to the container.
        this.container.append( '<ul class="ui-swipeslide-nav"><li class="prev">Previous</li><li class="next">Next</li></ul>' );
    },


    /**
     * Sets up bullet navigation, including creating bullets and attaching event handlers.
     */
    setupBulletNavigation: function()
    {
        // Create the unordered list element that will hold the bullet navigation.
        this.navBullets = $( '<ul class="ui-swipeslide-bullets"></ul>' );

        // Loop through the number of pages to create a bullet for each.
        for ( i = 0; i < this.numPages; i++ ) // 'i' is implicitly global here.
        {
            this.navBullets.append( '<li data-index="' + i + '">' + ( i + 1 ) + '</li>' );
        }

        // If bullet navigation is set to 'link', attach click event handlers to the bullets.
        if ( this.options.bulletNavigation == 'link' )
        {
            this.navBullets.on(
                this.events.click,
                'li',
                $.proxy( function( e ) {
                    // Navigate to the page corresponding to the clicked bullet's data-index.
                    this.page( parseInt( $( e.currentTarget ).data( 'index' ), 10 ) );
                }, this )
            );
        }

        // Append the constructed bullet navigation to the main container.
        this.container.append( this.navBullets );

        // Set the initially active bullet.
        this.setActiveBullet();
    },


    /**
     * Updates the 'active' class on bullet navigation items to reflect the current page.
     */
    setActiveBullet: function()
    {
        this.navBullets.children( 'li' ) // Select all list items (bullets).
            .removeClass( 'active' )     // Remove the 'active' class from all bullets.
            .eq( this.currentPage )      // Select the bullet corresponding to the current page index.
            .addClass( 'active' );       // Add the 'active' class to the current page's bullet.
    }
}; // End of SwipeSlide.prototype.


/*
 * SwipeSlide3D - An extension of the base SwipeSlide for creating 3D carousel effects.
 * This class inherits from SwipeSlide and overrides methods to implement 3D transformations.
 */
var SwipeSlide3D = function( container, options )
{
    // Call the parent SwipeSlide constructor to initialize basic properties.
    SwipeSlide.call( this, container, options );

    // Add a specific class to the container for 3D-specific styling.
    this.container.addClass( 'ui-swipeslide-3d' );
};

// Establish prototypal inheritance: SwipeSlide3D inherits from SwipeSlide.
SwipeSlide3D.prototype = new SwipeSlide();

// Extend the SwipeSlide3D prototype with methods specific to 3D functionality.
$.extend( SwipeSlide3D.prototype, {

    /**
     * Overrides the base setup method to include 3D specific calculations and positioning.
     */
    setup: function()
    {
        var fn = this.isVertical ? 'height' : 'width'; // Determine the primary dimension property.

        this.dimension = this.container[fn](); // Get the container's primary dimension.
        this.tolerance = this.options.tolerance * this.dimension / 2; // Calculate touch tolerance.

        // Calculate the angular displacement per slide and the radius of the 3D cylinder.
        this.alpha     = 360 / this.slides.length * ( this.isVertical ? -1 : 1 ); // Angle for each slide.
        this.radius    = Math.round( ( this.dimension / 2 ) / Math.tan( Math.PI / this.slides.length ) ); // Radius for cylinder.

        // Position each individual slide in 3D space.
        this.slides.each( $.proxy( this.positionSlide, this ) );

        // Move to the initial slide without animation, applying 3D transforms.
        this.move( 0, 0 );
    },


    /**
     * Overrides validPage for continuous looping behavior in 3D carousels.
     * @param {number} num The requested page number.
     * @returns {number} The validated page number, wrapped around if outside bounds.
     */
    validPage: function( num )
    {
        if ( num < 0 )
        {
            num += this.numPages; // Wrap around to the end of the carousel.
        }
        else if ( num >= this.numPages )
        {
            num %= this.numPages; // Wrap around to the beginning of the carousel.
        }
        return num;
    },


    /**
     * Overrides animationProperties to generate CSS for 3D rotations.
     * @param {number} distance The additional pixel distance for dynamic rotation during drag.
     * @returns {object} An object containing 'translate3d' and 'rotate3d' CSS properties.
     */
    animationProperties: function( distance )
    {
        // Calculate the rotation delta based on drag distance and current page.
        var delta = ( this.alpha * distance / this.dimension ) - ( this.alpha * this.currentPage );
        return {
            translate3d: '0,0,' + -this.radius + 'px', // Translate back into the 3D cylinder.
            rotate3d:    this.vectorsWithDeg( delta )  // Apply the calculated 3D rotation.
        };
    },


    /**
     * Positions an individual slide within the 3D carousel space.
     * @param {number} i The index of the slide.
     * @param {HTMLElement} slide The DOM element of the slide.
     */
    positionSlide: function( i, slide )
    {
        $( slide ).animate(
            {
                rotate3d:    this.vectorsWithDeg( i * this.alpha ), // Rotate to its initial angle in the cylinder.
                translate3d: '0,0,' + this.radius + 'px'            // Translate forward to the cylinder's surface.
            },
            {
                duration: 0 // Apply these transformations instantly without animation.
            }
        );
    },


    /**
     * Generates the CSS 'rotate3d' vector and degree string based on orientation.
     * @param {number} degree The rotation degree to apply.
     * @returns {string} The formatted 'rotate3d' CSS value.
     */
    vectorsWithDeg: function( degree )
    {
        // Returns '1,0,0,degree' for vertical rotation (around X-axis) or '0,1,0,degree' for horizontal (around Y-axis).
        return ( this.isVertical ? '1,0' : '0,1' ) + ',0,' + degree + 'deg';
    },


    /**
     * Overrides withResistance for 3D carousels, which typically loop and thus have no "ends" to resist.
     * @param {number} d The raw drag distance.
     * @returns {number} The raw drag distance (resistance is not applied).
     */
    withResistance: function( d )
    {
        return d; // In a looping 3D carousel, resistance at ends is usually not desired.
    }
}); // End of SwipeSlide3D.prototype extensions.


// Zepto/jQuery Plugin Integration:
// This self-executing anonymous function integrates SwipeSlide into the Zepto or jQuery namespace.
;(function( $ )
{
    /**
     * jQuery/Zepto plugin method to initialize SwipeSlide on selected elements.
     * @param {object} [options] Configuration options for the SwipeSlide instance.
     * @returns {jQuery} The jQuery object for method chaining.
     */
    $.fn.swipeSlide = function( options )
    {
        // Determine whether to instantiate SwipeSlide3D or the base SwipeSlide.
        // The 'threeD' option in 'options' object controls this.
        var klass = ( options = options || {} ).threeD ? SwipeSlide3D : SwipeSlide;

        // Iterate over each selected DOM element.
        return this.each( function()
        {
            var s = new klass( this, options ); // Create a new instance of the appropriate SwipeSlide class.

            // Store the SwipeSlide instance on the element's data attribute.
            // This conditional check handles a specific behavior where .data() might return a string
            // after initial assignment, indicating a potential issue or specific framework quirk.
            if ( typeof( $( this ).data( "swipeInstance", s ).data( "swipeInstance" ) ) === "string" )
            {
                $( this ).removeAttr( "data-swipeInstance" ); // If it's a string, remove the attribute to clean up.
            }
            return; // Continue to the next element in the collection.
        });
    };
})( window.Zepto ); // Pass window.Zepto (or window.jQuery if Zepto isn't present) as the '$' argument.