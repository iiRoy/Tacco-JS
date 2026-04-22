"use strict";

// --- Input Processing Module ---
// This module provides a robust way to read various data types from a string input.
// It's designed to mimic the behavior of typical competitive programming input readers,
// with internal state management for tokenized lines.
const createInputReader = (() => {
    // Defines the core class for reading data from an input string.
    class DataStreamReader {
        // Private fields to encapsulate the reader's state.
        #inputLines;           // Stores all input lines after initial processing.
        #currentLineIndex;     // Tracks the index of the line currently being processed.
        #lineTokensBuffer;     // Holds tokens (words) from the current line for single-value reads.
        #currentTokenIndex;    // Index within #lineTokensBuffer for the next token to be read.

        /**
         * Initializes a new DataStreamReader instance.
         * @param {string} rawInputString The complete input content as a single string.
         */
        constructor(rawInputString) {
            // Clean up the input: trim leading/trailing whitespace and split into lines.
            // Filter out any completely empty lines that might result from extra newlines.
            this.#inputLines = rawInputString.trim().split('\n').filter(line => line.length > 0);
            this.#currentLineIndex = 0;
            this.#lineTokensBuffer = []; // Initialize empty token buffer
            this.#currentTokenIndex = 0; // Initialize token index
        }

        /**
         * Internal helper to ensure the token buffer is ready for a single-value read.
         * It advances to the next line if the current one is exhausted or not yet loaded.
         * @returns {boolean} True if tokens are available or a new line was successfully loaded; false if end of input.
         */
        #ensureTokensReady() {
            // If the current token buffer is empty or all its tokens have been consumed,
            // we need to load a new line.
            if (this.#currentTokenIndex >= this.#lineTokensBuffer.length) {
                this.#currentLineIndex++; // Move to the next line in the input source
                this.#currentTokenIndex = 0; // Reset token pointer for the new line

                // Check if we've run past the end of the available input lines.
                if (this.#currentLineIndex >= this.#inputLines.length) {
                    return false; // No more lines to read.
                }

                // Split the new line into tokens. The original `a` method used `reverse()` then `pop()`,
                // implying a right-to-left consumption of tokens on a line. We replicate this behavior.
                this.#lineTokensBuffer = this.#inputLines[this.#currentLineIndex].split(' ').reverse();
            }
            return true;
        }

        /**
         * Reads a single value from the input. Values are consumed from right-to-left on a line.
         * Automatically advances to the next line when the current line's tokens are exhausted.
         * @param {boolean} [returnAsString=false] If true, returns the value as a string; otherwise, attempts conversion to number.
         * @returns {string|number} The next single value from the input.
         * @throws {Error} If no more input is available.
         */
        readNextValue(returnAsString = false) {
            if (!this.#ensureTokensReady()) {
                throw new Error("End of input stream reached: Cannot read single value.");
            }

            // Retrieve the token and advance the internal token pointer.
            const valueToken = this.#lineTokensBuffer[this.#currentTokenIndex++];

            // If this read consumed the last token on the current line, clear the buffer
            // to force loading the next line on the subsequent `readNextValue` call.
            if (this.#currentTokenIndex >= this.#lineTokensBuffer.length) {
                this.#lineTokensBuffer = [];
                this.#currentTokenIndex = 0;
            }

            return returnAsString ? valueToken : Number(valueToken);
        }

        /**
         * Reads an entire line of space-separated values and parses them.
         * Advances the input reader to the next line.
         * @param {boolean} [returnAsStrings=false] If true, returns values as strings; otherwise, attempts conversion to numbers.
         * @returns {Array<string|number>} An array containing all values from the read line.
         * @throws {Error} If no more input lines are available.
         */
        readFullLine(returnAsStrings = false) {
            if (this.#currentLineIndex >= this.#inputLines.length) {
                throw new Error("End of input stream reached: Cannot read full line.");
            }

            // When reading a full line, any pending tokens in the buffer for `readNextValue` are discarded,
            // as the entire line is consumed and the line pointer is advanced.
            this.#lineTokensBuffer = [];
            this.#currentTokenIndex = 0;

            const lineContent = this.#inputLines[this.#currentLineIndex++];
            const parsedValues = lineContent.split(' ');
            return returnAsStrings ? parsedValues : parsedValues.map(val => Number(val));
        }

        /**
         * Reads a block of `numLines` lines, parsing each into an array of values, effectively creating a matrix.
         * Advances the input reader by `numLines`.
         * @param {number} numLines The number of lines to read for the matrix.
         * @param {boolean} [returnAsStrings=false] If true, returns values as strings; otherwise, attempts conversion to numbers.
         * @returns {Array<Array<string|number>>} A 2D array (matrix) of the parsed values.
         * @throws {Error} If not enough lines are available to form the matrix.
         */
        readValueMatrix(numLines, returnAsStrings = false) {
            // Validate if enough lines are remaining for the requested matrix size.
            if (this.#currentLineIndex + numLines > this.#inputLines.length) {
                throw new Error(`Insufficient input lines: Requested ${numLines} for matrix, but only ${this.#inputLines.length - this.#currentLineIndex} lines remain.`);
            }

            // Discard any pending tokens as whole lines are being consumed.
            this.#lineTokensBuffer = [];
            this.#currentTokenIndex = 0;

            const matrixData = [];
            for (let i = 0; i < numLines; i++) {
                const lineContent = this.#inputLines[this.#currentLineIndex++];
                const values = lineContent.split(' ');
                matrixData.push(returnAsStrings ? values : values.map(val => Number(val)));
            }
            return matrixData;
        }

        /**
         * Reads a specified number of lines directly as strings.
         * Advances the input reader by `numLines`.
         * @param {number} numLines The number of raw lines to read.
         * @param {boolean} [returnAsNumbers=false] If true, attempts to convert each raw line to a number; otherwise, returns as strings.
         *                                           Note: Original `r` method converts to number if `f` is false.
         * @returns {Array<string|number>} An array of the raw line strings (or numbers if `returnAsNumbers` is true).
         * @throws {Error} If not enough lines are available.
         */
        readRawLines(numLines, returnAsNumbers = false) {
            if (this.#currentLineIndex + numLines > this.#inputLines.length) {
                throw new Error(`Insufficient input lines: Requested ${numLines} raw lines, but only ${this.#inputLines.length - this.#currentLineIndex} lines remain.`);
            }

            // Discard any pending tokens as whole lines are being consumed.
            this.#lineTokensBuffer = [];
            this.#currentTokenIndex = 0;

            const rawLines = [];
            for (let i = 0; i < numLines; i++) {
                rawLines.push(this.#inputLines[this.#currentLineIndex++]);
            }
            // Replicating the original behavior where 'raw lines' could be converted to numbers
            // if the 'asString' flag was false. This is unusual but functionally preserved.
            return returnAsNumbers ? rawLines.map(line => Number(line)) : rawLines;
        }
    }

    // The factory function that creates and returns an instance of DataStreamReader.
    return (source) => new DataStreamReader(source);
})();


