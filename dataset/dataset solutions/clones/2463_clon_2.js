"use strict";

// This IIFE initializes a factory for input parsing objects.
var DATA_GRABBER = (function() {
    /**
     * Creates a new input reader instance.
     * @param {string} inputString The raw string content to parse.
     * @returns {ReaderInstance} A new reader object.
     */
    function createReader(inputString) {
        return new ReaderInstance(inputString);
    }

    /**
     * Represents an input stream processor.
     * @param {string} rawString The raw multi-line string content.
     * @constructor
     */
    function ReaderInstance(rawString) {
        // Store lines, trimming and splitting by newline.
        this._sourceLines = rawString.trim().split("\n");
        // Initialize current line index.
        this._currentLineIndex = 0;
    }

    /**
     * Extracts the next value from the current line, popping from the end.
     * If the line is exhausted, moves to the next.
     * @param {boolean} returnAsString If true, returns as string; otherwise, attempts conversion to number.
     * @returns {string|number} The extracted value.
     */
    ReaderInstance.prototype.extractNextValue = function(returnAsString) {
        var lineSegments = this._sourceLines;
        var currentIdx   = this._currentLineIndex;
        var extractedItem;

        // Check if the current line is a string and needs splitting.
        if (typeof lineSegments[currentIdx] === "string") {
            lineSegments[currentIdx] = lineSegments[currentIdx].split(" ").reverse();
        }

        // Pop the last element.
        extractedItem = lineSegments[currentIdx].pop();

        // If the current line is empty after popping, advance to the next line.
        if (!lineSegments[currentIdx].length) {
            this._currentLineIndex++;
        }

        // Return based on the flag.
        return returnAsString ? extractedItem : +extractedItem;
    };

    /**
     * Reads all values from the current line, then advances to the next line.
     * @param {boolean} asStrings If true, returns array of strings; otherwise, array of numbers.
     * @returns {Array<string|number>} An array of values from the line.
     */
    ReaderInstance.prototype.readLineValues = function(asStrings) {
        var lineParts = this._sourceLines[this._currentLineIndex++].split(" ");
        return asStrings ? lineParts : lineParts.map(numericString => +numericString);
    };

    /**
     * Reads a block of 'numRows' lines as a matrix.
     * @param {number} numRows The number of rows to read.
     * @param {boolean} asText If true, returns matrix of strings; otherwise, matrix of numbers.
     * @returns {Array<Array<string|number>>} The matrix data.
     */
    ReaderInstance.prototype.readMatrix = function(numRows, asText) {
        // Slice the required rows and advance the pointer.
        var matrixData = this._sourceLines.slice(this._currentLineIndex, this._currentLineIndex += numRows).map(rowString => rowString.split(" "));
        return asText ? matrixData : matrixData.map(rowArray => rowArray.map(elementString => +elementString));
    };

    /**
     * Reads a block of 'count' lines as an array of strings or numbers.
     * @param {number} count The number of lines to read.
     * @param {boolean} asRawText If true, returns array of strings; otherwise, array of numbers.
     * @returns {Array<string|number>} An array of lines.
     */
    ReaderInstance.prototype.readRows = function(count, asRawText) {
        var rowBlock = this._sourceLines.slice(this._currentLineIndex, this._currentLineIndex += count);
        return asRawText ? rowBlock : rowBlock.map(rowText => +rowText);
    };

    return createReader;
})();

// Create an input reader instance by reading from standard input.
var inputReader = DATA_GRABBER(require("fs").readFileSync("/dev/stdin", "utf8"));

/**
 * Creates a multi-dimensional array initialized with a given value.
 * @param {*} initialValue The value to initialize array elements with.
 * @returns {Array} A multi-dimensional array.
 */
