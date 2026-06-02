"use strict"; // Enforce strict mode for cleaner code execution.

// Core utility for reading input from stdin.
var rawData = require("fs").readFileSync("/dev/stdin", "utf8");
// Split the raw input into tokens by spaces or newlines.
var tokenStream = rawData.split(/ |\n/);
// Pointer to the current token in the stream.
var tokenPointer = 0;

/**
 * Reads the next token from the input stream.
 * @param {boolean} isStringFlag - If true, returns the token as a string; otherwise, attempts to convert to a number.
 * @returns {string|number} The next token.
 */
function readNextValue(isStringFlag) {
    return isStringFlag ? tokenStream[tokenPointer++] : +tokenStream[tokenPointer++];
}

/**
 * Reads multiple tokens from the input stream.
 * @param {number} countToRead - The number of tokens to read.
 * @param {boolean} returnAsStrings - If true, returns tokens as strings; otherwise, converts to numbers.
 * @returns {Array<string|number>} An array of tokens.
 */
function readMultipleValues(countToRead, returnAsStrings) {
    if (returnAsStrings) {
        return tokenStream.slice(tokenPointer, tokenPointer += countToRead);
    } else {
        return tokenStream.slice(tokenPointer, tokenPointer += countToRead).map(strVal => +strVal);
    }
}

/**
 * Reads a matrix of tokens from the input stream.
 * @param {number} numRows - The number of rows in the matrix.
 * @param {number} numCols - The number of columns in the matrix.
 * @param {boolean} asStringMatrix - If true, returns elements as strings; otherwise, converts to numbers.
 * @returns {Array<Array<string|number>>} A 2D array representing the matrix.
 */
function readMatrixValues(numRows, numCols, asStringMatrix) {
    var matrixResult = [];
    var rowIterator = 0;
    if (asStringMatrix) {
        for (; rowIterator < numRows; rowIterator++) {
            matrixResult.push(tokenStream.slice(tokenPointer, tokenPointer += numCols));
        }
    } else {
        for (; rowIterator < numRows; rowIterator++) {
            matrixResult.push(tokenStream.slice(tokenPointer, tokenPointer += numCols).map(elemStr => +elemStr));
        }
    }
    return matrixResult;
}

/**
 * Creates a multi-dimensional array initialized with a specific value.
 * @param {*} initialFillValue - The value to fill the array with.
 * @param {...number} dimensions - The dimensions of the array.
 * @returns {Array} The multi-dimensional array.
 */
function createNDArray(initialFillValue) {
    var dimensionArgs = arguments;
    var argLengthCounter = dimensionArgs.length;
    // Construct the string representation of the array creation.
    var arrayConstructionString = "Array(dimensionArgs[" + --argLengthCounter + "]).fill().map(x=>{return " + initialFillValue + ";})";
    while (--argLengthCounter) {
        arrayConstructionString = "Array(dimensionArgs[" + argLengthCounter + "]).fill().map(x=>" + arrayConstructionString + ")";
    }
    // Evaluate the string to create the array.
    return eval(arrayConstructionString);
}

// Execute the main program logic and store its result.
var finalOutput = processInputAndCalculate();

// If the program produced a meaningful result, print it to console.
if (finalOutput !== undefined) {
    console.log(finalOutput);
}

/**
 * Main function containing the problem's algorithm.
 * Calculates the maximum possible value based on input items.
 * @returns {number} The maximum calculated value.
 */
function processInputAndCalculate() {
    // Read the total number of items.
    var totalItems = readNextValue();
    // Array to store items along with their original indices.
    var itemDataWithIndices = [];

    // Populate the itemDataWithIndices array.
    for (var itemIndex = 0; itemIndex < totalItems; itemIndex++) {
        itemDataWithIndices.push([readNextValue(), itemIndex]);
    }

    // Sort items in descending order based on their primary value.
    itemDataWithIndices.sort((itemA, itemB) => itemB[0] - itemA[0]);

    // Initialize a dynamic programming table.
    // The size is totalItems + 1, initialized with 0.
    var memoizationTable = createNDArray(0, totalItems + 1);

    // Iterate through each item to build up the DP table.
    for (var outerLoopIndex = 0; outerLoopIndex < totalItems; outerLoopIndex++) {
        // Calculate the value for the next state (outerLoopIndex + 1).
        memoizationTable[outerLoopIndex + 1] = memoizationTable[outerLoopIndex] + (totalItems - outerLoopIndex - itemDataWithIndices[outerLoopIndex][1] - 1) * itemDataWithIndices[outerLoopIndex][0];

        // Inner loop for updating previous states.
        for (var innerLoopIndex = outerLoopIndex; innerLoopIndex > 0; innerLoopIndex--) {
            // Update the current inner loop state.
            memoizationTable[innerLoopIndex] += (itemDataWithIndices[outerLoopIndex][1] - (outerLoopIndex - innerLoopIndex)) * itemDataWithIndices[outerLoopIndex][0];

            // Calculate a temporary alternative value for comparison.
            var temporaryCalculation = memoizationTable[innerLoopIndex - 1] + (totalItems - innerLoopIndex - itemDataWithIndices[outerLoopIndex][1]) * itemDataWithIndices[outerLoopIndex][0];

            // If the temporary value is greater, update the DP table.
            if (memoizationTable[innerLoopIndex] < temporaryCalculation) {
                memoizationTable[innerLoopIndex] = temporaryCalculation;
            }
        }
        // Update the base case (index 0) of the DP table.
        memoizationTable[0] += (itemDataWithIndices[outerLoopIndex][1] - outerLoopIndex) * itemDataWithIndices[outerLoopIndex][0];
    }

    // Return the maximum value found in the memoization table.
    return Math.max(...memoizationTable);
}
