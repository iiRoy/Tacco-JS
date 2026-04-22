const fileSystemHandler = require('fs'); // Import the Node.js file system module for input operations.

// Define symbolic constants for the patterns we intend to search within the text.
const TARGET_PATTERN_ONE = "JOI";
const TARGET_PATTERN_TWO = "IOI";
// Both target patterns have the same fixed length.
const PATTERN_COMMON_LENGTH = 3;

/**
 * Processes a given string to identify and count occurrences of two specific patterns.
 * This function handles input validation, normalization, and the core pattern matching logic.
 *
 * @param {string} sourceString The raw text string to be analyzed.
 * @returns {object} An object containing the counts for each pattern, e.g., { firstPattern: 5, secondPattern: 3 }.
 */
function performPatternAnalysis(sourceString) {
    // Defensive programming: Validate the input to ensure it's a non-empty string.
    if (typeof sourceString !== 'string' || sourceString.length === 0) {
        console.warn("Warning: Received invalid or empty source string for analysis. Returning zero counts.");
        return { firstPattern: 0, secondPattern: 0 };
    }

    // Normalize the input string by removing leading and trailing whitespace.
    // This ensures consistent processing regardless of how the input file ends.
    const cleanedString = sourceString.trim();

    // Early exit if the cleaned string is shorter than the pattern length,
    // as no patterns can possibly be found.
    if (cleanedString.length < PATTERN_COMMON_LENGTH) {
        return { firstPattern: 0, secondPattern: 0 };
    }

    // Initialize counters for the two distinct patterns.
    let countForPatternOne = 0;
    let countForPatternTwo = 0;

    // Iterate through the string, checking every possible substring of PATTERN_COMMON_LENGTH.
    // The loop condition ensures we don't try to access characters beyond the string's bounds.
    // It runs until `currentOffset` allows for a full `PATTERN_COMMON_LENGTH` substring.
    for (let currentOffset = 0; currentOffset <= cleanedString.length - PATTERN_COMMON_LENGTH; ++currentOffset) {
        // Extract the current segment of the string for comparison.
        // Using `slice` is a common and idiomatic way to get substrings in JavaScript.
        const currentSegment = cleanedString.slice(currentOffset, currentOffset + PATTERN_COMMON_LENGTH);

        // Compare the extracted segment with the first target pattern.
        if (currentSegment === TARGET_PATTERN_ONE) {
            countForPatternOne++; // Increment the counter for the first pattern.
        }
        // If the first pattern wasn't matched, check against the second target pattern.
        // Using `else if` is slightly more efficient as it avoids an unnecessary check
        // if the first condition was already met (assuming patterns are mutually exclusive at a given position).
        else if (currentSegment === TARGET_PATTERN_TWO) {
            countForPatternTwo++; // Increment the counter for the second pattern.
        }
    }

    // Return the final counts encapsulated within an object.
    return {
        firstPattern: countForPatternOne,
        secondPattern: countForPatternTwo
    };
}

// --- Main execution flow starts here ---
try {
    // Attempt to read the entire content of the standard input file synchronously.
    // 'utf8' encoding is specified to correctly interpret the file content as text.
    const fileContentBuffer = fileSystemHandler.readFileSync('/dev/stdin', 'utf8');

    // Call the analysis function with the content read from the file.
    const analysisResults = performPatternAnalysis(fileContentBuffer.toString());

    // Output the count for the first pattern to the console, followed by a newline.
    console.log(analysisResults.firstPattern);
    // Output the count for the second pattern to the console, followed by a newline.
    console.log(analysisResults.secondPattern);

} catch (ioError) {
    // Catch and handle any errors that might occur during file reading (e.g., file not found, permission issues).
    console.error("An error occurred during input processing:", ioError.message);
    // As per typical competitive programming output, print 0 for counts if an error prevents processing.
    console.log(0);
    console.log(0);
}