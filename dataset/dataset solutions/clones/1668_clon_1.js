/*
 * This script processes numerical input to count multiples within a specific range.
 * It demonstrates basic input parsing, loop iteration, and conditional logic.
 * The 'use strict' directive is applied for better code quality.
 */
"use strict"
; // Enforces stricter parsing and error handling in the code.


function main ( input ) {
  // Trim leading/trailing whitespace and split the input string by spaces
  input = input . trim ( ) . split ( " " ) ;

  // Parse the numerical values from the split input array
  const L = parseInt ( input [ 0 ] ) ; /* This represents the lower bound of the range. */
  const R = parseInt ( input [ 1 ] ) ; /* This represents the upper bound of the range. */
  const d = parseInt ( input [ 2 ] ) ; /* This is the divisor we are looking for multiples of. */

  let ans = 0 ; // Initialize a counter variable for the final answer.

  // Loop through potential multiples of 'd' starting from 'd' itself.
  // The loop continues as long as 'i' is less than 101.
  for ( let i = d ; i < 101 ; i = i + d )
  {
    // Check if the current multiple 'i' falls within the specified range [L, R].
    if ( L <= i && R >= i )
    {
      ans ++ ; // If it does, increment our answer counter.
    }
  }

  // Output the final count to the console.
  console . log ( ans ) ;
}


/*
 * This is a utility function designed to sort an array of numbers.
 * It relies on a global comparison function 'f' for its sorting logic.
 */
function numberSort ( array ) {
  array . sort ( f ) ; // Uses the custom comparison function 'f' for sorting.
  return array ; // Returns the array after it has been sorted.
}


// A global anonymous function 'f' used for numerical comparison in sorting.
// It defines the logic for ascending order (a - b).
var f = function ( a , b )
{
  return a - b ; // Returns a negative value if a < b, positive if a > b, zero if a == b.
} ;


// The main entry point of the script: reads input from standard I/O
// and passes it to the 'main' function for processing.
main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf-8" ) ) ;