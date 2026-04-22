"use strict";

// This module provides a flexible input parsing utility.
const InputProcessorFactory = (function() {
    /**
     * Creates an instance of InputReader.
     * @param {string} rawInputString - The complete input as a single string.
     * @returns {InputReader} A new InputReader object.
     */
    function createInputReader(rawInputString) {
        // Basic validation for the input string
        if (typeof rawInputString !== 'string' || rawInputString.length === 0) {
            console.error("Warning: Empty or invalid input provided to InputProcessorFactory. Returning an empty reader.");
            return new InputReader(""); // Return an empty reader to prevent crashes
        }
        return new InputReader(rawInputString);
    }

    /**
     * @class InputReader
     * @description Handles parsing of input strings line by line, token by token.
     */
    function InputReader(inputContent) {
        // Store input lines, removing leading/trailing whitespace and splitting by newline.
        // Initialize an internal line pointer.
        this.sourceLines = inputContent.trim().split("\n");
        this.currentLineIndex = 0;
        // Optionally, filter out any lines that become empty after trimming.
        this.sourceLines = this.sourceLines.filter(line => line.length > 0);
    }

    /**
     * Retrieves the next token from the current line.
     * If the current line is exhausted, it moves to the next.
     * Tokens are processed in reverse order of appearance on the line.
     * @param {boolean} [returnAsString=false] - If true, returns the token as a string; otherwise, attempts to parse as a number.
     * @returns {(string|number|null)} The next token, or null if no more tokens/lines.
     */
    InputReader.prototype.fetchNextToken = function(returnAsString = false) {
        const lines = this.sourceLines;
        let lineIdx = this.currentLineIndex;

        // Ensure we are within bounds of available lines
        if (lineIdx >= lines.length) {
            return null; // No more lines to process
        }

        // If the current line hasn't been split into tokens yet, do so and reverse them.
        // This modifies the sourceLines array in place for efficiency.
        if (typeof lines[lineIdx] === "string") {
            lines[lineIdx] = lines[lineIdx].split(" ").reverse();
        }

        let currentLineTokens = lines[lineIdx];

        // If the current line has no tokens, advance to the next line and try again.
        if (currentLineTokens.length === 0) {
            this.currentLineIndex++;
            return this.fetchNextToken(returnAsString); // Recursive call to get token from next line
        }

        const extractedToken = currentLineTokens.pop();

        // If line becomes empty after popping the token, prepare to move to next line for subsequent calls.
        if (currentLineTokens.length === 0) {
            this.currentLineIndex++;
        }

        // Convert to number if not explicitly requested as string.
        return returnAsString ? extractedToken : +extractedToken;
    };

    /**
     * Retrieves all tokens from the current line and advances the line pointer.
     * @param {boolean} [returnStrings=false] - If true, returns tokens as strings; otherwise, attempts to parse as numbers.
     * @returns {Array<string|number>} An array of tokens from the current line.
     */
    InputReader.prototype.retrieveLineTokens = function(returnStrings = false) {
        const currentLineContent = this.sourceLines[this.currentLineIndex++];
        if (currentLineContent === undefined) {
            return []; // No more lines available
        }
        const tokens = currentLineContent.split(" ");
        return returnStrings ? tokens : tokens.map(token => +token);
    };

    /**
     * Extracts a matrix (2D array) of tokens from subsequent lines.
     * @param {number} numRows - The number of rows to extract.
     * @param {boolean} [stringsOnly=false] - If true, returns tokens as strings; otherwise, attempts to parse as numbers.
     * @returns {Array<Array<string|number>>} A 2D array representing the extracted matrix.
     */
    InputReader.prototype.extractMatrix = function(numRows, stringsOnly = false) {
        if (numRows <= 0) return [];
        const startIndex = this.currentLineIndex;
        this.currentLineIndex += numRows; // Advance line pointer by the number of rows read
        const selectedLines = this.sourceLines.slice(startIndex, this.currentLineIndex);

        return selectedLines.map(line => {
            const rowTokens = line.split(" ");
            return stringsOnly ? rowTokens : rowTokens.map(token => +token);
        });
    };

    /**
     * Obtains a block of raw lines.
     * @param {number} count - The number of lines to obtain.
     * @param {boolean} [parseNumbers=false] - If true, attempts to parse each line as a number; otherwise, returns as strings.
     * @returns {Array<string|number>} An array of selected lines.
     */
    InputReader.prototype.obtainRawLines = function(count, parseNumbers = false) {
        if (count <= 0) return [];
        const startIdx = this.currentLineIndex;
        this.currentLineIndex += count;
        const rawLineBlock = this.sourceLines.slice(startIdx, this.currentLineIndex);
        return parseNumbers ? rawLineBlock.map(l => +l) : rawLineBlock;
    };

    return createInputReader;
})();

