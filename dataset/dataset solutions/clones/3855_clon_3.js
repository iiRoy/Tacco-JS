var inputLines = [];
var initialBlackCellCount, gridMap, gridHeight, gridWidth;
var ioHandler = require('readline');

var lineReader = ioHandler.createInterface({
    input: process.stdin,
    output: process.stdout,
});

lineReader.on('line', function (currentLine) {
    inputLines.push(currentLine);
});

lineReader.on('close', function () {
    const firstLineData = inputLines[0].split(" ");
    gridHeight = Number(firstLineData[0]);
    gridWidth = Number(firstLineData[1]);

    const gridContentLines = inputLines.slice(1);
    gridMap = gridContentLines.map(lineStr => lineStr.split(""));

    const blackCellChar = "#";
    const visitedCellChar = ".";

    initialBlackCellCount = 0;
    var processingQueue = [];

    for (var rowIndex = 0; rowIndex < gridHeight; rowIndex++) {
        for (var colIndex = 0; colIndex < gridWidth; colIndex++) {
            if (gridMap[rowIndex][colIndex] === blackCellChar) {
                processingQueue.push([rowIndex, colIndex]);
                initialBlackCellCount++;
            }
        }
    }
    console.log(exploreConnectedComponents(processingQueue, blackCellChar, visitedCellChar));
});

function exploreConnectedComponents(processingQueue, blackChar, visitedChar) {
    var visitedBlackCells = 0;
    var resultString = "No";

    const neighborDeltas = [
        [0, 1],  // Right
        [0, -1], // Left
        [1, 0],  // Down
        [-1, 0]  // Up
    ];

    while (processingQueue.length > 0) {
        var currentCellCoords = processingQueue.shift();
        var rowCoord = currentCellCoords[0];
        var colCoord = currentCellCoords[1];

        for (let k = 0; k < neighborDeltas.length; k++) {
            const deltaRow = neighborDeltas[k][0];
            const deltaCol = neighborDeltas[k][1];

            const nextRow = rowCoord + deltaRow;
            const nextCol = colCoord + deltaCol;

            const isRowValid = nextRow >= 0 && nextRow < gridHeight;
            const isColValid = nextCol >= 0 && nextCol < gridWidth;

            if (isRowValid && isColValid) {
                if (gridMap[nextRow][nextCol] === blackChar) {
                    gridMap[nextRow][nextCol] = visitedChar;
                    visitedBlackCells++;
                    processingQueue.push([nextRow, nextCol]);
                }
            }
        }
    }
    
    if (visitedBlackCells === initialBlackCellCount) {
        resultString = "Yes";
    }

    return resultString;
}
