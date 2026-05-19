const inputContent = require('fs').readFileSync('/dev/stdin', 'utf8');
const parsedNumbers = inputContent.trim().split("\n").map(Number);

const sequenceLengthIndicator = parsedNumbers.shift();
const numericSequence = parsedNumbers;

const smallestTailValues = [];

function findInsertionPoint(collection, targetValue) {
    let lowerBound = 0;
    let upperBound = collection.length;
    while (lowerBound < upperBound) {
        const midPoint = Math.floor((lowerBound + upperBound) / 2);
        if (collection[midPoint] < targetValue) {
            lowerBound = midPoint + 1;
        } else {
            upperBound = midPoint;
        }
    }
    return lowerBound;
}

for (const currentElement of numericSequence) {
    if (smallestTailValues.length === 0 || currentElement > smallestTailValues[smallestTailValues.length - 1]) {
        smallestTailValues.push(currentElement);
    } else {
        const insertionIndex = findInsertionPoint(smallestTailValues, currentElement);
        smallestTailValues[insertionIndex] = currentElement;
    }
}

console.log(smallestTailValues.length);
