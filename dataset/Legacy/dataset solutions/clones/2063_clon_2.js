"use strict";

// Read all input from stdin as a single string
var rawData = require("fs").readFileSync("/dev/stdin", "utf8");

// Split the input string by spaces or newlines to create a stream of tokens
var tokenStream = rawData.split(/ |\n/),
    tokenIndex = 0; // Current position in the token stream

/**
 * Retrieves the next token from the input stream.
 * @param {boolean} asString - If true, returns the token as a string; otherwise, converts it to a number.
 * @returns {string|number} The next token.
 */
function getNextToken(asString) {
    return asString ? tokenStream[tokenIndex++] : +tokenStream[tokenIndex++];
}

/**
 * Retrieves an array of 'count' tokens from the input stream.
 * @param {number} count - The number of tokens to retrieve.
 * @param {boolean} asStrings - If true, returns tokens as strings; otherwise, converts them to numbers.
 * @returns {Array<string|number>} An array containing the requested tokens.
 */
function getTokensArray(count, asStrings) {
    return asStrings ? tokenStream.slice(tokenIndex, tokenIndex += count) : tokenStream.slice(tokenIndex, tokenIndex += count).map(val => +val);
}

/**
 * Retrieves a 2D matrix of tokens from the input stream.
 * @param {number} height - The number of rows in the matrix.
 * @param {number} width - The number of columns in each row.
 * @param {boolean} asStrings - If true, returns tokens as strings; otherwise, converts them to numbers.
 * @returns {Array<Array<string|number>>} The 2D matrix.
 */
function getMatrix(height, width, asStrings) {
    var resultMatrix = [],
        rowIterator = 0;
    if (asStrings) {
        for (; rowIterator < height; rowIterator++) {
            resultMatrix.push(tokenStream.slice(tokenIndex, tokenIndex += width));
        }
    } else {
        for (; rowIterator < height; rowIterator++) {
            resultMatrix.push(tokenStream.slice(tokenIndex, tokenIndex += width).map(item => +item));
        }
    }
    return resultMatrix;
}

/**
 * Dynamically creates a multi-dimensional array with a specified initial value.
 * The dimensions are passed as subsequent arguments after the initial value.
 * @param {*} initialValue - The value to fill the innermost array elements with.
 * @param {...number} dimensions - The sizes of the dimensions, from outermost to innermost.
 * @returns {Array} The created multi-dimensional array.
 */
function createMultiDimArray(initialValue) {
    var args = arguments,
        dimCount = args.length,
        arrayCreationString = "Array(args[" + --dimCount + "]).fill().map(element => {return " + initialValue + ";})";
    while (--dimCount) {
        arrayCreationString = "Array(args[" + dimCount + "]).fill().map(element => " + arrayCreationString + ")";
    }
    return eval(arrayCreationString);
}

// Execute the main logic of the program
var programOutput = executeLogic();

// If the program's main logic returned a value, print it to the console
if (programOutput !== undefined) {
    console.log(programOutput);
}

/**
 * Contains the primary algorithm for processing input and generating output.
 * @returns {number} The final calculated result.
 */
function executeLogic() {
    // Read the first number, which represents the count of elements.
    var countElements = getNextToken();
    // Read the next token as a string. This string will be treated as a sequence of digits.
    var initialString = getNextToken(true);

    // Initialize an array to store the absolute differences between adjacent digits.
    // Its size will be one less than the count of elements.
    var diffArray = Array(countElements - 1);

    // Populate the diffArray with absolute differences.
    for (var loopCounter = 0; loopCounter < countElements - 1; loopCounter++) {
        // Calculate the absolute difference between the current digit and the next.
        // JavaScript's type coercion handles the string-to-number conversion.
        var currentDiff = Math.abs(initialString[loopCounter] - initialString[loopCounter + 1]);
        diffArray[loopCounter] = currentDiff;
    }

    // Continuously reduce the diffArray until only one element remains.
    while (diffArray.length > 1) {
        var currentLength = diffArray.length,
            halfLength = currentLength >> 1, // Integer division by 2
            nextDiffArray = Array(halfLength); // Array for the next iteration

        // Iterate through the first half of the current diffArray.
        for (var loopCounter = 0; loopCounter < halfLength; loopCounter++) {
            // Compare elements symmetrically from both ends of the array.
            if (diffArray[loopCounter] === diffArray[currentLength - 1 - loopCounter]) {
                nextDiffArray[loopCounter] = 0;
            }
            // If the absolute difference between symmetric elements is 1.
            else if (Math.abs(diffArray[loopCounter] - diffArray[currentLength - 1 - loopCounter]) === 1) {
                nextDiffArray[loopCounter] = 1;
            }
            // For any other difference.
            else {
                nextDiffArray[loopCounter] = 2;
            }
        }
        // Replace the current diffArray with the newly computed one.
        diffArray = nextDiffArray;
    }

    // The final remaining element is the result.
    return diffArray[0];
}
