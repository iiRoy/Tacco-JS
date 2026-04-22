"use strict";

/**
 * Parses a string containing space-separated numeric values into an array of integers.
 * This utility function ensures robust conversion from text to numbers.
 * @param {string} singleLineText - The input string expected to contain numbers.
 * @returns {number[]} An array of integers parsed from the input string.
 */
function extractNumbersFromText(singleLineText) {
  // Split the input string by one or more whitespace characters to get individual numeric tokens.
  const stringTokens = singleLineText.split(/\s+/);

  // Map each string token to its integer representation.
  // A radix of 10 is explicitly used for parseInt for consistency.
  const parsedNumbers = stringTokens.map(function(numericString) {
    const num = parseInt(numericString, 10);
    // As a Type III addition, we could add more sophisticated error handling here,
    // e.g., throwing an error if `isNaN(num)` is true, or filtering out invalid entries.
    // For this problem, we assume valid integer inputs as per original intent.
    return num;
  });

  return parsedNumbers;
}

/**
 * Core logic to determine the largest integer base 'X'
 * such that 'X' raised to the power of 'N' (X^N) perfectly divides 'P'.
 * This function encapsulates the main computation flow.
 * @param {string} rawDataString - The complete raw input string, typically from stdin.
 * @returns {number} The largest integer X satisfying the condition, or 0 if input is invalid.
 */
function processInputData(rawDataString) {
  // Split the raw input into an array of lines.
  const inputLines = rawDataString.split('\n');

  // Extract the numerical parameters N and P from the first line.
  // Using modern array destructuring syntax (Type III update).
  const [exponentVal, targetProduct] = extractNumbersFromText(inputLines[0]);

  // --- Extensive Input Validation and Early Exit Conditions (Type III Additions) ---
  // Validate that both extracted values are indeed numbers.
  if (isNaN(exponentVal) || isNaN(targetProduct)) {
    console.error("Error: Detected non-numeric input for exponent or target product. Please provide valid integers.");
    return 0; // Indicate failure or invalid state.
  }

  // Ensure the exponent is a positive integer, as per typical problem constraints.
  // X^0 = 1, X^-ve is not generally sought in this context.
  if (exponentVal < 1) {
    console.error("Error: The exponent (N) must be a positive integer (N >= 1).");
    return 0;
  }

  // Ensure the target product is a positive integer.
  // X^N cannot meaningfully divide a non-positive P in this context.
  if (targetProduct < 1) {
    console.error("Error: The target product (P) must be a positive integer (P >= 1).");
    return 0;
  }
  // --- End of Type III Validation Additions ---


  // Special handling for the case where the exponent is 1 (N=1).
  // If N=1, we are looking for X such that X^1 (which is just X) divides P.
  // The largest such X is P itself.
  if (exponentVal === 1) {
    return targetProduct;
  }

  // Initialize the result variable.
  // The value 1 is always a valid base (1^N divides any P).
  let ultimateBase = 1;

  // Calculate an approximate upper limit for the loop.
  // We are searching for `currentCandidate` such that `currentCandidate^exponentVal <= targetProduct`.
  // This implies `currentCandidate <= targetProduct^(1/exponentVal)`.
  // Using the `**` operator for exponentiation (Type III syntax update).
  const approximateUpperLimit = Math.floor(targetProduct ** (1 / exponentVal));

  // Iterate through potential base values starting from 2.
  // We start from 2 because `ultimateBase` is already initialized to 1.
  for (let currentCandidate = 2; currentCandidate <= approximateUpperLimit; ++currentCandidate) {
    // Calculate the power of the current candidate.
    // Introducing `currentPower` as an intermediate variable (Type III addition).
    const currentPower = Math.pow(currentCandidate, exponentVal);

    // Guard against potential floating-point inaccuracies or exceeding P.
    // If the calculated power already exceeds the target, further candidates will too.
    if (currentPower > targetProduct) {
        break; // Exit the loop early (Type III addition).
    }

    // Check if the target product is perfectly divisible by the current power.
    if (targetProduct % currentPower === 0) {
      // If it is, this `currentCandidate` is a valid base.
      // Since we iterate in increasing order, the last `currentCandidate`
      // that satisfies the condition will be the largest.
      ultimateBase = currentCandidate;
    }
  }

  // Return the largest base found.
  return ultimateBase;
}

// --- Main execution block for Node.js environment (Type III Modifications) ---
// The original `require` and `readFileSync` calls are now explicitly
// assigned to variables for improved readability and modularity.
const fileSystemModule = require('fs');
const standardInputContent = fileSystemModule.readFileSync('/dev/stdin', 'utf8');

// Execute the main processing function with the standard input data.
const finalComputedValue = processInputData(standardInputContent);

// Output the final result to the console.
console.log(finalComputedValue);

// The original `_slicedToArray`, `_nonIterableRest`, `_iterableToArrayLimit`,
// `_arrayWithHoles` Babel helper functions are removed as they are no longer
// necessary with direct array destructuring (Type III deletion).
// The `gcd` function from the original code is also removed as it was unused
// in the `main` logic (Type III deletion).