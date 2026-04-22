DrawingBoard.Control.Color=DrawingBoard.Control.extend(
 {
  // Define the name of this control type
  name : 'colors',

  /**
   * Initializes the color control.
   * Sets up the template and registers event handlers for color selection.
   */
  initialize : function() {
   /* Call the template initialization method */
   this.initTemplate( );

   /* Store 'this' context for use in event handlers */
   var that = this;

   // Attach click handler for individual color picker buttons
   this.$el.on(
    'click',
    '.drawing-board-control-colors-picker',
    function( e ) {
     // Get the selected color from the data attribute
     var color = $( this ).attr( 'data-color' );

     // Set the board's current color
     that.board.setColor( color );

     // Update the display of the currently selected color
     that.$el.find( '.drawing-board-control-colors-current' )
      .css( 'background-color', color )
      .attr( 'data-color', color );

     // Trigger a custom event indicating color change
     that.board.ev.trigger( 'color:changed', color );

     // Hide the rainbow color palette after selection
     that.$el.find( '.drawing-board-control-colors-rainbows' ).addClass( 'drawing-board-utils-hidden' );

     // Prevent default event behavior
     e.preventDefault( );
    }
   );

   // Attach click handler for the current color display button
   this.$el.on(
    'click',
    '.drawing-board-control-colors-current',
    function( e ) {
     // Toggle the visibility of the rainbow color palette
     that.$el.find( '.drawing-board-control-colors-rainbows' ).toggleClass( 'drawing-board-utils-hidden' );

     // Prevent default event behavior
     e.preventDefault( );
    }
   );

   // Attach a global click handler to hide the color palette when clicking outside
   $( 'body' ).on(
    'click',
    function( e ) {
     // Determine the target of the click
     var $target = $( e.target );

     // Check if the clicked element is the current color button or a descendant
     var $relatedButton = $target.hasClass( 'drawing-board-control-colors-current' )
      ? $target
      : $target.closest( '.drawing-board-control-colors-current' );

     // Reference to our control's current color button
     var $myButton = that.$el.find( '.drawing-board-control-colors-current' );

     // Reference to the color palette popup
     var $popup = that.$el.find( '.drawing-board-control-colors-rainbows' );

     // If clicked outside the button and outside the popup, and the popup is visible, hide it
     if (
      ( !$relatedButton.length || $relatedButton.get( 0 ) !== $myButton.get( 0 ) ) &&
      !$popup.hasClass( 'drawing-board-utils-hidden' )
     ) {
      $popup.addClass( 'drawing-board-utils-hidden' );
     }
    }
   );
  },

  /**
   * Initializes the HTML template for the color control.
   * Generates the color palette based on HSL values.
   */
  initTemplate : function() {
   // Main template structure for the color control
   var tpl = '<div class="drawing-board-control-inner">' +
    '<div class="drawing-board-control-colors-current" style="background-color: {{color}}" data-color="{{color}}"></div>' +
    '<div class="drawing-board-control-colors-rainbows">{{rainbows}}</div>' +
    '</div>';

   // Template for a single color picker square
   var oneColorTpl = '<div class="drawing-board-control-colors-picker" data-color="{{color}}" style="background-color: {{color}}"></div>';

   // Variable to accumulate HTML for the rainbow color rows
   var rainbows = '';

   // Iterate through different lightness values for the color palette
   $.each( [ 0.75, 0.5, 0.25 ], $.proxy( function( key, val ) {
    var i = 0; // Initialize hue counter
    var additionalColor = null; // Placeholder for achromatic colors

    // Start a new rainbow row
    rainbows += '<div class="drawing-board-control-colors-rainbow">';

    // Add achromatic colors based on lightness value
    if ( val == 0.25 ) additionalColor = this._rgba( 0, 0, 0, 1 ); // Black
    if ( val == 0.5 ) additionalColor = this._rgba( 150, 150, 150, 1 ); // Gray
    if ( val == 0.75 ) additionalColor = this._rgba( 255, 255, 255, 1 ); // White

    // Append the achromatic color to the current row
    rainbows += DrawingBoard.Utils.tpl( oneColorTpl, { color : additionalColor.toString( ) } );

    // Generate colors across the hue spectrum for the current lightness (val)
    while ( i <= 330 ) {
     rainbows += DrawingBoard.Utils.tpl( oneColorTpl, { color : this._hsl2Rgba( this._hsl( i - 60, 1, val ) ).toString( ) } );
     i += 30; // Increment hue by 30 degrees
    }

    // Close the current rainbow row
    rainbows += '</div>';
   }, this ) ); // Ensure 'this' context is maintained for _rgba and _hsl2Rgba calls

   // Append the generated template with initial color and rainbows to the control's element
   this.$el.append( $( DrawingBoard.Utils.tpl( tpl, { color : this.board.color, rainbows : rainbows } ) ) );

   // Initially hide the rainbow color palette
   this.$el.find( '.drawing-board-control-colors-rainbows' ).addClass( 'drawing-board-utils-hidden' );
  },

  /**
   * Callback function executed when the drawing board is reset.
   * Ensures the board's color is set to the control's currently selected color.
   * @param {Object} opts - Options passed during the reset.
   */
  onBoardReset : function( opts ) {
   this.board.setColor( this.$el.find( '.drawing-board-control-colors-current' ).attr( 'data-color' ) );
  },

  /**
   * Creates an RGBA color object.
   * @param {number} r - Red component (0-255).
   * @param {number} g - Green component (0-255).
   * @param {number} b - Blue component (0-255).
   * @param {number} a - Alpha component (0-1).
   * @returns {Object} An object with r, g, b, a properties and a toString method.
   */
  _rgba : function( r, g, b, a ) {
   return {
    r : r,
    g : g,
    b : b,
    a : a,
    toString : function( ) {
     return "rgba(" + r + ", " + g + ", " + b + ", " + a + ")";
    }
   };
  },

  /**
   * Creates an HSL color object.
   * @param {number} h - Hue component (0-360).
   * @param {number} s - Saturation component (0-1).
   * @param {number} l - Lightness component (0-1).
   * @returns {Object} An object with h, s, l properties and a toString method.
   */
  _hsl : function( h, s, l ) {
   return {
    h : h,
    s : s,
    l : l,
    toString : function( ) {
     return "hsl(" + h + ", " + s * 100 + "%, " + l * 100 + "%)";
    }
   };
  },

  /**
   * Converts a hexadecimal color string to an RGBA object.
   * @param {string} hex - The hexadecimal color string (e.g., "#RRGGBB").
   * @returns {Object} An RGBA color object.
   */
  _hex2Rgba : function( hex ) {
   var num = parseInt( hex.substring( 1 ), 16 );
   return this._rgba( num >> 16, num >> 8 & 255, num & 255, 1 );
  },

  /**
   * Converts an HSL color object to an RGBA color object.
   * Conversion function (modified a bit) taken from http://mjijackson.com/2008/02/rgb-to-hsl-and-rgb-to-hsv-color-model-conversion-algorithms-in-javascript
   * @param {Object} hsl - An HSL color object { h, s, l }.
   * @returns {Object} An RGBA color object.
   */
  _hsl2Rgba : function( hsl ) {
   // Extract HSL components and initialize RGB variables
   var h = hsl.h / 360,
    s = hsl.s,
    l = hsl.l,
    r,
    g,
    b;

   /**
    * Helper function for hue-to-RGB conversion.
    * @param {number} p
    * @param {number} q
    * @param {number} t
    * @returns {number}
    */
   function hue2rgb( p, q, t ) {
    if ( t < 0 ) t += 1;
    if ( t > 1 ) t -= 1;
    if ( t < 1 / 6 ) return p + ( q - p ) * 6 * t;
    if ( t < 1 / 2 ) return q;
    if ( t < 2 / 3 ) return p + ( q - p ) * ( 2 / 3 - t ) * 6;
    return p;
   }

   if ( s === 0 ) {
    r = g = b = l; // achromatic (gray)
   } else {
    var q = l < 0.5
     ? l * ( 1 + s )
     : l + s - l * s;
    var p = 2 * l - q;
    r = Math.floor( ( hue2rgb( p, q, h + 1 / 3 ) ) * 255 );
    g = Math.floor( ( hue2rgb( p, q, h ) ) * 255 );
    b = Math.floor( ( hue2rgb( p, q, h - 1 / 3 ) ) * 255 );
   }

   // Return the converted RGBA color with alpha 1
   return this._rgba( r, g, b, 1 );
  }
} );