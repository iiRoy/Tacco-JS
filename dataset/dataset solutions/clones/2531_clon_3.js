"use strict";

/**
 * @description Generates a list of potential common divisors up to a specified upper bound,
 *              using a modified Sieve of Eratosthenes-like approach.
 *              Note: The number 1 is not included in the initial list by this function,
 *              as it's typically handled separately for common divisor scenarios.
 * @param {number} maximumValue The inclusive upper limit for numbers to consider.
 * @returns {number[]} An array containing numbers identified as 'prime-like' up to maximumValue.
 */
function determineCandidateDivisors(maximumValue) {
  // Input validation: ensure the input is a non-negative number.
  if (typeof maximumValue !== 'number' || maximumValue < 0 || !Number.isInteger(maximumValue)) {
    console.error("Error: Input to determineCandidateDivisors must be a non-negative integer.");
    return []; // Return an empty array or throw an error based on desired behavior
  }

  // Handle edge cases for small maximumValue
  if (maximumValue < 2) {
    return []; // No primes less than 2
  }

  // Create a boolean array, marking all numbers up to maximumValue as potentially prime.
  // Using Array.from for a more modern initialization.
  const isConsideredPrime = Array.from({ length: maximumValue + 1 }, () => true);

  // 0 and 1 are not prime numbers by definition.
  isConsideredPrime[0] = false;
  isConsideredPrime[1] = false;

  // Iterate from 2 up to the square root of maximumValue.
  // This optimization is standard for the Sieve algorithm.
  const limitForSieve = Math.floor(Math.sqrt(maximumValue));
  for (let currentNumber = 2; currentNumber <= limitForSieve; ++currentNumber) {
    // If currentNumber is still marked as prime, then its multiples are not prime.
    if (isConsideredPrime[currentNumber]) {
      // Start marking multiples from currentNumber * currentNumber,
      // as smaller multiples would have already been marked by smaller primes.
      // This is a common Sieve optimization.
      for (let multiple = currentNumber * currentNumber; multiple <= maximumValue; multiple += currentNumber) {
        isConsideredPrime[multiple] = false;
      }
    }
  }

  // Collect all numbers that are still marked as prime.
  const foundDivisors = [];
  // Using a traditional loop for collection.
  for (let idx = 2; idx <= maximumValue; ++idx) { // Start from 2 as 0 and 1 are not primes
    if (isConsideredPrime[idx]) {
      foundDivisors.push(idx);
    }
  }

  return foundDivisors;
}

// --- Main execution flow starts here ---

// Attempt to read input from standard input.
let rawDataBuffer;
try {
  rawDataBuffer = require('node:fs').readFileSync('/dev/stdin');
} catch (fileReadError) {
  // Gracefully handle file read errors, e.g., if /dev/stdin is not available.
  console.error("Failed to read input from /dev/stdin:", fileReadError.message);
  process.exit(1); // Exit with an error code
}

// Convert buffer to UTF-8 string and process.
const inputStringContent = rawDataBuffer.toString('utf8').trim(); // Trim whitespace
const inputParts = inputStringContent.split(/\s+/); // Split by any whitespace

// Parse the two numeric arguments.
let firstOperand = Number.parseInt(inputParts[0], 10);
let secondOperand = Number.parseInt(inputParts[1], 10);

// Validate parsed inputs.
if (Number.isNaN(firstOperand) || Number.isNaN(secondOperand)) {
  console.error("Error: Invalid numeric input provided. Please ensure two integers are given.");
  process.exit(1);
}

// Ensure operands are positive for divisor calculations.
if (firstOperand < 0 || secondOperand < 0) {
    console.error("Error: Input numbers must be non-negative for this calculation.");
    process.exit(1);
}

// Determine the upper bound for divisor candidates.
// This is half of the maximum of the two input operands, rounded up.
// This value helps limit the search space for common divisors.
const divisorSearchUpperBound = Math.ceil(Math.max(firstOperand, secondOperand) / 2);

// Generate an initial set of potential common divisors using the sieve-like function.
const initialDivisorSet = determineCandidateDivisors(divisorSearchUpperBound);

// The number 1 is a common divisor for all integers.
// The sieve function typically doesn't include 1, so we add it explicitly here
// to match the original code's behavior of including 1 in the final list.
initialDivisorSet.unshift(1); // Add 1 to the beginning of the array.

// Filter the initial set to find numbers that are actual common divisors
// of both firstOperand and secondOperand.
const actualCommonDivisors = initialDivisorSet.filter(
  (candidate) => (firstOperand % candidate === 0 && secondOperand % candidate === 0)
);

// Special handling as per original logic:
// If only one common divisor (which would be 1 at this point) is found,
// and the two input numbers are identical, then add that number itself
// to the list of common divisors.
// This implies the original logic was looking for *all* common factors,
// including the number itself if it's the only common one and A=B.
if (actualCommonDivisors.length === 1 && firstOperand === secondOperand) {
  actualCommonDivisors.push(firstOperand);
}

// Output the total count of identified common divisors.
process.stdout.write(actualCommonDivisors.length.toString() + '\n');