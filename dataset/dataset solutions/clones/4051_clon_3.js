/**
 * Solution for a coin combination problem, determining the number of ways
 * to achieve a specific target sum using a limited quantity of various coin denominations.
 * This implementation applies a Type III code transformation, including
 * extensive renaming, structural modifications, and logical rewrites.
 */
function processCoinCombinations(inputDataString) {

    // Helper function to safely parse and convert input lines to numbers.
    // This adds an intermediate step and handles potential whitespace.
    const parseInputLinesToNumbers = (dataPayload) => {
        if (typeof dataPayload !== 'string' || dataPayload.trim() === '') {
            console.error("Input data is invalid or empty.");
            return [];
        }
        return dataPayload.split('\n')
                           .map(line => Number.parseInt(line.trim(), 10))
                           .filter(num => !Number.isNaN(num)); // Filter out any non-numeric results
    };

    // Process raw input string into an array of integers.
    const numericalParameters = parseInputLinesToNumbers(inputDataString);

    // Validate that we have enough parameters before destructuring.
    // This serves as an added guard clause.
    if (numericalParameters.length < 4) {
        console.error("Insufficient input parameters provided. Expected 4 numeric values.");
        return; // Exit if input is malformed.
    }

    // Destructure input values for clarity, using descriptive names.
    const [
        maximumFiveHundreds, // Represents the upper limit for 500-yen coins
        maximumOneHundreds,  // Represents the upper limit for 100-yen coins
        maximumFifties,      // Represents the upper limit for 50-yen coins
        desiredTotalAmount   // The target sum to achieve
    ] = numericalParameters;

    // Define coin denominations as constants for better readability and maintainability.
    const FIVE_HUNDRED_YEN_VALUE = 500;
    const ONE_HUNDRED_YEN_VALUE = 100;
    const FIFTY_YEN_VALUE = 50;

    // Initialize a counter for valid combinations found.
    let successfulArrangements = 0;

    // Outer loop: Iterate through all possible counts of 500-yen coins.
    for (let num500YenCoins = 0; num500YenCoins <= maximumFiveHundreds; num500YenCoins++) {

        // Calculate the monetary value contributed by the current number of 500-yen coins.
        const current500YenContribution = num500YenCoins * FIVE_HUNDRED_YEN_VALUE;

        // Optimization/Guard Clause: If the value from 500-yen coins alone already exceeds
        // the desired total, there's no need to add 100-yen or 50-yen coins.
        // We can break out of this loop as increasing num500YenCoins further will only increase the sum.
        if (current500YenContribution > desiredTotalAmount) {
            break;
        }

        // Middle loop: Iterate through all possible counts of 100-yen coins.
        for (let num100YenCoins = 0; num100YenCoins <= maximumOneHundreds; num100YenCoins++) {

            // Calculate the monetary value contributed by the current number of 100-yen coins.
            const current100YenContribution = num100YenCoins * ONE_HUNDRED_YEN_VALUE;

            // Calculate the total value accumulated so far from 500-yen and 100-yen coins.
            const accumulatedValueSoFar = current500YenContribution + current100YenContribution;

            // Optimization/Guard Clause: If the accumulated value from 500-yen and 100-yen coins
            // already exceeds the desired total, we cannot form the sum with 50-yen coins.
            // We can break out of this loop as increasing num100YenCoins further will only increase the sum.
            if (accumulatedValueSoFar > desiredTotalAmount) {
                break;
            }

            // Calculate the remaining amount that needs to be covered by 50-yen coins.
            const remainingValueNeeded = desiredTotalAmount - accumulatedValueSoFar;

            // Check if the remaining amount can be formed using 50-yen coins.
            // This replaces the innermost loop with a direct calculation and check.
            // 1. The remaining value must be non-negative (already ensured by the previous guard clause).
            // 2. The remaining value must be perfectly divisible by 50.
            if (remainingValueNeeded >= 0 && remainingValueNeeded % FIFTY_YEN_VALUE === 0) {

                // Calculate the exact number of 50-yen coins required.
                const required50YenCoins = remainingValueNeeded / FIFTY_YEN_VALUE;

                // Check if the required number of 50-yen coins is within the available limit.
                if (required50YenCoins <= maximumFifties) {
                    // If all conditions are met, we found a valid combination.
                    successfulArrangements++;
                }
            }
        }
    }

    // Output the final count of successful combinations.
    console.log(successfulArrangements);
}

// Entry point for execution, handling file input.
// Using 'node:fs' for explicit module reference and adding error handling.
try {
    const fileContent = require("node:fs").readFileSync("/dev/stdin", "utf8");
    processCoinCombinations(fileContent);
} catch (errorReadingFile) {
    // Provide a more descriptive error message in case of file reading issues.
    console.error("Failed to read input from /dev/stdin:", errorReadingFile.message);
    // Optionally, exit with an error code.
    // process.exit(1);
}