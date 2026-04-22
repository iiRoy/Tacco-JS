// This module provides functionality to identify prime numbers up to a specified threshold
// and then locate neighboring primes for a list of query values.
// This is a Type III clone, demonstrating extensive modifications in structure,
// variable naming, data types, and control flow, while preserving core functionality.

/**
 * Generates a list of prime numbers up to a given upper limit using an optimized Sieve of Eratosthenes.
 * Non-prime numbers are marked with 'null' in the intermediate array.
 *
 * @param {number} upperBoundary - The inclusive maximum number to check for primality.
 * @returns {number[]} An array containing all prime numbers less than or equal to `upperBoundary`.
 */
const obtainPrimesBelowThreshold = (upperBoundary) => {
    // Input validation: Ensure the boundary is a positive integer suitable for primality testing.
    if (upperBoundary < 2 || !Number.isInteger(upperBoundary)) {
        // For limits less than 2, there are no primes.
        return [];
    }

    // Initialize an array where each index represents a number,
    // and its value is the number itself. This array will be used as the sieve.
    // Numbers will be marked as non-prime by setting their value to `null`.
    const primeCandidateGrid = Array.from({ length: upperBoundary + 1 }, (_, index) => index);

    // Explicitly mark 0 and 1 as non-prime.
    primeCandidateGrid[0] = null;
    primeCandidateGrid[1] = null;

    // The sieve process: Iterate from 2 up to the square root of the upper boundary.
    // All multiples of a prime factor are marked as non-prime.
    // We only need to check up to the square root because any composite number 'n'
    // will have at least one prime factor less than or equal to sqrt(n).
    const sieveIterationLimit = Math.floor(Math.sqrt(upperBoundary));
    for (let currentPrimeFactor = 2; currentPrimeFactor <= sieveIterationLimit; currentPrimeFactor++) {
        // If the current number has already been marked as non-prime (null), skip it.
        // It means it's a multiple of a smaller prime and not a prime itself.
        if (primeCandidateGrid[currentPrimeFactor] === null) {
            continue;
        }

        // If currentPrimeFactor is not null, it means it's a prime.
        // Mark all its multiples as non-prime, starting from its square.
        // Multiples smaller than currentPrimeFactor * currentPrimeFactor
        // would have already been marked by smaller prime factors.
        for (let multipleToMark = currentPrimeFactor * currentPrimeFactor; multipleToMark <= upperBoundary; multipleToMark += currentPrimeFactor) {
            primeCandidateGrid[multipleToMark] = null;
        }
    }

    // Filter out all the 'null' entries to collect the actual prime numbers.
    const identifiedPrimesCollection = primeCandidateGrid.filter(val => val !== null);

    return identifiedPrimesCollection;
};

/**
 * Performs a binary search on a sorted array of primes to find the target value
 * or its insertion point, determining if the target itself is prime.
 *
 * @param {number} valueToLocate - The number to search for.
 * @param {number[]} orderedPrimeList - A sorted array of prime numbers.
 * @returns {{ index: number, isPrime: boolean }} An object containing the index
 *          (either where the value is found, or where it would be inserted)
 *          and a boolean indicating if the value was found (is prime).
 */
const locatePrimeOrInsertionPoint = (valueToLocate, orderedPrimeList) => {
    let lowIndex = 0;
    let highIndex = orderedPrimeList.length - 1;
    let potentialInsertionPoint = 0;

    while (lowIndex <= highIndex) {
        const midIndex = Math.floor((lowIndex + highIndex) / 2);
        if (orderedPrimeList[midIndex] === valueToLocate) {
            return { index: midIndex, isPrime: true };
        } else if (orderedPrimeList[midIndex] < valueToLocate) {
            lowIndex = midIndex + 1;
        } else {
            highIndex = midIndex - 1;
        }
    }
    // If the loop completes, valueToLocate was not found. `lowIndex` is the
    // position where it would be inserted to maintain sorted order.
    return { index: lowIndex, isPrime: false };
};

// --- Main Program Execution ---

// Define the maximum limit for prime calculation.
const GLOBAL_PRIME_CALC_LIMIT = 999999;

// Pre-compute the list of primes up to the defined limit.
const precomputedPrimesCache = obtainPrimesBelowThreshold(GLOBAL_PRIME_CALC_LIMIT);

// Attempt to read input from standard input.
// Includes error handling for file system operations.
let rawInputContent = '';
try {
    rawInputContent = require('fs').readFileSync('/dev/stdin', 'utf8');
} catch (fileError) {
    console.error("Error reading input from /dev/stdin:", fileError.message);
    // Exit or provide default behavior if input cannot be read.
    process.exit(1);
}

// Process the raw input: trim whitespace, split by newlines, and convert each line to a number.
const numericalQueryTargets = rawInputContent
    .trim()
    .split('\n')
    .map(Number);

// Iterate through each queried number to find its neighboring primes.
for (let queryIterator = 0; queryIterator < numericalQueryTargets.length; queryIterator++) {
    const currentQueryValue = numericalQueryTargets[queryIterator];

    // Use the helper function to locate the query value within the precomputed primes.
    const { index: searchResultIndex, isPrime: isQueryValuePrime } = locatePrimeOrInsertionPoint(currentQueryValue, precomputedPrimesCache);

    let outputPairString = null; // Will store the formatted string for console output.

    if (isQueryValuePrime) {
        // If the current query value is a prime number,
        // output the prime immediately before it and the prime immediately after it.
        // Handle boundary conditions for the first and last primes gracefully (will output 'undefined').
        const precedingPrime = (searchResultIndex > 0) ? precomputedPrimesCache[searchResultIndex - 1] : undefined;
        const succeedingPrime = (searchResultIndex < precomputedPrimesCache.length - 1) ? precomputedPrimesCache[searchResultIndex + 1] : undefined;
        outputPairString = `${precedingPrime} ${succeedingPrime}`;
    } else {
        // If the current query value is not a prime number,
        // output the largest prime less than it and the smallest prime greater than it.
        // `searchResultIndex` here points to the first prime greater than `currentQueryValue`.
        // Handle cases where no such primes exist (e.g., query value is smaller than 2, or larger than max prime).
        if (searchResultIndex < precomputedPrimesCache.length) {
            const precedingPrime = (searchResultIndex > 0) ? precomputedPrimesCache[searchResultIndex - 1] : undefined;
            const succeedingPrime = precomputedPrimesCache[searchResultIndex]; // This is the first prime strictly greater than currentQueryValue.
            outputPairString = `${precedingPrime} ${succeedingPrime}`;
        }
        // If searchResultIndex >= precomputedPrimesCache.length, it means currentQueryValue is
        // greater than all precomputed primes. In this case, the original code produced no output,
        // so we leave outputPairString as null.
    }

    // Print the generated string if a valid pair was found according to the logic.
    if (outputPairString !== null) {
        console.log(outputPairString);
    }
}