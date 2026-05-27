const fileSystem = require('fs');

const MATRIX_DIMENSION = 10;

const rawInputContent = fileSystem.readFileSync('/dev/stdin', 'utf8');
let dataLines = rawInputContent.split('\n');

const firstLineOfInput = dataLines.shift();
const numRowsString = firstLineOfInput.split(' ')[0];
const numRowsForDigitCounts = parseInt(numRowsString, 10);

let adjacencyCosts = [];
for (let rowIndex = 0; rowIndex < MATRIX_DIMENSION; rowIndex++) {
    const currentMatrixLine = dataLines.shift();
    const rowValues = currentMatrixLine.split(' ').map(strValue => parseInt(strValue, 10));
    adjacencyCosts.push(rowValues);
}

let digitOccurrences = new Array(MATRIX_DIMENSION).fill(0);

for (let inputRowIndex = 0; inputRowIndex < numRowsForDigitCounts; inputRowIndex++) {
    const lineContainingDigits = dataLines.shift();
    const parsedDigitsFromLine = lineContainingDigits.split(' ').map(strValue => parseInt(strValue, 10));
    for (const singleDigitValue of parsedDigitsFromLine) {
        digitOccurrences[singleDigitValue]++;
    }
}

for (let intermediateNode = 0; intermediateNode < MATRIX_DIMENSION; intermediateNode++) {
    for (let startNode = 0; startNode < MATRIX_DIMENSION; startNode++) {
        for (let endNode = 0; endNode < MATRIX_DIMENSION; endNode++) {
            const existingPathCost = adjacencyCosts[startNode][endNode];
            const newPathCostThroughIntermediate = adjacencyCosts[startNode][intermediateNode] + adjacencyCosts[intermediateNode][endNode];
            adjacencyCosts[startNode][endNode] = Math.min(existingPathCost, newPathCostThroughIntermediate);
        }
    }
}

let totalAccumulatedCost = 0;
for (let currentDigitIndex = 0; currentDigitIndex < MATRIX_DIMENSION; currentDigitIndex++) {
    const frequencyOfDigit = digitOccurrences[currentDigitIndex];
    const costToReachTargetOne = adjacencyCosts[currentDigitIndex][1];
    totalAccumulatedCost += frequencyOfDigit * costToReachTargetOne;
}

console.log(totalAccumulatedCost);
