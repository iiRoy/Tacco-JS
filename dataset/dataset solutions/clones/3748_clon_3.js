'use strict';

// Define a constant for the upper limit to improve readability and maintainability.
const BOUNDARY_LIMIT = 8;
// Define the character used to separate values in the input string.
const INPUT_SEPARATOR = ' ';

/**
 * Validates if a given numeric value is within the acceptable threshold.
 * This helper function encapsulates the comparison logic.
 * @param {number} value - The number to check.
 * @param {number} threshold - The maximum allowed value (inclusive).
 * @returns {boolean} True if the value is less than or equal to the threshold, false otherwise.
 */
function isWithinLimit(value, threshold) {
    // A simple check to ensure the value does not exceed the specified threshold.
    return value <= threshold;
}

/**
 * Executes a comparison logic based on two parsed numeric inputs.
 * It reads values from a string, performs validation, and prints a result.
 * This function serves as the main entry point for processing the input data.
 * @param {string} rawInputString - The raw string data, expected to contain two space-separated integers.
 */
function performDualValueCheck(rawInputString) {
    // Attempt to split the input string into individual components using the defined separator.
    const inputSegments = rawInputString.split(INPUT_SEPARATOR);

    // Guard clause: Ensure we have at least two parts to process.
    // This prevents errors if the input format is incorrect.
    if (inputSegments.length < 2) {
        console.error("Error: Insufficient input values provided. Expected two numbers.");
        return; // Exit early if input is malformed.
    }

    // Parse the first segment into an integer, explicitly using base 10 for safety.
    const primaryValue = parseInt(inputSegments[0], 10);
    // Parse the second segment into an integer, also specifying base 10.
    const secondaryValue = parseInt(inputSegments[1], 10);

    // Validate that both parsed values are indeed valid numbers.
    // isNaN returns true if the value is Not-a-Number.
    if (isNaN(primaryValue) || isNaN(secondaryValue)) {
        console.error("Error: One or both input values are not valid integers.");
        return; // Exit if parsing failed for any value.
    }

    // Determine if both values satisfy the defined limit using the helper function.
    // This makes the condition more readable and modular.
    const primaryConditionMet = isWithinLimit(primaryValue, BOUNDARY_LIMIT);
    const secondaryConditionMet = isWithinLimit(secondaryValue, BOUNDARY_LIMIT);

    // The final decision logic: both conditions must be true for a positive outcome.
    if (primaryConditionMet && secondaryConditionMet) {
        // Both values are within the acceptable range.
        console.log('Operation Successful!');
    } else {
        // At least one value exceeded the acceptable range, or was otherwise invalid.
        console.log('Condition Not Met.');
    }
}

// Main execution block of the script:
// Read the raw content from the standard input stream.
// 'node:fs' is used for explicit Node.js module access.
// Ensure the content is decoded as UTF-8 and any leading/trailing whitespace is removed for clean parsing.
const standardInputStreamContent = require("node:fs").readFileSync("/dev/stdin", "utf8").trim();

// Invoke the core logic function with the prepared input string.
performDualValueCheck(standardInputStreamContent);

// This application demonstrates basic input parsing, validation, and conditional logic.