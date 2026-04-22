'use strict';

/**
 * Processes financial input data to find a matching base value.
 * This function attempts to determine a gross amount based on two
 * provided tax amounts calculated at different rates, both floored.
 * It searches for the smallest positive integer gross amount that satisfies
 * the given floored tax values.
 *
 * @param {string} rawInputString - The raw string input, e.g., "10 10".
 */
function processFinancialData(rawInputString) {
  // Define constants for the tax rates to improve readability and maintainability.
  const TAX_RATE_A = 0.08; // First tax rate (e.g., 8%)
  const TAX_RATE_B = 0.10; // Second tax rate (e.g., 10%)

  // Prepare input: trim leading/trailing whitespace, split into components,
  // and then convert each component to a numeric type.
  const inputComponents = rawInputString.trim().split(' ');
  const receivedTaxAmounts = inputComponents.map(str => Number(str));

  // --- Input Validation (Type III addition: Guard Clauses for robustness) ---
  // Ensure exactly two numeric components were provided.
  if (receivedTaxAmounts.length !== 2 || receivedTaxAmounts.some(isNaN)) {
    console.error("Error: Invalid input format. Expected two numeric values.");
    console.log(-1); // Indicate failure
    return;
  }
  // Ensure tax amounts are non-negative.
  if (receivedTaxAmounts[0] < 0 || receivedTaxAmounts[1] < 0) {
    console.error("Error: Received tax amounts cannot be negative.");
    console.log(-1); // Indicate failure
    return;
  }
  // Ensure received tax amounts are integers, as Math.floor implies integer results.
  if (!Number.isInteger(receivedTaxAmounts[0]) || !Number.isInteger(receivedTaxAmounts[1])) {
      console.error("Error: Received tax amounts must be integers.");
      console.log(-1);
      return;
  }

  // --- Initialize the variable to store the found gross amount ---
  // Using `null` initially allows distinguishing between "not found" and a potential
  // (though unlikely in this context) valid result of 0.
  let matchingGrossAmount = null;

  // --- Determine a precise search range for the potential gross amount (Type III rewrite) ---
  // The core logic relies on the property: floor(X * Rate) == TaxAmount
  // This implies: TaxAmount <= X * Rate < TaxAmount + 1
  // From this, we can derive bounds for X:
  // TaxAmount / Rate <= X < (TaxAmount + 1) / Rate

  // Calculate the lower and upper bounds for the gross amount based on TAX_RATE_A.
  const lowerBoundForTaxA = Math.ceil(receivedTaxAmounts[0] / TAX_RATE_A);
  // The upper bound is exclusive, so we find the largest integer strictly less than (TaxAmount + 1) / Rate.
  // Using Number.EPSILON helps to correctly handle floating point precision issues near integer boundaries.
  const upperBoundForTaxA = Math.floor(((receivedTaxAmounts[0] + 1) / TAX_RATE_A) - Number.EPSILON);

  // Calculate the lower and upper bounds for the gross amount based on TAX_RATE_B.
  const lowerBoundForTaxB = Math.ceil(receivedTaxAmounts[1] / TAX_RATE_B);
  const upperBoundForTaxB = Math.floor(((receivedTaxAmounts[1] + 1) / TAX_RATE_B) - Number.EPSILON);

  // The actual search range for the gross amount must satisfy both conditions.
  // It must also be a positive integer (at least 1).
  const effectiveSearchStart = Math.max(1, lowerBoundForTaxA, lowerBoundForTaxB);
  const effectiveSearchEnd = Math.min(upperBoundForTaxA, upperBoundForTaxB);

  // --- Pre-check for impossible ranges (Type III addition: Early Exit) ---
  // If the calculated start of the search range is greater than its end,
  // it means there is no overlap between the valid ranges for TaxA and TaxB,
  // thus no solution exists.
  if (effectiveSearchStart > effectiveSearchEnd) {
    console.log(-1); // No possible value found within the calculated range
    return;
  }

  // --- Iterate through the refined search space (Type III: Optimized Loop) ---
  // This loop iterates only over candidate gross amounts that are mathematically
  // possible, significantly reducing the search space compared to a naive iteration.
  for (let currentCandidate = effectiveSearchStart; currentCandidate <= effectiveSearchEnd; currentCandidate++) {
    // Calculate the floored tax amounts for the current candidate gross amount.
    const calculatedTaxFromA = Math.floor(currentCandidate * TAX_RATE_A);
    const calculatedTaxFromB = Math.floor(currentCandidate * TAX_RATE_B);

    // Check if both calculated taxes exactly match the received input tax amounts.
    if (calculatedTaxFromA === receivedTaxAmounts[0] && calculatedTaxFromB === receivedTaxAmounts[1]) {
      matchingGrossAmount = currentCandidate; // A solution has been found.
      break; // Exit the loop as the problem implies finding the smallest such value, and we are iterating upwards.
    }
  }

  // --- Output the final result ---
  // If `matchingGrossAmount` is still `null`, no solution was found, so output -1.
  // Otherwise, output the found gross amount.
  console.log(matchingGrossAmount !== null ? matchingGrossAmount : -1);
}

// --- Main execution block to read input from stdin and invoke the processing function ---
// This part remains functionally similar to the original, but wraps the file
// reading in a try-catch block for better error handling (Type III addition).
const fileSystemModule = require('fs');
const standardInputPath = '/dev/stdin'; // Standard input file path on Unix-like systems

try {
  // Read the entire content of the standard input file as a UTF-8 string.
  const inputContent = fileSystemModule.readFileSync(standardInputPath, 'utf8');
  // Call the refactored function to process the input.
  processFinancialData(inputContent);
} catch (error) {
  // Catch potential errors during file reading or data processing.
  console.error("An error occurred while reading input or processing data:", error.message);
  console.log(-1); // Indicate a general failure
}