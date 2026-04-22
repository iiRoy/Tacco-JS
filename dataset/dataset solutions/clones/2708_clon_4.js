"use strict";

let charSequence;
let modValue;
let memoTable;

// Recursive function to compute combinations
// pos: current character index being processed (from left to right)
// currentRemainder: the remainder of the number formed by characters processed so far (S[0]...S[pos-1])
function computeWays(pos, currentRemainder) {
    // Base case: All characters have been processed
    if (pos === charSequence.length) {
        // If the final number has a remainder of 5, this is one valid combination
        return currentRemainder === 5 ? 1 : 0;
    }

    // Check if this subproblem has already been solved
    if (memoTable[pos][currentRemainder] !== -1) {
        return memoTable[pos][currentRemainder];
    }

    let totalValidWays = 0;
    const currentCharacter = charSequence[pos];

    // Iterate through all possible digits (0-9) for the current position
    for (let digitVal = 0; digitVal <= 9; digitVal++) {
        // If the current character is '?' or matches the digit we are trying
        if (currentCharacter === '?' || parseInt(currentCharacter) === digitVal) {
            // Calculate the new remainder after appending digitVal
            const nextRemainder = (currentRemainder * 10 + digitVal) % 13;
            
            // Recursively call for the next position and accumulate ways
            totalValidWays = (totalValidWays + computeWays(pos + 1, nextRemainder)) % modValue;
        }
    }

    // Store the computed result in the memoization table before returning
    memoTable[pos][currentRemainder] = totalValidWays;
    return totalValidWays;
}

// Main function to orchestrate the process
function processData(inputStr) {
    // Extract the number pattern string from the input
    const trimmedInput = inputStr.toString().trim();
    charSequence = trimmedInput.split('');

    modValue = 1000000007;

    // Initialize the memoization table with -1 to indicate uncomputed states
    // memoTable[position][remainder]
    memoTable = Array(charSequence.length + 1).fill(null).map(() => Array(13).fill(-1));

    // Start the recursive calculation from the first position (index 0) with an initial remainder of 0
    const finalCount = computeWays(0, 0);

    console.log(finalCount);
}

// Execute the main processing function with input from stdin
processData(require('fs').readFileSync('/dev/stdin'));