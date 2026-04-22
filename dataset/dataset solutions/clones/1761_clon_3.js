"use strict";

// --- Input/Output Handling Utilities ---
// Standard module for file system operations
const fileSystem = require("fs");
// Read raw input data from standard input path
const rawInputData = fileSystem.readFileSync("/dev/stdin", "utf8");
// Tokenize the input by spaces or newlines, and initialize a pointer
const tokenStream = rawInputData.split(/ |\n/);
let tokenIndex = 0; // Current position in the token stream

/**
 * Reads the next token from the stream and converts it to an integer.
 * @returns {number} The parsed integer.
 */
function readInt() {
    const token = tokenStream[tokenIndex++];
    const parsed = parseInt(token, 10);
    // Add a guard for invalid numbers
    if (isNaN(parsed)) {
        // In a competitive programming context, usually input is guaranteed valid.
        // For robustness, one might throw an error or return a default.
        // console.warn(`Warning: Attempted to parse non-numeric token "${token}" as integer. Returning 0.`);
        return 0; // Return 0 as a fallback
    }
    return parsed;
}

/**
 * Reads the next token from the stream as a string.
 * @returns {string} The next token.
 */
function readString() {
    return tokenStream[tokenIndex++];
}

/**
 * Reads the next token from the stream and converts it to a BigInt.
 * @returns {BigInt} The parsed BigInt.
 */
function readBigInt() {
    return BigInt(tokenStream[tokenIndex++]);
}

/**
 * Reads a specified number of tokens and optionally converts them to numbers.
 * @param {number} count - The number of tokens to read.
 * @param {boolean} [asNumbers=true] - If true, converts tokens to numbers; otherwise, keeps as strings.
 * @returns {Array<number|string>} An array containing the read tokens.
 */
function readTokens(count, asNumbers = true) {
    const startIdx = tokenIndex;
    tokenIndex += count;
    const tokens = tokenStream.slice(startIdx, tokenIndex);

    if (asNumbers) {
        return tokens.map(str => parseInt(str, 10)); // Explicitly use parseInt
    } else {
        return tokens;
    }
}

/**
 * Reads a 2D matrix of specified dimensions from the token stream.
 * @param {number} numRows - The number of rows in the matrix.
 * @param {number} numCols - The number of columns in the matrix.
 * @param {boolean} [asNumbers=true] - If true, converts elements to numbers; otherwise, keeps as strings.
 * @returns {Array<Array<number|string>>} The 2D matrix.
 */
function readInputMatrix(numRows, numCols, asNumbers = true) {
    const matrixData = [];
    for (let rowIdx = 0; rowIdx < numRows; rowIdx++) {
        const rowTokens = tokenStream.slice(tokenIndex, tokenIndex + numCols);
        tokenIndex += numCols;
        if (asNumbers) {
            matrixData.push(rowTokens.map(val => parseInt(val, 10)));
        } else {
            matrixData.push(rowTokens);
        }
    }
    return matrixData;
}

/**
 * Recursively creates a multi-dimensional array initialized with a specific value.
 * This function replaces the `eval`-based `xArray` for safety and clarity.
 * @param {*} initialVal - The value to initialize all elements with.
 * @param {...number} dimensions - The sizes of each dimension, provided as separate arguments.
 * @returns {Array} The multi-dimensional array.
 */
function createMultiDimensionalArray(initialVal, ...dimensions) {
    // Base case: if no more dimensions, return the initial value
    if (dimensions.length === 0) {
        return initialVal;
    }

    const currentDimensionSize = dimensions[0];
    const remainingDimensions = dimensions.slice(1);
    const newArray = new Array(currentDimensionSize);

    // Recursively fill the current dimension
    for (let k = 0; k < currentDimensionSize; k++) {
        newArray[k] = createMultiDimensionalArray(initialVal, ...remainingDimensions);
    }
    return newArray;
}

// --- Modular Arithmetic Constants and Functions ---
// Define the prime modulus for all calculations
const PRIME_MODULUS = 998244353;
// BigInt version of the modulus for BigInt operations, useful for intermediate products
const PRIME_MODULUS_BIGINT = BigInt(PRIME_MODULUS);

/**
 * Performs modular multiplication of multiple numbers.
 * Uses BigInt for intermediate products to prevent overflow before taking modulo,
 * then converts the final result back to a Number.
 * @param {...number} factors - Numbers to multiply.
 * @returns {number} The product modulo PRIME_MODULUS.
 */
