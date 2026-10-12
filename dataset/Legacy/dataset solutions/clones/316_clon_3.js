function findNewLeader(playerScores) {
    let tempMaxScore = -Infinity;
    let tempMaxId = -1;

    for (let i = 0; i < playerScores.length; i++) {
        const currentScore = playerScores[i];
        if (currentScore > tempMaxScore) {
            tempMaxScore = currentScore;
            tempMaxId = i;
        } else if (currentScore === tempMaxScore) {
            if (i < tempMaxId) {
                tempMaxId = i;
            }
        }
    }
    return { newMaxScore: tempMaxScore, newMaxId: tempMaxId };
}

const fileSystem = require('fs');
const rawData = fileSystem.readFileSync('/dev/stdin', 'utf8');

const lines = rawData.trim().split("\n");

const configParams = lines.shift().split(" ").map(Number);
const numberOfPlayers = configParams[0];

const scores = Array(numberOfPlayers).fill(0);

let currentMaxScore = 0;
let leadingPlayerId = 0;

lines.forEach(function(lineData) {
    const [rawPlayerId, scoreDelta] = lineData.split(" ").map(Number);
    const targetPlayerIndex = rawPlayerId - 1;

    scores[targetPlayerIndex] += scoreDelta;

    if (targetPlayerIndex === leadingPlayerId) {
        if (scoreDelta >= 0) {
            currentMaxScore += scoreDelta;
        } else {
            const { newMaxScore, newMaxId } = findNewLeader(scores);
            currentMaxScore = newMaxScore;
            leadingPlayerId = newMaxId;
        }
    } else {
        const updatedScoreOfTarget = scores[targetPlayerIndex];
        if (updatedScoreOfTarget > currentMaxScore) {
            currentMaxScore = updatedScoreOfTarget;
            leadingPlayerId = targetPlayerIndex;
        } else if (updatedScoreOfTarget === currentMaxScore && targetPlayerIndex < leadingPlayerId) {
            leadingPlayerId = targetPlayerIndex;
        }
    }

    console.log(`${leadingPlayerId + 1} ${currentMaxScore}`);
});
