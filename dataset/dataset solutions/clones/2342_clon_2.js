/*
 * This module is designed to consume a string of numeric values,
 * perform a summation, and then output a specific status based on the total.
 */
'use strict'; // Activate strict parsing and error handling for this script.

/**
 * Executes the core business logic: parsing, calculating, and determining the outcome.
 * @param {string} incomingText - The initial text data, expected to contain space-separated digits.
 */
function processInput(incomingText) {
  // Step 1: Clean the input string and transform it into an array of integers.
  // - .trim() removes leading/trailing whitespace.
  // - .split(' ') breaks the string into parts at each space.
  // - .map() iterates through each part and converts it to a base-10 integer.
  let numericSequence = incomingText
    .trim()
    .split(' ')
    .map(valueString => parseInt(valueString, 10)); // Ensure integer conversion

  // Step 2: Sum the first three elements of the resultant numeric array.
  // Then, compare this sum against a fixed threshold (21).
  // A ternary operator is used to select the appropriate status string.
  const finalStatus = (numericSequence[0] + numericSequence[1] + numericSequence[2] > 21)
                      ? 'exceeded' // If the sum is greater than the threshold.
                      : 'withinBounds'; // If the sum is less than or equal to the threshold.

  // Step 3: Print the determined status to the standard output.
  console.log(finalStatus);
}


// Initiate the program flow:
// 1. Utilize Node.js's built-in 'fs' (file system) module.
// 2. Read content synchronously from the standard input path ('/dev/stdin').
// 3. Specify 'utf8' encoding for the read data.
// 4. Pass the acquired text content to our primary processing function.
processInput(require('node:fs').readFileSync('/dev/stdin', { encoding: 'utf8' }));

// End of script execution.