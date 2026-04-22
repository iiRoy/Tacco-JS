var getModule = require;

var fileSystemAccess = getModule('fs');

var rawInputData = fileSystemAccess.readFileSync('/dev/stdin', 'utf8');

const stringToNumber = (inputString) => Number(inputString);

const extractObjectValues = (sourceObject) => Object.values(sourceObject);

function displayResult(messageContent) {
    console.log(messageContent);
}

var processedLines = rawInputData.trim().split("\n");

var totalElementsCount = stringToNumber(processedLines.shift());

var initialNumericSequence = processedLines.shift().split(" ").map(stringToNumber);

var sortedNumericSequence = initialNumericSequence.slice().sort((valOne, valTwo) => valOne - valTwo);

var numberOfOperations = stringToNumber(processedLines.shift());

var indexSwapInstructions = processedLines.map(currentLine =>
    currentLine.split(" ").map(stringToNumber).map(indexValue => indexValue - 1)
);

indexSwapInstructions.unshift([0, 0]);

var currentDifferenceMap = {};
var targetDifferenceMap = {};

for (var elementIndex = 0; elementIndex < initialNumericSequence.length; elementIndex++) {
    if (initialNumericSequence[elementIndex] !== sortedNumericSequence[elementIndex]) {
        currentDifferenceMap[elementIndex] = initialNumericSequence[elementIndex];
        targetDifferenceMap[elementIndex] = sortedNumericSequence[elementIndex];
    }
}

var targetDifferenceString = extractObjectValues(targetDifferenceMap).join(",");

var wasMatchIdentified = false;

var operationIndex;

for (operationIndex = 0; operationIndex <= numberOfOperations; operationIndex++) {
    var firstSwapPosition = indexSwapInstructions[operationIndex][0];
    var secondSwapPosition = indexSwapInstructions[operationIndex][1];

    var temporaryValueHolder = currentDifferenceMap[firstSwapPosition];
    currentDifferenceMap[firstSwapPosition] = currentDifferenceMap[secondSwapPosition];
    currentDifferenceMap[secondSwapPosition] = temporaryValueHolder;

    if (extractObjectValues(currentDifferenceMap).join(",") === targetDifferenceString) {
        wasMatchIdentified = true;
        break;
    }
}

if (wasMatchIdentified) {
    displayResult(operationIndex);
} else {
    displayResult(-1);
}