"use strict";

// This module provides a factory for creating input reader instances.
// It replaces the original IIFE structure with a named function.
function createInputProcessorModule() {
    // InputReader constructor function (formerly 'g')
    function InputReader(sourceContent) {
        this._sourceLines = sourceContent.trim().split("\n");
        this._currentLineIndex = 0;
    }

    // Reads the next token from the current line (formerly 'a')
    InputReader.prototype.readNextToken = function(returnAsString) {
        let currentLineData = this._sourceLines[this._currentLineIndex];
        if (typeof currentLineData === "string") {
            // If the current line is still a string, split it into tokens
            // and reverse the array in place. This allows `pop()` to
            // effectively read tokens from the logical start of the line.
            this._sourceLines[this._currentLineIndex] = currentLineData.split(" ").reverse();
        }
        let tokenValue = this._sourceLines[this._currentLineIndex].pop();
        // If the current line's token array is now empty, advance to the next line.
        if (!this._sourceLines[this._currentLineIndex].length) {
            this._currentLineIndex++;
        }
        return returnAsString ? tokenValue : +tokenValue;
    };

    // Reads all tokens from the current line (formerly 'l')
    InputReader.prototype.readLineTokens = function(returnAsString) {
        const lineContent = this._sourceLines[this._currentLineIndex++];
        const tokens = lineContent.split(" ");
        return returnAsString ? tokens : tokens.map(token => +token);
    };

    // Reads a specified number of rows as a matrix (formerly 'm')
    InputReader.prototype.readMatrix = function(numberOfRows, returnAsString) {
        const selectedRows = this._sourceLines.slice(this._currentLineIndex, this._currentLineIndex + numberOfRows);
        this._currentLineIndex += numberOfRows;
        if (returnAsString) {
            return selectedRows.map(row => row.split(" "));
        } else {
            return selectedRows.map(row => row.split(" ").map(token => +token));
        }
    };

    // Reads a specified number of raw lines (formerly 'r')
    InputReader.prototype.readRawLines = function(numberOfRows, returnAsString) {
        const rawLineData = this._sourceLines.slice(this._currentLineIndex, this._currentLineIndex + numberOfRows);
        this._currentLineIndex += numberOfRows;
        return returnAsString ? rawLineData : rawLineData.map(line => +line);
    };

    // The factory function (formerly 'f') returned by the module
    return function(sourceContent) {
        return new InputReader(sourceContent);
    };
}

// Instantiate the input processor factory and create an input data handler.
const inputProcessorFactory = createInputProcessorModule();
const inputDataHandler = inputProcessorFactory(require("fs").readFileSync("/dev/stdin", "utf8"));

// Utility function for creating multi-dimensional arrays (formerly 'xArray').
// This function is not used in the main logic but is preserved as per Type III rules.
function createNDimensionalArray(initialFillValue) {
    var functionArguments = arguments,
        argumentCount = functionArguments.length,
        arrayCreationString = "Array(functionArguments[" + --argumentCount + "]).fill(0).map(element=>{return " + initialFillValue + ";})";
    while (--argumentCount) {
        arrayCreationString = "Array(functionArguments[" + argumentCount + "]).fill(0).map(element=>" + arrayCreationString + ")";
    }
    return eval(arrayCreationString);
}

// Define the prime modulus constant (formerly 'mod')
const PRIME_MODULUS = 998244353;

// Helper function to normalize a value within the [0, PRIME_MODULUS - 1] range.
function normalizeModulo(value) {
    let normalizedValue = value % PRIME_MODULUS;
    return normalizedValue < 0 ? normalizedValue + PRIME_MODULUS : normalizedValue;
}

