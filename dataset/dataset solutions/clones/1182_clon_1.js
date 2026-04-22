/*
 * This is a Type I clone of the original JavaScript code.
 * It strictly adheres to the definition:
 * - All identifiers, variable names, function names, operators, and expressions are identical.
 * - Only whitespace (spaces, tabs, newlines) and comments have been altered.
 * - The changes are extensive to provide a visually distinct appearance.
 */

// Enforce strict mode for better code quality and error handling
"use strict"
;

// Main execution block: read input, process, and pass to the main function
main (
  require("fs")  // Access the Node.js file system module
  .readFileSync(
    "/dev/stdin", // Path to standard input
    "utf8"        // Specify UTF-8 encoding for input
  )
  .replace(
    /\r?\n$/,     // Remove trailing newline character(s) if present
    ""
  )
  .split(
    /\r?\n/       // Split the input string by newline characters into an array of lines
  )
)
;

// Define the main processing function
function main ( lines )
{
  // Parse the second line of input into an array of numbers (x coordinates/values)
  var x = lines[1]
            .split(" ")     // Split the string by spaces
            .map( Number )  // Convert each substring to a number
  ;

  // Parse the third line of input into an array of numbers (y coordinates/values)
  var y = lines[2]
            .split(" ")     // Split the string by spaces
            .map( Number )  // Convert each substring to a number
  ;


  // Define a helper function to calculate the Minkowski distance between two vectors
  function distance ( x, y, p )
  {
    // Calculate the sum of absolute differences raised to the power of 'p'
    var sum = x
      .map(
        function ( x_val, i )
        {
          // Calculate |x_i - y_i|^p for each corresponding element
          return Math.pow( Math.abs( x_val - y[i] ), p )
        }
      )
      .reduce(
        function ( accumulator, current_value )
        {
          // Sum all the calculated values
          return accumulator + current_value
        }
      )
    ;

    // Return the p-th root of the sum
    return Math.pow( sum, 1 / p )
  }


  // Output the Manhattan distance (L1 norm)
  console.log( distance( x, y, 1 ) )
  ;

  // Output the Euclidean distance (L2 norm)
  console.log( distance( x, y, 2 ) )
  ;

  // Output the L3 norm (a generalization of Euclidean distance)
  console.log( distance( x, y, 3 ) )
  ;

  // Output the Chebyshev distance (L-infinity norm), which is the maximum absolute difference
  console.log(
    Math.max.apply(
      0, // 'this' context for apply (not relevant here, can be null or undefined)
      x.map(
        function ( x_val, i )
        {
          // Calculate |x_i - y_i| for each corresponding element
          return Math.abs( x_val - y[i] )
        }
      )
    )
  )
  ;
}