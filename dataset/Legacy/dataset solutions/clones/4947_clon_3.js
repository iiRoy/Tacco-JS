'use strict';

const inputLines = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n');
const arraySize = +inputLines[0];
const dataArray = inputLines[1].split(' ');

const valueToOriginalIndexMap = new Array(arraySize);
for (let currentIdx = 0; currentIdx < arraySize; currentIdx++) {
    const numericValue = +dataArray[currentIdx];
    valueToOriginalIndexMap[numericValue - 1] = currentIdx;
}

let totalSum = 0;
const processingQueue = [];
processingQueue.push([0, arraySize - 1, 0]); // [segmentStart, segmentEnd, currentValueIndexToSearchFrom]

while (processingQueue.length > 0) {
    const currentSegmentInfo = processingQueue.shift();
    const segmentStart = currentSegmentInfo[0];
    const segmentEnd = currentSegmentInfo[1];
    let currentValueIndexToSearchFrom = currentSegmentInfo[2];
    
    if (segmentStart === segmentEnd) {
        totalSum += +dataArray[segmentStart];
        continue;
    }
    
    let searchForValueIndex = currentValueIndexToSearchFrom;
    while (valueToOriginalIndexMap[searchForValueIndex] < segmentStart || valueToOriginalIndexMap[searchForValueIndex] > segmentEnd) {
        searchForValueIndex++;
    }
    
    const pivotIndex = valueToOriginalIndexMap[searchForValueIndex];
    const pivotValue = +dataArray[pivotIndex];
    
    const elementsToLeft = pivotIndex - segmentStart + 1;
    const elementsToRight = segmentEnd - pivotIndex + 1;
    
    totalSum += pivotValue * elementsToLeft * elementsToRight;
    
    const nextSearchValueIndex = searchForValueIndex + 1;
    
    if (segmentStart <= pivotIndex - 1) {
        processingQueue.push([segmentStart, pivotIndex - 1, nextSearchValueIndex]);
    }
    if (pivotIndex + 1 <= segmentEnd) {
        processingQueue.push([pivotIndex + 1, segmentEnd, nextSearchValueIndex]);
    }
}

console.log(totalSum);
