function traversePath(rowIndex, colIndex, currentTotal) {
    // Store the current path sum in the memoization table
    memoTable[rowIndex][colIndex] = currentTotal;

    // Check if we have reached the last row of the input grid
    if (rowIndex === inputGrid.length - 1) {
        // If it's the last row, update the maximum sum found so far
        maximumSum = Math.max(maximumSum, currentTotal);
    } else if ((inputGrid.length - 1) / 2 > rowIndex) {
        // If in the upper half of the grid (moving right/down)
        // Check the path going straight down
        if (memoTable[rowIndex + 1][colIndex] < currentTotal + inputGrid[rowIndex + 1][colIndex]) {
            traversePath(rowIndex + 1, colIndex, currentTotal + inputGrid[rowIndex + 1][colIndex]);
        }
        // Check the path going diagonally right-down
        if (memoTable[rowIndex + 1][colIndex + 1] < currentTotal + inputGrid[rowIndex + 1][colIndex + 1]) {
            traversePath(rowIndex + 1, colIndex + 1, currentTotal + inputGrid[rowIndex + 1][colIndex + 1]);
        }
    } else if ((inputGrid.length - 1) / 2 <= rowIndex) {
        // If in the lower half of the grid (moving left/down)
        // Check the path going diagonally left-down, if valid
        if (colIndex - 1 >= 0) {
            if (memoTable[rowIndex + 1][colIndex - 1] < currentTotal + inputGrid[rowIndex + 1][colIndex - 1]) {
                traversePath(rowIndex + 1, colIndex - 1, currentTotal + inputGrid[rowIndex + 1][colIndex - 1]);
            }
        }
        // Check the path going straight down, if valid
        if (colIndex < inputGrid[rowIndex].length - 1) {
            if (memoTable[rowIndex + 1][colIndex] < currentTotal + inputGrid[rowIndex + 1][colIndex]) {
                traversePath(rowIndex + 1, colIndex, currentTotal + inputGrid[rowIndex + 1][colIndex]);
            }
        }
    }
}

// Read input from standard input
var rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

// Process the input data
var lineArray = (rawData.trim()).split("\n");

// Initialize arrays to store the input grid and memoization table
var inputGrid = [];
var memoTable = [];

// Populate the grid and memoization table
lineArray.forEach(function(lineStr) {
    // Parse numbers for the current row
    var rowNumbers = lineStr.split(",").map(Number);
    // Create a corresponding row for the memoization table, initialized with zeros
    var zeroRow = rowNumbers.map(function(val) {
        return 0;
    });

    // Add the parsed row to the input grid
    inputGrid.push(rowNumbers);
    // Add the zero-initialized row to the memoization table
    memoTable.push(zeroRow);
});

// Initialize the maximum sum found to zero
var maximumSum = 0;

// Start the path traversal from the top-left element (0,0)
// The initial sum is the value of the starting element
traversePath(0, 0, inputGrid[0][0]);

// Output the final maximum sum
console.log(maximumSum);
