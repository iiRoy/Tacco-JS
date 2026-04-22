const rawData = require('fs').readFileSync('/dev/stdin', 'utf8');
const processedLines = rawData.trim().split('\n');

const configLine = processedLines.shift().split(' ').map(Number);
const entityCount = configLine[0];
const operationCount = configLine[1];

const operations = processedLines.map(segment => segment.split(' ').map(Number));

const finalStateResult = operations.reduce((currentStatus, currentOperation) => {
    let { allEntityScores, currentDominantIndex, currentDominantScore } = currentStatus;

    const affectedEntityIndex = currentOperation[0] - 1;
    const scoreAdjustmentAmount = currentOperation[1];

    allEntityScores[affectedEntityIndex] += scoreAdjustmentAmount;

    let nextDominantIndex = currentDominantIndex;
    let nextDominantScore = currentDominantScore;

    if (affectedEntityIndex === currentDominantIndex && scoreAdjustmentAmount >= 0) {
        nextDominantScore += scoreAdjustmentAmount;
    } else if (affectedEntityIndex !== currentDominantIndex && scoreAdjustmentAmount < 0) {
        // No change to dominant entity
    } else {
        let temporaryHighestScore = -Infinity;
        let temporaryHighestIndex = -1;

        for (let idx = 0; idx < allEntityScores.length; ++idx) {
            if (allEntityScores[idx] > temporaryHighestScore) {
                temporaryHighestScore = allEntityScores[idx];
                temporaryHighestIndex = idx;
            }
        }
        nextDominantIndex = temporaryHighestIndex;
        nextDominantScore = temporaryHighestScore;
    }

    console.log(`${nextDominantIndex + 1} ${nextDominantScore}`);

    return {
        allEntityScores: allEntityScores,
        currentDominantIndex: nextDominantIndex,
        currentDominantScore: nextDominantScore
    };
}, {
    allEntityScores: Array(entityCount).fill(0),
    currentDominantIndex: 0,
    currentDominantScore: 0
});