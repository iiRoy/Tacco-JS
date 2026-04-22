/*
 * This entire script is wrapped in an Immediately Invoked Function Expression (IIFE)
 * to prevent global variable pollution and create a private scope.
 */
( function () {

  // Core variables related to viewport management
  var targetWidth = 980 ; // The desired width for the full site view
  var deviceWidth = 'device-width' ; // Standard device-width string for viewport
  var viewport = $( 'meta[name="viewport"]' ) ; // jQuery object for the viewport meta tag


  // Initialize localStorage.isResponsive if it's not already defined.
  // This ensures a default state on the first visit or if localStorage is cleared.
  localStorage.isResponsive = ( localStorage.isResponsive == undefined ) ? 'true' : localStorage.isResponsive ;

  // Function to switch the viewport to the "full site" mode.
  var showFullSite = function () {

    // Store the current viewport content before changing it,
    // so we can revert back to it later for mobile optimization.
    localStorage.responsiveViewportValue = viewport.attr( 'content' ) ;
    // Set the viewport content to the target width, effectively showing the full site.
    viewport.attr( 'content' , 'width=' + targetWidth ) ;

    // Check if the "View Mobile Optimized" option is not present in the display options.
    if ( ! $( '.rwd-display-options #view-responsive' ).length ) {
      // If it's not there, append it to allow users to switch back.
      $( '.rwd-display-options' ).append( '<span id="view-responsive">View Mobile Optimized</span>' ) ;
    }

    // Update the localStorage flag to indicate that the full site is currently displayed.
    localStorage.isResponsive = 'false' ;
  } ; // End of showFullSite function

  // Function to revert the viewport back to the "mobile optimized" mode.
  var showMobileOptimized = function () {

    // Set the localStorage flag to true, indicating mobile optimization.
    localStorage.isResponsive = 'true' ;
    // Restore the viewport content from the previously saved value.
    viewport.attr( 'content' , localStorage.responsiveViewportValue ) ;
  } ; // End of showMobileOptimized function


  // Check if the browser supports localStorage using Modernizr.
  // If a user previously opted for the full site, apply that setting on page load.
  if ( Modernizr.localstorage ) {
    if ( localStorage.isResponsive == 'false' ) {
      // If the user's preference is 'false' (i.e., full site), then activate it.
      showFullSite() ;
    }
  }

  // Event handler for the "View Full Site" button.
  $( "#view-full" ).on( "click" , function () {
    // When clicked, invoke the function to display the full site.
    showFullSite() ;
  } ) ;

  // Event handler for the dynamically added "View Mobile Optimized" span.
  // Using delegated event handling on '.rwd-display-options' for elements that might be added later.
  $( '.rwd-display-options' ).on( "click" , "#view-responsive" , function () {
    // When clicked, switch back to the mobile optimized view.
    showMobileOptimized() ;
  } ) ;

} )( jQuery ) ; // Pass jQuery into the IIFE as an argument.