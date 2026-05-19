"use strict";

// Module to read file system input
var rawData = require("fs").readFileSync("/dev/stdin", "utf8");

// Global array to store parsed input tokens and an index for current position
var tokenStream = rawData.split(/ |\n/),
    tokenIndex = 0;

/**
 * Retrieves the next token from the input stream.
 * @param {boolean} returnAsString - If true, returns the token as a string; otherwise, converts it to a number.
 * @returns {string|number} The next token.
 */
function getNextToken(returnAsString) {
    return returnAsString ? tokenStream[tokenIndex++] : +tokenStream[tokenIndex++];
}

/**
 * Retrieves a specified number of tokens from the input stream.
 * @param {number} numberOfTokens - The quantity of tokens to retrieve.
 * @param {boolean} returnAsString - If true, returns tokens as strings; otherwise, converts them to numbers.
 * @returns {Array<string|number>} An array containing the retrieved tokens.
 */
function getMultipleTokens(numberOfTokens, returnAsString) {
    // Extract a segment of tokens and advance the global index
    var extractedSegment = tokenStream.slice(tokenIndex, tokenIndex + numberOfTokens);
    tokenIndex += numberOfTokens;
    return returnAsString ? extractedSegment : extractedSegment.map(currentValue => +currentValue);
}

/**
 * Retrieves a matrix (2D array) of tokens from the input stream.
 * @param {number} matrixHeight - The number of rows in the matrix.
 * @param {number} matrixWidth - The number of columns per row.
 * @param {boolean} returnAsString - If true, returns tokens as strings; otherwise, converts them to numbers.
 * @returns {Array<Array<string|number>>} A 2D array representing the matrix.
 */
function getMatrixTokens(matrixHeight, matrixWidth, returnAsString) {
    var matrixRows = [],
        currentRowIndex = 0;
    if (returnAsString) {
        for (; currentRowIndex < matrixHeight; currentRowIndex++) {
            matrixRows.push(tokenStream.slice(tokenIndex, tokenIndex + matrixWidth));
            tokenIndex += matrixWidth;
        }
    } else {
        for (; currentRowIndex < matrixHeight; currentRowIndex++) {
            matrixRows.push(tokenStream.slice(tokenIndex, tokenIndex + matrixWidth).map(currentValue => +currentValue));
            tokenIndex += matrixWidth;
        }
    }
    return matrixRows;
}

/**
 * Creates a multi-dimensional array dynamically based on provided dimensions.
 * @param {*} initialFillValue - The value to populate the innermost array elements with.
 * @param {...number} dimensions - A variable number of arguments representing the dimensions of the array.
 * @returns {Array} The newly created multi-dimensional array.
 */
function createMultiDimArray(initialFillValue) {
    var dimensionArguments = arguments,
        dimensionCount = dimensionArguments.length,
        arrayConstructionString = "Array(dimensionArguments[" + --dimensionCount + "]).fill().map(_element=>{return " + initialFillValue + ";})";
    while (--dimensionCount) {
        arrayConstructionString = "Array(dimensionArguments[" + dimensionCount + "]).fill().map(_element=>" + arrayConstructionString + ")";
    }
    return eval(arrayConstructionString);
}

// Execute the core problem-solving function and store its return value
var programResult = executeLogic();

// If the function returned a defined value, print it to the console
if (programResult !== undefined) {
    console.log(programResult);
}

/**
 * Contains the main algorithm for solving the problem.
 * @returns {string|undefined} The final output string, or undefined if no specific output is generated.
 */
function executeLogic() {
    // Read the initial counts (N, A, B, C) and the array of item strings
    var [countItems, valA, valB, valC] = getMultipleTokens(4);
    var itemStrings = getMultipleTokens(countItems, true);

    // Initialize an array to store the sequence of choices and a constant for the "No" outcome
    var resultSequence = [];
    var noOutcome = "No";

    // Iterate through the item strings, processing pairs up to the second-to-last item
    for (var currentItemIndex = 0; currentItemIndex < countItems - 1; currentItemIndex++) {
        // Logic for "AB" pair
        if (itemStrings[currentItemIndex] === "AB") {
            valA--;
            valB--;
            // If both counts become negative, it's an impossible state
            if (valA < 0 && valB < 0) return noOutcome;

            // Decide whether to increment B or A based on current counts and the next item
            if (valA > valB || (itemStrings[currentItemIndex + 1] !== "AC" && valA >= 0)) {
                valB += 2;
                resultSequence.push("B");
            } else {
                valA += 2;
                resultSequence.push("A");
            }
        }
        // Logic for "AC" pair
        if (itemStrings[currentItemIndex] === "AC") {
            valA--;
            valC--;
            // If both counts become negative, it's an impossible state
            if (valA < 0 && valC < 0) return noOutcome;

            // Decide whether to increment C or A based on current counts and the next item
            if (valA > valC || (itemStrings[currentItemIndex + 1] !== "AB" && valA >= 0)) {
                valC += 2;
                resultSequence.push("C");
            } else {
                valA += 2;
                resultSequence.push("A");
            }
        }
        // Logic for "BC" pair
        if (itemStrings[currentItemIndex] === "BC") {
            valC--;
            valB--;
            // If both counts become negative, it's an impossible state
            if (valC < 0 && valB < 0) return noOutcome;

            // Decide whether to increment B or C based on current counts and the next item
            if (valC > valB || (itemStrings[currentItemIndex + 1] !== "AC" && valC >= 0)) {
                valB += 2;
                resultSequence.push("B");
            } else {
                valC += 2;
                resultSequence.push("C");
            }
        }
    }

    // Handle the very last item string separately, as there is no "next" item to consider
    if (itemStrings[countItems - 1] === "AB") {
        valA--;
        valB--;
        if (valA < 0 && valB < 0) return noOutcome;
        if (valA > valB) resultSequence.push("B");
        else resultSequence.push("A");
    } else if (itemStrings[countItems - 1] === "AC") {
        valA--;
        valC--;
        if (valA < 0 && valC < 0) return noOutcome;
        if (valA > valC) resultSequence.push("C");
        else resultSequence.push("A");
    } else { // The last item must be "BC"
        valB--;
        valC--;
        if (valB < 0 && valC < 0) return noOutcome;
        if (valB > valC) resultSequence.push("C");
        else resultSequence.push("B");
    }

    // If the algorithm successfully completed, print "Yes" and the joined sequence of choices
    console.log("Yes");
    return resultSequence.join("\n");
}
