const dataInput = require('node:fs').readFileSync('/dev/stdin', 'utf8');
const dataLines = dataInput.trim().split('\n');

const renderResult = (batchOfSums) => {
    if (batchOfSums.length !== 5) {
        return;
    }

    let highestScore = -Infinity;
    let winnerIndex = -1;

    for (let k = 0; k < batchOfSums.length; ++k) {
        if (batchOfSums[k] > highestScore) {
            highestScore = batchOfSums[k];
            winnerIndex = k;
        }
    }

    const winnerId = String.fromCharCode('A'.charCodeAt(0) + winnerIndex);
    console.log(`${winnerId} ${highestScore}`);
};

const handleInputSequence = (sequence, position = 0, currentBatch = []) => {
    if (position >= sequence.length) {
        return;
    }

    const currentDatum = sequence[position];

    if (currentBatch.length === 0 && currentDatum === "0 0") {
        return;
    }

    const parsedNumbers = currentDatum.split(' ').map(Number);
    const lineTotal = parsedNumbers[0] + parsedNumbers[1];

    const nextBatch = [...currentBatch, lineTotal];

    if (nextBatch.length === 5) {
        renderResult(nextBatch);
        handleInputSequence(sequence, position + 1, []);
    } else {
        handleInputSequence(sequence, position + 1, nextBatch);
    }
};

handleInputSequence(dataLines);