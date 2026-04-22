const PRIME_MODULUS = 1_000_000_007; // A large prime number used for modular arithmetic operations.
const MAX_ARRAY_SIZE = 100_000 + 1200; // Defines the maximum size for precomputed arrays.

// Precomputed factorial values modulo PRIME_MODULUS.
let factorial_lookup_table = Array(MAX_ARRAY_SIZE).fill(0);
// Precomputed inverse factorial values modulo PRIME_MODULUS.
let inv_factorial_lookup_table = Array(MAX_ARRAY_SIZE).fill(0);

/**
 * Decomposes an integer into its prime factors and their respective counts.
 * @param {number} inputNumber The number to factorize.
 * @returns {Array<{factor: number, count: number}>} An array of objects, each containing a prime factor and its exponent.
 */
const decomposeIntoPrimes = (inputNumber) => {
    if (inputNumber <= 1) { // Guard for non-positive or unity input.
        return [];
    }

    let primeFactorsList = [];
    let currentNumValue = inputNumber; // Work with a mutable copy of the input.

    // Check for divisibility by 2 as a special case for efficiency.
    if (currentNumValue % 2 === 0) {
        let powerCount = 0;
        while (currentNumValue % 2 === 0) {
            currentNumValue = Math.floor(currentNumValue / 2);
            powerCount++;
        }
        primeFactorsList.push({ factor: 2, count: powerCount });
    }

    // Iterate through odd divisor candidates up to the square root of the remaining number.
    for (let divisorCandidate = 3; divisorCandidate * divisorCandidate <= currentNumValue; divisorCandidate += 2) {
        let powerCount = 0; // Initialize exponent for current prime factor.
        while (currentNumValue % divisorCandidate === 0) {
            currentNumValue = Math.floor(currentNumValue / divisorCandidate);
            powerCount++;
        }
        if (powerCount > 0) { // If divisorCandidate was a factor, add it to the list.
            primeFactorsList.push({ factor: divisorCandidate, count: powerCount });
        }
    }

    // If currentNumValue is still greater than 1, it must be a prime factor itself.
    if (currentNumValue > 1) {
        primeFactorsList.push({ factor: currentNumValue, count: 1 });
    }

    return primeFactorsList;
};


/**
 * Calculates (baseValue ^ exponentValue) % PRIME_MODULUS using modular exponentiation.
 * Operates with BigInt for intermediate calculations to prevent overflow.
 * @param {number} baseValue The base number.
 * @param {number} exponentValue The exponent.
 * @returns {number} The result of the modular exponentiation.
 */
const modularExponentiation = (baseValue, exponentValue) => {
    if (exponentValue < 0) { // Handle negative exponents (not typically used in this context but good practice).
        throw new Error("Negative exponent not supported for modular exponentiation in this context.");
    }
    if (exponentValue === 0) { // Any number to the power of 0 is 1.
        return 1;
    }

    let resultAccumulator = 1n; // Initialize result as BigInt 1.
    let currentBase = BigInt(baseValue); // Convert base to BigInt.
    let currentExponent = BigInt(exponentValue); // Convert exponent to BigInt.
    const MOD_BIGINT = BigInt(PRIME_MODULUS); // Pre-convert modulus to BigInt.

    // Binary exponentiation (exponentiation by squaring).
    while (currentExponent > 0n) {
        // If the current exponent bit is 1, multiply result by current base.
        if ((currentExponent & 1n) === 1n) {
            resultAccumulator = (resultAccumulator * currentBase) % MOD_BIGINT;
        }
        // Square the base for the next iteration.
        currentBase = (currentBase * currentBase) % MOD_BIGINT;
        // Right shift the exponent (divide by 2).
        currentExponent >>= 1n;
    }

    return Number(resultAccumulator); // Convert final BigInt result back to Number.
};


/**
 * Calculates combinations C(n, r) modulo PRIME_MODULUS using precomputed factorials and inverse factorials.
 * C(n, r) = n! / (r! * (n-r)!) = n! * (r!)^(-1) * ((n-r)!)^(-1) (mod P)
 * @param {number} totalItems The total number of items (n).
 * @param {number} itemsToChoose The number of items to choose (r).
 * @returns {number} The number of combinations modulo PRIME_MODULUS.
 */
