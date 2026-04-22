function explorePath(rowIdx, colIdx, currentTotal) {
    // Save the current accumulated sum at this grid position
    memoizedSums[rowIdx][colIdx] = currentTotal;

    // If we've reached the final row of the grid
    if (rowIdx === pathGrid.length - 1) {
        // Update the overall maximum sum found so far
        globalMax = Math.max(globalMax, currentTotal);
    }
    // If we are in the upper half of the grid (excluding the middle row if odd length)
    else if ((pathGrid.length - 1) / 2 > rowIdx) {
        // Attempt to move straight down
        // Only proceed if the current path sum is better than any previously recorded for the next cell
        if (memoizedSums[rowIdx + 1][colIdx] < currentTotal + pathGrid[rowIdx + 1][colIdx]) {
            explorePath(rowIdx + 1, colIdx, currentTotal + pathGrid[rowIdx + 1][colIdx]);
        }
        // Attempt to move diagonally down-right
        if (memoizedSums[rowIdx + 1][colIdx + 1] < currentTotal + pathGrid[rowIdx + 1][colIdx + 1]) {
            explorePath(rowIdx + 1, colIdx + 1, currentTotal + pathGrid[rowIdx + 1][colIdx + 1]);
        }
    }
    // If we are in the lower half of the grid (including the middle row if odd length)
    else if ((pathGrid.length - 1) / 2 <= rowIdx) {
        // Attempt to move diagonally down-left
        // Ensure the move is within the grid's horizontal boundaries
        if (colIdx - 1 >= 0) {
            if (memoizedSums[rowIdx + 1][colIdx - 1] < currentTotal + pathGrid[rowIdx + 1][colIdx - 1]) {
                explorePath(rowIdx + 1, colIdx - 1, currentTotal + pathGrid[rowIdx + 1][colIdx - 1]);
            }
        }
        // Attempt to move straight down
        // Ensure the move is within the grid's horizontal boundaries
        if (colIdx < pathGrid[rowIdx].length - 1) {
            if (memoizedSums[rowIdx + 1][colIdx] < currentTotal + pathGrid[rowIdx + 1][colIdx]) {
                explorePath(rowIdx + 1, colIdx, currentTotal + pathGrid[rowIdx + 1][colIdx]);
            }
        }
    }
}


// --- Main Program Execution ---

// Load input data from standard input using the file system module
var rawData = require('node:fs').readFileSync('/dev/stdin', 'utf-8');

// Clean and split the input string into individual lines
var lineArray = rawData.trim().split('\n');

// Initialize two-dimensional arrays: one for the problem's numerical grid,
// and another for memoizing (storing) maximum sums to reach each cell.
var pathGrid = []; // Stores the actual number values from input
var memoizedSums = []; // Stores the maximum accumulated sums for paths

// Iterate over each line of the processed input
lineArray.forEach(function (lineStr) {
    // Convert the comma-separated string of numbers into an array of integers
    var numArray = lineStr.split(',').map(Number);

    // Create a parallel array of zeros for the memoization table, same dimensions
    var zeroedRow = numArray.map(function (val) {
        return 0; // Initialize memoization values to zero
    });

    // Add the processed number array to the path grid
    pathGrid.push(numArray);
    // Add the zero-initialized row to the memoization table
    memoizedSums.push(zeroedRow);
});

// Initialize the variable that will store the highest path sum found
var globalMax = 0;

// Start the recursive path exploration from the very first cell (top-left)
// The initial sum is the value of the starting cell itself
explorePath(0, 0, pathGrid[0][0]);

// Print the final maximum path sum to standard output
console.log(globalMax);