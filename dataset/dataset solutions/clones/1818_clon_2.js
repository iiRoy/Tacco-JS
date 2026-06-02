"use strict";

// Read raw input from standard input
let rawData = require("fs").readFileSync("/dev/stdin", "utf8");

// Process the raw input: trim whitespace, then split by spaces or newlines
let tokenStream = rawData.trim().split(/ |\n/),
    tokenIndex = 0; // Initialize an index for token consumption

// Execute the primary calculation function and print its string representation
console.log(calculateFactorialSum().toString());

/**
 * Main function to calculate the sum of terms based on prime factorization.
 * This algorithm determines how many times a number can be represented as a sum
 * of consecutive integers (1, 1+2, 1+2+3, etc.) for each prime factor's exponent.
 *
 * @returns {number} The total count of terms.
 */
function calculateFactorialSum() {
    // Extract the initial number from the token stream and convert it to a number
    let currentNum = +tokenStream.shift();

    // Generate a list of prime numbers up to the square root of the current number
    let primeFactors = generatePrimesUpTo(Math.sqrt(currentNum));

    // Handle edge cases for the input number
    if (currentNum === 1) return 0; // If the number is 1, the result is 0
    if (currentNum === 2) return 1; // If the number is 2, the result is 1

    let totalCount = 0; // Accumulator for the final result
    let currentPrime = 2; // Initialize with the first prime number

    // Iterate through the list of pre-calculated prime factors
    for (let primeIdx = 0; currentPrime < currentNum; primeIdx++) {
        currentPrime = primeFactors[primeIdx]; // Get the next prime from the list

        // The following block is commented out in the original code,
        // indicating it's not actively used for dynamic prime generation here.
        // while (primeFactors[primeFactors.length - 1] < currentNum) {
        //    primeFactors.push(findNextPrime(primeFactors, currentNum));
        // }
        // console.log({ currentPrime, primeFactors }); // Original debug line, also commented out

        let exponent = 0; // Counter for the exponent of the current prime factor

        // Continuously divide currentNum by currentPrime as long as it's divisible
        while (currentNum % currentPrime === 0) {
            exponent++; // Increment the exponent
            currentNum = currentNum / currentPrime; // Reduce currentNum
        }

        // If the current prime was not a factor of currentNum, skip to the next prime
        if (exponent === 0) continue;

        // Calculate the maximum 'i' such that 1 + 2 + ... + i <= exponent.
        // This is equivalent to finding 'i' where i*(i+1)/2 <= exponent.
        let termCounter = 1; // Represents 'i' in the sum 1+2+...+i
        let currentSum = 1; // Represents the sum 1+2+...+i

        // Loop to find the largest sum of consecutive integers less than or equal to the exponent
        while (currentSum + termCounter + 1 <= exponent) {
            // console.log(currentSum, termCounter, exponent); // Original debug line, commented out
            currentSum = currentSum + termCounter + 1; // Update the sum
            termCounter++; // Increment the term counter
        }
        totalCount = totalCount + termCounter; // Add the found term count to the total
    }

    // After iterating through all known primes, if currentNum is still greater than 1,
    // it means the remaining currentNum is a prime factor itself (larger than sqrt(original N)).
    if (currentNum > 1) totalCount++;

    return totalCount; // Return the final calculated total
}

/**
 * Generates a list of prime numbers up to a specified limit using a basic sieve-like approach.
 *
 * @param {number} limitVal - The upper bound for prime generation.
 * @returns {number[]} An array containing prime numbers up to limitVal.
 */
function generatePrimesUpTo(limitVal) {
    let primeList = [2, 3]; // Initialize with the first two prime numbers
    let isPrimeFlag; // Flag to mark if a candidate number is prime (0 for true, 1 for false)

    // Iterate through odd numbers starting from 5
    for (let candidateNum = 5; candidateNum <= limitVal; candidateNum += 2) {
        isPrimeFlag = 0; // Assume the current candidateNum is prime

        // Check for divisibility by primes already found, up to the square root of candidateNum
        for (let divisorIdx = 0; primeList[divisorIdx] * primeList[divisorIdx] <= candidateNum; divisorIdx++) {
            if (candidateNum % primeList[divisorIdx] === 0) {
                isPrimeFlag = 1; // If divisible, it's not prime
                break; // No need to check further divisors for this candidateNum
            }
        }

        // If the flag remains 0, candidateNum is prime, so add it to the list
        if (isPrimeFlag === 0) {
            primeList.push(candidateNum);
        }
    }
    return primeList; // Return the complete list of primes
}

/**
 * Finds the next prime number greater than the last prime in the given list, up to an upper bound.
 * This function is present in the original code but commented out in the main logic.
 *
 * @param {number[]} knownPrimes - An array of already known prime numbers.
 * @param {number} upperBound - The maximum value to search for the next prime.
 * @returns {number|number[]} The next prime found, or the updated knownPrimes array if no prime is found within the bound.
 */
function findNextPrime(knownPrimes, upperBound) {
    let isPrimeFlag; // Flag to indicate primality

    // Start checking from the number two greater than the last known prime (ensuring it's odd)
    for (let testNum = knownPrimes[knownPrimes.length - 1] + 2; testNum <= upperBound; testNum += 2) {
        isPrimeFlag = 0; // Assume testNum is prime

        // Check for divisibility by primes in the knownPrimes list
        for (let checkIdx = 0; knownPrimes[checkIdx] * knownPrimes[checkIdx] <= testNum; checkIdx++) {
            if (testNum % knownPrimes[checkIdx] === 0) {
                isPrimeFlag = 1; // If divisible, it's not prime
                break; // Stop checking for this testNum
            }
        }

        // If testNum is prime, add it to the list and return it
        if (isPrimeFlag === 0) {
            knownPrimes.push(testNum);
            return testNum;
        }
    }
    // If no prime is found within the specified range, return the (potentially updated) list of known primes.
    return knownPrimes;
}
