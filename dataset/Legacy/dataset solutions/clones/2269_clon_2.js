"use strict";
// This module provides a utility for parsing input text.
var INPUT_PARSER = (function() {
    /**
     * Creates a new input parser instance.
     * @param {string} sourceText - The raw input string.
     * @returns {TextParser} A new TextParser object.
     */
    function createParser(sourceText) {
        return new TextParser(sourceText);
    }

    /**
     * Represents a parser for structured text input.
     * @class
     * @param {string} sourceText - The raw input string, typically from stdin.
     */
    function TextParser(sourceText) {
        // Store lines of input, trimmed and split by newline.
        this._lines = sourceText.trim().split("\n");
        // Current line index for sequential reading.
        this._currentLineIndex = 0;
    }

    /**
     * Reads the next token from the current line. If the current line is exhausted,
     * it moves to the next line. Tokens are space-separated.
     * @param {boolean} [parseAsNumber=false] - If true, returns the token as a string; otherwise, as a number.
     * @returns {string|number} The parsed token.
     */
    TextParser.prototype.a = function(parseAsNumber) {
        var currentLines = this._lines;
        var lineIdx = this._currentLineIndex;
        var tokenValue;

        // If the current line hasn't been split into tokens yet, do so.
        // Tokens are reversed so `pop()` gets them in original order.
        if (typeof currentLines[lineIdx] === "string") {
            currentLines[lineIdx] = currentLines[lineIdx].split(" ").reverse();
        }

        // Get the next token from the end of the reversed array.
        tokenValue = currentLines[lineIdx].pop();

        // If the current line is now empty, advance to the next line.
        if (!currentLines[lineIdx].length) {
            this._currentLineIndex++;
        }

        // Return as string or number based on the flag.
        return parseAsNumber ? tokenValue : +tokenValue;
    };

    /**
     * Reads an entire line and splits it into tokens.
     * @param {boolean} [returnStrings=false] - If true, returns tokens as strings; otherwise, as numbers.
     * @returns {Array<string|number>} An array of tokens from the line.
     */
    TextParser.prototype.l = function(returnStrings) {
        // Get the current line, increment index, and split by space.
        var lineTokens = this._lines[this._currentLineIndex++].split(" ");
        // Return as strings or map to numbers.
        return returnStrings ? lineTokens : lineTokens.map(item => +item);
    };

    /**
     * Reads a block of 'numRows' lines, treating each line as a row of space-separated tokens.
     * @param {number} numRows - The number of rows (lines) to read.
     * @param {boolean} [returnStrings=false] - If true, returns tokens as strings; otherwise, as numbers.
     * @returns {Array<Array<string|number>>} A 2D array (matrix) of tokens.
     */
    TextParser.prototype.m = function(numRows, returnStrings) {
        // Slice the relevant lines, increment index, and map each line to an array of tokens.
        var resultMatrix = this._lines.slice(this._currentLineIndex, this._currentLineIndex += numRows).map(rowString => rowString.split(" "));
        // If not returning strings, map all inner tokens to numbers.
        return returnStrings ? resultMatrix : resultMatrix.map(row => row.map(item => +item));
    };

    /**
     * Reads a block of 'numLines' lines as individual strings or numbers.
     * @param {number} numLines - The number of lines to read.
     * @param {boolean} [returnStrings=false] - If true, returns lines as strings; otherwise, as numbers.
     * @returns {Array<string|number>} An array of lines.
     */
    TextParser.prototype.r = function(numLines, returnStrings) {
        // Slice the relevant lines and increment index.
        var lineContents = this._lines.slice(this._currentLineIndex, this._currentLineIndex += numLines);
        // Return as strings or map to numbers.
        return returnStrings ? lineContents : lineContents.map(lineContent => +lineContent);
    };

    return createParser;
})();

// Initialize the input reader by reading from standard input.
var inputReader = INPUT_PARSER(require("fs").readFileSync("/dev/stdin", "utf8"));

