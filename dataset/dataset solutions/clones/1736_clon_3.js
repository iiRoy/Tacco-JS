"use strict";

// --- Input Processing Utilities ---

// Raw input string obtained from standard input.
const rawInputData = require("fs").readFileSync("/dev/stdin", "utf8");

// A stream of tokens derived from the raw input, split by whitespace (spaces or newlines).
const inputTokenStream = rawInputData.split(/ |\n/);

// Pointer to the current token being processed in the inputTokenStream.
let currentTokenIndex = 0;

/**
 * Retrieves the next token from the input stream and parses it as an integer.
 * Advances the token pointer after reading.
 * @returns {number} The parsed integer value.
 */
function readNextInteger() {
    // Convert the current token to a Number type.
    const numericValue = Number(inputTokenStream[currentTokenIndex]);
    // Move to the next token for subsequent reads.
    currentTokenIndex++;
    return numericValue;
}

/**
 * Retrieves the next token from the input stream as a string.
 * Advances the token pointer after reading.
 * @returns {string} The raw string token.
 */
function readNextString() {
    // Fetch the current token as a string.
    const stringValue = inputTokenStream[currentTokenIndex];
    // Move to the next token.
    currentTokenIndex++;
    return stringValue;
}

/**
 * Retrieves the next token from the input stream and parses it as a BigInt.
 * Advances the token pointer after reading.
 * @returns {BigInt} The parsed BigInt value.
 */
function readNextBigInt() {
    // Convert the current token to a BigInt type.
    const bigIntValue = BigInt(inputTokenStream[currentTokenIndex]);
    // Move to the next token.
    currentTokenIndex++;
    return bigIntValue;
}

/**
 * Reads a specified number of tokens from the input stream, optionally converting them to numbers.
 * The token pointer is advanced by 'elementCount'.
 * @param {number} elementCount - The total number of tokens to read for the array.
 * @param {boolean} [shouldConvertToNumbers=true] - If true, converts each token to a number; otherwise, keeps them as strings.
 * @returns {Array<number|string>} An array containing the parsed elements.
 */
function readArrayOfTokens(elementCount, shouldConvertToNumbers = true) {
    const startSliceIndex = currentTokenIndex;
    // Update the global token index to reflect the tokens consumed.
    currentTokenIndex += elementCount;
    // Extract the relevant segment of the input stream.
    const segmentOfTokens = inputTokenStream.slice(startSliceIndex, currentTokenIndex);
    // Map to numbers if requested, otherwise return strings.
    return shouldConvertToNumbers ? segmentOfTokens.map(Number) : segmentOfTokens;
}

/**
 * Reads a 2D matrix of tokens from the input stream.
 * The token pointer is advanced accordingly.
 * @param {number} numRows - The number of rows in the matrix.
 * @param {number} numCols - The number of columns in each row.
 * @param {boolean} [shouldConvertToNumbers=true] - If true, converts tokens to numbers; otherwise, keeps them as strings.
 * @returns {Array<Array<number|string>>} A 2D array representing the matrix.
 */
function readMatrixOfTokens(numRows, numCols, shouldConvertToNumbers = true) {
    const parsedMatrix = [];
    for (let rowIndex = 0; rowIndex < numRows; rowIndex++) {
        const startRowIndex = currentTokenIndex;
        // Advance the token index for the current row.
        currentTokenIndex += numCols;
        const rowTokens = inputTokenStream.slice(startRowIndex, currentTokenIndex);
        // Process the current row.
        parsedMatrix.push(shouldConvertToNumbers ? rowTokens.map(Number) : rowTokens);
    }
    return parsedMatrix;
}

// --- Modular Arithmetic & Combinatorics Utilities ---

// The global modulus value used for all modular arithmetic operations.
const currentModulus = 1_000_000_007; // Standard prime modulus in competitive programming.

/**
 * Performs modular multiplication for a variable number of BigInt arguments.
 * Ensures the result stays within the bounds of `currentModulus`.
 * @param {...BigInt} factors - A spread of BigInt numbers to be multiplied.
 * @returns {BigInt} The product of all factors modulo `currentModulus`.
 */
function multiplyModular(...factors) {
    if (factors.length === 0) {
        return 1n; // Multiplicative identity.
    }
    const bigMod = BigInt(currentModulus);
    let cumulativeProduct = 1n;

    for (let i = 0; i < factors.length; ++i) {
        let currentFactor = factors[i];
        // Ensure each factor is positive and within the modulus before multiplication.
        currentFactor = (currentFactor % bigMod + bigMod) % bigMod;
        cumulativeProduct = (cumulativeProduct * currentFactor) % bigMod;
    }
    return cumulativeProduct;
}

