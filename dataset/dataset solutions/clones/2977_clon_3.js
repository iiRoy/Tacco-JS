"use strict";

// --- Input Processing Module ---

// A utility function to ensure robust integer parsing.
// It attempts to convert a string to an integer and performs basic validation.
const safelyParseNumericalValue = (inputStringSegment, numericalBase = 10) => {
  const resultValue = parseInt(inputStringSegment, numericalBase);
  // Guard clause: If the parsing fails, it indicates malformed input.
  if (isNaN(resultValue)) {
    console.error("Error: Detected non-numeric input where an integer was expected. Please verify input data.");
    process.exit(1); // Terminate execution due to critical input error.
  }
  return resultValue;
};

// Retrieve raw data from the standard input stream.
// Using specific options for readFileSync enhances clarity and robustness.
// .trim() removes any leading/trailing whitespace, and .split(/\s+/) handles
// various whitespace separators (spaces, tabs, newlines) robustly.
const rawInputLineSegments = require("fs")
  .readFileSync("/dev/stdin", { encoding: "utf8", flag: "r" })
  .trim()
  .split(/\s+/);

// Define the expected number of input parameters for validation.
const REQUIRED_PARAMETER_COUNT = 4;

// Validate the integrity of the input: ensure the correct number of values is provided.
if (rawInputLineSegments.length !== REQUIRED_PARAMETER_COUNT) {
  console.error(`Input data error: Expected ${REQUIRED_PARAMETER_COUNT} distinct values, but received ${rawInputLineSegments.length}.`);
  process.exit(1); // Exit if input count is incorrect.
}

// Extract and convert the color intensities and the target sum from the parsed input segments.
// Variable names are chosen to be descriptive of their roles.
const primaryColorIntensity = safelyParseNumericalValue(rawInputLineSegments[0]); // Corresponds to R
const secondaryColorIntensity = safelyParseNumericalValue(rawInputLineSegments[1]); // Corresponds to G
const tertiaryColorIntensity = safelyParseNumericalValue(rawInputLineSegments[2]); // Corresponds to B
const targetSumValue = safelyParseNumericalValue(rawInputLineSegments[3]); // Corresponds to N

// --- Combination Calculation Logic ---

// This variable will accumulate the total count of valid color combinations.
// Renamed from 'ans' for better semantic meaning.
let totalValidColorCombinations = 0;

// Outer loop: Iterates through possible counts for the first color component.
// The loop structure uses an infinite loop with an explicit break condition
// for a different stylistic representation of loop bounds.
for (let currentPrimaryCount = 0; ; currentPrimaryCount++) {
  const calculatedPrimaryValue = currentPrimaryCount * primaryColorIntensity;

  // If the value of the primary color component alone exceeds the target,
  // then no further combinations with this primary count (or higher) are possible.
  if (calculatedPrimaryValue > targetSumValue) {
    break; // Terminate the outer loop.
  }

  // Inner loop: Iterates through possible counts for the second color component.
  for (let currentSecondaryCount = 0; ; currentSecondaryCount++) {
    const calculatedSecondaryValue = currentSecondaryCount * secondaryColorIntensity;
    const combinedPrimarySecondaryValue = calculatedPrimaryValue + calculatedSecondaryValue;

    // If the sum of the first two color components exceeds the target,
    // then no further combinations with this secondary count (or higher) are possible.
    if (combinedPrimarySecondaryValue > targetSumValue) {
      break; // Terminate the inner loop.
    }

    // Calculate the remaining sum that needs to be accounted for by the third color component.
    // This is an explicit intermediate calculation.
    const residualSumForTertiary = targetSumValue - combinedPrimarySecondaryValue;

    // Check two conditions for validity of the third color component:
    // 1. The residual sum must be non-negative (though largely guaranteed by loop breaks).
    // 2. The residual sum must be perfectly divisible by the tertiary color's intensity.
    if (residualSumForTertiary >= 0 && (residualSumForTertiary % tertiaryColorIntensity === 0)) {
      // If both conditions are met, a valid combination has been found.
      totalValidColorCombinations++;
    }
  }
}

// --- Output Result ---

// Print the final computed count of valid combinations to the console.
console.log(totalValidColorCombinations);