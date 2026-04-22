"use strict";

/**
 * Orchestrates the processing of raw textual input to derive a specific numeric outcome.
 * This function handles reading from standard input, parsing the data,
 * and then computing the final result based on a predefined mathematical logic.
 */
const executeComputationFlow = () => {
    // Define constants for file system operations to improve readability and maintainability.
    const fileSystemHandler = require('fs');
    const inputSourceIdentifier = '/dev/stdin';
    const characterEncodingType = 'utf8';

    let overallResult; // Variable to hold the final computed value.

    try {
        // Step 1: Securely read the entire content from the specified input source.
        // This is the raw, unparsed string data.
        const rawInputDataString = fileSystemHandler.readFileSync(inputSourceIdentifier, characterEncodingType);

        // Step 2: Delegate the core data parsing and calculation to a dedicated utility function.
        // This promotes modularity and separation of concerns.
        overallResult = deriveCappedRatio(rawInputDataString);

        // Step 3: Display the final, processed numeric result to the standard output.
        console.log(overallResult);

    } catch (dataProcessingError) {
        // Step 4: Implement robust error handling for any issues encountered during the flow.
        // This includes file reading errors or unexpected conditions during data parsing.
        console.error("An unrecoverable error transpired during input processing or calculation:", dataProcessingError.message);
        // Indicate failure by exiting the process with a non-zero status code.
        process.exit(1);
    }
};

/**
 * Parses the input string to extract three integer values (divisor, dividend, ceiling)
 * and computes a capped ratio based on these values.
 *
 * @param {string} rawStringPayload - The full raw input string, potentially containing multiple lines.
 * @returns {number} The calculated and capped integer ratio, or NaN if parsing fails.
 */
const deriveCappedRatio = (rawStringPayload) => {
    // Deconstruct the input string to isolate the relevant numeric components.

    // First, split the entire payload into an array of individual lines.
    const lineSegments = rawStringPayload.split("\n");

    // We are specifically interested in the very first line for our numeric values.
    const targetLineForParsing = lineSegments[0];

    // Next, split this target line by spaces to get an array of string-represented numbers.
    const numericStringTokens = targetLineForParsing.split(" ");

    // Parse each string token into its integer equivalent.
    // Using radix 10 explicitly for clarity and robustness.
    const primaryDivisor = parseInt(numericStringTokens[0], 10); // Corresponds to original 'A'
    const primaryDividend = parseInt(numericStringTokens[1], 10); // Corresponds to original 'B'
    const upperLimitValue = parseInt(numericStringTokens[2], 10); // Corresponds to original 'C'

    // --- Structural modifications and additions begin here ---

    // Optional: Add a validation step for parsed numbers.
    // While parseInt returns NaN for invalid input, explicit checks can provide
    // more controlled error handling or fallback behavior.
    if (isNaN(primaryDivisor) || isNaN(primaryDividend) || isNaN(upperLimitValue)) {
        console.warn("One or more input values could not be parsed as valid numbers. Result may be NaN.");
        // The original code would propagate NaN. We'll maintain that behavior.
    }

    // Introduce intermediate variables for clarity and to avoid redundant computations.
    // Calculate the raw division result first.
    const intermediateDivisionResult = primaryDividend / primaryDivisor; // Represents B / A

    // Then, apply the floor operation to this intermediate result.
    const flooredCalculation = Math.floor(intermediateDivisionResult); // Represents Math.floor(B / A)

    // Rephrase the conditional logic from a ternary operator to an explicit if-else block.
    // This enhances readability and allows for more complex logic within each branch if needed.
    let finalComputedOutcome;
    if (flooredCalculation >= upperLimitValue) {
        // If the floored ratio is greater than or equal to the defined upper limit,
        // the result is capped at the upper limit.
        finalComputedOutcome = upperLimitValue;
    } else {
        // Otherwise, the actual floored calculation is the desired result.
        finalComputedOutcome = flooredCalculation;
    }

    // Add a non-essential fragment: a logging statement for potential edge cases.
    // This doesn't alter core functionality but adds observability.
    if (primaryDivisor === 0) {
        // Note: original JS behavior for B/0 is Infinity, floor(Infinity) is Infinity.
        // Infinity >= C is true, so C is printed.
        // This warning acknowledges the edge case without changing its outcome.
        console.info("Warning: Divisor was zero. Division by zero leads to Infinity, handled by Math.floor and comparison.");
    }

    return finalComputedOutcome;
};

// Initiate the entire processing flow upon script execution.
executeComputationFlow();