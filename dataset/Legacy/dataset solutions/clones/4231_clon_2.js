'use strict';

// This section contains a commented-out helper function,
// which is not used in the main logic of this script.
/*
const convertCharToNum = (charStr) => {
    // A simple mapping for hexadecimal-like characters to decimal values.
    // This function is currently unused in the active code path.
    switch (charStr) {
        case 'A': return 10;
        case 'B': return 11;
        case 'C': return 12;
        case 'D': return 13;
        case 'E': return 14;
        case 'F': return 15;
        default: return parseInt(charStr, 10); // Fallback for numeric strings
    }
};
*/

/**
 * Processes the given input string to compare two values.
 * It expects the input to be a string where the first line
 * contains two space-separated values.
 *
 * @param {string} rawData The raw input string, typically from a file.
 */
const processInputData = (rawData) => {
    // Split the input by newline characters to get lines, then take the first line.
    // Further split the first line by space to get individual string values.
    const firstLineParts = rawData.split('\n')[0].split(' ');

    // Extract the first value from the parsed parts.
    let valueA = firstLineParts[0];

    // Extract the second value from the parsed parts.
    let valueB = firstLineParts[1];

    // Perform a string comparison between the two extracted values.
    // The comparison determines which value is lexicographically greater or if they are equal.
    if (valueA === valueB) {
        // If both values are strictly equal, print '='.
        console.log('=');
    } else if (valueA > valueB) {
        // If the first value is lexicographically greater, print '>'.
        console.log('>');
    } else {
        // Otherwise (if the first value is lexicographically smaller), print '<'.
        console.log('<');
    }
};

// Execute the main processing function by reading input from standard input.
// The 'utf-8' encoding is specified for reading the file content.
processInputData(require('fs').readFileSync('/dev/stdin', 'utf-8'));
