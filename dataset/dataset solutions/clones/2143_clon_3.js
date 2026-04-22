const MODULUS_VALUE = 1000000007; // A common prime modulus in competitive programming

// Arrays to store precomputed factorials and their modular inverses
let precomputedFactorials = [];
let precomputedInverseFactorials = [];

/**
 * Calculates (base^exponent) % MODULUS_VALUE using modular exponentiation (binary exponentiation).
 * @param {number} base The base number.
 * @param {number} exponent The exponent.
 * @returns {number} The result of (base^exponent) % MODULUS_VALUE.
 */
function calculateModularPower(base, exponent) {
    let outcome = 1;
    base %= MODULUS_VALUE; // Ensure base is within modulo range
    while (exponent > 0) {
        // If exponent is odd, multiply base with the current outcome
        if (exponent % 2 === 1) {
            outcome = (outcome * base) % MODULUS_VALUE;
        }
        // Square the base and halve the exponent
        base = (base * base) % MODULUS_VALUE;
        exponent = Math.floor(exponent / 2);
    }
    return outcome;
}

/**
 * Computes the modular multiplicative inverse of a number 'num' modulo MODULUS_VALUE.
 * Uses Fermat's Little Theorem: a^(p-2) % p for prime p.
 * @param {number} num The number to find the inverse for.
 * @returns {number} The modular inverse of 'num'.
 */
function findModularInverse(num) {
    // Inverse exists only if num and MODULUS_VALUE are coprime (which is true for num < MODULUS_VALUE and MODULUS_VALUE is prime)
    return calculateModularPower(num, MODULUS_VALUE - 2);
}

/**
 * Precomputes factorials and inverse factorials up to a specified limit.
 * This function should be called once before calculating binomial coefficients.
 * @param {number} upperLimit The maximum number for which factorials are needed.
 */
function prepareFactorialTables(upperLimit) {
    precomputedFactorials[0] = 1;
    precomputedInverseFactorials[0] = 1; // 0! = 1, its inverse is 1
    for (let k = 1; k <= upperLimit; k++) {
        precomputedFactorials[k] = (precomputedFactorials[k - 1] * k) % MODULUS_VALUE;
        // Inverse factorial is (k!)^(-1)
        precomputedInverseFactorials[k] = findModularInverse(precomputedFactorials[k]);
    }
}

/**
 * Calculates the binomial coefficient "totalChooseCount C chooseCount" modulo MODULUS_VALUE.
 * Requires precomputed factorials and inverse factorials.
 * @param {number} totalChooseCount The total number of items (n).
 * @param {number} chooseCount The number of items to choose (k).
 * @returns {number} (totalChooseCount C chooseCount) % MODULUS_VALUE.
 */
function getModularBinomialCoefficient(totalChooseCount, chooseCount) {
    // Handle invalid or trivial cases
    if (chooseCount < 0 || chooseCount > totalChooseCount) {
        return 0;
    }
    if (chooseCount === 0 || chooseCount === totalChooseCount) {
        return 1;
    }
    // Optimization: nCk = nC(n-k)
    if (chooseCount > totalChooseCount / 2) {
        chooseCount = totalChooseCount - chooseCount;
    }

    // Formula: nCk = n! / (k! * (n-k)!) = n! * (k!)^(-1) * ((n-k)!)^(-1) (mod P)
    let numerator = precomputedFactorials[totalChooseCount];
    let denominatorTerm1 = precomputedInverseFactorials[chooseCount];
    let denominatorTerm2 = precomputedInverseFactorials[totalChooseCount - chooseCount];

    let combinedDenominator = (denominatorTerm1 * denominatorTerm2) % MODULUS_VALUE;
    return (numerator * combinedDenominator) % MODULUS_VALUE;
}

/**
 * Processes input data to calculate the sum of binomial coefficients,
 * excluding specific indices, all modulo a large prime.
 * @param {string} rawInputString The raw input string containing N, a, and b.
 */
function processCombinationSum(rawInputString) {
    // Parse input values from the first line
    const inputLineParts = rawInputString.split('\n')[0].split(' ');
    
    // Convert string parts to integers
    const overallCount = parseInt(inputLineParts[0], 10);
    const excludedIndex1 = parseInt(inputLineParts[1], 10);
    const excludedIndex2 = parseInt(inputLineParts[2], 10);

    // --- Input Validation (Type III addition) ---
    if (isNaN(overallCount) || isNaN(excludedIndex1) || isNaN(excludedIndex2) ||
        overallCount < 0 || excludedIndex1 < 0 || excludedIndex2 < 0 ||
        excludedIndex1 > overallCount || excludedIndex2 > overallCount) {
        console.error("Invalid input values provided. Please ensure N, A, B are non-negative integers and within bounds.");
        return; // Exit if input is invalid
    }

    // Precompute factorials for efficient binomial coefficient calculation
    prepareFactorialTables(overallCount);

    // Array to store (overallCount C k) % MODULUS_VALUE for k from 0 to overallCount
    // Initialized with zeros.
    const calculatedCombinations = Array.from({ length: overallCount + 1 }, () => 0);

    // Calculate all binomial coefficients (overallCount C k)
    // The original code used symmetry (N C i = N C (N-i)) and only iterated up to N/2.
    // Our 'getModularBinomialCoefficient' function handles this symmetry internally,
    // so a direct loop from 0 to overallCount is simpler and equally efficient.
    for (let k = 0; k <= overallCount; k++) {
        calculatedCombinations[k] = getModularBinomialCoefficient(overallCount, k);
    }

    // Explicitly set the excluded combinations to zero (Type III: clear statement)
    if (excludedIndex1 >= 0 && excludedIndex1 <= overallCount) {
        calculatedCombinations[excludedIndex1] = 0;
    }
    if (excludedIndex2 >= 0 && excludedIndex2 <= overallCount) {
        calculatedCombinations[excludedIndex2] = 0;
    }

    // Calculate the sum of remaining combinations, starting from 1
    // (overallCount C 0 is implicitly excluded by starting loop from k=1)
    let aggregateSum = 0;
    for (let k = 1; k <= overallCount; k++) {
        aggregateSum = (aggregateSum + calculatedCombinations[k]) % MODULUS_VALUE;
    }

    // Ensure the final sum is non-negative (can happen if intermediate sums become negative due to modulo properties with subtraction)
    aggregateSum = (aggregateSum + MODULUS_VALUE) % MODULUS_VALUE;

    // Output the final result
    console.log(aggregateSum);
}

// Entry point for execution: Read from standard input and process.
processCombinationSum(require("fs").readFileSync("/dev/stdin", "utf8"));