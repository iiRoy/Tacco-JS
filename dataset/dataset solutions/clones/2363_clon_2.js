"use strict"; // Enable strict mode for secure and robust JavaScript execution.

// This module encapsulates functionality for structured input processing.
var InputProcessor = (function() {

    // Primary factory method to instantiate an InputReader.
    function createInputReader(sourceContent) {
        return new InputReader(sourceContent);
    }

    // Constructor function for the InputReader object.
    function InputReader(initialTextData) {
        // Internal storage for lines of text, pre-processed.
        this._linesOfText = initialTextData.trim().split("\n");
        // Index tracking the current line being processed.
        this._currentLineIndex = 0;
    }

    // Prototype method to extract a single data token from the current line.
    InputReader.prototype.getSegment = function(returnAsText) {
        var currentDataStore = this._linesOfText, // Reference to the lines array.
            linePosition = this._currentLineIndex, // Current reading position.
            extractedToken; // Variable to hold the result.

        // If the current line is still a single string, split it into tokens (reversed for easy popping).
        if (typeof currentDataStore[linePosition] === "string") {
            currentDataStore[linePosition] = currentDataStore[linePosition].split(" ").reverse();
        }

        // Retrieve the next token from the end of the (reversed) array.
        extractedToken = currentDataStore[linePosition].pop();

        // If the current line is exhausted, advance the line pointer.
        if (!currentDataStore[linePosition].length) {
            this._currentLineIndex++;
        }

        // Return the token either as its raw string form or as a numeric value.
        return returnAsText ? extractedToken : +extractedToken;
    };

    // Prototype method to read an entire line, splitting it into tokens.
    InputReader.prototype.getLine = function(returnAsText) {
        // Fetch the line, increment the index, and split by spaces.
        var parsedLineTokens = this._linesOfText[this._currentLineIndex++].split(" ");

        // Return the array of tokens, either as strings or numerically mapped.
        return returnAsText ? parsedLineTokens : parsedLineTokens.map(tokenItem => +tokenItem);
    };

    // Prototype method to read a block of lines, each split into tokens, forming a matrix.
    InputReader.prototype.getMatrix = function(numRows, returnAsText) {
        // Slice the required number of lines, then update the line index.
        // Each line is then mapped to an array of its space-separated tokens.
        var collectedRows = this._linesOfText
                               .slice(this._currentLineIndex, this._currentLineIndex += numRows)
                               .map(rowContent => rowContent.split(" "));

        // Return the matrix, either with string tokens or numeric tokens.
        return returnAsText ? collectedRows : collectedRows.map(row => row.map(item => +item));
    };

    // Prototype method to read a specified number of raw lines without splitting them.
    InputReader.prototype.getRawLines = function(numRows, returnAsText) {
        // Extract a block of lines directly, then advance the line index.
        var rawLineBlock = this._linesOfText.slice(this._currentLineIndex, this._currentLineIndex += numRows);

        // Return the lines, either as strings or attempting numeric conversion for each.
        return returnAsText ? rawLineBlock : rawLineBlock.map(lineValue => +lineValue);
    };

    // The immediately invoked function expression returns the factory method.
    return createInputReader;

})();


// Instantiate an input reader, sourcing data from standard input.
var readerInstance = InputProcessor(require("fs").readFileSync("/dev/stdin", "utf8"));


// Utility function to dynamically construct multi-dimensional arrays.
function multiDimArrayCreator(initialFillValue) {
    var passedArguments = arguments, // Access all arguments for dimension sizes.
        dimensionCount = passedArguments.length, // Total number of dimensions.
        // Start building the string for the innermost array creation.
        arrayBuildString = "Array(passedArguments[" + --dimensionCount + "]).fill(0).map(cell => { return " + initialFillValue + "; })";

    // Loop backwards to construct outer dimensions, nesting the array creation string.
    while (--dimensionCount) {
        arrayBuildString = "Array(passedArguments[" + dimensionCount + "]).fill(0).map(cell => " + arrayBuildString + ")";
    }

    // Evaluate the constructed string to produce the multi-dimensional array.
    return eval(arrayBuildString);
}


// Execute the main program logic and print its output to the console.
console.log(executeMainLogic());

// Main function encapsulating the primary business logic.
function executeMainLogic() {
    // Read the first line of input data.
    var firstDataLine = readerInstance.getLine();
    // Read the second line of input data.
    // Note: This variable declaration shadows the previous 'firstDataLine' in the original code's logic.
    var secondDataLine = readerInstance.getLine();

    // Evaluate a condition based on the second element of the last read line.
    // Returns 1 if true, 0 if false.
    return secondDataLine[1] === 1 ? 1 : 0;
}