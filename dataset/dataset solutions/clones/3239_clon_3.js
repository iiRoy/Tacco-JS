/**
 * @file StringDivergenceAnalyzer.js
 * @description This module provides functionality to analyze character-level differences
 *              across multiple input strings based on a specific divergence metric.
 *              It processes multi-line string input, extracting a character count
 *              and three sequences, then computes an aggregate divergence score.
 *              This is a Type III clone, demonstrating significant structural and
 *              syntactic transformations while maintaining core functional equivalence
 *              to the original problem's logic, including its specific interpretation
 *              of character mismatches.
 */

// Define the primary function responsible for processing the input data.
const analyzeInputSequences = (sourcePayload) => {
    // --- Input Validation and Parsing ---
    // Enforce strict type checking for the input source.
    if (typeof sourcePayload !== 'string' || sourcePayload.length === 0) {
        console.error("Error: The provided data payload must be a non-empty string.");
        // In a production system, an exception might be thrown or a specific error code returned.
        return -1; // Indicate failure to the caller.
    }

    // Trim leading/trailing whitespace from the entire payload.
    const cleanPayload = sourcePayload.trim();
    // Split the cleaned payload into individual lines.
    const contentLines = cleanPayload.split('\n');

    // Expected input structure:
    // Line 0: Numeric value indicating the expected length of subsequent strings.
    // Line 1: First character sequence.
    // Line 2: Second character sequence.
    // Line 3: Third character sequence.

    // A guard clause to ensure sufficient lines are present.
    if (contentLines.length < 4) {
        console.error(`Error: Insufficient data lines. Expected at least 4, but received ${contentLines.length}.`);
        return -1;
    }

    // Parse the expected character length from the first line.
    // Using `Number()` for type conversion, which is generally more flexible than `parseInt()`.
    const declaredCharLength = Number(contentLines[0]);

    // Validate the parsed length.
    if (isNaN(declaredCharLength) || declaredCharLength < 0) {
        console.error(`Error: Invalid character length declaration: "${contentLines[0]}". Must be a non-negative number.`);
        return -1;
    }

    // Extract the three sequences.
    const primaryStr = contentLines[1];
    const secondaryStr = contentLines[2];
    const tertiaryStr = contentLines[3];

    // Additional validation: Ensure all extracted strings match the declared length.
    // If lengths do not match, we can choose to truncate, pad, or error out.
    // For this clone, we'll error out if any string is shorter, or use the declared length as the upper bound.
    if (primaryStr.length < declaredCharLength ||
        secondaryStr.length < declaredCharLength ||
        tertiaryStr.length < declaredCharLength) {
        console.error("Error: One or more input strings are shorter than the declared character length.");
        return -1;
    }

    // --- Core Divergence Calculation Logic ---
    let totalDivergenceScore = 0; // The accumulator for the final result.

    /**
     * @function calculatePositionalDivergence
     * @description Determines the divergence score for three characters at a specific position.
     *              This helper function encapsulates the original problem's specific conditional logic.
     * @param {string} c1 - Character from the primary string.
     * @param {string} c2 - Character from the secondary string.
     * @param {string} c3 - Character from the tertiary string.
     * @returns {number} The divergence score (0, 1, or 2) for the given character triplet.
     */
    const calculatePositionalDivergence = (c1, c2, c3) => {
        // Check if all three characters are identical.
        const allMatch = (c1 === c2) && (c2 === c3);

        // Check if the first and second characters differ AND the second and third characters differ.
        // This specific condition captures scenarios like 'XYZ' (all distinct) AND 'XYX' (first/last same, middle different).
        const firstTwoDifferAndNextTwoDiffer = (c1 !== c2) && (c2 !== c3);

        if (allMatch) {
            // If all characters are the same (e.g., 'A', 'A', 'A'), there's no divergence.
            return 0;
        } else if (firstTwoDifferAndNextTwoDiffer) {
            // If A != B AND B != C, the problem's logic assigns a divergence of 2.
            // This applies to 'A B C' (3 distinct) and 'A B A' (2 distinct, but A!=B and B!=A).
            return 2;
        } else {
            // This 'else' branch catches all remaining cases where exactly two characters are identical.
            // Examples: 'A A B', 'A B B', 'B A A'. These all result in a divergence of 1.
            return 1;
        }
    };

    // Iterate through the strings character by character up to the declared length.
    for (let charPosition = 0; charPosition < declaredCharLength; charPosition++) {
        // Extract characters at the current position. Using bracket notation for conciseness.
        const charFromPrimary = primaryStr[charPosition];
        const charFromSecondary = secondaryStr[charPosition];
        const charFromTertiary = tertiaryStr[charPosition];

        // Accumulate the divergence score using the helper function.
        totalDivergenceScore += calculatePositionalDivergence(
            charFromPrimary,
            charFromSecondary,
            charFromTertiary
        );
    }

    // --- Output Result ---
    // Log the final computed divergence score to standard output.
    console.log(totalDivergenceScore);
    return totalDivergenceScore; // Optionally return the value for testing/further use.
};

// --- Execution Environment Setup ---
// This section handles reading input from the standard input stream (e.g., /dev/stdin).
// It's wrapped in a function for better modularity and error handling.
const fetchStandardInput = () => {
    // Attempt to read the entire content of standard input as a UTF-8 string.
    // This assumes a Node.js environment with the 'fs' module available.
    try {
        const fileSystemModule = require("fs");
        return fileSystemModule.readFileSync("/dev/stdin", "utf8");
    } catch (ioError) {
        console.error("Fatal Error: Could not read from standard input.", ioError.message);
        // Propagate the error or handle it as appropriate for the application context.
        throw new Error("Input read failure.");
    }
};

// --- Main Program Entry Point ---
// Execute the analysis function with data retrieved from standard input.
try {
    const applicationInput = fetchStandardInput();
    analyzeInputSequences(applicationInput);
} catch (executionError) {
    // Catch any errors that occurred during input fetching or analysis.
    console.error("Application encountered a critical error:", executionError.message);
    // Exit the process with a non-zero status code to indicate an error.
    process.exit(1);
}