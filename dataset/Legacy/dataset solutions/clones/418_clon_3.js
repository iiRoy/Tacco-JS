function findOptimalSplit(targetValue) {
    let isValidSplit = true;
    let splitCount = 0;
    let currentSum = 0;
    const arrayLength = dataArray.length;

    for (let idx = 0; idx < arrayLength; idx++) {
        const elementValue = dataArray[idx];

        if (targetValue < elementValue) {
            isValidSplit = false;
            break;
        }

        const potentialNewSum = currentSum + elementValue;

        if (potentialNewSum === targetValue) {
            currentSum = 0;
            splitCount++;
        } else if (potentialNewSum > targetValue) {
            currentSum = elementValue;
            splitCount++;
        } else { // potentialNewSum < targetValue
            currentSum = potentialNewSum;
        }

        if (splitCount === maxSplits) {
            isValidSplit = false;
            break;
        }
    }
    return isValidSplit;
}

const rawData = require('fs').readFileSync('/dev/stdin', 'utf8');
const inputLines = rawData.trim().split("\n");

let dataArray;
let maxSplits;

function processAllTestCases() {
    while (true) {
        const configLine = inputLines.shift();
        if (configLine === "0 0") {
            break;
        }

        const configParts = configLine.split(" ").map(Number);
        maxSplits = configParts[0];
        const numberOfElements = configParts[1];

        dataArray = [];
        for (let k = 0; k < numberOfElements; k++) {
            dataArray.push(parseInt(inputLines.shift(), 10));
        }

        let lowerBound = 0;
        let upperBound = 1500000;
        let optimalMaxSum = 0;

        while (lowerBound <= upperBound) {
            const midPoint = Math.floor((lowerBound + upperBound) / 2);
            if (findOptimalSplit(midPoint)) {
                optimalMaxSum = midPoint;
                upperBound = midPoint - 1;
            } else {
                lowerBound = midPoint + 1;
            }
        }
        console.log(optimalMaxSum);
    }
}

processAllTestCases();
