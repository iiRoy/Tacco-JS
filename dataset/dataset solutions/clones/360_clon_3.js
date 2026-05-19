function isWithinBounds(row, col, maxRows, maxCols) {
    return row >= 0 && row < maxRows && col >= 0 && col < maxCols;
}

function exploreAdjacent(rowCoord, colCoord, targetValue, maxRows, maxCols, gridData) {
    const rowOffsets = [0, 0, -1, 1];
    const colOffsets = [-1, 1, 0, 0];

    for (let offsetIndex = 0; offsetIndex < rowOffsets.length; offsetIndex++) {
        const nextRow = rowCoord + rowOffsets[offsetIndex];
        const nextCol = colCoord + colOffsets[offsetIndex];

        if (!isWithinBounds(nextRow, nextCol, maxRows, maxCols)) {
            continue;
        }

        if (gridData[nextRow][nextCol] === targetValue) {
            gridData[nextRow][nextCol] = 0;
            exploreAdjacent(nextRow, nextCol, targetValue, maxRows, maxCols, gridData);
        }
    }
}

function readGridData(numberOfRows, inputSourceArray) {
    const gridStructure = [];
    for (let rIdx = 0; rIdx < numberOfRows; rIdx++) {
        const rowCharacterArray = inputSourceArray.shift().split("");
        gridStructure.push(rowCharacterArray);
    }
    return gridStructure;
}

function countAndClearComponents(gridMatrix, numRows, numCols) {
    let totalComponentCount = 0;
    const validComponentSymbols = ["@", "#", "*"];

    for (let r = 0; r < numRows; r++) {
        for (let c = 0; c < numCols; c++) {
            const currentCellSymbol = gridMatrix[r][c];
            if (validComponentSymbols.includes(currentCellSymbol)) {
                totalComponentCount++;
                gridMatrix[r][c] = 0;
                exploreAdjacent(r, c, currentCellSymbol, numRows, numCols, gridMatrix);
            }
        }
    }
    return totalComponentCount;
}

const fileSystemModule = require('fs');
const rawInputString = fileSystemModule.readFileSync('/dev/stdin', 'utf8');
let inputLinesArray = rawInputString.trim().split("\n");

const TERMINATION_VALUE = 0;

while (true) {
    const dimensionLine = inputLinesArray.shift();
    const gridDimensions = dimensionLine.split(" ").map(Number);
    const currentNumRows = gridDimensions[0];
    const currentNumCols = gridDimensions[1];

    if (currentNumRows === TERMINATION_VALUE && currentNumCols === TERMINATION_VALUE) {
        break;
    }

    const currentGridMatrix = readGridData(currentNumRows, inputLinesArray);

    const finalComponentResult = countAndClearComponents(currentGridMatrix, currentNumRows, currentNumCols);

    console.log(finalComponentResult);
}
