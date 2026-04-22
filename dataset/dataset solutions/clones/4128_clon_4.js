'use strict';
console.log((function(rawDataContent) {
    const maximumValueForPrimeCalc = 50000;
    
    // Step 1: Generate primality flags using a standard Sieve of Eratosthenes.
    // This array indicates if an index (number) is prime.
    // Equivalent to the original 'a' array's underlying purpose for 's', but direct.
    const isNumberPrime = new Array(maximumValueForPrimeCalc + 1).fill(true);
    isNumberPrime[0] = false; // Zero is not a prime number
    isNumberPrime[1] = false; // One is not a prime number

    for (let candidate = 2; candidate * candidate <= maximumValueForPrimeCalc; candidate++) {
        if (isNumberPrime[candidate]) {
            for (let multiple = candidate * candidate; multiple <= maximumValueForPrimeCalc; multiple += candidate) {
                isNumberPrime[multiple] = false;
            }
        }
    }

    // Step 2: Compute prefix sums for prime counts.
    // This array stores the count of primes up to its index.
    // Equivalent to the original 's' array after its second loop.
    const primeCountPrefixSum = new Array(maximumValueForPrimeCalc + 1).fill(0);
    for (let numberIndex = 2; numberIndex <= maximumValueForPrimeCalc; numberIndex++) {
        primeCountPrefixSum[numberIndex] = primeCountPrefixSum[numberIndex - 1] + (isNumberPrime[numberIndex] ? 1 : 0);
    }
    // primeCountPrefixSum[0] and [1] correctly remain 0.

    // Step 3: Parse input data.
    const inputLines = rawDataContent.split('\n').filter(Boolean); // Filter out any empty lines
    const numberOfQueries = parseInt(inputLines[0].trim(), 10);
    
    // Map remaining lines into an array of query objects for clarity.
    const queryRequests = inputLines.slice(1, numberOfQueries + 1).map(line => {
        const valueParts = line.split(' ').filter(Boolean).map(val => parseInt(val.trim(), 10));
        return { initialLower: valueParts[0], initialUpper: valueParts[1] };
    });

    // Step 4: Process each query using a functional approach.
    const collectedResults = queryRequests.map(currentQuery => {
        // Replicate the original index transformation for query bounds.
        // Math.floor is used for robustness, though input constraints likely make it integer division.
        const derivedLowerIndex = Math.floor((currentQuery.initialLower - 1) / 2);
        const derivedUpperIndex = Math.floor((currentQuery.initialUpper - 1) / 2) + 1;
        
        // Calculate the difference in cumulative prime counts for the derived range.
        return primeCountPrefixSum[derivedUpperIndex] - primeCountPrefixSum[derivedLowerIndex];
    });

    // Step 5: Format and return the results.
    return collectedResults.join('\n');

}(require('fs').readFileSync('/dev/stdin', 'utf8')));