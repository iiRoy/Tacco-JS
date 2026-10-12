// This script reads input from stdin to populate a grid based on specific rules.
// It simulates a "snake" filling a grid, changing direction when hitting boundaries.

// Read all input from standard input, decode as UTF-8, trim whitespace, and split by newline.
let inputData = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n');

// Extract the first line which contains grid dimensions.
let firstLineParts = inputData.shift().split(' ');

// Parse grid height and width from the first line.
// Using unary plus for type coercion from string to number.
let gridHeight = +firstLineParts.shift();
let gridWidth = +firstLineParts.shift();

// Parse the number of segments from the next line.
let numSegments = +inputData.shift();

// Initialize the 2D array (grid) that will store the results.
let resultGrid = [];
// Populate the grid with empty arrays for each row.
for (let idx = 0; idx < gridHeight; idx++) {
    resultGrid[idx] = new Array(gridWidth);
}

// Initialize current position within the grid.
let currentRow = 0;
let currentCol = 0;

// Extract the segment values from the next input line.
let segmentValues = inputData.shift().split(' ');

// Initialize the current filling direction. 'R' for right, 'L' for left.
let direction = 'R';

// Iterate through each segment.
for (let segmentIdx = 0; segmentIdx < numSegments; segmentIdx++) {
    // Get the length of the current segment, converting it to a number.
    let segmentLength = +segmentValues[segmentIdx];

    // Fill cells according to the current segment's length.
    for (let fillCount = 0; fillCount < segmentLength; fillCount++) {
        // If the current cell is not yet filled, assign the segment index (plus one for 1-based indexing).
        if (resultGrid[currentRow][currentCol] === undefined) {
            resultGrid[currentRow][currentCol] = segmentIdx + 1;
        }

        // Check for boundary conditions and change direction/row if necessary.
        if (currentCol === gridWidth - 1 && direction === 'R') {
            // Reached rightmost column, move to next row and change direction to left.
            currentRow++;
            direction = 'L';
        } else if (currentCol === 0 && direction === 'L') {
            // Reached leftmost column, move to next row and change direction to right.
            currentRow++;
            direction = 'R';
        } else if (direction === 'R') {
            // Move right within the current row.
            currentCol++;
        } else if (direction === 'L') {
            // Move left within the current row.
            currentCol--;
        }
    }
}

// Format the result grid for output: each row's elements joined by space, and rows joined by newline.
console.log(resultGrid.map(gridRow => gridRow.join(' ')).join('\n'));
