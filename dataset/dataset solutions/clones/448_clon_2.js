var rawData = require('fs').readFileSync('/dev/stdin', 'utf8');
// Process the raw input data into an array of lines
var lineSegments = rawData.trim().split("\n");

// Main loop to process multiple test cases
while (true) {
    // Extract width and height for the current grid
    var dimensions = lineSegments.shift().split(" ").map(Number);
    var widthVal = dimensions[0];
    var heightVal = dimensions[1];

    // If both dimensions are zero, it's the end of input
    if (widthVal === 0 && heightVal === 0) {
        break;
    }

    // Initialize the grid layout (mapLayout)
    var gridData = [];
    for (var rowIdx = 0; rowIdx < heightVal; rowIdx++) {
        gridData.push(lineSegments.shift().split(" ").map(Number));
    }

    // Initialize the dynamic programming table (pathCounts)
    var pathCounts = [];
    for (var rowIdx = 0; rowIdx < heightVal; rowIdx++) {
        pathCounts[rowIdx] = [];
        for (var colIdx = 0; colIdx < widthVal; colIdx++) {
            pathCounts[rowIdx][colIdx] = 0;
        }
    }

    // Fill the dynamic programming table
    for (var rowIdx = 0; rowIdx < heightVal; rowIdx++) {
        for (var colIdx = 0; colIdx < widthVal; colIdx++) {
            // Base case: first row, if the cell is traversable (0)
            if (rowIdx === 0 && gridData[rowIdx][colIdx] === 0) {
                pathCounts[rowIdx][colIdx] = 1;
            }
            // For subsequent rows
            else if (rowIdx >= 1) {
                // Calculate paths from previous row cells, considering obstacles (2)
                var diagLeftUp = (colIdx === 0 || gridData[rowIdx - 1][colIdx - 1] === 2) ? 0 : pathCounts[rowIdx - 1][colIdx - 1];
                var straightUp = (gridData[rowIdx - 1][colIdx] === 2) ? 0 : pathCounts[rowIdx - 1][colIdx];
                var diagRightUp = (colIdx === widthVal - 1 || gridData[rowIdx - 1][colIdx + 1] === 2) ? 0 : pathCounts[rowIdx - 1][colIdx + 1];
                // Special case for two steps up, if the cell two rows above is an obstacle (2)
                var twoStepsUp = (rowIdx >= 2 && gridData[rowIdx - 2][colIdx] === 2) ? pathCounts[rowIdx - 2][colIdx] : 0;

                // Update path counts based on current cell type
                if (gridData[rowIdx][colIdx] === 0) { // Traversable cell
                    pathCounts[rowIdx][colIdx] += diagLeftUp + straightUp + diagRightUp + twoStepsUp;
                } else if (gridData[rowIdx][colIdx] === 1) { // Blocked cell
                    pathCounts[rowIdx][colIdx] = 0;
                } else if (gridData[rowIdx][colIdx] === 2) { // Special cell (only straight up and two steps up paths)
                    pathCounts[rowIdx][colIdx] += straightUp + twoStepsUp;
                }
            }
        }
    }

    // Calculate the total number of paths ending in the last two rows
    var totalPaths = 0;
    for (var rowIdx = heightVal - 2; rowIdx < heightVal; rowIdx++) {
        for (var colIdx = 0; colIdx < widthVal; colIdx++) {
            // If in the second to last row and the cell is special (2)
            if (rowIdx === heightVal - 2 && gridData[rowIdx][colIdx] === 2) {
                totalPaths += pathCounts[rowIdx][colIdx];
            }
            // If in the last row and the cell is traversable (0) or special (2)
            if (rowIdx === heightVal - 1 && (gridData[rowIdx][colIdx] === 0 || gridData[rowIdx][colIdx] === 2)) {
                totalPaths += pathCounts[rowIdx][colIdx];
            }
        }
    }
    // Output the final path count for the current test case
    console.log(totalPaths);
}
