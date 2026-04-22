"use strict"; // Enforce strict parsing and error handling for better code quality

/*
 * This module is designed to analyze a specific string pattern
 * provided as input from standard input.
 */

/**
 * Determines if a given string sequence matches a particular pattern.
 * The pattern involves comparisons of characters at specific indices.
 * @param {Array<string>} dataLines - An array of strings, where the first element is the target sequence.
 * @returns {void} This function prints "Yes" or "No" to the console.
 */
const checkPattern = ( dataLines ) => {

    // Extract the primary string for analysis from the input array.
    let targetString = dataLines[0];
    let foundPattern; // This flag will indicate if any of the desired patterns are found.

    // First pattern check: characters at 0 and 1 are identical,
    // characters at 2 and 3 are identical, and 0 is different from 2.
    if ( targetString[0] === targetString[1] &&
         targetString[2] === targetString[3] &&
         targetString[0] !== targetString[2] )
    {
        foundPattern = true; // Pattern discovered.
    }

    // Second pattern check: characters at 0 and 2 are identical,
    // characters at 1 and 3 are identical, and 0 is different from 1.
    if ( targetString[0] === targetString[2] &&
         targetString[1] === targetString[3] &&
         targetString[0] !== targetString[1] )
    {
        foundPattern = true; // Another pattern variant found.
    }

    // Third pattern check: characters at 0 and 3 are identical,
    // characters at 1 and 2 are identical, and 0 is different from 1.
    if ( targetString[0] === targetString[3] &&
         targetString[1] === targetString[2] &&
         targetString[0] !== targetString[1] )
    {
        foundPattern = true; // Yet another pattern variant found.
    }

    // Output the result based on whether any pattern was matched.
    console.log( foundPattern === true ? 'Yes' : 'No' );

}; // End of checkPattern function definition

// Execute the main logic by reading input from standard input.
// The input is read as UTF-8, split by newline, and passed to the pattern checker.
checkPattern(require("fs").readFileSync("/dev/stdin", "utf8").split('\n'));