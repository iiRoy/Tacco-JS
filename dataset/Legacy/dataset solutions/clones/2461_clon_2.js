"use strict";

// This module provides a utility for parsing input data from a string source.
var DATA_PARSER = (function () {
    /**
     * Factory function to create an input parser instance.
     * @param {string} inputString - The raw string content to be parsed, typically from a file.
     * @returns {InputReader} A new instance of the InputReader.
     */
    function createParser(inputString) {
        return new InputReader(inputString);
    }

    /**
     * InputReader class for sequential reading of lines and values.
     * @class
     * @param {string} rawInputString - The complete string containing all input lines.
     */
    function InputReader(rawInputString) {
        // Stores the input string split into an array of lines, after trimming overall whitespace.
        this._sourceLines = rawInputString.trim().split("\n");
        // Keeps track of the current line being processed.
        this._currentLineIndex = 0;
    }

    /**
     * Reads a single value from the current line. If the line contains multiple space-separated values,
     * it reads them from right to left (as per the original implementation's `reverse()` and `pop()`).
     * Advances to the next line if the current one becomes empty after reading.
     * @param {boolean} [returnAsString=false] - If true, returns the value as a string; otherwise, attempts to convert to a number.
     * @returns {string|number} The parsed value.
     */
    InputReader.prototype.readNumber = function (returnAsString) {
        var linesArray = this._sourceLines;
        var lineIdx = this._currentLineIndex;
        var extractedValue;

        // If the current line is still a single string, split it by spaces and reverse for `pop()` behavior.
        if (typeof linesArray[lineIdx] === "string") {
            linesArray[lineIdx] = linesArray[lineIdx].split(" ").reverse();
        }

        // Extract the last element (which was originally the first) from the current line's array.
        extractedValue = linesArray[lineIdx].pop();

        // If the current line's array is now empty, increment the line index to move to the next line.
        if (!linesArray[lineIdx].length) {
            this._currentLineIndex++;
        }

        // Return the value, either as a string or converted to a number.
        return returnAsString ? extractedValue : +extractedValue;
    };

    /**
     * Reads all space-separated values from the current line into an array.
     * The line index is incremented after reading.
     * @param {boolean} [asStrings=false] - If true, returns values as strings; otherwise, converts them to numbers.
     * @returns {Array<string|number>} An array of values from the line.
     */
    InputReader.prototype.readNumbersInLine = function (asStrings) {
        // Split the current line by spaces and then increment the line index.
        var lineParts = this._sourceLines[this._currentLineIndex++].split(" ");
        // Map values to numbers if `asStrings` is false, otherwise return as strings.
        return asStrings ? lineParts : lineParts.map(elementStr => +elementStr);
    };

    /**
     * Reads a specified number of consecutive lines, parsing each into an array of values,
     * effectively forming a 2D array (matrix).
     * @param {number} numRows - The count of rows (lines) to read.
     * @param {boolean} [asStringsMatrix=false] - If true, all values in the matrix are strings; otherwise, numbers.
     * @returns {Array<Array<string|number>>} A 2D array representing the matrix.
     */
    InputReader.prototype.readMatrix = function (numRows, asStringsMatrix) {
        // Slice the source lines to get the desired number of rows, then increment the line index.
        var resultMatrix = this._sourceLines.slice(this._currentLineIndex, this._currentLineIndex += numRows).map(lineStr => lineStr.split(" "));
        // If not returning as strings, map each row and then each element in the row to a number.
        return asStringsMatrix ? resultMatrix : resultMatrix.map(row => row.map(elementStr => +elementStr));
    };

    /**
     * Reads a specified number of consecutive lines into an array.
     * @param {number} count - The number of lines to read.
     * @param {boolean} [asStringsArray=false] - If true, returns lines as strings; otherwise, attempts to convert each line to a number.
     * @returns {Array<string|number>} An array of lines.
     */
    InputReader.prototype.readLines = function (count, asStringsArray) {
        // Slice the source lines to get the desired number of lines, then increment the line index.
        var resultLines = this._sourceLines.slice(this._currentLineIndex, this._currentLineIndex += count);
        // If not returning as strings, map each line to a number.
        return asStringsArray ? resultLines : resultLines.map(lineStr => +lineStr);
    };

    return createParser;
})();

// Initialize the input data parser by reading content from standard input.
var inputData = DATA_PARSER(require("fs").readFileSync("/dev/stdin", "utf8"));

/**
 * Dynamically creates a multi-dimensional array initialized with a specific value.
 * The dimensions are passed as subsequent arguments.
 * @param {*} initialValue - The value to fill the array elements with.
 * @param {...number} dimensions - The sizes of each dimension (e.g., `initializeMultiDimArray(0, 2, 3)` for a 2x3 array).
 * @returns {Array} The newly created and initialized multi-dimensional array.
 */
