"use strict"; // Enforce strict mode for cleaner code execution

/**
 * Executes the primary logic of the program.
 * It processes raw input to determine if a specific character sequence exists.
 * @param {string} rawInputContent - The complete input string, potentially multi-line.
 */
const handleProgramExecution = (rawInputContent) => {
    // Sanitize and parse the input data
    const trimmedInput = rawInputContent.trim();
    
    // Guard clause for empty input
    if (trimmedInput.length === 0) {
        console.log("No"); // No content to process, so no sequence can be found.
        return;
    }

    const inputLines = trimmedInput.split('\n');
    
    // We are interested only in the first line for sequence checking
    const targetLine = inputLines[0];

    // Convert the target line into an array of individual characters for easier iteration
    const inputCharacterStream = targetLine.split('');

    // Introduce a flag to track whether the target sequence has been identified
    let sequenceFoundIndicator = false;

    // A pattern "AC" requires at least two characters.
    // We can add a guard clause here to optimize for short strings.
    if (inputCharacterStream.length < 2) {
        console.log("No");
        return;
    }

    // Iterate through the character stream, starting from the second element
    // This allows us to always check the current element against the one immediately preceding it.
    for (let currentPositionIndex = 1; currentPositionIndex < inputCharacterStream.length; currentPositionIndex++) {
        const precedingCharacter = inputCharacterStream[currentPositionIndex - 1];
        const currentCharacter = inputCharacterStream[currentPositionIndex];

        // Check if the current pair of characters forms the desired "AC" sequence
        if (precedingCharacter === 'A' && currentCharacter === 'C') {
            sequenceFoundIndicator = true; // Mark the flag as true
            break; // Exit the loop early as the pattern has been successfully located
        }
    }

    // Based on the flag, output the final determination
    if (sequenceFoundIndicator) {
        console.log("Yes");
    } else {
        console.log("No");
    }
};

// Initiate the program by reading input from standard input
// This assumes the environment provides input via /dev/stdin (common in competitive programming)
const fileSystemModule = require('fs');
const standardInputData = fileSystemModule.readFileSync('/dev/stdin', 'utf8');

// Execute the main program handler with the received input
handleProgramExecution(standardInputData);