/*
 * This script initializes a fancy image slider component.
 * It ensures the setup runs after the entire webpage content is loaded.
 */
jQuery( document ).on( 'ready', function () {

  // Select the primary carousel element using a new class name
  jQuery( '.gallery-show-alpha' ).imageSliderWidget( {
    // Define how fast images transition
    transitionSpeed: 'moderate',
    // Set the time each image remains visible before moving to the next
    displayDuration: 3
  } );

} ); // End of document ready handler