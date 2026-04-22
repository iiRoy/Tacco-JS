/*
 * This is a self-executing anonymous function (IIFE)
 * that encapsulates the entire script, passing jQuery as '$'.
 * It ensures that the script runs safely without polluting the global scope.
 */
( function ( $ ) {


  // --- Section: Image Captioning and Fancybox Integration ---
  // Iterate over each article entry to process images within them.
  $( '.article-entry' ).each( function ( i ) {
    // For each image found within the current article entry...
    $( this ).find( 'img' ).each( function ( ) {
      // Check if the image's parent already has the 'fancybox' class.
      // If it does, skip this image as it's already processed or handled.
      if ( $( this ).parent( ).hasClass( 'fancybox' ) )
      {
        return ;
      }

      /*
       * Retrieve the 'alt' attribute of the image.
       * This will be used for the caption and fancybox title.
       */
      var alt = this . alt ;

      // If an alt attribute exists, create a caption span after the image.
      if ( alt )
      {
        $( this ).after( '<span class="caption">' + alt + '</span>' ) ;
      }

      // Wrap the image with an anchor tag for the fancybox effect.
      // The href points to the image source, and the title uses the alt text.
      $( this ).wrap( '<a href="' + $( this ).attr( 'src' ) + '" title="' + alt + '" class="fancybox"></a>' ) ;
    } ) ; // End of inner each() for images.


    // After processing all images, ensure fancybox links have a unique 'rel' attribute.
    // This groups images within the same article entry for the fancybox gallery.
    $( this ).find( '.fancybox' ).each( function ( ) {
      $( this ).attr( 'rel' , 'article' + i ) ;
    } ) ; // End of outer each() for article entries.

  } ) ; // End of article-entry processing.


  // Initialize Fancybox if the plugin is available.
  if ( $ . fancybox ) {
    $( '.fancybox' ).fancybox( ) ;
  }


  // --- Section: Search Input Customization ---
  // Remove the 'results' attribute from search input fields.
  // This is often done to hide the browser's default search history dropdown.
  $( 'input[type=search]' ).removeAttr( 'results' ) ;


  // --- Section: Image Lazy Loading Setup ---
  // Prepare images within article entries for scroll loading.
  $( '.article-entry img' ).each( function ( ) {
    // Store the original 'src' in a 'data-url' attribute.
    $( this ).attr( 'data-url' , $( this ).attr( 'src' ) ) ;
    // Remove the 'src' attribute to prevent immediate loading.
    $( this ).removeAttr( 'src' ) ;
    // Add a class to identify images that need scroll loading.
    $( this ).addClass( 'scrollLoading' ) ;
    // Wrap the image in a div for styling or layout purposes.
    $( this ).wrap( '<div class="img-wrap"></div>' ) ;
  } ) ;


  /*
   * Function: startWindowAnim
   * Initiates a visual animation on key layout elements.
   * Adds the 'open' class to header, wrap/outer, and footer.
   */
  function startWindowAnim ( ) {
    $( '#header' ).addClass( 'open' ) ;
    $( '#wrap > .outer' ).addClass( 'open' ) ;
    $( '#footer' ).addClass( 'open' ) ;
  }


  /*
   * Function: setScrollLoading
   * Applies the scrollLoading plugin to designated elements
   * and handles unwrapping images once they are loaded.
   */
  function setScrollLoading ( ) {
    // Activate the scrollLoading plugin on all '.scrollLoading' elements.
    $( '.scrollLoading' ).scrollLoading( ) ;

    // After scrollLoading, check if images are already complete or wait for load event.
    $( '.scrollLoading' ).each( function ( ) {
        // If the image is already loaded (e.g., from cache), unwrap it immediately.
        if ( $( this ) . complete ) {
          $( this ) . unwrap ( ) ;
        }
        else {
          // If not loaded, wait for the 'load' event, then unwrap.
          $( this ) . on ( 'load' , function ( ) {
            $( this ) . unwrap ( ) ;
          } ) ;
        }
    } ) ;
  }


  // Schedule the window animation to start very soon (1ms delay).
  setTimeout( startWindowAnim , 1 ) ;
  // Schedule the scroll loading setup to occur after a short delay (500ms).
  setTimeout( setScrollLoading , 500 ) ;


  // --- Section: Article Sharing Functionality ---
  /*
   * Handles click events on the body and specific sharing elements.
   * Manages the visibility and positioning of the article share box.
   */
  $( 'body' ) . on ( 'click' , function ( ) {
    // When clicking anywhere on the body, close any open share boxes.
    $( '.article-share-box.on' ) . removeClass( 'on' ) ;
  } ) . on ( 'click' , '.article-share-link' , function ( e ) {
    // When an article share link is clicked, prevent event propagation to the body.
    e . stopPropagation( ) ;

    /*
     * Define variables for the share box logic:
     * $this: The jQuery object of the clicked share link.
     * url: The URL to be shared.
     * encodedUrl: The URL encoded for use in share links.
     * id: A unique ID for the share box based on the article ID.
     * offset: The position of the clicked share link.
     */
    var $this = $( this ) ,
      url = $this . attr( 'data-url' ) ,
      encodedUrl = encodeURIComponent( url ) ,
      id = 'article-share-box-' + $this . attr( 'data-id' ) ,
      offset = $this . offset( ) ;

    // Check if a share box for this article already exists.
    if ( $( '#' + id ) . length ) {
      var box = $( '#' + id ) ;

      // If the existing box is already open, close it and return.
      if ( box . hasClass( 'on' ) ) {
        box . removeClass( 'on' ) ;
        return ;
      }
    }
    else {
      // If no share box exists, construct the HTML for a new one.
      var html = [
        '<div id="' + id + '" class="article-share-box">' ,
          '<input class="article-share-input" value="' + url + '">' ,
          '<div class="article-share-links">' ,
            '<a href="https://twitter.com/intent/tweet?url=' + encodedUrl + '" class="article-share-twitter" target="_blank" title="Twitter"></a>' ,
            '<a href="https://www.facebook.com/sharer.php?u=' + encodedUrl + '" class="article-share-facebook" target="_blank" title="Facebook"></a>' ,
            '<a href="http://pinterest.com/pin/create/button/?url=' + encodedUrl + '" class="article-share-pinterest" target="_blank" title="Pinterest"></a>' ,
            '<a href="https://plus.google.com/share?url=' + encodedUrl + '" class="article-share-google" target="_blank" title="Google+"></a>' ,
          '</div>' ,
        '</div>'
      ] . join( '' ) ;

      // Create a jQuery object from the generated HTML.
      var box = $( html ) ;

      // Append the new share box to the body.
      $( 'body' ) . append( box ) ;
    }

    // Hide any other share boxes that might be open.
    $( '.article-share-box.on' ) . hide( ) ;

    // Position the current share box and make it visible.
    box . css( {
      top: offset . top + 25 ,
      left: offset . left
    } ) . addClass( 'on' ) ;
  } ) . on ( 'click' , '.article-share-box' , function ( e ) {
    // Prevent clicks inside the share box from propagating to the body.
    e . stopPropagation( ) ;
  } ) . on ( 'click' , '.article-share-box-input' , function ( ) {
    // Automatically select the text in the share URL input field.
    $( this ) . select( ) ;
  } ) . on ( 'click' , '.article-share-box-link' , function ( e ) {
    // Prevent default link behavior and stop propagation for share links within the box.
    e . preventDefault( ) ;
    e . stopPropagation( ) ;

    // Open a new window for sharing the content.
    window . open( this . href , 'article-share-box-window-' + Date . now( ) , 'width=500,height=450' ) ;
  } ) ;


  // --- Section: Search Box Toggle ---
  // Toggle the search form visibility when the search button is clicked.
  $( '#nav-search-btn' ) . on ( 'click' , function ( ) {
    $( '#search-form-wrap' ) . toggleClass( 'on' ) ;
    $( '#main-nav' ) . toggleClass( 'off' ) ;
  } ) ;

  // Close the search box when clicking outside of it (on the main content wrap).
  $( "#wrap > .outer" ) . on ( 'click' , function ( ) {
    $( '#search-form-wrap' ) . removeClass( 'on' ) ;
    $( '#main-nav' ) . removeClass( 'off' ) ;
  } ) ;


  // --- Section: Mobile Navigation Toggle ---
  // Toggle the mobile navigation visibility when its button is clicked.
  $( '#main-nav-toggle' ) . on ( 'click' , function ( ) {
    $( '#mobile-nav' ) . toggleClass( 'off' ) ;
  } ) ;


} ) ( jQuery ) ; // End of IIFE, passing jQuery.