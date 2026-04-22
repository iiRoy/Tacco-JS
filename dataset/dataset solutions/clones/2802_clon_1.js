// This file enforces strict mode for better code quality and error handling.
'use strict'
; // End of strict mode declaration

/**
 * Main function to process the input and compute the result.
 * It reads two numbers, N and L, from the standard input,
 * then calculates a specific sum based on these numbers.
 *
 * @param {string} stdin - The standard input string, expected to contain
 *                         two space-separated integers (N and L).
 */
function
main
(
  stdin // The input string containing numbers separated by spaces.
) {
  // Parse the input string into an array of integers.
  // The first number is N, and the second is L.
  const
    input
    =
    stdin
      .split( // Split the input string by space characters.
        ' '
      )
      .map( // Map each resulting string part to an integer.
        v
        => // Arrow function for mapping.
        parseInt(
          v, // The string value to parse as an integer.
          10 // The radix (base 10) for parsing, ensuring decimal conversion.
        )
      )
  ; // Semicolon terminates the 'const input' declaration.

  // Extract N (number of elements to consider) and L (starting value)
  // from the parsed input array.
  const N = input[0]
  ; // N is the first element in the input array.
  const L = input[1]
  ; // L is the second element in the input array.

  // Initialize variables for accumulating the sum and tracking the minimum
  // absolute value.
  let
    sum
    =
    0
  ; // 'sum' will accumulate the total sum of numbers in the sequence.
  let
    min
    =
    Infinity
  ; // 'min' will store the number from the sequence with the smallest
    // absolute value. Initialized to Infinity to ensure the first
    // comparison updates it correctly.

  // Begin a loop that iterates N times, starting from L.
  // The sequence of numbers considered is L, L+1, ..., L+N-1.
  for
  (
    let
      i // Declare loop counter 'i'.
      =
      L // Initialize 'i' with the starting value L.
    ; // Semicolon separates initialization from condition.
    i
    <
    L
    +
    N // Loop continues as long as 'i' is less than L + N.
    ; // Semicolon separates condition from increment.
    ++
    i // Increment 'i' by 1 in each iteration.
  )
  {
    // Add the current number 'i' to the total sum.
    sum
      +=
      i
    ; // This is equivalent to sum = sum + i;

    // Check if the absolute value of the current number 'i' is
    // smaller than the absolute value of the number currently stored in 'min'.
    if
    (
      Math // Access the built-in Math object.
        .abs( // Call the 'abs' method to get the absolute value.
          i // Absolute value of the current loop number.
        )
      < // Comparison operator: less than.
      Math
        .abs( // Get the absolute value of the current 'min'.
          min
        )
    )
    {
      // If the condition is true, update 'min' to the current number 'i'.
      // This ensures 'min' always holds the number with the smallest
      // absolute value encountered so far.
      min
        =
        i
      ;
    }
  } // End of the for loop block.

  // After the loop, calculate the final result:
  // the total sum of numbers minus the number that had the smallest
  // absolute value in the sequence.
  console
    .log( // Use console.log to output the final result to standard output.
      sum
      - // Subtraction operator.
      min // Subtract the 'min' value from the 'sum'.
    )
  ; // Semicolon terminates the console.log statement.
} // End of the main function definition.


// This section handles reading input from /dev/stdin and invoking the main function.
// It ensures the script can be run in environments like competitive programming platforms.
main
(
  require // Use 'require' to load the Node.js built-in 'fs' (file system) module.
    (
      'fs'
    )
    .readFileSync( // Call the 'readFileSync' method to read a file synchronously.
      '/dev/stdin', // Specify the path to standard input, commonly '/dev/stdin' on Unix-like systems.
      'utf8' // Specify the character encoding as UTF-8 for the file content.
    )
)
; // Semicolon terminates the main function call.