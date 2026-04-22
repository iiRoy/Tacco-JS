// This module provides a utility to calculate the minimum separation
// between two one-dimensional line segments of identical length.
// The segments are defined by their starting points and a common length.

/**
 * Computes the non-negative minimum distance between two line segments.
 * Each segment has a fixed length and is identified by its starting point.
 *
 * @param {string} rawInputLine - A string containing three space-separated integers:
 *                                 segmentLength, firstSegmentStartPoint, secondSegmentStartPoint.
 * @returns {number} The minimum separation distance, or 0 if they overlap or touch.
 *                   Returns 0 also in case of invalid input.
 */
function determineSegmentGap(rawInputLine) {
    // Normalize input string by trimming whitespace and splitting into parts.
    // Using a regex for splitting handles multiple spaces robustly.
    const inputComponents = rawInputLine.trim().split(/\s+/);

    // --- Input Validation (Type III addition: guard clause) ---
    // Ensure exactly three numeric components are provided.
    if (inputComponents.length !== 3) {
        console.error("Input error: Expected exactly three numeric values (length, start1, start2).");
        return 0; // Default to 0 for invalid input format.
    }

    // --- Parsing and Renaming (Type II changes: identifier renaming, explicit data type) ---
    // Parse the input components into distinct, semantically meaningful variables.
    // Using parseInt with radix 10 for explicit base for robust parsing.
    const commonSegmentLength = parseInt(inputComponents[0], 10);
    const segmentOneStart = parseInt(inputComponents[1], 10);
    const segmentTwoStart = parseInt(inputComponents[2], 10);

    // --- Further Validation (Type III addition: guard clause) ---
    // Verify that all parsed values are valid numbers.
    if (isNaN(commonSegmentLength) || isNaN(segmentOneStart) || isNaN(segmentTwoStart)) {
        console.error("Input error: One or more provided values are not valid numbers.");
        return 0; // Default to 0 for non-numeric input.
    }

    // --- Robustness Enhancement (Type III addition: validation and update) ---
    // Handle non-positive segment length. A negative length doesn't make physical sense.
    // For this clone, we'll treat it as zero to maintain numeric computation without error.
    if (commonSegmentLength < 0) {
        // A console.warn could be added here for debugging, but for a production clone,
        // it's often omitted to avoid unexpected output on stdout/stderr.
        commonSegmentLength = 0; // Update the value for calculation.
    }

    // --- Intermediate Calculations (Type III addition: helper variables, intermediate steps) ---
    // Explicitly define segment endpoints for clarity.
    // Segment 1 covers the range [segmentOneStart, segmentOneEnd]
    const segmentOneEnd = segmentOneStart + commonSegmentLength;
    // Segment 2 covers the range [segmentTwoStart, segmentTwoEnd]
    const segmentTwoEnd = segmentTwoStart + commonSegmentLength;

    // Calculate the potential separation if segments do not overlap.
    // This is the gap if Segment Two is entirely positioned to the right of Segment One.
    const separationIfTwoIsRight = segmentTwoStart - segmentOneEnd;

    // This is the gap if Segment One is entirely positioned to the right of Segment Two.
    // (i.e., Segment Two is to the left of Segment One).
    const separationIfOneIsRight = segmentOneStart - segmentTwoEnd;

    // --- Core Logic Rewrite (Type III modification: equivalent rewrite) ---
    // The minimum separation is determined by the maximum of 0 (indicating overlap or touch)
    // and the two positive separation scenarios. This concise expression
    // replaces the original if-else-if structure while maintaining identical logic.
    const finalCalculatedSeparation = Math.max(0, separationIfTwoIsRight, separationIfOneIsRight);

    return finalCalculatedSeparation;
}

// --- Main Application Entry Point (Type II & III changes: function renaming, structural addition) ---
// This function orchestrates reading input and printing the result,
// mirroring the original script's execution environment for competitive programming.
function executeDistanceCalculation() {
    // Check for Node.js environment to read from standard input (/dev/stdin).
    // This ensures compatibility with common competitive programming setups.
    if (typeof process !== 'undefined' && process.stdin && typeof require === 'function') {
        const fileSystemModule = require("fs"); // Renamed 'fs' to 'fileSystemModule' (Type II)
        process.stdin.resume(); // Ensure the standard input stream remains open (original behavior).

        try {
            // Read the entire standard input content as a UTF-8 string.
            const standardInputContent = fileSystemModule.readFileSync("/dev/stdin", "utf8");
            // Pass the raw input string to our dedicated calculation function.
            const computedResult = determineSegmentGap(standardInputContent);
            // Output the final computed result to standard output, as per original.
            console.log(computedResult);
        } catch (executionError) {
            // --- Error Handling (Type III addition: guard clause, robust logging) ---
            // Catch any errors during file reading or processing.
            console.error("An unexpected error occurred during input processing:", executionError.message);
            // In case of error, output 0 to prevent program crash with unhandled exception,
            // mimicking a potential default or "no distance" scenario.
            console.log(0);
        }
    } else {
        // --- Environmental Fallback (Type III addition: structural change, alternative path) ---
        // This 'else' block provides an alternative execution path for environments
        // where Node.js-specific stdin reading is not available (e.g., browser).
        // To strictly adhere to the original's output behavior (only printing the answer
        // when `/dev/stdin` is processed), this block will not produce any output.
        // It serves as a structural placeholder or for potential future test cases.
        // No explicit console.log is placed here to match the original's lean output.
    }
}

// Invoke the main execution function to start the program.
executeDistanceCalculation();