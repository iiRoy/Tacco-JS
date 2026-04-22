"use strict";

/**
 * This module processes a string of numerical input to calculate a specific score.
 * It simulates a resource allocation or consumption problem with several stages.
 */

/**
 * Orchestrates the processing of input data and prints the final calculated result.
 * The function expects a string containing three space-separated integer values.
 *
 * @param {string} rawInputString - The raw input string containing three space-separated numbers.
 */
const processInputData = (rawInputString) => {
  // --- Input Validation and Parsing Stage ---

  // Initial check for empty or whitespace-only input to prevent errors.
  if (!rawInputString || rawInputString.trim().length === 0) {
    console.error("Input processing aborted: Provided string is empty or contains only whitespace.");
    return; // Exit if input is invalid.
  }

  // Split the trimmed input string into its individual numeric components.
  const numericComponents = rawInputString.trim().split(" ");

  // Validate if the expected number of components (three) is present.
  const REQUIRED_COMPONENTS = 3;
  if (numericComponents.length < REQUIRED_COMPONENTS) {
    console.error(`Input processing aborted: Expected ${REQUIRED_COMPONENTS} numeric components but received ${numericComponents.length}.`);
    return; // Exit if not enough components.
  }

  // Declare variables to hold the parsed numeric values.
  let primaryQuantity;   // Corresponds to 'a' in the original code.
  let secondaryQuantity; // Corresponds to 'b' in the original code.
  let tertiaryQuantity;  // Corresponds to 'c' in the original code.

  try {
    // Attempt to convert string components to numbers. Using Number() for type conversion.
    primaryQuantity = Number(numericComponents[0]);
    secondaryQuantity = Number(numericComponents[1]);
    tertiaryQuantity = Number(numericComponents[2]);

    // Further validation to ensure all parsed components are indeed valid numbers.
    if (isNaN(primaryQuantity) || isNaN(secondaryQuantity) || isNaN(tertiaryQuantity)) {
      console.error("Input processing aborted: One or more parsed components are not valid numbers.");
      return; // Exit if any component is not a number.
    }
  } catch (conversionError) {
    // Catch any unexpected errors during the number conversion process.
    console.error(`An unexpected error occurred during number conversion: ${conversionError.message}`);
    return; // Exit on conversion error.
  }

  // Initialize the accumulator for the final computed score.
  let cumulativeScore = 0; // Corresponds to 'ans' in the original code.

  // --- First Stage Calculation: Interaction between secondary and tertiary quantities ---
  // This block determines how 'secondaryQuantity' affects 'tertiaryQuantity' and 'cumulativeScore'.
  // It models a scenario where 'secondaryQuantity' can either fully cover 'tertiaryQuantity'
  // or be partially consumed by it.
  if (secondaryQuantity >= tertiaryQuantity) {
    // Case 1: Secondary quantity is sufficient to cover or exceed tertiary quantity.
    // In this scenario, both quantities contribute directly to the score,
    // and the tertiary quantity is considered fully utilized/depleted.
    cumulativeScore = cumulativeScore + tertiaryQuantity + secondaryQuantity;
    tertiaryQuantity = 0; // Tertiary quantity is completely consumed.
    // secondaryQuantity remains its value, but it's not used in subsequent steps.
  } else {
    // Case 2: Secondary quantity is less than tertiary quantity.
    // Here, secondary quantity contributes twice its value to the score,
    // and the tertiary quantity is reduced by the secondary quantity's amount.
    // The secondary quantity is considered fully utilized/depleted.
    cumulativeScore = cumulativeScore + (secondaryQuantity * 2);
    tertiaryQuantity = tertiaryQuantity - secondaryQuantity; // Reduce tertiary by secondary amount.
    secondaryQuantity = 0; // Secondary quantity is completely consumed.
  }

  // --- Second Stage Calculation: Interaction between remaining tertiary and primary quantities ---
  // If there's still a positive 'tertiaryQuantity' left after the first stage,
  // 'primaryQuantity' is used to cover as much of it as possible.
  if (tertiaryQuantity > 0) {
    // Calculate the amount that can be deducted from 'tertiaryQuantity',
    // limited by the available 'primaryQuantity'.
    const deductibleAmount = Math.min(tertiaryQuantity, primaryQuantity);

    // Update 'tertiaryQuantity' by reducing it by the 'deductibleAmount'.
    tertiaryQuantity = tertiaryQuantity - deductibleAmount;

    // Add the 'deductibleAmount' to the 'cumulativeScore'.
    cumulativeScore = cumulativeScore + deductibleAmount;
  }

  // --- Final Adjustment Stage ---
  // After all previous calculations, if 'tertiaryQuantity' is still positive,
  // a final bonus of 1 is added to the 'cumulativeScore'.
  if (tertiaryQuantity > 0) {
    cumulativeScore = cumulativeScore + 1; // Increment the score by one unit.
  }

  // --- Output Stage ---
  // Display the final computed score to the console.
  console.log(cumulativeScore);
};

// Entry point for execution in a Node.js-like environment.
// Reads the input string from standard input ("/dev/stdin") using the 'fs' module
// and passes it to the main processing function.
processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));