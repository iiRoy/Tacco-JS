const PRIME_MODULUS = 10**9 + 7; // A large prime number used for modular arithmetic operations.
const MAX_VAL = 10**5 + 1000; // Defines the maximum limit for precomputed factorial values.

// Arrays to store precomputed factorials and their modular multiplicative inverses.
let factorials = [...new Array(MAX_VAL)].fill(0);
let inverseFactorials = [...new Array(MAX_VAL)].fill(0);

/**
 * Decomposes a given positive integer into its prime factors and their exponents.
 * @param {number} inputNumber - The integer to be factorized.
 * @returns {Array<{primeVal: number, exponentVal: number}>} An array of objects,
 *   where each object contains a prime factor (`primeVal`) and its corresponding exponent (`exponentVal`).
 */
const primeDecomposition = (inputNumber) => {
    let primeFactors = []; // List to store the prime factors.
    let currentNumber = inputNumber; // A mutable copy of the input number for division.

    // Iterate from 2 up to the square root of the current number.
    for (let divisorCandidate = 2; divisorCandidate * divisorCandidate <= currentNumber; divisorCandidate++) {
        let powerCount = 0; // Counter for the exponent of the current prime candidate.
        // Continuously divide `currentNumber` by `divisorCandidate` as long as it's divisible.
        while (currentNumber % divisorCandidate === 0) {
            currentNumber /= divisorCandidate;
            powerCount++;
        }
        // If `divisorCandidate` was a factor, add it to the list with its exponent.
        if (powerCount > 0) {
            primeFactors.push({ primeVal: divisorCandidate, exponentVal: powerCount });
        }
    }

    // If `currentNumber` is still greater than 1 after the loop, it means the remaining `currentNumber`
    // is a prime factor itself (and its exponent is 1).
    if (currentNumber !== 1) {
        primeFactors.push({ primeVal: currentNumber, exponentVal: 1 });
    }
    return primeFactors;
};

/**
 * Computes (baseVal^expVal) modulo PRIME_MODULUS using the method of modular exponentiation (binary exponentiation).
 * This is efficient for large exponents.
 * @param {number} baseVal - The base of the exponentiation.
 * @param {number} expVal - The exponent.
 * @returns {number} The result of (baseVal^expVal) % PRIME_MODULUS.
 */
const modularExponentiation = (baseVal, expVal) => {
    let result = BigInt(1); // Initialize the result as a BigInt to prevent overflow during intermediate calculations.
    let currentBase = BigInt(baseVal); // Convert the base to BigInt.
    let exponent = expVal; // Use a local variable for the exponent.

    // Loop until the exponent becomes zero.
    while (exponent !== 0) {
        // If the least significant bit of the exponent is 1 (i.e., exponent is odd),
        // multiply the result by the current base.
        if (exponent & 1) {
            result = (result * currentBase) % BigInt(PRIME_MODULUS);
        }
        // Square the current base and take modulo.
        currentBase = (currentBase * currentBase) % BigInt(PRIME_MODULUS);
        // Right shift the exponent by 1 (equivalent to integer division by 2).
        exponent = exponent >> 1;
    }
    return Number(result); // Convert the final BigInt result back to a Number.
};

/**
 * Calculates the number of combinations (nCr) modulo PRIME_MODULUS.
 * It uses precomputed factorials and inverse factorials for efficiency.
 * @param {number} totalItems - The total number of items (n).
 * @param {number} chosenItems - The number of items to choose (r).
 * @returns {number} The value of nCr % PRIME_MODULUS. Returns 1 for invalid inputs (n < r or n < 0)
 *   to match the specific behavior of the original code, even if mathematically nCr is 0 in such cases.
 */
const combinations = (totalItems, chosenItems) => {
    // Special case: C(0, 0) is 1.
    if (totalItems === 0 && chosenItems === 0) return 1;
    // If totalItems is less than chosenItems or totalItems is negative, return 1 as per original code's behavior.
    if (totalItems < chosenItems || totalItems < 0) return 1;

    // Calculate (invFac[n-r] * invFac[r]) % MOD using BigInts for intermediate products.
    const tempResult = (BigInt(inverseFactorials[totalItems - chosenItems]) * BigInt(inverseFactorials[chosenItems])) % BigInt(PRIME_MODULUS);
    // Calculate (tempResult * fac[n]) % MOD.
    return Number((tempResult * BigInt(factorials[totalItems])) % BigInt(PRIME_MODULUS));
};

/**
 * Initializes the global `factorials` and `inverseFactorials` arrays.
 * This function precomputes (i!) % PRIME_MODULUS and (i!)^(-1) % PRIME_MODULUS
 * for all i from 0 up to MAX_VAL.
 * It must be called once before any `combinations` calculation.
 */
const initializePrecomputedValues = () => {
    factorials[0] = 1; // 0! = 1
    inverseFactorials[0] = 1; // (0!)^(-1) = 1

    // Loop to precompute factorials and their modular inverses.
    // The loop runs up to MAX_VAL, calculating factorials[MAX_VAL] and inverseFactorials[MAX_VAL].
    for (let loopIndex = 0; loopIndex < MAX_VAL; loopIndex++) {
        // Calculate (loopIndex+1)! % PRIME_MODULUS.
        factorials[loopIndex + 1] = (factorials[loopIndex] * (loopIndex + 1)) % PRIME_MODULUS;
        // Calculate the modular inverse of (loopIndex+1)! using Fermat's Little Theorem: a^(p-2) % p.
        inverseFactorials[loopIndex + 1] = modularExponentiation(factorials[loopIndex + 1], PRIME_MODULUS - 2);
    }
};

/**
 * The main entry point of the program. It processes the input, performs calculations,
 * and prints the final result to the console.
 * @param {string} inputString - The input string, expected to contain two space-separated numbers.
 */
const processInput = (inputString) => {
    // Parse the two numbers from the input string.
    let [numN, numM] = inputString.split(" ").map(Number);

    // Obtain the prime factorization of `numM`.
    let primeFactorList = primeDecomposition(numM);

    let finalAnswer = 1; // Initialize the accumulator for the final result.

    // Call the initialization function to populate factorial arrays.
    initializePrecomputedValues();

    // Iterate through each prime factor in the list.
    // Object.keys(primeFactorList) is used to iterate over array indices as strings.
    Object.keys(primeFactorList).forEach(factorKey => {
        // For each prime factor p^e in m, we need to calculate C(e + n - 1, e).
        // This is a stars and bars problem: distributing 'e' identical items into 'n' distinct bins.
        let exponentValue = primeFactorList[factorKey].exponentVal;
        let upperBound = exponentValue + numN - 1; // Corresponds to 'n' in C(n, r).
        let lowerBound = exponentValue; // Corresponds to 'r' in C(n, r).

        // Apply the property C(N, R) = C(N, N-R) to choose the smaller 'r' for calculation,
        // which can sometimes be more efficient (though not strictly necessary here).
        if (upperBound < 2 * lowerBound) {
            lowerBound = upperBound - lowerBound;
        }

        // Multiply the current `finalAnswer` by the combination result and take modulo.
        finalAnswer = (finalAnswer * combinations(upperBound, lowerBound)) % PRIME_MODULUS;
    });

    // Output the final calculated answer.
    console.log(finalAnswer);
};

// Read the input from standard input and pass it to the main processing function.
processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
