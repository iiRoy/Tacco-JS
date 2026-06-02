var rawData = require('fs').readFileSync('/dev/stdin', 'utf8'); // Read raw input from standard input
var lineSegments = (rawData.trim()).split("\n"); // Split the input into an array of lines, removing leading/trailing whitespace

// Main processing loop
while (true) {
    // Extract the number of rounds for the current game
    // The `shift()` method removes the first element from the `lineSegments` array
    // and returns that element. The `- 0` converts the string to a number.
    var roundCount = lineSegments.shift() - 0;

    // If the round count is zero, it signifies the end of input, so break the loop.
    if (roundCount === 0) {
        break;
    }

    // Initialize scores for two players for the current game
    var playerOneScore = 0;
    var playerTwoScore = 0;

    // Iterate through each round of the current game
    for (var roundIndex = 0; roundIndex < roundCount; roundIndex++) {
        // Get the scores for the current round
        // `shift()` gets the next line, `split(" ")` separates by space,
        // and `map(Number)` converts each part to a number.
        var roundScores = (lineSegments.shift()).split(" ").map(Number);

        // Compare scores and update player totals
        if (roundScores[0] > roundScores[1]) {
            // If player one's score is higher, add both scores to player one's total
            playerOneScore += roundScores[0] + roundScores[1];
        } else if (roundScores[0] < roundScores[1]) {
            // If player two's score is higher, add both scores to player two's total
            playerTwoScore += roundScores[0] + roundScores[1];
        } else {
            // If scores are equal, add player one's score to player one's total
            // and player two's score to player two's total
            playerOneScore += roundScores[0];
            playerTwoScore += roundScores[1];
        }
    }

    // Output the final scores for the current game, separated by a space
    console.log(playerOneScore + " " + playerTwoScore);
}