// Arrays to cache precomputed factorial values (n!) and their modular inverses ((n!)^-1).
const factorialValues = [];
const inverseFactorialValues = [];

/**
 * Precomputes and caches factorial and inverse factorial values up to a given maximum `limitN`.
 * This function must be called before using `nChooseKModular` or `nPermuteKModular`.
 * @param {number} limitN - The upper bound for precomputation.
 */
function setupFactorialPrecomputation(limitN) {
    // Resize arrays to accommodate values up to limitN.
    factorialValues.length = limitN + 1;
    inverseFactorialValues.length = limitN + 1;

    // Base cases for factorials: 0! = 1, 1! = 1.
    factorialValues[0] = 1n;
    factorialValues[1] = 1n;

    // Compute factorials iteratively from 2 up to limitN.
    for (let i = 2; i <= limitN; ++i) {
        factorialValues[i] = multiplyModular(factorialValues[i - 1], BigInt(i));
    }

    // Base cases for inverse factorials: (0!)^-1 = 1, (1!)^-1 = 1.
    inverseFactorialValues[0] = 1n;
    inverseFactorialValues[1] = 1n;

    // Compute the modular inverse of the largest factorial (limitN!) using Fermat's Little Theorem or Extended Euclidean Algorithm.
    inverseFactorialValues[limitN] = calculateModularInverse(factorialValues[limitN]);

    // Compute inverse factorials iteratively downwards.
    // (i-1)!^-1 = (i!)^-1 * i (mod M)
    for (let i = limitN; i > 1; --i) {
        inverseFactorialValues[i - 1] = multiplyModular(inverseFactorialValues[i], BigInt(i));
    }
}

/**
 * Calculates the modular multiplicative inverse of a BigInt `valueToInvert` modulo `currentModulus`.
 * Uses the Extended Euclidean Algorithm.
 * @param {BigInt} valueToInvert - The BigInt for which to find the inverse.
 * @returns {BigInt} The modular inverse of `valueToInvert`.
 * @throws {Error} If `valueToInvert` is 0 or not coprime to `currentModulus`.
 */
function calculateModularInverse(valueToInvert) {
    let a = BigInt(currentModulus);
    let b = valueToInvert;
    let x0 = 0n, x1 = 1n; // Coefficients for 'b' in the Bezout's identity

    // Ensure 'b' is positive and within the modulus range.
    b = (b % a + a) % a;

    if (b === 0n) {
        throw new Error("Cannot compute inverse of 0 modulo " + currentModulus + ".");
    }

    while (b !== 0n) {
        const quotient = a / b;
        // Update a, b
        let tempA = a;
        a = b;
        b = tempA % b;

        // Update x0, x1
        let tempX = x0;
        x0 = x1 - quotient * x0;
        x1 = tempX;
    }

    // The inverse is x1, adjusted to be positive within the modulus range.
    const finalInverse = (x1 % BigInt(currentModulus) + BigInt(currentModulus)) % BigInt(currentModulus);
    return finalInverse;
}

/**
 * Computes (base ^ exponent) % currentModulus using the method of exponentiation by squaring (binary exponentiation).
 * @param {BigInt} baseValue - The base of the exponentiation.
 * @param {BigInt} exponentValue - The exponent.
 * @returns {BigInt} The result of (baseValue ^ exponentValue) modulo `currentModulus`.
 */
function powerModular(baseValue, exponentValue) {
    let resultAccumulator = 1n;
    // Ensure base is within the modulus range.
    let currentBase = baseValue % BigInt(currentModulus);
    const bigMod = BigInt(currentModulus);

    while (exponentValue > 0n) {
        // If the current bit of the exponent is 1 (exponentValue is odd).
        if ((exponentValue & 1n) === 1n) {
            resultAccumulator = (resultAccumulator * currentBase) % bigMod;
        }
        // Square the base for the next bit.
        currentBase = (currentBase * currentBase) % bigMod;
        // Right shift the exponent by 1 (equivalent to dividing by 2).
        exponentValue >>= 1n;
    }
    return resultAccumulator;
}

/**
 * Calculates "n choose k" (binomial coefficient) modulo `currentModulus`.
 * Requires `setupFactorialPrecomputation` to have been called for `n`.
 * @param {number} n - The total number of items.
 * @param {number} k - The number of items to choose.
 * @returns {BigInt} C(n, k) modulo `currentModulus`.
 * @throws {Error} If factorials are not precomputed or k is out of range.
 */
