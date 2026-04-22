'use strict'; // Enforce strict parsing and error handling for cleaner code.

/**
 * Processes raw string data to determine the count of valid product pairs.
 * A product pair (firstFactor, secondFactor) is considered valid if:
 * 1. Both factors are positive integers (starting from 1).
 * 2. Both factors are strictly less than the numerical limit derived from the input.
 * 3. Their product is strictly less than the numerical limit.
 *
 * @param {string} rawInputData - The raw string input, expected to be a number.
 * @returns {number} The total count of such qualifying product pairs. Returns 0 for invalid input.
 */
function ProcessNumericalPairs(rawInputData) {
    // Stage 1: Input Preparation and Validation
    // Remove any leading or trailing whitespace from the raw input string.
    const cleanedInputString = rawInputData.trim();

    // Convert the cleaned string into a numerical limit for subsequent calculations.
    // Using the Number() constructor for explicit type conversion from string to number.
    const numericalLimit = Number(cleanedInputString);

    // Guard clause: Validate the parsed numerical limit.
    // It must be a positive integer to proceed with meaningful computations.
    if (isNaN(numericalLimit) || numericalLimit <= 0 || !Number.isInteger(numericalLimit)) {
        // Log an informative error message to the console for debugging purposes.
        console.error("Input validation failed: Expected a positive integer. Received:", rawInputData);
        // Return zero as a safe default value indicating no valid pairs were found due to invalid input.
        return 0;
    }

    // Stage 2: Initialization of Result Accumulator
    // This variable will serve as an accumulator, storing the total count of product pairs
    // that successfully meet all specified criteria.
    let validProductCount = 0;

    // Stage 3: Iteration Through Possible Factors
    // The outer loop iterates through potential values for the first factor.
    // It starts from 1 and continues as long as the first factor is strictly less than the numerical limit.
    // The upper bound for factors is explicitly set to the numerical limit, mirroring the original logic.
    const maximumFactorValue = numericalLimit;

    for (let firstFactor = 1; firstFactor < maximumFactorValue; ++firstFactor) {
        // The inner loop iterates through potential values for the second factor.
        // It also starts from 1 and continues as long as the second factor is strictly less than the numerical limit.
        for (let secondFactor = 1; secondFactor < maximumFactorValue; secondFactor++) {
            // Calculate the product of the current pair of factors.
            // This intermediate variable helps in clearly representing the current product being evaluated.
            const productCandidate = firstFactor * secondFactor;

            // Optimization and Early Exit Condition:
            // If the calculated product already exceeds the numerical limit,
            // then any further increments of 'secondFactor' for the current 'firstFactor'
            // will also result in products greater than the limit (since factors are positive).
            // Therefore, we can safely terminate the current inner loop iteration early.
            if (productCandidate > numericalLimit) {
                break; // Exit the inner loop for the current 'firstFactor'.
            }

            // Counting Condition:
            // The original logic counts pairs (a, b) where `a * b` is strictly less than `input`.
            // This is achieved by combining two conditions:
            // 1. `if (a * b > input) { break; }` (ensuring `a * b <= input` for continued execution)
            // 2. `if (input - a * b !== 0) { count++; }` (ensuring `a * b !== input`)
            // The combination means we only increment the count if `a * b < input`.
            // We replicate this by checking if the product candidate is NOT equal to the numerical limit.
            // Given the `break` condition above, if it's not greater AND not equal, it must be less.
            if (productCandidate !== numericalLimit) {
                // Increment the counter using an alternative, explicit addition syntax.
                validProductCount = validProductCount + 1;
            }
        }
    }

    // Stage 4: Output the Final Result
    // Display the final accumulated count to the standard output stream.
    console.log(validProductCount);

    // Return the calculated count. This allows for easier testing and potential integration
    // into other parts of a larger application, even if not explicitly used in this context.
    return validProductCount;
}

// --- Standard Input/Output Handling Section ---
// This section is dedicated to managing input from the standard input stream
// and invoking the primary processing function with the obtained data.
// As per standard practice in competitive programming, this boilerplate should generally
// remain consistent across different problems to ensure correct execution environment.

// Read the entire content from the standard input file descriptor (`/dev/stdin`).
// The `node:fs` module is used, and the input is read as a UTF-8 encoded string.
const standardInputContent = require("node:fs").readFileSync("/dev/stdin", { encoding: "utf8" });

// Invoke the main data processing function with the content read from standard input.
// This initiates the calculation of valid product pairs.
ProcessNumericalPairs(standardInputContent);