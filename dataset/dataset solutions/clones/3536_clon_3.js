const PRIME_MODULUS = 1000000007; // A large prime number used for modular operations.

// This constant defines the maximum value for 'n' in combinations (nCk) that we need to support.
// It's calculated considering the maximum possible value for 'n' (10^5) plus
// the maximum exponent 'e' (approx. log_2(10^9) which is around 30 for M=10^9),
// ensuring our factorial caches cover all required indices for (e + n - 1).
const MAX_COMB_VALUE = 100000 + 35;

// Arrays to cache pre-calculated factorials and their modular multiplicative inverses.
// These are initialized and populated once to speed up combination calculations.
let factorialCache = Array(MAX_COMB_VALUE).fill(0);
let modInverseFactorials = Array(MAX_COMB_VALUE).fill(0);

/**
 * Performs modular multiplication of two numbers, preventing intermediate overflow.
 * This technique is crucial when numbers can be large (up to PRIME_MODULUS - 1) and their product
 * might exceed JavaScript's safe integer limit (2^53), but still needs to be precise.
 * It splits one operand into high and low bit parts.
 * @param {number} operandA The first number to multiply.
 * @param {number} operandB The second number to multiply.
 * @returns {number} The result of (operandA * operandB) % PRIME_MODULUS.
 */
const performModularMultiplication = (operandA, operandB) => {
    const BITS_FOR_SPLIT = 16; // Using 16 bits (65536) for splitting numbers
    const LOW_BITS_MASK = (1 << BITS_FOR_SPLIT) - 1; // Mask for the lower part

    const aHighPart = operandA >>> BITS_FOR_SPLIT; // Unsigned right shift to get high part
    const aLowPart = operandA & LOW_BITS_MASK;     // Bitwise AND to get low part

    // Calculate (aHighPart * operandB * (2^BITS_FOR_SPLIT) + aLowPart * operandB) % PRIME_MODULUS
    // The terms (aHighPart * operandB) and (aLowPart * operandB) should fit within safe integer limits.
    let termFromHighPart = (aHighPart * operandB) % PRIME_MODULUS;
    termFromHighPart = (termFromHighPart * (1 << BITS_FOR_SPLIT)) % PRIME_MODULUS;

    let termFromLowPart = (aLowPart * operandB) % PRIME_MODULUS;

    // Sum the two resulting terms and apply modulo one last time.
    return (termFromHighPart + termFromLowPart) % PRIME_MODULUS;
};

/**
 * Decomposes a given positive integer into its prime factors along with their respective exponents.
 * For example, getPrimeFactorsWithExponents(72) would return [{ primeBase: 2, power: 3 }, { primeBase: 3, power: 2 }].
 * @param {number} numberToFactor The positive integer to be factorized.
 * @returns {Array<Object>} An array of objects, each with 'primeBase' and 'power' properties.
 */
const getPrimeFactorsWithExponents = (numberToFactor) => {
    let currentMutableNumber = numberToFactor;
    if (currentMutableNumber <= 1) {
        return []; // Numbers less than or equal to 1 have no prime factors.
    }

    let discoveredPrimeFactors = [];
    let potentialDivisor = 2; // Start checking divisibility from the smallest prime

    // Loop through potential divisors up to the square root of the current number.
    while (potentialDivisor * potentialDivisor <= currentMutableNumber) {
        let countOfExponent = 0;
        // If the current potentialDivisor divides the number
        if (currentMutableNumber % potentialDivisor === 0) {
            // Keep dividing and counting until it's no longer divisible
            while (currentMutableNumber % potentialDivisor === 0) {
                currentMutableNumber /= potentialDivisor;
                countOfExponent++;
            }
            // Record the prime factor and its exponent
            discoveredPrimeFactors.push({ primeBase: potentialDivisor, power: countOfExponent });
        }
        potentialDivisor++; // Increment to the next potential divisor
    }
    
    // If, after the loop, the number is still greater than 1, it means the remaining
    // 'currentMutableNumber' is itself a prime factor (larger than any divisor checked).
    if (currentMutableNumber > 1) {
        discoveredPrimeFactors.push({ primeBase: currentMutableNumber, power: 1 });
    }
    return discoveredPrimeFactors;
};

/**
 * Computes (base ^ exponent) % PRIME_MODULUS efficiently using the method of modular exponentiation
 * (also known as exponentiation by squaring). This significantly reduces the number of multiplications.
 * @param {number} base The base number.
 * @param {number} exponent The power to raise the base to.
 * @returns {number} The result of (base ^ exponent) % PRIME_MODULUS.
 */
const modularExponentiation = (base, exponent) => {
    let computedResult = 1; // The accumulator for the final result
    let currentBaseValue = base; // A temporary variable for the base, which will be squared
    let currentExponentValue = exponent; // A temporary variable for the exponent, which will be halved

    // Handle cases where exponent might be negative (though not expected for this problem)
    if (currentExponentValue < 0) {
        // For negative exponents, one would typically need modular inverse of base^|exponent|.
        // For this problem's context, exponents are non-negative.
        return 0; 
    }

    // Loop until the exponent becomes zero
    while (currentExponentValue > 0) {
        // If the least significant bit of the exponent is 1 (i.e., exponent is odd)
        if ((currentExponentValue & 1) !== 0) {
            computedResult = performModularMultiplication(computedResult, currentBaseValue);
        }
        // Square the current base value and halve the exponent for the next iteration
        currentBaseValue = performModularMultiplication(currentBaseValue, currentBaseValue);
        currentExponentValue >>>= 1; // Unsigned right shift, equivalent to Math.floor(exponent / 2)
    }
    return computedResult;
};

