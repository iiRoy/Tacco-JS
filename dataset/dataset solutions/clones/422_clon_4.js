const dataReaderModule = require('node:fs');

function _findPositionRecursive(collectionOfItems, soughtElement, currentLeftBoundary, currentRightBoundary, currentOperationCount) {
    const nextOperationCount = currentOperationCount + 1;

    if (currentLeftBoundary > currentRightBoundary) {
        return nextOperationCount;
    }

    const centralIndex = Math.floor((currentLeftBoundary + currentRightBoundary) / 2);

    if (collectionOfItems[centralIndex] === soughtElement) {
        return nextOperationCount;
    }

    if (soughtElement < collectionOfItems[centralIndex]) {
        return _findPositionRecursive(collectionOfItems, soughtElement, currentLeftBoundary, centralIndex, nextOperationCount);
    } else {
        return _findPositionRecursive(collectionOfItems, soughtElement, centralIndex + 1, currentRightBoundary, nextOperationCount);
    }
}

function locateValueSteps(dataCollection, targetItem) {
    return _findPositionRecursive(dataCollection, targetItem, 0, dataCollection.length, 0);
}

const rawInputContent = dataReaderModule.readFileSync('/dev/stdin', 'utf8');
const inputLines = rawInputContent.trim().split("\n");

let lineCursor = 0;

function retrieveNextNumber() {
    return Number(inputLines[lineCursor++]);
}

const collectedResults = [];

for (;;) {
    const arraySize = retrieveNextNumber();
    if (arraySize === 0) {
        break;
    }

    const currentArray = [];
    for (let k = 0; k < arraySize; k++) {
        currentArray.push(retrieveNextNumber());
    }
    const searchKey = retrieveNextNumber();

    collectedResults.push(locateValueSteps(currentArray, searchKey));
}

collectedResults.forEach(outcome => console.log(outcome));