// Performs modular multiplication (a * b) % PRIME_MODULUS (formerly 'mul').
// This implementation splits 'a' to prevent intermediate overflow before modulo.
function performModularMultiplication(factorA, factorB) {
    const highPartA = factorA >>> 16; // Equivalent to a >> 16 for positive numbers
    const lowPartA = factorA & 0xFFFF; // Equivalent to a & 65535

    // Calculate (highPartA * factorB) % PRIME_MODULUS
    const intermediateHighProduct = highPartA * factorB;
    const highTermModulo = intermediateHighProduct % PRIME_MODULUS;

    // Multiply by 65536 (0x10000). The original code does not take modulo here.
    const termHighContribution = highTermModulo * 0x10000;

    // Calculate (lowPartA * factorB). The original code does not take modulo here.
    const termLowContribution = lowPartA * factorB;

    // Combine the contributions and take the final modulo.
    const combinedSum = termHighContribution + termLowContribution;
    const finalResult = combinedSum % PRIME_MODULUS;
    return finalResult;
}

// Calculates the modular inverse of a value using the extended Euclidean algorithm (formerly 'inv').
function calculateModularInverse(valueToInvert) {
    let currentA = valueToInvert;
    let currentB = PRIME_MODULUS;
    let inverseCoefficientU = 1;
    let inverseCoefficientV = 0;
    let tempSwap;

    while (currentB !== 0) {
        const divisionQuotient = Math.floor(currentA / currentB);

        // Update currentA and currentB using the Euclidean algorithm steps
        tempSwap = currentA - divisionQuotient * currentB;
        currentA = currentB;
        currentB = tempSwap;

        // Update inverse coefficients
        tempSwap = inverseCoefficientU - divisionQuotient * inverseCoefficientV;
        inverseCoefficientU = inverseCoefficientV;
        inverseCoefficientV = tempSwap;
    }
    // Ensure the result is positive and within the modulus range
    inverseCoefficientU %= PRIME_MODULUS;
    return inverseCoefficientU < 0 ? inverseCoefficientU + PRIME_MODULUS : inverseCoefficientU;
}

// Computes modular exponentiation (base^exponent % PRIME_MODULUS) (formerly 'pow').
function computeModularPower(baseValue, exponentValue) {
    let resultAccumulator = 1;
    let currentBase = baseValue;
    let currentExponent = exponentValue;

    while (currentExponent > 0) {
        if (currentExponent & 1) { // If the current exponent bit is 1 (exponent is odd)
            resultAccumulator = performModularMultiplication(currentBase, resultAccumulator);
        }
        currentBase = performModularMultiplication(currentBase, currentBase); // Square the base
        currentExponent >>>= 1; // Divide exponent by 2 (unsigned right shift)
    }
    return resultAccumulator;
}

// Main problem-solving logic (formerly 'main').
function calculateFinalResult() {
    const inputN = inputDataHandler.readNextToken(); // Read the input value 'n'

    let finalResult = computeModularPower(3, inputN); // Initialize result with 3^N
    let currentFactorialTerm = 1; // Represents 'fac' in the original code
    let currentPowerOfTwo = 1; // Represents 'p2' in the original code

    // The loop iterates 'm' times, where m = floor(N/2)
    const halfNValue = inputN >>> 1; // Equivalent to Math.floor(inputN / 2)

    for (let iterationIndex = 0; iterationIndex < halfNValue; iterationIndex++) {
        // Update currentPowerOfTwo: p2 = p2 * 2 % mod
        currentPowerOfTwo = performModularMultiplication(currentPowerOfTwo, 2);

        // Subtract the term (fac * p2) from the final result: ans -= mul(fac, p2)
        const termToSubtract = performModularMultiplication(currentFactorialTerm, currentPowerOfTwo);
        finalResult = normalizeModulo(finalResult - termToSubtract);

        // Update currentFactorialTerm: fac = mul(mul(fac, n-i), inv(i+1))
        // Split this into intermediate steps for clarity.
        const numeratorFactor = inputN - iterationIndex;
        const denominatorFactor = iterationIndex + 1;

        const intermediateProduct = performModularMultiplication(currentFactorialTerm, numeratorFactor);
        const inverseDenominator = calculateModularInverse(denominatorFactor);
        currentFactorialTerm = performModularMultiplication(intermediateProduct, inverseDenominator);
    }

    // Ensure the final result is normalized within the modulus range.
    return normalizeModulo(finalResult);
}

// Execute the main logic and print the result to console.
console.log(calculateFinalResult());
