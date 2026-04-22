"use strict";

// Core utility for file system operations, used for input reading.
const fileSystemUtility = require("fs");

// Defines the optimal player move to counter each opponent move.
// Keys are opponent's moves (lowercase), values are player's winning moves (uppercase).
const gameMoveMappings = {
  "r": "P", // Opponent Rock -> Player Paper
  "s": "R", // Opponent Scissors -> Player Rock
  "p": "S"  // Opponent Paper -> Player Scissors
};

/**
 * Parses a string into an integer. Provides a default (0) for non-numeric or empty inputs.
 * @param {string} inputString The string to parse.
 * @returns {number} The parsed integer, or 0 if parsing fails.
 */
const parseNumericValue = (inputString) => {
  const result = Number(inputString);
  return isNaN(result) ? 0 : result;
};

// Read all lines from standard input, assuming UTF-8 encoding.
const rawInputLines = fileSystemUtility.readFileSync("/dev/stdin", { encoding: "utf8" }).split("\n");

// --- Configuration Parameters Parsing ---
// The first line contains general game parameters.
const configLineData = rawInputLines[0].split(" ");
const totalGameRounds = parseNumericValue(configLineData[0]); // N: Total rounds, not directly used in score calculation logic.
const processingSegmentsCount = parseNumericValue(configLineData[1]); // K: Defines the number of distinct segments and the stride.

// --- Scoring Values Parsing ---
// The second line contains point values for winning with specific moves.
const scoreValuesLineData = rawInputLines[1].split(" ");
const rockScoreValue = parseNumericValue(scoreValuesLineData[0]);     // R: Points for winning with Rock.
const scissorsScoreValue = parseNumericValue(scoreValuesLineData[1]); // S: Points for winning with Scissors.
const paperScoreValue = parseNumericValue(scoreValuesLineData[2]);    // P: Points for winning with Paper.

// --- Opponent's Move Sequence ---
// The third line provides the full sequence of moves the opponent will make.
const opponentActionSequence = rawInputLines[2]; // T: String representing opponent's moves.

// A consolidated map of player move types to their corresponding score values.
const moveTypeScores = {
  "R": rockScoreValue,
  "S": scissorsScoreValue,
  "P": paperScoreValue
};

/**
 * Calculates the score for a continuous sequence of identical successful player moves.
 * Points are awarded for every other successful move in the sequence (e.g., 1 win = 1 point, 2 wins = 1 point, 3 wins = 2 points).
 * @param {string} successfulMoveType The type of player move ('R', 'S', 'P') that was repeatedly successful.
 * @param {number} consecutiveMatchCount The count of consecutive times this move was the optimal counter.
 * @param {object} scoreValueMap A map from move types to their point values.
 * @returns {number} The total points for this sequence.
 */
const calculateSequencePoints = (successfulMoveType, consecutiveMatchCount, scoreValueMap) => {
  // No points if no move type or no matches.
  if (!successfulMoveType || consecutiveMatchCount <= 0) {
    return 0;
  }
  // The logic is to score for (count + 1) / 2 wins, rounded down.
  // Example: 1 -> 1, 2 -> 1, 3 -> 2, 4 -> 2, etc.
  const effectiveWins = (consecutiveMatchCount + 1) >> 1; // Efficient integer division by 2 (equivalent to Math.floor((x+1)/2))
  return scoreValueMap[successfulMoveType] * effectiveWins;
};

/**
 * Processes a specific segment of the opponent's move sequence to calculate the player's potential score.
 * This function simulates playing the optimal counter-move for each opponent move,
 * with the constraint that the same winning move cannot be played consecutively for scoring.
 * @param {number} startPosition The starting index (offset) within the opponent's sequence for this segment.
 * @param {number} iterationStep The step size (stride) to advance through the sequence.
 * @returns {number} The accumulated score for this particular segment.
 */
function processSubSequence(startPosition, iterationStep) {
  let currentSegmentTotal = 0;
  let previousSuccessfulMove = null; // Tracks the last move that was considered successful for scoring.
  let currentConsecutiveWins = 0;    // Counts how many times `previousSuccessfulMove` has been the optimal choice.

  // Guard clause: If the sequence is invalid or step size is non-positive, return 0.
  if (!opponentActionSequence || opponentActionSequence.length === 0 || iterationStep <= 0) {
    return 0;
  }

  // Iterate through the opponent's sequence, picking moves based on `startPosition` and `iterationStep`.
  for (let seqPos = startPosition; seqPos < opponentActionSequence.length; seqPos += iterationStep) {
    const opponentCurrentMove = opponentActionSequence[seqPos];
    // Determine the optimal player move to beat the opponent's current move.
    const determinedOptimalMove = gameMoveMappings[opponentCurrentMove];

    // Check if the optimal move for the current position is different from the previous one.
    // This signifies a potential break in a consecutive sequence of identical optimal moves.
    if (determinedOptimalMove !== previousSuccessfulMove) {
      // If there was a previous sequence (i.e., `previousSuccessfulMove` was set and matches occurred),
      // calculate and add its points to the total.
      if (previousSuccessfulMove !== null && currentConsecutiveWins > 0) {
        currentSegmentTotal += calculateSequencePoints(previousSuccessfulMove, currentConsecutiveWins, moveTypeScores);
      }
      // Reset the counter for the new sequence and update the 'previous' move.
      currentConsecutiveWins = 0;
      previousSuccessfulMove = determinedOptimalMove;
    }
    // Increment the count for the current sequence of identical optimal moves.
    // This happens for every position where the `determinedOptimalMove` is the same as `previousSuccessfulMove`.
    currentConsecutiveWins++;
  }

  // After the loop finishes, there might be an uncounted sequence at the end of the segment.
  // Calculate and add points for any remaining sequence.
  if (previousSuccessfulMove !== null && currentConsecutiveWins > 0) {
    currentSegmentTotal += calculateSequencePoints(previousSuccessfulMove, currentConsecutiveWins, moveTypeScores);
  }

  return currentSegmentTotal;
}

// --- Main Program Execution ---
let accumulatedFinalScore = 0;

// The problem dictates processing the opponent's sequence in 'K' distinct segments.
// Each segment starts at a different initial offset (from 0 to K-1) but uses K as the stride.
for (let segmentIdx = 0; segmentIdx < processingSegmentsCount; ++segmentIdx) {
  accumulatedFinalScore += processSubSequence(segmentIdx, processingSegmentsCount);
}

// Print the final accumulated score to standard output.
console.log(accumulatedFinalScore);