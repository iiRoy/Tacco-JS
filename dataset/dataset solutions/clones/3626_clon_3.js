/**
 * @fileoverview This script converts a decimal integer to its negabase (-2) representation.
 * It's an advanced conversion algorithm, handling both positive and negative input values,
 * and producing a binary string as output.
 */

/**
 * Helper function to calculate powers of 2 efficiently using bit shifts.
 * Ensures that the exponent is valid for bit shift operations.
 * @param {number} exponent - The non-negative exponent for the base 2.
 * @returns {number} The result of 2 raised to the power of the exponent.
 */
const calculatePowerOfTwo = (exponent) => {
  // Bit shift (1 << N) is equivalent to Math.pow(2, N) for non-negative integer N.
  // It's generally faster and clearer for powers of 2.
  if (exponent < 0) {
    // This specific algorithm should not produce negative exponents for powers of 2.
    // If it did, it would represent 1/(2^-exponent).
    // For robustness, ensure a valid return, though not expected in this context.
    return 1 / (1 << Math.abs(exponent));
  }
  return 1 << exponent;
};

/**
 * Converts a decimal integer to its base -2 (negabase) string representation.
 * The function reads a single integer from the provided raw input string.
 *
 * @param {string} rawInputDataString - The raw string input, expected to contain a single integer on the first line.
 */
