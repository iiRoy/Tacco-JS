"use strict"; // Enforce strict mode for better code quality

/**
 * Processes the raw input string to calculate a specific value.
 * This function acts as the primary entry point for computation.
 * @param {string} rawData - The complete input string received from standard input.
 */
const processInput = (rawData) => {
  // Split the input string into an array of lines based on newline characters.
  const dataRows = rawData.split("\n");

  // Check if the first line of input has a length of exactly one character.
  if (dataRows[0].length === 1) {
    // If it's a single character, output '9' and terminate the function.
    console.log('9');
    return; // Exit early as per the logic.
  }

  // Calculate the length of the first line minus one.
  // This value is used in the final calculation.
  const lengthMinusOne = dataRows[0].length - 1;

  // Extract the first character of the first line, convert it to an integer,
  // and then subtract one. This represents the 'head' value.
  const firstDigitValue = parseInt(dataRows[0][0]) - 1;

  // Perform the final calculation and print the result to the console.
  // The formula is (firstDigitValue + lengthMinusOne * 9).
  console.log(firstDigitValue + lengthMinusOne * 9);
};

// Read the entire content of standard input synchronously,
// decode it as UTF-8, and then pass it to the main processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
