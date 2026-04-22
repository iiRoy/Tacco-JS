"use strict"; // Enforce strict mode for clean code practices

// Constant for the decimal radix, promoting readability and consistency
const DECIMAL_RADIX_VALUE = 10;

/**
 * Parses a string value into an integer using a specified radix.
 * Includes basic validation to ensure a valid numeric string is processed.
 * @param {string} stringRepresentation - The string to parse.
 * @param {number} baseRadix - The base (radix) for parsing, e.g., 10 for decimal.
 * @returns {number} The parsed integer, or 0 if parsing fails or input is invalid.
 */
const extractNumericalComponent = (stringRepresentation, baseRadix) => {
    // Defensive check: ensure input is a non-empty string.
    if (typeof stringRepresentation !== 'string' || stringRepresentation.trim().length === 0) {
        // In a production system, this might throw an error or log a warning.
        // For this context, returning 0 maintains expected behavior for invalid inputs.
        return 0;
    }
    const parsedValue = parseInt(stringRepresentation, baseRadix);
    // Return 0 if the parsed value is not a number (NaN), otherwise return the value.
    return isNaN(parsedValue) ? 0 : parsedValue;
};

/**
 * Orchestrates the main logic of the application:
 * - Parses input string into numerical components.
 * - Performs a conditional calculation based on these numbers.
 * - Outputs the final result to the console.
 * @param {string} rawDataPayload - The raw input string, typically from stdin.
 */
const executeCoreLogic = (rawDataPayload) => {
    // Initial validation of the incoming data payload
    if (!rawDataPayload || typeof rawDataPayload !== 'string' || rawDataPayload.trim().length === 0) {
        console.error("Error: Received an invalid or empty data payload for processing.");
        console.log(0); // Default output for critical input failure
        return; // Terminate execution for invalid input
    }

    // Normalize whitespace and split the payload into individual string tokens
    const dataTokens = rawDataPayload.trim().split(' ');

    // Validate that the expected number of tokens are present
    if (dataTokens.length < 3) {
        console.error("Error: Insufficient numerical components provided. Expected 3 values.");
        console.log(0); // Default output for insufficient input
        return;
    }

    // Extract and parse the three numeric values using the helper function
    // Variables are renamed for improved semantic meaning in this context
    const principalLimit = extractNumericalComponent(dataTokens[0], DECIMAL_RADIX_VALUE); // Corresponds to original 'A'
    const firstQuantity = extractNumericalComponent(dataTokens[1], DECIMAL_RADIX_VALUE);  // Corresponds to original 'B'
    const secondQuantity = extractNumericalComponent(dataTokens[2], DECIMAL_RADIX_VALUE); // Corresponds to original 'C'

    // Calculate the combined total of the two quantities
    const aggregatedTotal = firstQuantity + secondQuantity;

    // Initialize the outcome variable; it will hold 0 if no excess is found
    let finalOutputValue = 0;

    // Determine the final output based on the comparison
    if (aggregatedTotal > principalLimit) {
        // If the combined total exceeds the limit, calculate the surplus
        const calculatedSurplus = aggregatedTotal - principalLimit; // Corresponds to original 'remaining'
        finalOutputValue = calculatedSurplus;
    }
    // If aggregatedTotal is not greater than principalLimit, finalOutputValue remains 0,
    // effectively covering the original 'else { console.log(0); }' branch.

    // Display the computed result to the standard output
    console.log(finalOutputValue);
};

// --- Application Entry Point & Input Handling ---

// Wrap the file reading and main logic execution in a try-catch block
// for robust error handling during I/O operations.
try {
    // Acquire the raw input data from the standard input stream
    // This line is typical for competitive programming environments
    const rawSystemInput = require("fs").readFileSync("/dev/stdin", "utf8");

    // Invoke the core logic function with the retrieved input
    executeCoreLogic(rawSystemInput);
} catch (systemExecutionError) {
    // Catch and report any errors that occur during the input reading or processing phase
    console.error("An unrecoverable error occurred during application execution:", systemExecutionError.message);
    console.log(0); // Ensure an output is always provided, even in error scenarios
}