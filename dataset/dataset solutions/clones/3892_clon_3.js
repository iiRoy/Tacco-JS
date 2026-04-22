// This module provides a utility to determine if a target value falls within a specified numerical range.

/**
 * Processes raw input data to extract numerical parameters and evaluate a specific condition.
 * This function reads three integer values from the first line of the provided payload:
 * a starting point, an extent, and a reference point. It then checks if the reference point
 * falls within the inclusive range defined by [starting point, starting point + extent].
 *
 * @param {string} sourcePayload - The raw string input, expected to contain
 *                                 space-separated numbers on its initial line.
 * @returns {void} Outputs 'YES' or 'NO' to the console based on the evaluation result.
 *                 Includes error logging for invalid or malformed input.
 */
const evaluateRangeInclusion = (sourcePayload) => {
    // Perform an initial check for the validity and presence of the input payload.
    if (typeof sourcePayload !== 'string' || sourcePayload.length === 0) {
        console.error("Error: Input payload is either not a string or is empty. Cannot proceed with analysis.");
        return; // Exit early if the input is fundamentally invalid.
    }

    // Divide the entire input string into an array of lines, based on newline characters.
    const inputSegments = sourcePayload.split('\n');

    // Focus solely on the first line of the input, as per requirements.
    const primaryDataLine = inputSegments[0];

    // Validate that the primary data line exists and contains actual content.
    if (!primaryDataLine || primaryDataLine.trim().length === 0) {
        console.error("Error: The first line of input data is missing or contains only whitespace.");
        return; // Abort if there's no meaningful data on the first line.
    }

    // Split the primary data line into individual string tokens using space as a delimiter.
    const numericalStringTokens = primaryDataLine.split(' ');

    // Define the minimum expected number of numerical parameters.
    const MINIMUM_EXPECTED_PARAMETERS = 3;

    // Verify if enough tokens were provided to extract all necessary parameters.
    if (numericalStringTokens.length < MINIMUM_EXPECTED_PARAMETERS) {
        console.error(`Error: Insufficient numerical parameters. Expected ${MINIMUM_EXPECTED_PARAMETERS}, but only found ${numericalStringTokens.length}.`);
        return; // Exit if critical data is missing.
    }

    // Parse the first three tokens into numerical values.
    // Using the unary plus operator for type coercion to number, which is a concise alternative to Number() or parseInt().
    const lowerBoundary = +numericalStringTokens[0]; // Corresponds to original 'A'
    const rangeSpan = +numericalStringTokens[1];    // Corresponds to original 'B'
    const testValue = +numericalStringTokens[2];    // Corresponds to original 'X'

    // Conduct a sanity check to ensure all parsed values are valid numbers.
    if (isNaN(lowerBoundary) || isNaN(rangeSpan) || isNaN(testValue)) {
        console.error("Error: One or more parsed input values are not valid numbers. Please check input format.");
        return; // Stop if any parameter is non-numeric.
    }

    // Calculate the upper boundary of the permissible range.
    // This is an explicit intermediate calculation.
    const upperBoundary = lowerBoundary + rangeSpan;

    // Evaluate the two primary conditions separately for clarity.
    // Condition 1: The test value must be greater than or equal to the lower boundary.
    const isTestValueAtOrAboveLower = (testValue >= lowerBoundary);
    // Condition 2: The test value must be less than or equal to the calculated upper boundary.
    const isTestValueAtOrBelowUpper = (testValue <= upperBoundary);

    // Combine both conditions to determine the final outcome.
    const finalDecision = isTestValueAtOrAboveLower && isTestValueAtOrBelowUpper;

    // Prepare the message string based on the final decision.
    let resultOutput;
    if (finalDecision) {
        resultOutput = 'YES'; // The test value falls within the specified range.
    } else {
        resultOutput = 'NO';  // The test value is outside the specified range.
    }

    // Output the determined result to the standard console.
    console.log(resultOutput);
};

// This block handles the execution flow, including reading from standard input.
// It uses Node.js's file system module to read data from '/dev/stdin',
// which is a common practice in competitive programming environments.
try {
    const rawSystemInputBuffer = require('fs').readFileSync('/dev/stdin', 'utf8');
    // Invoke the main processing function with the obtained input.
    evaluateRangeInclusion(rawSystemInputBuffer);
} catch (ioError) {
    // Catch any errors that occur during the file reading process.
    console.error("Fatal Error: Could not read input from /dev/stdin. Details:", ioError.message);
    // In a production environment, one might choose to exit the process here: process.exit(1);
}