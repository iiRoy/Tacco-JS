var rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

var trimmedInputString = rawData.trim();
var stringCoordinateParts = trimmedInputString.split(" ");
var numericCoordinateValues = stringCoordinateParts.map(Number);

function calculateSquare(valueToSquare) {
    return valueToSquare * valueToSquare;
}

var pointOneX = numericCoordinateValues[0];
var pointOneY = numericCoordinateValues[1];
var pointTwoX = numericCoordinateValues[2];
var pointTwoY = numericCoordinateValues[3];

var differenceX = pointTwoX - pointOneX;
var differenceY = pointTwoY - pointOneY;

var squaredDifferenceX = calculateSquare(differenceX);
var squaredDifferenceY = calculateSquare(differenceY);

var sumOfSquaredDifferences = squaredDifferenceX + squaredDifferenceY;
var finalEuclideanDistance = Math.sqrt(sumOfSquaredDifferences);

console.log(finalEuclideanDistance.toFixed(8));
