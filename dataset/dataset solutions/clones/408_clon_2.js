let memoizationCache = {}; // This object stores previously computed values to avoid redundant calculations.

// Initialize the first few values in the cache.
memoizationCache[0] = 1;
memoizationCache[1] = 1;
memoizationCache[2] = 2;

/**
 * Recursively computes the Nth value of a modified Tribonacci-like sequence.
 * Uses memoization to optimize performance.
 * @param {number} inputIndex - The index for which to compute the sequence value.
 * @returns {number} The computed sequence value.
 */
function computeTribonacci(inputIndex) {
  // Check if the value is already in our cache.
  if (inputIndex in memoizationCache) {
    return memoizationCache[inputIndex];
  }

  // If not, calculate it using the recursive definition.
  // The sequence is defined as T(n) = T(n-1) + T(n-2) + T(n-3)
  memoizationCache[inputIndex] = computeTribonacci(inputIndex - 1) +
                                 computeTribonacci(inputIndex - 2) +
                                 computeTribonacci(inputIndex - 3);

  // Store and return the newly computed value.
  return memoizationCache[inputIndex];
}

/**
 * Calculates a final result based on the Tribonacci sequence value.
 * The result is the ceiling of the sequence value divided by 10, then by 365.
 * @param {number} targetNumber - The number for which to calculate the final result.
 * @returns {number} The final calculated and rounded-up result.
 */
function processInputAndCalculate(targetNumber) {
  // Get the Tribonacci value and perform the division, then round up.
  return Math.ceil(computeTribonacci(targetNumber) / 10 / 365);
}

// Read input from standard input, process each line.
require("fs")
  .readFileSync("/dev/stdin", "utf-8")
  .split("\n")
  .forEach(function(currentLine) {
    // Convert the string line to a number.
    let numericValue = +currentLine;

    // If the numeric value is 0, stop processing this line and move to the next.
    if (numericValue === 0) {
      return;
    }

    // Calculate the final result and print it to the console.
    console.log(processInputAndCalculate(numericValue));
  });
