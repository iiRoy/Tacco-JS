const dataFeed = require('node:fs').readFileSync('/dev/stdin', 'utf8');
const numericEntries = dataFeed.trim().split('\n').map(Number);

function processInputSequence(allValues, currentOffset) {
    const chunkLength = allValues[currentOffset];
    if (chunkLength === 0) {
        return [];
    }

    const currentChunkValues = allValues.slice(currentOffset + 1, currentOffset + 1 + chunkLength);

    const tallyForChunk = calculateZeroCountForBlock(currentChunkValues);

    const remainingResults = processInputSequence(allValues, currentOffset + 1 + chunkLength);
    return [tallyForChunk, ...remainingResults];
}

function calculateZeroCountForBlock(blockElements) {
    const finalState = blockElements.reduce((accumulator, elementValue, position) => {
        const nextStateToggle = !accumulator.stateToggle;

        let nextSequence;
        if (nextStateToggle) {
            nextSequence = [...accumulator.sequence, elementValue];
        } else {
            const lastStoredElement = accumulator.sequence[accumulator.sequence.length - 1];
            if (lastStoredElement === elementValue) {
                nextSequence = [...accumulator.sequence, elementValue];
            } else {
                nextSequence = Array(position + 1).fill(elementValue);
            }
        }
        return { sequence: nextSequence, stateToggle: nextStateToggle };
    }, { sequence: [], stateToggle: false });

    const processedSequence = finalState.sequence;
    const zeroTally = processedSequence.filter(val => val === 0).length;
    return zeroTally;
}

const allZeroCounts = processInputSequence(numericEntries, 0);
allZeroCounts.forEach(count => console.log(count));