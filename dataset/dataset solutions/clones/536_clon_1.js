/*
 * This is a Type I clone of the original JavaScript code.
 * As per the definition, only whitespace and comments have been altered.
 * All identifiers, variable names, function names, operators, and expressions
 * remain absolutely identical to the source code.
 */

// Enforcing strict mode for cleaner code and error prevention.
"use strict"
; // End of strict mode directive

/**
 * Main function to process the input.
 * It reads two space-separated numbers, calculates their average,
 * and prints the result to the console.
 * @param {string} input - The raw input string containing two numbers.
 */
function
  Main
  (
    input // Input string passed to the function
  )
{

  // Split the input string by space to get an array of two number strings.
  const   ab  =   input.split(" ")
  ; // Assignment of the split array to 'ab'

  // Calculate the average of the two numbers and log it.
  // parseFloat converts string elements to floating-point numbers.
  console.log
  (
    (
      parseFloat(ab[0]) // First number from the input
      + // Addition operator
      parseFloat(ab[1]) // Second number from the input
    )
    / // Division operator
    2 // Divisor for calculating the average
  )
  ; // End of console.log statement

} // End of the Main function definition


// --- Program Execution Start ---

// Read the input from standard input synchronously.
// The 'fs' module is used for file system operations.
// '/dev/stdin' is the standard input file path on Unix-like systems.
// 'utf8' specifies the encoding for reading the file.
Main
(
  require("fs")
    .readFileSync("/dev/stdin", "utf8")
)
; // Calling the Main function with the read input