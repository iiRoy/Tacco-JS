let inversionCounter = 0;

(function executeProgram() {
    const fileSystem = require('fs');
    const inputLines = fileSystem.readFileSync('/dev/stdin', 'utf8').trim().split('\n');

    const totalElements = Number(inputLines.shift());
    let dataArray = inputLines.shift().split(' ').map(Number);

    performMergeSort(dataArray, totalElements);

    console.log(inversionCounter);
})();

function combineSegments(dataArray, startIdx, middleIdx, endIdx) {
    let temporaryStorage = [];
    temporaryStorage.length = endIdx - startIdx + 1;

    let leftPointer = startIdx;
    let rightPointer = middleIdx + 1;
    let tempIndex = 0;

    while (leftPointer <= middleIdx && rightPointer <= endIdx) {
        if (dataArray[leftPointer] <= dataArray[rightPointer]) {
            temporaryStorage[tempIndex++] = dataArray[leftPointer++];
        } else {
            temporaryStorage[tempIndex++] = dataArray[rightPointer++];
            inversionCounter++;
        }
    }

    while (leftPointer <= middleIdx) {
        temporaryStorage[tempIndex++] = dataArray[leftPointer++];
    }

    while (rightPointer <= endIdx) {
        temporaryStorage[tempIndex++] = dataArray[rightPointer++];
    }

    for (let k = 0; k < temporaryStorage.length; k++) {
        dataArray[startIdx + k] = temporaryStorage[k];
    }
}

function performMergeSort(dataArray, totalElements) {
    let currentSegmentSize;
    let segmentStartPoint;

    for (currentSegmentSize = 1; currentSegmentSize < totalElements; currentSegmentSize *= 2) {
        for (segmentStartPoint = 0; segmentStartPoint < totalElements - currentSegmentSize; segmentStartPoint += 2 * currentSegmentSize) {
            let midPoint = segmentStartPoint + currentSegmentSize - 1;
            let segmentEndPoint = Math.min(segmentStartPoint + 2 * currentSegmentSize - 1, totalElements - 1);

            combineSegments(dataArray, segmentStartPoint, midPoint, segmentEndPoint);
        }
    }
}
