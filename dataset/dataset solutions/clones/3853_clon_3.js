'use strict'

function extractGridDimensions(dimensionString) {
    const parts = dimensionString.split(' ');
    const heightValue = Number(parts[0]);
    const widthValue = Number(parts[1]);
    return { height: heightValue, width: widthValue };
}

function isWithinBounds(rowCoordinate, colCoordinate, maxRows, maxCols) {
    return rowCoordinate >= 0 && rowCoordinate < maxRows && colCoordinate >= 0 && colCoordinate < maxCols;
}

function processGrid(inputString) {
    const inputLines = inputString.split('\n');

    const { height: gridHeight, width: gridWidth } = extractGridDimensions(inputLines[0]);

    const gridContentLines = inputLines.slice(1, inputLines.length - 1);
    const gridData = gridContentLines.map(gridLine => gridLine.split(''));

    const deltaRows = [-1, 0, 1, 0];
    const deltaCols = [0, 1, 0, -1];
    const numberOfDirections = 4;

    let allCellsSatisfyCondition = true;

    for (let currentRow = 0; currentRow < gridHeight; currentRow++) {
        for (let currentCol = 0; currentCol < gridWidth; currentCol++) {
            if (gridData[currentRow][currentCol] === '.') {
                continue;
            }

            let hashNeighborCount = 0;

            for (let directionIndex = 0; directionIndex < numberOfDirections; directionIndex++) {
                const nextRow = currentRow + deltaRows[directionIndex];
                const nextCol = currentCol + deltaCols[directionIndex];

                if (isWithinBounds(nextRow, nextCol, gridHeight, gridWidth)) {
                    if (gridData[nextRow][nextCol] === '#') {
                        hashNeighborCount++;
                    }
                }
            }

            if (hashNeighborCount === 0) {
                allCellsSatisfyCondition = false;
            }
        }
    }

    const finalOutputStatus = allCellsSatisfyCondition ? 'Yes' : 'No';
    console.log(finalOutputStatus);
}

processGrid(require("fs").readFileSync("/dev/stdin", "utf8"));
