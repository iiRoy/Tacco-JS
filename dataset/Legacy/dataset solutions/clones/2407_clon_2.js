"use strict"; // Enforce strict mode for cleaner code and better error handling.

// This Immediately Invoked Function Expression (IIFE) creates and returns a factory function
// for an input parsing utility. It encapsulates the parsing logic.
var INPUT_PARSER = (function() {
    /**
     * Factory function to instantiate a new InputReader object.
     * @param {string} rawInputContent - The complete raw string content read from an input source (e.g., stdin).
     * @returns {InputReader} A new instance of the InputReader.
     */
    function createParser(rawInputContent) {
        return new InputReader(rawInputContent);
    }

    /**
     * Constructor for the InputReader class.
     * This class provides methods to sequentially read different formats of data from the input.
     * @param {string} initialText - The string content that needs to be parsed, typically from a file or stdin.
     */
    function InputReader(initialText) {
        // Internal storage for the input lines. Each line is initially a string.
        // `trim()` removes leading/trailing whitespace, `split('\n')` breaks it into an array of lines.
        this._sourceLines = initialText.trim().split("\n");
        // Keeps track of the current line being processed.
        this._currentLineIndex = 0;
    }

    /**
     * Reads the next single value from the current line. Values are assumed to be space-separated.
     * If the current line is exhausted, it automatically advances to the next line.
     * @param {boolean} [returnAsString=false] - If true, the value is returned as a string; otherwise, it's converted to a number.
     * @returns {string|number} The parsed value.
     */
    InputReader.prototype.readNextValue = function(returnAsString) {
        var allLines = this._sourceLines;
        var currentLinePos = this._currentLineIndex;
        var obtainedValue;

        // Check if the current line is still a single string (meaning it hasn't been split into values yet).
        if (typeof allLines[currentLinePos] === "string") {
            // Split the current line by spaces and reverse the array.
            // Reversing allows `pop()` to efficiently retrieve elements from the "front" of the line.
            allLines[currentLinePos] = allLines[currentLinePos].split(" ").reverse();
        }

        // Extract the last element (which was originally the first) from the current line's array of values.
        obtainedValue = allLines[currentLinePos].pop();

        // If the current line's array of values is now empty, increment the line index to move to the next line.
        if (!allLines[currentLinePos].length) {
            this._currentLineIndex++;
        }

        // Return the value either as a string or converted to a number using the unary plus operator.
        return returnAsString ? obtainedValue : +obtainedValue;
    };

    /**
     * Reads an entire line, splits it by spaces, and returns an array of values.
     * The line index is advanced after reading.
     * @param {boolean} [returnAsString=false] - If true, values are returned as strings; otherwise, as numbers.
     * @returns {Array<string|number>} An array containing all values from the read line.
     */
    InputReader.prototype.readLineValues = function(returnAsString) {
        // Get the current line, split it by spaces, and then immediately advance the line index.
        var lineSegments = this._sourceLines[this._currentLineIndex++].split(" ");
        // If `returnAsString` is false, map each segment to its numeric representation.
        return returnAsString ? lineSegments : lineSegments.map(segment => +segment);
    };

    /**
     * Reads a specified number of lines (`numLines`) as a matrix (2D array).
     * Each line is split into space-separated values. The line index is advanced by `numLines`.
     * @param {number} numLines - The count of lines to read for the matrix.
     * @param {boolean} [returnAsString=false] - If true, all values in the matrix are strings; otherwise, numbers.
     * @returns {Array<Array<string|number>>} A 2D array representing the matrix.
     */
    InputReader.prototype.readMatrix = function(numLines, returnAsString) {
        // Extract a slice of lines from the source, then advance the line index.
        // Each extracted line is then split into its individual parts.
        var resultingMatrix = this._sourceLines.slice(this._currentLineIndex, this._currentLineIndex += numLines)
                                            .map(lineContent => lineContent.split(" "));
        // If `returnAsString` is false, iterate through rows and then through values in each row to convert them to numbers.
        return returnAsString ? resultingMatrix : resultingMatrix.map(row => row.map(value => +value));
    };

    /**
     * Reads a specified number of lines (`numLines`), treating each line as a single value.
     * The line index is advanced by `numLines`.
     * @param {number} numLines - The count of lines to read.
     * @param {boolean} [returnAsString=false] - If true, lines are returned as strings; otherwise, as numbers.
     * @returns {Array<string|number>} An array of values, where each value corresponds to a line.
     */
    InputReader.prototype.readLines = function(numLines, returnAsString) {
        // Extract a slice of lines from the source, then advance the line index.
        var resultingLines = this._sourceLines.slice(this._currentLineIndex, this._currentLineIndex += numLines);
        // If `returnAsString` is false, map each line to its numeric representation.
        return returnAsString ? resultingLines : resultingLines.map(lineContent => +lineContent);
    };

    return createParser; // The IIFE returns the factory function `createParser`.
})();

// Initialize the input data parser by reading the entire content of standard input.
var inputData = INPUT_PARSER(require("fs").readFileSync("/dev/stdin", "utf8"));

/**
 * Creates a multi-dimensional array initialized with a specific value.
 * The dimensions of the array are provided as subsequent arguments.
 * For example, `createMultiDimArray(0, 2, 3)` creates a 2x3 array filled with zeros.
 * @param {*} initialValue - The value to fill all elements of the array with.
 * @param {...number} dimensions - A variable number of arguments specifying the size of each dimension.
 * @returns {Array} The newly created multi-dimensional array.
 */
function createMultiDimArray(initialValue) {
    var functionArguments = arguments; // Access all arguments passed to the function.
    var argumentCount = functionArguments.length; // Get the total number of arguments.
    // Start building the string for array creation from the innermost dimension.
    // `Array(argsList[--argCount])` gets the last dimension.
    var arrayCreationString = "Array(functionArguments[" + --argumentCount + "]).fill(0).map(x=>{return " + initialValue + ";})";

    // Loop backwards through the remaining dimensions to build the nested array structure string.
    while (--argumentCount) {
        arrayCreationString = "Array(functionArguments[" + argumentCount + "]).fill(0).map(x=>" + arrayCreationString + ")";
    }
    // Use `eval` to execute the dynamically constructed string, creating the multi-dimensional array.
    return eval(arrayCreationString);
}

// Print the result of the main calculation function to the console.
console.log(calculateScore());

/**
 * This is the primary function that orchestrates the problem's logic.
 * It reads two input values and computes a total score based on specific conditions.
 * @returns {number} The final calculated score.
 */
function calculateScore() {
    // Read the first numeric input value using the input parser.
    var firstInput = inputData.readNextValue();
    // Read the second numeric input value.
    var secondInput = inputData.readNextValue();
    var totalScore = 0; // Initialize a variable to accumulate the score.

    // Apply score based on the value of the first input.
    if (firstInput === 1.0) totalScore += 300_000; // Add 300,000 if first input is 1.
    if (firstInput === 2.0) totalScore += 200_000; // Add 200,000 if first input is 2.
    if (firstInput === 3.0) totalScore += 100_000; // Add 100,000 if first input is 3.

    // Apply score based on the value of the second input.
    if (secondInput === 1.0) totalScore += 300_000; // Add 300,000 if second input is 1.
    if (secondInput === 2.0) totalScore += 200_000; // Add 200,000 if second input is 2.
    if (secondInput === 3.0) totalScore += 100_000; // Add 100,000 if second input is 3.

    // Apply a bonus score if both inputs are exactly 1.
    if (firstInput === 1.0 && secondInput === 1.0) totalScore += 400_000; // Add 400,000 bonus.

    return totalScore; // Return the final computed score.
}
