'use strict';

/**
 * Parses a raw input string into an array of two numbers.
 * This function expects the first line of the input to contain two
 * space-separated integers representing the maximum value constraint (K)
 * and the target sum value (S).
 *
 * @param {string} rawInputContent - The complete raw input string, potentially
 *                                   with multiple lines.
 * @returns {number[]} An array containing two numeric values: [K, S].
 * @throws {Error} If the input format is invalid or numbers cannot be parsed.
 */
function extractAndValidateNumericParameters(rawInputContent) {
    // Defensive check for empty or invalid input string
    if (!rawInputContent || typeof rawInputContent !== 'string') {
        throw new Error("Input data is empty or not a string.");
    }

    // Isolate the first line of the input, then split it by spaces.
    const firstLine = rawInputContent.trim().split('\n')[0];
    const stringTokens = firstLine.split(' ');

    // Ensure exactly two numeric tokens are provided.
    if (stringTokens.length !== 2) {
        throw new Error(`Input format error: Expected two numbers, found ${stringTokens.length}.`);
    }

    const processedNumbers = stringTokens.map(token => {
        // Use unary plus operator for type conversion to number.
        const numericValue = +token;
        // Validate if the converted value is a finite number.
        if (isNaN(numericValue) || !isFinite(numericValue)) {
            throw new Error(`Input parsing error: '${token}' is not a valid number.`);
        }
        return numericValue;
    });

    return processedNumbers;
}

/**
 * Determines the total number of non-negative integer triplets (first, second, third)
 * that satisfy two conditions:
 * 1. The sum of the three integers equals a specific target sum.
 * 2. Each integer must be within a defined non-negative range (0 to maxValueLimit, inclusive).
 *
 * @param {string} inputDataString - The raw string input from the environment,
 *                                   expected to contain K and S on the first line.
 */
function computeValidTriplets(inputDataString) {
    let resultCount = 0; // Initialize accumulator for valid combinations.

    try {
        // Step 1: Parse and validate the input parameters (K and S).
        const [maxValueLimit, targetSum] = extractAndValidateNumericParameters(inputDataString);

        // Step 2: Apply early exit conditions based on problem constraints.
        // If K or S are negative, no valid non-negative triplets are possible.
        if (maxValueLimit < 0 || targetSum < 0) {
            console.log(0);
            return;
        }

        // If targetSum is too large to be formed by three numbers each up to maxValueLimit,
        // then no solutions exist. Max possible sum is 3 * maxValueLimit.
        if (targetSum > maxValueLimit * 3) {
            console.log(0);
            return;
        }

        // Step 3: Iterate through all possible values for the first two components.
        // The outer loop for the first component (x).
        for (let firstComponent = 0; firstComponent <= maxValueLimit; ++firstComponent) {
            // The inner loop for the second component (y).
            for (let secondComponent = 0; secondComponent <= maxValueLimit; ++secondComponent) {

                // Calculate the required value for the third component (z)
                // to meet the target sum.
                const thirdComponent = targetSum - firstComponent - secondComponent;

                // Step 4: Validate the calculated third component.
                // It must also be within the allowed range [0, maxValueLimit].
                if (thirdComponent >= 0 && thirdComponent <= maxValueLimit) {
                    // If all three components (firstComponent, secondComponent, thirdComponent)
                    // satisfy the range constraint [0, maxValueLimit] and their sum equals targetSum
                    // (which is implicitly handled by the calculation of thirdComponent),
                    // then this is a valid triplet.
                    // Note: The original redundant check `(x + y + z) === S` is omitted here
                    // as `z` is defined such that this condition is always met if `z` is valid.
                    resultCount = resultCount + 1; // Increment the counter.
                }
            }
        }

        // Step 5: Output the final count.
        console.log(resultCount);

    } catch (processingError) {
        // Catch any errors during parsing or validation and report them.
        console.error("An error occurred during processing:", processingError.message);
        // In a production environment, one might choose to exit with an error code.
        // process.exit(1);
    }
}

// Main execution block: Reads input from standard input and calls the calculator.
(() => {
    try {
        const fileSystem = require("fs");
        const standardInputContent = fileSystem.readFileSync("/dev/stdin", "utf8");
        computeValidTriplets(standardInputContent);
    } catch (ioError) {
        console.error("Failed to read input from /dev/stdin:", ioError.message);
        // Handle cases where /dev/stdin might not be available or readable.
        // process.exit(1);
    }
})();