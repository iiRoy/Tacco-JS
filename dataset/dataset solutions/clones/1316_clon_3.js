'use strict';

// This module handles file system operations for data acquisition.
const fileUtility = require('fs');

/**
 * Retrieves the raw text data from the standard input file.
 * Includes basic error handling for file access.
 * @returns {string} The content of /dev/stdin as a string, or an empty string on error.
 */
function fetchSourceMaterial() {
    const standardInputPath = '/dev/stdin';
    let acquiredText = '';
    try {
        acquiredText = fileUtility.readFileSync(standardInputPath, 'utf8');
    } catch (fileAccessError) {
        // In a production scenario, this might log to a dedicated error stream or throw.
        // For this exercise, we'll silently proceed with an empty string or basic message.
        console.error(`Failed to read input from ${standardInputPath}: ${fileAccessError.message}`);
        // A robust system might return an error object or re-throw.
        // For now, we'll ensure it returns a string.
        return "ERROR: Could not read source material.";
    }
    return acquiredText;
}

/**
 * Analyzes a given text string to count the frequency of alphabetic characters.
 * Non-alphabetic characters are ignored. Case is normalized to lowercase.
 *
 * @param {string} incomingText The text string to analyze.
 * @returns {string} A formatted report of character frequencies.
 */
const processCharacterStatistics = (incomingText) => {

    // Early exit for invalid or empty input to prevent unnecessary processing.
    if (typeof incomingText !== 'string' || incomingText.length === 0) {
        return "--- Character Analysis Report ---\nNo valid text provided for analysis.\n--- End of Report ---";
    }

    // Convert the input string into an array of individual characters.
    // This is an alternative to String.prototype.split('') and provides
    // better handling for Unicode characters (though not strictly necessary here).
    const characterArray = Array.from(incomingText);

    // Initialize an object to store the counts of each character.
    // We'll populate this dynamically rather than pre-initializing all 26 letters.
    const characterCounters = {};

    // Regular expression to identify alphabetic characters (A-Z, a-z).
    const alphabeticPattern = /^[A-Za-z]$/;

    // Iterate over each character in the array.
    for (const currentGlyph of characterArray) {

        // Check if the current character is an alphabet letter.
        if (alphabeticPattern.test(currentGlyph)) {

            // Convert the character to lowercase to ensure case-insensitive counting.
            const normalizedGlyph = currentGlyph.toLowerCase();

            // Increment the counter for the normalized character.
            // If the character hasn't been encountered before, initialize its count to 1.
            // Otherwise, just add one to its existing count.
            characterCounters[normalizedGlyph] = (characterCounters[normalizedGlyph] || 0) + 1;

        }
        // Non-alphabetic characters are simply skipped.
    }

    // Prepare the final output string.
    const reportLines = [];
    reportLines.push("--- Character Frequency Analysis ---");

    // Retrieve the keys (characters) from our counter object and sort them alphabetically.
    const sortedCharacterKeys = Object.keys(characterCounters).sort();

    // Check if any alphabetic characters were found.
    if (sortedCharacterKeys.length === 0) {
        reportLines.push("No alphabetic characters were detected in the input.");
    } else {
        // Iterate through the sorted characters and format their counts.
        for (const charKey of sortedCharacterKeys) {
            const occurrenceCount = characterCounters[charKey];
            // Format each line as "Character: Count"
            reportLines.push(`${charKey.toUpperCase()}: ${occurrenceCount}`);
        }
    }

    reportLines.push("--- Analysis Complete ---");

    // Join all report lines into a single string, separated by newlines.
    return reportLines.join('\n');
};

// Main execution block: an immediately invoked function expression (IIFE).
// This structure encapsulates the primary workflow.
(function mainApplicationEntryPoint() {
    const rawInputContent = fetchSourceMaterial(); // Get the input data.
    const generatedReport = processCharacterStatistics(rawInputContent); // Process it.
    console.log(generatedReport); // Display the final result.
})();