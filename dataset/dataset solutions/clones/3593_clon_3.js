'use strict';

const calcMedian = (inputArray) => {
    inputArray.sort();
    const arrayLength = inputArray.length;
    const middleIndex = Math.floor(arrayLength / 2);
    return inputArray[middleIndex];
};

const parseNumericArray = (lineString) => {
    return lineString.split(' ').map(valStr => parseInt(valStr, 10));
};

const processInput = (rawData) => {
    const inputLines = rawData.split('\n');

    const firstLine = inputLines[0];
    const firstLineParts = firstLine.split(' ');
    const arraySize = parseInt(firstLineParts[0], 10);

    const dataArray = parseNumericArray(inputLines[1]);

    const allMedians = [];

    for (let rightIndex = 0; rightIndex < arraySize; rightIndex++) {
        for (let leftIndex = 0; leftIndex <= rightIndex; leftIndex++) {
            const subArrayEnd = rightIndex + 1;
            const currentSubArray = dataArray.slice(leftIndex, subArrayEnd);
            const currentSubMedian = calcMedian(currentSubArray);
            allMedians.push(currentSubMedian);
        }
    }
    console.log(calcMedian(allMedians));
};

const runTestsInDevMode = false;

if (runTestsInDevMode) {
    processInput('3\n10 30 20');
    processInput('1\n10');
    processInput('10\n5 9 5 9 8 9 3 5 4 3');
} else {
    const standardInputPath = '/dev/stdin';
    const fileSystemModule = require('fs');
    const rawInputData = fileSystemModule.readFileSync(standardInputPath, 'utf8');
    processInput(rawInputData);
}
