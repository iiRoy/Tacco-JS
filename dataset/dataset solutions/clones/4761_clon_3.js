'use strict';

/**
 * Helper function to securely obtain input data from the standard input stream.
 * This abstracts the direct file system read operation.
 * @returns {string} The raw string content read from stdin, or an empty string if an error occurs.
 */
function obtainInputData() {
    try {
        // Using file descriptor 0 for stdin, common in Unix-like systems.
        // .trim() removes leading/trailing whitespace, including newlines.
        return require('fs').readFileSync(0, 'utf8').trim();
    } catch (readError) {
        console.error("An issue occurred while attempting to read input:", readError.message);
        return ""; // Return an empty string to signify failure or no input.
    }
}

/**
 * Iteratively calculates the factorial of a given non-negative integer.
 * This function is an iterative rewrite of the original recursive 'factorialize'.
 * It handles non-positive inputs by returning 1, consistent with 0!.
 *
 * @param {number} inputNumericValue The integer for which the factorial needs to be computed.
 * @returns {number} The calculated factorial value. Returns 1 for inputs less than or equal to 1.
 */
function computeProductSequence(inputNumericValue) {
    // Factorial is defined for non-negative integers. 0! = 1, 1! = 1.
    // For simplicity, any input less than 1 will yield 1.
    if (inputNumericValue <= 1) {
        return 1;
    }

    let currentProductAccumulator = 1; // Renamed from 'f' or 'num' in original context
    let currentMultiplier = 2;         // Starting from 2 as 1 is already handled by base case

    // Loop through numbers from 2 up to the input value
    while (currentMultiplier <= inputNumericValue) {
        currentProductAccumulator *= currentMultiplier;
        currentMultiplier++;
    }
    return currentProductAccumulator;
}

/**
 * Determines the total number of positive divisors for a given positive integer.
 * This function has been optimized to iterate only up to the square root of the number,
 * and includes a fix for the original's division by zero and off-by-one errors.
 * Original: 'divisor'.
 *
 * @param {number} targetValue The positive integer for which to count the divisors.
 * @returns {number} The total count of positive divisors. Returns 0 for non-positive or non-integer inputs.
 */
function determineDivisorCount(targetValue) {
    // Input validation: Divisor counting typically applies to positive integers.
    // Ensure the number is positive and an actual integer.
    if (targetValue <= 0 || !Number.isInteger(targetValue)) {
        // console.warn("Warning: Input for divisor count must be a positive integer. Returning 0.");
        return 0; // No positive divisors for non-positive or non-integer values.
    }

    let totalFactorsDiscovered = 0; // Renamed from 'cnt'
    const iterationLimit = Math.sqrt(targetValue); // Optimization: loop only up to sqrt

    // Iterate from 1 up to the square root of the target value
    for (let factorCandidate = 1; factorCandidate <= iterationLimit; factorCandidate++) { // Renamed from 'i'
        if (targetValue % factorCandidate === 0) {
            // If factorCandidate divides targetValue, then targetValue / factorCandidate also divides it.
            // These are two distinct factors unless factorCandidate is the square root itself.
            if (factorCandidate * factorCandidate === targetValue) {
                // If it's a perfect square, count the factor only once.
                totalFactorsDiscovered += 1;
            } else {
                // Otherwise, count both factorCandidate and targetValue / factorCandidate.
                totalFactorsDiscovered += 2;
            }
        }
    }
    return totalFactorsDiscovered;
}

/**
 * The primary execution flow of the program. It reads input, performs factorial
 * calculation, then counts the divisors of the factorial result, and outputs.
 * This function is a refactored and enhanced version of the original 'Main' function.
 *
 * @param {string} rawStringInput The raw string data received from the input source.
 */
function ExecuteCalculationPipeline(rawStringInput) {
    // Process and validate the initial numeric input.
    const initialNumericInput = parseInt(rawStringInput, 10); // Using parseInt with radix for explicit base.

    // Robust input validation.
    if (isNaN(initialNumericInput) || !Number.isInteger(initialNumericInput)) {
        console.error("Error: Provided input is not a valid whole number. Please ensure it's an integer.");
        return; // Terminate execution if input is invalid.
    }
    if (initialNumericInput < 0) {
        console.warn(`Note: A negative input (${initialNumericInput}) was provided. Factorial calculation will treat it as 0, yielding 1.`);
        // The computeProductSequence function handles negative inputs by returning 1.
    }
    // Add a practical limit for factorial calculation to manage potential overflow/precision issues
    // with standard JavaScript numbers, as factorials grow extremely fast.
    if (initialNumericInput > 16) { // e.g., 16! is 20,922,789,888,000, which fits; 17! might start losing precision.
        console.warn(`Warning: Input ${initialNumericInput} is quite large. Factorial calculations with standard JS numbers might lose precision for values > 16.`);
    }

    // Step 1: Compute the factorial of the validated input number.
    const computedFactorialResult = computeProductSequence(initialNumericInput);

    // Step 2: Determine the count of positive divisors for the calculated factorial.
    const finalDivisorCount = determineDivisorCount(computedFactorialResult);

    // Output the final result in a more descriptive and user-friendly format.
    console.log(`For input ${initialNumericInput}:`);
    console.log(`  The computed factorial is: ${computedFactorialResult}`);
    console.log(`  The total count of positive divisors for ${computedFactorialResult} is: ${finalDivisorCount}`);

    // Optional: Add a debug message for completion.
    // console.debug(`Pipeline execution completed successfully for input: '${rawStringInput}'.`);
}

// Entry point of the script: Read input and initiate the main processing pipeline.
const programInputData = obtainInputData();
ExecuteCalculationPipeline(programInputData);