function convertDecimalToNegabase(rawInputDataString) {
  // Pre-process the input string: trim leading/trailing whitespace and extract the first line.
  const processedInputLines = rawInputDataString.trim().split('\n');
  const numericValueAsString = processedInputLines[0];

  // Parse the extracted string into an integer, explicitly specifying base 10.
  const targetDecimalValue = parseInt(numericValueAsString, 10);

  // Implement input validation: Check if the parsed value is a valid number.
  if (isNaN(targetDecimalValue)) {
    console.error("Invalid input detected: The provided value is not a parsable integer. Defaulting to '0'.");
    // As per the original's implicit behavior for non-numeric input (which would likely lead to NaN and then '0' output if not handled),
    // we explicitly output '0' for clarity in error cases.
    console.log('0');
    return; // Exit the function if input is invalid.
  }

  // Handle the special case where the target value is zero, as its negabase representation is simply "0".
  if (targetDecimalValue === 0) {
    console.log('0');
    return; // Exit early for zero.
  }

  // Initialize the string that will store the final negabase representation.
  // For any non-zero number, the highest significant bit in negabase is always '1'.
  let negabaseResultString = '1';
  // This variable accumulates the value represented by the '1' bits that have been provisionally placed.
  let currentAccumulatedSum = 0;
  // This stores the highest exponent of (-2) that is part of the representation.
  let maxExponentIndex = 0;

  // The logic for determining the highest exponent and initial sum differs for positive and negative numbers.
  if (targetDecimalValue > 0) {
    // For positive target values, we iteratively sum positive terms (even powers of -2, which are powers of 2).
    // The loop increments by 2 (0, 2, 4, ...) to ensure even exponents.
    for (let currentExponentCandidate = 0; currentAccumulatedSum < targetDecimalValue; currentExponentCandidate += 2) {
      currentAccumulatedSum += calculatePowerOfTwo(currentExponentCandidate);
      maxExponentIndex = currentExponentCandidate; // Update the highest even exponent found so far.
    }
    // At this point, `currentAccumulatedSum` is the smallest sum of even powers of 2 that is greater than or equal to `targetDecimalValue`.
    // `maxExponentIndex` holds the largest even exponent used in this sum.

    // Now, iterate downwards from `maxExponentIndex` to determine the remaining bits (from left to right, excluding the first '1').
    // The loop runs for `maxExponentIndex` iterations, covering positions `maxExponentIndex - 1` down to `0`.
    for (let digitPosition = 0; digitPosition < maxExponentIndex; digitPosition++) {
      // Calculate the power of two term corresponding to the current digit position.
      // The original formula `Math.pow(2, a-i)/2` translates to `2^(a-i-1)`.
      const currentPowerOfTwoTerm = calculatePowerOfTwo(maxExponentIndex - digitPosition - 1);
      // Calculate the threshold value against which `targetDecimalValue` is compared.
      const comparisonThreshold = currentAccumulatedSum - currentPowerOfTwoTerm;

      // Determine if the target value exceeds this threshold.
      const isTargetAboveThreshold = targetDecimalValue > comparisonThreshold;
      // Check if the current digit position is even.
      const isPositionEven = (digitPosition % 2 === 0);

      // The bit value ('0' or '1') is determined by a combination of `isTargetAboveThreshold` and `isPositionEven`.
      // This is a compact representation of the original nested if/else logic using XOR.
      // Bit is '1' if (isTargetAboveThreshold XOR isPositionEven) is true.
      const currentBitIsOne = isTargetAboveThreshold ^ isPositionEven;

      // Append the determined bit to the result string.
      negabaseResultString += currentBitIsOne ? '1' : '0';

      // If a '1' bit was placed, it means we are using this power of -2,
      // so `currentAccumulatedSum` needs to be adjusted accordingly.
      if (currentBitIsOne) {
        currentAccumulatedSum -= currentPowerOfTwoTerm;
      }
    }

  } else { // `targetDecimalValue < 0`
    // For negative target values, we sum negative terms (odd powers of -2).
    // The loop increments by 2 (1, 3, 5, ...) to ensure odd exponents.
    for (let currentExponentCandidate = 1; currentAccumulatedSum > targetDecimalValue; currentExponentCandidate += 2) {
      // Use the exponentiation operator (**) for powers of -2.
      currentAccumulatedSum += (NEGABASE_BASE ** currentExponentCandidate);
      maxExponentIndex = currentExponentCandidate; // Update the highest odd exponent found.
    }
    // At this point, `currentAccumulatedSum` is the largest sum of odd powers of -2 that is less than or equal to `targetDecimalValue`.
    // `maxExponentIndex` holds the largest odd exponent used in this sum.

    // Iterate downwards from `maxExponentIndex` to determine the remaining bits.
    // The loop runs from `digitPosition = 1` up to `maxExponentIndex`, covering positions `maxExponentIndex - 1` down to `0`.
    for (let digitPosition = 1; digitPosition <= maxExponentIndex; digitPosition++) {
      // Calculate the power of two term for the current position.
      // The original formula `Math.pow(2, a-(i-1))/2` translates to `2^(a-i)`.
      const currentPowerOfTwoTerm = calculatePowerOfTwo(maxExponentIndex - digitPosition);
      // Calculate the threshold value. Note the addition for negative numbers.
      const comparisonThreshold = currentAccumulatedSum + currentPowerOfTwoTerm;

      // Determine if the target value exceeds this threshold.
      const isTargetAboveThreshold = targetDecimalValue > comparisonThreshold;
      // Check if the current digit position is even.
      const isPositionEven = (digitPosition % 2 === 0);

      // The bit value is determined by the same XOR logic as for positive numbers.
      const currentBitIsOne = isTargetAboveThreshold ^ isPositionEven;

      // Append the determined bit.
      negabaseResultString += currentBitIsOne ? '1' : '0';

      // If a '1' bit was placed, adjust `currentAccumulatedSum`.
      if (currentBitIsOne) {
        currentAccumulatedSum += currentPowerOfTwoTerm;
      }
    }
  }

  // Finally, output the computed negabase string.
  console.log(negabaseResultString);
}

// Define a constant for the negabase value, enhancing code readability.
const NEGABASE_BASE = -2;

// The program's entry point: Read input from standard input and initiate the conversion.
// This pattern is common in environments like competitive programming.
convertDecimalToNegabase(require("fs").readFileSync("/dev/stdin", "utf8"));