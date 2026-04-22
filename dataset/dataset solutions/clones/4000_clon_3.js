/**
 * This module provides a utility function to compute a specific grid-related value
 * based on two input dimensions. It aims to calculate the "inner" elements,
 * with special handling for very small grid sizes.
 */

/**
 * Processes a string input containing two space-separated numbers,
 * interprets them as BigInt dimensions, and calculates a derived value.
 *
 * The calculation logic is as follows:
 * - If both dimensions are 1x1, the result is 0.
 * - If one dimension is 1 (e.g., 1xN or Nx1), the result is max(0, N-2).
 *   This effectively means 0 if N <= 2, and N-2 otherwise.
 * - If both dimensions are greater than 1, the result is max(0, (A-2) * (B-2)).
 *   This accounts for cases like 2xN or Nx2 grids having 0 inner elements.
 *
 * @param {string} inputString - The raw input string, e.g., "5 7".
 * @returns {string} The computed BigInt result converted to a string.
 */
const calculateGridValue = (inputString) => {
  // Split the input string by space to get individual dimension strings.
  const dimensionParts = inputString.split(" ");

  // Convert the string parts into BigInt values.
  // We assume the input will always provide two valid numbers.
  const primaryDimension = BigInt(dimensionParts[0]);   // Corresponds to 'a' in original
  const secondaryDimension = BigInt(dimensionParts[1]); // Corresponds to 'b' in original

  // Initialize a variable to store the final outcome of the calculation.
  let finalCalculatedCount;

  // Determine the count based on the values of the dimensions.
  // This series of conditional checks replaces the original complex ternary operator.

  // Scenario 1: Both dimensions are exactly 1.
  // A 1x1 grid has no internal cells, so the count is 0.
  if (primaryDimension === 1n && secondaryDimension === 1n) {
    finalCalculatedCount = 0n;
  }
  // Scenario 2: The primary dimension is 1, and the secondary is greater than 1.
  // For a 1xN grid (N > 1), the original logic effectively calculates N-2.
  // We ensure the result is not negative, as an "inner count" cannot be negative.
  else if (primaryDimension === 1n) {
    let intermediateResult = secondaryDimension - 2n;
    finalCalculatedCount = intermediateResult > 0n ? intermediateResult : 0n;
  }
  // Scenario 3: The secondary dimension is 1, and the primary is greater than 1.
  // Similar to Scenario 2, for an Nx1 grid (N > 1), original logic effectively calculates N-2.
  else if (secondaryDimension === 1n) {
    let intermediateResult = primaryDimension - 2n;
    finalCalculatedCount = intermediateResult > 0n ? intermediateResult : 0n;
  }
  // Scenario 4: Both dimensions are greater than 1.
  // This is the general case for a 2D grid. The number of inner cells
  // is (width - 2) * (height - 2).
  // The original expression was an expanded form of this algebraic identity.
  else {
    // Calculate the 'effective' internal width and height.
    // If a dimension is 2 or less, its effective internal part is 0.
    const effectiveInternalWidth = primaryDimension - 2n;
    const effectiveInternalHeight = secondaryDimension - 2n;

    // Ensure that effective dimensions are non-negative before multiplication.
    // This correctly handles cases like 2x3 or 3x2 grids, where inner cells are 0.
    const validatedWidth = effectiveInternalWidth > 0n ? effectiveInternalWidth : 0n;
    const validatedHeight = effectiveInternalHeight > 0n ? effectiveInternalHeight : 0n;

    finalCalculatedCount = validatedWidth * validatedHeight;
  }

  // The final result is converted to a string as required for output.
  return finalCalculatedCount.toString();
};

// This immediately invoked function expression (IIFE) handles the program's execution flow.
// It reads input from stdin, calls the processing logic, and prints the output.
(function executeProgram() {
  // Node.js specific: Read the entire content of standard input synchronously.
  // The 'utf8' encoding is specified, and .trim() removes any leading/trailing whitespace.
  const rawDataFromStdin = require("fs").readFileSync("/dev/stdin", "utf8").trim();

  // Invoke the main calculation function with the obtained input.
  const processedOutputString = calculateGridValue(rawDataFromStdin);

  // Output the final result to the console (standard output).
  console.log(processedOutputString);
})();