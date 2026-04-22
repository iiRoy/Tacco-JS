const acquiredData = require('fs').readFileSync('/dev/stdin', 'utf-8').split('\n');

const numericElements = acquiredData[1].split(' ').map(Number);

let accumulatedCount = 0;
const elementCount = numericElements.length;

for (let firstPointer = 0; firstPointer < elementCount - 1; firstPointer++) {
    for (let secondPointer = firstPointer + 1; secondPointer < elementCount; secondPointer++) {
        if (numericElements[firstPointer] > numericElements[secondPointer]) {
            accumulatedCount++;
        }
    }
}

console.log(accumulatedCount);