/**
 * Creates a multi-dimensional array initialized with a given value.
 * @param {*} initialValue - The value to initialize array elements with.
 * @param {...number} dimensions - The dimensions of the array (e.g., initializeMultiDimArray(0, 2, 3) creates a 2x3 array of zeros).
 * @returns {Array} The initialized multi-dimensional array.
 */
function initializeMultiDimArray(initialValue) {
    var dimensions = arguments;
    var dimCount = dimensions.length;
    var arrayCreationString = "Array(dimensions[" + --dimCount + "]).fill(0).map(x=>{return " + initialValue + ";})";
    while (--dimCount) {
        arrayCreationString = "Array(dimensions[" + dimCount + "]).fill(0).map(x=>" + arrayCreationString + ")";
    }
    return eval(arrayCreationString);
}

// Define a prime modulus for modular arithmetic operations.
var primeModulus = 1e9 + 7;

/**
 * Performs modular multiplication of multiple numbers.
 * @param {...number} factors - Numbers to multiply.
 * @returns {number} The product modulo `primeModulus`.
 */
function multiplyMod() {
    var factors = arguments;
    var productAccumulator = factors[0];
    // Iterate from the second factor onwards.
    for (var factorIndex = factors.length; --factorIndex;) {
        // Optimized modular multiplication to prevent overflow before modulo.
        // (A * B) % M = ((A >> 16) * B % M * 65536 + (A & 65535) * B) % M
        productAccumulator = ((productAccumulator >> 16) * factors[factorIndex] % primeModulus * 65536 + (productAccumulator & 65535) * factors[factorIndex]) % primeModulus;
    }
    return productAccumulator;
}

// Arrays to store precomputed factorials, inverse factorials, modular inverses, and powers of two.
var factorials = [];
var inverseFactorials = [];
var modularInverses = [];
var powersOfTwo = [];

/**
 * Precomputes factorials, inverse factorials, modular inverses, and powers of two up to a given limit.
 * This is useful for combinatorics problems.
 * @param {number} limit - The upper bound for precomputation.
 */
function precomputeCombinatorics(limit) {
    // Precompute factorials: factorials[i] = i!
    factorials.length = limit + 1;
    factorials[0] = factorials[1] = 1;
    for (var loopCounter = 2; loopCounter <= limit;) {
        factorials[loopCounter] = multiplyMod(factorials[loopCounter - 1], loopCounter++);
    }

    // Precompute inverse factorials: inverseFactorials[i] = (i!)^(-1) mod primeModulus
    inverseFactorials.length = limit + 1;
    inverseFactorials[0] = inverseFactorials[1] = 1;
    // Calculate the last inverse factorial using modular exponentiation (or Fermat's Little Theorem).
    inverseFactorials[limit] = modularInverse(factorials[limit]);
    // Calculate others iteratively from back to front: inverseFactorials[i-1] = inverseFactorials[i] * i
    for (loopCounter = limit; 2 < loopCounter;) {
        inverseFactorials[loopCounter - 1] = multiplyMod(inverseFactorials[loopCounter], loopCounter--);
    }

    // Precompute modular inverses: modularInverses[i] = i^(-1) mod primeModulus
    // modularInverses[i] = factorials[i-1] * inverseFactorials[i]
    modularInverses.length = limit + 1;
    modularInverses[0] = modularInverses[1] = 1; // modularInverses[0] is typically not used, modularInverses[1] is 1.
    for (loopCounter = 2; loopCounter <= limit;) {
        modularInverses[loopCounter] = multiplyMod(factorials[loopCounter - 1], inverseFactorials[loopCounter++]);
    }

    // Precompute powers of two: powersOfTwo[i] = 2^i mod primeModulus
    powersOfTwo.length = limit + 1;
    powersOfTwo[0] = 1;
    for (loopCounter = 1; loopCounter <= limit; loopCounter++) {
        powersOfTwo[loopCounter] = powersOfTwo[loopCounter - 1] * 2 % primeModulus;
    }
}

/**
 * Calculates the modular multiplicative inverse of 'valueToInverse' modulo `primeModulus` using the extended Euclidean algorithm.
 * Assumes `primeModulus` is prime.
 * @param {number} valueToInverse - The number for which to find the inverse.
 * @returns {number} The modular inverse.
 */
