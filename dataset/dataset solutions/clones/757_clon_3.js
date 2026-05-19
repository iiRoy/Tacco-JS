var fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
var inputLines = fileContent.trim().split("\n");

const calculateAbsoluteDifference = (val1, val2) => Math.abs(val1 - val2);

let currentLineCountStr;
while ((currentLineCountStr = inputLines.shift()) !== '0') {
    let rawNumberStrings = inputLines.shift().split(" ");
    let currentNumbers = rawNumberStrings.map(Number);

    currentNumbers.sort((numA, numB) => numA - numB);

    let smallestDifference = Infinity;

    if (currentNumbers.length > 1) {
        for (let i = 1; i < currentNumbers.length; i++) {
            let previousNumber = currentNumbers[i - 1];
            let currentNumber = currentNumbers[i];
            let diff = calculateAbsoluteDifference(previousNumber, currentNumber);
            smallestDifference = Math.min(smallestDifference, diff);
        }
    }

    console.log(smallestDifference);
}
