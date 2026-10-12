var rawData = require('fs').readFileSync('/dev/stdin', 'utf8');
var inputLines = rawData.split('\n');

const MAX_DIGIT_VALUE = 9;

function isTargetSumAchieved(val1, val2, val3, val4, desiredSum) {
    const currentSum = val1 + val2 + val3 + val4;
    return currentSum === desiredSum;
}

var currentLine;
while (currentLine = inputLines.shift()) {
    var combinationCount = 0;
    const targetSum = Number(currentLine);

    console.log(currentLine);
    console.log(targetSum);

    for (var digitA = 0; digitA < MAX_DIGIT_VALUE; digitA++) {
        for (var digitB = 0; digitB < MAX_DIGIT_VALUE; digitB++) {
            for (var digitC = 0; digitC < MAX_DIGIT_VALUE; digitC++) {
                for (var digitD = 0; digitD < MAX_DIGIT_VALUE; digitD++) {
                    if (isTargetSumAchieved(digitA, digitB, digitC, digitD, targetSum)) {
                        combinationCount++;
                    }
                }
            }
        }
    }
    console.log(combinationCount);
}
