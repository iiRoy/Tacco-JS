'use strict'; // Activates strict mode for the entire script, promoting cleaner code.

/**
 * This function serves as the primary entry point for processing input data.
 * It reads, parses, and evaluates the input to produce a specific output string.
 *
 * @param {string} rawInputData - The complete raw string content received from the input source.
 */
function processDataEntry(rawInputData) {
  // First, clean up the raw input by removing leading/trailing whitespace,
  // then split it into an array of strings based on newline characters.
  let parsedLines = rawInputData.trim().split('\n');

  // Evaluate the first line of input:
  // Convert the first element of the parsed array to an integer (base 10).
  // If this integer value is greater than or equal to 3200,
  // the output string will be the second element of the parsed array.
  // Otherwise, the output string will be the literal 'red'.
  const finalResultString = parseInt(parsedLines[0], 10) >= 3200 ? parsedLines[1] : 'red';

  // Display the determined final result string to the standard output.
  console.log(finalResultString);
}

// Execute the main processing function by reading content from standard input.
// The 'fs' module is used to synchronously read the file at '/dev/stdin'
// with UTF-8 encoding, and the content is then passed to 'processDataEntry'.
processDataEntry(require('fs').readFileSync('/dev/stdin', 'utf8'));
