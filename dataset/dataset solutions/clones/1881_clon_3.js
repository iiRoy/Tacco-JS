const MODULUS_PRIME_CONSTANT = 998244353;
const LARGE_NUMBER_SPLIT_THRESHOLD = 1e5; // Used for splitting large factors in modular multiplication

/**
 * Performs modular multiplication (factor1 * factor2) % currentMod.
 * This function handles potential intermediate overflows for large numbers
 * by splitting one of the factors based on a predefined threshold.
 *
 * @param {number} factor1 The first number.
 * @param {number} factor2 The second number.
 * @param {number} currentMod The modulus. Must be a positive integer.
 * @param {number} splitDivisor A threshold for splitting factors (e.g., 100000).
 * @returns {number} The result of (factor1 * factor2) % currentMod.
 */
function multiplyModulo(factor1, factor2, currentMod, splitDivisor) {
    // Ensure modulus is valid
    if (currentMod <= 0) {
        throw new Error("Modulus for modular multiplication must be a positive integer.");
    }

    // Handle potential negative inputs by ensuring they are within [0, currentMod - 1]
    factor1 = (factor1 % currentMod + currentMod) % currentMod;
    factor2 = (factor2 % currentMod + currentMod) % currentMod;

    let quotientPart = Math.floor(factor2 / splitDivisor);
    let remainderPart = factor2 - (quotientPart * splitDivisor);

    // Calculate (factor1 * quotientPart * splitDivisor) % currentMod
    // The original code effectively does:
    // ( (factor1 * quotientPart) % currentMod * splitDivisor ) % currentMod
    // This is safer than (factor1 * quotientPart * splitDivisor) % currentMod
    // if factor1 * quotientPart * splitDivisor might overflow
    let termFromQuotient = (factor1 * quotientPart) % currentMod;
    termFromQuotient = (termFromQuotient * splitDivisor) % currentMod;

    // Calculate (factor1 * remainderPart) % currentMod
    let termFromRemainder = (factor1 * remainderPart) % currentMod;

    // Sum the two parts and take modulo
    let productResult = (termFromQuotient + termFromRemainder) % currentMod;

    return productResult;
}

/**
 * Calculates modular exponentiation (baseValue ^ exponentValue) % modPrime efficiently.
 * Uses the method of exponentiation by squaring (binary exponentiation).
 *
 * @param {number} baseValue The base.
 * @param {number} exponentValue The exponent.
 * @param {number} modPrime The modulus. Must be a positive integer.
 * @param {number} splitConstant A constant used by the multiplyModulo helper.
 * @returns {number} The result of (baseValue ^ exponentValue) % modPrime.
 */
function powerModulo(baseValue, exponentValue, modPrime, splitConstant) {
    // Basic validation and edge cases
    if (modPrime <= 0) {
        throw new Error("Modulus for modular exponentiation must be a positive integer.");
    }
    if (exponentValue < 0) {
        // For negative exponents, result is 1 / (baseValue ^ |exponentValue|) mod modPrime
        // This problem context implies non-negative exponents, so we return 0 or error.
        return 0; // Or throw new Error("Negative exponents not supported in this context.");
    }
    if (exponentValue === 0) {
        return 1; // Any number to the power of 0 is 1 (modulo anything)
    }

    let resultAccumulator = 1;
    let currentBasePower = baseValue % modPrime; // Ensure base is within modulus range

    // Iterate through the bits of the exponent
    while (exponentValue > 0) {
        // If the current bit is 1, multiply result by currentBasePower
        if (exponentValue & 1) {
            resultAccumulator = multiplyModulo(resultAccumulator, currentBasePower, modPrime, splitConstant);
        }
        // Square the currentBasePower for the next bit
        currentBasePower = multiplyModulo(currentBasePower, currentBasePower, modPrime, splitConstant);
        // Move to the next bit (right shift exponent by 1)
        exponentValue >>= 1;
    }

    return resultAccumulator;
}

/**
 * Precomputes factorials, inverse factorials, and modular inverses up to maxN.
 * Then calculates binomial coefficients C(maxN, i) for i from 0 to limitK modulo modulusValue.
 *
 * @param {number} maxN The 'n' in C(n, k).
 * @param {number} limitK The maximum 'k' for which C(n, k) is calculated.
 * @param {number} modulusValue The modulus for all calculations.
 * @param {number} splitDivisor A constant used by the multiplyModulo helper.
 * @returns {number[]} An array containing [C(maxN, 0), C(maxN, 1), ..., C(maxN, limitK)] modulo modulusValue.
 */
