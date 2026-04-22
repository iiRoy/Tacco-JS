const fileSystemModule = require('fs');

// Utility function to safely read standard input synchronously.
// This approach reads the entire content at once, which is suitable for moderate input sizes.
let rawInputContent = '';
try {
    rawInputContent = fileSystemModule.readFileSync(process.stdin.fd, 'utf8');
} catch (errorReadingInput) {
    // If there's an error, log it and exit. This provides more robust error handling.
    console.error("Failed to read standard input:", errorReadingInput.message);
    process.exit(1);
}

// Process the raw input: split into lines and remove any empty lines,
// which often include a trailing newline character from the input stream.
const processedInputLines = rawInputContent
    .split('\n')
    .filter(lineText => lineText.trim() !== '');

// Initiate the primary application logic.
// This function orchestrates the entire process from prime generation to query handling.
executePrimeNumberQuery();

/**
 * Main entry point function for the application.
 * It coordinates the generation of prime numbers and the processing of input queries.
 */
function executePrimeNumberQuery() {
    // Generate a pre-calculated list of prime numbers up to a specified limit.
    // This is an optimization to avoid repeated calculations for each input.
    const primeNumberCache = buildPrimeLookupTable();

    // Perform a crucial validation: ensure the prime cache was successfully populated.
    if (!primeNumberCache || primeNumberCache.length === 0) {
        console.error("Critical Error: The prime number cache is empty or could not be generated.");
        return; // Terminate execution if primes are unavailable.
    }

    // Iterate through each valid line of input provided.
    for (let currentInputString of processedInputLines) {
        // Attempt to convert the string input into a numerical value.
        const queryValue = Number(currentInputString);

        // Robust input validation: check for non-numeric, non-integer, or negative inputs.
        if (isNaN(queryValue) || !Number.isInteger(queryValue) || queryValue < 0) {
            console.error(`Warning: Skipping invalid input line '${currentInputString}'. Must be a positive integer.`);
            continue; // Skip to the next input line if the current one is invalid.
        }

        // Find the prime numbers that are immediately below and above/equal to the query value.
        const { primeBelow, primeAbove } = findBoundingPrimes(queryValue, primeNumberCache);

        // Output the found prime numbers, formatted as two space-separated values.
        console.log(`${primeBelow} ${primeAbove}`);
    }
}

/**
 * Generates an ordered array of prime numbers up to a defined maximum using the Sieve of Eratosthenes.
 * This method is efficient for finding all primes within a specific range.
 * @returns {number[]} An array containing all prime numbers found, sorted ascendingly.
 */
function buildPrimeLookupTable() {
    // The upper boundary for prime number calculation. This constant is chosen based on problem constraints.
    const SIEVE_MAXIMUM_VALUE = 50023;

    // Guard clause: The sieve algorithm requires a limit of at least 2 to produce meaningful results.
    if (SIEVE_MAXIMUM_VALUE < 2) {
        return []; // Return an empty array if the limit is too low.
    }

    // Initialize a boolean array; `isNotPrime[i]` will be true if `i` is composite (not prime).
    // All numbers are initially assumed prime (`false`), then marked as composite.
    let isNotPrime = new Array(SIEVE_MAXIMUM_VALUE + 1).fill(false);

    // According to mathematical definition, 0 and 1 are not prime numbers.
    isNotPrime[0] = true;
    isNotPrime[1] = true;

    // Iterate from 2 up to the square root of the maximum value.
    // This is an optimization for the Sieve of Eratosthenes.
    const squareRootOfMax = Math.sqrt(SIEVE_MAXIMUM_VALUE);
    for (let candidatePrime = 2; candidatePrime <= squareRootOfMax; candidatePrime++) {
        // If `candidatePrime` has not been marked as composite, then it is indeed a prime.
        if (!isNotPrime[candidatePrime]) {
            // Mark all multiples of this prime as composite.
            // Start from `candidatePrime * candidatePrime` because smaller multiples
            // would have already been marked by previous, smaller prime numbers.
            for (let multiple = candidatePrime * candidatePrime; multiple <= SIEVE_MAXIMUM_VALUE; multiple += candidatePrime) {
                isNotPrime[multiple] = true;
            }
        }
    }

    // After the sieving process, collect all numbers that remain unmarked (i.e., are prime).
    const resultingPrimesList = [];
    for (let numToCheck = 0; numToCheck <= SIEVE_MAXIMUM_VALUE; numToCheck++) {
        if (!isNotPrime[numToCheck]) {
            resultingPrimesList.push(numToCheck);
        }
    }

    return resultingPrimesList;
}

