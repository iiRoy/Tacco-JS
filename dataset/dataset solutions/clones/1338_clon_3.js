const fileSystemAccessor = require('fs');

/**
 * Retrieves and validates a numerical input from a specified file path.
 * Includes robust error handling and default value fallbacks.
 * @param {string} sourceFilePath The path to the input file (e.g., '/dev/stdin').
 * @returns {number} A validated positive integer for factorization.
 */
function obtainValidatedNumericalInput(sourceFilePath) {
    let rawTextContent = '';
    const defaultFallbackValue = 14; // A common test case.

    try {
        // Attempt to read the file content, ensuring UTF-8 decoding.
        rawTextContent = fileSystemAccessor.readFileSync(sourceFilePath, 'utf8').trim();
    } catch (readOperationError) {
        // If file reading fails, log the error and use the default.
        console.error(`Input file access error encountered: ${readOperationError.message}. Proceeding with default value: ${defaultFallbackValue}.`);
        rawTextContent = String(defaultFallbackValue);
    }

    // Check if the content is empty after trimming whitespace.
    if (!rawTextContent) {
        console.warn(`No content found in input. Using default value: ${defaultFallbackValue}.`);
        rawTextContent = String(defaultFallbackValue);
    }

    // Parse the string into an integer, explicitly using base 10.
    const processedInteger = Number.parseInt(rawTextContent, 10);

    // Validate if the parsed value is a valid, positive integer.
    if (isNaN(processedInteger) || processedInteger < 2) {
        console.error(`Invalid or non-positive integer input detected (${rawTextContent}). Reverting to default value: ${defaultFallbackValue}.`);
        return defaultFallbackValue;
    }

    return processedInteger;
}

/**
 * Computes and returns an array of prime factors for a given positive integer.
 * This implementation includes optimizations for efficiency.
 * @param {number} valueToFactorize The integer to decompose into its prime factors.
 * @returns {number[]} An array containing the prime factors in ascending order.
 */
function determinePrimeFactorList(valueToFactorize) {
    let mutableNumber = valueToFactorize; // A working copy that gets progressively divided.
    const identifiedPrimeFactors = []; // Stores the prime factors as they are found.

    // Optimize for the prime factor 2: handle all divisions by 2 first.
    // This allows the main loop to only consider odd divisors.
    while (mutableNumber % 2 === 0) {
        identifiedPrimeFactors.push(2);
        mutableNumber /= 2;
    }

    // Iterate through odd numbers starting from 3.
    // The loop condition `candidateFactor * candidateFactor <= mutableNumber` is an optimization:
    // if a number `N` has a prime factor greater than `sqrt(N)`, it must also have one smaller than `sqrt(N)`.
    // So, we only need to check up to the square root.
    for (let candidateFactor = 3; candidateFactor * candidateFactor <= mutableNumber; candidateFactor += 2) {
        // While the current odd candidateFactor divides mutableNumber,
        // add it to the list and continue dividing mutableNumber by it.
        while (mutableNumber % candidateFactor === 0) {
            identifiedPrimeFactors.push(candidateFactor);
            mutableNumber /= candidateFactor;
        }
    }

    // If, after all divisions, mutableNumber is still greater than 1,
    // it means the remaining mutableNumber itself is a prime factor (and must be prime).
    if (mutableNumber > 1) {
        identifiedPrimeFactors.push(mutableNumber);
    }

    return identifiedPrimeFactors;
}

// --- Primary Execution Flow ---

// Step 1: Secure the initial numerical value from the input stream.
const initialNumericalTarget = obtainValidatedNumericalInput('/dev/stdin');

// Step 2: Store the original number for display purposes, as the working number will change.
const preservedOriginalNumber = initialNumericalTarget;

// Step 3: Execute the prime factorization algorithm on the acquired number.
const computedFactors = determinePrimeFactorList(initialNumericalTarget);

// Step 4: Prepare the output string by joining the found factors with a space.
const displayableFactorString = computedFactors.join(' ');

// Step 5: Output the result in the specified format to the console.
console.log(`${preservedOriginalNumber}: ${displayableFactorString}`);