var rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

// Process the raw input data
var lineSegments = rawData.trim().split("\n");

// Extract configuration parameters (N and Q) from the first line
var configParams = lineSegments.shift().split(" ").map(Number);

// Initialize an array to track player scores
var scoreTracker = [];

// Variables to keep track of the highest score and the ID of the player with that score
var currentHighestScore = 0;
var topScorerIndex = 0;

// Initialize all player scores to zero based on the 'N' parameter
for (var idx = 0; idx < configParams[0]; idx++) {
    scoreTracker[idx] = 0;
}

// Iterate through each remaining line, representing score updates
lineSegments.forEach(function (currentLine) {
    // Parse the current line into player ID and score change
    var parsedValues = currentLine.split(" ").map(Number);
    var scorerIdentifier = parsedValues[0] - 1; // Adjust to 0-based index
    var scoreChange = parsedValues[1];

    // Apply the score change to the respective player
    scoreTracker[scorerIdentifier] += scoreChange;

    // Update highest score and top scorer ID based on the change
    if (scorerIdentifier === topScorerIndex && scoreChange >= 0) {
        // If the current top scorer's score increased or stayed same
        currentHighestScore += scoreChange;
    } else if (currentHighestScore === scoreTracker[scorerIdentifier] && topScorerIndex > scorerIdentifier) {
        // If another player now has the same highest score but a lower ID, update top scorer
        topScorerIndex = scorerIdentifier;
    } else if (currentHighestScore < scoreTracker[scorerIdentifier]) {
        // If a player's score surpasses the current highest score
        currentHighestScore = scoreTracker[scorerIdentifier];
        topScorerIndex = scorerIdentifier;
    } else if (scorerIdentifier === topScorerIndex && scoreChange < 0) {
        // If the current top scorer's score decreased, re-evaluate all scores
        var tempMaxScore = (-1 * Infinity); // Use negative infinity for initial comparison
        scoreTracker.forEach(function (individualScore, scorerPosition) {
            if (tempMaxScore < individualScore) {
                tempMaxScore = individualScore;
                currentHighestScore = individualScore;
                topScorerIndex = scorerPosition;
            }
        });
    }

    // Output the ID (1-based) of the top scorer and their current highest score
    console.log((topScorerIndex + 1) + " " + currentHighestScore);
});
