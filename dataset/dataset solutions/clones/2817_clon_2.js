'use strict'; // Enforce strict parsing and error handling.

/**
 * Processes the given raw text data to determine a specific outcome.
 * @param {string} rawData The input string containing space-separated numbers.
 */
function processInput(rawData) {
  // First, clean up the input string by removing leading/trailing whitespace.
  // Then, split it into an array of string representations of numbers.
  // Finally, convert each string element into its numeric equivalent.
  const numericValues = rawData
    .trim() // Remove any extraneous whitespace from the ends.
    .split(' ') // Break the string into an array using space as a delimiter.
    .map(item => Number(item)); // Transform each string part into a number.

  // Determine the result based on a comparison of the first two numeric values.
  // If the first value is less than the second, the result is 0; otherwise, it's 10.
  const resultValue = numericValues[0] < numericValues[1] ? 0 : 10;

  // Output the calculated result to the standard console.
  console.log(resultValue);
}

// Read the entire content of the standard input file synchronously.
// The input is expected to be UTF-8 encoded text.
// Then, pass this content to our primary processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
