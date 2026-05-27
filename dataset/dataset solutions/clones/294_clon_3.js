var pyramidData = [];
var maxPathSumsToCell = [];
var overallMaxSum = 0;

function parseInputAndInitializeData() {
    var fileSystem = require('fs');
    var rawInput = fileSystem.readFileSync('/dev/stdin', 'utf8');
    var inputLines = rawInput.trim().split("\n");

    inputLines.forEach(function(lineContent) {
        var rowNumbers = lineContent.split(",").map(Number);
        var zeroRow = rowNumbers.map(function() { return 0; });
        pyramidData.push(rowNumbers);
        maxPathSumsToCell.push(zeroRow);
    });
}

function traversePyramid(currentRow, currentCol, currentPathSum) {
    // Update the memoization table with the current path sum if it's greater
    // This implicitly handles the case where a cell is visited multiple times
    // and we only care about the path that yields the maximum sum to that cell.
    maxPathSumsToCell[currentRow][currentCol] = currentPathSum;

    const lastRowIndex = pyramidData.length - 1;

    // Base case: If we've reached the last row, update the overall maximum sum
    if (currentRow === lastRowIndex) {
        overallMaxSum = Math.max(overallMaxSum, currentPathSum);
        return;
    }

    const nextRow = currentRow + 1;
    const midPointRowThreshold = (lastRowIndex / 2);

    // Determine the next possible moves based on whether we are in the upper or lower half of the pyramid
    if (currentRow < midPointRowThreshold) {
        // Upper half: moves are to (nextRow, currentCol) and (nextRow, currentCol + 1)

        // Path 1: Move straight down
        const nextCol1 = currentCol;
        const potentialNextSum1 = currentPathSum + pyramidData[nextRow][nextCol1];
        if (maxPathSumsToCell[nextRow][nextCol1] < potentialNextSum1) {
            traversePyramid(nextRow, nextCol1, potentialNextSum1);
        }

        // Path 2: Move down-right
        const nextCol2 = currentCol + 1;
        const potentialNextSum2 = currentPathSum + pyramidData[nextRow][nextCol2];
        if (maxPathSumsToCell[nextRow][nextCol2] < potentialNextSum2) {
            traversePyramid(nextRow, nextCol2, potentialNextSum2);
        }
    } else {
        // Lower half: moves are to (nextRow, currentCol - 1) and (nextRow, currentCol)

        // Path 1: Move down-left
        const nextCol1 = currentCol - 1;
        if (nextCol1 >= 0) { // Ensure the column index is valid
            const potentialNextSum1 = currentPathSum + pyramidData[nextRow][nextCol1];
            if (maxPathSumsToCell[nextRow][nextCol1] < potentialNextSum1) {
                traversePyramid(nextRow, nextCol1, potentialNextSum1);
            }
        }

        // Path 2: Move straight down (relative to the current column in the next row)
        const nextCol2 = currentCol;
        // Original condition: x < yx[y].length - 1
        // This means currentCol < pyramidData[currentRow].length - 1
        // This ensures currentCol is not the last element of the current row,
        // which implies that moving straight down to nextCol2 (which is currentCol)
        // is a valid path in the context of the pyramid's structure.
        if (currentCol < pyramidData[currentRow].length - 1) {
            const potentialNextSum2 = currentPathSum + pyramidData[nextRow][nextCol2];
            if (maxPathSumsToCell[nextRow][nextCol2] < potentialNextSum2) {
                traversePyramid(nextRow, nextCol2, potentialNextSum2);
            }
        }
    }
}

// Main execution flow
parseInputAndInitializeData();
traversePyramid(0, 0, pyramidData[0][0]);
console.log(overallMaxSum);
