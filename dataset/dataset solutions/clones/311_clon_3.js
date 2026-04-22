// This program is designed to identify the highest possible sum among all contiguous rectangular sub-regions
// within a numerical matrix provided via standard input.
// It achieves this by employing a technique known as a 2D prefix sum array, often referred to as an integral image.
// This method allows for constant-time (O(1)) calculation of the sum of any sub-rectangle
// after an initial preprocessing phase that takes quadratic time (O(N^2)) relative to the matrix dimensions.

// Access the Node.js file system module to manage file operations, specifically for input.
const fileSystemInterface = require('fs');

// Retrieve all input data from the standard input stream.
// The data is read as a complete string and decoded using UTF-8.
const completeRawInput = fileSystemInterface.readFileSync('/dev/stdin', 'utf8');

// --- Section for Input Processing and Grid Construction ---

// Divide the raw input string into an array of individual lines.
// Any leading or trailing whitespace from the entire input is removed first.
const inputLineSegments = completeRawInput.trim().split('\n');

// Extract the first line, which indicates the dimension 'N' of the square matrix.
// This value is parsed into an integer (base 10).
const primaryMatrixDimension = parseInt(inputLineSegments.shift(), 10);

// Determine the effective dimension for our internal grid structures.
// We add one to the primary dimension to accommodate a border of zeros,
// which simplifies the prefix sum logic by allowing 1-based indexing for the actual data.
const effectiveGridDimension = primaryMatrixDimension + 1;

// Initialize the main data grid. This grid will store the matrix values,
// padded with an initial row and column of zeros.
// Using Array.from for robust initialization of a 2D array.
const coreNumericalGrid = Array.from({ length: effectiveGridDimension }, () =>
    Array(effectiveGridDimension).fill(0)
);

// Populate the `coreNumericalGrid` with the numerical data from the input lines.
// The data starts at index [1][1] due to the padding.
for (let rowCounter = 0; rowCounter < primaryMatrixDimension; rowCounter++) {
    // Prepend a '0 ' to each input line. This '0' will occupy the padded first column (index 0).
    // Then, split the string by spaces and convert all parts to numbers.
    const parsedRowEntries = ("0 " + inputLineSegments[rowCounter]).split(' ').map(Number);

    // Transfer the parsed numbers into the `coreNumericalGrid`.
    // `rowCounter + 1` ensures we're filling from the second row onwards.
    for (let colCounter = 0; colCounter < effectiveGridDimension; colCounter++) {
        coreNumericalGrid[rowCounter + 1][colCounter] = parsedRowEntries[colCounter];
    }
}

// --- Section for 2D Prefix Sum Table Generation ---

// Initialize the 2D prefix sum table. This table will hold the accumulated sums
// of all elements from the top-left corner (0,0) up to the current cell (r,c) in `coreNumericalGrid`.
const accumulatedSumTable = Array.from({ length: effectiveGridDimension }, () =>
    Array(effectiveGridDimension).fill(0)
);

// Traverse the `coreNumericalGrid` to populate the `accumulatedSumTable`.
// We start from index 1 for both rows and columns because the 0th row and 0th column
// are padding and thus their prefix sums are implicitly zero.
for (let rCoord = 1; rCoord < effectiveGridDimension; rCoord++) {
    for (let cCoord = 1; cCoord < effectiveGridDimension; cCoord++) {
        // The fundamental formula for computing a 2D prefix sum (S) at (r,c) is:
        // S(r,c) = M(r,c) + S(r-1,c) + S(r,c-1) - S(r-1,c-1)
        // Where M(r,c) is the value from the original matrix (`coreNumericalGrid`).
        accumulatedSumTable[rCoord][cCoord] =
            coreNumericalGrid[rCoord][cCoord] +
            accumulatedSumTable[rCoord - 1][cCoord] + // Sum from above
            accumulatedSumTable[rCoord][cCoord - 1] - // Sum from left
            accumulatedSumTable[rCoord - 1][cCoord - 1]; // Subtract overlap
    }
}

// --- Section for Determining the Maximum Sub-rectangle Sum ---

// Initialize a variable to track the highest sum encountered.
// Using `Number.MIN_SAFE_INTEGER` ensures that even a matrix of all negative numbers
// will yield its largest (least negative) sub-rectangle sum correctly.
let ultimateMaxRectangleSum = Number.MIN_SAFE_INTEGER;

// Iterate through all possible top-left corner coordinates (startR, startC) of a sub-rectangle.
for (let startR = 1; startR < effectiveGridDimension; startR++) {
    for (let startC = 1; startC < effectiveGridDimension; startC++) {
        // Iterate through all possible bottom-right corner coordinates (endR, endC) of a sub-rectangle.
        // `endR` must be greater than or equal to `startR`, and similarly for columns.
        for (let endR = startR; endR < effectiveGridDimension; endR++) {
            for (let endC = startC; endC < effectiveGridDimension; endC++) {
                // Compute the sum of the current sub-rectangle defined by (startR, startC) to (endR, endC).
                // The formula for a sub-rectangle sum using the prefix sum table (S) is:
                // Sum = S(endR,endC) - S(startR-1,endC) - S(endR,startC-1) + S(startR-1,startC-1)
                const currentRectangleAggregate =
                    accumulatedSumTable[endR][endC] - // Total sum up to bottom-right
                    accumulatedSumTable[startR - 1][endC] - // Exclude area above top row
                    accumulatedSumTable[endR][startC - 1] + // Exclude area left of first column
                    accumulatedSumTable[startR - 1][startC - 1]; // Add back the doubly-subtracted top-left corner

                // If the current sub-rectangle's sum is greater than the previously recorded maximum, update it.
                if (currentRectangleAggregate > ultimateMaxRectangleSum) {
                    ultimateMaxRectangleSum = currentRectangleAggregate;
                }
            }
        }
    }
}

// --- Section for Outputting the Final Result ---

// Display the calculated maximum sub-rectangle sum to the standard output.
console.log(ultimateMaxRectangleSum);