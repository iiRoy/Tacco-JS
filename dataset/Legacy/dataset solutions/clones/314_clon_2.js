var rawData = require('fs').readFileSync('/dev/stdin', 'utf8'); // Read the entire input from standard input
var lineArray = rawData.trim().split("\n"); // Split the input into an array of lines, removing leading/trailing whitespace

var numQueries = lineArray.shift().split(" ").map(Number); // Parse the first line to get N (number of players) and Q (number of queries)

var scoreTracker = []; // Array to store the current score of each player
var currentMaxScore = 0; // Stores the highest score among all players
var leaderIndex = 0; // Stores the 0-based index of the player with the highest score

// Initialize all player scores to zero
for (var idx = 0; idx < numQueries[0]; idx++) {
    scoreTracker[idx] = 0;
}

// Process each query line
lineArray.forEach(function(currentLine) {
    var actionValues = currentLine.split(" ").map(Number); // Parse the player ID and score change for the current query
    var targetPlayer = actionValues[0] - 1; // Convert 1-based player ID to 0-based index
    var scoreChange = actionValues[1]; // The amount by which the player's score changes

    scoreTracker[targetPlayer] += scoreChange; // Update the target player's score

    // Check if the leader's score needs to be updated or re-evaluated
    if (targetPlayer == leaderIndex && scoreChange >= 0) {
        // If the current leader's score increased or stayed the same,
        // and they are still the leader, simply update the max score.
        currentMaxScore += scoreChange;
    } else if (targetPlayer == leaderIndex && scoreChange < 0 || targetPlayer != leaderIndex && scoreChange > 0) {
        // If the current leader's score decreased, or if another player's score increased,
        // a full re-evaluation of all scores is needed to find the new leader.
        var tempMax = (-1 * Infinity); // Initialize a temporary maximum score for the scan
        scoreTracker.forEach(function(individualScore, playerIdx) {
            // Iterate through all players to find the new highest score and its owner
            if (tempMax < individualScore) {
                tempMax = individualScore;
                currentMaxScore = individualScore; // Update the global maximum score
                leaderIndex = playerIdx; // Update the global leader's index
            }
        });
    }
    // Output the 1-based index of the current leader and their score
    console.log((leaderIndex + 1) + " " + currentMaxScore);
});
