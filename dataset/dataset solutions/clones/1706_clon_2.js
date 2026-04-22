"use strict"; // Enable strict mode for better error handling and cleaner code.

// --- Utility Functions for Input Processing ---

// Read the entire standard input as a string.
var rawData = require("fs").readFileSync("/dev/stdin", "utf8");

// Split the input string by spaces or newlines into an array of tokens.
// Initialize an index to keep track of the current token.
var tokenStream = rawData.split(/ |\n/);
var tokenIndex = 0;

/**
 * Reads the next token from the stream and converts it to an integer.
 * @returns {number} The next integer value.
 */
function readInteger() {
    return +tokenStream[tokenIndex++];
}

/**
 * Reads the next token from the stream as a string.
 * @returns {string} The next string value.
 */
function readString() {
    return tokenStream[tokenIndex++];
}

/**
 * Reads the next token from the stream and converts it to a BigInt.
 * @returns {BigInt} The next BigInt value.
 */
function readLargeInteger() {
    return BigInt(tokenStream[tokenIndex++]);
}

/**
 * Reads 'count' items from the stream.
 * @param {number} count - The number of items to read.
 * @param {boolean} keepStrings - If true, items are returned as strings; otherwise, as numbers.
 * @returns {Array<number|string>} An array of the read items.
 */
function readItems(count, keepStrings) {
    var segment = tokenStream.slice(tokenIndex, tokenIndex += count);
    if (keepStrings) {
        return segment;
    } else {
        return segment.map(item => +item);
    }
}

/**
 * Reads a 2D matrix of dimensions 'numRows' x 'numCols' from the stream.
 * @param {number} numRows - The number of rows in the matrix.
 * @param {number} numCols - The number of columns in the matrix.
 * @param {boolean} keepStrings - If true, matrix elements are strings; otherwise, numbers.
 * @returns {Array<Array<number|string>>} A 2D array representing the matrix.
 */
function readMatrix(numRows, numCols, keepStrings) {
    var resultMatrix = [];
    var current_row_idx = 0;

    if (keepStrings) {
        for (; current_row_idx < numRows; current_row_idx++) {
            resultMatrix.push(tokenStream.slice(tokenIndex, tokenIndex += numCols));
        }
    } else {
        for (; current_row_idx < numRows; current_row_idx++) {
            resultMatrix.push(tokenStream.slice(tokenIndex, tokenIndex += numCols).map(val => +val));
        }
    }
    return resultMatrix;
}

/**
 * Dynamically creates a multi-dimensional array initialized with a specific value.
 * @param {*} initialValue - The value to initialize array elements with.
 * @param {...number} dimensionArgs - The sizes of each dimension.
 * @returns {Array} The created multi-dimensional array.
 */
function createMultiDimArray(initialValue) {
    var dimensionArgs = arguments;
    var argLength = dimensionArgs.length;
    var arrayCreationExpr = "Array(dimensionArgs[" + --argLength + "]).fill().map(elem => {return " + initialValue + ";})";

    while (--argLength) {
        arrayCreationExpr = "Array(dimensionArgs[" + argLength + "]).fill().map(elem => " + arrayCreationExpr + ")";
    }
    return eval(arrayCreationExpr);
}


// --- Main Program Execution Flow ---

// Execute the primary computation function.
var finalResult = computeSolution();

// If the computation yields a non-undefined result, print it to console.
if (finalResult !== undefined) {
    console.log(String(finalResult));
}


/**
 * The main function containing the core logic to solve the problem.
 * This function calculates a specific combinatorial sum related to paths or structures.
 * @returns {number} The final computed numerical answer.
 */
function computeSolution() {
    var limitValue = readInteger(); // Read the upper bound N for the problem.

    // Initialize the total count using a combinatorial formula (n * (n+1) * (n+2) / 6 is sum of 1 to n of i*(i+1)/2, or sum of triangular numbers)
    var cumulativeSum = limitValue * (limitValue + 1) * (limitValue + 2) / 6;

    // Iterate 'limitValue - 1' times to process subsequent pairs.
    for (var iteration = 1; iteration < limitValue; iteration++) {
        var startPoint = readInteger(); // Read the first value of the pair.
        var endPoint = readInteger();   // Read the second value of the pair.

        // Ensure 'startPoint' is always less than or equal to 'endPoint' by swapping if necessary.
        if (startPoint > endPoint) {
            var temporaryHolder = startPoint;
            startPoint = endPoint;
            endPoint = temporaryHolder;
        }
        // Subtract a calculated value from the cumulative sum based on the current pair.
        // This subtraction likely accounts for overlapping or invalid paths/structures.
        cumulativeSum -= startPoint * (limitValue - endPoint + 1);
    }

    return cumulativeSum; // Return the final calculated result.
}