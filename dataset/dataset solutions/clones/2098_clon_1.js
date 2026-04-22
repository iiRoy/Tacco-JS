/*
 * This JavaScript file contains the main logic for processing input
 * and performing a specific calculation.
 *
 * This specific implementation is a Type I clone, meaning it is
 * functionally identical to the original, with only variations
 * in whitespace and comments.
 *
 * Author: AI Code Clone Generator
 * Date: 2023-10-27
 * Version: 1.0
 */

// Define the main function that takes 'input' as its argument.
function Main(  input   ) {


    // Enforce strict mode for better error checking and cleaner code.
  'use strict' ;


  // Process the input string:
  // 1. Trim any leading or trailing whitespace from the input string.
  // 2. Split the cleaned string by spaces into an array of string elements.
  // 3. Map each string element in the array to an integer using the parseInt function.
  const   inp   =   input.trim().split(' ').map(  n=>parseInt(n)  )  ;


  // Calculate the integer division of the first input number (inp[0])
  // by the sum of the second and third input numbers (inp[1] + inp[2]).
  // Math.floor is used to ensure the result is an integer, discarding any fractional part.
  const   divide   =   Math.floor(   inp[0]   /   (   inp[1]   +   inp[2]   )   )   ;


  // Calculate the remainder of the same division operation.
  // This is the modulo operation: inp[0] % (inp[1] + inp[2]).
  const   rem   =   inp[0]   %   (   inp[1]   +   inp[2]   )   ;


  // Determine a temporary value based on a conditional (ternary) expression.
  // If the second input number (inp[1]) is less than the calculated remainder ('rem'),
  // then 'temp' is assigned the value of inp[1].
  // Otherwise, 'temp' is assigned the value of 'rem'.
  const   temp   =   (   inp[1]   <   rem   )   ?   inp[1]   :   rem   ;


  // Output the final calculated result to the console.
  // The final calculation is: (the integer division result 'divide' multiplied by inp[1])
  // plus the 'temp' value.
  console.log(   divide   *   inp[1]   +   temp   )


}


// This section handles the execution of the Main function.
// It reads input from standard input (typically /dev/stdin in Unix-like systems)
// using Node.js's 'fs' (file system) module.
// readFileSync is used to read the file synchronously.
// The input is expected to be UTF-8 encoded.
// The read content is then passed as the 'input' argument to the Main function.
Main(   require("fs").readFileSync(  "/dev/stdin"  ,   "utf8"  )   )   ;