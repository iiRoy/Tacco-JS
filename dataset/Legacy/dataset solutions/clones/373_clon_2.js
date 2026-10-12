function rotateMatrix(inputGrid) {
    // Declare a new array to store the result of the rotation.
    var rotatedGrid = [];

    // Initialize the rows of the new 8x8 grid.
    for (var rowIdx = 0; rowIdx < 8; rowIdx++) {
        rotatedGrid[rowIdx] = [];
    }

    // Iterate through the input grid to perform a 90-degree clockwise rotation.
    // The element at (rowIdx, colIdx) in the new grid comes from (7 - colIdx, rowIdx) in the original.
    for (var rowIdx = 0; rowIdx < 8; rowIdx++) {
        for (var colIdx = 0; colIdx < 8; colIdx++) {
            rotatedGrid[rowIdx][colIdx] = inputGrid[7 - colIdx][rowIdx];
        }
    }

    // Return the newly formed rotated matrix.
    return rotatedGrid;
}

// Import the Node.js file system module to read input.
var fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');

// Trim any leading/trailing whitespace from the input and split it into an array of lines.
var lineArray = (fileContent.trim()).split("\n");

// Initialize a 2D array to hold the initial grid data from the input.
var currentGrid = [];

// Populate the currentGrid by splitting each line into individual characters.
// Assuming an 8x8 grid based on the problem context.
for (var idx = 0; idx < 8; idx++) {
    currentGrid.push(lineArray[idx].split(""));
}

// Perform the first 90-degree clockwise rotation.
currentGrid = rotateMatrix(currentGrid);
// Output the grid after 90 degrees of rotation.
console.log("90\n" + currentGrid.join("\n"));

// Perform the second 90-degree clockwise rotation (total 180 degrees).
currentGrid = rotateMatrix(currentGrid);
// Output the grid after 180 degrees of rotation.
console.log("180\n" + currentGrid.join("\n"));

// Perform the third 90-degree clockwise rotation (total 270 degrees).
currentGrid = rotateMatrix(currentGrid);
// Output the grid after 270 degrees of rotation.
console.log("270\n" + currentGrid.join("\n"));
