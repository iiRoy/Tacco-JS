/**
 * This script processes a string input containing two integer dimensions
 * and computes a specific value based on these dimensions.
 * It's designed to solve a problem where the result depends on whether
 * either dimension is unity.
 */

// Define the core processing function for modularity.
// It takes the raw input string and outputs the result to console.
function processDimensionMetrics(receivedPayload) {
    // Normalize the input string by removing any leading or trailing whitespace.
    // This step ensures consistent parsing.
    const cleanedPayload = receivedPayload.trim();

    // Deconstruct the cleaned payload into its constituent parts.
    // The expected format is two space-separated numbers.
    const componentStrings = cleanedPayload.split(' ');

    // --- Input Validation and Early Exit ---
    // A robust check to ensure we received enough data points.
    // If not, log an error and terminate execution for this input.
    if (componentStrings.length < 2) {
        console.error("Error: Input payload is incomplete. Expected at least two numeric components.");
        return; // Halt processing due to invalid input structure.
    }

    // Parse the first component into an integer for the primary dimension.
    // The unary plus operator (`+`) is used here as a concise way to convert to a number.
    const primaryDimensionValue = +componentStrings[0];

    // Parse the second component into an integer for the secondary dimension.
    const secondaryDimensionValue = +componentStrings[1];

    // Another validation step: ensure that the parsed values are indeed numbers.
    // NaN (Not-a-Number) indicates a parsing failure.
    if (isNaN(primaryDimensionValue) || isNaN(secondaryDimensionValue)) {
        console.error("Error: One or both dimension values are not valid numbers.");
        return; // Halt processing due to invalid numeric input.
    }

    // Introduce a flag to simplify conditional logic for special cases.
    let isUnitDimensionPresent = false;
    if (primaryDimensionValue === 1 || secondaryDimensionValue === 1) {
        isUnitDimensionPresent = true;
    }

    let finalCalculatedResult; // Declare the result variable to be assigned later.

    // --- Core Logic Branching ---
    // If a unit dimension (value of 1) is found, the result is fixed at 1.
    if (isUnitDimensionPresent) {
        finalCalculatedResult = 1;
    } else {
        // Otherwise, perform the standard calculation.
        // First, compute the product of the two dimensions.
        const productOfDimensions = primaryDimensionValue * secondaryDimensionValue;

        // Then, divide the product by two and round the result up to the nearest integer.
        // This often represents scenarios like allocating resources or counting grid cells.
        finalCalculatedResult = Math.ceil(productOfDimensions / 2);
    }

    // --- Output Phase ---
    // Display the final computed result to the standard output.
    // This is the intended outcome of the script's execution.
    console.log(finalCalculatedResult);
}

// --- Entry Point for Script Execution ---
// Read the entire content of the standard input stream.
// This is a common pattern in competitive programming environments.
// The input is expected to be encoded in UTF-8.
const stdinContent = require("fs").readFileSync("/dev/stdin", "utf8");

// Invoke the main processing function with the data obtained from standard input.
processDimensionMetrics(stdinContent);