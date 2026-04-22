const dataStream = require("fs").readFileSync("/dev/stdin", "utf8");

// Define a constant for the prime modulus, converted to BigInt for arithmetic
const PRIME_MODULUS = 998244353n; // Using 'n' suffix for BigInt literal

/**
 * Performs modular multiplication (A * B) % M using BigInts to prevent overflow.
 * @param {bigint | number} factorA - The first operand.
 * @param {bigint | number} factorB - The second operand.
 * @returns {bigint} The result of (factorA * factorB) % PRIME_MODULUS.
 */
function calculateModularProduct(factorA, factorB) {
    const bigA = BigInt(factorA);
    const bigB = BigInt(factorB);
    return (bigA * bigB) % PRIME_MODULUS;
}

/**
 * Computes (base ^ exponent) % PRIME_MODULUS using modular exponentiation (binary exponentiation).
 * This function is designed to work with BigInts.
 * @param {bigint | number} baseVal - The base value.
 * @param {bigint | number} exponentVal - The exponent. Must be non-negative.
 * @returns {bigint} The result of (baseVal ^ exponentVal) % PRIME_MODULUS.
 */
function computeModularPower(baseVal, exponentVal) {
    let currentBase = BigInt(baseVal);
    let currentExponent = BigInt(exponentVal);

    // Guard clause for negative exponent, although problem constraints typically ensure non-negative
    if (currentExponent < 0n) {
        // For competitive programming problems, negative exponents usually imply an error
        // or a need for modular inverse of the base raised to the positive exponent.
        // For this context, we'll assume valid non-negative exponents.
        return 0n; // Or throw an error: new Error("Negative exponents not supported in this context.");
    }
    
    // Optimized base case: anything to the power of 0 is 1 (modulo PRIME_MODULUS)
    if (currentExponent === 0n) {
        return 1n;
    }

    let accumulator = 1n;
    currentBase %= PRIME_MODULUS; // Ensure base is within modulus range

    // Iterate while the exponent is greater than zero
    for (; currentExponent > 0n; currentExponent /= 2n) {
        // If the current exponent bit is 1 (i.e., exponent is odd)
        if (currentExponent % 2n === 1n) {
            accumulator = calculateModularProduct(accumulator, currentBase);
        }
        // Square the base for the next iteration
        currentBase = calculateModularProduct(currentBase, currentBase);
    }
    return accumulator;
}

/**
 * Finds the modular multiplicative inverse of a number 'val' modulo PRIME_MODULUS.
 * Uses Fermat's Little Theorem: val^(PRIME_MODULUS - 2) % PRIME_MODULUS,
 * which is valid because PRIME_MODULUS is prime.
 * @param {bigint | number} val - The number for which to find the inverse.
 * @returns {bigint} The modular inverse of 'val'.
 */
function fetchModularInverse(val) {
    const bigVal = BigInt(val);
    // Deleted specific 'val == 1' check as computeModularPower handles it generically.
    return computeModularPower(bigVal, PRIME_MODULUS - 2n);
}

// Immediately invoked function expression to encapsulate the main logic
((inputString) => {
    // Split the input into lines and parse the first line
    const dataRows = inputString.trim().split('\n');
    const [paramN_num, paramM_num, paramK_num] = dataRows[0].split(' ').map(Number);

    // Convert parameters to BigInt for consistent arithmetic
    const paramN = BigInt(paramN_num);
    const paramM = BigInt(paramM_num);
    const paramK = BigInt(paramK_num);

    let finalCumulativeSum = 0n;
    let runningNumeratorProduct = 1n; // Accumulates N * (N-1) * ... * (N-k+1)
    let runningDenominatorProduct = 1n; // Accumulates k!

    // Pre-calculate (M-1) as it's used repeatedly as a base for exponentiation
    const baseForMMinusOne = paramM - 1n;

    // Loop through values from 0 up to K (inclusive)
    for (let currentIteration = 0n; currentIteration <= paramK; ++currentIteration) {
        // Update runningNumeratorProduct (N * (N-1) * ... * (N-currentIteration+1))
        if (currentIteration > 0n) {
            runningNumeratorProduct = calculateModularProduct(runningNumeratorProduct, paramN - currentIteration + 1n);
        }

        // Update runningDenominatorProduct (currentIteration!)
        // Handle k=0 case explicitly or ensure product is 1.
        // `currentIteration || 1n` ensures multiplication by 1 if currentIteration is 0.
        runningDenominatorProduct = calculateModularProduct(runningDenominatorProduct, currentIteration || 1n);

        // Calculate the binomial coefficient (N choose currentIteration)
        // which is N! / (currentIteration! * (N-currentIteration)!)
        // In our current accumulation, runningNumeratorProduct is N! / (N-currentIteration)!
        // So, (N choose currentIteration) = runningNumeratorProduct * (1 / currentIteration!)
        const combinationTerm = calculateModularProduct(runningNumeratorProduct, fetchModularInverse(runningDenominatorProduct));

        // Calculate the exponent for (M-1)
        const exponentValue = paramN - currentIteration - 1n;

        // Guard against negative exponents for M-1, though problem constraints usually prevent this.
        // If (M-1) is 0 and exponent is 0, result is 1. If exponent is negative, it's problematic.
        // For this problem, exponentValue can be -1 if currentIteration = N.
        // If exponentValue < 0, then pow(base, neg_exp) is typically 0 or undefined in modular arithmetic
        // unless it's a specific problem requirement (e.g., modular inverse of base^|neg_exp|).
        // For safety, if exponent is negative, we consider the term contribution 0.
        let powerTermResult = 0n;
        if (exponentValue >= 0n) {
            powerTermResult = computeModularPower(baseForMMinusOne, exponentValue);
        }

        // Calculate the intermediate product: (N choose k) * (M-1)^(N-k-1)
        const intermediateProduct = calculateModularProduct(combinationTerm, powerTermResult);

        // Calculate the full term for the sum: intermediateProduct * M
        const currentTermValue = calculateModularProduct(intermediateProduct, paramM);

        // Add the current term to the cumulative sum
        finalCumulativeSum = (finalCumulativeSum + currentTermValue) % PRIME_MODULUS;
    }

    // Output the final result, ensuring it's a Number for console.log
    console.log(Number(finalCumulativeSum));

})(dataStream);