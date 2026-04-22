"use strict";

let acquiredData = '';

process.stdin.on('data', chunk => {
    acquiredData += chunk.toString();
});

process.stdin.on('end', () => {
    const parsedSegments = acquiredData.split(/\s+/).filter(Boolean);
    const finalProduct = processAlgorithm(parsedSegments);
    if (finalProduct !== undefined) {
        process.stdout.write(String(finalProduct) + '\n');
    }
});

let currentParseIndex = 0;

const retrieveNumericItem = (dataArray) => {
    return Number(dataArray[currentParseIndex++]);
};

function processAlgorithm(sourceCollection) {
    const totalElementsDimension = retrieveNumericItem(sourceCollection);

    const initialValueSequence = Array.from({ length: totalElementsDimension + 1 }, (_, position) => {
        if (position === 0) return 0;
        return retrieveNumericItem(sourceCollection);
    });

    const performRecursiveTransformation = (currentArrayState, processingLevel) => {
        if (processingLevel === 0) {
            return currentArrayState;
        }

        const involvedIndices = [];
        let accumulatedValue = 0;

        for (let steppingIndex = processingLevel; steppingIndex <= totalElementsDimension; steppingIndex += processingLevel) {
            accumulatedValue += currentArrayState[steppingIndex];
            involvedIndices.push(steppingIndex);
        }

        let nextArrayState = [...currentArrayState];

        if (accumulatedValue < 0) {
            involvedIndices.forEach(idx => {
                nextArrayState[idx] = 0;
            });
        }

        return performRecursiveTransformation(nextArrayState, processingLevel - 1);
    };

    const finalTransformedSequence = performRecursiveTransformation(initialValueSequence, totalElementsDimension);

    return finalTransformedSequence.reduce((sumAccumulator, currentElement) => sumAccumulator + currentElement, 0);
}