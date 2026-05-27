"use strict"

const fileSystemModule = require('fs');
const standardInputFilePath = '/dev/stdin';

function retrieveInputLines(path) {
    const fileContentBuffer = fileSystemModule.readFileSync(path, 'UTF-8');
    return fileContentBuffer.split('\n');
}

const allInputLines = retrieveInputLines(standardInputFilePath);

const firstInputLine = allInputLines[0];
const secondInputLine = allInputLines[1];

const arraySize = parseInt(firstInputLine);
const dataArray = secondInputLine.split(' ').map(numericString => parseInt(numericString));

const maximumIndexValue = arraySize;
for (let currentOuterIndex = 1; currentOuterIndex < maximumIndexValue; currentOuterIndex++) {
    const zeroBasedOuterIndex = currentOuterIndex - 1;
    for (let currentInnerIndex = currentOuterIndex + 1; currentInnerIndex <= maximumIndexValue; currentInnerIndex++) {
        if (currentInnerIndex % currentOuterIndex === 0) {
            const zeroBasedInnerIndex = currentInnerIndex - 1;
            dataArray[zeroBasedOuterIndex] ^= dataArray[zeroBasedInnerIndex];
        }
    }
}

const elementsEqualToOne = [];
const dataArrayLength = dataArray.length;
for (let k = 0; k < dataArrayLength; k++) {
    const currentElement = dataArray[k];
    if (currentElement === 1) {
        elementsEqualToOne.push(currentElement);
    }
}

const countOfOnes = elementsEqualToOne.length;
console.log(countOfOnes);

if (countOfOnes > 0) {
    const outputSeparator = ' ';
    const joinedOutput = elementsEqualToOne.join(outputSeparator);
    console.log(joinedOutput);
}
