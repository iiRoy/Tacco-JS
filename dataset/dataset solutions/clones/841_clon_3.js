const fileSystemModule = require('fs'); // Renamed module import for variety

// Define a constant for the upper bound of numbers to process, enhancing readability
const UPPER_BOUND_VALUE = 100001;
// Define the lowest value to consider for eligibility in the frequency map and final check
const MINIMUM_ELIGIBLE_VALUE = 2;

/**
 * Extracts and sanitizes input lines from a raw text string.
 * This function includes robust validation for empty or invalid input.
 * @param {string} sourceText The raw string content read from the input stream.
 * @returns {string[]} An array of individual lines, with leading/trailing whitespace removed from the input block.
 */
function extractAndSanitizeLines(sourceText) {
    // Implement a guard clause for invalid or empty input to prevent crashes
    if (!sourceText || typeof sourceText !== 'string' || sourceText.trim().length === 0) {
        console.error("Input stream is either empty, null, or not a string. Terminating process due to critical input error.");
        process.exit(1); // Explicit termination for critical error condition
    }
    // Trim the entire input block first, then split into lines
    return sourceText.trim().split('\n');
}

/**
 * Safely parses a string value into an integer.
 * Provides a default fallback value if the parsing operation fails.
 * @param {string} strValue The string to be converted into an integer.
 * @param {number} [defaultValue=0] The value to return if parsing results in NaN.
 * @returns {number} The parsed integer, or the defaultValue if parsing fails.
 */
const safeParseInt = (strValue, defaultValue = 0) => {
    const parsedResult = parseInt(strValue, 10); // Use radix 10 for explicit base
    // Check if the parsed result is Not-a-Number
    return isNaN(parsedResult) ? defaultValue : parsedResult;
};

// --- Main application execution flow begins here ---

// 1. Acquire raw input data from the standard input stream
const rawInputBuffer = fileSystemModule.readFileSync('/dev/stdin', 'utf8');
// Process the raw buffer into an array of usable lines
let processedInputLines = extractAndSanitizeLines(rawInputBuffer);

// 2. Extract and validate the total number of range operations from the first line
let operationsCountString = processedInputLines.shift(); // Remove the first line
let totalRangeOperations = safeParseInt(operationsCountString, -1); // Use -1 as an indicator for parsing failure

// Implement a guard clause to check for a valid operation count
if (totalRangeOperations < 0) {
    console.error("The initial line of input must be a positive integer indicating the number of subsequent operations. Exiting.");
    process.exit(1); // Terminate if operation count is invalid
}

// 3. Initialize a frequency map to store counts for numbers.
// Using a Map object instead of a plain object for potentially better performance
// and type safety with numerical keys, although both would work.
const numberOccurrencesMap = new Map();

// Populate the map with initial counts for all numbers within our defined range.
// Each number from MINIMUM_ELIGIBLE_VALUE to UPPER_BOUND_VALUE starts with a count of 1.
for (let currentNumber = MINIMUM_ELIGIBLE_VALUE; currentNumber <= UPPER_BOUND_VALUE; currentNumber++) {
    numberOccurrencesMap.set(currentNumber, 1);
}

// 4. Iterate through each specified range operation to update the frequency map
for (let operationIndex = 0; operationIndex < totalRangeOperations; operationIndex++) {
    const currentOperationLine = processedInputLines.shift(); // Get the next line defining a range

    // Guard clause: Check if we unexpectedly ran out of input lines
    if (!currentOperationLine) {
        console.warn(`Warning: Expected ${totalRangeOperations} operations, but the input stream ended prematurely after ${operationIndex} operations.`);
        break; // Exit the loop if no more lines are available
    }

    // Split the line into its two components (start and end of the range)
    const rangeComponents = currentOperationLine.split(' ');
    // Validation: Ensure the line contains exactly two numbers for a range
    if (rangeComponents.length !== 2) {
        console.warn(`Warning: Skipping malformed range definition line: "${currentOperationLine}". Expected two space-separated numbers.`);
        continue; // Skip to the next operation if the line is malformed
    }

    // Parse the start and end boundaries of the current range
    const startBoundary = safeParseInt(rangeComponents[0], 0);
    const endBoundary = safeParseInt(rangeComponents[1], 0);

    // Comprehensive validation for range boundaries
    if (startBoundary < 1 || endBoundary > UPPER_BOUND_VALUE || startBoundary > endBoundary) {
        console.warn(`Warning: Invalid range detected: [${startBoundary}, ${endBoundary}] from line "${currentOperationLine}". Skipping this range.`);
        continue; // Skip to the next operation if the range is invalid
    }

    // Increment counts for all numbers within the current valid range
    let valueToIncrement = startBoundary; // Initialize a counter for the current range
    while (valueToIncrement <= endBoundary) { // Using a while loop instead of a for loop for stylistic change
        // Ensure the number is within our pre-defined tracking scope (2 to UPPER_BOUND_VALUE)
        if (valueToIncrement >= MINIMUM_ELIGIBLE_VALUE && valueToIncrement <= UPPER_BOUND_VALUE) {
            // Retrieve the existing count, defaulting to 0 if not present (though our initialization ensures presence for 2-UPPER_BOUND_VALUE)
            const currentCount = numberOccurrencesMap.get(valueToIncrement) || 0;
            // Update the count for the current number in the map
            numberOccurrencesMap.set(valueToIncrement, currentCount + 1);
        }
        valueToIncrement++; // Move to the next number in the range
    }
}

// 5. Determine the largest number that satisfies the specific condition
let finalQualifyingNumber = 1; // Initialize the result candidate. If no number meets criteria, this will be 1.

// Define a helper predicate function for clarity and reusability of the condition
const isConditionMet = (value, count) => {
    // The condition is met if the count exists (is not undefined) and is greater than or equal to the value itself
    return count !== undefined && count >= value;
};

// Iterate through all potential candidate values within our defined range
for (let candidateValue = MINIMUM_ELIGIBLE_VALUE; candidateValue <= UPPER_BOUND_VALUE; candidateValue++) {
    // Retrieve the observed frequency for the current candidate number
    const observedFrequency = numberOccurrencesMap.get(candidateValue);
    // Check if the current candidate value meets the specified condition
    if (isConditionMet(candidateValue, observedFrequency)) {
        finalQualifyingNumber = candidateValue; // Update the result if the condition is met
    }
}

// 6. Output the final result.
// As per the original logic, the output is the determined number minus one.
console.log(finalQualifyingNumber - 1);