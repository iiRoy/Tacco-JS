'use strict';

const inputLines = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n');
const arraySize = parseInt(inputLines[0], 10);
const dataArray = inputLines[1].split(' ');

let elementPositions = new Array(arraySize);
for (let idx = 0; idx < arraySize; idx++) {
    const currentValue = parseInt(dataArray[idx], 10);
    elementPositions[currentValue - 1] = idx;
}

let totalSum = 0;
let processingQueue = [];
processingQueue.push([0, arraySize - 1, 0]);

while (processingQueue.length > 0) {
    let currentRangeInfo = processingQueue.shift();
    let rangeStart = currentRangeInfo[0];
    let rangeEnd = currentRangeInfo[1];
    let minValIndexToConsider = currentRangeInfo[2];
    
    if (rangeStart === rangeEnd) {
        totalSum += parseInt(dataArray[rangeStart], 10);
        continue;
    }
    
    let currentMinValPosition = elementPositions[minValIndexToConsider];
    while (currentMinValPosition < rangeStart || currentMinValPosition > rangeEnd) {
        minValIndexToConsider++;
        currentMinValPosition = elementPositions[minValIndexToConsider];
    }
    let pivotPosition = currentMinValPosition;
    
    const pivotValue = parseInt(dataArray[pivotPosition], 10);
    const leftSubarrayCount = pivotPosition - rangeStart + 1;
    const rightSubarrayCount = rangeEnd - pivotPosition + 1;

    totalSum += pivotValue * leftSubarrayCount * rightSubarrayCount;

    if (rangeStart <= pivotPosition - 1) {
        processingQueue.push([rangeStart, pivotPosition - 1, minValIndexToConsider + 1]);
    }
    if (pivotPosition + 1 <= rangeEnd) {
        processingQueue.push([pivotPosition + 1, rangeEnd, minValIndexToConsider + 1]);
    }
}

console.log(totalSum);
