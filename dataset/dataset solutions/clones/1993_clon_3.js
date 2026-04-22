const { readFileSync: retrieveFileContent } = require('node:fs'); // Use named import for clarity and modern Node.js paths

// --- Global Configuration and Input Processing Utilities ---

// Define the prime modulus for all modular arithmetic operations.
const PRIME_MODULUS = 1_000_000_007;

// Read the entire standard input content.
let rawInputData = retrieveFileContent("/dev/stdin", "utf8");
// Split the raw input string by any sequence of whitespace characters
// and filter out any empty strings that might result from multiple spaces.
let processedTokens = rawInputData.split(/\s+/).filter(Boolean);
// Initialize a cursor to keep track of the current position in the token array.
let tokenCursor = 0;

/**
 * Extracts the next token from the processed input stream.
 * @param {boolean} [asString=false] - If true, returns the token as a string; otherwise, as a number.
 * @returns {string|number} The next token from the input.
 */
function extractNextToken(asString = false) {
    // Retrieve the token at the current cursor position and then advance the cursor.
    let currentToken = processedTokens[tokenCursor++];
    return asString ? currentToken : Number(currentToken);
}

/**
 * Extracts a specified number of tokens as a list (array).
 * @param {number} count - The number of tokens to extract.
 * @param {boolean} [asStrings=false] - If true, returns tokens as strings; otherwise, as numbers.
 * @returns {Array<string|number>} An array containing the extracted tokens.
 */
function extractTokenList(count, asStrings = false) {
    // Slice the array to get the required number of tokens starting from the cursor.
    let segment = processedTokens.slice(tokenCursor, tokenCursor + count);
    // Advance the cursor by the number of tokens extracted.
    tokenCursor += count;
    return asStrings ? segment : segment.map(Number);
}

/**
 * Extracts a 2D matrix (grid) of tokens.
 * @param {number} rows - The number of rows in the matrix.
 * @param {number} cols - The number of columns in the matrix.
 * @param {boolean} [asStrings=false] - If true, returns tokens as strings; otherwise, as numbers.
 * @returns {Array<Array<string|number>>} A 2D array representing the matrix.
 */
function extractMatrix(rows, cols, asStrings = false) {
    let matrixData = [];
    for (let rowIdx = 0; rowIdx < rows; rowIdx++) {
        // For each row, extract a list of 'cols' tokens.
        matrixData.push(extractTokenList(cols, asStrings));
    }
    return matrixData;
}

/**
 * Recursively creates a multi-dimensional array initialized with a specific value.
 * This function serves as a replacement for the original's `xArray` which used `eval`.
 * @param {*} initialValue - The value to initialize all elements with.
 * @param {...number} dimensions - The dimensions of the array (e.g., `initializeMultiDimArray(0, 2, 3)` for a 2x3 array of zeros).
 * @returns {Array} The multi-dimensional array.
 */
function initializeMultiDimArray(initialValue, ...dimensions) {
    if (dimensions.length === 0) {
        return initialValue; // Base case: deepest dimension returns the initial value
    }
    const currentDimSize = dimensions[0];
    const remainingDimensions = dimensions.slice(1);

    // Create an array for the current dimension, filling it by recursively calling itself
    return Array.from({ length: currentDimSize }, () =>
        initializeMultiDimArray(initialValue, ...remainingDimensions)
    );
}

// --- Modular Arithmetic Helpers ---

/**
 * Ensures a number is within the positive range [0, PRIME_MODULUS - 1].
 * This handles negative results from modulo operations in JavaScript.
 * @param {number} val - The value to normalize.
 * @returns {number} The normalized value.
 */
function normalizeModulo(val) {
    return (val % PRIME_MODULUS + PRIME_MODULUS) % PRIME_MODULUS;
}

/**
 * Performs modular addition for two values.
 * @param {number} val1 - The first operand.
 * @param {number} val2 - The second operand.
 * @returns {number} The modular sum (val1 + val2) % PRIME_MODULUS.
 */
function addMod(val1, val2) {
    return normalizeModulo(val1 + val2);
}