// Initialize the input reader with content from standard input.
const inputProcessor = createInputReader(require("fs").readFileSync("/dev/stdin", "utf8"));

// --- Array Initialization Utility ---
// This function creates multi-dimensional arrays, replacing the original 'eval' based approach
// with a safer and more explicit recursive implementation.
/**
 * Recursively creates a multi-dimensional array initialized with a specific value.
 * This is a safer and more explicit alternative to using `eval` for array creation.
 * @param {*} initialElementValue The value to fill the innermost array elements with.
 * @param {number[]} dimensions An array of numbers representing the size of each dimension, from outermost to innermost.
 * @returns {Array} The newly created multi-dimensional array.
 */
function createMultiDimensionalArray(initialElementValue, ...dimensions) {
    if (dimensions.length === 0) {
        // Base case: If no more dimensions, return the initial value itself.
        // This is the element that fills the innermost array.
        return initialElementValue;
    }

    const currentDimensionSize = dimensions[0];
    const remainingDimensions = dimensions.slice(1);
    const newArray = new Array(currentDimensionSize);

    // Populate the current dimension by recursively creating the next level of arrays
    // or filling with the initial value if it's the innermost dimension.
    for (let i = 0; i < currentDimensionSize; i++) {
        newArray[i] = createMultiDimensionalArray(initialElementValue, ...remainingDimensions);
    }
    return newArray;
}


