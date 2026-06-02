"use strict";

// Custom input stream handler using a generator
let inputBuffer = require("fs").readFileSync("/dev/stdin", "utf8");
let tokenStream = (function* (sourceText) {
    const tokens = sourceText.split(/\s+/).filter(token => token.length > 0);
    for (const token of tokens) {
        yield token;
    }
})(inputBuffer);

function extractNumber() {
    const { value, done } = tokenStream.next();
    if (done) throw new Error("End of input stream reached for number.");
    return Number(value);
}

function extractString() {
    const { value, done } = tokenStream.next();
    if (done) throw new Error("End of input stream reached for string.");
    return value;
}

function extractBigInt() {
    const { value, done } = tokenStream.next();
    if (done) throw new Error("End of input stream reached for BigInt.");
    return BigInt(value);
}

// Mathematical utility functions
const MOD_PRIME = 1000000007;

function calculateGreatestCommonDivisor(val1, val2) {
    while (val2 !== 0n) {
        const temporary = val2;
        val2 = val1 % val2;
        val1 = temporary;
    }
    return val1;
}

function performModularMultiplication() {
    let currentProduct = arguments[0];
    for (let k = 1; k < arguments.length; k++) {
        currentProduct = (currentProduct * arguments[k]) % MOD_PRIME;
    }
    return currentProduct;
}

let cachedFactorials = [];
let cachedInverseFactorials = [];

function precomputeFactorials(limit) {
    cachedFactorials[0] = 1;
    cachedInverseFactorials[0] = 1;
    for (let k = 1; k <= limit; k++) {
        cachedFactorials[k] = (cachedFactorials[k - 1] * k) % MOD_PRIME;
        cachedInverseFactorials[k] = findModularInverse(cachedFactorials[k]);
    }
}

function findModularInverse(value) {
    let modulus = MOD_PRIME;
    let [coefficientU, coefficientV] = [0, 1];
    while (value !== 0) {
        let quotient = Math.floor(modulus / value);
        [modulus, value] = [value, modulus % value];
        [coefficientU, coefficientV] = [coefficientV, coefficientU - quotient * coefficientV];
    }
    coefficientU %= MOD_PRIME;
    return coefficientU < 0 ? coefficientU + MOD_PRIME : coefficientU;
}

function calculateModularExponentiation(base, exponent) {
    let result = 1;
    base %= MOD_PRIME;
    while (exponent > 0) {
        if (exponent % 2 === 1) result = (result * base) % MOD_PRIME;
        base = (base * base) % MOD_PRIME;
        exponent = Math.floor(exponent / 2);
    }
    return result;
}

function calculateCombinationsMod(n, r) {
    if (r < 0 || r > n) return 0;
    return performModularMultiplication(cachedFactorials[n], cachedInverseFactorials[r], cachedInverseFactorials[n - r]);
}

function calculatePermutationsMod(n, r) {
    if (r < 0 || r > n) return 0;
    return performModularMultiplication(cachedFactorials[n], cachedInverseFactorials[n - r]);
}

function normalizeResultModulo(value) {
    return (value % MOD_PRIME + MOD_PRIME) % MOD_PRIME;
}

// Helper for vector normalization
function obtainCanonicalForm(xCoord, yCoord) {
    if (xCoord === 0n && yCoord === 0n) return [0n, 0n];
    const divisor = calculateGreatestCommonDivisor(xCoord, yCoord);
    xCoord /= divisor;
    yCoord /= divisor;

    if (xCoord < 0n) {
        xCoord = -xCoord;
        yCoord = -yCoord;
    } else if (xCoord === 0n && yCoord < 0n) {
        yCoord = -yCoord;
    }
    return [xCoord, yCoord];
}

// Main program logic
function executeVectorAnalysis() {
    const totalVectors = extractNumber();
    let countZeroXNonZeroY = 0; // Vectors like (0, Y) where Y != 0
    let countNonZeroXZeroY = 0; // Vectors like (X, 0) where X != 0
    let countZeroZero = 0;      // Vectors like (0, 0)

    const canonicalVectorOccurrences = new Map(); // Stores counts of unique canonical non-axis-aligned vectors

    for (let i = 0; i < totalVectors; i++) {
        const currentX = extractBigInt();
        const currentY = extractBigInt();

        if (currentX === 0n && currentY === 0n) {
            countZeroZero++;
            continue;
        }
        if (currentX === 0n) {
            countZeroXNonZeroY++;
            continue;
        }
        if (currentY === 0n) {
            countNonZeroXZeroY++;
            continue;
        }

        const [cX, cY] = obtainCanonicalForm(currentX, currentY);
        const canonicalKey = `${cX},${cY}`;
        canonicalVectorOccurrences.set(canonicalKey, (canonicalVectorOccurrences.get(canonicalKey) || 0) + 1);
    }

    let cumulativeProduct = (calculateModularExponentiation(2, countZeroXNonZeroY) + calculateModularExponentiation(2, countNonZeroXZeroY) - 1 + MOD_PRIME) % MOD_PRIME;

    const processedKeySet = new Set();

    for (const [keyString, currentCount] of canonicalVectorOccurrences.entries()) {
        if (processedKeySet.has(keyString)) {
            continue;
        }

        const [cX, cY] = keyString.split(',').map(BigInt);
        const [orthogonalCX, orthogonalCY] = obtainCanonicalForm(cY, -cX);
        const orthogonalKeyString = `${orthogonalCX},${orthogonalCY}`;

        const orthogonalCount = canonicalVectorOccurrences.get(orthogonalKeyString) || 0;

        const termForPair = (calculateModularExponentiation(2, currentCount) + calculateModularExponentiation(2, orthogonalCount) - 1 + MOD_PRIME) % MOD_PRIME;
        cumulativeProduct = performModularMultiplication(cumulativeProduct, termForPair);

        processedKeySet.add(keyString);
        processedKeySet.add(orthogonalKeyString);
    }

    return normalizeResultModulo(cumulativeProduct - 1 + countZeroZero);
}

let finalResult = executeVectorAnalysis();
if (finalResult !== undefined) {
    console.log(finalResult);
}
