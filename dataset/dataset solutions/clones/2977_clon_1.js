/* This file enforces strict parsing and execution of JavaScript code. */
"use strict" ;

// === Input Processing Section ===

// A comment explaining the purpose of the following block.
// This block reads input data from standard input.
const
  input

  =

  require
  (
    "fs"
  )
    // Synchronously reads the entire content of the file.
    . readFileSync
    (
      "/dev/stdin" ,
      "utf8"
    )
    // Splits the content by spaces to get an array of string values.
    . split
    (
      " "
    )
;

/*
 * Parse the input strings into integer variables.
 * Each variable represents a specific color component or total sum.
 */

const R = parseInt ( input [ 0 ] , 10 ) ; // Red component value.

const G = parseInt ( input [ 1 ] , 10 ) ; // Green component value.

const B = parseInt ( input [ 2 ] , 10 ) ; // Blue component value.

const N = parseInt ( input [ 3 ] , 10 ) ; // Total target sum.

// Initialize the answer counter.
let ans = 0 ; /* This variable will store the final count of valid combinations. */

// === Core Logic: Iteration and Combination Counting ===

// Outer loop: iterates through possible counts for the 'Red' component.
// The upper bound ensures that r * R does not exceed N.
for ( let r = 0 ; r <= N / R ; r ++ )
{
  // Inner loop: iterates through possible counts for the 'Green' component.
  // The upper bound ensures that (r * R + g * G) does not exceed N.
  for ( let g = 0 ; g <= ( N - ( r * R ) ) / G ; g ++ )
  {
    // Calculate the remaining sum required after accounting for 'r' red and 'g' green components.
    const rest = N - ( r * R + g * G ) ;

    // Check if the 'rest' can be perfectly divided by the 'Blue' component value.
    // If it can, it means a valid combination (r, g, b) exists where b = rest / B.
    if ( rest % B === 0 )
    {
      // Increment the counter for valid combinations.
      ans ++ ;
    }
  }
}

// === Output Section ===

// Print the final calculated answer to standard output.
console . log ( ans ) ; // Display the total number of combinations found.