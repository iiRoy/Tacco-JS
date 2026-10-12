var rawData = require('fs').readFileSync('/dev/stdin', 'utf8');
var lineSegments = rawData.trim().split("\n");
var configParams = lineSegments.shift().split(" ").map(Number);

var playerScores = Array.from({ length: configParams[0] }, () => 0);

function determineLeader(scoresArray) {
    return scoresArray.reduce((accumulator, currentScore, currentIndex) => {
        if (currentScore > accumulator.score) {
            return { score: currentScore, identifier: currentIndex };
        }
        return accumulator;
    }, { score: -Infinity, identifier: -1 });
}

let { score: currentHighestScore, identifier: leadingPlayerIdentifier } = determineLeader(playerScores);

for (const updateEntry of lineSegments) {
    var updateComponents = updateEntry.split(" ").map(Number);
    var playerIndex = updateComponents[0] - 1;
    var scoreAdjustment = updateComponents[1];

    playerScores[playerIndex] += scoreAdjustment;

    const leaderInfo = determineLeader(playerScores);
    currentHighestScore = leaderInfo.score;
    leadingPlayerIdentifier = leaderInfo.identifier;

    console.log((leadingPlayerIdentifier + 1) + " " + currentHighestScore);
}
