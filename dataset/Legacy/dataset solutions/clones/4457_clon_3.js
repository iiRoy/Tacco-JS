process.stdin.resume();
process.stdin.setEncoding('utf8');

var inputLines = [];
var inputReader = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

inputReader.on('line', (currentLine) => {
  inputLines.push(currentLine);
});

function determineTwoDivisionCount(valueToCheck) {
    let currentDivisionCount = 0;
    let workingValue = valueToCheck;
    const DIVISOR_VALUE = 2;
    while (workingValue % DIVISOR_VALUE === 0) {
        currentDivisionCount++;
        workingValue /= DIVISOR_VALUE;
    }
    return currentDivisionCount;
}

inputReader.on('close', () => {
    var numElements = Number(inputLines[0]);
    var powerOfTwoCounts = [];

    for (let loopIndex = 1; loopIndex <= numElements; loopIndex++) {
        let currentNumberCount = determineTwoDivisionCount(loopIndex);
        powerOfTwoCounts.push(currentNumberCount);
    }

    var maxCount = Math.max(...powerOfTwoCounts);
    var resultIndex = powerOfTwoCounts.indexOf(maxCount);

    console.log(resultIndex + 1);
});
