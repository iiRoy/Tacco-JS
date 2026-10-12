'use strict'; // Enforce strict mode for cleaner code execution

/**
 * This function processes a string of numbers,
 * performs a specific calculation, and prints the result.
 * @param {string} rawData - The input string containing space-separated numbers.
 */
const processInput = (rawData) => {
  // First, split the incoming string by spaces, then convert each part to an integer.
  // The 'map' function iterates over the array of string parts.
  const parsedNumbers = rawData.split(' ').map((currentStr) => {
    // Use parseInt to convert the string representation to a whole number.
    return parseInt(currentStr, 10); // Radix 10 for decimal conversion.
  });

  // Extract the first numerical value from the processed array.
  const firstVal = parsedNumbers[0];

  // Extract the second numerical value from the processed array.
  const secondVal = parsedNumbers[1];

  // Perform the calculation: (first value - 1) multiplied by (second value - 1).
  // Then, output the final computed result to the standard console.
  console.log((firstVal - 1) * (secondVal - 1));
};

// Read the entire content from standard input, assuming UTF-8 encoding.
// Then, pass this content to our primary processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf-8'));
