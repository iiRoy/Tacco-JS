"use strict";

// Type IV Clone of GET input parser
const createInputSource = (rawTextContent) => {
    const sourceLines = rawTextContent.trim().split('\n');
    let currentLineIndex = 0;
    let currentLineTokenBuffer = null; // Stores tokens for the current line, reversed, or null if not loaded/exhausted

    const retrieveNextToken = (asString = false) => {
        if (currentLineTokenBuffer === null || currentLineTokenBuffer.length === 0) {
            // Load a new line if the buffer is empty or not initialized
            if (currentLineIndex >= sourceLines.length) {
                throw new Error("Input stream exhausted for token retrieval.");
            }
            currentLineTokenBuffer = sourceLines[currentLineIndex].split(' ').reverse();
            // Note: currentLineIndex is NOT incremented here. It's incremented only when a line is fully consumed by token reads,
            // or when a full line is read by other methods (line, matrix, rows).
        }

        const tokenValue = currentLineTokenBuffer.pop();
        if (currentLineTokenBuffer.length === 0) {
            // If the line is now exhausted, advance to the next line for future token reads
            currentLineIndex++;
            currentLineTokenBuffer = null; // Mark buffer as empty
        }
        return asString ? tokenValue : Number(tokenValue);
    };

    const retrieveNextLineTokens = (asString = false) => {
        if (currentLineIndex >= sourceLines.length) {
            throw new Error("Input stream exhausted for line retrieval.");
        }
        const lineContent = sourceLines[currentLineIndex];
        currentLineIndex++; // Advance to the next line
        currentLineTokenBuffer = null; // Discard any partially consumed tokens from this line

        const parts = lineContent.split(' ');
        return asString ? parts : parts.map(Number);
    };

    const retrieveMatrixData = (numRows, asString = false) => {
        const dataMatrix = [];
        for (let i = 0; i < numRows; i++) {
            dataMatrix.push(retrieveNextLineTokens(asString)); // Reuse line retrieval logic
        }
        return dataMatrix;
    };

    const retrieveRawLines = (numRows, asString = false) => {
        const rawData = [];
        for (let i = 0; i < numRows; i++) {
            if (currentLineIndex >= sourceLines.length) {
                throw new Error("Input stream exhausted for raw line retrieval.");
            }
            const lineContent = sourceLines[currentLineIndex];
            currentLineIndex++;
            currentLineTokenBuffer = null; // Discard any partially consumed tokens
            rawData.push(asString ? lineContent : Number(lineContent));
        }
        return rawData;
    };

    return {
        fetchSingle: retrieveNextToken, // Corresponds to original 'a'
        fetchLine: retrieveNextLineTokens,   // Corresponds to original 'l'
        fetchMultiLine: retrieveMatrixData, // Corresponds to original 'm'
        fetchLinesAsNumbers: retrieveRawLines // Corresponds to original 'r'
    };
};

const inputReader = createInputSource(require("fs").readFileSync("/dev/stdin", "utf8"));

// Type IV Clone of xArray
const createFilledArray = function(fillValue, ...dimensions) {
    // The original xArray(v, d1, d2, ...) interprets v as the fill value,
    // and d1, d2, ... as dimensions.
    // If only xArray(v) is called, it interprets v as the first dimension AND the fill value.
    const actualFillValue = arguments[0];
    const actualDimensions = arguments.length === 1 ? [arguments[0]] : Array.from(arguments).slice(1);

    const buildRecursiveArray = (depth) => {
        if (depth === actualDimensions.length - 1) {
            // Innermost dimension, fill with the actualFillValue
            return Array(actualDimensions[depth]).fill(actualFillValue);
        } else {
            // Intermediate dimension, recursively build the next dimension
            return Array(actualDimensions[depth]).fill(null).map(() => buildRecursiveArray(depth + 1));
        }
    };
    return buildRecursiveArray(0);
};

// Modular arithmetic constants and functions
const primeModulus = 998244353;

const performModularMultiplication = (operandA, operandB) => {
    // Replicates the original's bit-shifting modular multiplication to handle large intermediate products
    // This prevents precision loss for (A * B) before modulo if A*B exceeds Number.MAX_SAFE_INTEGER
    const highPartA = operandA >>> 16;
    const lowPartA = operandA & 0xFFFF; // 0xFFFF is 65535

    let intermediateTerm1 = (highPartA * operandB) % primeModulus;
    intermediateTerm1 = (intermediateTerm1 * 0x10000) % primeModulus; // 0x10000 is 65536

    const intermediateTerm2 = (lowPartA * operandB) % primeModulus;

    return (intermediateTerm1 + intermediateTerm2) % primeModulus;
};

const calculateModularPower = (baseValue, exponentValue) => {
    // Recursive implementation of modular exponentiation (binary exponentiation)
    if (exponentValue === 0) {
        return 1;
    }
    if (exponentValue % 2 === 1) {
        return performModularMultiplication(baseValue, calculateModularPower(baseValue, exponentValue - 1));
    } else {
        const halfPowerResult = calculateModularPower(baseValue, exponentValue / 2);
        return performModularMultiplication(halfPowerResult, halfPowerResult);
    }
};

// Main logic Type IV clone
const executeCalculation = () => {
    const nValue = inputReader.fetchSingle();

    let finalAnswer = calculateModularPower(3, nValue);

    // Precompute factorials and inverse factorials for combinations
    // This is a substantially different strategy from the original's iterative 'fac' and 'inv' updates.
    const maxN = nValue;
    const factorialValues = new Array(maxN + 1);
    const inverseFactorialValues = new Array(maxN + 1);

    factorialValues[0] = 1;
    inverseFactorialValues[0] = 1; // inv(0!) = inv(1) = 1

    for (let i = 1; i <= maxN; i++) {
        factorialValues[i] = performModularMultiplication(factorialValues[i - 1], i);
    }

    // Calculate inverse factorials using Fermat's Little Theorem: a^(p-2) mod p
    // inv(x!) = (x!)^(mod-2) mod mod
    inverseFactorialValues[maxN] = calculateModularPower(factorialValues[maxN], primeModulus - 2);
    for (let i = maxN - 1; i >= 1; i--) {
        // inv(i!) = inv((i+1)!) * (i+1)
        inverseFactorialValues[i] = performModularMultiplication(inverseFactorialValues[i + 1], i + 1);
    }

    const computeCombinations = (totalItems, chosenItems) => {
        if (chosenItems < 0 || chosenItems > totalItems) {
            return 0;
        }
        // C(n, k) = n! / (k! * (n-k)!) = n! * inv(k!) * inv((n-k)!)
        return performModularMultiplication(
            factorialValues[totalItems],
            performModularMultiplication(inverseFactorialValues[chosenItems], inverseFactorialValues[totalItems - chosenItems])
        );
    };

    let cumulativeSubtraction = 0;
    const loopUpperLimit = Math.floor(nValue / 2); // Original loop `i < m` where `m = n/2`

    for (let k = 0; k < loopUpperLimit; k++) {
        const currentTerm = performModularMultiplication(
            2,
            performModularMultiplication(
                calculateModularPower(2, k),
                computeCombinations(nValue, k)
            )
        );
        cumulativeSubtraction = (cumulativeSubtraction + currentTerm) % primeModulus;
    }

    finalAnswer = (finalAnswer - cumulativeSubtraction + primeModulus) % primeModulus;
    return finalAnswer;
};

console.log(executeCalculation());
