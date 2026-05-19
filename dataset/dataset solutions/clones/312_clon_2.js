var rawData = require('fs').readFileSync('/dev/stdin', 'utf8'); // Read input from standard input
var lines = rawData.trim().split("\n"); // Split the input string into an array of lines
var dimension = lines.shift() - 0; // Extract the first line as the grid dimension, convert to number
var gridData = []; // Array to store the input grid with padding
var initialRow = []; // Temporary array to create the first row of zeros

// Populate the initial row with zeros for 1-based indexing convenience
for (var rowIdx = 0; rowIdx < dimension + 1; rowIdx++) {
    initialRow.push(0);
}
gridData.push(initialRow); // Add the row of zeros as the first row

// Process remaining lines to form the grid data
for (var rowIdx = 0; rowIdx < dimension; rowIdx++) {
    // Prepend "0 " to each line, split by space, and convert elements to numbers
    gridData.push(("0 " + lines.shift()).split(" ").map(Number));
}

dimension = dimension + 1; // Adjust dimension to account for the added padding row/column

var prefixSumMatrix = []; // Initialize the 2D array for storing prefix sums

// Initialize the first column of the prefix sum matrix
for (var rowIdx = 0; rowIdx < dimension; rowIdx++) {
    prefixSumMatrix[rowIdx] = []; // Create inner array for each row
    prefixSumMatrix[rowIdx][0] = gridData[rowIdx][0]; // Copy the first element from gridData
}

// Calculate horizontal prefix sums for each row
for (var rowIdx = 0; rowIdx < dimension; rowIdx++) {
    for (var colIdx = 1; colIdx < dimension; colIdx++) {
        prefixSumMatrix[rowIdx][colIdx] = prefixSumMatrix[rowIdx][colIdx - 1] + gridData[rowIdx][colIdx];
    }
}

// Calculate vertical prefix sums to complete the 2D prefix sum matrix
for (var rowIdx = 1; rowIdx < dimension; rowIdx++) {
    for (var colIdx = 0; colIdx < dimension; colIdx++) {
        prefixSumMatrix[rowIdx][colIdx] = prefixSumMatrix[rowIdx - 1][colIdx] + prefixSumMatrix[rowIdx][colIdx];
    }
}

var maximumSum = -Infinity; // Initialize the maximum submatrix sum to negative infinity

// Iterate through all possible top-left corners (rowIdx, colIdx)
for (var rowIdx = 0; rowIdx < dimension; rowIdx++) {
    for (var colIdx = 0; colIdx < dimension; colIdx++) {
        // Iterate through all possible bottom-right corners (rowEnd, colEnd)
        for (var rowEnd = rowIdx + 1; rowEnd < dimension; rowEnd++) {
            for (var colEnd = colIdx + 1; colEnd < dimension; colEnd++) {
                // Calculate the sum of the current submatrix using the prefix sum technique
                var currentSubmatrixSum = prefixSumMatrix[rowEnd][colEnd] - prefixSumMatrix[rowIdx][colEnd] - prefixSumMatrix[rowEnd][colIdx] + prefixSumMatrix[rowIdx][colIdx];
                // Update the overall maximum sum if the current submatrix sum is greater
                if (maximumSum < currentSubmatrixSum) {
                    maximumSum = currentSubmatrixSum;
                }
            }
        }
    }
}

console.log(maximumSum); // Output the final maximum submatrix sum found
