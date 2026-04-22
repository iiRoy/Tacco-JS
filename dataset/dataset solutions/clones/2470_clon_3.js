// This JavaScript module is designed to evaluate a specific numerical property of an integer value.
// It searches for a particular type of divisor within a predefined range and assesses
// the characteristics of the resulting quotient. The final determination is printed
// to the standard output.

/**
 * Assesses whether a given integer satisfies a unique divisibility criterion.
 * The criterion states that there must exist at least one integer divisor `d`
 * within the inclusive range of 1 to 9, such that:
 * 1. The input number is perfectly divisible by `d` (i.e., no remainder).
 * 2. The quotient (result of the division) is strictly less than 10.
 *
 * @param {number} inputNumberForEvaluation The target integer to be analyzed.
 * @returns {boolean} Returns `true` if the property is met for any valid divisor,
 *                    otherwise returns `false`. Also returns `false` for invalid inputs.
 */
function verifyNumberDivisibilityCharacteristic(inputNumberForEvaluation) {
    // --- Input Validation and Edge Case Handling ---

    // A preliminary check to ensure the input is indeed a number and a positive integer.
    // Our specific problem context implies positive integer inputs.
    if (typeof inputNumberForEvaluation !== 'number' ||
        !Number.isInteger(inputNumberForEvaluation) ||
        inputNumberForEvaluation <= 0) {
        // Log an error for clarity, as this function expects a positive integer.
        console.error("Invalid input detected: The evaluation requires a positive integer.");
        // For an invalid input, the characteristic cannot be satisfied.
        return false;
    }

    // --- Core Logic Setup ---

    // A boolean flag to track if the desired characteristic has been found.
    let characteristicFound = false;

    // Define the boundaries for our divisor search.
    // The search starts from 1.
    const MINIMUM_DIVISOR_VALUE = 1;
    // The search goes up to and including 9. So, the loop limit is 10 (exclusive).
    const MAXIMUM_DIVISOR_VALUE_EXCLUSIVE = 10;

    // The threshold for the quotient value.
    const QUOTIENT_UPPER_BOUND_EXCLUSIVE = 10;

    // --- Iteration Through Potential Divisors ---

    // Loop through each integer starting from the minimum divisor up to, but not including, the maximum.
    for (let currentCandidateDivisor = MINIMUM_DIVISOR_VALUE;
         currentCandidateDivisor < MAXIMUM_DIVISOR_VALUE_EXCLUSIVE;
         currentCandidateDivisor = currentCandidateDivisor + 1) { // Increment the divisor candidate.

        // --- Conditional Checks for the Characteristic ---

        // Added robustness: Although our loop range for `currentCandidateDivisor` starts at 1,
        // it's good practice to guard against division by zero in contexts where loop bounds
        // might be dynamic or less controlled.
        if (currentCandidateDivisor === 0) {
            // This specific path should not be reachable with the current loop bounds.
            // However, it serves as an example of an added fragment for safety or future modifications.
            console.warn("Warning: Attempted division by zero detected (skipped).");
            continue; // Skip to the next iteration if this hypothetical case occurs.
        }

        // First condition: Check if the input number is perfectly divisible by the current candidate divisor.
        const isDivisibleWithoutRemainder = (inputNumberForEvaluation % currentCandidateDivisor === 0);

        // If the number is not perfectly divisible, this divisor cannot satisfy the condition.
        if (!isDivisibleWithoutRemainder) {
            continue; // Move to the next candidate divisor.
        }

        // If divisible, calculate the resulting quotient.
        const computedQuotient = inputNumberForEvaluation / currentCandidateDivisor;

        // Second condition: Check if the computed quotient is less than the specified threshold.
        const isQuotientBelowLimit = (computedQuotient < QUOTIENT_UPPER_BOUND_EXCLUSIVE);

        // If both conditions are met for the current divisor, the characteristic is found.
        if (isDivisibleWithoutRemainder && isQuotientBelowLimit) {
            characteristicFound = true; // Update the flag.
            // Since we only need to find *one* such divisor, we can terminate the search early.
            break; // Exit the loop.
        }
    }

    // --- Result Output ---

    // Return the final status indicating whether the characteristic was found.
    return characteristicFound;
}

// --- Application Entry Point and Input Handling ---

// Define constants for file system operations to improve readability and maintainability.
const FILE_SYSTEM_MODULE_IDENTIFIER = 'fs';
const STANDARD_INPUT_FILE_PATH = '/dev/stdin';
const TEXT_ENCODING_STANDARD = 'utf8';

try {
    // Dynamically load the necessary file system module.
    // This adds a layer of abstraction compared to a direct `require`.
    const fsUtility = require(FILE_SYSTEM_MODULE_IDENTIFIER);

    // Read the entire content from the standard input.
    // It's expected to be a single number followed by a newline.
    const rawDataBuffer = fsUtility.readFileSync(STANDARD_INPUT_FILE_PATH, TEXT_ENCODING_STANDARD);

    // Process the raw input: remove leading/trailing whitespace (like newlines)
    // and attempt to convert it into an integer.
    const cleanedInputString = rawDataBuffer.trim();
    const parsedNumericValue = parseInt(cleanedInputString, 10); // Specify base 10 for clarity.

    // Validate if the parsed value is indeed a number.
    if (isNaN(parsedNumericValue)) {
        console.error("Runtime Error: Input content could not be parsed as a valid integer.");
        // Terminate the process with an error code.
        process.exit(1);
    }

    // Execute the main logic function with the validated numeric input.
    const finalOutcome = verifyNumberDivisibilityCharacteristic(parsedNumericValue);

    // Based on the boolean result, print the appropriate string to standard output.
    if (finalOutcome) {
        console.log('Yes');
    } else {
        console.log('No');
    }

} catch (operationalError) {
    // Catch and report any errors that occur during file reading or initial processing.
    console.error(`An unexpected system or parsing error occurred: ${operationalError.message}`);
    // Exit with a non-zero status to indicate failure.
    process.exit(1);
}