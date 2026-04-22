'use strict';

// This function serves as the primary entry point for processing input data
// and executing the core logic of the problem.
const ProcessInputAndCompute = (rawData) => {
  // --- Input Validation and Parsing (Type III additions) ---

  // Defensive check to ensure raw input data is not empty or null.
  // In a typical competitive programming environment, input is usually guaranteed,
  // but for a robust application, such checks are valuable.
  if (!rawData || rawData.trim().length === 0) {
    console.error("Error: No raw input data provided or it's empty.");
    // Optionally, throw an error or handle gracefully. For this context, a simple return is sufficient.
    return;
  }

  // Split the entire input string into individual lines, removing leading/trailing whitespace.
  const parsedInputLines = rawData.trim().split('\n');

  // Verify that there's at least one line to process after splitting.
  if (parsedInputLines.length === 0) {
    console.error("Error: Input data contains no discernible lines after processing.");
    return;
  }

  // Extract the first line, which is expected to contain two space-separated integers.
  const initialParametersString = parsedInputLines[0];
  const initialParameters = initialParametersString.split(' ').map(Number);

  // Validate that exactly two numbers were parsed successfully from the first line.
  if (initialParameters.length < 2 || isNaN(initialParameters[0]) || isNaN(initialParameters[1])) {
    console.error("Error: Unable to parse two valid numbers from the first line of input.");
    return;
  }

  // Assign descriptive names to the parsed values, replacing 'n' and 'k'.
  const totalAvailableItems = initialParameters[0]; // Corresponds to 'n' in the original problem.
  const targetGroupSize = initialParameters[1];    // Corresponds to 'k' in the original problem.

  // --- Constants and Utility Functions (Type II & III changes) ---

  // Define a common prime modulus, frequently used in combinatorics for
  // keeping results within manageable integer ranges and preventing overflow.
  const primeModuloValue = 1_000_000_007; // Using numeric separators for enhanced readability.

  /**
   * Computes the binomial coefficient C(n, k), also known as "n choose k".
   * This represents the number of distinct ways to choose 'k' items from a set of 'n' items.
   *
   * @param {number} totalCount - The total number of items available (n).
   * @param {number} selectionCount - The number of items to choose (k).
   * @returns {number} The calculated binomial coefficient. Returns 0 for invalid inputs.
   */
  const computeCombinations = (totalCount, selectionCount) => {
    // --- Guard Clauses for Edge Cases and Invalid Inputs (Type III addition) ---
    // If selectionCount is negative or exceeds totalCount, it's impossible to choose, so the result is 0.
    if (selectionCount < 0 || selectionCount > totalCount) {
      return 0;
    }
    // There is always one way to choose 0 items (choose nothing) or to choose all items (choose everything).
    if (selectionCount === 0 || selectionCount === totalCount) {
      return 1;
    }

    // --- Optimization: C(n, k) = C(n, n-k) (Type III update) ---
    // This optimization reduces the number of multiplications/divisions needed
    // by ensuring 'selectionCount' is always the smaller value between k and (n-k).
    const effectiveSelectionCount = Math.min(selectionCount, totalCount - selectionCount);

    let productForNumerator = 1;   // Accumulates the terms for the numerator: n * (n-1) * ...
    let productForDenominator = 1; // Accumulates the terms for the denominator: k!

    // --- Calculation Loop (Type II renaming, Type III structural) ---
    // Calculate the product for the numerator part: totalCount * (totalCount - 1) * ... * (totalCount - effectiveSelectionCount + 1)
    for (let currentFactorIndex = 0; currentFactorIndex < effectiveSelectionCount; currentFactorIndex++) {
      productForNumerator *= (totalCount - currentFactorIndex);
    }

    // Calculate the product for the denominator part: effectiveSelectionCount!
    for (let divisor = effectiveSelectionCount; divisor > 0; divisor--) {
      productForDenominator *= divisor;
    }

    // The final binomial coefficient is the division of the two products.
    // JavaScript's floating-point numbers can handle large integers accurately up to 2^53.
    // Constraints in typical problems ensure intermediate results fit.
    const calculatedCoefficient = productForNumerator / productForDenominator;
    return calculatedCoefficient;
  };

  // --- Main Loop and Output Generation (Type II & III changes) ---

  // Pre-calculate constant parts of the combination parameters for clarity and minor efficiency.
  // These correspond to (n - k + 1) and (k - 1) from the original problem.
  const firstCombinationUpperLimit = totalAvailableItems - targetGroupSize + 1;
  const secondCombinationUpperLimit = targetGroupSize - 1;

  // The main iteration loop, running from 1 up to the target group size.
  for (let currentLoopIndex = 1; currentLoopIndex <= targetGroupSize; currentLoopIndex++) {
    // Calculate the first binomial coefficient term: C(n - k + 1, i)
    const termOneResult = computeCombinations(firstCombinationUpperLimit, currentLoopIndex);

    // Calculate the second binomial coefficient term: C(k - 1, i - 1)
    const termTwoResult = computeCombinations(secondCombinationUpperLimit, currentLoopIndex - 1);

    // Multiply the results of the two combination calculations.
    let productOfCombinations = termOneResult * termTwoResult;

    // Apply the modulo operation to the product.
    // Adding primeModuloValue before taking modulo ensures the result is always non-negative,
    // which is a common practice in modular arithmetic, even if JavaScript's % operator
    // generally yields non-negative results for positive operands.
    const finalModulatedOutput = (productOfCombinations % primeModuloValue + primeModuloValue) % primeModuloValue;

    // Output the final computed result for the current iteration.
    // The original Math.round and -0 checks are removed as they are unnecessary
    // given the positive nature of the modulo and intermediate results here.
    console.log(finalModulatedOutput);
  }
};

// --- Execution Entry Point ---
// Reads input from standard input (typically '/dev/stdin' in competitive programming environments)
// and passes it to the main processing function.
ProcessInputAndCompute(require("fs").readFileSync("/dev/stdin", "utf8"));