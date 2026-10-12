'use strict';

const fileSystem = require('fs');
const inputLines = fileSystem.readFileSync('/dev/stdin', 'utf8').trim().split('\n');

const elementCount = Number(inputLines[0]);
const valueStrings = inputLines[1].split(' ');

const valuePositions = Array(elementCount);
valueStrings.forEach((valStr, originalIdx) => {
    valuePositions[Number(valStr) - 1] = originalIdx;
});

let totalAccumulator = 0;

function processSegment(segmentStart, segmentEnd, minValSearchIndex) {
    if (segmentStart > segmentEnd) {
        return;
    }

    let currentSearchPointer = minValSearchIndex;
    while (valuePositions[currentSearchPointer] < segmentStart || valuePositions[currentSearchPointer] > segmentEnd) {
        currentSearchPointer++;
    }

    const currentMinElementPosition = valuePositions[currentSearchPointer];
    const currentMinValue = Number(valueStrings[currentMinElementPosition]);

    totalAccumulator += currentMinValue * (currentMinElementPosition - segmentStart + 1) * (segmentEnd - currentMinElementPosition + 1);

    if (segmentStart <= currentMinElementPosition - 1) {
        processSegment(segmentStart, currentMinElementPosition - 1, currentSearchPointer + 1);
    }

    if (currentMinElementPosition + 1 <= segmentEnd) {
        processSegment(currentMinElementPosition + 1, segmentEnd, currentSearchPointer + 1);
    }
}

processSegment(0, elementCount - 1, 0);

console.log(totalAccumulator);
