"use strict";

// Input handling utilities
let inputData = require("fs").readFileSync("/dev/stdin", "utf8");
let tokenStream = inputData.split(/ |\n/), tokenIndex = 0;

/**
 * Fetches the next numerical value from the input stream.
 * @returns {number} The parsed number.
 */
function getNextNum() {
    return +tokenStream[tokenIndex++];
}

/**
 * Fetches the next string value from the input stream.
 * @returns {string} The string token.
 */
function getNextStr() {
    return tokenStream[tokenIndex++];
}

/**
 * Fetches the next BigInt value from the input stream.
 * @returns {BigInt} The parsed BigInt.
 */
function getNextBigInt() {
    return BigInt(tokenStream[tokenIndex++]);
}

/**
 * Reads a specified number of elements from the input stream.
 * Optionally applies a transformation function to each element.
 * @param {number} count - The number of elements to read.
 * @param {function(string): any} [transformFunc] - An optional function to map each string token.
 * @returns {Array<any>} An array containing the read elements.
 */
function getNumArray(count, transformFunc) {
    return transformFunc ? tokenStream.slice(tokenIndex, tokenIndex += count) : tokenStream.slice(tokenIndex, tokenIndex += count).map(elem => +elem);
}

/**
 * Reads a matrix of specified dimensions from the input stream.
 * Elements can be kept as strings or converted to numbers.
 * @param {number} rows - The number of rows in the matrix.
 * @param {number} cols - The number of columns in the matrix.
 * @param {boolean} [asStrings] - If true, elements are stored as strings; otherwise, as numbers.
 * @returns {Array<Array<any>>} The parsed matrix.
 */
function getMatrix(rows, cols, asStrings) {
    let resultMatrix = [], rowCounter = 0;
    if (asStrings) {
        for (; rowCounter < rows; rowCounter++) resultMatrix.push(tokenStream.slice(tokenIndex, tokenIndex += cols));
    } else {
        for (; rowCounter < rows; rowCounter++) resultMatrix.push(tokenStream.slice(tokenIndex, tokenIndex += cols).map(elem => +elem));
    }
    return resultMatrix;
}

/**
 * Dynamically creates a multi-dimensional array initialized with a given value.
 * The dimensions are provided as subsequent arguments.
 * @param {any} initialValue - The value to fill the array elements with.
 * @param {...number} dimensions - The sizes of each dimension.
 * @returns {Array<any>} The newly created multi-dimensional array.
 */
function createMultiDimArray(initialValue) {
    let args = arguments,
        argLength = args.length,
        resultStr = "Array(args[" + --argLength + "]).fill().map(x=>{return " + initialValue + ";})";
    while (--argLength) {
        resultStr = "Array(args[" + argLength + "]).fill().map(x=>" + resultStr + ")";
    }
    return eval(resultStr);
}

// Modular arithmetic constants and helper functions
const MODULUS_VAL = 1000000007; // A common prime modulus

let factorialCache = [], invFactorialCache = [], modularInverses = [], powersOfTwo = [];

/**
 * Performs modular multiplication for multiple operands.
 * This implementation uses a specific trick to handle potential intermediate overflows
 * for numbers up to 2^31-1 when MODULUS_VAL is also within that range.
 * @param {...number} operands - Numbers to multiply.
 * @returns {number} The product modulo MODULUS_VAL.
 */
function multiplyMod() {
    let operands = arguments, product = operands[0], idx = operands.length;
    while (--idx) {
        product = ((product >> 16) * operands[idx] % MODULUS_VAL * 65536 + (product & 65535) * operands[idx]) % MODULUS_VAL;
    }
    return product;
}

/**
 * Precomputes factorials and their modular inverses up to a specified limit.
 * These are stored in `factorialCache` and `invFactorialCache`.
 * @param {number} limit - The upper bound for precomputation.
 */
function precomputeFactorials(limit) {
    factorialCache.length = limit + 1;
    factorialCache[0] = factorialCache[1] = 1;
    for (let counter = 2; counter <= limit;) factorialCache[counter] = multiplyMod(factorialCache[counter - 1], counter++);

    invFactorialCache.length = limit + 1;
    invFactorialCache[0] = invFactorialCache[1] = 1;
    invFactorialCache[limit] = modularInverse(factorialCache[limit]);
    for (let counter = limit; 2 < counter;) invFactorialCache[counter - 1] = multiplyMod(invFactorialCache[counter], counter--);

    // The following lines were commented out in the original code,
    // so they remain commented here to preserve the exact structure and behavior.
    // modularInverses.length = limit + 1; modularInverses[0] = modularInverses[1] = 1;
    // for (let counter = 2; counter <= limit;) modularInverses[counter] = multiplyMod(factorialCache[counter - 1], invFactorialCache[counter++]);
    // powersOfTwo.length = limit + 1; powersOfTwo[0] = 1;
    // for (let counter = 1; counter <= limit; counter++) powersOfTwo[counter] = powersOfTwo[counter - 1] * 2 % MODULUS_VAL;
}

