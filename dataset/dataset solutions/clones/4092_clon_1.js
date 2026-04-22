/* This is a Type I clone of an original JavaScript file.
 * It demonstrates extensive whitespace and comment modifications
 * while preserving all original identifiers, operators, and expressions.
 * This file processes input from stdin to determine a winner between Alice and Borys.
 */
'use strict' ; /* Enforces strict parsing and error handling for the entire script. */

// Define the main function that encapsulates the core logic.
// This function takes a single argument, 's', which is expected to be a string.
const   main    =   s   =>   {
  // Process the input string 's' to extract numerical data.
  // 1. Splits the string by newline characters and takes the first line.
  // 2. Splits the resulting line by spaces.
  // 3. Maps each string segment to a Number type.
  s   =   s  .  split  (  '\n'  )  [  0  ]  .  split  (  ' '  )  .  map  (  n   =>   Number  (  n  )  )  ;


  // Extract the second element from the processed array 's' and assign it to constant A.
  const   A   =   s  [  1  ]  ;


  // Extract the third element from the processed array 's' and assign it to constant B.
  const   B   =   s  [  2  ]  ;


  // Calculate the difference between A and B, then check if it's an even number.
  // If (A - B) is even, 'Alice' is assigned to 'ans'. Otherwise, 'Borys' is assigned.
  const   ans   =   (  (  A    -    B  )    %    2    ===    0  )   ?   'Alice'   :   'Borys'  ;

  // Output the determined winner ('ans') to the console.
  console  .  log  (  ans  )  ;
}


// Invoke the main function.
// It reads the entire content of the standard input ("/dev/stdin") as a UTF-8 string.
// The 'require("fs").readFileSync' call is a synchronous file read operation.
main  (  require  (  "fs"  )  .  readFileSync  (  "/dev/stdin"  ,  "utf8"  )  )  ;

// End of the program execution flow.
// No further code after the main function call.