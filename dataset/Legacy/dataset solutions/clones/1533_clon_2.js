// This script reads a numerical input, calculates values in a 2D grid using dynamic programming,
// and then computes a specific sum from that grid, finally outputting the result modulo a constant.

const rawData = require("fs").readFileSync("/dev/stdin", "utf8"); // Acquire all data from standard input, decoded as UTF-8.

const dataRows = rawData.split('\n'); // Divide the acquired data into an array of individual lines.
let matrixSize = parseInt(dataRows[0].trim(), 10); // Extract the first line, remove leading/trailing whitespace, and convert it to an integer.

const moduloVal = 1000000007; // Establish a large prime number to be used for all modulo operations.

// Construct a two-dimensional array (gridMatrix) with dimensions matrixSize by matrixSize.
// Each cell within this matrix is initially populated with the value 1.
const gridMatrix = Array(matrixSize).fill(null).map(() => Array(matrixSize).fill(1));

// Iterate through the gridMatrix to compute values based on a recurrence relation.
// For each cell (rowIdx, colIdx), its value is the sum of the cell directly above it
// (rowIdx-1, colIdx) and the cell immediately to its left (rowIdx, colIdx-1),
// with the result taken modulo moduloVal.
for (let rowIdx = 1; rowIdx < matrixSize; ++rowIdx) {
    for (let colIdx = 1; colIdx < matrixSize; ++colIdx) {
        gridMatrix[rowIdx][colIdx] = (gridMatrix[rowIdx - 1][colIdx] + gridMatrix[rowIdx][colIdx - 1]) % moduloVal;
    }
}

let totalResult = 0; // Initialize a variable to accumulate the final computed sum.

// Determine an upper bound for the subsequent iteration, calculated as the floor of matrixSize divided by 3.
const limitVal = Math.floor(matrixSize / 3);

// Loop from zero up to (but not including) limitVal.
// In each iteration, add a specific element from the gridMatrix to totalResult.
// The indices for accessing gridMatrix are dynamically calculated using iterCount and matrixSize.
for (let iterCount = 0; iterCount < limitVal; ++iterCount) {
    totalResult += gridMatrix[iterCount][matrixSize - (iterCount + 1) * 3];
}

// Display the final accumulated totalResult, after applying the moduloVal, to the console.
console.log(totalResult % moduloVal);
