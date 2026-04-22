/**
 * This module provides a robust function for analyzing sequential numeric data
 * against a specific threshold. It identifies the first instance where a data point
 * exceeds this threshold and calculates its minimum distance to either end
 * of a defined processing range.
 */

/**
 * Processes a multi-line string input to perform a threshold-based proximity analysis.
 * The function expects the first line to contain configuration parameters (N, M, X)
 * and the second line to contain a sequence of data points.
 *
 * It finds the initial data point that surpasses the 'activationThreshold' (X)
 * within the 'iterationCount' (M) elements, then outputs the shortest distance
 * from its index to either the beginning (0) or the end (M-1) of the range.
 * If no such data point is found, or if input is invalid, no output is produced.
 *
 * @param {string} rawInputContent - The complete input as a multi-line string,
 *                                   typically read from standard input.
 * @returns {void} Outputs the result directly to the console or an error message.
 */
const executeSequenceAnalysis = (rawInputContent) => {
    // --- Input Validation and Pre-processing ---
    // Guard clause: Check for null, undefined, or non-string input.
    if (typeof rawInputContent !== 'string' || rawInputContent === null || rawInputContent.trim() === '') {
        console.error("ERROR: Provided input content is invalid or empty. Cannot proceed with analysis.");
        return;
    }

    // Split the entire input string into an array of lines, trimming leading/trailing whitespace.
    const inputLines = rawInputContent.trim().split('\n');

    // Guard clause: Ensure there are at least two lines (for configuration and data).
    if (inputLines.length < 2) {
        console.error("ERROR: Insufficient lines in input. Expected at least two lines.");
        return;
    }

    // --- Configuration Parsing ---
    // Parse the first line to extract numerical configuration values.
    // Expected format: "N M X" (N is often unused, M is loop limit, X is threshold).
    const configurationValues = inputLines[0].split(' ').map(Number);

    // Guard clause: Validate the number of configuration parameters.
    if (configurationValues.length < 3) {
        console.error("ERROR: Malformed configuration line. Expected N, M, X parameters.");
        return;
    }

    // Destructure the parameters for enhanced readability.
    // Note: The 'N' parameter (configurationValues[0]) is not utilized in this specific logic.
    const [, iterationLimit, activationThreshold] = configurationValues;

    // Guard clause: Validate that the parsed configuration values are valid numbers.
    if (isNaN(iterationLimit) || isNaN(activationThreshold) || iterationLimit < 0) {
        console.error("ERROR: Invalid numeric values for iteration limit or activation threshold.");
        return;
    }

    // --- Data Sequence Parsing ---
    // Parse the second line into an array of numeric data points.
    const numericDataSequence = inputLines[1].split(' ').map(Number);

    // --- Core Analysis Loop ---
    // Determine the effective range for iteration. It should not exceed the specified
    // 'iterationLimit' nor the actual length of the 'numericDataSequence'.
    const effectiveIterationRange = Math.min(iterationLimit, numericDataSequence.length);

    // Guard clause: Warn if the data sequence is shorter than the desired iteration limit.
    if (numericDataSequence.length < iterationLimit) {
        console.warn(`WARNING: Data sequence length (${numericDataSequence.length}) is less than specified iteration limit (${iterationLimit}). Processing with available data.`);
    }

    // Iterate through the data points within the determined effective range.
    for (let currentElementIndex = 0; currentElementIndex < effectiveIterationRange; currentElementIndex++) {
        const valueAtCurrentIndex = numericDataSequence[currentElementIndex];

        // Inner Guard: Check for non-numeric data points within the sequence.
        if (isNaN(valueAtCurrentIndex)) {
            console.warn(`WARNING: Non-numeric data encountered at index ${currentElementIndex}. Skipping this element.`);
            continue; // Skip to the next element if the current one is invalid.
        }

        // Check if the current data value exceeds the predefined threshold.
        if (valueAtCurrentIndex > activationThreshold) {
            // If the threshold is surpassed, calculate distances to both boundaries.
            const distanceToBeginning = currentElementIndex;
            const distanceToEnd = iterationLimit - currentElementIndex; // Distance from end of *expected* range M.

            // Determine the minimum of these two calculated distances.
            const shortestProximity = Math.min(distanceToBeginning, distanceToEnd);

            // Output the result and terminate the function immediately, as per requirement.
            console.log(shortestProximity);
            return;
        }
    }

    // If the loop completes without finding any element that exceeds the threshold,
    // the function simply finishes without producing any console output,
    // mirroring the original code's implicit behavior in this scenario.
};

// --- Execution Entry Point ---
// This block handles reading input from standard input (e.g., in a Node.js environment)
// and then invokes the primary analysis function with the collected data.
try {
    const fileSystemModule = require('fs');
    const stdinContent = fileSystemModule.readFileSync('/dev/stdin', 'utf8');
    executeSequenceAnalysis(stdinContent);
} catch (error) {
    console.error(`RUNTIME ERROR: Failed to read from standard input or execute analysis: ${error.message}`);
}