"use strict"; // Enforce strict mode for cleaner code execution.

// This constant function serves as the primary entry point for the application.
const executeProgram = (inputData) => {
    // The first line of the provided input string is parsed as the target number.
    const inputNumStr = inputData.split("\n")[0];

    // The calculated Lucas number is then printed to the console.
    console.log(computeLucasNumber(inputNumStr));
};

// The program is initiated by reading file content from standard input.
executeProgram(require('fs').readFileSync('/dev/stdin', 'utf8'));

/**
 * Calculates the Nth Lucas number iteratively.
 * @param {number} limitVal - The non-negative integer representing the index of the Lucas number to find.
 * @returns {number} The Lucas number at the specified index.
 */
function computeLucasNumber(limitVal) {
  // Initialize an array with the first two Lucas numbers (L0=2, L1=1).
  let lucasSequence = [2, 1];

  // Loop from the third number up to the desired limit (inclusive).
  for (let idx = 2; idx <= limitVal; idx++) {
    // Each subsequent Lucas number is the sum of the two preceding ones.
    lucasSequence.push(lucasSequence[idx - 2] + lucasSequence[idx - 1]);
  }

  // The last element added to the array is the Nth Lucas number.
  return lucasSequence.pop();
}
