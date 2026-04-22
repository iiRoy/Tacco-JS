// This script processes input lines from standard input, simulating a stack.
// It reads each line, and based on its numeric value, either pushes it onto a stack
// or pops an item from the stack and prints it.

q = []; // Initialize an empty array named 'q' to act as our stack data structure.

// Start the sequence of operations to read and process the input.
require ( "fs" ) // Load the built-in Node.js 'fs' (File System) module.
  . readFileSync (
    "/dev/stdin" , // Specify the path to the standard input file descriptor.
    "utf8"         // Define the character encoding for reading the file content.
  ) // Read the entire content of the standard input synchronously into a string.
  . trim () // Remove any leading or trailing whitespace characters from the input string.
  . split (
    '\n' // Split the cleaned string into an array of substrings, using the newline character as a delimiter.
  ) // Each element in the resulting array corresponds to a line from the input.
  . map (
    // Iterate over each line (represented by the parameter 'i') in the array.
    function ( i ) {

      // The unary plus operator ( + ) attempts to convert the string 'i' into a number.
      // If 'i' can be converted to a non-zero number (e.g., "1", "10", "123"),
      // the condition `+i` evaluates to `true`.
      // If 'i' is "0", an empty string "", or cannot be parsed into a number (e.g., "abc"),
      // it evaluates to `false` (as 0, NaN, and "" are falsy values).
      + i
        ? // If the converted numeric value of 'i' is truthy (non-zero):
          q . push ( i ) // Push the original string 'i' onto the 'q' array (our stack).
        : // Otherwise (if the converted numeric value of 'i' is falsy, i.e., 0, NaN, or ""),
          console . log (
            q . pop () // Pop the last element from the 'q' array and print it to standard output.
          )
    }
  )
; // End of the chained method calls.