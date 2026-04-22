//
// jquery.sldr
//
// A content slider module.
// Features responsive slides, flexible slide widths, callback hooks,
// and custom animation capabilities.
//
// Version: 1.1 (Stable Release)
// Minimum requirements: Developed with jQuery 1.10.2.
//                        Compatibility with older versions may vary.
//
// The MIT License (MIT)
//
// Copyright (c) 2014 Devon Hirth
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.
//

( function( $ ) {
  // Store a reference to the window object for efficiency.
  var $win = $( window );

  // Define the main sldr plugin function.
  $.sldr = function( el , options ) {

    var base = this; // 'base' refers to the sldr instance.

    // Cache jQuery-wrapped elements and the raw DOM element.
    base.$el    = $( el );
    base.el     = el;
    base.$elwrp = $( el ).children(); // The wrapper element for slides.

    // Store the sldr instance on the element's data.
    base.$el.data( "sldr" , base );

    /*
     * Plugin Variables Initialization
     * These arrays and objects hold the state and configuration of the slider.
     */
    base.callback           = new Array();
    base.sldrSlides         = new Array();
    base.sldrLoadSlides     = new Array();
    base.$sliderTimers      = new Array();
    base.$resizeTimers      = new Array();
    base.$delayTimers       = new Array();

    base.wrp                = base.$el.children(); // Wrapper element (duplicate, but kept for clone).
    base.elmnts             = base.wrp.children(); // Individual slide elements.
    base.elmntsHTML         = base.wrp.html();     // Original HTML content of the wrapper.

    // Coordinate tracking for drag/swipe functionality.
    base.benchcoordinate        = {};
    base.prevcoordinate         = {};
    base.cursorcoordinate       = {};
    base.thiscoordinate         = {};
    base.coordinatedifference   = 0;
    base.dragdifference         = 0;
    base.trackmouse             = false;
    base.pagescrollY            = 0;

    base.transformposition      = 0; // Current transform position for CSS animations.

    /**
     * Initializes the slider plugin.
     * This function sets up configuration, builds slide data,
     * and attaches event handlers.
     * @return void
     */
    base.init = function() {

      // Merge default options with user-provided options.
      base.config = $.extend( {} , $.sldr.defaultOptions , options );

      // Detect browser specifics for animation compatibility.
      base.browser();

      // Local variables for easier access within init.
      var sldr       = base.$el;
      var wrp        = base.$elwrp;
      var elmnts     = wrp.children();
      var elmntsHTML = wrp.html();
      var postLoad   = false; // Flag to indicate if any slides have a 'sldr-load' class.

      //
      // Build the internal slide array if not already populated.
      // This happens only on initial plugin load.
      //
      if ( base.sldrSlides == '' ) {

        // Initialize the callback object structure.
        base.callback = {
          'sldr'              : base.$el,
          'prevFocalIndex'    : '',
          'prevSlideNum'      : '',
          'currentFocalIndex' : '',
          'currentClass'      : '',
          'currentID'         : '',
          'currentFocalPoint' : '',
          'currentSlideNum'   : '',
          'shiftWidth'        : '',
          'nextFocalIndex'    : '',
          'nextSlideNum'      : ''
        };

        // Iterate through each slide element to populate sldrSlides and sldrLoadSlides.
        for ( var i = 1; i < elmnts.length + 1; i++ ) {

          var slide     = elmnts.eq( i - 1 ); // Current slide element.
          var slideLoad = slide.find( '.sldr-load' ); // Check for lazy load indicator.

          // Store slide data in the main sldrSlides array.
          base.sldrSlides.push({
            'sld'        : slide,
            'slideNum'   : i,
            'id'         : slide.attr( 'id' ),
            'class_name' : slide.attr( 'class' ).split(' ')[0], // Get the first class.
            'html'       : slide.html()
          });

          // If the slide contains a 'sldr-load' element, mark it for lazy loading.
          if ( slideLoad.hasClass( 'sldr-load' ) ) {
            postLoad = true;
            base.sldrLoadSlides.push({
              'slideNum'   : i,
              'id'         : slide.attr( 'id' ),
              'class_name' : slide.attr( 'class' ).split(' ')[0],
              'html'       : slide.html()
            });
          }
        }
      }

      /**
       * Special handling for a single slide.
       * If there's only one slide, no animation or filling gaps is needed.
       */
      if ( elmnts.length <= 1 ) {
        elmnts.eq( 0 ).addClass( base.config.focalClass ); // Mark as focal.
        base.sliderInit( { 'slides' : base.sldrSlides , 'callback' : base.callback , 'config' : base.config } );
        base.sliderLoaded( { 'slides' : base.sldrSlides , 'callback' : base.callback , 'config' : base.config } );
        // Exit init early as no further slider logic applies to single slides.
        return;
      }

      // If more than one slide, ensure the wrapper has enough "filler" slides for seamless looping.
      if ( elmnts.length > 1 ) {
        base.fillGaps( elmntsHTML );
      }

      // Trigger the `sliderInit` callback function.
      base.sliderInit( { 'slides' : base.sldrSlides , 'callback' : base.callback , 'config' : base.config } );

      // Set the initial focal slide and adjust elements.
      base.focalChange( 1 );
      base.resizeElements();

      /**
       * Event handling for custom selectors (e.g., pagination dots).
       * If selectors are defined, attach click handlers.
       */
      if ( base.config.selectors != '' ) {
        base.config.selectors.eq( 0 ).addClass( base.config.focalClass ); // Highlight first selector.
        base.config.selectors.click( function(e) {
          var th = $( this ); // The clicked selector element.
          // Determine the slide change and animate.
          var change  = base.focalChange( th.index() + 1 , 'selectors' );
          base.animate( change );
          // Update focal class for selectors.
          th.siblings().removeClass( base.config.focalClass );
          th.addClass( base.config.focalClass );
          e.preventDefault(); // Prevent default link behavior.
        });

        // If auto-play is enabled, pause on selector hover.
        if ( base.config.sldrAuto ) {
          base.config.selectors.bind( 'mouseenter' , function() {
            base.sliderPause();
          });
          base.config.selectors.bind( 'mouseleave' , function() {
            base.sliderTimer();
          });
        }
      }

      /**
       * Event handling for the 'next slide' button.
       */
      if ( base.config.nextSlide != '' ) {
        base.config.nextSlide.click( function(e) {
          // Update selectors if present.
          if ( base.config.selectors != '' ) {
            base.config.selectors.removeClass( base.config.focalClass );
            base.config.selectors.eq( base.callback.nextSlideNum - 1 ).addClass( base.config.focalClass );
          }
          // Change focal slide and animate.
          var change  = base.focalChange( base.callback.nextSlideNum , 'next' );
          base.animate( change );
          e.preventDefault();
        });

        // Pause auto-play on hover.
        if ( base.config.sldrAuto ) {
          base.config.nextSlide.bind( 'mouseenter' , function() {
            base.sliderPause();
          });
          base.config.nextSlide.bind( 'mouseleave' , function() {
            base.sliderTimer();
          });
        }
      }

      /**
       * Event handling for the 'previous slide' button.
       */
      if ( base.config.previousSlide != '' ) {
        base.config.previousSlide.click( function(e) {
          // Update selectors if present.
          if ( base.config.selectors != '' ) {
            base.config.selectors.removeClass( base.config.focalClass );
            base.config.selectors.eq( base.callback.prevSlideNum - 1 ).addClass( base.config.focalClass );
          }
          // Change focal slide and animate.
          var change  = base.focalChange( base.callback.prevSlideNum , 'prev' );
          base.animate( change );
          e.preventDefault();
        });

        // Pause auto-play on hover.
        if ( base.config.sldrAuto ) {
          base.config.previousSlide.bind( 'mouseenter' , function() {
            base.sliderPause();
          });
          base.config.previousSlide.bind( 'mouseleave' , function() {
            base.sliderTimer();
          });
        }
      }

      /**
       * Enable swipe/drag functionality for desktop or mobile.
       */
      if ( base.config.swipeDragDesktop || base.isMobile() ) {

        base.$elwrp.bind( 'mousemove touchmove' , base.coordinateevents ); // Track mouse/touch movement.

        // Handle mousedown/touchstart events to initiate drag.
        base.$elwrp.bind( 'mousedown touchstart' , function( event ) {

          // If page has scrolled vertically, ignore horizontal drag.
          if ( base.pagescrollY !== window.pageYOffset ) return;

          event.preventDefault(); // Prevent default browser actions (e.g., image drag).
          base.trackmouse = true;
          base.$elwrp.removeClass( 'animate' ); // Remove animation class during drag.

          // Get current transform position.
          base.transformposition = parseInt( base.getTranslatePosition( base.$elwrp.css( base.config.cssPrefix + 'transform' ) , 4 ) );

          // Store initial coordinates based on event type.
          if ( event.originalEvent.touches !== undefined ) {
            base.benchcoordinate = { x : event.originalEvent.touches[0].pageX , y : event.originalEvent.touches[0].pageY , trans : base.transformposition };
          } else {
            base.benchcoordinate = { x : event.clientX , y : event.clientY , trans : base.transformposition };
          }
          base.prevcoordinate = base.benchcoordinate; // Set previous coordinate.
          base.coordinateevents( event ); // Call coordinate events immediately.
        });

        // Handle mouseup/touchend events to finalize drag.
        base.$elwrp.bind( 'mouseup touchend' , function( event ) {
          var change; // Variable to hold the focal change object.

          // If page has scrolled vertically, ignore horizontal drag.
          if ( base.pagescrollY !== window.pageYOffset ) return;

          event.preventDefault();
          base.trackmouse = false; // Stop tracking mouse.

          // Calculate the total horizontal drag difference.
          base.coordinatedifference = base.benchcoordinate.x - base.cursorcoordinate.x;

          // Determine if a slide change should occur based on drag threshold.
          if ( base.coordinatedifference > 0 && base.coordinatedifference > base.$el.width() / base.config.swipeDragCoefficient ) {
            change = base.focalChange( base.callback.nextSlideNum , 'next' ); // Swipe left, go to next.
          } else if ( base.coordinatedifference < 0 && -(base.coordinatedifference) > base.$el.width() / base.config.swipeDragCoefficient ) {
            change = base.focalChange( base.callback.prevSlideNum , 'prev' ); // Swipe right, go to previous.
          } else if ( base.config.swipeDragSnapBack ) {
            // If no slide change, snap back to the original position.
            base.$elwrp.addClass( 'animate' );
            base.$elwrp.css( base.config.cssPrefix + 'transform' , 'translate3d( ' + base.benchcoordinate.trans + 'px , 0 , 0 )' );
          }
          base.animate( change ); // Animate to the new position or snap back.
        });

      }

      // Start the auto-advance timer if there's more than one slide.
      if ( elmnts.length > 1 ) base.sliderTimer();

      /**
       * Handle window resize events.
       * Debounced to prevent excessive calls.
       */
      $win.bind( 'resize' , function( e ) {
        // Clear previous resize timer.
        clearTimeout( base.$resizeTimers[base.config.sldrNumber] );
        base.$resizeTimers[base.config.sldrNumber] = setTimeout( function() {
          base.sliderPause(); // Pause auto-advance during resize.
          base.resizeElements(); // Recalculate and adjust element sizes/positions.
          if ( elmnts.length > 1 ) base.sliderTimer(); // Restart auto-advance after resize.
        } , base.config.resizeDelay ); // Delay to prevent rapid resizing issues.
      });

      // Perform initial element resizing and positioning.
      base.resizeElements();

      // Set initial focus position without animation.
      var change = {
        'currentFocalIndex' : base.$el.find( '.' + base.config.focalClass ).index(),
        'currentFocalPoint' : base.findFocalPoint(),
        'shiftWidth'        : 0
      };
      base.positionFocus( change );

      // Trigger the `sliderLoaded` callback function.
      base.sliderLoaded( { 'slides' : base.sldrSlides , 'callback' : base.callback , 'config' : base.config } );

    }; // End of base.init function.

    /**
     * Changes the focus of the slider and animates the transition.
     * @param  {object} change - An object containing details about the required slide change.
     * @return void
     */
    base.animate = function( change ) {
      try {
        // If a custom animate function is provided in config, use it.
        if ( base.config.animate != '' && base.config.animate ) {
          base.config.animate( base.$el , change , { 'slides' : base.sldrSlides , 'callback' : base.callback , 'config' : base.config } );
        } else {
          // If no change object, just return.
          if ( !change ) return;

          var curr, tf, easing; // Variables for current position, transform, and easing.

          // Apply a tiny delay to allow for DOM adjustments before animation starts.
          base.$delayTimers[base.config.sliderNumber] = setTimeout( function() {
            base.$elwrp.addClass( 'animate' ); // Add animation class for CSS transitions.

            // Use jQuery's animate for older browsers or if specifically configured.
            if ( base.config.animateJquery || base.config.isBrowser == 'MSIE 6' || base.config.isBrowser == 'MSIE 7' || base.config.isBrowser == 'MSIE 8' || base.config.isBrowser == 'MSIE 9' || base.config.animate != false ) {
              // Determine easing function.
              easing = ( $.easing && $.easing.easeInOutQuint ) ? base.config.animateJqueryEasing : 'linear';
              base.$elwrp.animate({
                marginLeft : base.config.offset - change.currentFocalPoint // Animate margin-left.
              } , base.config.animateJqueryTiming , easing );
            } else {
              // Use CSS transforms for modern browsers.
              curr = base.config.offset - change.currentFocalPoint;
              base.$elwrp.css( base.config.cssPrefix + 'transform' , 'translate3d( ' + curr + 'px , 0 , 0 )' );
            }
            // Trigger slideComplete callback after animation.
            base.slideComplete( { 'slides' : base.sldrSlides , 'callback' : base.callback , 'config' : base.config } );
          } , 100 ); // Tiny delay needed for slider to adjust
        }
      } catch ( err ) { console.log( err.message ); }
    };

    /**
     * Changes the focus of the slider instantly without animation.
     * This is typically used for initial positioning or during resize events.
     * @param  {object} change - An object detailing the desired focal point.
     * @return void
     */
    base.positionFocus = function( change ) {
      try {
        if ( !change ) return; // If no change object, exit.
        var focus; // Variable to hold the calculated focus position.

        base.$elwrp.removeClass( 'animate' ); // Ensure no animation class is present for instant positioning.

        // Apply position using margin-left for jQuery animate fallback browsers.
        if ( base.config.animateJquery || base.config.isBrowser == 'MSIE 6' || base.config.isBrowser == 'MSIE 7' || base.config.isBrowser == 'MSIE 8' || base.config.isBrowser == 'MSIE 9' || base.config.animate != false ) {
          base.$elwrp.css( 'margin-left' , base.config.offset - change.currentFocalPoint );
        } else {
          // Apply position using CSS transform for modern browsers.
          // Initialize transform if it's 'none'.
          if ( base.$elwrp.css( base.config.cssPrefix + 'transform' ) == 'none' ) {
            base.$elwrp.css( base.config.cssPrefix + 'transform' , 'translate3d( 0 , 0 , 0 )' );
          }
          focus = base.config.offset - change.currentFocalPoint; // Calculate the target position.
          base.$elwrp.css( base.config.cssPrefix + 'transform' , 'translate3d(' + focus + 'px , 0  , 0 )' );
        }

        // Re-add the animate class after a short delay to re-enable transitions for subsequent animations.
        base.$delayTimers[base.config.sliderNumber] = setTimeout( function() {
          base.$elwrp.addClass( 'animate' );
          // Trigger slideComplete callback after positioning.
          base.slideComplete( { 'slides' : base.sldrSlides , 'callback' : base.callback , 'config' : base.config } );
        } , base.config.resizeDelay + 1 ); // A slight delay after resize.

      } catch ( err ) { console.log( err.message ); }
    };

    // **********************************************************
    // **************** Positioning Functions *******************
    // **********************************************************

    /**
     * Function to change the focal point of the slider to a specified slide.
     * It handles the visual shifting of slides to maintain a seamless loop.
     * @param  {number} focalChangeNum - The 1-based index of the slide to make focal.
     * @param  {string} method         - Optional. 'prev' or 'previous' for backward movement hint. Defaults to 'default'.
     * @return {object}                - The updated callback object containing slider state.
     */
    base.focalChange = function( focalChangeNum , method ) {
      try {
        method = typeof method !== 'undefined' ? method : 'default'; // Default method if not specified.

        var elmnts     = base.$elwrp.children(); // All current slide elements in the wrapper.
        var focalElmnt = base.$elwrp.find( '> .' + base.config.focalClass ); // The currently focal element.
        var focalIndex = focalElmnt.index(); // Index of the currently focal element.

        var nextFocalIndex, nextFocalPoint, prevFocalIndex, focalPoint, shiftSlide, shiftSlideClone, shiftSlideWidth, direction, slideClass;

        // Trigger the `slideStart` callback before any changes.
        base.slideStart( { 'slides' : base.sldrSlides , 'callback' : base.callback , 'config' : base.config } );

        /**
         * Find the nearest index of the focal point we want.
         * This logic ensures the slider takes the shortest path to the target slide.
         */
        if ( !base.sldrSlides[ focalChangeNum - 1 ] ) return; // Ensure the target slide exists.

        slideClass = base.sldrSlides[ focalChangeNum - 1 ].class_name; // Get the class name of the target slide.
        slideClass = slideClass.split(' ')[0]; // Ensure only the first class is used.

        if ( focalElmnt.hasClass( slideClass ) ) return false; // If target is already focal, do nothing.

        // Find the closest instances of the target slide class, both before and after the current focal slide.
        var closerBehind  = elmnts.eq( focalIndex ).prevAll( '.' + slideClass + ':first' ).index();
        var closerInFront = elmnts.eq( focalIndex ).nextAll( '.' + slideClass + ':first' ).index();

        // Determine which instance of the target slide is closer.
        if (
          closerInFront != -1 // If there's an instance in front
          && closerInFront - focalIndex < focalIndex - closerBehind // And it's physically closer
          || closerInFront - focalIndex == focalIndex - closerBehind // Or distances are equal, and not explicitly moving 'prev'
          && method != 'prev'
        ) {
          nextFocalIndex = closerInFront; // Move to the one in front.
        } else if ( closerBehind != -1 ) {
          nextFocalIndex = closerBehind; // Otherwise, move to the one behind.
        } else {
          nextFocalIndex = $( '.' + slideClass ).index(); // Fallback: find the first instance.
        }

        nextFocalPoint = elmnts.eq( nextFocalIndex ); // The actual DOM element that will become focal.
        elmnts.removeClass( base.config.focalClass ); // Remove focal class from all slides.
        nextFocalPoint.addClass( base.config.focalClass ); // Add focal class to the new focal slide.

        /**
         * Determine which slides need to be moved from one end of the wrapper to the other
         * to create a seamless looping effect.
         */
        // Decide the general direction of the shift based on the new focal index relative to the center.
        direction   = ( nextFocalIndex > parseInt( ( elmnts.length - 1 ) / 2 ) ) ? 'next' : 'prev';

        // Calculate the slice of elements to move.
        // This heuristic ensures enough elements are shifted to keep the desired slide near the center.
        var sliceStart  = ( direction == 'prev' ) ? parseInt( ( ( elmnts.length - nextFocalIndex + 1 ) / 2 ) + nextFocalIndex + 2 ) : 0;
        var sliceEnd    = ( direction == 'prev' ) ? elmnts.length : parseInt( nextFocalIndex * 0.5 ) - 1;
        var elmntsSlice = elmnts.slice( sliceStart , sliceEnd ); // The actual elements to be moved.
        var elmntsClone = elmntsSlice.clone(); // Clone them for appending/prepending.

        /**
         * Calculate the width difference to shift the slider's position instantly
         * before the animation, making the transition appear seamless.
         */
        shiftSlideWidth = 0;
        for ( var i = 0; i < elmntsSlice.length; i++ ) {
          shiftSlideWidth = shiftSlideWidth + $( elmntsSlice[ i ] ).width(); // Sum widths of slides being moved.
        }
        shiftSlideWidth = ( direction == 'prev' ) ? -( shiftSlideWidth ) : shiftSlideWidth; // Adjust sign based on direction.

        /**
         * Perform the instant shift of the slider's position.
         */
        base.$elwrp.removeClass( 'animate' ); // Temporarily remove animation class.
        if ( base.config.animateJquery || base.config.isBrowser == 'MSIE 6' || base.config.isBrowser == 'MSIE 7' || base.config.isBrowser == 'MSIE 8' || base.config.isBrowser == 'MSIE 9' || base.config.animate != false ) {
          // Use margin-left for jQuery animate.
          curr = parseFloat( base.$elwrp.css( 'margin-left' ) );
          base.$elwrp.css( 'margin-left' , curr + shiftSlideWidth + 'px' );
        } else {
          // Use CSS transforms.
          if ( base.$elwrp.css( base.config.cssPrefix + 'transform' ) == 'none' ) {
            base.$elwrp.css( base.config.cssPrefix + 'transform' , 'translate3d( 0 , 0 , 0 )' );
          }
          var matrixIndex = ( base.config.isIE ) ? 12 : 4; // Index for retrieving X translation from transform matrix.
          base.transformposition = parseInt( base.getTranslatePosition( base.$elwrp.css( base.config.cssPrefix + 'transform' ) , matrixIndex ) );
          curr = base.transformposition + shiftSlideWidth;
          base.$elwrp.css( base.config.cssPrefix + 'transform' , 'translate3d( ' + curr + 'px , 0 , 0 )' );
        }

        /**
         * Remove the sliced elements from their original position and
         * prepend/append their clones to the wrapper.
         */
        elmnts.slice( sliceStart , sliceEnd ).remove(); // Remove original elements.
        if ( direction == 'prev' || direction == 'previous' ) {
          base.$elwrp.prepend( elmntsClone ); // Prepend clones for 'prev' direction.
        } else {
          base.$elwrp.append( elmntsClone ); // Append clones for 'next' direction.
        }

        /**
         * Update the `base.callback` object with the new slider state.
         */
        focalPoint        = base.findFocalPoint(); // Recalculate the pixel position of the new focal point.
        currentFocalIndex = base.$elwrp.find( '> .' + base.config.focalClass ).index(); // New index of the focal slide within the wrapper.

        // Determine logical next/previous slide numbers (1-based, considering original slide order).
        nextFocalIndex    = ( currentFocalIndex + 1 == elmnts.length )           ? 0 : currentFocalIndex + 1;
        prevFocalIndex    = ( currentFocalIndex - 1 == -1 )                      ? elmnts.length - 1 : currentFocalIndex - 1;
        nextSlideNum      = ( focalChangeNum + 1 == base.sldrSlides.length + 1 ) ? 1 : focalChangeNum + 1;
        prevSlideNum      = ( focalChangeNum - 1 == 0 )                          ? base.sldrSlides.length : focalChangeNum - 1;

        // Populate the callback object.
        base.callback.sldr              = base.$el;
        base.callback.prevFocalIndex    = prevFocalIndex;
        base.callback.prevSlideNum      = prevSlideNum;
        base.callback.currentFocalIndex = currentFocalIndex;
        base.callback.currentClass      = nextFocalPoint.attr( 'class' );
        base.callback.currentID         = nextFocalPoint.attr( 'id' );
        base.callback.currentFocalPoint = focalPoint;
        base.callback.currentSlideNum   = focalChangeNum;
        base.callback.shiftWidth        = shiftSlideWidth;
        base.callback.nextFocalIndex    = nextFocalIndex;
        base.callback.nextSlideNum      = nextSlideNum;

        // Update external toggle elements (e.g., pagination).
        if ( base.config.toggle.length > 0 ) {
          base.config.toggle.removeClass( base.config.focalClass );
          base.config.toggle.eq( focalChangeNum - 1 ).addClass( base.config.focalClass );
        }

        return base.callback; // Return the updated callback object.

      } catch ( err ) { console.log( err.message ); }
    };

    /**
     * Recursively fills the slider wrapper with additional slide clones
     * to ensure there are always enough slides for seamless looping.
     * This prevents visual gaps when shifting elements.
     * @param  {string} elmntsHTML - The original HTML markup of all slides to clone.
     * @return {boolean}           - Returns true when the wrapper is sufficiently filled.
     */
    base.fillGaps = function( elmntsHTML ) {
      try {
        var sldrw     = base.$el.width(); // Width of the main slider container.
        var wrp       = base.$elwrp;      // The slide wrapper.
        var elmnt     = wrp.children();   // Current slide elements within the wrapper.
        var elmntw    = base.findWidth( elmnt ); // Total width of current slides.
        var lastClass = base.sldrSlides[base.sldrSlides.length - 1].class_name; // Class of the last original slide.

        // If the total width of slides is less than 5x the slider width,
        // append more clones to ensure sufficient "filler" for looping.
        if ( elmntw < sldrw * 5 ) {
          wrp.find( '.' + lastClass ).after( elmntsHTML ); // Append the entire set of original slides.
          base.fillGaps( elmntsHTML ); // Recursively call until sufficiently filled.
        } else {
          wrp.css( 'width' , elmntw ); // Set the wrapper's width to accommodate all slides.
          return true; // Indicate completion.
        }
      } catch ( err ) { console.log( err.message ); }
    };

    /**
     * Calculates the total combined width of a given set of elements.
     * @param  {jQuery object} elements - A jQuery collection of elements.
     * @return {float}                - The sum of the widths of all elements in the collection.
     */