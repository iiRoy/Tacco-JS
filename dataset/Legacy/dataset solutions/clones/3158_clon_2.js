"use strict";

// This function processes a given input string to perform a specific transformation.
const processInput = (inputString) => {
    // The first line of the input string is considered the primary data sequence.
    let binarySequence = inputString.split("\n")[0];
    
    // We store the original character count of the sequence.
    let initialLength = binarySequence.length;

    // Repeatedly remove all occurrences of the "01" pattern from the sequence.
    // This loop continues as long as the "01" pattern is found.
    while (binarySequence.indexOf("01") !== -1) {
        // Replace all instances of "01" with an empty string.
        binarySequence = binarySequence.split("01").join("");
    }
    
    // Subsequently, repeatedly remove all occurrences of the "10" pattern from the sequence.
    // This loop continues as long as the "10" pattern is found.
    while (binarySequence.indexOf("10") !== -1) {
        // Replace all instances of "10" with an empty string.
        binarySequence = binarySequence.split("10").join("");
    }
    
    // Finally, output the difference between the initial length and the final length of the sequence.
    // This value represents the total number of characters that were removed.
    console.log(initialLength - binarySequence.length);
};

// The program starts by reading its input from standard input.
// It uses Node.js's 'fs' module to synchronously read the content of '/dev/stdin'.
// The input is expected to be UTF-8 encoded.
// The read content is then passed to the 'processInput' function for execution.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
