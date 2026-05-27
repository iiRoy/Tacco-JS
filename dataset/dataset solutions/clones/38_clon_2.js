function calculatePrimes(upperBound) {
    // Initialize an array to store numbers and mark non-primes.
    // The index of the array corresponds to the number itself.
    let sieveData = [];

    // Populate the array with numbers from 0 up to the specified limit.
    for (let indexVal = 0; indexVal <= upperBound; indexVal++) {
        sieveData[indexVal] = indexVal;
    }

    // Numbers 0 and 1 are not considered prime.
    sieveData[0] = false;
    sieveData[1] = false;

    // Calculate the integer part of the square root of the upper bound.
    // This optimization is based on the Sieve of Eratosthenes algorithm.
    const limitForSieve = Math.floor(Math.sqrt(upperBound));

    // Iterate from the first prime number (2) up to the calculated limit.
    for (let currentPrimeCandidate = 2; currentPrimeCandidate <= limitForSieve; currentPrimeCandidate++) {
        // If the current number has already been marked as not prime, skip it.
        if (sieveData[currentPrimeCandidate] == false) {
            continue;
        }

        // If it's a prime, mark all its multiples as not prime.
        // Start marking from currentPrimeCandidate * 2 (i.e., currentPrimeCandidate + currentPrimeCandidate).
        for (let multipleMarker = currentPrimeCandidate + currentPrimeCandidate; multipleMarker <= upperBound; multipleMarker += currentPrimeCandidate) {
            sieveData[multipleMarker] = false;
        }
    }

    // Collect all numbers that remain marked as prime (not false) into a new list.
    let foundPrimes = [];
    for (let numToCheck = 0; numToCheck <= upperBound; numToCheck++) {
        if (sieveData[numToCheck] !== false) {
            foundPrimes.push(sieveData[numToCheck]);
        }
    }

    // Return the array containing all prime numbers up to 'upperBound'.
    return foundPrimes;
}

// Generate a list of prime numbers up to 999,999.
const precomputedPrimes = calculatePrimes(999999);

// Read all input data from standard input, assuming UTF-8 encoding.
const rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

// Process the raw input: remove leading/trailing whitespace,
// split the string into an array of lines, and convert each line to a number.
const queryNumbers = rawData.trim().split("\n").map(Number);

// Iterate through each number provided in the input queries.
for (let queryIndex = 0; queryIndex < queryNumbers.length; queryIndex++) {
    const targetValue = queryNumbers[queryIndex];
    let primeListIndex = 0; // This variable will count primes less than or equal to targetValue.

    // Iterate through the precomputed list of primes.
    // The loop continues as long as the current prime is less than or equal to the target value.
    for (; primeListIndex < precomputedPrimes.length; primeListIndex++) {
        // If a prime number is found that is greater than the target value,
        // it means all subsequent primes will also be greater, so we stop.
        if (precomputedPrimes[primeListIndex] > targetValue) {
            break;
        }
    }
    // Output the count of prime numbers that are less than or equal to the current target value.
    console.log(primeListIndex);
}
