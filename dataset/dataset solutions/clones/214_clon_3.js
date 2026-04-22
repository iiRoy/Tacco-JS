/**
 * Computes a list of prime numbers up to a specified upper bound
 * using the Sieve of Eratosthenes algorithm.
 * @param {number} upperBound - The maximum number to check for primality.
 * @returns {number[]} An array containing all prime numbers up to `upperBound`.
 */
function calculatePrimes(upperBound) {
    // Input validation: ensure a positive integer limit.
    if (typeof upperBound !== 'number' || !Number.isInteger(upperBound) || upperBound < 0) {
        console.error("Invalid upper bound provided. Must be a non-negative integer.");
        return []; // Return an empty array for invalid input.
    }

    // Handle edge cases for small upper bounds.
    if (upperBound < 2) {
        return [];
    }

    // Initialize a boolean array 'isPrime' where isPrime[i] is true if i is potentially prime.
    // All numbers start as potentially prime.
    const isPrime = new Array(upperBound + 1).fill(true);

    // Mark 0 and 1 as not prime, as per definition.
    isPrime[0] = false;
    isPrime[1] = false;

    // Iterate from 2 up to the square root of the upperBound.
    // Any composite number 'n' must have a prime factor less than or equal to sqrt(n).
    for (let currentNum = 2; currentNum * currentNum <= upperBound; currentNum++) {
        // If currentNum is not prime, skip to the next number.
        // It means it's a multiple of an earlier prime and its multiples are already handled.
        if (!isPrime[currentNum]) {
            continue;
        }

        // If currentNum is prime, mark all its multiples as not prime.
        // We start marking from currentNum * currentNum because smaller multiples
        // (e.g., 2*currentNum, 3*currentNum) would have already been marked by smaller prime factors.
        for (let multiple = currentNum * currentNum; multiple <= upperBound; multiple += currentNum) {
            isPrime[multiple] = false;
        }
    }

    // Collect all numbers that are still marked as prime into a result array.
    const primeNumbers = [];
    // Using a different loop structure for collection
    let collectorIndex = 0;
    while (collectorIndex <= upperBound) {
        if (isPrime[collectorIndex]) {
            primeNumbers.push(collectorIndex);
        }
        collectorIndex++;
    }

    return primeNumbers;
}

// Define a constant for the upper bound of prime number generation.
const MAX_PRIME_GENERATION_LIMIT = 999999;

// Pre-calculate a list of prime numbers up to the defined limit.
// This is an expensive operation, so it's done once at the start.
const cachedPrimes = calculatePrimes(MAX_PRIME_GENERATION_LIMIT);

// To efficiently answer sum queries, pre-calculate the cumulative sums of the primes.
// prefixSums[k] will store the sum of the first k prime numbers.
const prefixSums = new Array(cachedPrimes.length + 1).fill(0);
// Populate the prefix sums array.
for (let k = 0; k < cachedPrimes.length; k++) {
    prefixSums[k + 1] = prefixSums[k] + cachedPrimes[k];
}

/**
 * Retrieves the sum of the first 'count' prime numbers using a precomputed array.
 * @param {number} count - The number of primes to sum.
 * @returns {number} The sum of the first 'count' primes.
 */
function getSumOfNPrimes(count) {
    // Basic validation for the requested count.
    if (typeof count !== 'number' || !Number.isInteger(count) || count < 0) {
        console.warn(`Attempted to get sum for an invalid count: ${count}. Returning 0.`);
        return 0;
    }
    // If the requested count exceeds the number of precomputed primes,
    // we cap it at the maximum available to prevent out-of-bounds access.
    // The original code would implicitly cap it or throw an error.
    const effectiveCount = Math.min(count, cachedPrimes.length);
    return prefixSums[effectiveCount];
}

// Module for file system operations.
const fileSystemModule = require('fs');

// Main execution block for processing input queries.
try {
    // Read all input data from standard input, assuming UTF-8 encoding.
    const rawSystemInput = fileSystemModule.readFileSync('/dev/stdin', 'utf8');

    // Process the raw input: trim whitespace, split into lines, convert to numbers.
    // Filter out any non-finite (e.g., NaN) results from number conversion for robustness.
    const numericQueries = rawSystemInput
        .trim()
        .split('\n')
        .map(Number)
        .filter(Number.isFinite);

    // Iterate through each numeric query provided in the input.
    for (const currentQueryValue of numericQueries) {
        // A query value of 0 is a termination signal, as per original logic.
        if (currentQueryValue === 0) {
            // Log a message for clarity before breaking, as a Type III addition.
            // console.log("Termination signal (0) received. Stopping further processing.");
            break;
        }

        // Validate if the query value is within reasonable bounds for summation.
        // It must be non-negative and not exceed the total number of cached primes.
        if (currentQueryValue < 0 || currentQueryValue > cachedPrimes.length) {
            console.warn(`Query ${currentQueryValue} is out of valid range [0, ${cachedPrimes.length}]. Skipping or handling as 0.`);
            // As a Type III variation, we could output 0 or skip. Let's output 0.
            console.log(0);
            continue; // Move to the next query.
        }

        // Calculate and print the sum of the first 'currentQueryValue' primes.
        const sumResult = getSumOfNPrimes(currentQueryValue);
        console.log(sumResult);
    }
} catch (inputError) {
    // Catch and report any errors that occur during file reading or input processing.
    console.error("An error occurred during input handling:", inputError.message);
    // Optionally, exit the process or provide a default behavior here.
}