function createMultiDimArray(initialValue) {
    var args = arguments;
    var argsLength = args.length;
    // Build the array creation string dynamically.
    var arrayCreationString = "Array(args[" + --argsLength + "]).fill(0).map(_=>{return " + initialValue + ";})";
    while (--argsLength) {
        arrayCreationString = "Array(args[" + argsLength + "]).fill(0).map(_=>" + arrayCreationString + ")";
    }
    return eval(arrayCreationString); // Evaluate the constructed string to create the array.
}

// Define a large prime modulus for calculations.
var PRIME_MODULUS = 998244353;

/**
 * Performs modular multiplication: (operandA * operandB) % PRIME_MODULUS.
 * Optimized for larger numbers by splitting into high and low bits to avoid overflow.
 * @param {number} operandA First operand.
 * @param {number} operandB Second operand.
 * @returns {number} The result of modular multiplication.
 */
function modularMultiply(operandA, operandB) {
    // This optimization uses the property (X * Y) % M = (((X >> 16) * Y % M * 2^16) + ((X & 0xFFFF) * Y)) % M
    return (((operandA >>> 16) * operandB % PRIME_MODULUS * 65536) + ((operandA & 65535) * operandB)) % PRIME_MODULUS;
}

/**
 * Calculates modular exponentiation: (baseVal ^ exponentVal) % PRIME_MODULUS.
 * Uses binary exponentiation (exponentiation by squaring).
 * @param {number} baseVal The base.
 * @param {number} exponentVal The exponent.
 * @returns {number} The result of modular exponentiation.
 */
function modularPower(baseVal, exponentVal) {
    var resultVal = 1; // Initialize result to 1.
    // Loop while exponent is greater than zero.
    for (; exponentVal > 0; baseVal = modularMultiply(baseVal, baseVal), exponentVal >>>= 1) {
        // If the current bit of the exponent is 1, multiply result by base.
        if (exponentVal & 1) {
            resultVal = modularMultiply(baseVal, resultVal);
        }
    }
    return resultVal;
}

// Output the result of the main calculation function.
console.log(executeCalculation());

/**
 * The main function to perform the problem's calculation.
 * It calculates a specific series sum modulo PRIME_MODULUS.
 * @returns {number} The final calculated answer modulo PRIME_MODULUS.
 */
function executeCalculation() {
    var inputNumber = inputReader.extractNextValue(); // Read the main input number.
    var finalResult = modularPower(3, inputNumber); // Calculate 3^n mod M.
    var seriesTerm  = 2; // Initialize the first term in the series.
    var halfInput   = inputNumber / 2; // Calculate n/2.

    var modularInverses = [];
    modularInverses.length = halfInput + 2; // Pre-allocate array for modular inverses.
    modularInverses[0]     = modularInverses[1] = 1; // Base cases for inverses: inv[0] and inv[1] are 1 (or often inv[1] is 1).

    // Loop to calculate and subtract terms, and precompute modular inverses.
    for (var loopCounter = 0; loopCounter < halfInput;) {
        finalResult -= seriesTerm; // Subtract the current series term from the result.
        // Calculate the next series term using the previous one and modular inverses.
        // seriesTerm_next = seriesTerm_current * (n - i) * 2 * inv[i+1]
        seriesTerm = modularMultiply(modularMultiply(seriesTerm, (inputNumber - loopCounter) * 2), modularInverses[++loopCounter]);
        // Compute modular inverse for (loopCounter + 1) using precomputed inverses.
        // inv[k] = M - (M/k) * inv[M % k] % M (using Fermat's Little Theorem or extended Euclidean algorithm implicitly)
        modularInverses[loopCounter + 1] = PRIME_MODULUS - modularMultiply(modularInverses[PRIME_MODULUS % (loopCounter + 1) | 0], (PRIME_MODULUS / (loopCounter + 1) | 0));
    }

    finalResult %= PRIME_MODULUS; // Ensure the final result is within the modulus.
    // Handle negative results by adding the modulus.
    return finalResult < 0 ? finalResult + PRIME_MODULUS : finalResult;
}