function nChooseKModular(n, k) {
    if (k < 0 || k > n) {
        return 0n; // Invalid choice, no ways to choose.
    }
    if (k === 0 || k === n) {
        return 1n; // One way to choose 0 or all items.
    }
    // Ensure precomputation has covered 'n'.
    if (factorialValues.length <= n) {
        throw new Error(`Factorials for n=${n} not precomputed. Call setupFactorialPrecomputation(${n}) first.`);
    }
    // C(n, k) = n! / (k! * (n-k)!) = n! * (k!)^-1 * ((n-k)!)^-1 (mod M)
    return multiplyModular(factorialValues[n], inverseFactorialValues[k], inverseFactorialValues[n - k]);
}

/**
 * Calculates "n permute k" (permutations) modulo `currentModulus`.
 * Requires `setupFactorialPrecomputation` to have been called for `n`.
 * @param {number} n - The total number of items.
 * @param {number} k - The number of items to permute.
 * @returns {BigInt} P(n, k) modulo `currentModulus`.
 * @throws {Error} If factorials are not precomputed or k is out of range.
 */
function nPermuteKModular(n, k) {
    if (k < 0 || k > n) {
        return 0n; // Invalid permutation, no ways.
    }
    // Ensure precomputation has covered 'n'.
    if (factorialValues.length <= n) {
        throw new Error(`Factorials for n=${n} not precomputed. Call setupFactorialPrecomputation(${n}) first.`);
    }
    // P(n, k) = n! / (n-k)! = n! * ((n-k)!)^-1 (mod M)
    return multiplyModular(factorialValues[n], inverseFactorialValues[n - k]);
}

/**
 * Normalizes a BigInt value to be within the positive range [0, `currentModulus`-1].
 * Useful for ensuring results are always positive after modulo operations.
 * @param {BigInt} valueToNormalize - The BigInt value to normalize.
 * @returns {BigInt} The normalized BigInt value.
 */
function normalizeModuloValue(valueToNormalize) {
    return (valueToNormalize % BigInt(currentModulus) + BigInt(currentModulus)) % BigInt(currentModulus);
}

// --- General Utility Function ---

/**
 * Determines the smaller of two BigInt values.
 * @param {BigInt} firstValue - The first BigInt for comparison.
 * @param {BigInt} secondValue - The second BigInt for comparison.
 * @returns {BigInt} The smaller of the two BigInts.
 */
function findMinimumOfTwoBigInts(firstValue, secondValue) {
    return firstValue < secondValue ? firstValue : secondValue;
}

// --- Main Program Execution Flow ---

// Execute the central logic of the program.
const programResult = executeCoreLogic();

// If the core logic returns a non-null/non-undefined value, print it to standard output.
if (programResult !== undefined && programResult !== null) {
    console.log(String(programResult));
}

/**
 * Implements the primary algorithm to solve the problem.
 * Reads input values, performs calculations, and returns the final answer.
 * @returns {BigInt|null} The total number of operations required, or -1n if impossible.
 */
