"use strict";

// --- Input Stream Management ---
// Reads the entire standard input content and tokenizes it.
// All numerical inputs are processed as BigInts for extended precision,
// aligning with the use of BigInt for vector components.
const standardInputContent = require("fs").readFileSync("/dev/stdin", "utf8");
const inputTokenArray = standardInputContent.split(/\s+/); // Splits by any whitespace (spaces, newlines, tabs)
let tokenAccessIndex = 0; // Pointer to the current token in the array

/**
 * Extracts the next token from the input stream and converts it into a BigInt.
 * @returns {BigInt} The parsed numerical value as a BigInt.
 */
function retrieveNextBigInt() {
    return BigInt(inputTokenArray[tokenAccessIndex++]);
}

/**
 * Extracts the next token from the input stream as a string.
 * @returns {string} The raw string token.
 */
function retrieveNextString() {
    return inputTokenArray[tokenAccessIndex++];
}

// Note: Functions for reading multiple numbers or matrices (like `nexts`, `nextm` in original)
// are omitted as they are not utilized by the main problem-solving logic.

// --- Core Mathematical Operations ---
// All modular arithmetic operations are performed using BigInts to prevent overflow
// and ensure consistency with BigInt vector components.
const MODULO_CONSTANT = 1000000007n; // A prime modulus, defined as a BigInt literal

/**
 * Computes the Greatest Common Divisor (GCD) of two BigInts using the Euclidean algorithm.
 * @param {BigInt} numA - The first BigInt.
 * @param {BigInt} numB - The second BigInt.
 * @returns {BigInt} The GCD of numA and numB.
 */
function computeBigIntGCD(numA, numB) {
    while (numB !== 0n) {
        const temporary = numB;
        numB = numA % numB;
        numA = temporary;
    }
    return numA;
}

/**
 * Performs modular multiplication of an arbitrary number of BigInt factors.
 * @param {...BigInt} factors - One or more BigInt numbers to be multiplied.
 * @returns {BigInt} The product of factors, modulo MODULO_CONSTANT.
 */
function performModularMultiplication(...factors) {
    if (factors.length === 0) return 1n; // Multiplicative identity
    let currentProduct = 1n;
    for (const factor of factors) {
        currentProduct = (currentProduct * factor) % MODULO_CONSTANT;
    }
    return currentProduct;
}

/**
 * Calculates modular exponentiation (base^exponent % MODULO_CONSTANT) for BigInts.
 * Implements the exponentiation by squaring algorithm.
 * @param {BigInt} baseValue - The base BigInt.
 * @param {BigInt} exponentValue - The exponent BigInt.
 * @returns {BigInt} (baseValue^exponentValue) % MODULO_CONSTANT.
 */
function calculateModularPower(baseValue, exponentValue) {
    let resultAccumulator = 1n;
    // Normalize base to be within [0, MODULO_CONSTANT - 1]
    let currentBase = baseValue % MODULO_CONSTANT;
    if (currentBase < 0n) currentBase += MODULO_CONSTANT;

    let currentExponent = exponentValue;

    while (currentExponent > 0n) {
        if (currentExponent % 2n === 1n) { // If exponent is odd
            resultAccumulator = (resultAccumulator * currentBase) % MODULO_CONSTANT;
        }
        currentBase = (currentBase * currentBase) % MODULO_CONSTANT; // Square the base
        currentExponent /= 2n; // Halve the exponent
    }
    return resultAccumulator;
}

/**
 * Normalizes a BigInt value to be within the range [0, MODULO_CONSTANT - 1].
 * Handles potentially negative results from the modulo operator.
 * @param {BigInt} value - The BigInt to normalize.
 * @returns {BigInt} The normalized BigInt.
 */
function normalizeToModuloRange(value) {
    return (value % MODULO_CONSTANT + MODULO_CONSTANT) % MODULO_CONSTANT;
}

