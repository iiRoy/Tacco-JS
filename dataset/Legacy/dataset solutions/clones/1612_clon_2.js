"use strict"; // Enforce strict mode for better code quality and error checking

// Utilize Node.js 'fs' module to read standard input synchronously
var rawData = require("fs").readFileSync("/dev/stdin", "utf8");

// Process the raw input string: split by spaces or newlines to create a stream of tokens
var tokenStream = rawData.split(/ |\n/);
var tokenIndex = 0; // Initialize an index to keep track of the current position in the token stream

/**
 * Retrieves the next token from the input stream and converts it to a number.
 * @returns {number} The numerical value of the next token.
 */
function readNum() {
    return +tokenStream[tokenIndex++];
}

/**
 * Retrieves the next token from the input stream as a string.
 * @returns {string} The string value of the next token.
 */
function readStr() {
    return tokenStream[tokenIndex++];
}

/**
 * Retrieves the next token from the input stream and converts it to a BigInt.
 * @returns {BigInt} The BigInt value of the next token.
 */
function readBigInt() {
    return BigInt(tokenStream[tokenIndex++]);
}

/**
 * Reads a specified number of tokens from the stream.
 * Optionally converts them to numbers or leaves them as strings.
 * @param {number} count - The total number of tokens to read.
 * @param {boolean} [asStrings] - If true, tokens are returned as strings; otherwise, as numbers.
 * @returns {Array<number|string>} An array containing the read tokens.
 */
function readNums(count, asStrings) {
    // Extract a segment of the token stream
    const segment = tokenStream.slice(tokenIndex, tokenIndex += count);
    // If 'asStrings' flag is set, return the segment directly; otherwise, map to numbers
    return asStrings ? segment : segment.map(valStr => +valStr);
}

/**
 * Reads a 2D matrix of specified dimensions from the input stream.
 * Each row is read sequentially.
 * @param {number} height - The number of rows in the matrix.
 * @param {number} width - The number of columns in each row.
 * @param {boolean} [asStrings] - If true, matrix elements are strings; otherwise, numbers.
 * @returns {Array<Array<number|string>>} The constructed 2D matrix.
 */
function readMatrix(height, width, asStrings) {
    var matrixRows = []; // Array to store the rows of the matrix
    var rowIdx = 0;      // Loop counter for rows

    if (asStrings) {
        // If elements should be strings, slice and push directly
        for (; rowIdx < height; rowIdx++) {
            matrixRows.push(tokenStream.slice(tokenIndex, tokenIndex += width));
        }
    } else {
        // If elements should be numbers, slice and map to numbers
        for (; rowIdx < height; rowIdx++) {
            matrixRows.push(tokenStream.slice(tokenIndex, tokenIndex += width).map(valStr => +valStr));
        }
    }
    return matrixRows;
}

/**
 * Dynamically creates a multi-dimensional array with specified dimensions and an initial value.
 * The initial value can be a primitive or an expression (e.g., "{}").
 * @param {*} initialValue - The value or expression to initialize each element with.
 * @param {...number} dimensions - A variable number of arguments representing the dimensions of the array.
 * @returns {Array} The newly created multi-dimensional array.
 */
function createMultiDimArray(initialValue) {
    var argsList = arguments; // Access all arguments passed to the function
    var argLength = argsList.length; // Get the total number of arguments

    // Start building the JavaScript code string for array creation from the innermost dimension
    // The last argument in argsList is the innermost dimension
    var arrayCreationCode = "Array(argsList[" + --argLength + "]).fill().map(_ => {return " + initialValue + ";})";

    // Loop backwards through the remaining dimensions to wrap the array creation code
    while (--argLength) {
        arrayCreationCode = "Array(argsList[" + argLength + "]).fill().map(_ => " + arrayCreationCode + ")";
    }

    // Use eval to execute the dynamically generated array creation code
    return eval(arrayCreationCode);
}

// Execute the primary problem-solving logic
var finalResult = solveProblem();

// If the problem-solving function returns a value (i.e., not undefined), print it to console
if (finalResult !== undefined) {
    console.log(String(finalResult));
}

/**
 * Implements the main algorithm to solve the problem using dynamic programming.
 * This function calculates the maximum value obtainable by picking items from a grid.
 * @returns {number} The maximum accumulated value.
 */
function solveProblem() {
    // Read the three initial parameters: number of rows, number of columns, and number of items
    var [rowsCount, colsCount, itemCount] = readNums(3);

    // Initialize a 2D grid to store item values.
    // It's (rowsCount + 1) in height, and each cell can hold an object (or item value).
    var gridItems = createMultiDimArray("{}", rowsCount + 1);

    // Populate the gridItems array with the given 'itemCount' items
    for (var itemIdx = 0; itemIdx < itemCount; itemIdx++) {
        var [itemRow, itemCol, itemValue] = readNums(3); // Read item's row, column, and value
        gridItems[itemRow][itemCol] = itemValue; // Place the item value in the grid
    }

    // Initialize the dynamic programming table for the current row.
    // Dimensions: (colsCount + 1) x 4. The 4 states typically represent
    // the number of items picked from the current cell (0 to 3).
    var currentDP = createMultiDimArray(0, colsCount + 1, 4);

    // Iterate through each row of the grid, starting from row 1 (1-indexed)
    for (var currentRow = 1; currentRow <= rowsCount; currentRow++) {
        // Create a new DP table for calculating values for the 'next' row (or current row's calculations)
        var nextDP = createMultiDimArray(0, colsCount + 1, 4);

        // Iterate through each column in the current row, starting from column 1 (1-indexed)
        for (var currentCol = 1; currentCol <= colsCount; currentCol++) {
            // Base case for the current cell:
            // nextDP[currentCol][0] represents the maximum value when 0 items are picked from the current cell.
            // This can come from either the previous row's state 3 (max items picked) or the previous column's state 0.
            nextDP[currentCol][0] = Math.max(currentDP[currentCol][3], nextDP[currentCol - 1][0]);

            // Iterate through the possible states for picking items in the current cell (1 to 3 items)
            for (var stateIdx = 1; stateIdx <= 3; stateIdx++) {
                // Check if there is an item present at the current grid position (currentRow, currentCol)
                if (gridItems[currentRow][currentCol]) {
                    // If an item exists, calculate the maximum value considering three options:
                    // 1. Take the item, having come from the previous row's max state (3 items).
                    // 2. Take the item, having come from the previous column's (stateIdx - 1) items.
                    // 3. Don't take the item, just carry over the value from the previous column's current state.
                    nextDP[currentCol][stateIdx] = Math.max(
                        currentDP[currentCol][3] + gridItems[currentRow][currentCol],
                        nextDP[currentCol - 1][stateIdx - 1] + gridItems[currentRow][currentCol],
                        nextDP[currentCol - 1][stateIdx]
                    );
                } else {
                    // If no item exists at the current cell, the value is either from:
                    // 1. The previous row's max state (3 items).
                    // 2. The previous column's current state.
                    nextDP[currentCol][stateIdx] = Math.max(currentDP[currentCol][3], nextDP[currentCol - 1][stateIdx]);
                }
            }
        }
        // After completing calculations for all columns in the current row,
        // update 'currentDP' to 'nextDP' for the next row's calculations.
        currentDP = nextDP;
    }

    // The final answer is the maximum value found in the last column (colsCount)
    // across all possible states (0 to 3 items picked) in the final DP table.
    return Math.max(...currentDP[colsCount]);
}
