/* This JavaScript file is designed to read input from standard
 * input, process it, and then print a result to the console.
 * It strictly enforces modern JavaScript coding practices.
 */
"use strict" ; // Enforce strict parsing and error handling for cleaner code.


/*
 * The following block is responsible for reading all input lines
 * from the standard input stream.
 * It uses Node.js 'fs' module to achieve this.
 */
const    input    =    require ( "fs" )
  . readFileSync ( "/dev/stdin" ,  "utf8" )  // Read the entire file synchronously as UTF-8.
  . split ( "\n" ) ;                          // Split the content into an array of lines.


// The first line of input typically contains the count of items,
// which we parse as an integer.
const    N    =    parseInt ( input [ 0 ] ,    10 ) ;


/*
 * The second line of input contains space-separated numbers.
 * These are parsed into an array of integers, and then
 * immediately sorted in descending order. This is crucial
 * for the subsequent algorithm.
 */
const    A    =    input [ 1 ] . split ( " " )
  . map ( ( val )    =>    parseInt ( val ,    10 ) ) // Convert each string part to an integer.
  . sort ( ( a ,    b )    =>    b    -    a ) ;        // Sort the array in descending order.


// This is the core algorithm, likely an implementation of
// the Euclidean algorithm for finding the greatest common divisor (GCD)
// or a similar reduction process. It continues as long as there's
// at least a second element in the array A.
while    ( A [ 1 ] )
{
  A [ 0 ]    =    A [ 0 ]    %    A [ 1 ] ; // Apply the modulo operation.
  // If the result of the modulo operation is zero, it means
  // the first element is now a multiple of the second,
  // so we can remove the first element.
  if    ( A [ 0 ]    ===    0 )
  {
    A . shift ( ) ;                           // Remove the first element from the array.
  }
  else                                        // If not zero, re-sort to maintain descending order.
  {
    A . sort ( ( a ,    b )    =>    b    -    a ) ; // Re-sort in descending order.
  }
}


// Finally, after the loop terminates, the remaining element at index 0
// is the desired result, which is then printed to the console.
console . log ( A [ 0 ] ) ; // Output the final computed value.