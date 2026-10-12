const fs = require('fs');
const rawInputContent = fs.readFileSync('/dev/stdin', 'utf8');
const inputLines = rawInputContent.trim().split('\n');

const totalEntries = Number(inputLines.shift());

const processedSegments = inputLines.slice(0, totalEntries).reduce((accumulatorState, currentInputLine) => {
    const [symbolIdentifier, numericValueString] = currentInputLine.split(' ');
    const numericValue = Number(numericValueString);

    if (accumulatorState.lastProcessedSymbol === symbolIdentifier) {
        accumulatorState.resultSequence[accumulatorState.resultSequence.length - 1] += numericValue;
    } else {
        accumulatorState.resultSequence.push(symbolIdentifier, numericValue);
        accumulatorState.lastProcessedSymbol = symbolIdentifier;
    }
    return accumulatorState;
}, { resultSequence: [], lastProcessedSymbol: null });

const finalAggregatedSequence = processedSegments.resultSequence;

function* sequenceChunker(sourceCollection, chunkSize) {
    let currentIndex = 0;
    while (currentIndex < sourceCollection.length) {
        yield sourceCollection.slice(currentIndex, currentIndex + chunkSize);
        currentIndex += chunkSize;
    }
}

const isSequenceValid = Array.from(sequenceChunker(finalAggregatedSequence, 4)).every(currentChunk => {
    const [openingSymbol, firstNumericComponent, closingSymbol, secondNumericComponent] = currentChunk;
    return openingSymbol === '(' && closingSymbol === ')' && firstNumericComponent === secondNumericComponent;
});

if (!isSequenceValid) {
    console.log("NO");
} else {
    console.log("YES");
}