/**
 * Calculates combinations (nCr) modulo PRIME_MODULUS using precomputed factorials and their modular inverses.
 * The formula used is nCr = n! * (r!)^(-1) * ((n-r)!)^(-1) (mod P), where (X)^(-1) is the modular multiplicative inverse.
 * @param {number} n_val The 'n' in nCr (upper limit).
 * @param {number} r_val The 'r' in nCr (lower limit).
 * @returns {number} The result of nCr % PRIME_MODULUS.
 */
const calculateCombinationsMod = (n_val, r_val) => {
    // Handle edge cases for combination calculation
    if (n_val < 0 || r_val < 0 || n_val < r_val) {
        return 0; // Invalid inputs or nCr is 0
    }
    if (n_val === 0 && r_val === 0) {
        return 1; // 0C0 is defined as 1
    }

    // Retrieve precomputed factorial of n_val
    const numeratorFact = factorialCache[n_val];
    
    // Retrieve precomputed modular inverses for r_val! and (n_val - r_val)!
    const inverseDenom1 = modInverseFactorials[r_val];
    const inverseDenom2 = modInverseFactorials[n_val - r_val];

    // Perform the multiplications modulo PRIME_MODULUS
    let productStep1 = performModularMultiplication(numeratorFact, inverseDenom1);
    const finalCombinationValue = performModularMultiplication(productStep1, inverseDenom2);

    return finalCombinationValue;
};

/**
 * Initializes the global factorialCache and modInverseFactorials arrays up to MAX_COMB_VALUE.
 * This precomputation is a one-time setup that makes subsequent combination calculations very fast.
 * It uses Fermat's Little Theorem for modular inverses: a^(P-2) % P is the inverse of a % P for prime P.
 */
const initializeFactorialsAndInverses = () => {
    // Set base cases for factorials and their inverses
    factorialCache[0] = 1;
    modInverseFactorials[0] = 1;

    // Populate factorialCache iteratively: factorialCache[k+1] = factorialCache[k] * (k+1)
    for (let k = 0; k < MAX_COMB_VALUE - 1; k++) {
        const nextIndex = k + 1;
        factorialCache[nextIndex] = performModularMultiplication(factorialCache[k], nextIndex);
    }

    // Calculate the modular inverse of the largest factorial (MAX_COMB_VALUE - 1)! first.
    // This is done using modular exponentiation: (X!)^(PRIME_MODULUS - 2) % PRIME_MODULUS.
    const largestFactorial = factorialCache[MAX_COMB_VALUE - 1];
    modInverseFactorials[MAX_COMB_VALUE - 1] = modularExponentiation(largestFactorial, PRIME_MODULUS - 2);

    // Populate modInverseFactorials working backwards from the largest factorial:
    // (k!)^-1 = ((k+1)!)^-1 * (k+1) % PRIME_MODULUS
    for (let k = MAX_COMB_VALUE - 2; k >= 0; k--) {
        const nextIndex = k + 1;
        modInverseFactorials[k] = performModularMultiplication(modInverseFactorials[nextIndex], nextIndex);
    }
};

/**
 * The main processing function. It reads two numbers (n and m),
 * calculates the number of ways to distribute 'm' items into 'n' distinct bins,
 * where 'm' is a product of prime powers. This translates to a stars and bars problem
 * for each prime factor.
 * @param {string} inputDataString The raw input string, typically "n m".
 */
const processInputAndCalculate = (inputDataString) => {
    // Parse the input string, splitting by whitespace and converting to numbers.
    const numericInputs = inputDataString.trim().split(/\s+/).map(Number);

    // Basic input validation: ensure two valid numbers are provided.
    if (numericInputs.length !== 2 || numericInputs.some(isNaN)) {
        // In a strict competitive programming context, error messages are usually omitted.
        // console.error("Input format error: Expected two space-separated numbers.");
        return;
    }

    let numberOfBins = numericInputs[0];    // Corresponds to 'n' in the problem statement
    let valueToFactorize = numericInputs[1]; // Corresponds to 'm' in the problem statement

    // Further validation for problem constraints.
    if (numberOfBins <= 0 || valueToFactorize <= 0) {
        // console.error("Input numbers must be positive integers.");
        return;
    }

    // Perform one-time initialization of factorial and inverse factorial caches.
    initializeFactorialsAndInverses();

    // Get the prime factorization of 'm'.
    // Example: if m=12, primeFactorizationResult = [{primeBase: 2, power: 2}, {primeBase: 3, power: 1}]
    const primeFactorizationResult = getPrimeFactorsWithExponents(valueToFactorize);

    let overallFinalResult = 1; // Initialize the result accumulator for modular multiplication.

    // Iterate through each unique prime factor and its exponent found in 'm'.
    // For each prime p with exponent e (i.e., p^e is a factor of m),
    // we need to find the number of ways to distribute 'e' identical items (the prime p)
    // into 'n' distinct bins. This is a classic stars and bars problem,
    // which is solved by C(e + n - 1, e) or C(e + n - 1, n - 1).
    for (const factorDetail of primeFactorizationResult) {
        const currentPrimeExponent = factorDetail.power;
        
        // n' = (exponent + numberOfBins - 1)
        // k' = (exponent)
        // This is calculating C(currentPrimeExponent + numberOfBins - 1, currentPrimeExponent).
        const n_for_combination = currentPrimeExponent + numberOfBins - 1;
        const k_for_combination = currentPrimeExponent;

        const currentFactorContribution = calculateCombinationsMod(n_for_combination, k_for_combination);
        
        // Multiply this contribution into the overall result using modular multiplication.
        overallFinalResult = performModularMultiplication(overallFinalResult, currentFactorContribution);
    }

    // Output the final calculated result to standard output.
    console.log(overallFinalResult);
};

// Read input from standard in and execute the main processing function.
processInputAndCalculate(require("fs").readFileSync("/dev/stdin", "utf8"));