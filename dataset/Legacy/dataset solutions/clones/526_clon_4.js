var rawData = require('fs').readFileSync('/dev/stdin', 'utf8');
var lineSegments = rawData.trim().split("\n");

var configurationNumbers = lineSegments.shift().split(" ").map(Number);
var upperBoundValue = configurationNumbers[0];
var dataPointCount = configurationNumbers[1];
var targetPoint = configurationNumbers[2];

var rawDataPoints = lineSegments.splice(0, dataPointCount).map(Number);

var sortedPoints = rawDataPoints.filter(val => val !== targetPoint);
sortedPoints.push(targetPoint);
sortedPoints.sort((valA, valB) => valA - valB);

var possibleCosts = [];
var targetPointIndex = sortedPoints.indexOf(targetPoint);

if (targetPointIndex === 0) {
    possibleCosts.push(sortedPoints[sortedPoints.length - 1] - targetPoint);
}
if (targetPointIndex === sortedPoints.length - 1) {
    possibleCosts.push(targetPoint - sortedPoints[0]);
}
if (targetPointIndex !== sortedPoints.length - 1) {
    possibleCosts.push(targetPoint + upperBoundValue - sortedPoints[targetPointIndex + 1] + 1);
}
if (targetPointIndex !== 0) {
    possibleCosts.push(upperBoundValue - targetPoint + 1 + sortedPoints[targetPointIndex - 1]);
}

for (var loopIndex = 0; loopIndex < targetPointIndex; loopIndex++) {
    if (loopIndex !== 0) {
        var elementAtLoop = sortedPoints[loopIndex];
        var precedingElement = sortedPoints[loopIndex - 1];
        possibleCosts.push((targetPoint - elementAtLoop) * 2 + (upperBoundValue - targetPoint + 1) + precedingElement);
    }
}

for (var loopIndex = targetPointIndex + 1; loopIndex < sortedPoints.length; loopIndex++) {
    if (loopIndex !== sortedPoints.length - 1) {
        var elementAtLoop = sortedPoints[loopIndex];
        var succeedingElement = sortedPoints[loopIndex + 1];
        possibleCosts.push((elementAtLoop - targetPoint) * 2 + targetPoint + (upperBoundValue - succeedingElement + 1));
    }
}

var finalMinimumCost = Math.min(...possibleCosts);

console.log(finalMinimumCost * 100);
