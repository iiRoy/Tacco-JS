"use strict";

/**
 * Calculates the factorial of a non-negative integer.
 * Handles 0! = 1 and 1! = 1.
 * @param {number} valToFactor - The integer for which to calculate the factorial.
 * @returns {number} The factorial value. Returns 1 for 0 or 1, or the factorial product.
 *                   Note: This function uses standard JavaScript numbers, which may lead to
 *                   precision loss or overflow for large factorial values.
 */
function getFactorialValue(valToFactor) {
  // Base cases: factorial of 0 or 1 is 1.
  // This also implicitly handles negative numbers by returning 1,
  // which might not be mathematically accurate but prevents recursion errors
  // for non-positive values that could arise from calculation `valToFactor - 1`.
  if (valToFactor <= 1) {
    return 1;
  } else {
    // Recursive step: n! = n * (n-1)!
    return valToFactor * getFactorialValue(valToFactor - 1);
  }
}

/**
 * Processes input data to find specific combinatorial arrangements
 * based on two target sums (primary and secondary).
 * The problem involves finding combinations of '1's and '2's that sum up to a primary target,
 * and then checking if these same counts (but with swapped weights) sum to a secondary target.
 *
 * @param {string} inputStringData - The raw input string, typically from stdin.
 *                                   Expected format: "X Y" on the first line.
 */
const processInputData = (inputStringData) => {
  // Ensure the input string is cleaned and split into lines.
  const cleanedInput = inputStringData.trim();
  const inputLines = cleanedInput.split("\n");

  // Early exit if no valid input lines are found.
  if (inputLines.length === 0 || inputLines[0].trim().length === 0) {
    console.log(0);
    return;
  }

  // Extract the numerical targets from the first line.
  const firstLineTokens = inputLines[0].split(" ");

  // Validate that we have at least two tokens.
  if (firstLineTokens.length < 2) {
    console.log(0);
    return;
  }

  // Parse the integer values.
  const primarySumTarget = parseInt(firstLineTokens[0], 10); // Corresponds to original 'X'
  const secondarySumTarget = parseInt(firstLineTokens[1], 10); // Corresponds to original 'Y'

  // Validate parsed integers.
  if (isNaN(primarySumTarget) || isNaN(secondarySumTarget)) {
    console.log(0);
    return;
  }

  // Guard against negative target sums, as the problem context usually implies non-negative counts.
  if (primarySumTarget < 0 || secondarySumTarget < 0) {
    console.log(0);
    return;
  }

  // Determine the maximum possible count of '2's that can form the primary sum.
  // This sets the upper bound for our iteration.
  const maxBinaryPieces = Math.floor(primarySumTarget / 2);

  // This array will store the valid combination results.
  const validCombinationResults = [];

  // Define the modulus value for the final output.
  const resultModulus = 10e9; // 10 * 10^9 = 10^10

  // Iterate downwards from the maximum possible count of '2's.
  // 'currentBinaryCount' represents the number of '2's used to reach 'primarySumTarget'.
  for (let currentBinaryCount = maxBinaryPieces; currentBinaryCount >= 0; currentBinaryCount--) {
    // Calculate the remaining count of '1's needed to reach 'primarySumTarget'.
    const currentUnaryCount = primarySumTarget - (2 * currentBinaryCount);

    // Ensure the count of '1's is non-negative. (Implicitly handled by loop bounds on currentBinaryCount)
    if (currentUnaryCount < 0) {
      continue; // Should not happen with current loop logic, but good for robustness.
    }

    // Now, check if this specific combination (currentBinaryCount '2s' and currentUnaryCount '1s')
    // satisfies the 'secondarySumTarget' when their weights are effectively swapped.
    // The 'currentBinaryCount' '2s' from primary sum are treated as '1s' for secondary sum.
    // The 'currentUnaryCount' '1s' from primary sum are treated as '2s' for secondary sum.
    const calculatedSecondarySum = currentBinaryCount + (2 * currentUnaryCount);

    // If the calculated secondary sum matches the target, this is a valid combination.
    if (calculatedSecondarySum === secondarySumTarget) {
      // Calculate the components for the combinatorial formula.
      // These values are derived from the problem's specific formula, which isn't a standard combination.
      const totalElementsForNumerator = (2 * currentBinaryCount) + currentUnaryCount;
      const firstFactorialTerm = (2 * currentBinaryCount);
      const secondFactorialTerm = currentUnaryCount;

      // Compute the factorial values for numerator and denominator.
      const numeratorValue = getFactorialValue(totalElementsForNumerator);
      const sumOfDenominatorFactorials = getFactorialValue(firstFactorialTerm) + getFactorialValue(secondFactorialTerm);

      // Avoid division by zero. With getFactorialValue(0) = 1, the smallest sumOfDenominatorFactorials is 1+1=2,
      // so this check is mostly for extreme edge cases or unexpected return values from factorial.
      if (sumOfDenominatorFactorials !== 0) {
        validCombinationResults.push(numeratorValue / sumOfDenominatorFactorials);
      } else {
        // In a real-world scenario, one might log an error or handle this case specifically.
        // For cloning, we just skip it if it happens.
      }
    }
  }

  // After iterating through all possible combinations:
  // If no valid combinations were found, output 0.
  if (validCombinationResults.length === 0) {
    console.log(0);
    return;
  }

  // Sum all the calculated results.
  let accumulatedSum = 0;
  for (const resultEntry of validCombinationResults) {
    accumulatedSum += resultEntry;
  }

  // Output the final sum modulo the specified value.
  console.log(accumulatedSum % resultModulus);
};

// Entry point for execution, reading from standard input.
// Using 'node:fs' for explicit Node.js module import.
processInputData(require('node:fs').readFileSync('/dev/stdin', 'utf8'));