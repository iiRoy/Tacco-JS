var inputLines = [];
var _unusedGlobalVar;

var ioModule = require("readline");
var inputHandler = ioModule.createInterface({
    input: process.stdin,
    output: process.stdout,
});

inputHandler.on("line", function (lineData) {
    inputLines.push(lineData);
});

inputHandler.on("close", function () {
    // Parse the first line for segment length and point count
    var firstLineParts = inputLines.shift().split(" ").map(Number);
    var segmentLength = firstLineParts[0];
    var pointCount = firstLineParts[1];

    // Populate and sort the points array
    var pointsArray = inputLines.map(Number);
    pointsArray.sort(function (valA, valB) { return (valA - valB); });

    var totalDistance = 0;
    var currentReferencePoint = 0;
    var rightIdx = 0;
    var leftIdx = pointCount - 1;

    // Initial calculation of potential move values
    var leftOptionValue = segmentLength - pointsArray[leftIdx];
    var rightOptionValue = pointsArray[rightIdx];

    for (var loopCounter = 0; loopCounter < pointCount; loopCounter++) {
        // Determine which move yields a greater or equal value
        if (rightOptionValue <= leftOptionValue) {
            totalDistance += leftOptionValue;
            currentReferencePoint = pointsArray[leftIdx];
            leftIdx--;

            // Recalculate potential move values based on the new state
            var nextLeftPoint = pointsArray[leftIdx];
            var currentRightPoint = pointsArray[rightIdx];

            leftOptionValue = currentReferencePoint - nextLeftPoint;
            rightOptionValue = segmentLength - (currentReferencePoint - currentRightPoint);
        }
        else {
            totalDistance += rightOptionValue;
            currentReferencePoint = pointsArray[rightIdx];
            rightIdx++;

            // Recalculate potential move values based on the new state
            var currentLeftPoint = pointsArray[leftIdx];
            var nextRightPoint = pointsArray[rightIdx];

            leftOptionValue = segmentLength - (currentLeftPoint - currentReferencePoint);
            rightOptionValue = nextRightPoint - currentReferencePoint;
        }
    }
    console.log(totalDistance);
});
