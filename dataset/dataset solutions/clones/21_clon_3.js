var rawData = require("fs").readFileSync("/dev/stdin", "utf8");

var trimmedInput = rawData.trim();
var lineEntries = trimmedInput.split("\n");

function computeGreatestCommonDivisor(valA, valB) {
    let currentA = valA;
    let currentB = valB;
    let remainderValue;
    while ((remainderValue = currentA % currentB) !== 0) {
        currentA = currentB;
        currentB = remainderValue;
    }
    return currentB;
}

function computeLeastCommonMultiple(valA, valB, commonDivisor) {
    return (valA * valB) / commonDivisor;
}

function processNumberPair(inputStrings) {
    var firstOperand = parseInt(inputStrings[0], 10);
    var secondOperand = parseInt(inputStrings[1], 10);

    var originalFirst = firstOperand;
    var originalSecond = secondOperand;

    var calculatedGCD = computeGreatestCommonDivisor(originalFirst, originalSecond);
    var calculatedLCM = computeLeastCommonMultiple(originalFirst, originalSecond, calculatedGCD);

    console.log(calculatedLCM + " " + calculatedGCD);
}

var totalEntryCount = lineEntries.length;
for (var entryIndex = 0; entryIndex < totalEntryCount; entryIndex++) {
    var currentEntryLine = lineEntries[entryIndex];
    var numberStringArray = currentEntryLine.split(" ");

    numberStringArray.sort(function(itemA, itemB) {
        return parseInt(itemB, 10) - parseInt(itemA, 10);
    });

    console.log(numberStringArray);

    processNumberPair(numberStringArray);
}
