'use strict'; // Enforce strict mode for the entire script execution

/**
 * This primary function processes a given input string to perform a specific calculation.
 * It extracts numerical data, counts occurrences of two distinct values (implicitly 0s and 1s),
 * and then computes a result based on the minimum of these counts.
 *
 * @param {string} rawData The raw string content received, typically from standard input.
 */
function processInput(rawData) {
  // Step 1: Parse the raw input string into an array of numeric digits.
  // The string is first split into individual characters, then each character
  // is converted to an integer. The last element (often a newline character)
  // is subsequently removed from the resulting array.
  let digitArray = rawData
    .split('') // Break the input string into an array of single-character strings.
    .map(digitChar => ~~digitChar) // Convert each character to its numerical equivalent (e.g., '1' -> 1, '0' -> 0).
    .slice(0, -1); // Discard the final character, which might be a line break.

  // Step 2: Determine the effective length of the processed numerical array.
  let arrayLength = digitArray.length;

  // Step 3: Calculate the sum of all digits in the array.
  // Assuming the digits are binary (0 or 1), this effectively counts the number of '1's.
  let countOnes = digitArray.reduce((accumulator, currentDigit) => accumulator + currentDigit);

  // Step 4: Calculate the number of '0's by subtracting the count of '1's from the total array length.
  let countZeros = arrayLength - countOnes;

  // Step 5: Output the final computed value.
  // This value is twice the minimum of the two counts (countOnes and countZeros).
  console.log(Math.min(countZeros, countOnes) * 2);
}

// The script execution begins here.
// It reads the entire content from standard input synchronously,
// decodes it as UTF-8, and then passes it to the main processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
