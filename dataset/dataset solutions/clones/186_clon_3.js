const fileSystemModule = require('fs');

function readAndSplitInput(filePath) {
    const rawContent = fileSystemModule.readFileSync(filePath, 'utf8');
    return rawContent.split('\n');
}

function compareNumbersDescending(valueA, valueB) {
    return valueB - valueA;
}

function processNumericString(inputString) {
    const stringRepresentation = String(inputString);
    const cleanedString = stringRepresentation.replace('.', '');
    return Number(cleanedString);
}

const dataLines = readAndSplitInput('/dev/stdin');

dataLines.sort(compareNumbersDescending);

const largestValueString = dataLines[0];
const smallestValueString = dataLines[dataLines.length - 1];

const numericLargest = processNumericString(largestValueString);
const numericSmallest = processNumericString(smallestValueString);

const calculatedDifference = numericLargest - numericSmallest;

const finalComputedResult = calculatedDifference / 10;

console.log(finalComputedResult);
