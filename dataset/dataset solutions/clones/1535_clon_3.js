"use strict";

// --- Input Processing Section ---

// Core module for file system operations, used to read standard input.
const fileSystem = require("fs");

// Reads all content from the standard input file path synchronously.
// Input path is typically "/dev/stdin" on Linux/macOS systems for competitive programming.
let rawInputData = fileSystem.readFileSync("/dev/stdin", "utf8");

// Tokenizes the raw input data by any sequence of whitespace characters.
// Filters out any empty strings that might result from multiple consecutive delimiters.
let inputTokens = rawInputData.split(/\s+/).filter(token => token.length > 0);

// An index to keep track of the current position in the token stream.
let currentTokenIndex = 0;

/**
 * Advances the token stream and parses the next token as a standard JavaScript number (integer).
 * Includes a guard clause to prevent reading beyond available tokens.
 * @returns {number} The parsed integer value.
 * @throws {Error} If an attempt is made to read past the end of the input tokens.
 */
function extractNextInteger() {
    if (currentTokenIndex >= inputTokens.length) {
        throw new Error("Input token stream exhausted: attempted to read beyond available tokens.");
    }
    return Number(inputTokens[currentTokenIndex++]);
}

/**
 * Advances the token stream and returns the next token as a string.
 * Includes a guard clause to prevent reading beyond available tokens.
 * @returns {string} The raw string token.
 * @throws {Error} If an attempt is made to read past the end of the input tokens.
 */
function extractNextString() {
    if (currentTokenIndex >= inputTokens.length) {
        throw new Error("Input token stream exhausted: attempted to read beyond available tokens.");
    }
    return inputTokens[currentTokenIndex++];
}

/**
 * Advances the token stream and parses the next token as a BigInt.
 * BigInt is used for arbitrarily large integers, beyond the safe integer limit of Number.
 * Includes a guard clause to prevent reading beyond available tokens.
 * @returns {BigInt} The parsed BigInt value.
 * @throws {Error} If an attempt is made to read past the end of the input tokens.
 */
function extractNextBigInt() {
    if (currentTokenIndex >= inputTokens.length) {
        throw new Error("Input token stream exhausted: attempted to read beyond available tokens.");
    }
    return BigInt(inputTokens[currentTokenIndex++]);
}

/**
 * Reads a specified number of integer tokens from the stream into an array.
 * Optionally sorts the resulting array in ascending or descending order.
 * @param {number} count The number of integers to read. Must be non-negative.
 * @param {boolean} [shouldSortDescending=false] If true, the array is sorted in descending order.
 *                                               Otherwise, it's sorted in ascending order.
 * @returns {number[]} An array containing the parsed integer sequence.
 * @throws {Error} If 'count' is negative or if there are not enough tokens available.
 */
function readIntegerSequence(count, shouldSortDescending = false) {
    if (count < 0) {
        throw new Error(`Invalid argument: count for integer sequence must be non-negative, received ${count}.`);
    }
    const sequenceEndIndex = currentTokenIndex + count;
    if (sequenceEndIndex > inputTokens.length) {
        throw new Error(`Insufficient tokens: requested ${count} integers, but only ${inputTokens.length - currentTokenIndex} remain.`);
    }

    const sequence = inputTokens.slice(currentTokenIndex, sequenceEndIndex).map(Number);
    currentTokenIndex = sequenceEndIndex; // Update the global token index

    if (shouldSortDescending) {
        return sequence.sort((valA, valB) => valB - valA); // Sort in descending order
    } else {
        return sequence.sort((valA, valB) => valA - valB); // Sort in ascending order (default)
    }
}

/**
 * Reads a 2D matrix from the token stream, with specified height and width.
 * Each element can be kept as a string or converted to a number.
 * @param {number} height The number of rows in the matrix. Must be non-negative.
 * @param {number} width The number of columns in each row. Must be non-negative.
 * @param {boolean} [keepStrings=false] If true, matrix elements remain as strings; otherwise, they are converted to numbers.
 * @returns {Array<Array<number|string>>} The 2D matrix.
 * @throws {Error} If dimensions are negative or if there are not enough tokens for the matrix.
 */
