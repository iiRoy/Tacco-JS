process.stdin.resume();
process.stdin.setEncoding('utf8');

let accumulatedInput = '';

process.stdin.on('data', (inputChunk) => {
    accumulatedInput += inputChunk;
});

process.stdin.on('end', () => {
    const numericSequence = accumulatedInput
        .split('\n')
        .filter(Boolean)
        .map(Number);

    processAllBlocks(numericSequence);
});

const printResult = console.log;

function* blockIterator(sourceNumbers) {
    let currentPosition = 0;
    while (currentPosition < sourceNumbers.length) {
        const segmentLength = sourceNumbers[currentPosition];

        if (currentPosition + 1 >= sourceNumbers.length) {
            break;
        }

        const currentSegmentData = sourceNumbers.slice(currentPosition + 1, currentPosition + 1 + segmentLength);

        yield currentSegmentData;

        currentPosition += 1 + segmentLength;
    }
}

function calculateTrimmedMean(dataElements) {
    if (dataElements.length < 2) {
        return NaN;
    }

    const orderedElements = [...dataElements].sort((a, b) => a - b);

    const middleElements = orderedElements.slice(1, orderedElements.length - 1);

    const totalValue = middleElements.reduce((accumulatedValue, currentValue) => accumulatedValue + currentValue, 0);
    const elementCount = middleElements.length;

    if (elementCount === 0) {
        return NaN;
    }

    return Math.floor(totalValue / elementCount);
}

function processAllBlocks(numericSequence) {
    for (const segment of blockIterator(numericSequence)) {
        const result = calculateTrimmedMean(segment);
        printResult(result);
    }
}
