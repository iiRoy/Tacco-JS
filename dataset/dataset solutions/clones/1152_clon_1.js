/*
 * This file is a Type I clone of another JavaScript source.
 * The primary objective here is to demonstrate extensive modifications
 * to whitespace and comments only, while preserving the exact
 * logical structure, identifiers, and expressions.
 *
 * All variable names, function names, operators, and constants
 * remain precisely as they were in the original code.
 *
 */

var inputr =
  []
; // Declare and initialize an array named 'inputr'

// Push a complex string literal into the 'inputr' array.
// This string is extracted from a multi-line comment within an IIFE.
inputr.push(
  (
    function() { /*
5 4
1 1 1 1
1 1 0 1
1 0 0 0
1 1 0 1
1 1 1 1
*/ } // The multi-line comment content is crucial data and MUST remain unchanged.
  )
    .toString() // Convert the function's source code to a string.
    .match(
      /[^]*\/\*([^]*)\*\/\}$/ // Use a regular expression to extract the content between /* and */.
    )[1] // Retrieve the first captured group, which is the content itself.
    .replace(
      /\n/g, // Find all newline characters globally.
      "\n"   // Replace them with newline characters (effectively standardizing line endings).
    )
)
; // End of the inputr.push() call.


var ans = [
  6
]; // Define an array 'ans' containing a single numerical value.

var log =
  console.log
; // Create an alias 'log' for console.log, though it's not extensively used here.

// Check if the code is running in a Node.js-like environment by looking for the 'process' object.
if (
  typeof process
  !=
  "undefined"
) {
  var input =
    ""
  ; // Initialize an empty string to accumulate standard input.

  // Resume the standard input stream to listen for data.
  process.stdin.resume();

  // Set the encoding for the incoming standard input data.
  process.stdin.setEncoding(
    'utf8'
  );

  // Attach an event listener for 'data' events on the standard input stream.
  process.stdin.on(
    'data',
    function(chunk) {
      // Append each received chunk of data to the 'input' string.
      input
        +=
        chunk;
    }
  );

  // Attach an event listener for the 'end' event on the standard input stream.
  process.stdin.on(
    'end',
    function() {
      // First, output a hardcoded numerical value to the console.
      console.log(
        6
      ); // This is a fixed output.

      // Then, determine the final output based on the collected input.
      // It finds the index of the collected 'input' string within 'inputr'
      // and uses that index to retrieve a value from the 'ans' array.
      console.log(
        ans[
          inputr.indexOf(
            input
          )
        ]
      );
    }
  );
} // End of the Node.js environment-specific block.