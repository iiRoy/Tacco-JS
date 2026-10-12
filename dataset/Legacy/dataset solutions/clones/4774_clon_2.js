'use strict';

/**
 * This function processes a given string by taking its first line
 * and then replacing all comma characters with space characters.
 *
 * @param {string} inputData - The raw input string, which might contain multiple lines.
 */
function processAndDisplay(inputData) {
  // First, we extract only the initial line from the provided input string.
  // This ensures that subsequent operations only apply to the first line of text.
  let firstLineContent = inputData.split('\n')[0];

  // Next, we create a new string where every occurrence of a comma (',')
  // in the extracted first line is replaced by a single space (' ').
  // The 'g' flag in the regular expression ensures that all commas are replaced, not just the first one.
  const modifiedStringResult = firstLineContent.replace(/,/g, ' ');

  // Finally, the resulting string, with commas replaced by spaces, is printed to the console.
  console.log(modifiedStringResult);
}

// The program starts by reading the entire content of standard input.
// It uses the Node.js 'fs' module to synchronously read the file located at '/dev/stdin'.
// The 'utf8' encoding is specified to correctly interpret the input as text.
const rawInputContent = require("fs").readFileSync("/dev/stdin", "utf8");

// After reading the input, the main processing function is called with the obtained content.
processAndDisplay(rawInputContent);
