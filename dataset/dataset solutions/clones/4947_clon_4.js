'use strict';

let finalAccumulator = 0;
let valueToPositionMap = [];

function processSegment(p1, p2, p3) {
    if (p1 > p2) {
        return;
    }

    let currentSearchValue = p3;
    while (valueToPositionMap[currentSearchValue] < p1 || valueToPositionMap[currentSearchValue] > p2) {
        currentSearchValue++;
    }

    let currentMinPosition = valueToPositionMap[currentSearchValue];
    let currentMinValue = sourceValues[currentMinPosition];

    finalAccumulator += currentMinValue * (currentMinPosition - p1 + 1) * (p2 - currentMinPosition + 1);

    processSegment(p1, currentMinPosition - 1, currentSearchValue + 1);
    processSegment(currentMinPosition + 1, p2, currentSearchValue + 1);
}

const inputLines = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n');

const arrayLength = +inputLines[0];
const sourceValues = inputLines[1].split(' ').map(Number);

for (let i = 0; i < arrayLength; i++) {
    valueToPositionMap[sourceValues[i]] = i;
}

processSegment(0, arrayLength - 1, 1);

console.log(finalAccumulator);