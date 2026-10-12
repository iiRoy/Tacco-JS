var primeStorage = [-1, 2, 3, 5, 7, 11, 13]; // Stores pre-calculated prime numbers

/**
 * Retrieves the prime number at a specific 0-based index.
 * If the prime is not yet cached, it calculates and stores it.
 * @param {number} targetIndex The index of the prime number to retrieve.
 * @returns {number} The prime number at the given index.
 */
function fetchPrimeByIndex(targetIndex) {
    // Check if the prime is already in our cache
    if (primeStorage[targetIndex]) {
        return primeStorage[targetIndex];
    }

    // If not found, we need to extend our list of primes.
    let lastKnownIndex = primeStorage.length - 1;
    let lastKnownPrimeValue = primeStorage[lastKnownIndex];

    // Start searching for the next prime from the last known prime + 2 (skipping even numbers)
    for (let currentCandidate = lastKnownPrimeValue + 2; ; currentCandidate += 2) {
        // If the current candidate number is prime
        if (checkIfPrime(currentCandidate)) {
            lastKnownIndex++; // Increment the index of the last known prime
            primeStorage[lastKnownIndex] = currentCandidate; // Store the new prime

            // If we've reached our target index, return this prime
            if (lastKnownIndex === targetIndex) {
                return currentCandidate;
            }
        }
    }
}

/**
 * Determines if a given number is a prime number.
 * Uses an optimized 6k ± 1 primality test.
 * @param {number} numberToTest The number to check for primality.
 * @returns {boolean} True if the number is prime, false otherwise.
 */
function checkIfPrime(numberToTest) {
    // Basic check for divisibility by 3 (excluding 3 itself, but context ensures numberToTest > 3)
    if (numberToTest % 3 === 0) {
        return false;
    }

    // Calculate the square root limit for divisors
    const testLimit = Math.round(Math.sqrt(numberToTest));
    let multiplier = 1;

    // Iterate using the 6k ± 1 rule
    while (multiplier * 6 - 1 <= testLimit) {
        // Check for divisibility by (6k - 1) or (6k + 1)
        if (numberToTest % (multiplier * 6 - 1) === 0 || numberToTest % (multiplier * 6 + 1) === 0) {
            return false; // Not prime if divisible
        }
        multiplier++;
    }
    return true; // If no divisors found, it's prime
}

// Read input from standard input
const fileData = require('fs').readFileSync('/dev/stdin', 'utf8');
const dataLines = fileData.split('\n');

let currentDataLine;
// Process each line of input
while ((currentDataLine = dataLines.shift())) {
    const parsedNumber = +currentDataLine; // Convert the line to a number

    // If the input number is 0, terminate the program
    if (parsedNumber === 0) {
        break;
    }

    let cumulativeSum = 0; // Initialize sum for the current input number

    // Iterate from the input number down to 1
    for (let primePosition = parsedNumber; primePosition > 0; primePosition--) {
        // Add the prime number at the current position to the cumulative sum
        cumulativeSum += fetchPrimeByIndex(primePosition);
    }
    // Output the calculated sum to the console
    console.log(cumulativeSum);
}
