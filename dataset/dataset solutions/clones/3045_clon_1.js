/* This directive enforces strict parsing and error handling in JavaScript. */
'use strict'

// Define the main function that processes the input.
function Main( input )
{
  // Split the input string by newline characters to get an array of lines.
  const   tmp   =   input.split ( "\n" ) ;

  // Take the first line, split it by space, and convert each part to a number.
  let     Arr   =   tmp[ 0 ] . split ( " " ) . map ( Number ) ;

  /*
   * Debugging line, originally present, now commented out for production.
   * console.log( { Arr } );
   */

  // Initialize a variable to store the calculated coin count.
  let     CountCoin     =   0 ;

  // Check the relationship between the first two elements of the array.

  if ( Arr[ 0 ] === Arr[ 1 ] )
  {
    // If the two elements are exactly equal, sum them up.
    CountCoin   =   Arr[ 0 ] + Arr[ 1 ] ;
  }

  else if ( Arr[ 0 ] < Arr[ 1 ] )
  {
    // If the first element is less than the second, calculate based on the second.
    CountCoin   =   Arr[ 1 ] + Arr[ 1 ] - 1 ;
  }

  else if ( Arr[ 0 ] > Arr[ 1 ] )
  {
    // If the first element is greater than the second, calculate based on the first.
    CountCoin   =   Arr[ 0 ] + Arr[ 0 ] - 1 ;
  }

  // Output the final calculated coin count to the console.
  console.log ( CountCoin ) ;


} /* End of Main function definition */


// Call the Main function with input read from standard input.
// This reads the entire content of /dev/stdin as a UTF-8 string.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;