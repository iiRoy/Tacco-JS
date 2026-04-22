/* This immediately invoked function expression (IIFE)
 *  sets up the 'smartresize' functionality for jQuery.
 *  It includes a debouncing utility. */
( function( $, sr ) {

  // The 'debounce' utility function by John Hann.
  // Original source: http://unscriptable.com/index.php/2009/03/20/debouncing-javascript-methods/
  var debounce = function( func, threshold, execAsap ) {
    var timeout; // Stores the timeout ID.

    return function debounced() {
      var obj = this,
          args = arguments; // Capture context and arguments.

      function delayed() {
        if ( !execAsap ) {
          func.apply( obj, args ); // Execute the function if not immediate.
        }
        timeout = null; // Clear the timeout reference.
      }

      if ( timeout ) {
        clearTimeout( timeout ); // Clear existing timeout if any.
      } else if ( execAsap ) {
        func.apply( obj, args ); // Execute immediately if 'execAsap' is true.
      }

      // Set a new timeout. Default threshold is 100ms.
      timeout = setTimeout( delayed, threshold || 100 );
    };
  };

  // Extend jQuery's prototype to include the 'smartresize' method.
  // This method debounces the 'resize' event.
  jQuery.fn[ sr ] = function( fn ) {
    return fn ? this.bind( 'resize', debounce( fn ) ) : this.trigger( sr );
  };

} )( jQuery, 'smartresize' );


/*
 * Another immediately invoked function expression (IIFE)
 * for page-specific functionalities and event handlers.
 */
( function() {

  // Cache jQuery selectors for frequently used elements.
  // These variables are global within this IIFE's scope.
  $wrapper = $( '#wrapper' );
  $drawerRight = $( '#drawer-right' );


  // ---------------------------------------------------
  // Function to dynamically set the height of the home banner.
  // Ensures the banner fills the viewport height.
  // ---------------------------------------------------
  function setHomeBannerHeight() {
    var windowHeight = jQuery( window ).height(); // Get current window height.
    jQuery( '#header' ).height( windowHeight );   // Apply it to the header.
  }


  // ---------------------------------------------------
  // Function to vertically center the text within the home banner.
  // Uses 'actual' plugin for accurate dimension calculation.
  // ---------------------------------------------------
  function centerHomeBannerText() {
    var bannerText = jQuery( '#header > .center' ); // The text element.
    var bannerTextTop = (
      ( jQuery( '#header' ).actual( 'height' ) / 2 ) -
      ( jQuery( '#header > .center' ).actual( 'height' ) / 2 ) - 40
    ); // Calculate top padding for centering.
    bannerText.css( 'padding-top', bannerTextTop + 'px' ); // Apply style.
    bannerText.show(); // Ensure the text is visible.
  }


  // ---------------------------------------------------
  // Function to handle the slide-out navigation (drawer).
  // Toggles the drawer's visibility and wrapper's position.
  // ---------------------------------------------------
  function setSlideNav() {
    jQuery( ".toggleDrawer" ).click( function( e ) {
      // Prevent default link behavior.
      e.preventDefault();

      // Check current state of the wrapper's left margin.
      if ( $wrapper.css( 'marginLeft' ) == '0px' ) {
        // If wrapper is at 0px, drawer is hidden. Show drawer and move wrapper.
        $drawerRight.animate( { marginRight: 0 }, 200 );
        $wrapper.animate( { marginLeft: -300 }, 200 );
      } else {
        // If wrapper is moved, drawer is visible. Hide drawer and reset wrapper.
        $drawerRight.animate( { marginRight: -300 }, 200 );
        $wrapper.animate( { marginLeft: 0 }, 200 );
      }
    } );
  }


  // ---------------------------------------------------
  // Adjusts the header background based on scroll position.
  // Adds 'solid' class if scrolled past 300px or window is narrow.
  // ---------------------------------------------------
  function setHeaderBackground() {
    var scrollTop = jQuery( window ).scrollTop(); // Current scroll position.

    // Apply 'solid' class under certain conditions.
    if ( scrollTop > 300 || jQuery( window ).width() < 700 ) {
      jQuery( '#header .top' ).addClass( 'solid' );
    } else {
      jQuery( '#header .top' ).removeClass( 'solid' ); // Remove if conditions not met.
    }
  }


  // ---------------------------------------------------
  // Initialization block.
  // These functions run once when the script loads.
  // ---------------------------------------------------
  jQuery.noConflict(); // Release $ for other libraries.
  setHomeBannerHeight();
  centerHomeBannerText();
  setSlideNav();
  setHeaderBackground();


  // ---------------------------------------------------
  // Event listeners for window resize.
  // Debounced by 'smartresize' to improve performance.
  // ---------------------------------------------------
  jQuery( window ).smartresize( function() {
    setHomeBannerHeight();
    centerHomeBannerText();
    setHeaderBackground();
  } );


  // ---------------------------------------------------
  // Scroll to content button functionality.
  // Smoothly scrolls to the '#portfolio' section.
  // ---------------------------------------------------
  jQuery( '#scrollToContent' ).click( function( e ) {
    e.preventDefault(); // Prevent default anchor behavior.
    jQuery.scrollTo( "#portfolio", 1000, {
      offset: -( jQuery( '#header .top' ).height() ), // Account for fixed header.
      axis: 'y'
    } );
  } );


  // ---------------------------------------------------
  // Navigation link click handlers.
  // Smoothly scrolls to target sections.
  // ---------------------------------------------------
  jQuery( 'nav > ul > li > a' ).click( function( e ) {
    e.preventDefault(); // Stop default link action.
    jQuery.scrollTo( jQuery( this ).attr( 'href' ), 400, {
      offset: -( jQuery( '#header .top' ).height() ), // Adjust for header.
      axis: 'y'
    } );
  } );


  // ---------------------------------------------------
  // Window scroll event listener.
  // Updates header background on scroll.
  // ---------------------------------------------------
  jQuery( window ).scroll( function() {
    setHeaderBackground(); // Call function to update header.
  } );

} )();