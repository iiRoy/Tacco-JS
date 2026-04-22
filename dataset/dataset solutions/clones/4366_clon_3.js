// This utility module is designed for processing structured numerical range data
// provided as a multi-line string input. Its primary function is to
// calculate the total inclusive span across all valid numerical intervals.

/**
 * Computes the aggregate length of multiple numerical intervals.
 * Each interval is defined by a start and an end point. The length of an
 * interval [start, end] is calculated as (end - start + 1), ensuring
 * both endpoints are included.
 *
 * The function robustly handles input by filtering out empty lines,
 * validating the structure of each line, and providing default values
 * for malformed numeric tokens.
 *
 * @param {string} rawInputTextPayload - The raw string input, typically
 *                                     containing multiple lines, where each
 *                                     line represents a numerical range
 *                                     (e.g., "10 20").
 * @returns {void} - This function prints the computed total span to the
 *                   standard output and does not return a value.
 */
function calculateTotalIntervalSpan(rawInputTextPayload) {
    // Define constants for consistent and readable parsing operations.
    const LINE_DELIMITER = '\n'; // Used to separate input into individual lines.
    const VALUE_DELIMITER = ' '; // Used to separate start and end values on a line.
    const PARSE_BASE = 10;       // Specifies decimal radix for integer parsing.
    const FALLBACK_NUMERIC = 0;  // Default value for numbers if parsing fails.

    // Initialize a variable to store the cumulative sum of all interval lengths.
    let cumulativeCoverage = 0;

    // Pre-process the raw input:
    // 1. Split the entire payload into an array of individual string lines.
    // 2. Filter out any lines that are empty or consist solely of whitespace.
    //    This prevents errors from malformed or trailing empty lines.
    const formattedInputLines = rawInputTextPayload
                                .split(LINE_DELIMITER)
                                .filter(currentSegment => currentSegment.trim().length > 0);

    // Iterate over each valid line to extract, parse, and process the numerical ranges.
    for (const dataSegment of formattedInputLines) {
        // Split the current line string into its constituent number tokens (as strings).
        const stringNumericTokens = dataSegment.split(VALUE_DELIMITER);

        // Implement a basic guard clause:
        // An interval requires at least two numerical values (start and end).
        if (stringNumericTokens.length >= 2) {
            // Parse the string tokens into integers.
            // Use parseInt with a specified radix and provide a fallback for non-numeric values.
            const rangeStartValue = parseInt(stringNumericTokens[0], PARSE_BASE) || FALLBACK_NUMERIC;
            const rangeEndValue = parseInt(stringNumericTokens[1], PARSE_BASE) || FALLBACK_NUMERIC;

            // Further validation: Ensure the start value does not exceed the end value.
            // If it does, it's considered an invalid or empty range in this context.
            if (rangeStartValue <= rangeEndValue) {
                // Calculate the length of the current valid interval.
                // The '+ 1' ensures the inclusive nature of the range (e.g., [1, 1] has length 1).
                const currentRangeLength = rangeEndValue - rangeStartValue + 1;
                // Add this interval's length to the running total.
                cumulativeCoverage += currentRangeLength;
            } else {
                // For Type III, we can add optional logging for skipped cases.
                // console.warn(`Skipping an inverted or invalid range: [${rangeStartValue}, ${rangeEndValue}] from line: "${dataSegment}"`);
            }
        } else {
            // Optionally log lines that do not conform to the expected "start end" format.
            // console.warn(`Skipping malformed data line: "${dataSegment}" - insufficient numeric tokens.`);
        }
    }

    // Output the final calculated sum of interval lengths.
    // Using a template literal for clear and flexible output formatting.
    console.log(`Total calculated range coverage: ${cumulativeCoverage}`);
}

// Standard entry point for competitive programming environments.
// This block reads the entire content from standard input and passes it
// to the main processing function.
try {
    // Require the Node.js 'fs' module for file system operations.
    // Read the entire content of '/dev/stdin' (standard input) synchronously.
    // Specify 'utf8' encoding to correctly handle various character sets.
    const inputContentFromFile = require("fs").readFileSync("/dev/stdin", "utf8");

    // Execute the main logic with the data obtained from standard input.
    calculateTotalIntervalSpan(inputContentFromFile);
} catch (inputReadError) {
    // If any error occurs during the input reading or processing phase,
    // log the error message to standard error and exit with a non-zero status code.
    console.error("An operational error occurred during input acquisition or processing:", inputReadError.message);
    process.exit(1); // Indicate an abnormal termination.
}