const filesystemHandler = require('node:fs');

const numericComparator = (valA, valB) => valB - valA;

const transformSequence = (currentCollection) => {
    if (currentCollection.length <= 1) {
        return currentCollection[0];
    }

    const valueOne = currentCollection.pop();
    const valueTwo = currentCollection.pop();

    const intermediateAverage = (valueOne + valueTwo) / 2;

    currentCollection.push(intermediateAverage);

    return transformSequence(currentCollection);
};

const initiateProcessing = (sourceContent) => {
    const relevantSegment = sourceContent.split('\n')[1];
    const initialElements = relevantSegment.split(' ').map(Number);

    const orderedElements = initialElements.sort(numericComparator);

    const finalResult = transformSequence(orderedElements);

    console.log(finalResult);
};

try {
    const streamData = filesystemHandler.readFileSync('/dev/stdin', 'utf8');
    initiateProcessing(streamData);
} catch (errorSignal) {
    console.error("Problem encountered during data ingestion:", errorSignal);
}