function initializeMultiDimArray(initialValue) {
    var args = arguments;
    var length = args.length;
    // Construct the string for the innermost array creation.
    var arrayCreationString = "Array(args[" + --length + "]).fill(0).map(x=>{return " + initialValue + ";})";
    // Wrap the string with outer array creation calls for each remaining dimension.
    while (--length) {
        arrayCreationString = "Array(args[" + length + "]).fill(0).map(x=>" + arrayCreationString + ")";
    }
    // Evaluate the constructed string to create the actual array structure.
    return eval(arrayCreationString);
}

// Define the prime modulus used for all modular arithmetic operations.
var primeModulo = 998244353;

/**
 * Performs modular multiplication of two numbers.
 * This specific implementation uses bit shifting to handle potential intermediate overflows
 * before applying the modulo, which is useful for very large numbers.
 * @param {number} valA - The first operand.
 * @param {number} valB - The second operand.
 * @returns {number} The result of (valA * valB) % primeModulo.
 */
function multiplyModulo(valA, valB) {
    return ((valA >> 16) * valB % primeModulo * 65536 + (valA & 65535) * valB) % primeModulo;
}

/**
 * Calculates the modular multiplicative inverse of a number `num` modulo `primeModulo`.
 * Uses the Extended Euclidean Algorithm.
 * @param {number} num - The number for which to find the inverse.
 * @returns {number} The modular inverse of `num`.
 */
function modularInverse(num) {
    var modulus = primeModulo, coeffU = 1, coeffV = 0, tempVar;
    // Extended Euclidean Algorithm loop.
    while (modulus) {
        tempVar = num / modulus | 0; // Integer division.
        num -= tempVar * modulus;
        coeffU -= tempVar * coeffV;
        // Swap (num, modulus) and (coeffU, coeffV).
        tempVar = num;
        num = modulus;
        modulus = tempVar;
        tempVar = coeffU;
        coeffU = coeffV;
        coeffV = tempVar;
    }
    // Ensure the result is positive.
    coeffU %= primeModulo;
    return coeffU < 0 ? coeffU + primeModulo : coeffU;
}

/**
 * Computes (baseVal^exponentVal) % primeModulo using modular exponentiation (binary exponentiation).
 * This method efficiently calculates large powers by repeatedly squaring the base and
 * multiplying by the result accumulator based on the exponent's binary representation.
 * @param {number} baseVal - The base number.
 * @param {number} exponentVal - The exponent.
 * @returns {number} The result of the modular exponentiation.
 */
function modularExponentiation(baseVal, exponentVal) {
    var resultAccumulator = 1;
    while (exponentVal) {
        // If the current bit of the exponent is 1 (exponentVal is odd).
        if (exponentVal & 1) {
            resultAccumulator = multiplyModulo(baseVal, resultAccumulator);
        }
        baseVal = multiplyModulo(baseVal, baseVal); // Square the base.
        exponentVal >>= 1; // Right shift exponentVal by 1 (equivalent to dividing by 2).
    }
    return resultAccumulator;
}

// Print the final result obtained from the main calculation function.
console.log(calculateResult());

/**
 * The primary function that encapsulates the problem's logic.
 * It reads an integer N, performs a specific calculation involving modular arithmetic,
 * and returns the final result.
 * @returns {number} The computed answer.
 */
function calculateResult() {
    // Read the single integer input N.
    var inputN = inputData.readNumber();
    // Initialize the answer with 3^N modulo primeModulo.
    var finalAnswer = modularExponentiation(3, inputN);
    // Initialize a variable that will accumulate a factorial-like term.
    var factorialTerm = 1;

    // Loop from loopCounter = 0 up to (inputN / 2) - 1.
    // halfN stores the integer division of inputN by 2.
    // powerOfTwo tracks powers of 2 (2^0, 2^1, 2^2, ...).
    for (var loopCounter = 0, halfN = inputN >> 1, powerOfTwo = 1; loopCounter < halfN; loopCounter++) {
        // Update powerOfTwo: powerOfTwo = (powerOfTwo * 2) % primeModulo.
        powerOfTwo = powerOfTwo * 2 % primeModulo;
        // Subtract the product of factorialTerm and powerOfTwo from the final answer.
        finalAnswer -= multiplyModulo(factorialTerm, powerOfTwo);
        // Update factorialTerm using modular multiplication and inverse:
        // factorialTerm = (factorialTerm * (inputN - loopCounter) * modularInverse(loopCounter + 1)) % primeModulo.
        // This effectively calculates factorialTerm * (N-i) / (i+1) mod P.
        factorialTerm = multiplyModulo(multiplyModulo(factorialTerm, inputN - loopCounter), modularInverse(loopCounter + 1));
    }

    // Ensure the final answer is within the [0, primeModulo-1] range.
    finalAnswer %= primeModulo;
    return finalAnswer < 0 ? finalAnswer + primeModulo : finalAnswer;
}
