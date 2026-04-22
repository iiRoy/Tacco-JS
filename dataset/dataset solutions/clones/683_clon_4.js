const fileSystem = require('fs');
const rawContent = fileSystem.readFileSync(0, 'utf8');
const lineSet = rawContent.trim().split('\n');
let currentReadIndex = 0;
const processedOutcomes = [];

function analyzeNumericSequence(sequenceParts, targetValue) {
    const memberCount = sequenceParts[0];
    const thresholdSum = sequenceParts[1];

    if (memberCount === 0 && thresholdSum === 0) {
        return null;
    }

    const dataCollection = targetValue.map(Number);
    dataCollection.sort((firstElement, secondElement) => firstElement - secondElement);

    let foundPairs = 0;
    let leftBoundary = 0;
    let rightBoundary = memberCount - 1;

    while (leftBoundary < rightBoundary) {
        if (dataCollection[leftBoundary] + dataCollection[rightBoundary] > thresholdSum) {
            foundPairs += (rightBoundary - leftBoundary);
            rightBoundary--;
        } else {
            leftBoundary++;
        }
    }
    return foundPairs;
}

while (true) {
    const headerParts = lineSet[currentReadIndex].split(' ').map(Number);
    const numElements = headerParts[0];
    const sumThreshold = headerParts[1];

    if (numElements === 0 && sumThreshold === 0) {
        break;
    }

    const elementsForCase = lineSet.slice(currentReadIndex + 1, currentReadIndex + 1 + numElements);
    const result = analyzeNumericSequence(headerParts, elementsForCase);
    processedOutcomes.push(result);
    currentReadIndex += numElements + 1;
}

processedOutcomes.forEach(outcome => console.log(outcome));