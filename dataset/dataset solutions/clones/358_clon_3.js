function explode(rowCoord, colCoord, targetVal) {
    recursionDepthCounter++;
    const MAX_RECURSION_LIMIT = 50;
    if (recursionDepthCounter > MAX_RECURSION_LIMIT) {
        return;
    }

    const rowOffsets = [0, 0, -1, 1];
    const colOffsets = [-1, 1, 0, 0];
    const directionCount = 4;

    for (let directionIndex = 0; directionIndex < directionCount; directionIndex++) {
        const nextRow = rowCoord + rowOffsets[directionIndex];
        const nextCol = colCoord + colOffsets[directionIndex];

        const currentGridRows = gridDimensions[0];
        const currentGridCols = gridDimensions[1];

        if (nextRow < 0 || nextRow >= currentGridRows || nextCol < 0 || nextCol >= currentGridCols) {
            continue;
        }

        const adjacentCellValue = currentGridData[nextRow][nextCol];
        if (targetVal === adjacentCellValue) {
            currentGridData[nextRow][nextCol] = 0;
            explode(nextRow, nextCol, targetVal);
        }
    }
}

const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
let inputLinesArray = fileContent.trim().split("\n");

let gridDimensions;
let recursionDepthCounter;
let currentGridData;

while (true) {
    const dimensionStrings = inputLinesArray.shift().split(" ");
    gridDimensions = dimensionStrings.map(Number);

    const numRows = gridDimensions[0];
    const numCols = gridDimensions[1];

    if (numRows === 0 && numCols === 0) {
        break;
    }

    currentGridData = [];
    for (let rowIndex = 0; rowIndex < numRows; rowIndex++) {
        const rowCharacters = inputLinesArray.shift().split("");
        currentGridData.push(rowCharacters);
    }

    let foundClusterCount = 0;
    recursionDepthCounter = 0;

    const searchableSymbols = new Set(["@", "#", "*"]);

    for (let rowIndex = 0; rowIndex < numRows; rowIndex++) {
        for (let colIndex = 0; colIndex < numCols; colIndex++) {
            const cellContent = currentGridData[rowIndex][colIndex];
            if (searchableSymbols.has(cellContent)) {
                foundClusterCount++;
                currentGridData[rowIndex][colIndex] = "m";
                explode(rowIndex, colIndex, cellContent);
            }
        }
    }
    console.log(foundClusterCount);
}
