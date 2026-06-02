const fileSystem = require('fs');
const standardInputPath = '/dev/stdin';

let comparisonCount = 0;

const assignMergedValue = (targetArr, mainIdx, sourceArr, sourcePtr) => {
    targetArr[mainIdx] = sourceArr[sourcePtr];
    return sourcePtr + 1;
};

const performMerge = (targetArray, startIndex, middleIndex, endIndex) => {
    const leftSubarraySize = middleIndex - startIndex;
    const rightSubarraySize = endIndex - middleIndex;

    const leftTempArray = new Array(leftSubarraySize + 1);
    const rightTempArray = new Array(rightSubarraySize + 1);

    for (let i = 0; i < leftSubarraySize; i++) {
        leftTempArray[i] = targetArray[startIndex + i];
    }
    for (let i = 0; i < rightSubarraySize; i++) {
        rightTempArray[i] = targetArray[middleIndex + i];
    }

    leftTempArray[leftSubarraySize] = Infinity;
    rightTempArray[rightSubarraySize] = Infinity;

    let leftPtr = 0;
    let rightPtr = 0;

    for (let mainPtr = startIndex; mainPtr < endIndex; mainPtr++) {
        comparisonCount++;
        if (leftTempArray[leftPtr] <= rightTempArray[rightPtr]) {
            leftPtr = assignMergedValue(targetArray, mainPtr, leftTempArray, leftPtr);
        } else {
            rightPtr = assignMergedValue(targetArray, mainPtr, rightTempArray, rightPtr);
        }
    }
};

const mergeSortRecursive = (targetArray, startIndex, endIndex) => {
    if (!(startIndex + 1 < endIndex)) {
        return;
    }

    const divisionFactor = 2;
    const middleIndex = Math.floor((startIndex + endIndex) / divisionFactor);

    mergeSortRecursive(targetArray, startIndex, middleIndex);
    mergeSortRecursive(targetArray, middleIndex, endIndex);
    performMerge(targetArray, startIndex, middleIndex, endIndex);
};

const readAndParseInput = (filePath, lineIdx) => {
    const rawInput = fileSystem.readFileSync(filePath, 'utf-8');
    const allLines = rawInput.split('\n');
    const dataString = allLines[lineIdx];
    return dataString.split(' ').map(Number);
};

(function executeSortProcess() {
    const dataLineToProcess = 1;
    const numericData = readAndParseInput(standardInputPath, dataLineToProcess);

    mergeSortRecursive(numericData, 0, numericData.length);

    console.log(numericData.join(' '));
    console.log(comparisonCount);
})();