function executeCoreLogic() {
    // Read the total count of numbers involved in the XOR sequence.
    const totalElementCount = readNextInteger();

    // --- Input Validation and Edge Cases ---
    // If fewer than 2 elements, the problem's XOR structure (a1, a2, then others) doesn't fit.
    // The original problem implies N >= 2 for meaningful operations.
    if (totalElementCount < 2) {
        // Return -1n to indicate an invalid or impossible scenario based on problem constraints.
        return -1n;
    }

    // Read the first two BigInt operands. These are the values we will modify.
    let operandA = readNextBigInt();
    let operandB = readNextBigInt();

    // Initialize an accumulator for the XOR sum of all subsequent elements (from the third element onwards).
    let subsequentElementsXorSum = 0n;

    // Loop through the remaining elements (starting from the third one, index 2)
    // and XOR them into 'subsequentElementsXorSum'.
    for (let elementIndex = 2; elementIndex < totalElementCount; ++elementIndex) {
        subsequentElementsXorSum ^= readNextBigInt();
    }

    // Initialize the counter for the total number of operations performed.
    let totalOperationsCount = 0n;

    // Calculate the initial XOR sum of the three main components: operandA, operandB, and the subsequent elements' XOR sum.
    // The goal of the algorithm is to make this 'currentOverallXorSum' equal to 0n.
    let currentOverallXorSum = operandA ^ operandB ^ subsequentElementsXorSum;

    // --- Core Algorithm Loop ---
    // This loop continues as long as the 'currentOverallXorSum' is not 0.
    // Each iteration attempts to resolve the highest differing bit in 'currentOverallXorSum'.
    const maxLoopIterations = 100; // Adding a safety limit for potential non-convergence.
    let currentLoopIteration = 0;

    while (currentOverallXorSum !== 0n) {
        currentLoopIteration++;
        if (currentLoopIteration > maxLoopIterations) {
            // This suggests an issue: either the problem is unsolvable or the algorithm is stuck.
            console.error("Error: Exceeded maximum iterations in the XOR resolution loop. Problem may be unsolvable or logic flawed.");
            return -1n;
        }

        // Critical guard condition: If operandA becomes 1, and we still need to make adjustments,
        // it might be impossible to proceed without making operandA zero or negative,
        // which typically violates implicit problem constraints for transfers.
        if (operandA === 1n) {
            return -1n;
        }

        // Iterate from a sufficiently high bit position (e.g., 40 for numbers up to 2^41-1) downwards.
        // We look for the most significant bit that is set in `currentOverallXorSum`.
        const maxRelevantBitPosition = 40; // Covers values up to 2^41 - 1, sufficient for 10^18.
        let currentBitPosition = maxRelevantBitPosition;
        let bitResolvedInThisIteration = false; // Flag to track if progress was made.

        while (currentBitPosition >= 0) {
            const bitMaskForCurrentPosition = 1n << BigInt(currentBitPosition);

            // Check if the current bit is set in `currentOverallXorSum`.
            if ((currentOverallXorSum & bitMaskForCurrentPosition) === 0n) {
                // If the bit is not set, move to the next lower bit.
                currentBitPosition--;
                continue;
            }

            // --- Bit Resolution Logic ---
            // If the current bit IS set in `currentOverallXorSum`, we need to find a `transferAmount`
            // such that applying it to `operandA` and `operandB` flips this specific bit in their XOR sum.
            // The transfer `u` should be added to `operandB` and subtracted from `operandA`.

            const maskForLowerBits = bitMaskForCurrentPosition - 1n; // e.g., if k=2^3, mask is 2^3-1 (0111b)

            // Calculation for `potentialTransferOption1`:
            // This is the amount needed to make `operandA` "carry over" to `currentBitPosition`.
            // It's `(lower bits of operandA) + 1`. This would flip the `currentBitPosition` of `operandA` if `operandA` is increased.
            let potentialTransferOption1 = (operandA & maskForLowerBits) + 1n;

            // Calculation for `potentialTransferOption2`:
            // This is the amount needed to make `operandB` "borrow from" `currentBitPosition`.
            // It's `(currentBitMask) - (lower bits of operandB)`. This would flip the `currentBitPosition` of `operandB` if `operandB` is decreased.
            let potentialTransferOption2 = bitMaskForCurrentPosition - (operandB & maskForLowerBits);

            // The actual `transferAmount` is the minimum of these two options.
            // We want the smallest possible transfer that resolves the current highest bit.
            const transferAmount = findMinimumOfTwoBigInts(potentialTransferOption1, potentialTransferOption2);

            // --- Feasibility Check for Transfer ---
            // The `transferAmount` must be less than `operandA`. If `operandA` is too small,
            // we cannot perform the transfer without `operandA` becoming 0 or negative,
            // which usually means the problem is unsolvable under the given constraints.
            if (transferAmount < operandA) {
                // If the transfer is valid, apply it:
                totalOperationsCount += transferAmount; // Accumulate operations.
                operandA -= transferAmount;             // Decrease operandA.
                operandB += transferAmount;             // Increase operandB.
                bitResolvedInThisIteration = true;      // Mark that progress was made.
                break;                                  // Exit the bit loop; re-evaluate `currentOverallXorSum`.
            } else {
                // If `transferAmount` is too large (i.e., >= `operandA`), this path indicates impossibility.
                return -1n;
            }
        } // End of inner `while (currentBitPosition >= 0)` loop

        // Additional guard: If the inner bit resolution loop completed but didn't find a way
        // to resolve the highest bit of `currentOverallXorSum` (and it's still non-zero),
        // it implies an unhandled impossible state.
        if (!bitResolvedInThisIteration && currentOverallXorSum !== 0n) {
            return -1n;
        }

        // Re-calculate the `currentOverallXorSum` with the updated `operandA` and `operandB`.
        currentOverallXorSum = operandA ^ operandB ^ subsequentElementsXorSum;

        // Optional debug statement for Type III:
        // if (totalOperationsCount > 1_000_000_000_000n) {
        //     console.debug("Warning: Total operations count is becoming very large:", totalOperationsCount);
        // }

    } // End of outer `while (currentOverallXorSum !== 0n)` loop

    // If the loop finishes, `currentOverallXorSum` is 0n, meaning the goal is achieved.
    // Return the accumulated total operations count.
    return totalOperationsCount;
}