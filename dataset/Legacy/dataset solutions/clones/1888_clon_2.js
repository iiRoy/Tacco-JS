"use strict";

// Acquire raw input from standard input stream
var rawData = require("fs").readFileSync("/dev/stdin", "utf8");

// Split the input into tokens using spaces or newlines as delimiters
var tokenStream = rawData.split(/ |\n/),
    tokenIndex = 0;

/**
 * Reads the next token from the global token stream.
 * @param {boolean} isString - If true, returns the token as a string; otherwise, converts to a number.
 * @returns {string|number} The next token.
 */
function readNextToken(isString) {
    return isString ? tokenStream[tokenIndex++] : +tokenStream[tokenIndex++];
}

/**
 * Reads a specified number of tokens from the global token stream.
 * @param {number} count - The number of tokens to read.
 * @param {boolean} isString - If true, returns tokens as strings; otherwise, converts to numbers.
 * @returns {Array<string|number>} An array of tokens.
 */
function readMultipleTokens(count, isString) {
    return isString ? tokenStream.slice(tokenIndex, tokenIndex += count) : tokenStream.slice(tokenIndex, tokenIndex += count).map(val => +val);
}

/**
 * Reads tokens to form a matrix (2D array).
 * @param {number} height - The number of rows.
 * @param {number} width - The number of columns per row.
 * @param {boolean} isString - If true, returns tokens as strings; otherwise, converts to numbers.
 * @returns {Array<Array<string|number>>} A 2D array representing the matrix.
 */
function readMatrixTokens(height, width, isString) {
    var resultRows = [],
        rowIdx = 0;
    if (isString) {
        for (; rowIdx < height; rowIdx++) resultRows.push(tokenStream.slice(tokenIndex, tokenIndex += width));
    } else {
        for (; rowIdx < height; rowIdx++) resultRows.push(tokenStream.slice(tokenIndex, tokenIndex += width).map(val => +val));
    }
    return resultRows;
}

/**
 * Creates a multi-dimensional array initialized with a given value.
 * @param {*} initialValue - The value to initialize array elements with.
 * @param {...number} dimensions - The dimensions of the array (e.g., createMultiDimArray(0, 2, 3) for a 2x3 array).
 * @returns {Array} The multi-dimensional array.
 */
function createMultiDimArray(initialValue) {
    var dimensions = arguments,
        dimLength = dimensions.length,
        arrayCreationString = "Array(dimensions[" + --dimLength + "]).fill().map(_=>{return " + initialValue + ";})";
    while (--dimLength) arrayCreationString = "Array(dimensions[" + dimLength + "]).fill().map(_=>" + arrayCreationString + ")";
    return eval(arrayCreationString);
}

// Execute the primary logic and capture its output
var programResult = processInputData();

// If the logic produced a result, print it to the console
if (programResult !== undefined) console.log(programResult);

/**
 * Main function to process the input data and determine the outcome.
 * This function checks if a sequence of parentheses strings can be balanced.
 * @returns {string} "Yes" if balanced, "No" otherwise.
 */
function processInputData() {
    const negativeOutcome = "No";
    const positiveOutcome = "Yes";

    var itemCount = readNextToken(); // Number of strings to process
    var openFirstList = [], // Stores strings that start with ')' and end with ')'
        closeFirstList = [], // Stores strings that start with '(' and end with ')'
        totalBalance = 0, // Overall balance of all parentheses
        currentBalance = 0; // Current balance during processing

    // Iterate through each input string
    for (var idx = 0; idx < itemCount; idx++) {
        var minBalance = 0, // Minimum balance encountered within the current string
            finalBalance = 0; // Final balance after processing the current string
        var currentString = readNextToken(true); // Read the string

        // Analyze the balance of parentheses within the current string
        for (var charIdx = 0; charIdx < currentString.length; charIdx++) {
            if (currentString[charIdx] === "(") {
                finalBalance++;
            } else {
                finalBalance--;
                if (finalBalance < minBalance) minBalance = finalBalance;
            }
        }

        totalBalance += finalBalance; // Add string's final balance to overall total

        // Categorize strings based on their balance characteristics
        if (minBalance >= 0) {
            // String can be fully balanced or only increase balance
            currentBalance += finalBalance;
        } else if (finalBalance <= 0) {
            // String starts with ')' and ends with ')' (or 0)
            openFirstList.push([-minBalance, finalBalance]);
        } else {
            // String starts with ')' but ends with '('
            closeFirstList.push([-minBalance, finalBalance]);
        }
    }

    // If the total balance of all strings is not zero, it's impossible to balance
    if (totalBalance !== 0) return negativeOutcome;

    // Process strings that start with ')' and end with ')'
    // Sort by the minimum balance required to open them (ascending)
    closeFirstList.sort((itemA, itemB) => itemA[0] - itemB[0]);
    for (var idx = 0; idx < closeFirstList.length; idx++) {
        // If current balance is insufficient to cover the minimum required for this string
        if (closeFirstList[idx][0] > currentBalance) return negativeOutcome;
        currentBalance += closeFirstList[idx][1]; // Apply the string's final balance
    }

    // Process strings that start with '(' and end with ')'
    // Sort by the minimum balance required to open them (descending)
    openFirstList.sort((itemA, itemB) => itemB[0] - itemA[0]);
    for (var idx = 0; idx < openFirstList.length; idx++) {
        var [minRequired, finalChange] = openFirstList[idx];
        // If current balance is insufficient to cover the minimum required for this string
        if (minRequired > currentBalance) return negativeOutcome;
        currentBalance += finalChange; // Apply the string's final balance
    }

    // If all strings processed and total balance is zero, it's possible
    return positiveOutcome;
}
