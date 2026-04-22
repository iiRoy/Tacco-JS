"use strict";

/**
 * Core processing function for a numerical input problem.
 * This routine parses three integer parameters from a string and computes
 * a specific quantitative result based on a set of defined rules.
 *
 * @param {string} rawInputContent - The raw string data, expected to contain
 *                                   space-separated integers on the first line.
 */
const executeComputation = (rawInputContent) => {
    // Validate input: ensure it's a non-empty string before proceeding.
    if (typeof rawInputContent !== 'string' || rawInputContent.length === 0) {
        console.error("Input error: Provided content is empty or not a string.");
        return; // Halt execution for invalid input.
    }

    // Sanitize the input string: remove outer whitespace and split into lines.
    // Using a regex for splitting to handle different line ending types.
    const contentLines = rawInputContent.trim().split(/[\n\r]+/);

    // Further validation: check if any lines of data were successfully parsed.
    if (contentLines.length === 0 || contentLines[0].length === 0) {
        console.error("Input error: No valid data lines found after trimming.");
        return;
    }

    // Extract numerical components from the very first line of input.
    // The `map(Number)` method provides a concise way to convert string parts to numbers.
    const [
        itemQuantity, // Corresponds to N in the original problem
        rangeLowerBound, // Corresponds to A
        rangeUpperBound // Corresponds to B
    ] = contentLines[0].split(/\s+/).map(Number);

    // Check for successful number parsing. `isNaN` confirms if conversion failed.
    if (isNaN(itemQuantity) || isNaN(rangeLowerBound) || isNaN(rangeUpperBound)) {
        console.error("Parsing error: One or more numerical parameters could not be converted.");
        return;
    }

    // Define some common numeric constants for readability and potential reuse.
    const UNIT_VALUE = 1;
    const ZERO_RESULT = 0;

    // Pre-calculate common factors used in the problem's specific formulas.
    // This aids in breaking down complex expressions and can sometimes improve clarity.
    const quantityMinusOne = itemQuantity - UNIT_VALUE;
    const quantityMinusTwo = itemQuantity - (UNIT_VALUE + UNIT_VALUE); // Equivalent to itemQuantity - 2

    // Determine the extreme possible sums/values based on the problem's unique logic.
    // These formulas are specific to the problem's constraints and must be maintained.
    const maxAchievableValue = rangeLowerBound + (rangeUpperBound * quantityMinusOne);
    const minAchievableValue = rangeUpperBound + (rangeLowerBound * quantityMinusOne);

    // Calculate an initial base result. This often represents the general case.
    // The expression (maxAchievableValue - minAchievableValue + 1) simplifies to (B-A)(N-2) + 1.
    // We'll use the simplified form directly for a different structural representation.
    let preliminaryOutcome = (rangeUpperBound - rangeLowerBound) * quantityMinusTwo + UNIT_VALUE;

    let finalCalculatedResult; // Variable to hold the adjusted final answer.

    // Apply conditional logic to adjust the result based on specific scenarios.

    // Condition 1: If the lower bound is greater than the upper bound, the range is invalid.
    if (rangeLowerBound > rangeUpperBound) {
        finalCalculatedResult = ZERO_RESULT; // No possible valid configurations.
    }
    // Condition 2: Special handling for when only one item is considered.
    else if (itemQuantity === UNIT_VALUE) {
        // If N=1, the result is 1 only if A and B are identical. Otherwise, it's 0.
        // This suggests a very specific interpretation for single-item scenarios.
        finalCalculatedResult = (rangeLowerBound === rangeUpperBound) ? UNIT_VALUE : ZERO_RESULT;
    }
    // Default case: If no special conditions are met, use the preliminary calculation.
    else {
        finalCalculatedResult = preliminaryOutcome;
    }

    // Dispatch the final result to a dedicated output handler.
    displayResult(finalCalculatedResult);
};

/**
 * A utility function to output the final computed value.
 * This abstraction allows for easier modification of output methods (e.g.,
 * writing to a file, returning a value in a larger system) without altering
 * the core computation logic.
 *
 * @param {number} computedValue - The numerical result to be presented.
 */
const displayResult = (computedValue) => {
    console.log(computedValue);
};

// Main execution block: responsible for reading input and initiating the process.
// This part is wrapped in a try-catch to handle potential file system errors.
try {
    // Dynamically import the 'fs' module for file system operations.
    const fileSystemHandler = require('fs');
    // Read the entire content from standard input synchronously, encoded as UTF-8.
    const inputContent = fileSystemHandler.readFileSync('/dev/stdin', 'utf8');
    // Pass the acquired input to the primary computation function.
    executeComputation(inputContent);
} catch (executionError) {
    // Log any errors encountered during input reading or main execution.
    console.error(`An unexpected issue occurred during script execution: ${executionError.message}`);
}