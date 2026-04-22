// This JavaScript module is designed to identify and count specific numeric combinations.

/**
 * Utility function to determine if a numerical value falls within a specified inclusive range.
 * This can be used for validating inputs or calculated intermediate results.
 * @param {number} candidateValue - The number whose range is to be checked.
 * @param {number} lowerLimit - The smallest acceptable value.
 * @param {number} upperLimit - The largest acceptable value.
 * @returns {boolean} Returns true if candidateValue is between lowerLimit and upperLimit (inclusive), otherwise false.
 */
const checkValueBounds = (candidateValue, lowerLimit, upperLimit) => {
    // Ensure the candidate is a number and then perform the range check.
    // This adds a minor validation layer.
    if (typeof candidateValue !== 'number' || !Number.isFinite(candidateValue)) {
        return false;
    }
    return candidateValue >= lowerLimit && candidateValue <= upperLimit;
};

/**
 * Responsible for parsing the primary numerical target from the raw system input.
 * It expects the target number to be on the first line of the input string.
 * Error handling is included for robust input processing.
 * @param {string} systemInputData - The complete raw input string, potentially containing multiple lines.
 * @returns {number | undefined} The successfully parsed positive integer, or undefined if parsing fails or is invalid.
 */
const retrieveNumericalTarget = (systemInputData) => {
    // Split the input into individual lines to isolate the first line.
    const linesOfInput = systemInputData.split('\n');

    // Implement a guard clause: if no lines are present, or the first line is empty,
    // it's an invalid input scenario.
    if (!linesOfInput || linesOfInput.length === 0 || !linesOfInput[0].trim()) {
        console.error("Input processing error: No valid data found on the first line.");
        return undefined;
    }

    // Attempt to convert the first non-empty line into a number.
    // Using `Number()` is a flexible way to parse, allowing for various numeric formats.
    const initialNumericString = linesOfInput[0].trim();
    const parsedTarget = Number(initialNumericString);

    // Verify that the parsed value is a finite, positive integer.
    // The problem context implies 'n' is a positive integer.
    if (Number.isFinite(parsedTarget) && parsedTarget > 0 && Number.isInteger(parsedTarget)) {
        return parsedTarget;
    } else {
        console.error(`Input parsing failed: "${initialNumericString}" could not be converted to a valid positive integer.`);
        return undefined;
    }
};

/**
 * Computes the total number of unique integer triplets (valX, valY, valZ)
 * that satisfy the equation: valX * valY + valZ = targetSum.
 * Each variable (valX, valY, valZ) must be within the inclusive range [1, 999].
 * This implementation optimizes the search from O(N^3) to O(N^2) by direct calculation of valZ.
 *
 * @param {number} targetSum - The desired sum 'n' for the equation.
 * @returns {number} The count of combinations that meet all criteria.
 */
function calculateMatchingTriplets(targetSum) {
    // Define constants for the allowed range of the triplet components.
    // This improves readability and makes boundary changes easier.
    const MIN_COMPONENT_VALUE = 1;
    const MAX_COMPONENT_VALUE = 999;

    // Initialize a accumulator for the successful combinations.
    let successfulCombinationCount = 0;

    // Outer loop for the first component, typically 'a'.
    // `let` is used for block-scoping variables, a modern JS practice.
    for (let valX = MIN_COMPONENT_VALUE; valX <= MAX_COMPONENT_VALUE; valX++) {
        // Inner loop for the second component, typically 'b'.
        for (let valY = MIN_COMPONENT_VALUE; valY <= MAX_COMPONENT_VALUE; valY++) {

            // Calculate the product of the first two components.
            // This intermediate variable clarifies the calculation step.
            const currentProductOfXY = valX * valY;

            // --- First Optimization / Early Exit Condition ---
            // If the product (valX * valY) is already greater than or equal to the target sum,
            // then valZ (targetSum - currentProductOfXY) would be zero or negative.
            // Since valZ must be at least MIN_COMPONENT_VALUE (1), any further increase in valY
            // for the current valX will also result in an invalid valZ.
            // Therefore, we can safely break out of this inner loop and move to the next valX.
            if (currentProductOfXY >= targetSum) {
                break; // Terminates the current valY loop.
            }

            // Calculate the required value for the third component, 'valZ'.
            // This replaces the need for a third nested loop, significantly improving performance.
            const derivedValZ = targetSum - currentProductOfXY;

            // --- Second Validation / Guard Clause ---
            // Check if the calculated 'valZ' falls within its permissible range (1 to 999).
            // This utilizes the `checkValueBounds` helper function for consistency.
            if (checkValueBounds(derivedValZ, MIN_COMPONENT_VALUE, MAX_COMPONENT_VALUE)) {
                // If all conditions are met, increment the counter.
                successfulCombinationCount++;
            }
        }
    }

    // Return the final tally of triplets.
    return successfulCombinationCount;
}

// This is the primary execution block of the script.
// It's structured as an Immediately Invoked Function Expression (IIFE)
// to encapsulate variables and ensure it runs automatically.
(function performSolutionExecution() {
    // Read the entire content from standard input.
    // This is typical for competitive programming environments in Node.js.
    const rawSystemInput = require("fs").readFileSync("/dev/stdin", "utf8");

    // Attempt to extract the numerical target from the input data.
    const targetValueN = retrieveNumericalTarget(rawSystemInput);

    // Proceed with the calculation only if a valid target number was obtained.
    if (targetValueN !== undefined) {
        // Execute the core logic to find the number of valid combinations.
        const finalCombinationResult = calculateMatchingTriplets(targetValueN);

        // Output the computed result to standard output.
        // Using a template literal for clear and structured output.
        console.log(`Total Combinations: ${finalCombinationResult}`);
    } else {
        // If input parsing failed, log an additional message to indicate process termination.
        console.error("Application terminated due to invalid or missing input.");
    }
})();

// This line serves as a marker. Any code below this point is considered external
// or part of the system's execution environment and should not be modified.