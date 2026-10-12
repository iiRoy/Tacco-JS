"use strict";
// This line ensures strict mode for better error handling.
var rawData = require("fs").readFileSync("/dev/stdin", "utf8"); // Read input from standard input.
var tokenStream = rawData.split(/ |\n/), // Split the input string by spaces or newlines into an array of tokens.
    tokenIndex = 0; // Initialize an index to keep track of the current token.

/**
 * Retrieves the next token from the stream and converts it to a number.
 * @returns {number} The next numeric token.
 */
function getNextNum() {
    return +tokenStream[tokenIndex++]; // Convert string token to number using unary plus operator.
}

/**
 * Retrieves the next token from the stream as a string.
 * @returns {string} The next string token.
 */
function getNextStr() {
    return tokenStream[tokenIndex++];
}

/**
 * Retrieves the next token from the stream and converts it to a BigInt.
 * @returns {BigInt} The next BigInt token.
 */
function getNextBigInt() {
    return BigInt(tokenStream[tokenIndex++]);
}

/**
 * Retrieves an array of numbers or strings from the token stream.
 * @param {number} count - The number of elements to retrieve.
 * @param {boolean} asStrings - If true, return strings; otherwise, return numbers.
 * @returns {Array<number|string>} An array of tokens.
 */
function getArrayOfNums(count, asStrings) {
    // If 'asStrings' is true, return tokens as-is (strings).
    // Otherwise, map them to numbers.
    return asStrings ? tokenStream.slice(tokenIndex, tokenIndex += count) : tokenStream.slice(tokenIndex, tokenIndex += count).map(val => +val);
}

/**
 * Retrieves a 2D matrix (array of arrays) from the token stream.
 * @param {number} height - The number of rows.
 * @param {number} width - The number of columns per row.
 * @param {boolean} asStrings - If true, return string elements; otherwise, return numbers.
 * @returns {Array<Array<number|string>>} A 2D array representing the matrix.
 */
function getMatrixOfNums(height, width, asStrings) {
    var resultMatrix = [], // Initialize an empty array to store rows.
        rowIndex = 0; // Loop counter for rows.

    if (asStrings) {
        // If elements should be strings, slice directly.
        for (; rowIndex < height; rowIndex++) {
            resultMatrix.push(tokenStream.slice(tokenIndex, tokenIndex += width));
        }
    } else {
        // If elements should be numbers, slice and map.
        for (; rowIndex < height; rowIndex++) {
            resultMatrix.push(tokenStream.slice(tokenIndex, tokenIndex += width).map(val => +val));
        }
    }
    return resultMatrix;
}

/**
 * Dynamically creates a multi-dimensional array with a specified fill value.
 * This function uses eval, which should be used with caution.
 * @param {*} fillValue - The value to fill the innermost array elements with.
 * @param {...number} dimensions - The dimensions of the array (e.g., dim1, dim2, dim3).
 * @returns {Array} The created multi-dimensional array.
 */
function createMultiDimArray(fillValue) {
    var args = arguments, // Get all arguments passed to the function.
        argCount = args.length, // Number of arguments.
        evalString = "Array(args[" + --argCount + "]).fill().map(x=>{return " + fillValue + ";})"; // Innermost array creation.

    // Build the eval string for nested arrays.
    while (--argCount) {
        evalString = "Array(args[" + argCount + "]).fill().map(x=>" + evalString + ")";
    }
    return eval(evalString); // Execute the dynamically generated string.
}

// Call the main program logic and store its result.
var programResult = executeProgram();

// If the program returned a value, print it to the console.
if (programResult !== undefined) {
    console.log(String(programResult));
}

/**
 * The main function containing the core logic of the program.
 * @returns {number} The final calculated sum.
 */
function executeProgram() {
    // Read the integer 'n' from the input.
    var count = getNextNum();

    // Create an array 'dataArray' by prepending 0 to the 'n' numbers read from input.
    // This effectively makes the array 1-indexed for the problem's logic.
    var dataArray = [0].concat(getArrayOfNums(count));

    // Iterate backwards from 'n' down to 1.
    for (var outerLoopVar = count; outerLoopVar >= 1; outerLoopVar--) {
        var currentSum = 0; // Initialize sum for the current 'outerLoopVar'.

        // Inner loop: iterate through multiples of 'outerLoopVar' up to 'n'.
        for (var innerLoopVar = outerLoopVar; innerLoopVar <= count; innerLoopVar += outerLoopVar) {
            currentSum += dataArray[innerLoopVar]; // Add the element at the current multiple to the sum.
        }

        // If the calculated sum is negative, set all elements at multiples of 'outerLoopVar' to 0.
        if (currentSum < 0) {
            for (var innerLoopVar = outerLoopVar; innerLoopVar <= count; innerLoopVar += outerLoopVar) {
                dataArray[innerLoopVar] = 0; // Reset the value to zero.
            }
        }
    }

    // Calculate the sum of all elements in 'dataArray' using reduce.
    // The initial 0 added at the beginning will also be included in the sum,
    // but since it's 0, it doesn't affect the final result of the original problem.
    return dataArray.reduce((accumulator, currentValue) => accumulator + currentValue);
}