// --- Modular Arithmetic Utilities ---
// Constants and functions for calculations involving a prime modulus.
const PRIME_MOD = 1_000_000_007; // A common large prime modulus (10^9 + 7).

// Caches for precomputed values to speed up combinatorial calculations.
let factorialCache = [];      // Stores n! % PRIME_MOD
let invFactorialCache = [];   // Stores (n!)^(-1) % PRIME_MOD
let invNumbersCache = [];     // Stores n^(-1) % PRIME_MOD (modular inverse of n)
let powerOfTwoCache = [];     // Stores 2^n % PRIME_MOD

/**
 * Performs modular multiplication of multiple numbers.
 * The internal logic handles potential overflow for intermediate products before applying modulo.
 * @param {...number} factors Numbers to multiply.
 * @returns {number} The product of all factors modulo PRIME_MOD.
 */
function multiplyMod(...factors) {
    // Validate input: ensure at least one factor is provided.
    if (factors.length === 0) {
        return 1; // Multiplicative identity
    }
    if (factors.some(f => typeof f !== 'number' || !Number.isInteger(f))) {
        throw new Error("Modular multiplication factors must be integers.");
    }

    let result = factors[0] % PRIME_MOD; // Start with the first factor, already modulo'd.
    // Iterate through the remaining factors, applying modular multiplication.
    for (let i = 1; i < factors.length; i++) {
        const currentFactor = factors[i] % PRIME_MOD;
        // Optimized modular multiplication for numbers that might exceed standard integer limits
        // before the final modulo operation. This technique splits numbers into 16-bit parts.
        result = (
            ( (result >>> 16) * currentFactor % PRIME_MOD * 65536 ) +
            ( (result & 0xFFFF) * currentFactor )
        ) % PRIME_MOD;
    }
    // Ensure the result is non-negative, as JavaScript's % operator can return negative for negative dividends.
    return (result + PRIME_MOD) % PRIME_MOD;
}

/**
 * Precomputes factorials, inverse factorials, modular inverses of numbers, and powers of 2
 * up to a given limit, storing them in global caches.
 * This is crucial for efficient combinatorial calculations.
 * @param {number} limit The maximum number for which to precompute values.
 */
function precomputeCombinatorialCaches(limit) {
    // Input validation for the limit.
    if (limit < 0) {
        throw new Error("Precomputation limit cannot be negative.");
    }
    if (limit > 1_000_000) { // Arbitrary large limit to prevent excessive memory/time usage
        console.warn(`Warning: Precomputing caches up to ${limit} may consume significant resources.`);
    }

    // Initialize factorial cache: 0! = 1, 1! = 1
    factorialCache.length = limit + 1;
    factorialCache[0] = 1;
    if (limit >= 1) {
        factorialCache[1] = 1;
    }
    for (let i = 2; i <= limit; i++) {
        factorialCache[i] = multiplyMod(factorialCache[i - 1], i);
    }

    // Initialize inverse factorial cache: (0!)^-1 = 1, (1!)^-1 = 1
    invFactorialCache.length = limit + 1;
    invFactorialCache[0] = 1;
    if (limit >= 1) {
        invFactorialCache[1] = 1;
    }

    // Compute (limit!)^-1 using Fermat's Little Theorem (a^(p-2) mod p)
    // Then work backwards to fill the rest of the inverse factorial cache: (i-1)!^-1 = i!^-1 * i
    if (limit >= 2) {
      invFactorialCache[limit] = modularInverse(factorialCache[limit]);
      for (let i = limit - 1; i >= 2; i--) {
          invFactorialCache[i] = multiplyMod(invFactorialCache[i + 1], i + 1);
      }
    }


    // Initialize modular inverse of numbers cache: 1^-1 = 1
    invNumbersCache.length = limit + 1;
    invNumbersCache[0] = 0; // Inverse of 0 is undefined, but for convenience set to 0.
    if (limit >= 1) {
        invNumbersCache[1] = 1;
    }
    // For i > 1, inv(i) = (i-1)! * (i!)^-1 = 1/i.
    // This uses cached factorial and inverse factorial values.
    for (let i = 2; i <= limit; i++) {
        invNumbersCache[i] = multiplyMod(factorialCache[i - 1], invFactorialCache[i]);
    }

    // Initialize powers of 2 cache: 2^0 = 1
    powerOfTwoCache.length = limit + 1;
    powerOfTwoCache[0] = 1;
    for (let i = 1; i <= limit; i++) {
        powerOfTwoCache[i] = multiplyMod(powerOfTwoCache[i - 1], 2);
    }
}

