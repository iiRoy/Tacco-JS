var INPUT_FILE_PATH = '/dev/stdin';
var fileSystem = require('fs');

var rawInputData = fileSystem.readFileSync(INPUT_FILE_PATH, 'utf8');

var allInputLines = rawInputData.trim().split("\n");

var configLineData = allInputLines.shift();
var configNumbers = configLineData.split(" ").map(Number);
var totalPlayers = configNumbers[0];
var totalQueries = configNumbers[1];

var playerScoresList = new Array(totalPlayers).fill(0);

function identifyCurrentLeader(scoresCollection) {
    var topScore = -Infinity;
    var topPlayerIndex = -1;
    for (var pIdx = 0; pIdx < scoresCollection.length; pIdx++) {
        var currentScoreValue = scoresCollection[pIdx];
        if (currentScoreValue > topScore) {
            topScore = currentScoreValue;
            topPlayerIndex = pIdx;
        }
    }
    return { leaderIdx: topPlayerIndex, maxVal: topScore };
}

var currentLeaderId = 0;
var currentLeaderScore = 0;

allInputLines.forEach(function(queryEntry) {
    var queryParts = queryEntry.split(" ").map(Number);
    var targetPlayerZeroIndexed = queryParts[0] - 1;
    var scoreAdjustment = queryParts[1];

    playerScoresList[targetPlayerZeroIndexed] += scoreAdjustment;

    var requiresFullLeaderRecalculation = false;

    if (targetPlayerZeroIndexed === currentLeaderId && scoreAdjustment >= 0) {
        currentLeaderScore += scoreAdjustment;
    } else if ((targetPlayerZeroIndexed === currentLeaderId && scoreAdjustment < 0) ||
               (targetPlayerZeroIndexed !== currentLeaderId && scoreAdjustment > 0)) {
        requiresFullLeaderRecalculation = true;
    }

    if (requiresFullLeaderRecalculation) {
        var leaderDataResult = identifyCurrentLeader(playerScoresList);
        currentLeaderId = leaderDataResult.leaderIdx;
        currentLeaderScore = leaderDataResult.maxVal;
    }

    var outputPlayerDisplayId = currentLeaderId + 1;
    var finalOutputString = outputPlayerDisplayId + " " + currentLeaderScore;

    console.log(finalOutputString);
});
