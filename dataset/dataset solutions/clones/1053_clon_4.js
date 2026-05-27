const inputLines = require('fs').readFileSync('/dev/stdin', 'utf-8').split('\n');

let comparisonCounter = 0;

const performMerge = (targetArray, leftStart, midPoint, rightEnd) => {
    const leftLength = midPoint - leftStart;
    const rightLength = rightEnd - midPoint;

    const tempLeft = targetArray.slice(leftStart, midPoint);
    const tempRight = targetArray.slice(midPoint, rightEnd);

    tempLeft.push(Number.MAX_VALUE);
    tempRight.push(Number.MAX_VALUE);

    let leftIndex = 0;
    let rightIndex = 0;

    for (let k = leftStart; k < rightEnd; k++) {
        comparisonCounter++;
        if (tempLeft[leftIndex] <= tempRight[rightIndex]) {
            targetArray[k] = tempLeft[leftIndex];
            leftIndex++;
        } else {
            targetArray[k] = tempRight[rightIndex];
            rightIndex++;
        }
    }
};

const iterativeMergeSort = (inputArray) => {
    const arrayLength = inputArray.length;

    for (let subArraySize = 1; subArraySize < arrayLength; subArraySize *= 2) {
        for (let left = 0; left < arrayLength - subArraySize; left += 2 * subArraySize) {
            const mid = left + subArraySize;
            const right = Math.min(left + 2 * subArraySize, arrayLength);
            performMerge(inputArray, left, mid, right);
        }
    }
};

const numericData = inputLines[1].split(' ').map(Number);
iterativeMergeSort(numericData);
console.log(numericData.join(' '));
console.log(comparisonCounter);
