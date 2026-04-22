// This module is designed to process a textual input stream,
// specifically counting occurrences of a particular binary digit.

"use strict"; // Enforce stricter parsing and error handling for cleaner code.

/**
 * Analyzes an input string to determine the frequency of a predefined character.
 * It first cleans the input by removing leading/trailing whitespace,
 * then iterates through the remaining characters to count matches.
 *
 * @param {string} incomingText The raw string data to be processed.
 */
function examineBinarySequence(incomingText) {
    // Define the character we are interested in counting.
    const targetDigit = '1';

    // Step 1: Normalize the input string by removing any extraneous whitespace
    // from the beginning and end. This ensures only relevant data is processed.
    const sanitizedString = incomingText.trim();

    // Step 2: Convert the cleaned string into an array of individual characters.
    // This makes iteration and comparison easier.
    const characterCollection = sanitizedString.split('');

    // Step 3: Initialize a counter for the target digit.
    let occurrenceCounter = 0;

    // Step 4: Iterate through each character in the collection.
    // If a character matches our target digit, increment the counter.
    for (const currentCharacter of characterCollection) {
        if (currentCharacter === targetDigit) {
            occurrenceCounter++;
        }
    }

    // Step 5: Display the final count to the console, providing context.
    console.log(`Analysis complete: Found ${occurrenceCounter} occurrences of the digit '${targetDigit}'.`);
}

// --- Main execution block ---
// This section handles reading the input data from the system's standard input
// and then passes it to our primary analysis function.

// Define the standard input file path.
const standardInputSource = '/dev/stdin';

let systemProvidedData = ''; // Initialize with an empty string for safety.

try {
    // Attempt to read the entire content of the standard input as a UTF-8 string.
    // Using 'node:fs' for explicit module namespace.
    systemProvidedData = require('node:fs').readFileSync(standardInputSource, 'utf8');
} catch (dataReadError) {
    // If an error occurs during file reading (e.g., file not found, permissions),
    // log the error and proceed with potentially empty data or handle as needed.
    console.error(`Error encountered while attempting to read from ${standardInputSource}: ${dataReadError.message}`);
    // In this scenario, systemProvidedData remains an empty string,
    // which will result in a count of 0, which is a graceful degradation.
} finally {
    // Regardless of success or failure in reading, proceed to process the data.
    // This ensures the main function is always called.
    examineBinarySequence(systemProvidedData);
}