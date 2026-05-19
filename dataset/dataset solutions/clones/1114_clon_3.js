const fileSystem = require('fs');

function retrieveInputData() {
    const rawContent = fileSystem.readFileSync('/dev/stdin', 'utf8').trim();
    return rawContent.split('\n');
}

function performHeapifyDown(heapElements, currentHeapSize, rootIndex) {
    let leftChildIdx = 2 * rootIndex + 1;
    let rightChildIdx = 2 * rootIndex + 2;
    let largestIdx = rootIndex;

    if (leftChildIdx < currentHeapSize && heapElements[leftChildIdx] > heapElements[largestIdx]) {
        largestIdx = leftChildIdx;
    }

    if (rightChildIdx < currentHeapSize && heapElements[rightChildIdx] > heapElements[largestIdx]) {
        largestIdx = rightChildIdx;
    }

    if (largestIdx !== rootIndex) {
        [heapElements[rootIndex], heapElements[largestIdx]] = [heapElements[largestIdx], heapElements[rootIndex]];
        performHeapifyDown(heapElements, currentHeapSize, largestIdx);
    }
}

function constructMaxHeap(elementsArray, totalElements) {
    const startingIndexForHeapBuild = totalElements << 1;
    for (let currentIterationIndex = startingIndexForHeapBuild; currentIterationIndex >= 0; currentIterationIndex--) {
        performHeapifyDown(elementsArray, totalElements, currentIterationIndex);
    }
}

function formatArrayForOutput(outputArray) {
    return outputArray.map(item => ` ${item}`).join('');
}

(function executeHeapProcess() {
    const inputLines = retrieveInputData();
    const numberOfElements = Number(inputLines.shift());
    const dataValues = inputLines.shift().split(' ').map(Number);

    constructMaxHeap(dataValues, numberOfElements);

    console.log(formatArrayForOutput(dataValues));
})();
