/**
 * This module provides a function to compute the number of distinct integer combinations
 * of three types of items (valued at 500, 100, and 50 units respectively)
 * that sum up to a specific target value.
 *
 * The input is expected as a multi-line string where each line contains a numeric value:
 * Line 1: Maximum available quantity for 500-unit items.
 * Line 2: Maximum available quantity for 100-unit items.
 * Line 3: Maximum available quantity for 50-unit items.
 * Line 4: The total target value that combinations must sum to.
 */
function determineValidSetsOfItems(inputStringData) {
    // Validate the initial input: ensure it's a non-empty string.
    if (typeof inputStringData !== 'string' || inputStringData.trim().length === 0) {
        console.warn("Warning: Input data is empty or not a string. Returning 0 combinations.");
        return 0; // No combinations can be found with invalid input.
    }

    // Process the raw string input into an array of integers.
    // Each line from the input string is parsed as a base-10 integer.
    const processedNumericValues = inputStringData
        .split('\n') // Split the string into an array of lines.
        .map(currentLineText => {
            const trimmedLine = currentLineText.trim();
            // Attempt to parse the number; default to 0 if parsing fails or line is empty.
            // This is a robust parsing step, assuming non-negative counts and target.
            const numericValue = parseInt(trimmedLine, 10);
            return isNaN(numericValue) ? 0 : numericValue;
        });

    // Ensure that we have all the necessary input parameters.
    // We expect four values: three item counts and one target sum.
    const EXPECTED_INPUT_COUNT = 4;
    if (processedNumericValues.length < EXPECTED_INPUT_COUNT) {
        console.error(`Error: Incomplete input data. Expected ${EXPECTED_INPUT_COUNT} lines, received ${processedNumericValues.length}.`);
        return 0; // Cannot proceed without all required parameters.
    }

    // Assign descriptive names to the parsed input values for enhanced readability.
    const maxAvailableTypeA = processedNumericValues[0]; // Max count for 500-unit items
    const maxAvailableTypeB = processedNumericValues[1]; // Max count for 100-unit items
    const maxAvailableTypeC = processedNumericValues[2]; // Max count for 50-unit items
    const desiredOverallSum = processedNumericValues[3]; // The target total value

    // Early exit condition: If the target sum is negative, no valid positive combinations exist.
    if (desiredOverallSum < 0) {
        return 0;
    }

    // Initialize a counter to keep track of all unique valid combinations found.
    let totalSuccessfulCombinations = 0;

    // Define the monetary values for each item type.
    const VALUE_TYPE_A = 500;
    const VALUE_TYPE_B = 100;
    const VALUE_TYPE_C = 50;

    // Determine the upper bound for the first item type (500-unit items).
    // This is limited by either the available quantity or the maximum possible value
    // that can be contributed by this item type without exceeding the desired sum.
    const upperLimitForTypeA = Math.floor(Math.min(maxAvailableTypeA, desiredOverallSum / VALUE_TYPE_A));

    // Outer loop: Iterate through all possible counts for the 500-unit items (Type A).
    // The loop variable `currentCountA` represents the number of Type A items used.
    for (let currentCountA = 0; currentCountA <= upperLimitForTypeA; currentCountA++) {
        // Calculate the value remaining to be made up by Type B and Type C items.
        const remainingSumAfterTypeA = desiredOverallSum - (currentCountA * VALUE_TYPE_A);

        // Determine the upper bound for the second item type (100-unit items).
        // This limit is based on its available quantity and the `remainingSumAfterTypeA`.
        const upperLimitForTypeB = Math.floor(Math.min(maxAvailableTypeB, remainingSumAfterTypeA / VALUE_TYPE_B));

        // Inner loop: Iterate through all possible counts for the 100-unit items (Type B).
        // The loop variable `currentCountB` represents the number of Type B items used.
        for (let currentCountB = 0; currentCountB <= upperLimitForTypeB; currentCountB++) {
            // Calculate the final sum that must be made up *solely* by Type C items (50-unit items).
            const finalSumForTypeC = remainingSumAfterTypeA - (currentCountB * VALUE_TYPE_B);

            // Condition 1: The `finalSumForTypeC` must be a non-negative multiple of 50.
            // This ensures that it can be perfectly divided into 50-unit items.
            const isSumDivisibleByFifty = (finalSumForTypeC >= 0 && finalSumForTypeC % VALUE_TYPE_C === 0);

            // If the sum is not divisible by 50, this combination is invalid for Type C items,
            // so we can skip to the next iteration.
            if (!isSumDivisibleByFifty) {
                continue;
            }

            // Calculate the exact number of 50-unit items (Type C) required.
            const requiredCountTypeC = finalSumForTypeC / VALUE_TYPE_C;

            // Condition 2: The `requiredCountTypeC` must not exceed the maximum available quantity for Type C items.
            const isCountCWithinLimits = (requiredCountTypeC <= maxAvailableTypeC);

            // If both conditions are met, we have found a valid combination of (Type A, Type B, Type C).
            if (isCountCWithinLimits) {
                // Increment the counter for valid arrangements.
                totalSuccessfulCombinations = totalSuccessfulCombinations + 1;
            }
        }
    }

    // The function returns the final count of all valid combinations.
    return totalSuccessfulCombinations;
}

// --- Execution Entry Point ---
// This block is responsible for reading input from the standard input stream
// and then invoking the core logic function.
try {
    // Use Node.js 'fs' module to synchronously read the entire content
    // of the '/dev/stdin' file (standard input) as a UTF-8 string.
    const fileContentsFromStdIn = require('fs').readFileSync('/dev/stdin', 'utf8');

    // Call the primary function to compute the result.
    const finalCalculatedCount = determineValidSetsOfItems(fileContentsFromStdIn);

    // Output the computed result to the standard output.
    console.log(finalCalculatedCount);

} catch (processingError) {
    // If any error occurs during file reading or processing, log it and exit with an error code.
    console.error("An operational error occurred:", processingError.message);
    // In a production environment, more sophisticated error handling might be needed.
    process.exit(1);
}