let rawDataBuffer = '';
let dataPointer = 0;

function acquireNumericInput() {
    if (dataPointer >= rawDataBuffer.length) {
        // Log an error or handle gracefully if input is exhausted
        console.error("Input buffer exhausted. Attempted to read beyond available data.");
        // Return a sentinel value or throw an error
        return NaN;
    }
    const value = +rawDataBuffer[dataPointer]; // Convert to number
    dataPointer++;
    return value;
}

function displayResult(valueToOutput) {
    console.log(valueToOutput);
}

function computeMaximumSubmatrixSum() {
    const matrixDimension = acquireNumericInput();

    // Added a guard clause for invalid matrix dimensions
    if (isNaN(matrixDimension) || matrixDimension <= 0) {
        // A 0x0 or negative dimension matrix has a max sum of 0
        displayResult(0);
        return;
    }

    // Initialize the input data grid
    let inputDataGrid = Array.from({ length: matrixDimension }, () => Array(matrixDimension).fill(0));

    // Populate the input grid with values
    for (let rIdx = 0; rIdx < matrixDimension; ++rIdx) {
        for (let cIdx = 0; cIdx < matrixDimension; ++cIdx) {
            inputDataGrid[rIdx][cIdx] = acquireNumericInput();
        }
    }

    // Initialize the overall maximum sum found
    let overallMaxSubmatrixSum = -Number.MAX_VALUE; // Using -Number.MAX_VALUE for robust initialization

    // Create a separate grid to store row-wise prefix sums
    let rowPrefixSumsGrid = Array.from({ length: matrixDimension }, () => Array(matrixDimension).fill(0));

    // Calculate row-wise prefix sums for efficient column sum calculation
    for (let r = 0; r < matrixDimension; ++r) {
        rowPrefixSumsGrid[r][0] = inputDataGrid[r][0];
        for (let c = 1; c < matrixDimension; ++c) {
            rowPrefixSumsGrid[r][c] = rowPrefixSumsGrid[r][c - 1] + inputDataGrid[r][c];
        }
    }

    // Iterate through all possible column ranges (left to right boundaries)
    for (let startColumn = 0; startColumn < matrixDimension; ++startColumn) {
        for (let endColumn = startColumn; endColumn < matrixDimension; ++endColumn) {
            // This array will hold the sum of elements for the current column slice for each row
            let columnSliceSums = new Array(matrixDimension).fill(0);

            // Populate `columnSliceSums` using the precomputed row prefix sums
            for (let rowIterator = 0; rowIterator < matrixDimension; ++rowIterator) {
                const sumUpToEndColumn = rowPrefixSumsGrid[rowIterator][endColumn];
                const sumBeforeStartColumn = (startColumn > 0) ? rowPrefixSumsGrid[rowIterator][startColumn - 1] : 0;
                columnSliceSums[rowIterator] = sumUpToEndColumn - sumBeforeStartColumn;
            }

            // Apply Kadane's algorithm to the `columnSliceSums` array (1D array)
            // This finds the maximum contiguous subarray sum within the current column slice
            let maxCurrentEndingHere = columnSliceSums[0]; // Maximum sum of a subarray ending at the current position
            let maxOverallInSlice = columnSliceSums[0];   // Overall maximum sum found in this 1D slice

            // New fragment: Add a check for empty slice, though `matrixDimension > 0` should prevent this.
            if (columnSliceSums.length === 0) {
                // If it's possible to have an empty slice, handle here (e.g., continue or specific value)
                continue; // Skip this column slice if it's somehow empty
            }

            for (let k = 1; k < matrixDimension; ++k) {
                const currentElement = columnSliceSums[k];
                // Update `maxCurrentEndingHere`: either start a new subarray or extend the previous one
                maxCurrentEndingHere = Math.max(currentElement, maxCurrentEndingHere + currentElement);
                // Update `maxOverallInSlice`: track the largest sum found so far in this 1D array
                maxOverallInSlice = Math.max(maxOverallInSlice, maxCurrentEndingHere);
            }

            // Update the global maximum submatrix sum
            overallMaxSubmatrixSum = Math.max(overallMaxSubmatrixSum, maxOverallInSlice);
        }
    }
    displayResult(overallMaxSubmatrixSum);
}

// Standard Node.js input handling setup
process.stdin.resume();
process.stdin.setEncoding('utf8');

process.stdin.on('data', function(incomingChunk) {
    rawDataBuffer += incomingChunk;
});

process.stdin.on('end', function() {
    // Process the accumulated input: trim whitespace and split by any whitespace character
    rawDataBuffer = rawDataBuffer.trim().split(/\s+/);
    // Initiate the main computation
    computeMaximumSubmatrixSum();
});