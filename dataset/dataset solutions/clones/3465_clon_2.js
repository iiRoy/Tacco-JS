'use strict'; // This directive ensures strict parsing and error handling for the entire script.

/*
 * This module defines a primary function responsible for interpreting
 * and manipulating textual input based on specific length criteria.
 * It serves as the core logic handler for incoming data streams.
 */
const processContent = (contentSource) => {
    // Decompose the raw content string into an array of distinct lines.
    // Each line is separated by a newline character.
    const textSegments = contentSource.split('\n');

    // Isolate the initial line from the parsed segments for primary evaluation.
    const principalString = textSegments[0];

    // Evaluate the character count of the principal string.
    // If the length is exactly two characters, proceed with direct output.
    if (principalString.length === 2) {
        // Display the principal string without any modifications.
        console.log(principalString);
    } else {
        // If the length is not two, perform a sequence of transformations:
        // 1. Break the string into an array of individual characters.
        // 2. Invert the order of characters within this array.
        // 3. Reconstruct a new string from the reversed characters.
        // 4. Output this newly formed reversed string.
        console.log(principalString.split('').reverse().join(''));
    }
};

// Begin the execution flow by retrieving data from the standard input stream.
// The Node.js 'fs' (file system) module is utilized to read the entire file
// synchronously, with 'utf8' specified as the character encoding.
processContent(require('fs').readFileSync('/dev/stdin', 'utf8'));