"use strict"; // Enforce strict parsing and error handling in the script.

// This constant defines a magic number used in the final calculation.
// Giving it a descriptive name enhances readability and maintainability.
const CALCULATION_ADJUSTMENT_FACTOR = 4;

/**
 * Parses a string value into an integer, providing robust error handling and defaults.
 * @param {number} lineIdx - The index of the line being parsed from the input array.
 * @param {string[]} sourceLines - The array of string lines from which to extract the value.
 * @param {number} [fallbackValue=0] - The default value to return if parsing fails or index is out of bounds.
 * @returns {number} The parsed integer value or the fallback value.
 */
const retrieveNumericParameter = (lineIdx, sourceLines, fallbackValue = 0) => {
    // Validate if the requested line index exists within the source array.
    if (lineIdx < 0 || lineIdx >= sourceLines.length) {
        console.error(`Input data error: Expected line at index ${lineIdx} is missing. Using default: ${fallbackValue}`);
        return fallbackValue;
    }

    const rawLineContent = sourceLines[lineIdx];
    const numericValue = parseInt(rawLineContent, 10);

    // Check if the parsed value is a valid number.
    if (isNaN(numericValue)) {
        console.warn(`Input parsing warning: Non-numeric data found on line ${lineIdx} ("${rawLineContent}"). Using default: ${fallbackValue}`);
        return fallbackValue;
    }

    return numericValue;
};

/**
 * Orchestrates the primary calculation logic based on the provided input string.
 * This function encapsulates the core business logic, making it testable and reusable.
 * @param {string} rawInputString - The entire input content as a single string.
 * @returns {number | null} The final calculated integer result, or null if a critical error occurred.
 */
const executeProcessedCalculations = (rawInputString) => {
    // Sanitize the input string: remove leading/trailing whitespace and split into individual lines.
    const processedInputLines = rawInputString.trim().split("\n");

    // Ensure there are enough lines for all expected parameters.
    // We expect at least 6 lines (N, A, B, C, D, E).
    const MINIMUM_EXPECTED_LINES = 6;
    if (processedInputLines.length < MINIMUM_EXPECTED_LINES) {
        console.error(`Input format error: Expected at least ${MINIMUM_EXPECTED_LINES} lines, but received ${processedInputLines.length}.`);
        return null; // Indicate a critical failure.
    }

    // Extract the primary quantity (N) from the first line.
    const overallItemCount = retrieveNumericParameter(0, processedInputLines, 0);
    if (overallItemCount < 0) {
        console.warn("Input warning: Overall item count is negative. Calculations may yield unexpected results.");
    }

    // Extract the five capacity/rate values (A, B, C, D, E) into an array for easier processing.
    const capacityRates = [];
    for (let i = 1; i <= 5; i++) {
        capacityRates.push(retrieveNumericParameter(i, processedInputLines, 1)); // Default to 1 to prevent division by zero
    }

    // Filter out any non-positive capacities to ensure valid division later.
    // If all capacities are invalid, this indicates a critical problem.
    const validPositiveCapacities = capacityRates.filter(rate => rate > 0);

    if (validPositiveCapacities.length === 0) {
        console.error("Calculation error: No valid positive capacity rates found among the inputs. Cannot perform division.");
        return null; // Indicate a critical failure.
    }

    // Determine the minimum capacity among the valid positive rates.
    // This represents the bottleneck or slowest processing rate.
    const bottleneckCapacity = Math.min(...validPositiveCapacities);

    // Perform the main calculation:
    // 1. Divide the total item count by the bottleneck capacity.
    // 2. Round the result up to the nearest whole number (ceiling function).
    // 3. Add the predefined adjustment factor.
    const preliminaryResult = overallItemCount / bottleneckCapacity;
    const roundedUpCycles = Math.ceil(preliminaryResult);
    const finalComputedValue = roundedUpCycles + CALCULATION_ADJUSTMENT_FACTOR;

    return finalComputedValue;
};

// --- Main execution block ---
try {
    // Attempt to read the input from the standard input stream.
    // This is a common pattern for competitive programming or utility scripts.
    const inputContent = require('fs').readFileSync('/dev/stdin', 'utf8');

    // Call the primary calculation function with the read input.
    const finalAnswer = executeProcessedCalculations(inputContent);

    // Output the result only if the calculation was successful.
    if (finalAnswer !== null) {
        console.log(finalAnswer);
    } else {
        // If finalAnswer is null, an error message has already been logged by the function.
        console.error("Program terminated due to critical errors during calculation.");
        process.exit(1); // Exit with a non-zero code to indicate an error.
    }

} catch (ioError) {
    // Catch any errors that occur during file reading (e.g., file not found, permission issues).
    console.error("System input error: Could not read from '/dev/stdin'. Details:", ioError.message);
    process.exit(1); // Exit with an error code.
}