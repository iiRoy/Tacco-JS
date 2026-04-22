// Application configuration parameters
var configParams = {};

// 2D rectangular grid. Elements are -1 (bar on right), 0 (empty), 1 (bar on left)
var gridMatrix = [];

// Determine the path from a starting point
var tracePath = function (beginLane, initialLevel) {
    if (!initialLevel) initialLevel = 0;
    var currentPosition = beginLane;
    var journey = [currentPosition];
    for (var rowIdx = initialLevel; rowIdx < gridMatrix.length; rowIdx++) {
        currentPosition += gridMatrix[rowIdx][currentPosition];
        journey.push(currentPosition);
    }
    return journey;
};

// Retrieve path when target is specified (path is from start)
var reverseTracePath = function (targetLane) {
    var currentSpot = targetLane;
    var pathSegment = [currentSpot];
    for (var rowIdx = gridMatrix.length - 1; rowIdx >= 0; rowIdx--) {
        currentSpot += gridMatrix[rowIdx][currentSpot];
        pathSegment.push(currentSpot);
    }
    return pathSegment.reverse();
};

var inputLines = [];
process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function (dataBlock) {
    dataBlock.trim().split('\n').forEach(function (singleLine) {
        inputLines.push(singleLine);
    });
});

process.stdin.on('end', function () {
    var finalOutcome = "";

    // Constructing the primary data structures
    configParams = {};
    gridMatrix = [];
    for (var idx = 0; idx < inputLines.length; idx++) {
        var currentElement = inputLines[idx];
        if (currentElement === "0") break;

        var definitions = ["numLines", "startPos", "endPos", "numSteps"];
        if (idx < definitions.length) {
            configParams[definitions[idx]] = parseInt(currentElement);
            return;
        }

        // Subsequent rows for the grid
        var rowData = [];
        for (var colIdx = 0; colIdx < configParams.numLines - 1; colIdx++) {
            var charVal = parseInt(currentElement.charAt(colIdx));
            if (colIdx > 0 && charVal === 0 && rowData[colIdx - 1] === 1) charVal = -1;
            rowData.push(charVal);
        }
        rowData.push((rowData[rowData.length - 1] === 1) ? -1 : 0);
        gridMatrix.push(rowData);
    }
    configParams.startPos -= 1;
    configParams.endPos -= 1;

    var forwardPath = tracePath(configParams.startPos);
    if (forwardPath[forwardPath.length - 1] === configParams.endPos) {
        console.log("0");
        return;
    }
    var backwardPath = reverseTracePath(configParams.endPos);

    for (var level = 0; level < configParams.numSteps; level++) {
        // They are adjacent and both paths pass through an empty spot
        if (Math.abs(forwardPath[level] - backwardPath[level]) === 1 && gridMatrix[level][forwardPath[level]] === 0 && gridMatrix[level][backwardPath[level]] === 0) {
            finalOutcome = (level + 1) + " " + (Math.min(forwardPath[level], backwardPath[level]) + 1);
            break;
        }
    }
    if (finalOutcome === "") finalOutcome = "1";

    console.log(finalOutcome);
});