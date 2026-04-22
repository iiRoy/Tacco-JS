/*
 * This file contains a JavaScript program.
 * It calculates the length of the Collatz sequence cycle for a given input.
 */

  'use strict' ; /* Enforce strict mode for cleaner code. */


let fn = val => { /* Define a helper function 'fn'. */
  // This function implements one step of the Collatz conjecture.
  return val % 2 == 0 ? val / 2 : val * 3 + 1 ;
} ; // End of 'fn' function definition.


let execute = input => { /* Define the main execution function 'execute'. */

  let val = + input ; // Convert the input string to a number.
  let set = new Set ( [ val ] ) ; // Initialize a Set to track visited numbers in the sequence.
  let i = 2 ; // Initialize a counter for the sequence length.

  while ( true ) { /* Start an infinite loop to generate the sequence. */
    val = fn ( val ) ; // Apply the Collatz transformation.
    if ( set . has ( val ) ) { // Check if the current value has been seen before (cycle detected).
      return i ; // Return the length of the cycle.
    }
    set . add ( val ) ; // Add the new value to the set of visited numbers.
    i ++ ; // Increment the sequence length counter.
  } // End of while loop.

} ; // End of 'execute' function definition.


function Main ( input ) { /* Define the Main function to handle program entry. */
  // Log the result of the 'execute' function to the console.
  console . log ( execute ( input ) ) ;
} // End of 'Main' function.


// Read input from standard input and pass it to the Main function.
Main ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ;