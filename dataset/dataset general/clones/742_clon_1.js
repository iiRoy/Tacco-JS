/*
 * This is a Type I clone of the original bootstrap-popover.js v1.3.0
 *
 * Original source: http://twitter.github.com/bootstrap/javascript.html#popover
 *
 * Copyright (c) 2011 Twitter, Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * This file demonstrates a Type I code clone.
 */


!function ( $ ) { /* Immediately invoked function expression */

  // Define the Popover constructor function.
  // This function initializes a new Popover instance.
  var Popover = function ( element, options ) {

    console.log( 'popover is alive' ); // Debugging message

    this.$element = $( element ); // Store the jQuery-wrapped element
    this.options = options;       // Store configuration options
    this.enabled = true;          // Popover is enabled by default

    // Call a method to handle the title, likely from the base Twipsy class.
    this.fixTitle();

  }; // End of Popover constructor


  /*
   * IMPORTANT:
   * The Popover component extends functionality from the bootstrap-twipsy.js module.
   * This is crucial for its operation, as Twipsy provides the base tooltip logic.
   * ==============================================================================
   */

  // Extend the Popover prototype with methods,
  // inheriting from Twipsy's prototype.
  Popover.prototype = $.extend( {}, $.fn.twipsy.Twipsy.prototype, {

    // Method to set the content of the popover's tip.
    setContent: function () {

      console.log( 'test' ); // Another debug output

      var $tip = this.tip(); // Get the popover's jQuery-wrapped tip element.

      // Update the title section of the popover.
      // Uses 'html' or 'text' based on the 'html' option.
      $tip.find( '.title' )[ this.options.html ? 'html' : 'text' ]( this.getTitle() );

      // Update the content paragraph of the popover.
      // Uses 'html' or 'text' based on the 'html' option.
      $tip.find( '.content p' )[ this.options.html ? 'html' : 'text' ]( this.getContent() );

      // Ensure the tip element has the correct base class.
      $tip[ 0 ].className = 'popover';

    }

    // Method to retrieve the actual content for the popover.
    , getContent: function () {

      console.log( 'test' ); // Debugging line

      var content; // Variable to hold the popover's content.

      var $e = this.$element; // Reference to the element associated with the popover.
      var o = this.options;   // Reference to the popover's options.

      // Determine content based on its type in options.
      if ( typeof this.options.content == 'string' ) {
        // If content is a string, it's likely an attribute name.
        content = $e.attr( o.content );
      } else if ( typeof this.options.content == 'function' ) {
        // If content is a function, execute it in the context of the element.
        content = this.options.content.call( this.$element[ 0 ] );
      }

      return content; // Return the determined content.

    }

    // Method to get or create the popover's DOM tip element.
    , tip: function() {

      // If the tip element doesn't exist yet, create it.
      if ( !this.$tip ) {

        this.$tip = $( '<div class="popover" />' )
          // Populate the tip with its internal structure.
          .html( '<div class="arrow"></div><div class="inner"><h3 class="title"></h3><div class="content"><p></p></div></div>' );

      }

      return this.$tip; // Return the jQuery-wrapped tip element.

    } // End of tip method

  } ); // End of Popover.prototype extend


  /*
   * POPOVER JQUERY PLUGIN DEFINITION
   * =================================
   * This section defines the jQuery plugin interface for Popover.
   */

  // Define the 'popover' jQuery plugin.
  $.fn.popover = function ( options ) {

    // If options are provided as an object, merge them with defaults.
    if ( typeof options == 'object' ) {
      options = $.extend( {}, $.fn.popover.defaults, options );
    }

    // Initialize the popover using the base twipsy initialization function.
    // This allows sharing logic between twipsy (tooltip) and popover.
    $.fn.twipsy.initWith.call( this, options, Popover, 'popover' );

    return this; // Return the jQuery object for chaining.

  }; // End of $.fn.popover plugin definition


  // Define default options for the popover plugin.
  // These are extended from twipsy's defaults.
  $.fn.popover.defaults = $.extend( {} , $.fn.twipsy.defaults, {
    content: 'data-content', // Default content source attribute
    placement: 'right'       // Default placement of the popover
  } ); // End of popover defaults

}( window.jQuery || window.ender ); // Pass jQuery or Ender.js to the IIFE