// Load input data from standard input using the custom input processor.
// This assumes the execution environment provides 'require' and 'fs' for file system access.
const dataStream = InputProcessorFactory(require("fs").readFileSync("/dev/stdin", "utf8"));

// --- Mathematical Utility Functions for Modular Arithmetic ---

// The prime modulus value used for all calculations.
const PRIME_MODULUS = 998244353;

/**
 * Performs modular multiplication for an arbitrary number of arguments.
 * Includes an optimization to prevent intermediate overflows for large numbers
 * when the modulus is a 32-bit prime.
 * @param {...number} factors - Numbers to multiply.
 * @returns {number} The product modulo PRIME_MODULUS.
 */
function modularMultiply(...factors) {
    if (factors.length === 0) return 1; // Identity element for multiplication

    let productAccumulator = factors[0] % PRIME_MODULUS;
    if (productAccumulator < 0) productAccumulator += PRIME_MODULUS; // Ensure positive remainder

    // Constants for the 16-bit splitting optimization.
    const BITS_FOR_SPLIT = 16;
    const LOW_BITS_MASK = (1 << BITS_FOR_SPLIT) - 1; // Equivalent to 65535

    for (let i = 1; i < factors.length; i++) {
        let currentFactor = factors[i] % PRIME_MODULUS;
        if (currentFactor < 0) currentFactor += PRIME_MODULUS;

        // Split productAccumulator into two 16-bit parts (high and low)
        const highPart = (productAccumulator >> BITS_FOR_SPLIT);
        const lowPart = (productAccumulator & LOW_BITS_MASK);

        // Perform modular multiplication on each part and combine.
        // This prevents `productAccumulator * currentFactor` from exceeding Number.MAX_SAFE_INTEGER.
        let intermediateResult = (highPart * currentFactor) % PRIME_MODULUS;
        intermediateResult = (intermediateResult * (1 << BITS_FOR_SPLIT)) % PRIME_MODULUS;

        intermediateResult = (intermediateResult + (lowPart * currentFactor) % PRIME_MODULUS) % PRIME_MODULUS;
        productAccumulator = intermediateResult;
    }
    return productAccumulator;
}

// Global variables to cache precomputed factorials and their modular inverses.
let currentFactorialValue = 1;
const cachedInverseFactorials = []; // An array for dynamic storage of inverse factorials.

/**
 * Precomputes factorials and their modular inverses up to a given 'limit'.
 * This function updates global caches (`currentFactorialValue`, `cachedInverseFactorials`).
 * It's designed to be called once with the maximum 'N' required for combinations.
 * @param {number} limit - The upper bound (inclusive) for precomputation.
 */
function precomputeFactorials(limit) {
    if (limit < 0) {
        console.warn("Precomputation limit cannot be negative. Skipping.");
        return;
    }

    // Reset the factorial accumulator and resize the inverse factorials array.
    currentFactorialValue = 1;
    cachedInverseFactorials.length = limit + 1;
    cachedInverseFactorials[0] = 1; // 0! is 1

    // Calculate factorials iteratively from 1 up to the limit.
    for (let j = 1; j <= limit; j++) {
        currentFactorialValue = modularMultiply(currentFactorialValue, j);
    }

    // Calculate the modular inverse for the largest factorial (limit!).
    cachedInverseFactorials[limit] = calculateModularInverse(currentFactorialValue);

    // Calculate inverse factorials for smaller numbers in reverse order.
    // inv((j-1)!) = inv(j!) * j
    for (let j = limit; j >= 1; j--) {
        cachedInverseFactorials[j - 1] = modularMultiply(cachedInverseFactorials[j], j);
    }
}

/**
 * Calculates the modular multiplicative inverse of 'val' modulo PRIME_MODULUS.
 * This implementation uses the Extended Euclidean Algorithm.
 * @param {number} val - The number for which to find the inverse.
 * @returns {number} The modular inverse of 'val' in the range [0, PRIME_MODULUS-1].
 */
function calculateModularInverse(val) {
    let a = val;
    let b = PRIME_MODULUS;
    let u = 1, v = 0; // Coefficients for Bezout's identity: a*u + b*v = gcd(a,b)
    let temp;

    // Standard Extended Euclidean Algorithm steps
    while (b !== 0) {
        const quotient = Math.floor(a / b);
        // Update a and b
        temp = a - quotient * b;
        a = b;
        b = temp;

        // Update u and v coefficients
        temp = u - quotient * v;
        u = v;
        v = temp;
    }

    // Ensure the result is within the positive range [0, PRIME_MODULUS-1].
    u %= PRIME_MODULUS;
    return u < 0 ? u + PRIME_MODULUS : u;
}

