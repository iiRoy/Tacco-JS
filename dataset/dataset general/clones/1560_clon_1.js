/*
 * This script manages the dynamic resizing of the site's top bar
 * based on the current viewport dimensions.
 *
 * It uses jQuery, the DOM, the global window object, and a custom
 * 'viewport' utility for responsive breakpoint detection.
 */
( function ( $, document, window, viewport ) {

  /**
   * Adjusts the height of the top bar elements based on the
   * current responsive breakpoint (e.g., 'xs' for extra small).
   * It animates the transition for a smooth user experience.
   */
  function resizeTopBar () {

    // Cache the top bar element for repeated use
    var $topBar = $( '.site-topbar' );

    // Retrieve the compact height setting from data attribute
    var compact = $topBar.attr( 'data-compact-height' );

    // Retrieve the full-size height setting from data attribute
    var fullsize = $topBar.attr( 'data-fullsize-height' );

    // Select elements to be animated (top bar and its h5 child)
    var $toBeAnimated = $( '.site-topbar, .site-topbar h5' );

    // Check if the current viewport is 'extra small'
    if ( viewport.is( 'xs' ) ) {
      // If 'xs', animate to compact height
      $toBeAnimated.animate(
        {
          'height':      compact,     // Set new height
          'line-height': compact      // Adjust line-height to match
        },
        300 // Animation duration in milliseconds
      );
    }
    else {
      // For all other breakpoints, animate to full-size height
      $toBeAnimated.animate(
        {
          'height':      fullsize,    // Set new height
          'line-height': fullsize     // Adjust line-height to match
        },
        300 // Animation duration in milliseconds
      );
    } // End of if/else for viewport check

  } // End of resizeTopBar function definition


  /*
   * This block executes only after the entire DOM is fully loaded and parsed.
   * It ensures that all elements are available before script manipulation.
   */
  $( document ).ready( function () {

    // Initial call to set the top bar size correctly on page load
    resizeTopBar();

    // Log the current breakpoint to the console for debugging purposes
    console.log( 'Current breakpoint:', viewport.current() );

  } ); // End of $(document).ready


  /*
   * This section handles actions triggered by window resizing events.
   * It specifically listens for changes in Bootstrap breakpoints.
   */
  $( window ).bind( 'resize', function () {

    // Only execute the following code when the viewport breakpoint actually changes
    viewport.changed( function () {

      // Re-evaluate and adjust the top bar height
      resizeTopBar();

      // Output the updated breakpoint information to the console
      console.log( 'Current breakpoint:', viewport.current() );

    } ); // End of viewport.changed callback

  } ); // End of $(window).bind('resize')


} )( jQuery, document, window, ResponsiveBootstrapToolkit ); /* End of IIFE */