let rawData = require('fs').readFileSync('/dev/stdin', 'utf8'); // Acquire raw input data from standard input

let lineData = rawData.trim().split("\n"); // Process raw input: remove leading/trailing whitespace and split into an array of lines

// Extract game parameters (number of players 'N' and number of queries 'Q') from the first line
const gameParams = lineData.shift().split(" ").map(Number);

let scoreBoard = []; // Array to maintain the current score for each player
let topScore = 0;    // Variable to store the highest score currently achieved
let leaderIndex = 0; // Variable to store the 0-based index of the player with the highest score

// Initialize all player scores to zero based on the number of players (N)
for (let idx = 0; idx < gameParams[0]; idx++) {
    scoreBoard[idx] = 0;
}

// Iterate through each remaining line, which represents a score update query
lineData.forEach(function(currentLine) {
    // Parse the current query line: player ID and score change value
    const actionValues = currentLine.split(" ").map(Number);

    const targetPlayer = actionValues[0] - 1; // Convert 1-based player ID to 0-based index
    const scoreChange = actionValues[1];      // The value to add to the player's score

    // Apply the score change to the designated player
    scoreBoard[targetPlayer] += scoreChange;

    // Logic to determine if the leader and top score need to be updated
    if (targetPlayer === leaderIndex && scoreChange >= 0) {
        // If the current leader's score increases or stays the same, they remain the leader
        topScore += scoreChange;
    } else if (targetPlayer !== leaderIndex && scoreChange < 0) {
        // If a non-leader's score decreases, it cannot affect the current leader or top score
        // No action required for leader tracking in this specific case
    } else {
        // In all other scenarios (leader's score decreases, or a non-leader's score increases),
        // we must re-evaluate the entire scoreboard to find the new leader.
        let currentMaxScore = -Infinity; // Temporary variable to track the maximum score found during re-evaluation

        scoreBoard.forEach(function(currentScore, playerIdx) {
            if (currentMaxScore < currentScore) {
                currentMaxScore = currentScore; // Update temporary max score
                topScore = currentScore;        // Update the global top score
                leaderIndex = playerIdx;        // Update the global leader index
            }
        });
    }
    // Output the 1-based index of the current leader and their score
    console.log((leaderIndex + 1) + " " + topScore);
});
