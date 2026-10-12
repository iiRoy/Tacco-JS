var fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');

const parseRoundData = (lineString) => {
    return lineString.split(" ").map(Number);
};

var gameScores = {
    playerA: 0,
    playerB: 0
};

var inputLines = fileContent.trim().split("\n");

var numberOfRounds = parseInt(inputLines.shift(), 10);

function updateGameScores(roundPair, currentScores) {
    const [val1, val2] = roundPair;

    if (val1 > val2) {
        currentScores.playerA += val1 + val2;
    } else if (val1 < val2) {
        currentScores.playerB += val1 + val2;
    } else {
        currentScores.playerA += val1;
        currentScores.playerB += val2;
    }
}

for (let roundCounter = 0; roundCounter < numberOfRounds; roundCounter++) {
    const currentRoundLine = inputLines.shift();
    const roundValues = parseRoundData(currentRoundLine);
    updateGameScores(roundValues, gameScores);
}

console.log(gameScores.playerA + " " + gameScores.playerB);
