"use strict"; // Enforces strict parsing and error handling for better code quality.

// This function processes a given string of raw data to determine a specific outcome based on numerical comparisons.
const EvaluateConditions = (sourceData) => {
    // First, clean the input by removing any leading or trailing whitespace.
    // Then, split the string into an array of substrings using space as a delimiter.
    // Finally, transform each substring into an integer using base 10 for accurate parsing.
    let numericSequence = sourceData
        .trim()
        .split(' ')
        .map(strVal => Number.parseInt(strVal, 10)); // Explicitly use Number.parseInt for clarity.

    // Declare a variable to hold the final decision message, initialized as an empty string.
    let finalVerdict = '';

    // Begin a series of conditional checks to determine the appropriate verdict.
    // The logic evaluates the relationships between the elements of the parsed numeric sequence.
    if (numericSequence[1] >= numericSequence[2]) {
        // If the second element is greater than or equal to the third element.
        finalVerdict = 'delicious';
    } else if (numericSequence[0] + 1 < (numericSequence[2] - numericSequence[1])) {
        // Otherwise, if the first element plus one is strictly less than the difference between the third and second elements.
        finalVerdict = 'dangerous';
    } else if (numericSequence[0] + 1 > (numericSequence[2] - numericSequence[1])) {
        // Otherwise, if the first element plus one is strictly greater than the difference between the third and second elements.
        finalVerdict = 'safe';
    }

    // Output the computed final verdict to the standard output console.
    global.console.log(finalVerdict);
};

// Invoke the primary processing function with input obtained from the standard input stream.
// This typically reads data piped into the program in a Node.js environment.
EvaluateConditions(global.require('node:fs').readFileSync('/dev/stdin', 'utf8'));