function modularMultiply(...factors) {
    let currentProduct = 1n; // Initialize with BigInt 1
    for (const factor of factors) {
        // Ensure each factor is converted to BigInt before multiplication
        currentProduct = (currentProduct * BigInt(factor)) % PRIME_MODULUS_BIGINT;
    }
    return Number(currentProduct); // Convert final result back to Number
}

// Caches for precomputed values used in combinatorics
const factorialCache = [];
const inverseFactorialCache = [];
// Original code had 'invs' and 'pow2' commented out, so they are removed here.

/**
 * Precomputes factorials and inverse factorials up to a given limit.
 * These are stored in global caches for efficient lookup.
 * @param {number} limit - The maximum number for which to precompute factorials.
 */
function precomputeFactorials(limit) {
    // Initialize factorial cache
    factorialCache.length = limit + 1;
    factorialCache[0] = 1;
    factorialCache[1] = 1;
    for (let i = 2; i <= limit; i++) {
        factorialCache[i] = modularMultiply(factorialCache[i - 1], i);
    }

    // Initialize inverse factorial cache
    inverseFactorialCache.length = limit + 1;
    inverseFactorialCache[0] = 1;
    inverseFactorialCache[1] = 1;
    // Calculate inverse factorial of the largest number first using modular inverse function
    inverseFactorialCache[limit] = calculateModularInverse(factorialCache[limit]);
    // Then calculate other inverse factorials iteratively backwards
    for (let i = limit - 1; i >= 2; i--) {
        inverseFactorialCache[i] = modularMultiply(inverseFactorialCache[i + 1], i + 1);
    }
}

/**
 * Calculates the modular multiplicative inverse of 'num' modulo PRIME_MODULUS.
 * This implementation uses the extended Euclidean algorithm.
 * @param {number} num - The number for which to find the inverse.
 * @returns {number} The modular inverse of 'num'.
 */
function calculateModularInverse(num) {
    let currentMod = PRIME_MODULUS;
    let value = num;
    let xPrev = 0;
    let xCurrent = 1;

    // Standard Extended Euclidean Algorithm implementation
    while (value !== 0) {
        const quotient = Math.floor(currentMod / value);
        
        let tempMod = currentMod;
        currentMod = value;
        value = tempMod % value;

        let tempX = xPrev;
        xPrev = xCurrent - quotient * xPrev;
        xCurrent = tempX;
    }
    // Ensure the result is positive and within the modulus range
    xCurrent %= PRIME_MODULUS;
    return xCurrent < 0 ? xCurrent + PRIME_MODULUS : xCurrent;
}

/**
 * Computes modular exponentiation (base^exp % PRIME_MODULUS).
 * Uses the efficient binary exponentiation (exponentiation by squaring) method.
 * @param {number} base - The base number.
 * @param {number} exponent - The exponent.
 * @returns {number} The result of (base^exp) % PRIME_MODULUS.
 */
function modularExponentiation(base, exponent) {
    let result = 1;
    let currentBase = base % PRIME_MODULUS; // Ensure base is within modulus range

    // Loop while exponent is greater than zero
    while (exponent > 0) {
        // If exponent is odd, multiply result by current base
        if (exponent % 2 === 1) {
            result = modularMultiply(result, currentBase);
        }
        // Square the current base for the next iteration
        currentBase = modularMultiply(currentBase, currentBase);
        // Halve the exponent (integer division)
        exponent = Math.floor(exponent / 2);
    }
    return result;
}

/**
 * Calculates "n choose r" (binomial coefficient) modulo PRIME_MODULUS.
 * Requires factorials and inverse factorials to be precomputed via `precomputeFactorials`.
 * @param {number} n - The total number of items.
 * @param {number} r - The number of items to choose.
 * @returns {number} The result of nCr % PRIME_MODULUS. Returns 0 for invalid inputs.
 */
function nChooseR(n, r) {
    // Guard clauses for invalid n, r combinations
    if (r < 0 || r > n) {
        return 0; // Combinations are not possible
    }
    // nCr = n! / (r! * (n-r)!) = n! * (r!)^-1 * ((n-r)!)^-1
    return modularMultiply(factorialCache[n], inverseFactorialCache[r], inverseFactorialCache[n - r]);
}

/**
 * Calculates "n permute r" modulo PRIME_MODULUS.
 * Requires factorials and inverse factorials to be precomputed via `precomputeFactorials`.
 * @param {number} n - The total number of items.
 * @param {number} r - The number of items to permute.
 * @returns {number} The result of nPr % PRIME_MODULUS. Returns 0 for invalid inputs.
 */
