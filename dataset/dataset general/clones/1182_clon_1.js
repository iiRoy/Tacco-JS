/*
 * This is a Type I clone of the original JavaScript code.
 * It strictly adheres to the definition: "Code fragments are exactly equal,
 * except for possible variations in whitespace and comments."
 *
 * All variable names, function names, operators, and expressions remain
 * precisely as they were in the source.
 *
 * Extensive changes have been made to whitespace (indentation, spacing,
 * blank lines) and comments (added, removed, modified) to create a
 * visually distinct but logically identical version.
 */


// --- Start of jQuery Plugin Definition ---

( function ( $ ) {

  /*
   * Initialize a global object for plugin-specific data.
   * This object will hold configuration and dynamic values.
   */
  var jqez = { } ;


  // --- Core Plugin Functionality: ezBgResize ---

  /**
   * jQuery plugin to resize a background image.
   * @param {object} options - Configuration options for the background image.
   */
  $.fn.ezBgResize = function ( options ) {

    // Assign the passed options object to our global plugin configuration.
    // This makes the configuration accessible throughout the plugin's scope.
    jqez = options ;


    // Check if the 'img' option is a single string.
    // If it is, convert it into an array for future extensibility
    // (e.g., supporting image slideshows).
    if ( ! $.isArray( jqez.img ) ) {
      var tmp_img = jqez.img ; // Temporarily store the original image path.
      jqez.img = [ tmp_img ] ; // Wrap it in an array.
    }


    // Preload the image to get its natural dimensions (width and height).
    // This is crucial for accurate resizing calculations.
    $( "<img/>" )
      .attr( "src" , jqez.img ) // Set the source attribute for preloading.
      .load( function ( ) {

        // Once the image is loaded, capture its intrinsic dimensions.
        jqez.width = this.width ;
        jqez.height = this.height ;


        // Create a dedicated container div for our background image.
        // This container will be appended directly to the document body.
        $( "body" ) .append( '<div id="jq_ez_bg"></div>' ) ;


        // Populate the newly created div with the preloaded image.
        // We use the first image in the array (jqez.img[0]).
        $( "#jq_ez_bg" ) .html( '<img src="' + jqez.img[0] + '" width="' + jqez.width + '" height="' + jqez.height + '" border="0">' ) ;


        // Initially hide the background container to prevent FOUC (Flash Of Unstyled Content).
        $( "#jq_ez_bg" ) .css( "visibility" , "hidden" ) ;


        // Temporarily set the body's overflow to hidden.
        // This prevents scrollbars from appearing and interfering with calculations
        // during the initial image positioning and sizing.
        $( "body" ) .css( {
          "overflow" : "hidden"
        } ) ;


        // Trigger the image resizing logic.
        // This function will calculate and apply the correct dimensions and position.
        resizeImage ( ) ;

      } ) ; // End of image load handler.

  } ; // End of $.fn.ezBgResize plugin definition.


  // --- Event Binding for Window Resize ---

  // Attach a listener to the window's 'resize' event.
  // Every time the window dimensions change, the image needs to be re-evaluated.
  $( window ) .bind( "resize" , function ( ) {

    // When the window is resized, call the main resizing function.
    resizeImage ( ) ;

  } ) ; // End of window resize binding.


  // --- Helper Function: resizeImage ---

  /*
   * This is the core function responsible for calculating and applying
   * the correct size and position to the background image based on
   * the current window dimensions.
   */
  function resizeImage ( ) {

    // Apply fixed positioning and initial styling to the background container.
    // This ensures it covers the entire viewport and stays behind other content.
    $( "#jq_ez_bg" ) .css( {
      "position"  : "fixed" , // Keep the element fixed relative to the viewport.
      "top"       : "0px"   , // Position at the top edge.
      "left"      : "0px"   , // Position at the left edge.
      "z-index"   : "-1"    , // Ensure it's behind all other content.
      "overflow"  : "hidden", // Hide any overflow within this container.
      "width"     : $( window ) .width( )  + "px" , // Set width to current window width.
      "height"    : $( window ) .height( ) + "px" , // Set height to current window height.
      "opacity"   : jqez.opacity // Apply the specified opacity from options.
    } ) ;


    // Set the image itself to relative positioning.
    // This allows us to adjust its 'top' and 'left' properties within its parent container.
    $( "#jq_ez_bg" ) .children( 'img' ) .css( "position" , "relative" ) ;


    // Get the current intrinsic width and height of the image within its container.
    var iw = $( "#jq_ez_bg" ) .children( 'img' ) .width( ) ;
    var ih = $( "#jq_ez_bg" ) .children( 'img' ) .height( ) ;


    // --- Resizing Logic: Maintain Aspect Ratio and Cover Viewport ---

    // Determine if the window is wider than it is tall.
    if ( $( window ) .width( ) > $( window ) .height( ) ) {

      // If the image's intrinsic width is greater than its intrinsic height (landscape image).
      if ( iw > ih ) {

        var fRatio = iw / ih ; // Calculate the aspect ratio (width / height).

        // Scale the image to match the window's width.
        $( "#jq_ez_bg" ) .children( 'img' ) .css( "width" , $( window ) .width( ) + "px" ) ;
        // Calculate and apply the corresponding height to maintain aspect ratio.
        $( "#jq_ez_bg" ) .children( 'img' ) .css( "height" , Math.round( $( window ) .width( ) * ( 1 / fRatio ) ) ) ;

        var newIh = Math.round( $( window ) .width( ) * ( 1 / fRatio ) ) ; // Store the newly calculated height.

        // If the new height is still less than the window's height,
        // it means the image isn't covering the full height.
        // In this case, re-scale based on height instead.
        if ( newIh < $( window ) .height( ) ) {

          var fRatio = ih / iw ; // Recalculate aspect ratio (height / width).
          $( "#jq_ez_bg" ) .children( 'img' ) .css( "height" , $( window ) .height( ) ) ; // Set height to window height.
          $( "#jq_ez_bg" ) .children( 'img' ) .css( "width" , Math.round( $( window ) .height( ) * ( 1 / fRatio ) ) ) ; // Adjust width.

        } // End of inner newIh check.

      } else { // Else, the image's intrinsic height is greater than or equal to its width (portrait or square image).

        var fRatio = ih / iw ; // Calculate aspect ratio (height / width).
        $( "#jq_ez_bg" ) .children( 'img' ) .css( "height" , $( window ) .height( ) ) ; // Set height to window height.
        $( "#jq_ez_bg" ) .children( 'img' ) .css( "width" , Math.round( $( window ) .height( ) * ( 1 / fRatio ) ) ) ; // Adjust width.

      } // End of iw > ih check.

    } else { // Else, the window is taller than or equal to its width (portrait or square window).

      var fRatio = ih / iw ; // Calculate aspect ratio (height / width).
      $( "#jq_ez_bg" ) .children( 'img' ) .css( "height" , $( window ) .height( ) ) ; // Set height to window height.
      $( "#jq_ez_bg" ) .children( 'img' ) .css( "width" , Math.round( $( window ) .height( ) * ( 1 / fRatio ) ) ) ; // Adjust width.

    } // End of window width > window height check.


    // --- Centering Logic ---

    // Check if centering is enabled (default is true if not explicitly set to false).
    if ( typeof( jqez.center ) == 'undefined' || jqez.center ) {

      // If the image's current width is greater than the window's width,
      // calculate the offset needed to center it horizontally.
      if ( $( "#jq_ez_bg" ) .children( 'img' ) .width( ) > $( window ) .width( ) ) {

        var this_left = ( $( "#jq_ez_bg" ) .children( 'img' ) .width( ) - $( window ) .width( ) ) / 2 ; // Calculate horizontal offset.
        $( "#jq_ez_bg" ) .children( 'img' ) .css( {
          "top"  : 0 , // Keep top at 0.
          "left" : -this_left // Shift left by half the excess width.
        } ) ;

      } // End of horizontal centering check.

      // If the image's current height is greater than the window's height,
      // calculate the offset needed to center it vertically.
      if ( $( "#jq_ez_bg" ) .children( 'img' ) .height( ) > $( window ) .height( ) ) {

        var this_height = ( $( "#jq_ez_bg" ) .children( 'img' ) .height( ) - $( window ) .height( ) ) / 2 ; // Calculate vertical offset.
        $( "#jq_ez_bg" ) .children( 'img' ) .css( {
          "left" : 0 , // Keep left at 0.
          "top"  : -this_height // Shift top by half the excess height.
        } ) ;

      } // End of vertical centering check.

    } // End of centering option check.


    // Make the background image container visible now that it's correctly positioned and sized.
    $( "#jq_ez_bg" ) .css( {
      "visibility" : "visible"
    } ) ;


    // Restore the body's overflow property to 'auto'.
    // This allows normal scrolling of content over the background image.
    $( "body" ) .css( {
      "overflow" : "auto"
    } ) ;

  } // End of resizeImage function.


} ) ( jQuery ) ; // End of self-executing anonymous function wrapper.

// --- End of jQuery Plugin ---