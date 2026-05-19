let comparisonTally = 0;

const combineSegments = (targetArray, segmentStart, segmentMiddle, segmentEnd) => {
    const tempMerged = new Array(segmentEnd - segmentStart);
    let leftPointer = segmentStart;
    let rightPointer = segmentMiddle;
    let tempIndex = 0;

    while (leftPointer < segmentMiddle && rightPointer < segmentEnd) {
        comparisonTally++;
        if (targetArray[leftPointer] <= targetArray[rightPointer]) {
            tempMerged[tempIndex] = targetArray[leftPointer];
            leftPointer++;
        } else {
            tempMerged[tempIndex] = targetArray[rightPointer];
            rightPointer++;
        }
        tempIndex++;
    }

    while (leftPointer < segmentMiddle) {
        tempMerged[tempIndex] = targetArray[leftPointer];
        leftPointer++;
        tempIndex++;
        comparisonTally++;
    }

    while (rightPointer < segmentEnd) {
        tempMerged[tempIndex] = targetArray[rightPointer];
        rightPointer++;
        tempIndex++;
        comparisonTally++;
    }

    for (let i = 0; i < tempMerged.length; i++) {
        targetArray[segmentStart + i] = tempMerged[i];
    }
};

const sortSequence = (inputArray) => {
    const totalLength = inputArray.length;
    let currentBlockSize = 1;

    while (currentBlockSize < totalLength) {
        let currentLeftBoundary = 0;
        while (currentLeftBoundary < totalLength - currentBlockSize) {
            const currentMiddleBoundary = currentLeftBoundary + currentBlockSize;
            const currentRightBoundary = Math.min(currentLeftBoundary + 2 * currentBlockSize, totalLength);

            combineSegments(inputArray, currentLeftBoundary, currentMiddleBoundary, currentRightBoundary);

            currentLeftBoundary += 2 * currentBlockSize;
        }
        currentBlockSize *= 2;
    }
};

const inputLines = require('fs').readFileSync('/dev/stdin', 'utf-8').split('\n');
const numericValues = inputLines[1].split(' ').map(Number);

sortSequence(numericValues);

console.log(numericValues.join(' '));
console.log(comparisonTally);
