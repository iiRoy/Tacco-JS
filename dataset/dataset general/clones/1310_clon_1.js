/*
 *  FlexSlider v1.8 - A responsive jQuery slider plugin.
 *  More info: http://flex.madebymufffin.com
 *
 *  Copyright (c) 2011 Tyler Smith.
 *  This software is provided under the MIT License.
 *  Refer to http://www.opensource.org/licenses/mit-license.php for details.
 *
 *  Special thanks to Darin Richardson for contributions.
 *  This code is a Type I clone, whitespace and comments have been modified.
 */

; ( function ( $ ) { /* Self-executing anonymous function to prevent global variable pollution */

  // FlexSlider: Defines the main object instance
  $.flexslider = function ( el , options ) {
    var slider = el ; // Reference to the jQuery element representing the slider

    slider.init = function ( ) { // Initialization method for the FlexSlider instance
      // Extend default settings with user-provided options
      slider.vars = $.extend ( {} , $.flexslider.defaults , options ) ;
      slider.data ( 'flexslider' , true ) ; // Mark the element as a flexslider instance
      slider.container = $ ( '.slides' , slider ) ; // The container for the slides
      slider.slides = $ ( '.slides > li' , slider ) ; // Individual slide items
      slider.count = slider.slides.length ; // Total number of slides
      slider.animating = false ; // Flag to indicate if an animation is in progress
      slider.currentSlide = slider.vars.slideToStart ; // Index of the currently active slide
      slider.animatingTo = slider.currentSlide ; // Target slide index for the current animation
      // Determine if the slider is at an end position (for non-looping animations)
      slider.atEnd = ( slider.currentSlide == 0 ) ? true : false ;
      // Detect touch support for event type
      slider.eventType = ( 'ontouchstart' in document.documentElement ) ? 'touchstart' : 'click' ;
      slider.cloneCount = 0 ; // Number of cloned slides
      slider.cloneOffset = 0 ; // Offset due to cloned slides
      slider.manualPause = false ; // Flag for user-initiated pause
      // Determine if slider is vertical or horizontal
      slider.vertical = ( slider.vars.slideDirection == "vertical" ) ;
      slider.prop = ( slider.vertical ) ? "top" : "marginLeft" ; // CSS property to animate
      slider.args = {} ; // Object to hold animation arguments

      // Check for WebKit CSS3 Transitions support
      slider.transitions = "webkitTransition" in document.body.style ;
      if ( slider.transitions ) { slider.prop = "-webkit-transform" ; } // Use transform for better performance if available

      // Check for a custom controls container
      if ( slider.vars.controlsContainer != "" ) {
        slider.controlsContainer = $ ( slider.vars.controlsContainer ) . eq ( $ ( '.slides' ) . index ( slider.container ) ) ;
        slider.containerExists = slider.controlsContainer.length > 0 ;
      }
      // Check for manual controls
      if ( slider.vars.manualControls != "" ) {
        slider.manualControls = $ ( slider.vars.manualControls , ( ( slider.containerExists ) ? slider.controlsContainer : slider ) ) ;
        slider.manualExists = slider.manualControls.length > 0 ;
      }

      /*
       *  FlexSlider: Randomize Slides Feature
       *  Shuffles the order of slides if randomization is enabled.
       */
      if ( slider.vars.randomize ) {
        slider.slides.sort ( function ( ) { return ( Math.round ( Math.random ( ) ) - 0.5 ) ; } ) ;
        slider.container.empty ( ) . append ( slider.slides ) ;
      }
      /* End Randomize Slides */

      /*
       *  FlexSlider: Slider Animation Initialization Logic
       *  Sets up the slider based on the chosen animation type ("slide" or "fade").
       */
      if ( slider.vars.animation.toLowerCase ( ) == "slide" ) {
        if ( slider.transitions ) {
          slider.setTransition ( 0 ) ; // Set initial transition to 0 for immediate positioning
        }
        // Removed original comment: //slider.css({"overflow": "hidden"});
        if ( slider.vars.animationLoop ) {
          slider.cloneCount = 2 ; // Two clones (one at start, one at end) for seamless looping
          slider.cloneOffset = 1 ; // Offset adjusted for clones
          // Append clone of first slide, prepend clone of last slide
          slider.container.append ( slider.slides.filter ( ':first' ) . clone ( ) . addClass ( 'clone' ) ) . prepend ( slider.slides.filter ( ':last' ) . clone ( ) . addClass ( 'clone' ) ) ;
        }
        // Create newSlides collection including any clones
        slider.newSlides = $ ( '.slides > li' , slider ) ;
        var sliderOffset = ( -1 * ( slider.currentSlide + slider.cloneOffset ) ) ;
        if ( slider.vertical ) {
          // Style vertical slides
          slider.newSlides.css ( { "display" : "block" , "width" : "100%" , "float" : "left" } ) ;
          // Set container height and position
          slider.container.height ( ( slider.count + slider.cloneCount ) * 200 + "%" ) . css ( "position" , "absolute" ) . width ( "100%" ) ;
          // Timeout to allow browser to calculate initial height properly
          setTimeout ( function ( ) {
            slider.css ( { "position" : "relative" } ) . height ( slider.slides.filter ( ':first' ) . height ( ) ) ;
            slider.args [ slider.prop ] = ( slider.transitions ) ? "translate3d(0," + sliderOffset * slider.height ( ) + "px,0)" : sliderOffset * slider.height ( ) + "px" ;
            slider.container.css ( slider.args ) ;
          } , 100 ) ;

        } else { // Horizontal sliding
          slider.args [ slider.prop ] = ( slider.transitions ) ? "translate3d(" + sliderOffset * slider.width ( ) + "px,0,0)" : sliderOffset * slider.width ( ) + "px" ;
          slider.container.width ( ( slider.count + slider.cloneCount ) * 200 + "%" ) . css ( slider.args ) ;
          // Timeout to allow browser to calculate initial width properly
          setTimeout ( function ( ) {
            slider.newSlides.width ( slider.width ( ) ) . css ( { "float" : "left" , "display" : "block" } ) ;
          } , 100 ) ;
        }

      } else { // Default animation is "fade"
        // Note: CSS3 transitions for fade are not implemented in this version
        slider.transitions = false ;
        // Position slides for fading
        slider.slides.css ( { "width" : "100%" , "float" : "left" , "marginRight" : "-100%" } ) . eq ( slider.currentSlide ) . fadeIn ( slider.vars.animationDuration ) ;
      }
      /* End Slider Animation Initialization */

      /*
       *  FlexSlider: Control Navigation Setup
       *  Creates or assigns control navigation elements (dots/pips).
       */
      if ( slider.vars.controlNav ) {
        if ( slider.manualExists ) {
          slider.controlNav = slider.manualControls ; // Use existing manual controls
        } else {
          var controlNavScaffold = $ ( '<ol class="flex-control-nav"></ol>' ) ; // Create new control nav
          var j = 1 ; // Counter for nav item text
          for ( var i = 0 ; i < slider.count ; i ++ ) {
            controlNavScaffold.append ( '<li><a>' + j + '</a></li>' ) ; // Add nav item for each slide
            j ++ ;
          }

          if ( slider.containerExists ) {
            $ ( slider.controlsContainer ) . append ( controlNavScaffold ) ;
            slider.controlNav = $ ( '.flex-control-nav li a' , slider.controlsContainer ) ;
          } else {
            slider.append ( controlNavScaffold ) ; // Append to the main slider element
            slider.controlNav = $ ( '.flex-control-nav li a' , slider ) ;
          }
        }

        slider.controlNav.eq ( slider.currentSlide ) . addClass ( 'active' ) ; // Set initial active class

        // Bind event handler for control navigation clicks
        slider.controlNav.bind ( slider.eventType , function ( event ) {
          event.preventDefault ( ) ; // Prevent default link behavior
          if ( ! $ ( this ) . hasClass ( 'active' ) ) {
            // Determine direction based on target slide index
            ( $ ( this ) . index ( $ ( this ) ) > slider.currentSlide ) ? slider.direction = "next" : slider.direction = "prev" ;
            slider.flexAnimate ( slider.controlNav.index ( $ ( this ) ) , slider.vars.pauseOnAction ) ;
          }
        } ) ;
      }
      /* End Control Navigation */

      /*
       *  FlexSlider: Directional Navigation (Prev/Next buttons)
       *  Handles creation and behavior of "previous" and "next" buttons.
       */
      if ( slider.vars.directionNav ) {
        var directionNavScaffold = $ ( '<ul class="flex-direction-nav"><li><a class="prev" href="#">' + slider.vars.prevText + '</a></li><li><a class="next" href="#">' + slider.vars.nextText + '</a></li></ul>' ) ;

        if ( slider.containerExists ) {
          $ ( slider.controlsContainer ) . append ( directionNavScaffold ) ;
          slider.directionNav = $ ( '.flex-direction-nav li a' , slider.controlsContainer ) ;
        } else {
          slider.append ( directionNavScaffold ) ;
          slider.directionNav = $ ( '.flex-direction-nav li a' , slider ) ;
        }

        // Set initial disable styles for non-looping sliders
        if ( ! slider.vars.animationLoop ) {
          if ( slider.currentSlide == 0 ) {
            slider.directionNav.filter ( '.prev' ) . addClass ( 'disabled' ) ;
          } else if ( slider.currentSlide == slider.count - 1 ) {
            slider.directionNav.filter ( '.next' ) . addClass ( 'disabled' ) ;
          }
        }

        // Bind event handler for direction navigation clicks
        slider.directionNav.bind ( slider.eventType , function ( event ) {
          event.preventDefault ( ) ;
          var target = ( $ ( this ) . hasClass ( 'next' ) ) ? slider.getTarget ( 'next' ) : slider.getTarget ( 'prev' ) ;

          if ( slider.canAdvance ( target ) ) {
            slider.flexAnimate ( target , slider.vars.pauseOnAction ) ;
          }
        } ) ;
      }
      /* End Directional Navigation */

      /*
       *  FlexSlider: Keyboard Navigation Support
       *  Allows navigation using left/right arrow keys.
       */
      if ( slider.vars.keyboardNav && $ ( 'ul.slides' ) . length == 1 ) { // Only enable if there's one slider
        function keyboardMove ( event ) {
          if ( slider.animating ) {
            return ; // Do nothing if already animating
          } else if ( event.keyCode != 39 && event.keyCode != 37 ) { // Check for left (37) or right (39) arrow keys
            return ; // Ignore other keys
          } else {
            var target ; // Declare target here
            if ( event.keyCode == 39 ) {
              target = slider.getTarget ( 'next' ) ;
            } else if ( event.keyCode == 37 ) {
              target = slider.getTarget ( 'prev' ) ;
            }

            if ( slider.canAdvance ( target ) ) {
              slider.flexAnimate ( target , slider.vars.pauseOnAction ) ;
            }
          }
        }
        $ ( document ) . bind ( 'keyup' , keyboardMove ) ; // Bind keyboard event to document
      }
      /* End Keyboard Navigation */

      /*
       *  FlexSlider: Mousewheel Interaction
       *  Enables slide navigation via mousewheel scrolling.
       */
      if ( slider.vars.mousewheel ) {
        // Determine appropriate mousewheel event name across browsers
        slider.mousewheelEvent = ( /Firefox/i.test ( navigator.userAgent ) ) ? "DOMMouseScroll" : "mousewheel" ;
        slider.bind ( slider.mousewheelEvent , function ( e ) {
          e.preventDefault ( ) ;
          e = e ? e : window.event ; // Normalize event object
          var wheelData = e.detail ? e.detail * -1 : e.wheelDelta / 40 , // Determine scroll direction/magnitude
              target = ( wheelData < 0 ) ? slider.getTarget ( 'next' ) : slider.getTarget ( 'prev' ) ;

          if ( slider.canAdvance ( target ) ) {
            slider.flexAnimate ( target , slider.vars.pauseOnAction ) ;
          }
        } ) ;
      }
      /* End Mousewheel Interaction */

      /*
       *  FlexSlider: Slideshow Configuration
       *  Manages automatic slide progression and pause on hover.
       */
      if ( slider.vars.slideshow ) {
        // Pause on hover functionality
        if ( slider.vars.pauseOnHover && slider.vars.slideshow ) {
          slider.hover ( function ( ) {
            slider.pause ( ) ; // Pause slideshow on hover in
          } , function ( ) {
            if ( ! slider.manualPause ) {
              slider.resume ( ) ; // Resume if not manually paused
            }
          } ) ;
        }

        // Initialize automatic animation interval
        slider.animatedSlides = setInterval ( slider.animateSlides , slider.vars.slideshowSpeed ) ;
      }
      /* End Slideshow Configuration */

      /*
       *  FlexSlider: Pause/Play Button Functionality
       *  Adds and controls a dedicated pause/play toggle button.
       */
      if ( slider.vars.pausePlay ) {
        var pausePlayScaffold = $ ( '<div class="flex-pauseplay"><span></span></div>' ) ;

        if ( slider.containerExists ) {
          slider.controlsContainer.append ( pausePlayScaffold ) ;
          slider.pausePlay = $ ( '.flex-pauseplay span' , slider.controlsContainer ) ;
        } else {
          slider.append ( pausePlayScaffold ) ;
          slider.pausePlay = $ ( '.flex-pauseplay span' , slider ) ;
        }

        var pausePlayState = ( slider.vars.slideshow ) ? 'pause' : 'play' ;
        slider.pausePlay.addClass ( pausePlayState ) . text ( ( pausePlayState == 'pause' ) ? slider.vars.pauseText : slider.vars.playText ) ;

        // Bind click handler for pause/play button
        slider.pausePlay.bind ( slider.eventType , function ( event ) {
          event.preventDefault ( ) ;
          if ( $ ( this ) . hasClass ( 'pause' ) ) {
            slider.pause ( ) ;
            slider.manualPause = true ; // Indicate manual pause
          } else {
            slider.resume ( ) ;
            slider.manualPause = false ; // Clear manual pause flag
          }
        } ) ;
      }
      /* End Pause/Play Button */

      /*
       *  FlexSlider: Touch Swipe Gestures Implementation
       *  Enables swiping on touch-enabled devices.
       *  Concepts adapted from TouchSwipe (http://www.netcu.de/jquery-touchwipe-iphone-ipad-library)
       *  and SwipeJS (http://swipejs.com).
       */
      if ( 'ontouchstart' in document.documentElement ) {
        // Variables are initially named for x-axis scrolling for brevity,
        // then swapped if vertical sliding is active.
        var startX ,
          startY ,
          offset ,
          cwidth ,
          dx ,
          startT ,
          scrolling = false ;

        slider.each ( function ( ) {
          if ( 'ontouchstart' in document.documentElement ) {
            this.addEventListener ( 'touchstart' , onTouchStart , false ) ;
          }
        } ) ;

        function onTouchStart ( e ) {
          if ( slider.animating ) {
            e.preventDefault ( ) ; // Prevent interaction if animating
          } else if ( e.touches.length == 1 ) {
            slider.pause ( ) ; // Pause slideshow on touch start
            cwidth = ( slider.vertical ) ? slider.height ( ) : slider.width ( ) ; // Get dimension of slider
            startT = Number ( new Date ( ) ) ; // Timestamp for swipe duration check
            // Calculate initial offset based on current slide and clones
            offset = ( slider.vertical ) ? ( slider.currentSlide + slider.cloneOffset ) * slider.height ( ) : ( slider.currentSlide + slider.cloneOffset ) * slider.width ( ) ;
            // Store initial touch coordinates
            startX = ( slider.vertical ) ? e.touches [ 0 ] . pageY : e.touches [ 0 ] . pageX ;
            startY = ( slider.vertical ) ? e.touches [ 0 ] . pageX : e.touches [ 0 ] . pageY ;
            slider.setTransition ( 0 ) ; // Disable transition during swipe for direct control

            this.addEventListener ( 'touchmove' , onTouchMove , false ) ;
            this.addEventListener ( 'touchend' , onTouchEnd , false ) ;
          }
        }

        function onTouchMove ( e ) {
          // Calculate displacement (dx)
          dx = ( slider.vertical ) ? startX - e.touches [ 0 ] . pageY : startX - e.touches [ 0 ] . pageX ;
          // Determine if user is scrolling vertically or horizontally (to prevent accidental slide changes)
          scrolling = ( slider.vertical ) ? ( Math.abs ( dx ) < Math.abs ( e.touches [ 0 ] . pageX - startY ) ) : ( Math.abs ( dx ) < Math.abs ( e.touches [ 0 ] . pageY - startY ) ) ;

          if ( ! scrolling ) {
            e.preventDefault ( ) ; // Prevent default browser scrolling
            if ( slider.vars.animation == "slide" && slider.transitions ) {
              if ( ! slider.vars.animationLoop ) {
                // Apply friction effect at ends if not looping
                dx = dx / ( ( slider.currentSlide == 0 && dx < 0 || slider.currentSlide == slider.count - 1 && dx > 0 ) ? ( Math.abs ( dx ) / cwidth + 2 ) : 1 ) ;
              }
              // Update CSS transform property for live dragging
              slider.args [ slider.prop ] = ( slider.vertical ) ? "translate3d(0," + ( -offset - dx ) + "px,0)" : "translate3d(" + ( -offset - dx ) + "px,0,0)" ;
              slider.container.css ( slider.args ) ;
            }
          }
        }

        function onTouchEnd ( e ) {
          slider.animating = false ; // Reset animating flag
          // Only animate if swipe occurred and was not just a scroll
          if ( slider.animatingTo == slider.currentSlide && ! scrolling && ! ( dx == null ) ) {
            var target = ( dx > 0 ) ? slider.getTarget ( 'next' ) : slider.getTarget ( 'prev' ) ;
            // Check if swipe was significant enough to trigger a slide change
            if ( slider.canAdvance ( target ) && Number ( new Date ( ) ) - startT < 550 && Math.abs ( dx ) > 20 || Math.abs ( dx ) > cwidth / 2 ) {
              slider.flexAnimate ( target , slider.vars.pauseOnAction ) ;
            } else {
              slider.flexAnimate ( slider.currentSlide , slider.vars.pauseOnAction ) ; // Snap back to current slide
            }
          }

          // Clean up touch event listeners and variables
          this.removeEventListener ( 'touchmove' , onTouchMove , false ) ;
          this.removeEventListener ( 'touchend' , onTouchEnd , false ) ;
          startX = null ;
          startY = null ;
          dx = null ;
          offset = null ;
        }
      }
      /* End Touch Swipe Gestures */

      /*
       *  FlexSlider: Resize Handling
       *  Adjusts slider dimensions when the window is resized.
       */
      if ( slider.vars.animation.toLowerCase ( ) == "slide" ) {
        $ ( window ) . resize ( function ( ) {
          if ( ! slider.animating ) {
            if ( slider.vertical ) {
              slider.height ( slider.slides.filter ( ':first' ) . height ( ) ) ; // Adjust slider height
              slider.args [ slider.prop ] = ( -1 * ( slider.currentSlide + slider.cloneOffset ) ) * slider.slides.filter ( ':first' ) . height ( ) + "px" ;
              if ( slider.transitions ) {
                slider.setTransition ( 0 ) ;
                slider.args [ slider.prop ] = ( slider.vertical ) ? "translate3d(0," + slider.args [ slider.prop ] + ",0)" : "translate3d(" + slider.args [ slider.prop ] + ",0,0)" ;
              }
              slider.container.css ( slider.args ) ;
            } else {
              slider.newSlides.width ( slider.width ( ) ) ; // Adjust slide width
              slider.args [ slider.prop ] = ( -1 * ( slider.currentSlide + slider.cloneOffset ) ) * slider.width ( ) + "px" ;
              if ( slider.transitions ) {
                slider.setTransition ( 0 ) ;
                slider.args [ slider.prop ] = ( slider.vertical ) ? "translate3d(0," + slider.args [ slider.prop ] + ",0)" : "translate3d(" + slider.args [ slider.prop ] + ",0,0)" ;
              }
              slider.container.css ( slider.args ) ;
            }
          }
        } ) ;
      }
      /* End Resize Handling */

      /*
       *  FlexSlider: Destroy Method (Commented Out for Minified Version)
       *  This function provides a way to completely remove the slider instance.
       *  It's included here as a reference for developers.
       */
      /*
      slider.destroy = function ( ) {
        slider.pause ( ) ; // Stop slideshow
        if ( slider.controlNav && slider.vars.manualControls == "" ) slider.controlNav.closest ( '.flex-control-nav' ) . remove ( ) ;
        if ( slider.directionNav ) slider.directionNav.closest ( '.flex-direction-nav' ) . remove ( ) ;
        if ( slider.vars.pausePlay ) slider.pausePlay.closest ( '.flex-pauseplay' ) . remove ( ) ;
        if ( slider.vars.keyboardNav && $ ( 'ul.slides' ) . length == 1 ) $ ( document ) . unbind ( 'keyup' , keyboardMove ) ;
        if ( slider.vars.mousewheel ) slider.unbind ( slider.mousewheelEvent ) ;
        if ( slider.transitions ) slider.each ( function ( ) { this.removeEventListener ( 'touchstart' , onTouchStart , false ) ; } ) ;
        if ( slider.vars.animation == "slide" && slider.vars.animationLoop ) slider.newSlides.filter ( '.clone' ) . remove ( ) ;
        if ( slider.vertical ) slider.height ( "auto" ) ;
        slider.slides.hide ( ) ; // Hide all slides
        slider.removeData ( 'flexslider' ) ; // Remove flexslider data from element
      }
      */
      /* End Destroy Method */

      // FlexSlider: start() Callback execution
      slider.vars.start ( slider ) ;
    } // End slider.init

    // FlexSlider: Core Animation Logic
    slider.flexAnimate = function ( target , pause ) {
      if ( ! slider.animating ) {
        slider.animating = true ; // Set animating flag
        slider.animatingTo = target ; // Set the target slide for the animation

        // FlexSlider: before() animation Callback
        slider.vars.before ( slider ) ;

        // Optional parameter to pause slideshow during user interaction
        if ( pause ) {
            slider.pause ( ) ;
        }

        // Update control navigation active state
        if ( slider.vars.controlNav ) {
            slider.controlNav.removeClass ( 'active' ) . eq ( target ) . addClass ( 'active' ) ;
        }

        // Update atEnd flag
        slider.atEnd = ( target == 0 || target == slider.count - 1 ) ? true : false ;
        // Disable direction nav buttons if not looping and at ends
        if ( ! slider.vars.animationLoop && slider.vars.directionNav ) {
          if ( target == 0 ) {
            slider.directionNav.removeClass ( 'disabled' ) . filter ( '.prev' ) . addClass ( 'disabled' ) ;
          } else if ( target == slider.count - 1 ) {
            slider.directionNav.removeClass ( 'disabled' ) . filter ( '.next' ) . addClass ( 'disabled' ) ;
          } else {
            slider.directionNav.removeClass ( 'disabled' ) ;
          }
        }

        // Call end() callback if slider reaches last slide and is not looping
        if ( ! slider.vars.animationLoop && target == slider.count - 1 ) {
          slider.pause ( ) ;
          // FlexSlider: end() of cycle Callback
          slider.vars.end ( slider ) ;
        }

        if ( slider.vars.animation.toLowerCase ( ) == "slide" ) {
          // Determine the dimension (height or width) for sliding
          var dimension = ( slider.vertical ) ? slider.slides.filter ( ':first' ) . height ( ) : slider.slides.filter ( ':first' ) . width ( ) ;

          // Calculate the `slideString` for carousel looping effect
          if ( slider.currentSlide == 0 && target == slider.count - 1 && slider.vars.animationLoop && slider.direction != "next" ) {
            slider.slideString = "0px" ; // Jump from first to last (via clone)
          } else if ( slider.currentSlide == slider.count - 1 && target == 0 && slider.vars.animationLoop && slider.direction != "prev" ) {
            slider.slideString = ( -1 * ( slider.count + 1 ) ) * dimension + "px" ; // Jump from last to first (via clone)
          } else {
            slider.slideString = ( -1 * ( target + slider.cloneOffset ) ) * dimension + "px" ; // Standard slide calculation
          }
          slider.args [ slider.prop ] = slider.slideString ;

          if ( slider.transitions ) {
              slider.setTransition ( slider.vars.animationDuration ) ; // Set CSS transition duration
              // Apply CSS transform for smooth animation
              slider.args [ slider.prop ] = ( slider.vertical ) ? "translate3d(0," + slider.slideString + ",0)" : "translate3d(" + slider.slideString + ",0,0)" ;
              slider.container.css ( slider.args ) . one ( "webkitTransitionEnd transitionend" , function ( ) {
                slider.wrapup ( dimension ) ; // Callback after transition ends
              } ) ;
          } else {
            // Fallback to jQuery animate for non-CSS3 transitions
            slider.container.animate ( slider.args , slider.vars.animationDuration , function ( ) {
                slider.wrapup ( dimension ) ; // Callback after animation ends
            } ) ;
          }
        } else { // Default to Fade animation
          slider.slides.eq ( slider.currentSlide ) . fadeOut ( slider.vars.animationDuration ) ; // Fade out current slide
          slider.slides.eq ( target ) . fadeIn ( slider.vars.animationDuration , function ( ) {
            slider.wrapup ( ) ; // Callback after fade animation completes
          } ) ;
        }
      }
    } // End slider.flexAnimate

    // FlexSlider: Helper function to finalize animation actions
    slider.wrapup = function ( dimension ) {
      if ( slider.vars.animation == "slide" ) {
        // Handle "jumping" for seamless loop transitions
        if ( slider.currentSlide == 0 && slider.animatingTo == slider.count - 1 && slider.vars.animationLoop ) {
          slider.args [ slider.prop ] = ( -1 * slider.count ) * dimension + "px" ;
          if ( slider.transitions ) {
            slider.setTransition ( 0 ) ; // Reset transition for instant jump
            slider.args [ slider.prop ] = ( slider.vertical ) ? "translate3d(0," + slider.args [ slider.prop ] + ",0)" : "translate3d(" + slider.args [ slider.prop ] + ",0,0)" ;
          }
          slider.container.css ( slider.args ) ;
        } else if ( slider.currentSlide == slider.count - 1 && slider.animatingTo == 0 && slider.vars.animationLoop ) {
          slider.args [ slider.prop ] = -1 * dimension + "px" ;
          if ( slider.transitions ) {
            slider.setTransition ( 0 ) ; // Reset transition for instant jump
            slider.args [ slider.prop ] = ( slider.vertical ) ? "translate3d(0," + slider.args [ slider.prop ] + ",0)" : "translate3d(" + slider.args [ slider.prop ] + ",0,0)" ;
          }
          slider.container.css ( slider.args ) ;
        }
      }
      slider.animating = false ; // Clear animating flag
      slider.currentSlide = slider.animatingTo ; // Update current slide index
      // FlexSlider: after() animation Callback
      slider.vars.after ( slider ) ;
    }

    // FlexSlider: Function for automatic slideshow advancement
    slider.animateSlides = function ( ) {
      if ( ! slider.animating ) {
        slider.flexAnimate ( slider.getTarget ( "next" ) ) ;
      }
    }

    // FlexSlider: Pause the automatic slideshow
    slider.pause = function ( ) {
      clearInterval ( slider.animatedSlides ) ; // Stop the interval
      if ( slider.vars.pausePlay ) {
        slider.pausePlay.removeClass ( 'pause' ) . addClass ( 'play' ) . text ( slider.vars.playText ) ; // Update pause/play button
      }
    }

    // FlexSlider: Resume the automatic slideshow
    slider.resume = function ( ) {
      slider.animatedSlides = setInterval ( slider.animateSlides , slider.vars.slideshowSpeed ) ; // Restart the interval
      if ( slider.vars.pausePlay ) {
        slider.pausePlay.removeClass ( 'play' ) . addClass ( 'pause' ) . text ( slider.vars.pauseText ) ; // Update pause/play button
      }
    }

    // FlexSlider: Determines the next/previous target slide index
    slider.getTarget = function ( direction ) {
      if ( direction == "next" ) {
        return ( slider.currentSlide == slider.count - 1 ) ? 0 : slider.currentSlide + 1 ;
      } else { // Direction is "prev"
        return ( slider.currentSlide == 0 ) ? slider.count - 1 : slider.currentSlide - 1 ;
      }
    }

    // FlexSlider: Checks if the slider can advance to a given target
    slider.canAdvance = function ( target ) {
      // Can always advance if animationLoop is true, or if not at an end slide
      if ( slider.vars.animationLoop || ( target != 0 && target != slider.count - 1 ) ) {
        return true ;
      } else {
        return false ;
      }
    }

    // FlexSlider: Sets CSS transition properties for the container
    slider.setTransition = function ( duration ) {
      var transitionString = "all " + duration / 1000 + "s ease" ;
      slider.container.css ( {
          '-webkit-transition' : transitionString ,
          '-moz-transition' : transitionString ,
          '-o-transition' : transitionString ,
          'transition' : transitionString
      } ) ;
    }

    // FlexSlider: Default Settings object
    $.flexslider.defaults = {
      animation : "fade" , // String: Animation type: "fade" or "slide"
      slideDirection : "horizontal" , // String: Sliding direction: "horizontal" or "vertical"
      slideshow : true , // Boolean: Enable automatic slideshow
      slideshowSpeed : 7000 , // Integer: Slideshow cycle speed in milliseconds
      animationDuration : 600 , // Integer: Animation speed in milliseconds
      directionNav : true , // Boolean: Show previous/next navigation arrows
      controlNav : true , // Boolean: Show paging control navigation (dots/pips)
      keyboardNav : true , // Boolean: Enable keyboard navigation (left/right arrow keys)
      mousewheel : false , // Boolean: Enable mousewheel navigation
      prevText : "Previous" , // String: Text for the "previous" button
      nextText : "Next" , // String: Text for the "next" button
      pausePlay : false , // Boolean: Show a pause/play button
      pauseText : 'Pause' , // String: Text for the "pause" button
      playText : 'Play' , // String: Text for the "play" button
      randomize : false , // Boolean: Randomize slide order on initialization
      slideToStart : 0 , // Integer: Index of the starting slide (0-based)
      animationLoop : true , // Boolean: Enable seamless looping animation
      pauseOnAction : true , // Boolean: Pause slideshow when control elements are interacted with
      pauseOnHover : false , // Boolean: Pause slideshow when hovering over the slider
      controlsContainer : "" , // Selector: Custom container for controls
      manualControls : "" , // Selector: Custom elements for control navigation
      start : function ( ) { } , // Callback: Fires when the slider loads the first slide
      before : function ( ) { } , // Callback: Fires asynchronously before each animation
      after : function ( ) { } , // Callback: Fires asynchronously after each animation
      end : function ( ) { } // Callback: Fires when the slider reaches the last slide (non-looping)
    }

    // FlexSlider: Initialize the slider instance
    slider.init ( ) ;
  }
} ) ( jQuery ) ;