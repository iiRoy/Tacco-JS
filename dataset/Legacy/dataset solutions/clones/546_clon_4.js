const fileSystem = require('fs');
const rawData = fileSystem.readFileSync('/dev/stdin', 'utf8');

const processedLines = rawData.trim().split('\n');

const totalRounds = Number(processedLines.shift());

const gamePairs = processedLines.map(roundEntry =>
    roundEntry.split(' ').map(Number)
);

let finalScoreA = 0;
let finalScoreB = 0;
let tieFlag = false;

for (let k = gamePairs.length - 1; k >= 0; k--) {
    const [playerX, playerY] = gamePairs[k];
    if (playerX === playerY) {
        finalScoreA = playerX;
        finalScoreB = playerY;
        tieFlag = true;
        break;
    }
}

if (!tieFlag) {
    const accumulatedScores = gamePairs.reduce((currentScores, [playerX, playerY]) => {
        if (playerX > playerY) {
            currentScores[0] += playerX + playerY;
        } else if (playerX < playerY) {
            currentScores[1] += playerX + playerY;
        }
        return currentScores;
    }, [0, 0]);

    finalScoreA = accumulatedScores[0];
    finalScoreB = accumulatedScores[1];
}

console.log(finalScoreA + " " + finalScoreB);
