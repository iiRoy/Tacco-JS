"use strict";

// This Immediately Invoked Function Expression (IIFE) creates a factory function
// for parsing input data from a string source.
var DATA_PARSER = (function () {
    /**
     * Factory function to create an input handler instance.
     * @param {string} sourceString - The raw input string, typically read from stdin.
     * @returns {InputHandler} A new instance of the InputHandler.
     */
    function createParser(sourceString) {
        return new InputHandler(sourceString);
    }

    /**
     * Constructor for the InputHandler. Manages the state of input parsing.
     * @param {string} sourceString - The raw input string to be parsed.
     */
    function InputHandler(sourceString) {
        // Stores the input lines after trimming leading/trailing whitespace and splitting by newline.
        this.lines = sourceString.trim().split("\n");
        // Keeps track of the current line index being processed.
        this.currentLineIndex = 0;
    }

    /**
     * Reads the next space-separated token from the current line.
     * If the current line is exhausted, it automatically advances to the next line.
     * @param {boolean} [shouldReturnAsString=false] - If true, the token is returned as a string; otherwise, it's converted to a number.
     * @returns {string|number} The parsed token.
     */
    InputHandler.prototype.readNextToken = function (shouldReturnAsString) {
        var allLines = this.lines;
        var linePointer = this.currentLineIndex;
        var extractedToken;

        // If the current line is still a raw string, split it into tokens and reverse the array.
        // Reversing allows `pop()` to retrieve tokens in their original order (from left to right).
        if (typeof allLines[linePointer] === "string") {
            allLines[linePointer] = allLines[linePointer].split(" ").reverse();
        }

        // Extract the next token (which is the last element after reversing).
        extractedToken = allLines[linePointer].pop();

        // If the current line's token array is now empty, increment the line pointer.
        if (!allLines[linePointer].length) {
            this.currentLineIndex++;
        }

        // Return the token, either as a string or converted to a number.
        return shouldReturnAsString ? extractedToken : +extractedToken;
    };

    /**
     * Reads an entire line, splits it into space-separated tokens, and advances the line pointer.
     * @param {boolean} [shouldReturnAsString=false] - If true, tokens are returned as strings; otherwise, as numbers.
     * @returns {Array<string|number>} An array of tokens from the read line.
     */
    InputHandler.prototype.readLineTokens = function (shouldReturnAsString) {
        // Get the current line, split it, and then advance the line pointer.
        var lineTokens = this.lines[this.currentLineIndex++].split(" ");
        // Map tokens to numbers if not requested as strings.
        return shouldReturnAsString ? lineTokens : lineTokens.map(tokenItem => +tokenItem);
    };

    /**
     * Reads a specified number of lines and parses them as a matrix of tokens.
     * Each line is split by spaces.
     * @param {number} numberOfLines - The count of lines to read for the matrix.
     * @param {boolean} [shouldReturnAsString=false] - If true, matrix elements are strings; otherwise, numbers.
     * @returns {Array<Array<string|number>>} A 2D array (matrix) of parsed tokens.
     */
    InputHandler.prototype.readMatrix = function (numberOfLines, shouldReturnAsString) {
        // Slice the relevant rows from the input and advance the line pointer.
        var matrixData = this.lines.slice(this.currentLineIndex, this.currentLineIndex += numberOfLines)
                                   .map(singleRow => singleRow.split(" ")); // Split each row string into an array of elements.

        // Map all elements in the matrix to numbers if not requested as strings.
        return shouldReturnAsString ? matrixData : matrixData.map(rowArray => rowArray.map(elementValue => +elementValue));
    };

    /**
     * Reads a specified number of lines as raw strings or converts them to numbers.
     * @param {number} numberOfLines - The count of lines to read.
     * @param {boolean} [shouldReturnAsString=false] - If true, lines are returned as strings; otherwise, as numbers.
     * @returns {Array<string|number>} An array containing the content of the read lines.
     */
    InputHandler.prototype.readRows = function (numberOfLines, shouldReturnAsString) {
        // Slice the relevant rows from the input and advance the line pointer.
        var rawLineContents = this.lines.slice(this.currentLineIndex, this.currentLineIndex += numberOfLines);
        // Map row contents to numbers if not requested as strings.
        return shouldReturnAsString ? rawLineContents : rawLineContents.map(lineContent => +lineContent);
    };

    return createParser;
})();

// Initialize the input reader by providing it with all data read from standard input.
var inputReader = DATA_PARSER(require("fs").readFileSync("/dev/stdin", "utf8"));

/**
 * Dynamically creates a multi-dimensional array initialized with a specific value.
 * The dimensions are provided as subsequent arguments after the initial value.
 * For example, `createMultiDimArray(0, 2, 3)` would produce `[[0,0,0],[0,0,0]]`.
 * @param {*} initialValue - The value to fill all elements of the array with.
 * @param {...number} dimensions - The sizes of each dimension of the array.
 * @returns {Array} The newly created multi-dimensional array.
 */
function createMultiDimArray(initialValue) {
    var functionArguments = arguments;
    var argumentCount = functionArguments.length;
    // Start building the `eval` string for the innermost array.
    var arrayCreationExpression = "Array(functionArguments[" + --argumentCount + "]).fill(0).map(x=>{return " + initialValue + ";})";

    // Loop to construct the nested `Array.map` calls for higher dimensions.
    while (--argumentCount) {
        arrayCreationExpression = "Array(functionArguments[" + argumentCount + "]).fill(0).map(x=>" + arrayCreationExpression + ")";
    }
    // Execute the dynamically constructed string to create the array.
    return eval(arrayCreationExpression);
}

// Execute the primary logic of the program and store its return value.
var programResult = main();

// If the main function returned a value (i.e., not `undefined`), print it to the console.
if (programResult !== undefined) {
    console.log(programResult);
}

/**
 * The main function containing the core algorithm of the program.
 * It reads input, processes it, and returns a formatted string.
 */
function main() {
    // Read three integer values from the input stream.
    var countN = inputReader.readNextToken();
    var limitK = inputReader.readNextToken();
    var startValueS = inputReader.readNextToken();

    // Create an array of size 'countN', initially filled with the value 1.
    var resultArray = createMultiDimArray(1, countN);

    // Populate the first 'limitK' elements of the array with 'startValueS'.
    for (var loopIndex = 0; loopIndex < limitK; loopIndex++) {
        resultArray[loopIndex] = startValueS;
    }

    // If 'startValueS' is less than or equal to 'countN',
    // fill the remaining elements (from 'limitK' up to 'countN') with 'startValueS + 1'.
    if (startValueS <= countN) {
        for (; loopIndex < countN; loopIndex++) {
            resultArray[loopIndex] = startValueS + 1;
        }
    }

    // Join all elements of the final array with a space and return the resulting string.
    return resultArray.join(" ");
}
