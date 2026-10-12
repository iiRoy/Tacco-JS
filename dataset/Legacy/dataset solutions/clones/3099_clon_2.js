"use strict";

/**
 * Processes the input string to find the longest consecutive run of 'A', 'C', 'T', or 'G' characters.
 * @param {string} sourceText - The raw input string from standard input.
 */
function ProcessInputData(sourceText) {
    // Extract the first line, remove leading/trailing whitespace, and append a non-matching character
    // to ensure the final sequence segment is processed correctly.
    let nucleotideSequence = sourceText.split("\n")[0].trim().split(/\s/)[0] + 'X';

    // Initialize variables for tracking the maximum length found and the current segment's length.
    let maximumLength = 0;
    let currentRunLength = 0;

    // Iterate through each character of the prepared sequence string.
    for (let charPosition = 0; charPosition < nucleotideSequence.length; charPosition++) {
        // Evaluate the character at the current position.
        switch (nucleotideSequence.charAt(charPosition)) {
            case 'A': // Adenine
            case 'C': // Cytosine
            case 'T': // Thymine
            case 'G': // Guanine
                // If it's a valid nucleotide, extend the current run.
                currentRunLength += 1;
                break;
            default:
                // If it's not a valid nucleotide, the current run is broken.
                // Check if the completed run is longer than the previously recorded maximum.
                if (currentRunLength > maximumLength) {
                    maximumLength = currentRunLength;
                }
                // Reset the current run length for the next potential sequence.
                currentRunLength = 0;
        }
    }

    // Output the final calculated maximum length to the console.
    console.log(maximumLength);
}

// Read the entire content from standard input synchronously and pass it to the processing function.
ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
