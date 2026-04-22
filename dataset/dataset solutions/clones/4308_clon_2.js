'use strict'; // Enforce strict parsing and error handling for cleaner code execution.

/**
 * Primary function to handle and process incoming data.
 * It expects a string containing multiple lines of space-separated values.
 *
 * @param {string} rawData - The raw input string to be processed.
 * @returns {void} This function prints its result directly to the console.
 */
const processInputData = ( rawData ) => {

    // First, split the entire raw input into individual lines.
    // Then, for each line, split it further by spaces to get an array of tokens.
    const parsedLines = rawData
        .split('\n')
        .map(
            currentLine => currentLine.split(' ')
        );

    // Extract the very first element from the first parsed line.
    // This is assumed to be the string of interest for pattern matching.
    const targetString = parsedLines[0][0]
    ;

    // Attempt to match the target string against a regular expression.
    // The regex looks for any characters at the beginning, followed by "FESTIVAL" at the end.
    // It captures the leading characters.
    const matchResult = targetString.match( /^(.+)FESTIVAL$/ )
    ;

    // Print the captured group (the part before "FESTIVAL").
    // The problem statement implies a valid match will always occur,
    // so `matchResult[1]` is expected to be accessible.
    console.log( matchResult[1] );
}; // End of processInputData function definition


// Execute the main processing function.
// It reads content from standard input synchronously as a UTF-8 string.
processInputData(
    require('fs')
        .readFileSync( '/dev/stdin', 'utf8' )
);