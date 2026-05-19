var fileSystem = require('fs');
var rawInputData = fileSystem.readFileSync('/dev/stdin', 'utf8');

var allInputLines = rawInputData.split('\n');

var scenarioCount = Number(allInputLines.shift());

function generatePoint(xCoord, yCoord) {
    return { x: xCoord, y: yCoord };
}

function deriveVector(initialPoint, terminalPoint) {
    return { deltaX: terminalPoint.x - initialPoint.x, deltaY: terminalPoint.y - initialPoint.y };
}

var outcomeMessages = allInputLines.slice(0, scenarioCount).map(function(currentScenarioLine) {
    var stringCoordinates = currentScenarioLine.split(' ');
    var numericalValues = stringCoordinates.map(Number);

    var firstPoint = generatePoint(numericalValues[0], numericalValues[1]);
    var secondPoint = generatePoint(numericalValues[2], numericalValues[3]);
    var thirdPoint = generatePoint(numericalValues[4], numericalValues[5]);
    var fourthPoint = generatePoint(numericalValues[6], numericalValues[7]);

    var segmentVectorOne = deriveVector(firstPoint, secondPoint);
    var segmentVectorTwo = deriveVector(thirdPoint, fourthPoint);

    var comparisonValueA = (segmentVectorOne.deltaX * segmentVectorTwo.deltaY);
    var comparisonValueB = (segmentVectorOne.deltaY * segmentVectorTwo.deltaX);

    if (comparisonValueA.toFixed(12) === comparisonValueB.toFixed(12)) {
        return 'YES';
    } else {
        return 'NO';
    }
});

console.log(outcomeMessages.join('\n'));
