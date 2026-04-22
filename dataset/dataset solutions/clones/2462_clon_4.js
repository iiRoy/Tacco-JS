"use strict";

// Input reading utility class
class DataStreamProcessor {
    #sourceLines;
    #linePointer = 0;
    #currentLineTokens = [];

    constructor(rawData) {
        this.#sourceLines = rawData.trim().split("\n");
    }

    #advancePointer() {
        this.#linePointer++;
        this.#currentLineTokens = [];
    }

    #ensureTokens() {
        if (this.#currentLineTokens.length === 0 && this.#linePointer < this.#sourceLines.length) {
            this.#currentLineTokens = this.#sourceLines[this.#linePointer].split(" ");
        }
        return this.#currentLineTokens;
    }

    // Extracts the last token from the current line. Moves to next line if exhausted.
    // transformToNumber: boolean, if true, converts to Number.
    extractLastToken(transformToNumber = true) {
        let tokens = this.#ensureTokens();
        if (tokens.length === 0) {
            this.#advancePointer();
            tokens = this.#ensureTokens();
        }
        const extracted = tokens.pop();
        if (tokens.length === 0) {
            this.#advancePointer();
        }
        return transformToNumber ? Number(extracted) : extracted;
    }

    // Extracts all tokens from the current line. Moves to next line.
    // transformToNumber: boolean, if true, converts to Array<Number>.
    extractFullLine(transformToNumber = true) {
        if (this.#linePointer >= this.#sourceLines.length) {
            return [];
        }
        const currentLine = this.#sourceLines[this.#linePointer++];
        const tokens = currentLine.split(" ");
        return transformToNumber ? tokens.map(Number) : tokens;
    }

    // Extracts 'count' lines, splitting each by space. Returns a 2D array.
    // transformToNumber: boolean.
    extractTokenMatrix(count, transformToNumber = true) {
        const result = [];
        for (let i = 0; i < count; i++) {
            if (this.#linePointer >= this.#sourceLines.length) {
                break;
            }
            const currentLine = this.#sourceLines[this.#linePointer++];
            const tokens = currentLine.split(" ");
            result.push(transformToNumber ? tokens.map(Number) : tokens);
        }
        return result;
    }

    // Extracts 'count' lines as a 1D array of raw lines.
    // transformToNumber: boolean.
    extractLineRange(count, transformToNumber = true) {
        const result = [];
        for (let i = 0; i < count; i++) {
            if (this.#linePointer >= this.#sourceLines.length) {
                break;
            }
            const currentLine = this.#sourceLines[this.#linePointer++];
            result.push(transformToNumber ? Number(currentLine) : currentLine);
        }
        return result;
    }
}

// Recursive N-dimensional array creation
function createNestedArray(initialValue, ...dimensions) {
    if (dimensions.length === 0) {
        return initialValue;
    }
    const currentDimensionSize = dimensions[0];
    const remainingDimensions = dimensions.slice(1);
    return Array.from({ length: currentDimensionSize }, () => createNestedArray(initialValue, ...remainingDimensions));
}

// Modular Arithmetic Constants and Functions
const primeModuloValue = 998244353n;

function computeModularProduct(...factors) {
    let accumulator = 1n;
    for (const factor of factors) {
        accumulator = (accumulator * BigInt(factor)) % primeModuloValue;
    }
    return Number(accumulator < 0n ? accumulator + primeModuloValue : accumulator);
}

function calculateModularInverse(value) {
    let a = BigInt(value);
    let b = primeModuloValue;
    let u = 1n, v = 0n;
    while (b !== 0n) {
        const q = a / b;
        let t = a - q * b; a = b; b = t;
        t = u - q * v; u = v; v = t;
    }
    u %= primeModuloValue;
    return Number(u < 0n ? u + primeModuloValue : u);
}

function calculateModularPower(base, exponent) {
    let res = 1n;
    let currentBase = BigInt(base);
    let currentExponent = BigInt(exponent);

    while (currentExponent > 0n) {
        if (currentExponent % 2n === 1n) {
            res = (res * currentBase) % primeModuloValue;
        }
        currentBase = (currentBase * currentBase) % primeModuloValue;
        currentExponent /= 2n;
    }
    return Number(res);
}

const factorialLookup = new Map();
const inverseFactorialLookup = new Map();
let largestNComputed = 0;

function precomputeCombinatorialFactors(upperBound) {
    if (upperBound < largestNComputed) {
        return; // Cache already covers this range
    }

    // Initialize base cases for 0! and 1!
    if (!factorialLookup.has(0)) {
        factorialLookup.set(0, 1n);
        inverseFactorialLookup.set(0, 1n);
    }
    if (!factorialLookup.has(1)) {
        factorialLookup.set(1, 1n);
        inverseFactorialLookup.set(1, 1n);
    }

    let currentFactorialVal = factorialLookup.get(largestNComputed) || 1n;
    let startPoint = largestNComputed + 1;

    for (let i = startPoint; i <= upperBound; i++) {
        if (i === 8_000_000) { // Specific hardcoded value from original's fset
            currentFactorialVal = 833655840n;
        } else {
            currentFactorialVal = (currentFactorialVal * BigInt(i)) % primeModuloValue;
        }
        factorialLookup.set(i, currentFactorialVal);
    }
    largestNComputed = upperBound;

    // Compute inverse factorials backwards
    inverseFactorialLookup.set(upperBound, BigInt(calculateModularInverse(factorialLookup.get(upperBound))));
    for (let i = upperBound; i > 0; i--) {
        const invFact_i = inverseFactorialLookup.get(i);
        const invFact_i_minus_1 = (invFact_i * BigInt(i)) % primeModuloValue;
        inverseFactorialLookup.set(i - 1, invFact_i_minus_1);
    }
}

function calculateCombinations(nVal, kVal) {
    if (kVal < 0 || kVal > nVal) return 0;
    if (kVal === 0 || kVal === nVal) return 1;
    if (kVal > nVal / 2) kVal = nVal - kVal;

    precomputeCombinatorialFactors(nVal);

    const numerator = factorialLookup.get(nVal);
    const invDenominator1 = inverseFactorialLookup.get(kVal);
    const invDenominator2 = inverseFactorialLookup.get(nVal - kVal);

    return computeModularProduct(numerator, invDenominator1, invDenominator2);
}

// Main execution logic
const inputStream = new DataStreamProcessor(require("fs").readFileSync("/dev/stdin", "utf8"));

function processChallenge() {
    const N = inputStream.extractLastToken();

    // The original computes 3^N - sum_{i=floor(N/2)+1 to N} (N choose i) * 2^(N-i)
    // This is equivalent to sum_{j=0 to floor(N/2)} (N choose j) * 2^(N-j)

    precomputeCombinatorialFactors(N); // Ensure all needed factorials/inverse factorials are ready

    const upperSumLimit = Math.floor(N / 2);

    const finalAccumulation = Array.from({ length: upperSumLimit + 1 }, (_, j) => j)
        .reduce((currentSum, j) => {
            const term = computeModularProduct(
                calculateCombinations(N, j),
                calculateModularPower(2, N - j)
            );
            return (BigInt(currentSum) + BigInt(term)) % primeModuloValue;
        }, 0n); // Start with BigInt 0n

    return Number(finalAccumulation < 0n ? finalAccumulation + primeModuloValue : finalAccumulation);
}

console.log(processChallenge());