// This file contains a jQuery plugin for responsive container functionality.
// It detects container width and applies classes or triggers callbacks based on specified conditions.

// The following is a self-executing anonymous function,
// used to create a private scope for the plugin and
// ensure that '$' refers to jQuery within this context.
( function ( $ ) {

  // Enforce strict mode for better code quality and error handling.
  "use strict";

  // Define default configuration settings for the plugin.
  // These can be overridden by user-supplied options.
  var defaults = {
          // The CSS feature to check against the container's width.
          // Currently supports 'min-width' and 'max-width'.
          feature: 'min-width',

          // The value (e.g., '800px') to compare with the container's width.
          value: '800px',

          // An optional CSS class name to add to the container when the condition is met.
          className: '',

          // An optional callback function to execute when the condition is met.
          // It receives an object with the current width as an argument.
          callback: null // Placeholder for a function reference.
      },
      // An array intended for storing classes to be removed, though not explicitly used in this version.
      removeClasses = [];

  // Extend jQuery's prototype to add the new plugin method 'responsiveContainer'.
  $.fn.responsiveContainer = function ( options ) {

      // Perform initial validation checks on the provided options.
      // A 'feature' must always be supplied.
      if ( typeof options.feature === 'undefined' ) {
          // If 'feature' is missing, throw an error to indicate incorrect usage.
          throw new Error( 'Responsive container error: No "feature" supplied, such as min-width.' );
      }

      // A 'value' must also be supplied.
      if ( typeof options.value === 'undefined' ) {
          // If 'value' is missing, throw an error.
          throw new Error( 'Responsive container error: No "value" supplied, such as 800px.' );
      }

      // At least one of 'className' or 'callback' must be provided for the plugin to have any effect.
      if ( typeof options.className === 'undefined' && typeof options.callback === 'undefined' ) {
          // If neither is provided, throw an error as the plugin would be useless.
          throw new Error( 'Responsive container error: No "className" or "callback" supplied, one or the other is needed, else theres no use.' );
      }


      // Merge default settings with user-provided options.
      // This creates a new object 'settings' without modifying 'defaults'.
      var settings = $.extend( {}, defaults, options );


      // Iterate over each selected DOM element to apply the responsive container logic.
      // 'this' refers to the jQuery object containing the selected elements.
      return this.each( function () {

          // Cache the current element as a jQuery object for efficiency.
          var self = $( this ),
              // Define the callback function that will be executed on resize events.
              resizeCallback = function () {

                  // Initialize a flag to track if the responsive condition is met.
                  var matches = false,
                      // Get the current width of the container element.
                      width = self.width();

                  // If a className is specified, ensure it's removed before re-evaluating conditions.
                  if ( settings.className !== '' ) {
                      // Remove the class to prevent it from persisting if conditions are no longer met.
                      self.removeClass( settings.className );
                  }


                  // Evaluate the responsive condition based on the specified 'feature'.
                  switch ( settings.feature ) {
                      // Case for 'min-width' feature.
                      case 'min-width':
                          // Compare the container's width with the specified value (after removing 'px').
                          if ( settings.value.replace( 'px', '' ) < width ) {
                              // If the container's width is greater than the min-width, the condition is met.
                              matches = true;
                          }
                          break; // Exit the switch statement.

                      // Case for 'max-width' feature.
                      case 'max-width':
                          // Compare the container's width with the specified value (after removing 'px').
                          if ( settings.value.replace( 'px', '' ) > width ) {
                              // If the container's width is less than the max-width, the condition is met.
                              matches = true;
                          }
                          break; // Exit the switch statement.
                  }


                  // If the responsive condition was met during the evaluation.
                  if ( matches ) {
                      // If a className was specified in settings.
                      if ( settings.className !== '' ) {
                          // Add the specified class to the container element.
                          self.addClass( settings.className );
                      }

                      // If a callback function was provided in settings.
                      if ( settings.callback !== null ) {
                          // Execute the callback function, passing the current width.
                          settings.callback( {
                              width: width
                          } );
                      }
                  }

              }; // End of resizeCallback function definition.


          // Attach the 'resizeCallback' function to the 'resize' event of the current element.
          // This ensures the logic runs whenever the element's size changes.
          $( this ).resize( resizeCallback );


          // Execute the 'resizeCallback' immediately upon plugin initialization.
          // This ensures the initial state of the container is correctly set.
          resizeCallback();

      } ); // End of this.each loop.

  }; // End of $.fn.responsiveContainer plugin definition.

// Pass the jQuery object to the immediately invoked function expression.
} ( jQuery ) ); // End of IIFE.