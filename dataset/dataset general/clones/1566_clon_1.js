( function ($) { // Start of self-executing anonymous function to encapsulate the plugin logic
  // This ensures jQuery is passed in as '$'
$.fn.cyclotron = function (options) { // Define the 'cyclotron' plugin on jQuery's prototype
  // This makes it available on jQuery objects (e.g., $('selector').cyclotron())

    /*
     * Default settings for the plugin.
     * These can be overridden by the 'options' object passed during initialization.
     */
    var settings = $.extend( { // Merge default options with user-provided options
      dampingFactor: 0.93, /* Controls the deceleration speed; a value between 0 and 1 */
      historySize: 5       // Number of previous movements to store for calculating average velocity
    }, options ); // User-defined options

    return this.each( function () { // Iterate over each selected element
      // For each element, initialize the cyclotron behavior

      // Declare local variables for this instance of the plugin
      var container,     // Reference to the current jQuery element
          sx,            // Starting X coordinate of the mouse during a drag
          dx = 0,        // Current velocity (change in X)
          armed,         // Flag indicating if dragging is active
          offset = 0,    // Current background-position offset
          tick,          // Function to be called repeatedly by setInterval
          prev,          // Previous mouse X coordinate
          h = [ ];       // Array to store recent movement history

      // Get the jQuery object for the current DOM element
      container = $( this );

      // --- Event Handlers ---

      // Handle mouse button down event
      container.mousedown( function (e) {
        // Calculate the initial offset based on mouse position
        sx    = e.pageX - offset;

        // Arm the dragging state
        armed = true;

        // Prevent default browser behavior (e.g., text selection)
        e.preventDefault( );
      } );

      // Handle mouse movement event
      container.mousemove( function (e) {
        var px; // Current mouse X coordinate

        // Check if dragging is currently active
        if ( armed ) {
          px = e.pageX; // Get current X position

          // Initialize 'prev' if it's the first movement in a drag
          if ( prev === undefined ) {
            prev = px;
          }

          // Update the background offset
          offset = px - sx;

          // Manage the movement history array
          if ( h.length > settings.historySize ) {
            h.shift( ); // Remove the oldest entry if history size is exceeded
          }
          h.push( prev - px ); // Add the current movement to history (difference from previous)

          // Apply the new background position
          container.css( 'background-position', offset );

          // Update 'prev' for the next movement calculation
          prev = px;
        }
      } );

      // Handle mouse leave and mouse up events (to disarm dragging)
      container.bind( 'mouseleave mouseup', function ( ) {
        // If dragging was active when the event occurred
        if ( armed ) {
          var i,               // Loop counter
              len = h.length,  // Length of the history array
              v   = h[ len - 1 ]; // Start velocity calculation with the last recorded movement

          // Calculate an average velocity from the history
          for ( i = 0; i < len; i++ ) {
            v = ( v * len + ( h[ i ] ) ) / ( len + 1 );
          }
          dx = v; // Set the initial deceleration velocity
        }
        armed = false; // Disarm the dragging state
      } );

      /*
       * The 'tick' function is responsible for the deceleration animation.
       * It's called repeatedly by setInterval.
       */
      tick = function ( ) {
        // Only run if not currently dragging and there's a velocity to damp
        if ( !armed && dx ) {
          dx *= settings.dampingFactor; // Apply damping factor to reduce velocity
          offset -= dx;                 // Update offset based on current velocity
          container.css( 'background-position', offset ); // Apply new background position

          // Stop animation if velocity is very small
          if ( Math.abs( dx ) < 0.001 ) {
            dx = 0; // Reset velocity to zero
          }
        }
      };

      // Start the animation loop, calling 'tick' approximately 60 times per second
      setInterval( tick, 16 ); // 1000ms / 60 frames ≈ 16.67ms per frame
    } ); // End of this.each()
  }; // End of $.fn.cyclotron function
}( jQuery ) ); // End of IIFE, passing jQuery object