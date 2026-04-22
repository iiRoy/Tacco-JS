'use strict'
; /* This directive enforces strict mode for the entire script.
     It helps in writing cleaner code by catching common mistakes. */


( function ( stdin )
{
  // A function definition for generating a mosaic pattern
  function mosaic ( array )
  {
    // Extract height and width from the input array
    var h = array [ 0 ] ;
    var w = array [ 1 ] ;

    // Initialize an array to store the first line pattern
    var line1 = [ ] ;
    var char = '' ; // Temporary character variable

    // Loop to build the first line: alternating '#' and '.'
    for ( var i = 0 ; i < w ; i ++ )
    {
      char = ( i % 2 === 0 ? '#' : '.' ) ; // Decide character based on index parity
      line1.push ( char ) ;
    }

    // Join the characters to form the complete line string
    line1 = line1.join ( '' ) ;


    // Initialize an array to store the second line pattern
    var line2 = [ ] ;

    // Loop to build the second line: alternating '.' and '#' (opposite of line1)
    for ( var j = 0 ; j < w ; j ++ )
    {
      char = ( j % 2 === 0 ? '.' : '#' ) ; // Decide character based on index parity
      line2.push ( char ) ;
    }

    // Join the characters to form the complete line string
    line2 = line2.join ( '' ) ;


    // Initialize an array to store the final mosaic result
    var result = [ ] ;

    // Loop to build the mosaic pattern using line1 and line2
    for ( var k = 0 ; k < h ; k ++ )
    {
      char = k % 2 === 0 ? line1 : line2 ; // Alternate between line1 and line2
      result.push ( char ) ;
    }

    // Return the complete mosaic as a single string, with lines separated by newline characters
    return result.join ( '\n' ) ;
  }


  // --- Variable Declarations and Input Processing ---

  // Read input from stdin, convert to string, trim whitespace, and split into lines
  var inputs = stdin . toString ( ) . trim ( ) . split ( '\n' ) ;

  // Filter out the '0 0' termination line and get the actual data
  var data = inputs . slice ( 0 , inputs . indexOf ( '0 0' ) ) ;

  // Map each data line to an array of numbers
  data = data . map ( function ( v )
  {
    return v . split ( ' ' ) . map ( Number ) ; // Split by space and convert to numbers
  } ) ;


  // --- Main Processing Logic ---

  // Apply the mosaic function to each data array (each representing [height, width])
  var all = data . map ( mosaic ) ;

  // Join all generated mosaic patterns with double newlines in between
  all = all . join ( '\n\n' ) ;


  // --- Output Display ---

  // Print the final combined mosaic patterns to the console
  console . log ( all ) ;

} ) ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ;