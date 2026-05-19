var inputLines = [], gridData;
var gridHeight, gridWidth;
var lineReaderModule = require('readline');

var interfaceInstance = lineReaderModule.createInterface({
    input: process.stdin,
    output: process.stdout,
});

interfaceInstance.on('line', function (currentLine) {
    inputLines.push(currentLine);
});

interfaceInstance.on('close', function () {
    const dimensionsStringParts = inputLines[0].split(" ");
    gridHeight = parseInt(dimensionsStringParts[0], 10);
    gridWidth = parseInt(dimensionsStringParts[1], 10);

    inputLines.shift();

    gridData = inputLines.map(lineContent => lineContent.split(""));
    var initialBlackCells = [];

    const BLACK_CELL_IDENTIFIER = "#";
    const STARTING_DISTANCE = 0;

    for (let rowIdx = 0; rowIdx < gridHeight; rowIdx++) {
        for (let colIdx = 0; colIdx < gridWidth; colIdx++) {
            if (gridData[rowIdx][colIdx] === BLACK_CELL_IDENTIFIER) {
                initialBlackCells.push([rowIdx, colIdx, STARTING_DISTANCE]);
            }
        }
    }

    console.log(calculateMaxDistance(initialBlackCells));
});

function calculateMaxDistance(queueOfCells) {
    var maximumDistance = 0;

    var distanceMap = [];
    for (let r = 0; r < gridHeight; r++) {
        distanceMap.push(Array(gridWidth).fill(-1));
    }

    while (queueOfCells.length > 0) {
        const [cellRow, cellCol, currentDistance] = queueOfCells.shift();

        if (distanceMap[cellRow][cellCol] !== -1) {
            continue;
        }

        distanceMap[cellRow][cellCol] = currentDistance;
        maximumDistance = Math.max(maximumDistance, currentDistance);

        const nextDistanceValue = currentDistance + 1;

        // Check and add neighbor: Down
        const neighborRowDown = cellRow + 1;
        if (neighborRowDown < gridHeight) {
            queueOfCells.push([neighborRowDown, cellCol, nextDistanceValue]);
        }

        // Check and add neighbor: Up
        const neighborRowUp = cellRow - 1;
        if (neighborRowUp >= 0) {
            queueOfCells.push([neighborRowUp, cellCol, nextDistanceValue]);
        }

        // Check and add neighbor: Right
        const neighborColRight = cellCol + 1;
        if (neighborColRight < gridWidth) {
            queueOfCells.push([cellRow, neighborColRight, nextDistanceValue]);
        }

        // Check and add neighbor: Left
        const neighborColLeft = cellCol - 1;
        if (neighborColLeft >= 0) {
            queueOfCells.push([cellRow, neighborColLeft, nextDistanceValue]);
        }
    }

    return maximumDistance;
}
