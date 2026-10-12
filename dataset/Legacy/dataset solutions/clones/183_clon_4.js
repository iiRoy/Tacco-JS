var sourceData = require('fs').readFileSync('/dev/stdin', 'utf8');
var dataLines = sourceData.trim().split('\n');

var calculationResult = dataLines.reduce(function(accumulator, currentLine) {
    var lineSegments = currentLine.split(',');
    var firstComponent = Number(lineSegments[0]);
    var secondComponent = Number(lineSegments[1]);

    accumulator.productTotal += firstComponent * secondComponent;
    accumulator.secondValueTotal += secondComponent;
    accumulator.entryCount++;

    return accumulator;
}, { productTotal: 0, secondValueTotal: 0, entryCount: 0 });

var finalProductSum = calculationResult.productTotal;
var finalSecondValueSum = calculationResult.secondValueTotal;
var totalEntries = calculationResult.entryCount;

var averagedSecondValue = Math.round(finalSecondValueSum / totalEntries);

console.log(finalProductSum, averagedSecondValue);
