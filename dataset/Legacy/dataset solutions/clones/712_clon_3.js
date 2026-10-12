const fileSystem = require('fs');
const rawInputData = fileSystem.readFileSync('/dev/stdin', 'utf8');

const trimmedInput = rawInputData.trim();
const inputLines = trimmedInput.split("\n");

function isSoleWinner(scoresArray, potentialWinnerIndex) {
    let nonZeroScoreCount = 0;
    let isPotentialWinnerNonZero = false;

    for (let k = 0; k < scoresArray.length; k++) {
        if (scoresArray[k] > 0) {
            nonZeroScoreCount++;
            if (k === potentialWinnerIndex) {
                isPotentialWinnerNonZero = true;
            }
        }
    }
    return nonZeroScoreCount === 1 && isPotentialWinnerNonZero;
}

let mainLoopIteration = 0;
while (true) {
    const currentLineData = inputLines.shift();
    const terminationCondition = "0 0";

    if (currentLineData === terminationCondition) {
        break;
    }

    const parsedNumbers = currentLineData.split(" ").map(Number);
    const numPlayers = parsedNumbers[0];
    let currentResource = parsedNumbers[1];

    const playerScores = Array(numPlayers).fill(0);

    let activePlayerIndex = 0;
    const maxGameIterations = 1000000;

    for (let gameIteration = 0; gameIteration < maxGameIterations; gameIteration++) {
        if (activePlayerIndex === playerScores.length) {
            activePlayerIndex = 0;
        }

        if (currentResource > 0) {
            currentResource--;
            playerScores[activePlayerIndex]++;

            if (currentResource === 0) {
                if (isSoleWinner(playerScores, activePlayerIndex)) {
                    console.log(activePlayerIndex);
                    break;
                }
            }
        } else {
            currentResource = playerScores[activePlayerIndex];
            playerScores[activePlayerIndex] = 0;
        }
        activePlayerIndex++;
    }
    mainLoopIteration++;
}
