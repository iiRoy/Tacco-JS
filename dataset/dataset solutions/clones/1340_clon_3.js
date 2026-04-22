// This module provides a utility for prime factorization of a given positive integer.
// It reads input from standard input and outputs the original number
// followed by its prime factors. The implementation includes robust input
// validation and an optimized factorization algorithm.

// Core Node.js file system module for reading synchronously.
const fileSystem = require('fs');

// Path to the standard input stream, a common convention in Unix-like systems.
const standardInputPath = '/dev/stdin';

// Variable to hold the raw string read from the input source.
// It's initialized to null and populated within a try-catch block.
let sourceInputText = null;

try {
    // Attempt to read the entire file content, decode it as UTF-8, and then
    // remove any leading or trailing whitespace characters from the string.
    sourceInputText = fileSystem.readFileSync(standardInputPath, 'utf8').trim();
} catch (readError) {
    // If an error occurs during file reading (e.g., file not found, permission issues),
    // log the error message and terminate the process with a non-zero exit code.
    console.error(`FATAL ERROR: Could not read input from ${standardInputPath}. Details: ${readError.message}`);
    process.exit(1);
}

/**
 * Parses a string input into an integer and performs validation checks.
 * Throws an error for invalid inputs or handles specific edge cases like 0 and 1.
 * @param {string} textualInput - The string expected to contain an integer.
 * @returns {number} The validated integer.
 * @throws {Error} If the input is invalid or does not meet the criteria for factorization.
 */
const parseAndValidateNumber = (textualInput) => {
    // A preliminary check for empty or null input strings.
    if (!textualInput || textualInput.length === 0) {
        throw new Error("Received an empty or undefined input string. A numerical value is mandatory.");
    }

    // Attempt to convert the string to an integer. Explicitly use radix 10 for reliability.
    const numericValue = parseInt(textualInput, 10);

    // Validate if the parsing was successful and if the result is indeed an integer.
    // NaN (Not-a-Number) indicates failed parsing, and Number.isInteger checks for whole numbers.
    if (isNaN(numericValue) || !Number.isInteger(numericValue)) {
        throw new Error(`Input '${textualInput}' is not recognized as a valid whole number.`);
    }

    // Prime factorization is conventionally applied to integers greater than 1.
    // Special handling for 0 and 1, which are typically excluded from prime factorization.
    if (numericValue < 2) {
        if (numericValue === 0) {
            console.log("0: The number zero is unique and has no prime factors.");
            process.exit(0); // Exit gracefully for known special cases.
        } else if (numericValue === 1) {
            console.log("1: The number one is not considered prime and has no prime factors.");
            process.exit(0); // Exit gracefully.
        } else {
            // For any other non-positive integer (e.g., negative numbers).
            throw new Error(`Input '${textualInput}' must be a positive integer strictly greater than one.`);
        }
    }

    // If all validations pass, return the parsed numeric value.
    return numericValue;
};

// Declare a constant to store the original number after successful parsing.
let originalInputNumber;

try {
    // Process the raw text input using the validation helper.
    originalInputNumber = parseAndValidateNumber(sourceInputText);
} catch (validationError) {
    // If validation fails, log the specific error and terminate.
    console.error(`INPUT VALIDATION FAILED: ${validationError.message}`);
    process.exit(1);
}

// A mutable variable that holds the current value being factorized.
// It will be progressively reduced as factors are found.
let remainingValueForFactorization = originalInputNumber;

// An array to store all prime factors discovered during the factorization process.
// It will contain duplicates if a prime factor appears multiple times (e.g., 12 -> [2, 2, 3]).
const collectedPrimeFactors = [];

// The initial candidate for a prime divisor. We start with 2, the smallest prime number.
let potentialDivisor = 2;

// The primary loop for finding prime factors.
// Optimization: We only need to check divisors up to the square root of the remaining value.
// This significantly reduces the number of iterations for larger numbers.
// The condition `potentialDivisor * potentialDivisor <= remainingValueForFactorization`
// is mathematically equivalent to `potentialDivisor <= Math.sqrt(remainingValueForFactorization)`
// but avoids floating-point arithmetic.
while (potentialDivisor * potentialDivisor <= remainingValueForFactorization) {
    // Check if the current potential divisor divides the remaining value evenly.
    if (remainingValueForFactorization % potentialDivisor === 0) {
        // If it's an even division, then 'potentialDivisor' is a prime factor.
        // Add this factor to our collection.
        collectedPrimeFactors.push(potentialDivisor);
        // Divide the remaining value by this factor. This is crucial for:
        // 1. Reducing the number to find its further factors.
        // 2. Handling cases where a prime factor appears multiple times (e.g., 8 = 2*2*2).
        remainingValueForFactorization /= potentialDivisor;
    } else {
        // If the current potential divisor does not divide evenly,
        // increment to the next integer to test as a divisor.
        potentialDivisor++;
    }
}

// After the loop finishes, there's a possibility that the 'remainingValueForFactorization'
// itself is a prime number greater than 1. This occurs if:
// 1. The original number was prime (e.g., 7).
// 2. The original number had a prime factor larger than its square root (e.g., 14 = 2 * 7, where 7 > sqrt(14)).
// In such cases, the remaining value is the last prime factor.
if (remainingValueForFactorization > 1) {
    collectedPrimeFactors.push(remainingValueForFactorization);
}

// Construct the final output string using a template literal for improved readability.
// If for some reason no factors were collected (which should not happen for valid inputs > 1),
// a fallback message is provided.
const finalOutputMessage = `The prime factorization of ${originalInputNumber} is: ${
    collectedPrimeFactors.length > 0 ? collectedPrimeFactors.join(' ') : 'No prime factors could be determined.'
}.`;

// Display the comprehensive result to the standard output.
console.log(finalOutputMessage);

// An additional, non-essential diagnostic statement.
// This is an example of adding a new code fragment that doesn't alter core logic.
const processCompletionTime = new Date().toLocaleTimeString('en-US', { hour12: false });
console.debug(`[DIAGNOSTIC] Factorization routine successfully concluded at ${processCompletionTime}.`);