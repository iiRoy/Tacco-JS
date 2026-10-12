'use strict'; // Enforce strict parsing and error handling in the script.

/**
 * This function processes the raw input string to perform a calculation.
 * It expects two lines of input, each containing a single number.
 * The first number is squared, and the second number is subtracted from the result.
 *
 * @param {string} rawData - The complete input string, typically read from stdin.
 */
const processInput = (rawData) => {
  // Split the input string by newline characters, then further split each line by spaces.
  // This creates an array of arrays, where each inner array represents a line's components.
  const parsedLines = rawData.split('\n').map((linePart) => linePart.split(' '));

  // Extract the first number from the first line of the parsed input.
  // The radix 10 is explicitly provided for parseInt.
  const firstValue = parseInt(parsedLines[0][0], 10);

  // Extract the second number from the second line of the parsed input.
  // The radix 10 is explicitly provided for parseInt.
  const secondValue = parseInt(parsedLines[1][0], 10);

  // Perform the calculation: square the first value and subtract the second value.
  // Then, print the final result to the console.
  console.log(firstValue * firstValue - secondValue);
};

// Read the entire content of standard input synchronously using Node.js 'fs' module.
// The input is expected to be UTF-8 encoded.
// Then, pass the read content to the main processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
