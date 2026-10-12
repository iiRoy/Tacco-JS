var rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

// The input string is trimmed to remove leading/trailing whitespace,
// then split into an array of strings, where each string represents a line.
var lineData = (rawData.trim()).split("\n");

// The first element of the array is shifted off and converted to a number.
// This number represents the total count of game rounds.
var numRounds = lineData.shift() - 0;

// Initialize total scores for two players, designated as Player A and Player B.
var scorePlayerA = 0;
var scorePlayerB = 0;

// Iterate through each game round.
for (var roundIndex = 0; roundIndex < numRounds; roundIndex++) {
    // Retrieve the current round's data line from the array.
    var currentLine = lineData.shift();

    // Split the current line by space to get individual scores for the round,
    // then convert these string scores into actual numbers.
    var roundScores = currentLine.split(" ").map(Number);

    // Apply game rules to update player scores based on the round's outcome.
    if (roundScores[0] > roundScores[1]) {
        // If Player A's score is higher, Player A gets both scores added to their total.
        scorePlayerA += roundScores[0] + roundScores[1];
    } else if (roundScores[0] < roundScores[1]) {
        // If Player B's score is higher, Player B gets both scores added to their total.
        scorePlayerB += roundScores[0] + roundScores[1];
    } else {
        // If scores are equal (a tie), each player gets their own score from the round.
        scorePlayerA += roundScores[0];
        scorePlayerB += roundScores[1];
    }
}

// Output the final accumulated scores for Player A and Player B, separated by a space.
console.log(scorePlayerA + " " + scorePlayerB);
