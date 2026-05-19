"use strict";

// Load the file system module and read the entire standard input as a UTF-8 string.
var rawData = require("fs").readFileSync("/dev/stdin", "utf8");

// Split the raw input string into an array of tokens using spaces or newlines as delimiters.
// Initialize a pointer to keep track of the current token being processed.
var tokenStream = rawData.split(/ |\n/),
    tokenIndex = 0;

/**
 * Retrieves the next token from the global input stream.
 * @param {boolean} isString - If true, returns the token as a string; otherwise, attempts to convert it to a number.
 * @returns {string|number} The next token from the stream.
 */
function readNext(isString) {
    return isString ? tokenStream[tokenIndex++] : +tokenStream[tokenIndex++];
}

/**
 * Reads a specified quantity of tokens from the input stream.
 * @param {number} count - The number of tokens to retrieve.
 * @param {boolean} asStrings - If true, tokens are returned as strings; otherwise, they are converted to numbers.
 * @returns {Array<string|number>} An array containing the requested tokens.
 */
function readMany(count, asStrings) {
    return asStrings ? tokenStream.slice(tokenIndex, tokenIndex += count) : tokenStream.slice(tokenIndex, tokenIndex += count).map(val => +val);
}

/**
 * Reads a 2D matrix of tokens from the input stream.
 * @param {number} rows - The number of rows in the matrix.
 * @param {number} cols - The number of columns in each row.
 * @param {boolean} asStrings - If true, matrix elements are strings; otherwise, they are numbers.
 * @returns {Array<Array<string|number>>} A 2D array representing the matrix.
 */
function readMatrix(rows, cols, asStrings) {
    var matrixData = [],
        currentRow = 0;
    if (asStrings) {
        for (; currentRow < rows; currentRow++) {
            matrixData.push(tokenStream.slice(tokenIndex, tokenIndex += cols));
        }
    } else {
        for (; currentRow < rows; currentRow++) {
            matrixData.push(tokenStream.slice(tokenIndex, tokenIndex += cols).map(val => +val));
        }
    }
    return matrixData;
}

/**
 * Dynamically creates a multi-dimensional array initialized with a specific value.
 * The dimensions are passed as subsequent arguments.
 * @param {*} initialValue - The value to fill the array elements with.
 * @param {...number} dimensions - The sizes of each dimension, from outermost to innermost.
 * @returns {Array} The newly created multi-dimensional array.
 */
function createMultiDimArray(initialValue) {
    var dimensions = arguments,
        dimCount = dimensions.length,
        arrayCreationCode = "Array(dimensions[" + --dimCount + "]).fill().map(x=>{return " + initialValue + ";})";
    while (--dimCount) {
        arrayCreationCode = "Array(dimensions[" + dimCount + "]).fill().map(x=>" + arrayCreationCode + ")";
    }
    return eval(arrayCreationCode);
}

// A large prime number used as a modulus for arithmetic operations to prevent overflow.
var primeModulus = 1000000007; // Equivalent to 1e9 + 7

/**
 * Performs modular multiplication of an arbitrary number of factors.
 * All intermediate and final products are kept within the range [0, primeModulus - 1].
 * @param {...number} factors - The numbers to be multiplied.
 * @returns {number} The modular product of all factors.
 */
function multiplyMod() {
    for (var factors = arguments, product = factors[0], idx = factors.length; --idx;) {
        // This specific multiplication method is used to handle large numbers efficiently
        // by splitting them into 16-bit parts before applying modulo.
        product = (((product >> 16) * factors[idx]) % primeModulus * 65536 + (product & 65535) * factors[idx]) % primeModulus;
    }
    return product;
}

/**
 * Calculates (base ^ exponent) % primeModulus using the method of modular exponentiation (binary exponentiation).
 * This is efficient for large exponents.
 * @param {number} base - The base number.
 * @param {number} exponent - The exponent.
 * @returns {number} The result of (base ^ exponent) modulo primeModulus.
 */
function powerMod(base, exponent) {
    for (var result = 1; exponent; base = multiplyMod(base, base), exponent >>= 1) {
        if (exponent & 1) { // If the current bit of the exponent is 1
            result = multiplyMod(base, result);
        }
    }
    return result;
}

// Call the main program logic and store its return value.
var finalResult = executeProgram();

// If the program returns a defined value, print it to the console.
if (finalResult !== undefined) {
    console.log(finalResult);
}

/**
 * The core function that implements the problem's algorithm.
 * It calculates a specific sum based on modular arithmetic.
 * @returns {number} The final calculated sum modulo primeModulus.
 */
function executeProgram() {
    // Read two integer inputs: 'numVal' and 'limitVal'.
    var numVal = readNext();
    var limitVal = readNext();

    // Create an array 'countArray' of size (limitVal + 1) and initialize all elements to 0.
    var countArray = createMultiDimArray(0, limitVal + 1);

    // Initialize 'totalSum' with 'limitVal'.
    var totalSum = limitVal;

    // Set the last element of 'countArray' to 1.
    countArray[limitVal] = 1;

    // Loop downwards from 'limitVal - 1' to 1.
    for (var outerLoopVar = limitVal - 1; outerLoopVar > 0; outerLoopVar--) {
        // Calculate the initial value for countArray[outerLoopVar] using modular exponentiation.
        // Math.floor(limitVal / outerLoopVar) performs integer division.
        countArray[outerLoopVar] = powerMod(Math.floor(limitVal / outerLoopVar), numVal);

        // Subtract contributions from multiples of 'outerLoopVar' that are already calculated.
        // This is a form of inclusion-exclusion.
        for (var innerLoopVar = outerLoopVar + outerLoopVar; innerLoopVar <= limitVal; innerLoopVar += outerLoopVar) {
            countArray[outerLoopVar] -= countArray[innerLoopVar];
        }

        // Apply modulo to countArray[outerLoopVar] and ensure it remains non-negative.
        countArray[outerLoopVar] %= primeModulus;
        if (countArray[outerLoopVar] < 0) {
            countArray[outerLoopVar] += primeModulus;
        }

        // Add the product of countArray[outerLoopVar] and outerLoopVar to 'totalSum',
        // ensuring the addition is also modular.
        totalSum += multiplyMod(countArray[outerLoopVar], outerLoopVar);
    }

    // Return the final 'totalSum' modulo 'primeModulus'.
    return totalSum % primeModulus;
}
