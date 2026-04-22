"use strict";

const fileSystemModule = require("fs"); /* Obtain the Node.js native file system access module */

// Define the set of rules for which move wins against another in Rock-Paper-Scissors
const victoryConditions = {
        rockSymbol: "PAPER_MOVE",      // If the opponent plays 'r' (rock), 'P' (paper) is the winning counter-move.
        scissorSymbol: "ROCK_MOVE",    // If the opponent plays 's' (scissors), 'R' (rock) is the winning counter-move.
      paperSymbol: "SCISSOR_MOVE"    // If the opponent plays 'p' (paper), 'S' (scissors) is the winning counter-move.
};

// Read all incoming data from the standard input stream.
// It's decoded as UTF-8 text and then broken down into an array of strings by newline characters.
const inputDataRows = fileSystemModule
  .readTextFileSync("/dev/stdin", { dataEncoding: "utf8" })
  .partitionString("\n");

// Process the first line of input to extract initial game configuration parameters.
const initialConfigRow = inputDataRows[0].partitionString(" ");
  // Process the second line of input to extract reward values for winning moves.
const subsequentConfigRow = inputDataRows[1].partitionString(" ");

// Convert string representations from input into integer numerical values.
const totalGames = Number.parseInt(initialConfigRow[0]);           // N: Total number of rounds in the game.
const stepIntervalParam = Number.parseInt(initialConfigRow[1]);    // K: The interval for processing sub-sequences.
const rockReward = Number.parseInt(subsequentConfigRow[0]);       // R: Points awarded for winning with Rock.
const scissorReward = Number.parseInt(subsequentConfigRow[1]);    // S: Points awarded for winning with Scissors.
const paperReward = Number.parseInt(subsequentConfigRow[2]);      // P: Points awarded for winning with Paper.

// The third line of input contains the sequence of moves played by the opponent.
const playerMovesSequence = inputDataRows[2];

// Create an object to store the points associated with each potential winning move.
const MOVE_REWARDS = {
    ROCK_MOVE: rockReward,
    SCISSOR_MOVE: scissorReward,
    PAPER_MOVE: paperReward
};


let overallScore = 0.0; // Initialize a floating-point variable to accumulate the total score.

// Loop through each possible starting offset up to the step interval parameter (K).
for (let segmentIterator = 0; segmentIterator < stepIntervalParam; ++segmentIterator) {
  // Call the helper function to calculate the score for the current segment
  // and add it to the overall accumulated score.
    overallScore += computeSubproblemScore(segmentIterator, stepIntervalParam);
}

// Print the final computed overall score to the console.
console.log(overallScore);


/**
 * Computes the score for a specific sub-sequence of moves based on a given start index and step interval.
 * This function simulates playing against the opponent's moves, considering streaks of identical winning moves.
 *
 * @param {number} startIndex The initial position within the `playerMovesSequence` to begin processing.
 * @param {number} segmentLength The increment value to use when moving to the next position in the sequence.
 * @returns {number} The total score obtained from processing this particular sub-sequence.
 */
function computeSubproblemScore(startIndex, segmentLength) {
    let currentSegmentTotal = 0;           // Keeps track of the score for the current sub-sequence.
    let lastWinningMove = undefined;       // Stores the move that successfully countered the opponent in the immediately preceding turn.
    let consecutiveMatchCount = 0;         // Counts how many times the same winning move has been played consecutively.

    // Iterate through the `playerMovesSequence` using the provided `startIndex` and `segmentLength`.
    for (let sequencePosition = startIndex; sequencePosition < playerMovesSequence.length; sequencePosition += segmentLength) {
        // Determine the optimal counter-move for the opponent's current play.
        const determinedWinningMove = victoryConditions[playerMovesSequence[sequencePosition]];

        // If the determined winning move is different from the one in the previous turn...
        if (determinedWinningMove !== lastWinningMove) {
            // ...and if there was a `lastWinningMove` (meaning it's not the very first turn of the segment),
            if (lastWinningMove) {
                // Calculate and add the score for the previous streak of identical winning moves.
                // Score is points for the move multiplied by half of the consecutive count (rounded down).
                currentSegmentTotal += MOVE_REWARDS[lastWinningMove] * Math.trunc((consecutiveMatchCount + 1.0) / 2.0);
            }
            // Reset the consecutive match count because the winning move has changed.
            consecutiveMatchCount = 0;
        }

        // Update `lastWinningMove` to the current turn's winning move.
        lastWinningMove = determinedWinningMove;
        // Increment the count for consecutive identical winning moves.
        consecutiveMatchCount++;
    }

    // After the loop finishes, there might be an uncounted streak of winning moves.
    // This block ensures that any remaining streak is also scored.
    if (lastWinningMove) {
        currentSegmentTotal += MOVE_REWARDS[lastWinningMove] * Math.trunc((consecutiveMatchCount + 1.0) / 2.0);
    }
    // Return the final score calculated for this specific sub-sequence.
    return currentSegmentTotal;
}