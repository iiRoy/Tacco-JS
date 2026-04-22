const fileSystemModule = require('fs'); // Import the file system module explicitly

// Read the entire content from standard input, decode as UTF-8, and process it.
// The raw input string is then trimmed of leading/trailing whitespace and
// split into an array of individual lines.
const rawInputContent = fileSystemModule.readFileSync('/dev/stdin', 'utf8');
const processedInputLines = rawInputContent.trim().split('\n');

// Extract the initial configuration from the first line of input.
// This line contains N (total number of players) and Q (total number of queries).
const [totalPlayersCount, totalQueriesCount] = processedInputLines.shift().split(' ').map(Number);

// Initialize an array to store the scores of each player.
// All players start with a score of zero. Array.from is used for concise initialization.
let playerScoresCollection = Array.from({ length: totalPlayersCount }, () => 0);

// Variables to keep track of the highest score observed so far
// and the 0-based index of the player who currently holds that score.
// Initially, player 0 has the highest score (0), as all scores are 0.
let currentHighestScoreValue = 0;
let topScorerPlayerIndex = 0;

/**
 * Helper function to re-scan all player scores and determine the current
 * highest score and the index of the player achieving it.
 * This is invoked when the previously identified top scorer's score decreases.
 * @param {Array<number>} scoresArray - The array containing all player scores.
 * @returns {{score: number, index: number}} An object containing the new highest score and its index.
 */
const recalculateOverallMaximum = (scoresArray) => {
    let temporaryMaxScore = -Infinity; // Start with negative infinity to ensure any score is higher
    let temporaryMaxIndex = -1;         // Default to -1 if no players are found (or scores are all -Infinity)

    // Iterate through each player's score to find the maximum.
    scoresArray.forEach((individualPlayerScore, playerIdentifier) => {
        if (individualPlayerScore > temporaryMaxScore) {
            temporaryMaxScore = individualPlayerScore;
            temporaryMaxIndex = playerIdentifier;
        }
    });
    return { score: temporaryMaxScore, index: temporaryMaxIndex };
};

// Process each remaining line, which represents a score update query.
processedInputLines.forEach((currentQueryLine, queryIteration) => {
    // Parse the current query line into the 1-based player ID and the score change amount.
    const [oneBasedPlayerId, scoreAdjustmentValue] = currentQueryLine.split(' ').map(Number);

    // Convert the 1-based player ID to a 0-based index for array access.
    const zeroBasedTargetPlayerIndex = oneBasedPlayerId - 1;

    // --- Optional: Add a guard clause for input validation (Type III addition) ---
    // If the player ID is out of bounds, we might choose to skip this query.
    // Uncomment the following block if strict input validation is desired.
    /*
    if (zeroBasedTargetPlayerIndex < 0 || zeroBasedTargetPlayerIndex >= totalPlayersCount) {
        // console.warn(`Query ${queryIteration + 1}: Invalid player ID (${oneBasedPlayerId}). Skipping update.`);
        return; // Skip this iteration and move to the next query.
    }
    */

    // Apply the score adjustment to the relevant player's score.
    playerScoresCollection[zeroBasedTargetPlayerIndex] += scoreAdjustmentValue;

    // Logic to update the `currentHighestScoreValue` and `topScorerPlayerIndex`.
    // This section mirrors the original code's specific behavior:
    // The overall maximum is only re-evaluated if the *current* top scorer's score changes.
    // If another player's score surpasses the current highest, it is NOT immediately updated
    // unless the current top scorer's score decreases.
    if (zeroBasedTargetPlayerIndex === topScorerPlayerIndex) {
        if (scoreAdjustmentValue < 0) {
            // The current top scorer's score has decreased.
            // A full re-evaluation is necessary as they might no longer be the highest,
            // or another player might now hold the highest score.
            const newMaxResult = recalculateOverallMaximum(playerScoresCollection);
            currentHighestScoreValue = newMaxResult.score;
            topScorerPlayerIndex = newMaxResult.index;
        } else {
            // The current top scorer's score has increased or stayed the same (scoreAdjustmentValue >= 0).
            // They remain the top scorer, and their score simply updates.
            currentHighestScoreValue += scoreAdjustmentValue;
            // topScorerPlayerIndex remains unchanged.
        }
    }
    // If 'zeroBasedTargetPlayerIndex' is NOT 'topScorerPlayerIndex', the 'currentHighestScoreValue'
    // and 'topScorerPlayerIndex' variables are left as they are, even if the updated player's
    // score is now higher than 'currentHighestScoreValue'. This preserves the original logic's
    // unique characteristic.

    // Output the 1-based index of the top scorer and their current highest score.
    // Using template literals for cleaner string concatenation.
    const outputPlayerId = topScorerPlayerIndex + 1;
    console.log(`${outputPlayerId} ${currentHighestScoreValue}`);
});