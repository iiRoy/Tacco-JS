/*
 * This module provides utilities for parsing structured input data.
 * It's designed to read lines and tokens from a given string source.
 */
var INPUT_PROCESSOR_FACTORY = (function() {
    /**
     * Creates a new data reader instance.
     * This serves as the public interface for obtaining a parser.
     * @param {string} inputContent - The raw string content to be parsed.
     * @returns {DataStreamReader} An instance capable of parsing the input.
     */
    function createReader(inputContent) {
        return new DataStreamReader(inputContent);
    }

    /**
     * DataStreamReader class handles the actual parsing of the input string.
     * It maintains an internal pointer to the current line being processed.
     * @param {string} textData - The entire input string to be processed.
     */
    function DataStreamReader(textData) {
        // Store lines after trimming leading/trailing whitespace and splitting by newline character.
        this._sourceLines = textData.trim().split("\n");
        // Pointer to the current line index, indicating which line to read next.
        this._currentLineIndex = 0;
    }

    /**
     * Fetches the next single token from the current line.
     * If the current line's tokens are exhausted, it implicitly prepares for the next line.
     * @param {boolean} returnRaw - If true, returns the token as a string; otherwise, attempts to convert it to a number.
     * @returns {string|number} The extracted token value.
     */
    DataStreamReader.prototype.fetchNextToken = function(returnRaw) {
        var lineSegments = this._sourceLines,   // Reference to all lines of data
            linePointer = this._currentLineIndex, // Current line number being processed
            tokenValue; // Variable to hold the extracted token

        // Check if the current line is still a single string; if so, split it into tokens.
        if (typeof lineSegments[linePointer] === "string") {
            // Split the line by spaces and reverse the array.
            // This setup allows 'pop()' to effectively retrieve elements from the beginning of the original line.
            lineSegments[linePointer] = lineSegments[linePointer].split(" ").reverse();
        }

        // Extract the last element from the reversed array (which was the first in the original line).
        tokenValue = lineSegments[linePointer].pop();

        // If the current line has no more tokens after popping, advance the line pointer to the next line.
        if (!lineSegments[linePointer].length) {
            this._currentLineIndex++;
        }

        // Return the token, either as its raw string form or converted to a number using unary plus operator.
        return returnRaw ? tokenValue : +tokenValue;
    };

    /**
     * Reads and processes an entire line, returning all its tokens.
     * The line pointer is advanced after reading.
     * @param {boolean} keepText - If true, returns tokens as strings; otherwise, converts them to numbers.
     * @returns {Array<string|number>} An array of tokens from the line.
     */
    DataStreamReader.prototype.getLineContents = function(keepText) {
        // Get the current line, split it into tokens by space, and then advance the line pointer.
        var tokensOnLine = this._sourceLines[this._currentLineIndex++].split(" ");

        // Return tokens as strings or map them to numbers using the unary plus operator.
        return keepText ? tokensOnLine : tokensOnLine.map(numericVal => +numericVal);
    };

    /**
     * Reads a specified number of lines as a matrix (2D array of tokens).
     * Each line is split into individual tokens. The line pointer is advanced.
     * @param {number} rowCount - The number of lines (rows) to read for the matrix.
     * @param {boolean} keepText - If true, returns tokens as strings; otherwise, converts them to numbers.
     * @returns {Array<Array<string|number>>} A 2D array representing the extracted matrix.
     */
    DataStreamReader.prototype.getMatrixData = function(rowCount, keepText) {
        // Slice the specified number of lines from the source and advance the line pointer.
        var extractedMatrix = this._sourceLines.slice(this._currentLineIndex, this._currentLineIndex += rowCount)
            .map(lineEntry => lineEntry.split(" ")); // For each line, split it into an array of tokens.

        // Return the matrix with tokens as strings or map all inner cell values to numbers.
        return keepText ? extractedMatrix : extractedMatrix.map(row => row.map(cell => +cell));
    };

    /**
     * Reads a specified number of lines into a 1D array.
     * The line pointer is advanced after reading.
     * @param {number} lineCount - The number of lines to read.
     * @param {boolean} keepText - If true, returns lines as strings; otherwise, converts them to numbers.
     * @returns {Array<string|number>} An array containing the specified lines.
     */
    DataStreamReader.prototype.getLinesAsArray = function(lineCount, keepText) {
        // Slice the specified number of lines from the source and advance the line pointer.
        var lineCollection = this._sourceLines.slice(this._currentLineIndex, this._currentLineIndex += lineCount);

        // Return the lines as strings or map each line's value to a number.
        return keepText ? lineCollection : lineCollection.map(lineValue => +lineValue);
    };

    return createReader; // The factory function is returned as the module's export.
})();

