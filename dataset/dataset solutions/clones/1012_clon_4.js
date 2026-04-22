const dataAcquisition = require('fs').readFileSync(0, 'utf8');
const processedLines = dataAcquisition.trim().split('\n');
const elementCount = parseInt(processedLines[0], 10);
const initialItems = processedLines[1].split(' ');

const retrieveSortingKey = (itemString) => itemString.charAt(1);

const transformItem = (originalString) => ({
    sourceText: originalString,
    keyForComparison: retrieveSortingKey(originalString)
});

const executeStableOrdering = (inputItems) => {
    let workingSet = inputItems.map(transformItem);
    for (let currentPosition = 1; currentPosition < workingSet.length; currentPosition++) {
        let itemToMove = workingSet[currentPosition];
        let scanIndex = currentPosition - 1;
        while (scanIndex >= 0 && itemToMove.keyForComparison < workingSet[scanIndex].keyForComparison) {
            workingSet[scanIndex + 1] = workingSet[scanIndex];
            scanIndex--;
        }
        workingSet[scanIndex + 1] = itemToMove;
    }
    return workingSet.map(obj => obj.sourceText);
};

const firstSortedResult = executeStableOrdering(initialItems);
console.log(firstSortedResult.join(' '));
console.log('Stable');

const executeUnstableOrdering = (inputItems) => {
    let workingSet = inputItems.map(transformItem);
    let outerCursor = 0;
    while (outerCursor < workingSet.length - 1) {
        let minimumElementLocation = outerCursor;
        let innerCursor = outerCursor + 1;
        while (innerCursor < workingSet.length) {
            if (workingSet[innerCursor].keyForComparison < workingSet[minimumElementLocation].keyForComparison) {
                minimumElementLocation = innerCursor;
            }
            innerCursor++;
        }

        if (minimumElementLocation !== outerCursor) {
            let temporaryStorage = workingSet[outerCursor];
            workingSet[outerCursor] = workingSet[minimumElementLocation];
            workingSet[minimumElementLocation] = temporaryStorage;
        }
        outerCursor++;
    }
    return workingSet.map(obj => obj.sourceText);
};

const secondSortedResult = executeUnstableOrdering(initialItems);
console.log(secondSortedResult.join(' '));
console.log(firstSortedResult.join(' ') === secondSortedResult.join(' ') ? 'Stable' : 'Not stable');