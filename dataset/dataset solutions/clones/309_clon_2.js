var rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

var lineSegments = rawData.trim().split("\n"); // Split input into individual lines

var dimension = lineSegments.shift() - 0; // Get the initial size and convert to number

var gridValues = []; // This will store the parsed grid data

var initialRow = []; // Temporary array for the first padded row
for (var rowIdx = 0; rowIdx < dimension + 1; rowIdx++) {
    initialRow.push(0); // Fill with zeros
}
gridValues.push(initialRow); // Add the zero-padded row to the grid

// Parse the remaining lines into number arrays, prepending a zero for padding
for (var rowIdx = 0; rowIdx < dimension; rowIdx++) {
    gridValues.push(("0 " + lineSegments.shift()).split(" ").map(Number));
}

dimension = dimension + 1; // Adjust dimension to include the padding

var prefixSumMatrix = []; // Initialize the 2D prefix sum array

// Initialize the prefix sum matrix rows and copy the first column values
for (var rowIdx = 0; rowIdx < dimension; rowIdx++) {
    prefixSumMatrix[rowIdx] = []; // Create an empty row
    prefixSumMatrix[rowIdx][0] = gridValues[rowIdx][0]; // Set the first element
}

// Calculate horizontal prefix sums for each row
for (var rowIdx = 0; rowIdx < dimension; rowIdx++) {
    for (var colIdx = 1; colIdx < dimension; colIdx++) {
        prefixSumMatrix[rowIdx][colIdx] = prefixSumMatrix[rowIdx][colIdx - 1] + gridValues[rowIdx][colIdx];
    }
}

// Calculate vertical prefix sums, completing the 2D prefix sum matrix
for (var rowIdx = 1; rowIdx < dimension; rowIdx++) {
    for (var colIdx = 0; colIdx < dimension; colIdx++) {
        prefixSumMatrix[rowIdx][colIdx] = prefixSumMatrix[rowIdx - 1][colIdx] + prefixSumMatrix[rowIdx][colIdx];
    }
}

var greatestSum = -Infinity; // Initialize maximum sum to negative infinity

// Iterate through all possible submatrix top-left (r1, c1) and bottom-right (r2, c2) coordinates
for (var r1 = 0; r1 < dimension; r1++) {
    for (var c1 = 0; c1 < dimension; c1++) {
        for (var r2 = r1 + 1; r2 < dimension; r2++) {
            for (var c2 = c1 + 1; c2 < dimension; c2++) {
                // Use the prefix sum formula to find the sum of the current submatrix
                // Sum(r1,c1,r2,c2) = PS[r2][c2] - PS[r1][c2] - PS[r2][c1] + PS[r1][c1]
                greatestSum = Math.max(greatestSum, prefixSumMatrix[r2][c2] - prefixSumMatrix[r1][c2] - prefixSumMatrix[r2][c1] + prefixSumMatrix[r1][c1]);
            }
        }
    }
}

console.log(greatestSum); // Output the largest submatrix sum found
