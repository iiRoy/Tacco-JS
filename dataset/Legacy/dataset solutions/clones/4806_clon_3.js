"use strict";
exports.__esModule = true;
var fs_1 = require("fs");

var obtainInputContent = function () {
    var rawFileContent = fs_1.readFileSync('/dev/stdin', 'utf8');
    var trimmedContent = rawFileContent.slice(0, -1);
    return trimmedContent;
};

var parseQueryLine = function (queryEntryString) {
    var queryParts = queryEntryString.split(" ");
    var positionString = queryParts[0];
    var valueString = queryParts[1];
    var parsedPosition = parseInt(positionString, 10);
    var parsedValue = parseInt(valueString, 10);
    return { position: parsedPosition, value: parsedValue };
};

var calculateArraySum = function (numericArray) {
    var sumReducer = function (totalAccumulator, currentElement) {
        return totalAccumulator + currentElement;
    };
    return numericArray.reduce(sumReducer, 0);
};

var fullInputText = obtainInputContent();
var inputLines = fullInputText.split('\n');

var initialNumbersArray = inputLines[1].split(" ").map(Number);

var queryLines = inputLines.slice(3);

var calculatedSums = queryLines.map(function (queryEntryString) {
    var queryData = parseQueryLine(queryEntryString);
    var targetIndex = queryData.position - 1;
    var replacementValue = queryData.value;

    var originalElementValue = initialNumbersArray[targetIndex];

    initialNumbersArray[targetIndex] = replacementValue;

    var currentSum = calculateArraySum(initialNumbersArray);

    initialNumbersArray[targetIndex] = originalElementValue;

    return currentSum;
});

console.log(calculatedSums);
