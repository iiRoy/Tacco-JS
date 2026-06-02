'use strict';

// This module provides a utility for parsing input data from a string.
var DATA_PARSER = (function () {
    /**
     * Factory function to create a new InputParser instance.
     * @param {string} rawInputString - The complete input string, typically read from stdin.
     * @returns {InputParser} An instance of the InputParser.
     */
    function createParser(rawInputString) {
        return new InputParser(rawInputString);
    }

    /**
     * Constructor for the InputParser.
     * @param {string} inputStr - The string containing all input lines.
     */
    function InputParser(inputStr) {
        // Store input lines, trimmed and split by newline.
        this._sourceLines = inputStr.trim().split('\n');
        // Keep track of the current line being processed.
        this._currentLineIndex = 0x0;
    }

    /**
     * Reads a single number or string token from the current line.
     * If the line is exhausted, it moves to the next.
     * @param {boolean} [asString=false] - If true, returns the token as a string; otherwise, as a number.
     * @returns {string|number} The parsed token.
     */
    InputParser.prototype.readNumberOrString = function (asString) {
        var linesArray = this._sourceLines;
        var lineIdx = this._currentLineIndex;
        var tokenValue;

        // If the current line hasn't been split into tokens yet, do it.
        // Tokens are stored in reverse order for efficient popping.
        if (typeof linesArray[lineIdx] === 'string') {
            linesArray[lineIdx] = linesArray[lineIdx].split(' ').reverse();
        }

        // Pop the last token (which was originally the first due to reverse).
        tokenValue = linesArray[lineIdx].pop();

        // If the current line is now empty, advance to the next line.
        if (!linesArray[lineIdx].length) {
            this._currentLineIndex++;
        }

        // Return as string or convert to number.
        return asString ? tokenValue : +tokenValue;
    };

    /**
     * Reads an entire line and returns its tokens.
     * @param {boolean} [asStrings=false] - If true, returns tokens as strings; otherwise, as numbers.
     * @returns {Array<string|number>} An array of tokens from the line.
     */
    InputParser.prototype.readLineOfNumbersOrStrings = function (asStrings) {
        // Get the current line, split it by space, and advance the line index.
        var lineTokens = this._sourceLines[this._currentLineIndex++].split(' ');
        // Return as strings or convert all to numbers.
        return asStrings ? lineTokens : lineTokens.map(val => +val);
    };

    /**
     * Reads 'count' number of lines, splitting each into tokens.
     * @param {number} count - The number of lines to read.
     * @param {boolean} [asStrings=false] - If true, returns tokens as strings; otherwise, as numbers.
     * @returns {Array<Array<string|number>>} A 2D array (matrix) of tokens.
     */
    InputParser.prototype.readMatrix = function (count, asStrings) {
        // Slice the required number of lines and advance the line index.
        var rawLines = this._sourceLines.slice(this._currentLineIndex, this._currentLineIndex += count);
        // Split each line into tokens.
        var processedMatrix = rawLines.map(line => line.split(' '));
        // Return as strings or convert all tokens in the matrix to numbers.
        return asStrings ? processedMatrix : processedMatrix.map(row => row.map(item => +item));
    };

    /**
     * Reads 'count' number of lines as whole strings or numbers.
     * @param {number} count - The number of lines to read.
     * @param {boolean} [asStrings=false] - If true, returns lines as strings; otherwise, as numbers.
     * @returns {Array<string|number>} An array of lines.
     */
    InputParser.prototype.readLines = function (count, asStrings) {
        // Slice the required number of lines and advance the line index.
        var rawLines = this._sourceLines.slice(this._currentLineIndex, this._currentLineIndex += count);
        // Return as strings or convert each line to a number.
        return asStrings ? rawLines : rawLines.map(line => +line);
    };

    return createParser;
})();

// Initialize the input reader by reading from standard input.
var inputReader = DATA_PARSER(require('fs').readFileSync('/dev/stdin', 'utf8'));

/**
 * Creates a multi-dimensional array initialized with a specific value.
 * This function is not used in the main logic but is part of the original code.
 * @param {*} initialValue - The value to initialize array elements with.
 * @param {...number} dimensions - The dimensions of the array (e.g., dim1, dim2, dim3).
 * @returns {Array} The multi-dimensional array.
 */
function initializeMultiDimArray(initialValue) {
    var dimensions = arguments,
        dimCount = dimensions.length,
        arrayCreationString = 'Array(dimensions[' + --dimCount + ']).fill(0).map(x=>{return ' + initialValue + ';})';
    while (--dimCount) {
        arrayCreationString = 'Array(dimensions[' + dimCount + ']).fill(0).map(x=>' + arrayCreationString + ')';
    }
    return eval(arrayCreationString);
}

// Output the result of the main problem-solving function.
console.log(solveProblem());

/**
 * Main function to solve the problem.
 * It calculates the number of subarrays whose sum modulo k is 0.
 * This is done using prefix sums and a frequency map.
 * @returns {number} The total count of such subarrays.
 */
function solveProblem() {
    // Read the number of elements (N) and the modulo value (K).
    var numElements = inputReader.readNumberOrString();
    var moduloValue = inputReader.readNumberOrString();

    // Read the array 'a', and adjust each element by subtracting 1.
    // This is likely for 0-indexed calculations or specific problem constraints.
    var adjustedArray = inputReader.readLineOfNumbersOrStrings().map(val => val - 0x1);

    // Initialize an array to store prefix sums modulo K.
    // prefixSumsModK[i] will store (a[0] + ... + a[i-1]) % k.
    var prefixSumsModK = Array(numElements + 0x1);
    prefixSumsModK[0x0] = 0x0; // The prefix sum before any elements is 0.

    // Calculate prefix sums modulo K.
    for (var idx = 0x0; idx < numElements; idx++) {
        prefixSumsModK[idx + 0x1] = (prefixSumsModK[idx] + adjustedArray[idx]) % moduloValue;
    }

    // Initialize the answer counter.
    var resultCount = 0x0;
    // Initialize a frequency map to store counts of prefix sums modulo K.
    var frequencyMap = {};

    // Iterate through the prefix sums array.
    for (var idx = 0x0; idx <= numElements; idx++) {
        // If we have processed at least 'k' elements (i.e., idx >= k),
        // then the prefix sum `prefixSumsModK[idx-k]` is no longer relevant for subarrays
        // ending at `idx` that have length at least `k`.
        // Decrement its count in the frequency map.
        if (moduloValue <= idx) {
            frequencyMap[prefixSumsModK[idx - moduloValue]]--;
        }

        // If the current prefix sum `prefixSumsModK[idx]` exists in the frequency map,
        // it means there are `frequencyMap[prefixSumsModK[idx]]` previous prefix sums
        // that are equal to `prefixSumsModK[idx]`. Each of these forms a subarray
        // ending at `idx` whose sum modulo K is 0.
        if (frequencyMap[prefixSumsModK[idx]]) {
            resultCount += frequencyMap[prefixSumsModK[idx]]++; // Add count and then increment for current.
        } else {
            // If the current prefix sum is not in the map, initialize its count to 1.
            frequencyMap[prefixSumsModK[idx]] = 0x1;
        }
    }

    // Return the final count.
    return resultCount;
}
