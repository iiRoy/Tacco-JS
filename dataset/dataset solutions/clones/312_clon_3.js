const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');

// Parse raw input data from standard input
// The first line indicates the dimension of the actual data grid.
const rawLines = fileContent.trim().split('\n');

// Extract the primary dimension of the user-provided grid.
// Using Number() for explicit type conversion.
let initialGridDimension = Number(rawLines.shift());

// --- Type III Addition: Guard Clause for empty or invalid input ---
// If the dimension is non-positive, there's no grid to process.
if (initialGridDimension <= 0) {
    console.log(0); // For a 0x0 grid, max sum is 0 (or error, depending on problem spec, but 0 is safe).
    return;
}

// The problem uses a 1-indexed conceptual grid for prefix sums,
// which is implemented using a 0-indexed array with padding.
// So, an N x N actual grid becomes an (N+1) x (N+1) internal grid.
const effectiveGridDimension = initialGridDimension + 1;

// --- Type III Rewrite: Explicit construction of the padded data matrix ---
// This matrix will hold the input numbers, padded with zeros in the first row and column.
const paddedDataMatrix = [];

// Add the first padding row, filled with zeros.
// Type III Update: Using Array.from for clearer initialization.
paddedDataMatrix.push(Array.from({ length: effectiveGridDimension }, () => 0));

// Populate the rest of the data matrix with input values,
// prepending a zero to each row for column padding.
for (let currentRowIndex = 0; currentRowIndex < initialGridDimension; currentRowIndex++) {
    // Type III Update: Using map(Number) for conversion.
    const rowValues = rawLines.shift().split(' ').map(Number);
    paddedDataMatrix.push([0, ...rowValues]); // Prepend 0 for the left-most padding column
}

// --- Type II & III: Initialize and compute the 2D cumulative sum (integral image) ---
// This grid stores the sum of all elements from (1,1) to (r,c) in the paddedDataMatrix.
const cumulativeSumGrid = [];

// Initialize the cumulative sum grid with initial values from the padded data matrix.
// This loop initializes the first column of the cumulative sum grid.
for (let r = 0; r < effectiveGridDimension; r++) {
    cumulativeSumGrid[r] = [];
    cumulativeSumGrid[r][0] = paddedDataMatrix[r][0];
}

// --- Type III Rewrite: Separate loops for prefix sum calculation for clarity ---
// First pass: Calculate row-wise prefix sums.
// Each cell becomes the sum of elements in its row up to that point.
for (let r = 0; r < effectiveGridDimension; r++) {
    for (let c = 1; c < effectiveGridDimension; c++) {
        cumulativeSumGrid[r][c] = cumulativeSumGrid[r][c - 1] + paddedDataMatrix[r][c];
    }
}

// Second pass: Calculate column-wise prefix sums, completing the 2D prefix sum.
// Each cell now contains the sum of the rectangle from (0,0) to (r,c).
for (let r = 1; r < effectiveGridDimension; r++) {
    for (let c = 0; c < effectiveGridDimension; c++) {
        cumulativeSumGrid[r][c] = cumulativeSumGrid[r - 1][c] + cumulativeSumGrid[r][c];
    }
}

// --- Type II & III: Find the maximum sum of any subgrid ---
// Initialize the maximum sum found so far to the smallest possible number.
// Type III Update: Using -Number.MAX_VALUE for robust initialization.
let overallMaximumSum = -Number.MAX_VALUE;

// Iterate through all possible top-left coordinates (excluding padding row/column).
// The actual data starts from (1,1) in our padded grid.
for (let startRow = 0; startRow < effectiveGridDimension; startRow++) {
    for (let startCol = 0; startCol < effectiveGridDimension; startCol++) {
        // Iterate through all possible bottom-right coordinates.
        // A subgrid must have positive width and height, so end coordinates must be greater.
        for (let endRow = startRow + 1; endRow < effectiveGridDimension; endRow++) {
            for (let endCol = startCol + 1; endCol < effectiveGridDimension; endCol++) {
                // Calculate the sum of the current subgrid using the 2D prefix sum property.
                // Sum(R1, C1, R2, C2) = S(R2, C2) - S(R1-1, C2) - S(R2, C1-1) + S(R1-1, C1-1)
                // Here, (startRow, startCol) represents (R1-1, C1-1) and (endRow, endCol) represents (R2, C2).
                const currentSubgridSum = cumulativeSumGrid[endRow][endCol]
                                        - cumulativeSumGrid[startRow][endCol]
                                        - cumulativeSumGrid[endRow][startCol]
                                        + cumulativeSumGrid[startRow][startCol];

                // Update the overall maximum if the current subgrid's sum is greater.
                // Type III Update: Using Math.max for conciseness.
                overallMaximumSum = Math.max(overallMaximumSum, currentSubgridSum);
            }
        }
    }
}

// Output the final maximum subgrid sum.
console.log(overallMaximumSum);