/*
 * This is a JavaScript file for processing some input.
 * It calculates a specific value based on two numerical inputs.
 */
'use strict' // Enforce strict mode for better code quality.


const Main = (  arg  )   =>   { // Define the main function that takes an argument.

  // Process the input argument.
  let input = arg  .  trim  (  )  .  split  (  '\n'  )  ; // Trim whitespace and split into lines.


  // Extract the first two numbers from the first line.
  let AP = input  [  0  ]  .  split  (  ' '  )  .  map  (  Number  )  [  0  ]  ; // Get the first number.
  let ap = input  [  0  ]  .  split  (  ' '  )  .  map  (  Number  )  [  1  ]  ; // Get the second number.

  /*
   * The original code had a debug log here.
   * console.log({ AP, ap }); // Debug: show parsed values.
   * It's commented out as per typical production code.
   */


  // Perform the primary calculation.
  let Allap =   3   *   AP   +   ap   ; // Calculate the sum based on the given formula.


  // Calculate the final answer.
  let Answer =   Math  .  floor  (  Allap   /   2  )  ; // Divide by 2 and take the floor (integer part).


  console  .  log  (  Answer  )  ; // Output the final calculated answer.

} // End of the Main function definition.


// Call the Main function with input read from stdin.
Main  (  require  (  "fs"  )  .  readFileSync  (  "/dev/stdin"  ,  "utf8"  )  )  ; // Read input from standard input as UTF-8.