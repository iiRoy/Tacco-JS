// File: game_score_aggregator.js
// Purpose: This script reads game round data from standard input,
// calculates cumulative scores for two players based on specific rules,
// and then outputs the final aggregated scores.

// --- Input Configuration and Setup ---
// Define the path for the standard input stream.
// This typically points to /dev/stdin on Linux-like systems.
const standardInputPath = '/dev/stdin';

// Specify the character sequence used to delimit individual lines in the input.
const lineBreakSequence = '\n'; // Using standard Unix newline.

// Obtain the Node.js built-in file system module.
const fsHandler = require('fs');

// Read the entire content from the specified input path.
// The 'ascii' encoding is used for basic text data.
// .trim() removes any leading or trailing whitespace from the entire input block.
const completeInputText = fsHandler.readFileSync(standardInputPath, 'ascii').trim();

// Divide the comprehensive input text into an array of individual string records,
// using the defined line break sequence as the separator.
let inputGameRecords = completeInputText.split(lineBreakSequence);

// --- Initial Data Preparation ---
// The problem statement implies the first line of input is often metadata (e.g., total rounds)
// that should be ignored for score calculation. We remove it here.
if (inputGameRecords.length > 0) {
    inputGameRecords.shift(); // Remove the first element from the array.
} else {
    // If the input was empty or only contained the discarded metadata line,
    // there's nothing left to process. We can optionally handle this,
    // but for competitive programming, valid input is usually guaranteed.
    // console.warn("No actual game rounds found in the input after initial processing.");
}

// Initialize an array to store the running total scores for two competitors.
// The first element (index 0) is for Player One, and the second (index 1) for Player Two.
let cumulativePlayerScores = [0, 0]; // [PlayerOneTotal, PlayerTwoTotal]

// --- Utility Function for Parsing a Single Round ---
/**
 * Parses a single string representing a game round into an array of two numeric scores.
 * @param {string} roundText - The raw string for one game round (e.g., "10 5").
 * @returns {number[]|null} An array [score1, score2] if parsing is successful, otherwise null.
 */
const extractRoundScores = (roundText) => {
    // Basic check for empty or malformed input lines.
    if (!roundText || roundText.trim() === '') {
        return null; // Indicate that this line cannot be processed.
    }

    // Split the round string by space to get individual score strings.
    const individualScoreStrings = roundText.split(' ');

    // Validate that we have exactly two score components.
    if (individualScoreStrings.length !== 2) {
        // console.warn(`Invalid round format encountered: "${roundText}". Skipping.`);
        return null;
    }

    // Convert string scores to integers. Use parseInt with radix 10 for safety.
    const scorePlayerA = parseInt(individualScoreStrings[0], 10);
    const scorePlayerB = parseInt(individualScoreStrings[1], 10);

    // Validate that both parsed scores are actual numbers.
    if (isNaN(scorePlayerA) || isNaN(scorePlayerB)) {
        // console.warn(`Non-numeric scores in round: "${roundText}". Skipping.`);
        return null;
    }

    return [scorePlayerA, scorePlayerB];
};

// --- Main Scoring Logic Loop ---
// Iterate over each remaining record, which represents a single game round.
for (const currentRoundString of inputGameRecords) {
    const roundResults = extractRoundScores(currentRoundString);

    // If the round string could not be parsed successfully (e.g., malformed, empty),
    // skip this iteration and move to the next round.
    if (roundResults === null) {
        continue;
    }

    // Deconstruct the parsed scores for better readability.
    const playerOneRoundScore = roundResults[0];
    const playerTwoRoundScore = roundResults[1];

    // Apply the specific scoring rules:
    // If Player One's score is higher, they get 3 points.
    if (playerOneRoundScore > playerTwoRoundScore) {
        cumulativePlayerScores[0] += 3;
    }
    // If Player Two's score is higher, they get 3 points.
    else if (playerTwoRoundScore > playerOneRoundScore) {
        cumulativePlayerScores[1] += 3;
    }
    // If scores are equal, it's a draw, and both players get 1 point.
    else {
        cumulativePlayerScores[0] += 1;
        cumulativePlayerScores[1] += 1;
    }
}

// --- Final Output ---
// Format the final accumulated scores into a single string,
// with the scores separated by a space.
const finalScoreDisplay = cumulativePlayerScores.join(' ');

// Print the formatted final scores to standard output.
console.log(finalScoreDisplay);