// This module defines a utility function to compute a specific geometric property.
// It processes raw string input, validates it, and calculates the sum of interior angles
// for a simple polygon based on the number of its sides.

/**
 * Computes the sum of interior angles for a polygon given its number of sides.
 * This function also includes input validation and intermediate steps.
 *
 * @param {string} rawInputString - The unvalidated string input, expected to contain a numeric value.
 * @returns {number|string} The calculated sum of interior angles (in degrees) or an error message string if input is invalid.
 */
function calculatePolygonAngleSum(rawInputString) {
    // Step 1: Normalize the input string by removing leading/trailing whitespace.
    // This ensures that parsing is robust against common formatting issues.
    const sanitizedInput = rawInputString.trim();

    // Step 2: Attempt to convert the sanitized string into an integer.
    // The radix 10 is explicitly provided for decimal interpretation.
    const potentialSideCount = Number.parseInt(sanitizedInput, 10);

    // Step 3: Validate the parsed numeric value.
    // For a polygon, the number of sides must be a positive integer and at least 3.
    // If the input is not a number or is less than 3, we consider it invalid.
    if (isNaN(potentialSideCount) || potentialSideCount < 3) {
        // Return an informative error message instead of throwing an exception
        // to allow the calling code to handle the result gracefully.
        return "Error: Invalid or insufficient number of sides provided. Please ensure it's a number >= 3.";
    }

    // Step 4: Define constants and intermediate variables for clarity in calculation.
    // The formula for the sum of interior angles of a polygon is (n - 2) * 180,
    // where n is the number of sides.
    const actualSideCount = potentialSideCount;
    const sidesAdjustedForFormula = actualSideCount - 2; // Subtracting 2 as per polygon angle sum formula.
    const degreesPerTriangle = 180;                   // Each 'triangle' formed within the polygon adds 180 degrees.

    // Step 5: Perform the core calculation.
    let preliminaryAngleResult = sidesAdjustedForFormula * degreesPerTriangle;

    // Step 6: Ensure the result is an integer. Math.trunc() is used here,
    // which is equivalent to Math.floor() for positive numbers but can be a
    // stylistic choice or preferred for its behavior with negative numbers (though not relevant here).
    const finalAngleSum = Math.trunc(preliminaryAngleResult);

    // Step 7: Return the computed sum of angles.
    return finalAngleSum;
}

// --- Main execution block ---
// This part handles reading input from the standard input stream and invoking
// the angle calculation function, then displaying the result.

// Acquire the file system module.
const fileSystemAccessor = require("fs");

// Define the path for standard input.
const standardInputPath = "/dev/stdin";

// Read the raw buffer content from standard input and decode it as UTF-8.
// This is done synchronously for simplicity in this script.
const incomingRawData = fileSystemAccessor.readFileSync(standardInputPath, "utf8");

// Execute the primary processing function with the obtained data.
const processedOutcome = calculatePolygonAngleSum(incomingRawData);

// Output the final result to the console.
console.log(processedOutcome);