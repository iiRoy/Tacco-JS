'use strict'; // Enforce strict parsing and error handling for the entire script.

/**
 * This function serves as the primary entry point for processing input data.
 * It analyzes the provided string to detect a specific pattern.
 * @param {string} rawData - The complete input string, typically read from standard input.
 */
const processInput = (rawData) => {
    // First, split the raw input by newline characters to get individual lines.
    // Then, for each line, split it by spaces to get an array of arguments.
    // This creates a 2D array representing the parsed input structure.
    const parsedLines = rawData.split('\n').map(lineSegment => lineSegment.split(' '));

    // Extract the very first string from the parsed input.
    // This is assumed to be the primary string we need to analyze.
    const targetString = parsedLines[0][0];

    // Obtain the total character count of the extracted string.
    const stringLength = targetString.length;

    // Initialize a flag to track whether the desired pattern has been located.
    // It is set to 'false' by default, assuming the pattern is not present until proven otherwise.
    let foundPattern = false;

    // Iterate through the 'targetString' from the beginning up to the second-to-last character.
    // This ensures that 'slice(idx, idx + 2)' always attempts to extract a two-character substring.
    for (let idx = 0; idx < stringLength - 1; idx++) {
        // Check if the two-character substring starting at the current index 'idx'
        // is exactly equal to the string "AC".
        if (targetString.slice(idx, idx + 2) === 'AC') {
            // If the pattern "AC" is found, update the flag to 'true'.
            foundPattern = true;
            // No need to continue searching once the pattern is found,
            // but for Type II clone, we maintain the original loop structure.
        }
    }

    // Based on the 'foundPattern' flag, print "Yes" to standard output if the pattern was found,
    // otherwise print "No". This is the final observable behavior of the script.
    console.log(foundPattern ? 'Yes' : 'No');
};

// Read the entire content of standard input synchronously as a UTF-8 encoded string.
// Then, pass this content to the 'processInput' function for execution.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
