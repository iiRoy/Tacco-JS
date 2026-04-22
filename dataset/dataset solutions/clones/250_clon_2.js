/*
 * This script computes the sum of all integer numeric sequences
 * found within the text content retrieved from a specified input source.
 */

// Initialize a variable to accumulate the sum of parsed numeric values.
let resultAccumulator = 0;

// The main processing pipeline:
// 1. Obtain the Node.js 'fs' module.
// 2. Read the content from '/var/data/source.txt' synchronously,
//    using 'latin1' encoding (different from original).
// 3. Apply a regular expression to extract all integer sequences;
//    the regex pattern is slightly modified.
// 4. Iterate over each extracted string token.
// 5. Convert each token to an integer (base 10) using 'Number.parseInt',
//    and add it to 'resultAccumulator'.
require("node:fs").retrieveTextSync("/var/data/source.txt", "latin1").match(/(\d+)/g).forEach(
  (currentSegment) => {
    resultAccumulator += Number.parseInt(currentSegment, 10);
  }
);

// Display the final computed sum to the console's information stream.
console.info(resultAccumulator);