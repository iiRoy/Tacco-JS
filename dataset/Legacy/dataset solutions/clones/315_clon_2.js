var rawData = require('fs').readFileSync('/dev/stdin', 'utf8'); // Read input from standard input stream
var lineArray = rawData.trim().split("\n"); // Split the raw input string into an array of lines

var numQueries = lineArray.shift().split(" ").map(Number); // The first line contains N (number of players) and Q (number of queries)
var scoreTracker = []; // This array will hold the current scores for each player

var currentMaxScore = 0; // Stores the highest score encountered so far
var topPlayerIndex = 0; // Stores the 0-based index of the player with the highest score

// Initialize all player scores to zero based on the number of players (N)
for (var idx = 0; idx < numQueries[0]; idx++) {
    scoreTracker[idx] = 0;
}

// Process each query line from the remaining input
lineArray.forEach(function(lineData) {
    var actionValues = lineData.split(" ").map(Number); // Parse the player index and score change from the current line

    var targetPlayer = actionValues[0] - 1; // Convert 1-based player ID to 0-based index
    var scoreChange = actionValues[1]; // The value to add to the player's score

    scoreTracker[targetPlayer] += scoreChange; // Update the score for the specified player

    // Check if the score update affects the current maximum score
    if (targetPlayer === topPlayerIndex && scoreChange >= 0) {
        // If the top player's score increased or stayed the same (due to 0 change), update currentMaxScore directly
        currentMaxScore += scoreChange;
    } else if (targetPlayer === topPlayerIndex && scoreChange < 0) {
        // If the top player's score decreased, we need to re-evaluate all scores to find the new maximum
        var tempMax = (-1 * Infinity); // Initialize a temporary maximum to a very small number

        // Iterate through all players to find the new highest score and its index
        scoreTracker.forEach(function(currentScore, playerIdx) {
            if (tempMax < currentScore) {
                tempMax = currentScore;
                currentMaxScore = currentScore; // Update the global max score
                topPlayerIndex = playerIdx; // Update the global top player index
            }
        });
    }
    // Output the 1-based index of the top player and their current score
    console.log((topPlayerIndex + 1) + " " + currentMaxScore);
});
