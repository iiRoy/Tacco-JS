"use strict";

// --- Input Processing Module ---
// Reads raw input data from the standard input stream.
const rawInputData = require("fs").readFileSync("/dev/stdin", "utf8");

// Splits the raw input string into an array of tokens using any whitespace as a delimiter.
let tokenStream = rawInputData.split(/\s+/);
// Maintains the current position within the token stream.
let tokenIndex = 0;

/**
 * Extracts and parses the next available token from the stream as an integer.
 * Advances the token stream index.
 * @returns {number} The parsed integer value.
 * @throws {Error} If an attempt is made to read beyond the end of the input stream.
 */
function extractNextInteger() {
    // Implement a robust check to ensure there are tokens left to process.
    if (tokenIndex >= tokenStream.length || tokenStream[tokenIndex] === "") {
        throw new Error("Input stream exhausted or encountered an empty token at index " + tokenIndex);
    }
    const currentToken = tokenStream[tokenIndex++];
    // The unary plus operator is used for concise string-to-number conversion.
    return +currentToken;
}

// Note: The original code contained several other input utility functions
// (e.g., nextstr, nextbig, nexts, nextssort, nextm, xArray).
// For a Type III clone, unused functionality can be removed to demonstrate
// "deletion of some parts of the code" and simplify the module,
// as only 'next()' (now 'extractNextInteger()') was utilized by 'main'.

// --- Output Management System ---
// An internal buffer to accumulate all lines of output before final display.
const outputMessageBuffer = [];

/**
 * Adds a given piece of content to the output buffer.
 * The content is converted to a string before being stored.
 * @param {any} contentToAppend The data to be added to the output.
 */
function recordOutputLine(contentToAppend) {
    outputMessageBuffer.push(String(contentToAppend));
}

// --- Program Execution Flow ---
// A variable to hold the primary result returned by the problem-solving function.
let primarySolutionResult;

// Attempt to execute the main problem logic within a robust error handling block.
try {
    primarySolutionResult = computeProblemSolution();
} catch (executionError) {
    // If an error occurs, capture its message and add it to the output buffer.
    recordOutputLine(`An unexpected error occurred during computation: ${executionError.message}`);
    // Optionally, rethrow the error for further debugging or higher-level handling.
    // throw executionError;
}

// Display the primary result if it was successfully computed and is not undefined or null.
if (primarySolutionResult !== undefined && primarySolutionResult !== null) {
    console.log(String(primarySolutionResult));
}

// If there are any buffered output messages, join them with newlines and print them.
if (outputMessageBuffer.length > 0) {
    console.log(outputMessageBuffer.join("\n"));
}

// --- Mathematical Utility Functions ---

/**
 * Implements the Extended Euclidean Algorithm. It finds integers 'p' and 'q' for
 * a given pair of numbers 'a' and 'b' such that `p*a + q*b = gcd(a, b)`.
 * It also returns the greatest common divisor (gcd) of 'a' and 'b'.
 * Handles potentially negative inputs by taking their absolute values.
 * @param {number} valueA The first integer.
 * @param {number} valueB The second integer.
 * @returns {[number, number, number]} An array containing [p, q, gcd(a, b)].
 */
function performExtendedEuclideanAlgorithm(valueA, valueB) {
    // For consistency with GCD definition, operate on absolute values.
    // This is an added robustness for Type III.
    valueA = Math.abs(valueA);
    valueB = Math.abs(valueB);

    // Initialize coefficients and values using BigInt to prevent potential
    // integer overflow during intermediate calculations for large numbers.
    let currentCoeffP = 0n;
    let previousCoeffP = 1n;
    let currentCoeffQ = 1n;
    let previousCoeffQ = 0n;

    let currentValA = BigInt(valueA);
    let currentValB = BigInt(valueB);

    // The core loop of the Euclidean algorithm.
    while (currentValB !== 0n) {
        const divisionQuotient = currentValA / currentValB;
        const divisionRemainder = currentValA % currentValB;

        // Calculate the next set of coefficients.
        const nextCoeffP = previousCoeffP - divisionQuotient * currentCoeffP;
        const nextCoeffQ = previousCoeffQ - divisionQuotient * currentCoeffQ;

        // Update values for the next iteration.
        currentValA = currentValB;
        currentValB = divisionRemainder;

        // Shift coefficients.
        previousCoeffP = currentCoeffP;
        currentCoeffP = nextCoeffP;

        previousCoeffQ = currentCoeffQ;
        currentCoeffQ = nextCoeffQ;
    }

    // Convert the BigInt results back to standard JavaScript Numbers before returning.
    // The GCD is `currentValA` (which was the last non-zero remainder),
    // and the corresponding coefficients are `previousCoeffP` and `previousCoeffQ`.
    return [Number(previousCoeffP), Number(previousCoeffQ), Number(currentValA)];
}

/**
 * Computes a specific linear combination value based on two input terms.
 * This function is designed to work with the results of the Extended Euclidean Algorithm,
 * typically in search of a minimum value under certain conditions.
 * @param {number} termOne The first numeric term.
 * @param {number} termTwo The second numeric term.
 * @returns {number} The calculated result, or `Number.MAX_SAFE_INTEGER` if the terms are not coprime
 *                   or if coefficients do not meet specific sign criteria.
 */
