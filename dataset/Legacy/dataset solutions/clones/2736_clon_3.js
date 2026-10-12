"use strict";

function findMaxInNumericArray(numbersCollection) {
    if (!Array.isArray(numbersCollection) || numbersCollection.length === 0) {
        return -Infinity;
    }
    return Math.max.apply(null, numbersCollection);
}

function processInputData(rawInputString) {
    var inputLines = rawInputString.split("\n");

    var numDataItemsStr = inputLines[0];
    var numItemsToProcess = parseInt(numDataItemsStr, 10);

    var dataItemStrings = inputLines.slice(1, numItemsToProcess + 1);
    var numericDataItems = dataItemStrings.map(function(s) {
        return parseInt(s, 10);
    });

    var totalDataItems = numericDataItems.length;

    for (var exclusionIndex = 0; exclusionIndex < totalDataItems; ++exclusionIndex) {
        var subsetForMax = numericDataItems.slice(0, exclusionIndex)
                           .concat(numericDataItems.slice(exclusionIndex + 1));

        var currentMax = findMaxInNumericArray(subsetForMax);
        console.log(currentMax);
    }
}

processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
