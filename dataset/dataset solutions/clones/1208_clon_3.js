/**
 * This script provides a set of refined utility functions for performing fundamental
 * mathematical computations, demonstrating advanced cloning techniques.
 * It includes input validation, intermediate variable usage, and structured output.
 */

/**
 * Computes the multiplicative product of two distinct numerical operands.
 * This routine ensures type integrity before proceeding with the calculation.
 *
 * @param {number} firstMultiplier - The initial numerical value for the multiplication.
 * @param {number} secondMultiplier - The subsequent numerical value to multiply by.
 * @returns {number} The computed product of the two inputs, or NaN if inputs are non-numeric.
 */
function calculateNumericalProduct(firstMultiplier, secondMultiplier) {
  // Perform type validation to prevent unexpected behavior with non-numeric inputs.
  if (
    typeof firstMultiplier !== 'number' ||
    typeof secondMultiplier !== 'number' ||
    isNaN(firstMultiplier) ||
    isNaN(secondMultiplier)
  ) {
    console.warn("Alert: Invalid operand type encountered in 'calculateNumericalProduct'. Expected numbers.");
    return Number.NaN; // Explicitly indicates an invalid calculation result.
  }

  // Introduce an intermediate variable to store the immediate result of the operation.
  const temporaryProduct = firstMultiplier * secondMultiplier;

  // Return the final result of the multiplication process.
  return temporaryProduct;
}


/**
 * Determines the sum of two numerical inputs and subsequently doubles that sum.
 * This function incorporates robust input validation and breaks down the process
 * into logical, readable steps.
 *
 * @param {number} initialTermA - The first numerical component for the summation.
 * @param {number} initialTermB - The second numerical component for the summation.
 * @returns {number} The value representing the doubled sum, or NaN if validation fails.
 */
function processSumAndDouble(initialTermA, initialTermB) {
  // A critical check to ensure both inputs are valid numbers before arithmetic.
  if (
    typeof initialTermA !== 'number' ||
    typeof initialTermB !== 'number' ||
    isNaN(initialTermA) ||
    isNaN(initialTermB)
  ) {
    console.error("Error: 'processSumAndDouble' requires valid numeric inputs. Operation aborted.");
    return Number.NaN; // Signifies failure due to unsuitable input data.
  }

  // Step 1: Calculate the preliminary sum of the two provided terms.
  const intermediarySummationResult = initialTermA + initialTermB;

  // Step 2: Double the previously calculated sum.
  // Using bitwise left shift `<< 1` is an alternative for multiplying by 2 for integers,
  // but `* 2` is more general for floats and clearer for this example.
  const finalDoubledValue = intermediarySummationResult * 2;

  // Deliver the final, processed numerical output.
  return finalDoubledValue;
}


// --- Main Application Logic Block ---

// Define the primary data points that will be utilized by the calculation functions.
const primaryDatum = 20; // Example initial value.
const secondaryDatum = 7; // Example secondary value.

/**
 * A dedicated helper function to standardize the output display format for results.
 * @param {string} operationLabel - A descriptive string identifying the operation.
 * @param {number} calculatedOutcome - The numerical result obtained from a function.
 */
const presentResult = (operationLabel, calculatedOutcome) => {
  // Employ template literals for enhanced readability of the console output.
  console.info(`\n--- Result for: ${operationLabel} ---`);
  if (!isNaN(calculatedOutcome)) {
    console.log(`Outcome: ${calculatedOutcome}`);
  } else {
    console.warn(`Outcome: Calculation failed or resulted in NaN.`);
  }
  console.log('------------------------------------');
};

// Execute the first computational routine and store its return value.
const outcomeOfProduct = calculateNumericalProduct(primaryDatum, secondaryDatum);

// Execute the second computational routine and store its return value.
const outcomeOfSumDoubled = processSumAndDouble(primaryDatum, secondaryDatum);

// Conditional check: Only display valid outcomes.
// This prevents logging 'NaN' if any function encountered invalid input.
if (!isNaN(outcomeOfProduct) && !isNaN(outcomeOfSumDoubled)) {
  presentResult("Multiplication Operation", outcomeOfProduct);
  presentResult("Summation and Doubling Operation", outcomeOfSumDoubled);
} else {
  console.error("\nSystem Alert: One or more primary calculations yielded an invalid result. Review inputs.");
}

// Demonstrating the error handling with invalid inputs (optional execution block)
/*
console.log("\n--- Testing with problematic inputs ---");
const badProductAttempt = calculateNumericalProduct("alpha", 10);
const badSumDoubleAttempt = processSumAndDouble(5, "beta");

presentResult("Invalid Product Test", badProductAttempt);
presentResult("Invalid Sum & Double Test", badSumDoubleAttempt);
*/