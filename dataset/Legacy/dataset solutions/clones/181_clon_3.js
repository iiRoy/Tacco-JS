var fileSystem = require('fs');
var fileContent = fileSystem.readFileSync('/dev/stdin', 'utf8');

var contentLines = fileContent.trim().split('\n');

function parseLineToNumericPair(currentLineString) {
    var stringParts = currentLineString.split(',');
    var numericParts = stringParts.map(function(numberString) {
        return Number(numberString);
    });
    return numericParts;
}

var numericPairs = contentLines.map(parseLineToNumericPair);

function calculatePairProductSum(accumulatorValue, currentNumericPair) {
    var firstElement = currentNumericPair[0];
    var secondElement = currentNumericPair[1];
    var productOfElements = firstElement * secondElement;
    return accumulatorValue + productOfElements;
}

var totalProduct = numericPairs.reduce(calculatePairProductSum, 0);

function calculateTotalQuantity(accumulatorValue, currentNumericPair) {
    var quantityElement = currentNumericPair[1];
    return accumulatorValue + quantityElement;
}

var totalQuantity = numericPairs.reduce(calculateTotalQuantity, 0);

console.log(totalProduct);

var numberOfEntries = numericPairs.length;
var averageQuantityValue = totalQuantity / numberOfEntries;
var roundedAverageQuantity = Math.round(averageQuantityValue);

console.log(roundedAverageQuantity);
