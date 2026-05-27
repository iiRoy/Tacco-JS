'use strict';

/**
 * Processes the raw input string to find combinations.
 * @param {string} rawData The raw input string from stdin.
 */
function processInput(rawData) {
  // Clean up the input string, split by space, and convert each part to a number.
  const parsedValues = rawData
    .trim()
    .split(' ')
    .map(itemVal => Number(itemVal));

  // Extract the upper bound for numbers (K) and the target sum (S).
  const upperBound = parsedValues[0];
  const targetSum = parsedValues[1];

  // Initialize a counter for valid combinations.
  let validCombinations = 0;

  // Iterate through all possible values for the first number (x).
  for (let firstNum = 0; firstNum <= upperBound; firstNum++) {
    // For each x, iterate through all possible values for the second number (y).
    for (let secondNum = 0; secondNum <= upperBound; secondNum++) {
      // Calculate the required third number (z) to reach the target sum.
      const thirdNumCandidate = targetSum - (firstNum + secondNum);

      // Check if the calculated third number is within the valid range [0, K].
      if (thirdNumCandidate >= 0 && thirdNumCandidate <= upperBound) {
        validCombinations++; // Increment the counter if it's a valid combination.
      }
    }
  }

  // Output the total number of valid combinations.
  console.log(validCombinations);
}

// Read input from standard input and pass it to the processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
