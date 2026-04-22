/*******************************************************************************
 * jQuery Approach Plugin - Type I Clone (Whitespace & Comments Modified)
 *
 * This version maintains exact functional equivalence to the original source.
 * Only whitespace (indentation, line breaks, spacing) and comments have been
 * altered to provide a visually distinct, yet structurally identical, code base.
 *
 * Original project: https://github.com/srobbin/jquery-approach/
 *
 * Copyright (c) 2009 Scott Robbin (srobbin.com)
 * Licensed under the MIT and GPL licenses.
 ******************************************************************************/


( function ( $ ) {


  // Extend jQuery's prototype to add the 'approach' method.
  $.fn.approach = function ( styles, distance, callback ) {

    // Define default settings for the animation.
    var settings = {
          "interval" : 50,    // Throttle for mousemove events (ms).
          "distance" : 400    // Minimum distance from object to start animation (pixels).
        };

    // Variable to store the timestamp of the last animation run, for throttling.
    var lastRun;

    // Array to hold all elements targeted by this approach instance.
    var elements = [];


    // Override default distance if provided by the user.
    if ( distance ) {
      $.extend( settings, { "distance": distance } );
    }


    // Iterate over each selected element to initialize approach data.
    this.each( function ( i, obj ) {

      // Array to store parsed style properties for the current object.
      var proxStyles = [];

      // List of CSS properties that are color-based and can be animated.
      var colorStyles = [
        'backgroundColor',
        'borderBottomColor',
        'borderLeftColor',
        'borderRightColor',
        'borderTopColor',
        'color',
        'outlineColor'
      ];


      // Process each style property provided for animation.
      $.each( styles, function ( style, val ) {

        var from,   // Starting value of the style.
            to,     // Target value of the style.
            unit;   // Unit of the style (e.g., 'px', 'em').

        // Check if the style is a color and jQuery UI Effects Core is available for color animation.
        if ( $.inArray( style, colorStyles ) > -1 && $.fx.step[ style ] ) {

          // For color properties, convert RGB strings to numerical arrays.
          from = { "number": getRGB( $( obj ).css( style ) ) };
          to   = { "number": getRGB( val ) };

        } else if ( style == "opacity" && !jQuery.support.opacity ) {

          // Special handling for opacity in IE, which uses 'filter' property.
          // This section addresses a known IE opacity bug and its fix.
          var opacity = $( obj ).css( "filter" ).match( /opacity=(\d+)/ ) ? RegExp.$1 / 100 : "";
          opacity     = opacity === "" ? "1" : opacity;

          from = getParts( opacity );
          to   = getParts( val );

        } else {

          // For other (non-color, non-IE-opacity) styles, parse out number and unit.
          // This parsing logic is derived from jQuery's internal animate function.
          from = getParts( $( obj ).css( style ) );
          to   = getParts( val );

        }


        // If both 'from' and 'to' values were successfully parsed.
        if ( from && to ) {

          // Handle relative animations (e.g., '+=10', '-=5').
          // Adjusts the 'to' number based on the 'relative' operator.
          if ( to.relative ) {
            to.number = ( ( to.relative == "-=" ? -1 : 1 ) * to.number ) + from.number;
          }

          // Assume units are consistent between 'from' and 'to' values.
          // TODO: Improve unit intelligence for more robust animations.
          unit = to.unit || "";

          // Store the parsed style data for later animation calculations.
          proxStyles.push( {
            "name":   style,
            "from":   from.number,
            "to":     to.number,
            "unit":   unit
          } );

        }

      } ); // End of $.each(styles)


      // Store the processed style data on the element using jQuery's data method.
      $( obj ).data( "jquery-approach", proxStyles );

      // Add the current element to the collection of elements to be animated.
      elements.push( obj );

    } ); // End of this.each


    // Attach a mousemove event listener to the document to trigger animations.
    $( document ).bind( "mousemove", function ( e ) {

      // Get current time to check against throttling interval.
      var thisRun = new Date().getTime();

      // If the time since the last run is less than the interval, skip this event.
      if ( thisRun - lastRun < settings.interval ) {
        return;
      }

      // Update the timestamp of the last successful run.
      lastRun = thisRun;


      // Iterate through each element that needs to be proxanimated.
      $.each( elements, function () {

          var self          = this;                         // Reference to the current element.
          var center        = getCenter( self );            // Center coordinates of the element.

          // Calculate the Euclidean distance between mouse position and element center.
          var distance      = parseInt( Math.sqrt( Math.pow( e.pageX - center.x, 2 ) + Math.pow( e.pageY - center.y, 2 ) ) );

          // Calculate a ratio based on the current distance relative to the settings.distance.
          // This ratio determines the interpolation between 'from' and 'to' styles.
          var distanceRatio = ( settings.distance - distance ) / settings.distance;

          var calcStyles    = {};                           // Object to hold calculated CSS styles for animation.


          // Iterate through the stored proxStyles for the current element.
          $.each( $( self ).data( "jquery-approach" ), function () {

            var style   = this;     // Current style object (name, from, to, unit).
            var calcVal;            // The calculated CSS value for the style.
            var color;              // Temporary variable for color calculations.


            // Differentiate calculation for color properties versus dimension-based properties.
            if ( $.isArray( style.to ) ) {

              // If it's a color, interpolate RGB components individually.
              color = ( distance > settings.distance )
                      ? style.from // If outside the animation distance, use the 'from' color.
                      : $.map( style.from, function ( v, k ) {
                          // Interpolate each RGB component.
                          return parseInt( ( distanceRatio * ( style.to[ k ] - style.from[ k ] ) ) + style.from[ k ] );
                        } );

              // Format the interpolated RGB array back into an 'rgb()' string.
              calcVal = "rgb(" + color.join( "," ) + ")";

            } else {

              // For non-color styles, perform a linear interpolation.
              calcVal = ( distance > settings.distance )
                        ? style.from // If outside the animation distance, use the 'from' value.
                        : ( distanceRatio * ( style.to - style.from ) ) + style.from;

              // Append the unit (e.g., 'px', '%') to the calculated value.
              calcVal += style.unit;

            }

            // Assign the calculated value to the style name in the calcStyles object.
            calcStyles[ style.name ] = calcVal;

          } ); // End of inner $.each (proxStyles)

          // Animate the element using the calculated styles.
          // The duration is set to slightly less than the interval to ensure smooth updates.
          $( self ).animate( calcStyles, settings.interval - 1 );

      } ); // End of outer $.each (elements)

    } ); // End of mousemove bind


    // --- Helper Functions ---

    /**
     * Calculates the center coordinates of a given jQuery object.
     * @param {HTMLElement} obj - The DOM element.
     * @returns {Object} An object with 'x' and 'y' properties for the center.
     */
    function getCenter ( obj ) {
      var offset = $( obj ).offset(); // Get the position of the element relative to the document.
      return {
        x: offset.left + ( $( obj ).width() / 2 ),  // X-coordinate of the center.
        y: offset.top  + ( $( obj ).height() / 2 )  // Y-coordinate of the center.
      };
    }


    /**
     * Parses a CSS value string into its numerical, relative, and unit components.
     * This function is adapted from jQuery's internal animation parsing logic.
     * @param {string} val - The CSS value string (e.g., "10px", "+=5em", "red").
     * @returns {Object} An object containing 'relative', 'number', and 'unit' properties.
     */
    function getParts ( val ) {
      // Regex to match optional relative operator, numerical value, and unit.
      var parts = val.toString().match( /^([+-]=)?([\d+-.]+)(.*)$/ );

      var relative; // Stores "+=" or "-=" if present.
      var number;   // Stores the parsed numerical value.
      var unit;     // Stores the unit (e.g., "px", "em", "%").

      if ( parts ) {
        relative = parts[ 1 ];             // The relative operator.
        number   = parseFloat( parts[ 2 ] ); // The numerical value.
        unit     = parts[ 3 ];             // The unit.
      }

      return {
        "relative": relative, // Indicates if it's a relative animation (e.g., "+=", "-=").
        "number":   number,   // The floating-point value of the style.
        "unit":     unit      // The unit of measurement (e.g., "px", "em", "").
      };
    }


    // Execute the optional callback function if provided.
    if ( callback ) {
      callback();
    }

    // Return the jQuery object for chaining.
    return this;

  }; // End of $.fn.approach definition.


  // --------------------------------------------------------------------------
  // The following functions (getRGB, colors object) are adapted from
  // jQuery UI Effects Core (http://jqueryui.com/).
  // These are crucial for handling color animations.
  // In future jQuery UI versions (1.8+), these might become publicly accessible.
  // Reference: http://dev.jqueryui.com/ticket/3806
  // If bundle size is a concern, and color animation isn't needed,
  // getRGB and the colors object can be removed.
  // --------------------------------------------------------------------------

  /**
   * Parses a color string into an RGB array [R, G, B].
   * Supports various color formats: rgb(), rgba(0,0,0,0), #hex, #hhh, named colors.
   * @param {string} color - The color string to parse.
   * @returns {Array} An array of three integers representing [R, G, B].
   */
  function getRGB ( color ) {
    var result; // Used to store regex match results.

    // If the color is already in [R,G,B] array format, return it directly.
    if ( color && color.constructor == Array && color.length == 3 ) {
      return color;
    }

    // Match 'rgb(num,num,num)' format.
    if ( result = /rgb\(\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*\)/.exec( color ) ) {
      return [ parseInt( result[ 1 ], 10 ), parseInt( result[ 2 ], 10 ), parseInt( result[ 3 ], 10 ) ];
    }

    // Match 'rgb(num%,num%,num%)' format.
    if ( result = /rgb\(\s*([0-9]+(?:\.[0-9]+)?)\%\s*,\s*([0-9]+(?:\.[0-9]+)?)\%\s*,\s*([0-9]+(?:\.[0-9]+)?)\%\s*\)/.exec( color ) ) {
      return [ parseFloat( result[ 1 ] ) * 2.55, parseFloat( result[ 2 ] ) * 2.55, parseFloat( result[ 3 ] ) * 2.55 ];
    }

    // Match '#aabbcc' hexadecimal format.
    if ( result = /#([a-fA-F0-9]{2})([a-fA-F0-9]{2})([a-fA-F0-9]{2})/.exec( color ) ) {
      return [ parseInt( result[ 1 ], 16 ), parseInt( result[ 2 ], 16 ), parseInt( result[ 3 ], 16 ) ];
    }

    // Match '#abc' shorthand hexadecimal format.
    if ( result = /#([a-fA-F0-9])([a-fA-F0-9])([a-fA-F0-9])/.exec( color ) ) {
      return [ parseInt( result[ 1 ] + result[ 1 ], 16 ), parseInt( result[ 2 ] + result[ 2 ], 16 ), parseInt( result[ 3 ] + result[ 3 ], 16 ) ];
    }

    // Match 'rgba(0, 0, 0, 0)' which Safari 3 uses for 'transparent'.
    if ( result = /rgba\(0, 0, 0, 0\)/.exec( color ) ) {
      return colors[ 'transparent' ];
    }

    // If none of the above, assume it's a named color and look it up in the 'colors' map.
    return colors[ $.trim( color ).toLowerCase() ];
  }


  /**
   * A lookup table for common named CSS colors and their RGB array equivalents.
   * This object is sourced from the Interface library by Stefan Petre (http://interface.eyecon.ro/).
   */
  var colors = {
    aqua:        [0,255,255],
    azure:       [240,255,255],
    beige:       [245,245,220],
    black:       [0,0,0],
    blue:        [0,0,255],
    brown:       [165,42,42],
    cyan:        [0,255,255],
    darkblue:    [0,0,139],
    darkcyan:    [0,139,139],
    darkgrey:    [169,169,169],
    darkgreen:   [0,100,0],
    darkkhaki:   [189,183,107],
    darkmagenta: [139,0,139],
    darkolivegreen:[85,107,47],
    darkorange:  [255,140,0],
    darkorchid:  [153,50,204],
    darkred:     [139,0,0],
    darksalmon:  [233,150,122],
    darkviolet:  [148,0,211],
    fuchsia:     [255,0,255],
    gold:        [255,215,0],
    green:       [0,128,0],
    indigo:      [75,0,130],
    khaki:       [240,230,140],
    lightblue:   [173,216,230],
    lightcyan:   [224,255,255],
    lightgreen:  [144,238,144],
    lightgrey:   [211,211,211],
    lightpink:   [255,182,193],
    lightyellow: [255,255,224],
    lime:        [0,255,0],
    magenta:     [255,0,255],
    maroon:      [128,0,0],
    navy:        [0,0,128],
    olive:       [128,128,0],
    orange:      [255,165,0],
    pink:        [255,192,203],
    purple:      [128,0,128],
    violet:      [128,0,128],
    red:         [255,0,0],
    silver:      [192,192,192],
    white:       [255,255,255],
    yellow:      [255,255,0],
    transparent: [255,255,255] // Transparent is treated as white for animation purposes here.
  };

  // --- End of jQuery UI Effects Core adapted code ---


} )( jQuery ); // Immediately-invoked function expression (IIFE) to encapsulate the plugin.