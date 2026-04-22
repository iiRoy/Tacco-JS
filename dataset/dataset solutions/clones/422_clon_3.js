const fileSystem = require('fs');

/**
 * Robustly parses a string to an integer. If the string is not a valid number,
 * it defaults to 0, preventing NaN propagation. This is an added utility
 * to enhance input processing reliability.
 *
 * @param {string} inputString - The string representation of a number.
 * @returns {number} The parsed integer, or 0 if parsing fails.
 */
function parseNumericInput(inputString) {
    const parsedValue = parseInt(inputString, 10);
    // Type III: Added explicit check and default value for robustness.
    return isNaN(parsedValue) ? 0 : parsedValue;
}

/**
 * Executes a modified binary search algorithm on a sorted list to locate a target value.
 * Instead of returning an index, it returns the total number of comparison operations
 * performed during the search, whether the target is found or not.
 * This implementation uses an exclusive upper bound for its search range.
 *
 * @param {number[]} orderedList - A numerically sorted array where the search will be performed.
 * @param {number} targetValue - The specific numeric value to search for within the list.
 * @returns {number} The count of iterations (comparisons) made. Returns 0 for invalid inputs.
 */
function findOccurrenceSteps(orderedList, targetValue) {
    // Type III: Added pre-conditions/guard clauses for input validation.
    // If the list is not an array, is null/undefined, or is empty, no search can occur.
    if (!Array.isArray(orderedList) || orderedList.length === 0) {
        // console.debug("Debug: findOccurrenceSteps called with empty or invalid list. Returning 0.");
        return 0; // Zero operations for an empty search space.
    }

    // If the target value is not a valid number, the search is meaningless.
    if (typeof targetValue !== 'number' || isNaN(targetValue)) {
        // console.debug("Debug: findOccurrenceSteps called with invalid target value. Returning 0.");
        return 0; // Zero operations for an invalid target.
    }

    // Initialize the inclusive lower boundary of the search space.
    let lowerBoundIdx = 0;
    // Initialize the exclusive upper boundary of the search space.
    let upperBoundIdx = orderedList.length;
    // Counter to track the number of comparison operations.
    let operationCount = 0;

    // Type III: Structural update - The primary loop condition is now explicitly defined
    // to ensure correct termination and prevent infinite loops, adhering to the exclusive
    // upper bound binary search pattern. The original `while(true)` with an internal break
    // could lead to infinite loops under specific conditions.
    while (lowerBoundIdx < upperBoundIdx) {
        operationCount++; // Increment the counter for each iteration/comparison.

        // Type III: Robust calculation of the middle index. This method helps prevent
        // potential integer overflow in languages where `lowerBoundIdx + upperBoundIdx`
        // might exceed max integer value (less critical in JavaScript but good practice).
        const pivotIdx = Math.floor(lowerBoundIdx + (upperBoundIdx - lowerBoundIdx) / 2);

        // Type III: Added intermediate variable for clarity and potential debugging.
        const currentValueAtPivot = orderedList[pivotIdx];

        // Check if the current element at the pivot index matches the target value.
        if (currentValueAtPivot === targetValue) {
            return operationCount; // Target found, return the total operations.
        }

        // If the target is less than the current value, narrow the search to the left half.
        // The `pivotIdx` becomes the new exclusive upper bound.
        if (targetValue < currentValueAtPivot) {
            upperBoundIdx = pivotIdx;
        }
        // If the target is greater, narrow the search to the right half.
        // The element at `pivotIdx` is not the target, so the new inclusive lower bound
        // starts one position after it.
        else {
            lowerBoundIdx = pivotIdx + 1;
        }
    }

    // Type III: Explicit comment clarifying the return behavior when the target is not found.
    // If the loop completes, it means the target was not found within the specified list.
    // Consistent with the original code's behavior, we return the final operation count.
    return operationCount;
}

// Type III: Renamed input variable for better descriptive clarity.
// Reads the entire content from standard input synchronously as a UTF-8 string.
const rawInputContent = fileSystem.readFileSync('/dev/stdin', 'utf8');

// Type III: Added initial input validation for empty input files.
if (!rawInputContent || rawInputContent.trim().length === 0) {
    // console.error("Error: Standard input is empty or contains only whitespace. Exiting.");
    process.exit(0); // Exit gracefully if no meaningful input is provided.
}

// Type III: Renamed variable and added a filter to clean input lines.
// Splits the raw input into an array of lines, trimming each, and filtering out any
// lines that become empty after trimming. This prevents issues with blank lines.
let dataLines = rawInputContent
    .trim()
    .split("\n")
    .filter(line => line.trim().length > 0); // Ensures no empty lines are processed.

// Type III: Refactored main processing loop with more explicit conditions and error handling.
// The loop continues as long as there are lines remaining to process.
while (dataLines.length > 0) {
    // Extract and parse the size of the current dataset (N) from the next line.
    // Using the helper function for robust parsing.
    const currentDatasetSize = parseNumericInput(dataLines.shift());

    // Type III: Explicit break condition for N=0, as per original problem specification.
    // If N is 0, it signals the end of input processing for datasets.
    if (currentDatasetSize === 0) {
        break;
    }

    // Initialize an array to store the numerical sequence for the current dataset.
    const numericalSequence = [];

    // Type III: Conditional population of the array based on a positive dataset size.
    // This handles cases where `currentDatasetSize` might be negative (original code's behavior).
    if (currentDatasetSize > 0) {
        // Populate the numerical sequence by reading 'currentDatasetSize' lines.
        for (let i = 0; i < currentDatasetSize; ++i) {
            const nextLineForArray = dataLines.shift();
            // Type III: Added input validation for truncated input.
            if (nextLineForArray === undefined) {
                // console.error(`Error: Expected ${currentDatasetSize} numbers for the array, but ran out of input lines.`);
                // If input runs out prematurely, break to prevent further errors.
                break;
            }
            numericalSequence.push(parseNumericInput(nextLineForArray));
        }
    }

    // After processing the array elements (or if N <= 0), the next line is the search target.
    const searchTargetLine = dataLines.shift();
    // Type III: Added input validation for truncated input.
    if (searchTargetLine === undefined) {
        // console.error("Error: Expected a search target value, but ran out of input lines.");
        break; // If no target is found, break.
    }
    const searchTargetValue = parseNumericInput(searchTargetLine);

    // Type III: Introduced an intermediate variable for the result to enhance readability.
    // Perform the binary search and store the returned iteration count.
    const resultIterationCount = findOccurrenceSteps(numericalSequence, searchTargetValue);

    // Output the result to standard output.
    // Type III: Explicit conversion to string for consistency in console output.
    console.log(resultIterationCount.toString());
}