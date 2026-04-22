"use strict";

// A small utility function to handle console output.
const outputResult = (valueToLog) => {
    console.log(valueToLog);
};

/**
 * Orchestrates the full process: computes special numbers and processes query ranges.
 * @param {string} rawInputContent - The complete string content read from the input source.
 */
function ProcessQueries(rawInputContent) {
    // Split the entire input content into an array of individual lines.
    let inputSourceLines = rawInputContent.split("\n");

    // --- Configuration: Define the maximum value for our calculations ---
    const CALCULATION_LIMIT = 101010;

    // --- Module 1: Pre-calculation of Primality using Optimized Sieve ---
    // Initialize a boolean array; 'true' means potentially prime, 'false' means composite.
    let isNumberPrime = new Array(CALCULATION_LIMIT).fill(true);
    // By definition, 0 and 1 are not considered prime numbers.
    isNumberPrime[0] = isNumberPrime[1] = false;

    // The Sieve of Eratosthenes: iterate up to the square root of the limit.
    for (let currentCandidate = 2; currentCandidate * currentCandidate < CALCULATION_LIMIT; ++currentCandidate) {
        // If 'currentCandidate' is still marked as prime, then its multiples are composite.
        if (isNumberPrime[currentCandidate]) {
            // Mark all multiples of 'currentCandidate' as composite.
            // Optimization: start marking from currentCandidate * currentCandidate,
            // as smaller multiples would have already been marked by smaller prime factors.
            for (let multipleOfPrime = currentCandidate * currentCandidate; multipleOfPrime < CALCULATION_LIMIT; multipleOfPrime += currentCandidate) {
                isNumberPrime[multipleOfPrime] = false;
            }
        }
    }

    // --- Module 2: Identification of "2017-like" Specific Numbers ---
    // A number 'N' is "2017-like" if 'N' is prime AND '(N+1)/2' is also prime.
    // We'll store these findings in an array, using 1 for true and 0 for false.
    let twentySeventeenLikeFlags = new Array(CALCULATION_LIMIT).fill(0);

    // Iterate through potential numbers, focusing only on odd numbers (as even primes are just 2, and (N+1)/2 would be odd).
    for (let currentNumber = 1; currentNumber < CALCULATION_LIMIT; currentNumber += 2) {
        // Calculate the required "half-plus-one" value.
        const relatedHalfValue = (currentNumber + 1) / 2;

        // Check if the current number is prime, AND if its related half-value is also prime.
        // Also, ensure the related half-value is within our pre-calculated primality range.
        if (isNumberPrime[currentNumber] && relatedHalfValue < CALCULATION_LIMIT && isNumberPrime[relatedHalfValue]) {
            twentySeventeenLikeFlags[currentNumber] = 1;
        }
    }

    // --- Module 3: Computation of Prefix Sums for Efficient Range Queries ---
    // Create an array to store cumulative counts of "2017-like" numbers.
    // `prefixSumCounts[k]` will store the total count of such numbers up to index `k-1`.
    let cumulativeCounts = new Array(CALCULATION_LIMIT + 1).fill(0);
    for (let elementIndex = 0; elementIndex < CALCULATION_LIMIT; ++elementIndex) {
        cumulativeCounts[elementIndex + 1] = cumulativeCounts[elementIndex] + twentySeventeenLikeFlags[elementIndex];
    }

    // --- Module 4: Processing User-Defined Range Queries ---
    // Extract the total number of queries from the first line of input.
    const numberOfQueriesString = inputSourceLines.shift();
    // Basic validation for the query count.
    if (!numberOfQueriesString || typeof numberOfQueriesString !== 'string') {
        console.error("Input error: Could not read the number of queries.");
        return;
    }
    const totalQueryCount = Number(numberOfQueriesString.trim());

    if (isNaN(totalQueryCount) || totalQueryCount < 0) {
        console.error("Input error: Invalid or negative number of queries provided.");
        return;
    }

    // Process each query one by one.
    for (let queryIteration = 0; queryIteration < totalQueryCount; ++queryIteration) {
        const currentQueryLine = inputSourceLines.shift();
        // Validate each query line.
        if (!currentQueryLine || typeof currentQueryLine !== 'string') {
            console.error(`Query processing error: Missing input line for query ${queryIteration + 1}.`);
            outputResult(0); // Output 0 for malformed queries.
            continue;
        }

        // Parse the two range bounds (L and R) from the current query line.
        const queryRangeTokens = currentQueryLine.split(/\s+/).map(Number);

        // Further validation for the parsed range values.
        if (queryRangeTokens.length !== 2 || isNaN(queryRangeTokens[0]) || isNaN(queryRangeTokens[1])) {
            console.error(`Query processing error: Invalid range format for query ${queryIteration + 1}. Expected two numbers.`);
            outputResult(0);
            continue;
        }

        let rangeStart = queryRangeTokens[0];
        let rangeEnd = queryRangeTokens[1];

        // Additional validation for query bounds against the pre-calculated limits.
        if (rangeStart < 1 || rangeEnd >= CALCULATION_LIMIT || rangeStart > rangeEnd) {
            console.error(`Query warning: Bounds [${rangeStart}, ${rangeEnd}] for query ${queryIteration + 1} are out of valid range or malformed. Returning 0.`);
            outputResult(0);
            continue;
        }

        // Calculate the count of 2017-like numbers within the given range [rangeStart, rangeEnd].
        // This is done by subtracting cumulative sum up to (rangeStart-1) from cumulative sum up to rangeEnd.
        const countWithinRange = cumulativeCounts[rangeEnd + 1] - cumulativeCounts[rangeStart];
        outputResult(countWithinRange);
    }
}

// --- Main Execution Entry Point ---
// Define the standard input file path.
const STANDARD_INPUT_FILE_PATH = "/dev/stdin";

try {
    // Read the entire content of the standard input file.
    const fileContent = require("fs").readFileSync(STANDARD_INPUT_FILE_PATH, "utf8");
    // Pass the content to the main processing function.
    ProcessQueries(fileContent);
} catch (executionError) {
    // Handle any errors that occur during file reading or processing.
    console.error("Runtime Exception: An error occurred during program execution:", executionError.message);
    // Exit the process with an error code.
    process.exit(1);
}