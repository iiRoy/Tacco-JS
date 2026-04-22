const getModule = require("fs"); // Obtain the file system module for input operations

/**
 * Calculates (baseVal ^ exponentVal) % primeModulus using modular exponentiation.
 * Handles non-negative exponents. If exponentVal is negative, it computes modular inverse.
 *
 * @param {bigint} baseVal - The base of the exponentiation.
 * @param {bigint} exponentVal - The exponent.
 * @param {bigint} primeModulus - The modulus for the operation.
 * @returns {bigint} (baseVal ^ exponentVal) % primeModulus.
 */
function calculateModularPower (baseVal, exponentVal, primeModulus) {
    // Handle negative exponents by computing modular inverse of the positive exponent
    if (exponentVal < 0n) {
        // Modular inverse for negative exponent: a^-b = (a^b)^-1
        const positiveExponentResult = calculateModularPower(baseVal, -exponentVal, primeModulus);
        return findModularInverse(positiveExponentResult, primeModulus);
    }

    let accumulatedResult = 1n; // Initialize result to 1 (identity for multiplication)
    let currentBase = baseVal % primeModulus; // Reduce base modulo primeModulus

    // Iterate while exponentVal is greater than zero
    while (exponentVal > 0n) {
        // If the current exponentVal is odd, multiply accumulatedResult by currentBase
        if (exponentVal & 1n) {
            accumulatedResult = (accumulatedResult * currentBase) % primeModulus;
        }
        // Square the currentBase for the next iteration (currentBase^2)
        currentBase = (currentBase * currentBase) % primeModulus;
        // Right shift exponentVal by 1 (equivalent to integer division by 2)
        exponentVal >>= 1n;
    }
    return accumulatedResult; // Return the final modular power
}

/**
 * Finds the modular multiplicative inverse of a number 'val' modulo 'primeModulus'.
 * Uses Fermat's Little Theorem: a^(p-2) % p is the inverse of a modulo p,
 * where p is a prime number.
 *
 * @param {bigint} val - The number for which to find the inverse.
 * @param {bigint} primeModulus - The prime modulus.
 * @returns {bigint} The modular inverse of 'val' modulo 'primeModulus'.
 */
function findModularInverse (val, primeModulus) {
    // Modular inverse of 1 is always 1
    if (val === 1n) {
        return 1n;
    }
    // Compute inverse using modular exponentiation: val^(primeModulus - 2) % primeModulus
    // This relies on primeModulus being prime.
    return calculateModularPower(val, primeModulus - 2n, primeModulus);
}

// Define the global prime modulus for all calculations
const calcModulo = 998244353n;

// Main execution block: an immediately invoked function expression (IIFE)
// to encapsulate the primary logic and process the input.
((initialInput) => {
    // Read raw input data from standard input (e.g., /dev/stdin for Linux)
    const rawData = getModule.readFileSync("/dev/stdin", "utf8");
    // Split the input into lines
    const inputLines = rawData.split('\n');

    // Parse the first line to get N, M, K as BigInt values
    // N: total items, M: number of categories, K: max special items
    const [totalItems, numCategories, maxSpecialItems] = inputLines[0].split(' ').map(BigInt);

    let finalTally = 0n; // Accumulator for the final computed result

    // cumulativeFactorialK will store k! (k factorial) modulo calcModulo
    let cumulativeFactorialK = 1n;
    // cumulativePermutationN_1_K will store P(totalItems - 1, currentK) modulo calcModulo
    // This is (N-1) * (N-2) * ... * (N-k)
    let cumulativePermutationN_1_K = 1n;

    // Pre-calculate (M-1) for repeated use in modular power function
    const powerBaseTerm = numCategories - 1n;

    // Loop from currentK = 0 up to maxSpecialItems (inclusive)
    for (let currentK = 0n; currentK <= maxSpecialItems; ++currentK) {
        // --- Update cumulativeFactorialK (k!) ---
        // For currentK = 0, 0! is 1. For currentK > 0, multiply by currentK.
        if (currentK > 0n) {
            cumulativeFactorialK = (cumulativeFactorialK * currentK) % calcModulo;
        }

        // --- Update cumulativePermutationN_1_K (P(N-1, k)) ---
        // P(N-1, k) = (N-1) * (N-2) * ... * (N-k)
        // For currentK = 0, P(N-1, 0) is 1.
        // For currentK > 0, multiply by (totalItems - currentK).
        if (currentK > 0n) {
            cumulativePermutationN_1_K = (cumulativePermutationN_1_K * (totalItems - currentK)) % calcModulo;
        }

        // --- Calculate Combinatorial Term: C(N-1, k) ---
        // C(N-1, k) = P(N-1, k) / k! = cumulativePermutationN_1_K * inv(cumulativeFactorialK)
        const combinatorialFactor = (cumulativePermutationN_1_K * findModularInverse(cumulativeFactorialK, calcModulo)) % calcModulo;

        // --- Calculate Power Term: (M-1)^(N - k - 1) ---
        // The exponent for (M-1) is (totalItems - currentK - 1n).
        const powerExponentValue = totalItems - currentK - 1n;

        // Determine the power term, handling edge cases for base and exponent.
        let powerResult = 0n;
        if (powerExponentValue < 0n) {
            // If exponent is negative, it implies 0 or an inverse, depending on problem context.
            // Our calculateModularPower function handles negative exponents by finding modular inverse.
            powerResult = calculateModularPower(powerBaseTerm, powerExponentValue, calcModulo);
        } else if (powerBaseTerm === 0n && powerExponentValue === 0n) {
            // 0^0 is typically 1 in combinatorics context.
            powerResult = 1n;
        } else if (powerBaseTerm === 0n && powerExponentValue > 0n) {
            // 0^positive_exponent is 0.
            powerResult = 0n;
        } else {
            // Standard modular exponentiation for positive base and non-negative exponent.
            powerResult = calculateModularPower(powerBaseTerm, powerExponentValue, calcModulo);
        }

        // --- Aggregate terms for the currentK ---
        // The full term for currentK is: C(N-1, k) * M * (M-1)^(N-k-1)
        const currentIterationTerm = (combinatorialFactor * numCategories % calcModulo * powerResult) % calcModulo;

        // Add the current term to the final tally, ensuring it remains within the modulus
        finalTally = (finalTally + currentIterationTerm) % calcModulo;
    }

    // Output the final result, converted to a string
    console.log(finalTally.toString());

})(null); // Passing null as initialInput, as it's directly read from fs module.