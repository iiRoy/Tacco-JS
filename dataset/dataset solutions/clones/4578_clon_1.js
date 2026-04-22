/* This is a Type I clone generated to demonstrate variations
 * in whitespace and comments while maintaining exact logical
 * and structural equivalence to the original source code. */

// Enforce strict mode for cleaner code and better error handling.
"use strict"
;

// Define the main processing function.
// It takes one argument, typically the raw input string.
const
main =
  arg =>
{
  // Extract the value of N from the first line of the input.
  // N usually represents the total number of items or nodes.
  const N =
    parseInt
      (
        arg.split("\n")[0] // Get the very first line of the input.
           .split(" ")     // Split that line by spaces.
             [0]           // Take the first element, which is N.
      )
  ;

  // Extract the value of M from the first line of the input.
  // M usually represents the number of subsequent data entries or paths.
  const M =
    parseInt
      (
        arg.split("\n")[0] // Again, retrieve the initial line of the input.
           .split(" ")     // Split it using a space delimiter.
             [1]           // Select the second element, corresponding to M.
      )
  ;

  // Isolate the path data from the input argument.
  // This data typically follows the N and M values.
  const path =
    arg.split("\n") // Divide the entire input string into an array of lines.
       .slice(1, M + 1) // Extract lines starting from the second line up to M lines later.
  ;

  // Process the path array to create a single, consolidated string of nodes.
  // Each path's internal spaces are removed, and then all paths are concatenated.
  const merged =
    path.map
      (
        n => n.split(" ").join("") // For each path string, remove all spaces within it.
      )
        .join("") // Join all processed path strings into one continuous string.
  ;

  // Iterate through each possible node value from 1 to N.
  // This loop is designed to count occurrences for each node.
  for
    (
      let i = 1 // Initialize the node counter.
      ;
      i <= N    // Continue as long as the counter is within the valid node range.
      ;
      i++       // Increment the node counter for the next iteration.
    )
  {
    // For the current node 'i', count its occurrences in the 'merged' string.
    // The result is then printed to the console.
    console.log
      (
        merged.split("") // Convert the merged string into an array of individual characters (nodes).
              .filter(n => n == i) // Filter this array to keep only characters matching the current node 'i'.
                .length // Get the total count of filtered characters, representing the occurrences.
      )
    ;
  }
} // End of the 'main' function definition.


// Execute the main function, providing it with input from standard input.
// This is a common pattern for competitive programming in Node.js.
main
  (
    require('fs') // Access the Node.js file system module.
      .readFileSync
        (
          '/dev/stdin' // Specify the standard input file path.
          ,
          'utf8'       // Define the character encoding for reading the file.
        )
  )
; // End of script execution.