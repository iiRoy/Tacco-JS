/**
 *  This file is part of the g.Raphael charting library,
 *  version 0.4. It is built upon the Raphaël JavaScript vector
 *  graphics library.
 *
 *  @author Dmitry Baranovskiy (http://g.raphaeljs.com)
 *  @copyright 2009 Dmitry Baranovskiy
 *  @license MIT License - http://www.opensource.org/licenses/mit-license.php
 *
 *  This module provides functionality for creating line charts.
 */
Raphael.fn.g.linechart = function ( x, y, width, height, valuesx, valuesy, opts )
{

  /**
   * Helper function to shrink an array of values to fit a given dimension.
   * This is used to downsample data points if there are too many for the chart width.
   *
   * @param {Array<number>} values - The array of numerical values to shrink.
   * @param {number} dim - The target dimension (e.g., width in pixels) to fit.
   * @returns {Array<number>} The shrunk array of values.
   */
  function shrink( values, dim )
  {
    var k = values.length / dim, // Calculate the ratio for shrinking
        j = 0,                   // Index for the original values array
        l = k,                   // Accumulator for the ratio, decreases with each step
        sum = 0,                 // Sum for averaging
        res = [];                // Resulting array of shrunk values

    // Iterate through the original values
    while ( j < values.length )
    {
      l--; // Decrement the ratio accumulator

      // If accumulator falls below zero, it means we've gathered enough values
      // to form a new point in the shrunk array.
      if ( l < 0 )
      {
        sum += values[ j ] * ( 1 + l ); // Add a weighted portion of the current value
        res.push( sum / k );           // Push the average of the accumulated sum
        sum = values[ j++ ] * -l;      // Reset sum with the remaining weighted portion of the current value
        l += k;                        // Reset accumulator for the next segment
      }
      // If accumulator is still positive, just keep summing values
      else
      {
        sum += values[ j++ ];
      }
    }

    return res;
  }


  opts = opts || {}; // Ensure opts is an object, even if not provided.

  // Normalize valuesx to be an array of arrays if it's not already.
  // This supports both single series and multiple series input formats.
  if ( !this.raphael.is( valuesx[ 0 ], "array" ) )
  {
    valuesx = [ valuesx ];
  }


  // Normalize valuesy similarly.
  if ( !this.raphael.is( valuesy[ 0 ], "array" ) )
  {
    valuesy = [ valuesy ];
  }


  // Flatten all x-values into a single array to find overall min/max.
  var allx = Array.prototype.concat.apply( [], valuesx );

  // Flatten all y-values into a single array to find overall min/max.
  var ally = Array.prototype.concat.apply( [], valuesy );


  // Determine the x-axis domain using g.snapEnds for nice intervals.
  var xdim = this.g.snapEnds( Math.min.apply( Math, allx ), Math.max.apply( Math, allx ), valuesx[ 0 ].length - 1 );
  var minx = xdim.from; // The calculated minimum x-value for the axis.
  var maxx = xdim.to;   // The calculated maximum x-value for the axis.


  var gutter = opts.gutter || 10; // Padding around the chart area.


  // Calculate the x-axis scaling factor (pixels per unit of x-value).
  var kx = ( width - gutter * 2 ) / ( maxx - minx );


  // Determine the y-axis domain using g.snapEnds for nice intervals.
  var ydim = this.g.snapEnds( Math.min.apply( Math, ally ), Math.max.apply( Math, ally ), valuesy[ 0 ].length - 1 );
  var miny = ydim.from; // The calculated minimum y-value for the axis.
  var maxy = ydim.to;   // The calculated maximum y-value for the axis.


  // Calculate the y-axis scaling factor (pixels per unit of y-value).
  var ky = ( height - gutter * 2 ) / ( maxy - miny );


  // Determine the maximum length among the first x and y value series.
  var len = Math.max( valuesx[ 0 ].length, valuesy[ 0 ].length );


  var symbol = opts.symbol || ""; // Symbol type for data points, if any.
  var colors = opts.colors || Raphael.fn.g.colors; // Colors for the lines/shades.


  var that = this; // Store 'this' context for inner functions.


  var columns = null; // Placeholder for interactive column elements.
  var dots = null;    // Placeholder for interactive dot elements.


  var chart = this.set(); // Raphael set to hold all chart elements.


  var path = []; // Temporary array to build SVG path commands.


  // Re-evaluate maximum length across all y-value series for accurate rendering.
  for ( var i = 0, ii = valuesy.length; i < ii; i++ )
  {
    len = Math.max( len, valuesy[ i ].length );
  }


  var shades = this.set(); // Raphael set for shaded areas under lines.


  // Process each data series for shading and downsampling.
  for ( var i = 0, ii = valuesy.length; i < ii; i++ )
  {
    // If shading is enabled, create a path element for the shade.
    if ( opts.shade )
    {
      shades.push( this.path().attr( {
          stroke : "none",
          fill   : colors[ i ],
          opacity: opts.nostroke ? 1 : .3 // Full opacity if no stroke, otherwise partial.
      } ) );
    }

    // Downsample y-values if they exceed the available chart width.
    if ( valuesy[ i ].length > width - 2 * gutter )
    {
      valuesy[ i ] = shrink( valuesy[ i ], width - 2 * gutter );
      len = width - 2 * gutter; // Update max length based on shrunk data.
    }

    // Downsample x-values if they exist and exceed the available chart width.
    if ( valuesx[ i ] && valuesx[ i ].length > width - 2 * gutter )
    {
      valuesx[ i ] = shrink( valuesx[ i ], width - 2 * gutter );
    }
  }


  var axis = this.set(); // Raphael set for axis elements.


  // Render axes if specified in options.
  if ( opts.axis )
  {
    // Parse axis options string (e.g., "0 0 1 1" for left, top, right, bottom).
    var ax = ( opts.axis + "" ).split( /[,\s]+/ );

    // Draw left axis.
    +ax[ 0 ] && axis.push( this.g.axis( x + gutter, y + gutter, width - 2 * gutter, minx, maxx, opts.axisxstep || Math.floor( ( width - 2 * gutter ) / 20 ), 2 ) );

    // Draw top axis.
    +ax[ 1 ] && axis.push( this.g.axis( x + width - gutter, y + height - gutter, height - 2 * gutter, miny, maxy, opts.axisystep || Math.floor( ( height - 2 * gutter ) / 20 ), 3 ) );

    // Draw right axis.
    +ax[ 2 ] && axis.push( this.g.axis( x + gutter, y + height - gutter, width - 2 * gutter, minx, maxx, opts.axisxstep || Math.floor( ( width - 2 * gutter ) / 20 ), 0 ) );

    // Draw bottom axis.
    +ax[ 3 ] && axis.push( this.g.axis( x + gutter, y + height - gutter, height - 2 * gutter, miny, maxy, opts.axisystep || Math.floor( ( height - 2 * gutter ) / 20 ), 1 ) );
  }


  var lines = this.set();   // Raphael set for the actual line paths.
  var symbols = this.set(); // Raphael set for data point symbols.
  var line;                 // Reference to the current line path being drawn.


  // Iterate through each data series to draw lines, symbols, and shades.
  for ( var i = 0, ii = valuesy.length; i < ii; i++ )
  {
    // If 'nostroke' option is not set, draw the line.
    if ( !opts.nostroke )
    {
      lines.push( line = this.path().attr( {
          stroke         : colors[ i ],                      // Line color from the palette.
          "stroke-width" : opts.width || 2,                  // Line thickness.
          "stroke-linejoin": "round",                        // Rounded corners for joins.
          "stroke-linecap" : "round",                       // Rounded ends for lines.
          "stroke-dasharray": opts.dash || ""               // Dash pattern if specified.
      } ) );
    }

    // Determine the symbol for the current series (can be an array per point or a single type).
    var sym = this.raphael.is( symbol, "array" ) ? symbol[ i ] : symbol;
    var symset = this.set(); // Set to hold symbols for the current series.
    path = [];               // Reset path for the current line.


    // Iterate through each data point in the current series.
    for ( var j = 0, jj = valuesy[ i ].length; j < jj; j++ )
    {
      // Calculate the x-coordinate of the data point.
      var X = x + gutter + ( ( valuesx[ i ] || valuesx[ 0 ] )[ j ] - minx ) * kx;

      // Calculate the y-coordinate of the data point.
      var Y = y + height - gutter - ( valuesy[ i ][ j ] - miny ) * ky;

      // Draw a symbol if specified for this point/series.
      ( Raphael.is( sym, "array" ) ? sym[ j ] : sym ) && symset.push(
          this.g[ Raphael.fn.g.markers[ this.raphael.is( sym, "array" ) ? sym[ j ] : sym ] ]( X, Y, ( opts.width || 2 ) * 3 )
              .attr( {
                  fill  : colors[ i ],
                  stroke: "none"
              } )
      );

      // Add path segment (M for move to, L for line to).
      path = path.concat( [ j ? "L" : "M", X, Y ] );
    }

    symbols.push( symset ); // Add the set of symbols for this series to the main symbols set.


    // If shading is enabled, complete the shade path and apply it.
    if ( opts.shade )
    {
      shades[ i ].attr( {
          path: path.concat( [
              "L", X, y + height - gutter, // Line down to the bottom of the chart.
              "L", x + gutter + ( ( valuesx[ i ] || valuesx[ 0 ] )[ 0 ] - minx ) * kx, y + height - gutter, // Line back to the start x at the bottom.
              "z" // Close the path.
          ] ).join( "," )
      } );
    }


    // If 'nostroke' is not set, apply the generated path to the line element.
    !opts.nostroke && line.attr( { path: path.join( "," ) } );
  }


  /**
   * Creates interactive column regions for the chart.
   * These columns span the width of each unique x-value range.
   *
   * @param {Function} [f] - Optional callback function to execute for each column.
   */
  function createColumns( f )
  {
    // Combine all unique x-values from all series.
    var Xs = [];
    for ( var i = 0, ii = valuesx.length; i < ii; i++ )
    {
      Xs = Xs.concat( valuesx[ i ] );
    }
    Xs.sort( function ( a, b ) { return a - b; } ); // Sort x-values numerically.

    // Remove duplicate x-values and store their corresponding pixel positions.
    var Xs2 = [], // Stores unique raw x-values.
        xs = [];  // Stores unique pixel x-coordinates.
    for ( var i = 0, ii = Xs.length; i < ii; i++ )
    {
      // Only add if not a duplicate of the previous value.
      if ( Xs[ i ] != Xs[ i - 1 ] )
      {
        Xs2.push( Xs[ i ] );
        xs.push( x + gutter + ( Xs[ i ] - minx ) * kx );
      }
    }
    Xs = Xs2; // Update Xs to contain only unique raw x-values.
    ii = Xs.length; // Update loop limit for unique x-values.


    var cvrs = f || that.set(); // Raphael set for column cover elements, or just an object if callback is provided.

    // Iterate through each unique x-value to create a column.
    for ( var i = 0; i < ii; i++ )
    {
      // Calculate the start X position and width of the column.
      // The column extends halfway to the previous and next x-value.
      var X = xs[ i ] - ( xs[ i ] - ( xs[ i - 1 ] || x ) ) / 2,
          w = ( ( xs[ i + 1 ] || x + width ) - xs[ i ] ) / 2 + ( xs[ i ] - ( xs[ i - 1 ] || x ) ) / 2,
          C; // Placeholder for the column object.

      // If a callback 'f' is provided, 'C' is a plain object; otherwise, it's a Raphael rectangle.
      if ( f )
      {
        C = {};
      }
      else
      {
        cvrs.push( C = that.rect( X - 1, y, Math.max( w + 1, 1 ), height ).attr( {
            stroke : "none",
            fill   : "#000",
            opacity: 0
        } ) );
      }

      C.values = [];  // Array to store y-values associated with this column's x.
      C.symbols = that.set(); // Set to store symbols associated with this column.
      C.y = [];       // Array to store y-coordinates for this column.
      C.x = xs[ i ];  // Pixel x-coordinate of the column's center.
      C.axis = Xs[ i ]; // Raw x-value of the column.

      // Find all y-values and symbols that correspond to this unique x-value.
      for ( var j = 0, jj = valuesy.length; j < jj; j++ )
      {
        Xs2 = valuesx[ j ] || valuesx[ 0 ]; // Use current series' x-values or the first series' x-values.
        for ( var k = 0, kk = Xs2.length; k < kk; k++ )
        {
          if ( Xs2[ k ] == Xs[ i ] )
          {
            C.values.push( valuesy[ j ][ k ] );
            C.y.push( y + height - gutter - ( valuesy[ j ][ k ] - miny ) * ky );
            C.symbols.push( chart.symbols[ j ][ k ] );
          }
        }
      }

      // If a callback was provided, execute it with 'C' as its context.
      f && f.call( C );
    }

    // If no callback, assign the created Raphael set to 'columns'.
    !f && ( columns = cvrs );
  }


  /**
   * Creates interactive dot regions for each data point.
   * These dots are invisible circles that can be used for hover/click events.
   *
   * @param {Function} [f] - Optional callback function to execute for each dot.
   */
  function createDots( f )
  {
    var cvrs = f || that.set(), // Raphael set for dot cover elements, or just an object if callback is provided.
        C;                      // Placeholder for the dot object.

    // Iterate through each data series.
    for ( var i = 0, ii = valuesy.length; i < ii; i++ )
    {
      // Iterate through each data point within the current series.
      for ( var j = 0, jj = valuesy[ i ].length; j < jj; j++ )
      {
        // Calculate the x-coordinate of the current data point.
        var X = x + gutter + ( ( valuesx[ i ] || valuesx[ 0 ] )[ j ] - minx ) * kx;

        // Calculate the x-coordinate of the previous or next data point to determine dot radius.
        var nearX = x + gutter + ( ( valuesx[ i ] || valuesx[ 0 ] )[ j ? j - 1 : 1 ] - minx ) * kx;

        // Calculate the y-coordinate of the current data point.
        var Y = y + height - gutter - ( valuesy[ i ][ j ] - miny ) * ky;

        // If a callback 'f' is provided, 'C' is a plain object; otherwise, it's a Raphael circle.
        if ( f )
        {
          C = {};
        }
        else
        {
          cvrs.push( C = that.circle( X, Y, Math.abs( nearX - X ) / 2 ).attr( {
              stroke : "none",
              fill   : "#000",
              opacity: 0
          } ) );
        }

        C.x = X;                         // Pixel x-coordinate of the dot.
        C.y = Y;                         // Pixel y-coordinate of the dot.
        C.value = valuesy[ i ][ j ];     // Raw y-value of the dot.
        C.line = chart.lines[ i ];       // Reference to the line path for this series.
        C.shade = chart.shades[ i ];     // Reference to the shade path for this series.
        C.symbol = chart.symbols[ i ][ j ]; // Reference to the symbol for this specific point.
        C.symbols = chart.symbols[ i ];  // Reference to the set of symbols for this series.
        C.axis = ( valuesx[ i ] || valuesx[ 0 ] )[ j ]; // Raw x-value of the dot.

        // If a callback was provided, execute it with 'C' as its context.
        f && f.call( C );
      }
    }

    // If no callback, assign the created Raphael set to 'dots'.
    !f && ( dots = cvrs );
  }


  // Add all main chart components to the chart's Raphael set.
  chart.push( lines, shades, symbols, axis, columns, dots );

  // Assign references to specific sets for easier access.
  chart.lines = lines;
  chart.shades = shades;
  chart.symbols = symbols;
  chart.axis = axis;


  /**
   * Enables hover interactivity for chart columns.
   *
   * @param {Function} fin - Callback function for mouseover event.
   * @param {Function} fout - Callback function for mouseout event.
   * @returns {Object} The chart object for chaining.
   */
  chart.hoverColumn = function ( fin, fout )
  {
    !columns && createColumns(); // Create columns if they don't exist.
    columns.mouseover( fin ).mouseout( fout ); // Attach hover handlers.
    return this;
  };


  /**
   * Enables click interactivity for chart columns.
   *
   * @param {Function} f - Callback function for click event.
   * @returns {Object} The chart object for chaining.
   */
  chart.clickColumn = function ( f )
  {
    !columns && createColumns(); // Create columns if they don't exist.
    columns.click( f );          // Attach click handler.
    return this;
  };


  /**
   * Sets href attributes for chart columns, making them clickable links.
   * Can take an array of hrefs or an object mapping axis values to hrefs.
   *
   * @param {Array<string>|Object} cols - Hrefs to apply to columns.
   * @returns {Object} The chart object for chaining.
   */
  chart.hrefColumn = function ( cols )
  {
    // Determine if the arguments are an array of hrefs or an object.
    var hrefs = that.raphael.is( arguments[ 0 ], "array" ) ? arguments[ 0 ] : arguments;

    // Handle object input: { "axis_value": "url" }
    if ( !( arguments.length - 1 ) && typeof cols == "object" )
    {
      for ( var xval in cols )
      {
        for ( var i = 0, ii = columns.length; i < ii; i++ )
        {
          if ( columns[ i ].axis == xval )
          {
            columns[ i ].attr( "href", cols[ xval ] );
          }
        }
      }
    }

    !columns && createColumns(); // Ensure columns exist.

    // Apply hrefs from an array (positional mapping).
    for ( var i = 0, ii = hrefs.length; i < ii; i++ )
    {
      columns[ i ] && columns[ i ].attr( "href", hrefs[ i ] );
    }

    return this;
  };


  /**
   * Enables hover interactivity for chart data points (dots).
   *
   * @param {Function} fin - Callback function for mouseover event.
   * @param {Function} fout - Callback function for mouseout event.
   * @returns {Object} The chart object for chaining.
   */
  chart.hover = function ( fin, fout )
  {
    !dots && createDots(); // Create dots if they don't exist.
    dots.mouseover( fin ).mouseout( fout ); // Attach hover handlers.
    return this;
  };


  /**
   * Enables click interactivity for chart data points (dots).
   *
   * @param {Function} f - Callback function for click event.
   * @returns {Object} The chart object for chaining.
   */
  chart.click = function ( f )
  {
    !dots && createDots(); // Create dots if they don't exist.
    dots.click( f );       // Attach click handler.
    return this;
  };


  /**
   * Iterates through each data point (dot) and executes a callback.
   *
   * @param {Function} f - Callback function to execute for each dot.
   * @returns {Object} The chart object for chaining.
   */
  chart.each = function ( f )
  {
    createDots( f ); // Create dots and immediately execute callback for each.
    return this;
  };


  /**
   * Iterates through each chart column and executes a callback.
   *
   * @param {Function} f - Callback function to execute for each column.
   * @returns {Object} The chart object for chaining.
   */
  chart.eachColumn = function ( f )
  {
    createColumns( f ); // Create columns and immediately execute callback for each.
    return this;
  };


  return chart; // Return the created chart object.
};