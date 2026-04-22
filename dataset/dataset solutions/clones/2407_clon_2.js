"use strict";

// This module provides utilities for parsing various data formats from a string input.
var DATA_PARSER = (function() {

    /**
     * Factory function to create an InputProcessor instance.
     * @param {string} rawInputContent - The entire input string.
     * @returns {InputProcessor} A new InputProcessor object.
     */
    function createParser(rawInputContent) {
        return new InputProcessor(rawInputContent);
    }

    /**
     * Constructor for InputProcessor. Manages reading lines and tokens.
     * @param {string} entireStringData - The complete string data to be processed.
     */
    function InputProcessor(entireStringData) {
        this._sourceLines = entireStringData.trim().split("\n"); // Store lines as an array of strings
        this._currentLineIndex = 0;                               // Current line being processed
    }

    /**
     * Reads and returns the next token from the current line. If the current line is exhausted,
     * it moves to the next line. Tokens are space-separated.
     * @param {boolean} retrieveAsString - If true, returns the token as a string; otherwise, converts to a number.
     * @returns {string|number} The next token.
     */
    InputProcessor.prototype.readNextToken = function(retrieveAsString) {
        let currentSourceLines = this._sourceLines;
        let activeLineIdx = this._currentLineIndex;
        let retrievedToken;

        // If the current line hasn't been split into tokens yet, do so and reverse it
        // so that pop() efficiently gets tokens from the "front" of the original line.
        if (typeof currentSourceLines[activeLineIdx] === "string") {
            currentSourceLines[activeLineIdx] = currentSourceLines[activeLineIdx].split(" ").reverse();
        }

        retrievedToken = currentSourceLines[activeLineIdx].pop(); // Get the last element (which was the first token)

        // If the current line is now empty, advance to the next line for future reads.
        if (!currentSourceLines[activeLineIdx].length) {
            this._currentLineIndex++;
        }

        return retrieveAsString ? retrievedToken : Number(retrievedToken);
    };

    /**
     * Reads all space-separated tokens from the current line and advances to the next line.
     * @param {boolean} asTextForm - If true, returns tokens as strings; otherwise, converts to numbers.
     * @returns {Array<string|number>} An array of tokens from the line.
     */
    InputProcessor.prototype.readLineTokens = function(asTextForm) {
        let lineContents = this._sourceLines[this._currentLineIndex++];
        let tokenizedLine = lineContents.split(" ");
        return asTextForm ? tokenizedLine : tokenizedLine.map(tokenItem => Number(tokenItem));
    };

    /**
     * Reads a specified number of lines as a matrix (array of arrays), where each line is split into tokens.
     * Advances the current line index by 'numRowsToRead'.
     * @param {number} numRowsToRead - The number of lines to read.
     * @param {boolean} keepStrings - If true, matrix elements remain strings; otherwise, converted to numbers.
     * @returns {Array<Array<string|number>>} A 2D array representing the matrix.
     */
    InputProcessor.prototype.readMatrix = function(numRowsToRead, keepStrings) {
        let matrixSlice = this._sourceLines.slice(this._currentLineIndex, this._currentLineIndex += numRowsToRead);
        let processedMatrix = matrixSlice.map(lineStr => lineStr.split(" "));

        return keepStrings ? processedMatrix : processedMatrix.map(rowArr => rowArr.map(cellVal => Number(cellVal)));
    };

    /**
     * Reads a specified number of lines and returns them as an array.
     * Advances the current line index by 'numLinesToExtract'.
     * @param {number} numLinesToExtract - The number of lines to read.
     * @param {boolean} preserveText - If true, lines remain strings; otherwise, converted to numbers.
     * @returns {Array<string|number>} An array of lines.
     */
    InputProcessor.prototype.readRows = function(numLinesToExtract, preserveText) {
        let extractedLines = this._sourceLines.slice(this._currentLineIndex, this._currentLineIndex += numLinesToExtract);
        return preserveText ? extractedLines : extractedLines.map(lineValue => Number(lineValue));
    };

    return createParser;
})();

// Initialize an input parser by reading content from standard input.
var inputReader = DATA_PARSER(require("fs").readFileSync("/dev/stdin", "utf8"));

/**
 * Creates a multi-dimensional array initialized with a default value.
 * The dimensions are provided as subsequent arguments.
 * @param {*} initialValue - The value to fill the array with.
 * @param {...number} dimensions - The sizes of each dimension.
 * @returns {Array} The multi-dimensional array.
 */
function createMultiDimArray(initialValue) {
    let allArguments = arguments;
    let dimensionCount = allArguments.length;
    let arrayConstructionString = "Array(allArguments[" + --dimensionCount + "]).fill(0).map(element => {return " + initialValue + ";})";

    while (--dimensionCount) {
        arrayConstructionString = "Array(allArguments[" + dimensionCount + "]).fill(0).map(element => " + arrayConstructionString + ")";
    }
    return eval(arrayConstructionString);
}

// Execute the main logic and print the result to the console.
console.log(calculateResult());

/**
 * Main function to perform calculations based on input values.
 * @returns {number} The final computed score.
 */
function calculateResult() {
    let firstInputVal = inputReader.readNextToken();
    let secondInputVal = inputReader.readNextToken();
    let finalScore = 0;

    if (firstInputVal === 1) finalScore += 300000;
    if (firstInputVal === 2) finalScore += 200000;
    if (firstInputVal === 3) finalScore += 100000;

    if (secondInputVal === 1) finalScore += 300000;
    if (secondInputVal === 2) finalScore += 200000;
    if (secondInputVal === 3) finalScore += 100000;

    if (firstInputVal === 1 && secondInputVal === 1) finalScore += 400000;

    return finalScore;
}