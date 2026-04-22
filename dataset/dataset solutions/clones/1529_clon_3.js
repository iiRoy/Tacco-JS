"use strict";

// Module for handling input/output operations and common mathematical utilities.

// Reads all input from standard input.
const rawInputData = require("fs").readFileSync("/dev/stdin", "utf8");

// Processes input into an array of tokens, removing leading/trailing whitespace
// and splitting by any sequence of whitespace characters.
const inputTokens = rawInputData.trim().split(/\s+/);
let currentTokenIndex = 0; // Pointer to the current token being processed.

/**
 * Retrieves the next token from the input stream and converts it to an integer.
 * @returns {number} The integer value of the next token. Returns NaN if no more tokens.
 */
function getNextInteger() {
    if (currentTokenIndex >= inputTokens.length) {
        // Log a warning if attempting to read beyond the available input tokens.
        console.warn("Input stream exhausted: Attempted to read past end of tokens.");
        return NaN; // Indicate failure to read a valid number.
    }
    const tokenValue = inputTokens[currentTokenIndex++];
    // Use Number() for robust string to number conversion.
    return Number(tokenValue);
}

// Stores output lines to be printed at the end of the script execution.
const collectedOutputLines = [];

/**
 * Appends a string or number to the internal output buffer.
 * Each call adds a new line of content.
 * @param {string | number} contentToOutput The content to append.
 */
function addOutputLine(contentToOutput) {
    collectedOutputLines.push(String(contentToOutput));
}

// A large prime number commonly used in competitive programming for modular arithmetic.
const primeModulus = 1_000_000_007; // 10^9 + 7, using numeric separators for clarity.

/**
 * Performs modular multiplication of multiple numbers, ensuring the result
 * remains within the modulo range and handles potential intermediate overflows
 * for large numbers (up to primeModulus-1).
 *
 * This implementation uses a 16-bit chunking trick to prevent standard JavaScript
 * number multiplication from exceeding MAX_SAFE_INTEGER when dealing with values
 * near `primeModulus` (approx 10^9).
 *
 * @param {...number} factors The numbers to be multiplied modulo `primeModulus`.
 * @returns {number} The product of all factors modulo `primeModulus`.
 */
function performModularMultiplication(...factors) {
    if (factors.length === 0) return 1; // Identity element for multiplication.

    let productAccumulator = 1;
    const MOD_VAL = primeModulus;
    const CHUNK_DIVISOR = 1 << 16; // Represents 2^16.

    for (let i = 0; i < factors.length; i++) {
        let currentFactor = factors[i];
        // Ensure currentFactor is positive and within the modulo range.
        currentFactor = ((currentFactor % MOD_VAL) + MOD_VAL) % MOD_VAL;

        // Apply the 16-bit splitting strategy for safe multiplication:
        // (A * B) % M = ( (A_high * 2^K + A_low) * B ) % M
        //             = ( (A_high * B * 2^K) % M + (A_low * B) % M ) % M
        const accumulatorHighPart = Math.floor(productAccumulator / CHUNK_DIVISOR);
        const accumulatorLowPart = productAccumulator % CHUNK_DIVISOR;

        // Calculate (accumulatorHighPart * currentFactor * CHUNK_DIVISOR) % MOD_VAL
        let termHigh = (accumulatorHighPart * currentFactor);
        termHigh = (termHigh % MOD_VAL * CHUNK_DIVISOR) % MOD_VAL;

        // Calculate (accumulatorLowPart * currentFactor) % MOD_VAL
        let termLow = (accumulatorLowPart * currentFactor) % MOD_VAL;

        // Sum the two terms and take modulo.
        productAccumulator = (termHigh + termLow) % MOD_VAL;
    }
    return productAccumulator;
}

/**
 * Computes (base ^ exponent) % primeModulus using the binary exponentiation
 * (also known as exponentiation by squaring) algorithm.
 * This method is efficient for large exponents.
 *
 * @param {number} base The base number.
 * @param {number} exponent The exponent. Must be a non-negative integer.
 * @returns {number} (base ^ exponent) % primeModulus. Returns NaN if exponent is negative.
 */
function calculateModularPower(base, exponent) {
    // Input validation for the exponent.
    if (exponent < 0 || !Number.isInteger(exponent)) {
        console.error(`Invalid exponent provided (${exponent}): Must be a non-negative integer.`);
        return NaN;
    }

    let resultValue = 1;
    // Normalize the base to be within the modulo range [0, primeModulus-1].
    let currentBase = ((base % primeModulus) + primeModulus) % primeModulus;

    // Binary exponentiation loop.
    while (exponent > 0) {
        // If the current bit of the exponent is 1 (exponent is odd).
        if (exponent % 2 === 1) {
            resultValue = performModularMultiplication(resultValue, currentBase);
        }
        // Square the base for the next iteration (currentBase^2).
        currentBase = performModularMultiplication(currentBase, currentBase);
        // Halve the exponent (integer division).
        exponent = Math.floor(exponent / 2);
    }
    return resultValue;
}

/**
 * Normalizes a number to be within the [0, primeModulus-1] range.
 * This is crucial for correctly handling negative results that might arise
 * from subtraction operations in modular arithmetic.
 *
 * @param {number} value The number to normalize.
 * @returns {number} The normalized value in the range [0, primeModulus-1].
 */
function adjustToPositiveModulo(value) {
    return (value % primeModulus + primeModulus) % primeModulus;
}

// --- Core Problem Solving Logic ---

/**
 * The primary function containing the solution for the given problem.
 * It reads the required input, performs calculations, and returns the final result.
 */
function solveProblem() {
    const N_val = getNextInteger(); // Read the single integer input for the problem.

    // Robust input validation for N_val.
    if (isNaN(N_val) || N_val < 0 || !Number.isInteger(N_val)) {
        console.error(`Error: Input value N (${N_val}) is invalid. It must be a non-negative integer.`);
        // For invalid input, return a default or error-indicating value.
        // Depending on problem constraints, throwing an error might also be appropriate.
        return 0;
    }

    // Calculate the individual terms of the expression (10^N - 9^N - 9^N + 8^N) % Mod.
    // Each term is computed using modular exponentiation.
    const powerOfTen = calculateModularPower(10, N_val);
    const powerOfNine = calculateModularPower(9, N_val);
    const powerOfEight = calculateModularPower(8, N_val);

    // Combine the terms step-by-step, applying modulo and ensuring positive results
    // at each subtraction to correctly handle negative intermediate values.
    let cumulativeCalculation = powerOfTen;
    cumulativeCalculation = adjustToPositiveModulo(cumulativeCalculation - powerOfNine);
    cumulativeCalculation = adjustToPositiveModulo(cumulativeCalculation - powerOfNine); // Subtract 9^N again.
    cumulativeCalculation = adjustToPositiveModulo(cumulativeCalculation + powerOfEight);

    // The final result is already normalized by the last adjustToPositiveModulo call.
    const finalCalculatedAnswer = cumulativeCalculation;

    return finalCalculatedAnswer;
}

// --- Program Execution Entry Point ---

// Execute the main problem-solving function and store its return value.
const programOutputResult = solveProblem();

// If the solution function explicitly returned a value, print it to standard output.
if (programOutputResult !== undefined && !isNaN(programOutputResult)) {
    console.log(String(programOutputResult));
}

// If any additional output lines were buffered during execution (e.g., from addOutputLine),
// print them now, each on a new line.
if (collectedOutputLines.length > 0) {
    console.log(collectedOutputLines.join("\n"));
}