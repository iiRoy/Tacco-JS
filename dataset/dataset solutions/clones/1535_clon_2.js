"use strict";

// Read input from standard input
var rawInputData = require("fs").readFileSync("/dev/stdin", "utf8");

// Split input into tokens and initialize token index
var inputTokens = rawInputData.split(/ |\n/);
var currentTokenIndex = 0;

/**
 * Retrieves the next token as an integer.
 * @returns {number} The next integer token.
 */
function getNextInteger() {
    return +inputTokens[currentTokenIndex++];
}

/**
 * Retrieves the next token as a string.
 * @returns {string} The next string token.
 */
function getNextString() {
    return inputTokens[currentTokenIndex++];
}

/**
 * Retrieves the next token as a BigInt.
 * @returns {BigInt} The next BigInt token.
 */
function getNextBigInteger() {
    return BigInt(inputTokens[currentTokenIndex++]);
}

/**
 * Retrieves an array of tokens.
 * @param {number} count - The number of elements to retrieve.
 * @param {boolean} asStrings - If true, returns strings; otherwise, returns numbers.
 * @returns {Array<string|number>} An array of tokens.
 */
function getNextArray(count, asStrings) {
    if (asStrings) {
        return inputTokens.slice(currentTokenIndex, currentTokenIndex += count);
    } else {
        return inputTokens.slice(currentTokenIndex, currentTokenIndex += count).map(element => +element);
    }
}

/**
 * Retrieves a sorted array of tokens.
 * @param {number} numElements - The number of elements to retrieve.
 * @param {boolean} descendingOrder - If true, sorts in descending order; otherwise, ascending.
 * @returns {Array<number>} A sorted array of numbers.
 */
function getNextSortedArray(numElements, descendingOrder) {
    const elements = inputTokens.slice(currentTokenIndex, currentTokenIndex += numElements).map(value => +value);
    if (descendingOrder) {
        return elements.sort((valA, valB) => valB - valA);
    } else {
        return elements.sort((valA, valB) => valA - valB);
    }
}

/**
 * Retrieves a 2D matrix of tokens.
 * @param {number} matrixHeight - The number of rows.
 * @param {number} matrixWidth - The number of columns per row.
 * @param {boolean} returnAsStrings - If true, matrix elements are strings; otherwise, numbers.
 * @returns {Array<Array<string|number>>} The matrix.
 */
function getNextMatrix(matrixHeight, matrixWidth, returnAsStrings) {
    var resultMatrix = [];
    var rowIndex = 0;
    if (returnAsStrings) {
        for (; rowIndex < matrixHeight; rowIndex++) {
            resultMatrix.push(inputTokens.slice(currentTokenIndex, currentTokenIndex += matrixWidth));
        }
    } else {
        for (; rowIndex < matrixHeight; rowIndex++) {
            resultMatrix.push(inputTokens.slice(currentTokenIndex, currentTokenIndex += matrixWidth).map(element => +element));
        }
    }
    return resultMatrix;
}

/**
 * Creates a multi-dimensional array initialized with a given value.
 * @param {*} initialValue - The value to initialize array elements with.
 * @returns {Array} The created multi-dimensional array.
 */
function createMultiDimArray(initialValue) {
    var args = arguments;
    var argLength = args.length;
    var arrayCreationString = "Array(args[" + --argLength + "]).fill().map(x=>{return " + initialValue + ";})";
    while (--argLength) {
        arrayCreationString = "Array(args[" + argLength + "]).fill().map(x=>" + arrayCreationString + ")";
    }
    return eval(arrayCreationString);
}

// Buffer for collecting output strings
var outputBuffer = [];

/**
 * Appends a string to the output buffer.
 * @param {string} outputString - The string to append.
 */
function appendToOutput(outputString) {
    outputBuffer.push(outputString);
}

// Modulo constant for arithmetic operations
var moduloConstant = 1000000007;

/**
 * Multiplies multiple numbers modulo `moduloConstant`.
 * Uses a specific multiplication optimization for large numbers.
 * @param {...number} factors - Numbers to multiply.
 * @returns {number} The product modulo `moduloConstant`.
 */
function multiplyModulo() {
    var factors = arguments;
    var currentProduct = factors[0];
    for (var factorIndex = factors.length; --factorIndex;) {
        currentProduct = ((currentProduct >> 16) * factors[factorIndex] % moduloConstant * 65536 + (currentProduct & 65535) * factors[factorIndex]) % moduloConstant;
    }
    return currentProduct;
}

// Arrays for precomputed factorials, inverse factorials, modular inverses, and powers of two
var factorials = [];
var inverseFactorials = [];
var modularInverses = []; // Not used in this specific problem, but part of the original template
var powersOfTwo = [];     // Not used in this specific problem, but part of the original template

/**
 * Precomputes factorials and inverse factorials up to a given limit.
 * @param {number} limit - The maximum number for precomputation.
 */
