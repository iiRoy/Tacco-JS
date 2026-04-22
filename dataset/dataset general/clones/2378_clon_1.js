/*
 * This script provides a utility to make video-like elements responsive.
 *
 * Usage Example 1: fitIt('<selector>')
 * Usage Example 2: fitIt('[src*="youtube.com"]')
 *
 * All elements matching the given selector will be resized to fit their container
 * and maintain aspect ratio. This includes dynamically loaded content.
 */

( function ( ) {

  'use strict' ;

  var fitSelectors = [ ] , // Array to store selectors for elements to be resized

    // The MutationObserver monitors DOM changes to catch asynchronously loaded nodes.
    observer = new MutationObserver( function ( mutations ) {

      mutations.forEach( function ( mutation ) {

        if ( mutation.addedNodes.length ) {

          // Convert NodeList to Array for easier iteration
          [ ].slice.call( mutation.addedNodes ).forEach( function ( node ) {

            // Check if the added node matches any registered selector
            fitSelectors.forEach( function ( selector ) {

              if ( matches( node , selector ) ) {

                initVid( node ) ; // Initialize the video element if it matches
              }
            } ) ;
          } ) ;
        }
      } ) ;
    } ) , // End of MutationObserver definition

    // Helper function to check if an element matches a CSS selector
    matches = function ( el , selector ) {

      var matchesMethod = [ 'matches' , 'webkitMatchesSelector' , 'mozMatchesSelector' , 'msMatchesSelector' ] . filter( function ( method ) {

        return !! el [ method ] ;
      } ) [ 0 ] ;

      if ( matchesMethod ) {

        return el [ matchesMethod ] ( selector ) ;
      }
    } , // End of matches function

    // Function to resize a video element based on its stored aspect ratio
    resize = function ( vid ) {

      var ratio = parseFloat( vid.dataset.ratio , 10 ) , // Retrieve aspect ratio from data attribute
        width = parseInt( window.getComputedStyle( vid ).width , 10 ) ; // Get current computed width

      vid.style.height = ( width / ratio ) + 'px' ; // Set height to maintain aspect ratio
    } , // End of resize function

    // Initializes a video element for responsive sizing
    initVid = function ( vid ) {

      var styles = window.getComputedStyle( vid ) ,
        width = parseInt( styles.width , 10 ) ,
        height = parseInt( styles.height , 10 ) ,
        ratio = width / height ; // Calculate initial aspect ratio

      vid.dataset.ratio = ratio ; // Store ratio in a data attribute
      vid.style.width = '100%' ; // Make it full width
      vid.removeAttribute( 'width' ) ; // Remove fixed width attribute
      vid.removeAttribute( 'height' ) ; // Remove fixed height attribute

      resize( vid ) ; // Perform initial resize
    } , // End of initVid function

    // Public function to register elements for responsive sizing
    fitIt = function ( selector ) {

      // Inner helper function to check document ready state
      var ready = function ( ) {

        return ( document.readyState === 'interactive' || document.readyState === 'complete' || document.readyState === 'loaded' ) ;
      } ;

      fitSelectors.push( selector ) ; // Add selector to the list

      if ( ready ( ) ) {

        // If document is ready, initialize existing elements
        [ ].slice.call( document.querySelectorAll( selector ) ).forEach( initVid ) ;
      } else {

        // Otherwise, wait for document to be ready
        document.addEventListener( 'readystatechange' , function ( ) {

          if ( ready ( ) ) {

            [ ].slice.call( document.querySelectorAll( selector ) ).forEach( initVid ) ;
          }
        } ) ;
      }

      // Add a resize event listener to the window
      window.addEventListener( 'resize' , function ( ) {

        // On window resize, re-adjust all matching elements
        [ ].slice.call( document.querySelectorAll( selector ) ).forEach( resize ) ;
      } ) ;
    } ; // End of fitIt function

  // Start observing the entire document for added nodes
  observer.observe( document.documentElement , { subtree: true , childList: true } ) ;

  // Expose the fitIt function globally
  window.fitIt = fitIt ;

} ) ( ) ;