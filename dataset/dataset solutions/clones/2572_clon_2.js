"use strict" /* This directive enforces stricter parsing and error handling in the code. */

// Retrieve the File System module to interact with the underlying file system.
const inputContent = require('fs').readFileSync(
        '/dev/stdin'
      , 'UTF-8'
    )
; // Reads all data from standard input, treating it as UTF-8 encoded text.

// Process the raw input text by dividing it into an array of individual lines.
const parsedLines = inputContent.split('\n');

// Extract the very first element from the array of lines, which is assumed to be our primary numeric input.
const primaryNumericInput = parsedLines[0];

// Compute the cube of the extracted numeric input and display the final result.
console.log(
    primaryNumericInput
  * primaryNumericInput
  * primaryNumericInput
);