function modularInverse(valueToInverse) {
    var currentMod = primeModulus;
    var xCoefficient = 0; // u
    var yCoefficient = 1; // v
    var tempVar; // t

    // Extended Euclidean Algorithm
    while (valueToInverse) {
        tempVar = currentMod / valueToInverse | 0; // Integer division
        currentMod -= tempVar * valueToInverse;
        xCoefficient -= tempVar * yCoefficient;

        // Swap (currentMod, valueToInverse) and (xCoefficient, yCoefficient)
        tempVar = currentMod;
        currentMod = valueToInverse;
        valueToInverse = tempVar;

        tempVar = xCoefficient;
        xCoefficient = yCoefficient;
        yCoefficient = tempVar;
    }

    // Ensure the result is positive.
    xCoefficient %= primeModulus;
    return xCoefficient < 0 ? xCoefficient + primeModulus : xCoefficient;
}

/**
 * Calculates (baseValue^exponentValue) mod `primeModulus` using binary exponentiation (exponentiation by squaring).
 * @param {number} baseValue - The base.
 * @param {number} exponentValue - The exponent.
 * @returns {number} (baseValue^exponentValue) mod `primeModulus`.
 */
function modularExponentiation(baseValue, exponentValue) {
    var resultPower = 1;
    while (exponentValue) {
        if (exponentValue & 1) { // If exponentValue is odd
            resultPower = multiplyMod(baseValue, resultPower);
        }
        baseValue = multiplyMod(baseValue, baseValue); // Square the base
        exponentValue >>= 1; // Divide exponentValue by 2
    }
    return resultPower;
}

/**
 * Calculates "n choose r" (combinations) modulo `primeModulus`.
 * Requires `precomputeCombinatorics` to be called first.
 * @param {number} n - Total number of items.
 * @param {number} r - Number of items to choose.
 * @returns {number} C(n, r) mod `primeModulus`.
 */
function combinations(n, r) {
    // C(n, r) = n! / (r! * (n-r)!) = n! * (r!)^(-1) * ((n-r)!)^(-1)
    return multiplyMod(factorials[n], inverseFactorials[r], inverseFactorials[n - r]);
}

/**
 * Calculates "n permute r" (permutations) modulo `primeModulus`.
 * Requires `precomputeCombinatorics` to be called first.
 * @param {number} n - Total number of items.
 * @param {number} r - Number of items to arrange.
 * @returns {number} P(n, r) mod `primeModulus`.
 */
function permutations(n, r) {
    // P(n, r) = n! / (n-r)! = n! * ((n-r)!)^(-1)
    return multiplyMod(factorials[n], inverseFactorials[n - r]);
}

// Output the result of the main problem-solving function.
console.log(solveProblem());

/**
 * Main function to solve the problem.
 * Reads input, performs calculations, and returns the final answer.
 * @returns {number} The calculated answer modulo `primeModulus`.
 */
function solveProblem() {
    // Read the size of the array.
    var arraySize = inputReader.a();
    // Read the array elements.
    var inputArray = inputReader.l();

    // Precompute factorials, inverse factorials, etc., up to arraySize + 1.
    precomputeCombinatorics(arraySize + 1);

    var finalAnswer = 0;
    // Initialize 'currentCoefficient' with (n-1)!
    var currentCoefficient = factorials[arraySize - 1];

    // Loop from the second element to the last.
    for (var loopIndex = 1; loopIndex < arraySize; loopIndex++) {
        // Add (inputArray[loopIndex] - inputArray[loopIndex-1]) * currentCoefficient to the answer.
        finalAnswer += multiplyMod(inputArray[loopIndex] - inputArray[loopIndex - 1], currentCoefficient);
        // Update 'currentCoefficient' for the next iteration: currentCoefficient = (currentCoefficient + (n-1)! * (loopIndex+1)^(-1)) % primeModulus
        currentCoefficient = (currentCoefficient + multiplyMod(factorials[arraySize - 1], modularInverses[loopIndex + 1])) % primeModulus;
    }

    // Ensure the final answer is positive and within the modulus.
    return finalAnswer % primeModulus;
}