function readInputMatrix(height, width, keepStrings = false) {
    if (height < 0 || width < 0) {
        throw new Error(`Invalid dimensions: height (${height}) and width (${width}) must be non-negative.`);
    }
    const matrix = [];
    for (let rowIndex = 0; rowIndex < height; rowIndex++) {
        const rowStartIndex = currentTokenIndex;
        const rowEndIndex = currentTokenIndex + width;
        if (rowEndIndex > inputTokens.length) {
            throw new Error(`Insufficient tokens: failed to read row ${rowIndex} of matrix. Expected ${width} tokens, but fewer remain.`);
        }
        const rowTokens = inputTokens.slice(rowStartIndex, rowEndIndex);
        matrix.push(keepStrings ? rowTokens : rowTokens.map(Number));
        currentTokenIndex = rowEndIndex; // Update the global token index
    }
    return matrix;
}

/**
 * Creates a one-dimensional array initialized with a specific value.
 * This helper function is specifically tailored for the problem's usage of `xArray` (which was for 1D).
 * For multi-dimensional array creation, a recursive approach would be used instead of `eval`.
 * @param {any} initialValue The value to fill each element of the array with.
 * @param {number} arraySize The desired length of the array. Must be non-negative.
 * @returns {Array<any>} A new array of the specified size, filled with `initialValue`.
 * @throws {Error} If 'arraySize' is negative.
 */
function createInitializedArray(initialValue, arraySize) {
    if (arraySize < 0) {
        throw new Error(`Invalid array size: dimension size cannot be negative, received ${arraySize}.`);
    }
    return Array(arraySize).fill(initialValue);
}

// --- Output Handling Section ---

// An array to buffer output lines before printing them all at once.
const bufferedOutputLines = [];

/**
 * Appends a given content (converted to string) to the output buffer.
 * This allows for collecting multiple output pieces and printing them efficiently.
 * @param {any} content The content to append to the buffer.
 */
function appendToOutputBuffer(content) {
    bufferedOutputLines.push(String(content));
}

// --- Modular Arithmetic Constants and Functions ---

// The modulus used for all modular arithmetic operations.
// Using a numeric separator for readability.
const currentModulus = 1_000_000_007;

/**
 * Performs modular multiplication of an arbitrary number of operands.
 * It safely handles intermediate products using BigInt to prevent overflow before applying the modulus,
 * ensuring correctness even with large numbers that exceed JavaScript's safe integer limit.
 * @param {...number} operands The numbers to be multiplied modulo `currentModulus`.
 * @returns {number} The result of the modular multiplication, normalized to [0, currentModulus - 1].
 */
function multiplyMod(...operands) {
    if (operands.length === 0) {
        return 1; // Multiplicative identity
    }
    let productAccumulator = BigInt(operands[0]);
    for (let i = 1; i < operands.length; i++) {
        productAccumulator = (productAccumulator * BigInt(operands[i])) % BigInt(currentModulus);
    }
    return Number(productAccumulator);
}

// Caches for precomputed factorials and their modular inverses.
// These are useful for efficient calculation of combinations and permutations.
let factorialsCache = [];
let inverseFactorialsCache = [];

/**
 * Precomputes factorials and their modular inverses up to a given maximum value.
 * This function fills `factorialsCache` and `inverseFactorialsCache`.
 * @param {number} maxVal The maximum number for which to compute factorials. Must be non-negative.
 * @throws {Error} If `maxVal` is negative.
 */
