var configParams = {};
var ladderGrid = [];
var inputLinesBuffer = [];

var tracePath = function(initialLine, initialStep) {
    var currentStep = initialStep || 0;
    var currentPos = initialLine;
    var pathHistory = [currentPos];
    var gridHeight = ladderGrid.length;

    for (var stepIndex = currentStep; stepIndex < gridHeight; stepIndex++) {
        currentPos += ladderGrid[stepIndex][currentPos];
        pathHistory.push(currentPos);
    }
    return pathHistory;
};

var reverseTracePath = function(finalLine) {
    var currentPos = finalLine;
    var pathHistory = [currentPos];
    var gridHeight = ladderGrid.length;

    for (var stepIndex = gridHeight - 1; stepIndex >= 0; stepIndex--) {
        currentPos += ladderGrid[stepIndex][currentPos];
        pathHistory.push(currentPos);
    }
    return pathHistory.reverse();
};

process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function (chunk) {
    chunk.trim().split('\n').forEach(function(line) {
        inputLinesBuffer.push(line);
    });
});

process.stdin.on('end', function(){
    var outputMessage = "";
    var rawInputLines = inputLinesBuffer;

    configParams = {};
    ladderGrid = [];

    const configKeys = ["lines", "start", "end", "steps"];
    let configLineCounter = 0;

    for (let i = 0; i < rawInputLines.length; i++) {
        let currentLineStr = rawInputLines[i];

        if (currentLineStr === "0") {
            break;
        }

        if (configLineCounter < configKeys.length) {
            configParams[configKeys[configLineCounter]] = parseInt(currentLineStr);
            configLineCounter++;
            continue;
        }

        var gridRow = [];
        var totalLinesInGrid = configParams.lines;
        for (var colIndex = 0; colIndex < totalLinesInGrid - 1; colIndex++) {
            var cellValue = parseInt(currentLineStr.charAt(colIndex));
            if (colIndex > 0 && cellValue === 0 && gridRow[colIndex - 1] === 1) {
                cellValue = -1;
            }
            gridRow.push(cellValue);
        }
        var lastGridRowValue = gridRow[gridRow.length - 1];
        gridRow.push((lastGridRowValue === 1) ? -1 : 0);
        ladderGrid.push(gridRow);
    }

    configParams.start -= 1;
    configParams.end -= 1;

    var forwardRoute = tracePath(configParams.start);
    var finalForwardPosition = forwardRoute[forwardRoute.length - 1];

    if (finalForwardPosition === configParams.end) {
        console.log("0");
        return;
    }

    var backwardRoute = reverseTracePath(configParams.end);
    var maxStepsToConsider = configParams.steps;

    for (var stepIndex = 0; stepIndex < maxStepsToConsider; stepIndex++) {
        var currentForwardPos = forwardRoute[stepIndex];
        var currentBackwardPos = backwardRoute[stepIndex];

        var isAdjacent = (Math.abs(currentForwardPos - currentBackwardPos) === 1);
        var forwardCellIsEmpty = (ladderGrid[stepIndex][currentForwardPos] === 0);
        var backwardCellIsEmpty = (ladderGrid[stepIndex][currentBackwardPos] === 0);

        if (isAdjacent && forwardCellIsEmpty && backwardCellIsEmpty) {
            var smallerPosition = Math.min(currentForwardPos, currentBackwardPos);
            outputMessage = (stepIndex + 1) + " " + (smallerPosition + 1);
            break;
        }
    }

    if (outputMessage === "") {
        outputMessage = "1";
    }
    
    console.log(outputMessage);
});
