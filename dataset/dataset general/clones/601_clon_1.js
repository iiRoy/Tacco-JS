/*
 * This is a modified version of slippry.
 * All original functionality is preserved.
 * Changes are purely cosmetic: whitespace and comments.
 *
 * Original Project: slippry v1.2.9 - Responsive content slider for jQuery
 * Website: http://slippry.com
 * Authors: Lukas Jakob Hafner (@saftsaak), Thomas Hurd (@SeenNotHurd)
 * Copyright: 2015, booncon oy - http://booncon.com
 * License: MIT License (http://opensource.org/licenses/MIT)
 *
 * Note: This file has been extensively re-formatted to demonstrate Type I cloning.
 *
 */

(function ($) {

  "use strict";

  var defaults; // Declaration of the default settings object.


  defaults = {

    // --- General Elements & Wrapper Settings ---
    // This group defines the HTML structure and CSS classes used by Slippry.
    slippryWrapper: '<div class="sy-box" />',     // Main wrapper for the entire slider, including pager.
    slideWrapper:   '<div class="sy-slides-wrap" />', // Wrapper specifically for slides and navigation controls.
    slideCrop:      '<div class="sy-slides-crop" />', // An additional wrapper around just the slide elements themselves.
    boxClass:       'sy-list',                     // CSS class applied to the original element that Slippry initializes on.
    elements:       'li',                          // Selector for the actual slide content elements within the original container.
    activeClass:    'sy-active',                   // CSS class indicating the currently active (visible) slide.
    fillerClass:    'sy-filler',                   // CSS class for the intrinsic placeholder element, used for responsive sizing.
    loadingClass:   'sy-loading',                  // Class applied during the loading phase of the slider.


    // --- Core Options and Behavior ---
    adaptiveHeight: true,                          // If true, the slider's height will adjust to the content of the current slide.
    start:          1,                             // Specifies the initial slide to display (1-based index or 'random').
    loop:           true,                          // Enables continuous looping: first -> last and last -> first transitions.
    captionsSrc:    'img',                         // Source for captions: 'img' (from alt/title of img) or 'el' (from title of slide element).
    captions:       'overlay',                     // Position of captions: 'overlay', 'below', 'custom', or false to disable.
    captionsEl:     '.sy-caption',                 // jQuery selector for the custom captions wrapper element.
    initSingle:     true,                          // Whether to initialize Slippry even if there's only one slide.
    responsive:     true,                          // Enables responsive behavior for the slider.
    preload:        'visible',                     // Defines which resources to wait for before showing the slider ('visible' or 'all').


    // --- Pager (Navigation Dots/Bullets) Settings ---
    pager:          true,                          // Enables or disables the pager navigation.
    pagerClass:     'sy-pager',                    // CSS class for the pager container.


    // --- Control Arrows Settings ---
    controls:       true,                          // Enables or disables the previous/next control arrows.
    controlClass:   'sy-controls',                 // CSS class for the controls container.
    prevClass:      'sy-prev',                     // CSS class for the 'previous' button.
    prevText:       'Previous',                    // Text content for the 'previous' button.
    nextClass:      'sy-next',                     // CSS class for the 'next' button.
    nextText:       'Next',                        // Text content for the 'next' button.
    hideOnEnd:      true,                          // If true and not looping, hide controls at the first/last slide.


    // --- Transition Effects Settings ---
    transition:     'fade',                        // Type of transition: 'fade', 'horizontal', 'vertical', 'kenburns', or false for no transition.
    kenZoom:        120,                           // Maximum zoom percentage for the Ken Burns effect (e.g., 120% means 20% zoom).
    slideMargin:    0,                             // Spacing between slides, expressed as a percentage (e.g., 0 for no space).
    transClass:     'transition',                  // CSS class applied to an element during a transition.
    speed:          800,                           // Duration of the transition animation in milliseconds (ms).
    easing:         'swing',                       // Easing function to use for animations (e.g., 'swing', 'linear', or custom jQuery UI easings).
    continuous:     true,                          // Enables seamless first/last transitions, only effective when 'loop' is true.
    useCSS:         true,                          // If true, attempts to use CSS transitions; falls back to JavaScript if not supported.


    // --- Slideshow (Auto-play) Settings ---
    auto:           true,                          // Enables or disables automatic slide progression.
    autoDirection:  'next',                        // Direction for auto-play: 'next' or 'prev'.
    autoHover:      true,                          // Pauses auto-play when the mouse hovers over the slider.
    autoHoverDelay: 100,                           // Delay in milliseconds before auto-play resumes after hover ends.
    autoDelay:      500,                           // Initial delay in milliseconds before auto-play starts after slider load.
    pause:          4000,                          // Time in milliseconds each slide is displayed during auto-play.


    // --- Callback Functions ---
    // These functions are called at specific points in the slider's lifecycle.
    onSliderLoad: function ( ) {                   // Callback executed once the slider has fully loaded.
      return this;
    },
    onSlideBefore: function ( ) {                  // Callback executed just before a slide transition begins.
      return this;
    },
    onSlideAfter: function ( ) {                   // Callback executed after a slide transition has completed.
      return this;
    }
  };


  // Main jQuery plugin definition for slippry.
  $.fn.slippry = function ( options ) {

    // Declare all internal utility functions and variables for the slippry instance.
    var slip,
        el,
        prepareFiller,
        getFillerProportions,
        init,
        updateCaption,
        initPager,
        initControls,
        ready,
        transitionDone,
        whichTransitionEvent,
        initCaptions,
        updatePager,
        setFillerProportions,
        doTransition,
        updateSlide,
        openSlide,
        updateControls,
        updatePos,
        supports,
        preload,
        start,
        elFromSel,
        doKens;


    // 'el' refers to the jQuery object that slippry was called on.
    el = this;


    // If no elements are matched by the selector, simply return the jQuery object.
    if ( el.length === 0 ) {
      return this;
    }


    // Handle multiple elements: iterate and apply slippry to each.
    if ( el.length > 1 ) {
      el.each( function ( ) {
        $( this ).slippry( options );
      });
      return this;
    }


    // 'slip' will hold the internal state and settings for this slippry instance.
    slip = {};
    slip.vars = {}; // Stores dynamic variables related to the slider's current state.


    /**
     * Detects which transition end event the browser supports.
     * @returns {string|undefined} The name of the transition end event or undefined if not supported.
     * (Thanks to http://stackoverflow.com/a/18672988 for the base idea!)
     */
    whichTransitionEvent = function ( ) {
      var t,
          div,
          transitions;

      div = document.createElement( 'div' ); // Create a dummy div to test styles.
      transitions = {
        'WebkitTransition' : 'webkitTransitionEnd',
        'MozTransition'    : 'transitionend',
        'MSTransition'     : 'msTransitionEnd',
        'OTransition'      : 'oTransitionEnd',
        'transition'       : 'transitionEnd transitionend' // Standard and older 'transitionend'.
      };

      // Loop through known transition properties to find the supported one.
      for ( t in transitions ) {
        if ( div.style[ t ] !== undefined ) {
          return transitions[ t ]; // Return the event name if property is found.
        }
      }
    };


    /**
     * Checks for CSS property support across different browser vendors.
     * @param {string} prop The CSS property name to check (e.g., 'transform').
     * @returns {boolean} True if the property (or its vendor-prefixed version) is supported, false otherwise.
     * (Thanks to http://net.tutsplus.com/tutorials/html-css-techniques/quick-tip-detect-css-support-in-browsers-with-javascript/)
     */
    supports = ( function ( ) {
      var div = document.createElement( 'div' ),
          vendors = [ 'Khtml', 'Ms', 'O', 'Moz', 'Webkit' ], // Array of vendor prefixes.
          len = vendors.length;

      return function ( prop ) {
        // Check for the unprefixed property first.
        if ( prop in div.style ) {
          return true;
        }

        // Capitalize the first letter of the property for vendor prefixing.
        prop = prop.replace( /^[a-z]/, function ( val ) {
          return val.toUpperCase( );
        });

        // Check with vendor prefixes.
        while ( len-- ) {
          if ( vendors[ len ] + prop in div.style ) {
            return true;
          }
        }
        return false;
      };
    }( ) );


    /**
     * Creates a new jQuery element from a selector string that might contain ID or class names.
     * This allows creating elements like `elFromSel('<div>', 'my-class #my-id')`.
     * @param {string} sel The base HTML tag selector (e.g., '<div>').
     * @param {string} prop A string containing classes (space-separated) and/or an ID (prefixed with '#').
     * @returns {jQuery} The newly created jQuery element with the specified attributes.
     */
    elFromSel = function ( sel, prop ) {
      var props,
          newelement,
          id,
          className;

      props = prop.split( '.' ); // Split the property string by dots (often used for classes).
      newelement = $( sel );     // Create the base element.
      id = '';
      className = '';

      // Iterate through the parts to extract ID and classes.
      $.each( props, function ( i, val ) {
        if ( val.indexOf( '#' ) >= 0 ) {
          id += val.replace( /^#/, '' ); // Remove '#' prefix for ID.
        } else {
          className += val + ' '; // Accumulate class names.
        }
      });

      // Apply ID if found.
      if ( id.length ) {
        newelement.attr( 'id', id );
      }

      // Apply class names if found, trimming any trailing space.
      if ( className.length ) {
        newelement.attr( 'class', $.trim( className ) );
      }

      return newelement;
    };


    /**
     * Executes the Ken Burns effect on the active slide.
     * This function is used when CSS transitions are not available or disabled.
     */
    doKens = function ( ) {
      var kenStart,
          kenTime,
          animProp,
          cssProp;

      animProp = {}; // Properties for the animation.
      cssProp = {};  // Initial CSS properties.

      // Calculate the starting position for the Ken Burns effect.
      kenStart = 100 - slip.settings.kenZoom;
      cssProp.width = slip.settings.kenZoom + '%'; // Set the initial width based on zoom.

      // Alternate starting positions based on slide index for visual variety.
      if ( slip.vars.active.index( ) % 2 === 0 ) {
        cssProp.left = kenStart + '%';
        cssProp.top = kenStart + '%';
        animProp.left = '0%';
        animProp.top = '0%';
      } else {
        cssProp.left = '0%';
        cssProp.top = '0%';
        animProp.left = kenStart + '%';
        animProp.top = kenStart + '%';
      }

      // Calculate the duration for the Ken Burns animation.
      kenTime = slip.settings.pause + slip.settings.speed * 2;

      // Apply initial CSS and then animate.
      slip.vars.active.css( cssProp );
      slip.vars.active.animate( animProp, { duration: kenTime, easing: slip.settings.easing, queue: false } );
    };


    /**
     * Marks the slider as ready after initial loading or filler setup.
     * Removes loading class and starts auto-play if enabled.
     */
    ready = function ( ) {
      // Check if it's the initial load.
      if ( slip.vars.fresh ) {
        slip.vars.slippryWrapper.removeClass( slip.settings.loadingClass ); // Remove loading indicator.
        slip.vars.fresh = false; // Mark as no longer fresh.

        if ( slip.settings.auto ) {
          el.startAuto( ); // Start auto-play if configured.
        }

        // Apply Ken Burns effect if transition is 'kenburns' and CSS is not used.
        if ( !slip.settings.useCSS && slip.settings.transition === 'kenburns' ) {
          doKens( );
        }

        // Trigger the onSliderLoad callback.
        slip.settings.onSliderLoad.call( undefined, slip.vars.active.index( ) );
      } else {
        // If not fresh, ensure the filler element is marked as ready.
        $( '.' + slip.settings.fillerClass, slip.vars.slideWrapper ).addClass( 'ready' );
      }
    };


    /**
     * Sets the padding-top for the filler element to maintain aspect ratio.
     * This creates the intrinsic placeholder effect for responsive images.
     * @param {number} width The width of the slide content.
     * @param {number} height The height of the slide content.
     */
    setFillerProportions = function ( width, height ) {
      var ratio,
          p_top,
          $filler;

      ratio = width / height;
      // Calculate padding-top percentage for intrinsic ratio (cool trick from A List Apart).
      p_top = ( 1 / ratio ) * 100 + '%';
      $filler = $( '.' + slip.settings.fillerClass, slip.vars.slideWrapper );

      // Apply padding-top to the filler element.
      $filler.css( { paddingTop: p_top } ); // True responsiveness without JS resizing.
      ready( ); // Mark slider as ready after filler is set.
    };


    /**
     * Determines the aspect ratio of a slide (or its image) and calls setFillerProportions.
     * @param {jQuery} $slide The jQuery object representing the slide to measure.
     */
    getFillerProportions = function ( $slide ) {
      var width,
          height;

      // If the slide contains an image with a source.
      if ( ( $( 'img', $slide ).attr( "src" ) !== undefined ) ) {
        // Create a temporary image to load its dimensions.
        $( "<img />" ).load( function ( ) {
          width = $slide.width( );
          height = $slide.height( );
          setFillerProportions( width, height );
        }).attr( "src", $( 'img', $slide ).attr( "src" ) );
      } else {
        // If no image, use the slide's current dimensions directly.
        width = $slide.width( );
        height = $slide.height( );
        setFillerProportions( width, height );
      }
    };


    /**
     * Prepares the filler element to ensure correct height for adaptive or fixed height sliders.
     */
    prepareFiller = function ( ) {
      // If no filler element exists, create and append one.
      if ( $( '.' + slip.settings.fillerClass, slip.vars.slideWrapper ).length === 0 ) {
        slip.vars.slideWrapper.append( $( '<div class="' + slip.settings.fillerClass + '" />' ) );
      }

      // Determine how to set filler height based on adaptiveHeight setting.
      if ( slip.settings.adaptiveHeight === true ) {
        // If adaptive, set filler height based on the currently active slide.
        getFillerProportions( $( '.' + slip.settings.activeClass, el ) );
      } else {
        // If not adaptive, find the tallest slide and use its proportions.
        var $highest,
            height,
            loop;

        height = 0;
        loop = 0;

        $( slip.vars.slides ).each( function ( ) {
          if ( $( this ).height( ) > height ) {
            $highest = $( this );
            height = $highest.height( );
          }
          loop = loop + 1;
          // After checking all slides, set proportions based on the highest.
          if ( loop === slip.vars.count ) {
            if ( $highest === undefined ) {
              // Fallback if somehow no slide was found (e.g., empty slider).
              $highest = $( $( slip.vars.slides )[ 0 ] );
            }
            getFillerProportions( $highest );
          }
        });
      }
    };


    /**
     * Updates the active state of pager elements to reflect the current slide.
     */
    updatePager = function ( ) {
      if ( slip.settings.pager ) {
        // Remove active class from all pager items.
        $( '.' + slip.settings.pagerClass + ' li', slip.vars.slippryWrapper ).removeClass( slip.settings.activeClass );
        // Add active class to the pager item corresponding to the current slide.
        $( $( '.' + slip.settings.pagerClass + ' li', slip.vars.slippryWrapper )[ slip.vars.active.index( ) ] ).addClass( slip.settings.activeClass );
      }
    };


    /**
     * Updates the visibility of navigation controls (prev/next buttons).
     * Hides them at the ends if loop is false and hideOnEnd is true.
     */
    updateControls = function ( ) {
      if ( !slip.settings.loop && slip.settings.hideOnEnd ) {
        // Toggle visibility of 'prev' button based on 'first' flag.
        $( '.' + slip.settings.prevClass, slip.vars.slippryWrapper )[ slip.vars.first ? 'hide' : 'show' ]( );
        // Toggle visibility of 'next' button based on 'last' flag.
        $( '.' + slip.settings.nextClass, slip.vars.slippryWrapper )[ slip.vars.last ? 'hide' : 'show' ]( );
      }
    };


    /**
     * Updates the caption text based on the active slide's attributes.
     */
    updateCaption = function ( ) {
      var caption,
          wrapper;

      if ( slip.settings.captions !== false ) {
        // Determine caption source.
        if ( slip.settings.captionsSrc !== 'img' ) {
          caption = slip.vars.active.attr( 'title' ); // From the slide element's title.
        } else {
          // From the image's title or alt attribute within the slide.
          caption = $( 'img', slip.vars.active ).attr( 'title' ) !== undefined ? $( 'img', slip.vars.active ).attr( 'title' ) : $( 'img', slip.vars.active ).attr( 'alt' );
        }

        // Determine caption wrapper element.
        if ( slip.settings.captions !== 'custom' ) {
          wrapper = $( slip.settings.captionsEl, slip.vars.slippryWrapper ); // Internal wrapper.
        } else {
          wrapper = $( slip.settings.captionsEl ); // Custom external wrapper.
        }

        // Update wrapper HTML and visibility.
        if ( ( caption !== undefined ) && ( caption !== '' ) ) {
          wrapper.html( caption ).show( );
        } else {
          wrapper.hide( );
        }
      }
    };


    /**
     * Starts the auto-play slideshow functionality.
     * Manages delays, intervals, and hover pauses.
     */
    el.startAuto = function ( ) {
      // Only start if not already running.
      if ( ( slip.vars.timer === undefined ) && ( slip.vars.delay === undefined ) ) {
        // Set an initial delay before the main auto-play interval starts.
        slip.vars.delay = window.setTimeout( function ( ) {
          slip.vars.autodelay = false; // Reset autodelay flag.
          slip.vars.timer = window.setInterval( function ( ) {
            slip.vars.trigger = 'auto'; // Indicate auto-triggered slide change.
            openSlide( slip.settings.autoDirection ); // Move to the next/previous slide.
          }, slip.settings.pause );
        }, slip.vars.autodelay ? slip.settings.autoHoverDelay : slip.settings.autoDelay ); // Use hover delay if coming from hover pause.

        // Set up auto-hover functionality if enabled.
        if ( slip.settings.autoHover ) {
          slip.vars.slideWrapper.unbind( 'mouseenter' ).unbind( 'mouseleave' ).bind( 'mouseenter', function ( ) {
            if ( slip.vars.timer !== undefined ) {
              slip.vars.hoverStop = true; // Mark that auto-play was stopped by hover.
              el.stopAuto( ); // Stop the auto-play.
            } else {
              slip.vars.hoverStop = false; // Not stopped by hover if timer wasn't running.
            }
          }).bind( 'mouseleave', function ( ) {
            if ( slip.vars.hoverStop ) {
              slip.vars.autodelay = true; // Set flag to use hover delay when restarting.
              el.startAuto( ); // Resume auto-play.
            }
          });
        }
      }
    };


    /**
     * Stops the auto-play slideshow functionality.
     * Clears any active timers or delays.
     */
    el.stopAuto = function ( ) {
      window.clearInterval( slip.vars.timer ); // Clear the main auto-play interval.
      slip.vars.timer = undefined;
      window.clearTimeout( slip.vars.delay ); // Clear the initial auto-play delay.
      slip.vars.delay = undefined;
    };


    /**
     * Refreshes the slider's visual state (active slide, controls, pager, caption).
     * This is called after a slide change or initial load.
     */
    el.refresh = function ( ) {
      slip.vars.slides.removeClass( slip.settings.activeClass ); // Remove active class from all slides.
      slip.vars.active.addClass( slip.settings.activeClass );   // Add active class to the current slide.

      if ( slip.settings.responsive ) {
        prepareFiller( ); // Re-prepare the filler for responsive sizing.
      } else {
        ready( ); // Mark as ready if not responsive (no filler needed).
      }

      updateControls( ); // Update control arrow visibility.
      updatePager( );    // Update pager active state.
      updateCaption( );  // Update slide caption.
    };


    /**
     * Wrapper for refreshing the slide, used primarily after a transition.
     */
    updateSlide = function ( ) {
      el.refresh( );
    };


    /**
     * Callback executed once a slide transition has completed.
     * Resets flags, removes transition classes, and restarts auto-play.
     */
    transitionDone = function ( ) {
      slip.vars.moving = false; // No longer moving.
      slip.vars.active.removeClass( slip.settings.transClass ); // Remove transition class from active slide.

      if ( !slip.vars.fresh ) {
        slip.vars.old.removeClass( 'sy-ken' ); // Remove kenburns class from old slide if not initial load.
      }
      slip.vars.old.removeClass( slip.settings.transClass ); // Remove transition class from old slide.

      // Trigger the onSlideAfter callback.
      slip.settings.onSlideAfter.call( undefined, slip.vars.active, slip.vars.old.index( ), slip.vars.active.index( ) );

      // Restart auto-play if enabled and not stopped by hover.
      if ( slip.settings.auto ) {
        if ( !slip.vars.hoverStop || slip.vars.hoverStop === undefined ) {
          el.startAuto( );
        }
      }
    };


    /**
     * Executes the slide transition animation.
     */
    doTransition = function ( ) {
      var pos,
          jump,
          old_left,
          old_pos,
          kenTime,
          ref,
          cssProp;

      // Trigger the onSlideBefore callback.
      slip.settings.onSlideBefore.call( undefined, slip.vars.active, slip.vars.old.index( ), slip.vars.active.index( ) );

      if ( slip.settings.transition !== false ) {
        slip.vars.moving = true; // Mark slider as currently transitioning.

        if ( ( slip.settings.transition === 'fade' ) || ( slip.settings.transition === 'kenburns' ) ) {
          // --- Fade and Ken Burns Transitions ---
          if ( slip.vars.fresh ) {
            // Initial load for fade/kenburns.
            if ( slip.settings.useCSS ) {
              slip.vars.slides.css( { transitionDuration: slip.settings.speed + 'ms', opacity: 0 } );
            } else {
              slip.vars.slides.css( { opacity: 0 } );
            }
            slip.vars.active.css( 'opacity', 1 ); // Make active slide visible.

            if ( slip.settings.transition === 'kenburns' ) {
              if ( slip.settings.useCSS ) {
                kenTime = slip.settings.pause + slip.settings.speed * 2;
                slip.vars.slides.css( { animationDuration: kenTime + 'ms' } );
                slip.vars.active.addClass( 'sy-ken' ); // Apply kenburns class for CSS animation.
              }
            }
            transitionDone( ); // Mark transition as done immediately for initial load.
          } else {
            // Subsequent transitions for fade/kenburns.
            if ( slip.settings.useCSS ) {
              slip.vars.old.addClass( slip.settings.transClass ).css( 'opacity', 0 ); // Fade out old slide.
              slip.vars.active.addClass( slip.settings.transClass ).css( 'opacity', 1 ); // Fade in active slide.

              if ( slip.settings.transition === 'kenburns' ) {
                slip.vars.active.addClass( 'sy-ken' ); // Apply kenburns class for CSS animation.
              }

              // Bugfix for Safari 7: re-trigger transition end on window focus.
              $( window ).off( 'focus' ).on( 'focus', function ( ) {
                if ( slip.vars.moving ) {
                  slip.vars.old.trigger( slip.vars.transition );
                }
              });

              // Use native transitionend event.
              slip.vars.old.one( slip.vars.transition, function ( ) {
                transitionDone( );
                return this;
              });
            } else {
              // Fallback to JavaScript animation.
              if ( slip.settings.transition === 'kenburns' ) {
                doKens( ); // Apply Ken Burns effect with JS.
              }
              slip.vars.old.addClass( slip.settings.transClass ).animate( {
                opacity: 0
              }, slip.settings.speed, slip.settings.easing, function ( ) {
                transitionDone( ); // Call transitionDone when old slide finishes fading out.
              });
              slip.vars.active.addClass( slip.settings.transClass ).css( 'opacity', 0 ).animate( {
                opacity: 1
              }, slip.settings.speed, slip.settings.easing );
            }
          }
          updateSlide( ); // Update slide state (active class, pager, etc.).
        } else if ( ( slip.settings.transition === 'horizontal' ) || ( slip.settings.transition === 'vertical' ) ) {
          // --- Horizontal and Vertical Transitions ---
          ref = ( slip.settings.transition === 'horizontal' ) ? 'left' : 'top'; // Determine CSS property to animate.
          pos = '-' + slip.vars.active.index( ) * ( 100 + slip.settings.slideMargin ) + '%'; // Calculate target position.

          if ( slip.vars.fresh ) {
            el.css( ref, pos ); // Set initial position directly.
            transitionDone( );  // Mark transition as done immediately.
          } else {
            cssProp = {}; // Object to hold CSS properties for animation.
            // Handle continuous looping for horizontal/vertical transitions.
            if ( slip.settings.continuous ) {
              if ( slip.vars.jump && ( ( slip.vars.trigger === 'controls' ) || ( slip.vars.trigger === 'auto' ) ) ) {
                jump = true; // Flag to indicate a 'jump' transition (e.g., from last to first slide).
                old_pos = pos; // Store target position.

                if ( slip.vars.first ) {
                  old_left = 0; // Position for the slide that will "jump".
                  slip.vars.active.css( ref, slip.vars.count * ( 100 + slip.settings.slideMargin ) + '%' ); // Position active slide far right.
                  pos = '-' + slip.vars.count * ( 100 + slip.settings.slideMargin ) + '%'; // New target position for container.
                } else {
                  old_left = ( slip.vars.count - 1 ) * ( 100 + slip.settings.slideMargin ) + '%'; // Position for the slide that will "jump".
                  slip.vars.active.css( ref, -( 100 + slip.settings.slideMargin ) + '%' ); // Position active slide far left.
                  pos = ( 100 + slip.settings.slideMargin ) + '%'; // New target position for container.
                }
              }
            }
            slip.vars.active.addClass( slip.settings.transClass ); // Add transition class to active slide.

            if ( slip.settings.useCSS ) {
              // Use CSS transitions.
              cssProp[ ref ] = pos;
              cssProp.transitionDuration = slip.settings.speed + 'ms';
              el.addClass( slip.settings.transition ); // Add class to trigger CSS transition.
              el.css( cssProp ); // Apply CSS properties.

              // Bugfix for Safari 7: re-trigger transition end on window focus.
              $( window ).off( 'focus' ).on( 'focus', function ( ) {
                if ( slip.vars.moving ) {
                  el.trigger( slip.vars.transition );
                }
              });

              el.one( slip.vars.transition, function ( ) {
                el.removeClass( slip.settings.transition ); // Remove transition class.
                if ( jump ) {
                  // If it was a 'jump' transition, reset positions immediately after animation.
                  slip.vars.active.css( ref, old_left ); // Reset active slide position.
                  cssProp[ ref ] = old_pos;             // Reset container position.
                  cssProp.transitionDuration = '0ms';   // Make reset instantaneous.
                  el.css( cssProp );
                }
                transitionDone( ); // Mark transition as done.
                return this;
              });
            } else {
              // Fallback to JavaScript animation.
              cssProp[ ref ] = pos;
              el.stop( ).animate( cssProp, slip.settings.speed, slip.settings.easing, function ( ) {
                if ( jump ) {
                  // If it was a 'jump' transition, reset positions after animation.
                  slip.vars.active.css( ref, old_left );
                  el.css( ref, old_pos );
                }
                transitionDone( ); // Mark transition as done.
                return this;
              });
            }
          }
          updateSlide( ); // Update slide state.
        }
      } else {
        // --- No Transition (false) ---
        updateSlide( );   // Still update slide state.
        transitionDone( ); // Mark transition as done immediately.
      }
    };


    /**
     * Updates the 'first' and 'last' flags based on the current slide index.
     * @param {number|string} slide The index of the current slide or 'prev'/'next'.
     */
    updatePos = function ( slide ) {
      slip.vars.first = slip.vars.last = false; // Reset flags.

      if ( ( slide === 'prev' ) || ( slide === 0 ) ) {
        slip.vars.first = true; // Currently at the first slide.
      } else if ( ( slide === 'next' ) || ( slide === slip.vars.count - 1 ) ) {
        slip.vars.last = true;  // Currently at the last slide.
      }
    };


    /**
     * Opens a specific slide, handling direction, looping, and preventing concurrent transitions.
     * @param {number|string} slide The index of the slide to open, or 'prev'/'next'.
     */
    openSlide = function ( slide ) {
      var current;

      if ( !slip.vars.moving ) { // Prevent new transition if one is already in progress.
        if ( slip.vars.trigger !== 'auto' ) {
          el.stopAuto( ); // Stop auto-play if triggered manually.
        }

        current = slip.vars.active.index( ); // Get the index of the currently active slide.

        if ( slide === 'prev' ) {
          // If 'prev', move to the previous slide.
          if ( current > 0 ) {
            slide = current - 1;
          } else if ( slip.settings.loop ) {
            slide = slip.vars.count - 1; // Loop to the last slide if at the first.
          }
        } else if ( slide === 'next' ) {
          // If 'next', move to the next slide.
          if ( current < slip.vars.count - 1 ) {
            slide = current + 1;
          } else if ( slip.settings.loop ) {
            // Loop to the first slide if at the last.
            // (The provided code snippet ends here, assuming it continues with `slide = 0;` or similar logic).
            // For cloning, I'll keep it as is, assuming the original intent.
            // If the original code was complete, this would likely be `slide = 0;`.
            // As per instructions, I must not change actual code.