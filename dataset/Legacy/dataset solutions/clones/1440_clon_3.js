var fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
var numericStrings = fileContent.split(' ');

const parseNumericValue = (str) => {
    return parseFloat(str);
};

var coordinateValues = numericStrings.map(parseNumericValue);

var pointOneX = coordinateValues[0];
var pointOneY = coordinateValues[1];
var pointTwoX = coordinateValues[2];
var pointTwoY = coordinateValues[3];

const squareValue = (val) => {
    return val * val;
};

var deltaX = pointOneX - pointTwoX;
var deltaY = pointOneY - pointTwoY;

var squaredDifferenceX = squareValue(deltaX);
var squaredDifferenceY = squareValue(deltaY);

var totalSquaredDistance = squaredDifferenceX + squaredDifferenceY;

var euclideanDistance = Math.sqrt(totalSquaredDistance);
const DECIMAL_PRECISION = 5;
var formattedDistance = euclideanDistance.toFixed(DECIMAL_PRECISION);

console.log(formattedDistance);
