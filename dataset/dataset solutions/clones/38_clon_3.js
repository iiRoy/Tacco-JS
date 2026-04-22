// This function computes all prime numbers up to a specified maximum value
// using an optimized version of the Sieve of Eratosthenes algorithm.
function generatePrimeNumbers(maximumLimit) {
    // Basic input validation: Ensure the limit is a non-negative integer.
    // If invalid, an empty array is returned as no primes can be generated.
    if (typeof maximumLimit !== 'number' || !Number.isInteger(maximumLimit) || maximumLimit < 0) {
        return [];
    }

    // Primes start from 2. If the limit is less than 2, no primes exist.
    if (maximumLimit < 2) {
        return [];
    }

    // Initialize a boolean array. 'true' means potentially prime, 'false' means composite.
    // The array size is 'maximumLimit + 1' to represent numbers from 0 up to 'maximumLimit'.
    const isPrimeCandidate = new Array(maximumLimit + 1).fill(true);

    // By definition, 0 and 1 are not considered prime numbers.
    isPrimeCandidate[0] = false;
    isPrimeCandidate[1] = false;

    // The sieve process iterates from the first prime (2) up to the square root of the maximum limit.
    // This optimization is based on the fact that any composite number 'n' must have at least one
    // prime factor less than or equal to sqrt(n).
    for (let currentNumber = 2; currentNumber * currentNumber <= maximumLimit; currentNumber++) {
        // If 'currentNumber' has already been marked as non-prime, skip it.
        // This avoids redundant operations on multiples of composite numbers.
        if (!isPrimeCandidate[currentNumber]) {
            continue;
        }

        // Mark all multiples of 'currentNumber' as non-prime (composite).
        // The inner loop starts marking from 'currentNumber * currentNumber' because
        // any smaller multiples (e.g., 2*currentNumber, 3*currentNumber, etc.)
        // would have already been marked by their respective smaller prime factors.
        for (let multipleOfPrime = currentNumber * currentNumber; multipleOfPrime <= maximumLimit; multipleOfPrime += currentNumber) {
            isPrimeCandidate[multipleOfPrime] = false;
        }
    }

    // After the sieving process, collect all numbers that are still marked as prime.
    const collectedPrimeNumbers = [];
    for (let indexValue = 2; indexValue <= maximumLimit; indexValue++) {
        if (isPrimeCandidate[indexValue]) {
            collectedPrimeNumbers.push(indexValue);
        }
    }

    return collectedPrimeNumbers; // Return the final ordered list of prime numbers.
}

// A utility function to efficiently determine the count of primes in a sorted list
// that are less than or equal to a given target value.
// This uses a binary search approach, which is significantly faster than linear scanning.
function getCountOfPrimesUpToTarget(targetValue, sortedPrimeList) {
    // Handle edge cases where no primes could be found or the target is too small.
    if (targetValue < 2 || sortedPrimeList.length === 0) {
        return 0;
    }

    let searchStart = 0;
    let searchEnd = sortedPrimeList.length - 1;
    let finalCount = 0; // This variable will hold the count of primes satisfying the condition.

    // Perform binary search to find the insertion point or the count.
    while (searchStart <= searchEnd) {
        const midPoint = Math.floor(searchStart + (searchEnd - searchStart) / 2);
        if (sortedPrimeList[midPoint] <= targetValue) {
            finalCount = midPoint + 1; // All primes up to this index are less than or equal to the target.
            searchStart = midPoint + 1; // Continue searching in the right half for a larger prime.
        } else {
            searchEnd = midPoint - 1; // The current prime is too large; search in the left half.
        }
    }
    return finalCount; // Return the determined count.
}


// --- Primary execution section of the script ---

// Define the upper boundary for pre-calculating the prime numbers.
const PRECOMPUTATION_CEILING = 999999;

// Generate and store the sequence of prime numbers up to the defined ceiling.
// This list will be used repeatedly for various queries.
const cachedPrimeSequence = generatePrimeNumbers(PRECOMPUTATION_CEILING);

// Attempt to read all input data from the standard input stream.
// A try-catch block is used to gracefully handle potential file system errors.
let rawInputString = '';
try {
    rawInputString = require('fs').readFileSync('/dev/stdin', 'utf8');
} catch (fileReadError) {
    // In a competitive programming context, error messages are usually suppressed.
    // console.error("Failed to read input from /dev/stdin:", fileReadError.message);
    rawInputString = ''; // Proceed with empty input if an error occurs.
}

// Process the raw input string:
// 1. Remove any leading or trailing whitespace.
// 2. Split the string into an array of lines based on newline characters.
// 3. Filter out any empty lines that might have resulted from the split.
// 4. Convert each non-empty line string into an integer using parseInt with radix 10 for safety.
const numericQueryValues = rawInputString
    .trim()
    .split('\n')
    .filter(lineContent => lineContent.length > 0)
    .map(stringValue => parseInt(stringValue, 10));

// Iterate over each numerical query value obtained from the input.
for (const currentQueryItem of numericQueryValues) {
    // Validate if the current item is a valid number. Skip if it's not.
    if (isNaN(currentQueryItem)) {
        // console.warn(`Skipping non-numeric input: '${currentQueryItem}'`);
        continue;
    }

    // Use the optimized helper function to find the count of primes
    // less than or equal to the current query value from the cached list.
    const computedPrimeCount = getCountOfPrimesUpToTarget(currentQueryItem, cachedPrimeSequence);

    // Output the calculated prime count to the console.
    console.log(computedPrimeCount);
}