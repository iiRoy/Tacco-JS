let globalMaxSum = 0;

function explorePath(currentRow, currentCol, currentPathSum) {
    memoGrid[currentRow][currentCol] = currentPathSum;

    const lastRowIndex = inputGrid.length - 1;
    const midRowThreshold = (inputGrid.length - 1) / 2;

    if (currentRow === lastRowIndex) {
        globalMaxSum = Math.max(globalMaxSum, currentPathSum);
    } else {
        const nextRowIndex = currentRow + 1;

        // Logic for the upper half of the grid
        if (currentRow < midRowThreshold) {
            // Option 1: Move to (nextRowIndex, currentCol)
            const nextCellSum1 = currentPathSum + inputGrid[nextRowIndex][currentCol];
            if (memoGrid[nextRowIndex][currentCol] < nextCellSum1) {
                explorePath(nextRowIndex, currentCol, nextCellSum1);
            }

            // Option 2: Move to (nextRowIndex, currentCol + 1)
            const targetCol2 = currentCol + 1;
            const nextCellSum2 = currentPathSum + inputGrid[nextRowIndex][targetCol2];
            if (memoGrid[nextRowIndex][targetCol2] < nextCellSum2) {
                explorePath(nextRowIndex, targetCol2, nextCellSum2);
            }
        }
        // Logic for the lower half of the grid
        else { // currentRow >= midRowThreshold
            // Option 1: Move to (nextRowIndex, currentCol - 1)
            const targetCol3 = currentCol - 1;
            if (targetCol3 >= 0) {
                const nextCellSum3 = currentPathSum + inputGrid[nextRowIndex][targetCol3];
                if (memoGrid[nextRowIndex][targetCol3] < nextCellSum3) {
                    explorePath(nextRowIndex, targetCol3, nextCellSum3);
                }
            }

            // Option 2: Move to (nextRowIndex, currentCol)
            const currentGridRowLength = inputGrid[currentRow].length;
            if (currentCol < currentGridRowLength - 1) {
                const nextCellSum4 = currentPathSum + inputGrid[nextRowIndex][currentCol];
                if (memoGrid[nextRowIndex][currentCol] < nextCellSum4) {
                    explorePath(nextRowIndex, currentCol, nextCellSum4);
                }
            }
        }
    }
}

const rawInputData = require('fs').readFileSync('/dev/stdin', 'utf8');
const inputLines = rawInputData.trim().split("\n");

let inputGrid = [];
let memoGrid = [];

// Process input lines to populate inputGrid
inputGrid = inputLines.map(lineContent => {
    return lineContent.split(",").map(Number);
});

// Initialize memoGrid with zeros, matching the structure of inputGrid
memoGrid = inputGrid.map(rowNumericValues => {
    return rowNumericValues.map(() => 0);
});

// Start the path exploration from the top-left corner
explorePath(0, 0, inputGrid[0][0]);

console.log(globalMaxSum);
