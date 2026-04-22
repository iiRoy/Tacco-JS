'use strict';

/*
 * This function orchestrates the primary data processing workflow.
 * It takes raw textual input and computes a specific range based on character positions.
 */
const processInput = (rawData) => {
    // Extract the very first line from the multi-line input string.
    const firstLineText = rawData.split('\n')[0];

    // Convert the extracted line into an array of individual characters.
    const charSequence = firstLineText.split('');

    // Create a reversed copy of the character sequence.
    // This helps in efficiently locating the last occurrence of a specific character.
    const reversedSequence = charSequence.slice().reverse();

    // Determine the total number of characters in the original sequence.
    const sequenceLength = charSequence.length;

    // Locate the first occurrence of the character 'A' within the character sequence.
    const firstMarkerPosition = charSequence.indexOf('A');

    // Calculate the position of the last occurrence of 'Z' in the original sequence.
    // This is achieved by finding 'Z' in the reversed sequence and
    // adjusting its index relative to the original sequence's length.
    const lastMarkerPosition = sequenceLength - reversedSequence.indexOf('Z');

    // Output the computed difference between the last marker's position
    // and the first marker's position to the standard output.
    console.log(lastMarkerPosition - firstMarkerPosition);
};


// This is the primary execution point of the script.
// It reads content from the standard input stream (e.g., from a pipe or file redirection)
// using Node.js's file system module, decoding it as UTF-8,
// and then passes this content to the main processing function.
processInput( require('fs').readFileSync( '/dev/stdin', 'utf-8' ) );