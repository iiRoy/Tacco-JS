'use strict';

const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8').trim();
const inputLines = fileContent.split('\n');

const arraySize = parseInt(inputLines[0], 10);
const rawDataElements = inputLines[1].split(' ');

const convertToNumbers = (strArr) => strArr.map(Number);
const dataArray = convertToNumbers(rawDataElements);

const buildValueIndexMap = (arr, size) => {
    const map = new Array(size);
    for (let k = 0; k < size; k++) {
        map[arr[k] - 1] = k;
    }
    return map;
};
const valueToOriginalIndexMap = buildValueIndexMap(dataArray, arraySize);

let totalSum = 0;
let processingQueue = [[0, arraySize - 1, 0]];

const findMinElementIndexInMap = (map, rangeStart, rangeEnd, currentMinSearchPos) => {
    let searchIterator = currentMinSearchPos;
    while (map[searchIterator] < rangeStart || map[searchIterator] > rangeEnd) {
        searchIterator++;
    }
    return { actualIndex: map[searchIterator], nextSearchPos: searchIterator + 1 };
};

while (processingQueue.length > 0) {
    const [rangeStart, rangeEnd, minCandidateValueIndex] = processingQueue.shift();
    
    if (rangeStart > rangeEnd) {
        continue;
    }

    const { actualIndex: actualMinElementIndex, nextSearchPos: nextMinSearchPosition } = 
        findMinElementIndexInMap(valueToOriginalIndexMap, rangeStart, rangeEnd, minCandidateValueIndex);
    
    const leftSubarrayLength = actualMinElementIndex - rangeStart + 1;
    const rightSubarrayLength = rangeEnd - actualMinElementIndex + 1;
    const currentElementValue = dataArray[actualMinElementIndex];

    totalSum += currentElementValue * leftSubarrayLength * rightSubarrayLength;
    
    const leftSubRangeEnd = actualMinElementIndex - 1;
    if (rangeStart <= leftSubRangeEnd) {
        processingQueue.push([rangeStart, leftSubRangeEnd, nextMinSearchPosition]);
    }

    const rightSubRangeStart = actualMinElementIndex + 1;
    if (rightSubRangeStart <= rangeEnd) {
        processingQueue.push([rightSubRangeStart, rangeEnd, nextMinSearchPosition]);
    }
}

console.log(totalSum);
