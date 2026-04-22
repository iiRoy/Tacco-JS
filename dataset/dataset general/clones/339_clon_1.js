/*
 *   ===========================================================
 *   bootstrap-popover.js v1.3.0 - A JavaScript Popover Plugin
 *   ===========================================================
 *   Project Homepage: http://twitter.github.com/bootstrap/javascript.html#popover
 *
 *   Copyright (c) 2011 Twitter, Inc.
 *
 *   Licensed under the Apache License, Version 2.0 (the "License");
 *   you may not use this file except in compliance with the License.
 *   You may obtain a copy of the License at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 *   ===========================================================
 */


( function( $ ) {

  var Popover = function ( element, options ) {

    this.$element = $( element ); // Store the jQuery element
    this.options = options;       // Store the options object
    this.enabled = true;          // Popover is enabled by default
    this.fixTitle();              // Ensure title is available

  }; // End of Popover constructor

  /*
   * NOTE: POPOVER EXTENDS BOOTSTRAP-TWIPSY.js
   * This popover implementation builds upon the Twipsy (tooltip) base.
   * =========================================
   */

  Popover.prototype = $.extend( { } , $.fn.twipsy.Twipsy.prototype, {

    // Method to set the content of the popover's tip
    setContent: function () {

      var $tip = this.tip(); // Get the popover tip element

      // Set the title content, using html or text based on options
      $tip.find( '.title' ) [ this.options.html ? 'html' : 'text' ] ( this.getTitle() );

      // Set the main content paragraph, using html or text based on options
      $tip.find( '.content p' ) [ this.options.html ? 'html' : 'text' ] ( this.getContent() );

      // Ensure the tip's class name is 'popover'
      $tip[0].className = 'popover';

    } , // End setContent method

    // Method to retrieve the content for the popover
    getContent: function () {

      var contentvar; // This variable is declared but not used in the original.
      var $e = this.$element;
      var o = this.options;
      var content; // This variable holds the actual content.

      // Check if content is a string (e.g., a data attribute name)
      if ( typeof this.options.content == 'string' ) {

        content = $e.attr( o.content );

      }
      // Check if content is a function
      else if ( typeof this.options.content == 'function' ) {

        content = this.options.content.call( this.$element[0] );

      }

      return content; // Return the determined content

    } , // End getContent method

    // Method to get or create the popover tip element
    tip: function() {

      // If the tip hasn't been created yet
      if ( !this.$tip ) {

        // Create the popover structure
        this.$tip = $( '<div class="popover" />' )
          .html( '<div class="arrow"></div><div class="inner"><h3 class="title"></h3><div class="content"><p></p></div></div>' );

      }

      return this.$tip; // Return the popover tip element

    }

  } ); // End Popover.prototype extension

  /*
   * POPOVER PLUGIN DEFINITION
   * =======================
   * This section defines the jQuery plugin interface for Popover.
   */

  $.fn.popover = function ( options ) {

    // If options is an object, merge with defaults
    if ( typeof options == 'object' ) {

      options = $.extend( { } , $.fn.popover.defaults, options );

    }

    // Initialize the popover using twipsy's initialization method
    $.fn.twipsy.initWith.call( this, options, Popover, 'popover' );

    return this; // Allow for chaining

  }; // End $.fn.popover

  // Default options for the popover plugin
  $.fn.popover.defaults = $.extend( { } , $.fn.twipsy.defaults, {
    content: 'data-content', // Default content source
    placement: 'right'       // Default placement of the popover
  } );

} ) ( window.jQuery || window.ender ); // Pass jQuery or Ender into the IIFE