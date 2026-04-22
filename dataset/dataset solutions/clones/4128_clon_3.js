'use strict';

(function(rawInputString) {
    /**
     * Parses a single line of space-separated numbers into an array of integers.
     * @param {string} lineContent - The string content of a single line.
     * @returns {number[]} An array of parsed integers.
     */
    const parseNumericLine = (lineContent) => {
        // Use Number.parseInt for explicit base-10 conversion, enhancing clarity over bitwise OR.
        return lineContent.split(' ').map(segment => Number.parseInt(segment, 10));
    };

    // The main processing function that encapsulates the entire logic.
    // It takes the raw input string and returns the formatted output string.
    const executePrimeQuerySolver = (inputData) => {
        // Clean and split the input into individual lines, then parse each line.
        // `inputDataLines` will be an array of arrays of numbers.
        const inputDataLines = inputData.trim().split('\n').map(parseNumericLine);

        // The first line contains a single number, which is the total number of queries.
        // We extract it and remove that line from the `inputDataLines` array.
        const totalQueryCount = inputDataLines.shift()[0];

        // Define the upper boundary for our sieve-like computation.
        // This value determines the size of the arrays used for primality testing and prefix sums.
        const SIEVE_MAX_LIMIT = 50000;

        // `isOddPrimeIndicator`: An array where `isOddPrimeIndicator[k]` is `true` if `(2*k + 1)`
        // is considered a prime number, and `false` otherwise.
        // Initialized assuming all odd numbers (represented by indices > 0) are prime candidates.
        let isOddPrimeIndicator = new Array(SIEVE_MAX_LIMIT).fill(true);
        // The number 1 (corresponding to `2*0 + 1`) is not prime.
        isOddPrimeIndicator[0] = false;
        // The number 3 (corresponding to `2*1 + 1`) is prime, so `isOddPrimeIndicator[1]` remains `true`.

        // `cumulativeSpecialPrimeCounts`: An array to store prefix sums.
        // `cumulativeSpecialPrimeCounts[k]` will eventually hold the count of "special" primes
        // up to the number `(k-1)` (using a 0-indexed representation for the problem's criteria).
        // A number `P` is "special" if `P` is an odd prime AND `(P+1)/2` is also a prime.
        let cumulativeSpecialPrimeCounts = new Array(SIEVE_MAX_LIMIT + 1).fill(0);

        // Special case initialization: The number 3 is prime, and (3+1)/2 = 2 is also prime.
        // This corresponds to `P = 2*1 + 1`, so `currentSieveIndex = 1`.
        // The condition in the main loop below (`currentSieveIndex % 2 === 0`) would skip `currentSieveIndex = 1`.
        // Therefore, this specific case needs to be set explicitly.
        // `cumulativeSpecialPrimeCounts[2]` represents the count for `P=1` or `P=3` based on how indexing is mapped.
        // Given `s[i+1]` in original, this corresponds to `currentSieveIndex = 1`, making it `cumulativeSpecialPrimeCounts[1+1] = cumulativeSpecialPrimeCounts[2]`.
        cumulativeSpecialPrimeCounts[2] = 1; // Represents the pair (3, 2)

        // Sieve of Eratosthenes adaptation to find odd primes and populate `cumulativeSpecialPrimeCounts`.
        // We iterate through `currentSieveIndex` from 1 up to `SIEVE_MAX_LIMIT - 1`.
        // `(2 * currentSieveIndex + 1)` represents the odd number being checked.
        for (let currentSieveIndex = 1; currentSieveIndex < SIEVE_MAX_LIMIT; ++currentSieveIndex) {
            // If `(2 * currentSieveIndex + 1)` has already been marked as composite, skip.
            if (!isOddPrimeIndicator[currentSieveIndex]) {
                continue;
            }

            // `currentOddPrimeValue` is the odd prime number corresponding to `currentSieveIndex`.
            const currentOddPrimeValue = (2 * currentSieveIndex) + 1;

            // Check the "special prime" condition:
            // `currentSieveIndex` must be even (meaning `currentOddPrimeValue` is of the form `4k+1`)
            // AND `(currentSieveIndex / 2)` must also correspond to an odd prime.
            // This effectively checks if `currentOddPrimeValue` is prime AND `(currentOddPrimeValue + 1) / 2` is prime.
            if (currentSieveIndex % 2 === 0 && isOddPrimeIndicator[currentSieveIndex / 2]) {
                // If both conditions are met, mark this point in the `cumulativeSpecialPrimeCounts` array.
                cumulativeSpecialPrimeCounts[currentSieveIndex + 1] = 1;
            }

            // Mark all multiples of `currentOddPrimeValue` as composite.
            // `multipleSieveIndex` refers to the index `k` such that `(2*k + 1)` is a multiple.
            // We start from `currentSieveIndex + currentOddPrimeValue` to avoid re-marking smaller multiples
            // that would have been handled by smaller prime factors.
            for (let multipleSieveIndex = currentSieveIndex + currentOddPrimeValue;
                 multipleSieveIndex < SIEVE_MAX_LIMIT;
                 multipleSieveIndex += currentOddPrimeValue) {
                isOddPrimeIndicator[multipleSieveIndex] = false;
            }
        }

        // Compute the actual prefix sums for `cumulativeSpecialPrimeCounts`.
        // After this loop, `cumulativeSpecialPrimeCounts[k]` will contain the total count
        // of "special" primes up to the index `k-1` (inclusive, as per problem indexing).
        for (let k = 2; k < SIEVE_MAX_LIMIT; ++k) {
            cumulativeSpecialPrimeCounts[k] += cumulativeSpecialPrimeCounts[k - 1];
        }

        // Array to store the calculated results for each query.
        const queryResultValues = [];

        // Process each of the `totalQueryCount` queries.
        // Each query `[L, R]` asks for the count of special primes in the range `[L, R]`.
        for (let queryIndex = 0; queryIndex < totalQueryCount; ++queryIndex) {
            // Extract the original lower and upper bounds from the input.
            const queryRangeLowerBound = inputDataLines[queryIndex][0];
            const queryRangeUpperBound = inputDataLines[queryIndex][1];

            // Convert the query bounds to indices suitable for accessing the
            // `cumulativeSpecialPrimeCounts` array, as specified by the problem.
            const adjustedLowerIndex = (queryRangeLowerBound - 1) / 2;
            const adjustedUpperIndex = (queryRangeUpperBound - 1) / 2 + 1;

            // Calculate the count for the current query using the prefix sum property:
            // `count(range [a, b]) = prefixSum[b+1] - prefixSum[a]`.
            // Here, it's `cumulativeSpecialPrimeCounts[adjustedUpperIndex] - cumulativeSpecialPrimeCounts[adjustedLowerIndex]`.
            queryResultValues.push(
                cumulativeSpecialPrimeCounts[adjustedUpperIndex] - cumulativeSpecialPrimeCounts[adjustedLowerIndex]
            );
        }

        // Join all the calculated results with newline characters and return the final string.
        return queryResultValues.join('\n');
    };

    // Execute the main solver function with the input read from standard input.
    // The result is then printed to the console.
    console.log(executePrimeQuerySolver(require('fs').readFileSync('/dev/stdin', 'utf8')));

})(''); // An empty string is passed to the IIFE, as the actual input comes from stdin.