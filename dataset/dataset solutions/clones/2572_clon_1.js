/*
 * This JavaScript program is designed to read a single numerical input
 * from standard input, calculate its cube, and then print the result
 * to standard output.
 *
 * The script operates in "strict mode" to ensure cleaner code and
 * better error detection during execution.
 */

"use strict" /* This declaration enables strict mode throughout the script,
                which helps in writing more robust and error-free code
                by enforcing stricter parsing and error handling rules. */

// We import the 'fs' module, which provides an API for interacting
// with the file system. Specifically, 'readFileSync' is used here
// to synchronously read the content of a file.
const arg_str =
  require( 'fs' ) // Obtain the file system module.
    . readFileSync(
      '/dev/stdin' , // Specifies the file path for standard input.
      'UTF-8'        // Defines the character encoding for reading the file content.
    )

// The content read from standard input (`arg_str`) is a single string.
// We split this string into an array of substrings, where each element
// represents a line from the input, delineated by the newline character.
const args_lines =
  arg_str
    . split( '\n' ) // Splits the string into an array at each newline occurrence.

// From the array of lines, we extract the very first element.
// This element is expected to contain the numerical value 'n' that
// we need to process in the subsequent steps of the program.
const n = args_lines[ 0 ] // Accesses the first line of the input.

// Finally, we compute the cube of the number 'n' (i.e., n * n * n).
// The multiplication operator automatically coerces the string value
// of 'n' into a number before performing the arithmetic operation.
console
  . log(
    n * n * n // The expression calculates 'n' cubed.
  ) // Outputs the computed cube of 'n' to the console.

// End of the JavaScript program.