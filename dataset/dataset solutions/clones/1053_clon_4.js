const inputDataLines = require('fs').readFileSync('/dev/stdin', 'utf-8').split('\n');

const operationCounter = { tally: 0 };

const combineSegments = (targetArray, firstIndex, middleIndex, lastIndex, operationCounterRef) => {
    const segmentOneLength = middleIndex - firstIndex;
    const segmentTwoLength = lastIndex - middleIndex;
    const tempOne = [];
    const tempTwo = [];

    for (let idx = 0; idx < segmentOneLength; idx++) {
        tempOne[idx] = targetArray[firstIndex + idx];
    }
    for (let idx = 0; idx < segmentTwoLength; idx++) {
        tempTwo[idx] = targetArray[middleIndex + idx];
    }

    tempOne[segmentOneLength] = Number.MAX_VALUE;
    tempTwo[segmentTwoLength] = Number.MAX_VALUE;

    let pointerOne = 0;
    let pointerTwo = 0;
    for (let currentTargetIdx = firstIndex; currentTargetIdx < lastIndex; currentTargetIdx++) {
        operationCounterRef.tally++;
        if (tempOne[pointerOne] <= tempTwo[pointerTwo]) {
            targetArray[currentTargetIdx] = tempOne[pointerOne];
            pointerOne++;
        } else {
            targetArray[currentTargetIdx] = tempTwo[pointerTwo];
            pointerTwo++;
        }
    }
};

const sortArrayIteratively = (collection, totalOps) => {
    const arraySize = collection.length;
    for (let currentSize = 1; currentSize < arraySize; currentSize *= 2) {
        for (let leftStart = 0; leftStart < arraySize - currentSize; leftStart += 2 * currentSize) {
            const midPoint = leftStart + currentSize;
            const rightEnd = Math.min(leftStart + 2 * currentSize, arraySize);
            combineSegments(collection, leftStart, midPoint, rightEnd, totalOps);
        }
    }
};

const numericValues = inputDataLines[1].split(' ').map(Number);
sortArrayIteratively(numericValues, operationCounter);
console.log(numericValues.join(' '));
console.log(operationCounter.tally);