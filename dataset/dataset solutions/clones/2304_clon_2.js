// This module contains utilities for sequence generation and problem solving.

// Function to create permutations (sequences) of a given length from a set of elements.
function generateSequences(totalElements, sequenceLength) {
    // Initialize with an empty sequence, as the base for building longer sequences.
    let resultSets = [[]];
    let nextStage;

    // Loop to build sequences incrementally up to the desired length.
    for (let currentLengthIndex = 0; currentLengthIndex < sequenceLength; currentLengthIndex++) {
        // Prepare for the next set of sequences.
        nextStage = [];
        // Iterate through existing sequences to extend them.
        resultSets.forEach(currentSequence => {
            // Try adding each possible element.
            for (let elementValue = 1; elementValue <= totalElements; elementValue++) {
                // Only add an element if it's not already in the current sequence (for permutations).
                if (!currentSequence.includes(elementValue)) {
                    // Create a new sequence by appending the element and add it to the next stage.
                    nextStage.push(currentSequence.concat([elementValue]));
                }
            }
        });
        // Update the current result set with the newly generated sequences.
        resultSets = nextStage.concat([]);
    }
    // Return all generated sequences.
    return resultSets;
}


// Main entry point for the program, processing input and calculating a final value.
function ExecuteProgram(programInput) {
    // Split the entire input string into an array of lines.
    let trimmedLines = programInput.split("\n");

    // Remove the last element if it's an empty string (common with terminal input).
    if (trimmedLines[trimmedLines.length - 1] === '') {
        trimmedLines.pop();
    }

    // Parse configuration values from the first line.
    const limitValue = parseInt(trimmedLines[0].split(' ')[0], 10);
    const intervalOffset = parseInt(trimmedLines[0].split(' ')[1], 10);

    // Parse scoring values from the second line.
    const rockScore = parseInt(trimmedLines[1].split(' ')[0], 10);
    const scissorsScore = parseInt(trimmedLines[1].split(' ')[1], 10);
    const paperScore = parseInt(trimmedLines[1].split(' ')[2], 10);

    // Get the sequence of moves from the third line.
    const gameMoves = trimmedLines[2];

    // Initialize the accumulator for the final score.
    let totalScore = 0;

    // Create a boolean array to track moves that result in a "pass" or "skip" condition.
    let forbiddenMoves = new Array(limitValue).fill(false);

    // Iterate through each move in the game sequence.
    for (let moveIndex = 0; moveIndex < gameMoves.length; moveIndex++) {
        // Check for a special condition: if the current move is related to a previous identical move
        // and that previous move was not itself "passed" or "skipped".
        if (moveIndex >= intervalOffset && gameMoves[moveIndex] === gameMoves[moveIndex - intervalOffset] && !forbiddenMoves[moveIndex - intervalOffset]) {
            // If the condition is met, mark the current move as "passed" and skip scoring for it.
            forbiddenMoves[moveIndex] = true;
            continue; // Proceed to the next move.
        }

        // Determine the score based on the current move type.
        switch (gameMoves[moveIndex]) {
            case 'r': // If the move is 'rock'
                totalScore += paperScore; // Add points for beating rock (paper points).
                break;
            case 's': // If the move is 'scissors'
                totalScore += rockScore; // Add points for beating scissors (rock points).
                break;
            case 'p': // If the move is 'paper'
                totalScore += scissorsScore; // Add points for beating paper (scissors points).
                break;
        }
    }

    // Output the final calculated score to the console.
    console.log(totalScore);
}


// The following line handles standard input/output and should not be modified by the user.
ExecuteProgram(require("fs").readFileSync("/dev/stdin", "utf8"));