function calculateCombinationsUpToK(maxN, limitK, modulusValue, splitDivisor) {
    // Guard clause for invalid input
    if (maxN < 0 || limitK < 0 || limitK > maxN) {
        // console.error("Invalid input for combinations: n must be >= 0, k must be >= 0 and k <= n.");
        return [];
    }
    if (modulusValue <= 0) {
        throw new Error("Modulus for combinations must be a positive integer.");
    }

    // Initialize arrays for precomputation
    const factorialValues = new Array(maxN + 1);
    const invFactorialValues = new Array(maxN + 1);
    const invModValues = new Array(maxN + 1);

    // Base cases for factorials and inverses
    factorialValues[0] = 1;
    invFactorialValues[0] = 1;
    invModValues[1] = 1; // 1^-1 mod M is 1

    // Precompute factorials and modular inverses (for 1 to maxN)
    for (let currentIdx = 1; currentIdx <= maxN; currentIdx++) {
        factorialValues[currentIdx] = multiplyModulo(factorialValues[currentIdx - 1], currentIdx, modulusValue, splitDivisor);

        if (currentIdx > 1) {
            // Modular inverse: inv[i] = MOD - (MOD / i) * inv[MOD % i] % MOD
            invModValues[currentIdx] = modulusValue - multiplyModulo(
                invModValues[modulusValue % currentIdx],
                Math.floor(modulusValue / currentIdx),
                modulusValue,
                splitDivisor
            );
        }
        // Inverse factorials: invFact[i] = invFact[i-1] * inv[i]
        invFactorialValues[currentIdx] = multiplyModulo(invFactorialValues[currentIdx - 1], invModValues[currentIdx], modulusValue, splitDivisor);
    }

    const computedCombinations = [];
    // Calculate C(maxN, count) = (maxN! * (count!)^-1 * ((maxN - count)!)^-1) % modulusValue
    for (let count = 0; count <= limitK; count++) {
        let termNumerator = factorialValues[maxN];
        let termDenominatorK = invFactorialValues[count];
        let termDenominatorNMinusK = invFactorialValues[maxN - count];

        let intermediateProduct = multiplyModulo(termNumerator, termDenominatorK, modulusValue, splitDivisor);
        let finalCombination = multiplyModulo(intermediateProduct, termDenominatorNMinusK, modulusValue, splitDivisor);

        computedCombinations.push(finalCombination);
    }

    return computedCombinations;
}


/**
 * Main entry point for processing input and performing the calculation.
 * Reads configuration values, computes combinations and powers, then sums them up.
 *
 * @param {string} rawInputData The raw string input from stdin.
 */
function ProcessInputAndCompute(rawInputData) {
    const parsedLines = rawInputData.trim().split('\n');

    // Attempt to parse the first line which should contain N, M, K
    const firstLineValues = parsedLines[0].split(' ').map(Number);

    // Basic validation for input structure
    if (firstLineValues.length < 3 || firstLineValues.some(isNaN)) {
        console.error("Input format error: Expected three numerical values (N, M, K) on the first line.");
        return;
    }

    const main_N = firstLineValues[0];
    const main_M = firstLineValues[1];
    const main_K = firstLineValues[2];

    // Ensure main_M is at least 1 for (M-1) operations
    if (main_M < 1) {
        console.error("Input error: M must be at least 1.");
        return;
    }

    // Calculate combinations C(main_N, i) for i from 0 to main_K
    let combinationsResult = calculateCombinationsUpToK(main_N, main_K, MODULUS_PRIME_CONSTANT, LARGE_NUMBER_SPLIT_THRESHOLD);

    // The original logic reverses the combinations array.
    // This is crucial for the summation formula to align with the increasing power of (M-1).
    combinationsResult.reverse();

    // Initialize the starting power factor: (M-1)^(N - K - 1)
    let currentPowerFactor = powerModulo(main_M - 1, main_N - main_K - 1, MODULUS_PRIME_CONSTANT, LARGE_NUMBER_SPLIT_THRESHOLD);

    let finalCalculatedSum = 0;
    const one_less_M = main_M - 1; // Cache (M-1) for repeated use

    // Iterate through the reversed combinations (from C(N,K) down to C(N,0))
    // and accumulate the sum: sum_{i=0 to K} C(N,i) * (M-1)^(N-i-1)
    for (let loopIdx = 0; loopIdx < combinationsResult.length; loopIdx++) {
        const currentCombinationValue = combinationsResult[loopIdx];

        // Add (currentPowerFactor * currentCombinationValue) to the sum
        finalCalculatedSum = (finalCalculatedSum + multiplyModulo(currentPowerFactor, currentCombinationValue, MODULUS_PRIME_CONSTANT, LARGE_NUMBER_SPLIT_THRESHOLD)) % MODULUS_PRIME_CONSTANT;

        // Update the power factor for the next iteration: currentPowerFactor * (M-1)
        currentPowerFactor = multiplyModulo(currentPowerFactor, one_less_M, MODULUS_PRIME_CONSTANT, LARGE_NUMBER_SPLIT_THRESHOLD);
    }

    // Multiply the final sum by M
    finalCalculatedSum = multiplyModulo(finalCalculatedSum, main_M, MODULUS_PRIME_CONSTANT, LARGE_NUMBER_SPLIT_THRESHOLD);

    console.log(finalCalculatedSum);
}

// Execute the main processing function with input from standard input
ProcessInputAndCompute(require("fs").readFileSync("/dev/stdin", "utf8"));