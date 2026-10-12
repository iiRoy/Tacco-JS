var inputBuffer = [];
var gridHeight, gridWidth;
var totalBlackCells;
var gridData;
var firstBlackLocation = null;

var ioInterface = require('readline');

var inputReader = ioInterface.createInterface({
    input: process.stdin,
    output: process.stdout,
});

inputReader.on('line', function (currentLine) {
    inputBuffer.push(currentLine);
});

inputReader.on('close', function () {
    const dimensions = inputBuffer[0].split(" ");
    gridHeight = Number(dimensions[0]);
    gridWidth = Number(dimensions[1]);

    gridData = inputBuffer.slice(1).map(rowString => Array.from(rowString));
    
    totalBlackCells = 0;
    for (let r = 0; r < gridHeight; r++) {
        for (let c = 0; c < gridWidth; c++) {
            if (gridData[r][c] === '#') {
                totalBlackCells++;
                if (firstBlackLocation === null) {
                    firstBlackLocation = { row: r, col: c };
                }
            }
        }
    }

    if (totalBlackCells === 0) {
        console.log("Yes");
        return;
    }

    console.log(determineConnectivity(gridData, gridHeight, gridWidth, totalBlackCells, firstBlackLocation));
});

function determineConnectivity(currentGrid, heightDim, widthDim, initialBlackCount, startPoint) {
    const visitedCoordinates = new Set();
    let connectedCount = 0;

    const neighborOffsets = [
        { dr: 0, dc: 1 },
        { dr: 0, dc: -1 },
        { dr: 1, dc: 0 },
        { dr: -1, dc: 0 }
    ];

    function explorePath(r, c) {
        const coordinateKey = `${r},${c}`;

        if (r < 0 || r >= heightDim || c < 0 || c >= widthDim ||
            visitedCoordinates.has(coordinateKey) ||
            currentGrid[r][c] === '.') {
            return;
        }

        visitedCoordinates.add(coordinateKey);
        connectedCount++;

        for (const offset of neighborOffsets) {
            explorePath(r + offset.dr, c + offset.dc);
        }
    }

    explorePath(startPoint.row, startPoint.col);

    return connectedCount === initialBlackCount ? "Yes" : "No";
}