const calculateCombinationsModP = (totalItems, itemsToChoose) => {
    // Handle edge cases for combinations.
    if (itemsToChoose < 0 || itemsToChoose > totalItems) {
        return 0; // Mathematically, C(n,r) is 0 if r is out of bounds [0, n].
    }
    if (itemsToChoose === 0 || itemsToChoose === totalItems) {
        return 1; // C(n,0) = C(n,n) = 1.
    }
    if (totalItems === 0 && itemsToChoose === 0) {
        return 1; // Special case C(0,0) = 1.
    }

    // Optimization: C(n, r) = C(n, n-r). Choose the smaller r for lookup.
    if (itemsToChoose > totalItems / 2) {
        itemsToChoose = totalItems - itemsToChoose;
    }

    const MOD_BIGINT = BigInt(PRIME_MODULUS);

    // Retrieve precomputed values and convert to BigInt for calculation.
    const n_factorial_val = BigInt(factorial_lookup_table[totalItems]);
    const r_factorial_inv_val = BigInt(inv_factorial_lookup_table[itemsToChoose]);
    const n_minus_r_factorial_inv_val = BigInt(inv_factorial_lookup_table[totalItems - itemsToChoose]);

    // Calculate (n! * (r!)^-1 * ((n-r)!)^-1) % MOD
    let intermediateCalculation = (r_factorial_inv_val * n_minus_r_factorial_inv_val) % MOD_BIGINT;
    let finalCombinationResult = (n_factorial_val * intermediateCalculation) % MOD_BIGINT;

    return Number(finalCombinationResult); // Return as a Number.
};


// Flag to ensure initialization only happens once.
let isInitializationComplete = false;

/**
 * Initializes the factorial_lookup_table and inv_factorial_lookup_table arrays
 * up to MAX_ARRAY_SIZE modulo PRIME_MODULUS.
 * This function should be called once before performing any combination calculations.
 */
const initializeFactorialTables = () => {
    if (isInitializationComplete) {
        return; // Prevent re-initialization.
    }

    factorial_lookup_table[0] = 1; // 0! = 1
    inv_factorial_lookup_table[0] = 1; // (0!)^(-1) = 1

    // Precompute factorials: fac[k+1] = fac[k] * (k+1) % MOD
    for (let k = 0; k < MAX_ARRAY_SIZE - 1; ++k) {
        factorial_lookup_table[k + 1] = (factorial_lookup_table[k] * (k + 1)) % PRIME_MODULUS;
    }

    // Precompute inverse factorials: inv_fac[k+1] = (fac[k+1])^(MOD-2) % MOD
    // Using Fermat's Little Theorem: a^(P-2) is modular multiplicative inverse of a mod P.
    // The modularExponentiation function already handles the modulo operation.
    inv_factorial_lookup_table[MAX_ARRAY_SIZE - 1] = modularExponentiation(
        factorial_lookup_table[MAX_ARRAY_SIZE - 1],
        PRIME_MODULUS - 2
    );

    // Precompute remaining inverse factorials using the relation:
    // (k!)^(-1) = ((k+1)!)^(-1) * (k+1) % MOD
    for (let k = MAX_ARRAY_SIZE - 2; k >= 1; --k) {
        inv_factorial_lookup_table[k] = (inv_factorial_lookup_table[k + 1] * (k + 1)) % PRIME_MODULUS;
    }

    isInitializationComplete = true; // Mark initialization as complete.
};


/**
 * Main function to process input, calculate the result based on prime factorization
 * and combinations, and print the final answer.
 * @param {string} inputString The input string containing two space-separated numbers N and M.
 */
const processInputAndCalculate = (inputString) => {
    // Parse input numbers N and M.
    const [firstNum, secondNum] = inputString.trim().split(" ").map(Number);

    // Decompose M into its prime factors.
    const primeDecompositionResults = decomposeIntoPrimes(secondNum);

    // Ensure factorial tables are initialized.
    initializeFactorialTables();

    let finalResult = 1; // Initialize the accumulating result.

    // Iterate through each prime factor and its count.
    for (const factorInfo of primeDecompositionResults) {
        // For each prime factor p^e in M, we need to choose (N-1) positions
        // out of (e + N - 1) total positions for stars and bars problem.
        // This is equivalent to C(e + N - 1, N - 1) or C(e + N - 1, e).
        const numA = factorInfo.count + firstNum - 1; // Represents 'n' in C(n, r).
        let numB = factorInfo.count; // Represents 'r' in C(n, r), chosen as 'e'.

        // Apply C(n, r) = C(n, n-r) optimization to ensure 'r' is smaller.
        if (numA < 2 * numB) {
            numB = numA - numB;
        }

        // Multiply the current result by the combinations for this prime factor.
        finalResult = (finalResult * calculateCombinationsModP(numA, numB)) % PRIME_MODULUS;
    }

    console.log(finalResult); // Output the final calculated result.
};

// Read input from standard input and execute the main processing function.
processInputAndCalculate(require("fs").readFileSync("/dev/stdin", "utf8"));