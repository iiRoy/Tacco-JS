const fileSystemModule = require("fs");

/**
 * Main function to orchestrate reading input and calculating prime counts.
 */
function initiatePrimeCalculationPipeline() {
    let rawTextContent;
    try {
        // Attempt to read the entire input stream synchronously
        rawTextContent = fileSystemModule.readFileSync("/dev/stdin", "utf8");
    } catch (ioError) {
        // Log an error if file reading fails and terminate execution
        console.error("Failed to read input from /dev/stdin:", ioError.message);
        return;
    }

    // Trim whitespace and split the content into individual lines
    const numericInputLines = rawTextContent.trim().split("\n");

    // Early exit if no valid input lines are found
    if (numericInputLines.length === 0 || (numericInputLines.length === 1 && numericInputLines[0].trim() === '')) {
        return;
    }

    // Iterate through each line of the parsed input
    for (let currentLineIndex = 0; currentLineIndex < numericInputLines.length; currentLineIndex++) {
        const lineContent = numericInputLines[currentLineIndex].trim();

        // Skip processing if the line is empty after trimming
        if (!lineContent) {
            continue;
        }

        // Parse the string content of the line into an integer
        const upperLimitForPrimes = parseInt(lineContent, 10);

        // Validate the parsed number: must be a non-negative integer
        if (isNaN(upperLimitForPrimes) || upperLimitForPrimes < 0) {
            // Optionally, log a warning for invalid input lines
            // console.warn(`Skipping invalid number '${lineContent}' at index ${currentLineIndex}.`);
            continue;
        }

        // Compute the number of primes up to the current limit and print the result
        const countOfPrimesFound = executeSieveAndCountPrimes(upperLimitForPrimes);
        console.log(countOfPrimesFound);
    }
}

/**
 * Implements the Sieve of Eratosthenes algorithm to count prime numbers up to a specified limit.
 * @param {number} maximumValue The inclusive upper bound for prime number detection.
 * @returns {number} The total count of prime numbers less than or equal to maximumValue.
 */
function executeSieveAndCountPrimes(maximumValue) {
    // Primes start from 2, so any value less than 2 has no primes.
    if (maximumValue < 2) {
        return 0;
    }

    // Initialize a boolean array where `true` means potentially prime, `false` means not prime.
    // The array size is `maximumValue + 1` to accommodate index `maximumValue`.
    const primeStatusFlags = Array.from({ length: maximumValue + 1 }, () => true);

    // By definition, 0 and 1 are not prime numbers.
    primeStatusFlags[0] = false;
    primeStatusFlags[1] = false;

    // Apply the Sieve algorithm:
    // Iterate from 2 up to the square root of maximumValue.
    // Numbers whose multiples have already been marked will be skipped.
    for (let candidatePrime = 2; candidatePrime * candidatePrime <= maximumValue; candidatePrime++) {
        // If the current number is still marked as prime
        if (primeStatusFlags[candidatePrime]) {
            // Mark all multiples of this prime candidate as not prime.
            // Start marking from `candidatePrime * candidatePrime` because smaller multiples
            // (e.g., `2 * candidatePrime`, `3 * candidatePrime`) would have already been marked
            // by their respective prime factors (2, 3, etc.).
            for (let currentMultiple = candidatePrime * candidatePrime; currentMultiple <= maximumValue; currentMultiple += candidatePrime) {
                primeStatusFlags[currentMultiple] = false;
            }
        }
    }

    // After the sieve, iterate through the flags array to count the remaining primes.
    let finalPrimeCount = 0;
    for (let numberToCheck = 2; numberToCheck <= maximumValue; numberToCheck++) {
        if (primeStatusFlags[numberToCheck]) {
            finalPrimeCount++;
        }
    }

    return finalPrimeCount;
}

// Begin the execution flow by calling the main pipeline function.
initiatePrimeCalculationPipeline();