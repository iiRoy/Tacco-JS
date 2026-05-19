"use strict";
exports.__esModule = true;
var fs_1 = require("fs");
var processInput = function () {
    return fs_1.readFileSync('/dev/stdin', 'utf8').slice(0, -1);
};
var inputSegments = processInput().split('\n');
var initialNumericSequence = Array.from(inputSegments[1].split(" "), Number);
var resultantSums = [];
for (var _i = 0, _a = inputSegments.slice(3); _i < _a.length; _i++) {
    var currentQueryString = _a[_i];
    var parts = currentQueryString.split(" ");
    var positionIdentifier = parts[0];
    var replacementValueString = parts[1];
    var targetIndex = Number(positionIdentifier) - 1;
    var numericReplacement = Number(replacementValueString);
    var modifiedSequence = initialNumericSequence.map(function (element, index) {
        return index === targetIndex ? numericReplacement : element;
    });
    var currentSum = 0;
    for (var _b = 0, modifiedSequence_1 = modifiedSequence; _b < modifiedSequence_1.length; _b++) {
        var num = modifiedSequence_1[_b];
        currentSum += num;
    }
    resultantSums.push(currentSum);
}
console.log(resultantSums);
