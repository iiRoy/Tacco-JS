// This immediately-invoked function expression (IIFE) serves as the main entry point
// for processing input data, orchestrating the calculation of digit combinations.
(function(rawInputData) {
  // Clean up the raw input: remove any leading/trailing whitespace (including newlines)
  // and then split the content into an array of individual lines.
  let processedInputLines = rawInputData.trim().split('\n');

  // Iterate through each line of the input data.
  // The loop continues as long as there are lines to process.
  while (processedInputLines.length > 0) {
    // Extract the next line from the beginning of the array.
    const currentLine = processedInputLines.shift();

    // Skip any empty lines that might result from input parsing or malformed input.
    if (!currentLine) {
      continue;
    }

    // Parse the current line, splitting it by space and converting each segment to an integer.
    // Using parseInt with radix 10 ensures robust conversion.
    let parsedParameters = currentLine.split(' ').map(val => parseInt(val, 10));

    // Basic validation: ensure we have at least two numeric parameters (N and S).
    if (parsedParameters.length < 2) {
      console.warn(`Warning: Skipping malformed input line with insufficient parameters: "${currentLine}"`);
      continue;
    }

    // Assign the parsed values to meaningful variable names.
    const numDigitsRequired = parsedParameters[0]; // Corresponds to 'n' in the original code
    const desiredSumTotal = parsedParameters[1];   // Corresponds to 's' in the original code

    // Termination condition: If both N and S are zero, it signals the end of input.
    // The `return` statement exits this IIFE, effectively ending the program's execution.
    if (numDigitsRequired === 0 && desiredSumTotal === 0) {
      return;
    }

    // Additional input validation to handle impossible or out-of-bounds cases early.
    // If numDigitsRequired is negative, or if desiredSumTotal is negative (cannot form with positive digits).
    // The problem implies distinct digits from 0-9 due to recursive structure.
    // Max N for distinct digits 0-9 is 10. Max S for distinct digits 0-9 is 0+1+...+9 = 45.
    if (numDigitsRequired < 0 || desiredSumTotal < 0 || numDigitsRequired > 10 || desiredSumTotal > 45) {
        console.warn(`Invalid input for combination search (N=${numDigitsRequired}, S=${desiredSumTotal}). Outputting 0.`);
        console.log(0); // Output 0 for cases that cannot have any valid combinations.
        continue;
    }

    // If input is valid and not a termination signal, compute the combinations.
    // The `computeDigitCombinations` function acts as a public interface to the recursive solver.
    console.log(computeDigitCombinations(numDigitsRequired, desiredSumTotal));
  }
})(require('fs').readFileSync('/dev/stdin', 'utf8')); // This line reads the input from standard input.


/**
 * @typedef {function(number, number): number} CombinationCalculator
 * A function type for calculating combinations.
 */

/**
 * Initiates the search for combinations of distinct digits (0-9) that sum to a target value.
 * This function serves as a clean entry point to the recursive combination finder.
 *
 * @type {CombinationCalculator}
 * @param {number} digitsCount - The number of distinct digits that must be selected.
 * @param {number} targetValue - The precise sum that the selected digits must achieve.
 * @returns {number} The total count of unique combinations found.
 */
const computeDigitCombinations = (digitsCount, targetValue) => {
  // The recursive helper function is called with:
  // - `minDigit = 0`: indicating that digits can start from 0.
  // - `digitsCount`: the initial number of digits to find.
  // - `targetValue`: the initial sum to achieve.
  return findCombinationsRecursive(0, digitsCount, targetValue);
};

/**
 * Recursive helper function that systematically explores all possible combinations
 * of distinct digits (0-9) to satisfy the given count and sum criteria.
 *
 * @param {number} minDigit - The smallest digit permitted for selection in the current recursive step.
 *                            This ensures digits are selected in increasing order, preventing duplicate combinations.
 * @param {number} remainingDigits - The quantity of additional digits that still need to be chosen.
 * @param {number} currentTargetSum - The remaining sum that must be reached by the `remainingDigits`.
 * @returns {number} The cumulative count of valid combinations discovered from this particular state.
 */
function findCombinationsRecursive(minDigit, remainingDigits, currentTargetSum) {
  // --- Early Exit Conditions & Pruning for Efficiency ---

  // 1. If the current target sum has dropped below zero, it's impossible to reach zero
  //    with non-negative digits. This path yields no valid combinations.
  if (currentTargetSum < 0) {
    return 0;
  }

  // 2. Base Case: If no more digits are required.
  //    A combination is valid ONLY if the `currentTargetSum` has been perfectly reduced to zero.
  if (remainingDigits === 0) {
    return currentTargetSum === 0 ? 1 : 0;
  }

  // 3. Pruning: If the `minDigit` exceeds 9, it means there are no more valid digits (0-9)
  //    to choose from for the current position or subsequent positions.
  if (minDigit > 9) {
    return 0;
  }

  // 4. Pruning (Upper Bound Check): If even by selecting the largest possible `remainingDigits`
  //    (i.e., multiple 9s), the maximum achievable sum is less than `currentTargetSum`,
  //    then this path cannot lead to a solution.
  if (remainingDigits * 9 < currentTargetSum) {
    return 0;
  }

  // 5. Pruning (Lower Bound Check): Calculate the minimum possible sum that can be formed
  //    with `remainingDigits` distinct digits, starting from `minDigit`.
  //    This is an arithmetic series sum: `minDigit + (minDigit+1) + ... + (minDigit + remainingDigits - 1)`.
  //    Formula: `k * a1 + k * (k-1) / 2`, where `k` is `remainingDigits` and `a1` is `minDigit`.
  let minPossibleSum = remainingDigits * minDigit + (remainingDigits * (remainingDigits - 1) / 2);
  if (minPossibleSum > currentTargetSum) {
      return 0; // If the minimum sum we can make already exceeds the target, no solution.
  }

  // --- Recursive Exploration ---

  let validCombinationCounter = 0; // Accumulator for combinations found in this branch.

  // Iterate through all possible digits that can be chosen for the current position.
  // `digitCandidate` must be:
  // - Greater than or equal to `minDigit` (to maintain increasing order and distinctness).
  // - Less than or equal to 9 (as digits are 0-9).
  for (let digitCandidate = minDigit; digitCandidate <= 9; digitCandidate++) {
    // Recursive call:
    // - `digitCandidate + 1`: The next digit chosen must be strictly greater than the current one.
    // - `remainingDigits - 1`: One less digit is now needed.
    // - `currentTargetSum - digitCandidate`: The target sum is reduced by the value of the chosen digit.
    validCombinationCounter += findCombinationsRecursive(
      digitCandidate + 1,
      remainingDigits - 1,
      currentTargetSum - digitCandidate
    );
  }

  // Return the total count of valid combinations found by exploring this branch of possibilities.
  return validCombinationCounter;
}