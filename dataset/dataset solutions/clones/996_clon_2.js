const fileSystemUtil = require('fs');

/*
 * Application settings for input file processing.
 * Defines the path to the input and the character used for line separation.
 */
const applicationSettings = {
    sourcePath: '/dev/stdin',    // The file system path from which to read input.
    lineSeparator: '\n'         // The character sequence indicating a new line.
};

// Retrieve content from the specified source, decode it as UTF-8,
// and then divide it into an array of individual text segments.
const inputSegments = fileSystemUtil.readFileSync(applicationSettings.sourcePath, 'utf-8')
                                    .split(applicationSettings.lineSeparator);

/**
 * Determines whether a given numeric value is a prime number.
 * A prime number is a natural number greater than 1 that has no positive divisors other than 1 and itself.
 *
 * @param {number} candidateNumber - The integer to be evaluated for primality.
 * @returns {boolean} Returns `true` if the number is prime, otherwise `false`.
 */
const verifyPrimality = candidateNumber => {
    // Numbers less than 2 are, by definition, not prime.
    if (candidateNumber < 2) {
        return false;
    }
    // The number 2 is the smallest and only even prime number.
    if (candidateNumber === 2) {
        return true;
    }
    // Check for divisibility from 2 up to the square root of the candidate number.
    // If any divisor is found, the number is not prime.
    for (let currentDivisor = 2; currentDivisor * currentDivisor <= candidateNumber; currentDivisor++) {
        if (candidateNumber % currentDivisor === 0) {
            return false; // Found a factor, so it's not prime.
        }
    }
    // If no factors were found within the loop, the number is prime.
    return true;
};

// Process the collected input segments:
// 1. Discard the first segment (e.g., a header or count).
// 2. Convert each remaining segment from a string to an integer.
// 3. Count how many of these integers are prime numbers.
const primeNumbersTotal = inputSegments.slice(1) // Create a new array starting from the second element.
                                       .map(stringRepresentation => parseInt(stringRepresentation, 10)) // Convert all string elements to base-10 integers.
                                       .reduce((currentTally, numberToCheck) => {
                                           // Increment the tally if the current number passes the primality test.
                                           return verifyPrimality(numberToCheck) ? currentTally + 1 : currentTally;
                                       }, 0); // Initialize the prime count accumulation at zero.

// Display the final calculated total of prime numbers to the console.
console.log(primeNumbersTotal);