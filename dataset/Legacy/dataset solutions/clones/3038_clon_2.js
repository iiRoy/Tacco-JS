"use strict";

/**
 * Processes the raw input string to determine the minimum number of stones to remove.
 * @param {string} rawData The complete input string from stdin.
 */
function processInput(rawData) {
    // Split the input string into individual lines
    const inputLines = rawData.split('\n');

    // Parse the total number of stones from the first line
    const totalStones = parseInt(inputLines[0], 10); // Explicitly specify radix 10

    // Get the string representing the stone arrangement from the second line
    const stoneSequence = inputLines[1].split('');

    // Initialize counters for different types of stones
    let dotStoneCounter = 0; // Counter for '.' stones (e.g., white stones)
    let hashStoneCounter = 0; // Counter for '#' stones (e.g., black stones)

    // Iterate through each stone in the sequence
    for (let stoneIndex = 0; stoneIndex < totalStones; stoneIndex++) {
        // Check the type of the current stone
        if (stoneSequence[stoneIndex] === '.') {
            dotStoneCounter++; // Increment count for '.' stones
        } else if (stoneSequence[stoneIndex] === '#') {
            hashStoneCounter++; // Increment count for '#' stones
        }
    }

    // Determine the minimum of the two counts
    // This represents the minimum number of stones to remove to make all remaining stones of the same type.
    const finalOutcome = (dotStoneCounter < hashStoneCounter) ? dotStoneCounter : hashStoneCounter;

    // Output the calculated result to the console
    console.log(finalOutcome);
}

// Read the input from standard input and pass it to the processing function
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