function precomputeFactorials(maxVal) {
    if (maxVal < 0) {
        throw new Error(`Invalid maxVal for factorial precomputation: must be non-negative, received ${maxVal}.`);
    }

    factorialsCache.length = maxVal + 1;
    inverseFactorialsCache.length = maxVal + 1;

    // Base cases for factorials
    factorialsCache[0] = 1;
    if (maxVal >= 1) factorialsCache[1] = 1;

    // Compute factorials iteratively
    for (let k = 2; k <= maxVal; k++) {
        factorialsCache[k] = multiplyMod(factorialsCache[k - 1], k);
    }

    // Compute inverse factorial for maxVal using Fermat's Little Theorem (since currentModulus is prime)
    // Then compute others iteratively downwards.
    if (maxVal >= 0) {
        inverseFactorialsCache[maxVal] = modularInverse(factorialsCache[maxVal]);
        inverseFactorialsCache[0] = 1; // 0! inverse is 1

        for (let k = maxVal - 1; k >= 1; k--) {
            // inv(k!) = inv((k+1)!) * (k+1)
            inverseFactorialsCache[k] = multiplyMod(inverseFactorialsCache[k + 1], k + 1);
        }
    }
}

/**
 * Computes the modular multiplicative inverse of a number 'num' modulo `currentModulus`.
 * This implementation uses Fermat's Little Theorem, which is applicable when the modulus is prime.
 * It calculates `num^(currentModulus - 2) % currentModulus`.
 * @param {number} num The number for which to find the modular inverse.
 * @returns {number} The modular inverse of 'num'.
 */
function modularInverse(num) {
    // Ensure num is within [0, currentModulus-1] for modular exponentiation.
    const normalizedNum = normalizeValueModulo(num);
    return modularExponentiation(normalizedNum, currentModulus - 2);
}

/**
 * Computes (base^exponent) % `currentModulus` efficiently using binary exponentiation (exponentiation by squaring).
 * @param {number} base The base of the exponentiation.
 * @param {number} exponent The exponent. Must be non-negative.
 * @returns {number} The result of (base^exponent) % `currentModulus`.
 * @throws {Error} If `exponent` is negative.
 */
function modularExponentiation(base, exponent) {
    if (exponent < 0) {
        throw new Error(`Invalid exponent for modular exponentiation: must be non-negative, received ${exponent}.`);
    }

    let result = 1;
    // Normalize base to be within [0, currentModulus-1] at the start.
    let currentBase = Number(BigInt(base) % BigInt(currentModulus));
    let remainingExponent = exponent;

    while (remainingExponent > 0) {
        // If the current bit of the exponent is 1 (i.e., exponent is odd)
        if (remainingExponent % 2 === 1) {
            result = multiplyMod(result, currentBase);
        }
        // Square the base for the next iteration (effectively processing the next bit)
        currentBase = multiplyMod(currentBase, currentBase);
        // Halve the exponent (integer division)
        remainingExponent = Math.floor(remainingExponent / 2);
    }
    return result;
}

/**
 * Computes the number of combinations (n choose r) modulo `currentModulus`.
 * Requires `factorialsCache` and `inverseFactorialsCache` to be precomputed up to `n`.
 * @param {number} n The total number of items.
 * @param {number} r The number of items to choose.
 * @returns {number} The value of nCr % `currentModulus`. Returns 0 if r is out of bounds.
 */
function combinationsMod(n, r) {
    if (r < 0 || r > n) return 0; // Invalid combination scenario
    // nCr = n! / (r! * (n-r)!) = n! * (r!)^-1 * ((n-r)!)^-1 (mod P)
    return multiplyMod(factorialsCache[n], inverseFactorialsCache[r], inverseFactorialsCache[n - r]);
}

/**
 * Computes the number of permutations (n permute r) modulo `currentModulus`.
 * Requires `factorialsCache` and `inverseFactorialsCache` to be precomputed up to `n`.
 * @param {number} n The total number of items.
 * @param {number} r The number of items to permute.
 * @returns {number} The value of nPr % `currentModulus`. Returns 0 if r is out of bounds.
 */
function permutationsMod(n, r) {
    if (r < 0 || r > n) return 0; // Invalid permutation scenario
    // nPr = n! / (n-r)! = n! * ((n-r)!)^-1 (mod P)
    return multiplyMod(factorialsCache[n], inverseFactorialsCache[n - r]);
}

