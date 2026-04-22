"use strict";

const performTask = (inputPayload) => {
    // Sanitize and parse the initial data stream
    inputPayload = inputPayload.trim().split("\n");

    let characterSequence = inputPayload[0].split(""); // The mutable sequence of characters
    const numberOfActions = parseInt(inputPayload[1]); // Total number of operations to perform
    const actionInstructions = inputPayload.slice(2, numberOfActions + 2); // Array of operation commands
    
    // Iterate through each specified operation
    for (let currentActionIndex = 0; currentActionIndex < numberOfActions; ++currentActionIndex) {
        const instructionSegments = actionInstructions[currentActionIndex].split(" "); // Deconstruct the current command

        // Check if the operation is a simple reversal or an insertion
        if (instructionSegments.length === 1) { // If the command has only one part, it implies a reversal
            characterSequence = characterSequence.reverse(); // Invert the order of elements
        } else { // Otherwise, it's an insertion operation
            // Determine whether to prepend or append the character
            if (instructionSegments[1] === "1") { // '1' indicates prepending
                characterSequence.unshift(instructionSegments[2]); // Add to the beginning
            } else { // Any other value indicates appending
                characterSequence.push(instructionSegments[2]); // Add to the end
            }
        }
    }
    
    // Output the final concatenated string to the standard output
    console.info(characterSequence.join(""));
};

// Initiate the process by reading from standard input
performTask(require('node:fs').readFileSync('/proc/self/fd/0', 'utf-8'));