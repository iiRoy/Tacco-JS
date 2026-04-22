var inputString = require('fs').readFileSync('/dev/stdin', 'utf8');
var capturedValues = inputString.match(/(\S+)\s+(\S+)\s+(\S+)/);

var dimensionX = Number(capturedValues[1]);
var dimensionY = Number(capturedValues[2]);
var coordinateZ = Number(capturedValues[3]);

var splitPoint = dimensionY * (dimensionX * dimensionX) / 2;

var firstOptionArgument = (2 / dimensionX) * (dimensionY - (coordinateZ / (dimensionX * dimensionX)));
var secondOptionArgument = (dimensionX * (dimensionY * dimensionY)) / (2 * coordinateZ);

var isConditionMet = (coordinateZ >= splitPoint);

var computedAngle = (isConditionMet * Math.atan(firstOptionArgument)) + ((!isConditionMet) * Math.atan(secondOptionArgument));

var degreesConversion = 180 / Math.PI;

var finalResult = computedAngle * degreesConversion;

process.stdout.write(finalResult + '\n');