/**
 * Normalizes a given value to be within the range [0, `currentModulus` - 1].
 * This handles both positive and negative input values correctly.
 * @param {number} value The number to normalize.
 * @returns {number} The normalized value modulo `currentModulus`.
 */
function normalizeValueModulo(value) {
    const bigValue = BigInt(value);
    const bigMod = BigInt(currentModulus);
    // (value % mod + mod) % mod ensures a positive result for negative inputs.
    return Number((bigValue % bigMod + bigMod) % bigMod);
}

// --- Main Application Logic ---

/**
 * Calculates the number of ways to form a `targetSum` using only steps of size 3 or more.
 * This is a dynamic programming problem. `dynamicProgressionArray[k]` stores the number of ways
 * to achieve a sum of `k` using the allowed step sizes.
 * @returns {number} The total number of ways to achieve `targetSum` modulo `currentModulus`.
 */
function calculateCombinations() {
    const targetSum = extractNextInteger();

    // Input validation: Ensure the target sum is a valid non-negative integer.
    if (isNaN(targetSum) || !Number.isInteger(targetSum) || targetSum < 0) {
        console.error(`Error: Invalid or negative target sum provided. Received: ${targetSum}.`);
        return 0; // Return 0 for invalid inputs, or could throw an error.
    }

    // Initialize the DP array. `dynamicProgressionArray[k]` will store ways to make sum `k`.
    // The array size is `targetSum + 1` to accommodate sums from 0 to `targetSum`.
    const dynamicProgressionArray = createInitializedArray(0, targetSum + 1);

    // Base case: There is exactly one way to achieve a sum of 0 (by taking no steps).
    dynamicProgressionArray[0] = 1;

    // Iterate through all possible sums from 0 up to `targetSum - 1`.
    // `currentSum` represents the sum achieved so far.
    for (let currentSum = 0; currentSum < targetSum; ++currentSum) {
        // Optimization: If there are no ways to reach `currentSum`,
        // then no further steps from `currentSum` will lead to new valid paths.
        // Skip this `currentSum` unless it's the base case (sum 0).
        if (dynamicProgressionArray[currentSum] === 0 && currentSum !== 0) {
            continue;
        }

        // Iterate through possible step sizes, starting from 3 (as per problem constraint).
        // The maximum possible step size is `targetSum`.
        for (let stepSize = 3; stepSize <= targetSum; ++stepSize) {
            const nextSum = currentSum + stepSize;

            // Guard: If `nextSum` exceeds `targetSum`, then any larger `stepSize`
            // from `currentSum` will also exceed `targetSum`.
            // Therefore, we can break out of the inner loop and move to the next `currentSum`.
            if (nextSum > targetSum) {
                break;
            }

            // DP transition: The number of ways to reach `nextSum` is increased by
            // the number of ways to reach `currentSum`.
            // This represents taking `stepSize` from `currentSum` to `nextSum`.
            const waysToReachCurrentSum = dynamicProgressionArray[currentSum];
            const currentWaysToReachNextSum = dynamicProgressionArray[nextSum];
            
            // Add the ways and apply modulo immediately to prevent overflow.
            dynamicProgressionArray[nextSum] = normalizeValueModulo(currentWaysToReachNextSum + waysToReachCurrentSum);
        }
    }

    // The final answer is the number of ways stored for the `targetSum`.
    return dynamicProgressionArray[targetSum];
}

// --- Execution Entry Point ---

// Execute the main logic and store its return value.
const finalResult = calculateCombinations();

// If the main logic produced a result, print it to standard output.
if (finalResult !== undefined) {
    console.log(String(finalResult));
}

// If any additional output lines were buffered during execution, print them.
// Each line is joined by a newline character.
if (bufferedOutputLines.length > 0) {
    console.log(bufferedOutputLines.join("\n"));
}