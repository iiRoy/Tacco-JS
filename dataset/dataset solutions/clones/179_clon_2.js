function findPrimes(upperBound) {
    // Initialize an array to represent the sieve.
    let sieveArray = [];

    // Populate the array with numbers from 0 to the upper limit.
    for (let idx = 0; idx <= upperBound; idx++) {
        sieveArray[idx] = idx;
    }

    // Mark 0 and 1 as not prime numbers.
    sieveArray[0] = false;
    sieveArray[1] = false;

    // Calculate the square root of the upper bound for optimization in the sieve process.
    const limitSqrt = Math.floor(Math.sqrt(upperBound));

    // Iterate from 2 up to the square root of the upper bound.
    for (let idx = 2; idx <= limitSqrt; idx++) {
        // If the current number is already marked as not prime, skip to the next number.
        if (sieveArray[idx] === false) {
            continue;
        }

        // Mark all multiples of the current prime number as not prime.
        for (let multipleIdx = idx + idx; multipleIdx <= upperBound; multipleIdx += idx) {
            sieveArray[multipleIdx] = false;
        }
    }

    // Create a new array to store only the prime numbers found.
    const primeNumbersList = [];

    // Iterate through the sieve array and collect all numbers that are still marked as prime.
    for (let idx = 0; idx <= upperBound; idx++) {
        if (sieveArray[idx] !== false) {
            primeNumbersList.push(sieveArray[idx]);
        }
    }
    // Return the list of prime numbers.
    return primeNumbersList;
}

// Generate a list of prime numbers up to 999,999 using the sieve method.
const calculatedPrimes = findPrimes(999999);

// Read input data from standard input, assuming UTF-8 encoding.
const rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

// Process the raw input: trim whitespace, split by newline, and convert each part to a number.
const inputNumbers = (rawData.trim()).split("\n").map(Number);

// Iterate through each number provided in the input.
for (let idx = 0; idx < inputNumbers.length; idx++) {
    const currentNum = inputNumbers[idx];

    // Search for the current input number within the pre-calculated list of primes.
    for (let multipleIdx = 0; multipleIdx < calculatedPrimes.length; multipleIdx++) {
        // If the current prime in the list matches the input number,
        // print its preceding and succeeding primes.
        if (calculatedPrimes[multipleIdx] === currentNum) {
            console.log(calculatedPrimes[multipleIdx - 1] + " " + calculatedPrimes[multipleIdx + 1]);
            break; // Exit the inner loop once a match is found.
        }
        // If the current prime in the list is greater than the input number,
        // print its preceding prime and itself (as the next prime).
        if (calculatedPrimes[multipleIdx] > currentNum) {
            console.log(calculatedPrimes[multipleIdx - 1] + " " + calculatedPrimes[multipleIdx]);
            break; // Exit the inner loop.
        }
    }
}
