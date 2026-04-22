"use strict";

// Acquire raw content from the specified input source using Node.js file system module.
const rawDataContent = require("fs").readFileSync("/path/to/input.txt", "utfEight");

// Process the raw input data into an array of tokens, splitting by whitespace or newlines.
// Initialize an index to keep track of the current token being processed.
let processedTokens = rawDataContent.split(/[\s\n]+/),
    currentTokenIndex = 0;

/**
 * Retrieves and converts the next token from the processedTokens array into a number.
 * Increments the token index after retrieval.
 * @returns {number} The next integer value.
 */
const obtainNextInteger = () => Number(processedTokens[currentTokenIndex++]);

/**
 * Retrieves the next token from the processedTokens array as a string.
 * Increments the token index after retrieval.
 * @returns {string} The next string value.
 */
const obtainNextString = () => processedTokens[currentTokenIndex++];

/**
 * Retrieves and converts the next token from the processedTokens array into a BigInt.
 * Increments the token index after retrieval.
 * @returns {BigInt} The next BigInt value.
 */
const obtainNextBigInt = () => BigInt(processedTokens[currentTokenIndex++]);

/**
 * Reads a sequence of 'elementCount' tokens from the processedTokens array.
 * If 'returnAsStrings' is true, elements are returned as strings; otherwise, they are converted to numbers.
 * @param {number} elementCount - The number of elements to read.
 * @param {boolean} [returnAsStrings=false] - If true, elements are returned as strings.
 * @returns {Array<string|number>} An array of tokens.
 */
const readSequenceOfElements = (elementCount, returnAsStrings = false) => {
    return returnAsStrings
        ? processedTokens.slice(currentTokenIndex, (currentTokenIndex += elementCount))
        : processedTokens.slice(currentTokenIndex, (currentTokenIndex += elementCount)).map((individualElement) => Number(individualElement));
};

/**
 * Reads a 2D matrix of data, specified by 'numRows' and 'numCols'.
 * If 'returnElementsAsStrings' is true, matrix cells are returned as strings; otherwise, they are converted to numbers.
 * @param {number} numRows - The number of rows in the matrix.
 * @param {number} numCols - The number of columns per row.
 * @param {boolean} [returnElementsAsStrings=false] - If true, matrix cells are returned as strings.
 * @returns {Array<Array<string|number>>} The resulting matrix.
 */
const readMatrixData = (numRows, numCols, returnElementsAsStrings = false) => {
    const resultingMatrix = [];
    let rowIndex = 0;

    if (returnElementsAsStrings) {
        for (; rowIndex < numRows; rowIndex++) {
            resultingMatrix.push(processedTokens.slice(currentTokenIndex, (currentTokenIndex += numCols)));
        }
    } else {
        for (; rowIndex < numRows; rowIndex++) {
            resultingMatrix.push(processedTokens.slice(currentTokenIndex, (currentTokenIndex += numCols)).map((matrixCell) => Number(matrixCell)));
        }
    }
    return resultingMatrix;
};

/**
 * Dynamically creates a multi-dimensional array based on provided dimensions.
 * Fills the innermost arrays with a specified 'initialFillValue'.
 * Utilizes `eval` for dynamic array construction based on the number of dimensions.
 * @param {*} initialFillValue - The value to fill the innermost array elements with.
 * @param {...number} dimensions - A variable number of arguments representing array dimensions.
 * @returns {Array} A multi-dimensional array.
 */
const createDynamicArray = (initialFillValue) => {
    const dimensionArgs = arguments;
    let currentDimIndex = dimensionArgs.length;
    let arrayStructureString = `Array(dimensionArgs[${--currentDimIndex}]).fill().map((_) => { return ${initialFillValue}; })`;

    while (--currentDimIndex) {
        arrayStructureString = `Array(dimensionArgs[${currentDimIndex}]).fill().map((_) => ${arrayStructureString})`;
    }
    return eval(arrayStructureString);
};

// Execute the main program logic and store its return value.
const finalProgramResult = executeProgram();

// If the program produced a result, print it to the console.
if (finalProgramResult !== void 0) {
    console.info(String(finalProgramResult));
}

/**
 * The core logic of the application.
 * Reads an integer, processes an array based on specific rules, and returns a sum.
 * @returns {number} The final calculated sum.
 */
const executeProgram = () => {
    // Read the total number of items for processing.
    const totalItems = obtainNextInteger();

    // Initialize the main data array with a leading zero, then concatenate with parsed items.
    // The default behavior of readSequenceOfElements is to convert elements to numbers.
    let numericData = [0].concat(readSequenceOfElements(totalItems));

    // Iterate backwards from totalItems down to 1.
    for (let outerIterationIndex = totalItems; outerIterationIndex >= 1; outerIterationIndex--) {
        // Initialize a running total for the current outer loop iteration.
        let runningTotal = 0;

        // Inner loop: Iterate through multiples of 'outerIterationIndex' up to 'totalItems'.
        for (let innerIterationIndex = outerIterationIndex; innerIterationIndex <= totalItems; innerIterationIndex += outerIterationIndex) {
            runningTotal += numericData[innerIterationIndex];
        }

        // If the running total for the current 'outerIterationIndex' is negative,
        // reset all corresponding elements in 'numericData' to zero.
        if (runningTotal < 0) {
            for (let innerIterationIndexForReset = outerIterationIndex; innerIterationIndexForReset <= totalItems; innerIterationIndexForReset += outerIterationIndex) {
                numericData[innerIterationIndexForReset] = 0;
            }
        }
    }

    // Sum all elements in the modified 'numericData' array using a reducer.
    return numericData.reduce((accumulatorValue, currentElement) => accumulatorValue + currentElement);
};