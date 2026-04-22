const MODULUS_CONSTANT = 2019;

/**
 * Calculates the remainder when a number is divided by the MODULUS_CONSTANT.
 * This helper function centralizes the modulo operation for consistency.
 * @param {number} valueToMod The number to apply the modulo operation to.
 * @returns {number} The remainder of the division.
 */
const obtainModuloRemainder = (valueToMod) => {
  return valueToMod % MODULUS_CONSTANT;
};

/**
 * Main function responsible for processing the input and computing the minimal
 * product of modulo remainders within a specified range [lowerBound, upperBound].
 * It includes several early exit conditions to optimize performance for common scenarios.
 *
 * @param {string} rawInputData The raw input string, typically read from standard input.
 *                               Expected format: "L R\n..." where L and R are integers.
 */
const calculateMinimalModuloProduct = (rawInputData) => {
  // Split the raw input into lines and then parse the first line to extract
  // the lower and upper bounds of the range.
  const inputLines = rawInputData.split('\n');
  const numericTokens = inputLines[0].split(' ');

  // Convert the string tokens into numeric values for calculation.
  const lowerBound = Number(numericTokens[0]);
  const upperBound = Number(numericTokens[1]);

  // Determine the width of the given range, which is used in early exit conditions.
  const rangeWidth = upperBound - lowerBound;

  // --- First Optimization: Check for guaranteed zero product ---
  // This condition identifies scenarios where a product of 0 is inevitable.
  // The original logic checks if the range is wide enough to contain a multiple of MODULUS_CONSTANT,
  // or if the first multiple of MODULUS_CONSTANT *strictly greater than* lowerBound
  // (or lowerBound + MODULUS_CONSTANT if lowerBound is already a multiple) falls within the range.
  // This specific behavior, including its nuance regarding 'lowerBound' itself, is cloned.
  const nextPotentialMultiple = lowerBound - obtainModuloRemainder(lowerBound) + MODULUS_CONSTANT;

  if (rangeWidth >= MODULUS_CONSTANT || nextPotentialMultiple <= upperBound) {
    // If either condition is met, it guarantees that at least one factor
    // in a pair (i, k) can result in a modulo 0, making the final product 0.
    process.stdout.write('0\n');
    return; // Exit early as 0 is the minimum possible product.
  }

  // --- Second Optimization: Handle ranges with exactly two elements (L, L+1) ---
  // This is a specific edge case handled differently in the original code.
  // For a range [L, L+1], it simply outputs L % MODULUS_CONSTANT,
  // which diverges from the general loop calculation of (L % MOD * (L+1) % MOD) % MOD.
  if (rangeWidth === 1) {
    process.stdout.write(String(obtainModuloRemainder(lowerBound)) + '\n');
    return; // Exit early with the specific result.
  }

  // Initialize the variable to track the smallest product found so far.
  // Using Number.MAX_SAFE_INTEGER to ensure any valid product will be smaller.
  let minimumCalculatedResult = Number.MAX_SAFE_INTEGER;

  // --- Core Calculation: Nested loops to find the minimum product ---
  // Iterate through all possible pairs (currentFirstValue, currentSecondValue)
  // such that lowerBound <= currentFirstValue < currentSecondValue <= upperBound.
  // The outer loop handles the first factor.
  for (let currentFirstValue = lowerBound; currentFirstValue <= upperBound - 1; currentFirstValue++) {
    // The inner loop handles the second factor, ensuring it is always greater than the first.
    for (let currentSecondValue = currentFirstValue + 1; currentSecondValue <= upperBound; currentSecondValue++) {
      // Calculate the modulo remainders for both factors individually.
      const firstFactorRemainder = obtainModuloRemainder(currentFirstValue);
      const secondFactorRemainder = obtainModuloRemainder(currentSecondValue);

      // Compute the raw product of these remainders.
      const productOfRemainders = firstFactorRemainder * secondFactorRemainder;

      // Apply the modulo operation one final time to the product.
      const currentProductModulo = obtainModuloRemainder(productOfRemainders);

      // Update the overall minimum result if the current product is smaller.
      minimumCalculatedResult = Math.min(minimumCalculatedResult, currentProductModulo);

      // Inner Loop Optimization: If the minimum possible product (0) is found,
      // no need to continue with further calculations in the inner loop.
      if (minimumCalculatedResult === 0) {
        break; // Exit the current inner loop.
      }
    }
    // Outer Loop Optimization: If 0 was found in the inner loop (and thus `minimumCalculatedResult` is 0),
    // no need to continue with further outer loop iterations.
    if (minimumCalculatedResult === 0) {
      break; // Exit the outer loop.
    }
  }

  // Output the final computed minimum product modulo MODULUS_CONSTANT.
  // Using process.stdout.write for potentially faster output in competitive programming contexts.
  process.stdout.write(String(minimumCalculatedResult) + '\n');
};

// Execute the main calculation function by reading input from standard input.
// This typically involves using Node.js's 'fs' module to read '/dev/stdin'.
calculateMinimalModuloProduct(
  require("fs").readFileSync("/dev/stdin", "utf8")
);