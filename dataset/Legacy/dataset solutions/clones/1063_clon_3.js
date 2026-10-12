const inputLines = require('fs').readFileSync('/dev/stdin', 'utf-8').split('\n');

let inversionCount = 0;

const SENTINEL_VALUE = Infinity;

const fillAndSentinelize = (sourceArray, sourceOffset, targetArray, elementCount) => {
    for (let idx = 0; idx < elementCount; idx++) {
        targetArray[idx] = sourceArray[sourceOffset + idx];
    }
    targetArray[elementCount] = SENTINEL_VALUE;
};

const performMerge = (dataArray, startIndex, middleIndex, endIndex) => {
    const leftSubarraySize = middleIndex - startIndex;
    const rightSubarraySize = endIndex - middleIndex;

    const leftTempArray = [];
    const rightTempArray = [];

    fillAndSentinelize(dataArray, startIndex, leftTempArray, leftSubarraySize);
    fillAndSentinelize(dataArray, middleIndex, rightTempArray, rightSubarraySize);

    let leftPointer = 0;
    let rightPointer = 0;
    let mainArrayPointer = startIndex;

    while (mainArrayPointer < endIndex) {
        if (leftTempArray[leftPointer] <= rightTempArray[rightPointer]) {
            dataArray[mainArrayPointer] = leftTempArray[leftPointer];
            leftPointer++;
        } else {
            dataArray[mainArrayPointer] = rightTempArray[rightPointer];
            rightPointer++;
            const currentInversionContribution = leftSubarraySize - leftPointer;
            inversionCount += currentInversionContribution;
        }
        mainArrayPointer++;
    }
};

const mergeSortAlgorithm = (dataArray, startIndex, endIndex) => {
    if (startIndex + 1 >= endIndex) {
        return;
    }

    const middleIndex = startIndex + Math.floor((endIndex - startIndex) / 2);
    mergeSortAlgorithm(dataArray, startIndex, middleIndex);
    mergeSortAlgorithm(dataArray, middleIndex, endIndex);
    performMerge(dataArray, startIndex, middleIndex, endIndex);
};

const numericData = inputLines[1].split(' ').map(Number);
mergeSortAlgorithm(numericData, 0, numericData.length);
console.log(inversionCount);
