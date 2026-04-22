/*
 * This module processes two initial numeric values, performs a series of
 * calculations based on their comparison, and logs a specific outcome.
 *
 * This represents a Type III code clone, showcasing significant
 * structural alterations, extensive identifier renaming,
 * and the inclusion/removal of code fragments while strictly
 * preserving the original functional behavior.
 */

// Define the primary and secondary base values.
// These constants replace the original 'A' and 'B' placeholders.
const initialPrimaryValue = 10; // Equivalent to 'A'
const initialSecondaryValue = 5; // Equivalent to 'B'

// --- Preliminary Input Validation (New Fragment: Guard Clause) ---
// Ensures that the core operational values are valid numbers before proceeding.
// If inputs are invalid, a warning is issued, and a default message is prepared.
if (typeof initialPrimaryValue !== 'number' || typeof initialSecondaryValue !== 'number') {
  console.error("System Alert: Non-numeric input detected. Processing cannot continue with valid results.");
  let errorOutput = "ERROR: Invalid numeric inputs provided.";
  // In a production environment, one might throw an exception or exit the process here.
  // For this demonstration, we'll log a warning and proceed with a default message.
  console.warn(errorOutput);
  // We could potentially set default values or exit. For now, the subsequent logic
  // might produce NaN or '0' if the helper function handles non-numbers.
}

// Declare the working variables for the arithmetic operations.
// These correspond to the original 'x' and 'y'.
let operationalValueOne = initialPrimaryValue;
let operationalValueTwo = initialSecondaryValue;

// --- Utility Function (New Fragment: Helper Function) ---
// This function encapsulates a common calculation pattern: value + (value - 1),
// which simplifies to (2 * value) - 1.
const computeTransformedValue = (inputOperand) => {
  // Internal validation for robustness, even for helper functions.
  if (typeof inputOperand !== 'number') {
    console.warn("computeTransformedValue received non-numeric data. Returning zero to prevent errors.");
    return 0; // Return a default/safe value
  }
  return (inputOperand * 2) - 1; // Simplified arithmetic expression
};

// Calculate the potential outcomes for different comparison scenarios.
// These variables correspond to the original 'i' and 'j'.
let outcomeForGreaterPrimary = computeTransformedValue(operationalValueOne);
let outcomeForLesserPrimary = computeTransformedValue(operationalValueTwo);

// --- Core Decision Logic (Structural Update) ---
// Determine the final message based on the comparison of the two operational values.
// The original if/else-if/else structure is re-arranged and enhanced.

let finalDisplayMessage = "No specific condition met, check inputs."; // Initialize output string

// Introduce boolean flags for clarity in conditional checks.
const isPrimaryComponentDominant = (operationalValueOne > operationalValueTwo);
const areBothComponentsIdentical = (operationalValueOne === operationalValueTwo);

if (isPrimaryComponentDominant) {
  // Condition: operationalValueOne is strictly greater than operationalValueTwo.
  // Original: if (x > y) { console.log(i); }
  finalDisplayMessage = `The first operand (${operationalValueOne}) is larger. Result: ${outcomeForGreaterPrimary}`;
} else if (!areBothComponentsIdentical) {
  // Condition: operationalValueOne is NOT identical, and NOT dominant,
  // therefore operationalValueOne must be strictly less than operationalValueTwo.
  // Original: else if (x < y) { console.log(j); }
  finalDisplayMessage = `The second operand (${operationalValueTwo}) is larger. Result: ${outcomeForLesserPrimary}`;
} else {
  // Condition: Both operational values are identical.
  // Original: else { console.log(k); } where k = x + y.
  // The 'k' variable is eliminated; its calculation is directly performed here. (Deletion & Inlining)
  const combinedTotal = operationalValueOne + operationalValueTwo;
  finalDisplayMessage = `Operands are equal (${operationalValueOne} and ${operationalValueTwo}). Their sum: ${combinedTotal}`;
}

// --- Final Output Stage (Updated Logging) ---
// Display the aggregated result message to the console.
console.info("--- Program Execution Log Start ---"); // Added informational log
console.log(`Computed Result: ${finalDisplayMessage}`);
console.info("--- Program Execution Log End ---"); // Added informational log