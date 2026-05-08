/*
 * This is a Type I clone of the original JavaScript code.
 * It maintains exact structural and logical equivalence.
 * Only whitespace and comments have been altered significantly
 * to create a visually distinct, yet functionally identical file.
 */
"use strict";

( function( $,    window, document, undefined )
{
  // Define the plugin's name.
  var pluginName = "emailautocomplete";

  // Default options for the plugin.
  var defaults = {
    suggClass : "eac-sugg", // CSS class for the suggestion overlay.

    // List of common email domains for autocompletion.
    domains   : [
      "yahoo.com",
      "hotmail.com",
      "gmail.com",
      "me.com",
      "aol.com",
      "mac.com",
      "live.com",
      "comcast.net",
      "googlemail.com",
      "msn.com",
      "hotmail.co.uk",
      "yahoo.co.uk",
      "facebook.com",
      "verizon.net",
      "sbcglobal.net",
      "att.net",
      "gmx.com",
      "outlook.com",
      "icloud.com"
    ]
  };

  /**
   * Plugin constructor function.
   * @param {HTMLElement} elem    The DOM element the plugin is initialized on.
   * @param {Object}      options User-provided options to override defaults.
   */
  function Plugin( elem, options )
  {
    // Store the jQuery-wrapped field element.
    this.$field = $( elem );

    // Merge default options with user-provided options.
    // A deep extend is used to ensure nested objects are merged correctly.
    this.options = $.extend( true, { }, defaults, options );

    // Keep a reference to the original defaults.
    this._defaults = defaults;

    // Store the domains list from the options.
    this._domains = this.options.domains;

    // Initialize the plugin.
    this.init( );
  }

  // Define methods for the Plugin prototype.
  Plugin.prototype = {

    /**
     * Initializes the plugin by setting up necessary elements and event listeners.
     */
    init: function ( ) {

      // Apply indexOf polyfill if not natively available in Array.prototype.
      if ( !Array.prototype.indexOf ) {
        this.doIndexOf( ); // Call the polyfill method.
      }


      // Calculate the left offset for the input field.
      // This accounts for padding and border to correctly position the suggestion.
      this.fieldLeftOffset = ( this.$field.outerWidth( true ) - this.$field.width( ) ) / 2;


      // Wrap the input field with a new div for styling and positioning.
      var $wrap = $( "<div class='eac-input-wrap' />" ).css( {
        display   : this.$field.css( "display" ),    // Inherit display property.
        position  : "relative",                       // Needed for absolute positioning of children.
        fontSize  : this.$field.css( "fontSize" )     // Inherit font size.
      } );
      this.$field.wrap( $wrap ); // Perform the wrapping action.


      // Create a hidden span to measure the width of the current input value.
      // This helps in positioning the suggestion accurately.
      this.$cval = $( "<span class='eac-cval' />" ).css( {
        visibility  : "hidden",       // Make it invisible.
        position    : "absolute",     // Position absolutely to not affect layout.
        display     : "inline-block", // Allows width measurement.
        fontFamily  : this.$field.css( "fontFamily" ),
        fontWeight  : this.$field.css( "fontWeight" ),
        letterSpacing : this.$field.css( "letterSpacing" )
      } ).insertAfter( this.$field ); // Insert the span right after the input field.


      // Create the suggestion overlay element.
      // It will display the suggested completion text.
      // Calculate vertical padding/border to match input field.
      var heightPad = ( this.$field.outerHeight( true ) - this.$field.height( ) ) / 2;
      this.$suggOverlay = $( "<span class='" + this.options.suggClass + "' />" ).css( {
        display       : "block",              // Make it a block element.
        "box-sizing"  : "content-box",        // Standardize box model.
        lineHeight    : this.$field.css( 'lineHeight' ),
        paddingTop    : heightPad + "px",     // Match input padding.
        paddingBottom : heightPad + "px",     // Match input padding.
        fontFamily    : this.$field.css( "fontFamily" ),
        fontWeight    : this.$field.css( "fontWeight" ),
        letterSpacing : this.$field.css( "letterSpacing" ),
        position      : "absolute",           // Position absolutely within the wrapper.
        top           : 0,                    // Align to the top of the input.
        left          : 0                     // Align to the left of the input.
      } ).insertAfter( this.$field ); // Insert after the input field.


      // Bind event listeners to the input field and suggestion overlay.

      // Keyup event to display suggestions.
      this.$field.on( "keyup.eac", $.proxy( this.displaySuggestion, this ) );

      // Keydown event for handling tab (9) and right arrow (39) keys for autocompletion.
      this.$field.on( "keydown.eac", $.proxy( function( e ) {
        if ( e.which === 39 || e.which === 9 ) { // Right arrow or Tab key.
          this.autocomplete( ); // Trigger autocompletion.
        }
      }, this ) );

      // Mousedown/touchstart event on the suggestion overlay to trigger autocompletion.
      this.$suggOverlay.on( "mousedown.eac touchstart.eac", $.proxy( this.autocomplete, this ) );
    },

    /**
     * Generates an email domain suggestion based on the current input string.
     * @param   {string} str The current value of the input field.
     * @returns {string} The suggested domain part, or an empty string if no match.
     */
    suggest: function ( str ) {
      // Split the input string by "@" to separate local part and domain part.
      var str_arr = str.split( "@" );

      if ( str_arr.length > 1 ) {
        str = str_arr.pop( ); // Get the potential domain part.
        if ( !str.length ) {
          return ""; // If domain part is empty, no suggestion.
        }
      } else {
        return ""; // No "@" symbol, no domain part to suggest.
      }

      // Filter domains that start with the current domain part,
      // take the first match, and remove the already typed part.
      var match = this._domains.filter( function ( domain ) {
        return 0 === domain.indexOf( str ); // Check if domain starts with 'str'.
      } ).shift( ) || ""; // Get the first matching domain, or empty string if no match.

      // Return the remaining part of the domain as the suggestion.
      return match.replace( str, "" );
    },

    /**
     * Completes the input field with the current suggestion.
     */
    autocomplete: function ( ) {
      // Check if a valid suggestion exists.
      if ( typeof this.suggestion === "undefined" || this.suggestion.length < 1 ) {
        return false; // No suggestion to autocomplete.
      }

      // Update the input field with the full completed email.
      this.$field.val( this.val + this.suggestion );

      // Clear the suggestion overlay and the hidden value measurement span.
      this.$suggOverlay.text( "" );
      this.$cval.text( "" );
    },

    /**
     * Displays the email domain suggestion.
     * This method is a handler for the input field's keyup event.
     * @param {Event} e The keyup event object.
     */
    displaySuggestion: function ( e ) {
      // Store the current value of the input field.
      this.val = this.$field.val( );

      // Get the suggestion based on the current value.
      this.suggestion = this.suggest( this.val );

      // If there's no suggestion, clear the overlay.
      if ( !this.suggestion.length ) {
        this.$suggOverlay.text( "" );
      } else {
        // If there is a suggestion, prevent default event action (e.g., Tab key behavior).
        e.preventDefault( );
      }

      // Update the suggestion overlay with the new suggestion.
      this.$suggOverlay.text( this.suggestion );

      // Update the hidden span with the current input value for width measurement.
      this.$cval.text( this.val );

      // Measure the width of the current input value.
      var cvalWidth = this.$cval.width( );

      // If the input field's total width is greater than the measured value width,
      // adjust the suggestion overlay's left position.
      if ( this.$field.outerWidth( ) > cvalWidth ) {
        // Position the suggestion to start right after the typed text.
        this.$suggOverlay.css( 'left', this.fieldLeftOffset + cvalWidth + "px" );
      }
    },

    /**
     * Provides an indexOf polyfill for Array.prototype.
     * This ensures compatibility with older browsers that might not support Array.prototype.indexOf.
     * Source: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/indexOf#Polyfill
     */
    doIndexOf: function( ) {

        Array.prototype.indexOf = function ( searchElement, fromIndex ) {
          // Check if 'this' (the array) is null or undefined.
          if ( this === undefined || this === null ) {
            throw new TypeError( '"this" is null or not defined' );
          }

          // Convert object.length to a UInt32 (unsigned 32-bit integer).
          var length = this.length >>> 0;

          // Ensure fromIndex is a number or default to 0.
          fromIndex = +fromIndex || 0;

          // Handle Infinity for fromIndex.
          if ( Math.abs( fromIndex ) === Infinity ) {
            fromIndex = 0;
          }

          // Adjust fromIndex if it's negative.
          if ( fromIndex < 0 ) {
            fromIndex += length; // Count from the end of the array.
            if ( fromIndex < 0 ) {
              fromIndex = 0; // Ensure it doesn't go below 0.
            }
          }

          // Iterate through the array starting from fromIndex.
          for ( ; fromIndex < length; fromIndex++ ) {
            // If the element is found, return its index.
            if ( this[ fromIndex ] === searchElement ) {
              return fromIndex;
            }
          }

          // If the element is not found, return -1.
          return -1;
        };
      }
  };

  // jQuery plugin definition.
  // Makes the plugin available via $.fn.emailautocomplete.
  $.fn[ pluginName ] = function ( options ) {
    return this.each( function ( ) {
      // Prevent multiple instantiations on the same element.
      if ( !$.data( this, "yz_" + pluginName ) ) {
        // Store plugin instance in jQuery's data cache.
        $.data( this, "yz_" + pluginName, new Plugin( this, options ) );
      }
    } );
  };

} )( jQuery, window, document ); // Execute the IIFE with jQuery, window, and document.