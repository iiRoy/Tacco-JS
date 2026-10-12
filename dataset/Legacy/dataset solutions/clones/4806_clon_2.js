"use strict";
exports.__esModule = true;
var fs_1 = require("fs");
// This function reads the entire content from standard input,
// decodes it as UTF-8, and removes the trailing newline character.
var getInputContent = function () {
    return fs_1.readFileSync('/dev/stdin', 'utf8').slice(0, -1);
};
// Split the input content into an array of lines.
var inputLines = getInputContent().split('\n');
// Parse the second line of input (index 1) into an array of numbers.
// The numbers are space-separated.
var initialValuesArray = inputLines[1].split(" ").map(function (numString) {
    return +numString;
});
// Process the lines starting from the fourth line (index 3).
// Each line represents an operation.
var resultCollection = inputLines.slice(3).map(function (operationString) {
    // Split the operation string into its components: position and new value.
    var partsOfLine = operationString.split(" ");
    var positionIndexStr = partsOfLine[0];
    var newValueStr = partsOfLine[1];
    // Store the original value at the specified position before modification.
    var originalValueAtPos = initialValuesArray[+positionIndexStr - 1];
    // Update the array with the new value at the given position.
    initialValuesArray[+positionIndexStr - 1] = +newValueStr;
    // Calculate the sum of all elements in the modified array.
    var currentTotal = initialValuesArray.reduce(function (accumulatorVal, currentElement) {
        return accumulatorVal + currentElement;
    });
    // Restore the original value to the array to maintain its state for subsequent operations.
    initialValuesArray[+positionIndexStr - 1] = originalValueAtPos;
    // Return the calculated sum for this operation.
    return currentTotal;
});
// Output the collected results to the console.
console.log(resultCollection);
