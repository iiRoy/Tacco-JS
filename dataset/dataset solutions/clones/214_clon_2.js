function calculatePrimes(upperBound) {
    // This function identifies all prime numbers up to a given limit using the Sieve of Eratosthenes algorithm.

    let booleanSieve = []; // Initialize an array to mark numbers as prime or non-prime.

    // Populate the sieve array. Initially, assume all numbers are potentially prime.
    for (let idx = 0; idx <= upperBound; idx++) {
        booleanSieve[idx] = idx;
    }

    // Numbers 0 and 1 are not considered prime, so mark them as such.
    booleanSieve[0] = false;
    booleanSieve[1] = false;

    // Calculate the integer part of the square root of the upper bound.
    // We only need to check for prime factors up to this limit.
    const limitSquareRoot = Math.floor(Math.sqrt(upperBound));

    // Begin the sieving process.
    // Iterate from the first prime number (2) up to the calculated square root limit.
    for (let idx = 2; idx <= limitSquareRoot; idx++) {
        // If the current number 'idx' has already been marked as non-prime, skip it.
        // This means it's a multiple of a smaller prime already processed.
        if (booleanSieve[idx] === false) {
            continue;
        }

        // If 'idx' is prime, mark all its multiples as non-prime.
        // Start marking from idx * idx, as smaller multiples would have been marked by previous primes.
        // (However, the original code starts from i+i, which is also correct for marking multiples)
        for (let innerIdx = idx + idx; innerIdx <= upperBound; innerIdx += idx) {
            booleanSieve[innerIdx] = false; // Mark the multiple as non-prime.
        }
    }

    // After the sieving process, collect all numbers that are still marked as prime.
    let foundPrimes = [];
    for (let idx = 0; idx <= upperBound; idx++) {
        if (booleanSieve[idx] !== false) {
            foundPrimes.push(booleanSieve[idx]); // Add the prime number to the result list.
        }
    }

    // Return the final list of prime numbers found within the specified range.
    return foundPrimes;
}

// Execute the prime calculation function to get a list of primes up to 999,999.
const primeNumbersList = calculatePrimes(999999);

// Load the Node.js built-in file system module.
const fileSystemModule = require('fs');

// Read the entire content of standard input synchronously.
// The input is assumed to be UTF-8 encoded.
const rawInputData = fileSystemModule.readFileSync('/dev/stdin', 'utf8');

// Process the raw input string:
// 1. Remove any leading or trailing whitespace.
// 2. Split the string into an array of lines, using the newline character as a delimiter.
// 3. Convert each resulting string element in the array to a numeric type.
const numericInputArray = rawInputData.trim().split("\n").map(Number);

// Iterate through each number obtained from the processed input.
for (let entryIndex = 0; entryIndex < numericInputArray.length; entryIndex++) {
    const currentEntryValue = numericInputArray[entryIndex];

    // If the current number is 0, it signals the end of the input sequence.
    // Terminate the loop in this case.
    if (currentEntryValue === 0) {
        break;
    }

    // Initialize a variable to store the cumulative sum of prime numbers.
    let accumulatedSum = 0;

    // Sum the first 'currentEntryValue' prime numbers from the pre-calculated list.
    for (let primeIndex = 0; primeIndex < currentEntryValue; primeIndex++) {
        accumulatedSum += primeNumbersList[primeIndex];
    }

    // Output the calculated sum to the console.
    console.log(accumulatedSum);
}