/*
 * This module processes a raw text input to calculate a specific numeric value.
 * The input is expected to be a single line containing two space-separated numbers.
 *
 * The calculation performed is: first_number + (second_number / 2).
 */

// Helper function to safely read content from standard input.
const obtainSystemInput = () => {
    try {
        // Attempt to read data from the standard input stream, expecting UTF-8 encoding.
        return require('fs').readFileSync('/dev/stdin', 'utf8');
    } catch (inputReadError) {
        // Log an error if reading fails and return an empty string to prevent further errors.
        console.error("Error encountered while reading system input:", inputReadError.message);
        return ""; // Return an empty string for graceful degradation
    }
};

/**
 * Computes a derived numerical value based on a provided string payload.
 * The input string should contain at least one newline, and the first line
 * should contain two space-separated numerical values.
 *
 * @param {string} incomingPayload - The raw string data received for processing.
 * @returns {number | string} The calculated result or an error message if input is invalid.
 */
function deriveCompoundMetric(incomingPayload) {
    // Trim potential leading/trailing whitespace from the entire payload.
    const trimmedPayload = incomingPayload.trim();

    // Check if the payload is empty after trimming.
    if (!trimmedPayload) {
        console.warn("Input payload is empty. Cannot perform calculation.");
        return "ERROR: Empty input.";
    }

    // Extract the first meaningful line from the input.
    // Using indexOf and slice for a slight variation from split('\n')[0].
    const newLineIndex = trimmedPayload.indexOf('\n');
    const primaryInputLine = newLineIndex !== -1 ? trimmedPayload.slice(0, newLineIndex) : trimmedPayload;

    // Check if the primary line is empty after extraction.
    if (!primaryInputLine.length) {
        console.warn("No valid first line found in the input payload.");
        return "ERROR: No data line.";
    }

    // Split the primary line into string components based on spaces.
    // Using a regex to handle multiple spaces robustly.
    const stringComponents = primaryInputLine.split(/\s+/).filter(Boolean); // Filter out empty strings from multiple spaces

    // Validate that there are at least two numeric components available.
    if (stringComponents.length < 2) {
        console.error(`Insufficient components (${stringComponents.length} found). Expected at least two.`);
        return "ERROR: Insufficient data points.";
    }

    // Extract the raw string values of the first two components.
    const firstComponentStr = stringComponents[0];
    const secondComponentStr = stringComponents[1];

    // Attempt to parse the string components into floating-point numbers.
    let firstNumericVal = parseFloat(firstComponentStr);
    let secondNumericVal = parseFloat(secondComponentStr);

    // Validate if the parsed values are indeed numbers.
    if (isNaN(firstNumericVal) || isNaN(secondNumericVal)) {
        console.error(`Invalid numeric input detected: '${firstComponentStr}', '${secondComponentStr}'`);
        return "ERROR: Non-numeric input.";
    }

    // Calculate the weighted second component (half of its value).
    const weightedSecondComponent = secondNumericVal / 2.0; // Explicitly using 2.0 for float division clarity.

    // Compute the final result by summing the first numeric value and the weighted second component.
    const finalCalculatedResult = firstNumericVal + weightedSecondComponent;

    // Output the final result to the console with a clear message.
    console.log(`Computed Result: ${finalCalculatedResult}`);
    return finalCalculatedResult; // Also return the result for potential further use.
}

// Main execution block:
// Fetch the raw input and then process it using the defined function.
try {
    const rawInputFromSystem = obtainSystemInput();
    deriveCompoundMetric(rawInputFromSystem);
} catch (executionError) {
    // Catch any unexpected errors during the main execution flow.
    console.error("An unhandled error occurred during program execution:", executionError.message);
}