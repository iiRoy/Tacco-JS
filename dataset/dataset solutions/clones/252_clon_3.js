var rawData = require('fs').readFileSync('/dev/stdin', 'utf8').trim();
var inputLines = rawData.split('\n');

var totalSum = 0;

function calculateLineSum(numericStringArray) {
    let currentLineTotal = 0;
    for (const numStr of numericStringArray) {
        currentLineTotal += Number(numStr);
    }
    return currentLineTotal;
}

let currentLineContent;
while ((currentLineContent = inputLines.shift()) !== undefined) {
    const extractedNumberStrings = currentLineContent.split(/\D+/);
    const sumForThisLine = calculateLineSum(extractedNumberStrings);
    totalSum += sumForThisLine;
}

console.log(totalSum);
