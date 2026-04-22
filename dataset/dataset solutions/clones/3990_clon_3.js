'use strict'

/**
 * Determines the outcome based on two input numbers,
 * handling potential large integer multiplication.
 * @param {string} rawInputString - The raw string input, e.g., "5 8\n..."
 */
function computeFinalResult(rawInputString) {

  // Internal constant for maximum safe integer value
  const SAFE_NUMBER_LIMIT = Number.MAX_SAFE_INTEGER;

  // Helper function to safely parse an integer
  const extractInteger = (textSegment) => {
    const parsed = parseInt(textSegment.trim(), 10);
    if (isNaN(parsed)) {
      // For robustness, although input format is usually guaranteed
      console.error("Error: Invalid number detected in input.");
      return 0; // Default to 0 or throw error
    }
    return parsed;
  };

  // Process the initial input line
  const inputSegments = rawInputString.trim().split('\n')[0].split(/\s+/).filter(Boolean);

  if (inputSegments.length < 2) {
    console.error("Error: Insufficient input values provided.");
    return; // Exit if input is malformed
  }

  // Extract and validate the primary operands
  const firstNumericValue = extractInteger(inputSegments[0]);
  const secondNumericValue = extractInteger(inputSegments[1]);

  /**
   * Calculates the adjusted absolute difference for an input value.
   * Equivalent to Math.abs(value - 2).
   * @param {number} val - The input number.
   * @returns {number} The absolute difference.
   */
  const deriveAdjustedAbsValue = (val) => {
    return Math.abs(val - 2);
  };

  const adjustedFirst = deriveAdjustedAbsValue(firstNumericValue);
  const adjustedSecond = deriveAdjustedAbsValue(secondNumericValue);

  let finalProduct; // Variable to store the computed result

  // Attempt standard multiplication first
  const intermediateStandardProduct = adjustedFirst * adjustedSecond;

  // Check if the result exceeds the safe integer limit
  if (intermediateStandardProduct > SAFE_NUMBER_LIMIT || adjustedFirst > SAFE_NUMBER_LIMIT || adjustedSecond > SAFE_NUMBER_LIMIT) {
    // If overflow is possible or actual, delegate to large number arithmetic
    
    /**
     * Performs multiplication of two non-negative integers represented as numbers,
     * returning the result as a string for arbitrary precision.
     * This method implements a manual "long multiplication" algorithm.
     * @param {number} factorA - The first non-negative integer factor.
     * @param {number} factorB - The second non-negative integer factor.
     * @returns {string} The product as a string.
     */
    const performLargeScaleMultiplication = (factorA, factorB) => {
      if (factorA < 0 || factorB < 0) {
        console.error("Error: Large scale multiplication expects non-negative factors.");
        return "0"; // Or throw an error
      }
      if (factorA === 0 || factorB === 0) {
          return "0";
      }

      // Convert factors to arrays of digits, in reverse order (LSB first)
      const digitsOfFactorA = String(factorA).split('').map(Number).reverse();
      const digitsOfFactorB = String(factorB).split('').map(Number).reverse();

      // Initialize an array to store intermediate products, size sufficient for result
      const resultDigitAccumulator = new Array(digitsOfFactorA.length + digitsOfFactorB.length).fill(0);

      // Perform the core multiplication logic (similar to manual long multiplication)
      for (let i = 0; i < digitsOfFactorA.length; i++) {
        const currentDigitA = digitsOfFactorA[i];
        for (let j = 0; j < digitsOfFactorB.length; j++) {
          const currentDigitB = digitsOfFactorB[j];
          const productOfDigits = currentDigitA * currentDigitB;
          
          // Add the product to the correct position in the accumulator
          // (i+j) determines the place value from the right (LSB)
          resultDigitAccumulator[i + j] += productOfDigits;
        }
      }

      // Propagate carries from right to left (LSB to MSB)
      for (let k = 0; k < resultDigitAccumulator.length; k++) {
        if (resultDigitAccumulator[k] >= 10) {
          const carryComponent = Math.floor(resultDigitAccumulator[k] / 10);
          resultDigitAccumulator[k] %= 10; // Keep only the digit part
          
          // Add carry to the next significant position
          // If at the very end, extend the array
          if (k + 1 < resultDigitAccumulator.length) {
            resultDigitAccumulator[k + 1] += carryComponent;
          } else {
            // This case should ideally be handled by initial array sizing,
            // but provides robustness if a very large carry extends beyond.
            resultDigitAccumulator.push(carryComponent);
          }
        }
      }

      // Remove any leading zeros (from the MSB end, which is the end of the array after reverse)
      // The array is currently LSB...MSB, so we need to remove trailing zeros after reversing.
      while (resultDigitAccumulator.length > 1 && resultDigitAccumulator[resultDigitAccumulator.length - 1] === 0) {
          resultDigitAccumulator.pop();
      }

      // Reverse the array to get MSB first and join into a string
      return resultDigitAccumulator.reverse().join('');
    };

    finalProduct = performLargeScaleMultiplication(adjustedFirst, adjustedSecond);
  } else {
    // If within safe integer limits, use the standard number result
    finalProduct = intermediateStandardProduct;
  }

  // Output the calculated result
  console.log(finalProduct);
}

// Read input from standard input and invoke the main processing function
const fileSystemModule = require("fs");
const standardInputPath = "/dev/stdin";
const encodingType = "utf8";

try {
  const inputContent = fileSystemModule.readFileSync(standardInputPath, encodingType);
  computeFinalResult(inputContent);
} catch (ioError) {
  console.error(`Failed to read input from ${standardInputPath}:`, ioError.message);
  // Optionally, provide a default behavior or exit
}