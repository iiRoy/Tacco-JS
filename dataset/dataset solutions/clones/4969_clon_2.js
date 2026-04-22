'use strict'; // Ensure strict mode for code execution

/**
 * Executes a character sequence traversal based on initial character markers.
 * @param {string} sourceTextContent - The raw input string containing multiple lines.
 */
const executeSequenceTraversal = (sourceTextContent) => {
    // Process the incoming text: split into lines, then each line into individual characters.
    let parsedLines = sourceTextContent.split('\n').map(lineSegment => lineSegment.split(''));

    // Assign the first three processed lines to distinct character chains.
    const alphaChain = parsedLines[0];
    const betaChain = parsedLines[1];
    const gammaChain = parsedLines[2];

    // Initialize the current character pointer and the active list of characters.
    let currentPointerChar = 'a';
    let activeCharList = [];

    // Begin an infinite loop to traverse the character chains.
    // The loop will terminate when an active chain becomes empty.
    for (;;) {
        // Determine which character chain is currently active based on the pointer.
        if (currentPointerChar === 'a') {
            activeCharList = alphaChain;
        } else if (currentPointerChar === 'b') {
            activeCharList = betaChain;
        } else { // If the pointer is not 'a' or 'b', it must be 'c'.
            activeCharList = gammaChain;
        }

        // Check if the current active list is depleted.
        if (activeCharList.length === 0) {
            // If empty, print the pointer character in uppercase and exit the loop.
            console.log(currentPointerChar.toUpperCase());
            break;
        }

        // Remove the first character from the active list and use it as the next pointer.
        currentPointerChar = activeCharList.shift();
    }
};

// Read input from standard input and pass it to the main processing function.
executeSequenceTraversal(require('fs').readFileSync('/dev/stdin', 'utf-8'));