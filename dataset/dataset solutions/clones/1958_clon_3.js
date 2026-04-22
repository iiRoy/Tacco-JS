// This utility module is designed for fundamental geometrical computations.

/**
 * Computes the perimeter (also known as circumference) of a circular shape.
 * This function ensures robust handling of input values.
 *
 * @param {number} circleRadiusValue - The numeric value representing the radius of the circle.
 *                                     It must be a non-negative number.
 * @returns {number} The calculated circumference of the circle. Returns 0 if the input
 *                   radius is invalid (not a number or negative) after logging a warning.
 */
function determineCircularPerimeter(circleRadiusValue) {
  // Define key mathematical constants for clarity and potential future adjustment.
  const PI_CONSTANT = Math.PI; // Using the more precise Math.PI value.
  const DIAMETER_FACTOR = 2;  // The factor to convert radius into diameter.

  // --- Type III: Add a guard clause for input validation ---
  // This checks if the provided radius is a valid number and is non-negative.
  if (typeof circleRadiusValue !== 'number' || circleRadiusValue < 0) {
    console.warn(`Input Error: The radius '${circleRadiusValue}' is not a valid non-negative number. Returning 0.`);
    return 0; // Return zero for invalid inputs, indicating no perimeter.
  }

  // --- Type III: Introduce an intermediate calculation step for clarity ---
  // First, calculate the diameter of the circle.
  let calculatedDiameter = circleRadiusValue * DIAMETER_FACTOR;

  // Then, compute the actual perimeter using the diameter and PI.
  let finalPerimeterResult = calculatedDiameter * PI_CONSTANT;

  // --- Type II: Renamed local variable for the result ---
  // The original code had a problematic global variable assignment.
  // This version correctly uses a local variable to store the result.
  return finalPerimeterResult;
}

// --- Type III: Add extensive test cases and enhanced logging for demonstration ---

// Define several test radius values, including valid and invalid ones.
const primaryTestRadius = 8.5;
const secondaryTestRadius = 12.0;
const zeroRadiusCase = 0.0;
const invalidNegativeRadius = -5.0;
const nonNumericInput = "ten"; // An example of non-numeric input.

// --- Type II: Reformat console output and rename function calls ---

// Test Case 1: Valid positive radius
const perimeterOne = determineCircularPerimeter(primaryTestRadius);
console.log(`Perimeter for R=${primaryTestRadius}: ${perimeterOne.toFixed(5)} units.`);

// Test Case 2: Another valid positive radius
const perimeterTwo = determineCircularPerimeter(secondaryTestRadius);
console.info(`Calculated value for a circle with radius ${secondaryTestRadius}: ${perimeterTwo.toFixed(4)}.`);

// Test Case 3: Zero radius (edge case)
const perimeterZero = determineCircularPerimeter(zeroRadiusCase);
console.log(`Circle with zero radius (R=${zeroRadiusCase}) has perimeter: ${perimeterZero.toFixed(1)}.`);

// Test Case 4: Invalid negative radius (triggers guard clause)
const errorPerimeterNegative = determineCircularPerimeter(invalidNegativeRadius);
console.error(`Attempted calculation with negative radius ${invalidNegativeRadius}. Result: ${errorPerimeterNegative}.`);

// Test Case 5: Non-numeric input (triggers guard clause)
const errorPerimeterNonNumeric = determineCircularPerimeter(nonNumericInput);
console.error(`Attempted calculation with non-numeric input '${nonNumericInput}'. Result: ${errorPerimeterNonNumeric}.`);

// --- Type III: Introduce a self-executing anonymous function for an isolated test ---
// This demonstrates adding a new code fragment that encapsulates specific logic.
(function() {
    const ephemeralRadius = 4.2;
    const immediatePerimeter = determineCircularPerimeter(ephemeralRadius);
    // Using console.debug for less critical log output, often hidden by default.
    console.debug(`[DEBUG INFO] Ad-hoc perimeter calculation for R=${ephemeralRadius}: ${immediatePerimeter.toFixed(3)}.`);
})();