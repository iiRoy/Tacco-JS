const sourceData = require('fs').readFileSync('/dev/stdin', 'utf8').trim();
const numericEntries = sourceData.split('\n').map(Number);

function processScoreBlocks(remainingEntries) {
    if (remainingEntries.length === 0) {
        return;
    }

    const count = remainingEntries[0];
    if (count === 0) {
        return;
    }

    const currentBlockScores = remainingEntries.slice(1, count + 1);

    const sortedAndTrimmed = currentBlockScores
        .sort((valA, valB) => valA - valB)
        .slice(1, -1);

    const totalSum = sortedAndTrimmed.reduce((prev, curr) => prev + curr, 0);
    const finalAverage = Math.floor(totalSum / sortedAndTrimmed.length);

    console.log(finalAverage);

    processScoreBlocks(remainingEntries.slice(count + 1));
}

processScoreBlocks(numericEntries);
