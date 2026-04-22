//
// This file defines the Oscilloscope class in JavaScript.
// It uses the HTML5 Canvas API for visualization.
//

var Oscilloscope = function ( pin, canvas, color, lineColor ) {

  // Store a reference to the current instance for use within closures.
  var scope = this;

  // Initialize the display properties.
  // Default color is a semi-transparent red if not provided.
  this.color = color || 'rgba(255,0,0,0.5)';
  // Default line color for grid/crosshairs is black.
  this.lineColor = lineColor || '#000';

  // Scaling factors for the X and Y axes.
  // Initialized to 1, meaning no scaling.
  this.scaleX = 1;
  this.scaleY = 1;

  // --- Public properties of the Oscilloscope instance ---
  // The input 'pin' (conceptual) for data.
  this.pin = pin;
  // The HTML Canvas element used for drawing.
  this.canvas = canvas;

  // --- Private variables, not directly accessible from outside ---
  // Array to store the historical data values.
  var values = [];
  // Get the 2D rendering context from the canvas.
  var ctx = canvas.getContext( "2d" );

  // Set global alpha for drawing operations (fully opaque).
  ctx.globalAlpha = 1;
  // Set the default line width for drawing.
  ctx.lineWidth = 1;

  /**
   * Public method: update()
   * Clears the canvas and redraws the oscilloscope display,
   * including crosshairs and the data waveform.
   */
  this.update = function ( ) {

    // Clear the entire canvas area before redrawing everything.
    ctx.clearRect( 0, 0, scope.canvas.width, scope.canvas.height );

    // --- Draw the cross-hairs (horizontal line only for now) ---
    // Set the stroke style for the crosshairs using the instance's lineColor.
    ctx.strokeStyle = scope.lineColor;
    // Begin a new path for drawing.
    ctx.beginPath( );

    // Draw a horizontal line across the middle of the canvas.
    ctx.moveTo( 0, canvas.height / 2 );
    ctx.lineTo( canvas.width, canvas.height / 2 );

    // Render the defined path.
    ctx.stroke( );
    // Close the current path.
    ctx.closePath( );

    // TODO: Implement centering of the waveform on the horizontal line.
    // TODO: Invert the Y-axis so that higher values are displayed upwards.
    // TODO: Manage data display when `values.length` exceeds `canvas.width`.
    // TODO: Add functionality for scrolling the waveform display.

    // --- Draw the actual data waveform ---
    // Begin a new path for the waveform.
    ctx.beginPath( );
    // Set the stroke style for the waveform using the instance's color.
    ctx.strokeStyle = scope.color;
    // Start drawing the waveform from the left edge, centered vertically.
    ctx.moveTo( 0, canvas.height / 2 );

    // Iterate over the stored values and draw lines to represent the waveform.
    scope.values.forEach( function ( val, x ) {
      // Calculate the X coordinate based on index and scale.
      // Calculate the Y coordinate, scaled and inverted (current implementation).
      ctx.lineTo( x * scope.scaleX, val * canvas.height / scope.scaleY );
    } );

    // Render the waveform path.
    ctx.stroke( );
    // Close the waveform path.
    ctx.closePath( );

  };

  // --- Getter and Setter methods for dynamic property access ---

  /**
   * Getter for "min"
   * Returns the minimum value currently stored in the `values` array.
   * Note: This sorts the array, which can be inefficient for large datasets.
   */
  this.__defineGetter__( "min", function ( ) {
    return this.values.sort( ).shift( );
  } );

  /**
   * Getter for "max"
   * Returns the maximum value currently stored in the `values` array.
   * Note: This sorts the array, which can be inefficient for large datasets.
   */
  this.__defineGetter__( "max", function ( ) {
    return this.values.sort( ).pop( );
  } );

  /**
   * Getter for "value"
   * Provides access to the most recently added data point.
   */
  this.__defineGetter__( "value", function ( ) {
    return values[ values.length - 1 ];
  } );

  /**
   * Setter for "value"
   * Allows pushing a single new value or an array of values into the data buffer.
   *
   * @param {number|Array} val - The value(s) to add.
   */
  this.__defineSetter__( "value", function ( val ) {
    // Check if the input is an array using a quick prototype check.
    if ( val[ '__proto__' ] == Array.prototype ) {
      // If it's an array, iterate and push each element.
      val.forEach( function ( v ) {
        values.push( v );
      } );
    } else {
      // Otherwise, push the single value.
      values.push( val );
    }
  } );

  /**
   * Getter for "values"
   * Returns a segment of the stored data, trimmed to fit the canvas width
   * if the data buffer is larger than the canvas width.
   * Always returns a copy (slice).
   */
  this.__defineGetter__( "values", function ( ) {
    // If the number of stored values exceeds the canvas width,
    // return only the most recent `canvas.width` values.
    if ( values.length >= this.canvas.width ) {
      return values.slice( values.length - canvas.width, values.length );
    } else {
      // Otherwise, return a copy of all stored values.
      return values.slice( 0 );
    }
  } );

  /**
   * Setter for "values"
   * Replaces the entire data buffer with a new array of values.
   * It also trims the input array to the canvas width if it's larger.
   *
   * @param {Array} val - The new array of values.
   */
  this.__defineSetter__( "values", function ( val ) {
    // Replace the internal `values` array, slicing the input
    // to keep only the last `canvas.width` elements if `val` is longer.
    values = val.slice( this.canvas.width );
  } );

};