/**
 * Computes the modular multiplicative inverse of a number using the extended Euclidean algorithm.
 * Assumes MODULUS_VAL is a prime number.
 * @param {number} num - The number for which to find the inverse.
 * @returns {number} The modular inverse of 'num' modulo MODULUS_VAL.
 */
function modularInverse(num) {
    let modVal = MODULUS_VAL, x0 = 0, x1 = 1, temp;
    while (num) {
        temp = modVal / num | 0; // Integer division
        modVal -= temp * num;
        x0 -= temp * x1;
        temp = modVal;
        modVal = num;
        num = temp;
        temp = x0;
        x0 = x1;
        x1 = temp;
    }
    x0 %= MODULUS_VAL;
    return x0 < 0 ? x0 + MODULUS_VAL : x0;
}

/**
 * Calculates (base^exponent) % MODULUS_VAL using binary exponentiation (exponentiation by squaring).
 * @param {number} base - The base value.
 * @param {number} exponent - The exponent value.
 * @returns {number} The result of the modular exponentiation.
 */
function powerMod(base, exponent) {
    let result = 1;
    while (exponent) {
        if (exponent & 1) result = multiplyMod(base, result);
        base = multiplyMod(base, base);
        exponent >>= 1;
    }
    return result;
}

/**
 * Computes the number of combinations (nCr) modulo MODULUS_VAL.
 * Requires `precomputeFactorials` to have been called beforehand.
 * @param {number} total - The total number of items.
 * @param {number} choose - The number of items to choose.
 * @returns {number} nCr % MODULUS_VAL.
 */
function combinationsMod(total, choose) {
    return multiplyMod(factorialCache[total], invFactorialCache[choose], invFactorialCache[total - choose]);
}

/**
 * Computes the number of permutations (nPr) modulo MODULUS_VAL.
 * Requires `precomputeFactorials` to have been called beforehand.
 * @param {number} total - The total number of items.
 * @param {number} choose - The number of items to choose.
 * @returns {number} nPr % MODULUS_VAL.
 */
function permutationsMod(total, choose) {
    return multiplyMod(factorialCache[total], invFactorialCache[total - choose]);
}

/**
 * Normalizes a number to be within the range [0, MODULUS_VAL - 1].
 * @param {number} value - The number to normalize.
 * @returns {number} The normalized value.
 */
function normalizeMod(value) {
    return (value % MODULUS_VAL + MODULUS_VAL) % MODULUS_VAL;
}

// Execute the main problem-solving function and print its result
let programResult = solveProblem();
if (programResult !== undefined) {
    console.log(String(programResult));
}

/**
 * The core logic for solving the problem.
 * This function processes input BigInts and performs XOR operations
 * to find a specific transformation.
 * @returns {BigInt | number} The calculated answer as a BigInt, or -1 if no solution is found.
 */
function solveProblem() {
    let countN = getNextNum();
    let valA1 = getNextBigInt(), valA2 = getNextBigInt();
    let xorSum = 0n;

    // Calculate the XOR sum of elements from the third element up to the N-th element.
    for (let loopIdx = 2; loopIdx < countN; loopIdx++) {
        xorSum ^= getNextBigInt();
    }

    let finalAnswer = 0n, currentXor = valA1 ^ valA2 ^ xorSum;

    // Continue as long as the currentXor is not zero.
    while (currentXor) {
        // IMPORTANT: valA1 is a BigInt, while '1' is a Number.
        // The strict equality (===) comparison between BigInt and Number always yields false.
        // This preserves the original code's behavior where this condition is effectively unreachable.
        if (valA1 === 1) return -1;

        // Iterate through bits from the 40th position down to the 0th position.
        for (let bitPos = 40; bitPos >= 0; bitPos--) {
            let bitMask = 1n << BigInt(bitPos); // Create a BigInt mask for the current bit.

            // If the currentXor does not have this bit set, move to the next bit.
            if ((currentXor & bitMask) === 0n) continue;

            let moveAmount;
            // Calculate a potential move amount based on valA1 and the current bit mask.
            moveAmount = (valA1 & (bitMask - 1n)) + 1n;
            // Further refine moveAmount by taking the minimum with another calculated value
            // involving valA2 and the bit mask.
            moveAmount = findMin(moveAmount, bitMask - (valA2 & (bitMask - 1n)));

            // If the calculated moveAmount is valid (i.e., less than valA1).
            if (moveAmount < valA1) {
                finalAnswer += moveAmount; // Add to the total answer.
                valA1 -= moveAmount;       // Adjust valA1.
                valA2 += moveAmount;       // Adjust valA2.
                break; // Break from the inner bit-loop to re-evaluate currentXor.
            } else {
                // If no valid move can be made for this bit, the problem is unsolvable.
                return -1;
            }
        }
        // Recalculate currentXor after adjustments to valA1 and valA2.
        currentXor = valA1 ^ valA2 ^ xorSum;
    }
    return finalAnswer;
}

/**
 * Determines the minimum of two BigInt values.
 * @param {BigInt} value1 - The first BigInt.
 * @param {BigInt} value2 - The second BigInt.
 * @returns {BigInt} The smaller of the two BigInts.
 */
function findMin(value1, value2) {
    return value1 > value2 ? value2 : value1;
}
