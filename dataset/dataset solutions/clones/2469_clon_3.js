const MAXIMUM_TEST_FACTOR = 9;

/**
 * Analyzes a numeric input string to ascertain if the number it represents
 * possesses a specific factorization characteristic. This involves checking
 * if the number can be expressed as a product of two integers, 'd' and 'q',
 * where 'd' is a single-digit positive integer (from 1 to 9) and 'q' is
 * also an integer strictly less than 10.
 *
 * @param {string} inputDataString The raw string provided as input, expected to contain a number.
 * @returns {string} Returns "Yes" if the number meets the described factorization property,
 *                   otherwise returns "No".
 */
function checkSpecialFactorCondition(inputDataString) {
    // Step 1: Normalize and parse the input.
    // Trim any leading/trailing whitespace and extract the first potential numeric token.
    const cleanedInput = inputDataString.trim();
    const potentialNumericToken = cleanedInput.split(/\s+/)[0];

    // Convert the extracted token into a numeric value.
    const processedNumericValue = Number(potentialNumericToken);

    // Step 2: Implement robust input validation and guard clauses.
    // If the parsed value is not a valid, finite integer, or if it is zero,
    // it cannot fulfill the specified factorization criteria. In such cases,
    // we immediately determine that the property is not met.
    if (
        isNaN(processedNumericValue) ||
        !Number.isInteger(processedNumericValue) ||
        !Number.isFinite(processedNumericValue) ||
        processedNumericValue === 0
    ) {
        return "No";
    }

    // Step 3: Initialize a boolean flag to track the outcome of the property check.
    let conditionMetFlag = false;

    // Step 4: Iterate through possible divisor candidates.
    // The loop starts from 1 to prevent division by zero errors, which would
    // occur if 'divisorCandidate' was 0. This is a crucial functional update.
    // It continues up to and including 'MAXIMUM_TEST_FACTOR' (which is 9),
    // mirroring the original condition `i < 10`.
    for (let divisorCandidate = 1; divisorCandidate <= MAXIMUM_TEST_FACTOR; divisorCandidate++) {
        // Check if the current 'divisorCandidate' perfectly divides the 'processedNumericValue'.
        // The original `num/i == Math.floor(num/i)` check is redundant here,
        // as `processedNumericValue % divisorCandidate === 0` already implies integer division.
        if (processedNumericValue % divisorCandidate === 0) {
            // If it's a perfect divisor, calculate the corresponding quotient (the 'second factor').
            const quotientValue = processedNumericValue / divisorCandidate;

            // Check if this 'quotientValue' also satisfies its specific condition (less than 10).
            if (quotientValue < 10) {
                // If both conditions are satisfied, the property has been found.
                conditionMetFlag = true;
                // Optimization: Since we only need to find *one* such pair,
                // we can exit the loop early to save computational resources.
                break;
            }
        }
    }

    // Step 5: Based on the final state of the flag, return the appropriate string result.
    // This uses a ternary operator for concise conditional output.
    return conditionMetFlag ? "Yes" : "No";
}

// --- Application Entry Point and I/O Management ---
// This block handles the interaction with the execution environment,
// specifically reading from standard input and writing to standard output.
// It decouples the core logic function (`checkSpecialFactorCondition`)
// from environment-specific I/O, enhancing modularity and testability.
try {
    // Read the entire content of standard input, assuming UTF-8 encoding.
    const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');

    // Execute the main processing function with the obtained input.
    const finalResult = checkSpecialFactorCondition(fileContent);

    // Print the computed result to standard output.
    console.log(finalResult);
} catch (ioError) {
    // Implement basic error handling for potential issues during file reading.
    // In scenarios where input cannot be processed, a default "No" is returned,
    // and an error message is logged to standard error for debugging purposes.
    console.error("An issue occurred during input data acquisition or processing:", ioError.message);
    console.log("No"); // Provide a fallback result for robustness.
}