( function( e ) {
  /*
   * This is the Universal Module Definition (UMD) pattern.
   * It attempts to make the 'flippant' module available in
   * various JavaScript environments.
   */

  if ( "function" == typeof bootstrap ) {
    // CommonJS environment with 'bootstrap' available
    bootstrap( "flippant", e )
  } else if ( "object" == typeof exports ) {
    // Standard CommonJS environment
    module.exports = e()
  } else if ( "function" == typeof define && define.amd ) {
    // Asynchronous Module Definition (AMD) environment
    define( e )
  } else if ( "undefined" != typeof ses ) {
    // Secure EcmaScript (SES) environment check
    if ( !ses.ok() ) {
      /* If SES is not okay, we cannot proceed. */
      return
    }

    ses.makeFlippant = e
  } else if ( "undefined" != typeof window ) {
    // Browser environment: attach to window object
    window.flippant = e()
  } else {
    // Node.js or similar global environment
    global.flippant = e()
  }
} )( function() {
  /* Declare global variables that might be present in different environments. */
  var define, ses, bootstrap, module, exports

  // This is the core module loader / bundler logic.
  // It's a self-executing function that sets up a simple
  // module system, similar to CommonJS or Browserify.
  return ( function( e, t, n ) {

    // The 'i' function is the custom 'require' implementation.
    function i( n, s ) {
      // Check if the module is already loaded.
      if ( !t[ n ] ) {
        // If not, check if it's defined in the module registry 'e'.
        if ( !e[ n ] ) {
          var o = typeof require == "function" && require // Native require, if available.
          // If not a 'silent' require and native require exists, use it.
          if ( !s && o ) {
            return o( n, !0 )
          }
          // If a global 'r' (our internal require) exists, use it.
          if ( r ) {
            return r( n, !0 )
          }
          // If all else fails, throw an error.
          throw new Error( "Cannot find module '" + n + "'" )
        }
        // Initialize the module's exports object.
        var u = t[ n ] = {
          exports: {}
        }
        // Execute the module's code, passing in a local 'require' function.
        e[ n ][ 0 ].call( u.exports, function( t ) {
          var r = e[ n ][ 1 ][ t ]
          return i( r ? r : t ) // Recursively require dependencies.
        }, u, u.exports )
      }
      // Return the module's exports.
      return t[ n ].exports
    }

    var r = typeof require == "function" && require // Store native require if it exists.

    // Load initial modules defined in 'n'.
    for ( var s = 0; s < n.length; s++ ) {
      i( n[ s ] )
    }
    // Return the internal 'require' function.
    return i

  } )( { // Module definitions start here.
    1: [ // Module ID 1
      function( require, module, exports ) {

        /*
         * Export the main 'flip' function for external use.
         * This makes it available when this module is required.
         */
        exports.flip = flip


        /**
         * Initiates a 'flip' animation, creating a new element over an existing one.
         *
         * @param {HTMLElement} flipper The HTML element to be "flipped".
         * @param {string} content The HTML content to display on the "back" of the flip.
         * @param {string} type The type of flip ("modal" or "card").
         * @param {string} class_name An optional CSS class to apply to the back element.
         * @param {number} timeout The duration of the flip animation in milliseconds.
         * @returns {HTMLElement} The newly created "back" element.
         */
        function flip( flipper, content, type, class_name, timeout ) {

          var position, // Stores the CSS position property ('fixed' or 'absolute').
            back, // The new element representing the "back" of the flip.
            style_func // The function to apply specific styles based on 'type'.

          // Set default values if not provided.
          timeout = timeout || 400
          type = type || "card"

          // Determine styles and classes based on the 'type' of flip.
          if ( type === "modal" ) {
            class_name = class_name || "flippant-modal-dark"
            position = "fixed"
            style_func = null_styles // Modals typically don't have explicit size/position.
          }

          if ( type === "card" ) {
            class_name = class_name || "flippant-modal-light"
            position = "absolute"
            style_func = card_styles // Cards might need 'auto' height.
          }

          // Create the new element that will appear on the "back".
          back = document.createElement( 'div' )

          // Append it to the document body.
          document.body.appendChild( back )

          // Apply initial positioning styles to match the original flipper.
          set_styles( back, flipper, position )

          // Set the HTML content for the back element.
          back.innerHTML = content

          /*
           * Add CSS classes to initiate the flip animation.
           */
          flipper.classList.add( 'flippant' ) // Base class for the front element.
          back.classList.add( 'flippant-back' ) // Base class for the back element.
          back.classList.add( class_name ) // Type-specific class for styling.


          // Apply type-specific styles, potentially with a slight delay for fixed modals.
          if ( position == "absolute" ) {
            style_func( back )
          } else {
            // For fixed positioning, defer style application slightly.
            window.setTimeout( function() {
              style_func( back )
            }, 0 )
          }


          // Trigger the actual flip animation after a minimal delay.
          window.setTimeout( function() {
            back.classList.add( 'flipper' )
            back.classList.add( 'flipped' )
            flipper.classList.add( 'flipped' )
          }, 0 )


          // Attach a custom 'close' event listener to the back element.
          back.addEventListener( 'close', close )
          // Also provide a direct method to close the flip.
          back.close = close

          /**
           * Closes the flipped element, reversing the animation.
           * This is a nested function, so it has access to `back`, `flipper`, `position`, `class_name`, and `timeout`.
           */
          function close() {

            // Reset styles to match the front element during the un-flip animation.
            set_styles( back, flipper, position )

            // Remove 'flipped' classes to reverse the animation.
            back.classList.remove( 'flipped' )
            back.classList.remove( 'flipper' ) // Ensure this is also removed.
            flipper.classList.remove( 'flipped' )

            // After the animation timeout, remove the element from the DOM.
            window.setTimeout( function() {
              back.classList.remove( class_name )
              document.body.removeChild( back )
            }, timeout )
          }

          return back // Return the newly created back element.
        }

        /**
         * Sets initial positioning styles for the 'back' element to match the 'front'.
         * This creates the illusion of the 'back' element emerging from the 'front'.
         *
         * @param {HTMLElement} back The element representing the back of the flip.
         * @param {HTMLElement} front The element being flipped (the original element).
         * @param {string} position The CSS position property ('fixed' or 'absolute').
         */
        function set_styles( back, front, position ) {
          back.style.position = position
          back.style.top = front.offsetTop + "px"
          back.style.left = front.offsetLeft + "px"
          back.style[ 'min-height' ] = front.offsetHeight + "px"
          back.style.width = front.offsetWidth + "px"
          back.style[ "z-index" ] = 9999 // Ensure it's on top.
        }

        /**
         * Resets specific style properties to null for elements that should
         * take up full screen or natural positioning (e.g., modals).
         *
         * @param {HTMLElement} back The element whose styles are to be reset.
         */
        function null_styles( back ) {
          back.style.top = null
          back.style.left = null
          back.style.height = null
          back.style.width = null
        }

        /**
         * Applies specific styles for 'card' type flips, typically setting height to 'auto'.
         *
         * @param {HTMLElement} back The element representing the back of the flip.
         */
        function card_styles( back ) {
          back.style.height = 'auto'
        }

      }
    ]
  }, {}, [ 1 ] )( 1 ) // End of module definitions and initial module load (module ID 1).
} );