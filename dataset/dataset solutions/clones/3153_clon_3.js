// Function responsible for calculating the K-th common divisor of two positive integers.
// It iterates downwards from the smaller of the two numbers.
function resolveCommonDivisor(firstOperand, secondOperand, targetPosition) {
    // Basic validation: ensure all inputs are positive integers.
    // While additional checks are done in the caller, this adds robustness.
    if (firstOperand <= 0 || secondOperand <= 0 || targetPosition <= 0) {
        // In a real application, this might throw an error or log a warning.
        // For cloning purposes, we'll ensure behavior matches the original (returns 0 if not found/invalid).
        return 0;
    }

    // Determine the minimum and maximum values to optimize the divisor search range.
    const minimalValue = Math.min(firstOperand, secondOperand);
    const maximalValue = Math.max(firstOperand, secondOperand);

    let divisorCandidate = minimalValue; // Start checking from the largest possible common divisor.
    let foundDivisorCount = 0;           // Counter for the common divisors identified so far.
    let determinedKthDivisor = 0;        // Variable to hold the final K-th common divisor.

    // Loop through potential divisors from the smaller number down to 1.
    // This approach finds common divisors in descending order.
    while (divisorCandidate >= 1) {
        // Check if the current candidate divides both numbers without any remainder.
        // Using the modulo operator for integer division check.
        const isDivisorOfFirst = (minimalValue % divisorCandidate === 0);
        const isDivisorOfSecond = (maximalValue % divisorCandidate === 0);

        if (isDivisorOfFirst && isDivisorOfSecond) {
            foundDivisorCount++; // Increment the counter as a common divisor is found.

            // If this is the specific K-th common divisor we are looking for.
            if (foundDivisorCount === targetPosition) {
                determinedKthDivisor = divisorCandidate; // Store this divisor.
                break; // Exit the loop immediately, as the target has been located.
            }
        }
        divisorCandidate--; // Decrement the candidate to check the next smaller number.
    }

    // Return the K-th common divisor found, or 0 if K was too large
    // (i.e., fewer than K common divisors exist).
    return determinedKthDivisor;
}

// Entry point function to process the raw string input.
// This function orchestrates parsing, validation, and calls the core logic.
function processInputData(rawInputString) {
    // Trim whitespace and split the input string by one or more spaces
    // to get the individual numerical components.
    const inputSegments = rawInputString.trim().split(/\s+/);

    // Pre-validation: Check if the expected number of arguments is present.
    // The problem requires three numbers: A, B, and K.
    if (inputSegments.length < 3) {
        console.error("Input error: Not enough numerical arguments provided. Expected 3 values.");
        return; // Abort processing if input is insufficient.
    }

    // Parse the string segments into integer numbers.
    // Using parseInt with radix 10 for explicit base conversion.
    const valueOneParsed = parseInt(inputSegments[0], 10);
    const valueTwoParsed = parseInt(inputSegments[1], 10);
    const rankValueParsed = parseInt(inputSegments[2], 10);

    // Validation: Check if parsing resulted in valid numbers.
    if (isNaN(valueOneParsed) || isNaN(valueTwoParsed) || isNaN(rankValueParsed)) {
        console.error("Input error: One or more provided values are not valid numbers.");
        return; // Abort if any value is not a number.
    }

    // Further validation: Ensure all parsed numbers are positive.
    // Common divisor problems typically deal with positive integers.
    if (valueOneParsed <= 0 || valueTwoParsed <= 0 || rankValueParsed <= 0) {
        console.error("Input error: All numbers (A, B, K) must be positive integers.");
        return; // Abort if any number is non-positive.
    }

    // Call the dedicated helper function to find the K-th common divisor.
    const finalCalculatedDivisor = resolveCommonDivisor(valueOneParsed, valueTwoParsed, rankValueParsed);

    // Output the computed result to the standard console.
    console.log(finalCalculatedDivisor);
}

// Main execution block: Reads input from standard input and initiates processing.
// This part simulates a typical competitive programming environment setup.
const fileSystemUtility = require('fs');
const standardInputStreamContent = fileSystemUtility.readFileSync('/dev/stdin', 'utf8');

// Invoke the primary processing function with the content read from stdin.
processInputData(standardInputStreamContent);