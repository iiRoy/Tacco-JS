/* This is a Type I clone of the original JavaScript code.
 * It strictly adheres to the definition:
 * - All identifiers, variable names, function names, operators, and expressions are unchanged.
 * - Only whitespace and comments have been altered significantly.
 * The logic and structure remain absolutely identical.
 */
"use strict"
; // Enforce strict mode for better code quality.


// Define the main function that processes the input argument.
const main  =  arg  =>   {

  // Trim any leading/trailing whitespace from the input string.
  const   input   =   arg.trim()   ;


  // Parse the input:
  // 1. Split by newline to get rows.
  // 2. Map each row:
  //    a. Split by space to get individual numbers as strings.
  //    b. Map each string to an integer.
  // Destructure the result into N (unused in this specific problem) and A (the array of numbers).
  const   [   N   ,   A   ]   =   input.split('\n').map(   y   =>   y.split(' ').map(   x   =>   parseInt(x)   )   )   ;
  // Initialize the answer counter.
  let   ans   =   0   ;


  // Loop through the array 'A' to find odd numbers at specific indices.
  // The loop starts at index 1 and increments by 2, checking every other element.
  for   (   let   i   =   1   ;   i   <=   A.length   ;   i   +=   2   )   {
    // Check if the current element A[i] is odd.
    // An odd number modulo 2 will be 1 (truthy).
    if   (   A[i]   %   2   )   {
      ans++   ;   /* Increment the answer if the condition is met. */
    }
  }

  // Output the final calculated answer to the console.
  console.log(   ans   )   ;
}
// Invoke the main function with input read from standard input.
// This reads the entire file content as a UTF-8 string.
main(   require('fs').readFileSync('/dev/stdin',   'utf8'   )   )
;