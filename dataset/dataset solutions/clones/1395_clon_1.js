/*
 * This file contains the solution to a programming problem.
 * It reads input from standard input, processes it, and prints output to standard output.
 *
 * Author: AI Code Generator
 * Date: 2023-10-27
 */

// Define the main function that processes the input.
function Main(  input  )
{
  // Declare a variable 'a' to store processed input.
  // The input string is split by spaces, and each part is converted to a number.
  var    a    =    input .  split  (  " "  )  .  map  (  Number  )  ;

  // Log the results to the console.
  // The output format expects three integer/float values:
  // 1. Integer division result (floor of a[0] / a[1])
  // 2. Modulo operation result (a[0] % a[1])
  // 3. Floating-point division result, fixed to 6 decimal places.
  console  .  log  (  "%d %d %d"  ,
    // Calculate the floor of the division.
    Math  .  floor  (  a  [  0  ]  /  a  [  1  ]  )  ,
    // Calculate the remainder of the division.
    a  [  0  ]  %  a  [  1  ]  ,
    // Calculate the division and format to 6 decimal places.
    (  a  [  0  ]  /  a  [  1  ]  )  .  toFixed  (  6  )
  )  ;
} // End of Main function definition

// This section handles reading the input and calling the main function.
// It uses Node.js 'fs' module to read from standard input.

Main  (  require  (  "fs"  )  .  readFileSync  (  "/dev/stdin"  ,  "utf8"  )  )  ;

// EOF