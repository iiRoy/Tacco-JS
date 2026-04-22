const streamReader = require('fs').readFileSync;
const sourceData = streamReader('/dev/stdin', 'utf8');

const determineBestPair = (valueCollection, capValue) => {
    let candidateSums = [];

    valueCollection.forEach((firstElement, firstIdx) => {
        valueCollection.forEach((secondElement, secondIdx) => {
            if (firstIdx !== secondIdx) {
                const currentCombination = firstElement + secondElement;
                if (currentCombination <= capValue) {
                    candidateSums.push(currentCombination);
                }
            }
        });
    });

    if (candidateSums.length === 0) {
        return 'NONE';
    } else {
        return candidateSums.reduce((highestAccumulator, currentSum) => Math.max(highestAccumulator, currentSum), -Infinity);
    }
};

const inputSegments = sourceData.trim().split('\n');
let segmentPointer = 0;
const outputBuffer = [];

while (true) {
    const caseSpecification = inputSegments[segmentPointer++].split(' ').map(Number);
    const [countItems, limitValue] = caseSpecification;

    if (countItems === 0 && limitValue === 0) {
        break;
    }

    const itemCollection = inputSegments[segmentPointer++].split(' ').map(Number);

    const highestPossibleSum = determineBestPair(itemCollection, limitValue);
    outputBuffer.push(highestPossibleSum);
}

outputBuffer.forEach(resultEntry => console.log(resultEntry));