function precomputeFactorials(limit) {
    factorials.length = limit + 1;
    factorials[0] = factorials[1] = 1;
    for (var idx = 2; idx <= limit;) {
        factorials[idx] = multiplyModulo(factorials[idx - 1], idx++);
    }

    inverseFactorials.length = limit + 1;
    inverseFactorials[0] = inverseFactorials[1] = 1;
    inverseFactorials[limit] = modularInverse(factorials[limit]);
    for (idx = limit; 2 < idx;) {
        inverseFactorials[idx - 1] = multiplyModulo(inverseFactorials[idx], idx--);
    }

    // The following lines are commented out in the original, so they remain commented.
    // modularInverses.length = limit + 1;
    // modularInverses[0] = modularInverses[1] = 1;
    // for (idx = 2; idx <= limit;) {
    //     modularInverses[idx] = multiplyModulo(factorials[idx - 1], inverseFactorials[idx++]);
    // }
    // powersOfTwo.length = limit + 1;
    // powersOfTwo[0] = 1;
    // for (idx = 1; idx <= limit; idx++) {
    //     powersOfTwo[idx] = powersOfTwo[idx - 1] * 2 % moduloConstant;
    // }
}

/**
 * Computes the modular multiplicative inverse of a number using the extended Euclidean algorithm.
 * @param {number} num - The number for which to find the inverse.
 * @returns {number} The modular inverse of `num`.
 */
function modularInverse(num) {
    var modVal = moduloConstant;
    var x0 = 0, x1 = 1, temp;
    while (num) {
        temp = modVal / num | 0;
        modVal -= temp * num;
        x0 -= temp * x1;
        temp = modVal;
        modVal = num;
        num = temp;
        temp = x0;
        x0 = x1;
        x1 = temp;
    }
    x0 %= moduloConstant;
    return x0 < 0 ? x0 + moduloConstant : x0;
}

/**
 * Computes (base^exponent) % moduloConstant using binary exponentiation.
 * @param {number} base - The base number.
 * @param {number} exponent - The exponent.
 * @returns {number} The result of (base^exponent) % moduloConstant.
 */
function modularExponentiation(base, exponent) {
    var result = 1;
    while (exponent) {
        if (exponent & 1) {
            result = multiplyModulo(base, result);
        }
        base = multiplyModulo(base, base);
        exponent >>= 1;
    }
    return result;
}

/**
 * Computes nCr (n choose r) modulo `moduloConstant`.
 * Requires `precomputeFactorials` to be called first.
 * @param {number} total - The total number of items (n).
 * @param {number} choose - The number of items to choose (r).
 * @returns {number} nCr modulo `moduloConstant`.
 */
function nChooseK(total, choose) {
    return multiplyModulo(factorials[total], inverseFactorials[choose], inverseFactorials[total - choose]);
}

/**
 * Computes nPr (n permute r) modulo `moduloConstant`.
 * Requires `precomputeFactorials` to be called first.
 * @param {number} totalItems - The total number of items (n).
 * @param {number} permuteItems - The number of items to permute (r).
 * @returns {number} nPr modulo `moduloConstant`.
 */
function nPermuteK(totalItems, permuteItems) {
    return multiplyModulo(factorials[totalItems], inverseFactorials[totalItems - permuteItems]);
}

/**
 * Normalizes a number to be within [0, moduloConstant-1].
 * @param {number} value - The number to normalize.
 * @returns {number} The normalized number.
 */
function normalizeModulo(value) {
    return (value % moduloConstant + moduloConstant) % moduloConstant;
}


// Execute the main logic of the program
var finalResult = main();

// Output the main result if it's not undefined
if (finalResult !== undefined) {
    console.log(String(finalResult));
}

// Output any buffered streams
if (outputBuffer.length) {
    console.log(outputBuffer.join("\n"));
}

/**
 * Main function containing the problem's solution logic.
 * Calculates the number of ways to reach a target sum 's' by adding numbers from 3 upwards.
 * This is a dynamic programming problem.
 * @returns {number} The final count modulo `moduloConstant`.
 */
function main() {
    // Read the target sum 's'
    var targetSum = getNextInteger();

    // Initialize a DP table of size (targetSum + 1) with zeros
    // dp[k] will store the number of ways to reach sum k
    var dynamicProgrammingTable = createMultiDimArray(0, targetSum + 1);

    // Base case: there is one way to reach sum 0 (by not adding any numbers)
    dynamicProgrammingTable[0] = 1;

    // Iterate through all possible current sums from 0 up to targetSum - 1
    for (var currentSum = 0; currentSum < targetSum; currentSum++) {
        // Iterate through all possible step sizes (numbers to add) from 3 up to targetSum
        for (var stepSize = 3; stepSize <= targetSum; stepSize++) {
            // If adding the current stepSize exceeds the targetSum, break early
            if (currentSum + stepSize > targetSum) {
                break;
            }
            // Update the DP table: add the number of ways to reach currentSum
            // to the number of ways to reach (currentSum + stepSize)
            dynamicProgrammingTable[currentSum + stepSize] += dynamicProgrammingTable[currentSum];
            // Apply modulo to keep the number within bounds
            dynamicProgrammingTable[currentSum + stepSize] %= moduloConstant;
        }
    }

    // The result is the number of ways to reach the targetSum
    return dynamicProgrammingTable[targetSum];
}
