'use strict'; /* This directive enforces stricter parsing and error handling in the code. */

/**
 * Processes the provided raw input string to determine and log a specific value.
 * @param {string} rawData - The raw input string, expected to contain numbers separated by spaces and newlines.
 */
function ProcessInput(rawData) {
    // Split the raw input by newline, take the first line, then split it by space.
    const parsedValues = rawData.split('\n')[0].split(' ');

    // Check if the first two parsed values are identical.
    if (parsedValues[0] === parsedValues[1]) {
        // If they are the same, output the third value.
        console.log(parsedValues[2]);
    } else {
        // Otherwise, compare the first and third values.
        // If the first and third are equal, output the second value; otherwise, output the first.
        console.log(parsedValues[0] === parsedValues[2] ? parsedValues[1] : parsedValues[0]);
    }
}

// Read the input from standard input asynchronously and then pass it to the processing function.
ProcessInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
