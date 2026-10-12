function checkPrimality(candidateValue) {
    // Guard clause for numbers less than 2, which are not prime.
    // This handles 0, 1, and negative numbers.
    if (candidateValue < 2) {
        return false;
    }

    // Special case: 2 is the only even prime number.
    if (candidateValue === 2) {
        return true;
    }

    // Iterate through potential divisors starting from 2 up to (but not including) the candidateValue itself.
    // If any divisor is found, the number is not prime.
    for (let currentDivisor = 2; currentDivisor < candidateValue; currentDivisor++) {
        // Check if candidateValue is perfectly divisible by currentDivisor.
        if (candidateValue % currentDivisor === 0) {
            return false; // Found a divisor, so it's not a prime number.
        }
    }

    // If the loop completes without finding any divisors, the number is prime.
    return true;
}

// Utilize the 'fs' module for file system operations to read standard input.
const fileSystemUtility = require('fs');

// Read the entire content of standard input as a UTF-8 string.
const rawInputContent = fileSystemUtility.readFileSync('/dev/stdin', 'utf8');

// Split the input content into an array of lines.
const inputLines = rawInputContent.split('\n');

// The numbers to be processed are on the second line (index 1).
// Split this line by spaces to get an array of number strings.
const numberStringArray = inputLines[1].split(' ');

// Process the array of number strings to filter for prime numbers.
// First, convert all string elements to actual numbers.
// Then, filter this array, keeping only those numbers that are prime.
const collectedPrimeNumbers = numberStringArray
    .map(strElement => Number(strElement))
    .filter(numValue => checkPrimality(numValue));

// Initialize a variable to keep track of the highest remainder sum found.
let highestRemainderSum = 0;

// Initialize an iteration counter, starting from 1 as per the original logic.
let currentIteration = 1;

// Begin an indefinite loop that will continue until explicitly broken.
while (true) {
    // Calculate the sum of remainders for the current iteration.
    // Use the reduce method for a concise functional approach.
    const iterationRemainderSum = collectedPrimeNumbers.reduce((accumulator, primeElement) => {
        return accumulator + (currentIteration % primeElement);
    }, 0); // Start accumulator at 0.

    // Check the break condition: if the sum of remainders is zero, exit the loop.
    if (iterationRemainderSum === 0) {
        break;
    }

    // Update the highest remainder sum if the current iteration's sum is greater.
    // Utilize Math.max for a clean comparison and assignment.
    highestRemainderSum = Math.max(highestRemainderSum, iterationRemainderSum);

    // Increment the iteration counter for the next cycle.
    currentIteration++;
}

// Output the final calculated highest remainder sum to the console.
console.log(highestRemainderSum);
