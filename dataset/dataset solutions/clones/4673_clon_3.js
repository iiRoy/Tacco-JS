'use strict'; // Enforce strict parsing and error handling for robust code execution.

/**
 * Processes a raw input string to determine if two primary values within it are identical.
 * This function handles parsing, validation, and the core comparison logic.
 *
 * @param {string} sourceData - The raw string input, expected to be a single line
 *                               containing two space-separated values.
 * @returns {string} - Returns "H" if the two extracted values are identical,
 *                     "D" otherwise (including cases of malformed input).
 */
function analyzeInputValues(sourceData) {
    // Define constant indicators for the comparison result.
    // Using constants enhances readability and maintainability (Type III addition).
    const MATCH_IDENTIFIER = "H"; // Code for identical values.
    const DIVERGENCE_IDENTIFIER = "D"; // Code for differing values or invalid input.

    // --- Input Pre-processing and Validation (Type III additions) ---

    // Ensure the input is a valid string before proceeding.
    // This acts as a guard clause for unexpected input types.
    if (typeof sourceData !== 'string') {
        console.warn("Received non-string input. Returning divergence code.");
        return DIVERGENCE_IDENTIFIER;
    }

    // Split the entire input by newline characters to isolate individual lines.
    const allInputLines = sourceData.split('\n');

    // Focus on the very first line of the input for comparison.
    // This handles multi-line inputs by only considering the first relevant line.
    const primaryInputLine = allInputLines[0];

    // Validate that the primary input line exists and is not empty after trimming whitespace.
    if (!primaryInputLine || primaryInputLine.trim().length === 0) {
        console.warn("Primary input line is empty or missing. Returning divergence code.");
        return DIVERGENCE_IDENTIFIER;
    }

    // Split the primary line by spaces to get the individual value segments.
    const valueSegments = primaryInputLine.split(' ');

    // Validate that there are at least two segments to compare.
    // This is a crucial guard clause for malformed input (e.g., "value1" or "").
    if (valueSegments.length < 2) {
        console.warn(`Insufficient values (${valueSegments.length} found) on primary line for comparison. Returning divergence code.`);
        return DIVERGENCE_IDENTIFIER;
    }

    // --- Core Logic: Value Extraction and Comparison ---

    // Extract the first and second values.
    // Explicitly converting them to String ensures consistent comparison behavior,
    // even though they are already strings from the split operation.
    // This is an 'update/rewrite' by adding an explicit intermediate step.
    const firstComparativeValue = String(valueSegments[0]);
    const secondComparativeValue = String(valueSegments[1]);

    // Perform the comparison.
    // Rewriting 'a == b' to its logical equivalent '!(firstComparativeValue !== secondComparativeValue)'
    // demonstrates a structural update while maintaining identical functionality.
    if (!(firstComparativeValue !== secondComparativeValue)) {
        // If they are not "not equal", then they must be equal.
        return MATCH_IDENTIFIER;
    } else {
        // Otherwise, they are different.
        return DIVERGENCE_IDENTIFIER;
    }
}

/**
 * A utility function to safely read content from a specified file path.
 * This encapsulates file system interaction, demonstrating a Type III addition
 * of a new functional fragment.
 *
 * @param {string} sourcePath - The file path to read from.
 * @returns {string} - The content of the file as a UTF-8 string, or an empty string on error.
 */
function readExternalData(sourcePath) {
    try {
        // Dynamically require the 'fs' module.
        const fileSystem = require("fs");
        // Read the file synchronously and decode it.
        return fileSystem.readFileSync(sourcePath, "utf8");
    } catch (fileReadError) {
        // Log the error for diagnostic purposes without crashing the application.
        console.error(`Failed to read data from ${sourcePath}: ${fileReadError.message}`);
        // Return an empty string, allowing the main processing logic to handle missing data.
        return "";
    }
}

// --- Main Execution Orchestration (Type III structural change: IIFE for control flow) ---
// This immediate invoked function expression (IIFE) serves as the entry point
// and orchestrates the entire process: input acquisition, processing, and output.
(function initiateProgramFlow() {
    // Define the standard input file path.
    const standardInputPath = "/dev/stdin";

    // Acquire the raw data stream from the specified input source.
    const rawDataStream = readExternalData(standardInputPath);

    // Pass the acquired data to the core analysis function.
    const finalOutcomeCode = analyzeInputValues(rawDataStream);

    // Output the determined code to the standard output.
    console.log(finalOutcomeCode);
})();