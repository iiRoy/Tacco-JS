const rawData = require('fs').readFileSync('/dev/stdin', 'utf8');
const lineData = rawData.trim().split("\n");

let lineIndex = 0;

const parseLineAsNumber = (dataArray, index) => {
    return Number(dataArray[index]);
};

const dimensionsLine = lineData[lineIndex].split(" ").map(Number);
lineIndex++;

const rowsCount = dimensionsLine[0];
const colsCount = dimensionsLine[1];

const rowValues = [];
for (let i = 0; i < rowsCount - 1; i++) {
    rowValues.push(parseLineAsNumber(lineData, lineIndex));
    lineIndex++;
}

const colOperations = [];
for (let i = 0; i < colsCount; i++) {
    colOperations.push(parseLineAsNumber(lineData, lineIndex));
    lineIndex++;
}

let totalSum = 0;
let currentPosition = 0;

const MODULO_CONSTANT = 100000;

colOperations.forEach(function(operationValue) {
    const directionMultiplier = (operationValue > 0) ? 1 : -1;
    let stepsToTake = Math.abs(operationValue);

    for (let step = 0; step < stepsToTake; step++) {
        if (directionMultiplier === 1) {
            totalSum += rowValues[currentPosition];
            currentPosition++;
        } else {
            currentPosition--;
            totalSum += rowValues[currentPosition];
        }
    }
    totalSum = totalSum % MODULO_CONSTANT;
});

console.log(totalSum);
