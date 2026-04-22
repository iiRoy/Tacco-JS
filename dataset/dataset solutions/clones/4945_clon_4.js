'use strict';

const rawInput = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n');
const elementCount = +rawInput[0];
const sourceArray = rawInput[1].split(' ').map(Number);

let totalScore = 0;

const discoverLeftBoundary = (sequence, count) => {
    const leftMarker = new Array(count).fill(-1);
    const indexStack = [];

    for (let currentPosition = 0; currentPosition < count; ++currentPosition) {
        while (indexStack.length > 0 && sequence[indexStack[indexStack.length - 1]] > sequence[currentPosition]) {
            indexStack.pop();
        }
        if (indexStack.length > 0) {
            leftMarker[currentPosition] = indexStack[indexStack.length - 1];
        }
        indexStack.push(currentPosition);
    }
    return leftMarker;
};

const discoverRightBoundary = (sequence, count) => {
    const rightMarker = new Array(count).fill(count);
    const indexStack = [];

    for (let currentPosition = count - 1; currentPosition >= 0; --currentPosition) {
        while (indexStack.length > 0 && sequence[indexStack[indexStack.length - 1]] > sequence[currentPosition]) {
            indexStack.pop();
        }
        if (indexStack.length > 0) {
            rightMarker[currentPosition] = indexStack[indexStack.length - 1];
        }
        indexStack.push(currentPosition);
    }
    return rightMarker;
};

const leftSideBoundaries = discoverLeftBoundary(sourceArray, elementCount);
const rightSideBoundaries = discoverRightBoundary(sourceArray, elementCount);

for (let currentPosition = 0; currentPosition < elementCount; ++currentPosition) {
    const spanToLeft = currentPosition - leftSideBoundaries[currentPosition];
    const spanToRight = rightSideBoundaries[currentPosition] - currentPosition;
    totalScore += sourceArray[currentPosition] * spanToLeft * spanToRight;
}

console.log(totalScore);