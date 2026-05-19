var rawData = require('fs').readFileSync('/dev/stdin', 'utf8');
var lineBuffer = (rawData.trim()).split("\n");

while (true) {
    var currentCaseCount = Number(lineBuffer.shift());
    if (currentCaseCount === 0) {
        break;
    }

    var scorePlayerA = 0;
    var scorePlayerB = 0;

    for (var gameIndex = 0; gameIndex < currentCaseCount; gameIndex++) {
        var roundDataString = lineBuffer.shift();
        var scoreStrings = roundDataString.split(" ");
        var roundScores = scoreStrings.map(Number);

        var playerOneRoundScore = roundScores[0];
        var playerTwoRoundScore = roundScores[1];

        if (playerOneRoundScore > playerTwoRoundScore) {
            var totalPointsForRound = playerOneRoundScore + playerTwoRoundScore;
            scorePlayerA += totalPointsForRound;
        } else if (playerOneRoundScore < playerTwoRoundScore) {
            var totalPointsForRound = playerOneRoundScore + playerTwoRoundScore;
            scorePlayerB += totalPointsForRound;
        } else {
            scorePlayerA += playerOneRoundScore;
            scorePlayerB += playerTwoRoundScore;
        }
    }
    console.log(scorePlayerA + " " + scorePlayerB);
}
