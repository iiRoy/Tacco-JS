const MODULO_CONSTANT = 1000000007; // The large prime modulus for the final calculation.
const STARTING_PRIME_CHECK = 2;     // The smallest prime number to begin factorization.

/**
 * Safely converts a string to an integer.
 * @param {string} strValue - The string to convert.
 * @returns {number} The parsed integer, or NaN if conversion fails.
 */
function parseNumericInput(strValue) {
    const parsed = Number.parseInt(strValue.trim(), 10);
    return Number.isFinite(parsed) ? parsed : NaN;
}

/**
 * Accumulates prime factor counts for a given number into a map.
 * This function modifies the provided map in place.
 * @param {number} valueToFactorize - The number whose prime factors are to be found.
 * @param {Object.<number, number>} factorExponentMap - The map to update with prime factors and their exponents.
 */
function updatePrimeFactorExponents(valueToFactorize, factorExponentMap) {
    let currentDivisible = valueToFactorize;
    let potentialFactor = STARTING_PRIME_CHECK;

    // Optimized trial division: check factors up to sqrt(currentDivisible)
    while (potentialFactor * potentialFactor <= currentDivisible) {
        if (currentDivisible % potentialFactor === 0) {
            let exponent = 0;
            // Count how many times this prime factor divides currentDivisible
            do {
                exponent++;
                currentDivisible /= potentialFactor;
            } while (currentDivisible % potentialFactor === 0);

            // Update the global map of prime factor exponents
            factorExponentMap[potentialFactor] = (factorExponentMap[potentialFactor] || 0) + exponent;
        }
        potentialFactor++; // Move to the next potential factor
    }

    // If currentDivisible is still greater than 1, it must be a prime factor itself
    if (currentDivisible > 1) {
        factorExponentMap[currentDivisible] = (factorExponentMap[currentDivisible] || 0) + 1;
    }
}

/**
 * Orchestrates the computation of the number of divisors for n! (n factorial), modulo a constant.
 * This function processes the input, calculates prime factor counts for all numbers up to n,
 * and then computes the final result based on the formula product((exponent_p + 1)) mod M.
 * @param {string} rawDataString - The raw string input representing the upper limit 'n'.
 */
function computeFactorialDivisorCount(rawDataString) {
    const targetLimit = parseNumericInput(rawDataString);

    // Input validation and edge cases
    if (Number.isNaN(targetLimit) || targetLimit < 0) {
        console.error("Invalid or negative input provided. Please provide a non-negative integer.");
        return; // Exit if input is invalid
    }
    if (targetLimit === 0 || targetLimit === 1) {
        console.log(1); // 0! = 1, 1! = 1. Both have 1 divisor.
        return;
    }

    // This object will store the accumulated exponents for each prime factor across all numbers from 2 to targetLimit.
    const primeExponentsAccumulator = {};

    // Iterate through each number from the starting prime check up to the target limit
    for (let currentNumber = STARTING_PRIME_CHECK; currentNumber <= targetLimit; ++currentNumber) {
        updatePrimeFactorExponents(currentNumber, primeExponentsAccumulator);
    }

    let totalDivisorsModuloM = 1; // Initialize the result accumulator

    // Iterate over the accumulated prime factors to compute the final product
    // The number of divisors of N = p1^a1 * p2^a2 * ... * pk^ak is (a1+1)*(a2+1)*...*(ak+1)
    for (const primeFactor in primeExponentsAccumulator) {
        // Ensure we are only processing own properties of the object
        if (Object.prototype.hasOwnProperty.call(primeExponentsAccumulator, primeFactor)) {
            const currentExponent = primeExponentsAccumulator[primeFactor];
            totalDivisorsModuloM = (totalDivisorsModuloM * (currentExponent + 1)) % MODULO_CONSTANT;
        }
    }

    console.log(totalDivisorsModuloM);
}

// Entry point: Read input from standard input and invoke the main computation function.
// This assumes a Node.js environment for fs and readFileSync.
computeFactorialDivisorCount(require("fs").readFileSync("/dev/stdin", "utf8"));