const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
const contentLines = fileContent.trim().split("\n");

const numberGrid = contentLines.slice(0, 9).map(lineStr => {
    const parsedRow = lineStr.split(",").map(Number);
    return parsedRow;
});

let overallMaximumSum = 0;

function explorePaths(rowIndex, colIndex, currentAccumulatedSum) {
    const lastRowIndex = numberGrid.length - 1;
    const nextRowIndex = rowIndex + 1;
    const gridMidpointRow = (numberGrid.length - 1) / 2;

    if (rowIndex === lastRowIndex) {
        overallMaximumSum = Math.max(overallMaximumSum, currentAccumulatedSum);
        return;
    }

    if (rowIndex < gridMidpointRow) {
        explorePaths(nextRowIndex, colIndex, currentAccumulatedSum + numberGrid[nextRowIndex][colIndex]);
        explorePaths(nextRowIndex, colIndex + 1, currentAccumulatedSum + numberGrid[nextRowIndex][colIndex + 1]);
    } else {
        const nextRowActualLength = numberGrid[nextRowIndex].length;
        const potentialLeftCol = colIndex - 1;

        if (potentialLeftCol >= 0) {
            explorePaths(nextRowIndex, potentialLeftCol, currentAccumulatedSum + numberGrid[nextRowIndex][potentialLeftCol]);
        }

        if (colIndex < nextRowActualLength) {
            explorePaths(nextRowIndex, colIndex, currentAccumulatedSum + numberGrid[nextRowIndex][colIndex]);
        }
    }
}

explorePaths(0, 0, numberGrid[0][0]);

console.log(overallMaximumSum);
