"use strict";

// This script processes numerical data from standard input.
// It includes utility functions for parsing various data types.

// Read all input from stdin as a single string.
var rawData = require("fs").readFileSync("/dev/stdin", "utf8");

// Split the input string into tokens using spaces or newlines as delimiters.
// Initialize a pointer for token access.
var tokenBuffer = rawData.split(/ |\n/),
    tokenIndex = 0;

/**
 * Retrieves and converts the next token from the buffer to a number.
 * @returns {number} The next numerical token.
 */
function retrieveNextNumber() {
    return +tokenBuffer[tokenIndex++];
}

/**
 * Retrieves the next token from the buffer as a string.
 * @returns {string} The next string token.
 */
function retrieveNextString() {
    return tokenBuffer[tokenIndex++];
}

/**
 * Retrieves and converts the next token from the buffer to a BigInt.
 * @returns {BigInt} The next BigInt token.
 */
function retrieveNextBigInt() {
    return BigInt(tokenBuffer[tokenIndex++]);
}

/**
 * Retrieves a sequence of numbers or strings from the buffer.
 * @param {number} count - The number of items to retrieve.
 * @param {boolean} asStrings - If true, returns strings; otherwise, returns numbers.
 * @returns {Array<number|string>} An array of the retrieved items.
 */
function retrieveNumberSequence(count, asStrings) {
    if (asStrings) {
        return tokenBuffer.slice(tokenIndex, tokenIndex += count);
    } else {
        return tokenBuffer.slice(tokenIndex, tokenIndex += count).map(item => +item);
    }
}

/**
 * Retrieves a 2D matrix of numbers or strings from the buffer.
 * @param {number} height - The number of rows in the matrix.
 * @param {number} width - The number of columns in the matrix.
 * @param {boolean} asStringsMatrix - If true, returns string matrix; otherwise, returns number matrix.
 * @returns {Array<Array<number|string>>} The 2D matrix.
 */
function retrieveMatrix(height, width, asStringsMatrix) {
    var resultMatrix = [],
        rowIndex = 0;
    if (asStringsMatrix) {
        for (; rowIndex < height; rowIndex++) {
            resultMatrix.push(tokenBuffer.slice(tokenIndex, tokenIndex += width));
        }
    } else {
        for (; rowIndex < height; rowIndex++) {
            resultMatrix.push(tokenBuffer.slice(tokenIndex, tokenIndex += width).map(item => +item));
        }
    }
    return resultMatrix;
}

/**
 * Dynamically creates a multi-dimensional array initialized with a given value.
 * The dimensions are passed as subsequent arguments.
 * @param {*} initialValue - The value to initialize array elements with.
 * @returns {Array} The created multi-dimensional array.
 */
function createMultiDimArray(initialValue) {
    var argsList = arguments,
        lengthCounter = argsList.length,
        arrayCreationString = "Array(argsList[" + --lengthCounter + "]).fill().map(_=>{return " + initialValue + ";})";
    while (--lengthCounter) {
        arrayCreationString = "Array(argsList[" + lengthCounter + "]).fill().map(_=>" + arrayCreationString + ")";
    }
    return eval(arrayCreationString);
}

// Execute the primary processing function and store its output.
var finalResult = primaryProcess();

// If the result is not undefined, print it to the console.
if (finalResult !== undefined) {
    console.log(String(finalResult));
}

/**
 * The main logic function for the program.
 * @returns {number} The final calculated sum.
 */
function primaryProcess() {
    // Read the count of elements.
    var elementCount = retrieveNextNumber();

    // Read the array elements, prepending a zero at index 0 for 1-based indexing.
    var dataArray = [0].concat(retrieveNumberSequence(elementCount));

    // Iterate backwards from the last element.
    for (var currentIndex = elementCount; currentIndex >= 1; currentIndex--) {
        // If the current element is non-negative, skip processing for this index.
        if (dataArray[currentIndex] >= 0) {
            continue;
        }

        // Calculate the sum of elements at multiples of currentIndex.
        var currentSum = 0;
        for (var subIndex = currentIndex; subIndex <= elementCount; subIndex += currentIndex) {
            currentSum += dataArray[subIndex];
        }

        // If the calculated sum is negative, reset all affected elements to zero
        // and restart the outer loop from the end.
        if (currentSum < 0) {
            for (var subIndex = currentIndex; subIndex <= elementCount; subIndex += currentIndex) {
                dataArray[subIndex] = 0;
            }
            currentIndex = elementCount; // Reset loop counter to re-evaluate from the end.
        }
    }

    // Sum all elements in the modified array and return the total.
    return dataArray.reduce((accumulator, currentValue) => accumulator + currentValue);
}
