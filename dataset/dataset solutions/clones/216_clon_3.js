// This module handles standard input operations using Node.js's 'fs' module.
const nodeIO = require('fs');

// --- Input Processing Utility ---
/**
 * Reads and processes input from stdin, returning an array of trimmed, non-empty lines.
 * Handles potential errors during file system operations.
 * @returns {string[]} An array of cleaned input lines.
 */
function acquireInputLines() {
    let streamSize;
    try {
        streamSize = nodeIO.fstatSync(process.stdin.fd).size;
    } catch (ioError) {
        // Log a more informative error and exit if stdin cannot be accessed.
        console.error(`FATAL: Could not determine stdin size. Error: ${ioError.message}`);
        process.exit(1);
    }

    if (streamSize === 0) {
        return []; // Return an empty array if no input is provided.
    }

    const rawBuffer = Buffer.alloc(streamSize);
    let bytesTransferred;
    try {
        bytesTransferred = nodeIO.readSync(process.stdin.fd, rawBuffer, 0, streamSize, 0);
    } catch (ioError) {
        console.error(`FATAL: Failed to read from stdin. Error: ${ioError.message}`);
        process.exit(1);
    }

    // Convert buffer to string, split by newline, trim each line, and filter out any resulting empty strings.
    // This ensures only meaningful input values are processed.
    const cleanLines = rawBuffer.toString('utf8', 0, bytesTransferred)
                                .split('\n')
                                .map(lineSegment => lineSegment.trim()) // Remove leading/trailing whitespace
                                .filter(trimmedLine => trimmedLine.length > 0); // Discard blank lines

    return cleanLines;
}

// Immediately execute the main program flow after defining necessary functions.
initializeAndExecute();

// --- Main Program Orchestration ---
/**
 * Orchestrates the program's execution: acquires input, generates prime sums,
 * and processes each input value to output the corresponding sum.
 */
function initializeAndExecute() {
    // Acquire and preprocess input lines from stdin.
    const processedInputValues = acquireInputLines();

    // Define the maximum number up to which prime sums will be pre-calculated.
    // This value is hardcoded for consistency with the original problem's scope.
    const PRIME_UPPER_BOUND = 10000;

    // Generate the lookup table for cumulative sums of primes.
    // `cumulativePrimeSumsLookup[k]` will store the sum of the first `k` primes.
    const cumulativePrimeSumsLookup = generateCumulativePrimeSums(PRIME_UPPER_BOUND);

    // Validate the generated lookup table.
    if (!cumulativePrimeSumsLookup || cumulativePrimeSumsLookup.length === 0) {
        console.error("CRITICAL: Prime sum lookup table could not be generated. Aborting.");
        return; // Terminate execution if generation failed.
    }

    // Process each input value received from stdin.
    for (const singleInputValue of processedInputValues) {
        const numericInputIndex = parseInt(singleInputValue, 10); // Parse string to integer with base 10.

        // Implement robust input validation.
        // Check for NaN, negative values, and values exceeding the pre-calculated range.
        if (isNaN(numericInputIndex) || numericInputIndex < 0 || numericInputIndex >= cumulativePrimeSumsLookup.length) {
            // Non-essential error logging for invalid inputs - can be removed to simplify.
            // console.error(`WARNING: Skipping invalid or out-of-range input: '${singleInputValue}'. Expected a non-negative integer within [0, ${cumulativePrimeSumsLookup.length - 1}].`);
            continue; // Skip to the next input if current one is invalid.
        }

        // Retrieve and output the pre-calculated sum of primes.
        // Using `process.stdout.write` for potentially higher performance in competitive programming scenarios.
        process.stdout.write(`${cumulativePrimeSumsLookup[numericInputIndex]}\n`);
    }
}

// --- Prime Number Sieve and Cumulative Sum Generation ---
/**
 * Computes a lookup table containing the cumulative sum of the first 'k' prime numbers.
 * This is achieved by first using a Sieve of Eratosthenes to identify primes,
 * then iterating through the primes to build the cumulative sum array.
 * @param {number} limitForPrimes - The upper limit for numbers to be considered in the sieve.
 * @returns {Int32Array} An array where `resultArray[k]` is the sum of the first `k` primes.
 */
function generateCumulativePrimeSums(limitForPrimes) {
    // Pre-validation for the upper limit.
    if (limitForPrimes < 2 || !Number.isInteger(limitForPrimes)) {
        console.error(`ERROR: Invalid limit for prime calculation: ${limitForPrimes}. Must be an integer >= 2.`);
        return new Int32Array(0); // Return an empty array to signal failure.
    }

    // Initialize a boolean-like array for the Sieve of Eratosthenes.
    // `0` indicates potentially prime, `1` indicates composite.
    // `Uint8Array` is memory-efficient for boolean flags.
    const compositeMarkers = new Uint8Array(limitForPrimes + 1).fill(0);

    // Explicitly mark 0 and 1 as non-prime (composite for the purpose of the sieve).
    compositeMarkers[0] = 1;
    compositeMarkers[1] = 1;

    // Sieve process: iterate up to the square root of the limit.
    // Any composite number `N` has at least one prime factor `p <= sqrt(N)`.
    const sieveBoundary = Math.floor(Math.sqrt(limitForPrimes));
    for (let currentNum = 2; currentNum <= sieveBoundary; ++currentNum) {
        // If `currentNum` is currently marked as prime (value is 0).
        if (compositeMarkers[currentNum] === 0) {
            // Mark all multiples of `currentNum` as composite.
            // Optimization: start marking from `currentNum * currentNum` because
            // smaller multiples (e.g., `2*currentNum`, `3*currentNum`) would have
            // already been marked by their respective smaller prime factors.
            for (let mult = currentNum * currentNum; mult <= limitForPrimes; mult += currentNum) {
                compositeMarkers[mult] = 1; // Mark as composite.
            }
        }
    }

    // Now, calculate the cumulative sums of primes.
    // `cumulativeSumResult[k]` will store the sum of the first `k` primes.
    const cumulativeSumResult = new Int32Array(limitForPrimes + 1).fill(0);
    let currentTotalSum = 0;
    let primeOrdinalCount = 0; // Tracks the ordinal position of the prime (1st, 2nd, 3rd, etc.)

    // Iterate through numbers from 2 up to the limit.
    for (let candidateNumber = 2; candidateNumber <= limitForPrimes; ++candidateNumber) {
        // If `candidateNumber` is identified as prime (marked 0 in the sieve).
        if (compositeMarkers[candidateNumber] === 0) {
            currentTotalSum += candidateNumber; // Add the prime to the running total.
            primeOrdinalCount++; // Increment the count of primes found.
            // Store the current cumulative sum at the index corresponding to its ordinal position.
            cumulativeSumResult[primeOrdinalCount] = currentTotalSum;
        }
    }

    // Return the array containing cumulative sums.
    // Indices beyond `primeOrdinalCount` (the actual number of primes found) will remain 0,
    // which is the intended behavior for inputs requesting sums of non-existent primes.
    return cumulativeSumResult;
}