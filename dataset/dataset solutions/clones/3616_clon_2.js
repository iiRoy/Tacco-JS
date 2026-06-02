"use strict";

// Main function to process the input data and solve the problem.
function ProcessInput(rawData) {
    // Initialize a utility for parsing numerical and string tokens from the input.
    let dataParser = new DataExtractor(rawData);

    // Read the primary dimensions and counts from the input.
    let matrixSize = dataParser.fetchInteger();     // Represents N in the original problem.
    let numOperations = dataParser.fetchInteger();  // Represents M.
    let numQueries = dataParser.fetchInteger();     // Represents Q.

    // Create a 2D array (grid) to store cumulative sums.
    // It's initialized with dimensions (matrixSize + 1) x (matrixSize + 1) for 1-based indexing.
    // All elements are initially set to zero.
    let prefixSumGrid = Array(matrixSize + 1).fill(0).map(() => Array(matrixSize + 1).fill(0));

    // Iterate through each operation to populate the initial grid.
    // Each operation specifies a coordinate (leftBound, rightBound) where a value is incremented.
    for (let opIdx = 0; opIdx < numOperations; opIdx++) {
        let leftBound = dataParser.fetchInteger();
        let rightBound = dataParser.fetchInteger();
        // Increment the count at the specified grid cell.
        prefixSumGrid[leftBound][rightBound] += 1;
    }

    // Compute the 2D prefix sums across the grid.
    // This transformation allows for constant-time range sum queries later.
    for (let rowIdx = 1; rowIdx <= matrixSize; rowIdx++) {
        for (let colIdx = 1; colIdx <= matrixSize; colIdx++) {
            // The value at (rowIdx, colIdx) becomes the sum of:
            // - Its current value (from initial operations)
            // - The prefix sum from the cell directly above (rowIdx-1, colIdx)
            // - The prefix sum from the cell directly to its left (rowIdx, colIdx-1)
            // - Minus the prefix sum from the top-left diagonal cell (rowIdx-1, colIdx-1) to avoid double-counting.
            prefixSumGrid[rowIdx][colIdx] += (
                prefixSumGrid[rowIdx - 1][colIdx] +
                prefixSumGrid[rowIdx][colIdx - 1] -
                prefixSumGrid[rowIdx - 1][colIdx - 1]
            );
        }
    }

    // Process each query.
    // Each query asks for a specific sum based on two coordinates (queryStart, queryEnd).
    for (let queryIdx = 0; queryIdx < numQueries; queryIdx++) {
        let queryStart = dataParser.fetchInteger(); // The 'p' value in the original problem.
        let queryEnd = dataParser.fetchInteger();   // The 'q' value in the original problem.

        // Calculate the sum for the specified range using the precomputed prefix sums.
        // The formula `prefixSumGrid[queryEnd][queryEnd] - prefixSumGrid[queryStart - 1][queryEnd]`
        // effectively queries the sum of values in the rectangle from (queryStart, 1) to (queryEnd, queryEnd).
        console.log(prefixSumGrid[queryEnd][queryEnd] - prefixSumGrid[queryStart - 1][queryEnd]);
    }
}

// A helper class designed to extract various data types from a raw input string.
class DataExtractor {
    // The constructor takes the entire raw input string.
    constructor(sourceText) {
        this.currentIndex = 0; // Keeps track of the next token to be read.
        // Splits the input string into an array of tokens using newlines or spaces as delimiters.
        this.parsedTokens = sourceText.split(/\n|\s/);
    }

    // Fetches the next token and converts it to an integer.
    fetchInteger() {
        // The unary minus operator (`- 0`) is used for type coercion to number.
        return this.parsedTokens[this.currentIndex++] - 0;
    }

    // Fetches an array of 'count' integer tokens.
    fetchIntegerArray(count) {
        let tempArr = new Array(count);
        for (let arrIdx = 0; arrIdx < count; arrIdx++) {
            tempArr[arrIdx] = this.fetchInteger(); // Correctly calls the instance method.
        }
        return tempArr;
    }

    // Fetches the next token as a string.
    fetchString() {
        return this.parsedTokens[this.currentIndex++];
    }

    // Fetches an array of 'count' string tokens.
    fetchStringArray(count) {
        let tempArr = new Array(count);
        for (let arrIdx = 0; arrIdx < count; arrIdx++) {
            tempArr[arrIdx] = this.fetchString(); // Correctly calls the instance method.
        }
        return tempArr;
    }
}

// Standard entry point for competitive programming environments.
// If the code is not running in a browser environment (i.e., likely Node.js),
// it reads input from standard input and passes it to the main processing function.
if (typeof window === "undefined") {
    ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
}