/**
 * Computes the modular multiplicative inverse of a number `num` modulo `PRIME_MOD`.
 * Uses the Extended Euclidean Algorithm.
 * @param {number} num The number for which to find the inverse.
 * @returns {number} The modular inverse of `num` modulo `PRIME_MOD`.
 * @throws {Error} If the inverse does not exist (i.e., `num` is not coprime to `PRIME_MOD`).
 */
function modularInverse(num) {
    let a = PRIME_MOD;
    let b = num % PRIME_MOD; // Ensure b is within modulo range
    if (b < 0) b += PRIME_MOD; // Handle negative inputs by making them positive within the modulus

    let x0 = 0, x1 = 1; // Coefficients for a and b in Bezout's identity (ax + by = gcd(a,b))

    while (b !== 0) {
        const quotient = Math.floor(a / b);
        let tempA = a;
        a = b;
        b = tempA % b; // Euclidean algorithm step

        let tempX = x0;
        x0 = x1 - quotient * x0; // Update coefficients for x
        x1 = tempX;
    }

    // At this point, 'a' holds the GCD(num, PRIME_MOD). If it's not 1, inverse doesn't exist.
    if (a !== 1) {
        throw new Error(`Modular inverse does not exist for ${num} modulo ${PRIME_MOD}. GCD is ${a}.`);
    }

    // Ensure the result is positive.
    return (x1 + PRIME_MOD) % PRIME_MOD;
}

/**
 * Computes `base` raised to the power of `exponent` modulo `PRIME_MOD` using binary exponentiation.
 * Also known as exponentiation by squaring.
 * @param {number} base The base number.
 * @param {number} exponent The exponent.
 * @returns {number} `(base^exponent) % PRIME_MOD`.
 * @throws {Error} If exponent is negative.
 */
function modularExponentiation(base, exponent) {
    if (exponent < 0) {
        throw new Error("Modular exponentiation does not support negative exponents directly.");
    }
    if (exponent === 0) {
        return 1; // Any non-zero base to the power of 0 is 1.
    }

    let result = 1;
    let currentBase = base % PRIME_MOD; // Ensure base is within modulo range

    while (exponent > 0) {
        // If the current bit of the exponent is 1, multiply result by currentBase
        if (exponent % 2 === 1) { // Equivalent to (exponent & 1)
            result = multiplyMod(result, currentBase);
        }
        // Square the currentBase for the next bit of the exponent
        currentBase = multiplyMod(currentBase, currentBase);
        // Move to the next bit of the exponent
        exponent = Math.floor(exponent / 2); // Equivalent to (exponent >>> 1)
    }
    return result;
}

/**
 * Computes "n choose k" (binomial coefficient) modulo PRIME_MOD.
 * C(n, k) = n! / (k! * (n-k)!) = n! * (k!)^-1 * ((n-k)!)^-1
 * Requires precomputed factorials and inverse factorials.
 * @param {number} n The total number of items.
 * @param {number} k The number of items to choose.
 * @returns {number} C(n, k) % PRIME_MOD.
 * @throws {Error} If caches are not sufficiently precomputed or n/k are invalid.
 */
