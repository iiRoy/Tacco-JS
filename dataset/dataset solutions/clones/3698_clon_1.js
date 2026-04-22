/* This JavaScript file demonstrates a simple program to find the
   range (difference between max and min) of numbers provided via stdin.
   It adheres to strict mode for better code quality.
*/

"use strict"
; /* Enforces strict parsing and error handling rules. */


// Define the main function that processes the input argument.
function   main ( arg )  {

  // The 'arg' parameter is expected to be a string containing numbers.
  // First, split by newline, take the second line (index 1),
  // then split that line by space to get individual number strings.
  // Finally, sort these number strings numerically to easily find min/max.
  const A = arg . split ( "\n" ) [ 1 ] . split ( " " ) . sort ( ( a , b ) => a - b ) ; // Array 'A' now contains sorted numbers.


  // Calculate the difference between the largest (last element)
  // and the smallest (first element) number in the sorted array.
  console . log ( A [ A . length - 1 ] - A [ 0 ] ) ; /* Output the range to the console. */

} // End of the main function.


// Invoke the main function immediately.
// It reads input from standard input using Node.js 'fs' module.
main (
  require ( 'fs' ) . readFileSync (
    '/dev/stdin' ,
    'utf8'
  )
) ; // Call main with the content of stdin.