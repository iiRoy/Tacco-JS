'use strict';

/**
 * Processes a raw string input to identify and count occurrences of a specific character
 * within its initial line.
 *
 * @param {string} sourceText - The entire text content provided as input.
 * @returns {number} The total count of the target character found in the first line.
 */
function AnalyzeTextLines(sourceText) {
    // Perform initial validation on the input data.
    // If the input is not a string, is null, or is empty,
    // we cannot proceed with text analysis.
    if (typeof sourceText !== 'string' || sourceText === null || sourceText.length === 0) {
        console.error("Input for analysis is either invalid, null, or empty. Returning zero occurrences.");
        return 0; // Return a default count of zero for invalid input.
    }

    // Determine the content of the first logical line from the input.
    // This involves finding the first newline character, if one exists.
    const firstNewlinePosition = sourceText.indexOf('\n');
    let primaryContentLine;

    if (firstNewlinePosition !== -1) {
        // If a newline character is found, extract the substring up to that point.
        primaryContentLine = sourceText.substring(0, firstNewlinePosition);
    } else {
        // If no newline is present, the entire sourceText is considered the single line.
        primaryContentLine = sourceText;
    }

    // Define the specific character whose occurrences we intend to count.
    const charToLocate = '1';
    // Initialize a counter to keep track of the found occurrences.
    let characterOccurrenceTally = 0;

    // Iterate through each character of the extracted primary content line.
    for (let charIndex = 0; charIndex < primaryContentLine.length; charIndex++) {
        // Compare the current character with our target character.
        if (primaryContentLine[charIndex] === charToLocate) {
            // If they match, increment our tally.
            characterOccurrenceTally++;
        }
    }

    // Output the computed tally to the standard output.
    console.log(characterOccurrenceTally);

    // The function also returns the count, allowing for potential further programmatic use.
    return characterOccurrenceTally;
}

// Entry point for the application: responsible for acquiring input and initiating processing.
// This block utilizes Node.js's file system module to read from standard input.
try {
    // Dynamically load the 'fs' (file system) module.
    const fsModule = require('fs');
    // Specify the standard input file path, common in competitive programming environments.
    const stdinPath = '/dev/stdin';
    // Define the character encoding for reading the file content.
    const textEncoding = 'utf8';

    // Read the entire content of the standard input file synchronously.
    const rawInputBuffer = fsModule.readFileSync(stdinPath, textEncoding);

    // Call the main analysis function with the content read from standard input.
    AnalyzeTextLines(rawInputBuffer);
} catch (inputReadingError) {
    // Catch and report any errors that occur during the file reading process.
    console.error(`An error occurred while attempting to read from ${'/dev/stdin'}:`, inputReadingError.message);
    // As a fallback or error handling measure, call the analysis function with an empty string
    // to ensure predictable behavior (e.g., logging 0 and returning 0).
    AnalyzeTextLines("");
}