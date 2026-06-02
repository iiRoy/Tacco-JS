"use strict";

/**
 * Manages the processing of incoming data.
 * @param {string} rawDataString - The raw string obtained from the input source.
 */
function ProcessInputData(rawDataString) {
  // First, remove any leading or trailing whitespace from the input string.
  // Then, divide the string into an array of substrings using a space as the delimiter.
  let processedSegments = rawDataString.trim().split(' ');

  // Output the concatenation of the second segment (at index 1)
  // and the first segment (at index 0) to the standard console.
  console.log(processedSegments[1] + processedSegments[0]);
}

// Execute the primary data processing function.
// It reads the content of standard input synchronously,
// interpreting it as UTF-8 encoded text, and passes it along.
ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
