/*
 * jQuery Tap Plugin
 *
 * Provides a 'tap' event for touch-enabled devices,
 * falling back to 'click' for others.
 *
 * Author: (Original Author Unknown)
 * Version: 1.0.0
 * License: MIT
 *
 * This code is a Type I clone, preserving all functionality
 * and identifiers, while extensively modifying whitespace
 * and comments for visual distinction.
 */

; ( function ( $ , undefined ) {

  // Global counter for unique element IDs within the tap plugin context.
  var incrementalElementId = 0;

  // A simple mutex to prevent multiple tap events from firing simultaneously
  // for different elements. Stores the ID of the currently 'touching' element.
  var mutex = 0;

  /**
   * Defines the 'tap' method on jQuery objects.
   *
   * @param {number|function} threshold - The maximum distance (in pixels)
   *                                    a touch can move and still be considered a tap.
   *                                    If a function, it's treated as the callback.
   * @param {function} callback - The function to execute when a tap occurs.
   * @param {boolean} touchOnly - If true, the event will only fire on touch devices,
   *                              and not fall back to 'click'.
   * @returns {jQuery} The jQuery object for chaining.
   */
  $.fn.tap = function ( threshold , callback , touchOnly ) {

    // Argument reordering if threshold is passed as the callback
    if ( typeof threshold === 'function' ) {
      touchOnly = callback ; // Shift arguments
      callback = threshold ; // Shift arguments
      threshold = 15       ; // Default threshold value
    }

    // Check if the browser supports touch events
    if ( 'ontouchstart' in window ) {

      // Iterate over each selected element
      this.each( function ( ) {

        // Initialize variables for each element instance
        var moveDistance = 0 ;           // Tracks total touch movement
        var touch = null ;               // Stores the current touch object
        var elementId = ++incrementalElementId ; // Unique ID for this element
        var startPoint = null ;          // Initial touch coordinates
        var touching = false ;           // Flag to indicate if a touch sequence is active

        var self = this ;                // Reference to the DOM element
        var $self = $ ( this ) ;         // jQuery wrapped DOM element

        // Bind the 'touchstart' event
        $self.bind( 'touchstart' , function ( e ) {
          // If another element is currently being 'tapped', ignore this event
          if ( mutex != 0 ) {
            return ;
          } else {
            mutex = elementId ; // Acquire the mutex for this element
          }

          touching = true ;    // Mark as currently touching
          moveDistance = 0 ;   // Reset move distance for a new tap attempt

          // Check for valid touch event data
          if ( e.originalEvent.touches && e.originalEvent.touches[0] ) {
            touch = e.originalEvent.touches[0] ; // Get the first touch point
            startPoint = {
              x : touch.screenX ,
              y : touch.screenY
            } ; // Store starting coordinates
          }
        } ) ;

        // Bind the 'touchend' event
        $self.bind( 'touchend' , function ( e ) {
          // Release the mutex if this element held it
          if ( mutex == elementId ) {
            mutex = 0 ;
          }

          // If not actively touching, ignore this event
          if ( !touching ) {
            return ;
          }

          touching = false ; // Reset touching flag

          // If movement was within the threshold, consider it a tap
          if ( moveDistance < threshold ) {
            callback.apply( self , [ ] . slice . call ( arguments ) ) ; // Execute callback
          } else {
            // Otherwise, trigger a 'tap-failed' custom event
            $self.trigger( 'tap-failed' ) ;
          }
        } ) ;

        // Bind the 'touchmove' event
        $self.bind( 'touchmove' , function ( e ) {
          // If not actively touching, ignore
          if ( !touching ) {
            return ;
          }

          // If no touches or start point is missing, cancel the touch sequence
          if ( e.originalEvent.touches.length == 0 || startPoint === null ) {
            return touching = false ;
          }

          touch = e.originalEvent.touches[0] ; // Get current touch point

          // Calculate the Euclidean distance moved from the start point
          moveDistance = Math.sqrt(
            Math.pow( touch.screenX - startPoint.x , 2 ) +
            Math.pow( touch.screenY - startPoint.y , 2 )
          ) ;

          // If movement exceeds the threshold, this is not a tap
          if ( moveDistance > threshold ) {
            $self.trigger( 'exceed-tap-threshold' ) ; // Notify about exceeding threshold
            touching = false ;                       // Stop tracking as a tap
          }
        } ) ;

        // Bind the 'touchcancel' event
        $self.bind( 'touchcancel' , function ( ) {
          // Release the mutex if this element held it
          if ( mutex == elementId ) {
            mutex = 0 ;
          }

          touching = false ; // Reset touching flag, tap is cancelled

          $self.trigger( 'tap-failed' ) ; // Trigger a failure event
        } ) ;
      } ) ; // End this.each
    }
    // If not a touch device AND not explicitly touchOnly, fall back to click
    else if ( !touchOnly ) {
      this.click ( callback ) ; // Bind standard click event
    }

    return this ; // Allow for jQuery method chaining
  } ; // End $.fn.tap
} ) ( window.jQuery || window.$ ) ; // Pass jQuery/Zepto object to the IIFE