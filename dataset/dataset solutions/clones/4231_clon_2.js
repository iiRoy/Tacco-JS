'use strict'; // Ensures strict parsing and error handling for the entire script.

// This commented-out section shows a potential helper function.
// It's designed to transform a single character (e.g., 'A' through 'F')
// into its corresponding numerical value (10 through 15),
// typically for hexadecimal conversions.
/*
const charToDecimal = (inputChar) => {
    if (inputChar === 'A') return 10;
    if (inputChar === 'B') return 11;
    if (inputChar === 'C') return 12;
    if (inputChar === 'D') return 13;
    if (inputChar === 'E') return 14;
    if (inputChar === 'F') return 15;
};
*/

/**
 * The primary execution routine that processes and compares two numerical tokens.
 *
 * @param {string} sourcePayload - The complete string data received for processing.
 */
const processAndCompare = (sourcePayload) => {

    // Extract the very first line from the entire payload.
    // The `split` method divides the string by newline characters,
    // and `[0]` selects the initial segment.
    const firstLineSegment = sourcePayload.split('\n')[0];

    // From the `firstLineSegment`, isolate the first value.
    // `split(' ')` divides the line by space characters,
    // and `[0]` retrieves the leading token.
    let firstValue = firstLineSegment.split(' ')[0];

    // Similarly, obtain the second value from the `firstLineSegment`.
    // `[1]` targets the subsequent token after the space.
    let secondValue = firstLineSegment.split(' ')[1];

    // Conduct a comparison between the two extracted values.
    if (firstValue === secondValue) {
        // If both values are strictly identical, output an equality symbol.
        console.log('=');
    } else if (firstValue > secondValue) {
        // If the first value is numerically larger than the second, output a 'greater than' symbol.
        console.log('>');
    } else {
        // In all other cases (i.e., firstValue is less than secondValue), output a 'less than' symbol.
        console.log('<');
    }

}; // Concludes the definition of the 'processAndCompare' function.


// Invoke the main processing function.
// This involves using the Node.js 'fs' (file system) module
// to synchronously read the content of the standard input stream ('/dev/stdin').
// The data is expected to be encoded in 'utf8' format.
processAndCompare(require('fs').readFileSync('/dev/stdin', 'utf8'));