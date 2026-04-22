const fileSystemModule = require('fs');

// Acquire the raw input data from the standard input stream.
// The data is read as a UTF-8 encoded string.
const rawInputBuffer = fileSystemModule.readFileSync('/dev/stdin', 'utf8');

// Process the raw input: split it into individual lines,
// then filter out any blank lines that might occur due to formatting.
let gameInstructions = rawInputBuffer
    .split('\n')
    .filter(lineContent => lineContent.trim().length > 0);

// Initialize score counters for both competitors.
// Player One's score:
let firstCompetitorScore = 0;
// Player Two's score:
let secondCompetitorScore = 0;

// Extract the first line, which indicates the total number of game rounds.
// Parse this string into an integer value.
const totalMatchRoundsString = gameInstructions.shift();
const totalMatchRounds = parseInt(totalMatchRoundsString, 10);

// Perform a basic validation check on the parsed number of rounds.
// If it's not a valid non-negative number, log an error and terminate.
if (isNaN(totalMatchRounds) || totalMatchRounds < 0) {
    console.error("Critical Error: The specified total number of rounds is invalid. Expected a non-negative integer.");
    process.exit(1); // Exit with a non-zero status code to indicate an error.
}

/**
 * Determines the score allocation for a single round based on two player moves.
 * Moves are compared lexicographically.
 * @param {string} moveOne - The move made by the first player.
 * @param {string} moveTwo - The move made by the second player.
 * @returns {{playerOne: number, playerTwo: number}} An object containing scores for both players for this round.
 */
const evaluateRoundOutcome = (moveOne, moveTwo) => {
    let currentRoundPointsP1 = 0;
    let currentRoundPointsP2 = 0;

    if (moveOne > moveTwo) {
        // If the first player's move is lexicographically greater, they win.
        currentRoundPointsP1 = 3;
    } else if (moveOne < moveTwo) {
        // If the second player's move is lexicographically greater, they win.
        currentRoundPointsP2 = 3;
    } else {
        // If the moves are identical, it's a draw.
        currentRoundPointsP1 = 1;
        currentRoundPointsP2 = 1;
    }
    return { playerOne: currentRoundPointsP1, playerTwo: currentRoundPointsP2 };
};

// Iterate through each round of the game.
// Using a while loop with an explicit index for control.
let currentRoundIndex = 0;
while (currentRoundIndex < totalMatchRounds) {
    const currentRoundEntry = gameInstructions.shift();

    // Guard clause: Check if there are enough game entries for the declared total rounds.
    if (!currentRoundEntry) {
        console.warn(`Warning: Insufficient game entries provided. Expected ${totalMatchRounds} rounds, but only ${currentRoundIndex} were fully processed.`);
        break; // Exit the loop if no more entries are available.
    }

    // Split the current round's entry into the individual moves made by each player.
    const playerMoveTokens = currentRoundEntry.split(' ');

    // Validation: Ensure each round entry contains exactly two moves.
    if (playerMoveTokens.length !== 2) {
        console.warn(`Skipping malformed round data: "${currentRoundEntry}". Expected two moves, found ${playerMoveTokens.length}.`);
        currentRoundIndex++; // Increment index to count this as a processed (but skipped) round.
        continue; // Move to the next iteration.
    }

    const firstPlayerAction = playerMoveTokens[0];
    const secondPlayerAction = playerMoveTokens[1];

    // Calculate the scores for the current round using the helper function.
    const roundScores = evaluateRoundOutcome(firstPlayerAction, secondPlayerAction);

    // Accumulate the scores to the overall totals.
    firstCompetitorScore += roundScores.playerOne;
    secondCompetitorScore += roundScores.playerTwo;

    currentRoundIndex++; // Advance to the next round.
}

// Construct the final output string using a template literal.
// This string will contain the total scores of both players, separated by a space.
const finalResultsDisplay = `${firstCompetitorScore} ${secondCompetitorScore}`;

// Print the aggregated final scores to the console.
console.log(finalResultsDisplay);