function evaluateLinearCombination(termOne, termTwo) {
    // Guard against non-positive inputs if the problem context implies positive terms.
    if (termOne <= 0 || termTwo <= 0) {
        // Return a sentinel value or throw an error for invalid inputs.
        return Number.MAX_SAFE_INTEGER;
    }

    // Obtain the coefficients and GCD using the extended Euclidean algorithm.
    const coefficientsAndGcd = performExtendedEuclideanAlgorithm(termOne, termTwo);
    const coefficientP = coefficientsAndGGcd[0];
    const coefficientQ = coefficientsAndGcd[1];
    const greatestCommonDivisor = coefficientsAndGcd[2];

    // If the greatest common divisor is greater than 1, 'termOne' and 'termTwo' are not coprime.
    // In many problem contexts, this indicates an invalid path or an unreachable state for minimization.
    if (greatestCommonDivisor > 1) {
        // Return a very large number as a sentinel to signify an "infinite" cost.
        return Number.MAX_SAFE_INTEGER;
    }

    // The problem's logic seeks a specific type of linear combination.
    // If 'coefficientP' is negative, calculate `(-coefficientP * termOne)`.
    // This effectively computes `|coefficientP * termOne|` for negative 'coefficientP'.
    if (coefficientP < 0) {
        return -coefficientP * termOne;
    }
    // If 'coefficientQ' is negative, calculate `(-coefficientQ * termTwo)`.
    // This computes `|coefficientQ * termTwo|` for negative 'coefficientQ'.
    else if (coefficientQ < 0) {
        return -coefficientQ * termTwo;
    }
    // If both coefficients are non-negative, this state might not yield the desired minimum
    // or is not relevant to the problem's objective, so return the sentinel value.
    return Number.MAX_SAFE_INTEGER;
}

// --- Main Problem-Solving Function ---

/**
 * The primary function that orchestrates the solution to the problem.
 * It reads an integer, decomposes it, and then iterates through factors
 * to find a minimum value using an extended Euclidean algorithm-based calculation.
 * @returns {number} The final computed minimum value.
 */
function computeProblemSolution() {
    // Read the initial integer input for the problem.
    const initialInputNumber = extractNextInteger();

    // Comprehensive input validation for Type III.
    // Ensures the input is a valid positive integer.
    if (typeof initialInputNumber !== 'number' || !Number.isInteger(initialInputNumber) || initialInputNumber <= 0) {
        recordOutputLine(`Error: Provided input '${initialInputNumber}' is not a valid positive integer.`);
        // Return a specific error code or throw an exception for invalid input.
        return -1; // Indicating an error state.
    }

    // Handle the base case as specified by the problem.
    if (initialInputNumber === 1) {
        return 1;
    }

    // Decompose `initialInputNumber` into an odd factor and a power-of-two factor.
    // The structure is `initialInputNumber = oddComponent * (powerOfTwoComponent / 2)`.
    let oddComponent = initialInputNumber;
    let powerOfTwoComponent = 2; // Starts as 2^1

    // Repeatedly divide `oddComponent` by 2 and multiply `powerOfTwoComponent` by 2
    // until `oddComponent` becomes an odd number.
    // Using bitwise operators for efficient division and multiplication by 2.
    while ((oddComponent & 1) === 0) { // Check if `oddComponent` is even.
        oddComponent >>= 1;          // Equivalent to `oddComponent = oddComponent / 2;`
        powerOfTwoComponent <<= 1;   // Equivalent to `powerOfTwoComponent = powerOfTwoComponent * 2;`
    }

    // Initialize the variable that will store the minimum sum found.
    // A sensible initial upper bound is `(initialInputNumber * 2) - 1`, based on problem constraints.
    let minimumSumFound = (initialInputNumber * 2) - 1;

    // To optimize the loop condition, pre-calculate the square root of `oddComponent`.
    const limitForDivisors = Math.sqrt(oddComponent);

    // Iterate through potential odd divisors of `oddComponent`.
    // The loop starts from 1 and increments by 2 because `oddComponent` is guaranteed to be odd.
    for (let currentDivisor = 1; currentDivisor * currentDivisor <= oddComponent; currentDivisor += 2) {
        // If `currentDivisor` is not a divisor of `oddComponent`, skip to the next iteration.
        if (oddComponent % currentDivisor !== 0) {
            continue;
        }

        // If `currentDivisor` is a divisor, `complementaryDivisor` is the other divisor.
        const complementaryDivisor = oddComponent / currentDivisor;

        // Calculate two possible values using the `evaluateLinearCombination` function.
        // These correspond to the permutations `(u, i*x2)` and `(u*x2, i)` from the original problem.
        const resultA = evaluateLinearCombination(complementaryDivisor, currentDivisor * powerOfTwoComponent);
        const resultB = evaluateLinearCombination(complementaryDivisor * powerOfTwoComponent, currentDivisor);

        // Update `minimumSumFound` with the smallest value obtained.
        // Instead of `Math.min()`, explicit `if` statements are used for Type III variation.
        if (resultA < minimumSumFound) {
            minimumSumFound = resultA;
        }
        if (resultB < minimumSumFound) {
            minimumSumFound = resultB;
        }
    }

    // Return the overall minimum sum determined.
    return minimumSumFound;
}