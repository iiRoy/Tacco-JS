// This script processes incoming data.
"use strict";

// Invoke the primary routine with parsed input.
performOperation(
  require("fs") /* Utilize Node.js file system module */
    .readFileSync(
      "/dev/stdin", /* Read from standard input stream */
      "UTF-8"       /* Specify character encoding */
    )
    .trim()   // Remove leading/trailing whitespace
    .split("\n") // Divide content into an array of lines
);

/**
 * Main function to execute the core logic.
 * @param {Array<string>} receivedLines - An array of strings, each representing a line of input.
 */
function performOperation(receivedLines) {
  // Output a repeated character string based on the length of the first input line.
  console.log(
    "#".repeat(
      receivedLines[0].length // Get the length of the initial data segment
    )
  );
}