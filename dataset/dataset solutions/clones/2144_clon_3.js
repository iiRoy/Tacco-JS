"use strict";

// Define a constant for the modulus value to improve readability and maintainability.
// This is a common prime number (10^9 + 7) used in competitive programming problems.
const RESULT_MODULO_PRIME = 1000000007;

/**
 * Executes a specific combinatorial calculation based on provided input data.
 * The function aims to determine the total count of non-empty subsets for a set
 * of 'N' distinct items, then deducts the counts of subsets having exactly 'A' items
 * and exactly 'B' items, finally returning the result modulo a large prime.
 *
 * @param {string[]} inputDataLines An array of strings, where the first element
 *                                   is expected to be a space-separated string
 *                                   containing three integers: "N A B".
 */
function performSubsetCalculation(inputDataLines) {
  // Parse the initial line of input to extract the numerical parameters.
  // The first line is split by spaces to get individual string components.
  const rawNumericStrings = inputDataLines[0].trim().split(" ");

  // Convert the extracted string components into integer values.
  const totalSetElements = parseInt(rawNumericStrings[0], 10); // Represents 'N'
  const targetExclusionSizeOne = parseInt(rawNumericStrings[1], 10); // Represents 'A'
  const targetExclusionSizeTwo = parseInt(rawNumericStrings[2], 10); // Represents 'B'

  // A minor reordering for consistency: ensure targetExclusionSizeOne is always the smaller index.
  // This doesn't change the outcome but is a structural alteration.
  const smallerExclusionIndex = Math.min(targetExclusionSizeOne, targetExclusionSizeTwo);
  const largerExclusionIndex = Math.max(targetExclusionSizeOne, targetExclusionSizeTwo);

  // Variables used for iterative calculation of binomial coefficients (N choose K).
  // 'currentFactorialNPart' accumulates N * (N-1) * ... * (N-K+1)
  // 'currentFactorialKPart' accumulates 1 * 2 * ... * K
  let currentFactorialNPart = 1;
  let currentFactorialKPart = 1;

  // An array to store all calculated binomial coefficients (N choose K) for K from 1 to N.
  // This mirrors the original approach of storing all intermediate combination values.
  const calculatedCombinations = new Array(totalSetElements);

  // Variables to specifically hold the (N choose A) and (N choose B) values.
  let combinationValueForA = 0;
  let combinationValueForB = 0;

  // This variable accumulates the sum of all (N choose K) for K from 1 to N.
  // This sum is mathematically equivalent to (2^N - 1), representing all non-empty subsets.
  let accumulatedSumOfCombinations = 0;

  // Iterate from K=1 up to N to compute each binomial coefficient (N choose K).
  // The iterative method avoids large factorial calculations directly.
  for (let kIndex = 1; kIndex <= totalSetElements; kIndex++) {
    // Update the numerator part: N * (N-1) * ... * (N-kIndex+1)
    currentFactorialNPart *= (totalSetElements - kIndex + 1);
    // Update the denominator part: 1 * 2 * ... * kIndex
    currentFactorialKPart *= kIndex;

    // Calculate the current binomial coefficient (N choose kIndex).
    // JavaScript's 'number' type (double-precision float) can represent integers
    // accurately up to 2^53 - 1. For larger N, BigInt would be required,
    // but this problem typically implies N is within 'number' limits.
    const currentBinomialCoefficient = currentFactorialNPart / currentFactorialKPart;

    // Store the computed coefficient in the array.
    calculatedCombinations[kIndex - 1] = currentBinomialCoefficient;

    // Add the current coefficient to the running total sum.
    accumulatedSumOfCombinations += currentBinomialCoefficient;

    // Capture the specific combination values that need to be excluded.
    if (kIndex === smallerExclusionIndex) {
      combinationValueForA = currentBinomialCoefficient;
    }
    // Only capture for the larger index if it's distinct from the smaller one.
    if (kIndex === largerExclusionIndex) {
      combinationValueForB = currentBinomialCoefficient;
    }
  }

  // Subtract the specific combination counts as required by the problem.
  accumulatedSumOfCombinations -= combinationValueForA;
  accumulatedSumOfCombinations -= combinationValueForB;

  // Guard clause: Ensure the accumulated sum is not negative before applying modulo.
  // While for this specific combinatorial problem the result should be non-negative,
  // this is a robust practice for modular arithmetic to handle potential negative intermediate results.
  if (accumulatedSumOfCombinations < 0) {
      // Add the modulus to bring a negative number into the positive range before final modulo.
      accumulatedSumOfCombinations += RESULT_MODULO_PRIME;
  }

  // Output the final computed result, applying the modulo operation.
  console.log(accumulatedSumOfCombinations % RESULT_MODULO_PRIME);
}

// --- Input Acquisition and Execution ---
// This section handles reading input from standard input, which is common in
// environments like competitive programming platforms (e.g., '/dev/stdin' on Linux).

// Reference the 'readFileSync' function from Node.js 'fs' module.
const fileSystemReader = require('fs').readFileSync;
// Specify the standard input file path.
const standardInputPath = '/dev/stdin';
// Define the character encoding for reading the file.
const inputEncoding = 'utf8';

// Read the raw content from standard input.
const rawContentFromStdin = fileSystemReader(standardInputPath, inputEncoding);
// Process the raw content: trim whitespace and split into an array of lines.
const processedInputArray = rawContentFromStdin.trim().split("\n");

// Invoke the main combinatorial calculation function with the prepared input.
performSubsetCalculation(processedInputArray);