// @ts-check

/**
 * Determines if a given numeric value is an even number.
 * This is a small helper function introduced for Type III modification.
 * @param {number} numericValue The number to check for evenness.
 * @returns {boolean} True if the number is even, false otherwise.
 */
function isValueEven(numericValue) {
  const remainderAfterDivision = numericValue % 2;
  return remainderAfterDivision === 0;
}

/**
 * Processes two input numbers to determine a specific "harmonic-like" outcome.
 * If their sum is even, it outputs half of the sum. Otherwise, it outputs a specific message.
 * @param {number} firstOperand The first number for the operation.
 * @param {number} secondOperand The second number for the operation.
 */
function processNumericPair(firstOperand, secondOperand) {
  const IMPOSSIBLE_RESULT_TEXT = 'IMPOSSIBLE'; // Introduced as a constant for Type III.

  let totalSum = firstOperand + secondOperand; // Renamed 's' to 'totalSum', changed 'var' to 'let'.

  // Using the new helper function to check for evenness.
  const isTotalSumEven = isValueEven(totalSum); // Introduced a boolean variable for clarity.

  if (isTotalSumEven) {
    let calculatedHalf = totalSum / 2; // Renamed 'k' to 'calculatedHalf', changed 'var' to 'let'.
    console.log(calculatedHalf);
  } else {
    console.log(IMPOSSIBLE_RESULT_TEXT);
  }
}

// Renamed variables for command-line arguments.
let argumentOne = Number(process.argv[2]); // Changed 'var' to 'let'.
let argumentTwo = Number(process.argv[3]); // Changed 'var' to 'let'.

// Call the refactored function with the processed arguments.
processNumericPair(argumentOne, argumentTwo);
