let overallMaxSum = 0;

function parseInputGrid(rawInputString) {
    const trimmedInput = rawInputString.trim();
    const inputLines = trimmedInput.split("\n");
    const gridData = [];

    inputLines.forEach(function(lineContent) {
        const parsedRow = lineContent.split(",").map(Number);
        gridData.push(parsedRow);
    });
    return gridData;
}

function traverseGrid(rowIdx, colIdx, currentPathSum) {
    const lastRowIndex = dataGrid.length - 1;
    const midpointThreshold = lastRowIndex / 2;

    if (rowIdx === lastRowIndex) {
        overallMaxSum = Math.max(overallMaxSum, currentPathSum);
        return;
    }

    const nextRow = rowIdx + 1;

    if (rowIdx < midpointThreshold) {
        const valueAtNextCol = dataGrid[nextRow][colIdx];
        const valueAtNextColPlusOne = dataGrid[nextRow][colIdx + 1];

        traverseGrid(nextRow, colIdx, currentPathSum + valueAtNextCol);
        traverseGrid(nextRow, colIdx + 1, currentPathSum + valueAtNextColPlusOne);
    } else {
        const currentRowLength = dataGrid[rowIdx].length;

        if (colIdx - 1 >= 0) {
            const valueAtPrevCol = dataGrid[nextRow][colIdx - 1];
            traverseGrid(nextRow, colIdx - 1, currentPathSum + valueAtPrevCol);
        }

        if (colIdx < currentRowLength - 1) {
            const valueAtCurrentCol = dataGrid[nextRow][colIdx];
            traverseGrid(nextRow, colIdx, currentPathSum + valueAtCurrentCol);
        }
    }
}

const rawInputData = require('fs').readFileSync('/dev/stdin', 'utf8');
const dataGrid = parseInputGrid(rawInputData);

traverseGrid(0, 0, dataGrid[0][0]);

console.log(overallMaxSum);
