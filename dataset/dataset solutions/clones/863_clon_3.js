var fileSystemModule = require('fs');

var inputDataSize = fileSystemModule.fstatSync(process.stdin.fd).size;
var dataBuffer = new Buffer(inputDataSize);
var actualBytesRead = fileSystemModule.readSync(process.stdin.fd, dataBuffer, 0, inputDataSize, 0);
var rawInputString = dataBuffer.toString('utf8', 0, actualBytesRead);
var linesOfInput = rawInputString.split('\n');

function parseCoordinatePair(inputLineString) {
    var partsArray = inputLineString.split(' ');
    var firstCoordinate = parseInt(partsArray[0], 10) - 1;
    var secondCoordinate = parseInt(partsArray[1], 10) - 1;
    return { first: firstCoordinate, second: secondCoordinate };
}

var upperBoundN = parseInt(linesOfInput[0], 10);

var pairABData = parseCoordinatePair(linesOfInput[1]);
var coordA1 = pairABData.first;
var coordB1 = pairABData.second;

var pairCDData = parseCoordinatePair(linesOfInput[2]);
var coordC1 = pairCDData.first;
var coordD1 = pairCDData.second;

var minimumSumDistance = Infinity;

function calculateManhattanLikeDistance(valueX, valueY, currentDivisor) {
    var remainderDifference = Math.abs(valueX % currentDivisor - valueY % currentDivisor);
    var quotientDifference = Math.abs(Math.floor(valueX / currentDivisor) - Math.floor(valueY / currentDivisor));
    return remainderDifference + quotientDifference;
}

var divisorVal;
for (divisorVal = 1; divisorVal <= upperBoundN; divisorVal++) {
    var distanceAB = calculateManhattanLikeDistance(coordA1, coordB1, divisorVal);
    var distanceCD = calculateManhattanLikeDistance(coordC1, coordD1, divisorVal);
    var currentIterationTotalDistance = distanceAB + distanceCD;
    minimumSumDistance = Math.min(minimumSumDistance, currentIterationTotalDistance);
}

console.log(minimumSumDistance);
