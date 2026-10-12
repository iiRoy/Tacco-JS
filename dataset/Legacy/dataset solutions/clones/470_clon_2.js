function calculateGCD(num1, num2) {
    var largerNum = Math.max(num1, num2);
    var smallerNum = Math.min(num1, num2);

    while (smallerNum !== 0) {
        var tempSmaller = smallerNum;
        smallerNum = largerNum % smallerNum;
        largerNum = tempSmaller;
    }
    return largerNum;
}

var rawData = require('fs').readFileSync('/dev/stdin', 'utf8');
var inputLines = rawData.trim().split("\n");

while (true) {
    var entryCount = inputLines.shift() - 0;
    if (entryCount === 0) {
        break;
    }

    var fractionList = [];
    for (var loopIndex = 0; loopIndex < entryCount; loopIndex++) {
        var currentNumbers = inputLines.shift().split(" ").map(Number);
        var pairDivisor = calculateGCD(currentNumbers[0], currentNumbers[1]);
        fractionList.push([currentNumbers[0] / pairDivisor, currentNumbers[1] / pairDivisor]);
    }

    var intermediateLCM = 1;
    fractionList.forEach(function(currentFraction) {
        var lcmDivisor = calculateGCD(currentFraction[1], intermediateLCM);
        intermediateLCM = (currentFraction[1] * intermediateLCM) / lcmDivisor;
    });

    var normalizedValues = fractionList.map(function(currentFraction, index) {
        return currentFraction[0] * (intermediateLCM / currentFraction[1]);
    });

    var finalCommonMultiple = 1;
    normalizedValues.forEach(function(valueToProcess) {
        var finalDivisor = calculateGCD(valueToProcess, finalCommonMultiple);
        finalCommonMultiple = (valueToProcess * finalCommonMultiple) / finalDivisor;
    });

    normalizedValues.forEach(function(itemForOutput) {
        console.log(finalCommonMultiple / itemForOutput);
    });
}
