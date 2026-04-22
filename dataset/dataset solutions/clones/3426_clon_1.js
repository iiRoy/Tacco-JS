/*
 * This JavaScript code snippet performs a specific calculation:
 * it reads a string from standard input, then iterates through
 * all possible 3-character substrings, converts each to an integer,
 * calculates the absolute difference from the number 753,
 * and finally determines the minimum of these absolute differences.
 */

// Initialize the 's' variable.
// 's' will hold the entire content read from standard input.
s = require ( "fs" ) . readFileSync (
  "/dev/stdin" , // Specifies the input source: standard input
  "utf8"         // Specifies the encoding for reading the file content
) ; // Semicolon terminates the first statement.


// This is the core logic to find the minimum difference.
Math . min . apply (
  // The 'apply' method is used here to pass an array of arguments
  // to Math.min, effectively finding the minimum value in an array.
  null , // 'this' context for Math.min (not relevant for static methods)

  // The second argument to 'apply' is an array of values over which
  // Math.min will operate.
  [
    // Create an array that will be mapped.
    // The length of this array determines how many 3-character slices
    // will be processed from the input string 's'.
    ... Array ( s . length - 2 )
  ] . map (
    // The 'map' function iterates over the created array,
    // generating a new array of absolute differences.
    // '_' represents the current element (which is undefined here),
    // and 'i' is the current index.
    ( _ , i ) =>
      Math . abs ( // Calculate the absolute value of the difference.
        753 - // The target number for comparison.
        (
          s . slice ( i , i + 3 ) // Extract a 3-character substring from 's'.
          |
          0 // Bitwise OR with 0 converts the substring to an integer.
            // If the substring cannot be parsed as a number, it becomes 0.
        )
      )
  )
) ; // Semicolon terminates the second, more complex statement.

// The result of Math.min.apply is the final computed minimum difference,
// which would typically be used or printed, but is not explicitly
// handled further in this specific snippet.