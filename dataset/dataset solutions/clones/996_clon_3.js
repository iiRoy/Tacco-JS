// This module is responsible for reading numerical data from standard input
// and then identifying and counting prime numbers among the provided values.

// Define the source path for input data and the character used to separate records.
const SOURCE_FILE_PATH = '/dev/stdin';
const LINE_DELIMITER = '\n';

// Acquire the Node.js file system utility to interact with files.
const fsModule = require('fs');

// Read the complete content from the specified input source,
// decode it as a UTF-8 string, and then split it into an array of individual string records.
const rawInputRecords = fsModule.readFileSync(SOURCE_FILE_PATH, 'utf-8').split(LINE_DELIMITER);

/**
 * Determines whether a given positive integer is a prime number.
 * A prime number is a natural number greater than 1 that has no positive divisors other than 1 and itself.
 *
 * @param {number} testedNumber - The integer value to assess for primality.
 * @returns {boolean} - Returns `true` if the `testedNumber` is prime, `false` otherwise.
 */
const verifyNumberPrimality = (testedNumber) => {
    // Numbers less than 2 are, by definition, not prime.
    if (testedNumber < 2) {
        return false;
    }
    // The number 2 is the only even prime number.
    if (testedNumber === 2) {
        return true;
    }
    // All other even numbers greater than 2 are not prime, as they are divisible by 2.
    if (testedNumber % 2 === 0) {
        return false;
    }

    // Optimization: We only need to check for odd divisors up to the square root of the tested number.
    // If a number has a divisor larger than its square root, it must also have a smaller one.
    let potentialDivisor = 3;
    const upperLimitForDivisor = Math.sqrt(testedNumber);

    // Iterate through odd numbers as potential divisors.
    while (potentialDivisor <= upperLimitForDivisor) {
        if (testedNumber % potentialDivisor === 0) {
            return false; // If a divisor is found, the number is not prime.
        }
        potentialDivisor += 2; // Move to the next odd number.
    }

    // If no divisors were found within the checks, the number is prime.
    return true;
};

/**
 * Iterates through a collection of string data entries, converts them into numeric values,
 * and then counts how many of these numeric values are prime numbers.
 * The function assumes the first entry in the array is a header or metadata and skips it.
 *
 * @param {string[]} stringDataEntries - An array where each element is a string representation of a number.
 * @returns {number} - The total count of prime numbers identified in the input data.
 */
const countPrimesFromInput = (stringDataEntries) => {
    let countedPrimeNumbers = 0; // Initialize a counter for prime numbers found.

    // Process each entry starting from the second element (index 1),
    // effectively skipping the first element which might be a header.
    for (let currentIdx = 1; currentIdx < stringDataEntries.length; currentIdx++) {
        const currentStringEntry = stringDataEntries[currentIdx];

        // Convert the string entry into a number. `Number()` is used for robust conversion.
        const parsedNumericValue = Number(currentStringEntry);

        // Input validation: Ensure the parsed value is a valid non-negative integer.
        // Prime numbers are defined for positive integers.
        if (isNaN(parsedNumericValue) || !Number.isInteger(parsedNumericValue) || parsedNumericValue < 0) {
            // If the entry is not a valid positive integer, skip it and proceed to the next.
            continue;
        }

        // Check if the current valid numeric value is prime using our helper function.
        if (verifyNumberPrimality(parsedNumericValue)) {
            countedPrimeNumbers++; // Increment the counter if it's a prime number.
        }
    }

    return countedPrimeNumbers; // Return the final tally.
};

// Execute the primary logic: process the raw input lines and determine the count of primes.
const finalPrimeNumbersTally = countPrimesFromInput(rawInputRecords);

// Output the computed total number of primes to the console.
console.log(finalPrimeNumbersTally);