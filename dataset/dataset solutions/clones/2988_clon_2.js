'use strict'; // Enforce stricter parsing and error handling in the code.

function PrincipalRoutine(dataSource) { // Main entry point for processing input data.
    // Convert the input string to a number, ensuring it's trimmed first.
    const upperBound = Number(dataSource.trim());

    // Handle the base case where the number is 1, as it has no proper divisors other than 1 itself.
    if (upperBound === 1) {
        console.log(0); // For N=1, the result is 0.
        return; // Exit the function early.
    }

    // Calculate an upper bound for the Sieve of Eratosthenes.
    // We only need primes up to sqrt(N) to factorize N efficiently.
    const limitValue = Math.floor(Math.sqrt(upperBound)) + 1;

    // Initialize an array to track primality of numbers up to limitValue.
    // 'true' means potentially prime, 'false' means composite.
    const isPrimality = [];
    for (let idx = 0; idx < limitValue; idx++) {
        isPrimality[idx] = true; // Assume all numbers are prime initially.
    }

    // 0 and 1 are not considered prime numbers.
    isPrimality[0] = isPrimality[1] = false;

    // Implement the Sieve of Eratosthenes algorithm.
    // Iterate from 2 up to the calculated limit.
    for (let idx = 0; idx < limitValue; idx++) {
        // If the current number is not prime, skip it.
        if (!isPrimality[idx]) {
            continue;
        }
        // If it's prime, mark all its multiples as composite.
        // Start marking from 2*idx, as 1*idx would be idx itself.
        for (let subIdx = 2; idx * subIdx <= limitValue; subIdx++) {
            isPrimality[idx * subIdx] = false; // Mark multiple as non-prime.
        }
    }

    // Collect all prime numbers found by the sieve into a separate array.
    const primeNumbers = [];
    for (let idx = 0; idx <= limitValue; idx++) {
        if (isPrimality[idx]) {
            primeNumbers.push(idx); // Add prime to the list.
        }
    }

    // Initialize an array to store the exponents of each prime factor of upperBound.
    const primeExponents = [];
    for (let idx = 0; idx <= primeNumbers.length; idx++) {
        primeExponents[idx] = 0; // Set initial exponent to zero for all primes.
    }

    let currentProduct = 1; // Tracks the product of prime factors found so far.
    let idx = 0; // Index for iterating through the primeNumbers array.

    // Perform prime factorization of upperBound.
    while (currentProduct < upperBound) {
        // While upperBound is divisible by (currentProduct * current prime),
        // it means the current prime is a factor.
        while (upperBound % (currentProduct * primeNumbers[idx]) === 0) {
            primeExponents[idx]++; // Increment the exponent for this prime.
            currentProduct *= primeNumbers[idx]; // Update the product.
        }
        idx++; // Move to the next prime number.
        // If we've exhausted all known primes, break the loop.
        if (idx === primeNumbers.length) {
            break;
        }
    }

    // Consolidate the prime factors and their exponents into a list of [prime, exponent] pairs.
    const primeFactorList = [];
    primeExponents.forEach(function(exponentVal, idx) {
        if (exponentVal >= 1) { // Only include primes that are actual factors (exponent >= 1).
            primeFactorList.push([primeNumbers[idx], exponentVal]);
        }
    });

    // Special handling: if upperBound itself is a prime larger than limitValue,
    // or if it's 1 and the loop above didn't find factors,
    // this ensures it's added as a factor [N, 1].
    if (primeFactorList.length === 0) {
        primeFactorList.push([upperBound, 1]);
    }

    let finalResult = 0; // Variable to accumulate the final sum.
    const currentDivisor = []; // Array to store the components of the current divisor being evaluated.

    // Calculate the total number of unique divisors for upperBound.
    // This is done by multiplying (exponent + 1) for each prime factor.
    const totalCombinations = primeFactorList.reduce((accumulator, currentItem) => {
        return accumulator * (currentItem[1] + 1);
    }, 1);

    // Iterate through all possible divisor combinations.
    // Each 'loopCounter' value uniquely maps to a set of exponents for the prime factors.
    for (let loopCounter = 0; loopCounter < totalCombinations; loopCounter++) {
        let tempValue = loopCounter; // Temporary value used for exponent decomposition.
        // Deconstruct the 'loopCounter' into specific exponents for each prime factor.
        primeFactorList.forEach(function(currentItem, idx) {
            let basePrime = currentItem[0]; // The prime factor itself.
            let maxExponent = currentItem[1]; // The maximum exponent for this prime in upperBound.
            // Calculate the current exponent for this prime factor.
            currentDivisor[idx] = [basePrime, tempValue % (maxExponent + 1)];
            // Update tempValue to get the next exponent.
            tempValue = Math.floor(tempValue / (maxExponent + 1));
        });

        // Reconstruct the actual divisor candidate from its prime factor components.
        let divisorCandidate = currentDivisor.reduce((accumulator, currentItem) => {
            return accumulator * (Math.pow(currentItem[0], currentItem[1]));
        }, 1);

        // Check the condition: if (N/divisor - 1) > divisor, add (N/divisor - 1) to the result.
        // This is equivalent to checking if N > divisor * (divisor + 1).
        // It's part of a specific problem (e.g., sum of divisors related problem).
        if ((upperBound / divisorCandidate) - 1 > divisorCandidate) {
            finalResult += (upperBound / divisorCandidate) - 1;
        }
    }

    // Output the final computed result.
    console.log(finalResult);
}

// Global function to load modules.
const moduleLoader = require;

// Access the file system module.
const fileSystemOperations = moduleLoader('fs');

// Read content from standard input and pass it to the main routine.
PrincipalRoutine(fileSystemOperations.readFileSync('/dev/stdin', 'utf8'));