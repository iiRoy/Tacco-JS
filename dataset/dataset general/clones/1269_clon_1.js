( function ( $ ) {
  // This is a plugin definition block for jQuery.
  // It extends the jQuery object itself with a 'placeholder' utility.

  /*
   * The 'placeholder' object contains methods related to
   * browser placeholder support and shim functionality.
   */
  $.extend( $, {
    placeholder: {

      // --- browser_supported method ---
      /*
       * Determines if the current browser natively supports the 'placeholder' attribute.
       * This function caches its result to avoid redundant DOM checks.
       */
      browser_supported: function ( )
      {
        // Check if the support status has already been computed and stored.
        return this._supported !== undefined
               ?
                  this._supported // If cached, return the cached boolean value.
               :
                  // If not cached, perform the check and store the result.
                  // We create a dummy input element and check for 'placeholder' in its properties.
                  ( this._supported = !!( 'placeholder' in $( '<input type="text">' )[ 0 ] ) );
      }, // End of browser_supported function.


      // --- shim method ---
      /*
       * Applies the placeholder shim to elements that lack native placeholder support.
       * @param {Object} opts - Optional configuration settings for the shim.
       */
      shim: function ( opts )
      {
        // Default configuration options for the placeholder shim.
        var config = {
          color:    '#888', // Default color for the placeholder text.
          cls:      'placeholder', // Default CSS class to apply to the placeholder label.
          selector: 'input[placeholder], textarea[placeholder]', // CSS selector for target elements.
          align:    'left' // Text alignment for the placeholder.
        };

        // Merge user-provided options with the default configuration.
        $.extend( config, opts );

        // If the browser does NOT natively support placeholders,
        // then apply the shim to the selected elements.
        !this.browser_supported( )
          && $( config.selector )._placeholder_shim( config );

      } // End of shim function.

    } // End of placeholder object.
  } ); // End of $.extend for placeholder.


  // Extend jQuery's prototype (fn) with a new method.
  // This method will be available on jQuery collections.
  $.extend( $.fn, {

    // --- _placeholder_shim method ---
    /*
     * The internal method to apply the placeholder shim to a collection of elements.
     * This method is intended for internal use by the plugin.
     * @param {Object} config - The configuration object for the shim.
     */
    _placeholder_shim: function ( config )
    {

      // --- calcPositionCss helper function ---
      /*
       * Calculates the CSS properties for positioning the placeholder label.
       * It ensures the label aligns perfectly with its target input/textarea.
       * @param {HTMLElement} target - The DOM element (input or textarea) to position against.
       * @returns {Object} An object containing 'top', 'left', and 'width' CSS values.
       */
      function calcPositionCss ( target )
      {
        var op = $( target ) . offsetParent ( ) . offset ( ); // Offset of the target's offset parent.
        var ot = $( target ) . offset ( ); // Offset of the target element itself.

        return {
          top:   ot.top  - op.top,    // Calculate top position relative to offset parent.
          left:  ot.left - op.left,   // Calculate left position relative to offset parent.
          width: $( target ).outerWidth( true ) // Get outer width including margin.
        };
      } // End of calcPositionCss helper.


      // Iterate over each matched element in the jQuery collection.
      return this.each( function ( ) {

        var $this = $( this ); // Cache the current element as a jQuery object.

        // Check if a placeholder label has already been created for this element.
        if ( $this.data( 'placeholder' ) ) {
          var $ol = $this.data( 'placeholder' ); // Retrieve the existing label.
          $ol.css( calcPositionCss( $this ) ); // Update its position in case of resize/reposition.
          return true; // Continue to the next element.
        }

        // Initialize an object for potential line-height and white-space CSS properties.
        var possible_line_height = { };

        // If the element is not a textarea and has a fixed height,
        // apply specific line-height and white-space styles.
        if ( !$this.is( 'textarea' ) && $this.css( 'height' ) != 'auto' ) {
          possible_line_height = {
            lineHeight: $this.css( 'height' ), // Match line-height to element height.
            whiteSpace: 'nowrap'               // Prevent text wrapping.
          };
        }

        // --- Create and configure the placeholder label ---
        var ol = $( '<label />' ) // Start with a new label element.
          .text( $this.attr( 'placeholder' ) ) // Set the label's text from the target's 'placeholder' attribute.
          .addClass( config.cls ) // Add the configured CSS class for styling.
          .css(
            $.extend(
              {
                position:        'absolute',          // Make the label absolutely positioned.
                display:         'inline',            // Display as an inline element.
                'float':         'none',              // Ensure no floating behavior.
                overflow:        'hidden',            // Hide any text that overflows.
                textAlign:       config.align,        // Apply configured text alignment.
                color:           config.color,        // Apply configured text color.
                cursor:          'text',              // Set cursor to 'text' to indicate clickability.
                paddingTop:      $this.css( 'padding-top' ),      // Match target's top padding.
                paddingRight:    $this.css( 'padding-right' ),    // Match target's right padding.
                paddingBottom:   $this.css( 'padding-bottom' ),   // Match target's bottom padding.
                paddingLeft:     $this.css( 'padding-left' ),     // Match target's left padding.
                fontSize:        $this.css( 'font-size' ),        // Match target's font size.
                fontFamily:      $this.css( 'font-family' ),      // Match target's font family.
                fontStyle:       $this.css( 'font-style' ),       // Match target's font style.
                fontWeight:      $this.css( 'font-weight' ),      // Match target's font weight.
                textTransform:   $this.css( 'text-transform' ),   // Match target's text transform.
                backgroundColor: 'transparent',       // Ensure the label background is transparent.
                zIndex:          99                   // Bring the label to the front.
              },
              possible_line_height // Merge in line-height and white-space if applicable.
            )
          )
          .css( calcPositionCss( this ) ) // Apply calculated positioning based on the target.
          .attr( 'for', this.id ) // Associate the label with the target input using its ID.
          .data( 'target', $this ) // Store a reference to the target jQuery object on the label.
          .click( function ( ) {
            // When the label is clicked, focus on its associated target input.
            $( this ) . data ( 'target' ) . focus ( );
          } )
          .insertBefore( this ); // Insert the newly created label element directly before the target.


        // --- Configure target element event handlers ---
        $this
          .data( 'placeholder', ol ) // Store a reference to the label on the target element.
          .focus( function ( ) {
            // When the target gains focus, hide the placeholder label.
            ol.hide( );
          } )
          .blur( function ( ) {
            // When the target loses focus, show the label if the input is empty, otherwise hide it.
            ol[ $this.val( ).length ? 'hide' : 'show' ]( );
          } )
          .triggerHandler( 'blur' ); // Trigger blur once to set initial visibility of the placeholder.


        // --- Window resize handler ---
        $( window )
          .resize( function ( ) {
            // When the window is resized, recalculate and update the label's position.
            var $target = ol.data( 'target' ); // Get the target element the label is associated with.
            ol.css( calcPositionCss( $target ) ); // Update the label's CSS position.
          } );

      } ); // End of this.each loop.

    } // End of _placeholder_shim function.

  } ); // End of $.extend for $.fn.

} )( jQuery ); // End of the IIFE, passing jQuery as $.


// --- Global initialization ---
/*
 * Bind the placeholder shim initialization to 'ready' and 'load' events.
 * This ensures the shim is applied correctly even if content loads dynamically.
 */
jQuery( document )
  .add( window ) // Also include the window object for load events.
  .bind( 'ready load', function ( ) {
    // Check if the placeholder plugin is available.
    if ( jQuery.placeholder ) {
      // If available, initialize the shim.
      jQuery.placeholder.shim( );
    }
  } ); // End of global event binding.