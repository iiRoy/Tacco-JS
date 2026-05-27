const rawData = require('fs').readFileSync('/dev/stdin', 'utf8');
const lines = rawData.trim().split("\n");

const firstConfigLine = lines.shift();
const configValues = firstConfigLine.split(" ").map(Number);

const numPlayers = configValues[0];

let scores = Array(numPlayers).fill(0);

let currentMaxScore = 0;
let currentMaxPlayerId = 0;

function findNewMaxPlayer(playerScoresArray) {
    let tempMaxScore = -Infinity;
    let tempMaxPlayerId = -1;

    playerScoresArray.forEach((scoreValue, playerIndex) => {
        if (tempMaxScore < scoreValue) {
            tempMaxScore = scoreValue;
            tempMaxPlayerId = playerIndex;
        }
    });
    return { score: tempMaxScore, id: tempMaxPlayerId };
}

lines.forEach(lineData => {
    const actionValues = lineData.split(" ").map(Number);
    const targetPlayerIndex = actionValues[0] - 1;
    const scoreChange = actionValues[1];

    scores[targetPlayerIndex] += scoreChange;

    if (targetPlayerIndex === currentMaxPlayerId) {
        if (scoreChange >= 0) {
            currentMaxScore += scoreChange;
        } else {
            const newMaxInfo = findNewMaxPlayer(scores);
            currentMaxScore = newMaxInfo.score;
            currentMaxPlayerId = newMaxInfo.id;
        }
    }

    console.log((currentMaxPlayerId + 1) + " " + currentMaxScore);
});