/**
 * Calculates the modular product of multiple values.
 * @param {...number} values - The numbers to multiply.
 * @returns {number} The product of all values modulo PRIME_MODULUS.
 */
function calculateModularProduct(...values) {
    let currentProduct = 1;
    for (const val of values) {
        currentProduct = normalizeModulo(currentProduct * val);
    }
    return currentProduct;
}

/**
 * Performs modular exponentiation (base^exponent % PRIME_MODULUS) using binary exponentiation.
 * @param {number} base - The base value.
 * @param {number} exponent - The exponent.
 * @returns {number} The result of base^exponent modulo PRIME_MODULUS.
 */
function calculateModularPower(base, exponent) {
    let result = 1;
    let baseValue = normalizeModulo(base); // Ensure base is within modulus initially

    while (exponent > 0) {
        if (exponent % 2 === 1) { // If exponent is odd
            result = calculateModularProduct(result, baseValue);
        }
        baseValue = calculateModularProduct(baseValue, baseValue); // Square the base
        exponent = Math.floor(exponent / 2); // Halve the exponent
    }
    return result;
}

// --- Main Problem Solving Logic ---

/**
 * The primary function to solve the problem.
 * It calculates a sum based on modular exponentiation and inclusion-exclusion principles.
 * @returns {number} The final calculated result modulo PRIME_MODULUS.
 */
function solveProblem() {
    // Read the two essential problem parameters: N and K.
    const problemN = extractNextToken();
    const problemK = extractNextToken();

    // Initialize an array to store calculated contributions for each divisor.
    // `initializeMultiDimArray(0, problemK + 1)` creates a 1D array of size `problemK + 1` filled with zeros.
    let divisorContributions = initializeMultiDimArray(0, problemK + 1);

    // The final accumulated result, initialized with the upper bound K.
    let totalAccumulatedSum = problemK;

    // Base case: The contribution for the largest divisor (K itself) is 1.
    divisorContributions[problemK] = 1;

    // Iterate downwards from K-1 to 1 to calculate contributions for each divisor.
    // This loop structure is an alternative to the original 'for' loop.
    let currentDivisor = problemK - 1;
    while (currentDivisor > 0) {
        // Calculate (K / currentDivisor)^N mod PRIME_MODULUS.
        // Using Math.floor for integer division, equivalent to bitwise OR 0 (`| 0`).
        let baseValue = Math.floor(problemK / currentDivisor);
        divisorContributions[currentDivisor] = calculateModularPower(baseValue, problemN);

        // Apply the inclusion-exclusion principle:
        // Subtract contributions from multiples of the current divisor.
        // This is a standard step in number theory problems like Mobius inversion.
        // Rewriting the inner loop with 'while' and explicit increment.
        let multiple = currentDivisor * 2;
        while (multiple <= problemK) {
            // Subtracting `divisorContributions[multiple]` is equivalent to adding `-divisorContributions[multiple]` modulo `PRIME_MODULUS`.
            divisorContributions[currentDivisor] = addMod(divisorContributions[currentDivisor], -divisorContributions[multiple]);
            multiple += currentDivisor;
        }

        // Ensure the contribution remains positive and within the modulus after subtractions.
        divisorContributions[currentDivisor] = normalizeModulo(divisorContributions[currentDivisor]);

        // Add the current divisor's contribution multiplied by itself to the total sum.
        // All additions and multiplications are performed modulo PRIME_MODULUS.
        totalAccumulatedSum = addMod(totalAccumulatedSum, calculateModularProduct(divisorContributions[currentDivisor], currentDivisor));

        // Move to the next smaller divisor.
        currentDivisor--;
    }

    // Ensure the final result is also within the modulus before returning.
    return normalizeModulo(totalAccumulatedSum);
}

// --- Execution Block ---

// Execute the primary solution function.
const solutionOutput = solveProblem();

// Output the result to the console, but only if a defined value is returned.
// This acts as a simple guard clause.
if (solutionOutput !== undefined) {
    console.log(solutionOutput);
}