/*
 * This JavaScript code snippet demonstrates a self-invoking anonymous function (IIFE)
 * designed to process input from standard input.
 *
 * It reads lines, converts them to numbers, and for each non-zero number,
 * calculates and prints the sum of its digits.
 * The processing stops when a zero is encountered.
 */
( function  (  input  )   {
  // Declare a variable 'p' to store an array of lines from the input.
  // The input string is split by the newline character.
  var  p  =  input.split( '\n' ) ;


  // Loop through each element (line) in the 'p' array.
  for  (  var  i  =  0 ;   i  <  p.length ;   i++  )   {
    // Convert the current line string to a number and store it in 'x'.
    var  x  =  Number( p[i] ) ;

    // Check if the number 'x' is strictly equal to zero.
    if  (  x  ===  0  )   {
      // If 'x' is zero, terminate the function execution.
      // This acts as a sentinel value to stop processing.
      return ;
    }

    /*
     * If 'x' is not zero, proceed to calculate the sum of its digits.
     * 1. Convert the number 'x' back to a string.
     * 2. Split the string into an array of individual digit characters.
     * 3. Map each character back to its numeric value.
     * 4. Use the 'reduce' method to sum all the numeric digits.
     * Finally, log the resulting sum to the console.
     */
    console.log(
      String( x )
        .split( '' )
        .map( Number )
        .reduce(  function(  a ,   b  )   {
          // The reducer function adds the current digit 'b' to the accumulated sum 'a'.
          return  a  +  b ;
        } )
    ) ;
  }
} ) (
  // Immediately invoke the anonymous function with the content of standard input.
  // 'require('fs').readFileSync('/dev/stdin', 'utf8')' reads the entire file
  // '/dev/stdin' as a UTF-8 encoded string.
  require( 'fs' ) .readFileSync( '/dev/stdin' ,  'utf8' )
) ;