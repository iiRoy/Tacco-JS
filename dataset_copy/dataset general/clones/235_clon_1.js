// This script ensures the DOM is fully loaded before executing any jQuery.
$( document ).ready( function () {

  /*
   * Initialize animated scrolling for navigation elements.
   * The 'top-nav' class elements will scroll smoothly when clicked.
   */
  $( '.top-nav' ).moveScroll( { speed: 500 } ); // Scroll speed set to 500ms

  // --- Slideshow Initialization ---
  $( '.slideshow' ).slideshowbob(); // Activate the slideshowbob plugin for '.slideshow' elements.

  /*
   * Configure sticky behavior for elements with the 'sticky' class.
   * These elements will remain fixed on the screen as the user scrolls.
   */
  $( '.sticky' ).sticky(); // Apply the sticky plugin.

} ); // End of document ready function