/**
 * Computes (base ^ exponent) % PRIME_MODULUS using the binary exponentiation method
 * (also known as exponentiation by squaring).
 * @param {number} base - The base number.
 * @param {number} exponent - The non-negative integer exponent.
 * @returns {number} (base ^ exponent) % PRIME_MODULUS.
 */
function modularExponentiation(base, exponent) {
    let result = 1;
    let currentBase = base % PRIME_MODULUS; // Normalize base initially

    if (exponent < 0) {
        console.error("Modular exponentiation expects a non-negative exponent.");
        return 0; // Or throw an error, depending on desired error handling
    }

    // Iterate while the exponent is greater than zero
    while (exponent > 0) {
        // If the current bit of the exponent is 1 (i.e., exponent is odd)
        if (exponent % 2 === 1) {
            result = modularMultiply(result, currentBase);
        }
        // Square the base for the next iteration (effectively handling the next bit)
        currentBase = modularMultiply(currentBase, currentBase);
        // Divide the exponent by 2 (integer division)
        exponent = Math.floor(exponent / 2);
    }
    return result;
}

/**
 * Calculates nCr (n Choose r) modulo PRIME_MODULUS using precomputed factorials
 * and their modular inverses. This function relies on `precomputeFactorials`
 * having been called previously for `n`.
 * @param {number} n - The total number of items.
 * @param {number} r - The number of items to choose.
 * @returns {number} nCr % PRIME_MODULUS. Returns 0 for invalid combinations.
 */
function nChooseR(n, r) {
    // Handle invalid combinations: r < 0, r > n, or n < 0.
    if (r < 0 || r > n || n < 0) return 0;
    // Base cases: C(n, 0) = 1, C(n, n) = 1
    if (r === 0 || r === n) return 1;

    // Check if inverse factorials are precomputed for the required range.
    if (cachedInverseFactorials[r] === undefined || cachedInverseFactorials[n - r] === undefined) {
        console.error(`Error: Factorials not precomputed up to ${n}. Call precomputeFactorials(${n}) first.`);
        return 0; // Return 0 or throw an error if precomputation is missing
    }
    // nCr = n! / (r! * (n-r)!) = n! * (r!)^(-1) * ((n-r)!)^(-1) (all modulo PRIME_MODULUS)
    return modularMultiply(currentFactorialValue, cachedInverseFactorials[r], cachedInverseFactorials[n - r]);
}

// Main program execution starts here.
console.log(solveProblem());

/**
 * The main function to solve the problem.
 * It reads an input value 'N', then computes a specific sum involving
 * binomial coefficients and powers of 2, all modulo PRIME_MODULUS.
 * @returns {number} The final calculated result.
 */
function solveProblem() {
    const inputValN = dataStream.fetchNextToken();

    // Input validation: ensure N is a non-negative integer.
    if (typeof inputValN !== 'number' || !Number.isInteger(inputValN) || inputValN < 0) {
        console.error("Invalid input for N. Expected a non-negative integer. Returning 0.");
        return 0;
    }

    // The problem often starts with (1+2)^N = 3^N.
    let finalResult = modularExponentiation(3, inputValN);

    // Precompute factorials and their inverses up to N. This is essential for nChooseR.
    precomputeFactorials(inputValN);

    let powerOfTwoTerm = 1; // This variable will track powers of 2, specifically 2^(k+1)
    const lowerBoundExclusive = inputValN >> 1; // Integer division of N by 2. Loop continues while currentNValue > lowerBoundExclusive.

    // The original loop iterated from `i = n` down to `floor(n/2) + 1`.
    // We'll use a `while` loop with a clear loop counter `currentNValue`.
    let currentNValue = inputValN;

    while (currentNValue > lowerBoundExclusive) {
        // In each iteration, `powerOfTwoTerm` effectively becomes `2 * previous_powerOfTwoTerm`.
        // This is equivalent to `2^(inputValN - currentNValue + 1)` in terms of the original problem's `i`.
        powerOfTwoTerm = modularMultiply(powerOfTwoTerm, 2);
        // The original code used `p2 += p2; if (mod <= p2) p2 -= mod;` which is equivalent to `(p2 * 2) % mod`.

        // Calculate the binomial coefficient C(N, currentNValue)
        const combinationTerm = nChooseR(inputValN, currentNValue);

        // Multiply the combination term by the current power of two term modulo PRIME_MODULUS.
        const termToSubtract = modularMultiply(combinationTerm, powerOfTwoTerm);

        // Subtract the calculated term from the total result.
        // Add PRIME_MODULUS before taking modulo to ensure the result is always positive.
        finalResult = (finalResult - termToSubtract + PRIME_MODULUS) % PRIME_MODULUS;

        currentNValue--; // Decrement the loop counter to move to the next iteration.
    }

    // A final check to ensure the result is non-negative, in case of any edge cases.
    if (finalResult < 0) {
        finalResult += PRIME_MODULUS;
    }

    return finalResult;
}