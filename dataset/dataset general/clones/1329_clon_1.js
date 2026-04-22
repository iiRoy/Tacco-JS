/*
 * YerSlider - A flexible JavaScript slider solution
 *
 * This file contains the core logic for the YerSlider library.
 * It manages content sliding, animations, and various interactive features.
 *
 * Copyright (c) 2014 Johann Heyne. All rights reserved.
 *
 * License: Dual licensed under the MIT or GPL Version 2 licenses.
 * Please refer to the project's license file for more details.
 *
 */


var yerslider = { };
// Flag to indicate if the YouTube Iframe API is ready for use
 yerslider.youtubeready = false;
 // Flag to check if the YouTube Iframe API script has been loaded
 yerslider.youtubeloaded = false;

/**
 * Callback function required by the YouTube Iframe API.
 * Sets a global flag when the API is fully loaded and ready.
 */
function onYouTubeIframeAPIReady ( ) {

  yerslider.youtubeready = true; // Update the readiness flag
}


/**
 * Main constructor function for the YerSlider.
 * Initializes a new slider instance with its parameters and state.
 */
function YerSlider ( ) {

  var t = this; // Self-reference for easier access within the object's methods

  // Default parameters for the slider instance
  t.param = {

    // --- Path Configuration ---
    yersliderfolderabsolutepath: '/', // Absolute path to the YerSlider library folder

    // --- Slider Identification ---
    sliderid: '.yerslider', // CSS selector for the main slider container

    // --- Asset Loading ---
    imagesloaded: [ 'slide', 'thumbs' ], /* Possible values: [ 'slider', 'slide', 'thumbs' ] */
    loadingmessagedelay: 30, // Delay in milliseconds before showing a loading message

    // --- Slide Layout ---
    slidegap: 0, // Gap between individual slides in pixels

    // --- Sliding Behavior ---
    slidingstep: undefined, // Number of slides to advance per step (undefined means one slide/group)

    // --- Slide Grouping ---
    slidegroup: 1, // Number of slides to show per group
    slidegroupresp: { }, // Responsive settings for slide groups (e.g., { 768: 2, 1024: 3 })

    // --- Swipe Functionality ---
    swipe: false, // Enable touch/mouse swipe gestures
    swipemouse: false, // Enable mouse swiping (in addition to touch)
    swipeandprevnextbtn: false, // Allow both swipe and prev/next buttons
    swipeanimationspeed: 300, // Animation speed for swipe gestures in milliseconds

    // --- Animation Settings ---
    animationtype: 'ease', /* CSS easing function: ease, ease-in-out, ease-in, ease-out, linear */
    animationspeed: 1000, // Default animation speed for slide transitions in milliseconds

    // --- Loop Behavior ---
    loop: 'none', /* Loop type: infinite, rollback, none */
    loopswipe: 'none', /* Loop type specifically for swipe gestures: infinite, none */

    // --- Autoplay Settings ---
    autoplay: false, /* Enable autoplay: true or false */
    autoplayinterval: 3000, /* Time between slides in milliseconds (integer), 0 to disable */
    autoplaybreakmin: 10, /* Minimum break duration after manual interaction in milliseconds */
    autoplaybreak: false, /* Set a fixed break duration after interaction. If false, calculated from animationspeed. */
    autoplaydelaystart: 0, /* Delay before autoplay starts for the first time in milliseconds */
    autoplaystoponhover: true, // Stop autoplay when mouse hovers over the slider

    autoplaycontinuously: false, /* Enable continuous autoplay without discrete slides: true or false */
    autoplaycontinuouslyspeed: 10000, // Speed for continuous autoplay (duration for one full cycle)
    autoplaycontinuouslystoponhover: true, // Stop continuous autoplay on hover

    // --- CSS Class Names ---
    sliderclass: '.yerslider', // Main slider container class
    sliderwrapclass: '.yerslider-wrap', // Wrapper for the slider
    sliderviewportclass: '.yerslider-viewport', // Viewport that clips the slider content
    slidermaskclass: '.yerslider-mask', // Mask that handles overflow
    // Note: sliderclass redefined, likely an error in original code, keeping for clone accuracy.
    sliderclass: '.yerslider-slider', // The actual slider element containing slides
    slideclass: '.yerslider-slide', // Individual slide element class
    loadingclass: '.yerslider-loading', // Class for the loading indicator

    // --- Navigation Buttons ---
    nextbtn: true, // Enable 'next' navigation button
    prevbtn: true, // Enable 'previous' navigation button
    prevnextlocation: 'inside', // Position of prev/next buttons: 'inside' or 'outside'
    prevnextclass: '.yerslider-prevnext', // Base class for prev/next buttons
    nextclass: '.yerslider-next', // Class for the 'next' button
    prevclass: '.yerslider-prev', // Class for the 'previous' button
    nextinactiveclass: '.yerslider-next-inactive', // Class for inactive 'next' button
    previnactiveclass: '.yerslider-prev-inactive', // Class for inactive 'previous' button
    nextclassadd: '', // Additional class(es) to add to the 'next' button
    prevclassadd: '', // Additional class(es) to add to the 'previous' button

    // --- Keyboard Navigation ---
    nextkey: 13, // Key code for 'next' slide (e.g., Enter key)
    prevkey: 14, // Key code for 'previous' slide (e.g., custom key)

    // --- Bullet Navigation ---
    bullets: false, // Enable bullet navigation indicators
    bulletslocation: 'outside', // Position of bullets: 'inside' or 'outside'
    bulletclickable: true, // Make bullets clickable to jump to slides
    sliderwrapclasshasbullets: '.yerslider-has-bullets', // Class added to wrapper when bullets are present
    bulletswrapclass: '.yerslider-bullets-wrap', // Wrapper for bullet navigation
    bulletclass: '.yerslider-bullet', // Class for individual bullet
    bulletcurrentclass: '.yerslider-bullet-current', // Class for the current active bullet

    // --- Thumbnail Navigation ---
    thumbs: false, // Enable thumbnail navigation
    thumbshideiflessthan: 2, // Hide thumbs if there are fewer than this number of slides
    thumbslocation: 'outside', // Position of thumbs: 'inside' or 'outside'
    thumbstemplates: { }, // Templates for rendering thumbnails
    thumbsclickable: true, // Make thumbnails clickable to jump to slides
    sliderwrapclasshasthumbs: '.yerslider-has-thumbs', // Class added to wrapper when thumbs are present
    thumbswrapclass: '.yerslider-thumbs-wrap', // Wrapper for thumbnail navigation
    thumbsviewportclass: '.yerslider-thumbs-viewport', // Viewport for thumbnail scrolling
    thumbsmaskclass: '.yerslider-thumbs-mask', // Mask for thumbnail overflow
    thumbsitemsclass: '.yerslider-thumbs-items', // Container for individual thumbnail items
    thumbsitemclass: '.yerslider-thumbs-item', // Class for an individual thumbnail item
    thumbsready: undefined, // Callback function executed when thumbs are ready

    // --- Video Integration ---
    sublimevideo: false, // Enable SublimeVideo integration
    autoloadyoutubeiframeapi: true, // Automatically load YouTube Iframe API if needed
    videoplayercloseafterend: true, // Close video player after video finishes playing

    // --- Scrolling Behavior ---
    scrolltop: false, // Scroll to top of slider after slide change
    scrolltopval: 0, // Offset value for scroll-to-top
    scrolltopspeed: 500, // Speed of scroll-to-top animation in milliseconds

    // showslidestime: 500, // Original comment, keeping for clone accuracy.

    dependencies_autoload: true, // Automatically load external dependencies (e.g., imagesLoaded, TouchSwipe)

    // --- Callbacks ---
    sliderready: undefined, // Callback function fired when the slider is fully initialized and ready

    // --- Detaching/Destroying ---
    detach: undefined, // Function to call when detaching the slider

    // --- Fade-in Animation ---
    sliderfadeinspeed: 'slow' // Speed for the initial slider fade-in animation
  };

  // Internal state variables for the slider instance
  t.stat = {
    slidegroupmax: 1, // Maximum number of slides in a group (responsive)
    slidegroup: 1, // Current number of slides in a group
    currentslideindex: 0, // Index of the currently active slide
    currentslideposition: 0, // Pixel position of the current slide
    slidecount: 0, // Total number of slides
    slidermaskwidth: 0, // Width of the slider's mask area
    slidewidth: 0, // Width of a single slide
    isanimating: false, // Flag: true if an animation is currently running
    isswiping: false, // Flag: true if a swipe gesture is in progress
    lasteventtype: false, // Stores the type of the last user interaction (e.g., 'click', 'swipe')
    nextbtnclickable: false, // Flag: true if the 'next' button is currently clickable
    prevbtnclickable: false, // Flag: true if the 'previous' button is currently clickable
    bulletscount: 0, // Total number of bullets
    bulletscountcache: 0, // Cached bullet count for optimization
    bulletcurrent: 0, // Index of the currently active bullet
    bulletschanged: false, // Flag: true if bullet state has changed
    slidingleft: false, // Flag: true if sliding left
    slidingright: false, // Flag: true if sliding right
    resizing: false, // Flag: true if the window is currently being resized
    cssanimation: false, // Flag: true if CSS animations are supported and enabled
    isevent: false, // Flag: true if an event is currently being processed
    touch: false, // Flag: true if touch events are supported or swipemouse is enabled
    clicktype: 'click', // Event type to use for clicks ('click' or 'touchend')
    isios: false, // Flag: true if running on an iOS device
    isresizing: false, // Flag: true if a resize operation is in progress
    slidesinviewportindexbegin: false, // Index of the first visible slide in the viewport
    slidesinviewportindexend: false, // Index of the last visible slide in the viewport
    slidesinviewportindexes: false, // Array of indexes of all slides currently visible
    autoplayinterval: false, // Stores the autoplay interval ID
    autoplayison: false, // Flag: true if autoplay is currently active
    videoidindex: 0, // Counter for unique video player IDs
    videoplayerindex: 0, // Counter for video player instances
    lastplayedvideo: false, // Reference to the last video played
    videoisplaying: false, // Flag: true if a video is currently playing
    loop: false, // Resolved loop setting ('infinite', 'rollback', 'none')
    dependencies_loaded: 0, // Counter for loaded dependencies
    dependencies_count: 0, // Total number of dependencies to load
    browser_features: [], // Array of detected browser features (e.g., 'touch', 'csstransitions')
    loadingtimeout: false, // Stores the timeout ID for loading messages
    isloading: false, // Flag: true if content is currently loading
  };

  // References to DOM objects used by the slider
  t.obj = {
    sliderid: undefined, // jQuery object for the main slider ID
    sliderwrap: undefined, // jQuery object for the slider wrapper
    sliderviewport: undefined, // jQuery object for the slider viewport
    slider: undefined, // jQuery object for the actual slider content container
    slide: undefined, // jQuery object for all individual slides
    bulletswrap: undefined, // jQuery object for the bullets wrapper
    bullets: undefined, // jQuery object for individual bullets
    prevbtn: undefined, // jQuery object for the 'previous' button
    nextbtn: undefined, // jQuery object for the 'next' button
    videoplayers: { }, // Object to store video player instances
    slides_videoplayers: { }, // Object mapping slides to their video players
    thumbswrap: undefined, // jQuery object for the thumbnail wrapper
    thumbsviewport: undefined, // jQuery object for the thumbnail viewport
    thumbsitems: undefined, // jQuery object for the thumbnail items container
    thumbsitem: undefined, // jQuery object for individual thumbnail items
    slidesinviewport: undefined, // jQuery object for slides currently in the viewport
  };

  // --- Initialization { ---

  /**
   * Initializes the YerSlider instance.
   * @param {Object} p - Custom parameters to override defaults.
   */
  t.init = function ( p ) {

    t.init_getdefaultparam( p ); // Load default parameters and merge with custom ones

    t.init_get_browser_features(); // Detect browser features like touch support

    t.init_touch(); // Configure touch/swipe settings based on features

    t.init_param_changin(); // Apply dynamic parameter changes

    // Check if the main slider element exists in the DOM
    if ( jQuery( t.param.sliderid ).length > 0 ) {

      t.init_dependencies(); // Start loading any required external scripts

      // WHEN DEPENDENCIES LOADED, CALL WORKFLOW {

        // Use a helper to wait for all dependencies to be loaded
        t.helper.when( t.stat, {
          key: 'dependencies_loaded', // Key in t.stat to monitor
          val: t.stat.dependencies_count, // Target value for the key
          callback_if: t.init_workflow, // Function to call when target value is reached
        } );

      // } END WHEN DEPENDENCIES LOADED
    }
  };


  /**
   * Detects and stores browser features (e.g., 'touch', 'csstransitions')
   * by reading classes on the <html> element.
   */
  t.init_get_browser_features = function ( ) {

    t.stat.browser_features = jQuery( 'html' ).attr('class').split(/\s+/);
  };


  /**
   * Loads external dependencies required by the slider, such as
   * imagesLoaded.js, jquery.touchSwipe.js, and YouTube Iframe API.
   */
  t.init_dependencies = function ( ) {

    // LOAD DEPENDECIES IF NOT EXISTS {

      if ( t.param.dependencies_autoload ) {

        // YouTube iframe API {

          // Check if YT object is defined and if API loading is enabled and not already loaded
          if ( typeof YT == 'undefined' && t.param.autoloadyoutubeiframeapi && !yerslider.youtubeloaded ) {

            jQuery.getScript( 'https://www.youtube.com/iframe_api', function() {

              t.stat.dependencies_loaded++; // Increment loaded count
              yerslider.youtubeloaded = true; // Mark YouTube API as loaded globally
            } );
          }
          else {

            t.stat.dependencies_loaded++; // No need to load, or already loaded
          }

        // } End YouTube API

        // imagesLoaded library {

          // Check if jQuery.fn.imagesLoaded is available
          if ( typeof jQuery.fn.imagesLoaded == 'undefined' ) {

            // Load imagesLoaded script if not present
            t.init_dependencies_path( {

              file: t.param.yersliderfolderabsolutepath + 'dependencies/imagesloaded.js',
            } );
          }
          else {

            t.stat.dependencies_loaded++; // imagesLoaded is already available
          }

        // } End imagesLoaded

        // TouchSwipe library {

          // Check if jQuery.fn.swipe is available and if swipe functionality is needed
          if ( typeof jQuery.fn.swipe == 'undefined'
          && ( jQuery.inArray( 'touch', t.stat.browser_features ) !== -1 || t.param.swipemouse === true )
          && t.param.swipe === true ) {

            // Load TouchSwipe script if not present and swipe is enabled
            t.init_dependencies_path( {

              file: t.param.yersliderfolderabsolutepath + 'dependencies/jquery.touchSwipe.js',
            } );
          }
          else {

            t.stat.dependencies_loaded++; // TouchSwipe not needed or already loaded
          }

        // } End TouchSwipe

        t.stat.dependencies_count = 3; // Total expected dependencies count
      }

    // } END LOAD DEPENDECIES
  };


  /**
   * Helper function to load a JavaScript dependency via AJAX.
   * @param {Object} p - Object containing 'file' property with the script path.
   */
  t.init_dependencies_path = function ( p ) {

    jQuery.ajax( {
      url: p.file, // URL of the script to load
      dataType: 'script', // Expect a script file
      cache: true, // Allow caching of the script
      async: true, // Load asynchronously
      success: function ( ) {

        t.stat.dependencies_loaded++; // Increment loaded count on success
      }
    });
  };


  /**
   * The main workflow for initializing the slider after dependencies are loaded.
   * Sets up animations, DOM objects, CSS, and event handlers.
   */
  t.init_workflow = function ( ) {

    t.init_animation(); // Determine if CSS animations can be used

    t.init_isios(); // Check if the device is iOS

    t.init_ojects(); // Cache jQuery objects for slider elements

    t.init_css(); // Apply initial CSS styles

    // Temporarily hide the slider wrapper to prevent FOUC (Flash Of Unstyled Content)
    t.obj.sliderwrap.css( {
      'opacity': '0',
    } );

    t.set_slidermaskwidth(); // Calculate and set the width of the slider mask
    t.set_slidecount(); // Determine the total number of slides
    t.set_slidegroup(); // Set the current slide group based on responsive settings
    t.set_slidegroupmax(); // Determine the maximum slide group size
    t.set_slidesinviewport(); // Identify which slides are currently visible
    t.set_currentslidesindexs(); // Set the initial current slide index
    t.set_slidewidth(); // Calculate and set the width of individual slides
    t.set_slideheight(); // Calculate and set the height of slides

    t.clon_slides(); // Clone slides for infinite looping if enabled

    t.set_prevnext(); // Configure and display previous/next navigation buttons

    t.keynav(); // Initialize keyboard navigation

    t.thumbs(); // Initialize thumbnail navigation

    t.bullets(); // Initialize bullet navigation

    t.init_detach(); // Set up detach functionality

    t.init_touchswipe(); // Initialize touch swipe gestures

    t.init_iosresizeclickbug(); // Apply workaround for iOS resize/click bug

    t.init_showslides(); // Display the slides

    t.init_video(); // Initialize video players within slides

    t.slides_equal_height(); // Ensure all slides have equal height

    t.init_showslider(); // Make the slider visible with a fade-in effect

    // } End of workflow
  };


  /**
   * Calls the 'sliderready' callback function if it's defined,
   * after all images within the slider have loaded.
   */
  t.init_slider_ready = function ( ) {

    if ( typeof t.param.sliderready === 'function' ) {

      // Wait for all slider images to load before calling the callback
      t.obj.slider.imagesLoaded()
        .always( function( instance ) {

          var p = {
            obj: t.obj, // Pass the slider's DOM objects
            param: t.param, // Pass the slider's parameters
          };

          t.param.sliderready( p ); // Execute the user-defined callback
        });
    }

  };


  /**
   * Merges default parameters with user-provided parameters
   * and applies global YerSlider settings if available.
   * Also validates and adjusts autoplay interval.
   * @param {Object} p - User-provided parameters.
   */
  t.init_getdefaultparam = function ( p ) {

    /* get default parameters */

    // Use helper to merge custom parameters with default parameters
    t.param = t.helper.setDefaultParam( {
      p: p, // User-provided parameters
      d: t.param // Default parameters
    } );

    // get global parameters {

      // If YerSliderGlobals object exists, extend parameters with global settings
      if ( typeof YerSliderGlobals !== 'undefined' ) {

        jQuery.extend( true, t.param, YerSliderGlobals.param );
      }

    // }

    // VALIDATE AUTOPLAYINTERVAL {

      // If autoplaybreak is set, calculate autoplayinterval based on it
      if ( t.param.autoplaybreak ) {

        t.param.autoplayinterval = t.param.animationspeed + t.param.autoplaybreak;
      }

      // Ensure autoplayinterval is not shorter than animation speed
      if ( t.param.autoplayinterval <= t.param.animationspeed ) {

        t.param.autoplayinterval = t.param.animationspeed + t.param.autoplaybreakmin;
      }

    // }
  };


  /**
   * Determines if CSS animations (transitions, transforms, animations)
   * are supported by the browser and sets the `cssanimation` flag accordingly.
   */
  t.init_animation = function ( ) {

    /* css animation check */

    var obj_html = jQuery('html'); // Reference to the HTML element

    // Check for CSS transitions, 3D transforms, and animations support
    // and if slide grouping is enabled (slidegroup > 0)
    if ( obj_html.hasClass( 'csstransitions' ) && obj_html.hasClass( 'csstransforms3d' ) && obj_html.hasClass( 'cssanimations' ) && t.param.slidegroup > 0 ) {

      t.stat.cssanimation = true; // Enable CSS animations
    }

  };


  /**
   * Detects touch capabilities or if swipemouse is enabled,
   * then adjusts `t.stat.touch` and `t.stat.clicktype`.
   * Also disables prev/next buttons if swipe is enabled and explicitly set.
   */
  t.init_touch = function ( ) {

    /* touch detection */

    // If HTML has 'touch' class or swipemouse is enabled, set touch flag
    if ( jQuery('html').hasClass('touch') || t.param.swipemouse === true ) {

      t.stat.touch = true; // Mark as touch-enabled
      t.stat.clicktype = 'touchend'; // Use 'touchend' for click events
    }

    // If touch is enabled and swipe is active, and prev/next buttons are not explicitly allowed with swipe
    if ( t.stat.touch && t.param.swipe && ! t.param.swipeandprevnextbtn ) {

      t.param.nextbtn = false; // Disable 'next' button
      t.param.prevbtn = false; // Disable 'previous' button
    }
  };


  /**
   * Applies dynamic changes to parameters based on initial settings
   * and detected features (e.g., sets loop type based on swipe).
   */
  t.init_param_changin = function ( ) {

    // set t.stat.loop {

      t.stat.loop = t.param.loop; // Default loop setting

      // If touch and swipe are enabled, use loopswipe parameter
      if ( t.stat.touch && t.param.swipe ) {

        t.stat.loop = t.param.loopswipe;
      }

    // }

    // autoload {

      // If dependencies_autoload is an object, use it directly
      if ( typeof t.param.dependencies_autoload === 'object' ) {

        t.stat.dependencies_autoload = t.param.dependencies_autoload;
      }

    // }
  };


  /**
   * Checks if the user agent indicates an iOS device
   * and sets the `t.stat.isios` flag.
   */
  t.init_isios = function ( ) {

    /* is iOS check */

    // Check user agent string for common iOS device identifiers
    if ( navigator.userAgent.match(/(iPod|iPhone|iPad)/) ) {

      t.stat.isios = true; // Mark as iOS device
    }
  };


  /**
   * Initializes and caches jQuery objects for all relevant DOM elements
   * of the slider, making them easily accessible via `t.obj`.
   */
  t.init_ojects = function ( ) {

    /* define slider objects */

    t.obj.sliderid = jQuery( t.param.sliderid ); // Main slider element by ID
    t.obj.sliderwrap = jQuery( t.param.sliderid ); // Slider wrapper (often same as sliderid)
    t.obj.sliderviewport = jQuery( t.param.sliderid + ' ' + t.param.sliderviewportclass ); // Viewport element
    t.obj.slidermask = jQuery( t.param.sliderid + ' ' + t.param.slidermaskclass ); // Mask element
    t.obj.slider = jQuery( t.param.sliderid + ' ' + t.param.sliderclass ); // Actual slider content container
    t.obj.slide = jQuery( t.param.sliderid + ' ' + t.param.slideclass ); // All individual slides
  };


  /**
   * Applies initial CSS styles to the slider elements
   * to ensure correct positioning and layout.
   */
  t.init_css = function ( ) {

    /* layout slider with initial CSS */

    // Set slider wrapper to relative position
    t.obj.sliderwrap.css({
      position: 'relative',
      //width: '100%' // This line was commented out in the original, keeping it that way.
    } );