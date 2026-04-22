/*
 * This is a JavaScript file.
 * It demonstrates a simple comparison logic.
 */

'use strict' /* Enforce strict mode for better code quality and error handling. */

// Define the main function that processes the input.
function main (input)
{
  /*
   * Process the input string:
   * 1. Remove leading/trailing whitespace.
   * 2. Split the string by spaces into an array of strings.
   * 3. Convert each string element to a number.
   */
  input = input
    .trim ( ) // Step 1: Remove whitespace from both ends of the string.
    .split ( ' ' ) // Step 2: Split the string into an array using space as a delimiter.
    .map ( v => Number (v) ) // Step 3: Map each string element 'v' to its numeric representation.

  // Determine the answer based on the comparison of the first two numbers.
  // If the first number is less than the second, the answer is 0; otherwise, it's 10.
  const ans = input [ 0 ] < input [ 1 ]
              ? 0 // Value if the condition is true.
              : 10 // Value if the condition is false.

  // Output the calculated answer to the console.
  console.log( ans )
}

/*
 * This is the entry point of the script.
 * It reads input from standard input, decodes it as UTF-8, and passes it to the main function.
 */
main (
       require ( 'fs' )
         .readFileSync ( '/dev/stdin', 'utf8' )
     ) // Call the main function with the content read from standard input.