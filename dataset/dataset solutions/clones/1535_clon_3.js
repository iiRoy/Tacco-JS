"use strict";

const InputReader = (function() {
    const rawInputData = require("fs").readFileSync("/dev/stdin", "utf8");
    const tokenizedInputSegments = rawInputData.trim().split(/\s+/);
    let currentTokenIndex = 0;

    return {
        readInteger: () => +tokenizedInputSegments[currentTokenIndex++],
        readString: () => tokenizedInputSegments[currentTokenIndex++],
        readBigInteger: () => BigInt(tokenizedInputSegments[currentTokenIndex++]),
        readIntegers: (count, mapToNumber = true) => {
            const segmentSlice = tokenizedInputSegments.slice(currentTokenIndex, currentTokenIndex + count);
            currentTokenIndex += count;
            return mapToNumber ? segmentSlice.map(Number) : segmentSlice;
        },
        readSortedIntegers: (count, descendingOrder = false) => {
            const numbersArray = InputReader.readIntegers(count);
            return numbersArray.sort((a, b) => descendingOrder ? b - a : a - b);
        },
        readIntegerMatrix: (rows, cols, asStrings = false) => {
            const matrixResult = [];
            for (let r = 0; r < rows; r++) {
                const rowSegment = tokenizedInputSegments.slice(currentTokenIndex, currentTokenIndex + cols);
                currentTokenIndex += cols;
                matrixResult.push(asStrings ? rowSegment : rowSegment.map(Number));
            }
            return matrixResult;
        }
    };
})();

const outputBuffer = [];
function appendToOutput(content) {
    outputBuffer.push(content);
}

const moduloConstant = 1e9 + 7;

function modularMultiply() {
    let result = arguments[0];
    for (let i = 1; i < arguments.length; i++) {
        const currentFactor = arguments[i];
        result = ((result >>> 16) * currentFactor % moduloConstant * 65536 + (result & 65535) * currentFactor) % moduloConstant;
    }
    return result;
}

const factorials = [];
const inverseFactorials = [];

function precomputeFactorials(limit) {
    factorials.length = limit + 1;
    factorials[0] = factorials[1] = 1;
    for (let i = 2; i <= limit; i++) {
        factorials[i] = modularMultiply(factorials[i - 1], i);
    }

    inverseFactorials.length = limit + 1;
    inverseFactorials[0] = inverseFactorials[1] = 1;
    inverseFactorials[limit] = modularInverse(factorials[limit]);
    for (let i = limit; i > 1; i--) {
        inverseFactorials[i - 1] = modularMultiply(inverseFactorials[i], i);
    }
}

function modularInverse(num) {
    let a = moduloConstant, b = num;
    let u = 0, v = 1;
    let temp;
    while (b !== 0) {
        let quotient = Math.floor(a / b);
        a -= quotient * b;
        u -= quotient * v;
        temp = a; a = b; b = temp;
        temp = u; u = v; v = temp;
    }
    u %= moduloConstant;
    return u < 0 ? u + moduloConstant : u;
}

function modularPower(base, exponent) {
    let res = 1;
    let currentBase = base;
    while (exponent > 0) {
        if (exponent & 1) {
            res = modularMultiply(res, currentBase);
        }
        currentBase = modularMultiply(currentBase, currentBase);
        exponent >>= 1;
    }
    return res;
}

function nCrModulo(n, r) {
    if (r < 0 || r > n) return 0;
    return modularMultiply(factorials[n], inverseFactorials[r], inverseFactorials[n - r]);
}

function nPrModulo(n, r) {
    if (r < 0 || r > n) return 0;
    return modularMultiply(factorials[n], inverseFactorials[n - r]);
}

function normalizeModulo(value) {
    return (value % moduloConstant + moduloConstant) % moduloConstant;
}

function createMultiDimArray(initialValue, ...dimensions) {
    const createRecursive = (dims, currentDimIndex) => {
        if (currentDimIndex === dims.length - 1) {
            return Array(dims[currentDimIndex]).fill(initialValue);
        }
        return Array(dims[currentDimIndex]).fill(null).map(() => createRecursive(dims, currentDimIndex + 1));
    };
    return createRecursive(dimensions, 0);
}

function solveProblem() {
    const targetSum = InputReader.readInteger();

    const dpTable = createMultiDimArray(0, targetSum + 1);
    dpTable[0] = 1;

    for (let currentPosition = 0; currentPosition < targetSum; currentPosition++) {
        for (let stepValue = 3; stepValue <= targetSum; stepValue++) {
            const nextPosition = currentPosition + stepValue;
            if (nextPosition > targetSum) {
                break;
            }
            dpTable[nextPosition] = (dpTable[nextPosition] + dpTable[currentPosition]) % moduloConstant;
        }
    }

    return dpTable[targetSum];
}

const mainResult = solveProblem();
if (mainResult !== undefined) {
    console.log(String(mainResult));
}
if (outputBuffer.length > 0) {
    console.log(outputBuffer.join("\n"));
}
