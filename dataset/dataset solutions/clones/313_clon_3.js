const parseNumericPair = (inputString) => {
    return inputString.split(" ").map(Number);
};

const identifyCurrentMaxPlayer = (allPlayerScores) => {
    let highestScoreFound = -Infinity;
    let playerIndexWithHighestScore = -1;

    allPlayerScores.forEach((scoreValue, playerIdentifier) => {
        if (scoreValue > highestScoreFound) {
            highestScoreFound = scoreValue;
            playerIndexWithHighestScore = playerIdentifier;
        }
    });
    return { score: highestScoreFound, index: playerIndexWithHighestScore };
};

const rawInputData = require('fs').readFileSync('/dev/stdin', 'utf8');

const processedInputLines = rawInputData.trim().split("\n");

const [totalPlayers, totalQueries] = parseNumericPair(processedInputLines.shift());

const playerScoresTracker = Array.from({ length: totalPlayers }, () => 0);

let currentMaximumScore = 0;
let playerIndexHoldingMax = 0;

processedInputLines.forEach((queryLine) => {
    const [oneBasedPlayerId, scoreAdjustment] = parseNumericPair(queryLine);
    const zeroBasedPlayerId = oneBasedPlayerId - 1;

    playerScoresTracker[zeroBasedPlayerId] += scoreAdjustment;

    let requiresFullScanForMax = false;

    if (zeroBasedPlayerId === playerIndexHoldingMax) {
        if (scoreAdjustment < 0) {
            requiresFullScanForMax = true;
        } else {
            currentMaximumScore += scoreAdjustment;
        }
    } else {
        if (scoreAdjustment >= 0) {
            requiresFullScanForMax = true;
        }
    }

    if (requiresFullScanForMax) {
        const maxPlayerDetails = identifyCurrentMaxPlayer(playerScoresTracker);
        currentMaximumScore = maxPlayerDetails.score;
        playerIndexHoldingMax = maxPlayerDetails.index;
    }

    console.log((playerIndexHoldingMax + 1) + " " + currentMaximumScore);
});