/**
 * Locates the prime numbers that immediately bound a given target value within a sorted list of primes.
 * This function assumes `primesArray` is sorted in ascending order.
 * @param {number} targetValue The integer for which to find the bounding primes.
 * @param {number[]} primesArray A pre-computed, sorted array of prime numbers.
 * @returns {{primeBelow: number, primeAbove: number}} An object containing the largest prime less than `targetValue`
 *          and the smallest prime greater than or equal to `targetValue`.
 *          If `targetValue` is less than or equal to 2, `primeBelow` will be 0.
 *          If `targetValue` is greater than the largest prime in `primesArray`, `primeAbove` will be the largest prime.
 */
function findBoundingPrimes(targetValue, primesArray) {
    let primeBelow = 0; // Default to 0, typically for inputs like 0, 1, 2 where no prime is strictly less than.
    let primeAbove = 0;

    // Iterate through the pre-computed primes array.
    // This linear scan is conceptually similar to the original code's approach.
    for (let primeIndex = 0; primeIndex < primesArray.length; primeIndex++) {
        const currentPrimeEntry = primesArray[primeIndex];
        const nextPrimeEntry = primesArray[primeIndex + 1]; // This might be `undefined` for the last prime.

        // If the current prime is strictly less than the target value, it's a candidate for `primeBelow`.
        if (currentPrimeEntry < targetValue) {
            primeBelow = currentPrimeEntry;
        }

        // If the current prime is greater than or equal to the target value,
        // it is the smallest prime that satisfies the `primeAbove` condition.
        // Once found, we can stop the search.
        if (currentPrimeEntry >= targetValue) {
            primeAbove = currentPrimeEntry;
            break; // Exit loop early as `primeAbove` is found.
        }

        // This check handles cases where the target value falls between two consecutive primes.
        // `currentPrimeEntry` becomes `primeBelow` and `nextPrimeEntry` becomes `primeAbove`.
        if (nextPrimeEntry !== undefined && currentPrimeEntry < targetValue && nextPrimeEntry > targetValue) {
            primeBelow = currentPrimeEntry;
            primeAbove = nextPrimeEntry;
            break; // Exit loop early.
        }
    }

    // Additional robustness for edge cases:
    // If `targetValue` is larger than all primes in `primesArray`, `primeAbove` might still be 0.
    // In such a scenario (assuming inputs are within the sieve range as per typical problem constraints),
    // we would set `primeAbove` to the largest precomputed prime.
    if (primeAbove === 0 && primesArray.length > 0) {
        primeAbove = primesArray[primesArray.length - 1]; // Set to the largest prime available.
        // Also, `primeBelow` would naturally be the largest prime if the loop completed.
        primeBelow = primesArray[primesArray.length - 1];
    } else if (targetValue <= 2 && primesArray.length > 0) {
        // For target values 0, 1, 2, the `primeBelow` is 0, and `primeAbove` is 2.
        // This ensures consistent output for small numbers.
        if (targetValue < primesArray[0]) { // If targetValue is less than the smallest prime (which is 2)
             primeAbove = primesArray[0]; // Set primeAbove to 2.
             primeBelow = 0; // primeBelow remains 0.
        }
    }


    return { primeBelow: primeBelow, primeAbove: primeAbove };
}