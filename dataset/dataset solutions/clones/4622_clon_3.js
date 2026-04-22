// This module provides utilities for file system operations.
const fileSystemModule = require("fs");

/**
 * Compares two numeric values obtained from a raw input string and prints their relation.
 * The input string is expected to contain at least two numbers, each on a new line.
 *
 * @param {string} rawInputContent - The raw string data, typically read from a file or stdin.
 *                                  Expected format: "number1\nnumber2\n..."
 * @returns {void} - This function performs side effects by printing the comparison result
 *                   or error messages to the console.
 */
function processNumericComparison(rawInputContent) {
    // --- Input Validation and Preprocessing (Type III: Guard clauses, intermediate steps) ---

    // Initial check for null, undefined, non-string, or empty input content.
    if (!rawInputContent || typeof rawInputContent !== 'string' || rawInputContent.trim().length === 0) {
        console.error("Error: Provided input content is invalid or empty. Cannot perform comparison.");
        return; // Terminate execution if input is unusable.
    }

    // Normalize the entire input string by removing leading/trailing whitespace
    // before splitting it into lines.
    const cleanedInputString = rawInputContent.trim();

    // Split the cleaned string into an array of string segments, based on newline characters.
    // Each segment is expected to represent a numeric value.
    const inputLineSegments = cleanedInputString.split('\n');

    // Ensure that there are at least two lines/segments to compare.
    if (inputLineSegments.length < 2) {
        console.error("Error: Insufficient input lines for comparison. At least two numbers are required.");
        return;
    }

    // --- Helper for Numeric Parsing (Type III: Helper function, error handling) ---

    /**
     * Safely parses a string segment into an integer. Includes validation for non-numeric input.
     * @param {string} segment - The string to parse.
     * @param {number} lineIndex - The original line number for error reporting.
     * @returns {number} The parsed integer, or NaN if parsing fails.
     */
    const parseNumericSegment = (segment, lineIndex) => {
        // Trim whitespace from individual segments before parsing.
        const trimmedSegment = segment.trim();
        const parsedValue = parseInt(trimmedSegment, 10); // Explicitly specify radix 10.

        if (isNaN(parsedValue)) {
            console.error(`Warning: Input on line ${lineIndex + 1} ('${trimmedSegment}') is not a valid number.`);
        }
        return parsedValue;
    };

    // --- Extraction and Conversion (Type III: Named variables, explicit parsing) ---

    // Extract and parse the first two required numeric values from the input segments.
    const primaryNumericValue = parseNumericSegment(inputLineSegments[0], 0);
    const secondaryNumericValue = parseNumericSegment(inputLineSegments[1], 1);

    // Final validation to ensure both primary values are indeed numbers before comparison.
    if (isNaN(primaryNumericValue) || isNaN(secondaryNumericValue)) {
        console.error("Error: One or both primary input values could not be processed as valid numbers. Comparison aborted.");
        return;
    }

    // --- Comparison Logic (Type III: Rewritten conditional, intermediate variable) ---

    // Variable to store the textual outcome of the comparison.
    let comparisonOutcomeDescription;

    // Use an explicit if-else if-else structure for clarity, instead of a ternary operator.
    if (primaryNumericValue === secondaryNumericValue) {
        comparisonOutcomeDescription = "EQUAL"; // The values are identical.
    } else if (primaryNumericValue > secondaryNumericValue) {
        comparisonOutcomeDescription = "GREATER"; // The first value is larger.
    } else {
        comparisonOutcomeDescription = "LESS"; // The first value is smaller.
    }

    // --- Output Result ---

    // Print the determined comparison result to the standard output.
    console.log(comparisonOutcomeDescription);
}

// --- Main Execution Block (Type II: Renamed variables, explicit steps) ---

// Define the standard input file path, common in Unix-like systems for reading from stdin.
const standardInputFilePath = "/dev/stdin";

// Read the raw content from the specified file path into a buffer.
const rawFileBuffer = fileSystemModule.readFileSync(standardInputFilePath);

// Convert the buffer content to a UTF-8 encoded string.
const finalProcessingString = rawFileBuffer.toString("utf8");

// Invoke the primary function to process and compare the numeric data.
processNumericComparison(finalProcessingString);