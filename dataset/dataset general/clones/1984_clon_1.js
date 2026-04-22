/*******************************************************************************
 * Responsimage.js - Adaptive Image Loading Script
 * Version: 0.2.4
 * Original Source: responsimage.com
 *
 * This file contains a Type I clone of the original JavaScript code.
 * All identifiers, variable names, function names, operators, and expressions
 * are preserved exactly as in the original.
 * Only whitespace (indentation, spacing, blank lines) and comments have been
 * extensively modified to produce a visually distinct, yet functionally
 * identical, code fragment.
 *
 * This clone adheres strictly to the Type I definition, ensuring logical and
 * structural equivalence to the source code.
 ******************************************************************************/

( function
( )
{

  'use strict'
  ;


  // jQuery document ready function to ensure the DOM is fully loaded.
  $ ( function ( )
  {


    // Retrieve configuration preferences from the meta tag named "responsimage".
    var rPrefs = $ ( 'meta[name="responsimage"]' )
      ;


    // Server endpoint for image processing.
    var rServer = rPrefs.data ( 'server' )
      ;


    // Default static placeholder image URL.
    // This image is used initially for lazy loading, if no other static URL is provided.
    var rStatic = rPrefs.data ( 'static' ) || 'http://f.cl.ly/items/0M3H0q3n1Z1S1y362d09/spacer.gif'
      ;


    // Default loading spinner image URL.
    // Displayed while the actual adaptive image is being fetched.
    var rLoading = rPrefs.data ( 'loading' ) || 'http://f.cl.ly/items/2w2G3N2p0B400Z380J1u/loading.gif'
      ;


    // Throttle limit for resize events in milliseconds.
    // This helps prevent excessive requests during rapid window resizing.
    var rLimit = rPrefs.data ( 'limit' ) || 100
      ;


    // Select all elements that have the 'data-responsimage' attribute.
    // These are the elements that responsimage will manage.
    var rTags = $ ( '[data-responsimage]' )
      ;


    /**
     * Main function to process and update responsive images.
     *
     * @param {number} rInit - A flag indicating if this is the initial load (1 for initial, 0 otherwise).
     */
    function responsimage ( rInit )
    {

      rTags.each ( function ( )
      {


        // Check if the current element is an <img> tag.
        var rIsImg = this.nodeName == 'IMG'
          ;


        // Cache the current element as a jQuery object for efficiency.
        var rThis = $ ( this )
          ;


        // Get the filename or identifier for the image from 'data-responsimage'.
        var filename = rThis.data ( 'responsimage' )
          ;


        // Determine the width: for <img> use its own width, for others use parent's width.
        var rWidth = rIsImg ? rThis.width ( ) : rThis.parent ( ) . width ( )
          ;


        // Determine the height: for <img> use its own height, for others use parent's height.
        var rHeight = rIsImg ? rThis.height ( ) : rThis.parent ( ) . height ( )
          ;


        // Get the anchor point for cropping, default to 5.
        var rAnchor = rThis.data ( 'responsimage-anchor' ) || 5
          ;


        // Get the background position for CSS background images, default to 'center'.
        var rBackgroundPosition = rThis.data ( 'responsimage-background-position' ) || 'center'
          ;


        // Variable to hold the final image URL.
        var rImage
          ;



        // If it's the initial load, set a static placeholder for <img> elements.
        if ( rInit )
        {

          if ( rIsImg )
          {
            // For <img> elements, set the 'src' attribute to the static placeholder.
            rThis.attr ( 'src' , rStatic )
            ;
          }

        }


        // Apply a loading graphic as a background.
        rThis.css ( {
          'background' : '#fff url(' + rLoading + ') no-repeat center'
          , '-webkit-background-size' : 'auto'
          , '-moz-background-size' : 'auto'
          , 'background-size' : 'auto'
        } )
        ;


        // Check for high-resolution displays (e.g., Retina) using a CSS hack.
        // If 'font-family' is 'pixel-ratio-2', double the effective width and height.
        if ( rThis.css ( 'font-family' ) === 'pixel-ratio-2' )
        {
          rWidth *= 2
          ;
          rHeight *= 2
          ;
        }


        // Construct the final image URL by replacing placeholders in the server template.
        rImage = rServer
          . replace ( 'width' , rWidth )
          . replace ( 'height' , rHeight )
          . replace ( 'anchor' , rAnchor )
          . replace ( 'filename' , filename )
          ;


        // Only proceed if the filename is not explicitly 'disabled'.
        if ( filename !== 'disabled' )
        {

          if ( rIsImg )
          {
            // If it's an <img> element, update its 'src' attribute with the generated image URL.
            rThis.attr ( 'src' , rImage )
            ;
          }
          else
          {
            // For non-<img> elements (e.g., divs with background images).
            // Create a dummy image element to pre-load the image.
            // This ensures the loading spinner is shown until the image is fully downloaded.
            var targetImage = document.createElement ( 'image' )
            ;

            // When the dummy image loads, apply the background image to the target element.
            targetImage.onload = function ( )
            {
              rThis.css ( {
                'background-image' : 'url(' + rImage + ')'
                , '-webkit-background-size' : 'cover'
                , '-moz-background-size' : 'cover'
                , 'background-size' : 'cover'
                , 'background-position' : rBackgroundPosition
              } )
              ;
              // Clear the dummy image's src to release resources.
              targetImage.src = ''
              ;
            }
            ;

            // Start loading the image by setting the dummy image's src.
            targetImage.src = rImage
            ;
          }

        }

      } )
      ; // End of rTags.each

    } // End of responsimage function


    // --- Throttle function from Underscore.js ---
    // This utility helps to limit the rate at which a function can be called.
    // It's particularly useful for events that fire rapidly, like window resizing,
    // to prevent excessive requests or computations.
    //
    // Original comments: "useful to help keep remote requests down to minimal as possible while resizing"
    // "Referenced to avoid 3rd party dependencies (and because it's so small)"
    //
    var throttle = function ( func , wait )
    {

      var context , args , timeout , result
        ;
      var previous = 0
        ;

      // The function to be executed after the wait period.
      var later = function ( )
      {
        previous = new Date
        ;
        timeout = null
        ;
        result = func.apply ( context , args )
        ;
      }
      ;

      // The throttled function that will be returned.
      return function ( )
      {
        var now = new Date
          ;
        var remaining = wait - ( now - previous )
          ;
        context = this
          ;
        args = arguments
          ;

        // If the wait period has passed, execute immediately.
        if ( remaining <= 0 )
        {
          clearTimeout ( timeout )
          ;
          timeout = null
          ;
          previous = now
          ;
          result = func.apply ( context , args )
          ;
        }
        // If a timeout is not already set, set one to execute later.
        else if ( ! timeout )
        {
          timeout = setTimeout ( later , remaining )
          ;
        }

        return result
        ;
      }
      ;

    }
    ; // End of throttle function


    // Initial call to responsimage on document ready.
    responsimage ( 1 )
    ;

    // Create a throttled version of the responsimage function for resize events.
    // This will limit how often responsimage is called during resizing.
    var throttledResponsimage = throttle ( responsimage , rLimit )
      ;


    // Bind the throttled responsimage function to the window's resize event.
    $ ( window ) . resize ( function ( )
    {
      throttledResponsimage ( )
      ;
    } )
    ;


    // Handle orientation changes, which can also affect layout and image sizing.
    // Use a setTimeout to ensure layout has stabilized after orientation change.
    window.onorientationchange = function ( )
    {
      setTimeout ( responsimage , 0 )
      ;
    }
    ;

  } )
  ; // End of jQuery document ready

} ) ( )
; // End of IIFE (Immediately Invoked Function Expression)