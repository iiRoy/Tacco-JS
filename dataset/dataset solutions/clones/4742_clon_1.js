/*
 * This file processes numerical input to produce a specific calculated output.
 * It demonstrates basic arithmetic operations and string manipulation in JavaScript.
 *
 * This version of the code is a Type I clone, meaning it is functionally identical
 * to an original source, differing only in whitespace and comments.
 */
"use strict" ; // Always use strict mode for better code quality.


const main = ( arg ) =>
{
   // Remove leading/trailing whitespace and split the input string by newlines.
   arg = arg . trim ( ) . split ( "\n" ) ;

   // Parse the first number from the first line of the input.
   // We assume the first element of the first line contains the relevant number.
   const N = parseInt ( arg [ 0 ] . split ( " " ) [ 0 ] ) ;


   // Calculate 'temp' as the integer part of N divided by 11.
   let temp = Math . floor ( N / 11 ) ;
   // Calculate 'rest' as the remainder of N divided by 11.
   let rest = N % 11 ;


   // The following lines are examples of commented-out debug statements
   // that were perhaps used during development. They are now inactive.
   // console . log ( temp ) ; // Show the 'temp' value.
   // console . log ( rest ) ; // Show the 'rest' value.
   // console . log ( temp * 11 ) ; // Verify the base multiplication.

   // console . log ( temp * 2 ) ; // Another intermediate value for debugging.


   // Finally, compute and print the result.
   // The formula is (temp * 2) plus the ceiling of (rest / 6).
   console . log ( ( temp * 2 ) + Math . ceil ( rest / 6 ) ) ;
}


// This block handles reading input from standard input (/dev/stdin)
// and passes it to the 'main' function for processing.
main ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ;