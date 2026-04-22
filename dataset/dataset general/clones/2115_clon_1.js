// This is a Type I clone of the PaW Carousel script.
// Whitespace and comments have been extensively altered.
/*
 *  PaW Carousel Plugin - Version: 2.1.2
 *  Project Homepage: http://picturesandwriting.com
 *  Copyright (c) 2014 Shaun Morrison; Licensed under the GPL license.
 *  Dependencies: Requires jQuery v1.7 or a newer version.
 *  Primary Author: Shaun Morrison
 */
( function( $ ) {

  // Define the jQuery plugin 'pawCarousel'
  $.fn.pawCarousel = function ( options ) {

    // Default configuration settings for the carousel.
    // These can be overridden by passing an 'options' object.
    var defaults = {
        carouselItemCls        : 'paw-carousel-item',         // Class for individual carousel items.
        carouselItemMediaCls   : 'paw-carousel-item-media',   // Class for media elements within carousel items.
        carouselItemsWrapCls   : 'paw-carousel-items-wrap',   // Class for the wrapper containing all carousel items.
        carouselNavItemCls     : 'paw-carousel-nav-item',     // Class for navigation items (e.g., thumbnails).
        nextLinkCls            : 'paw-carousel-next',         // Class for the 'next' navigation link.
        prevLinkCls            : 'paw-carousel-prev',         // Class for the 'previous' navigation link.
        activeCls              : 'active',                    // Class added to the currently active item.
        croppedCls             : 'cropped',                   // Class indicating an item has been cropped.
        scaledCls              : 'scaled',                    // Class indicating an item has been scaled.
        carouselItemSpace      : 'css',                       // Defines spacing between items ('css' for CSS-defined, or pixel value).
        animSpeed              : 800,                         // Animation speed in milliseconds.
        alignment              : 'center',                    // Alignment of active item ('center', 'left', 'right').
        setsEachSide           : 1,                           // Number of cloned sets on each side for infinite loop.
        carouselHtType         : 'shortest',                  // Carousel height type ('shortest', 'longest', or fixed pixel value).
        carouselResizeType     : 'cropped'                    // How items are resized ('cropped' or 'scaled').
      }
      , settings = $.extend( {}, defaults, options ); // Merge default settings with user-provided options.


    // Iterate over each selected carousel element.
    this.each( function( ) {

      var $carousel = $( this ); // Cache the current carousel instance.


      // Define CSS classes used throughout the plugin.
      var carouselItemCls         = settings.carouselItemCls;
      var carouselItemOrigCls     = settings.carouselItemCls + '-orig'; // Original item class.
      var carouselItemMediaCls    = settings.carouselItemMediaCls;
      var carouselItemsWrapCls    = settings.carouselItemsWrapCls;
      var carouselNavItemCls      = settings.carouselNavItemCls;
      var activeCls               = settings.activeCls;
      var croppedCls              = settings.croppedCls;
      var scaledCls               = settings.scaledCls;
      var origItemCls             = 'paw-carousel-item-orig'; // Class for original carousel items.
      var videoFoundationElCls    = 'paw-carousel-item-vid-foundation'; // Class for video foundation element.
      var videoCls                = 'paw-carousel-item-vid';  // Class for video elements.
      var itemVisibleCls          = 'paw-carousel-item-visible'; // Class for visible items.
      var cropCompCls             = 'paw-carousel-crop-comp'; // Class for crop compensation.
      var carouselItemNumPrefix   = carouselItemCls + '-';    // Prefix for item numbering.


      // Define custom data attributes.
      var origRatioAttr = 'data-paw-orig-ratio'; // Attribute to store original aspect ratio.


      // Define jQuery selectors for various carousel components.
      var $carouselItem          = $carousel.find( '.' + carouselItemCls );
      var $carouselOrigItem;                                  // Will be set later to original items.
      var $carouselNavItem       = $carousel.next().find( '.' + carouselNavItemCls ); // Nav items.
      var $carouselNavItemActive;                             // Active nav item.
      var $carouselItemsWrap     = $carousel.children( '.' + carouselItemsWrapCls ); // The main wrapper.
      var $activeItem;                                        // Currently active carousel item.
      var $nextLink              = $carousel.find( '.' + settings.nextLinkCls ); // Next button.
      var $prevLink              = $carousel.find( '.' + settings.prevLinkCls ); // Previous button.


      // Boolean flags to manage state.
      var isRetina         = false; // Is the display retina?
      var inAnimation      = false; // Is an animation currently in progress?
      var hasBeenCropped   = false; // Has any item been cropped?
      var hasBeenScaled    = false; // Has any item been scaled?
      var thumbNav         = false; // Is thumbnail navigation enabled/present?


      // Integer variables for dimensions and counts.
      var windowWid;              // Current window width.
      var windowHt;               // Current window height.
      var carouselContainerWid    = 0; // Width of the carousel container.
      var setWid                  = 0; // Width of a single set of carousel items.
      var itemWid                 = 0; // Width of an individual item.
      var itemHt                  = 0; // Height of an individual item.
      var carouselContainerHt     = 0; // Height of the carousel container.
      var carouselItemsWrapWid    = 0; // Width of the entire items wrapper.
      var setCount                = 1; // Counter for sets.
      var totalItemsInSet         = -1; // Total number of original items.
      var sansAlignAnimVal        = 0; // Animation value before alignment compensation.
      var finalAnimVal            = 0; // Final animation value.
      var activeItemNum           = 0; // Index of the active item.
      var alignmentVal            = 0; // Value for alignment adjustment.
      var firstItemAlignmentVal   = 0; // Alignment for the first item.
      var lastItemAlignmentVal    = 0; // Alignment for the last item.
      var imagesLoaded            = 0; // Count of images loaded.
      var setsEachSide            = settings.setsEachSide; // Number of cloned sets.
      var carouselHt              = 0; // Calculated carousel height.
      var carouselItemSpace       = settings.carouselItemSpace; // Spacing between items.
      var animSpeed               = settings.animSpeed; // Animation speed.


      // Miscellaneous variables.
      var origItemsStore;         // Stores the HTML of original carousel items.
      var carouselHtType          = settings.carouselHtType; // Type of carousel height.
      var carouselResizeType      = settings.carouselResizeType; // Type of item resizing.


      // Another custom data attribute.
      var itemNumAttr = 'data-paw-item-num'; // Attribute to store item number.


      // Array to store details of each item.
      var itemDetailsArr = [];


      /*======================================
      =            Init functions            =
      ======================================*/

      // Initialize various aspects of the carousel.
      screenDimensions();           // Get initial screen dimensions.
      isRetinaDisplay();            // Check if the display is retina.
      carouselItemSpaceConvert();   // Convert carousel item spacing.
      thumbNavTest();               // Determine if thumbnail navigation is active.
      carouselHtValReset();         // Reset carousel height value based on type.
      addClsVideo();                // Add media class to video elements.
      addOrigClsStyle();            // Add original class and set initial styles.
      carouselOrigItemsStart();     // Process original carousel items.
      carouselContainerDim();       // Calculate carousel container dimensions.
      videoInit();                  // Initialize video elements.
      setCalcItems();               // Calculate and set item dimensions.
      videoScaleResize();           // Scale and resize videos.
      storeOrigItems();             // Store the HTML of original items.

      // Add cloned sets for infinite looping.
      for ( var i = 0; i < setsEachSide; i++ ) {
        addSet( 'before' );
        addSet( 'after' );
      }

      setCarouselItem();            // Re-select carousel items after cloning.
      setCarouselHt();              // Set the final carousel height.
      goToStart();                  // Navigate to the initial starting item.
      thumbnailNav();               // Initialize thumbnail navigation.
      controlNav();                 // Initialize control navigation (next/prev).
      revealCarousel();             // Make the carousel visible.


      /*==================================================
      =            On screen resize functions            =
      ==================================================*/

      // Listener for window resize events.
      var resizeListener = function () {
        // Use `one` to unbind itself after firing, then rebind.
        $( window ).one( "resize", function () {
          // Special handling for IE8 and iOS window height calculations.
          var windowHtNew = window.innerHeight ? window.innerHeight : $( window ).height();
          var windowWidNew = $( window ).width();

          // Only proceed if window dimensions have actually changed.
          if ( windowWidNew != windowWid || windowHtNew != windowHt ) {
            screenDimensions();           // Update screen dimensions.
            carouselContainerDim();       // Recalculate container dimensions.
            setCalcItems();               // Recalculate item dimensions.
            videoScaleResize();           // Rescale videos.
            setCarouselHt();              // Recalculate carousel height.
            carouselItemsWrapDimensions(); // Update wrapper dimensions.
            calcAnimVal( activeItemNum ); // Recalculate animation values.
            goToActive( 0 );              // Jump to active item instantly.
          }
          // Rebind the listener after a short delay.
          setTimeout( resizeListener, 100 );
        } );
      };

      // Start the resize listener.
      resizeListener();


      /*===============================================
      =            Check Screen Dimensions            =
      ===============================================*/

      // Function to capture the current window height and width.
      function screenDimensions( ) {
        // Use innerHeight if available, otherwise fall back to jQuery's height.
        windowHt = window.innerHeight;
        if ( windowHt === undefined ) {
          windowHt = $( window ).height();
        }
        windowWid = $( window ).width(); // Get current window width.
      }


      /*=============================================
      =            Thumb navigation test            =
      =============================================*/

      // Checks if thumbnail navigation elements are present.
      function thumbNavTest( ) {
        if ( $carousel.find( '.' + carouselNavItemCls ).length ) {
          thumbNav = true; // Set flag if found.
        }
      }


      /*=========================================
      =            Set carousel item            =
      =========================================*/

      // Re-sets the $carouselItem selector, useful after cloning items.
      function setCarouselItem( ) {
        $carouselItem = $carousel.find( '.' + carouselItemCls );
      }


      /*================================================
      =            Add media class to video            =
      ================================================*/

      // Adds the media class to all iframe elements within carousel items.
      function addClsVideo( ) {
        $carouselItem.find( 'iframe' ).addClass( carouselItemMediaCls );
      }


      /*===================================
      =            Videos init            =
      ===================================*/

      // Initializes video elements by scaling them.
      function videoInit( ) {
        $carouselItem.find( 'iframe' ).each( function( ) {
          var $vid = $( this );
          videoScale( $vid, true ); // Scale each video, passing 'true' for initial setup.
        } );
      }


      /*==========================================
      =            Video scale resize            =
      ==========================================*/

      // Rescales videos when the carousel or window is resized.
      function videoScaleResize( ) {
        $carouselOrigItem.each( function( idx ) {
          var $item = $( this );
          var $vid = $item.find( 'iframe' );
          if ( $vid.length ) {
            // Find the corresponding item (could be a clone) and scale its video.
            var $adjustItem = $carousel.find( '.' + carouselItemNumPrefix + idx );
            $vid = $adjustItem.find( 'iframe' );
            videoScale( $vid ); // Scale the video without initial setup flag.
          }
        } );
      }


      /*===================================
      =            Video scale            =
      ===================================*/

      // Scales a given video iframe based on carousel height and its original ratio.
      function videoScale( $vid, init ) {
        var vidRatio = $vid.attr( origRatioAttr ); // Retrieve the stored original ratio.
        var vidWid = carouselHt * vidRatio;      // Calculate new width based on carousel height.
        $vid.attr( 'height', carouselHt );       // Set the video height.
        $vid.attr( 'width', vidWid );            // Set the video width.
        if ( init ) {
          videoFoundation( $vid, vidWid );       // If it's an initial setup, create foundation.
        }
      }


      /*==================================
      =            Stop video            =
      ==================================*/

      // Stops a playing video by resetting its source, preventing playback on inactive items.
      function stopVideo( $item, itemNum ) {
        // Prevent resetting on mobile devices if the video is currently active,
        // as playing a video might trigger a screen resize event.
        if ( itemNum != activeItemNum ) {
          var $vid = $item.find( 'iframe' );
          if ( $vid.length ) {
            var $vidSrc = $vid.attr( 'src' ); // Store current source.
            $vid.attr( 'src', '' );           // Clear source to stop video.
            $vid.attr( 'src', $vidSrc );      // Restore source, but video remains stopped.
          }
        }
      }


      /*========================================
      =            Video foundation            =
      ========================================*/

      // Creates an invisible foundation element for videos to help with dimension scaling.
      function videoFoundation( $vid, vidWid ) {
        // An invisible element is used to hold the video's dimensions,
        // as direct iframe width scaling might not behave as expected.
        var videoFoundationEl = '<div style="width:' + vidWid + 'px; height:' + carouselHt + 'px" class="' + videoFoundationElCls + '"></div>';
        $vid
          .before( videoFoundationEl ) // Insert the foundation element before the video.
          .addClass( videoCls );       // Add the video class to the iframe.
      }


      /*========================================
      =            Carousel Ht init            =
      ========================================*/

      // Resets the carousel height value based on the configured carouselHtType.
      function carouselHtValReset( ) {
        if ( carouselHtType === 'shortest' ) {
          carouselHt = 9999; // Initialize to a large value to find the shortest.
        } else if ( carouselHtType === 'longest' ) {
          carouselHt = 0;    // Initialize to zero to find the longest.
        } else {
          carouselHt = carouselHtType; // Use the fixed pixel value.
        }
      }


      /*======================================
      =            Add orig class            =
      ======================================*/

      // Adds the original item class and sets initial styles for carousel items.
      function addOrigClsStyle( ) {
        $carouselItem.addClass( origItemCls ); // Add class to all items initially.
        $carouselOrigItem = $carousel.find( '.' + origItemCls ); // Select original items.
        // Apply margin-right if carouselItemSpace is not 'css'.
        if ( settings.carouselItemSpace !== 'css' ) {
          $carouselOrigItem.css( {
            'margin-right' : carouselItemSpace
          } );
        }
      }


      /*=====================================
      =            Assign active            =
      =====================================*/

      // Assigns the 'active' class to a given item and updates the active item number.
      function assignActiveItem( $item ) {
        $activeItem = $item; // Set the current active item.
        $activeItem.siblings().removeClass( activeCls ); // Remove active class from siblings.
        $activeItem.addClass( activeCls );               // Add active class to the current item.
        activeItemNum = parseInt( $activeItem.attr( itemNumAttr ) ); // Update active item number.
      }


      /*===================================
      =            Go to start            =
      ===================================*/

      // Navigates the carousel to the very first item.
      function goToStart( ) {
        // Assign the first carousel item as active.
        assignActiveItem( $carousel.find( '.' + carouselItemCls ).first() );
        calcAnimVal( 0 ); // Calculate animation values for the first item.
        goToActive( 0 );  // Jump to it instantly (animation speed 0).
      }


      /*====================================
      =            animCarousel            =
      ====================================*/

      // Initiates the carousel animation to a specified item.
      function animCarousel( goToItemNum, dir ) {
        calcAnimVal( goToItemNum, dir ); // Calculate the target animation value.
        goToActive();                    // Perform the animation.
      }


      /*==================================================
      =            Calculate animation values            =
      ==================================================*/

      // Determines the final animation position for the carousel wrapper.
      function calcAnimVal( goToNum, dir ) {
        // 'goToNum' is the target item index, 'dir' is the direction ('forwards'/'backwards').
        // This function handles wrapping around for infinite carousel effect.
        var $prevActiveItem = $activeItem; // Store previous active item for video stopping.
        var prevActiveItemNum = activeItemNum; // Store previous active item number.
        var itemPosFromStart = 0;              // Position of the item from the start of the original set.
        var sansAlignAnimVal = 0;              // Animation value before alignment correction.

        // Logic for wrapping from end to beginning (forwards).
        if ( dir === 'forwards' && prevActiveItemNum === totalItemsInSet ) {
          assignActiveItem( $carouselOrigItem.first() ); // Go to the first original item.
          calcAlignmentVal( 'last' ); // Calculate alignment based on the last item's position.
          goToLastBeforeOrig();       // Jump to the cloned set before the original.
          sansAlignAnimVal = ( -setWid * setsEachSide );
          finalAnimVal = ( -setWid * setsEachSide ) + alignmentVal;

        // Logic for wrapping from beginning to end (backwards).
        } else if ( dir === 'backwards' && prevActiveItemNum === 0 ) {
          assignActiveItem( $carouselOrigItem.last() ); // Go to the last original item.
          calcAlignmentVal( 'first' ); // Calculate alignment based on the first item's position.
          goToFirstAfterOrig();        // Jump to the cloned set after the original.
          sansAlignAnimVal = -setWid - ( setWid * setsEachSide ) + itemDetailsArr[ totalItemsInSet ].itemWid;
          finalAnimVal = -setWid - ( setWid * setsEachSide ) + itemDetailsArr[ totalItemsInSet ].itemWid + alignmentVal;

        // Standard navigation within the carousel.
        } else {
          if ( goToNum > 0 ) {
            itemPosFromStart = itemDetailsArr[ goToNum - 1 ].itemPosFromStart;
          }
          // Assign the new active item.
          assignActiveItem( $carousel.find( '.' + carouselItemOrigCls + '.' + carouselItemNumPrefix + goToNum ) );
          calcAlignmentVal(); // Calculate alignment for the new active item.
          sansAlignAnimVal = - ( itemPosFromStart + ( setWid * setsEachSide ) );
          finalAnimVal = sansAlignAnimVal + alignmentVal;
        }
        // Stop video of the item that is no longer active.
        stopVideo( $prevActiveItem, prevActiveItemNum );
      }


      /*=======================================
      =            alignment Value            =
      =======================================*/

      // Calculates the horizontal offset needed to align the active item.
      // This compensates for `center` or `right` alignment.
      function calcAlignmentVal( extraVal ) {
        if ( settings.alignment === 'center' ) {
          var carouselContainerCenter = carouselContainerWid / 2;
          alignmentVal = carouselContainerCenter - ( itemDetailsArr[ activeItemNum ].itemWid / 2 );
          if ( extraVal === 'first' ) {
            firstItemAlignmentVal = carouselContainerCenter - ( itemDetailsArr[ 0 ].itemWid / 2 );
          } else if ( extraVal === 'last' ) {
            lastItemAlignmentVal = carouselContainerCenter - ( itemDetailsArr[ totalItemsInSet ].itemWid / 2 );
          }
        } else if ( settings.alignment === 'right' ) {
          alignmentVal = carouselContainerWid - itemDetailsArr[ activeItemNum ].itemWid;
          if ( extraVal === 'first' ) {
            firstItemAlignmentVal = carouselContainerWid - itemDetailsArr[ 0 ].itemWid;
          } else if ( extraVal === 'last' ) {
            lastItemAlignmentVal = carouselContainerWid - itemDetailsArr[ totalItemsInSet ].itemWid;
          }
        }
      }


      /*==========================================================================
      =            Go to Last item in the set before the original set            =
      ==========================================================================*/

      // Instantly repositions the carousel to simulate an infinite loop
      // by jumping to the end of the cloned set *before* the original set.
      function goToLastBeforeOrig( ) {
        var lastBeforeOrigVal = -setWid + itemDetailsArr[ totalItemsInSet ].itemWid + lastItemAlignmentVal;
        $carouselItemsWrap.css( {
          'left' : lastBeforeOrigVal
        } );
      }


      /*==========================================================================
      =            Go to First item in the set after the original set            =
      ==========================================================================*/

      // Instantly repositions the carousel to simulate an infinite loop
      // by jumping to the beginning of the cloned set *after* the original set.
      function goToFirstAfterOrig( ) {
        var firstAfterOrigVal = -setWid - ( setWid * setsEachSide ) + firstItemAlignmentVal;
        $carouselItemsWrap.css( {
          'left' : firstAfterOrigVal
        } );
      }


      /*========================================
      =            Animate carousel            =
      ========================================*/

      // Moves the carousel items wrapper to the calculated final animation value.
      function goToActive( animSpeedCustom ) {
        // Use custom speed if provided, otherwise fall back to default animSpeed.
        animSpeedCustom = ( typeof animSpeedCustom !== 'undefined' ) ? animSpeedCustom : animSpeed;
        inAnimation = true; // Set animation flag.

        if ( animSpeedCustom === 0 ) {
          // If speed is 0, jump instantly without animation.
          $carouselItemsWrap.css( {
            'left' : finalAnimVal
          } );
        } else {
          // Otherwise, animate the 'left' property.
          $carouselItemsWrap.stop( true ).animate( {
            'left' : finalAnimVal
          }, animSpeed );
        }
      }


      /*======================================
      =            Carousel items            =
      ======================================*/

      // Initializes and processes the original carousel items.
      function carouselOrigItemsStart( ) {
        $carouselOrigItem.each( function( ) {
          var $item = $( this );
          var $mediaItem = $item.find( '.' + carouselItemMediaCls ); // Find media within item.
          totalItemsInSet += 1; // Increment total item count.
          numberSlide( $item, totalItemsInSet ); // Assign unique number to slide.
          itemDataRatio( $item, $mediaItem );    // Store item's aspect ratio.
          loadImages( $item );                   // Load images for the item.
          // If height type is shortest or tallest, calculate carousel height.
          if ( carouselHtType === 'shortest' || carouselHtType === 'tallest' ) {
            calcCarouselHt( $item );
          }
        } );
      }


      /*========================================
      =            Store dimensions            =
      ========================================*/

      // Stores the original aspect ratio of an item or its media.
      function itemDataRatio( $containerItem, $item ) {
        var itemRatio;
        if ( $item.attr( 'width' ) !== undefined && $item.attr( 'height' ) !== undefined ) {
          itemRatio = $item.attr( 'width' ) / $item.attr( 'height' );
        } else {
          itemRatio = $containerItem.width() / $containerItem.height();
        }
        itemRatio = itemRatio.toFixed( 3 ); // Format ratio to 3 decimal places.
        $item.attr( origRatioAttr, itemRatio ); // Store ratio in data attribute.
      }


      /*====================================
      =            Number slide            =
      ====================================*/

      // Assigns a unique number to a carousel item.
      function numberSlide( $item, num ) {
        $item.attr( itemNumAttr, num );           // Set data-paw-item-num attribute.
        $item.addClass( carouselItemNumPrefix + num ); // Add class with item number.
      }


      /*===================================
      =            Load images            =
      ===================================*/

      // Loads images, handling retina (2x) versions if available.
      function loadImages( $item ) {
        var $img = $item.find( 'img.' + carouselItemMediaCls ); // Find the image.
        var imgSrc2x = $img.attr( 'data-src-2x' ); // Get retina source.
        var imgSrc;

        if ( isRetina && imgSrc2x !== undefined ) {
          imgSrc = imgSrc2x; // Use 2x image for retina.
        } else {
          imgSrc = $img.attr( 'data-src' ); // Use standard image.
        }

        $img.removeAttr( 'data-src' );     // Remove data-src attribute.
        $img.removeAttr( 'data-src-2x' );  // Remove data-src-2x attribute.
        $img.attr( 'src', imgSrc );        // Set the actual image source.
      }


      /*===================================
      =            Store items            =
      ===================================*/

      // Stores the HTML of the original carousel items for later cloning.
      function storeOrigItems( ) {
        origItemsStore = $carouselItemsWrap.html(); // Get HTML content.
        // Remove the 'paw-carousel-item-orig' class from the stored HTML
        // to prevent it from being present on cloned items.
        origItemsStore = origItemsStore.replace( / paw-carousel-item-orig/g, '' );
      }


      /*=========================================================================
      =            Set max dimensions and calculate items dimensions            =
      =========================================================================*/

      // Empties item details, resets set width, and recalculates dimensions.
      function setCalcItems( ) {
        itemDetailsArr = []; // Clear the array of item details.
        setWid = 0;          // Reset the total width of a set.

        // Reset carousel height if needed, especially after scaling.
        if ( ( carouselHtType === 'shortest' && hasBeenScaled ) || ( carouselHtType === 'tallest' && hasBeenScaled ) ) {
          carouselHtValReset();
        }

        $carouselOrigItem.each( function( idx ) {
          // Further logic for calculating item dimensions will follow here.