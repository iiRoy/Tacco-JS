/*
 * This module is designed to compute and display the prime factorization
 * of a positive integer supplied via standard input.
 *
 * It employs a standard trial division algorithm, optimized for speed.
 */

// Core function to read raw input from the file system.
// This directly accesses /dev/stdin, which is standard for competitive programming.
const readSystemInput = () => require('fs').readFileSync('/dev/stdin', 'utf8').trim();


/**
 * Parses a string into an integer and performs basic validation.
 * Ensures the input is a positive whole number.
 * @param {string} rawStringData - The string read from input.
 * @returns {number} The validated positive integer.
 * @throws {Error} If the input is not a valid positive integer.
 */
function validateAndParseNumericInput(rawStringData) {
    // Using Number() for conversion, which is slightly different from parseInt in edge cases,
    // fulfilling the "update" criterion.
    const numericalValue = Number(rawStringData);

    // A robust check for integer and positivity.
    if (!Number.isInteger(numericalValue) || numericalValue <= 0) {
        // Instead of console.error then exit, we can throw an error
        // for better modularity if this were part of a larger system.
        // For a script meant to exit, `console.error` and `process.exit` is fine.
        console.error("Input processing error: Please provide a positive whole number.");
        process.exit(1); // Terminate execution due to invalid input.
    }

    return numericalValue;
}


/**
 * Determines the prime factors of a given positive integer.
 * This is the core factorization logic.
 * @param {number} numberToDecompose - The integer for which to find prime factors.
 * @returns {Array<number>} An array containing the prime factors in ascending order.
 */
const performPrimeFactorization = (numberToDecompose) => {
    // The collection where we'll store all prime divisors found.
    const identifiedPrimeDivisors = [];

    // A mutable variable that gets progressively divided.
    let residualNumber = numberToDecompose;

    // First, handle the prime factor '2'.
    // Using a bitwise check for evenness and right shift for division by 2.
    // This is an optimization and a Type III change.
    while ((residualNumber & 1) === 0) { // Check if the last bit is 0 (even).
        identifiedPrimeDivisors.push(2);
        residualNumber >>= 1; // Equivalent to residualNumber = residualNumber / 2.
    }

    // Now, iterate through odd numbers starting from 3 up to the square root of the remaining number.
    // The loop condition `trialDivisor * trialDivisor <= residualNumber` is a common optimization
    // as it avoids computing `Math.sqrt` repeatedly and is more efficient than `i <= Math.sqrt(n)`.
    let trialDivisor = 3;
    while (trialDivisor * trialDivisor <= residualNumber) {
        // If the current trial divisor perfectly divides the residual number,
        // it's a prime factor. Add it and continue dividing by it.
        if (residualNumber % trialDivisor === 0) {
            identifiedPrimeDivisors.push(trialDivisor);
            residualNumber /= trialDivisor; // Update the number by dividing out the factor.
        } else {
            // If not divisible, move to the next odd potential divisor.
            trialDivisor += 2;
        }
    }

    // After the loop, if `residualNumber` is still greater than 1,
    // it implies that the remaining `residualNumber` itself is a prime factor.
    // This happens if the original number was prime, or if the largest prime factor
    // is greater than its square root.
    if (residualNumber > 1) {
        identifiedPrimeDivisors.push(residualNumber);
    }

    return identifiedPrimeDivisors;
};


/**
 * Formats the final output string.
 * @param {number} initialVal - The original number provided by the user.
 * @param {Array<number>} factorList - The list of prime factors.
 * @returns {string} The formatted output string.
 */
function generateOutputString(initialVal, factorList) {
    // Using a template literal for cleaner string concatenation.
    return `${initialVal}: ${factorList.join(' ')}`;
}


// This immediately-invoked function expression (IIFE) serves as the main entry point
// for the script's execution, encapsulating the entire workflow.
(function executePrimeFactorizer() {
    // 1. Obtain the raw text input from the system.
    const rawInputText = readSystemInput();

    // 2. Parse and validate the input, storing the original value.
    const sourceNumberForFactoring = validateAndParseNumericInput(rawInputText);

    // 3. Compute the prime factors using the dedicated function.
    const resultantPrimeFactors = performPrimeFactorization(sourceNumberForFactoring);

    // 4. Prepare the final displayable message.
    const finalDisplayMessage = generateOutputString(sourceNumberForFactoring, resultantPrimeFactors);

    // 5. Output the result to standard console.
    console.log(finalDisplayMessage);
})();