// Create an input processor instance by reading raw data from standard input.
var dataHandler = INPUT_PROCESSOR_FACTORY(require("fs").readFileSync("/dev/stdin", "utf8"));

/**
 * Dynamically creates a multi-dimensional array with a specified fill value.
 * The dimensions for the array are passed as additional arguments to the function.
 * Example: initializeNestedArray(0, 2, 3) would create a 2x3 array filled with 0s.
 * @param {*} initialValue - The value to fill all elements of the array with.
 * @param {...number} dimensions - The dimensions of the array (e.g., dim1, dim2, dim3).
 * @returns {Array} The newly initialized multi-dimensional array.
 */
function initializeNestedArray(initialValue) {
    var dimensions = arguments, // Access all arguments to get the dimensions.
        dimCount = dimensions.length, // Total number of dimensions specified.
        // Start building the array creation expression from the innermost dimension.
        arrayExpression = "Array(dimensions[" + --dimCount + "]).fill(0).map(_ => {return " + initialValue + ";})";

    // Construct nested map calls for each preceding dimension.
    while (--dimCount) {
        arrayExpression = "Array(dimensions[" + dimCount + "]).fill(0).map(_ => " + arrayExpression + ")";
    }

    // Evaluate the constructed string to dynamically create and return the multi-dimensional array.
    return eval(arrayExpression);
}

// Execute the main computation function and log its result to the console.
console.log(processInputData());

/**
 * Main function to process the input data and compute the required sum.
 * This function implements the core logic for the problem.
 * @returns {number} The maximum accumulated sum found based on the problem's criteria.
 */
function processInputData() {
    // Read the total number of elements from the input using the data handler.
    var totalElements = dataHandler.fetchNextToken();
    // Read the sequence of values (an array of numbers) from the next line of input.
    var valueSequence = dataHandler.getLineContents();
    // Initialize the variable to store the highest sum found across all valid iterations.
    var maxAccumulatedSum = 0;
    // Calculate the midpoint of the sequence for loop boundary conditions (integer division by 2).
    var midpoint = totalElements >> 1;

    // Outer loop iterates through possible 'stride' values, from 1 up to (midpoint - 1).
    for (var stride = 1; stride < midpoint; stride++) {
        // A Set to keep track of indices already included in a pair within the current stride,
        // preventing double-counting or invalid pairings.
        var visitedIndices = new Set();
        // Accumulator for the sum of pairs found in the current stride iteration.
        var iterationSum = 0;

        // Inner loop iterates through starting positions based on the current stride.
        // It goes from 'stride' up to 'totalElements - 2', incrementing by 'stride'.
        for (var startPosition = stride; startPosition < totalElements - 1; startPosition += stride) {
            // Calculate the symmetric counterpart index for the current startPosition.
            var counterpartIndex = totalElements - startPosition - 1;

            // Check for invalid conditions that would cause the inner loop to break:
            // 1. If the current startPosition has already been visited in this stride.
            // 2. If its symmetric counterpart has already been visited.
            // 3. If startPosition and its counterpart are the same (occurs with the middle element in odd-length sequences).
            if (visitedIndices.has(startPosition) || visitedIndices.has(counterpartIndex) || startPosition === counterpartIndex) {
                break; // Break the inner loop for this stride, as further iterations would be invalid.
            }

            // Add the values from the current position and its symmetric counterpart to the iteration sum.
            iterationSum += valueSequence[startPosition] + valueSequence[counterpartIndex];

            // Update the global maximum accumulated sum if the current iteration's sum is higher.
            if (maxAccumulatedSum < iterationSum) {
                maxAccumulatedSum = iterationSum;
            }

            // Mark both the current position and its counterpart as visited for this stride.
            visitedIndices.add(startPosition);
            visitedIndices.add(counterpartIndex);
        }
    }

    // Return the overall maximum sum found after checking all valid strides and pairs.
    return maxAccumulatedSum;
}