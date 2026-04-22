// This script processes a series of integer inputs from standard input.
// For each input N, it calculates and prints the number of trailing zeros in N! (N factorial).
// The calculation is pre-computed for numbers up to a defined limit for efficiency.

// Core module for file system operations, used here to read standard input.
const fileSystemModule = require('fs');

// --- Input Processing Section ---
// Read all data from standard input synchronously.
// The file descriptor for standard input is 0.
const rawInputContent = fileSystemModule.readFileSync(0, 'utf8');

// Trim whitespace from the content and split it into an array of lines.
// Each line is expected to be a number representing a query.
const queryLines = rawInputContent.trim().split('\n');

// Entry point for the main application logic.
executeProcessor();

/**
 * Orchestrates the processing of all input queries.
 * It first pre-calculates the trailing zero counts for factorials,
 * then iterates through each input query, retrieves the pre-calculated value, and prints it.
 */
function executeProcessor() {
  // Pre-calculate the number of trailing zeros for factorials up to the defined maximum.
  const factorialZeroCounts = precomputeTrailingZeroes();

  // If there are no queries or only an empty string, log a message and exit.
  if (queryLines.length === 0 || (queryLines.length === 1 && queryLines[0] === '')) {
    console.warn("No valid queries provided in standard input. Exiting.");
    return;
  }

  // Iterate over each line from the standard input.
  for (let queryIdx = 0; queryIdx < queryLines.length; queryIdx++) {
    const currentQueryString = queryLines[queryIdx];
    // Attempt to convert the current line into an integer.
    const numericInputValue = Number(currentQueryString);

    // Validate the parsed input value.
    if (isNaN(numericInputValue) || !Number.isInteger(numericInputValue) || numericInputValue < 0) {
      console.error(`Skipping invalid input at line ${queryIdx + 1}: '${currentQueryString}'. Expected a non-negative integer.`);
      continue; // Skip to the next query if the current one is invalid.
    }

    // Check if the input value is within the precomputed range.
    // The maximum index for factorialZeroCounts is precomputed_max_value.
    if (numericInputValue > factorialZeroCounts.length - 1) {
      console.error(`Input value ${numericInputValue} exceeds precomputation limit. Maximum is ${factorialZeroCounts.length - 1}. Skipping.`);
      continue;
    }

    // Print the pre-calculated number of trailing zeros for the current input.
    console.log(factorialZeroCounts[numericInputValue]);
  }
}

/**
 * Pre-computes the number of trailing zeros for factorials (N!)
 * for all N from 0 up to a specified upper limit.
 * The number of trailing zeros in N! is determined by the number of factors of 5 in its prime factorization.
 * This is calculated using Legendre's formula: sum(floor(N / 5^k)) for k >= 1.
 *
 * @returns {Int32Array} An array where index `i` stores the count of trailing zeros in `i!`.
 */
function precomputeTrailingZeroes() {
  // Define the maximum value for which factorial trailing zeros will be precomputed.
  const MAX_PRECOMPUTATION_VALUE = 20000;
  // The prime factor whose powers determine trailing zeros in base 10 (2 * 5 = 10).
  const PRIME_FACTOR_BASE = 5;

  // Initialize an array to store the counts. Using Int32Array for memory efficiency
  // and ensuring default values are 0.
  // The size is (MAX_PRECOMPUTATION_VALUE + 1) to accommodate index 0 up to MAX_PRECOMPUTATION_VALUE.
  const zeroCountsArray = new Int32Array(MAX_PRECOMPUTATION_VALUE + 1);

  // Iterate from PRIME_FACTOR_BASE up to the maximum value.
  // Numbers less than PRIME_FACTOR_BASE will have 0 trailing zeros, which is the default for Int32Array,
  // so no explicit calculation is needed for them.
  for (let currentNumber = PRIME_FACTOR_BASE; currentNumber <= MAX_PRECOMPUTATION_VALUE; currentNumber++) {
    let tempDivisor = currentNumber;
    let sumOfFactors = 0;

    // Apply Legendre's formula: sum(floor(currentNumber / PRIME_FACTOR_BASE^k))
    // This loop repeatedly divides by PRIME_FACTOR_BASE and sums the quotients.
    // For example, for N=25, it adds floor(25/5)=5, then for the next iteration, tempDivisor becomes 5,
    // it adds floor(5/5)=1. Total sum = 6.
    while (tempDivisor >= PRIME_FACTOR_BASE) {
      const quotient = Math.floor(tempDivisor / PRIME_FACTOR_BASE);
      sumOfFactors += quotient;
      tempDivisor = quotient; // Update tempDivisor for the next iteration (e.g., N/25, N/125, etc.)
    }
    // Store the calculated sum of factors of 5 (which is the number of trailing zeros)
    // at the corresponding index in the array.
    zeroCountsArray[currentNumber] = sumOfFactors;
  }

  return zeroCountsArray;
}