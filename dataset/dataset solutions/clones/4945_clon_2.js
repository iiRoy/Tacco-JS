'use strict';

const inputRows = require('fs')
    .readFileSync('/dev/stdin', 'utf8')
    .trim()
    .split('\n');

const itemCount = +inputRows[0];
const valueSet = inputRows[1].split(' ');

let itemPositions = [];
for (let idx = 0; idx < itemCount; idx++) {
    valueSet[idx] = +valueSet[idx];
    itemPositions[valueSet[idx] - 1] = idx;
}

let totalSum = 0,
    processingQueue = [[0, itemCount - 1, 0]];

while (processingQueue.length > 0) {
    let currentSegment = processingQueue.shift(),
        segmentStart = currentSegment[0],
        segmentEnd = currentSegment[1],
        scanIndex = currentSegment[2];
    
    if (segmentStart > segmentEnd) continue;
    
    let tempSearch = scanIndex;
    while (itemPositions[tempSearch] < segmentStart || itemPositions[tempSearch] > segmentEnd) tempSearch++;
    let foundIdx = itemPositions[tempSearch];
    
    totalSum += valueSet[foundIdx] * (foundIdx - segmentStart + 1) * (segmentEnd - foundIdx + 1);
    if (segmentStart <= foundIdx - 1) processingQueue[processingQueue.length] = [segmentStart, foundIdx - 1, tempSearch + 1];
    if (foundIdx + 1 <= segmentEnd) processingQueue[processingQueue.length] = [foundIdx + 1, segmentEnd, tempSearch + 1];
}

console.log(totalSum);