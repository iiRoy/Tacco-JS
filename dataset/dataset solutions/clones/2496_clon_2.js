'use strict';

// This function processes the raw input string to calculate a specific value.
const processInput = (rawData) => {
    // First, split the entire input string by newline characters,
    // then for each resulting line, split it by spaces.
    const parsedLines = rawData.split('\n').map(lineSegment => lineSegment.split(' '));

    // Extract the numerical value N from the first element of the first parsed line.
    // It represents the total number of characters in the sequence.
    const numChars = parseInt(parsedLines[0][0], 10);

    // Extract the character sequence S from the first element of the second parsed line.
    const charSequence = parsedLines[1][0];

    // Initialize a variable to store the character encountered in the previous iteration.
    let lastChar = null;

    // Initialize a counter for the number of distinct character groups.
    let distinctCount = 0;

    // Iterate through the character sequence from the beginning to the end.
    for (let idx = 0; idx < numChars; idx++) {
        // If the current character is different from the character seen previously,
        // it means a new group of characters has started.
        if (lastChar !== charSequence[idx]) {
            distinctCount++; // Increment the counter for distinct groups.
        }
        // Update the 'lastChar' to the current character for the next iteration.
        lastChar = charSequence[idx];
    }

    // Print the final calculated count of distinct character groups to the console.
    console.log(distinctCount);
};

// Read the entire content from standard input synchronously,
// using UTF-8 encoding, and then pass it to the processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
