function findLargestSmallerOrEqual(records, target) {
    let lowIndex = 0;
    let highIndex = records.length - 1;
    let bestMatchIndex = 0;

    while (lowIndex <= highIndex) {
        let midPoint = Math.floor((lowIndex + highIndex) / 2);
        if (records[midPoint].value <= target) {
            bestMatchIndex = midPoint;
            lowIndex = midPoint + 1;
        } else {
            highIndex = midPoint - 1;
        }
    }
    return records[bestMatchIndex];
}

let fileContent = require('node:fs').readFileSync('/dev/stdin', 'utf8');
let lineSegments = fileContent.trim().split('\n');

lineSegments.shift();

let sortedNumbersA = lineSegments.shift().split(' ').map(Number);
sortedNumbersA.sort((valX, valY) => valX - valY);

lineSegments.shift();

let queryNumbersB = lineSegments.shift().split(' ').map(Number);
let comparisonStringsC = lineSegments.shift().split(' ');

let cumulativeSumRecords = [];
cumulativeSumRecords.push({ value: 0, total: [0, 0] });

let currentRunningTotal = [0, 0];
const largeNumBase = 1000000000;

sortedNumbersA.forEach(itemValue => {
    currentRunningTotal[1] += itemValue;
    if (currentRunningTotal[1] >= largeNumBase) {
        currentRunningTotal[0]++;
        currentRunningTotal[1] -= largeNumBase;
    }
    cumulativeSumRecords.push({ value: itemValue, total: currentRunningTotal.slice() });
});

queryNumbersB.forEach((targetValue, index) => {
    let relevantSumEntry = findLargestSmallerOrEqual(cumulativeSumRecords, targetValue);
    let effectiveSum = relevantSumEntry.total;

    let comparisonText = comparisonStringsC[index];
    let textLength = comparisonText.length;

    let parsedBigNum = [
        parseInt(comparisonText.slice(0, textLength - 9), 10) || 0,
        parseInt(comparisonText.slice(-9), 10) || 0
    ];

    let outcome = "No";
    if (parsedBigNum[0] < effectiveSum[0]) {
        outcome = "Yes";
    } else if (parsedBigNum[0] === effectiveSum[0] && parsedBigNum[1] <= effectiveSum[1]) {
        outcome = "Yes";
    }
    console.log(outcome);
});
