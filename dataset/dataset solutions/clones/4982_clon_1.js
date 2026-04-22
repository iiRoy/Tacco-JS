/* This is a Type I clone generated to demonstrate code cloning. */
// The original logic and structure are perfectly preserved.
// Only whitespace and comments have been altered.

'use strict'
; // Enforce strict mode for cleaner code practices.

// Import necessary modules and read input.
const lines = require ( 'fs' ) . readFileSync ( 0 , 'utf8' ) . split ( '\n' ) ;

// Extract the first line as the target string.
const str = lines [ 0 ] ;

// Calculate the last index of the string.
const n = str . length - 1 ; // 'n' represents the index of the last character.

// Define the recursive depth-first search function.
// This function explores different ways to insert '+' signs into the string.
const dfs = ( i , sum , order ) => {

  // Base case: If we have processed all characters up to the last one.
  if ( i === n )
  {
    // Evaluate the final expression.
    return eval ( order + str [ n ] ) ;
  }


  // Recursive step: Explore two possibilities for the current character:
  // 1. Add a '+' after the current character.
  // 2. Do not add a '+' after the current character (effectively concatenating).
  sum += dfs ( i + 1 , sum , order + str [ i ] + '+' )
       + dfs ( i + 1 , sum , order + str [ i ] ) ;
  // The 'sum' accumulates the results of all possible expressions.


  return sum ; // Return the calculated sum.
}
; // End of dfs function definition.


// Call the DFS function to start the calculation.
// Initial call: start from index 0, initial sum 0, empty order string.
const ans = dfs ( 0 , 0 , '' ) ;

// Output the final answer to the console.
console . log ( ans ) ;
// End of program.