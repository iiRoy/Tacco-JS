/*
 * jQuery UI Dial 0.1.0 - A custom UI widget for interactive dial controls.
 *
 * This file is part of the jQuery UI project, extending its capabilities.
 *
 * Original Copyright (c) 2010 Emil Loer (http://koffietijd.net)
 *
 * Licensed under either the MIT or the GPL Version 2 licenses.
 * You may obtain a copy of the License at:
 *    http://jquery.org/license
 *
 * Project Home:
 *    https://github.com/thedjinn/jquery-ui-dial
 *
 * Dependencies required for this widget to function correctly:
 *    - jquery.ui.core.js
 *    - jquery.ui.widget.js
 *    - jquery.ui.mouse.js
 *    - jquery.ui.draggable.js (Crucial for the dial's interactive dragging)
 */
( function($, undefined) {

  // Define the 'dial' widget under the 'ui' namespace.
  $.widget( "ui.dial", {

    // Default options for the dial widget.
    options: {

      min:                -100, // The minimum possible value for the dial.

      max:                 100, // The maximum possible value for the dial.

      value:                 0, // The initial value of the dial.

      unitsPerPixel:         1, // How many units the value changes per pixel of drag.

      numImages:            10, // The total number of images (frames) used for the dial's visual representation.

      imageWidth:           32  // The width of a single image (frame) in pixels.
    },



    _create: function() {

      // Initialize the internal value with the provided option.
      this._value     = this.options.value;

      // Store the original value for drag calculations.
      this._origValue = this._value;


      // Cache 'this' for use within nested functions (e.g., event handlers).
      var self        = this;


      // Add a base class to the element for styling.
      this.element.addClass( "ui-dial" );


      // Make the element draggable to allow user interaction.
      this.element.draggable({

        axis:        'y', // Restrict dragging to the Y-axis (vertical movement).

        helper:      'original', // Drag the original element, not a clone.

        scroll:      false, // Do not scroll the page while dragging.

        cursor:      'row-resize', // Change cursor to indicate vertical resizing.

        addClasses:  false, // Prevent jQuery UI from adding default draggable classes.


        // Event handler for the 'drag' event.
        drag: function(event, ui) {

          // Calculate the new value based on drag distance and units per pixel.
          // Note: Dragging down (positive Y-delta) decreases value, hence the negative multiplier.
          var val = ( self._origValue + ( ui.position.top - ui.originalPosition.top ) * -self.options.unitsPerPixel );

          // Reset the UI position to original to prevent visual movement of the element itself.
          ui.position = ui.originalPosition;

          // Update the dial's value using the public 'value' method.
          self.value( val );

          // Trigger a custom 'change' event to notify listeners of value modification.
          self._trigger( "change", event, { value: self._value } );
        },


        // Event handler for the 'start' of a drag operation.
        start: function(event, ui) {

          // Store the current value as the starting point for this drag.
          self._origValue = self._value;

          // Trigger a custom 'start' event.
          self._trigger( "start", event, { value: self._value } );
        },


        // Event handler for the 'stop' of a drag operation.
        stop: function(event, ui) {

          // Trigger a custom 'stop' event.
          self._trigger( "stop", event, { value: self._value } );
        }
      });


      // Perform an initial update to set the dial's visual state.
      this._update();
    },



    destroy: function() {

      // Call the base widget's destroy method to clean up.
      $.Widget.prototype.destroy.apply( this, arguments );
    },



    // Public method to get or set the dial's value.
    value: function(newValue) {

      // If no argument is provided, return the current value.
      if ( newValue === undefined ) {
        return this._value;
      }


      // If a number is provided, update the dial's value.
      if ( typeof newValue === "number" ) {

        this._value = newValue;

        // Ensure the value stays within the defined min/max range.
        this._value = Math.max( this._value, this.options.min );

        this._value = Math.min( this._value, this.options.max );

        // Update the visual representation of the dial.
        this._update();
      }

      // Return 'this' for method chaining.
      return this;
    },



    // Internal method to update the dial's visual display.
    _update: function() {

      // Calculate the position of the background image based on the current value.
      // This determines which frame of the dial image to display.
      var normalizedValue = ( this._value - this.options.min ) / ( this.options.max - this.options.min );

      var imageIndex      = normalizedValue * ( this.options.numImages - 1 );

      var roundedIndex    = Math.round( imageIndex );

      var pos             = roundedIndex * this.options.imageWidth;


      // Apply the calculated background position to the element's CSS.
      // The '0' indicates no vertical offset, as frames are typically horizontal.
      this.element.css( "background-position", "-" + pos + "px 0" );
    }
  });

})( jQuery ); // Pass jQuery into the IIFE for scope isolation.