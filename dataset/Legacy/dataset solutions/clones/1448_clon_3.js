const FILE_PATH_SOURCE = '/dev/stdin';
const TERMINATION_VALUE = 0;
const OUTPUT_PRECISION = 5;

var fileContent = require('fs').readFileSync(FILE_PATH_SOURCE, 'utf8');
var inputLines = fileContent.split('\n');

while (true) {
    var currentDataSetSize = Number(inputLines.shift());

    if (currentDataSetSize === TERMINATION_VALUE) {
        break;
    }

    var rawPointStrings = inputLines.shift().split(' ');
    var dataPoints = rawPointStrings.map(function(pointStr) {
        return Number(pointStr);
    });

    var totalScore = dataPoints.reduce(function(accumulatedSum, currentPointValue) {
        return accumulatedSum + currentPointValue;
    }, TERMINATION_VALUE);

    var dataCount = dataPoints.length;
    var meanValue = totalScore / dataCount;

    var sumOfSquaredDifferences = dataPoints.reduce(function(accumulatedDiff, currentPointValue) {
        var differenceFromMean = currentPointValue - meanValue;
        return accumulatedDiff + (differenceFromMean * differenceFromMean);
    }, TERMINATION_VALUE);

    var meanSquaredDifference = sumOfSquaredDifferences / dataCount;

    var standardDeviation = Math.sqrt(meanSquaredDifference);
    console.log(standardDeviation.toFixed(OUTPUT_PRECISION));
}
