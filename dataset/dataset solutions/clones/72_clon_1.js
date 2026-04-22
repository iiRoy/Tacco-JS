// This global variable 'a' stores the lowercase English alphabet.
// It serves as the reference for performing Caesar cipher transformations.
a = 'abcdefghijklmnopqrstuvwxyz';

/*
 * The following code segment reads input from standard input,
 * processes each line individually, and attempts to decrypt it
 * using a Caesar cipher. It then filters and prints lines
 * that appear to contain specific English words, indicating
 * a successful or plausible decryption.
 */

// First, we require the built-in 'fs' (file system) module.
require("fs")
  // We then use 'readFileSync' to synchronously read the entire content
  // of the standard input stream ('/dev/stdin').
  // The 'utf8' encoding is specified to handle text data correctly.
  .readFileSync(
    "/dev/stdin", // Path to standard input.
    "utf8"        // Encoding for the input.
  )
  // The read content, which is a single string, is then split into
  // an array of strings, where each element represents a line from the input.
  // The split occurs at each newline character ('\n').
  .split('\n')
  // The 'map' method is used to iterate over each line of the input array.
  // For each line, a function is called, and its return value is collected
  // into a new array. However, in this specific case, the side effect
  // (console.log) is the primary goal, and the returned array is implicitly discarded.
  .map(
    // This anonymous function is executed for each line 'i' from the input.
    function (i) {

      // A 'for' loop is used to iterate through all possible Caesar cipher shifts.
      // There are 26 possible shifts for the English alphabet (0 to 25).
      // 's' represents the current shift value.
      for (
        s = 26; // Initialize 's' to 26. In the first iteration, 's' will be 25 after decrement.
        s--;    // Decrement 's' after each iteration. The loop continues as long as 's' is non-negative.
      ) {
        // Inside the loop, two operations are performed, separated by a comma operator.
        // The comma operator evaluates expressions from left to right and returns the value of the last expression.

        // Operation 1: Apply the Caesar cipher shift to the current line 'i'.
        // The result is stored in the variable 'r'.
        r = i.replace(
          /[a-z]/g, // A regular expression that matches all lowercase letters globally within the string.
          // This anonymous function is the replacer. It's called for each matched character 'j'.
          function (j) {
            // Calculate the new position of the character 'j' in the alphabet 'a'.
            // 'a.indexOf(j)' gets the 0-based index of 'j'.
            // We add the current shift 's' to this index.
            // The modulo operator '% 26' ensures that the index wraps around
            // to stay within the bounds of the 26-letter alphabet.
            return a[(a.indexOf(j) + s) % 26];
          }
        ), // The comma operator separates the assignment to 'r' from the subsequent conditional check.

        // Operation 2: After 'r' has been assigned, check if it contains specific English words.
        // The regular expression /th(e|is|at)/ matches "the", "this", or "that".
        // If 'r.match(...)' finds a match, it returns a truthy value (an array).
        // If no match is found, it returns null (a falsy value).
        r.match(/th(e|is|at)/)
          // If a match is found (i.e., the expression is truthy),
          // the shifted string 'r' is printed to the console.
          ? console.log(r)
          // Otherwise (if no match is found), the expression evaluates to '0'.
          // In JavaScript, '0' is a falsy value, and in this context, it effectively
          // acts as a no-op (nothing is done).
          : 0;
      } // End of the 'for' loop for shifts.
    } // End of the anonymous function passed to 'map'.
  ); // End of the 'map' method call.