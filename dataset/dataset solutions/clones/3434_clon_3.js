/**
 * This module processes a numerical input to identify specific divisor patterns.
 * It calculates the factorial of the provided input number.
 * Subsequently, it identifies all positive divisors of this calculated factorial.
 * For each such divisor, it then determines if half of that divisor has precisely 75 factors.
 * Finally, the program outputs the total count of instances where this condition is met.
 */

/**
 * Efficiently determines the total count of positive divisors for a given positive integer.
 * This function optimizes the divisor counting process by iterating only up to the square root of the number.
 *
 * @param {number} valueToExamine - The positive integer for which the number of divisors needs to be calculated.
 * @returns {number} The total number of positive divisors. Returns 0 if the input is not a positive integer.
 */
const countDivisorsEfficiently = (valueToExamine) => {
    // Robust input validation for the helper function to ensure it operates on valid data.
    if (!Number.isInteger(valueToExamine) || valueToExamine <= 0) {
        return 0; // Return 0 for non-integer or non-positive inputs as they have no positive divisors in this context.
    }
    if (valueToExamine === 1) {
        return 1; // The number 1 has exactly one divisor: itself.
    }

    let currentDivisorCount = 0;
    const squareRootOfValue = Math.sqrt(valueToExamine); // Compute the square root once for efficiency.
    const iterationUpperLimit = Math.floor(squareRootOfValue); // Loop only up to the floor of the square root.

    // Iterate from 1 up to the square root of the value.
    for (let divisorCandidate = 1; divisorCandidate <= iterationUpperLimit; divisorCandidate++) {
        // Check if the current candidate divides the value evenly.
        if (valueToExamine % divisorCandidate === 0) {
            currentDivisorCount++; // Found one divisor (divisorCandidate).
            // If divisorCandidate is not the square root, then (valueToExamine / divisorCandidate) is another distinct divisor.
            if (divisorCandidate * divisorCandidate !== valueToExamine) {
                currentDivisorCount++; // Found a second divisor (the pair).
            }
        }
    }
    return currentDivisorCount;
};

/**
 * The primary function responsible for parsing the raw input, executing the core logic,
 * and presenting the final result. It encompasses input validation, factorial computation,
 * divisor identification, and the final conditional counting.
 *
 * @param {string} rawInputData - The unprocessed string input, expected to be a numeric value.
 */
function analyzeInputAndCalculate(rawInputData) {
    const cleanedInput = String(rawInputData).trim();

    // Comprehensive input validation: ensures the input is a non-empty string consisting only of digits.
    if (!cleanedInput || !/^\d+$/.test(cleanedInput)) {
        console.error("Error: Received invalid or non-numeric input. Please provide a positive integer.");
        return; // Terminate execution gracefully for invalid input.
    }

    // Convert the validated string input into an integer.
    const numericalLimit = parseInt(cleanedInput, 10);

    // Early exit condition for non-positive numerical limits, as factorial is undefined or irrelevant.
    if (numericalLimit <= 0) {
        console.log(0); // Output 0 as per typical problem constraints for such inputs.
        return;
    }

    // Warning for extremely large inputs: JavaScript's Number type can only precisely represent integers
    // up to 2^53 - 1. Factorials grow very quickly, leading to precision loss or Infinity.
    // For example, 171! results in Infinity.
    if (numericalLimit > 170) {
        console.warn(`Warning: Input ${numericalLimit} is exceptionally large. Factorial calculation will likely result in 'Infinity', which may lead to unexpected results in subsequent divisor computations.`);
    }


    let computedFactorialValue = 1;
    // Iteratively compute the factorial of the numericalLimit.
    for (let currentIteration = 1; currentIteration <= numericalLimit; currentIteration++) {
        computedFactorialValue *= currentIteration; // Using compound assignment for conciseness.
    }

    // Initialize an array to store all positive divisors of the computed factorial value.
    const factorialDivisorsList = [];
    // The original problem specifies checking divisors up to half the factorial value.
    // We maintain this boundary, although for very large numbers, this can still be computationally intensive.
    const divisorCheckUpperBoundary = Math.floor(computedFactorialValue / 2);

    // Populate the list with divisors of the factorial.
    for (let potentialDivisor = 1; potentialDivisor <= divisorCheckUpperBoundary; potentialDivisor++) {
        // Use a boolean flag for enhanced readability of the condition.
        const isExactDivisor = (computedFactorialValue % potentialDivisor === 0);
        if (isExactDivisor) {
            factorialDivisorsList.push(potentialDivisor);
        }
    }

    let totalSeventyFiveDivisorMatches = 0; // The final counter for the specific condition.
    const desiredDivisorCount = 75; // Extracted the "magic number" into a named constant for clarity.

    // Iterate through each divisor identified in the factorialDivisorsList.
    // Using a 'for...of' loop for direct element access and improved readability over 'for...in'.
    for (const individualFactorialDivisor of factorialDivisorsList) {
        // Calculate half of the current divisor.
        const valueAfterHalving = individualFactorialDivisor / 2;

        // Critical check: Ensure that the halved value is a positive integer before attempting to count its divisors.
        // For instance, if individualFactorialDivisor is 3, valueAfterHalving is 1.5, which is not an integer.
        if (!Number.isInteger(valueAfterHalving) || valueAfterHalving <= 0) {
            continue; // Skip to the next divisor if the halved value is not a suitable positive integer.
        }

        // Employ the optimized helper function to determine the number of divisors for the halved value.
        const numberOfDivisorsForHalvedValue = countDivisorsEfficiently(valueAfterHalving);

        // Compare the obtained divisor count against the required count.
        if (numberOfDivisorsForHalvedValue === desiredDivisorCount) {
            totalSeventyFiveDivisorMatches++; // Increment the main result counter upon a match.
        }
    }

    // Output the final tally of matches to the console.
    console.log(totalSeventyFiveDivisorMatches);
}

// An immediately invoked function expression (IIFE) serves as the program's entry point.
// This structure encapsulates the input reading logic and robust error handling.
(function initializeAndExecuteProgram() {
    let programInputData;
    try {
        // Utilize Node.js's 'fs' module to read input from the standard input stream.
        const fileSystemModule = require("fs");
        programInputData = fileSystemModule.readFileSync("/dev/stdin", "utf8");
    } catch (inputError) {
        // If an error occurs during input reading (e.g., file not found, permission issues).
        console.error("Execution Error: Failed to read input from /dev/stdin.", inputError.message);
        process.exit(1); // Terminate the process with a non-zero exit code to indicate failure.
    }

    // Invoke the main processing function with the successfully obtained input.
    analyzeInputAndCalculate(programInputData);
})();