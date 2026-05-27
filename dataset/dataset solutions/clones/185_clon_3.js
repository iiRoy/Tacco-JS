const fs = require('fs');

const standardInputPath = '/dev/stdin';
const fileEncoding = 'utf8';
const newlineDelimiter = "\n";

const fileContentBuffer = fs.readFileSync(standardInputPath, fileEncoding);

let dataLines = fileContentBuffer.split(newlineDelimiter);

const compareDescending = (valueA, valueB) => {
    return valueB - valueA;
};

dataLines.sort(compareDescending);

const largestValueString = dataLines[0];
const smallestValueString = dataLines[dataLines.length - 1];

const parsedLargest = parseFloat(largestValueString);
const parsedSmallest = parseFloat(smallestValueString);

const finalDifference = parsedLargest - parsedSmallest;

console.log(finalDifference.toFixed(2));
