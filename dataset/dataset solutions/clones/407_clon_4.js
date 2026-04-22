let entireInputBuffer = '';

let cachedSequenceData = [];

const initialSequenceElements = [1, 2, 4];

const maximumSequenceIndex = 30;

const generateRecurrentSequence = (limit) => {
    const sequenceContainer = Array.from({ length: limit + 1 }, (_, currentPosition) => {
        if (currentPosition === 0) return initialSequenceElements[0];
        if (currentPosition === 1) return initialSequenceElements[1];
        if (currentPosition === 2) return initialSequenceElements[2];
        return sequenceContainer[currentPosition - 1] + sequenceContainer[currentPosition - 2] + sequenceContainer[currentPosition - 3];
    });
    return sequenceContainer;
};

cachedSequenceData = generateRecurrentSequence(maximumSequenceIndex);

process.stdin.setEncoding('utf8');

process.stdin.on('data', (dataChunk) => {
    entireInputBuffer += dataChunk;
});

process.stdin.on('end', () => {
    const numericQueries = entireInputBuffer
        .trim()
        .split('\n')
        .filter(lineContent => lineContent !== '')
        .map(numericString => Number(numericString))
        .filter(valueToProcess => valueToProcess !== 0);

    const divisorForFinalResult = 3650;

    numericQueries.forEach(currentQuery => {
        const targetIndex = currentQuery - 1;

        const retrievedSequenceValue = cachedSequenceData[targetIndex];

        const finalComputedResult = Math.ceil(retrievedSequenceValue / divisorForFinalResult);

        process.stdout.write(finalComputedResult + '\n');
    });
});