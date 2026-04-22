'use strict'
// This Immediately Invoked Function Expression (IIFE) processes input
// data to generate and display various ASCII art frames based on dimensions.
(function ( sourceText ) {

  // First, segment the entire input string into individual text lines
  // using the newline character as a delimiter.
  var inputLines = sourceText.split( '\x0A' ) ;
  /*
   * Initialize an empty array to store the parsed width and height
   * dimensions extracted from each input line.
   */
  var dimensionArrays = [ ] ;

  // Iterate over each line obtained from the input.
  for ( var lineIdx = 0 , totalLineCount = inputLines.length ; lineIdx < totalLineCount ; lineIdx++ ) {
    // For each line, further split it by space to isolate the two dimension values.
    dimensionArrays[ lineIdx ] = inputLines[ lineIdx ].split( '\x20' ) ;

    // Extract the first dimension, converting it to a numeric type, for horizontal size.
    var horizDim = dimensionArrays[ lineIdx ][ 0 ] - 0.0 ;
    // Extract the second dimension, converting it to a numeric type, for vertical size.
    var vertDim = dimensionArrays[ lineIdx ][ 1 ] - 0.0 ;

    // Evaluate the termination condition: if both dimensions are zero, exit the process.
    if ( horizDim === +0 && vertDim === +0 ) {
      return !0 ; // Returns boolean 'false' to indicate termination.
    }

    // Construct the top and bottom boundary string for the frame.
    // This involves 'horizDim + 1' hash characters, followed by a newline.
    var topBottomBoundary = ( new Array( horizDim + 1 ) ) .join( '\x23' ) + '\x0A' ;

    // Construct the string for an inner row of the frame.
    // It starts with a hash, followed by 'horizDim - 1' dot characters, then another hash, and a newline.
    var innerFrameRow = '\x23' + ( ( new Array( horizDim - 1 ) ) .join( '\x2E' ) + ( '\x23' ) + '\x0A' ) ;

    // Assemble the complete ASCII frame:
    // top boundary + (vertDim - 1 inner rows) + bottom boundary.
    var displayOutput = topBottomBoundary + ( ( new Array( vertDim - 1 ) ) .join( innerFrameRow ) ) + topBottomBoundary ;

    // Print the fully constructed ASCII frame to the standard output.
    console.log( displayOutput ) ;
  }
} ( require( 'fs' ) . readFileSync( '/dev/stdin' , 'utf8' ) ) ) ;