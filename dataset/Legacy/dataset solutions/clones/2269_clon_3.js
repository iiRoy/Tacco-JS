"use strict";
const InputReaderFactory = (function() {
    class InputReader {
        constructor(inputString) {
            this.sourceLines = inputString.trim().split("\n");
            this.currentLineIndex = 0;
        }

        readSingle(asString = false) {
            const currentLineContent = this.sourceLines[this.currentLineIndex];
            if (typeof currentLineContent === "string") {
                this.sourceLines[this.currentLineIndex] = currentLineContent.split(" ").reverse();
            }
            const extractedValue = this.sourceLines[this.currentLineIndex].pop();
            if (!this.sourceLines[this.currentLineIndex].length) {
                this.currentLineIndex++;
            }
            return asString ? extractedValue : +extractedValue;
        }

        readLine(asString = false) {
            const lineContent = this.sourceLines[this.currentLineIndex++];
            const splitLine = lineContent.split(" ");
            return asString ? splitLine : splitLine.map(item => +item);
        }

        readMatrix(numRows, asString = false) {
            const endIndex = this.currentLineIndex + numRows;
            const rawRows = this.sourceLines.slice(this.currentLineIndex, endIndex);
            this.currentLineIndex = endIndex;
            const parsedRows = rawRows.map(row => row.split(" "));
            return asString ? parsedRows : parsedRows.map(row => row.map(item => +item));
        }

        readRange(numItems, asString = false) {
            const endIndex = this.currentLineIndex + numItems;
            const rawItems = this.sourceLines.slice(this.currentLineIndex, endIndex);
            this.currentLineIndex = endIndex;
            return asString ? rawItems : rawItems.map(item => +item);
        }
    }
    return (inputString) => new InputReader(inputString);
})();

const inputParser = InputReaderFactory(require("fs").readFileSync("/dev/stdin", "utf8"));

function createMultiDimArray(initialValue) {
    const args = arguments;
    let argCount = args.length;
    let arrayCreationExpression = "Array(args[" + --argCount + "]).fill(0).map(x=>{return " + initialValue + ";})";
    while (--argCount) {
        arrayCreationExpression = "Array(args[" + argCount + "]).fill(0).map(x=>" + arrayCreationExpression + ")";
    }
    return eval(arrayCreationExpression);
}

const MODULUS = 1e9 + 7;

function modularMultiply(valA, valB) {
    // This specific optimization is for MODULUS = 1e9+7
    // It's equivalent to (valA * valB) % MODULUS but handles larger intermediate products
    // by splitting valA into two 16-bit parts.
    const highPartA = valA >> 16;
    const lowPartA = valA & 65535; // 2^16 - 1

    let result = (highPartA * valB) % MODULUS * 65536;
    result = (result + (lowPartA * valB)) % MODULUS;
    return result % MODULUS;
}

const factorials = [];
const invFactorials = [];
const modularInverses = [];
const powersOfTwo = [];

function precomputeCombinatorics(maxVal) {
    const limit = maxVal + 1;

    // Calculate factorials
    factorials.length = limit;
    factorials[0] = 1;
    factorials[1] = 1;
    for (let i = 2; i < limit; i++) {
        factorials[i] = modularMultiply(factorials[i - 1], i);
    }

    // Calculate inverse factorials
    invFactorials.length = limit;
    invFactorials[0] = 1;
    invFactorials[1] = 1;
    invFactorials[maxVal] = modularInverse(factorials[maxVal]);
    for (let i = maxVal - 1; i >= 2; i--) {
        invFactorials[i] = modularMultiply(invFactorials[i + 1], i + 1);
    }

    // Calculate modular inverses (invs[i] = fac[i-1] * finv[i])
    modularInverses.length = limit;
    modularInverses[0] = 1;
    modularInverses[1] = 1;
    for (let i = 2; i < limit; i++) {
        modularInverses[i] = modularMultiply(factorials[i - 1], invFactorials[i]);
    }

    // Calculate powers of two
    powersOfTwo.length = limit;
    powersOfTwo[0] = 1;
    for (let i = 1; i < limit; i++) {
        powersOfTwo[i] = (powersOfTwo[i - 1] * 2) % MODULUS;
    }
}

function modularInverse(num) {
    let currentMod = MODULUS;
    let a = currentMod, b = num;
    let u = 0, v = 1;
    let temp;

    while (b !== 0) {
        const quotient = Math.floor(a / b);
        temp = a - quotient * b;
        a = b;
        b = temp;

        temp = u - quotient * v;
        u = v;
        v = temp;
    }

    u %= MODULUS;
    return u < 0 ? u + MODULUS : u;
}

function modularPower(base, exponent) {
    let result = 1;
    let currentBase = base;
    let currentExponent = exponent;

    while (currentExponent > 0) {
        if (currentExponent & 1) { // If exponent is odd
            result = modularMultiply(currentBase, result);
        }
        currentBase = modularMultiply(currentBase, currentBase);
        currentExponent >>= 1; // Divide exponent by 2
    }
    return result;
}

function nChooseK(n, k) {
    if (k < 0 || k > n) return 0;
    const numerator = factorials[n];
    const denominatorInverse = modularMultiply(invFactorials[k], invFactorials[n - k]);
    return modularMultiply(numerator, denominatorInverse);
}

function nPermuteK(n, k) {
    if (k < 0 || k > n) return 0;
    // Note: Original implementation was n! / k!, not standard n! / (n-k)!
    return modularMultiply(factorials[n], invFactorials[k]);
}

console.log(solveProblem());

function solveProblem() {
    const countElements = inputParser.readSingle();
    const dataPoints = inputParser.readLine();

    precomputeCombinatorics(countElements);

    let finalResult = 0;
    let currentCoefficient = factorials[countElements - 1];

    for (let i = 1; i < countElements; i++) {
        const difference = dataPoints[i] - dataPoints[i - 1];
        const term = modularMultiply(difference, currentCoefficient);
        finalResult = (finalResult + term) % MODULUS;

        const updateFactor = modularMultiply(factorials[countElements - 1], modularInverses[i + 1]);
        currentCoefficient = (currentCoefficient + updateFactor) % MODULUS;
    }

    // Ensure the final result is non-negative
    return (finalResult + MODULUS) % MODULUS;
}
