"use strict";

// --- Input/Output Utilities (Substantially different implementation, renamed) ---
const rawInputContent = require("fs").readFileSync("/dev/stdin", "utf8");
const tokenSequence = rawInputContent.split(/ |\n/);
let currentTokenIndex = 0;

function retrieveInteger() {
    return Number(tokenSequence[currentTokenIndex++]);
}

function retrieveString() {
    return tokenSequence[currentTokenIndex++];
}

function retrieveBigInt() {
    return BigInt(tokenSequence[currentTokenIndex++]);
}

function retrieveIntegers(count, asStrings = false) {
    const values = [];
    for (let i = 0; i < count; i++) {
        values.push(asStrings ? retrieveString() : retrieveInteger());
    }
    return values;
}

function retrieveMatrix(height, width, asStrings = false) {
    const matrix = [];
    for (let i = 0; i < height; i++) {
        matrix.push(retrieveIntegers(width, asStrings));
    }
    return matrix;
}

// --- Modular Arithmetic Utilities (Substantially different implementation, renamed, BigInt-based) ---
const primeModulus = 998244353n; // Use BigInt for modulus to ensure precision

function modularProduct(...factors) {
    let product = 1n;
    for (const factor of factors) {
        product = (product * BigInt(factor)) % primeModulus;
    }
    return product;
}

function modularExponentiation(base, exponent) {
    let result = 1n;
    let currentBase = BigInt(base);
    let currentExponent = BigInt(exponent);

    while (currentExponent > 0n) {
        if (currentExponent % 2n === 1n) {
            result = (result * currentBase) % primeModulus;
        }
        currentBase = (currentBase * currentBase) % primeModulus;
        currentExponent /= 2n;
    }
    return result;
}

function modularInverse(num) {
    // Using Fermat's Little Theorem: a^(p-2) % p for prime modulus
    return modularExponentiation(num, primeModulus - 2n);
}

let precomputedFactorials = [];
let precomputedInvFactorials = [];
// let precomputedInverses = []; // Not used in original main logic
// let precomputedPowersOfTwo = []; // Not used in original main logic

function setupFactorials(n) {
    precomputedFactorials = new Array(n + 1);
    precomputedInvFactorials = new Array(n + 1);

    precomputedFactorials[0] = 1n;
    for (let i = 1; i <= n; i++) {
        precomputedFactorials[i] = modularProduct(precomputedFactorials[i - 1], i);
    }

    precomputedInvFactorials[n] = modularInverse(precomputedFactorials[n]);
    for (let i = n - 1; i >= 0; i--) {
        precomputedInvFactorials[i] = modularProduct(precomputedInvFactorials[i + 1], i + 1);
    }

    // precomputedInverses.length = n + 1; // Original commented out
    // precomputedInverses[0] = 1n;
    // precomputedInverses[1] = 1n;
    // for (let i = 2; i <= n; i++) {
    //     precomputedInverses[i] = modularProduct(precomputedFactorials[i - 1], precomputedInvFactorials[i]);
    // }

    // precomputedPowersOfTwo.length = n + 1; // Original commented out
    // precomputedPowersOfTwo[0] = 1n;
    // for (let i = 1; i <= n; i++) {
    //     precomputedPowersOfTwo[i] = (precomputedPowersOfTwo[i - 1] * 2n) % primeModulus;
    // }
}

function nCombinations(n, r) {
    if (r < 0 || r > n) return 0n;
    return modularProduct(precomputedFactorials[n], precomputedInvFactorials[r], precomputedInvFactorials[n - r]);
}

function nPermutations(n, r) {
    if (r < 0 || r > n) return 0n;
    return modularProduct(precomputedFactorials[n], precomputedInvFactorials[n - r]);
}

function ensurePositiveModulo(n) {
    return (BigInt(n) % primeModulus + primeModulus) % primeModulus;
}

// --- Main Logic (Substantially different implementation, renamed) ---
const problemResult = executeSolution();
if (problemResult !== undefined) {
    console.log(problemResult.toString()); // Convert BigInt to string for consistent output format
}

function executeSolution() {
    const [startRow, startCol, endRow, endCol] = retrieveIntegers(4);

    // Different data representation: 2D DP table flattened into a 1D array
    const totalCells = (endRow + 1) * (endCol + 1);
    const memoTable = new Array(totalCells).fill(0n); // Store BigInts

    // Helper function to map 2D coordinates to a 1D array index
    const getFlatIndex = (r, c) => r * (endCol + 1) + c;

    // Set the initial base case value
    memoTable[getFlatIndex(startRow, startCol)] = 1n;

    // Iterate through the DP table
    for (let currentRow = startRow; currentRow <= endRow; currentRow++) {
        for (let currentCol = startCol; currentCol <= endCol; currentCol++) {
            let currentCellContributions = 0n;

            // Calculate contribution from (currentRow - 1, currentCol)
            if (currentRow > 0) {
                currentCellContributions = ensurePositiveModulo(currentCellContributions + modularProduct(memoTable[getFlatIndex(currentRow - 1, currentCol)], currentCol));
            }

            // Calculate contribution from (currentRow, currentCol - 1)
            if (currentCol > 0) {
                currentCellContributions = ensurePositiveModulo(currentCellContributions + modularProduct(memoTable[getFlatIndex(currentRow, currentCol - 1)], currentRow));
            }

            // Subtract contribution from (currentRow - 1, currentCol - 1)
            if (currentRow > 0 && currentCol > 0) {
                currentCellContributions = ensurePositiveModulo(currentCellContributions - modularProduct(memoTable[getFlatIndex(currentRow - 1, currentCol - 1)], currentRow - 1, currentCol - 1));
            }
            
            // Add the accumulated contributions to the current cell's value
            // The original code uses `dp[y][x] += ...`, so we add to the existing value (which is 1n for (a,b) and 0n otherwise)
            memoTable[getFlatIndex(currentRow, currentCol)] = ensurePositiveModulo(memoTable[getFlatIndex(currentRow, currentCol)] + currentCellContributions);
        }
    }

    return memoTable[getFlatIndex(endRow, endCol)];
}