function nChooseKMod(n, k) {
    // Basic validation for n and k for binomial coefficients.
    if (k < 0 || k > n) {
        return 0; // By definition, C(n, k) is 0 if k is out of range.
    }
    if (n < 0) {
        throw new Error("n cannot be negative for nCk calculation.");
    }
    // Check if caches are populated up to n.
    if (n >= factorialCache.length || k >= invFactorialCache.length || (n - k) >= invFactorialCache.length) {
        throw new Error(`Caches not sufficiently precomputed for n=${n}, k=${k}. Max precomputed n is ${factorialCache.length - 1}.`);
    }

    // C(n, k) = n! * (k!)^-1 * ((n-k)!)^-1 (mod P)
    let result = factorialCache[n];
    result = multiplyMod(result, invFactorialCache[k]);
    result = multiplyMod(result, invFactorialCache[n - k]);
    return result;
}

/**
 * Computes "n permute k" (permutation coefficient) modulo PRIME_MOD.
 * P(n, k) = n! / (n-k)! = n! * ((n-k)!)^-1
 * Requires precomputed factorials and inverse factorials.
 * @param {number} n The total number of items.
 * @param {number} k The number of items to arrange.
 * @returns {number} P(n, k) % PRIME_MOD.
 * @throws {Error} If caches are not sufficiently precomputed or n/k are invalid.
 */
function nPermuteKMod(n, k) {
    // Basic validation for n and k for permutation coefficients.
    if (k < 0 || k > n) {
        return 0; // By definition, P(n, k) is 0 if k is out of range.
    }
    if (n < 0) {
        throw new Error("n cannot be negative for nPk calculation.");
    }
    // Check if caches are populated up to n.
    if (n >= factorialCache.length || (n - k) >= invFactorialCache.length) {
        throw new Error(`Caches not sufficiently precomputed for n=${n}, k=${k}. Max precomputed n is ${factorialCache.length - 1}.`);
    }

    // P(n, k) = n! * ((n-k)!)^-1 (mod P)
    let result = factorialCache[n];
    result = multiplyMod(result, invFactorialCache[n - k]);
    return result;
}


// --- Main Problem Solving Logic ---
// This function encapsulates the primary algorithm to solve the problem.
function solveProblem() {
    // Read the main input count 'n'.
    const countN = inputProcessor.readNextValue();

    // Read the array 'x' of data points.
    const dataPointsX = inputProcessor.readFullLine();

    // Precompute necessary combinatorial values up to `countN + 1` for calculations.
    // The original code used `n+1` for `fset`, so we maintain that.
    precomputeCombinatorialCaches(countN + 1);

    let finalAccumulatedSum = 0; // Initialize the variable to store the final answer.

    // The initial coefficient 'u' for the sum. Original: `fac[n-1]`.
    // This corresponds to (n-1)!
    let currentTermCoefficient = factorialCache[countN - 1];

    // Iterate from i = 1 to n-1 (inclusive).
    // The problem seems to be calculating a sum involving differences between adjacent elements in `dataPointsX`.
    for (let loopIndex = 1; loopIndex < countN; loopIndex++) {
        // Calculate the difference between consecutive data points.
        const difference = dataPointsX[loopIndex] - dataPointsX[loopIndex - 1];

        // Add the current term to the accumulated sum.
        // Term = (x[i] - x[i-1]) * u (mod PRIME_MOD)
        const termContribution = multiplyMod(difference, currentTermCoefficient);
        finalAccumulatedSum = (finalAccumulatedSum + termContribution) % PRIME_MOD;

        // Update the coefficient 'u' for the next iteration.
        // Original: `u = (u+mul(fac[n-1],invs[i+1]))%mod;`
        // This means `u_new = (u_old + (n-1)! * (i+1)^-1) % mod`.
        const updateValue = multiplyMod(factorialCache[countN - 1], invNumbersCache[loopIndex + 1]);
        currentTermCoefficient = (currentTermCoefficient + updateValue) % PRIME_MOD;
        // Ensure coefficient remains positive after modulo, as intermediate sums can be negative in JS.
        currentTermCoefficient = (currentTermCoefficient + PRIME_MOD) % PRIME_MOD;
    }

    // Ensure the final result is positive before returning.
    return (finalAccumulatedSum + PRIME_MOD) % PRIME_MOD;
}

// Execute the main problem-solving logic and print the result to console.
console.log(solveProblem());