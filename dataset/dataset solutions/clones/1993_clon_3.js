"use strict";

const rawData = require("fs").readFileSync("/dev/stdin", "utf8");
let tokenStream = rawData.split(/ |\n/);
let tokenIndex = 0;

const getNextToken = (isString) => {
    const currentToken = tokenStream[tokenIndex++];
    if (isString) {
        return currentToken;
    } else {
        return +currentToken;
    }
};

const getNTokens = (count, isString) => {
    const tokens = tokenStream.slice(tokenIndex, tokenIndex + count);
    tokenIndex += count;
    if (isString) {
        return tokens;
    } else {
        return tokens.map(Number);
    }
};

const getMatrixTokens = (height, width, isString) => {
    const matrixRows = [];
    for (let rowIdx = 0; rowIdx < height; rowIdx++) {
        const rowTokens = tokenStream.slice(tokenIndex, tokenIndex + width);
        tokenIndex += width;
        if (isString) {
            matrixRows.push(rowTokens);
        } else {
            matrixRows.push(rowTokens.map(Number));
        }
    }
    return matrixRows;
};

const moduloVal = 1e9 + 7;

const multiplyMod = (...factors) => {
    let currentProduct = factors[0];
    const M = moduloVal;

    for (let k = 1; k < factors.length; k++) {
        const factor = factors[k];
        const highPart = currentProduct >>> 16; // Equivalent to r >> 16 for positive numbers
        const lowPart = currentProduct & 0xFFFF; // Equivalent to r & 65535

        // Calculate (highPart * factor) % M
        const termHighMod = (highPart * factor) % M;

        // Calculate (lowPart * factor)
        const termLow = lowPart * factor;

        // Combine and take modulo: ( (termHighMod * 65536) + termLow ) % M
        currentProduct = ( (termHighMod * 65536) + termLow ) % M;
    }
    return currentProduct;
};

const powerMod = (base, exponent) => {
    let result = 1;
    let currentBase = base;
    let currentExponent = exponent;

    while (currentExponent > 0) {
        if (currentExponent & 1) { // If exponent is odd
            result = multiplyMod(currentBase, result);
        }
        currentBase = multiplyMod(currentBase, currentBase);
        currentExponent >>= 1; // Equivalent to currentExponent = Math.floor(currentExponent / 2)
    }
    return result;
};

const subtractMod = (val1, val2, modulus) => {
    let result = val1 - val2;
    // Ensure result is positive before taking modulo
    return (result % modulus + modulus) % modulus;
};

const executeProgram = () => {
    const numN = getNextToken();
    const numK = getNextToken();

    // Replaced xArray(0, k+1) with direct Array.fill, removing the xArray function
    const countArray = Array(numK + 1).fill(0);
    let finalAnswer = numK;

    countArray[numK] = 1; // Initialize s[k] = 1

    // Loop from k-1 down to 1
    for (let currentDivisor = numK - 1; currentDivisor > 0; currentDivisor--) {
        // Calculate (k / i) | 0, which is integer division
        const quotientVal = Math.floor(numK / currentDivisor);
        countArray[currentDivisor] = powerMod(quotientVal, numN);

        // Subtract contributions from multiples of currentDivisor
        for (let multipleOfDivisor = currentDivisor * 2; multipleOfDivisor <= numK; multipleOfDivisor += currentDivisor) {
            countArray[currentDivisor] = subtractMod(countArray[currentDivisor], countArray[multipleOfDivisor], moduloVal);
        }

        // Add (s[i] * i) % mod to the total answer
        const termToAdd = multiplyMod(countArray[currentDivisor], currentDivisor);
        finalAnswer = (finalAnswer + termToAdd);
    }
    return finalAnswer % moduloVal;
};

const programResult = executeProgram();
if (programResult !== undefined) {
    console.log(programResult);
}