// --- Main Program Logic Execution ---
// The program's entry point, which calls the primary problem-solving function.
const finalComputedResult = executeSolutionLogic();

// Outputs the result to the console, ensuring BigInts are converted to strings.
if (finalComputedResult !== undefined) {
    console.log(finalComputedResult.toString());
}

/**
 * Contains the main algorithm for solving the problem.
 * @returns {BigInt} The final calculated answer.
 */
function executeSolutionLogic() {
    const totalVectorCount = retrieveNextBigInt();

    let countZeroXNonZeroY = 0n; // Counts vectors (0, Y) where Y != 0
    let countNonZeroXZeroY = 0n; // Counts vectors (X, 0) where X != 0
    let countZeroZeroVectors = 0n; // Counts vectors (0, 0)

    // A Map to store counts of normalized vector components.
    // Outer Map Key: String representation of the X component (BigInt).
    // Inner Map Key: String representation of the Y component (BigInt).
    // Value: The number of times this normalized vector (X, Y) appeared.
    const normalizedVectorCounts = new Map();

    // An array to keep track of unique (X, Y) vector representations
    // (using BigInts, not strings, for convenience in later calculations).
    const distinctNormalizedVectors = [];

    // Iterate through all input vectors to categorize and normalize them.
    for (let currentIteration = 0; currentIteration < totalVectorCount; ++currentIteration) {
        let currentVectorX = retrieveNextBigInt();
        let currentVectorY = retrieveNextBigInt();

        // Handle special cases for vectors with zero components.
        if (currentVectorX === 0n && currentVectorY === 0n) {
            countZeroZeroVectors++;
            continue; // Skip further processing for (0,0) vectors
        }
        if (currentVectorX === 0n) { // Vector is (0, Y) with Y != 0
            countZeroXNonZeroY++;
            continue;
        }
        if (currentVectorY === 0n) { // Vector is (X, 0) with X != 0
            countNonZeroXZeroY++;
            continue;
        }

        // For non-zero, non-axis-aligned vectors, normalize by their GCD.
        const greatestCommonDivisor = computeBigIntGCD(currentVectorX, currentVectorY);
        currentVectorX /= greatestCommonDivisor;
        currentVectorY /= greatestCommonDivisor;

        // Establish a canonical representation for each vector:
        // Ensure the X component is positive. If X is 0 (already handled), Y would be positive.
        // If X is negative, negate both X and Y. This ensures consistency for storing and looking up.
        if (currentVectorX < 0n) {
            currentVectorX = -currentVectorX;
            currentVectorY = -currentVectorY;
        }

        // Use string representations of BigInts as keys for the Maps.
        const xComponentStr = currentVectorX.toString();
        const yComponentStr = currentVectorY.toString();

        // Store the normalized vector and its count.
        if (!normalizedVectorCounts.has(xComponentStr)) {
            normalizedVectorCounts.set(xComponentStr, new Map());
        }
        const innerComponentMap = normalizedVectorCounts.get(xComponentStr);

        if (!innerComponentMap.has(yComponentStr)) {
            innerComponentMap.set(yComponentStr, 1); // First time seeing this normalized vector
            distinctNormalizedVectors.push({ x: currentVectorX, y: currentVectorY }); // Store BigInts for later use
        } else {
            innerComponentMap.set(yComponentStr, innerComponentMap.get(yComponentStr) + 1); // Increment count
        }
    }

    // Initialize the overall answer by considering axis-aligned vectors.
    // These include subsets composed purely of (0,Y) vectors OR purely of (X,0) vectors.
    // The formula (2^countZeroXNonZeroY + 2^countNonZeroXZeroY - 1) accounts for this,
    // including the empty set once.
    let totalValidSubsets = normalizeToModuloRange(
        calculateModularPower(2n, countZeroXNonZeroY) +
        calculateModularPower(2n, countNonZeroXZeroY) - 1n
    );

    // Process unique non-axis-aligned vectors to combine contributions from orthogonal pairs.
    // Each pair (V, V_ortho) contributes (2^count_V + 2^count_V_ortho - 1) to the product.
    // If V_ortho doesn't exist, contribution is (2^count_V).
    for (const { x: currentX, y: currentY } of distinctNormalizedVectors) {
        // Determine the canonical form of the orthogonal vector (-Y, X).
        let orthoCanonicalX = -currentY;
        let orthoCanonicalY = currentX;

        // Apply the same normalization rule (X component positive) for the orthogonal vector.
        if (orthoCanonicalX < 0n) {
            orthoCanonicalX = -orthoCanonicalX;
            orthoCanonicalY = -orthoCanonicalY;
        }

        const currentXStr = currentX.toString();
        const currentYStr = currentY.toString();
        const orthoXStr = orthoCanonicalX.toString();
        const orthoYStr = orthoCanonicalY.toString();

        // Skip processing if this vector is the "non-canonical" part of an orthogonal pair
        // that will be handled when its canonical counterpart is iterated.
        // This ensures each orthogonal pair is processed exactly once.
        // A vector (currentX, currentY) is "non-canonical" if currentY < 0n AND its orthogonal (orthoCanonicalX, orthoCanonicalY) exists
        // (because orthoCanonicalX will be positive, and its Y component might be positive too, making it canonical).
        if (currentY < 0n &&
            normalizedVectorCounts.has(orthoXStr) &&
            normalizedVectorCounts.get(orthoXStr).has(orthoYStr)) {
            continue; // This pair will be processed when the canonical orthogonal vector is encountered
        }

        const countOfCurrentVector = BigInt(normalizedVectorCounts.get(currentXStr).get(currentYStr));
        let countOfOrthogonalVector = 0n;

        // Check if the orthogonal counterpart exists.
        if (normalizedVectorCounts.has(orthoXStr)) {
            const innerOrthoMap = normalizedVectorCounts.get(orthoXStr);
            if (innerOrthoMap.has(orthoYStr)) {
                countOfOrthogonalVector = BigInt(innerOrthoMap.get(orthoYStr));
            }
        }

        let currentGroupContribution;
        if (countOfOrthogonalVector > 0n) {
            // If an orthogonal vector exists, combine their contributions: (2^count_current + 2^count_ortho - 1)
            const termForCurrent = calculateModularPower(2n, countOfCurrentVector);
            const termForOrthogonal = calculateModularPower(2n, countOfOrthogonalVector);
            currentGroupContribution = normalizeToModuloRange(termForCurrent + termForOrthogonal - 1n);
        } else {
            // No orthogonal counterpart, so only the current vector's contribution: (2^count_current)
            currentGroupContribution = calculateModularPower(2n, countOfCurrentVector);
        }
        
        totalValidSubsets = performModularMultiplication(totalValidSubsets, currentGroupContribution);
    }

    // The final answer needs to adjust for the empty set (subtracted once) and add contributions from (0,0) vectors.
    // The `totalValidSubsets` currently includes the empty set (as part of the `+2^az +2^bz -1` terms).
    // We subtract 1 to remove the empty set. Each (0,0) vector can form a valid subset on its own,
    // or be added to any other valid subset without violating the orthogonality rule.
    // The problem context implies `+ countZeroZeroVectors` means `countZeroZeroVectors` additional distinct valid subsets,
    // e.g., `{(0,0)}`, `{(0,0), (0,0)}` etc are not distinct. It means `{(0,0)}` is a valid subset.
    // A single (0,0) vector itself is a valid subset. If there are `N` (0,0) vectors, there are `N` ways to pick just one (0,0) vector as a subset.
    // Or it means these `N` (0,0) vectors can be freely chosen, leading to `2^N` possibilities.
    // The original `ans-1+z` structure is typical for: (total non-empty choices from non-zero vectors) + (number of (0,0) vectors).
    return normalizeToModuloRange(totalValidSubsets - 1n + countZeroZeroVectors);
}