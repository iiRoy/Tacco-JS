'use strict' ;


( function ( stdin ) {

  /* This is a helper function designed to generate a rectangular pattern
   * based on given width and height dimensions.
   * It creates a hollow rectangle using '#' for borders and '.' for the interior.
   *
   * @param {Array<number>} array - An array containing two numbers: [width, height].
   * @returns {string} The string representation of the generated rectangle.
   */
  function square ( array )
  {
    // Retrieve the width and height from the input array.
    var w = array [ 0 ] ;
    var h = array [ 1 ] ;

    // --- Generate the outer border line (top and bottom) ---
    var outLine = [ ] ;
    for ( var i = 0 ;   i < w ;   i ++ )
    {
      outLine . push ( '#' ) ;
    }
    outLine = outLine . join ( '' ) ;


    // --- Generate the inner line (for rows between top and bottom borders) ---
    var inLine = [ ] ;
    for ( var j = 0 ;   j < w - 2 ;   j ++ )
    {
      inLine . push ( '.' ) ;
    }

    // Add border characters to the inner line.
    inLine . push ( '#' ) ; // Right border piece
    inLine . unshift ( '#' ) ; // Left border piece

    inLine = inLine . join ( '' ) ; // Convert the array of characters to a single string.


    // --- Assemble the final result ---
    var result = [ ] ;
    // Add the inner lines for the height-2 rows.
    for ( var k = 0 ;   k < h - 2 ;   k ++ )
    {
      result . push ( inLine ) ;
    }

    // Add the top and bottom border lines.
    result . push ( outLine ) ; // Bottom border
    result . unshift ( outLine ) ; // Top border


    // Return the complete rectangle string, with lines separated by newlines.
    return result . join ( '\n' ) ;
  }



  // --- Input Processing Section ---

  // Read the entire standard input, convert it to a string,
  // remove leading/trailing whitespace, and split it into an array of lines.
  var inputs = stdin . toString ( ) . trim ( ) . split ( '\n' ) ;


  // Identify the actual data lines by slicing up to the '0 0' termination marker.
  var line = inputs . slice ( 0 , inputs . indexOf ( '0 0' ) ) ;


  // Transform each data line: first split by space, then convert each part to a number.
  // This results in an array of [width, height] arrays.
  line = line . map ( function ( v )
  {
    return v . split ( ' ' ) . map ( Number ) ;
  } ) ;


  // --- Main Execution Block ---

  // Apply the 'square' function to each [width, height] array in 'line'.
  // The results (individual square strings) are then joined by two newline characters.
  var all = line . map ( square ) . join ( '\n\n' ) ;


  // --- Output Section ---

  // Display the final aggregated output to the console.
  console . log ( all ) ;

} ) ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ;