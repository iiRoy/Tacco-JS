const exchangeElements = (arrangement, firstIdx, secondIdx) => {
    [arrangement[firstIdx], arrangement[secondIdx]] = [arrangement[secondIdx], arrangement[firstIdx]];
};

const ascendElement = (collection, currentPos, comparator) => {
    let childPosition = currentPos;
    let parentPosition = Math.floor((childPosition - 1) / 2);

    while (childPosition > 0 && comparator(collection[childPosition], collection[parentPosition])) {
        exchangeElements(collection, childPosition, parentPosition);
        childPosition = parentPosition;
        parentPosition = Math.floor((childPosition - 1) / 2);
    }
};

const descendElement = (collection, currentPos, currentSize, comparator) => {
    let primary = currentPos;
    let leftChild = 2 * currentPos + 1;
    let rightChild = 2 * currentPos + 2;

    if (leftChild < currentSize && comparator(collection[leftChild], collection[primary])) {
        primary = leftChild;
    }

    if (rightChild < currentSize && comparator(collection[rightChild], collection[primary])) {
        primary = rightChild;
    }

    if (primary !== currentPos) {
        exchangeElements(collection, currentPos, primary);
        descendElement(collection, primary, currentSize, comparator);
    }
};

const initializeStructure = (sourceArray, comparator) => {
    let resultCollection = [...sourceArray];
    const structureSize = resultCollection.length;
    for (let i = Math.floor(structureSize / 2) - 1; i >= 0; i--) {
        descendElement(resultCollection, i, structureSize, comparator);
    }
    return resultCollection;
};

const placeItem = (collection, item, comparator) => {
    collection.push(item);
    ascendElement(collection, collection.length - 1, comparator);
};

const retrieveTop = (collection, comparator) => {
    const structureSize = collection.length;
    if (structureSize === 0) {
        return undefined;
    }
    if (structureSize === 1) {
        return collection.pop();
    }

    const topValue = collection[0];
    collection[0] = collection.pop();
    descendElement(collection, 0, collection.length, comparator);

    return topValue;
};


const incomingData = require('fs').readFileSync('/dev/stdin', 'utf8');
const entryRecords = incomingData.split('\n');

const firstLineComponents = entryRecords.shift().split(' ');
const elementCount = parseInt(firstLineComponents[0], 10);
const operationCycles = parseInt(firstLineComponents[1], 10);

const initialNumericalValues = entryRecords.shift().split(' ').map(Number);

const maxComparisonLogic = (valA, valB) => valA > valB;

let managedCollection = initializeStructure(initialNumericalValues, maxComparisonLogic);

for (let cycleIndex = 0; cycleIndex < operationCycles; cycleIndex++) {
    const currentHighest = retrieveTop(managedCollection, maxComparisonLogic);
    if (currentHighest !== undefined) {
        placeItem(managedCollection, Math.floor(currentHighest / 2), maxComparisonLogic);
    }
}

const finalSummation = managedCollection.reduce((accumulator, currentElement) => accumulator + currentElement, 0);

console.log(finalSummation);