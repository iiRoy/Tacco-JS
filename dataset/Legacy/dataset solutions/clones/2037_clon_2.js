"use strict";

// Read the entire standard input file synchronously.
var fileContent = require("fs").readFileSync("/dev/stdin", "utf8");

// Split the content into tokens using spaces or newlines as delimiters.
// Initialize a token index for sequential access.
var tokenStream = fileContent.split(/ |\n/),
    tokenIndex = 0;

/**
 * Retrieves the next token from the stream.
 * @param {boolean} isString - If true, returns the token as a string; otherwise, attempts to convert to a number.
 * @returns {string|number} The next token.
 */
function retrieveNext(isString) {
    return isString ? tokenStream[tokenIndex++] : +tokenStream[tokenIndex++];
}

/**
 * Retrieves a specified number of tokens from the stream.
 * @param {number} count - The number of tokens to retrieve.
 * @param {boolean} asString - If true, returns tokens as strings; otherwise, attempts to convert to numbers.
 * @returns {Array<string|number>} An array of tokens.
 */
function retrieveMultiple(count, asString) {
    return asString
        ? tokenStream.slice(tokenIndex, (tokenIndex += count))
        : tokenStream.slice(tokenIndex, (tokenIndex += count)).map((val) => +val);
}

/**
 * Retrieves a matrix (2D array) of tokens from the stream.
 * @param {number} height - The number of rows in the matrix.
 * @param {number} width - The number of columns in each row.
 * @param {boolean} asStrings - If true, returns elements as strings; otherwise, attempts to convert to numbers.
 * @returns {Array<Array<string|number>>} The matrix.
 */
function retrieveMatrix(height, width, asStrings) {
    var resultMatrix = [],
        rowCounter = 0;
    if (asStrings) {
        for (; rowCounter < height; rowCounter++) {
            resultMatrix.push(tokenStream.slice(tokenIndex, (tokenIndex += width)));
        }
    } else {
        for (; rowCounter < height; rowCounter++) {
            resultMatrix.push(
                tokenStream.slice(tokenIndex, (tokenIndex += width)).map((element) => +element)
            );
        }
    }
    return resultMatrix;
}

/**
 * Creates a multi-dimensional array initialized with a given value.
 * The dimensions are passed as subsequent arguments.
 * @param {*} initialValue - The value to initialize array elements with.
 * @param {...number} dimensions - The sizes of each dimension.
 * @returns {Array} The multi-dimensional array.
 */
function createMultiDimArray(initialValue) {
    var argsList = arguments,
        dimCount = argsList.length,
        arrayExpression = "Array(argsList[" + --dimCount + "]).fill().map(_ => {return " + initialValue + ";})";
    while (--dimCount) {
        arrayExpression = "Array(argsList[" + dimCount + "]).fill().map(_ => " + arrayExpression + ")";
    }
    return eval(arrayExpression);
}

// Execute the primary logic of the program.
var programOutput = executeSolution();

// If the solution returns a value, print it to the console.
if (programOutput !== undefined) {
    console.log(programOutput);
}

/**
 * Main function containing the problem's core logic.
 * Reads two numbers and performs a calculation.
 * @returns {number} The calculated result.
 */
function executeSolution() {
    var firstNum = retrieveNext(),
        secondNum = retrieveNext();
    // Calculate combinations for firstNum and secondNum, then sum them.
    return (firstNum * (firstNum - 1)) / 2 + (secondNum * (secondNum - 1)) / 2;
}