function nPermuteR(n, r) {
    // Guard clauses for invalid n, r permutations
    if (r < 0 || r > n) {
        return 0; // Permutations are not possible
    }
    // nPr = n! / (n-r)! = n! * ((n-r)!)^-1
    return modularMultiply(factorialCache[n], inverseFactorialCache[n - r]);
}

/**
 * Normalizes a number to be within the [0, PRIME_MODULUS-1] range.
 * Ensures that even negative results from subtractions wrap around correctly.
 * @param {number} value - The number to normalize.
 * @returns {number} The normalized value modulo PRIME_MODULUS.
 */
function normalizeModulo(value) {
    // Add a check for non-numeric input for robustness
    if (typeof value !== 'number' || isNaN(value)) {
        // console.warn("Warning: Attempted to normalize non-numeric value modulo. Returning 0.");
        return 0; // Default to 0 or throw an error based on strictness
    }
    const remainder = value % PRIME_MODULUS;
    return remainder < 0 ? remainder + PRIME_MODULUS : remainder;
}

// --- Main Program Execution ---
// Execute the primary problem-solving function
const resultOfComputation = executeProblemSolver();

// If the main function returns a defined value, print it to console
if (resultOfComputation !== undefined) {
    console.log(resultOfComputation);
}

/**
 * The main function encapsulating the problem's logic.
 * This function solves a dynamic programming problem related to counting paths on a grid
 * with specific transition rules and modular arithmetic.
 * @returns {number} The final calculated DP value at the target coordinates.
 */
function executeProblemSolver() {
    // Read initial coordinates (startY, startX) and target coordinates (targetY, targetX)
    const [startY, startX, targetY, targetX] = readTokens(4);

    // Initialize a 2D DP array. Dimensions are (targetY+1) by (targetX+1).
    // All elements are initialized to 0, representing no ways to reach those states yet.
    const dpGrid = createMultiDimensionalArray(0, targetY + 1, targetX + 1);

    // Set the base case for the DP: the starting position has 1 way to reach itself.
    // It's assumed that startY and startX are valid non-negative indices within the grid.
    dpGrid[startY][startX] = 1;

    // Iterate through the grid, calculating DP values for each cell (currentY, currentX)
    // The loops start from the initial (startY, startX) position to build up solutions.
    for (let currentY = startY; currentY <= targetY; currentY++) {
        for (let currentX = startX; currentX <= targetX; currentX++) {

            // Skip the base case as its value (1) is already correctly set.
            // This prevents re-calculating or modifying the initial state.
            if (currentY === startY && currentX === startX) {
                continue;
            }

            // Variable to accumulate the contributions from previous states
            let accumulatedValue = 0;

            // Contribution from the cell directly above (currentY-1, currentX)
            // This term is only valid if currentY is greater than the starting Y-coordinate,
            // meaning there's a cell above from which to transition.
            if (currentY > startY) {
                // The formula term is dp[currentY-1][currentX] * currentX
                // This implies that moving from (y-1,x) to (y,x) depends on x.
                accumulatedValue = normalizeModulo(accumulatedValue + modularMultiply(dpGrid[currentY - 1][currentX], currentX));
            }

            // Contribution from the cell directly to the left (currentY, currentX-1)
            // This term is only valid if currentX is greater than the starting X-coordinate,
            // meaning there's a cell to the left from which to transition.
            if (currentX > startX) {
                // The formula term is dp[currentY][currentX-1] * currentY
                // This implies that moving from (y,x-1) to (y,x) depends on y.
                accumulatedValue = normalizeModulo(accumulatedValue + modularMultiply(dpGrid[currentY][currentX - 1], currentY));
            }

            // Subtract the overlapping contribution from the diagonal cell (currentY-1, currentX-1)
            // This term is subtracted because paths from (y-1,x-1) might be double-counted
            // when summing up contributions from (y-1,x) and (y,x-1).
            // It's valid only if both currentY and currentX are greater than their respective start coordinates.
            if (currentY > startY && currentX > startX) {
                // The formula term to subtract is modularMultiply(dp[currentY-1][currentX-1], currentY-1, currentX-1)
                // This corresponds to a specific interaction/overlap from the diagonal state.
                const diagonalOverlapTerm = modularMultiply(dpGrid[currentY - 1][currentX - 1], (currentY - 1), (currentX - 1));
                accumulatedValue = normalizeModulo(accumulatedValue - diagonalOverlapTerm);
            }

            // Assign the final calculated value to the current DP cell after all contributions
            dpGrid[currentY][currentX] = accumulatedValue;
        }
    }

    // The final result is the DP value at the target coordinates, normalized modulo PRIME_MODULUS.
    return normalizeModulo(dpGrid[targetY][targetX]);
}